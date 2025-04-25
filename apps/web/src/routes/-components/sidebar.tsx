import { useAuth } from "@/auth/hooks"
import { Sidebar } from "@/layout/components/sidebar"
import { UserAvatar } from "@/user/components/user-avatar"
import { Button } from "@ledgerblocks/ui/components/button"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@ledgerblocks/ui/components/menu"
import { ScrollArea } from "@ledgerblocks/ui/components/scroll-area"
import { Link } from "@tanstack/react-router"

export function SidebarContent() {
   const auth = useAuth()

   return (
      <Sidebar>
         <ScrollArea render={<nav className="p-4" />}>
            <ul className="space-y-1">
               <li>
                  <Link
                     to={"/"}
                     className={
                        "group flex h-[1.9rem] items-center justify-start gap-2 rounded-md border border-transparent px-2 text-base text-foreground/80 leading-none transition-all duration-100 hover:text-foreground aria-[current=page]:border-primary-2 aria-[current=page]:bg-white aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_-1px_0_rgb(0_0_0_/_0.15)]"
                     }
                  >
                     <Icons.home className="size-5" />
                     <span className="pt-px"> Головна</span>
                  </Link>
               </li>
               <li>
                  <Link
                     to={"/team"}
                     className={
                        "group flex h-[1.9rem] items-center justify-start gap-2 rounded-md border border-transparent px-2 text-base text-foreground/80 leading-none transition-all duration-100 hover:text-foreground aria-[current=page]:border-primary-2 aria-[current=page]:bg-white aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_-1px_0_rgb(0_0_0_/_0.15)]"
                     }
                  >
                     <Icons.users className="size-5" />
                     <span className="pt-px"> Команда</span>
                  </Link>
               </li>
            </ul>
         </ScrollArea>
         <div className="mt-auto p-4 pt-1">
            <Menu>
               <MenuTrigger
                  render={
                     <Button
                        className="w-full justify-start pl-1.5 [--active-color:var(--color-primary-2)]"
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
      </Sidebar>
   )
}
