import { d } from "@unfiddle/core/database"
import { WORKSPACE_ROLES } from "@unfiddle/core/workspace/constants"
import { z } from "zod"

export const user = d.table(
   "user",
   {
      id: d.id("user"),
      name: d.text().notNull(),
      email: d.text().notNull(),
      emailVerified: d.integer({ mode: "boolean" }).notNull(),
      image: d.text(),
      ...d.timestamps,
   },
   (table) => [d.uniqueIndex("user_email_idx").on(table.email)],
)

const userId = d
   .text()
   .notNull()
   .references(() => user.id, { onDelete: "cascade" })

const workspaceMembershipsSchema = z.array(
   z.object({
      workspaceId: z.string(),
      role: z.enum(WORKSPACE_ROLES),
      deletedAt: z.date().nullable(),
   }),
)

export const session = d.table("session", {
   id: d.text().primaryKey(),
   expiresAt: d.integer({ mode: "timestamp" }).notNull(),
   token: d.text().notNull().unique(),
   ipAddress: d.text(),
   userAgent: d.text(),
   userId,
   workspaceMemberships: d
      .text({
         mode: "json",
      })
      .$type<z.infer<typeof workspaceMembershipsSchema>>()
      .notNull()
      .default([]),
   ...d.timestamps,
})

export const account = d.table("account", {
   id: d.text().primaryKey(),
   accountId: d.text().notNull(),
   providerId: d.text().notNull(),
   userId,
   accessToken: d.text(),
   refreshToken: d.text(),
   idToken: d.text(),
   accessTokenExpiresAt: d.integer({
      mode: "timestamp",
   }),
   refreshTokenExpiresAt: d.integer({
      mode: "timestamp",
   }),
   scope: d.text(),
   password: d.text(),
   ...d.timestamps,
})

export const verification = d.table("verification", {
   id: d.text().primaryKey(),
   identifier: d.text().notNull(),
   value: d.text().notNull(),
   expiresAt: d.integer({ mode: "timestamp" }).notNull(),
   ...d.timestamps,
})
