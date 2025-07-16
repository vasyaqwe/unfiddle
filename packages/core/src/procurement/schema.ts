import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { order, orderItem } from "@unfiddle/core/order/schema"
import { PROCUREMENT_STATUSES } from "@unfiddle/core/procurement/constants"
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
         .references(() => order.id, { onDelete: "cascade" }),
      orderItemId: d
         .text()
         .references(() => orderItem.id, { onDelete: "cascade" }),
      creatorId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      quantity: d.integer().notNull(),
      purchasePrice: d.numeric({ mode: "number" }).notNull(),
      status: d
         .text({ enum: PROCUREMENT_STATUSES })
         .notNull()
         .default("pending"),
      provider: d.text(),
      note: d.text().default(""),
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
      id: true,
      note: true,
      quantity: true,
      status: true,
      purchasePrice: true,
      provider: true,
   })
   .required({ id: true })
   .extend({ workspaceId: z.string() })
