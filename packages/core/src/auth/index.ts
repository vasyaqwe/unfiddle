import type { HonoEnv } from "@unfiddle/core/api/types"
import { MIN_PASSWORD_LENGTH } from "@unfiddle/core/auth/constants"
import { d } from "@unfiddle/core/database"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { Context } from "hono"

export const authClient = (c: Context<HonoEnv>) => {
   const db = d.client(c)
   return betterAuth({
      appName: "Unfiddle",
      baseURL: c.var.env.API_URL,
      basePath: "/auth",
      trustedOrigins: [c.var.env.WEB_URL],
      database: drizzleAdapter(db, { provider: "sqlite" }),
      emailAndPassword: {
         enabled: true,
         minPasswordLength: MIN_PASSWORD_LENGTH,
      },
      advanced: {
         crossSubDomainCookies: {
            enabled: true,
         },
      },
   })
}
