import { d } from "@unfiddle/core/database"
import { user } from "@unfiddle/core/user/schema"

export const passkeyCredential = d.table(
   "passkey_credential",
   {
      id: d.bytea().primaryKey(),
      userId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      name: d.text().notNull(),
      algorithm: d.integer().notNull(),
      publicKey: d.bytea().notNull(),
      ...d.timestamps,
   },
   (table) => [d.index("passkey_credential_user_id_idx").on(table.userId)],
)
