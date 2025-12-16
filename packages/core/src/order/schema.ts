import { attachment } from "@unfiddle/core/attachment/schema"
import { user } from "@unfiddle/core/auth/schema"
import { client } from "@unfiddle/core/client/schema"
import { CURRENCIES } from "@unfiddle/core/currency/constants"
import { d } from "@unfiddle/core/database"
import { good } from "@unfiddle/core/good/schema"
import { orderAssignee } from "@unfiddle/core/order/assignee/schema"
import {
   ORDER_PAYMENT_TYPES,
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@unfiddle/core/order/constants"
import { orderItem } from "@unfiddle/core/order/item/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations, sql } from "drizzle-orm"
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
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      goodId: d.text().references(() => good.id, { onDelete: "set null" }),
      groupId: d.text(),
      normalizedName: d.text().notNull().default(""),
      name: d.text().notNull(),
      currency: d
         .text({
            enum: CURRENCIES,
         })
         .notNull()
         .default("UAH"),
      sellingPrice: d.numeric({ mode: "number" }).notNull(),
      severity: d.text({ enum: ORDER_SEVERITIES }).notNull().default("low"),
      note: d.text().notNull().default(""),
      status: d.text({ enum: ORDER_STATUSES }).notNull().default("pending"),
      vat: d.integer({ mode: "boolean" }).notNull().default(false),
      paymentType: d
         .text({
            enum: ORDER_PAYMENT_TYPES,
         })
         .notNull()
         .default("cash"),
      client: d.text(),
      clientId: d.text().references(() => client.id, { onDelete: "set null" }),
      deletedAt: d.integer({ mode: "timestamp" }),
      deliversAt: d.integer({ mode: "timestamp" }),
      analogs: d
         .text({ mode: "json" })
         .$type<string[]>()
         .notNull()
         .default(sql`'[]'`),
      ...d.timestamps,
   },
   (table) => [
      // Main for most common filter combinations
      d
         .index("order_workspace_id_deleted_at_created_at_idx")
         .on(table.workspaceId, table.deletedAt, table.createdAt),
      // For text search
      d
         .index("order_workspace_id_name_idx")
         .on(table.workspaceId, table.normalizedName),
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
   good: one(good, {
      fields: [order.goodId],
      references: [good.id],
   }),
   clientN: one(client, {
      fields: [order.clientId],
      references: [client.id],
   }),
   procurements: many(procurement),
   assignees: many(orderAssignee),
   items: many(orderItem),
   attachments: many(attachment),
}))

export const updateOrderSchema = createUpdateSchema(order)
   .pick({
      workspaceId: true,
      name: true,
      note: true,
      sellingPrice: true,
      status: true,
      severity: true,
      paymentType: true,
      client: true,
      clientId: true,
      deliversAt: true,
      currency: true,
   })
   .required({ workspaceId: true })
   .extend({
      orderId: z.string(),
      deletedAt: z.date().nullable().optional(),
      analogs: z.array(z.string()).optional(),
   })
