import { cn, cx } from "@unfiddle/ui/utils"
import * as React from "react"

type ContextType = {
   max: number
   value: number
}

const Context = React.createContext<ContextType | undefined>(undefined)

export function SegmentedProgress({
   className,
   max = 100,
   value,
   ...props
}: React.ComponentProps<"div"> & {
   max?: number | undefined
   value: number
}) {
   return (
      <Context value={{ value, max }}>
         <div
            className={cn(
               "flex w-full items-center gap-2 py-3 md:gap-3",
               className,
            )}
            {...props}
         />
      </Context>
   )
}

function useContext() {
   const context = React.use(Context)
   if (!context)
      throw new Error("useContext must be used within a SegmentedProgress")
   return context
}

export function SegmentedProgressBars({
   className,
   ...props
}: React.ComponentProps<"div">) {
   const context = useContext()
   const containerRef = React.useRef<HTMLDivElement>(null)
   const [segments, setSegments] = React.useState(10)

   React.useLayoutEffect(() => {
      const el = containerRef.current
      if (!el) return

      const resizeObserver = new ResizeObserver(() => {
         const width = el.offsetWidth
         const estimatedSegments = Math.floor(width / 6) // tweak based on actual CSS
         setSegments(estimatedSegments)
      })

      resizeObserver.observe(el)
      return () => resizeObserver.disconnect()
   }, [])

   const filled = Math.round((context.value / context.max) * segments)

   return (
      <div
         ref={containerRef}
         className={cn("flex items-center gap-[2px] md:gap-[3px]", className)}
         {...props}
      >
         {Array.from({ length: segments }).map((_, idx) => (
            <div
               key={idx}
               className={cx(
                  "w-0.5 bg-current",
                  idx === filled - 1 ? "h-5.5" : "h-3.5",
                  idx < filled ? "" : "opacity-30",
               )}
            />
         ))}
      </div>
   )
}

export function SegmentedProgressLabel({
   className,
   ...props
}: React.ComponentProps<"span">) {
   return (
      <span
         className={cn("font-medium md:text-lg", className)}
         {...props}
      />
   )
}

export function SegmentedProgressValue({
   className,
   children,
   ...props
}: React.ComponentProps<"span">) {
   const context = useContext()

   return (
      <span
         className={cn("text-right font-mono text-lg", className)}
         {...props}
      >
         {context.value}%
      </span>
   )
}
