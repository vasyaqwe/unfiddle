import type { HonoEnv } from "@unfiddle/core/api/types"
import { d } from "@unfiddle/core/database"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { Context } from "hono"

export const authClient = (c: Context<HonoEnv>) => {
   const db = d.client(c)
   return betterAuth({
      baseURL: c.var.env.API_URL,
      database: drizzleAdapter(db, { provider: "sqlite" }),
      emailAndPassword: {
         enabled: true,
      },
      advanced: {
         crossSubDomainCookies: {
            enabled: true,
         },
      },
   })
}
