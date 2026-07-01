import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { order } from "@unfiddle/core/order/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"

export const orderMessageNotification = d.table(
   "order_message_notification",
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
      lastNotifiedAt: d.integer({ mode: "timestamp" }).notNull(),
      ...d.timestamps,
   },
   (table) => [
      d.primaryKey({ columns: [table.userId, table.orderId] }),
      d
         .index("order_message_notification_workspace_id_idx")
         .on(table.workspaceId),
   ],
)

export const orderMessageNotificationRelations = relations(
   orderMessageNotification,
   ({ one }) => ({
      user: one(user, {
         fields: [orderMessageNotification.userId],
         references: [user.id],
      }),
      order: one(order, {
         fields: [orderMessageNotification.orderId],
         references: [order.id],
      }),
      workspace: one(workspace, {
         fields: [orderMessageNotification.workspaceId],
         references: [workspace.id],
      }),
   }),
)
