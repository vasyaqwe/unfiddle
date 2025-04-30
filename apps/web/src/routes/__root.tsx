import type { AppRouter } from "@ledgerblocks/core/trpc/types"
import { Toaster } from "@ledgerblocks/ui/components/toast"
import { MOBILE_BREAKPOINT } from "@ledgerblocks/ui/constants"
import { isMobileAtom } from "@ledgerblocks/ui/store"
import type { QueryClient } from "@tanstack/react-query"
import {
   Outlet,
   createRootRouteWithContext,
   useMatches,
} from "@tanstack/react-router"
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { useSetAtom } from "jotai"
import * as React from "react"

export const Route = createRootRouteWithContext<{
   queryClient: QueryClient
   trpc: TRPCOptionsProxy<AppRouter>
}>()({
   component: RootComponent,
})

function RootComponent() {
   const setIsMobile = useSetAtom(isMobileAtom)
   React.useEffect(() => {
      const checkDevice = (event: MediaQueryList | MediaQueryListEvent) =>
         setIsMobile(event.matches)
      const mediaQueryList = window.matchMedia(
         `(max-width: ${MOBILE_BREAKPOINT}px)`,
      )
      checkDevice(mediaQueryList)
      mediaQueryList.addEventListener("change", checkDevice)
      return () => {
         mediaQueryList.removeEventListener("change", checkDevice)
      }
   }, [])

   return (
      <Meta>
         {/* <Toolbar /> */}
         <Toaster />
         <Outlet />
      </Meta>
   )
}

function Meta({ children }: { children: React.ReactNode }) {
   const matches = useMatches()
   const meta = matches.at(-1)?.meta?.find((meta) => meta?.title)

   React.useEffect(() => {
      document.title = [meta?.title ?? "ledgerblocks"]
         .filter(Boolean)
         .join(" · ")
   }, [meta])

   return children
}
