import type { routes } from "@ledgerblocks/core/api"
import type { authClient } from "@ledgerblocks/core/auth"
import type { Session, User } from "@ledgerblocks/core/auth/types"
import type { DatabaseClient } from "@ledgerblocks/core/database/core"
import type { ApiEnv, Env } from "@ledgerblocks/infra/env"

type Variables = {
   db: DatabaseClient
   auth: ReturnType<typeof authClient>
   env: Env
}

export type HonoEnv = {
   Bindings: ApiEnv
   Variables: Variables
}

export type AuthedHonoEnv = {
   Bindings: ApiEnv
   Variables: Variables & {
      user: User
      session: Session
   }
}

export type ApiRoutes = typeof routes
