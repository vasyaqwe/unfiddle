import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { estimate } from "@unfiddle/core/estimate/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"

export const estimateMessageRead = d.table(
   "estimate_message_read",
   {
      userId: d
         .text()
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      estimateId: d
         .text()
         .references(() => estimate.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .references(() => workspace.id, { onDelete: "cascade" })
         .notNull(),
      lastReadAt: d.integer({ mode: "timestamp" }).notNull(),
      ...d.timestamps,
   },
   (table) => [
      d.primaryKey({ columns: [table.userId, table.estimateId] }),
      d.index("estimate_message_read_workspace_id_idx").on(table.workspaceId),
      d
         .index("estimate_message_read_user_id_workspace_id_idx")
         .on(table.userId, table.workspaceId),
   ],
)

export const estimateMessageReadRelations = relations(
   estimateMessageRead,
   ({ one }) => ({
      user: one(user, {
         fields: [estimateMessageRead.userId],
         references: [user.id],
      }),
      estimate: one(estimate, {
         fields: [estimateMessageRead.estimateId],
         references: [estimate.id],
      }),
      workspace: one(workspace, {
         fields: [estimateMessageRead.workspaceId],
         references: [workspace.id],
      }),
   }),
)
