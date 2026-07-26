import {
   Cancel01Icon,
   Delete02Icon,
   Download04Icon,
   MoreHorizontalIcon,
   PencilEdit02Icon,
   PlusSignIcon,
   Tick02Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

/**
 * Named aliases for the handful of hugeicons used all over the app. Everything
 * else is imported from `@hugeicons/core-free-icons` directly at the call site.
 *
 * Render with `<HugeiconsIcon icon={Icons.trash} className="size-5" />`.
 */
export const Icons = {
   check: Tick02Icon,
   download: Download04Icon,
   ellipsisHorizontal: MoreHorizontalIcon,
   pencil: PencilEdit02Icon,
   plus: PlusSignIcon,
   trash: Delete02Icon,
   xMark: Cancel01Icon,
} satisfies Record<string, IconSvgElement>
