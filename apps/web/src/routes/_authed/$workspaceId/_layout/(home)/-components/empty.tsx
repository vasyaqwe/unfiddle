import { useAuth } from "@/auth/hooks"
import { useSearch } from "@tanstack/react-router"
import { Icons } from "@unfiddle/ui/components/icons"

export function HomeEmpty() {
   const search = useSearch({
      from: "/_authed/$workspaceId/_layout/(home)/",
   })
   const auth = useAuth()

   return (
      <div className="-translate-y-8 absolute inset-0 m-auto size-fit text-center">
         <div className="mx-auto mb-5 flex max-w-30 flex-col items-center">
            {auth.workspace.image ? (
               <img
                  src={auth.workspace.image}
                  alt=""
               />
            ) : (
               <Icons.empty />
            )}
         </div>
         <p className="mb-2 font-medium text-foreground/90 text-lg">
            {search.archived ? "В архіві нічого немає" : "Немає замовлень"}
         </p>
      </div>
   )
}
