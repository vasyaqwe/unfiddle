import { useAuth } from "@/auth/hooks"
import { UserAvatar } from "@/user/components/user-avatar"
import { HomeIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import { Button, button } from "@unfiddle/ui/components/button"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
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
            <div className="mt-auto p-4 pt-1">
               <Menu>
                  <MenuTrigger
                     render={
                        <Button
                           className="w-full justify-start pl-1.5"
                           variant={"ghost"}
                        >
                           <UserAvatar user={auth.user} />
                           <span className="line-clamp-1 pb-px text-sm">
                              {auth.user.email}
                           </span>
                        </Button>
                     }
                  />
                  <MenuPopup className={"!min-w-(--anchor-width)"}>
                     <MenuItem onClick={() => auth.signout.mutate()}>
                        Вийти з аккаунту
                     </MenuItem>
                  </MenuPopup>
               </Menu>
            </div>
         </div>
      </aside>
   )
}
