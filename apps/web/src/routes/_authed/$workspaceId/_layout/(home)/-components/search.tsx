import { useOrderQueryOptions } from "@/order/queries"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Input } from "@unfiddle/ui/components/input"
import * as React from "react"
import * as R from "remeda"

export function Search() {
   const search = useSearch({
      from: "/_authed/$workspaceId/_layout/(home)/",
   })
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()
   const [searching, setSearching] = React.useState(false)

   const onChange = R.funnel<[string], void>(
      (query) => {
         navigate({
            to: ".",
            search: (prev) => ({
               ...prev,
               q: query ?? undefined,
            }),
            replace: true,
         })
      },
      { minQuietPeriodMs: 300, reducer: (_acc, newQuery) => newQuery },
   )

   const active = searching || (search.q && search.q.length > 0)

   return (
      <div className="relative ml-auto flex h-9 max-w-[320px] items-center md:h-9">
         {active ? (
            <Input
               autoFocus
               className={"h-9 border-b-0 pt-0 pr-10 md:h-9 md:pt-0"}
               defaultValue={search.q}
               placeholder="Шукати.."
               onChange={(e) => onChange.call(e.target.value)}
            />
         ) : null}
         <Button
            variant={"ghost"}
            kind={"icon"}
            size={"sm"}
            className="absolute inset-y-0 right-0 my-auto"
            type="button"
            onClick={() => {
               if (!active) return setSearching(true)

               navigate({
                  to: ".",
                  search: (prev) => ({
                     ...prev,
                     q: undefined,
                  }),
               }).then(() => queryClient.invalidateQueries(queryOptions.list))
               setSearching(false)
            }}
         >
            {active ? (
               <Icons.xMark className="size-[18px]" />
            ) : (
               <Icons.search className="size-[18px]" />
            )}
         </Button>
      </div>
   )
}
