import { UploadedAttachment } from "@/attachment/components/uploaded-attachment"
import { useAttachments } from "@/attachment/hooks"
import { FileUploader } from "@/file/components/uploader"
import { useOrder } from "@/order/hooks"
import { CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { Procurement } from "@unfiddle/core/procurement/types"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { Icons } from "@unfiddle/ui/components/icons"
import { NumberField } from "@unfiddle/ui/components/number-field"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
} from "@unfiddle/ui/components/select"
import { Textarea } from "@unfiddle/ui/components/textarea"
import { formData } from "@unfiddle/ui/utils"
import * as React from "react"

type FormData = {
   note: string
   quantity: string
   purchasePrice: string
   provider: string
   orderItemId: string
}

export function ProcurementForm({
   procurement,
   onSubmit,
   children,
}: {
   procurement?: Procurement
   onSubmit: (data: FormData) => void
   children: React.ReactNode
}) {
   const order = useOrder()
   const formRef = React.useRef<HTMLFormElement>(null)
   const fileUploaderRef = React.useRef<HTMLDivElement>(null)
   const attachments = useAttachments({
      subjectId: procurement?.id ?? `${order.id}_procurement`,
   })

   return (
      <form
         ref={formRef}
         className="mt-4 flex grow flex-col space-y-3 md:space-y-8"
         onSubmit={(e) => {
            e.preventDefault()
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && formRef.current?.contains(activeElement)) {
               activeElement.blur()
            }

            requestAnimationFrame(() => {
               onSubmit(formData<FormData>(e.target))
            })
         }}
      >
         <Field>
            <FieldLabel>Замовлення</FieldLabel>
            <FieldControl
               defaultValue={order.name}
               readOnly
               disabled
            />
         </Field>
         <Field>
            <FieldLabel className={"mb-2.5"}>Товар</FieldLabel>
            <Select
               required
               name="orderItemId"
               defaultValue={procurement?.orderItemId ?? order.items[0]?.id}
            >
               <SelectTrigger className={"w-full"} />
               <SelectPopup align="start">
                  {order.items.map((item) => (
                     <SelectItem
                        key={item.id}
                        value={item.id}
                     >
                        {item.name}
                     </SelectItem>
                  ))}
               </SelectPopup>
            </Select>
         </Field>
         <div className="grid grid-cols-2 gap-3">
            <Field>
               <FieldLabel>Кількість</FieldLabel>
               <NumberField
                  required
                  defaultValue={procurement?.quantity}
                  name="quantity"
                  placeholder="шт."
                  min={1}
               />
            </Field>
            <Field>
               <FieldLabel>Ціна</FieldLabel>
               <NumberField
                  required
                  defaultValue={procurement?.purchasePrice}
                  name="purchasePrice"
                  placeholder={CURRENCY_SYMBOLS[order.currency]}
                  min={1}
               />
            </Field>
         </div>
         <Field>
            <FieldLabel>Постачальник</FieldLabel>
            <FieldControl
               name="provider"
               placeholder="Уведіть постачальника"
               defaultValue={procurement?.provider ?? ""}
            />
         </Field>
         <div>
            <Field>
               <FieldLabel>Комент</FieldLabel>
               <div className="relative w-full">
                  <FieldControl
                     render={
                        <Textarea
                           className="pr-12"
                           name="note"
                           placeholder="Додайте комент"
                           defaultValue={procurement?.note ?? ""}
                           onPaste={(e) => attachments.onPaste(e)}
                        />
                     }
                  />
                  <Button
                     type="button"
                     onClick={() => {
                        fileUploaderRef.current?.click()
                     }}
                     kind={"icon"}
                     variant={"ghost"}
                     className="absolute top-1 right-1"
                  >
                     <Icons.paperClip />
                  </Button>
               </div>
            </Field>
            <div className="mt-4 flex flex-wrap gap-2 empty:hidden">
               {procurement?.attachments?.map((file) => (
                  <UploadedAttachment
                     key={file.id}
                     file={file}
                  />
               ))}
               {attachments.uploaded.map((file, idx) => (
                  <UploadedAttachment
                     key={idx}
                     file={file}
                     onRemove={() => attachments.remove(file.id)}
                  />
               ))}
            </div>
         </div>
         <FileUploader
            ref={fileUploaderRef}
            className="absolute inset-0 z-[9] h-full"
            onUpload={attachments.upload.mutateAsync}
         />
         {children}
      </form>
   )
}
