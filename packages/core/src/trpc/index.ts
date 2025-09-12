import { attachmentRouter } from "@unfiddle/core/attachment/trpc"
import { estimateProcurementRouter } from "@unfiddle/core/estimate/procurement/trpc"
import { estimateRouter } from "@unfiddle/core/estimate/trpc"
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
   attachment: attachmentRouter,
   estimate: estimateRouter,
   estimateProcurement: estimateProcurementRouter,
})
