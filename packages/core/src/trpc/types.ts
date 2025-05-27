import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { appRouter } from "@unfiddle/core/trpc"

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export type AppRouter = typeof appRouter
