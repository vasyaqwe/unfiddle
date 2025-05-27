import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { createCode } from "@unfiddle/core/id"
import { WORKSPACE_ROLES } from "@unfiddle/core/workspace/constants"
import { relations } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"

const userId = d
   .text()
   .references(() => user.id, { onDelete: "cascade" })
   .notNull()

export const workspace = d.table(
   "workspace",
   {
      id: d.id("workspace"),
      name: d.text().notNull(),
      image: d.text(),
      inviteCode: d.text().notNull().$defaultFn(createCode),
      creatorId: userId,
      ...d.timestamps,
   },
   (table) => [d.index("workspace_invite_code_index").on(table.inviteCode)],
)

export const workspaceRelations = relations(workspace, ({ many }) => ({
   members: many(workspaceMember),
}))

export const workspaceMember = d.table(
   "workspace_member",
   {
      userId,
      role: d.text({ enum: WORKSPACE_ROLES }).notNull(),
      workspaceId: d
         .text()
         .references(() => workspace.id, { onDelete: "cascade" })
         .notNull(),
      ...d.timestamps,
   },
   (table) => [d.primaryKey({ columns: [table.userId, table.workspaceId] })],
)

export const workspaceMemberRelations = relations(
   workspaceMember,
   ({ one }) => ({
      user: one(user, {
         fields: [workspaceMember.userId],
         references: [user.id],
      }),
      workspace: one(workspace, {
         fields: [workspaceMember.workspaceId],
         references: [workspace.id],
      }),
   }),
)

export const updateWorkspaceSchema = createUpdateSchema(workspace)
   .pick({
      id: true,
      name: true,
      image: true,
   })
   .required({ id: true })
