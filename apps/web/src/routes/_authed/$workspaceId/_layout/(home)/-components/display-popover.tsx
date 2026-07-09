import { orderSortAtom } from "@/order/store"
import {
   ORDER_SORTS,
   ORDER_SORTS_TRANSLATION,
   type OrderSort,
} from "@unfiddle/core/order/constants"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Popover,
   PopoverPopup,
   PopoverTrigger,
} from "@unfiddle/ui/components/popover"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectTriggerIcon,
   SelectValue,
} from "@unfiddle/ui/components/select"
import { useAtom } from "jotai"
import * as React from "react"

const DIRECTIONS_TRANSLATION = {
   desc: "За спаданням",
   asc: "За зростанням",
} as const

export function DisplayPopover() {
   const [sort, setSort] = useAtom(orderSortAtom)
   const [open, setOpen] = React.useState(false)

   const isDefault = sort.sort === "severity" && sort.direction === "desc"

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
                  <Icons.adjustments className="size-4.5" />
                  {isDefault ? null : (
                     <span className="absolute top-0.75 right-0.75 size-1.25 rounded-full bg-primary-7" />
                  )}
               </Button>
            }
         />
         <PopoverPopup align="start">
            <p className="mb-2 font-medium">Сортування</p>
            <div className="grid grid-cols-2 items-center gap-2">
               <Select
                  value={sort.direction}
                  onValueChange={(direction) =>
                     setSort((prev) => ({
                        ...prev,
                        direction: direction as "asc" | "desc",
                     }))
                  }
               >
                  <SelectTrigger className="w-full">
                     <SelectValue>
                        {(value: keyof typeof DIRECTIONS_TRANSLATION) =>
                           DIRECTIONS_TRANSLATION[value]
                        }
                     </SelectValue>
                     <SelectTriggerIcon />
                  </SelectTrigger>
                  <SelectPopup>
                     {(
                        Object.keys(
                           DIRECTIONS_TRANSLATION,
                        ) as (keyof typeof DIRECTIONS_TRANSLATION)[]
                     ).map((value) => (
                        <SelectItem
                           key={value}
                           value={value}
                        >
                           {DIRECTIONS_TRANSLATION[value]}
                        </SelectItem>
                     ))}
                  </SelectPopup>
               </Select>
               <Select
                  value={sort.sort}
                  onValueChange={(value) =>
                     setSort((prev) => ({
                        ...prev,
                        sort: value as OrderSort,
                     }))
                  }
               >
                  <SelectTrigger className="w-full">
                     <SelectValue>
                        {(value: OrderSort) => ORDER_SORTS_TRANSLATION[value]}
                     </SelectValue>
                     <SelectTriggerIcon />
                  </SelectTrigger>
                  <SelectPopup>
                     {ORDER_SORTS.map((value) => (
                        <SelectItem
                           key={value}
                           value={value}
                        >
                           {ORDER_SORTS_TRANSLATION[value]}
                        </SelectItem>
                     ))}
                  </SelectPopup>
               </Select>
            </div>
         </PopoverPopup>
      </Popover>
   )
}
