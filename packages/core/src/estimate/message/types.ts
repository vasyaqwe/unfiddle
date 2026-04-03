import type { RouterOutput } from "@unfiddle/core/trpc/types"

export type EstimateMessage =
   RouterOutput["estimate"]["message"]["list"][number]
