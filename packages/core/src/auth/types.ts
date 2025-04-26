import type { authClient } from "@ledgerblocks/core/auth"
import type { session } from "@ledgerblocks/core/database/schema"
import type { InferSelectModel } from "drizzle-orm"

type DatabaseSession = InferSelectModel<typeof session>
type BetterAuthSession = ReturnType<typeof authClient>["$Infer"]["Session"]

export type Session = Omit<BetterAuthSession, "workspaceMemberships"> & {
   workspaceMemberships: DatabaseSession["workspaceMemberships"]
}

export type User = ReturnType<typeof authClient>["$Infer"]["Session"]["user"]
