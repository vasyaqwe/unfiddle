import type { RouterOutput } from "@unfiddle/core/trpc/types"

export type EstimateItem = NonNullable<
   RouterOutput["estimate"]["one"]
>["items"][number]
