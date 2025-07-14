import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { isChartDataEmpty } from "@/workspace/analytics/utils"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { CatchBoundary, useParams, useSearch } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatDate } from "@unfiddle/core/date"
import { formatOrderDate } from "@unfiddle/core/order/utils"
import { Button } from "@unfiddle/ui/components/button"
import {
   type ChartConfig,
   ChartContainer,
   ChartCursor,
   ChartTooltip,
   ChartTooltipContent,
} from "@unfiddle/ui/components/chart"
import { useChartZoom } from "@unfiddle/ui/components/chart/use-chart-zoom"
import { Loading } from "@unfiddle/ui/components/loading"
import { cx } from "@unfiddle/ui/utils"
import * as React from "react"
import {
   CartesianGrid,
   Line,
   LineChart,
   ReferenceArea,
   ResponsiveContainer,
   XAxis,
   YAxis,
} from "recharts"

const COLORS: Record<number, string> = {
   0: "var(--color-primary-6)",
   1: "#22c55e",
   2: "#C084FC",
   3: "#F87171",
   4: "#f97316",
   5: "#14b8a6",
   6: "#d946ef",
   7: "#6b7280",
   8: "#71717a",
   9: "#78716c",
} as const

export function ProfitChart() {
   return (
      <section className="relative flex h-72 w-full flex-col md:h-86 xl:h-100">
         <CatchBoundary
            getResetKey={() => "reset"}
            errorComponent={(props) => (
               <>
                  <div className="mb-2 flex min-h-[31px] items-center justify-between">
                     <p className="font-semibold text-xl">Динаміка прибутку</p>
                  </div>
                  <ErrorComponent
                     error={props.error}
                     reset={props.reset}
                  />
               </>
            )}
         >
            <React.Suspense
               fallback={
                  <>
                     <div className="mb-2 flex min-h-[31px] items-center justify-between">
                        <p className="font-semibold text-xl">
                           Динаміка прибутку
                        </p>
                     </div>
                     <Loading
                        size={"xl"}
                        className="inset-0 m-auto"
                     />
                  </>
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

   const profit = useSuspenseQuery(
      trpc.workspace.analytics.profit.queryOptions({
         id: params.workspaceId,
         ...search,
      }),
   )
   const data = profit.data ?? []

   const members = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )

   const selectedMembers = React.useMemo(
      () =>
         members.data?.filter((member) =>
            search.who.includes(member.user.id),
         ) ?? [],
      [members.data, search.who],
   )

   const firstDataPoint = data.find((point) => Object.keys(point).length > 1)

   const dataKeys = !firstDataPoint
      ? []
      : Object.keys(firstDataPoint).filter((key) => key !== "date")

   const config = Object.fromEntries(
      dataKeys.map((id, idx) => [
         id,
         {
            label:
               search.period_comparison.length > 0
                  ? formatDate(id, { month: "long" })
                  : id === "all"
                    ? ""
                    : (selectedMembers.find((m) => m.user.id === id)?.user
                         .name ?? ""),
            color: COLORS[idx],
         },
      ]),
   ) satisfies ChartConfig

   const _domain = React.useMemo(() => {
      let min = Infinity
      let max = -Infinity

      for (const dataPoint of data) {
         for (const key of Object.keys(dataPoint)) {
            if (key !== "date") {
               const value = dataPoint[key]
               if (typeof value === "number" && !Number.isNaN(value)) {
                  min = Math.min(min, value)
                  max = Math.max(max, value)
               }
            }
         }
      }

      if (min === Infinity || max === -Infinity) return [0, 1]

      const dataRange = max - min

      const lowerBound = Math.max(0, min - dataRange * 3)

      const upperBound = max + dataRange * 3
      if (dataRange === 0) {
         const padding = min * 0.1 || 10
         return [Math.max(0, min - padding), min + padding]
      }

      return [lowerBound, upperBound]
   }, [data])

   const lines = Object.keys(config)

   const zoom = useChartZoom({ initialData: data })

   return (
      <>
         <div className="mb-2 flex min-h-[31px] items-center justify-between">
            <p className="font-semibold text-xl">Динаміка прибутку</p>
            <Button
               onClick={() => zoom.reset()}
               variant={"tertiary"}
            >
               Скинути
            </Button>
         </div>
         <ChartContainer
            config={config}
            className={cx(
               "mt-5 h-0 grow",
               lines.length === 1
                  ? "[--color-chart-1:var(--color-primary-6)]"
                  : "[--color-chart-1:var(--color-surface-9)]",
            )}
         >
            {isChartDataEmpty(data) ? (
               <div className="absolute inset-0 m-auto flex size-fit flex-col items-center gap-5 font-medium text-foreground/75 text-lg">
                  <svg
                     className="size-12"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 18 18"
                  >
                     <g fill="currentColor">
                        <path
                           d="M1.75 9.881C1.75 9.881 5.824 5.674 8.142 3.85C9.692 2.631 10.605 2.511 11.167 3.072C12.192 4.093 10.76 5.99 8.809 8.584C6.858 11.178 5.446 12.666 6.515 13.675C7.57 14.671 9.752 12.443 10.565 11.535C11.378 10.627 13.234 8.613 14.143 9.46C14.948 10.21 13.753 12.022 13.33 12.832C12.907 13.642 12.387 14.478 13.005 15.037C13.879 15.828 15.25 14.161 15.25 14.161"
                           stroke="currentColor"
                           strokeWidth="1.5"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           fill="none"
                        />
                     </g>
                  </svg>
                  Даних не знайдено
               </div>
            ) : (
               <div
                  onWheel={zoom.handle}
                  onTouchMove={zoom.handle}
                  ref={zoom.chartRef}
                  className="size-full touch-none"
               >
                  <ResponsiveContainer>
                     <LineChart
                        accessibilityLayer
                        data={zoom.zoomedData()}
                        margin={{ top: 12, right: 32, bottom: 4, left: 12 }}
                        onMouseDown={zoom.onMouseDown}
                        onMouseMove={zoom.onMouseMove}
                        onMouseUp={zoom.onMouseUp}
                        onMouseLeave={zoom.onMouseUp}
                     >
                        <CartesianGrid
                           vertical={false}
                           strokeDasharray="2 2"
                        />
                        <XAxis
                           dataKey={"date"}
                           tickLine={false}
                           tickMargin={12}
                           minTickGap={32}
                           // domain={["dataMin - 1000", "dataMax + 1000"]}
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
                           axisLine={false}
                           tickLine={false}
                           tickMargin={12}
                           allowDataOverflow={true}
                           // domain={domain}
                           tickFormatter={(value) => {
                              if (value === 0) return "0 ₴"
                              return formatCurrency(value, {
                                 notation: "compact",
                                 style: "decimal",
                              })
                           }}
                        />
                        <ChartTooltip
                           content={
                              <ChartTooltipContent
                                 labelFormatter={(value) =>
                                    `За ${new Date(value).getDate() === new Date().getDate() ? "сьогодні" : formatOrderDate(value)}`
                                 }
                                 valueFormatter={(value) =>
                                    formatCurrency(+value)
                                 }
                              />
                           }
                           cursor={
                              <ChartCursor fill={"var(--color-chart-1)"} />
                           }
                        />
                        {lines.map((key) => (
                           <Line
                              key={key}
                              dataKey={key}
                              type="linear"
                              stroke={config[key]?.color}
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                           />
                        ))}
                        {zoom.refAreaLeft && zoom.refAreaRight && (
                           <ReferenceArea
                              x1={zoom.refAreaLeft}
                              x2={zoom.refAreaRight}
                              strokeOpacity={0.3}
                              fill="var(--color-chart-1)"
                              fillOpacity={0.05}
                           />
                        )}
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            )}
         </ChartContainer>
      </>
   )
}
