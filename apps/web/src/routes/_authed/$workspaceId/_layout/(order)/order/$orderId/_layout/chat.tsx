import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/layout/components/header"
import { useOrder } from "@/order/hooks"
import { createFileRoute } from "@tanstack/react-router"
import { makeShortId } from "@unfiddle/core/id"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
)({
   component: RouteComponent,
})

function RouteComponent() {
   const order = useOrder()

   return (
      <>
         <Header className="md:flex md:pr-1.75">
            <HeaderBackButton className={"mr-1.5 md:flex"} />
            <HeaderTitle>
               {makeShortId(order.shortId)}{" "}
               <svg
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="-mt-0.5 inline-block size-5 md:size-4"
               >
                  <path
                     d="M12 3.5L4 11.5"
                     stroke="currentColor"
                     strokeWidth="1.33"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </svg>{" "}
               Чат
            </HeaderTitle>
         </Header>
      </>
   )
}
