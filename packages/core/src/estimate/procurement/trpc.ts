import {
   estimateProcurement,
   updateEstimateProcurementSchema,
} from "@unfiddle/core/database/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, desc, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const estimateProcurementRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         return await ctx.db.query.estimateProcurement.findMany({
            where: and(
               eq(estimateProcurement.estimateId, input.estimateId),
               eq(estimateProcurement.workspaceId, input.workspaceId),
            ),
            columns: {
               id: true,
               quantity: true,
               purchasePrice: true,
               note: true,
               provider: true,
               estimateItemId: true,
            },
            with: {
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               // attachments: {
               //    columns: {
               //       id: true,
               //       url: true,
               //       type: true,
               //       size: true,
               //       name: true,
               //       width: true,
               //       height: true,
               //    },
               //    orderBy: [desc(attachment.createdAt)],
               // },
            },
            orderBy: [desc(estimateProcurement.createdAt)],
         })
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createInsertSchema(estimateProcurement).omit({ creatorId: true }))
      .mutation(async ({ ctx, input }) => {
         const createdProcurement = await ctx.db
            .insert(estimateProcurement)
            .values({
               ...input,
               creatorId: ctx.user.id,
            })
            .returning()
            .get()

         return { ...createdProcurement }
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateEstimateProcurementSchema)
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(estimateProcurement)
            .set(input)
            .where(
               and(
                  eq(estimateProcurement.id, input.estimateProcurementId),
                  eq(estimateProcurement.workspaceId, input.workspaceId),
               ),
            )

         //    await ctx.db.insert(attachment).values(
         //       input.attachments.map((a) => ({
         //          ...a,
         //          subjectId: input.estimateProcurementId,
         //          subjectType: "estimateProcurement" as const,
         //          workspaceId: input.workspaceId,
         //          creatorId: ctx.user.id,
         //       })),
         //    )
         // }
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateProcurementId: z.string(),
            workspaceId: z.string(),
            // for real-time
            estimateId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .delete(estimateProcurement)
            .where(
               and(
                  eq(estimateProcurement.id, input.estimateProcurementId),
                  eq(estimateProcurement.workspaceId, input.workspaceId),
               ),
            )
      }),
})
