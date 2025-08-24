import { d } from "@unfiddle/core/database"
import { estimate } from "@unfiddle/core/estimate/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const estimateItem = d.table(
   "estimate_item",
   {
      id: d.id("estimate_item"),
      estimateId: d
         .text()
         .notNull()
         .references(() => estimate.id, { onDelete: "cascade" }),
      workspaceId: d.text().references(() => workspace.id),
      name: d.text().notNull(),
      quantity: d.integer().notNull(),
      desiredPrice: d.numeric({ mode: "number" }),
      ...d.timestamps,
   },
   (table) => [d.index("estimate_item_estimate_id_idx").on(table.estimateId)],
)

export const estimateItemRelations = relations(estimateItem, ({ one }) => ({
   estimate: one(estimate, {
      fields: [estimateItem.estimateId],
      references: [estimate.id],
   }),
}))

export const updateEstimateItemSchema = createUpdateSchema(estimateItem)
   .pick({
      name: true,
      quantity: true,
      desiredPrice: true,
      estimateId: true,
   })
   .required({ estimateId: true })
   .extend({
      workspaceId: z.string(),
      estimateItemId: z.string(),
   })
