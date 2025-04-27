import { cn } from "../utils"

export function Table({
   className,
   children,
   ...props
}: React.ComponentProps<"div">) {
   return (
      <div
         className={cn(
            "scrollbar-hidden relative size-full overflow-x-auto",
            className,
         )}
         {...props}
      >
         <table className={cn("w-full border-collapse text-sm")}>
            {children}
         </table>
      </div>
   )
}

export function TableHeader({
   className,
   ...props
}: React.ComponentProps<"thead">) {
   return (
      <thead
         className={cn("text-left font-medium", className)}
         {...props}
      />
   )
}

export function TableBody({
   className,
   ...props
}: React.ComponentProps<"tbody">) {
   return (
      <tbody
         className={cn("", className)}
         {...props}
      />
   )
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
   return (
      <tr
         className={cn(
            "border-neutral border-t has-[th]:border-none",
            className,
         )}
         {...props}
      />
   )
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
   return (
      <th
         className={cn(
            "whitespace-nowrap px-4 py-2 font-medium text-foreground/75 first:pl-(--container-padding) last:pr-(--container-padding)",
            className,
         )}
         {...props}
      />
   )
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
   return (
      <td
         className={cn(
            "whitespace-nowrap px-4 py-3 first:pl-(--container-padding) last:pr-(--container-padding)",
            className,
         )}
         {...props}
      />
   )
}
