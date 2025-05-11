import { CACHE_SHORT } from "@/api"
import { formatCurrency } from "@/currency"
import { formatDate } from "@/date"
import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
   HeaderUserMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { validator } from "@/validator"
import {
   PERIOD_FILTERS,
   PERIOD_FILTERS_TRANSLATION,
   workspaceAnalyticsFilterSchema,
} from "@ledgerblocks/core/workspace/analytics/filter"
import { button } from "@ledgerblocks/ui/components/button"
import { Card, CardFooter, CardTitle } from "@ledgerblocks/ui/components/card"
import {
   type ChartConfig,
   ChartContainer,
   ChartCursor,
   ChartTooltip,
   ChartTooltipContent,
} from "@ledgerblocks/ui/components/chart"
import { ProfitArrow } from "@ledgerblocks/ui/components/profit-arrow"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectTriggerIcon,
   SelectValue,
} from "@ledgerblocks/ui/components/select"
import { cx } from "@ledgerblocks/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import {
   Bar,
   BarChart,
   CartesianGrid,
   LabelList,
   Line,
   LineChart,
   XAxis,
   YAxis,
} from "recharts"
import type { z } from "zod"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/analytics")(
   {
      component: RouteComponent,
      loader: async ({ context, params }) => {
         context.queryClient.prefetchQuery(
            trpc.workspace.summary.queryOptions(
               {
                  id: params.workspaceId,
               },
               {
                  staleTime: CACHE_SHORT,
               },
            ),
         )
      },
      validateSearch: validator(workspaceAnalyticsFilterSchema),
   },
)

function RouteComponent() {
   const params = Route.useParams()
   const summary = useQuery(
      trpc.workspace.summary.queryOptions(
         { id: params.workspaceId },
         {
            staleTime: CACHE_SHORT,
         },
      ),
   )

   return (
      <>
         <Header>
            <HeaderBackButton />
            <HeaderTitle>Аналітика</HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea>
            <p className="mb-3 font-semibold text-xl md:mb-4">
               Загальний профіт
            </p>
            <div className="grid gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
               <Card>
                  <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                     {formatCurrency(summary.data?.weekProfit ?? 0)}
                  </p>
                  <CardFooter>За сьогодні</CardFooter>
               </Card>
               <Card>
                  <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                     {formatCurrency(summary.data?.monthProfit ?? 0)}
                  </p>
                  <CardFooter>За місяць</CardFooter>
               </Card>
               <Card className="md:col-span-2 lg:col-span-1">
                  <p className="font-mono font-semibold text-2xl tracking-tight md:text-3xl">
                     {formatCurrency(summary.data?.allTimeProfit ?? 0)}
                  </p>
                  <CardFooter>За весь час</CardFooter>
               </Card>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
               <TotalProfitChart />
            </div>
            <div className="flex items-center justify-between gap-3">
               <p className="mt-6 mb-3 font-semibold text-xl md:mb-4">
                  Профіт команди
               </p>
               <PeriodSelect key={"user_profit_period"} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
               <UserProfitComparisonChart title={"Менеджери"} />
               <UserProfitComparisonChart title={"Закупівельники"} />
               <UserProfitChart />
            </div>
         </MainScrollArea>
      </>
   )
}

function PeriodSelect({
   key,
}: { key: keyof z.infer<typeof workspaceAnalyticsFilterSchema> }) {
   const search = Route.useSearch()
   const navigate = useNavigate()

   return (
      <Select
         value={search[key]}
         onValueChange={(value) =>
            navigate({
               to: ".",
               search: (prev) => ({ ...prev, [key]: value }),
            })
         }
      >
         <SelectTrigger
            className={cx(button({ variant: "secondary" }), "min-w-32")}
         >
            <SelectValue />
            <SelectTriggerIcon />
         </SelectTrigger>
         <SelectPopup>
            {PERIOD_FILTERS.map((item) => (
               <SelectItem
                  key={item}
                  value={item}
               >
                  {PERIOD_FILTERS_TRANSLATION[item]}
               </SelectItem>
            ))}
         </SelectPopup>
      </Select>
   )
}

