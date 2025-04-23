import { HomeIcon } from "@heroicons/react/24/outline"
import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import { HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid"
import { Cog6ToothIcon as Cog6ToothIconSolid } from "@heroicons/react/24/solid"
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
                  <HomeIcon className="size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <HomeIconSolid className="hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Home
               </Link>
            </li>
            <li>
               <Link
                  to={"/settings"}
                  className="group relative inline-flex h-10 flex-col items-center justify-center rounded-md font-semibold text-foreground/60 text-xs aria-[current=page]:text-foreground"
               >
                  <Cog6ToothIcon className="size-6 shrink-0 group-aria-[current=page]:hidden" />
                  <Cog6ToothIconSolid className="hidden size-6 shrink-0 group-aria-[current=page]:block" />
                  Settings
               </Link>
            </li>
         </ul>
      </nav>
   )
}
