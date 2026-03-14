import type { OrderMessagePosition } from "@unfiddle/core/order/message/types"

export const getBorderRadiusClasses = (
   position: OrderMessagePosition,
   viewerIsSender: boolean,
) => {
   // viewerIsSender: bubble on right, small corner on bottom-right
   // !viewerIsSender: bubble on left, small corner on bottom-left
   if (viewerIsSender) {
      switch (position) {
         case "first":
            return "rounded-[18px] rounded-br"
         case "middle":
            return "rounded-l-[18px] rounded-r"
         case "last":
            return "rounded-[18px] rounded-tr"
         case "only":
            return "rounded-[18px]"
      }
   }
   switch (position) {
      case "first":
         return "rounded-[18px] rounded-bl"
      case "middle":
         return "rounded-r-[18px] rounded-l"
      case "last":
         return "rounded-[18px] rounded-tl"
      case "only":
         return "rounded-[18px]"
   }
}
