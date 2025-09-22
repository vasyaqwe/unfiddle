import { initTRPC } from "@trpc/server"
import type { AuthedHonoEnv } from "@unfiddle/core/api/types"
import type { Env } from "@unfiddle/core/env"
import type { Context } from "hono"
import superjson from "superjson"

export type TRPCContext = Omit<AuthedHonoEnv["Variables"], "env"> & {
   vars: Env
   hono: Context
}

export const t = initTRPC.context<TRPCContext>().create({
   transformer: superjson,
})
