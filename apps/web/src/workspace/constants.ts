import type { WorkspaceRole } from "@unfiddle/core/workspace/types"

export const WORKSPACE_ROLES_TRANSLATION: Record<WorkspaceRole, string> = {
   owner: "Власник",
   admin: "Адмін",
   manager: "Менеджер",
   buyer: "Закупівельник",
}
