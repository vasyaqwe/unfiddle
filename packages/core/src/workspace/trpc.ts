import { TRPCError } from "@trpc/server"
import { session } from "@unfiddle/core/auth/schema"
import { client } from "@unfiddle/core/client/schema"
import { workspaceMember } from "@unfiddle/core/database/schema"
import { createCode, createId } from "@unfiddle/core/id"
import { order } from "@unfiddle/core/order/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceAnalyticsRouter } from "@unfiddle/core/workspace/analytics/trpc"
import { workspaceMemberRouter } from "@unfiddle/core/workspace/member/trpc"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import {
   updateWorkspaceSchema,
   workspace,
} from "@unfiddle/core/workspace/schema"
import { and, desc, eq, or, sql } from "drizzle-orm"
import { z } from "zod"

// const tableMap = {
//    order,
//    orderAssignee,
//    procurement,
// }

export const workspaceRouter = t.router({
   member: workspaceMemberRouter,
   analytics: workspaceAnalyticsRouter,
   search: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), query: z.string() }))
      .query(async ({ ctx, input }) => {
         const searchTerms = input.query
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))

         const matchingIssues = await ctx.db
            .select({
               id: order.id,
               name: order.name,
               status: order.status,
               createdAt: order.createdAt,
            })
            .from(order)
            .where(
               and(
                  eq(order.workspaceId, input.id),
                  or(
                     ...searchTerms.map(
                        (term) =>
                           sql`(
               LOWER(${order.name}) LIKE '%' || LOWER(${term}) || '%'
               OR
               LOWER(${order.shortId}) LIKE '%' || LOWER(${term}) || '%'
            )`,
                     ),
                  ),
               ),
            )
            .orderBy(desc(order.createdAt))

         return matchingIssues.map((result) => {
            let highlightedTitle = result.name
            for (const term of searchTerms) {
               const regex = new RegExp(`(${term})`, "gi")
               highlightedTitle = highlightedTitle.replace(
                  regex,
                  '<span class="bg-highlight-background text-highlight-foreground font-semibold">$1</span>',
               )
            }

            return {
               ...result,
               highlightedTitle,
            }
         })
      }),
   one: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
         const found =
            (await ctx.db.query.workspace.findFirst({
               where: and(eq(workspace.id, input.id)),
            })) ?? null

         if (!found?.id) return null

         return { ...found, role: ctx.membership.role }
      }),
   memberships: t.procedure.query(async ({ ctx }) => {
      return await ctx.db.query.workspaceMember.findMany({
         where: eq(workspaceMember.userId, ctx.user.id),
         with: { workspace: { columns: { id: true, name: true } } },
      })
   }),
   create: t.procedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
         const workspaceId = createId("workspace")

         await ctx.db.batch([
            ctx.db.insert(workspace).values({
               id: workspaceId,
               name: input.name,
               creatorId: ctx.user.id,
            }),
            ctx.db.insert(workspaceMember).values({
               workspaceId,
               userId: ctx.user.id,
               role: "owner",
            }),
            ctx.db
               .update(session)
               .set({
                  workspaceMemberships: [
                     ...ctx.session.workspaceMemberships,
                     {
                        workspaceId,
                        role: "owner",
                        deletedAt: null,
                     },
                  ],
               })
               .where(eq(session.userId, ctx.user.id)),
         ])

         return workspaceId
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateWorkspaceSchema)
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(workspace)
            .set({
               name: input.name,
               image: input.image,
            })
            .where(eq(workspace.id, input.id))
      }),
   delete: t.procedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.batch([
            ctx.db
               .delete(workspace)
               .where(
                  and(
                     eq(workspace.id, input.id),
                     eq(workspace.creatorId, ctx.user.id),
                  ),
               ),
            ctx.db
               .update(session)
               .set({
                  workspaceMemberships: ctx.session.workspaceMemberships.filter(
                     (membership) => membership.workspaceId !== input.id,
                  ),
               })
               .where(eq(session.userId, ctx.user.id)),
         ])
      }),
   createCode: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(workspace)
            .set({ inviteCode: createCode() })
            .where(eq(workspace.id, input.id))
      }),
   join: t.procedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
         const foundWorkspace = await ctx.db.query.workspace.findFirst({
            where: eq(workspace.inviteCode, input.code),
            columns: {
               id: true,
            },
         })

         if (!foundWorkspace)
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Workspace not found",
            })

         await ctx.db.batch([
            ctx.db
               .insert(workspaceMember)
               .values({
                  userId: ctx.user.id,
                  workspaceId: foundWorkspace.id,
                  role: "manager",
               })
               .onConflictDoUpdate({
                  set: {
                     deletedAt: null,
                  },
                  target: [workspaceMember.userId, workspaceMember.workspaceId],
               }),
            ctx.db
               .update(session)
               .set({
                  workspaceMemberships: [
                     ...ctx.session.workspaceMemberships.filter(
                        (m) => m.workspaceId !== foundWorkspace.id,
                     ),
                     {
                        workspaceId: foundWorkspace.id,
                        role: "manager",
                        deletedAt: null,
                     },
                  ],
               })
               .where(eq(session.userId, ctx.user.id)),
            ctx.db
               .update(workspace)
               .set({ inviteCode: createCode() })
               .where(eq(workspace.id, foundWorkspace.id)),
         ])

         return foundWorkspace
      }),
   migrateClients: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         // Get all distinct client names from orders for this workspace
         const distinctClients = await ctx.db
            .selectDistinct({
               client: order.client,
               creatorId: order.creatorId,
            })
            .from(order)
            .where(
               and(
                  eq(order.workspaceId, input.workspaceId),
                  sql`${order.client} IS NOT NULL AND ${order.client} != ''`,
               ),
            )

         if (distinctClients.length === 0) {
            return { created: 0, updated: 0 }
         }

         let created = 0
         let _updated = 0

         // For each distinct client name, create a client record if it doesn't exist
         for (const { client: clientName, creatorId } of distinctClients) {
            if (!clientName) continue

            const normalizedName = clientName
               .normalize("NFC")
               .toLocaleLowerCase("uk")

            // Check if client already exists
            const existingClient = await ctx.db.query.client.findFirst({
               where: and(
                  eq(client.workspaceId, input.workspaceId),
                  eq(client.normalizedName, normalizedName),
               ),
            })

            if (!existingClient) {
               // Create new client
               const clientId = createId("client")
               await ctx.db.insert(client).values({
                  id: clientId,
                  workspaceId: input.workspaceId,
                  creatorId: creatorId,
                  name: clientName,
                  normalizedName,
                  severity: "low",
               })
               created++

               // Update all orders with this client name to link to the new client
               await ctx.db
                  .update(order)
                  .set({ clientId })
                  .where(
                     and(
                        eq(order.workspaceId, input.workspaceId),
                        eq(order.client, clientName),
                     ),
                  )
            } else {
               // Link existing orders to this client if not already linked
               const _result = await ctx.db
                  .update(order)
                  .set({ clientId: existingClient.id })
                  .where(
                     and(
                        eq(order.workspaceId, input.workspaceId),
                        eq(order.client, clientName),
                        sql`${order.clientId} IS NULL`,
                     ),
                  )
            }
            _updated++
         }

         return { created, updated: distinctClients.length }
      }),
})
