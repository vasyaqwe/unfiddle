import { SeverityIcon } from "@/order/components/severity-icon"
import { useOrderQueryOptions } from "@/order/queries"
import { trpc } from "@/trpc"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useSearch } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"
import {
   ORDER_SEVERITIES_TRANSLATION,
   ORDER_STATUSES_TRANSLATION,
} from "@unfiddle/core/order/constants"
import {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@unfiddle/core/order/constants"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuCheckboxItem,
   MenuCheckboxItemIndicator,
   MenuPopup,
   MenuSubmenuTrigger,
   MenuTrigger,
   Submenu,
} from "@unfiddle/ui/components/menu"

export function FilterMenu() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/(home)/" })
   const search = useSearch({
      from: "/_authed/$workspaceId/_layout/(home)/",
      select: (search) => ({
         status: search.status,
         severity: search.severity,
         creator: search.creator,
      }),
   })
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   const onFilterChange = (
      key: "status" | "severity" | "creator",
      value: string,
      isChecked: boolean,
   ) => {
      const currentValues = search[key] ?? []
      const newValues = isChecked
         ? [...currentValues, value]
         : currentValues.filter((v) => v !== value)

      navigate({
         to: ".",
         search: (prev) => ({
            ...prev,
            [key]: newValues.length ? newValues : undefined,
         }),
         replace: true,
      })
   }

   const selectedLength = Object.values(search)
      .filter((value) => Array.isArray(value))
      .reduce((total, arr) => total + (arr?.length ?? 0), 0)

   const membersQ = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )
   const members = membersQ.data ?? []
   const managers = members.filter((m) => m.role !== "buyer").map((m) => m.user)

   const removeFilter = () => {
      navigate({
         to: ".",
         search: (prev) => ({
            ...prev,
            status: undefined,
            severity: undefined,
            creator: undefined,
         }),
      }).then(() => queryClient.invalidateQueries(queryOptions.list))
   }

   return (
      <>
         <Menu>
            <MenuTrigger
               render={
                  <Button
                     variant={"ghost"}
                     size={"sm"}
                  >
                     <Icons.filter className="size-5" />
                     Фільтр
                  </Button>
               }
            />
            <MenuPopup align="start">
               <Submenu>
                  <MenuSubmenuTrigger>
                     <Icons.circleCheckDotted />
                     Статус
                  </MenuSubmenuTrigger>
                  <MenuPopup className={"max-h-56 overflow-y-auto"}>
                     {ORDER_STATUSES.map((status) => (
                        <MenuCheckboxItem
                           checked={search.status?.includes(status) ?? false}
                           onCheckedChange={(checked) =>
                              onFilterChange("status", status, checked)
                           }
                           key={status}
                        >
                           {ORDER_STATUSES_TRANSLATION[status]}
                           <MenuCheckboxItemIndicator />
                        </MenuCheckboxItem>
                     ))}
                  </MenuPopup>
               </Submenu>
               <Submenu>
                  <MenuSubmenuTrigger>
                     <SeverityIcon severity="high" />
                     Пріоритет
                  </MenuSubmenuTrigger>
                  <MenuPopup>
                     {ORDER_SEVERITIES.map((severity) => (
                        <MenuCheckboxItem
                           checked={
                              search.severity?.includes(severity) ?? false
                           }
                           onCheckedChange={(checked) =>
                              onFilterChange("severity", severity, checked)
                           }
                           key={severity}
                        >
                           {ORDER_SEVERITIES_TRANSLATION[severity]}
                           <MenuCheckboxItemIndicator />
                        </MenuCheckboxItem>
                     ))}
                  </MenuPopup>
               </Submenu>
               {managers.length === 0 ? null : (
                  <Submenu>
                     <MenuSubmenuTrigger>
                        <Icons.user />
                        Менеджер
                     </MenuSubmenuTrigger>
                     <MenuPopup>
                        {managers.map((creator) => (
                           <MenuCheckboxItem
                              checked={
                                 search.creator?.includes(creator.id) ?? false
                              }
                              onCheckedChange={(checked) =>
                                 onFilterChange("creator", creator.id, checked)
                              }
                              key={creator.id}
                           >
                              {creator.name}
                              <MenuCheckboxItemIndicator />
                           </MenuCheckboxItem>
                        ))}
                     </MenuPopup>
                  </Submenu>
               )}
            </MenuPopup>
         </Menu>
         {selectedLength === 0 ? null : (
            <Badge className="overflow-hidden pr-0">
               {selectedLength} обрано
               <Button
                  variant={"ghost"}
                  size={"sm"}
                  kind={"icon"}
                  onClick={removeFilter}
                  className="rounded-none"
               >
                  <Icons.xMark className="size-4" />
               </Button>
            </Badge>
         )}
      </>
   )
}
