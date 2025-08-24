import { TRPCError } from "@trpc/server"
import {
   estimateItem,
   updateEstimateItemSchema,
} from "@unfiddle/core/estimate/item/schema"
import { t } from "@unfiddle/core/trpc/context"
import { tryCatch } from "@unfiddle/core/try-catch"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const estimateItemRouter = t.router({
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createInsertSchema(estimateItem).extend({ workspaceId: z.string() }),
      )
      .mutation(async ({ ctx, input }) => {
         return await ctx.db
            .insert(estimateItem)
            .values(input)
            .returning()
            .get()
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateEstimateItemSchema)
      .mutation(async ({ ctx, input }) => {
         const res = await ctx.db
            .update(estimateItem)
            .set(input)
            .where(
               and(
                  eq(estimateItem.id, input.estimateItemId),
                  eq(estimateItem.workspaceId, input.workspaceId),
               ),
            )
            .returning()
            .get()
         const workspaceId = res.workspaceId
         if (!workspaceId)
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "workspaceId missing from estimateItem",
            })

         return { ...res, workspaceId }
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateItemId: z.string(),
            estimateId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         const res = await tryCatch(
            ctx.db
               .delete(estimateItem)
               .where(
                  and(
                     eq(estimateItem.id, input.estimateItemId),
                     eq(estimateItem.workspaceId, input.workspaceId),
                  ),
               ),
         )
         if (res.error?.message.includes("SQLITE_CONSTRAINT"))
            throw new TRPCError({
               code: "CONFLICT",
               message: "Спершу видаліть закупівлі з цим товаром",
            })
      }),
})
