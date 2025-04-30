import type { appRouter } from "@ledgerblocks/core/trpc"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export type AppRouter = typeof appRouter
