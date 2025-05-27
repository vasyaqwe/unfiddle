import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@unfiddle/core/order/constants"
import { procurement } from "@unfiddle/core/procurement/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
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

const userId = d
   .text()
   .references(() => user.id, { onDelete: "cascade" })
   .notNull()

export const order = d.table(
   "order",
   {
      id: d.id("order"),
      shortId: d.integer().notNull(),
      creatorId: userId,
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      normalizedName: d.text().notNull().default(""),
      name: d.text().notNull(),
      quantity: d.integer().notNull(),
      sellingPrice: d.numeric({ mode: "number" }).notNull(),
      severity: d.text({ enum: ORDER_SEVERITIES }).notNull().default("low"),
      note: d.text().notNull().default(""),
      status: d.text({ enum: ORDER_STATUSES }).notNull().default("pending"),
      deletedAt: d.integer({ mode: "timestamp" }),
      ...d.timestamps,
   },
   (table) => [
      d.index("order_short_id_idx").on(table.shortId),
      d.index("order_name_idx").on(table.normalizedName),
      d.index("order_status_idx").on(table.status),
      d.index("order_creator_id_idx").on(table.creatorId),
      d
         .uniqueIndex("order_workspace_id_short_id_unique_idx")
         .on(table.workspaceId, table.shortId),
   ],
)

export const orderAssignee = d.table(
   "order_assignee",
   {
      userId,
      orderId: d
         .text()
         .references(() => order.id, { onDelete: "cascade" })
         .notNull(),
      ...d.timestamps,
   },
   (table) => [d.primaryKey({ columns: [table.userId, table.orderId] })],
)

export const orderAssigneeRelations = relations(orderAssignee, ({ one }) => ({
   user: one(user, {
      fields: [orderAssignee.userId],
      references: [user.id],
   }),
   order: one(order, {
      fields: [orderAssignee.orderId],
      references: [order.id],
   }),
}))

export const orderRelations = relations(order, ({ one, many }) => ({
   creator: one(user, {
      fields: [order.creatorId],
      references: [user.id],
   }),
   procurements: many(procurement),
   assignees: many(orderAssignee),
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
