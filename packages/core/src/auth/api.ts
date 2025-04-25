import { handleApiError } from "@ledgerblocks/core/api/error"
import { createRouter } from "@ledgerblocks/core/api/utils"
import { logger } from "@ledgerblocks/infra/logger"
import { getCookie } from "hono/cookie"

export const authRouter = createRouter()
   // .post(
   //    "/signup",
   //    apiValidator(
   //       "json",
   //       z.object({
   //          email: z.string().email(),
   //          password: z.string().min(MIN_PASSWORD_LENGTH),
   //          name: z.string().min(MIN_NAME_LENGTH),
   //       }),
   //    ),
   //    async (c) => {
   //       const json = c.req.valid("json")
   //       const signup = await tryCatch(
   //          c.var.auth.api.signUpEmail({
   //             body: {
   //                email: json.email,
   //                password: json.password,
   //                name: json.name,
   //             },
   //          }),
   //       )
   //       if (signup.error) {
   //          logger.error("signup error:", signup.error)
   //          throw new HTTPException(500, signup.error)
   //       }

   //       return c.json({ status: "ok" })
   //    },
   // )
   // .post(
   //    "/signin",
   //    apiValidator(
   //       "json",
   //       z.object({
   //          email: z.string().email(),
   //          password: z.string().min(MIN_PASSWORD_LENGTH),
   //       }),
   //    ),
   //    async (c) => {
   //       const json = c.req.valid("json")
   //       const _res = await c.var.auth.api.signInEmail({
   //          body: {
   //             email: json.email,
   //             password: json.password,
   //             rememberMe: true,
   //          },
   //       })

   //       return c.json({ status: "ok" })
   //    },
   // )
   // .post("/signout", authMiddleware, async (c) => {
   //    await c.var.auth.api.signOut({ headers: c.req.raw.headers })
   //    return c.json({ status: "ok" })
   // })
   .onError((error, c) => {
      const redirect = getCookie(c, "redirect")
      if (!redirect) return handleApiError(error, c)

      logger.error("auth error:", error)

      // redirect back to login page if not logged in
      const newRedirectUrl = new URL(`${redirect}/login`)

      newRedirectUrl.searchParams.append("error", "true")

      return c.redirect(newRedirectUrl.toString())
   })
