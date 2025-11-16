import type { HonoEnv } from "@unfiddle/core/api/types"
import { ORDER_STATUSES } from "@unfiddle/core/order/constants"
import { orderItem } from "@unfiddle/core/order/item/schema"
import { order, orderCounter } from "@unfiddle/core/order/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { eq } from "drizzle-orm"
import type { Context } from "hono"

export const seed = async (c: Context<HonoEnv>) => {
   // if (c.var.env.ENVIRONMENT !== "development")
   //    return c.json({ error: "Not found" }, 404)

   const db = c.var.db
   const workspaceId = "wrk_3epqUEnxFEZx6oHLBPGZJRJ6ZcYi"
   const userId = "ODILYdq12Q2chn3we5d8CoxMLmeJbexC"

   try {
      let currentCounter =
         (
            await db.query.orderCounter.findFirst({
               where: eq(orderCounter.workspaceId, workspaceId),
            })
         )?.lastId ?? 0

      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const timeSpan = new Date().getTime() - sixMonthsAgo.getTime()
      const increment = timeSpan / 100

      for (let i = 0; i < 100; i++) {
         currentCounter++
         const createdAt = new Date(sixMonthsAgo.getTime() + i * increment)
         const randomStatus =
            ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)]

         const newOrder = await db
            .insert(order)
            .values({
               shortId: currentCounter,
               creatorId: userId,
               workspaceId,
               name: `Order ${currentCounter}`,
               sellingPrice: Math.random() * 1000,
               createdAt: createdAt,
               updatedAt: createdAt,
               normalizedName: `order ${currentCounter}`,
               status: randomStatus,
            })
            .returning({ insertedId: order.id })

         const orderId = newOrder[0]?.insertedId ?? ""

         const itemsToInsert = []
         for (let j = 0; j < 5; j++) {
            itemsToInsert.push({
               orderId: orderId,
               workspaceId,
               name: `Item ${j} for Order ${currentCounter}`,
               quantity: Math.floor(Math.random() * 10) + 1,
               desiredPrice: Math.random() * 100,
            })
         }

         let insertedItems: { insertedId: string }[] = []
         if (itemsToInsert.length > 0) {
            insertedItems = await db
               .insert(orderItem)
               .values(itemsToInsert)
               .returning({ insertedId: orderItem.id })
         }

         const procs = []
         const numProcurements = Math.floor(Math.random() * 3) + 3 // 3 to 5
         for (let k = 0; k < numProcurements; k++) {
            if (insertedItems.length > 0) {
               const randomOrderItemId =
                  insertedItems[
                     Math.floor(Math.random() * insertedItems.length)
                  ]?.insertedId
               procs.push({
                  orderId: orderId,
                  creatorId: userId,
                  workspaceId,
                  quantity: Math.floor(Math.random() * 10) + 1,
                  purchasePrice: Math.random() * 80,
                  orderItemId: randomOrderItemId,
               })
            }
         }
         if (procs.length > 0) {
            await db.insert(procurement).values(procs)
         }
      }

      const existingCounter = await db.query.orderCounter.findFirst({
         where: eq(orderCounter.workspaceId, workspaceId),
      })

      if (existingCounter) {
         await db
            .update(orderCounter)
            .set({ lastId: currentCounter })
            .where(eq(orderCounter.workspaceId, workspaceId))
      } else {
         await db.insert(orderCounter).values({
            workspaceId: workspaceId,
            lastId: currentCounter,
         })
      }

      return c.json({ success: true, message: "Database seeded successfully." })
   } catch (error) {
      console.error("Seeding failed:", error)
      return c.json(
         {
            success: false,
            message: "Seeding failed.",
            error: (error as Error).message,
         },
         500,
      )
   }
}
