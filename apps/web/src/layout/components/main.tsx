import { ScrollArea } from "@ledgerblocks/ui/components/scroll-area"
import { cn, cx } from "@ledgerblocks/ui/utils"

export function Main({
   children,
   className,
   innerClassName,
}: {
   children?: React.ReactNode
   className?: string
   innerClassName?: string
}) {
   return (
      <main
         className={cx(
            "flex h-[calc(100svh-var(--bottom-navigation-height))] grow overflow-hidden bg-background md:mt-[0.5rem] md:mr-[0.5rem] md:h-[calc(100svh-16px)] md:grow md:rounded-lg md:border md:border-surface-12/13 md:shadow-xs",
            className,
         )}
      >
         <div className={cx("relative flex grow flex-col", innerClassName)}>
            {children}
         </div>
      </main>
   )
}

interface Props extends React.ComponentProps<"div"> {
   containerClassName?: string
   container?: boolean
   virtualized?: boolean
}

export function MainScrollArea({
   children,
   className,
   containerClassName,
   container = true,
   virtualized = false,
   ...props
}: Props) {
   return (
      <ScrollArea
         data-main-scroll-area
         className={cn(
            "flex flex-col pt-4 lg:pt-8",
            container ? "pb-14" : "",
            className,
         )}
         {...props}
      >
         {virtualized ? (
            children
         ) : (
            <div
               className={cn(
                  "flex grow flex-col",
                  container ? "container" : "",
                  containerClassName,
               )}
            >
               {children}
            </div>
         )}
      </ScrollArea>
   )
}
