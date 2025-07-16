import { TRPCError } from "@trpc/server"
import { session } from "@unfiddle/core/auth/schema"
import { createCode } from "@unfiddle/core/id"
import { order, orderAssignee } from "@unfiddle/core/order/schema"
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
import { and, desc, eq, gt, or, sql } from "drizzle-orm"
import { z } from "zod"

const tableMap = {
   order,
   orderAssignee,
   procurement,
}

export const workspaceRouter = t.router({
   member: workspaceMemberRouter,
   analytics: workspaceAnalyticsRouter,
   backup: t.procedure.query(async ({ ctx }) => {
      const date = new Date("2025-07-12T00:00:00.000Z")
      const data = await Promise.all(
         Object.entries(tableMap).map(async ([name, table]) => {
            const rows = await ctx.db
               .select()
               .from(table)
               .where(gt(table.createdAt, date))
            return { name, rows }
         }),
      )

      const filteredData = data.filter((d) => d.rows.length > 0)

      return Object.fromEntries(filteredData.map((d) => [d.name, d.rows]))
   }),
   restore: t.procedure
      .input(z.record(z.string(), z.array(z.any())))
      .mutation(async ({ ctx, input }) => {
         for (const [name, rows] of Object.entries(input)) {
            const table = tableMap[name as keyof typeof tableMap]
            if (!table) {
               throw new Error(`invalid table: ${name}`)
            }
            if (rows.length === 0) {
               continue
            }
            await ctx.db.insert(table).values(rows)
         }

         return { success: true }
      }),
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
