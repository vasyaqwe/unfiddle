import { parseZodErrorIssues } from "@ledgerblocks/core/api/error"
import { t } from "@ledgerblocks/core/trpc/context"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

export const workspaceMemberMiddleware = t.middleware(async (opts) => {
   const input = z
      .object({ id: z.string().optional(), workspaceId: z.string().optional() })
      .safeParse(await opts.getRawInput())

   if (input.error)
      throw new TRPCError({
         code: "BAD_REQUEST",
         message: parseZodErrorIssues(input.error.issues),
      })

   const membership = opts.ctx.session.workspaceMemberships.find(
      (membership) =>
         membership.workspaceId === (input.data.workspaceId ?? input.data.id),
   )

   if (!membership) throw new TRPCError({ code: "FORBIDDEN" })

   return opts.next({ ctx: { membership } })
})
