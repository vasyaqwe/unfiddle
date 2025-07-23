import { attachment } from "@unfiddle/core/attachment/schema"
import type { Attachment } from "@unfiddle/core/attachment/types"
import {
   procurement,
   updateProcurementSchema,
} from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, desc, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const procurementRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         return await ctx.db.query.procurement.findMany({
            where: and(
               eq(procurement.orderId, input.orderId),
               eq(procurement.workspaceId, input.workspaceId),
            ),
            columns: {
               id: true,
               quantity: true,
               purchasePrice: true,
               status: true,
               note: true,
               provider: true,
               orderItemId: true,
            },
            with: {
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               attachments: {
                  columns: {
                     id: true,
                     url: true,
                     type: true,
                     size: true,
                     name: true,
                     width: true,
                     height: true,
                     creatorId: true,
                  },
                  orderBy: [desc(attachment.createdAt)],
               },
            },
            orderBy: [desc(procurement.createdAt)],
         })
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createInsertSchema(procurement)
            .omit({ creatorId: true })
            .extend({
               attachments: z.array(
                  createInsertSchema(attachment).omit({
                     creatorId: true,
                     subjectId: true,
                     subjectType: true,
                     workspaceId: true,
                  }),
               ),
            }),
      )
      .mutation(async ({ ctx, input }) => {
         const createdProcurement = await ctx.db
            .insert(procurement)
            .values({
               ...input,
               creatorId: ctx.user.id,
            })
            .returning()
            .get()

         let createdAttachments: Attachment[] = []

         if (input.attachments.length > 0) {
            createdAttachments = await ctx.db
               .insert(attachment)
               .values(
                  input.attachments.map((a) => ({
                     ...a,
                     subjectId: createdProcurement.id,
                     subjectType: "procurement" as const,
                     workspaceId: input.workspaceId,
                     creatorId: ctx.user.id,
                  })),
               )
               .returning()
         }

         return { ...createdProcurement, attachments: createdAttachments }
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateProcurementSchema)
      .mutation(async ({ ctx, input }) => {
         return await ctx.db
            .update(procurement)
            .set(input)
            .where(
               and(
                  eq(procurement.id, input.procurementId),
                  eq(procurement.workspaceId, input.workspaceId),
               ),
            )
            .returning()
            .get()
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            procurementId: z.string(),
            workspaceId: z.string(),
            orderId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .delete(procurement)
            .where(
               and(
                  eq(procurement.id, input.procurementId),
                  eq(procurement.workspaceId, input.workspaceId),
               ),
            )
      }),
})
