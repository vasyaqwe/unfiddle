import { d } from "@unfiddle/core/database"

export const user = d.table(
   "user",
   {
      id: d.id("user"),
      email: d.text().notNull(),
      name: d.text().notNull(),
      image: d.text(),
      ...d.timestamps,
   },
   (table) => [d.uniqueIndex("user_email_idx").on(table.email)],
)
