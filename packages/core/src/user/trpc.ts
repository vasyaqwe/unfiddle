import { TRPCError } from "@trpc/server"
import { user, workspaceMember } from "@unfiddle/core/database/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, eq } from "drizzle-orm"
import z from "zod"

export const userRouter = t.router({
   me: t.procedure.query(({ ctx }) => {
      return ctx.user
   }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            userId: z.string(),
            name: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         if (ctx.membership.role !== "owner")
            throw new TRPCError({ code: "FORBIDDEN" })

         const member = await ctx.db.query.workspaceMember.findFirst({
            where: and(
               eq(workspaceMember.userId, ctx.user.id),
               eq(workspaceMember.workspaceId, input.workspaceId),
            ),
         })
         if (!member) throw new TRPCError({ code: "FORBIDDEN" })

         await ctx.db.update(user).set(input).where(eq(user.id, input.userId))
      }),
})
