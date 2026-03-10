import { cn } from "../utils"

export function Kbd({
   className,
   children,
   ...props
}: React.ComponentProps<"kbd">) {
   const isMac =
      typeof window === "undefined"
         ? true
         : navigator.platform.toUpperCase().indexOf("MAC") >= 0

   return (
      <kbd
         data-kbd
         className={cn(
            `ml-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center gap-0.75 rounded-sm bg-surface-11/75 px-1.5 text-sm shadow-black/35 shadow-sm`,
            className,
         )}
         {...props}
      >
         {typeof children === "string" && children === "Ctrl" && isMac ? (
            <>
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-px size-3.75"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
               </svg>
            </>
         ) : (
            children
         )}
      </kbd>
   )
}
