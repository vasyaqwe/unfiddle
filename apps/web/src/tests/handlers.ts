import type { AppRouter } from "@unfiddle/core/trpc/types"
import { createTRPCMsw, httpLink } from "msw-trpc"

export const trpcMsw = createTRPCMsw<AppRouter>({
   links: [httpLink({ url: "/trpc" })],
})
