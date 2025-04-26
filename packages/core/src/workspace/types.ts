import type { workspace } from "@ledgerblocks/core/workspace/schema"
import type { InferSelectModel } from "drizzle-orm"

export type Workspace = InferSelectModel<typeof workspace>
