import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { workspace } from "@unfiddle/core/workspace/schema"

export const good = d.table(
   "good",
   {
      id: d.id("good"),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      creatorId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      name: d.text().notNull(),
      ...d.timestamps,
   },
   (table) => [d.index("good_workspace_id_idx").on(table.workspaceId)],
)
