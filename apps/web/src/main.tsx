import "@ledgerblocks/ui/styles.css"
import type { ApiClientError } from "@/api"
import { queryClient, trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { button } from "@ledgerblocks/ui/components/button"
import { Logo } from "@ledgerblocks/ui/components/logo"
import { TooltipProvider } from "@ledgerblocks/ui/components/tooltip"
import { QueryClientProvider } from "@tanstack/react-query"
import { Link, RouterProvider, createRouter } from "@tanstack/react-router"
import * as React from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

const router = createRouter({
   routeTree,
   scrollRestoration: true,
   context: { queryClient, trpc },
   defaultPreload: "intent",
   defaultPendingMs: 150,
   defaultPendingMinMs: 200,
   defaultPreloadStaleTime: 0,
   defaultNotFoundComponent: NotFound,
   defaultErrorComponent: ({ error }) => (
      <ErrorComponent
         className="pt-20 md:pt-40"
         error={{ message: error.message, code: "INTERNAL_SERVER_ERROR" }}
      />
   ),
})

function NotFound() {
   return (
      <div className="flex grow flex-col items-center pt-20 text-center md:pt-40">
         <Logo className="size-10" />
         <h1 className="mt-4 mb-2 text-xl">Not found</h1>
         <p className="mb-5 text-foreground/75">
            This page does not exist — <br /> it may have been moved or deleted.
         </p>
         <Link
            to={"/"}
            className={button()}
         >
            Back home
         </Link>
      </div>
   )
}

declare module "@tanstack/react-router" {
   interface Register {
      router: typeof router
   }
}

declare module "@tanstack/react-query" {
   interface Register {
      defaultError: ApiClientError
   }
}

// biome-ignore lint/style/noNonNullAssertion: ...
const rootElement = document.getElementById("app")!
if (!rootElement.innerHTML || rootElement.innerHTML.trim().length === 0) {
   const root = ReactDOM.createRoot(rootElement)
   root.render(
      <React.StrictMode>
         <QueryClientProvider client={queryClient}>
            <TooltipProvider>
               <RouterProvider router={router} />
            </TooltipProvider>
         </QueryClientProvider>
      </React.StrictMode>,
   )
}
