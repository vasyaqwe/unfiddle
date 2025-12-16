import { useAuth } from "@/auth/hooks"
import { ClientForm } from "@/client/components/client-form"
import { useUpdateClient } from "@/client/mutations/use-update-client"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerClose,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"

interface Props {
   clientId: string
   finalFocus: React.RefObject<HTMLElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}

export function UpdateClient({ clientId, finalFocus, open, setOpen }: Props) {
   const auth = useAuth()
   const mutation = useUpdateClient({
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
            <DrawerTitle>Редагувати клієнта</DrawerTitle>
            <SuspenseBoundary>
               <ClientForm
                  open={open}
                  onSubmit={(form) =>
                     mutation.mutate({
                        clientId,
                        workspaceId: auth.workspace.id,
                        name: form.name,
                        severity: form.severity,
                     })
                  }
                  clientId={clientId}
               >
                  <DrawerFooter>
                     <Button>Зберегти</Button>
                     <DrawerClose
                        render={
                           <Button variant={"secondary"}>Відмінити</Button>
                        }
                     />
                  </DrawerFooter>
               </ClientForm>
            </SuspenseBoundary>
         </DrawerPopup>
      </Drawer>
   )
}
