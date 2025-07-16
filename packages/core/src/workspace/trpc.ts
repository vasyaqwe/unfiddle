import { TRPCError } from "@trpc/server"
import { session } from "@unfiddle/core/auth/schema"
import { createCode } from "@unfiddle/core/id"
import { order, orderItem } from "@unfiddle/core/order/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import { tryCatch } from "@unfiddle/core/try-catch"
import { workspaceAnalyticsRouter } from "@unfiddle/core/workspace/analytics/trpc"
import { workspaceMemberRouter } from "@unfiddle/core/workspace/member/trpc"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import {
   updateWorkspaceSchema,
   workspace,
   workspaceMember,
} from "@unfiddle/core/workspace/schema"
import { and, desc, eq, inArray, or, sql } from "drizzle-orm"
import { z } from "zod"

export const workspaceRouter = t.router({
   migrateOrdersToOrderItems: t.procedure.mutation(async ({ ctx }) => {
      const BATCH_SIZE = 10
      let totalMigrated = 0

      while (true) {
         const ordersToMigrate = await ctx.db.query.order.findMany({
            where: (order, { notExists }) =>
               notExists(
                  ctx.db
                     .select()
                     .from(orderItem)
                     .where(eq(orderItem.orderId, order.id)),
               ),
            limit: BATCH_SIZE,
         })

         if (ordersToMigrate.length === 0) {
            break
         }

         const newOrderItems = ordersToMigrate.map((o) => ({
            orderId: o.id,
            name: o.name,
            quantity: o.quantity,
            desiredPrice: o.desiredPrice,
         }))

         await ctx.db.insert(orderItem).values(newOrderItems)

         totalMigrated += ordersToMigrate.length

         if (ordersToMigrate.length < BATCH_SIZE) {
            break
         }
      }

      return { message: `Migrated ${totalMigrated} orders.` }
   }),

   migrateProcurementsToOrderItems: t.procedure.mutation(async ({ ctx }) => {
      const BATCH_SIZE = 10
      let totalMigrated = 0

      while (true) {
         const procurementsToMigrate = await ctx.db.query.procurement.findMany({
            where: (procurement, { isNull }) => isNull(procurement.orderItemId),
            limit: BATCH_SIZE,
         })

         if (procurementsToMigrate.length === 0) {
            break
         }

         const orderIds = [
            ...new Set(procurementsToMigrate.map((p) => p.orderId)),
         ]

         const correspondingItems = await ctx.db.query.orderItem.findMany({
            where: inArray(orderItem.orderId, orderIds),
            columns: { id: true, orderId: true },
         })

         const orderIdToItemIdMap = new Map(
            correspondingItems.map((item) => [item.orderId, item.id]),
         )

         for (const proc of procurementsToMigrate) {
            const itemId = orderIdToItemIdMap.get(proc.orderId)
            if (itemId) {
               await ctx.db
                  .update(procurement)
                  .set({ orderItemId: itemId })
                  .where(eq(procurement.id, proc.id))
            }
         }

         totalMigrated += procurementsToMigrate.length

         if (procurementsToMigrate.length < BATCH_SIZE) {
            break
         }
      }

      return { message: `Migrated ${totalMigrated} procurements.` }
   }),

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
         const [createdWorkspace] = await ctx.db
            .insert(workspace)
            .values({
               name: input.name,
               creatorId: ctx.user.id,
            })
            .returning({
               id: workspace.id,
            })

         if (!createdWorkspace)
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })

         const batch = await tryCatch(
            ctx.db.batch([
               ctx.db.insert(workspaceMember).values({
                  workspaceId: createdWorkspace.id,
                  userId: ctx.user.id,
                  role: "owner",
               }),
               ctx.db
                  .update(session)
                  .set({
                     workspaceMemberships: [
                        ...ctx.session.workspaceMemberships,
                        {
                           workspaceId: createdWorkspace.id,
                           role: "owner",
                        },
                     ],
                  })
                  .where(eq(session.userId, ctx.user.id)),
            ]),
         )

         if (batch.error || batch.data.some((r) => r.error)) {
            await ctx.db
               .delete(workspace)
               .where(eq(workspace.id, createdWorkspace.id))

            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Failed to create workspace",
            })
         }

         return createdWorkspace.id
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
         const _batch = await ctx.db.batch([
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

         const _batch = await ctx.db.batch([
            ctx.db
               .insert(workspaceMember)
               .values({
                  userId: ctx.user.id,
                  workspaceId: foundWorkspace.id,
                  role: "manager",
               })
               .onConflictDoNothing(),
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
})
