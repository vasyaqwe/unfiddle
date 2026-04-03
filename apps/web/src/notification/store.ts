import { atomWithStorage } from "jotai/utils"

export const notificationPermissionStatusAtom =
   atomWithStorage<NotificationPermission>(
      "notification_permission_status",
      "default",
      undefined,
      { getOnInit: true },
   )
