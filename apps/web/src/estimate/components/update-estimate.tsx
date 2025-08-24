import { useAuth } from "@/auth/hooks"
import { EstimateForm } from "@/estimate/components/estimate-form"
import { useUpdateEstimate } from "@/estimate/mutations/use-update-estimate"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { Button } from "@unfiddle/ui/components/button"

import {
   Drawer,
   DrawerClose,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"

interface Props {
   estimateId: string
   finalFocus: React.RefObject<HTMLElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}

export function UpdateEstimate({
   estimateId,
   finalFocus,
   open,
   setOpen,
}: Props) {
   const auth = useAuth()
   const mutation = useUpdateEstimate({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerPopup
            onClick={(e) => {
               e.stopPropagation()
            }}
            finalFocus={finalFocus}
         >
            <DrawerTitle>Редагувати прорахунок</DrawerTitle>
            <SuspenseBoundary>
               <EstimateForm
                  open={open}
                  onSubmit={(form) =>
                     mutation.mutate({
                        estimateId,
                        workspaceId: auth.workspace.id,
                        name: form.name,
                        sellingPrice: number(form.sellingPrice),
                        note: form.note,
                        client: form.client.length === 0 ? null : form.client,
                        currency: form.currency,
                     })
                  }
                  estimateId={estimateId}
               >
                  <DrawerFooter>
                     <Button>Зберегти</Button>
                     <DrawerClose
                        render={
                           <Button variant={"secondary"}>Відмінити</Button>
                        }
                     />
                  </DrawerFooter>
               </EstimateForm>
            </SuspenseBoundary>
         </DrawerPopup>
      </Drawer>
   )
}
