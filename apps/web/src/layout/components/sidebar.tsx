import { cn } from "@unfiddle/ui/utils"

export function Sidebar({
   children,
   className,
   ...props
}: React.ComponentProps<"aside">) {
   return (
      <aside
         className={cn(
            "z-[10] h-svh w-[14rem] shrink-0 max-md:hidden lg:w-[14.5rem] 2xl:w-[15.5rem]",
            className,
         )}
         {...props}
      >
         <div className="fixed flex h-full w-[14rem] flex-col lg:w-[14.5rem] 2xl:w-[15.5rem]">
            {children}
         </div>
      </aside>
   )
}
