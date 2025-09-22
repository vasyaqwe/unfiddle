export * from "./utils"
export * from "drizzle-orm/sqlite-core"
import type { ApiEnv, ClientEnv } from "@unfiddle/core/env"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

export const client = (c: {
   var: { env: ApiEnv & ClientEnv }
}) => {
   return drizzle(c.var.env.DATABASE, {
      casing: "snake_case",
      schema,
   })
}

export type DatabaseClient = ReturnType<typeof client>
