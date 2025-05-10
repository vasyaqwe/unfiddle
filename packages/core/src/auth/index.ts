import crypto from "node:crypto"
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
               const salt = crypto.randomBytes(16).toString("hex")
               // Lower cost parameters for Workers environment
               const hash = crypto
                  .scryptSync(password, salt, 64, {
                     N: 4096,
                     r: 8,
                     p: 1,
                  })
                  .toString("hex")
               return `${salt}:${hash}`
            },
            verify: async ({ hash, password }) => {
               const [salt, key] = hash.split(":")
               invariant(salt && key, "Invalid hash")
               const keyBuffer = Buffer.from(key, "hex")
               const hashBuffer = crypto.scryptSync(password, salt, 64, {
                  N: 4096,
                  r: 8,
                  p: 1,
               })

               // Constant-time comparison
               return crypto.subtle
                  ? // @ts-expect-error ...
                    crypto.subtle.timingSafeEqual(keyBuffer, hashBuffer)
                  : keyBuffer.equals(hashBuffer)
            },
         },
      },
      advanced: {
         crossSubDomainCookies: {
            enabled: true,
         },
         defaultCookieAttributes: {
            // TODO: UPDATE THIS IS IMPORTANT
            secure: false,
            httpOnly: true,
            sameSite: "none", // Allows CORS-based cookie sharing across subdomains
            partitioned: true, // New browser standards will mandate this for foreign cookies
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
                        role: true,
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
