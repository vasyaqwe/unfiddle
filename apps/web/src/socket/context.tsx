import { useOrderSocket } from "@/order/socket"
import type PartySocket from "partysocket"
import * as React from "react"

export const SocketContext = React.createContext<Record<
   string,
   PartySocket
> | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
   const order = useOrderSocket()

   return <SocketContext value={{ order }}>{children}</SocketContext>
}
