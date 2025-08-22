import invariant from "@unfiddle/core/invariant"
import type { OrderEvent } from "@unfiddle/core/order/types"
import type { ProcurementEvent } from "@unfiddle/core/procurement/types"
import type PartySocket from "partysocket"
import * as React from "react"

export const SocketContext = React.createContext<Record<
   string,
   PartySocket
> | null>(null)

export function useSocket() {
   const socket = React.use(SocketContext)

   invariant(socket, "useSocket must be used within a SocketProvider")

   return {
      order: {
         send: (event: OrderEvent) => socket.order?.send(JSON.stringify(event)),
      },
      procurement: {
         send: (event: ProcurementEvent) =>
            socket.procurement?.send(JSON.stringify(event)),
      },
      estimate: {
         send: (event: ProcurementEvent) =>
            socket.estimate?.send(JSON.stringify(event)),
      },
   }
}
