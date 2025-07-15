import { CACHE_AWHILE } from "@/api"
import { env } from "@/env"
import { MutationCache, QueryClient } from "@tanstack/react-query"
import {
   type TRPCClientErrorLike,
   createTRPCClient,
   httpBatchStreamLink,
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
         staleTime: CACHE_AWHILE,
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
      onSuccess: async (res) => {
         if (!(res instanceof Response)) return
         if (res.ok) return
         return Promise.reject(await res.json())
      },
   }),
})

export const client = createTRPCClient<AppRouter>({
   links: [
      httpBatchStreamLink({
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
