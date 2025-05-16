import { CACHE_SHORT } from "@/api"
import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { MainScrollArea } from "@/layout/components/main"
import { formatOrderDate } from "@/order/utils"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
   HeaderUserMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { validator } from "@/validator"
import { OrdersChart } from "@/workspace/analytics/components/orders-chart"
import { PeriodSelect } from "@/workspace/analytics/components/period-select"
import { ProfitChart } from "@/workspace/analytics/components/profit-chart"
import { QuickStats } from "@/workspace/analytics/components/quick-stats"
import {} from "@/workspace/analytics/components/stat"
import { WhoCombobox } from "@/workspace/analytics/components/who-combobox"
import {
   PERIOD_COMPARISON_FILTERS,
   PERIOD_COMPARISON_FILTERS_TRANSLATION,
   workspaceAnalyticsFilterSchema,
} from "@ledgerblocks/core/workspace/analytics/filter"
import { Button } from "@ledgerblocks/ui/components/button"
import { Card, CardTitle } from "@ledgerblocks/ui/components/card"
import {
   type ChartConfig,
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@ledgerblocks/ui/components/chart"
import {
   Combobox,
   ComboboxEmpty,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
   ComboboxTriggerIcon,
} from "@ledgerblocks/ui/components/combobox"
import {} from "@ledgerblocks/ui/components/popover"
import {
   SegmentedProgress,
   SegmentedProgressBars,
   SegmentedProgressLabel,
   SegmentedProgressValue,
} from "@ledgerblocks/ui/components/segmented-progress"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/analytics")(
   {
      component: RouteComponent,
      beforeLoad: (opts) => {
         if (
            opts.context.workspace.role !== "admin" &&
            !opts.search.who.includes(opts.context.user.id)
         )
            throw redirect({ to: ".", search: { who: [opts.context.user.id] } })
      },
      loaderDeps: (opts) => ({ search: opts.search }),
      loader: async ({ context, params, deps }) => {
         context.queryClient.prefetchQuery(
            trpc.workspace.member.list.queryOptions({
               workspaceId: params.workspaceId,
            }),
         )
         context.queryClient.prefetchQuery(
            trpc.workspace.analytics.stats.queryOptions(
               {
                  id: params.workspaceId,
                  ...deps.search,
               },
               {
                  staleTime: CACHE_SHORT,
               },
            ),
         )
         context.queryClient.prefetchQuery(
            trpc.workspace.analytics.profit.queryOptions(
               {
                  id: params.workspaceId,
                  ...deps.search,
               },
               {
                  staleTime: CACHE_SHORT,
               },
            ),
         )
         context.queryClient.prefetchQuery(
            trpc.workspace.analytics.orders.queryOptions(
               {
                  id: params.workspaceId,
                  ...deps.search,
               },
               {
                  staleTime: CACHE_SHORT,
               },
            ),
         )
      },
      validateSearch: validator(
         workspaceAnalyticsFilterSchema.extend({
            who: workspaceAnalyticsFilterSchema.shape.who.catch(["all"]),
            period:
               workspaceAnalyticsFilterSchema.shape.period.catch("last_week"),
            period_comparison:
               workspaceAnalyticsFilterSchema.shape.period_comparison.catch([]),
         }),
      ),
   },
)

function RouteComponent() {
   const search = Route.useSearch()
   const navigate = useNavigate()
   const auth = useAuth()

   return (
      <>
         <Header>
            <HeaderBackButton />
            <HeaderTitle>
               {auth.workspace.role === "admin"
                  ? "Аналітика"
                  : "Ваша аналітика"}
            </HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea containerClassName="space-y-6 md:space-y-10 lg:space-y-12">
            <header
               className={
                  "flex w-full items-center md:mb-7 md:justify-between lg:mb-8"
               }
            >
               <p className="font-semibold text-xl max-md:hidden">
                  {auth.workspace.role === "admin"
                     ? "Аналітика"
                     : "Ваша аналітика"}
               </p>
               <div className="flex grid-cols-2 items-center gap-2 max-md:grid max-md:w-full">
                  {auth.workspace.role === "admin" ? (
                     <Combobox
                        multiple
                        canBeEmpty
                        value={search.period_comparison}
                        onValueChange={(period_comparison) => {
                           navigate({
                              to: ".",
                              search: (prev) => ({
                                 ...prev,
                                 period_comparison,
                                 replace: true,
                              }),
                           })
                        }}
                     >
                        <ComboboxTrigger
                           render={
                              <Button
                                 className="min-w-[170px]"
                                 variant={"secondary"}
                              >
                                 {search.period_comparison.length === 0
                                    ? "Порівняти місяці.."
                                    : `${search.period_comparison.length} ${search.period_comparison.length === 1 ? "місяць" : "місяці"} обрано`}
                                 <ComboboxTriggerIcon />
                              </Button>
                           }
                        />
                        <ComboboxPopup align="end">
                           <ComboboxInput placeholder="Шукати.." />
                           <ComboboxEmpty>Нічого не знайдено</ComboboxEmpty>
                           {PERIOD_COMPARISON_FILTERS.map((item) => (
                              <ComboboxItem
                                 key={item}
                                 value={item}
                                 keywords={[
                                    PERIOD_COMPARISON_FILTERS_TRANSLATION[item],
                                 ]}
                              >
                                 {PERIOD_COMPARISON_FILTERS_TRANSLATION[item]}
                              </ComboboxItem>
                           ))}
                        </ComboboxPopup>
                     </Combobox>
                  ) : null}
                  {auth.workspace.role === "admin" ? <WhoCombobox /> : null}
                  <PeriodSelect searchKey={"period"} />
               </div>
            </header>
            <QuickStats />
            <ProfitChart />
            <OrdersChart />
         </MainScrollArea>
      </>
   )
}

function _StatsChart() {
   const _search = Route.useSearch()

   return (
      <Card className="">
         <SegmentedProgress value={50}>
            <SegmentedProgressLabel>Успішність</SegmentedProgressLabel>
            <SegmentedProgressBars />
            <SegmentedProgressValue />
         </SegmentedProgress>
      </Card>
   )
}

function _ProfitComparisonChart({
   title,
}: {
   title: string
}) {
   const data = [
      { date: "Ivan", value: 15400 },
      { date: "Oksana", value: 12100 },
      { date: "Dmytro", value: 9800 },
      { date: "Kateryna", value: 8700 },
      { date: "Ivan", value: 15400 },
      { date: "Oksana", value: 12100 },
      { date: "Dmytro", value: 9800 },
      { date: "Kateryna", value: 8700 },
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
            className="mt-5 h-60 w-full [--color-chart-1:var(--color-accent-6)] md:h-72 xl:h-96"
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
                  labelFormatter={(value) => formatOrderDate(value)}
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
                     dataKey="date"
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
