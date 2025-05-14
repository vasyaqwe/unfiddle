import { formatCurrency } from "@/currency"
import { formatDate } from "@/date"
import { formatOrderDate } from "@/order/utils"
import { trpc } from "@/trpc"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   type ChartConfig,
   ChartContainer,
   ChartCursor,
   ChartTooltip,
   ChartTooltipContent,
} from "@ledgerblocks/ui/components/chart"
import { useChartZoom } from "@ledgerblocks/ui/components/chart/use-chart-zoom"
import { cx } from "@ledgerblocks/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useParams, useSearch } from "@tanstack/react-router"
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

const generateFakeProfit = (userId: string, date: Date): number => {
   const baseValue = 800
   const timeFactor = date.getTime() / (1000 * 60 * 60 * 24 * 365.25)
   let userFactor = 0
   if (typeof userId === "string") {
      for (let i = 0; i < userId.length; i++) {
         userFactor += userId.charCodeAt(i)
      }
   }
   userFactor = userFactor % 100
   const randomFactor = Math.random() * 3000
   let profit = baseValue + timeFactor * 800 + userFactor * 40 + randomFactor
   if (date.getDate() % 10 === 0) {
      profit += 150
   }
   if (date.getMonth() % 3 === 0) {
      profit += 400
   }
   return Math.max(1000, Math.round(profit))
}

const generateFakeTotalProfit = (date: Date): number => {
   const baseTotalValue = 50000
   const timeFactor = date.getTime() / (1000 * 60 * 60 * 24 * 365.25)
   const randomFactor = Math.random() * 30000
   let totalProfit = baseTotalValue + timeFactor * 10000 + randomFactor
   if (date.getDate() % 5 === 0) {
      totalProfit += 500
   }
   if (date.getMonth() % 2 === 0) {
      totalProfit += 2000
   }
   return Math.max(10000, Math.round(totalProfit))
}

const generateDailyDates = (years = 1): Date[] => {
   const dates: Date[] = []
   const now = new Date()
   const startDate = new Date(now)
   startDate.setFullYear(now.getFullYear() - years)
   startDate.setHours(0, 0, 0, 0)
   const endDate = new Date(now)
   endDate.setHours(23, 59, 59, 999)
   const currentDate = new Date(startDate)
   while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
   }
   return dates
}

export function ProfitChart() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/analytics" })
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })

   const members = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )

   const selectedMembers = React.useMemo(() => {
      if (!members.data) {
         return null
      }
      return members.data.filter((member) =>
         search.who.includes(member.user.id),
      )
   }, [members.data, search.who])

   const generatedChartData = React.useMemo(() => {
      if (!members.data) {
         return []
      }

      const isAllSelected =
         !selectedMembers ||
         selectedMembers.length === 0 ||
         search.who.includes("all")

      const idsToGenerate = isAllSelected
         ? ["all"]
         : selectedMembers.map((m) => m.user.id)

      const dates = generateDailyDates()

      const data = dates.map((date) => {
         // @ts-expect-error ...
         const dataPoint: { date: string; [key: string]: number } = {
            // @ts-expect-error ...
            date: date.toISOString().split("T")[0],
         }
         // biome-ignore lint/complexity/noForEach: <explanation>
         idsToGenerate.forEach((id) => {
            if (id === "all") {
               dataPoint[id] = generateFakeTotalProfit(date)
            } else {
               dataPoint[id] = generateFakeProfit(id, date)
            }
         })
         return dataPoint
      })

      return data
   }, [selectedMembers, search.who])

   const config = React.useMemo(() => {
      if (!generatedChartData || generatedChartData.length === 0) {
         return {} as ChartConfig
      }

      const firstDataPoint = generatedChartData.find(
         (point) => Object.keys(point).length > 1,
      )

      if (!firstDataPoint) {
         return {} as ChartConfig
      }

      const dataKeys = Object.keys(firstDataPoint).filter(
         (key) => key !== "date",
      )

      const memberNameMap = new Map<string, string>()
      // biome-ignore lint/complexity/noForEach: <explanation>
      selectedMembers?.forEach((m) => memberNameMap.set(m.user.id, m.user.name))

      const config = Object.fromEntries(
         dataKeys.map((id, idx) => [
            id,
            {
               label:
                  id === "all"
                     ? "Всі користувачі"
                     : memberNameMap.get(id) || `User ${id}`,
               color: COLORS[idx % 10],
            },
         ]),
      ) satisfies ChartConfig

      return config
   }, [generatedChartData, selectedMembers])

   const zoom = useChartZoom({ initialData: generatedChartData })

   const lineKeysToDisplay = Object.keys(config)
   const domain = React.useMemo(() => {
      if (!generatedChartData || generatedChartData.length === 0) {
         return [0, 1]
      }

      let min = Infinity
      let max = -Infinity

      // biome-ignore lint/complexity/noForEach: <explanation>
      generatedChartData.forEach((dataPoint) => {
         // biome-ignore lint/complexity/noForEach: <explanation>
         Object.keys(dataPoint).forEach((key) => {
            if (key !== "date") {
               const value = dataPoint[key]
               if (typeof value === "number" && !Number.isNaN(value)) {
                  min = Math.min(min, value)
                  max = Math.max(max, value)
               }
            }
         })
      })

      if (min === Infinity || max === -Infinity) {
         return [0, 1]
      }

      const dataRange = max - min

      const lowerBound = Math.max(0, min - dataRange * 3)

      const upperBound = max + dataRange * 3
      if (dataRange === 0) {
         const padding = min * 0.1 || 10
         return [Math.max(0, min - padding), min + padding]
      }

      return [lowerBound, upperBound]
   }, [generatedChartData])

   return (
      <section>
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
               "mt-5 h-60 w-full md:h-72 xl:h-96",
               lineKeysToDisplay.length === 1
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
                        //   domain={["dataMin - 1000", "dataMax + 1000"]}
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
                        domain={domain}
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
                                 `За ${formatOrderDate(value)}`
                              }
                              valueFormatter={(value) => formatCurrency(+value)}
                           />
                        }
                        cursor={<ChartCursor fill={"var(--color-chart-1)"} />}
                     />
                     {lineKeysToDisplay.map((key) => (
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
      </section>
   )
}
