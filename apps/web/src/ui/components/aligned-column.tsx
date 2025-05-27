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

   return (
      <div
         ref={(el) => {
            if (!el || isMobile) return

            const width = el.getBoundingClientRect().width
            if (!columnWidths[id] || width > columnWidths[id]) {
               setColumnWidths((prev) => ({
                  ...prev,
                  [id]: width,
               }))
            }
         }}
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
