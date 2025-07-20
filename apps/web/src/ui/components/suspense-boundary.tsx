import { ErrorComponent } from "@/ui/components/error"
import { CatchBoundary } from "@tanstack/react-router"
import { Loading } from "@unfiddle/ui/components/loading"
import * as React from "react"

export function SuspenseBoundary({
   children,
   fallback,
   errorComponent,
}: {
   children: React.ReactNode
   fallback?: React.ReactNode
   errorComponent?: React.ReactNode
}) {
   return (
      <CatchBoundary
         getResetKey={() => "reset"}
         errorComponent={
            errorComponent
               ? () => errorComponent
               : (props) => (
                    <ErrorComponent
                       error={props.error}
                       reset={props.reset}
                    />
                 )
         }
      >
         <React.Suspense fallback={fallback ?? <SuspenseFallback />}>
            {children}
         </React.Suspense>
      </CatchBoundary>
   )
}

export function SuspenseFallback() {
   return (
      <Loading
         size={"xl"}
         className="-translate-y-5 !absolute inset-0 m-auto"
      />
   )
}
