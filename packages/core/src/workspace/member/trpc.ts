import { TRPCError } from "@trpc/server"
import { session } from "@unfiddle/core/auth/schema"
import { order, orderAssignee } from "@unfiddle/core/order/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { workspace, workspaceMember } from "@unfiddle/core/workspace/schema"
import { and, desc, eq, exists } from "drizzle-orm"
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
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            id: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         const found = await ctx.db.query.workspace.findFirst({
            where: eq(workspace.id, input.workspaceId),
         })
         if (found?.creatorId !== ctx.user.id || input.id === found?.creatorId)
            throw new TRPCError({ code: "FORBIDDEN" })

         const sessions = await ctx.db.query.session.findMany({
            where: eq(session.userId, input.id),
         })

         await ctx.db.batch([
            ctx.db
               .delete(workspaceMember)
               .where(
                  and(
                     eq(workspaceMember.workspaceId, input.workspaceId),
                     eq(workspaceMember.userId, input.id),
                  ),
               ),
            ctx.db
               .delete(order)
               .where(
                  and(
                     eq(order.workspaceId, input.workspaceId),
                     eq(order.creatorId, input.id),
                  ),
               ),
            ctx.db.delete(orderAssignee).where(
               and(
                  eq(orderAssignee.userId, input.id),
                  exists(
                     ctx.db
                        .select()
                        .from(order)
                        .where(
                           and(
                              eq(order.id, orderAssignee.orderId),
                              eq(order.workspaceId, input.workspaceId),
                           ),
                        ),
                  ),
               ),
            ),
            ctx.db.delete(procurement).where(
               and(
                  eq(procurement.creatorId, input.id),
                  exists(
                     ctx.db
                        .select()
                        .from(order)
                        .where(
                           and(
                              eq(order.id, procurement.orderId),
                              eq(order.workspaceId, input.workspaceId),
                           ),
                        ),
                  ),
               ),
            ),
            ...sessions.map((s) =>
               ctx.db
                  .update(session)
                  .set({
                     workspaceMemberships:
                        s.workspaceMemberships?.filter(
                           (m) => m.workspaceId !== input.workspaceId,
                        ) ?? [],
                  })
                  .where(eq(session.id, s.id)),
            ),
         ])
      }),
})
