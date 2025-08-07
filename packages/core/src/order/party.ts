import { Server } from "partyserver"
import type { Connection, WSMessage } from "partyserver"

export class Order extends Server {
   override onMessage(
      connection: Connection,
      message: WSMessage,
   ): void | Promise<void> {
      console.log("onMessage", message)
      this.broadcast(message, [connection.id])
   }
}
