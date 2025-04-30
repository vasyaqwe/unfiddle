import { orderRouter } from "@ledgerblocks/core/order/trpc"
import { procurementRouter } from "@ledgerblocks/core/procurement/trpc"
import { t } from "@ledgerblocks/core/trpc/context"
import { userRouter } from "@ledgerblocks/core/user/trpc"
import { workspaceRouter } from "@ledgerblocks/core/workspace/trpc"

export const appRouter = t.router({
   user: userRouter,
   // subscription: billingRouter,
   workspace: workspaceRouter,
   procurement: procurementRouter,
   order: orderRouter,
})
