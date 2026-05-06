import type { RouterOutput } from "@unfiddle/core/trpc/types"

export type OrderItemAssignee = NonNullable<
   RouterOutput["order"]["one"]
>["items"][number]["assignees"][number]
