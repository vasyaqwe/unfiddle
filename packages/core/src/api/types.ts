import type { routes } from "@unfiddle/core/api"
import type { Session } from "@unfiddle/core/auth/types"
import type { DatabaseClient } from "@unfiddle/core/database/core"
import type { User } from "@unfiddle/core/user/types"
import type { ApiEnv, Env } from "@unfiddle/infra/env"

type Variables = {
   db: DatabaseClient
   env: Env
}

export type AuthVariables = Variables & {
   user: User
   session: Session
}

export type HonoEnv = {
   Bindings: ApiEnv
   Variables: Variables
}

export type AuthedHonoEnv = {
   Bindings: ApiEnv
   Variables: AuthVariables
}

export type ApiRoutes = typeof routes
