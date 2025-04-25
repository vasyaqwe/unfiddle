import { useAuth } from "@/auth/hooks"
import { BackButton } from "@/ui/components/back-button"
import { UserAvatar } from "@/user/components/user-avatar"
import {
   ArrowLeftIcon,
   ArrowLeftStartOnRectangleIcon,
   Cog6ToothIcon,
} from "@heroicons/react/24/outline"
import { Link } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import { cn } from "@unfiddle/ui/utils"

export function Header({
   className,
   children,
   ...props
}: React.ComponentProps<"header">) {
   return (
      <header
         className={cn(
            "z-[5] grid h-(--header-height) shrink-0 grid-cols-[minmax(0,_0.5fr)_minmax(0,1fr)_minmax(0,_1fr)_minmax(0,_1fr)_minmax(0,_0.5fr)] items-center border-neutral border-b bg-background-main px-2 max-md:shadow-xs md:hidden md:pr-1.5 md:pl-3",
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
         <ArrowLeftIcon
            className="size-6"
            strokeWidth={2}
         />
      </BackButton>
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
                  className="col-start-5 ml-auto"
               >
                  <UserAvatar
                     size={28}
                     user={auth.user}
                  />
               </Button>
            }
         />
         <MenuPopup align="end">
            <MenuItem
               render={
                  <Link to="/settings">
                     <Cog6ToothIcon />
                     Settings
                  </Link>
               }
            />
            <MenuItem
               destructive
               onClick={() => auth.signout.mutate()}
            >
               <ArrowLeftStartOnRectangleIcon strokeWidth={2} />
               Log out
            </MenuItem>
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
