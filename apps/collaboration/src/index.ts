import type { PartyKitServer } from "partykit/server"

const handler: PartyKitServer = {
   onConnect(ws, _room) {
      ws.send("connected to PartyKit room")
      ws.addEventListener("message", (event) => {
         ws.send(`echo: ${event.data}`)
      })
   },
}

export default handler
