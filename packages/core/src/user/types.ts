import type { user } from "@unfiddle/core/user/schema"
import type { InferSelectModel } from "drizzle-orm"

export type User = InferSelectModel<typeof user>
