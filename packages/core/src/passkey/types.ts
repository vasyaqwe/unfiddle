import type { passkeyCredential } from "@unfiddle/core/passkey/schema"
import type { InferSelectModel } from "drizzle-orm"

export type PasskeyCredential = InferSelectModel<typeof passkeyCredential>
