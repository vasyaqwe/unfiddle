import { useAuth } from "@/auth/hooks"
import { CreateOrder } from "@/order/components/create-order"
import { UserAvatar } from "@/user/components/user-avatar"
import { WorkspaceLogo } from "@/workspace/components/workspace-logo"
import { WorkspaceMenuPopup } from "@/workspace/components/workspace-menu"
import { Link, useParams, useSearch } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { button } from "@unfiddle/ui/components/button/constants"
import { DrawerTrigger } from "@unfiddle/ui/components/drawer"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import { ScrollArea } from "@unfiddle/ui/components/scroll-area"
import { cn } from "@unfiddle/ui/utils"
import { cx } from "@unfiddle/ui/utils"

export function Sidebar({
   children,
   className,
   ...props
}: React.ComponentProps<"aside">) {
   return (
      <aside
         className={cn(
            "z-[10] h-svh w-[14rem] shrink-0 max-md:hidden lg:w-[14.5rem] 2xl:w-[15.5rem]",
            className,
         )}
         {...props}
      >
         <div className="fixed flex h-full w-[14rem] flex-col lg:w-[14.5rem] 2xl:w-[15.5rem]">
            {children}
         </div>
      </aside>
   )
}

export function SidebarContent() {
   const auth = useAuth()
   const params = useParams({ from: "/_authed/$workspaceId" })
   const search = useSearch({ strict: false })

   return (
      <Sidebar>
         <div className="px-4 pt-4">
            <div className="flex items-center justify-between gap-3">
               <Menu>
                  <MenuTrigger
                     render={
                        <Button
                           className={cx(
                              "!gap-1.5 justify-start",
                              auth.workspace.image ? "md:pl-0.5" : "md:pl-1",
                           )}
                           variant={"ghost"}
                           size={"lg"}
                        >
                           <WorkspaceLogo
                              size={auth.workspace.image ? 30 : 24}
                              workspace={auth.workspace}
                           />
                           <span className="line-clamp-1 py-px">
                              {auth.workspace.name}
                           </span>
                           <Icons.chevronUpDown className="-mr-2 ml-auto size-4 shrink-0 text-muted" />
                        </Button>
                     }
                  />
                  <WorkspaceMenuPopup />
               </Menu>
               <Link
                  to={"/$workspaceId/settings"}
                  params={params}
                  search={search}
                  className={cx(
                     button({ kind: "icon", variant: "ghost" }),
                     "text-muted hover:text-foreground/90 aria-[current=page]:text-foreground/90",
                  )}
               >
                  <Icons.gear className="size-5" />
               </Link>
               {/* <Link
                  to="/$workspaceId/search"
                  params={params}
                  search={search}
                  className={cx(
                     button({ kind: "icon", variant: "tertiary" }),
                     "!rounded-[0.6125rem] ml-auto shrink-0",
                  )}
               >
                  <Icons.search className="size-4" />
               </Link> */}
            </div>
            <CreateOrder>
               <DrawerTrigger
                  render={
                     <Button
                        variant={"secondary"}
                        className="mt-3 w-full"
                        size={"lg"}
                     >
                        <Icons.pencilLine className="size-5" />
                        Нове замовлення
                     </Button>
                  }
               />
            </CreateOrder>
         </div>
         <ScrollArea render={<nav className="p-4" />}>
            <ul className="space-y-1">
               <li>
                  <Link
                     to={"/$workspaceId"}
                     params={params}
                     search={search}
                     activeOptions={{ exact: true, includeSearch: false }}
                     className={
                        "group flex h-8 items-center justify-start gap-2 rounded-md px-2 text-base text-foreground/80 leading-none transition-all duration-75 hover:bg-surface-3 hover:text-foreground aria-[current=page]:bg-surface-4/75 aria-[current=page]:text-foreground"
                     }
                  >
                     <Icons.home className="size-5" />
                     <span className="pt-px"> Головна</span>
                  </Link>
               </li>
               <li>
                  <Link
                     to={"/$workspaceId/estimates"}
                     params={params}
                     search={search}
                     className={
                        "group flex h-8 items-center justify-start gap-2 rounded-md px-2 text-base text-foreground/80 leading-none transition-all duration-75 hover:bg-surface-3 hover:text-foreground aria-[current=page]:bg-surface-4/75 aria-[current=page]:text-foreground"
                     }
                  >
                     <Icons.notebook className="md:size-5.2" />
                     <span className="pt-px"> Прорахунок</span>
                  </Link>
               </li>
               <li>
                  <Link
                     to={"/$workspaceId/board"}
                     params={params}
                     search={search}
                     className={
                        "group flex h-8 items-center justify-start gap-2 rounded-md px-2 text-base text-foreground/80 leading-none transition-all duration-75 hover:bg-surface-3 hover:text-foreground aria-[current=page]:bg-surface-4/75 aria-[current=page]:text-foreground"
                     }
                  >
                     <Icons.pencil className="size-5" />
                     <span className="pt-px"> Поставки</span>
                  </Link>
               </li>
               <li>
                  <Link
                     to={"/$workspaceId/analytics"}
                     params={params}
                     search={search}
                     className={
                        "group flex h-8 items-center justify-start gap-2 rounded-md px-2 text-base text-foreground/80 leading-none transition-all duration-75 hover:bg-surface-3 hover:text-foreground aria-[current=page]:bg-surface-4/75 aria-[current=page]:text-foreground"
                     }
                  >
                     <Icons.lineChart className="size-5" />
                     <span className="pt-px"> Аналітика</span>
                  </Link>
               </li>
               <li>
                  <Link
                     to={"/$workspaceId/team"}
                     params={params}
                     search={search}
                     className={
                        "group flex h-8 items-center justify-start gap-2 rounded-md px-2 text-base text-foreground/80 leading-none transition-all duration-75 hover:bg-surface-3 hover:text-foreground aria-[current=page]:bg-surface-4/75 aria-[current=page]:text-foreground"
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
                        className="!gap-2 w-full justify-start [--active-color:var(--color-surface-3)] md:pl-1.5"
                        variant={"ghost"}
                     >
                        <UserAvatar user={auth.user} />
                        <span className="line-clamp-1 py-px text-sm">
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
