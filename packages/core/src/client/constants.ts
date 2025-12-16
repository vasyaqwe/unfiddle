import type { ClientPriority } from "@unfiddle/core/client/types"

export const CLIENT_PRIORITIES = ["low", "high", "critical"] as const

export const CLIENT_PRIORITIES_TRANSLATION: Record<ClientPriority, string> = {
   low: "Звичайно",
   high: "Терміново",
   critical: "Критично",
}
