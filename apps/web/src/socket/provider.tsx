import { useOrderSocket } from "@/order/socket"
import { SocketContext } from "@/socket"

export function SocketProvider({ children }: { children: React.ReactNode }) {
   const order = useOrderSocket()

   return <SocketContext value={{ order }}>{children}</SocketContext>
}
