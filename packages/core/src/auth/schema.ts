import { OAUTH_PROVIDERS } from "@unfiddle/core/auth/constants"
import { d } from "@unfiddle/core/database"
import { user } from "@unfiddle/core/user/schema"
import { relations } from "drizzle-orm"

export const oauthAccount = d.table(
   "oauth_account",
   {
      userId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      providerId: d
         .text({
            enum: OAUTH_PROVIDERS,
         })
         .notNull(),
      providerUserId: d.text().notNull().unique(),
      ...d.timestamps,
   },
   (table) => [
      d.primaryKey({ columns: [table.providerId, table.providerUserId] }),
   ],
)

export const oauthAccountRelations = relations(oauthAccount, ({ one }) => ({
   user: one(user, {
      fields: [oauthAccount.userId],
      references: [user.id],
   }),
}))

export const emailVerificationRequest = d.table(
   "email_verification_request",
   {
      id: d.id("verification_request"),
      userId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      email: d.text().notNull().unique(),
      code: d.text().notNull(),
      expiresAt: d.integer({ mode: "timestamp" }).notNull(),
   },
   (table) => [
      d.index("email_verification_request_user_id_idx").on(table.userId),
   ],
)

export const session = d.table(
   "session",
   {
      id: d.text().primaryKey(),
      expiresAt: d.integer({ mode: "timestamp" }).notNull(),
      userId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
   },
   (table) => [d.index("session_user_id_idx").on(table.userId)],
)
