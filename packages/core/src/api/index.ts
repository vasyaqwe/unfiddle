import { trpcServer } from "@hono/trpc-server"
import { handleApiError } from "@unfiddle/core/api/error"
import { createRouter } from "@unfiddle/core/api/utils"
import { authClient } from "@unfiddle/core/auth"
import { authMiddleware } from "@unfiddle/core/auth/middleware"
import { d } from "@unfiddle/core/database"
import { storageRouter } from "@unfiddle/core/storage/api"
import { appRouter } from "@unfiddle/core/trpc"
import type { TRPCContext } from "@unfiddle/core/trpc/context"
import { workspaceRouter } from "@unfiddle/core/workspace/api"
import { emailClient } from "@unfiddle/infra/email"
import { clientEnv } from "@unfiddle/infra/env"
import { logger } from "@unfiddle/infra/logger"
import { partyserverMiddleware } from "hono-party"
import { cors } from "hono/cors"
import { logger as honoLogger } from "hono/logger"

const app = createRouter()
   .use(honoLogger())
   .use(async (c, next) => {
      c.set("env", { ...c.env, ...clientEnv[c.env.ENVIRONMENT] })
      c.set("db", d.client(c))
      c.set("auth", authClient(c))
      c.set("email", emailClient(c))
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
   .use("*", partyserverMiddleware())
   .get("/r2/*", async (c) => {
      const key = c.req.path.substring("/r2/".length)
      const file = await c.var.env.BUCKET.get(key)
      if (!file) return c.json({ status: 404 })
      const headers = new Headers()
      headers.append("etag", file.httpEtag)
      return new Response(file.body, {
         headers,
      })
   })
   .route("/storage", storageRouter)
   .route("/workspace", workspaceRouter)
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

export const routes = app
   .use(
      "/trpc/*",
      (c, next) => {
         c.header("Content-Encoding", "Identity") //worker streaming fix
         const handler = cors({
            credentials: true,
            maxAge: 600,
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
               email: c.var.email,
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
