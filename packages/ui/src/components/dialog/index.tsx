import { Dialog as DialogPrimitive } from "@base-ui-components/react/dialog"
import { Button } from "@ledgerblocks/ui/components/button"
import { Icons } from "@ledgerblocks/ui/components/icons"
import type { VariantProps, } from "class-variance-authority"
import { cn, cx } from "../../utils"
import { DIALOG_STYLES, dialog } from "./constants"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogPortal = DialogPrimitive.Portal
export const DialogBackdrop = DialogPrimitive.Backdrop

export function DialogPopup({
   className,
   children,
   size,
   ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> &
   VariantProps<typeof dialog>) {
   return (
      <DialogPortal>
         <DialogBackdrop className={DIALOG_STYLES.backdrop} />
         <DialogPrimitive.Popup
            className={cn(
               dialog({
                  size,
                  className: cx(
                     DIALOG_STYLES.transition,
                     DIALOG_STYLES.popup,
                     DIALOG_STYLES.center,
                     className,
                  ),
               }),
            )}
            {...props}
         >
            {children}
         </DialogPrimitive.Popup>
      </DialogPortal>
   )
}

export function DialogXClose({
   className,
   ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
   return (
      <DialogClose
         render={
            <Button
               className={cn("-mr-1.5 -mt-0.5 float-right", className)}
               variant={"ghost"}
               kind={"icon"}
            >
               <Icons.xMark />
            </Button>
         }
         {...props}
      />
   )
}

export function DialogTitle({
   className,
   ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
   return (
      <DialogPrimitive.Title
         className={cn(DIALOG_STYLES.title, className)}
         {...props}
      />
   )
}

export function DialogDescription({
   className,
   ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
   return (
      <DialogPrimitive.Description
         className={cn(DIALOG_STYLES.description, className)}
         {...props}
      />
   )
}

export function DialogFooter({
   className,
   ...props
}: React.ComponentProps<"div">) {
   return (
      <div
         className={cn(DIALOG_STYLES.footer, className)}
         {...props}
      />
   )
}
