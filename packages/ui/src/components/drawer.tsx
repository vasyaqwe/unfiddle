import { DIALOG_STYLES } from "@unfiddle/ui/components/dialog/constants"
import { useAtomValue } from "jotai"
import { Drawer as DrawerPrimitive } from "vaul-base"
import { isMobileAtom } from "../store"
import { cn, cx } from "../utils"
import { Separator } from "./separator"

function Drawer({
   ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
   const isMobile = useAtomValue(isMobileAtom)
   return (
      <DrawerPrimitive.Root
         direction={isMobile ? "bottom" : "right"}
         {...props}
      />
   )
}

const DrawerTrigger: typeof DrawerPrimitive.Trigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose: typeof DrawerPrimitive.Close = DrawerPrimitive.Close
const DrawerBackdrop: typeof DrawerPrimitive.Overlay = DrawerPrimitive.Overlay

function DrawerPopup({
   className,
   children,
   ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
   return (
      <DrawerPortal>
         <DrawerBackdrop
            className={cx(DIALOG_STYLES.backdrop, "bg-black/45")}
         />
         <DrawerPrimitive.Content
            className={cn(
               DIALOG_STYLES.popup,
               "fixed bottom-0 z-50 flex h-[86svh] w-full flex-col overflow-hidden p-0 after:hidden max-md:inset-x-0 max-md:rounded-b-none md:inset-[0.6rem_0.6rem_0.6rem_auto] md:h-auto md:max-w-xl md:rounded-xl",
               className,
            )}
            {...props}
         >
            <div className="flex w-full grow flex-col overflow-y-auto p-4 max-md:pt-0 md:pt-5">
               <div className="mx-auto mt-0.5 mb-5 h-[5px] w-8 shrink-0 rounded-full bg-surface-8 md:hidden" />
               {children}
            </div>
         </DrawerPrimitive.Content>
      </DrawerPortal>
   )
}

function DrawerSeparator({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <Separator
         className={cn("-mx-4 md:-mx-5 my-5 bg-surface-4", className)}
         {...props}
      />
   )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div
         className={cn("mt-auto flex justify-between gap-2", className)}
         {...props}
      />
   )
}

function DrawerTitle({
   className,
   ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
   return (
      <DrawerPrimitive.Title
         className={cn(
            DIALOG_STYLES.title,
            "-mt-[0.35rem] max-md:hidden",
            className,
         )}
         {...props}
      />
   )
}

function DrawerDescription({
   className,
   ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
   return (
      <DrawerPrimitive.Description
         className={cn(DIALOG_STYLES.description, className)}
         {...props}
      />
   )
}

export {
   Drawer,
   DrawerPortal,
   DrawerBackdrop,
   DrawerTrigger,
   DrawerSeparator,
   DrawerClose,
   DrawerPopup,
   DrawerFooter,
   DrawerTitle,
   DrawerDescription,
}
