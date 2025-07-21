import { d } from "@unfiddle/core/database"
import { order } from "@unfiddle/core/order/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const orderItem = d.table(
   "order_item",
   {
      id: d.id("order_item"),
      orderId: d
         .text()
         .notNull()
         .references(() => order.id, { onDelete: "cascade" }),
      workspaceId: d.text().references(() => workspace.id),
      name: d.text().notNull(),
      quantity: d.integer().notNull(),
      desiredPrice: d.numeric({ mode: "number" }),
      ...d.timestamps,
   },
   (table) => [d.index("order_item_order_id_idx").on(table.orderId)],
)

export const orderItemRelations = relations(orderItem, ({ one }) => ({
   order: one(order, {
      fields: [orderItem.orderId],
      references: [order.id],
   }),
}))

export const updateOrderItemSchema = createUpdateSchema(orderItem)
   .pick({
      name: true,
      quantity: true,
      desiredPrice: true,
      orderId: true,
   })
   .required({ orderId: true })
   .extend({
      workspaceId: z.string(),
      orderItemId: z.string(),
   })
