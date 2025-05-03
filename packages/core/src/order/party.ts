import type { OrderEvent } from "@ledgerblocks/core/order/types"
import type * as Party from "partykit/server"

export default class OrderServer implements Party.Server {
   constructor(readonly room: Party.Room) {}

   async onMessage(message: string, _connection: Party.Connection<unknown>) {
      const event: OrderEvent = JSON.parse(message)
      return this.room.broadcast(JSON.stringify(event))
   }
}
