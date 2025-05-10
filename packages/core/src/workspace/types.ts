import type { WORKSPACE_ROLES } from "@ledgerblocks/core/workspace/constants"
import type { workspace } from "@ledgerblocks/core/workspace/schema"
import type { InferSelectModel } from "drizzle-orm"

export type Workspace = InferSelectModel<typeof workspace>
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]
