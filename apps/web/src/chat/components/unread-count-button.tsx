import { ArrowDown02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@unfiddle/ui/components/button"

export function UnreadCountButton({
   children,
   ...props
}: React.ComponentProps<typeof Button>) {
   return (
      <Button
         variant={"tertiary"}
         className={
            "fixed bottom-18 left-[calc(var(--sidebar-width)+1rem)] z-50 w-fit border-transparent bg-red-11 font-medium text-white shadow-md hover:bg-red-10 active:bg-red-11"
         }
         {...props}
      >
         <HugeiconsIcon
            icon={ArrowDown02Icon}
            className="size-4"
         />
         {children}
      </Button>
   )
}
