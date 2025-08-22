import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { CURRENCIES, CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { Currency } from "@unfiddle/core/currency/types"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Field,
   FieldControl,
   FieldGroup,
   FieldLabel,
   Fieldset,
   FieldsetLegend,
} from "@unfiddle/ui/components/field"
import { NumberField } from "@unfiddle/ui/components/number-field"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectTriggerIcon,
   SelectValue,
} from "@unfiddle/ui/components/select"
import { Textarea } from "@unfiddle/ui/components/textarea"
import { formData } from "@unfiddle/ui/utils"
import * as React from "react"

type FormData = {
   name: string
   sellingPrice: string
   note: string
   client: string
   currency: Currency
}

export function EstimateForm({
   estimate,
   onSubmit,
   children,
}: {
   estimate?: RouterOutput["estimate"]["list"][number] | undefined
   onSubmit: (data: FormData) => void
   children: React.ReactNode
}) {
   const auth = useAuth()
   const [currency, setCurrency] = React.useState(estimate?.currency ?? "UAH")
   const formRef = React.useRef<HTMLFormElement>(null)
   // const fileUploaderRef = React.useRef<HTMLDivElement>(null)
   const attachments = useAttachments({ subjectId: auth.workspace.id })

   return (
      <form
         ref={formRef}
         className="mt-4 flex grow flex-col space-y-4"
         onSubmit={(e) => {
            e.preventDefault()
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && formRef.current?.contains(activeElement)) {
               activeElement.blur()
            }

            requestAnimationFrame(() => {
               const form = formData<FormData>(e.target)
               onSubmit({
                  ...form,
                  currency,
               })
            })
         }}
      >
         <FieldGroup className="grid-cols-[1fr_4rem] md:grid-cols-[1fr_4rem]">
            <Field>
               <FieldLabel>Назва</FieldLabel>
               <FieldControl
                  required
                  placeholder="Уведіть назву"
                  name="name"
                  defaultValue={estimate?.name ?? ""}
               />
            </Field>
            <Field>
               <FieldLabel className={"mb-2"}>Валюта</FieldLabel>
               <Select
                  value={currency}
                  onValueChange={setCurrency}
               >
                  <SelectTrigger
                     render={
                        <Button variant={"secondary"}>
                           <SelectValue placeholder={currency}>
                              {(label) => label}
                           </SelectValue>
                           <SelectTriggerIcon />
                        </Button>
                     }
                  />
                  <SelectPopup align="start">
                     {CURRENCIES.map((item) => (
                        <SelectItem
                           key={item}
                           value={item}
                        >
                           {item}
                        </SelectItem>
                     ))}
                  </SelectPopup>
               </Select>
            </Field>
         </FieldGroup>
         <Fieldset className={"mb-10 space-y-3 md:space-y-8"}>
            <FieldsetLegend className={"md:mb-4"}>Деталі</FieldsetLegend>
            <FieldGroup>
               <Field>
                  <FieldLabel>Ціна продажу</FieldLabel>
                  <NumberField
                     defaultValue={
                        estimate?.sellingPrice === 0
                           ? undefined
                           : estimate?.sellingPrice
                     }
                     name="sellingPrice"
                     placeholder={CURRENCY_SYMBOLS[currency]}
                  />
               </Field>
               <Field>
                  <FieldLabel>Клієнт</FieldLabel>
                  <FieldControl
                     name="client"
                     placeholder="Ім'я клієнта"
                     defaultValue={estimate?.client ?? ""}
                  />
               </Field>
            </FieldGroup>
            <div>
               <Field>
                  <FieldLabel>Комент</FieldLabel>
                  <div className="relative w-full">
                     <FieldControl
                        render={
                           <Textarea
                              name="note"
                              placeholder="Додайте комент"
                              defaultValue={estimate?.note}
                              onPaste={(e) => attachments.onPaste(e)}
                           />
                        }
                     />
                     {/* {estimate ? null : (
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
                     )} */}
                  </div>
               </Field>
               {/* <div className="mt-4 flex flex-wrap gap-2 empty:hidden">
                  {attachments.uploaded.map((file, idx) => (
                     <UploadedAttachment
                        key={idx}
                        file={file}
                        onRemove={() => attachments.remove(file.id)}
                     />
                  ))}
               </div> */}
            </div>
         </Fieldset>
         {/* <FileUploader
            ref={fileUploaderRef}
            className="absolute inset-0 z-[9] h-full"
            onUpload={attachments.upload.mutateAsync}
         /> */}
         {children}
      </form>
   )
}
