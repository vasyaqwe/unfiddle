import { CACHE_SHORT } from "@/api"
import { formatCurrency } from "@/currency"
import { formatNumber } from "@/number"
import { trpc } from "@/trpc"
import {
   Stat,
   StatLabel,
   StatValue,
   StatValueSup,
} from "@/workspace/analytics/components/stat"
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@ledgerblocks/ui/components/card"
import { cx } from "@ledgerblocks/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useParams, useSearch } from "@tanstack/react-router"

export function QuickStats() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/analytics" })
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })

   const members = useQuery(
      trpc.workspace.member.list.queryOptions(
         {
            workspaceId: params.workspaceId,
         },
         {
            staleTime: CACHE_SHORT,
         },
      ),
   )
   const selectedMembers = search.who.includes("all")
      ? [{ user: { id: "all", name: "" } }]
      : members.data?.filter((member) => search.who.includes(member.user.id))

   const stats = useQuery(
      trpc.workspace.analytics.stats.queryOptions({
         id: params.workspaceId,
         ...search,
      }),
   )

   const sortedTotalOrders = selectedMembers
      ?.map((m) => ({
         ...m,
         totalOrders: stats.data?.[m.user.id]?.totalOrders ?? 0,
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders)

   const sortedSuccessfulOrders = selectedMembers
      ?.map((m) => {
         const userStats = stats.data?.[m.user.id]
         const totalOrders = userStats?.totalOrders ?? 0
         const orders = userStats?.successfulOrders ?? 0
         const percentage = totalOrders > 0 ? (orders / totalOrders) * 100 : 0
         return {
            ...m,
            orders,
            percentage,
            totalOrders,
         }
      })
      .sort((a, b) => b.orders - a.orders)

   const sortedFailedOrders = selectedMembers
      ?.map((m) => {
         const userStats = stats.data?.[m.user.id]
         const totalOrders = userStats?.totalOrders ?? 0
         const orders = userStats?.failedOrders ?? 0
         const percentage = totalOrders > 0 ? (orders / totalOrders) * 100 : 0
         return {
            ...m,
            orders,
            percentage,
            totalOrders,
         }
      })
      .sort((a, b) => b.orders - a.orders)

   const sortedAverageProfitPercentage = selectedMembers
      ?.map((m) => ({
         ...m,
         averageProfitPercentage:
            stats.data?.[m.user.id]?.averageProfitPercentage ?? null,
      }))
      .sort(
         (a, b) =>
            (b.averageProfitPercentage ?? -Infinity) -
            (a.averageProfitPercentage ?? -Infinity),
      )

   const sortedTotalProfit = selectedMembers
      ?.map((m) => ({
         ...m,
         totalProfit: stats.data?.[m.user.id]?.totalProfit ?? 0,
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)

   return (
      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:gap-6 2xl:grid-cols-5">
         <Card className="max-2xl:order-1">
            <CardHeader>
               <CardTitle>Всього замовлень</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedTotalOrders?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>{formatNumber(m.totalOrders)}</StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
         <Card className="max-2xl:order-3">
            <CardHeader>
               <CardTitle>Успішно</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedSuccessfulOrders?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>
                        {formatNumber(m.orders)}{" "}
                        {m.percentage > 0 && (
                           <StatValueSup
                              className={cx(
                                 m.percentage >= 75
                                    ? "text-green-9"
                                    : "text-red-9",
                              )}
                           >
                              {formatNumber(+m.percentage.toFixed(0))}%
                           </StatValueSup>
                        )}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>

         <Card className="max-2xl:order-4">
            <CardHeader>
               <CardTitle>Неуспішно</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedFailedOrders?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>
                        {formatNumber(m.orders)}{" "}
                        {m.percentage > 0 && (
                           <StatValueSup
                              className={cx(
                                 m.percentage > 25
                                    ? "text-red-9"
                                    : "text-green-9",
                              )}
                           >
                              {formatNumber(+m.percentage.toFixed(0))}%
                           </StatValueSup>
                        )}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>

         <Card className="max-2xl:order-2">
            <CardHeader>
               <CardTitle>Маржинальність</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedAverageProfitPercentage?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue
                        className={
                           m.averageProfitPercentage === null
                              ? undefined
                              : m.averageProfitPercentage >= 8
                                ? "text-green-9"
                                : m.averageProfitPercentage < 8
                                  ? "text-red-9"
                                  : undefined
                        }
                     >
                        {m.averageProfitPercentage === null
                           ? "-"
                           : `${formatNumber(m.averageProfitPercentage, { maximumFractionDigits: 1 })}%`}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>

         <Card className="order-last max-2xl:col-span-2">
            <CardHeader>
               <CardTitle>Загальний прибуток</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedTotalProfit?.map((m) => (
                  <Stat key={m.user.id}>
                     <StatLabel>{m.user.name}</StatLabel>
                     <StatValue>
                        {formatCurrency(m.totalProfit, { notation: "compact" })}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
      </section>
   )
}
