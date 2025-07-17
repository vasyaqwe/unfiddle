import { d } from "@unfiddle/core/database"
import { user } from "@unfiddle/core/database/schema"
import { order } from "@unfiddle/core/order/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"

export const orderAssignee = d.table(
   "order_assignee",
   {
      userId: d
         .text("creator_id")
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      orderId: d
         .text()
         .references(() => order.id)
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
