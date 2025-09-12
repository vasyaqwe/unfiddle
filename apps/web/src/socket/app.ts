import { env } from "@/env"
import usePartySocket from "partysocket/react"
import { toast } from "sonner"

export function useAppSocket() {
   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "app",
      room: "app",
      onMessage(event) {
         const data = JSON.parse(event.data) as { action: string }

         if (data.action === "updated")
            toast("Сайт оновлено", {
               description:
                  "Будь ласка, оновіть сторінку щоб користуватися останньою версією.",
               action: {
                  label: "Оновити",
                  onClick: () => window.location.reload(),
               },
            })
      },
   })
}
