import { Dialog as DialogPrimitive } from "@base-ui-components/react/dialog"
import { cn } from "../../utils"
import { DIALOG_STYLES } from "./constants"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogPortal = DialogPrimitive.Portal
export const DialogBackdrop = DialogPrimitive.Backdrop

export function DialogPopup({
   className,
   children,
   ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup>) {
   return (
      <DialogPortal>
         <DialogBackdrop className={DIALOG_STYLES.backdrop} />
         <DialogPrimitive.Popup
            className={cn(
               DIALOG_STYLES.transition,
               DIALOG_STYLES.popup,
               className,
            )}
            {...props}
         >
            {children}
         </DialogPrimitive.Popup>
      </DialogPortal>
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
