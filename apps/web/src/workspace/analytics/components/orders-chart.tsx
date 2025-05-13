import { formatCurrency } from "@/currency"
import { formatDate } from "@/date"
import { formatNumber } from "@/number"
import { formatOrderDate } from "@/order/utils"
import {
   type ChartConfig,
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@ledgerblocks/ui/components/chart"
import { useSearch } from "@tanstack/react-router"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function OrdersChart() {
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })

   const data = [
      { date: "2024-03-01", value: 11485 },
      { date: "2024-04-01", value: 11458 },
      { date: "2024-05-01", value: 11382 },
      { date: "2024-06-01", value: 11389 },
      { date: "2024-07-01", value: 11326 },
      { date: "2024-08-01", value: 11367 },
      { date: "2024-09-01", value: 11383 },
      { date: "2024-10-01", value: 11328 },
      { date: "2024-11-01", value: 11484 },
      { date: "2024-12-01", value: 11429 },
      { date: "2025-01-01", value: 11579 },
      { date: "2025-02-01", value: 11623 },
      { date: "2025-03-01", value: 11692 },
      { date: "2025-04-01", value: 11710 },
      { date: "2025-05-01", value: 11743 },
      { date: "2025-06-01", value: 11721 },
      { date: "2025-07-01", value: 11788 },
      { date: "2025-08-01", value: 11812 },
      { date: "2025-09-01", value: 11837 },
      { date: "2025-10-01", value: 11801 },
      { date: "2025-11-01", value: 11856 },
      { date: "2025-12-01", value: 11914 },
      { date: "2026-01-01", value: 11960 },
      { date: "2026-02-01", value: 11989 },
      { date: "2026-03-01", value: 12015 },
      { date: "2026-04-01", value: 11972 },
      { date: "2026-05-01", value: 12038 },
      { date: "2026-06-01", value: 12059 },
      { date: "2026-07-01", value: 12096 },
      { date: "2026-08-01", value: 12103 },
      { date: "2026-09-01", value: 12087 },
      { date: "2026-10-01", value: 12142 },
      { date: "2026-11-01", value: 12178 },
      { date: "2026-12-01", value: 12194 },
      { date: "2027-01-01", value: 12230 },
      { date: "2027-02-01", value: 12264 },
      { date: "2027-03-01", value: 12283 },
      { date: "2027-04-01", value: 12299 },
      { date: "2027-05-01", value: 12328 },
      { date: "2027-06-01", value: 12344 },
      { date: "2027-07-01", value: 12387 },
      { date: "2027-08-01", value: 12401 },
      { date: "2027-09-01", value: 12435 },
      { date: "2027-10-01", value: 12458 },
      { date: "2027-11-01", value: 12481 },
      { date: "2027-12-01", value: 12510 },
   ]

   const maxValue = Math.max(...data.map((item) => item.value))
   const period = search.period

   return (
      <section>
         <p className="mb-2 font-semibold text-xl">Динаміка замовлень</p>
         <div className="scrollbar-hidden overflow-x-auto">
            <ChartContainer
               config={
                  {
                     quantity: {
                        label: "Quantity",
                        color: "var(--color-chart-1)",
                     },
                  } satisfies ChartConfig
               }
               style={{ minWidth: data.length * 16 }}
               className="mt-4 h-60 w-full [--color-chart-1:var(--color-accent-6)] md:h-72 xl:h-96"
            >
               <BarChart
                  data={data}
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
                              period === "all_time" ||
                              period === "last_year" ||
                              period === "last_half_year" ||
                              period === "last_quarter"
                                 ? "2-digit"
                                 : undefined,
                           day:
                              period === "last_week" || period === "last_month"
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
                     domain={[`dataMin - ${maxValue / 100}`, "dataMax"]}
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
                           valueFormatter={(value) =>
                              `${formatNumber(+value)} замовлень`
                           }
                           labelFormatter={(value) =>
                              `За ${formatOrderDate(value)}`
                           }
                        />
                     }
                  />
                  <Bar
                     dataKey="value"
                     fill="var(--color-quantity)"
                     radius={[3, 3, 0, 0]}
                  />
               </BarChart>
            </ChartContainer>
         </div>
      </section>
   )
}
