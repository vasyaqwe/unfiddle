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
   orderName: string
   finalFocus: React.RefObject<HTMLElement | null>
   action: () => void
}

export function DeleteOrderAlert({
   orderName,
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
            <AlertDialogTitle>Видалити {orderName}? </AlertDialogTitle>
            <AlertDialogDescription>
               Замовлення буде видалене назавжди, разом{" "}
               <br className="max-sm:hidden" /> із всіми його закупівлями.
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
