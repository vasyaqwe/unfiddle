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

export function ArchiveOrderAlert({
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
            <AlertDialogTitle>Архівувати {orderName}?</AlertDialogTitle>
            <AlertDialogDescription>
               Замовлення не буде повністю видалене, лише{" "}
               <br className="max-sm:hidden" /> переміщене в архівовані.
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
                        Архівувати
                     </Button>
                  }
               />
            </AlertDialogFooter>
         </AlertDialogPopup>
      </AlertDialog>
   )
}
