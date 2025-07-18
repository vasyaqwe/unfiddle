import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { isChartDataEmpty } from "@/workspace/analytics/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CatchBoundary } from "@tanstack/react-router"
import { useParams, useSearch } from "@tanstack/react-router"
import { formatDate, getUserTimezoneOffset } from "@unfiddle/core/date"
import { formatNumber } from "@unfiddle/core/number"
import { formatOrderDate } from "@unfiddle/core/order/utils"
import {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@unfiddle/ui/components/chart"
import { Loading } from "@unfiddle/ui/components/loading"
import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function OrdersChart() {
   return (
      <section className="relative flex h-72 w-full flex-col md:h-86 xl:h-100">
         <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-xl">Динаміка замовлень</p>
         </div>
         <CatchBoundary
            getResetKey={() => "reset"}
            errorComponent={(props) => (
               <ErrorComponent
                  error={props.error}
                  reset={props.reset}
               />
            )}
         >
            <React.Suspense
               fallback={
                  <Loading
                     size={"xl"}
                     className="inset-0 m-auto"
                  />
               }
            >
               <ChartContent />
            </React.Suspense>
         </CatchBoundary>
      </section>
   )
}

function ChartContent() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/analytics" })
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })

   const orders = useSuspenseQuery(
      trpc.workspace.analytics.orders.queryOptions({
         id: params.workspaceId,
         timezoneOffset: getUserTimezoneOffset(),
         ...search,
      }),
   )
   const data = orders.data ?? []

   const maxValue = Math.max(...data.map((item) => item.value))

   return isChartDataEmpty(data) ? (
      <div className="absolute inset-0 m-auto flex size-fit flex-col items-center gap-5 font-medium text-foreground/75 text-lg">
         <svg
            className="size-12"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
         >
            <g fill="currentColor">
               <rect
                  x="2.75"
                  y="2.75"
                  width="4.5"
                  height="12.5"
                  rx="1.5"
                  ry="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
               />
               <rect
                  x="10.75"
                  y="8.75"
                  width="4.5"
                  height="6.5"
                  rx="1.5"
                  ry="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
               />
            </g>
         </svg>
         Даних не знайдено
      </div>
   ) : (
      <div className="scrollbar-hidden flex grow flex-col overflow-x-auto">
         <ChartContainer
            config={{
               quantity: {
                  label: "Quantity",
                  color: "var(--color-chart-1)",
               },
            }}
            style={{ minWidth: data.length * 16 }}
            className="mt-5 h-0 grow [--color-chart-1:var(--color-primary-6)] "
         >
            <BarChart
               data={orders.data}
               margin={{ top: 24, right: 32, left: 8 }}
            >
               <CartesianGrid
                  vertical={false}
                  strokeDasharray="2 2"
               />
               <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={(value) =>
                     formatDate(value, {
                        month: "short",
                        year:
                           search.period === "all_time" ||
                           search.period === "last_year" ||
                           search.period === "last_half_year" ||
                           search.period === "last_quarter"
                              ? "2-digit"
                              : undefined,
                        day:
                           search.period === "last_week" ||
                           search.period === "last_month"
                              ? "numeric"
                              : undefined,
                     })
                  }
               />
               <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  allowDataOverflow={true}
                  domain={[`dataMin - ${maxValue / 100}`, "dataMax"]}
                  tickFormatter={(value) => formatNumber(Math.round(+value))}
               />
               <ChartTooltip
                  content={
                     <ChartTooltipContent
                        labelFormatter={(value) =>
                           `За ${new Date(value).getDate() === new Date().getDate() ? "сьогодні" : formatOrderDate(value)}`
                        }
                        valueFormatter={(value) =>
                           `${formatNumber(+value)} замовлень`
                        }
                     />
                  }
               />
               <Bar
                  maxBarSize={32}
                  dataKey="value"
                  fill="var(--color-quantity)"
                  radius={[3, 3, 0, 0]}
               />
            </BarChart>
         </ChartContainer>
      </div>
   )
}
