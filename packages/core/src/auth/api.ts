import {
   decodePKIXECDSASignature,
   decodeSEC1PublicKey,
   p256,
   verifyECDSASignature,
} from "@oslojs/crypto/ecdsa"
import {
   decodePKCS1RSAPublicKey,
   sha256ObjectIdentifier,
   verifyRSASSAPKCS1v15Signature,
} from "@oslojs/crypto/rsa"
import { sha256 } from "@oslojs/crypto/sha2"
import { decodeBase64, encodeBase64 } from "@oslojs/encoding"
import {
   ClientDataType,
   coseAlgorithmES256,
   coseAlgorithmRS256,
   createAssertionSignatureMessage,
   parseAuthenticatorData,
   parseClientDataJSON,
} from "@oslojs/webauthn"
import { handleApiError } from "@unfiddle/core/api/error"
import { apiValidator, createRouter } from "@unfiddle/core/api/utils"
import {
   createAuthSession,
   deleteSessionTokenCookie,
   invalidateAuthSession,
} from "@unfiddle/core/auth"
import { OAUTH_PROVIDERS } from "@unfiddle/core/auth/constants"
import { authMiddleware } from "@unfiddle/core/auth/middleware"
import { COOKIE_OPTIONS } from "@unfiddle/core/cookie/constants"
import { passkeyCredential } from "@unfiddle/core/passkey/schema"
import {
   createPasskeyChallenge,
   verifyPasskeyChallenge,
} from "@unfiddle/core/passkey/utils"
import { logger } from "@unfiddle/infra/logger"
import { generateCodeVerifier, generateState } from "arctic"
import { eq } from "drizzle-orm"
import { getCookie, setCookie } from "hono/cookie"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { createGoogleSession, googleClient } from "./google"

