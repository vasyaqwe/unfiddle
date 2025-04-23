import { AlertDialog as AlertDialogPrimitive } from "@base-ui-components/react/alert-dialog"
import { cn } from "../../utils"
import { DIALOG_STYLES } from "./constants"

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogClose = AlertDialogPrimitive.Close
export const AlertDialogPortal = AlertDialogPrimitive.Portal
export const AlertDialogBackdrop = AlertDialogPrimitive.Backdrop

export function AlertDialogPopup({
   className,
   children,
   ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
   return (
      <AlertDialogPortal>
         <AlertDialogBackdrop className={DIALOG_STYLES.backdrop} />
         <AlertDialogPrimitive.Popup
            className={cn(
               DIALOG_STYLES.transition,
               DIALOG_STYLES.popup,
               className,
            )}
            {...props}
         >
            {children}
         </AlertDialogPrimitive.Popup>
      </AlertDialogPortal>
   )
}

export function AlertDialogTitle({
   className,
   ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
   return (
      <AlertDialogPrimitive.Title
         className={cn(DIALOG_STYLES.title, className)}
         {...props}
      />
   )
}

export function AlertDialogDescription({
   className,
   ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
   return (
      <AlertDialogPrimitive.Description
         className={cn(DIALOG_STYLES.description, className)}
         {...props}
      />
   )
}

export function AlertDialogFooter({
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
