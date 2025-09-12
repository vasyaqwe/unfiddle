import { useOrderSocket } from "@/order/socket"
import { useProcurementSocket } from "@/procurement/socket"
import { SocketContext } from "@/socket"
import { useAppSocket } from "@/socket/app"

export function SocketProvider({ children }: { children: React.ReactNode }) {
   const order = useOrderSocket()
   const procurement = useProcurementSocket()
   const app = useAppSocket()

   return (
      <SocketContext value={{ order, procurement, app }}>
         {children}
      </SocketContext>
   )
}
