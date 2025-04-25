import type { HonoEnv } from "@ledgerblocks/core/api/types"
import { MIN_PASSWORD_LENGTH } from "@ledgerblocks/core/auth/constants"
import { d } from "@ledgerblocks/core/database"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { Context } from "hono"

export const authClient = (c: Context<HonoEnv>) => {
   const db = d.client(c)
   return betterAuth({
      appName: "ledgerblocks",
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
