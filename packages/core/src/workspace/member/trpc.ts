import { TRPCError } from "@trpc/server"
import { session } from "@unfiddle/core/auth/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { workspaceMember } from "@unfiddle/core/workspace/schema"
import { and, desc, eq } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const workspaceMemberRouter = t.router({
   list: t.procedure
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
            orderBy: [desc(workspaceMember.createdAt)],
         })
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createUpdateSchema(workspaceMember)
            .pick({ userId: true, role: true, workspaceId: true })
            .required(),
      )
      .mutation(async ({ ctx, input }) => {
         if (ctx.membership.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" })

         await ctx.db.batch([
            ctx.db
               .update(workspaceMember)
               .set({
                  role: input.role,
               })
               .where(
                  and(
                     eq(workspaceMember.workspaceId, input.workspaceId),
                     eq(workspaceMember.userId, input.userId),
                  ),
               ),
            ctx.db
               .update(session)
               .set({
                  workspaceMemberships: ctx.session.workspaceMemberships.map(
                     (m) => {
                        if (m.workspaceId === input.workspaceId)
                           return {
                              ...m,
                              role: input.role,
                           }

                        return m
                     },
                  ),
               })
               .where(eq(session.userId, input.userId)),
         ])
      }),
})
