import { d } from "@ledgerblocks/core/database"
import { z } from "zod"

export const user = d.table(
   "user",
   {
      id: d.id("user"),
      name: d.text().notNull(),
      email: d.text().notNull(),
      emailVerified: d.integer({ mode: "boolean" }).notNull(),
      image: d.text(),
      createdAt: d.integer({ mode: "timestamp" }).notNull(),
      updatedAt: d.integer({ mode: "timestamp" }).notNull(),
   },
   (table) => [d.uniqueIndex("user_email_idx").on(table.email)],
)

const userId = d
   .text()
   .notNull()
   .references(() => user.id, { onDelete: "cascade" })

const workspaceMembershipsSchema = z.array(
   z.object({ workspaceId: z.string() }),
)

export const session = d.table("session", {
   id: d.text().primaryKey(),
   expiresAt: d.integer({ mode: "timestamp" }).notNull(),
   token: d.text().notNull().unique(),
   createdAt: d.integer({ mode: "timestamp" }).notNull(),
   updatedAt: d.integer({ mode: "timestamp" }).notNull(),
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
   createdAt: d.integer({ mode: "timestamp" }).notNull(),
   updatedAt: d.integer({ mode: "timestamp" }).notNull(),
})

export const verification = d.table("verification", {
   id: d.text().primaryKey(),
   identifier: d.text().notNull(),
   value: d.text().notNull(),
   expiresAt: d.integer({ mode: "timestamp" }).notNull(),
   createdAt: d.integer({ mode: "timestamp" }),
   updatedAt: d.integer({ mode: "timestamp" }),
})
