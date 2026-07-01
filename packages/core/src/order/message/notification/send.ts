import type { DatabaseClient } from "@unfiddle/core/database/core"
import { EMAIL_FROM } from "@unfiddle/core/email"
import type { EmailClient } from "@unfiddle/core/email"
import { email as emailTemplate } from "@unfiddle/core/email/email"
import type { Env } from "@unfiddle/core/env"
import { logger } from "@unfiddle/core/logger"
import { orderAssignee } from "@unfiddle/core/order/assignee/schema"
import { orderMessageNotification } from "@unfiddle/core/order/message/notification/schema"
import { orderMessageRead } from "@unfiddle/core/order/message/read/schema"
import { orderMessage } from "@unfiddle/core/order/message/schema"
import { tryCatch } from "@unfiddle/core/try-catch"
import { gt, inArray } from "drizzle-orm"

// Bound the cron scan; older unread messages won't trigger an email.
const LOOKBACK_MS = 24 * 60 * 60 * 1000
// Messages listed per email; the rest are summarized.
const MAX_LISTED = 5
// Let in-app / push win first before emailing a fresh message.
const GRACE_MS = 4 * 60 * 1000
const EPOCH = new Date(0)

const escapeHtml = (value: string) =>
   value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")

const key = (userId: string, orderId: string) => `${userId}:${orderId}`

const avatarHtml = (creator: { name: string; image: string | null }) => {
   if (creator.image)
      return `<img src="${escapeHtml(creator.image)}" width="32" height="32" alt="" referrerpolicy="no-referrer" style="display:block;width:32px;height:32px;border-radius:50%;object-fit:cover;" />`
   const initial = escapeHtml(creator.name.charAt(0).toUpperCase())
   return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td align="center" valign="middle" width="32" height="32" style="width:32px;height:32px;border-radius:50%;background:#f45b68;color:rgba(255,255,255,0.85);font-weight:500;font-size:15px;line-height:32px;">${initial}</td></tr></table>`
}

/**
 * Emails order assignees a digest of unread messages. Viewing a chat advances
 * `lastReadAt` (via markAsRead), so present users are skipped; `lastNotifiedAt`
 * debounces so a burst is emailed once.
 */
export async function sendUnreadOrderMessageEmails(deps: {
   db: DatabaseClient
   email: EmailClient
   env: Env
   now: Date
}) {
   const { db, email, env, now } = deps
   const since = new Date(now.getTime() - LOOKBACK_MS)

   const recentMessages = await db.query.orderMessage.findMany({
      where: gt(orderMessage.createdAt, since),
      columns: {
         id: true,
         orderId: true,
         workspaceId: true,
         creatorId: true,
         content: true,
         createdAt: true,
      },
      with: {
         creator: { columns: { id: true, name: true, image: true } },
         order: { columns: { id: true, shortId: true, name: true } },
      },
   })
   if (recentMessages.length === 0) return { sent: 0 }

   const orderIds = [...new Set(recentMessages.map((m) => m.orderId))]

   const [assignees, reads, notifications] = await Promise.all([
      db.query.orderAssignee.findMany({
         where: inArray(orderAssignee.orderId, orderIds),
         with: {
            user: { columns: { id: true, name: true, email: true } },
         },
      }),
      db.query.orderMessageRead.findMany({
         where: inArray(orderMessageRead.orderId, orderIds),
      }),
      db.query.orderMessageNotification.findMany({
         where: inArray(orderMessageNotification.orderId, orderIds),
      }),
   ])

   const messagesByOrder = new Map<string, typeof recentMessages>()
   for (const message of recentMessages) {
      const list = messagesByOrder.get(message.orderId) ?? []
      list.push(message)
      messagesByOrder.set(message.orderId, list)
   }

   const readAt = new Map<string, Date>()
   for (const r of reads) readAt.set(key(r.userId, r.orderId), r.lastReadAt)

   const notifiedAt = new Map<string, Date>()
   for (const n of notifications)
      notifiedAt.set(key(n.userId, n.orderId), n.lastNotifiedAt)

   let sent = 0

   const graceCutoff = now.getTime() - GRACE_MS

   for (const assignee of assignees) {
      const orderMessages = messagesByOrder.get(assignee.orderId)
      if (!orderMessages || orderMessages.length === 0) continue

      const k = key(assignee.userId, assignee.orderId)
      const lastRead = readAt.get(k) ?? EPOCH
      const lastNotified = notifiedAt.get(k) ?? EPOCH
      const threshold =
         lastRead.getTime() > lastNotified.getTime() ? lastRead : lastNotified

      const unread = orderMessages
         .filter(
            (m) =>
               m.creatorId !== assignee.userId &&
               m.createdAt.getTime() > threshold.getTime() &&
               m.createdAt.getTime() < graceCutoff,
         )
         .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

      if (unread.length === 0) continue

      const first = unread[0]
      const latest = unread[unread.length - 1]
      if (!first || !latest) continue
      const { order } = first
      // Mark up to the newest emailed message, not `now`, so grace-window
      // messages stay eligible next run.
      const notifiedThrough = latest.createdAt

      const url = `${env.WEB_URL}/${assignee.workspaceId}/order/${order.id}/chat`
      const listed = unread.slice(0, MAX_LISTED)
      const remaining = unread.length - listed.length

      const rows = listed
         .map((m) => {
            const body =
               m.content.trim().length === 0
                  ? "Надіслав(-ла) файли"
                  : escapeHtml(m.content)
            return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px;border-collapse:collapse;">
               <tr>
                  <td width="32" valign="top" style="padding-right:10px;">${avatarHtml(m.creator)}</td>
                  <td valign="top" style="font-size:14px;line-height:1.4;">
                     <strong>${escapeHtml(m.creator.name)}</strong><br>${body}
                  </td>
               </tr>
            </table>`
         })
         .join("")

      const content = `
         <p style="font-size:16px;font-weight:600;margin:0 0 16px;">
            ${unread.length} ${unread.length === 1 ? "нове повідомлення" : "нових повідомлень"} у замовленні #${order.shortId} · ${escapeHtml(order.name)}
         </p>
         ${rows}
         ${remaining > 0 ? `<p style="margin:0 0 16px;color:#666;">…та ще ${remaining}</p>` : ""}
         <a href="${url}" style="display:inline-block;padding:10px 16px;background:#141414;color:#fff;border-radius:8px;text-decoration:none;">Переглянути чат</a>
      `

      const result = await tryCatch(
         email.emails.send({
            from: EMAIL_FROM,
            to: assignee.user.email,
            subject: `Нові повідомлення у замовленні #${order.shortId}`,
            html: emailTemplate({
               title: "Нові повідомлення",
               preheader: `${unread.length} нових повідомлень у замовленні #${order.shortId}`,
               content,
            }),
         }),
      )
      if (result.error || result.data.error) {
         logger.error(result.error ?? result.data.error)
         continue
      }

      // Advance the marker only after a successful send, so failures retry.
      await db
         .insert(orderMessageNotification)
         .values({
            userId: assignee.userId,
            orderId: assignee.orderId,
            workspaceId: assignee.workspaceId,
            lastNotifiedAt: notifiedThrough,
         })
         .onConflictDoUpdate({
            target: [
               orderMessageNotification.userId,
               orderMessageNotification.orderId,
            ],
            set: { lastNotifiedAt: notifiedThrough, updatedAt: now },
         })

      sent++
   }

   return { sent }
}
