import { Link, type LinkProps } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"

export function ChatLink({
   unreadCount,
   className,
   ...props
}: {
   unreadCount: number
   className?: string
} & LinkProps) {
   return (
      <Tooltip>
         <TooltipTrigger
            delay={0}
            render={
               <Button
                  kind={"icon"}
                  variant={"secondary"}
                  nativeButton={false}
                  className={className}
                  render={<Link {...props} />}
               >
                  <Icons.chat className="size-4.75" />
                  {unreadCount === 0 ? null : (
                     <span className="motion-scale-in motion-duration-150 absolute top-0.5 right-0.5 size-2 rounded-full bg-red-9" />
                  )}
               </Button>
            }
         />
         {unreadCount === 0 ? null : (
            <TooltipPopup>
               {unreadCount}{" "}
               {unreadCount === 1 ? "нове повідомлення" : "нових повідомлень"}
            </TooltipPopup>
         )}
      </Tooltip>
   )
}
