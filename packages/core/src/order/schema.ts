import { user } from "@ledgerblocks/core/auth/schema"
import { d } from "@ledgerblocks/core/database"
import type { OrderStatus } from "@ledgerblocks/core/order/types"
import { procurement } from "@ledgerblocks/core/procurement/schema"
import { workspace } from "@ledgerblocks/core/workspace/schema"
import { relations } from "drizzle-orm"

export const order = d.table(
   "order",
   {
      id: d.id("order"),
      creatorId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      name: d.text().notNull(),
      quantity: d.integer().notNull(),
      sellingPrice: d.integer().notNull(),
      note: d.text().notNull().default(""),
      status: d.text().$type<OrderStatus>().notNull().default("pending"),
      ...d.timestamps,
   },
   (table) => [d.index("order_creator_id_idx").on(table.creatorId)],
)

export const orderRelations = relations(order, ({ one, many }) => ({
   creator: one(user, {
      fields: [order.creatorId],
      references: [user.id],
   }),
   procurements: many(procurement),
}))
