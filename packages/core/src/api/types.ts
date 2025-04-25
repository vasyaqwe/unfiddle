import type { routes } from "@unfiddle/core/api"
import type { authClient } from "@unfiddle/core/auth"
import type { Session, User } from "@unfiddle/core/auth/types"
import type { DatabaseClient } from "@unfiddle/core/database/core"
import type { ApiEnv, Env } from "@unfiddle/infra/env"

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
