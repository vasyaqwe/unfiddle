import {
   client,
   createClientSchema,
   updateClientSchema,
} from "@unfiddle/core/client/schema"
import { createId } from "@unfiddle/core/id"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

export const clientRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx, input }) => {
         const clients = await ctx.db.query.client.findMany({
            where: eq(client.workspaceId, input.workspaceId),
            columns: {
               id: true,
               name: true,
               severity: true,
               createdAt: true,
            },
            orderBy: [desc(client.createdAt)],
         })

         return clients
      }),
   one: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ clientId: z.string(), workspaceId: z.string() }))
      .query(async ({ ctx, input }) => {
         const found = await ctx.db.query.client.findFirst({
            where: and(
               eq(client.id, input.clientId),
               eq(client.workspaceId, input.workspaceId),
            ),
         })

         return found ?? null
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createClientSchema)
      .mutation(async ({ ctx, input }) => {
         const normalizedName = input.name
            .normalize("NFC")
            .toLocaleLowerCase("uk")

         const clientId = createId("client")

         await ctx.db.insert(client).values({
            ...input,
            id: clientId,
            creatorId: ctx.user.id,
            normalizedName,
         })

         return { id: clientId }
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateClientSchema)
      .mutation(async ({ ctx, input }) => {
         const normalizedName = input.name
            ?.normalize("NFC")
            .toLocaleLowerCase("uk")

         await ctx.db
            .update(client)
            .set({
               ...input,
               normalizedName,
            })
            .where(
               and(
                  eq(client.id, input.clientId),
                  eq(client.workspaceId, input.workspaceId),
               ),
            )
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ clientId: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .delete(client)
            .where(
               and(
                  eq(client.id, input.clientId),
                  eq(client.workspaceId, input.workspaceId),
               ),
            )
      }),
})
