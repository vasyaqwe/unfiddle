import { trpcServer } from "@hono/trpc-server"
import { handleApiError } from "@ledgerblocks/core/api/error"
import { createRouter } from "@ledgerblocks/core/api/utils"
import { authClient } from "@ledgerblocks/core/auth"
import { authRouter } from "@ledgerblocks/core/auth/api"
import { authMiddleware } from "@ledgerblocks/core/auth/middleware"
import { d } from "@ledgerblocks/core/database"
import { appRouter } from "@ledgerblocks/core/trpc"
import type { TRPCContext } from "@ledgerblocks/core/trpc/context"
import { clientEnv } from "@ledgerblocks/infra/env"
import { logger } from "@ledgerblocks/infra/logger"
import { cors } from "hono/cors"
import { logger as honoLogger } from "hono/logger"

const app = createRouter()
   .use(honoLogger())
   .use(async (c, next) => {
      c.set("env", { ...c.env, ...clientEnv[c.env.ENVIRONMENT] })
      c.set("db", d.client(c))
      c.set("auth", authClient(c))
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
      const handler = cors({
         credentials: true,
         maxAge: 600,
         origin: [c.var.env.WEB_URL],
         allowHeaders: ["Content-Type", "Authorization"],
         allowMethods: ["POST", "GET", "OPTIONS"],
         exposeHeaders: ["Content-Length"],
      })
      return handler(c, next)
   })
   .on(["POST", "GET"], "*", (c) => {
      return c.var.auth.handler(c.req.raw)
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
               auth: c.var.auth,
               user: c.var.user,
               session: c.var.session,
               hono: c,
            } satisfies TRPCContext
         },
      }),
   )
   .route("/auth", auth)
   .route("/", base)