function TotalProfitChart() {
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
   ]

   const [selectedValue] = React.useState("1h")

   return (
      <Card className="scrollbar-hidden overflow-x-auto lg:col-span-2">
         <div className="flex items-center justify-between gap-3">
            <CardTitle>
               <span className="mt-4 font-mono font-semibold text-green-10 text-xl">
                  <ProfitArrow
                     profit={"positive"}
                     className="-mb-0.5 mr-0.5"
                  />{" "}
                  {formatCurrency(23200)}{" "}
                  <span className="text-base">(+4%)</span>
               </span>
            </CardTitle>
            <PeriodSelect key={"total_profit_period"} />
         </div>
         <ChartContainer
            config={
               {
                  value: {
                     label: "Value",
                     color: "var(--color-chart-1)",
                  },
               } satisfies ChartConfig
            }
            className="mt-5 h-72 w-full min-w-[500px] [--color-chart-1:var(--color-accent-6)]"
         >
            <LineChart
               accessibilityLayer
               key={selectedValue}
               data={data}
               margin={{ top: 12, right: 32, bottom: 4, left: 8 }}
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
                  tickFormatter={(value) =>
                     formatDate(value, { month: "short" })
                  }
               />
               <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  allowDataOverflow={true}
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => {
                     if (value === 0) return "0 ₴"
                     return formatCurrency(value, {
                        notation: "compact",
                        style: "decimal",
                     })
                  }}
               />
               <ChartTooltip
                  content={<ChartTooltipContent hideIndicator />}
                  cursor={<ChartCursor fill="var(--color-chart-1)" />}
                  formatter={(value) => formatCurrency(+value)}
               />
               <Line
                  type="linear"
                  dataKey="value"
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

function UserProfitComparisonChart({
   title,
}: {
   title: string
}) {
   const data = [
      { label: "Ivan", value: 15400 },
      { label: "Oksana", value: 12100 },
      { label: "Dmytro", value: 9800 },
      { label: "Kateryna", value: 8700 },
      { label: "Ivan", value: 15400 },
      { label: "Oksana", value: 12100 },
      { label: "Dmytro", value: 9800 },
      { label: "Kateryna", value: 8700 },
   ]
   const maxValue = Math.max(...data.map((item) => item.value))

   return (
      <Card className="scrollbar-hidden overflow-x-auto">
         <CardTitle className="mb-2">{title}</CardTitle>
         <ChartContainer
            config={
               {
                  value: {
                     label: "Profit",
                     color: "var(--color-chart-1)",
                  },
               } satisfies ChartConfig
            }
            className="mt-5 h-72 w-full [--color-chart-1:var(--color-accent-6)]"
         >
            <BarChart
               data={data}
               margin={{ left: 0, right: 60 }}
               layout="vertical"
            >
               <CartesianGrid
                  horizontal={false}
                  strokeDasharray="2 2"
               />
               <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  domain={[`dataMin - ${maxValue / 100}`, "dataMax"]}
                  hide
               />
               <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  hide
               />
               <ChartTooltip
                  content={<ChartTooltipContent hideIndicator />}
                  formatter={(value) => formatCurrency(+value)}
               />
               <Bar
                  dataKey="value"
                  layout="vertical"
                  fill="var(--color-chart-1)"
                  barSize={32}
                  radius={[2, 7, 7, 2]}
                  minPointSize={80}
               >
                  <LabelList
                     dataKey="label"
                     position="insideLeft"
                     offset={8}
                     className="fill-white"
                     fontSize={12}
                  />
                  <LabelList
                     dataKey="value"
                     position="right"
                     offset={8}
                     className="fill-foreground"
                     fontSize={12}
                     formatter={(value: string) => formatCurrency(+value)}
                  />
               </Bar>
            </BarChart>
         </ChartContainer>
      </Card>
   )
}

function UserProfitChart() {
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
   ]

   const maxValue = Math.max(...data.map((item) => item.value))

   return (
      <Card className="scrollbar-hidden overflow-x-auto lg:col-span-2">
         <div className="flex items-center justify-between gap-3">
            <CardTitle>
               <span className="mt-4 font-mono font-semibold text-green-10 text-xl">
                  <ProfitArrow
                     profit={"positive"}
                     className="-mb-0.5 mr-0.5"
                  />{" "}
                  {formatCurrency(23200)}{" "}
                  <span className="text-base">(+4%)</span>
               </span>
            </CardTitle>
            <PeriodSelect key="user_profit_period" />
         </div>
         <ChartContainer
            config={
               {
                  profit: {
                     label: "Profit",
                     color: "var(--color-chart-1)",
                  },
               } satisfies ChartConfig
            }
            style={{ minWidth: data.length * 75 }}
            className="mt-4 h-72 w-full [--color-chart-1:var(--color-accent-6)]"
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
                     formatDate(value, { month: "short" })
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
                  content={<ChartTooltipContent hideIndicator />}
                  formatter={(value) => formatCurrency(+value)}
               />
               <Bar
                  dataKey="value"
                  fill="var(--color-profit)"
                  barSize={32}
                  radius={[7, 7, 0, 0]}
               />
            </BarChart>
         </ChartContainer>
      </Card>
   )
}
