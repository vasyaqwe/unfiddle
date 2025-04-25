import { t } from "@ledgerblocks/core/trpc/context"
import { tryCatch } from "@ledgerblocks/core/try-catch"
import { workspace, workspaceMember } from "@ledgerblocks/core/workspace/schema"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const workspaceRouter = t.router({
   one: t.procedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
         return (
            (await ctx.db.query.workspace.findFirst({
               where: eq(workspace.id, input.id),
            })) ?? null
         )
      }),
   memberships: t.procedure.query(async ({ ctx }) => {
      return await ctx.db.query.workspaceMember.findMany({
         where: eq(workspaceMember.userId, ctx.user.id),
         with: { workspace: { columns: { id: true } } },
      })
   }),
   byCode: t.procedure
      .input(z.object({ code: z.string() }))
      .query(async ({ ctx, input }) => {
         const [org] = await ctx.db
            .select()
            .from(workspace)
            .where(eq(workspace.inviteCode, input.code))

         return org ?? null
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

         const member = await tryCatch(
            ctx.db.insert(workspaceMember).values({
               workspaceId: createdWorkspace.id,
               userId: ctx.user.id,
               role: "admin",
            }),
         )

         if (member.error) {
            await ctx.db
               .delete(workspace)
               .where(eq(workspace.id, createdWorkspace.id))

            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Failed to create workspace membership",
            })
         }

         return createdWorkspace.id
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

         await ctx.db
            .insert(workspaceMember)
            .values({
               userId: ctx.user.id,
               workspaceId: foundWorkspace.id,
               role: "member",
            })
            .onConflictDoNothing()

         return foundWorkspace
      }),
})
