import { d } from "@ledgerblocks/core/database"
import { user } from "@ledgerblocks/core/database/schema"
import { order } from "@ledgerblocks/core/order/schema"
import type { ProcurementStatus } from "@ledgerblocks/core/procurement/types"
import { relations } from "drizzle-orm"

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
      status: d.text().$type<ProcurementStatus>().notNull().default("pending"),
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
}))
