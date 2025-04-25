import { trpcServer } from "@hono/trpc-server"
import { handleApiError } from "@unfiddle/core/api/error"
import { createRouter } from "@unfiddle/core/api/utils"
import { authRouter } from "@unfiddle/core/auth/api"
import { authMiddleware } from "@unfiddle/core/auth/middleware"
import { d } from "@unfiddle/core/database"
import { appRouter } from "@unfiddle/core/trpc"
import type { TRPCContext } from "@unfiddle/core/trpc/context"
import { clientEnv } from "@unfiddle/infra/env"
import { logger } from "@unfiddle/infra/logger"
import { cors } from "hono/cors"
import { csrf } from "hono/csrf"
import { logger as honoLogger } from "hono/logger"

const app = createRouter()
   .use(honoLogger())
   .use(async (c, next) => {
      c.set("env", { ...c.env, ...clientEnv[c.env.ENVIRONMENT] })
      c.set("db", d.client(c))
      await next()
   })
   .onError(handleApiError)

const base = createRouter()
   .use((c, next) => {
      const handler = cors({
         credentials: true,
         maxAge: 600,
         origin: [c.var.env.WEB_URL],
      })
      return handler(c, next)
   })
   .get("/health", (c) =>
      c.json({
         message: "Healthy",
      }),
   )

const auth = createRouter()
   .use((c, next) => {
      const handler = csrf({
         origin: [c.var.env.WEB_URL],
      })
      return handler(c, next)
   })
   .route("/", authRouter)

export const routes = app
   .use(
      "/trpc/*",
      (c, next) => {
         c.header("Content-Encoding", "Identity") //worker streaming fix
         const handler = cors({
            origin: [c.var.env.WEB_URL],
         })
         return handler(c, next)
      },
      authMiddleware,
      trpcServer({
         router: appRouter,
         onError: (opts) => {
            logger.trpcError(
               opts.error.code,
               !opts.error.message || opts.error.message === ""
                  ? "Unknown error"
                  : opts.error.message,
            )
         },
         createContext: async (_opts, c) => {
            return {
               vars: c.var.env,
               db: c.var.db,
               user: c.var.user,
               session: c.var.session,
               hono: c,
            } satisfies TRPCContext
         },
      }),
   )
   .route("/auth", auth)
   .route("/", base)
