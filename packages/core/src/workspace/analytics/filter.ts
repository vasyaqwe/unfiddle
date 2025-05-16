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

export const PERIOD_FILTERS_FNS: Record<
   (typeof PERIOD_FILTERS)[number],
   Record<string, Date>
> = {
   last_week: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
   },
   last_month: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
   },
   last_quarter: {
      gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
   },
   last_half_year: {
      gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
   },
   last_year: {
      gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
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

export const PERIOD_COMPARISON_FILTERS_TRANSLATION: Record<
   (typeof PERIOD_COMPARISON_FILTERS)[number],
   string
> = {
   "2025-01": "Січень",
   "2025-02": "Лютий",
   "2025-03": "Березень",
   "2025-04": "Квітень",
   "2025-05": "Травень",
   "2025-06": "Червень",
   "2025-07": "Липень",
   "2025-08": "Серпень",
   "2025-09": "Вересень",
   "2025-10": "Жовтень",
   "2025-11": "Листопад",
   "2025-12": "Грудень",
} as const

export const workspaceAnalyticsFilterSchema = z.object({
   who: z.array(z.string()).default(["all"]),
   period: z.enum(PERIOD_FILTERS).default("last_week"),
   period_comparison: z.array(z.enum(PERIOD_COMPARISON_FILTERS)).default([]),
})
