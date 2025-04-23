import crypto from "node:crypto"
import { encodeHexLowerCase } from "@oslojs/encoding"
import type { HonoEnv } from "@unfiddle/core/api/types"
import type { Context } from "hono"

export const createPasskeyChallenge = async (c: Context<HonoEnv>) => {
   const challenge = new Uint8Array(20)
   crypto.getRandomValues(challenge)
   const encoded = encodeHexLowerCase(challenge)
   await c.env.UNFIDDLE_KV.put(encoded, "1", { expirationTtl: 300 })
   return challenge
}

export const verifyPasskeyChallenge = async (
   challenge: Uint8Array,
   c: Context<HonoEnv>,
) => {
   const encoded = encodeHexLowerCase(challenge)
   const exists = await c.env.UNFIDDLE_KV.get(encoded)
   if (exists) {
      await c.env.UNFIDDLE_KV.delete(encoded)
      return true
   }
   return false
}