export const authRouter = createRouter()
   .post("/passkey/challenge", async (c) => {
      const ip =
         c.req.header("cf-connecting-ip") ??
         c.req.header("x-forwarded-for") ??
         "unknown"

      const limit = await c.env.RATE_LIMITER.limit({ key: ip })

      if (!limit.success)
         throw new HTTPException(429, { message: "Too many requests" })

      return c.json(encodeBase64(await createPasskeyChallenge(c)))
   })
   .post(
      "/passkey/login",
      apiValidator(
         "json",
         z.object({
            authenticatorData: z.string(),
            clientData: z.string(),
            credentialId: z.string(),
            signature: z.string(),
         }),
      ),
      async (c) => {
         const { authenticatorData, clientData, credentialId, signature } =
            c.req.valid("json")
         const decodedAuthenticatorData = decodeBase64(authenticatorData)
         const decodedClientData = decodeBase64(clientData)
         const decodedCredentialID = decodeBase64(credentialId)
         const decodedSignature = decodeBase64(signature)

         const parsedAuthenticatorData = parseAuthenticatorData(
            decodedAuthenticatorData,
         )

         const host = c.req.header("host")?.split(":")[0] ?? ""

         if (
            !parsedAuthenticatorData.verifyRelyingPartyIdHash(host) ||
            !parsedAuthenticatorData.userPresent ||
            !parsedAuthenticatorData.userVerified
         )
            throw new HTTPException(400, { message: "Invalid data" })

         const parsedClientData = parseClientDataJSON(decodedClientData)

         if (
            parsedClientData.type !== ClientDataType.Get ||
            !verifyPasskeyChallenge(parsedClientData.challenge, c) ||
            parsedClientData.origin !== c.var.env.WEB_URL ||
            (parsedClientData.crossOrigin !== null &&
               parsedClientData.crossOrigin)
         )
            throw new HTTPException(400, { message: "Invalid data" })

         const credential = await c.var.db.query.passkeyCredential.findFirst({
            where: eq(passkeyCredential.id, decodedCredentialID),
            columns: {
               id: true,
               userId: true,
               name: true,
               algorithm: true,
               publicKey: true,
            },
         })

         if (!credential)
            throw new HTTPException(400, { message: "Invalid credentials" })

         let validSignature: boolean
         if (credential.algorithm === coseAlgorithmES256) {
            const ecdsaSignature = decodePKIXECDSASignature(decodedSignature)
            const ecdsaPublicKey = decodeSEC1PublicKey(
               p256,
               credential.publicKey,
            )
            const hash = sha256(
               createAssertionSignatureMessage(
                  decodedAuthenticatorData,
                  decodedClientData,
               ),
            )
            validSignature = verifyECDSASignature(
               ecdsaPublicKey,
               hash,
               ecdsaSignature,
            )
         } else if (credential.algorithm === coseAlgorithmRS256) {
            const rsaPublicKey = decodePKCS1RSAPublicKey(credential.publicKey)
            const hash = sha256(
               createAssertionSignatureMessage(
                  decodedAuthenticatorData,
                  decodedClientData,
               ),
            )
            validSignature = verifyRSASSAPKCS1v15Signature(
               rsaPublicKey,
               sha256ObjectIdentifier,
               hash,
               decodedSignature,
            )
         } else {
            throw new HTTPException(400, { message: "Unsupported algorithm" })
         }

         if (!validSignature)
            throw new HTTPException(400, { message: "Invalid signature" })

         await createAuthSession(c, credential.userId)
         return c.json({ status: "ok" })
      },
   )
   .get(
      "/:provider",
      apiValidator("param", z.object({ provider: z.enum(OAUTH_PROVIDERS) })),
      apiValidator(
         "query",
         z.object({
            redirect: z.string().optional(),
         }),
      ),
      async (c) => {
         const provider = c.req.valid("param").provider
         const redirect = c.req.valid("query").redirect ?? c.var.env.WEB_URL

         setCookie(c, "redirect", redirect, COOKIE_OPTIONS)

         const state = generateState()

         if (provider === "google") {
            const codeVerifier = generateCodeVerifier()

            const url = googleClient(c).createAuthorizationURL(
               state,
               codeVerifier,
               ["profile", "email"],
            )

            setCookie(c, "google_oauth_state", state, COOKIE_OPTIONS)
            setCookie(
               c,
               "google_oauth_code_verifier",
               codeVerifier,
               COOKIE_OPTIONS,
            )

            return c.redirect(url.toString())
         }
      },
   )
   .get(
      "/:provider/callback",
      apiValidator("param", z.object({ provider: z.enum(OAUTH_PROVIDERS) })),
      apiValidator(
         "query",
         z.object({
            code: z.string(),
            state: z.string(),
         }),
      ),
      async (c) => {
         const redirect = getCookie(c, "redirect") ?? c.var.env.WEB_URL
         const redirectUrl = new URL(redirect).toString()

         const provider = c.req.valid("param").provider
         const query = c.req.valid("query")

         const codeVerifier =
            getCookie(c, `${provider}_oauth_code_verifier`) ?? ""
         const storedState = getCookie(c, `${provider}_oauth_state`)

         if (
            !query.code ||
            !query.state ||
            !codeVerifier ||
            !storedState ||
            storedState !== query.state
         ) {
            throw new HTTPException(401, {
               message: "Invalid state",
            })
         }

         if (provider === "google") {
            await createGoogleSession({
               c,
               code: query.code,
               codeVerifier,
            })

            return c.redirect(redirectUrl)
         }
      },
   )
   .post("/logout", authMiddleware, async (c) => {
      deleteSessionTokenCookie(c)
      await invalidateAuthSession(c, c.var.session.id)
      return c.json({ status: "ok" })
   })
   .onError((error, c) => {
      if (!OAUTH_PROVIDERS.some((provider) => c.req.path.includes(provider)))
         return handleApiError(error, c)

      const redirect = getCookie(c, "redirect")
      if (!redirect) return handleApiError(error, c)

      logger.error("auth error:", error)

      // redirect back to login page if not logged in
      const newRedirectUrl = new URL(`${redirect}/login`)

      newRedirectUrl.searchParams.append("error", "true")

      return c.redirect(newRedirectUrl.toString())
   })
