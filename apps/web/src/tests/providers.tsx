import { store } from "@/tests/store"
import { trpc } from "@/trpc"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
   RouterProvider,
   createRootRoute,
   createRouter,
} from "@tanstack/react-router"
import { Provider } from "jotai"

const testQueryClient = new QueryClient({
   defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
   },
})

export function TestProviders({ children }: { children: React.ReactNode }) {
   const rootRoute = createRootRoute({
      component: () => children,
   })

   const testRouter = createRouter({
      routeTree: rootRoute,
   })

   return (
      <QueryClientProvider client={testQueryClient}>
         <Provider store={store}>
            <RouterProvider
               router={testRouter}
               context={trpc}
            />
         </Provider>
      </QueryClientProvider>
   )
}
