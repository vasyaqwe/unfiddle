import { formatCurrency } from "@/currency"
import { formatDate } from "@/date"
import { formatOrderDate } from "@/order/utils"
import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   type ChartConfig,
   ChartContainer,
   ChartCursor,
   ChartTooltip,
   ChartTooltipContent,
} from "@ledgerblocks/ui/components/chart"
import { useChartZoom } from "@ledgerblocks/ui/components/chart/use-chart-zoom"
import { Loading } from "@ledgerblocks/ui/components/loading"
import { cx } from "@ledgerblocks/ui/utils"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { CatchBoundary, useParams, useSearch } from "@tanstack/react-router"
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
   0: "var(--color-accent-6)",
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
                     className="absolute inset-0 m-auto"
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

   const profit = useSuspenseQuery(
      trpc.workspace.analytics.profit.queryOptions({
         id: params.workspaceId,
         ...search,
      }),
   )

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

   const firstDataPoint = profit.data.find(
      (point) => Object.keys(point).length > 1,
   )

   const dataKeys = !firstDataPoint
      ? []
      : Object.keys(firstDataPoint).filter((key) => key !== "date")

   const config = Object.fromEntries(
      dataKeys.map((id, idx) => [
         id,
         {
            label:
               id === "all"
                  ? ""
                  : (selectedMembers.find((m) => m.user.id === id)?.user.name ??
                    ""),
            color: COLORS[idx],
         },
      ]),
   ) satisfies ChartConfig

   const _domain = React.useMemo(() => {
      let min = Infinity
      let max = -Infinity

      for (const dataPoint of profit.data) {
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
   }, [profit.data])

   const lines = Object.keys(config)

   const zoom = useChartZoom({ initialData: profit.data })

   return (
      <>
         <div className="mb-2 flex items-center justify-between">
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
                  ? "[--color-chart-1:var(--color-accent-6)]"
                  : "[--color-chart-1:var(--color-primary-9)]",
            )}
         >
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
                           formatDate(new Date(value), {
                              month: "short",
                              year: "2-digit",
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
                              valueFormatter={(value) => formatCurrency(+value)}
                           />
                        }
                        cursor={<ChartCursor fill={"var(--color-chart-1)"} />}
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
         </ChartContainer>
      </>
   )
}
