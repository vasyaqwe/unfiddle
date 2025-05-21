import { z } from "zod"

export const PERIOD_FILTERS = [
   "last_week",
   "last_month",
   "last_quarter",
   "last_half_year",
   "last_year",
   "all_time",
] as const

export const PERIOD_FILTERS_TRANSLATION: Record<
   (typeof PERIOD_FILTERS)[number],
   string
> = {
   last_week: "За тиждень",
   last_month: "За місяць",
   last_quarter: "За квартал",
   last_half_year: "За пів року",
   last_year: "За рік",
   all_time: "Увесь час",
}

const getStartOfDay = (days: number): Date => {
   const d = new Date()
   d.setHours(0, 0, 0, 0)
   d.setDate(d.getDate() - days)
   return d
}

export const PERIOD_FILTERS_FNS: Record<
   (typeof PERIOD_FILTERS)[number],
   Record<string, Date>
> = {
   last_week: {
      gte: getStartOfDay(7),
   },
   last_month: {
      gte: getStartOfDay(30),
   },
   last_quarter: {
      gte: getStartOfDay(90),
   },
   last_half_year: {
      gte: getStartOfDay(180),
   },
   last_year: {
      gte: getStartOfDay(365),
   },
   all_time: {},
} as const

export const PERIOD_COMPARISON_FILTERS = [
   "2025-01",
   "2025-02",
   "2025-03",
   "2025-04",
   "2025-05",
   "2025-06",
   "2025-07",
   "2025-08",
   "2025-09",
   "2025-10",
   "2025-11",
   "2025-12",
] as const

export const workspaceAnalyticsFilterSchema = z.object({
   who: z.array(z.string()).default(["all"]),
   period: z.enum(PERIOD_FILTERS).default("last_week"),
   period_comparison: z.array(z.enum(PERIOD_COMPARISON_FILTERS)).default([]),
})
