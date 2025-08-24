import { env } from "@/env"
import type { TRPCError } from "@/trpc"
import * as Sentry from "@sentry/react"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import {
   type ErrorComponentProps,
   ErrorComponent as RouterErrorComponent,
   rootRouteId,
   useMatch,
   useRouter,
} from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { cn } from "@unfiddle/ui/utils"
import React from "react"

interface Props
   extends Omit<ErrorComponentProps, "reset" | "error">,
      React.ComponentProps<"div"> {
   reset?: () => void
   error?: Pick<TRPCError, "message">
}

export function ErrorComponent({ error, reset, className, ...props }: Props) {
   const router = useRouter()
   const _isRoot = useMatch({
      strict: false,
      select: (state) => state.id === rootRouteId,
   })
   const queryErrorResetBoundary = useQueryErrorResetBoundary()

   React.useEffect(() => {
      queryErrorResetBoundary.reset()
   }, [queryErrorResetBoundary])

   React.useEffect(() => {
      if (error) Sentry.captureException(error)
   }, [error])

   return (
      <div
         className={cn(
            "flex grow flex-col items-center pt-12 text-center md:pt-24",
            className,
         )}
         {...props}
      >
         <div>
            <h1 className="mb-2 text-xl">Виникла помилка</h1>
            <p className="mb-5 text-balance text-muted">
               {reset && error?.message
                  ? error.message
                  : "У нас технічні несправності — спробуйте ще раз пізніше."}
            </p>
            <div className="flex items-center justify-center gap-2.5">
               <Button
                  onClick={() => {
                     if (reset) return reset()
                     router.invalidate()
                  }}
               >
                  Перезавантажити
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
