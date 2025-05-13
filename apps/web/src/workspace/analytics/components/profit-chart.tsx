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

// Updated function to calculate moving average and replace original data
const _calculateMovingAverage = (
   // @ts-expect-error ...
   data: { date: string; [key: string]: number }[],
   windowSize: number,
   dataKey: string, // This is the key whose value will be replaced by the moving average
   // @ts-expect-error ...
): { date: string; [key: string]: number }[] => {
   // Create a copy to avoid modifying the original data array directly if it's used elsewhere
   const smoothedData = data.map((item) => ({ ...item }))

   for (let i = 0; i < smoothedData.length; i++) {
      let sum = 0
      let count = 0
      // Calculate sum over the window ending at index i
      for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
         // @ts-expect-error ...
         sum += smoothedData[j][dataKey] || 0
         count++
      }
      const average = count > 0 ? sum / count : 0
      // Replace the original value with the moving average
      // @ts-expect-error ...
      smoothedData[i][dataKey] = average
   }
   return data
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

      // Now dataKeys can just filter out 'date', as the original keys hold the MA data
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
         // Return a default minimal domain if no data
         return [0, 1]
      }

      let min = Infinity // Initialize min to positive infinity
      let max = -Infinity // Initialize max to negative infinity

      // Iterate through each data point (each day)
      // biome-ignore lint/complexity/noForEach: <explanation>
      generatedChartData.forEach((dataPoint) => {
         // Iterate through each key in the data point (date, user IDs)
         // biome-ignore lint/complexity/noForEach: <explanation>
         Object.keys(dataPoint).forEach((key) => {
            // Ignore the 'date' key
            if (key !== "date") {
               // Get the value for the current key (smoothed profit for a user/all)
               const value = dataPoint[key]
               // Check if the value is a valid number
               if (typeof value === "number" && !Number.isNaN(value)) {
                  // Update min if the current value is smaller
                  min = Math.min(min, value)
                  // Update max if the current value is larger
                  max = Math.max(max, value)
               }
            }
         })
      })

      // If no valid numbers were found, return a default domain
      if (min === Infinity || max === -Infinity) {
         return [0, 1]
      }

      // Calculate the range of the data
      const dataRange = max - min

      // Calculate the lower bound for the Y-axis:
      // min value minus 15% of the data range, but not below 0 (since profit is non-negative)
      const lowerBound = Math.max(0, min - dataRange * 2.5) // Adjust for more/less padding below min

      // Calculate the upper bound for the Y-axis:
      // max value plus 5% of the data range
      const upperBound = max + dataRange * 2 // Adjust for more/less padding above max

      // Handle case where dataRange is zero (all values are the same) - add a small fixed padding
      if (dataRange === 0) {
         const padding = min * 0.1 || 10 // 10% of min value or a default of 10
         return [Math.max(0, min - padding), min + padding]
      }

      // Return the calculated dynamic domain
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

         {lineKeysToDisplay.length === 0 || generatedChartData.length === 0 ? (
            <div className="flex h-60 w-full items-center justify-center text-muted-foreground md:h-72 xl:h-96">
               Немає даних для відображення
            </div>
         ) : (
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
                        margin={{ top: 12, right: 32, bottom: 4, left: 8 }}
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
                                 valueFormatter={(value) =>
                                    formatCurrency(+value)
                                 }
                              />
                           }
                           cursor={
                              <ChartCursor fill={"var(--color-chart-1)"} />
                           }
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
         )}
      </section>
   )
}
