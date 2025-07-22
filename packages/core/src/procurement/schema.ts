import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { orderItem } from "@unfiddle/core/database/schema"
import { order } from "@unfiddle/core/order/schema"
import { PROCUREMENT_STATUSES } from "@unfiddle/core/procurement/constants"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const procurement = d.table(
   "procurement",
   {
      id: d.id("procurement"),
      orderId: d
         .text()
         .notNull()
         .references(() => order.id),
      creatorId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      orderItemId: d.text().references(() => orderItem.id),
      quantity: d.integer().notNull(),
      purchasePrice: d.numeric({ mode: "number" }).notNull(),
      status: d
         .text({ enum: PROCUREMENT_STATUSES })
         .notNull()
         .default("pending"),
      note: d.text().default(""),
      provider: d.text(),
      ...d.timestamps,
   },
   (table) => [
      d
         .index("procurement_order_id_created_at_idx")
         .on(table.orderId, table.createdAt),
   ],
)

export const procurementRelations = relations(procurement, ({ one }) => ({
   creator: one(user, {
      fields: [procurement.creatorId],
      references: [user.id],
   }),
   order: one(order, {
      fields: [procurement.orderId],
      references: [order.id],
   }),
   orderItem: one(orderItem, {
      fields: [procurement.orderItemId],
      references: [orderItem.id],
   }),
}))

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
   })
