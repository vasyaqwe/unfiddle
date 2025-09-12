import { useEstimateSocket } from "@/estimate/socket"
import { useOrderSocket } from "@/order/socket"
import { useProcurementSocket } from "@/procurement/socket"
import { SocketContext } from "@/socket"
import { useAppSocket } from "@/socket/app"

export function SocketProvider({ children }: { children: React.ReactNode }) {
   const order = useOrderSocket()
   const procurement = useProcurementSocket()
   const estimate = useEstimateSocket()
   const app = useAppSocket()

   return (
      <SocketContext value={{ order, procurement, app, estimate }}>
         {children}
      </SocketContext>
   )
}
