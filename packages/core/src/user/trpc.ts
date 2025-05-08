import { user } from "@ledgerblocks/core/auth/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { updateUserSchema } from "@ledgerblocks/core/user/schema"
import { eq } from "drizzle-orm"

export const userRouter = t.router({
   me: t.procedure.query(({ ctx }) => {
      return ctx.user
   }),
   update: t.procedure
      .input(updateUserSchema)
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(user)
            .set({
               name: input.name,
               image: input.image,
            })
            .where(eq(user.id, ctx.user.id))
      }),
})
