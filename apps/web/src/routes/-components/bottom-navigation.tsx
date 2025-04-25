import { Icons } from "@ledgerblocks/ui/components/icons"
import { Link } from "@tanstack/react-router"

export function BottomNavigation() {
   return (
      <nav className="fixed bottom-0 z-[2] flex h-(--bottom-navigation-height) w-full items-center border-neutral border-t bg-background px-1.5 shadow md:hidden">
         <ul className="flex grow items-center justify-around gap-2">
            <li>
               <Link
                  to={"/"}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-foreground/60 text-xs aria-[current=page]:text-foreground"
               >
                  <Icons.home className="size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.homeSolid className="hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Головна
               </Link>
            </li>
            <li>
               <Link
                  to={"/team"}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-foreground/60 text-xs aria-[current=page]:text-foreground"
               >
                  <Icons.users className="size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Icons.usersSolid className="hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Команда
               </Link>
            </li>
         </ul>
      </nav>
   )
}
