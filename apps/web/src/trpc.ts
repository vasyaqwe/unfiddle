import { CACHE_SHORT } from "@/api"
import { env } from "@/env"
import * as Sentry from "@sentry/react"
import { MutationCache, QueryClient } from "@tanstack/react-query"
import {
   type TRPCClientErrorLike,
   createTRPCClient,
   httpBatchLink,
} from "@trpc/client"
import {
   createTRPCContext,
   createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query"
import type { AppRouter } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"
import superjson from "superjson"

export const { TRPCProvider, useTRPC, useTRPCClient } =
   createTRPCContext<AppRouter>()

export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         retry: (failureCount) => failureCount < 1,
         staleTime: CACHE_SHORT, // TODO: update
      },
      mutations: {
         onError: (error) =>
            toast.error("Ой-ой!", {
               description: error.message,
            }),
      },
   },
   // handle hono RPC errors
   mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
         Sentry.captureException(
            error instanceof Error ? error : new Error(JSON.stringify(error)),
            {
               extra: {
                  mutationId: mutation?.mutationId,
               },
            },
         )
      },
      onSuccess: async (res) => {
         if (!(res instanceof Response)) return
         if (res.ok) return
         return Promise.reject(await res.json())
      },
   }),
})

export const client = createTRPCClient<AppRouter>({
   links: [
      httpBatchLink({
         url: `${env.API_URL}/trpc`,
         transformer: superjson,
         fetch(url, options) {
            return fetch(url, {
               ...options,
               credentials: "include",
            })
         },
      }),
   ],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
   client,
   queryClient,
})

export type TRPCError = TRPCClientErrorLike<AppRouter>
