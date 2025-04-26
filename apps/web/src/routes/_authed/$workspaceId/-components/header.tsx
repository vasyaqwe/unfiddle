import { useAuth } from "@/auth/hooks"
import { WorkspaceMenuPopup } from "@/routes/_authed/$workspaceId/-components/organization-menu"
import { BackButton } from "@/ui/components/back-button"
import { UserAvatar } from "@/user/components/user-avatar"
import { WorkspaceLogo } from "@/workspace/components/workspace-logo"
import { Button } from "@ledgerblocks/ui/components/button"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   Menu,
   MenuGroup,
   MenuGroupLabel,
   MenuItem,
   MenuPopup,
   MenuSeparator,
   MenuTrigger,
} from "@ledgerblocks/ui/components/menu"
import { cn } from "@ledgerblocks/ui/utils"

export function Header({
   className,
   children,
   ...props
}: React.ComponentProps<"header">) {
   return (
      <header
         className={cn(
            "z-[5] grid h-(--header-height) shrink-0 grid-cols-[minmax(0,_0.5fr)_minmax(0,1fr)_minmax(0,_1fr)_minmax(0,_1fr)_minmax(0,_0.5fr)] items-center border-neutral border-b bg-background-main px-2 max-md:shadow-[0_1px_1px_0_rgb(0_0_0_/_0.05)] md:hidden md:pr-1.5 md:pl-3",
            className,
         )}
         {...props}
      >
         {children}
      </header>
   )
}

export function HeaderBackButton({
   className,
   ...props
}: React.ComponentProps<typeof Button>) {
   return (
      <BackButton
         variant={"ghost"}
         kind={"icon"}
         className={cn("md:hidden", className)}
         aria-label="Go back"
         {...props}
      >
         <Icons.arrowLeft
            className="size-6"
            strokeWidth={2}
         />
      </BackButton>
   )
}

export function HeaderWorkspaceMenu() {
   const auth = useAuth()

   return (
      <Menu>
         <MenuTrigger
            render={
               <Button
                  variant={"ghost"}
                  kind={"icon"}
                  className="!rounded-full md:pl-[3px] md:text-base"
                  aria-label="Workspace options"
               >
                  <WorkspaceLogo
                     size={28}
                     className="rounded-full"
                     workspace={auth.workspace}
                  />
               </Button>
            }
         />
         <WorkspaceMenuPopup />
      </Menu>
   )
}

export function HeaderUserMenu() {
   const auth = useAuth()

   return (
      <Menu>
         <MenuTrigger
            render={
               <Button
                  variant={"ghost"}
                  kind={"icon"}
                  className="!rounded-full col-start-5 ml-auto"
               >
                  <UserAvatar
                     size={28}
                     user={auth.user}
                  />
               </Button>
            }
         />
         <MenuPopup
            align="end"
            className={"w-full max-w-60"}
         >
            <MenuGroup>
               <MenuGroupLabel className={"mb-1.5 line-clamp-1 normal-case"}>
                  {auth.user.email}
               </MenuGroupLabel>
               <MenuSeparator />
               <MenuItem
                  destructive
                  onClick={() => auth.signout.mutate()}
               >
                  <Icons.exit />
                  Вийти з аккаунту
               </MenuItem>
            </MenuGroup>
         </MenuPopup>
      </Menu>
   )
}

export function HeaderTitle({
   className,
   ...props
}: React.ComponentProps<"p">) {
   return (
      <p
         className={cn(
            "col-start-2 col-end-5 whitespace-nowrap text-center font-medium text-lg md:text-left md:text-base",
            className,
         )}
         {...props}
      />
   )
}
