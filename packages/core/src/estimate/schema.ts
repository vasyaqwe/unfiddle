import { user } from "@unfiddle/core/auth/schema"
import { CURRENCIES } from "@unfiddle/core/currency/constants"
import { d } from "@unfiddle/core/database"
import { client, estimateProcurement } from "@unfiddle/core/database/schema"
import { estimateItem } from "@unfiddle/core/estimate/item/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const estimateCounter = d.table("estimate_counter", {
   workspaceId: d
      .text()
      .notNull()
      .primaryKey()
      .references(() => workspace.id, { onDelete: "cascade" }),
   lastId: d.integer().notNull().default(0),
})

export const estimate = d.table(
   "estimate",
   {
      id: d.id("estimate"),
      shortId: d.integer().notNull(),
      creatorId: d
         .text()
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      clientId: d.text().references(() => client.id, { onDelete: "set null" }),
      normalizedName: d.text().notNull().default(""),
      name: d.text().notNull(),
      currency: d
         .text({
            enum: CURRENCIES,
         })
         .notNull()
         .default("UAH"),
      sellingPrice: d.numeric({ mode: "number" }).notNull(),
      note: d.text().notNull().default(""),
      ...d.timestamps,
   },
   (table) => [
      // Main for most common filter combinations
      d
         .index("estimate_workspace_id_created_at_idx")
         .on(table.workspaceId, table.createdAt),
      // For text search
      d
         .index("estimate_workspace_id_name_idx")
         .on(table.workspaceId, table.normalizedName),
      d
         .uniqueIndex("estimate_workspace_id_short_id_unique_idx")
         .on(table.workspaceId, table.shortId),
   ],
)

export const estimateRelations = relations(estimate, ({ one, many }) => ({
   client: one(client, {
      fields: [estimate.clientId],
      references: [client.id],
   }),
   creator: one(user, {
      fields: [estimate.creatorId],
      references: [user.id],
   }),
   procurements: many(estimateProcurement),
   items: many(estimateItem),
}))

export const updateEstimateSchema = createUpdateSchema(estimate)
   .pick({
      workspaceId: true,
      name: true,
      note: true,
      sellingPrice: true,
      clientId: true,
      currency: true,
   })
   .required({ workspaceId: true })
   .extend({
      estimateId: z.string(),
      deletedAt: z.date().nullable().optional(),
   })
