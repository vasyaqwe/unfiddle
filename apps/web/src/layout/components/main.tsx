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
            "flex h-[calc(100svh-var(--bottom-navigation-height))] grow overflow-hidden bg-primary shadow-xs md:mt-[0.5rem] md:mr-[0.5rem] md:h-[calc(100svh-16px)] md:grow md:rounded-lg md:border md:border-neutral",
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
   virtualized?: boolean
}

export function MainScrollArea({
   children,
   className,
   containerClassName,
   virtualized = false,
   ...props
}: Props) {
   return (
      <ScrollArea
         className={cn("pt-4 pb-14 lg:pt-8", className)}
         {...props}
      >
         {virtualized ? (
            children
         ) : (
            <div className={cn("container", containerClassName)}>
               {children}
            </div>
         )}
      </ScrollArea>
   )
}
