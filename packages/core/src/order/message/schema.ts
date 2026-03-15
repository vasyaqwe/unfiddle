import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { order } from "@unfiddle/core/order/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import {
   createInsertSchema,
   createSelectSchema,
   createUpdateSchema,
} from "drizzle-zod"
import { z } from "zod"

export const orderMessage = d.table(
   "order_message",
   {
      id: d.id("order_message"),
      orderId: d
         .text()
         .notNull()
         .references(() => order.id, { onDelete: "cascade" }),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      creatorId: d
         .text()
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      replyToId: d.text().references((): AnySQLiteColumn => orderMessage.id, {
         onDelete: "cascade",
      }),
      content: d.text().notNull(),
      ...d.timestamps,
   },
   (table) => [
      d
         .index("order_message_order_id_created_at_idx")
         .on(table.orderId, table.createdAt),
      d
         .index("order_message_workspace_id_created_at_idx")
         .on(table.workspaceId, table.createdAt),
   ],
)

export const orderMessageRelations = relations(orderMessage, ({ one }) => ({
   order: one(order, {
      fields: [orderMessage.orderId],
      references: [order.id],
   }),
   creator: one(user, {
      fields: [orderMessage.creatorId],
      references: [user.id],
   }),
   workspace: one(workspace, {
      fields: [orderMessage.workspaceId],
      references: [workspace.id],
   }),
   reply: one(orderMessage, {
      fields: [orderMessage.replyToId],
      references: [orderMessage.id],
   }),
}))

export const orderMessageSchema = createSelectSchema(orderMessage, {
   createdAt: z.coerce.date(),
   updatedAt: z.coerce.date(),
}).extend({
   creator: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
   }),
   reply: z
      .object({
         id: z.string(),
         content: z.string(),
         creatorId: z.string(),
         creator: z.object({
            id: z.string(),
            name: z.string(),
            image: z.string().nullable(),
         }),
      })
      .nullable()
      .optional(),
})

export const createOrderMessageSchema = createInsertSchema(orderMessage)
   .omit({ id: true, creatorId: true, createdAt: true, updatedAt: true })
   .required({ workspaceId: true, orderId: true, content: true })
   .extend({
      id: z.string(),
   })

export const updateOrderMessageSchema = createUpdateSchema(orderMessage)
   .pick({ content: true })
   .required()
   .extend({
      orderMessageId: z.string(),
      orderId: z.string(),
      workspaceId: z.string(),
   })
