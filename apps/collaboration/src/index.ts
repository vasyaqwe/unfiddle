import type { PartyKitServer } from "partykit/server"
import Room from "./room"

const handler: PartyKitServer = {
   onConnect(ws, _room, _ctx) {
      ws.send("connected to PartyKit room")
      ws.addEventListener("message", (event) => {
         ws.send(`echo: ${event.data}`)
      })
   },
}

export default handler

export const durableObjects = {
   Room,
}
