import { useAuth } from "@/auth/hooks"
import { Sidebar } from "@/layout/components/sidebar"
import { WorkspaceMenuPopup } from "@/routes/_authed/$workspaceId/-components/workspace-menu"
import { UserAvatar } from "@/user/components/user-avatar"
import { WorkspaceLogo } from "@/workspace/components/workspace-logo"
import { Button } from "@ledgerblocks/ui/components/button"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@ledgerblocks/ui/components/menu"
import { ScrollArea } from "@ledgerblocks/ui/components/scroll-area"
import { Link, useParams } from "@tanstack/react-router"

export function SidebarContent() {
   const auth = useAuth()
   const params = useParams({ from: "/_authed/$workspaceId" })

   return (
      <Sidebar>
         <div className="px-4 pt-4">
            <Menu>
               <MenuTrigger
                  render={
                     <Button
                        className="!gap-2 justify-start"
                        variant={"ghost"}
                     >
                        <WorkspaceLogo
                           size={18}
                           workspace={auth.workspace}
                        />
                        <span className="line-clamp-1 pb-px">
                           {auth.workspace.name}
                        </span>
                        <Icons.chevronUpDown className="-mr-1 ml-auto size-4 shrink-0 text-foreground/75" />
                     </Button>
                  }
               />
               <WorkspaceMenuPopup />
            </Menu>
         </div>
         <ScrollArea render={<nav className="p-4" />}>
            <ul className="space-y-1">
               <li>
                  <Link
                     to={"/$workspaceId"}
                     params={params}
                     activeOptions={{ exact: true }}
                     className={
                        "group flex h-8 items-center justify-start gap-2 rounded-md border border-transparent px-2 text-base text-foreground/80 leading-none transition-all duration-75 hover:text-foreground aria-[current=page]:border-neutral aria-[current=page]:bg-white aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_-1px_0.5px_rgb(0_0_0_/_0.15)]"
                     }
                  >
                     <Icons.home className="size-5" />
                     <span className="pt-px"> Головна</span>
                  </Link>
               </li>
               <li>
                  <Link
                     to={"/$workspaceId/team"}
                     params={params}
                     className={
                        "group flex h-8 items-center justify-start gap-2 rounded-md border border-transparent px-2 text-base text-foreground/80 leading-none transition-all duration-75 hover:text-foreground aria-[current=page]:border-neutral aria-[current=page]:bg-white aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_-1px_0.5px_rgb(0_0_0_/_0.15)]"
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
                        className="w-full justify-start pl-1.5 [--active-color:var(--color-primary-3)]"
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
                  <MenuItem
                     destructive
                     onClick={() => auth.signout.mutate()}
                  >
                     <Icons.exit /> Вийти з аккаунту
                  </MenuItem>
               </MenuPopup>
            </Menu>
         </div>
      </Sidebar>
   )
}
