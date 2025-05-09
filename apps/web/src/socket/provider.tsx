import { useOrderSocket } from "@/order/socket"
import { useProcurementSocket } from "@/procurement/socket"
import { SocketContext } from "@/socket"

export function SocketProvider({ children }: { children: React.ReactNode }) {
   const order = useOrderSocket()
   const procurement = useProcurementSocket()

   return (
      <SocketContext value={{ order, procurement }}>{children}</SocketContext>
   )
}
