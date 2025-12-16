import type { ClientSeverity } from "@unfiddle/core/client/types"

export const CLIENT_SEVERITIES = ["low", "high", "critical"] as const

export const CLIENT_SEVERITIES_TRANSLATION: Record<ClientSeverity, string> = {
   low: "Звичайно",
   high: "Терміново",
   critical: "Критично",
}
