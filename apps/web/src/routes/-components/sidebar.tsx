import { useAuth } from "@/auth/hooks"
import { UserAvatar } from "@/user/components/user-avatar"
import { HomeIcon } from "@heroicons/react/24/solid"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@ledgerblocks/ui/components/menu"
import { ScrollArea } from "@ledgerblocks/ui/components/scroll-area"
import { Link } from "@tanstack/react-router"

export function Sidebar() {
   const auth = useAuth()

   return (
      <aside className="z-[10] h-svh w-[15rem] max-md:hidden">
         <div className="fixed flex h-full w-[15rem] flex-col border-neutral border-r bg-primary-2/50 shadow-xs">
            <ScrollArea render={<nav className="p-4" />}>
               <ul className="space-y-1">
                  <li>
                     <Link
                        to={"/"}
                        className={
                           "group flex h-[1.9rem] items-center justify-start gap-2 rounded-md border border-transparent px-2 text-base text-foreground/80 leading-none transition-all duration-100 hover:text-foreground aria-[current=page]:border-primary-3 aria-[current=page]:bg-primary-1 aria-[current=page]:text-foreground aria-[current=page]:shadow-xs"
                        }
                     >
                        <HomeIcon className="size-5" />
                        Головна
                     </Link>
                  </li>
                  <li>
                     <Link
                        to={"/settings"}
                        className={
                           "group flex h-[1.9rem] items-center justify-start gap-2 rounded-md border border-transparent px-2 text-base text-foreground/80 leading-none transition-all duration-100 hover:text-foreground aria-[current=page]:border-primary-3 aria-[current=page]:bg-primary-1 aria-[current=page]:text-foreground aria-[current=page]:shadow-xs"
                        }
                     >
                        <HomeIcon className="size-5" />
                        Налаштування
                     </Link>
                  </li>
               </ul>
            </ScrollArea>
            <div className="mt-auto p-4 pt-1">
               <Menu>
                  <MenuTrigger
                     render={
                        <Button
                           className="w-full justify-start pl-1.5 [--active-color:var(--color-primary-1)]"
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
