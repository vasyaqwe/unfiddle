import { t } from "@ledgerblocks/core/trpc/context"
import { userRouter } from "@ledgerblocks/core/user/trpc"

export const appRouter = t.router({
   user: userRouter,
   // subscription: billingRouter,
})

export type AppRouter = typeof appRouter
