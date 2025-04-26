import type { HonoEnv } from "@ledgerblocks/core/api/types"
import { MIN_PASSWORD_LENGTH } from "@ledgerblocks/core/auth/constants"
import { session } from "@ledgerblocks/core/auth/schema"
import { d } from "@ledgerblocks/core/database"
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
