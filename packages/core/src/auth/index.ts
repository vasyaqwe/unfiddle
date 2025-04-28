import { randomBytes, scryptSync } from "node:crypto"
import type { HonoEnv } from "@ledgerblocks/core/api/types"
import { MIN_PASSWORD_LENGTH } from "@ledgerblocks/core/auth/constants"
import { session } from "@ledgerblocks/core/auth/schema"
import { d } from "@ledgerblocks/core/database"
import invariant from "@ledgerblocks/core/invariant"
import { workspaceMember } from "@ledgerblocks/core/workspace/schema"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createAuthMiddleware } from "better-auth/api"
import { eq } from "drizzle-orm"
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
         password: {
            hash: async (password) => {
               const salt = randomBytes(16).toString("hex")
               const hash = scryptSync(password, salt, 64).toString("hex")
               return `${salt}:${hash}`
            },
            verify: async ({ hash, password }) => {
               const [salt, key] = hash.split(":")
               invariant(salt && key, "Invalid hash")
               const keyBuffer = Buffer.from(key, "hex")
               const hashBuffer = scryptSync(password, salt, 64)
               return keyBuffer.equals(hashBuffer)
            },
         },
      },
      advanced: {
         crossSubDomainCookies: {
            enabled: true,
         },
      },
      session: {
         additionalFields: {
            workspaceMemberships: {
               // wrong type intentionally
               type: "string[]",
            },
         },
      },
      hooks: {
         after: createAuthMiddleware(async (ctx) => {
            if (
               ctx.path.startsWith("/sign-up") ||
               ctx.path.startsWith("/sign-in")
            ) {
               const newSession = ctx.context.newSession
               if (!newSession) return

               const workspaceMemberships =
                  await db.query.workspaceMember.findMany({
                     where: eq(workspaceMember.userId, newSession.user.id),
                     columns: {
                        workspaceId: true,
                     },
                  })

               await db
                  .update(session)
                  .set({
                     workspaceMemberships,
                  })
                  .where(eq(session.id, newSession.session.id))
            }
         }),
      },
   })
}
