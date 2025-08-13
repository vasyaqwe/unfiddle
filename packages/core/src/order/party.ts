import { Server } from "partyserver"
import type { Connection, WSMessage } from "partyserver"

export class Order extends Server {
   static override options = {
      hibernate: true,
   }

   override onMessage(
      connection: Connection,
      message: WSMessage,
   ): void | Promise<void> {
      console.log("new order message", message)
      this.broadcast(message, [connection.id])
   }
}
