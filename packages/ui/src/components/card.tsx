import { cn } from "../utils"

export const CARD_STYLES = {
   base: "rounded-2xl border border-neutral bg-primary-1 p-4 shadow-xs has-[[data-card-header]]:p-0 dark:bg-[#1f1f1f] dark:shadow-lg",
   title: "font-medium text-lg leading-none",
   description: "mt-2 text-primary-11 text-sm",
   header: "border-b p-4",
   content: "p-4",
   footer: "border-t p-4",
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
