import { createAttachmentsSchema } from "@unfiddle/core/attachment/schema"
import { estimateMessage } from "@unfiddle/core/estimate/message/schema"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"
import z from "zod"

export const createEstimateMessageSchema = createInsertSchema(estimateMessage)
   .omit({ id: true, creatorId: true, createdAt: true, updatedAt: true })
   .required({ workspaceId: true, estimateId: true, content: true })
   .extend({
      id: z.string(),
      attachments: createAttachmentsSchema,
   })

export const updateEstimateMessageSchema = createUpdateSchema(estimateMessage)
   .pick({ content: true })
   .required()
   .extend({
      estimateMessageId: z.string(),
      estimateId: z.string(),
      workspaceId: z.string(),
   })
