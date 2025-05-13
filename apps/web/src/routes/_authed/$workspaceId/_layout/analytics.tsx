import { CACHE_SHORT } from "@/api"
import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { formatDate } from "@/date"
import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
import { formatOrderDate } from "@/order/utils"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
   HeaderUserMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import {
   PERIOD_FILTERS,
   PERIOD_FILTERS_TRANSLATION,
   workspaceAnalyticsFilterSchema,
} from "@ledgerblocks/core/workspace/analytics/filter"
import {
   AvatarStack,
   AvatarStackItem,
} from "@ledgerblocks/ui/components/avatar-stack"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@ledgerblocks/ui/components/card"
import {
   type ChartConfig,
   ChartContainer,
   ChartCursor,
   ChartTooltip,
   ChartTooltipContent,
} from "@ledgerblocks/ui/components/chart"
import { useChartZoom } from "@ledgerblocks/ui/components/chart/use-chart-zoom"
import {
   Combobox,
   ComboboxEmpty,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
   ComboboxTriggerIcon,
} from "@ledgerblocks/ui/components/combobox"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   SegmentedProgress,
   SegmentedProgressBars,
   SegmentedProgressLabel,
   SegmentedProgressValue,
} from "@ledgerblocks/ui/components/segmented-progress"
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
import {
   Bar,
   BarChart,
   CartesianGrid,
   LabelList,
   Line,
   LineChart,
   ReferenceArea,
   ResponsiveContainer,
   XAxis,
   YAxis,
} from "recharts"
import type { z } from "zod"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/analytics")(
   {
      component: RouteComponent,
      loader: async ({ context, params }) => {
         context.queryClient.prefetchQuery(
            trpc.workspace.member.list.queryOptions({
               workspaceId: params.workspaceId,
            }),
         )
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

const COLORS: Record<number, string> = {
   0: "var(--color-accent-6)",
   1: "#22c55e",
   2: "#C084FC",
   3: "#F87171",
} as const

function RouteComponent() {
   const params = Route.useParams()
   const auth = useAuth()
   const summary = useQuery(
      trpc.workspace.summary.queryOptions(
         { id: params.workspaceId },
         { staleTime: CACHE_SHORT },
      ),
   )

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
            <section
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
                  <PeriodSelect searchKey={"period"} />
                  {auth.workspace.role === "admin" ? <WhoCombobox /> : null}
               </div>
            </section>
            <section className="grid grid-cols-2 gap-3 md:gap-4 xl:gap-6 2xl:grid-cols-5">
               <Card className="max-2xl:order-1">
                  <CardHeader>
                     <CardTitle>Всього замовлень</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-[1.35rem]/7 sm:text-2xl xl:text-[1.7rem]/9">
                        {formatNumber(200)}
                     </p>
                  </CardContent>
               </Card>
               <Card className="max-2xl:order-3">
                  <CardHeader>
                     <CardTitle>Успішно</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-[1.35rem]/7 sm:text-2xl xl:text-[1.7rem]/9">
                        {formatNumber(120)}{" "}
                        <sup className="-top-1 xl:-top-2 text-base text-red-9">
                           70%
                        </sup>
                     </p>
                  </CardContent>
               </Card>
               <Card className="max-2xl:order-4">
                  <CardHeader>
                     <CardTitle>Неуспішно</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-[1.35rem]/7 sm:text-2xl xl:text-[1.7rem]/9">
                        {formatNumber(40)}{" "}
                        <sup className="-top-1 xl:-top-2 text-base text-red-9">
                           30%
                        </sup>
                     </p>
                  </CardContent>
               </Card>
               <Card className="max-2xl:order-2">
                  <CardHeader>
                     <CardTitle>Маржинальність</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p
                        className={cx(
                           "font-mono font-semibold text-[1.35rem]/7 sm:text-2xl xl:text-[1.7rem]/9",
                           // biome-ignore lint/correctness/noConstantCondition: <explanation>
                           true ? "text-green-9" : "text-red-9",
                        )}
                     >
                        10%
                     </p>
                  </CardContent>
               </Card>
               <Card className="order-last max-2xl:col-span-2">
                  <CardHeader>
                     <CardTitle>Загальний прибуток</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-[1.35rem]/7 sm:text-2xl xl:text-[1.7rem]/9">
                        {formatCurrency(summary.data?.weekProfit ?? 0)}
                     </p>
                  </CardContent>
               </Card>
            </section>
            {/* <div className="mt-4 grid gap-6 md:mt-6 md:grid-cols-2">
                  <StatsChart />
               </div> */}
            <section>
               <ProfitChart />
            </section>
            <section>
               <p className="mb-2 font-semibold text-xl">Динаміка замовлень</p>
               <OrdersChart />
            </section>
         </MainScrollArea>
      </>
   )
}

function PeriodSelect({
   searchKey,
}: { searchKey: keyof z.infer<typeof workspaceAnalyticsFilterSchema> }) {
   const search = Route.useSearch()
   const navigate = useNavigate()

   return (
      <Select
         value={search[searchKey]}
         onValueChange={(value) =>
            navigate({
               to: ".",
               search: (prev) => ({ ...prev, [searchKey]: value }),
               replace: true,
            })
         }
      >
         <SelectTrigger
            render={
               <Button
                  variant={"secondary"}
                  className={"min-w-32"}
               >
                  <SelectValue />
                  <SelectTriggerIcon />
               </Button>
            }
         />
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

function WhoCombobox() {
   const params = Route.useParams()
   const search = Route.useSearch()
   const navigate = useNavigate()
   const members = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )

   const userIds = search.who

   const selectedMembers = members.data?.filter((member) =>
      userIds.includes(member.user.id),
   )
   const selectedMember = selectedMembers?.[0]

   return (
      <Combobox
         multiple
         value={userIds}
         onValueChange={(value) =>
            navigate({
               to: ".",
               search: (prev) => ({
                  ...prev,
                  who: value,
                  replace: true,
               }),
            })
         }
      >
         <ComboboxTrigger
            render={
               <Button
                  variant={"secondary"}
                  className={"md:!gap-1.5 min-w-40"}
               >
                  {search.who.includes("all") ? (
                     <>Загальна</>
                  ) : userIds.length === 1 && selectedMember ? (
                     <>
                        <UserAvatar
                           size={16}
                           user={selectedMember.user}
                        />
                        <span className="line-clamp-1">
                           {selectedMember.user.name}
                        </span>
                     </>
                  ) : (
                     <AvatarStack size={18}>
                        {selectedMembers?.map((m) => (
                           <AvatarStackItem key={m.user.id}>
                              <UserAvatar
                                 size={18}
                                 user={m.user}
                              />
                           </AvatarStackItem>
                        ))}
                     </AvatarStack>
                  )}
                  <ComboboxTriggerIcon />
               </Button>
            }
         />
         <ComboboxPopup align="end">
            <ComboboxInput placeholder="Шукати.." />
            <ComboboxEmpty>Нікого не знайдено</ComboboxEmpty>
            <ComboboxItem value="all">
               <Icons.users />
               Загальна
            </ComboboxItem>
            {members.data?.map((member) => (
               <ComboboxItem
                  key={member.user.id}
                  value={member.user.id}
               >
                  <UserAvatar
                     size={18}
                     className="mr-[3px] ml-[2px] md:mr-[2px] md:ml-px"
                     user={member.user}
                  />
                  <span className="line-clamp-1">{member.user.name}</span>
               </ComboboxItem>
            ))}
         </ComboboxPopup>
      </Combobox>
   )
}

function ProfitChart() {
   const search = Route.useSearch()
   const period = search.period

   const data = [
      { date: "2024-03-01", "123": 5500, "321": 3000, "322": 4000 },
      { date: "2024-04-01", "123": 5400, "321": 3100, "322": 4100 },
      { date: "2024-05-01", "123": 5300, "321": 3050, "322": 4200 },
      { date: "2024-06-01", "123": 5350, "321": 3120, "322": 4300 },
      { date: "2024-07-01", "123": 5250, "321": 3180, "322": 4350 },
      { date: "2024-08-01", "123": 5320, "321": 3200, "322": 4400 },
      { date: "2024-09-01", "123": 5380, "321": 3250, "322": 4450 },
      { date: "2024-10-01", "123": 5300, "321": 3300, "322": 4500 },
      { date: "2024-11-01", "123": 5450, "321": 3350, "322": 4550 },
      { date: "2024-12-01", "123": 5400, "321": 3400, "322": 4600 },
      { date: "2025-01-01", "123": 5550, "321": 3450, "322": 4700 },
      { date: "2025-02-01", "123": 5600, "321": 3500, "322": 4750 },
      { date: "2025-03-01", "123": 5650, "321": 3550, "322": 4800 },
      { date: "2025-04-01", "123": 5700, "321": 3600, "322": 4850 },
      { date: "2025-05-01", "123": 5750, "321": 3650, "322": 4900 },
      { date: "2025-06-01", "123": 5800, "321": 3700, "322": 4950 },
      { date: "2025-07-01", "123": 5850, "321": 3750, "322": 5000 },
      { date: "2025-08-01", "123": 5900, "321": 3800, "322": 5050 },
      { date: "2025-09-01", "123": 5950, "321": 3850, "322": 5100 },
      { date: "2025-10-01", "123": 6000, "321": 3900, "322": 5150 },
   ]
   const firstDataPoint = data[0]

   const userIds = firstDataPoint
      ? Object.keys(firstDataPoint).filter((key) => key !== "date")
      : []

   const config = Object.fromEntries(
      userIds.map((id, idx) => [
         id,
         {
            label: `User ${id}`,
            color: COLORS[idx],
         },
      ]),
   ) satisfies ChartConfig

   const zoom = useChartZoom({ initialData: data })

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
         {/* <CardTitle>
            <span className="mt-4 whitespace-nowrap font-mono font-semibold text-green-10 text-xl">
               <ProfitArrow
                  profit={"positive"}
                  className="-mb-0.5 mr-0.5"
               />{" "}
               {formatCurrency(23200)} <span className="text-base">(+4%)</span>
            </span>
         </CardTitle> */}
         <ChartContainer
            config={config}
            className={cx(
               "mt-5 h-60 w-full md:h-72 xl:h-96",
               userIds.length === 1
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
                                 period === "last_week" ||
                                 period === "last_month"
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
                     {Object.entries(config).map(([key, value]) => (
                        <Line
                           key={key}
                           dataKey={key}
                           type="linear"
                           stroke={value.color}
                           strokeWidth={2}
                           dot={false}
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

function OrdersChart() {
   const search = Route.useSearch()

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
