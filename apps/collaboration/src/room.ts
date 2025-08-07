import type { DurableObjectState } from "@cloudflare/workers-types"

export class Room {
   constructor(private state: DurableObjectState) {}

   async fetch(_request: Request) {
      return new Response("Hello from Durable Object")
   }
}

export default {
   async fetch(_request: Request) {
      return new Response("Durable Object only worker")
   },
}
