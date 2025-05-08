import { Icons } from "@ledgerblocks/ui/components/icons"
import { Link, useParams, useSearch } from "@tanstack/react-router"

export function BottomNavigation() {
   const params = useParams({ from: "/_authed/$workspaceId" })
   const search = useSearch({ strict: false })

   return (
      <nav className="fixed bottom-0 z-[2] flex h-(--bottom-navigation-height) w-full items-center border-neutral border-t bg-background px-1.5 shadow-xs md:hidden">
         <ul className="flex grow items-center justify-around gap-2">
            <li>
               <Link
                  to={"/$workspaceId"}
                  params={params}
                  search={search}
                  activeOptions={{ exact: true, includeSearch: false }}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-tight aria-[current=page]:text-foreground"
               >
                  <Icons.home className="mb-px size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.homeSolid className="mb-px hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Головна
               </Link>
            </li>
            <li>
               <Link
                  to={"/$workspaceId/team"}
                  params={params}
                  search={search}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-tight aria-[current=page]:text-foreground"
               >
                  <Icons.users className="mb-px size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.usersSolid className="mb-px hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Команда
               </Link>
            </li>
            <li>
               <Link
                  to={"/$workspaceId/settings"}
                  params={params}
                  search={search}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-tight aria-[current=page]:text-foreground"
               >
                  <Icons.gear className="mb-px size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.gearSolid className="mb-px hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Налаштув.
               </Link>
            </li>
         </ul>
      </nav>
   )
}
