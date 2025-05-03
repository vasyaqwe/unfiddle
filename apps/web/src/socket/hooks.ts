import { SocketContext } from "@/socket/context"
import invariant from "@ledgerblocks/core/invariant"
import type { OrderEvent } from "@ledgerblocks/core/order/types"
import * as React from "react"

export function useSocket() {
   const socket = React.use(SocketContext)

   invariant(socket, "useSocket must be used within a SocketProvider")

   return {
      order: {
         send: (event: OrderEvent) => socket.order?.send(JSON.stringify(event)),
      },
   }
}
