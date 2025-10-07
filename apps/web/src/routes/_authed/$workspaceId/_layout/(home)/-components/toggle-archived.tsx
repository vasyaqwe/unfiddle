import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Toggle } from "@unfiddle/ui/components/toggle"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"

export function ToggleArchived() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/(home)/" })
   const search = useSearch({
      from: "/_authed/$workspaceId/_layout/(home)/",
   })
   const navigate = useNavigate()

   return (
      <Tooltip>
         <TooltipTrigger
            render={
               <Toggle
                  pressed={!!search.archived}
                  onPressedChange={(archived) => {
                     navigate({
                        to: ".",
                        params,
                        search: (prev) => ({
                           ...prev,
                           archived,
                        }),
                     })
                  }}
                  render={(props, state) => (
                     <Button
                        {...props}
                        kind={"icon"}
                        variant={"ghost"}
                        size={"sm"}
                     >
                        {state.pressed ? (
                           <Icons.arrowLeft className="size-5" />
                        ) : (
                           <Icons.archive className="size-5" />
                        )}
                     </Button>
                  )}
               />
            }
         />
         <TooltipPopup>
            {search.archived ? "Показати усі" : "Показати архівовані"}
         </TooltipPopup>
      </Tooltip>
   )
}
