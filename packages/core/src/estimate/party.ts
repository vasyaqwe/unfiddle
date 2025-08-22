import { Server } from "partyserver"
import type { Connection, WSMessage } from "partyserver"

export class Estimate extends Server {
   static override options = {
      hibernate: true,
   }

   override onMessage(
      connection: Connection,
      message: WSMessage,
   ): void | Promise<void> {
      console.log("new estimate message", message)
      this.broadcast(message, [connection.id])
   }
}
