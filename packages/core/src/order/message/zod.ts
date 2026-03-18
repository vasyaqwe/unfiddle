import { createAttachmentsSchema } from "@unfiddle/core/attachment/schema"
import { orderMessage } from "@unfiddle/core/database/schema"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"
import z from "zod"

export const createOrderMessageSchema = createInsertSchema(orderMessage)
   .omit({ id: true, creatorId: true, createdAt: true, updatedAt: true })
   .required({ workspaceId: true, orderId: true, content: true })
   .extend({
      id: z.string(),
      attachments: createAttachmentsSchema,
   })

export const updateOrderMessageSchema = createUpdateSchema(orderMessage)
   .pick({ content: true })
   .required()
   .extend({
      orderMessageId: z.string(),
      orderId: z.string(),
      workspaceId: z.string(),
   })
