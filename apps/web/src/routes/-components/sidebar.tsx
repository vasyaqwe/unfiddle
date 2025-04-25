import { useAuth } from "@/auth/hooks"
import { HomeIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import { button } from "@unfiddle/ui/components/button"
import { ScrollArea } from "@unfiddle/ui/components/scroll-area"
import { cn } from "@unfiddle/ui/utils"

export function Sidebar() {
   const auth = useAuth()

   return (
      <aside className="z-[10] h-svh w-[15rem] max-md:hidden">
         <div className="fixed flex h-full w-[15rem] flex-col border-neutral border-r shadow-xs">
            <ScrollArea render={<nav className="p-4" />}>
               <ul className="space-y-1">
                  <li>
                     <Link
                        to={"/"}
                        className={cn(
                           button({ variant: "ghost" }),
                           "group flex justify-start gap-2 px-2 font-medium text-base text-foreground/70 leading-none hover:text-foreground aria-[current=page]:text-foreground",
                        )}
                     >
                        <HomeIcon className="size-5" />
                        Home
                     </Link>
                  </li>
               </ul>
            </ScrollArea>
            <div className="mt-auto p-4 pt-1">{auth.user.name}</div>
         </div>
      </aside>
   )
}
