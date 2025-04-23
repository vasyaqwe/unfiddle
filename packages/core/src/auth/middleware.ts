import { sha256 } from "@oslojs/crypto/sha2"
import { encodeHexLowerCase } from "@oslojs/encoding"
import type { AuthedHonoEnv, HonoEnv } from "@unfiddle/core/api/types"
import { session } from "@unfiddle/core/database/schema"
import { user } from "@unfiddle/core/user/schema"
import { eq } from "drizzle-orm"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import {
   deleteSessionTokenCookie,
   getSessionTokenCookie,
   setSessionTokenCookie,
} from "./"
import { SESSION_EXPIRATION_SECONDS } from "./constants"

const validateSessionToken = async (c: Context<HonoEnv>, token: string) => {
   const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

   const [found] = await c.var.db
      .select({ foundUser: user, foundSession: session })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(eq(session.id, sessionId))

   if (!found) return { session: null, user: null }

   const { foundUser, foundSession } = found

   if (Date.now() >= foundSession.expiresAt.getTime()) {
      await c.var.db.delete(session).where(eq(session.id, foundSession.id))
      return { session: null, user: null }
   }

   // If less than 15 days remaining, extend the expiry
   if (
      Date.now() >=
      foundSession.expiresAt.getTime() - 1000 * 15 * 24 * 60 * 60
   ) {
      foundSession.expiresAt = new Date(
         Date.now() + 1000 * SESSION_EXPIRATION_SECONDS,
      )
      await c.var.db
         .update(session)
         .set({
            expiresAt: foundSession.expiresAt,
         })
         .where(eq(session.id, foundSession.id))
      setSessionTokenCookie(c, token)
   }

   return { session: foundSession, user: foundUser }
}

export const authMiddleware = createMiddleware<AuthedHonoEnv>(
   async (c, next) => {
      const sessionToken = getSessionTokenCookie(c)
      if (!sessionToken) {
         throw new HTTPException(401, {
            message: "Unauthorized",
         })
      }

      const { session, user } = await validateSessionToken(
         c as never,
         sessionToken,
      )
      if (!session || !user) {
         deleteSessionTokenCookie(c)
         throw new HTTPException(401, {
            message: "Unauthorized",
         })
      }

      c.set("user", user)
      c.set("session", session)

      await next()
   },
)
