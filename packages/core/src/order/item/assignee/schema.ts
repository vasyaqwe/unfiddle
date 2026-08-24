import { d } from "@unfiddle/core/database"
import { user } from "@unfiddle/core/database/schema"
import { orderItem } from "@unfiddle/core/order/item/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"

export const orderItemAssignee = d.table(
   "order_item_assignee",
   {
      userId: d
         .text("creator_id")
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      orderItemId: d
         .text()
         .references(() => orderItem.id, { onDelete: "cascade" })
         .notNull(),
      ...d.timestamps,
   },
   (table) => [
      d.primaryKey({ columns: [table.userId, table.orderItemId] }),
      d
         .index("order_item_assignee_order_item_id_created_at_idx")
         .on(table.orderItemId, table.createdAt),
   ],
)

export const orderItemAssigneeRelations = relations(
   orderItemAssignee,
   ({ one }) => ({
      user: one(user, {
         fields: [orderItemAssignee.userId],
         references: [user.id],
      }),
      orderItem: one(orderItem, {
         fields: [orderItemAssignee.orderItemId],
         references: [orderItem.id],
      }),
   }),
)
