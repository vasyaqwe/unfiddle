import "@unfiddle/ui/styles.css"
import type { ApiClientError } from "@/api"
import { queryClient, trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { QueryClientProvider } from "@tanstack/react-query"
import { Link, RouterProvider, createRouter } from "@tanstack/react-router"
import { button } from "@unfiddle/ui/components/button"
import { Logo } from "@unfiddle/ui/components/logo"
import { TooltipProvider } from "@unfiddle/ui/components/tooltip"
import { cx } from "@unfiddle/ui/utils"
import { ThemeProvider } from "next-themes"
import * as React from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

const router = createRouter({
   routeTree,
   scrollRestoration: true,
   getScrollRestorationKey: (location) => location.pathname,
   context: { queryClient, trpc },
   defaultPreload: "intent",
   defaultPendingMs: 150,
   defaultPendingMinMs: 200,
   defaultPreloadStaleTime: 0,
   defaultNotFoundComponent: NotFound,
   defaultErrorComponent: ({ error }) => (
      <ErrorComponent
         className="pt-20 md:pt-40"
         error={{
            message: error.message,
         }}
      />
   ),
})

function NotFound() {
   return (
      <div className="flex grow flex-col items-center bg-background pt-20 text-center md:pt-40">
         <Logo className="size-10" />
         <h1 className="mt-4 mb-2 text-xl">Сторінку не знайдено</h1>
         <p className="mb-5 text-foreground/75">
            Сторінку не знайдено — <br /> може вона переїхала..
         </p>
         <Link
            to={"/"}
            className={cx(button(), "text-white")}
         >
            Додому
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
            <ThemeProvider
               defaultTheme="light"
               attribute="class"
               enableSystem
               disableTransitionOnChange
            >
               <TooltipProvider>
                  <RouterProvider router={router} />
               </TooltipProvider>
            </ThemeProvider>
         </QueryClientProvider>
      </React.StrictMode>,
   )
}
