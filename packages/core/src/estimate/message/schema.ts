import { attachment } from "@unfiddle/core/attachment/schema"
import { user } from "@unfiddle/core/auth/schema"
import { d } from "@unfiddle/core/database"
import { estimate } from "@unfiddle/core/estimate/schema"
import { workspace } from "@unfiddle/core/workspace/schema"
import { relations } from "drizzle-orm"
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const estimateMessage = d.table(
   "estimate_message",
   {
      id: d.id("estimate_message"),
      estimateId: d
         .text()
         .notNull()
         .references(() => estimate.id, { onDelete: "cascade" }),
      workspaceId: d
         .text()
         .notNull()
         .references(() => workspace.id, { onDelete: "cascade" }),
      creatorId: d
         .text()
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      replyToId: d
         .text()
         .references((): AnySQLiteColumn => estimateMessage.id, {
            onDelete: "cascade",
         }),
      content: d.text().notNull(),
      ...d.timestamps,
   },
   (table) => [
      d
         .index("estimate_message_estimate_id_created_at_idx")
         .on(table.estimateId, table.createdAt),
      d
         .index("estimate_message_workspace_id_created_at_idx")
         .on(table.workspaceId, table.createdAt),
   ],
)

export const estimateMessageSchema = createSelectSchema(estimateMessage, {
   createdAt: z.coerce.date(),
   updatedAt: z.coerce.date(),
}).extend({
   creator: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
   }),
   reply: z
      .object({
         id: z.string(),
         content: z.string(),
         creatorId: z.string(),
         creator: z.object({
            id: z.string(),
            name: z.string(),
            image: z.string().nullable(),
         }),
      })
      .nullable(),
   attachments: z
      .array(
         z.object({
            id: z.string(),
            name: z.string(),
            type: z.string(),
            url: z.string(),
            size: z.number(),
            width: z.number().nullable(),
            height: z.number().nullable(),
         }),
      )
      .default([]),
})

export const estimateMessageRelations = relations(
   estimateMessage,
   ({ one, many }) => ({
      estimate: one(estimate, {
         fields: [estimateMessage.estimateId],
         references: [estimate.id],
      }),
      creator: one(user, {
         fields: [estimateMessage.creatorId],
         references: [user.id],
      }),
      workspace: one(workspace, {
         fields: [estimateMessage.workspaceId],
         references: [workspace.id],
      }),
      reply: one(estimateMessage, {
         fields: [estimateMessage.replyToId],
         references: [estimateMessage.id],
      }),
      attachments: many(attachment),
   }),
)
