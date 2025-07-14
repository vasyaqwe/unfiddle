import { useLocalStorage } from "@/interactions/use-local-storage"
import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderBackButton,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { validator } from "@/validator"
import { useQuery } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { formatDateRelative } from "@unfiddle/core/date"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Input } from "@unfiddle/ui/components/input"
import * as React from "react"
import { z } from "zod"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/search")({
   component: RouteComponent,
   validateSearch: validator(
      z.object({
         q: z.string().catch(""),
      }),
   ),
})

function RouteComponent() {
   const navigate = useNavigate()
   const params = Route.useParams()
   const search = Route.useSearch()
   const [query, setQuery] = React.useState(search.q)
   const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
      `recent_search_${params.workspaceId}`,
      [],
   )
   const inputRef = React.useRef<HTMLInputElement>(null)

   const searchResults = useQuery(
      trpc.workspace.search.queryOptions({
         id: params.workspaceId,
         query: search.q,
      }),
   )

   return (
      <>
         <Header className="md:flex">
            <HeaderBackButton />
            <form
               onSubmit={(e) => {
                  e.preventDefault()
                  const query = (
                     new FormData(e.target as HTMLFormElement).get(
                        "q",
                     ) as string
                  )
                     .toString()
                     .trim()

                  if (query.length === 0) return

                  navigate({
                     to: ".",
                     params,
                     search: { q: query },
                  }).then(() => {
                     if (!recentSearches.includes(query))
                        setRecentSearches((prev) => [query, ...prev])
                  })
               }}
               className="relative col-span-4 flex w-full items-center"
            >
               <div className="max-md:-translate-y-1/2 top-1/2 left-1 grid size-5 shrink-0 place-items-center opacity-50 max-md:absolute md:left-4">
                  <Icons.search className="size-[18px]" />
               </div>
               <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                     setQuery(e.target.value)
                     if (e.target.value.length === 0) {
                        navigate({
                           to: ".",
                           params,
                           search: {
                              q: "",
                           },
                        })
                     }
                  }}
                  name="q"
                  autoFocus
                  placeholder="Шукати.."
                  className={"border-none pt-0 pl-8 md:pt-0 md:pl-2"}
               />
               {query.length === 0 ? null : (
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                     size={"sm"}
                     className="ml-auto hidden data-visible:flex md:mr-0.5"
                     data-visible={query.length > 0}
                     type="button"
                     onClick={() => {
                        setQuery("")
                        navigate({
                           to: ".",
                           params,
                           search: { q: "" },
                        })
                        setTimeout(() => {
                           inputRef.current?.focus()
                        }, 0)
                     }}
                  >
                     <Icons.xMark className="size-4" />
                  </Button>
               )}
            </form>
         </Header>
         <MainScrollArea container={false}>
            {search.q.length === 0 ? (
               recentSearches.length === 0 ? null : (
                  <>
                     <div className="my-2 flex items-center justify-between px-4">
                        <p className="opacity-65">Раніше шукали</p>
                        <Button
                           onClick={() => setRecentSearches([])}
                           size={"sm"}
                           variant={"ghost"}
                           className="text-foreground/80"
                        >
                           Очистити
                        </Button>
                     </div>
                     {recentSearches.map((q) => (
                        <Link
                           onClick={(e) => {
                              // @ts-expect-error ...
                              if (e.target.closest("button"))
                                 return e.preventDefault()

                              setQuery(q)
                           }}
                           className={
                              "group flex h-[34px] items-center justify-between rounded-none px-4 transition-none hover:bg-surface-2"
                           }
                           key={q}
                           to="/$workspaceId/search"
                           params={params}
                           search={{ q }}
                        >
                           <span className="line-clamp-1 break-all">{q}</span>
                           <Button
                              onClick={(_e) => {
                                 setRecentSearches((prev) =>
                                    prev.filter((item) => item !== q),
                                 )
                              }}
                              variant={"ghost"}
                              kind={"icon"}
                              size={"sm"}
                              className="hidden group-hover:flex"
                           >
                              <Icons.xMark className="size-4" />
                           </Button>
                        </Link>
                     ))}
                  </>
               )
            ) : (
               <>
                  {searchResults.isPending ? null : searchResults.isError ||
                    searchResults.data.length === 0 ? (
                     <div className="-translate-y-8 absolute inset-0 m-auto size-fit text-center text-foreground/75">
                        <Icons.search className="mx-auto size-8" />
                        <p className="mt-3 font-semibold text-lg">
                           Нічого не знайдено
                        </p>
                     </div>
                  ) : (
                     <div className="space-y-1.5 p-1.5">
                        {searchResults.data.map((item) => (
                           <div
                              key={item.id}
                              className={
                                 "w-full rounded-xl p-2 hover:bg-border/50"
                              }
                           >
                              <div className="-mt-px flex w-full items-center">
                                 <p
                                    dangerouslySetInnerHTML={{
                                       __html: item.highlightedTitle,
                                    }}
                                    className="ml-1.5 line-clamp-1 break-all font-semibold leading-snug"
                                 />
                                 <span className="ml-auto whitespace-nowrap text-foreground/75 text-xs">
                                    {formatDateRelative(
                                       item.createdAt,
                                       "narrow",
                                    )}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </>
            )}
         </MainScrollArea>
      </>
   )
}
