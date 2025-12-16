import { user } from "@unfiddle/core/auth/schema"
import { CLIENT_SEVERITIES } from "@unfiddle/core/client/constants"
import { d } from "@unfiddle/core/database"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const client = d.table(
   "client",
   {
      id: d.id("client"),
      creatorId: d
         .text()
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      name: d.text().notNull(),
      normalizedName: d.text().notNull().default(""),
      severity: d.text({ enum: CLIENT_SEVERITIES }).notNull().default("low"),
      ...d.timestamps,
   },
   (table) => [
      // For filtering by workspace
      d
         .index("client_workspace_id_created_at_idx")
         .on(table.workspaceId, table.createdAt),
      // For text search
      d
         .index("client_workspace_id_name_idx")
         .on(table.workspaceId, table.normalizedName),
      // Ensure unique client names per workspace
      d
         .uniqueIndex("client_workspace_id_name_unique_idx")
         .on(table.workspaceId, table.normalizedName),
   ],
)

export const clientRelations = relations(client, ({ one }) => ({
   creator: one(user, {
      fields: [client.creatorId],
      references: [user.id],
   }),
   workspace: one(workspace, {
      fields: [client.workspaceId],
      references: [workspace.id],
   }),
}))

export const createClientSchema = createInsertSchema(client)
   .pick({
      workspaceId: true,
      name: true,
      severity: true,
   })
   .required({ workspaceId: true })

export const updateClientSchema = createUpdateSchema(client)
   .pick({
      workspaceId: true,
      name: true,
      severity: true,
   })
   .required({ workspaceId: true })
   .extend({
      clientId: z.string(),
   })
