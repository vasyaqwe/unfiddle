import { t } from "@unfiddle/core/trpc/context"
import { userRouter } from "@unfiddle/core/user/trpc"

export const appRouter = t.router({
   user: userRouter,
   // subscription: billingRouter,
})

export type AppRouter = typeof appRouter
