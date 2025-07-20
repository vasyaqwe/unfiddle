import { cn } from "../utils"

export const CARD_STYLES = {
   base: "rounded-xl border relative before:absolute before:inset-0 has-[[data-card-header]]:before:bg-surface-2 before:rounded-xl before:z-[-1] isolate border-surface-12/12 bg-background dark:bg-surface-2 dark:border-neutral p-4 shadow-md/4 has-[[data-card-header]]:border-none has-[[data-card-header]]:p-0",
   title: "font-semibold text-[0.9rem] sm:text-base leading-none",
   description: "mt-2 text-foreground/80 text-sm",
   header: "px-4 py-3 bg-surface-2 rounded-t-xl",
   content:
      "p-4 xl:p-5 border border-surface-12/12 bg-background dark:bg-surface-2 dark:border-surface-4 rounded-xl",
   footer: "border-t mt-4 text-foreground/60 pt-3 border-neutral",
}

export function Card({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div
         className={cn(CARD_STYLES.base, className)}
         {...props}
      />
   )
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
   return (
      <h2
         className={cn(CARD_STYLES.title, className)}
         {...props}
      />
   )
}

export function CardDescription({
   className,
   ...props
}: React.ComponentProps<"p">) {
   return (
      <p
         className={cn(CARD_STYLES.description, className)}
         {...props}
      />
   )
}

export function CardHeader({
   className,
   ...props
}: React.ComponentProps<"header">) {
   return (
      <header
         data-card-header
         className={cn(CARD_STYLES.header, className)}
         {...props}
      />
   )
}

export function CardContent({
   className,
   ...props
}: React.ComponentProps<"div">) {
   return (
      <div
         className={cn(CARD_STYLES.content, className)}
         {...props}
      />
   )
}

export function CardFooter({
   className,
   ...props
}: React.ComponentProps<"div">) {
   return (
      <div
         className={cn(CARD_STYLES.footer, className)}
         {...props}
      />
   )
}
