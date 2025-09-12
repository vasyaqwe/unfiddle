import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { estimateItem } from "@unfiddle/core/database/schema"
import { estimate } from "@unfiddle/core/estimate/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import { createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const estimateProcurement = d.table(
   "estimate_procurement",
   {
      id: d.id("estimate_procurement"),
      estimateId: d
         .text()
         .notNull()
         .references(() => estimate.id),
      creatorId: d
         .text()
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      estimateItemId: d.text().references(() => estimateItem.id),
      quantity: d.integer().notNull(),
      purchasePrice: d.numeric({ mode: "number" }).notNull(),
      note: d.text().default(""),
      provider: d.text(),
      ...d.timestamps,
   },
   (table) => [
      d
         .index("procurement_estimate_id_created_at_idx")
         .on(table.estimateId, table.createdAt),
   ],
)

export const estimateProcurementRelations = relations(
   estimateProcurement,
   ({ one }) => ({
      creator: one(user, {
         fields: [estimateProcurement.creatorId],
         references: [user.id],
      }),
      estimate: one(estimate, {
         fields: [estimateProcurement.estimateId],
         references: [estimate.id],
      }),
      estimateItem: one(estimateItem, {
         fields: [estimateProcurement.estimateItemId],
         references: [estimateItem.id],
      }),
   }),
)

export const updateEstimateProcurementSchema = createUpdateSchema(
   estimateProcurement,
)
   .pick({
      note: true,
      quantity: true,
      purchasePrice: true,
      provider: true,
      workspaceId: true,
      estimateItemId: true,
      estimateId: true,
   })
   .required({ workspaceId: true, estimateId: true })
   .extend({
      estimateProcurementId: z.string(),
   })
