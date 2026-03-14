import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { order } from "@unfiddle/core/order/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"

export const orderMessageRead = d.table(
   "order_message_read",
   {
      userId: d
         .text()
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      orderId: d
         .text()
         .references(() => order.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .references(() => workspace.id, { onDelete: "cascade" })
         .notNull(),
      lastReadAt: d.integer({ mode: "timestamp" }).notNull(),
      ...d.timestamps,
   },
   (table) => [
      d.primaryKey({ columns: [table.userId, table.orderId] }),
      d.index("order_message_read_workspace_id_idx").on(table.workspaceId),
      d
         .index("order_message_read_user_id_workspace_id_idx")
         .on(table.userId, table.workspaceId),
   ],
)

export const orderMessageReadRelations = relations(
   orderMessageRead,
   ({ one }) => ({
      user: one(user, {
         fields: [orderMessageRead.userId],
         references: [user.id],
      }),
      order: one(order, {
         fields: [orderMessageRead.orderId],
         references: [order.id],
      }),
      workspace: one(workspace, {
         fields: [orderMessageRead.workspaceId],
         references: [workspace.id],
      }),
   }),
)
