export * from "./utils"
export * from "drizzle-orm/sqlite-core"
import type { ApiEnv, ClientEnv } from "@unfiddle/infra/env"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

export const client = (c: {
   var: { env: ApiEnv & ClientEnv }
}) => {
   return drizzle({
      connection: {
         url: c.var.env.DATABASE_URL,
         authToken:
            c.var.env.ENVIRONMENT === "development"
               ? undefined
               : c.var.env.DATABASE_AUTH_TOKEN,
      },
      casing: "snake_case",
      schema,
   })
}

export type DatabaseClient = ReturnType<typeof client>
