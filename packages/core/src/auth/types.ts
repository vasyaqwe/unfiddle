import type { authClient } from "@unfiddle/core/auth"
import type { session } from "@unfiddle/core/auth/schema"
import type { InferSelectModel } from "drizzle-orm"

type DatabaseSession = InferSelectModel<typeof session>
type BetterAuthSession = ReturnType<typeof authClient>["$Infer"]["Session"]

export type Session = Omit<BetterAuthSession, "workspaceMemberships"> & {
   workspaceMemberships: DatabaseSession["workspaceMemberships"]
}

export type User = ReturnType<typeof authClient>["$Infer"]["Session"]["user"]
