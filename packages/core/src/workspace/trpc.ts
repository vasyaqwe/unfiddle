import { order, session } from "@ledgerblocks/core/database/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { tryCatch } from "@ledgerblocks/core/try-catch"
import { workspaceMemberMiddleware } from "@ledgerblocks/core/workspace/middleware"
import { workspace, workspaceMember } from "@ledgerblocks/core/workspace/schema"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, or, sql } from "drizzle-orm"
import { z } from "zod"

export const workspaceRouter = t.router({
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

         return found
      }),
   memberships: t.procedure.query(async ({ ctx }) => {
      return await ctx.db.query.workspaceMember.findMany({
         where: eq(workspaceMember.userId, ctx.user.id),
         with: { workspace: { columns: { id: true, name: true } } },
      })
   }),
   members: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx, input }) => {
         return await ctx.db.query.workspaceMember.findMany({
            where: eq(workspaceMember.workspaceId, input.workspaceId),
            with: {
               user: {
                  columns: { id: true, name: true, email: true, image: true },
               },
            },
            columns: {
               createdAt: true,
               role: true,
            },
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
                  role: "admin",
               }),
               ctx.db
                  .update(session)
                  .set({
                     workspaceMemberships: [
                        ...ctx.session.workspaceMemberships,
                        {
                           workspaceId: createdWorkspace.id,
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
                  role: "member",
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
                     },
                  ],
               })
               .where(eq(session.userId, ctx.user.id)),
         ])

         return foundWorkspace
      }),
})
