import crypto from "node:crypto"
import { sha256 } from "@oslojs/crypto/sha2"
import {
   encodeBase32LowerCaseNoPadding,
   encodeHexLowerCase,
} from "@oslojs/encoding"
import type { AuthedHonoEnv, HonoEnv } from "@unfiddle/core/api/types"
import { COOKIE_OPTIONS } from "@unfiddle/core/cookie/constants"
import { session } from "@unfiddle/core/database/schema"
import { eq } from "drizzle-orm"
import type { Context } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { SESSION_COOKIE_NAME, SESSION_EXPIRATION_SECONDS } from "./constants"

export const createAuthSession = async (
   c: Context<HonoEnv>,
   userId: string,
) => {
   const token = createSessionToken()
   const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

   await c
      .get("db")
      .insert(session)
      .values({
         id: sessionId,
         userId: userId,
         expiresAt: new Date(Date.now() + 1000 * SESSION_EXPIRATION_SECONDS),
      })

   setSessionTokenCookie(c, token)
}

export const getSessionTokenCookie = (c: Context) =>
   getCookie(c, SESSION_COOKIE_NAME)

export const setSessionTokenCookie = (c: Context, token: string) => {
   setCookie(c, SESSION_COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: SESSION_EXPIRATION_SECONDS,
   })
}

export const deleteSessionTokenCookie = (c: Context) => {
   setCookie(c, SESSION_COOKIE_NAME, "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
   })
}

export const createSessionToken = () => {
   const bytes = new Uint8Array(20)
   crypto.getRandomValues(bytes)
   const token = encodeBase32LowerCaseNoPadding(bytes)
   return token
}

export const invalidateAuthSession = async (
   c: Context<AuthedHonoEnv>,
   sessionId: string,
) => await c.var.db.delete(session).where(eq(session.id, sessionId))
