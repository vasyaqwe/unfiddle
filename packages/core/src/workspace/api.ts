import { apiValidator, createRouter } from "@ledgerblocks/core/api/utils"
import { workspace } from "@ledgerblocks/core/workspace/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const workspaceRouter = createRouter().get(
   "/:code",
   apiValidator("param", z.object({ code: z.string() })),
   async (c) => {
      const param = c.req.valid("param")

      const [org] = await c.var.db
         .select()
         .from(workspace)
         .where(eq(workspace.inviteCode, param.code))

      return c.json(org ?? null)
   },
)
