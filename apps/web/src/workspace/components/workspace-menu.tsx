import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import {
   MenuCheckboxItem,
   MenuCheckboxItemIndicator,
   MenuItem,
   MenuPopup,
   MenuSeparator,
   MenuSubmenuTrigger,
   Submenu,
} from "@unfiddle/ui/components/menu"
import { CACHE_FOREVER } from "@/api"
import { trpc } from "@/trpc"

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
            <HugeiconsIcon icon={Settings02Icon} />
            Налаштування
         </MenuItem> */}
         <Submenu>
            <MenuSubmenuTrigger>
               <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} />
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
