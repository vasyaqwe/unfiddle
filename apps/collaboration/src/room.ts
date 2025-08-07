import type { Room as PartyKitRoom, PartyKitServer } from "partykit/server"
import handler from "./index"

export default class Room {
   private handler: PartyKitServer = handler

   constructor(readonly room: PartyKitRoom) {}

   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   onConnect(connection: any, room: PartyKitRoom, ctx: any) {
      return this.handler.onConnect?.(connection, room, ctx)
   }
}
