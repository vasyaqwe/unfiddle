import { env } from "@/env"
import type { TRPCError } from "@/trpc"
import { Button } from "@ledgerblocks/ui/components/button"
import { cn } from "@ledgerblocks/ui/utils"
import {
   type ErrorComponentProps,
   ErrorComponent as RouterErrorComponent,
   rootRouteId,
   useMatch,
   useRouter,
} from "@tanstack/react-router"

interface Props
   extends Omit<ErrorComponentProps, "reset" | "error">,
      React.ComponentProps<"div"> {
   reset?: () => void
   error?: TRPCError
}

export function ErrorComponent({ error, reset, className, ...props }: Props) {
   const router = useRouter()
   const _isRoot = useMatch({
      strict: false,
      select: (state) => state.id === rootRouteId,
   })

   return (
      <div
         className={cn(
            "flex grow flex-col items-center pt-8 text-center md:pt-16",
            className,
         )}
         {...props}
      >
         <div>
            <h1 className="mb-2 text-xl">An error occurred</h1>
            <p className="mb-5 text-foreground/70 text-lg">
               {reset && error?.message
                  ? error.message
                  : "We are having technical difficulties. Please, try again."}
            </p>
            <div className="flex items-center justify-center gap-2.5">
               <Button
                  onClick={() => {
                     if (reset) return reset()
                     router.invalidate()
                  }}
               >
                  Try again
               </Button>
            </div>
         </div>
         {env.DEV && error ? (
            <div className="mx-auto mt-12 w-fit">
               <RouterErrorComponent error={error} />
            </div>
         ) : null}
      </div>
   )
}
