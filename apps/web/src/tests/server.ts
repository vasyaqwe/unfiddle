import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import superjson from "superjson"

const batchHandler = http.get("http://localhost:8787/trpc/client.list", () => {
   return HttpResponse.json([
      {
         result: {
            data: superjson.serialize([]),
         },
      },
   ])
})

export const server = setupServer(batchHandler)
