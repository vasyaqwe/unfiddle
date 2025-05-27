import crypto from "node:crypto"
import type { HonoEnv } from "@unfiddle/core/api/types"
import { MIN_PASSWORD_LENGTH } from "@unfiddle/core/auth/constants"
import { session } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import invariant from "@unfiddle/core/invariant"
import { workspaceMember } from "@unfiddle/core/workspace/schema"
import { EMAIL_FROM } from "@unfiddle/infra/email"
import { logger } from "@unfiddle/infra/logger"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createAuthMiddleware } from "better-auth/api"
import { eq } from "drizzle-orm"
import type { Context } from "hono"

export type AuthClient = ReturnType<typeof authClient>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const authClient: any = (c: Context<HonoEnv>) => {
   const db = d.client(c)

   return betterAuth({
      appName: "unfiddle",
      baseURL: c.var.env.API_URL,
      basePath: "/auth",
      trustedOrigins: [c.var.env.WEB_URL],
      database: drizzleAdapter(db, { provider: "sqlite" }),
      socialProviders: {
         google: {
            clientId: c.env.GOOGLE_CLIENT_ID,
            clientSecret: c.env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: (profile) => {
               return {
                  name: profile.given_name,
                  image: profile.picture,
               }
            },
         },
      },
      emailAndPassword: {
         enabled: true,
         minPasswordLength: MIN_PASSWORD_LENGTH,
         requireEmailVerification: true,
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
      emailVerification: {
         autoSignInAfterVerification: true,
         sendOnSignUp: false,
         sendVerificationEmail: async (input, req) => {
            //  because sendOnSignUp: false doesn't work
            if (req?.url.includes("/sign-up/email")) return
            logger.info(req?.url)

            const res = await c.var.email.emails.send({
               from: EMAIL_FROM,
               to: input.user.email,
               subject: "Підтвердіть ваш аккаунт",
               html: `Перейдіть за посиланням щоб підтвердити ваш аккаунт: <a style="margin-top:8px; display:inline-block;" href="${input.url}">Підтвердити</a>`,
            })
            if (res.error) {
               logger.error(res.error)
               throw new Error(res.error.message)
            }
         },
      },
      accountLinking: {
         enabled: true,
      },
      advanced: {
         defaultCookieAttributes: {
            secure: true,
            httpOnly: true,
            sameSite: "lax",
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
               ctx.path.startsWith("/sign-in") ||
               ctx.path.includes("/callback")
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
