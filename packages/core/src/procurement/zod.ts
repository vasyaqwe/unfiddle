import { createAttachmentsSchema } from "@unfiddle/core/attachment/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { createUpdateSchema } from "drizzle-zod"
import z from "zod"

export const updateProcurementSchema = createUpdateSchema(procurement)
   .pick({
      note: true,
      quantity: true,
      status: true,
      purchasePrice: true,
      provider: true,
      workspaceId: true,
      orderItemId: true,
      orderId: true,
   })
   .required({ workspaceId: true, orderId: true })
   .extend({
      procurementId: z.string(),
      attachments: createAttachmentsSchema,
   })
