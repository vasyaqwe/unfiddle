import { orderRouter } from "@ledgerblocks/core/order/trpc"
import { t } from "@ledgerblocks/core/trpc/context"
import { userRouter } from "@ledgerblocks/core/user/trpc"
import { workspaceRouter } from "@ledgerblocks/core/workspace/trpc"

export const appRouter = t.router({
   user: userRouter,
   // subscription: billingRouter,
   workspace: workspaceRouter,
   order: orderRouter,
})

export type AppRouter = typeof appRouter
