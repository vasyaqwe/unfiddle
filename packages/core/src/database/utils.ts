import type { ID_PREFIXES } from "@unfiddle/core/database/id"
import { createId } from "@unfiddle/core/id"
import { customType, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const id = (prefix: keyof typeof ID_PREFIXES) =>
   text("id")
      .primaryKey()
      .$defaultFn(() => createId(prefix))

export const table = sqliteTable

export const timestamps = {
   createdAt: integer({ mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
   updatedAt: integer({ mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
}

export const bytea = customType<{ data: Uint8Array }>({
   dataType() {
      return "bytea"
   },
})
