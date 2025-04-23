import { ECDSAPublicKey, p256 } from "@oslojs/crypto/ecdsa"
import { RSAPublicKey } from "@oslojs/crypto/rsa"
import {
   decodeBase64,
   decodeBase64urlIgnorePadding,
   encodeBase64,
} from "@oslojs/encoding"
import {
   AttestationStatementFormat,
   ClientDataType,
   coseAlgorithmES256,
   coseAlgorithmRS256,
   coseEllipticCurveP256,
   parseAttestationObject,
   parseClientDataJSON,
} from "@oslojs/webauthn"
import { TRPCError } from "@trpc/server"
import { passkeyCredential } from "@unfiddle/core/passkey/schema"
import type { PasskeyCredential } from "@unfiddle/core/passkey/types"
import { createPasskeyChallenge } from "@unfiddle/core/passkey/utils"
import { verifyPasskeyChallenge } from "@unfiddle/core/passkey/utils"
import { t } from "@unfiddle/core/trpc/context"
import { and, desc, eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { z } from "zod"

export const passkeyRouter = t.router({
   list: t.procedure.query(async ({ ctx }) => {
      return await ctx.db.query.passkeyCredential.findMany({
         where: eq(passkeyCredential.userId, ctx.user.id),
         columns: {
            id: true,
            name: true,
         },
         orderBy: (data) => desc(data.createdAt),
      })
   }),
   create: t.procedure
      .input(
         z.object({
            name: z.string(),
            attestation: z.string(),
            clientData: z.string(),
         }),
      )
      .mutation(async ({ ctx, input: { name, attestation, clientData } }) => {
         const decodedAttestation = decodeBase64(attestation)
         const decodedClientData = decodeBase64(clientData)

         const attestationObject = parseAttestationObject(decodedAttestation)
         const attestationStatement = attestationObject.attestationStatement
         const authenticatorData = attestationObject.authenticatorData

         const host = ctx.hono.req.header("Host")?.split(":")[0] ?? ""

         if (
            attestationStatement.format !== AttestationStatementFormat.None ||
            !authenticatorData.verifyRelyingPartyIdHash(host) ||
            !authenticatorData.userPresent ||
            !authenticatorData.userVerified ||
            authenticatorData.credential === null
         )
            throw new HTTPException(400, { message: "Invalid data" })

         const parsedClientData = parseClientDataJSON(decodedClientData)

         if (
            parsedClientData.type !== ClientDataType.Create ||
            !verifyPasskeyChallenge(parsedClientData.challenge, ctx.hono) ||
            parsedClientData.origin !== ctx.vars.WEB_URL ||
            (parsedClientData.crossOrigin !== null &&
               parsedClientData.crossOrigin)
         )
            throw new HTTPException(400, { message: "Invalid data" })

         let credential: Omit<PasskeyCredential, "createdAt" | "updatedAt">
         if (
            authenticatorData.credential.publicKey.algorithm() ===
            coseAlgorithmES256
         ) {
            const cosePublicKey = authenticatorData.credential.publicKey.ec2()

            if (cosePublicKey.curve !== coseEllipticCurveP256)
               throw new HTTPException(400, {
                  message: "Unsupported algorithm",
               })

            const encodedPublicKey = new ECDSAPublicKey(
               p256,
               cosePublicKey.x,
               cosePublicKey.y,
            ).encodeSEC1Uncompressed()

            credential = {
               id: authenticatorData.credential.id,
               userId: ctx.user.id,
               algorithm: coseAlgorithmES256,
               name,
               publicKey: encodedPublicKey,
            }
         } else if (
            authenticatorData.credential.publicKey.algorithm() ===
            coseAlgorithmRS256
         ) {
            const cosePublicKey = authenticatorData.credential.publicKey.rsa()

            const encodedPublicKey = new RSAPublicKey(
               cosePublicKey.n,
               cosePublicKey.e,
            ).encodePKCS1()

            credential = {
               id: authenticatorData.credential.id,
               userId: ctx.user.id,
               algorithm: coseAlgorithmRS256,
               name,
               publicKey: encodedPublicKey,
            }
         } else {
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Unsupported algorithm",
            })
         }

         await ctx.db.insert(passkeyCredential).values(credential)
      }),
   createChallenge: t.procedure.mutation(async ({ ctx }) => {
      const limit = await ctx.vars.RATE_LIMITER.limit({ key: ctx.user.id })
      if (!limit.success)
         throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again in a minute.",
         })

      const credentials = await ctx.db.query.passkeyCredential.findMany({
         where: eq(passkeyCredential.userId, ctx.user.id),
         columns: {
            id: true,
         },
      })

      const credentialUserId = new TextEncoder().encode(ctx.user.id).slice(0, 8)
      const encodedCredentialUserId = encodeBase64(credentialUserId)

      return {
         challenge: encodeBase64(await createPasskeyChallenge(ctx.hono)),
         credentialIds: credentials.map((c) => encodeBase64(c.id)).join(","),
         credentialUserId: encodedCredentialUserId,
      }
   }),
   delete: t.procedure
      .input(z.object({ id: z.any() }))
      .mutation(async ({ ctx, input }) => {
         const decodedId = decodeBase64urlIgnorePadding(input.id)

         await ctx.db
            .delete(passkeyCredential)
            .where(
               and(
                  eq(passkeyCredential.userId, ctx.user.id),
                  eq(passkeyCredential.id, decodedId),
               ),
            )
      }),
})
