import type { RouterOutput } from "@unfiddle/core/trpc/types"

export type OrderMessage = RouterOutput["order"]["message"]["list"][number]
