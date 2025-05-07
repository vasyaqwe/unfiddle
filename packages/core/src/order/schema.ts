import { user } from "@ledgerblocks/core/auth/schema"
import { d } from "@ledgerblocks/core/database"
import {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@ledgerblocks/core/order/constants"
import { procurement } from "@ledgerblocks/core/procurement/schema"
import { workspace } from "@ledgerblocks/core/workspace/schema"
import { relations } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const orderCounter = d.table("order_counter", {
   workspaceId: d
      .text()
      .notNull()
      .primaryKey()
      .references(() => workspace.id, { onDelete: "cascade" }),
   lastId: d.integer().notNull().default(0),
})

export const order = d.table(
   "order",
   {
      id: d.id("order"),
      shortId: d.integer().notNull(),
      creatorId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      nameLower: d.text().notNull().default(""),
      name: d.text().notNull(),
      quantity: d.integer().notNull(),
      sellingPrice: d.integer().notNull(),
      severity: d.text({ enum: ORDER_SEVERITIES }).notNull().default("low"),
      note: d.text().notNull().default(""),
      status: d.text({ enum: ORDER_STATUSES }).notNull().default("pending"),
      deletedAt: d.integer({ mode: "timestamp" }),
      ...d.timestamps,
   },
   (table) => [
      d.index("order_creator_id_idx").on(table.creatorId),
      d
         .uniqueIndex("order_workspace_id_short_id_unique_idx")
         .on(table.workspaceId, table.shortId),
   ],
)

export const orderRelations = relations(order, ({ one, many }) => ({
   creator: one(user, {
      fields: [order.creatorId],
      references: [user.id],
   }),
   procurements: many(procurement),
}))

export const updateOrderSchema = createUpdateSchema(order)
   .pick({
      id: true,
      workspaceId: true,
      name: true,
      note: true,
      quantity: true,
      sellingPrice: true,
      status: true,
      severity: true,
   })
   .required({ id: true, workspaceId: true })
   .extend({ deletedAt: z.string().nullable().optional() })
