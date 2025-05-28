import { goodRouter } from "@unfiddle/core/good/trpc"
import { orderRouter } from "@unfiddle/core/order/trpc"
import { procurementRouter } from "@unfiddle/core/procurement/trpc"
import { t } from "@unfiddle/core/trpc/context"
import { userRouter } from "@unfiddle/core/user/trpc"
import { workspaceRouter } from "@unfiddle/core/workspace/trpc"

export const appRouter = t.router({
   user: userRouter,
   workspace: workspaceRouter,
   procurement: procurementRouter,
   order: orderRouter,
   good: goodRouter,
})
