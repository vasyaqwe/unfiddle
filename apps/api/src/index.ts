import { routes } from "@unfiddle/core/api"

export class Partykit {
   private state: DurableObjectState
   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   private env: any

   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   constructor(state: DurableObjectState, env: any) {
      this.state = state
      this.env = env
   }

   async fetch(_request: Request): Promise<Response> {
      return new Response("Hello from the Durable Object!")
   }
}

export default routes
