import type { attachment } from "@unfiddle/core/attachment/schema"
import type { InferSelectModel } from "drizzle-orm"

export type Attachment = InferSelectModel<typeof attachment>
