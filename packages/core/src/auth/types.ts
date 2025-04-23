import type { OAUTH_PROVIDERS } from "@unfiddle/core/auth/constants"
import type { session } from "@unfiddle/core/auth/schema"
import type { InferSelectModel } from "drizzle-orm"

export type OauthProvider = (typeof OAUTH_PROVIDERS)[number]
export type Session = InferSelectModel<typeof session>
