import { CACHE_SHORT } from "@/api"
import { ClientSeverityIcon } from "@/client/components/client-severity-icon"
import { trpc } from "@/trpc"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import {
   Combobox,
   ComboboxEmpty,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
   ComboboxTriggerIcon,
} from "@unfiddle/ui/components/combobox"
import { Field, FieldLabel } from "@unfiddle/ui/components/field"

export function ClientCombobox({
   clientId,
   setClientId,
}: {
   clientId?: string | undefined
   setClientId: React.Dispatch<React.SetStateAction<string | undefined>>
}) {
   const params = useParams({ from: "/_authed/$workspaceId/_layout" })
   const data = useSuspenseQuery(
      trpc.client.list.queryOptions(
         {
            workspaceId: params.workspaceId,
         },
         {
            staleTime: CACHE_SHORT,
         },
      ),
   ).data

   return (
      <Field>
         <FieldLabel className={"mb-2.5"}>Клієнт</FieldLabel>
         <Combobox
            canBeEmpty
            value={clientId}
            onValueChange={(v) =>
               setClientId((prev) => (prev && prev === v ? undefined : v))
            }
         >
            <ComboboxTrigger
               render={
                  <Button
                     className={"w-full"}
                     variant={"secondary"}
                  >
                     {data.find((c) => c.id === clientId)?.name ??
                        "Оберіть клієнта"}
                     <ComboboxTriggerIcon />
                  </Button>
               }
            />
            <ComboboxPopup
               align="end"
               className={"min-w-(--anchor-width)!"}
            >
               <ComboboxInput placeholder="Шукати.." />
               <ComboboxEmpty>Нічого не знайдено</ComboboxEmpty>
               {data.map((c) => (
                  <ComboboxItem
                     key={c.id}
                     value={c.id}
                     keywords={[c.name]}
                  >
                     <ClientSeverityIcon severity={c.severity} />
                     {c.name}
                  </ComboboxItem>
               ))}
            </ComboboxPopup>
         </Combobox>
      </Field>
   )
}
