import {
   Cancel01Icon,
   Delete02Icon,
   Download01Icon,
   MoreHorizontalIcon,
   PencilEdit01Icon,
   PlusSignIcon,
   Tick02Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export const Icons = {
   check: Tick02Icon,
   download: Download01Icon,
   ellipsisHorizontal: MoreHorizontalIcon,
   pencil: PencilEdit01Icon,
   plus: PlusSignIcon,
   trash: Delete02Icon,
   xMark: Cancel01Icon,
} satisfies Record<string, IconSvgElement>
