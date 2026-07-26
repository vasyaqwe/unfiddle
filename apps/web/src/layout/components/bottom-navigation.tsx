import {
   ChartIcon,
   Home04Icon,
   Settings02Icon,
   UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link, useParams, useSearch } from "@tanstack/react-router"

export function BottomNavigation() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout" })
   const search = useSearch({ strict: false })

   return (
      <nav className="fixed bottom-0 z-2 flex h-(--bottom-navigation-height) w-full items-center border-neutral border-t bg-background px-1.5 shadow-xs md:hidden">
         <ul className="flex grow items-center justify-around gap-2">
            <li>
               <Link
                  to={"/$workspaceId"}
                  params={params}
                  search={search}
                  activeOptions={{ exact: true, includeSearch: false }}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-snug aria-[current=page]:text-foreground"
               >
                  <HugeiconsIcon
                     icon={Home04Icon}
                     className="size-5 shrink-0"
                  />
                  Головна
               </Link>
            </li>
            <li>
               <Link
                  to={"/$workspaceId/analytics"}
                  params={params}
                  search={search}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-snug aria-[current=page]:text-foreground"
               >
                  <HugeiconsIcon
                     icon={ChartIcon}
                     className="mb-0.5 size-5 shrink-0"
                  />
                  Аналітика
               </Link>
            </li>
            <li>
               <Link
                  to={"/$workspaceId/team"}
                  params={params}
                  search={search}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-snug aria-[current=page]:text-foreground"
               >
                  <HugeiconsIcon
                     icon={UserMultipleIcon}
                     className="size-5 shrink-0"
                  />
                  Команда
               </Link>
            </li>
            <li>
               <Link
                  to={"/$workspaceId/settings"}
                  params={params}
                  search={search}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-snug aria-[current=page]:text-foreground"
               >
                  <HugeiconsIcon
                     icon={Settings02Icon}
                     className="size-5 shrink-0"
                  />
                  Налаштув.
               </Link>
            </li>
         </ul>
      </nav>
   )
}
