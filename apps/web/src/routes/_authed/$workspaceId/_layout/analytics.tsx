import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
import {
   formatDate,
   hourlyData,
} from "@/routes/_authed/$workspaceId/-components/fake-data"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { Card, CardFooter, CardTitle } from "@ledgerblocks/ui/components/card"
import {
   type ChartConfig,
   ChartContainer,
   ChartCursor,
   ChartTooltip,
   ChartTooltipContent,
} from "@ledgerblocks/ui/components/chart"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/analytics")(
   {
      component: RouteComponent,
      loader: async ({ context, params }) => {
         context.queryClient.prefetchQuery(
            trpc.workspace.summary.queryOptions({
               id: params.workspaceId,
            }),
         )
      },
   },
)

function RouteComponent() {
   const params = Route.useParams()
   const summary = useQuery(
      trpc.workspace.summary.queryOptions({ id: params.workspaceId }),
   )

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle>Аналітика</HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea>
            <p className="mb-3 font-semibold text-xl md:mb-4">Профіт</p>
            <div className="grid gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
               <Card>
                  <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                     {formatNumber(summary.data?.weekProfit ?? 0)} ₴
                  </p>
                  <CardFooter>За сьогодні</CardFooter>
               </Card>
               <Card>
                  <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                     {formatNumber(summary.data?.monthProfit ?? 0)} ₴
                  </p>
                  <CardFooter>За місяць</CardFooter>
               </Card>
               <Card className="md:col-span-2 lg:col-span-1">
                  <p className="font-mono font-semibold text-2xl tracking-tight md:text-3xl">
                     {formatNumber(summary.data?.allTimeProfit ?? 0)} ₴
                  </p>
                  <CardFooter>За весь час</CardFooter>
               </Card>
            </div>
            <ProfitChart />
         </MainScrollArea>
      </>
   )
}

export function ProfitChart() {
   const config = {
      value: {
         label: "Value",
         color: "var(--color-chart-1)",
      },
   } satisfies ChartConfig

   const [selectedValue] = React.useState("1h")

   const chartDataToUse = hourlyData

   return (
      <Card className="scrollbar-hidden mt-4 overflow-x-auto md:mt-5">
         <CardTitle>
            <span className="mt-4 font-medium text-emerald-500 text-sm">
               ↗ $2,849.27 (+4%)
            </span>
         </CardTitle>
         <ChartContainer
            config={config}
            className="mt-5 h-72 w-full min-w-[500px] [--color-chart-1:var(--color-accent-6)]"
         >
            <LineChart
               accessibilityLayer
               key={selectedValue}
               data={chartDataToUse}
               margin={{ left: 4, right: 32, top: 12 }}
            >
               <CartesianGrid
                  vertical={false}
                  strokeDasharray="2 2"
               />
               <XAxis
                  dataKey={selectedValue === "1h" ? "time" : "date"}
                  tickLine={false}
                  tickMargin={12}
                  minTickGap={32}
                  tickFormatter={(value) => formatDate(value, selectedValue)}
               />
               <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDataOverflow={true}
                  domain={["dataMin - 1000", "dataMax + 1000"]}
                  tickFormatter={(value) => {
                     if (value === 0) return "$0.00"
                     return `$${(value / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })}k`
                  }}
               />
               <ChartTooltip
                  content={<ChartTooltipContent hideIndicator />}
                  cursor={<ChartCursor fill="var(--color-chart-1)" />}
                  formatter={(value) =>
                     `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                  }
               />
               <Line
                  type="linear"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                     r: 5,
                     fill: "var(--color-chart-1)",
                     stroke: "var(--background)",
                     strokeWidth: 2,
                  }}
               />
            </LineChart>
         </ChartContainer>
      </Card>
   )
}
