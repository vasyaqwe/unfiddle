import { cn } from "@unfiddle/ui/utils"
import { atom, useAtom } from "jotai"
import * as React from "react"

const columnWidthsAtom = atom<Record<string, number>>({})

export function AlignedColumn({
   id,
   children,
   className = "",
}: {
   id: string
   children: React.ReactNode
   className?: string
}) {
   const [columnWidths, setColumnWidths] = useAtom(columnWidthsAtom)
   const [isMobile, setIsMobile] = React.useState(true)
   const elementRef = React.useRef<HTMLDivElement>(null)
   const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

   React.useEffect(() => {
      const checkDevice = (event: MediaQueryList | MediaQueryListEvent) =>
         setIsMobile(event.matches)
      const mediaQueryList = window.matchMedia(`(max-width: 1024px)`)
      checkDevice(mediaQueryList)
      mediaQueryList.addEventListener("change", checkDevice)
      return () => {
         mediaQueryList.removeEventListener("change", checkDevice)
      }
   }, [])

   React.useEffect(() => {
      if (!elementRef.current || isMobile) return

      const element = elementRef.current
      const resizeObserver = new ResizeObserver((entries) => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
         }

         timeoutRef.current = setTimeout(() => {
            const width = entries[0]?.contentRect.width
            const currentWidth = columnWidths[id] || 0

            if (width && width > currentWidth) {
               setColumnWidths((prev) => ({
                  ...prev,
                  [id]: width,
               }))
            }
         }, 10) // Small debounce
      })

      resizeObserver.observe(element)

      return () => {
         resizeObserver.disconnect()
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
         }
      }
   }, [id, columnWidths, isMobile, setColumnWidths])

   return (
      <div
         ref={elementRef}
         className={cn(
            "max-lg:![--min-width:auto] min-w-(--min-width)",
            className,
         )}
         style={{ "--min-width": `${columnWidths[id] || "auto"}px` } as never}
      >
         {children}
      </div>
   )
}
