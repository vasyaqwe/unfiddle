import { CACHE_FOREVER } from "@/api"
import { trpc } from "@/trpc"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   MenuCheckboxItem,
   MenuCheckboxItemIndicator,
   MenuItem,
   MenuPopup,
   MenuSeparator,
   MenuSubmenuTrigger,
   Submenu,
} from "@unfiddle/ui/components/menu"

export function WorkspaceMenuPopup() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout" })
   const navigate = useNavigate()
   const query = useQuery(
      trpc.workspace.memberships.queryOptions(undefined, {
         staleTime: CACHE_FOREVER,
      }),
   )

   return (
      <MenuPopup align={"start"}>
         {/* <MenuItem
            onClick={() =>
               navigate({
                  to: "/$workspaceId/settings",
                  params,
               })
            }
         >
            <Icons.gear />
            Налаштування
         </MenuItem> */}
         <Submenu>
            <MenuSubmenuTrigger>
               <Icons.arrowsLeftRight />
               Проєкти
            </MenuSubmenuTrigger>
            <MenuPopup>
               {query.data?.map((membership) => (
                  <MenuCheckboxItem
                     key={membership.workspaceId}
                     closeOnClick
                     checked={membership.workspaceId === params.workspaceId}
                     onClick={() =>
                        navigate({
                           to: "/$workspaceId",
                           params: { workspaceId: membership.workspaceId },
                        })
                     }
                  >
                     {membership.workspace.name}
                     <MenuCheckboxItemIndicator />
                  </MenuCheckboxItem>
               ))}
               <MenuSeparator />
               <MenuItem onClick={() => navigate({ to: "/new" })}>
                  Новий проєкт..
               </MenuItem>
            </MenuPopup>
         </Submenu>
      </MenuPopup>
   )
}
