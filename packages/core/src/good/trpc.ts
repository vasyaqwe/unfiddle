import { good } from "@unfiddle/core/good/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { desc, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const goodRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx, input }) => {
         return await ctx.db.query.good.findMany({
            where: eq(good.workspaceId, input.workspaceId),
            columns: {
               id: true,
               name: true,
            },
            orderBy: [desc(good.createdAt)],
         })
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createInsertSchema(good)
            .omit({ creatorId: true })
            .extend({ workspaceId: z.string() }),
      )
      .mutation(async ({ ctx, input }) => {
         return await ctx.db
            .insert(good)
            .values({
               ...input,
               creatorId: ctx.user.id,
            })
            .returning({ id: good.id })
            .get()
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.delete(good).where(eq(good.id, input.id))
      }),
})
