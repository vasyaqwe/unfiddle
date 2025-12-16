import { Button } from "@unfiddle/ui/components/button"
import {
   AlertDialog,
   AlertDialogClose,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogPopup,
   AlertDialogTitle,
} from "@unfiddle/ui/components/dialog/alert"

interface Props extends React.ComponentProps<typeof AlertDialog> {
   clientName: string
   finalFocus: React.RefObject<HTMLElement | null>
   action: () => void
}

export function DeleteClientAlert({
   clientName,
   finalFocus,
   action,
   ...props
}: Props) {
   return (
      <AlertDialog {...props}>
         <AlertDialogPopup
            finalFocus={finalFocus}
            onClick={(e) => e.stopPropagation()}
         >
            <AlertDialogTitle>Видалити {clientName}? </AlertDialogTitle>
            <AlertDialogDescription>
               Клієнта буде видалене назавжди.
            </AlertDialogDescription>
            <AlertDialogFooter>
               <AlertDialogClose
                  render={<Button variant="secondary">Відмінити</Button>}
               />
               <AlertDialogClose
                  render={
                     <Button
                        variant={"destructive"}
                        onClick={action}
                     >
                        Видалити
                     </Button>
                  }
               />
            </AlertDialogFooter>
         </AlertDialogPopup>
      </AlertDialog>
   )
}
