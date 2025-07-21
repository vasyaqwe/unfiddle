import { trpc } from "@/trpc"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import invariant from "@unfiddle/core/invariant"

export function useOrder() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId",
   })
   const query = useSuspenseQuery(trpc.order.one.queryOptions(params))
   const order = query.data
   invariant(order, "Order not found")

   return order
}
