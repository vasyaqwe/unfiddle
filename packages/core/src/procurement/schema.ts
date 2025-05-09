import { user } from "@ledgerblocks/core/auth/schema"
import { d } from "@ledgerblocks/core/database"
import { order } from "@ledgerblocks/core/order/schema"
import { PROCUREMENT_STATUSES } from "@ledgerblocks/core/procurement/constants"
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
      buyerId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      quantity: d.integer().notNull(),
      purchasePrice: d.integer().notNull(),
      status: d
         .text({ enum: PROCUREMENT_STATUSES })
         .notNull()
         .default("pending"),
      note: d.text().default(""),
      ...d.timestamps,
   },
   (table) => [d.index("procurement_buyer_id_idx").on(table.buyerId)],
)

export const procurementRelations = relations(procurement, ({ one }) => ({
   buyer: one(user, {
      fields: [procurement.buyerId],
      references: [user.id],
   }),
   order: one(order, {
      fields: [procurement.orderId],
      references: [order.id],
   }),
}))

export const updateProcurementSchema = createUpdateSchema(procurement)
   .pick({
      id: true,
      note: true,
      quantity: true,
      status: true,
      purchasePrice: true,
   })
   .required({ id: true })
   .extend({ workspaceId: z.string() })
