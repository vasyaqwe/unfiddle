import type { AuthedHonoEnv } from "@ledgerblocks/core/api/types"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"

export const authMiddleware = createMiddleware<AuthedHonoEnv>(
   async (c, next) => {
      const session = await c.var.auth.api.getSession({
         headers: c.req.raw.headers,
      })

      if (!session)
         throw new HTTPException(401, {
            message: "Unauthorized",
         })

      c.set("user", session.user)
      c.set("session", session.session as never)

      await next()
   },
)
