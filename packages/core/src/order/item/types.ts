import type { RouterOutput } from "@unfiddle/core/trpc/types"

export type OrderItem = NonNullable<
   RouterOutput["order"]["one"]
>["items"][number]
