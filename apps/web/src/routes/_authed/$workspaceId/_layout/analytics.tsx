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
import React from "react"
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
   const search = Route.useSearch()
   const auth = useAuth()
   const summary = useQuery(
      trpc.workspace.summary.queryOptions(
         { id: params.workspaceId },
         { staleTime: CACHE_SHORT },
      ),
   )

   const members = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )

   const selectedMembers = members.data?.filter((member) =>
      search.who.includes(member.user.id),
   )

   const multipleSelected = search.who.length > 1

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
               <>
                  <Card className="max-2xl:order-1">
                     <CardHeader>
                        <CardTitle>Всього замовлень</CardTitle>
                     </CardHeader>
                     <CardContent className="[&>p:first-child]:!pt-0 [&>p:last-child]:!pb-0 divide-y divide-neutral [&>p]:py-3 lg:[&>p]:py-4">
                        {search.who.includes("all") ? (
                           <p className="flex items-center gap-1">
                              <span
                                 className={cx(
                                    "font-mono font-semibold",
                                    multipleSelected
                                       ? "text-[1.15rem]/0 sm:text-xl lg:text-[1.5rem]/6"
                                       : "text-[1.4rem]/7 sm:text-2xl lg:text-[1.7rem]/9",
                                 )}
                              >
                                 {/* TODO: Replace with actual total orders data */}
                                 {formatNumber(200)}
                              </span>
                           </p>
                        ) : (
                           selectedMembers?.map((m) => (
                              <p
                                 key={m.user.id}
                                 className="flex items-center gap-1"
                              >
                                 {/* User name goes first */}
                                 {!multipleSelected ? null : (
                                    <span className="mr-auto line-clamp-1 font-medium text-base text-foreground/75">
                                       {" "}
                                       {/* Added mr-auto */}
                                       {m.user.name}{" "}
                                       {/* Removed leading space */}
                                    </span>
                                 )}
                                 {/* Number goes second */}
                                 <span
                                    className={cx(
                                       "font-mono font-semibold",
                                       multipleSelected
                                          ? "text-[1.15rem]/0 sm:text-xl lg:text-[1.5rem]/6"
                                          : "text-[1.4rem]/7 sm:text-2xl lg:text-[1.7rem]/9",
                                    )}
                                 >
                                    {" "}
                                    {/* TODO: Replace with actual total orders data for member m */}
                                    {formatNumber(200)}
                                 </span>
                              </p>
                           ))
                        )}
                     </CardContent>
                  </Card>
                  <Card className="max-2xl:order-3">
                     <CardHeader>
                        <CardTitle>Успішно</CardTitle>
                     </CardHeader>
                     <CardContent className="[&>p:first-child]:!pt-0 [&>p:last-child]:!pb-0 divide-y divide-neutral [&>p]:py-3 lg:[&>p]:py-4">
                        {search.who.includes("all") ? (
                           <p className="flex items-center gap-1">
                              <span className="font-mono font-semibold text-[1.4rem]/7 sm:text-2xl xl:text-[1.7rem]/9">
                                 {/* TODO: Replace with actual total successful orders data */}
                                 {formatNumber(120)}{" "}
                                 <sup className="-top-1 xl:-top-2 text-base text-red-9">
                                    {/* TODO: Replace with actual total successful orders percentage */}
                                    70%
                                 </sup>
                              </span>
                           </p>
                        ) : (
                           selectedMembers?.map((m) => (
                              <p
                                 key={m.user.id}
                                 className="flex items-center gap-1"
                              >
                                 {/* User name goes first */}
                                 {!multipleSelected ? null : (
                                    <span className="mr-auto line-clamp-1 font-medium text-base text-foreground/75">
                                       {" "}
                                       {/* Added mr-auto */}
                                       {m.user.name}{" "}
                                       {/* Removed leading space */}
                                    </span>
                                 )}
                                 {/* Number goes second */}
                                 <span
                                    className={cx(
                                       "font-mono font-semibold",
                                       multipleSelected
                                          ? "text-[1.15rem]/0 sm:text-xl lg:text-[1.5rem]/6"
                                          : "text-[1.4rem]/7 sm:text-2xl lg:text-[1.7rem]/9",
                                    )}
                                 >
                                    {" "}
                                    {/* TODO: Replace with actual successful orders data for member m */}
                                    {formatNumber(120)}{" "}
                                    {/* Keep superscript percentage for individual members */}
                                    <sup className="-top-1 xl:-top-2 text-base text-red-9 max-sm:hidden">
                                       {/* TODO: Replace with actual successful orders percentage for member m */}
                                       70% {/* Placeholder percentage */}
                                    </sup>
                                 </span>
                                 {/* Percentage per member might not be needed or requires calculation */}
                              </p>
                           ))
                        )}
                     </CardContent>
                  </Card>
                  <Card className="max-2xl:order-4">
                     <CardHeader>
                        <CardTitle>Неуспішно</CardTitle>
                     </CardHeader>
                     <CardContent className="[&>p:first-child]:!pt-0 [&>p:last-child]:!pb-0 divide-y divide-neutral [&>p]:py-3 lg:[&>p]:py-4">
                        {search.who.includes("all") ? (
                           <p className="flex items-center gap-1">
                              <span className="font-mono font-semibold text-[1.4rem]/7 sm:text-2xl xl:text-[1.7rem]/9">
                                 {/* TODO: Replace with actual total failed orders data */}
                                 {formatNumber(40)}{" "}
                                 <sup className="-top-1 xl:-top-2 text-base text-red-9">
                                    {/* TODO: Replace with actual total failed orders percentage */}
                                    30%
                                 </sup>
                              </span>
                           </p>
                        ) : (
                           selectedMembers?.map((m) => (
                              <p
                                 key={m.user.id}
                                 className="flex items-center gap-1"
                              >
                                 {/* User name goes first */}
                                 {!multipleSelected ? null : (
                                    <span className="mr-auto line-clamp-1 font-medium text-base text-foreground/75">
                                       {" "}
                                       {/* Added mr-auto */}
                                       {m.user.name}{" "}
                                       {/* Removed leading space */}
                                    </span>
                                 )}
                                 {/* Number goes second */}
                                 <span
                                    className={cx(
                                       "font-mono font-semibold",
                                       multipleSelected
                                          ? "text-[1.15rem]/0 sm:text-xl lg:text-[1.5rem]/6"
                                          : "text-[1.4rem]/7 sm:text-2xl lg:text-[1.7rem]/9",
                                    )}
                                 >
                                    {" "}
                                    {/* TODO: Replace with actual failed orders data for member m */}
                                    {formatNumber(40)}{" "}
                                    {/* Keep superscript percentage for individual members */}
                                    <sup className="-top-1 xl:-top-2 text-base text-red-9 max-sm:hidden">
                                       {/* TODO: Replace with actual failed orders percentage for member m */}
                                       30% {/* Placeholder percentage */}
                                    </sup>
                                 </span>
                                 {/* Percentage per member might not be needed or requires calculation */}
                              </p>
                           ))
                        )}
                     </CardContent>
                  </Card>
                  <Card className="max-2xl:order-2">
                     <CardHeader>
                        <CardTitle>Маржинальність</CardTitle>
                     </CardHeader>
                     <CardContent className="[&>p:first-child]:!pt-0 [&>p:last-child]:!pb-0 divide-y divide-neutral [&>p]:py-3 lg:[&>p]:py-4">
                        {search.who.includes("all") ? (
                           <p className="flex items-center gap-1">
                              <span
                                 className={cx(
                                    "font-mono font-semibold text-[1.4rem]/7 sm:text-2xl xl:text-[1.7rem]/9",
                                    // TODO: Replace `true` with actual condition based on total margin value
                                    // biome-ignore lint/correctness/noConstantCondition: <explanation>
                                    true ? "text-green-9" : "text-red-9",
                                 )}
                              >
                                 {/* TODO: Replace with actual total margin percentage */}
                                 10%
                              </span>
                           </p>
                        ) : (
                           selectedMembers?.map((m) => (
                              <p
                                 key={m.user.id}
                                 className="flex items-center gap-1"
                              >
                                 {/* User name goes first */}
                                 {!multipleSelected ? null : (
                                    <span className="mr-auto line-clamp-1 font-medium text-base text-foreground/75">
                                       {" "}
                                       {/* Added mr-auto */}
                                       {m.user.name}{" "}
                                       {/* Removed leading space */}
                                    </span>
                                 )}
                                 {/* Number goes second */}
                                 <span
                                    className={cx(
                                       "font-mono font-semibold",
                                       multipleSelected
                                          ? "text-[1.15rem]/0 sm:text-xl lg:text-[1.5rem]/6"
                                          : "text-[1.4rem]/7 sm:text-2xl lg:text-[1.7rem]/9",
                                       // TODO: Replace `true` with actual condition based on member m's margin value
                                       // biome-ignore lint/correctness/noConstantCondition: <explanation>
                                       true ? "text-green-9" : "text-red-9",
                                    )}
                                 >
                                    {" "}
                                    {/* TODO: Replace with actual margin percentage for member m */}
                                    10%
                                 </span>
                              </p>
                           ))
                        )}
                     </CardContent>
                  </Card>
                  <Card className="order-last max-2xl:col-span-2">
                     <CardHeader>
                        <CardTitle>Загальний прибуток</CardTitle>
                     </CardHeader>
                     <CardContent className="[&>p:first-child]:!pt-0 [&>p:last-child]:!pb-0 divide-y divide-neutral [&>p]:py-3 lg:[&>p]:py-4">
                        {search.who.includes("all") ? (
                           <p className="flex items-center gap-1">
                              <span className="font-mono font-semibold text-[1.4rem]/7 sm:text-2xl xl:text-[1.7rem]/9">
                                 {/* TODO: Replace with actual total profit data */}
                                 {formatCurrency(summary.data?.weekProfit ?? 0)}
                              </span>
                           </p>
                        ) : (
                           selectedMembers?.map((m) => (
                              <p
                                 key={m.user.id}
                                 className="flex items-center gap-1"
                              >
                                 {/* User name goes first */}
                                 {!multipleSelected ? null : (
                                    <span className="mr-auto line-clamp-1 font-medium text-base text-foreground/75">
                                       {" "}
                                       {/* Added mr-auto */}
                                       {m.user.name}{" "}
                                       {/* Removed leading space */}
                                    </span>
                                 )}
                                 {/* Number goes second */}
                                 <span
                                    className={cx(
                                       "font-mono font-semibold",
                                       multipleSelected
                                          ? "text-[1.15rem]/0 sm:text-xl lg:text-[1.5rem]/6"
                                          : "text-[1.4rem]/7 sm:text-2xl lg:text-[1.7rem]/9",
                                    )}
                                 >
                                    {" "}
                                    {/* TODO: Replace with actual profit data for member m */}
                                    {formatCurrency(
                                       summary.data?.weekProfit ?? 0,
                                    )}
                                    {/* Placeholder, replace with actual data */}
                                 </span>
                              </p>
                           ))
                        )}
                     </CardContent>
                  </Card>
               </>
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

   const selectedMembers = members.data?.filter((member) =>
      search.who.includes(member.user.id),
   )
   const selectedMember = selectedMembers?.[0]

   return (
      <Combobox
         multiple
         value={search.who}
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
                  ) : search.who.length === 1 && selectedMember ? (
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

const generateFakeProfit = (userId: string, date: Date): number => {
   const baseValue = 1000
   const timeFactor = date.getMonth() + date.getFullYear() * 12

   // Calculate a numeric factor from the non-numeric userId
   let userFactor = 0
   for (let i = 0; i < userId.length; i++) {
      userFactor += userId.charCodeAt(i)
   }
   userFactor = userFactor % 100 // Keep the factor in a reasonable range (0-99)

   const randomFactor = Math.random() * 500

   let profit = baseValue + timeFactor * 50 + userFactor * 10 + randomFactor

   if (date.getMonth() % 3 === 0) {
      profit += 200
   }

   return Math.max(0, Math.round(profit))
}
// Helper function to generate fake *total* data for the "all" case
const generateFakeTotalProfit = (date: Date): number => {
   // Generate a larger aggregated number for the "all" case
   const baseTotalValue = 15000 // Higher base for total
   const timeFactor = date.getMonth() + date.getFullYear() * 12
   const randomFactor = Math.random() * 2000

   let totalProfit = baseTotalValue + timeFactor * 200 + randomFactor

   // Add some overall trend or variation
   if (date.getMonth() % 2 === 0) {
      totalProfit += 1000
   }

   return Math.max(0, Math.round(totalProfit))
}

// Function to generate a default set of monthly dates (e.g., last 2 years)
const generateDefaultDates = (): Date[] => {
   const dates: Date[] = []
   const now = new Date()
   const startDate = new Date(now)
   startDate.setFullYear(now.getFullYear() - 2) // Default to last 2 years
   startDate.setDate(1) // Start at the beginning of the month

   const endDate = new Date(now)
   endDate.setDate(1)

   while (startDate <= endDate) {
      dates.push(new Date(startDate))
      startDate.setMonth(startDate.getMonth() + 1)
   }

   return dates
}

function ProfitChart() {
   const params = Route.useParams()
   const search = Route.useSearch()

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

   // Generate chart data based on selected members or "all"
   const generatedChartData = React.useMemo(() => {
      const isAllSelected =
         !selectedMembers ||
         selectedMembers.length === 0 ||
         search.who.includes("all")

      // Determine which IDs to generate data for
      const idsToGenerate = isAllSelected
         ? ["all"] // Generate for a single "all" ID
         : selectedMembers.map((m) => m.user.id) // Generate for specific member IDs

      const dates = generateDefaultDates() // Use default dates

      const data = dates.map((date) => {
         // @ts-expect-error ...
         const dataPoint: { date: string; [key: string]: number } = {
            // @ts-expect-error ...
            date: date.toISOString().split("T")[0], // Format date as YYYY-MM-DD string
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
   }, [selectedMembers, search.who]) // Dependencies are selectedMembers and search.who

   // Dynamically generate chart config based on the generated data and selected members
   const dynamicConfig = React.useMemo(() => {
      if (!generatedChartData || generatedChartData.length === 0) {
         return {} as ChartConfig
      }

      // Get the keys from the first valid data point (excluding 'date')
      const firstDataPoint = generatedChartData.find(
         (point) => Object.keys(point).length > 1,
      )

      if (!firstDataPoint) {
         return {} as ChartConfig
      }

      const dataKeys = Object.keys(firstDataPoint).filter(
         (key) => key !== "date",
      )

      // Create a map from member ID to member name for labels
      const memberNameMap = new Map<string, string>()
      // biome-ignore lint/complexity/noForEach: <explanation>
      selectedMembers?.forEach((m) => memberNameMap.set(m.user.id, m.user.name))

      const config = Object.fromEntries(
         dataKeys.map((id, idx) => [
            id,
            {
               // Use "Всі користувачі" for the "all" key, otherwise member name or fallback
               label:
                  id === "all"
                     ? "Всі користувачі"
                     : memberNameMap.get(id) || `User ${id}`,
               color: COLORS[idx], // Use modulo to loop through colors
            },
         ]),
      ) satisfies ChartConfig

      return config
   }, [generatedChartData, selectedMembers])

   const zoom = useChartZoom({ initialData: generatedChartData })

   // Determine which keys to display lines for based on dynamicConfig
   const lineKeysToDisplay = Object.keys(dynamicConfig)

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
         {/* Optional: Commented out section from original */}
         {/* <CardTitle>
               <span className="mt-4 whitespace-nowrap font-mono font-semibold text-green-10 text-xl">
                   <ProfitArrow
                       profit={"positive"}
                       className="-mb-0.5 mr-0.5"
                   />{" "}
                   {formatCurrency(23200)} <span className="text-base">(+4%)</span>
               </span>
           </CardTitle> */}

         {/* Conditional rendering for no data state */}
         {lineKeysToDisplay.length === 0 || generatedChartData.length === 0 ? (
            <div className="flex h-60 w-full items-center justify-center text-muted-foreground md:h-72 xl:h-96">
               Немає даних для відображення
            </div>
         ) : (
            <ChartContainer
               config={dynamicConfig} // Use dynamic config
               className={cx(
                  "mt-5 h-60 w-full md:h-72 xl:h-96",
                  // Adjust color logic based on the number of lines or a specific condition
                  // This class seems to control the default --color-chart-1 variable
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
                        data={zoom.zoomedData()} // Use zoomed data derived from generatedChartData
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
                           // Simplified tickFormatter for monthly data
                           tickFormatter={(value) =>
                              formatDate(value, {
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
                                 valueFormatter={(value) =>
                                    formatCurrency(+value)
                                 }
                              />
                           }
                           cursor={
                              <ChartCursor fill={"var(--color-chart-1)"} />
                           }
                        />
                        {/* Map over the keys from the dynamic config to render lines */}
                        {lineKeysToDisplay.map((key) => (
                           <Line
                              key={key}
                              dataKey={key}
                              type="linear"
                              stroke={
                                 (
                                    dynamicConfig[
                                       key as keyof typeof dynamicConfig
                                    ] as { color: string }
                                 ).color
                              }
                              strokeWidth={2}
                              dot={false}
                           />
                        ))}
                        {/* Reference area for zoom selection */}
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
