import { useNavigate, useSearch } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { DateInput } from "@unfiddle/ui/components/date-input"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Popover,
   PopoverPopup,
   PopoverTrigger,
} from "@unfiddle/ui/components/popover"
import * as React from "react"

export function DateFilter() {
   const search = useSearch({
      from: "/_authed/$workspaceId/_layout/(home)/",
   })
   const navigate = useNavigate()
   const [startDate, setStartDate] = React.useState(
      search.startDate ? new Date(search.startDate) : null,
   )
   const [endDate, setEndDate] = React.useState(
      search.endDate ? new Date(search.endDate) : null,
   )
   const [open, setOpen] = React.useState(false)

   return (
      <Popover
         open={open}
         onOpenChange={setOpen}
      >
         <PopoverTrigger
            render={
               <Button
                  variant={"ghost"}
                  kind={"icon"}
                  size={"sm"}
                  className="relative"
               >
                  <Icons.calendar className="size-[18px]" />
                  {search.startDate || search.endDate ? (
                     <span className="absolute top-[3px] right-[3px] size-[5px] rounded-full bg-primary-7" />
                  ) : null}
               </Button>
            }
         />
         <PopoverPopup align="start">
            <p className="mb-2 font-medium">Фільтрувати за датою</p>
            <div className="grid grid-cols-2 items-center gap-2">
               <DateInput
                  value={startDate}
                  onValueChange={setStartDate}
                  placeholder="Початок"
                  className="max-w-[170px]"
               />
               <DateInput
                  value={endDate}
                  onValueChange={setEndDate}
                  placeholder="Кінець"
                  className="max-w-[170px]"
               />
            </div>
            <div className="mt-4 grid grid-cols-2 items-center gap-2">
               <Button
                  variant={"tertiary"}
                  onClick={() => {
                     navigate({
                        to: ".",
                        search: (prev) => ({
                           ...prev,
                           startDate: undefined,
                           endDate: undefined,
                        }),
                     })
                     setStartDate(null)
                     setEndDate(null)
                  }}
               >
                  Скинути
               </Button>
               <Button
                  className="md:h-[1.85rem]"
                  onClick={() => {
                     navigate({
                        to: ".",
                        search: (prev) => ({
                           ...prev,
                           startDate: startDate?.toISOString() ?? undefined,
                           endDate: endDate?.toISOString() ?? undefined,
                        }),
                     })
                     setOpen(false)
                  }}
               >
                  Застосувати
               </Button>
            </div>
         </PopoverPopup>
      </Popover>
   )
}
