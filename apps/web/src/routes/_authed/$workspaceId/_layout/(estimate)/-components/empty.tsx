import { InboxIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useAuth } from "@/auth/hooks"

export function EstimatesEmpty() {
   const auth = useAuth()

   return (
      <div className="absolute inset-0 m-auto size-fit -translate-y-8 text-center">
         <div className="mx-auto mb-5 flex max-w-30 flex-col items-center">
            {auth.workspace.image ? (
               <img
                  src={auth.workspace.image}
                  alt=""
               />
            ) : (
               <HugeiconsIcon
                  icon={InboxIcon}
                  className="size-12"
               />
            )}
         </div>
         <p className="mb-2 font-medium text-foreground/90 text-lg">
            Немає прорахунків
         </p>
      </div>
   )
}
