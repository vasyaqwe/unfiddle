import { CACHE_FOREVER } from "@/api"
import { trpc } from "@/trpc"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   Menu,
   MenuCheckboxItem,
   MenuItem,
   MenuPopup,
   MenuSeparator,
   MenuSubmenuTrigger,
} from "@ledgerblocks/ui/components/menu"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"

export function WorkspaceMenuPopup() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout" })
   const navigate = useNavigate()
   const query = useQuery(
      trpc.workspace.memberships.queryOptions(undefined, {
         staleTime: CACHE_FOREVER,
      }),
   )

   return (
      <MenuPopup align="end">
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
         <Menu>
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
                  </MenuCheckboxItem>
               ))}
               <MenuSeparator />
               <MenuItem onClick={() => navigate({ to: "/new" })}>
                  <Icons.plus className="size-[18px]" />
                  Новий проєкт
               </MenuItem>
            </MenuPopup>
         </Menu>
      </MenuPopup>
   )
}
