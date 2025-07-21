import { ATTACHMENT_SUBJECT_TYPES } from "@unfiddle/core/attachment/constants"
import { d } from "@unfiddle/core/database"
import { user } from "@unfiddle/core/database/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"

export const attachment = d.table(
   "attachment",
   {
      id: d.id("attachment"),
      url: d.text().notNull(),
      type: d.text().notNull(),
      size: d.integer().notNull(),
      name: d.text().notNull(),
      width: d.integer(),
      height: d.integer(),
      subjectId: d.text().notNull(),
      subjectType: d.text({ enum: ATTACHMENT_SUBJECT_TYPES }).notNull(),
      creatorId: d
         .text()
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .references(() => workspace.id, { onDelete: "cascade" })
         .notNull(),
      ...d.timestamps,
   },
   (table) => [
      d.index("attachment_subject_id_index").on(table.subjectId),
      d.index("attachment_subject_type_index").on(table.subjectType),
   ],
)

export const attachmentRelations = relations(attachment, ({ one }) => ({
   creator: one(user, {
      fields: [attachment.creatorId],
      references: [user.id],
   }),
   workspace: one(workspace, {
      fields: [attachment.workspaceId],
      references: [workspace.id],
   }),
}))
