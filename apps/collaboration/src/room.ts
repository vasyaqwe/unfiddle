import type { Room as PartyKitRoom, PartyKitServer } from "partykit/server"
import handler from "./index"

export default class Room {
   private handler: PartyKitServer = handler

   constructor(readonly room: PartyKitRoom) {}

   onConnect(ws: any) {
      return this.handler.onConnect(ws, this.room)
   }
}
