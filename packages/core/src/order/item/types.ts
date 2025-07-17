import type { RouterOutput } from "@unfiddle/core/trpc/types"

export type OrderItem = RouterOutput["order"]["list"][number]["items"][number]
