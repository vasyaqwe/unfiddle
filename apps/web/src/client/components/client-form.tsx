import {
   CLIENT_SEVERITIES,
   CLIENT_SEVERITIES_TRANSLATION,
} from "@unfiddle/core/client/constants"
import type { ClientSeverity } from "@unfiddle/core/client/types"
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
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectTriggerIcon,
   SelectValue,
} from "@unfiddle/ui/components/select"
import { formData } from "@unfiddle/ui/utils"
import * as React from "react"

type FormData = {
   name: string
   severity: ClientSeverity
}

interface Props {
   client?: RouterOutput["client"]["list"][number]
   onSubmit: (data: FormData) => void
   children: React.ReactNode
   open?: boolean | undefined
}

export function ClientForm(props: Props) {
   // if (props.clientId && props.open) return <WithExistingData {...props} />

   return <Form {...props} />
}

// function WithExistingData(props: Props) {
//    const auth = useAuth()
//    const client = useSuspenseQuery(
//       trpc.client.one.queryOptions({
//          clientId: props.clientId ?? "",
//          workspaceId: auth.workspace.id,
//       }),
//    ).data

//    if (client === null)
//       return (
//          <p className="absolute inset-0 m-auto size-fit text-center text-muted">
//             Клієнта не знайдено. Можливо, його видалили.
//          </p>
//       )

//    return (
//       <Form
//          client={client}
//          {...props}
//       />
//    )
// }

export function Form({
   onSubmit,
   children,
   client,
}: { client?: RouterOutput["client"]["list"][number] } & Props) {
   const formRef = React.useRef<HTMLFormElement>(null)

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
               onSubmit(form)
            })
         }}
      >
         <FieldGroup className="grid-cols-[1fr_4rem] md:grid-cols-[1fr_4rem]">
            <Field>
               <FieldLabel>Ім'я</FieldLabel>
               <FieldControl
                  required
                  placeholder="Уведіть ім'я"
                  name="name"
                  defaultValue={client?.name ?? ""}
               />
            </Field>
         </FieldGroup>
         <Fieldset className={"mb-10 space-y-4 md:space-y-8"}>
            <FieldsetLegend className={"md:mb-4"}>Деталі</FieldsetLegend>
            <FieldGroup>
               {" "}
               <Field>
                  <FieldLabel className={"mb-2.5"}>Пріоритет</FieldLabel>
                  <Select
                     name="severity"
                     defaultValue={client?.severity ?? "low"}
                  >
                     <SelectTrigger
                        render={
                           <Button
                              variant={"secondary"}
                              className="w-full justify-start"
                           >
                              <SelectValue>
                                 {(v) =>
                                    CLIENT_SEVERITIES_TRANSLATION[v as never]
                                 }
                              </SelectValue>
                              <SelectTriggerIcon />
                           </Button>
                        }
                     />
                     <SelectPopup align="start">
                        {CLIENT_SEVERITIES.map((s) => (
                           <SelectItem
                              key={s}
                              value={s}
                              label={CLIENT_SEVERITIES_TRANSLATION[s]}
                           >
                              {CLIENT_SEVERITIES_TRANSLATION[s]}
                           </SelectItem>
                        ))}
                     </SelectPopup>
                  </Select>
               </Field>
            </FieldGroup>
         </Fieldset>
         {children}
      </form>
   )
}
