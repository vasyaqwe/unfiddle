import { TRPCError } from "@trpc/server"
import {
   attachment,
   createAttachmentsSchema,
} from "@unfiddle/core/attachment/schema"
import { formatCurrency } from "@unfiddle/core/currency"
import { CURRENCIES } from "@unfiddle/core/currency/constants"
import { orderAssignee, orderItem } from "@unfiddle/core/database/schema"
import { createId } from "@unfiddle/core/id"
import { orderAssigneeRouter } from "@unfiddle/core/order/assignee/trpc"
import {
   ORDER_SEVERITIES_TRANSLATION,
   ORDER_STATUSES_TRANSLATION,
} from "@unfiddle/core/order/constants"
import { orderFilterSchema } from "@unfiddle/core/order/filter"
import { orderItemRouter } from "@unfiddle/core/order/item/trpc"
import {
   order,
   orderCounter,
   updateOrderSchema,
} from "@unfiddle/core/order/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import {
   and,
   desc,
   eq,
   gte,
   inArray,
   isNotNull,
   isNull,
   lt,
   sql,
} from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { createInsertSchema } from "drizzle-zod"
import * as XLSX from "xlsx"
import { z } from "zod"

export const orderRouter = t.router({
   assignee: orderAssigneeRouter,
   item: orderItemRouter,
   export: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         const orders = await ctx.db.query.order.findMany({
            where: and(
               eq(order.workspaceId, input.workspaceId),
               isNull(order.deletedAt),
            ),
            columns: {
               shortId: true,
               name: true,
               currency: true,
               sellingPrice: true,
               status: true,
               severity: true,
               note: true,
               vat: true,
               client: true,
               deliversAt: true,
               createdAt: true,
            },
            with: {
               items: {
                  columns: {
                     name: true,
                     quantity: true,
                     desiredPrice: true,
                  },
               },
               creator: {
                  columns: {
                     name: true,
                  },
               },
            },
            orderBy: [desc(order.createdAt)],
         })

         const exportData = orders.map((order) => ({
            Номер: order.shortId,
            Назва: order.name,
            Статус: ORDER_STATUSES_TRANSLATION[order.status],
            Пріоритет: ORDER_SEVERITIES_TRANSLATION[order.severity],
            Валюта: order.currency,
            Ціна: formatCurrency(order.sellingPrice, {
               currency: order.currency,
            }),
            "З ПДВ": order.vat ? "Так" : "Ні",
            Клієнт: order.client,
            Коментар: order.note,
            Менеджер: order.creator?.name,
            Товари: order.items
               .map((item) => `${item.name} (${item.quantity} шт.)`)
               .join(", "),
            "Термін постачання": order.deliversAt
               ? new Date(order.deliversAt).toLocaleDateString("uk-UA")
               : null,
            Створене: new Date(order.createdAt).toLocaleDateString("uk-UA"),
         }))

         const worksheet = XLSX.utils.json_to_sheet(exportData)
         const workbook = XLSX.utils.book_new()
         XLSX.utils.book_append_sheet(workbook, worksheet, "Orders")

         const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
         })

         return {
            data: Array.from(buffer),
            filename: `замовлення-${new Date().toLocaleDateString("uk-UA")}.xlsx`,
         }
      }),
   import: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
            data: z.array(z.number()),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         const buffer = Buffer.from(input.data)
         const workbook = XLSX.read(buffer, { type: "buffer" })
         const sheetName = workbook.SheetNames[0]

         if (!sheetName)
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Файл не містить листів для імпорту",
            })

         const worksheet = workbook.Sheets[sheetName]

         if (!worksheet)
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Файл не містить даних для імпорту",
            })

         const rawData = XLSX.utils.sheet_to_json(worksheet)

         if (!rawData.length)
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Файл порожній або не містить рядків з даними",
            })

         const statusTranslationValues = Object.values(
            ORDER_STATUSES_TRANSLATION,
         ) as [string, ...string[]]
         const severityTranslationValues = Object.values(
            ORDER_SEVERITIES_TRANSLATION,
         ) as [string, ...string[]]

         const priceSchema = z.union([
            z.number(),
            z.string().transform((val) => {
               const numStr = val.replace(/[^\d.,]/g, "").replace(",", ".")
               const num = parseFloat(numStr)
               if (Number.isNaN(num) || num <= 0) {
                  throw new Error("Невірна ціна")
               }
               return num
            }),
         ])

         const importSchema = z
            .object({
               Назва: z.string().min(1, "Назва замовлення обов'язкова"),
               Статус: z
                  .enum(statusTranslationValues)
                  .default(ORDER_STATUSES_TRANSLATION.pending),
               Пріоритет: z
                  .enum(severityTranslationValues)
                  .default(ORDER_SEVERITIES_TRANSLATION.low),
               Валюта: z.enum(CURRENCIES).default("UAH"),
               Ціна: priceSchema,
               "З ПДВ": z
                  .union([z.boolean(), z.string()])
                  .transform((val) => {
                     if (typeof val === "boolean") return val
                     return (
                        val.toLowerCase() === "так" ||
                        val.toLowerCase() === "true" ||
                        val === "1"
                     )
                  })
                  .default(false),
               Клієнт: z.string().optional(),
               Коментар: z.string().default(""),
               "Термін постачання": z
                  .union([z.string(), z.date()])
                  .transform((val) => {
                     if (val instanceof Date) return val
                     if (!val || val.trim() === "") return null

                     // Try parsing Ukrainian date format (DD.MM.YYYY)
                     const ukDateMatch = val.match(
                        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
                     )
                     if (ukDateMatch?.[1] && ukDateMatch[2] && ukDateMatch[3]) {
                        const day = parseInt(ukDateMatch[1])
                        const month = parseInt(ukDateMatch[2])
                        const year = parseInt(ukDateMatch[3])
                        const date = new Date(year, month - 1, day)
                        if (!Number.isNaN(date.getTime())) return date
                     }

                     // Try parsing ISO date or other formats
                     const date = new Date(val)
                     if (!Number.isNaN(date.getTime())) return date

                     throw new Error(
                        "Невірний формат дати. Використовуйте ДД.ММ.РРРР",
                     )
                  })
                  .optional(),
            })
            .partial()
            .required({ Назва: true, Ціна: true })

         const statusMap = Object.fromEntries(
            Object.entries(ORDER_STATUSES_TRANSLATION).map(([key, value]) => [
               value,
               key,
            ]),
         ) as Record<string, keyof typeof ORDER_STATUSES_TRANSLATION>

         const severityMap = Object.fromEntries(
            Object.entries(ORDER_SEVERITIES_TRANSLATION).map(([key, value]) => [
               value,
               key,
            ]),
         ) as Record<string, keyof typeof ORDER_SEVERITIES_TRANSLATION>
         const validatedData = []
         const errors = []

         for (let i = 0; i < rawData.length; i++) {
            try {
               const row = importSchema.parse(rawData[i])
               validatedData.push({
                  name: row.Назва,
                  status: statusMap[row.Статус || "Без статусу"],
                  severity: severityMap[row.Пріоритет || "Звичайно"],
                  currency: row.Валюта || "UAH",
                  sellingPrice: row.Ціна,
                  vat: row["З ПДВ"] || false,
                  client: row.Клієнт || null,
                  note: row.Коментар || "",
                  deliversAt: row["Термін постачання"] || null,
                  quantity: 1,
                  workspaceId: input.workspaceId,
                  creatorId: ctx.user.id,
               })
            } catch (error) {
               if (error instanceof z.ZodError) {
                  const fieldErrors = error.errors
                     .map((e) => `${e.path.join(".")}: ${e.message}`)
                     .join(", ")
                  errors.push(`Рядок ${i + 2}: ${fieldErrors}`)
               } else {
                  errors.push(
                     `Рядок ${i + 2}: ${error instanceof Error ? error.message : "Невідома помилка"}`,
                  )
               }
            }
         }

         if (errors.length > 0)
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: `Помилки валідації:\n${errors.slice(0, 10).join("\n")}${errors.length > 10 ? `\n... та ще ${errors.length - 10} помилок` : ""}`,
            })

         if (validatedData.length === 0)
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Немає валідних рядків для імпорту",
            })

         const existingCounter = await ctx.db.query.orderCounter.findFirst({
            where: eq(orderCounter.workspaceId, input.workspaceId),
         })
         let lastId = existingCounter?.lastId ?? 0

         const ordersToInsert = validatedData.map((orderData) => {
            lastId += 1
            return {
               ...orderData,
               shortId: lastId,
               normalizedName: orderData.name
                  .normalize("NFC")
                  .toLocaleLowerCase("uk"),
            }
         })

         const batchQueries: BatchItem[] = [
            ctx.db.insert(order).values(ordersToInsert),
         ]

         if (!existingCounter) {
            batchQueries.push(
               ctx.db
                  .insert(orderCounter)
                  .values({
                     workspaceId: input.workspaceId,
                     lastId,
                  })
                  .onConflictDoNothing(),
            )
         } else {
            batchQueries.push(
               ctx.db
                  .update(orderCounter)
                  .set({ lastId })
                  .where(eq(orderCounter.workspaceId, input.workspaceId)),
            )
         }

         await ctx.db.batch(
            batchQueries as unknown as readonly [
               BatchItem<"sqlite">,
               ...BatchItem<"sqlite">[],
            ],
         )

         return {
            imported: validatedData.length,
            message: `Успішно імпортовано ${validatedData.length} замовлень`,
         }
      }),
   one: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const found = await ctx.db.query.order.findFirst({
            where: and(
               eq(order.id, input.orderId),
               eq(order.workspaceId, input.workspaceId),
            ),
            with: {
               items: {
                  columns: {
                     id: true,
                     name: true,
                     quantity: true,
                     desiredPrice: true,
                  },
               },
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               assignees: {
                  columns: {},
                  with: {
                     user: {
                        columns: {
                           id: true,
                           name: true,
                           image: true,
                        },
                     },
                  },
                  orderBy: [desc(orderAssignee.createdAt)],
               },
               attachments: {
                  columns: {
                     id: true,
                     url: true,
                     type: true,
                     size: true,
                     name: true,
                     width: true,
                     height: true,
                     creatorId: true,
                  },
                  with: {
                     creator: {
                        columns: {
                           id: true,
                           name: true,
                           image: true,
                        },
                     },
                  },
                  orderBy: [desc(attachment.createdAt)],
               },
            },
            orderBy: [desc(order.createdAt)],
         })

         return found ?? null
      }),
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
            filter: orderFilterSchema,
         }),
      )
      .query(async ({ ctx, input }) => {
         const filter = input.filter

         const whereConditions = [eq(order.workspaceId, input.workspaceId)]

         if (filter.status?.length)
            whereConditions.push(inArray(order.status, filter.status))

         if (filter.severity?.length)
            whereConditions.push(inArray(order.severity, filter.severity))

         if (filter.creator?.length)
            whereConditions.push(inArray(order.creatorId, filter.creator))

         if (filter.archived) {
            whereConditions.push(isNotNull(order.deletedAt))
         } else {
            whereConditions.push(isNull(order.deletedAt))
         }

         if (filter.startDate) {
            whereConditions.push(
               gte(
                  order.createdAt,
                  new Date(new Date(filter.startDate).setHours(0, 0, 0, 0)),
               ),
            )
         }
         if (filter.endDate) {
            whereConditions.push(
               lt(
                  order.createdAt,
                  new Date(new Date(filter.endDate).setHours(23, 59, 59, 999)),
               ),
            )
         }

         if (filter.q?.length) {
            const searchTerm = `%${filter.q.trim().toLowerCase().normalize("NFC")}%`

            whereConditions.push(
               sql`(
                ${order.normalizedName} LIKE ${searchTerm}
                OR
                ${order.shortId} LIKE ${searchTerm}
                OR
                ${order.sellingPrice} LIKE ${searchTerm}
              )`,
            )
         }

         const orders = await ctx.db.query.order.findMany({
            where: and(...whereConditions),
            columns: {
               id: true,
               shortId: true,
               name: true,
               severity: true,
               currency: true,
               status: true,
               vat: true,
               creatorId: true,
               deliversAt: true,
               client: true,
               sellingPrice: true,
               deletedAt: true,
               createdAt: true,
               note: true,
            },
            with: {
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               assignees: {
                  columns: {},
                  with: {
                     user: {
                        columns: {
                           id: true,
                           name: true,
                           image: true,
                        },
                     },
                  },
                  orderBy: [desc(orderAssignee.createdAt)],
               },
               procurements: {
                  columns: {
                     id: true,
                     purchasePrice: true,
                     quantity: true,
                  },
               },
            },
            orderBy: [desc(order.createdAt)],
         })

         return orders
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createInsertSchema(order)
            .omit({ creatorId: true, shortId: true })
            .extend({
               analogs: z.array(z.string()).default([]),
               items: z
                  .array(createInsertSchema(orderItem).omit({ orderId: true }))
                  .min(1),
               attachments: createAttachmentsSchema,
            }),
      )
      .mutation(async ({ ctx, input }) => {
         const existingCounter = await ctx.db.query.orderCounter.findFirst({
            where: eq(orderCounter.workspaceId, input.workspaceId),
         })
         const lastId = existingCounter?.lastId ?? 0
         const nextId = lastId + 1
         const normalizedName = input.name
            .normalize("NFC")
            .toLocaleLowerCase("uk")

         const orderId = createId("order")

         const batchQueries: BatchItem[] = []

         batchQueries.push(
            ctx.db.insert(order).values({
               ...input,
               id: orderId,
               shortId: nextId,
               creatorId: ctx.user.id,
               normalizedName,
            }),
         )

         const BATCH_SIZE = 5
         for (let i = 0; i < input.items.length; i += BATCH_SIZE) {
            const batch = input.items.slice(i, i + BATCH_SIZE)
            batchQueries.push(
               ctx.db.insert(orderItem).values(
                  batch.map((item) => ({
                     ...item,
                     workspaceId: input.workspaceId,
                     orderId,
                  })),
               ),
            )
         }

         if (!existingCounter) {
            batchQueries.push(
               ctx.db
                  .insert(orderCounter)
                  .values({ workspaceId: input.workspaceId })
                  .onConflictDoNothing(),
            )
         }
         batchQueries.push(
            ctx.db
               .update(orderCounter)
               .set({ lastId: nextId })
               .where(eq(orderCounter.workspaceId, input.workspaceId)),
         )

         if (input.attachments.length > 0) {
            batchQueries.push(
               ctx.db.insert(attachment).values(
                  input.attachments.map((a) => ({
                     ...a,
                     subjectId: orderId,
                     subjectType: "order" as const,
                     workspaceId: input.workspaceId,
                     creatorId: ctx.user.id,
                  })),
               ),
            )
         }

         await ctx.db.batch(
            batchQueries as unknown as readonly [
               BatchItem<"sqlite">,
               ...BatchItem<"sqlite">[],
            ],
         )

         return {
            ...input,
            id: orderId,
            shortId: nextId,
            creatorId: ctx.user.id,
            normalizedName,
         }
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateOrderSchema)
      .mutation(async ({ ctx, input }) => {
         const normalizedName = input.name
            ?.normalize("NFC")
            .toLocaleLowerCase("uk")

         await ctx.db
            .update(order)
            .set({
               ...input,
               normalizedName,
               deletedAt:
                  input.deletedAt === undefined
                     ? undefined
                     : input.deletedAt === null
                       ? null
                       : new Date(input.deletedAt),
            })
            .where(
               and(
                  eq(order.id, input.orderId),
                  eq(order.workspaceId, input.workspaceId),
               ),
            )
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ orderId: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         if (ctx.membership.role !== "owner" && ctx.membership.role !== "admin")
            throw new TRPCError({
               code: "FORBIDDEN",
            })

         await ctx.db.batch([
            ctx.db
               .delete(procurement)
               .where(
                  and(
                     eq(procurement.orderId, input.orderId),
                     eq(procurement.workspaceId, input.workspaceId),
                  ),
               ),
            ctx.db
               .delete(orderAssignee)
               .where(
                  and(
                     eq(orderAssignee.orderId, input.orderId),
                     eq(orderAssignee.workspaceId, input.workspaceId),
                  ),
               ),
            ctx.db
               .delete(order)
               .where(
                  and(
                     eq(order.id, input.orderId),
                     eq(order.workspaceId, input.workspaceId),
                  ),
               ),
            ctx.db
               .delete(attachment)
               .where(
                  and(
                     eq(attachment.subjectId, input.orderId),
                     eq(attachment.workspaceId, input.workspaceId),
                  ),
               ),
         ])
      }),
})
