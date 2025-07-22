import { attachment } from "@unfiddle/core/attachment/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const attachmentRouter = t.router({
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
            attachments: z.array(
               createInsertSchema(attachment).omit({ creatorId: true }),
            ),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         return await ctx.db
            .insert(attachment)
            .values(
               input.attachments.map((a) => ({ ...a, creatorId: ctx.user.id })),
            )
            .returning()
            .get()
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            attachmentId: z.string(),
            workspaceId: z.string(),
            subjectId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         const res = await ctx.db
            .delete(attachment)
            .where(
               and(
                  eq(attachment.id, input.attachmentId),
                  eq(attachment.workspaceId, input.workspaceId),
               ),
            )
            .returning()
            .get()

         if (res?.url) {
            await ctx.vars.BUCKET.delete(res.url)
         }
      }),
})
