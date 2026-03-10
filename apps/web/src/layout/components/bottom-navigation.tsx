import { Link, useParams, useSearch } from "@tanstack/react-router"
import { Icons } from "@unfiddle/ui/components/icons"

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
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-tight aria-[current=page]:text-foreground"
               >
                  <Icons.home className=" size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.homeSolid className=" hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Головна
               </Link>
            </li>
            <li>
               <Link
                  to={"/$workspaceId/analytics"}
                  params={params}
                  search={search}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-tight aria-[current=page]:text-foreground"
               >
                  <Icons.barChart className="mb-0.5 size-5.5 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.barChartSolid className="mb-0.5 hidden size-5.5 shrink-0 group-aria-[current=page]:block" />
                  Аналітика
               </Link>
            </li>
            <li>
               <Link
                  to={"/$workspaceId/team"}
                  params={params}
                  search={search}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-[0.7825rem] text-foreground/60 leading-tight aria-[current=page]:text-foreground"
               >
                  <Icons.users className=" size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.usersSolid className=" hidden size-6 shrink-0 group-aria-[current=page]:block" />
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
                  <Icons.gear className=" size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.gearSolid className=" hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Налаштув.
               </Link>
            </li>
         </ul>
      </nav>
   )
}
