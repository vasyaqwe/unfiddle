import { trpc } from "@/trpc"
import { BackButton } from "@/ui/components/back-button"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Field,
   FieldControl,
   FieldLabel,
} from "@ledgerblocks/ui/components/field"
import { Icons } from "@ledgerblocks/ui/components/icons"
import { formData } from "@ledgerblocks/ui/utils"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/new")({
   component: RouteComponent,
})

function RouteComponent() {
   const navigate = useNavigate()

   const create = useMutation(
      trpc.workspace.create.mutationOptions({
         onSuccess: (workspaceId) =>
            navigate({
               to: "/$workspaceId",
               params: { workspaceId },
            }),
      }),
   )

   return (
      <main className={"flex h-svh grow flex-col items-center justify-center"}>
         <BackButton
            size={"lg"}
            kind={"icon"}
            variant={"ghost"}
            aria-label="Back"
            className="absolute top-3 left-3 md:top-5 md:left-5"
         >
            <Icons.arrowLeft />
         </BackButton>
         <form
            onSubmit={async (e) => {
               e.preventDefault()
               const form = formData<{ name: string }>(e.target)

               create.mutate({ name: form.name })
            }}
            className="mx-auto w-full max-w-[21rem] px-5"
         >
            <h1 className="mb-4 text-xl">Створіть проєкт</h1>
            <Field>
               <FieldLabel>Ім'я</FieldLabel>
               <FieldControl
                  autoFocus
                  required
                  name="name"
                  placeholder="Над чим працюєте?"
               />
            </Field>
            <Button
               pending={create.isPending || create.isSuccess}
               disabled={create.isPending || create.isSuccess}
               size={"lg"}
               className="mt-7 w-full"
            >
               Створити
            </Button>
         </form>
      </main>
   )
}
