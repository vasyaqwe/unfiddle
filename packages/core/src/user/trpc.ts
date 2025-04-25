import { t } from "@ledgerblocks/core/trpc/context"

export const userRouter = t.router({
   me: t.procedure.query(({ ctx }) => {
      return ctx.user
   }),
})
