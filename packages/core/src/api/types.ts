import type { routes } from "@unfiddle/core/api"
import type { AuthClient } from "@unfiddle/core/auth"
import type { Session, User } from "@unfiddle/core/auth/types"
import type { DatabaseClient } from "@unfiddle/core/database/core"
import type { EmailClient } from "@unfiddle/core/email"
import type { ApiEnv, Env } from "@unfiddle/core/env"

type Variables = {
   db: DatabaseClient
   auth: AuthClient
   email: EmailClient
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
