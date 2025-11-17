import { routePartykitRequest } from "partyserver"
export { Order } from "@unfiddle/core/order/party"
export { Procurement } from "@unfiddle/core/procurement/party"
export { Estimate } from "@unfiddle/core/estimate/party"
export { EstimateProcurement } from "@unfiddle/core/estimate/procurement/party"
export { Whiteboard } from "@unfiddle/core/whiteboard/party"

export default {
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   async fetch(request: Request, env: any): Promise<Response> {
      return (
         (await routePartykitRequest(request, env)) ||
         new Response("Not Found", { status: 404 })
      )
   },
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
} satisfies ExportedHandler<any>
