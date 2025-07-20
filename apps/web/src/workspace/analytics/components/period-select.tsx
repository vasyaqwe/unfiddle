import { useNavigate, useSearch } from "@tanstack/react-router"
import {
   PERIOD_FILTERS,
   PERIOD_FILTERS_TRANSLATION,
   type workspaceAnalyticsFilterSchema,
} from "@unfiddle/core/workspace/analytics/filter"
import { Button } from "@unfiddle/ui/components/button"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectTriggerIcon,
   SelectValue,
} from "@unfiddle/ui/components/select"
import type { z } from "zod"

export function PeriodSelect({
   searchKey,
}: { searchKey: keyof z.infer<typeof workspaceAnalyticsFilterSchema> }) {
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })
   const navigate = useNavigate()

   return (
      <Select
         value={search[searchKey]}
         onValueChange={(value) =>
            navigate({
               to: ".",
               search: (prev) => ({ ...prev, [searchKey]: value }),
               replace: true,
            })
         }
      >
         <SelectTrigger
            render={
               <Button
                  disabled={search.period_comparison.length > 0}
                  variant={"secondary"}
                  className={
                     "min-w-32 disabled:cursor-default disabled:bg-surface-3"
                  }
               >
                  <SelectValue placeholder={search[searchKey]}>
                     {(label) => label}
                  </SelectValue>
                  <SelectTriggerIcon />
               </Button>
            }
         />
         <SelectPopup>
            {PERIOD_FILTERS.map((item) => (
               <SelectItem
                  key={item}
                  value={item}
               >
                  {PERIOD_FILTERS_TRANSLATION[item]}
               </SelectItem>
            ))}
         </SelectPopup>
      </Select>
   )
}
