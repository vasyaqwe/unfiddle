import type { RouterOutput } from "@unfiddle/core/trpc/types"

export type OrderAssignee =
   RouterOutput["order"]["list"][number]["assignees"][number]
