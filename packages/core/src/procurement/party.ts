import { Server } from "partyserver"
import type { Connection, WSMessage } from "partyserver"

export class Procurement extends Server {
   override onMessage(
      connection: Connection,
      message: WSMessage,
   ): void | Promise<void> {
      console.log("new procurement message", message)
      this.broadcast(message, [connection.id])
   }
}
