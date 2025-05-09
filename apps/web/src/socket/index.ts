import invariant from "@ledgerblocks/core/invariant"
import type { OrderEvent } from "@ledgerblocks/core/order/types"
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
   }
}
