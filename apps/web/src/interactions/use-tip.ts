import * as React from "react"
import { toast } from "sonner"
import { useLocalStorage } from "./use-local-storage"

export const useTip = ({
   message,
   key,
   autoTrigger = false,
}: { key: string; message: string; autoTrigger?: boolean }) => {
   const [seen, setSeen] = useLocalStorage(`tip_${key}`, false)
   const trigger = () => {
      if (seen) return
      toast.info("Підказка", {
         description: message,
         duration: Infinity,
         position: "bottom-right",
         closeButton: true,
      })
      setSeen(true)
   }

   React.useEffect(() => {
      if (autoTrigger) trigger()
   }, [])

   return {
      trigger,
      reset: () => setSeen(false),
   }
}
