import type { AuthedHonoEnv } from "@ledgerblocks/core/api/types"
import type { Env } from "@ledgerblocks/infra/env"
import { initTRPC } from "@trpc/server"
import type { Context } from "hono"

export type TRPCContext = Omit<AuthedHonoEnv["Variables"], "env"> & {
   vars: Env
   hono: Context
}

export const t = initTRPC.context<TRPCContext>().create()
