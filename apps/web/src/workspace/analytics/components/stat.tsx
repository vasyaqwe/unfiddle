import { cn } from "@ledgerblocks/ui/utils"
import { useSearch } from "@tanstack/react-router"

export function Stat({ className, ...props }: React.ComponentProps<"p">) {
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })
   const multipleSelected =
      (search.who.length > 1 && search.period_comparison.length === 0) ||
      search.period_comparison.length > 1

   return (
      <div
         className={cn(
            "first:!pt-0 last:!pb-0 flex items-center gap-1 py-3 lg:py-4",
            multipleSelected ? "xl:min-h-[42px]" : "",
            className,
         )}
         {...props}
      />
   )
}

export function StatLabel({
   className,
   ...props
}: React.ComponentProps<"span">) {
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })
   const multipleSelected =
      (search.who.length > 1 && search.period_comparison.length === 0) ||
      search.period_comparison.length > 1
   if (!multipleSelected) return null

   return (
      <span
         className={cn(
            "mr-auto line-clamp-1 font-medium text-foreground/75 text-sm sm:text-base",
            className,
         )}
         {...props}
      />
   )
}

export function StatValue({
   className,
   ...props
}: React.ComponentProps<"span">) {
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })
   const multipleSelected =
      (search.who.length > 1 && search.period_comparison.length === 0) ||
      search.period_comparison.length > 1

   return (
      <span
         className={cn(
            "font-mono font-semibold",
            multipleSelected
               ? "text-[1.15rem]/0 sm:text-xl lg:text-[1.5rem]/6"
               : "text-[1.4rem]/7 sm:text-2xl lg:text-[1.7rem]/8",
            className,
         )}
         {...props}
      />
   )
}

export function StatValueSup({
   className,
   ...props
}: React.ComponentProps<"sup">) {
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })
   const multipleSelected =
      (search.who.length > 1 && search.period_comparison.length === 0) ||
      search.period_comparison.length > 1

   return (
      <sup
         className={cn(
            multipleSelected
               ? "xl:-top-1.5 -top-1 text-xs max-sm:hidden lg:text-sm"
               : "xl:-top-2 -top-1.5 text-base",
            className,
         )}
         {...props}
      />
   )
}
