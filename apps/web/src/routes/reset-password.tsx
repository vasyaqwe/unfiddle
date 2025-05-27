import { authClient } from "@/auth"
import { validator } from "@/validator"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MIN_PASSWORD_LENGTH } from "@unfiddle/core/auth/constants"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldLabel } from "@unfiddle/ui/components/field"
import { PasswordInput } from "@unfiddle/ui/components/input"
import { Logo } from "@unfiddle/ui/components/logo"
import { formData } from "@unfiddle/ui/utils"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/reset-password")({
   component: RouteComponent,
   validateSearch: validator(z.object({ token: z.string().optional() })),
})

function RouteComponent() {
   const search = Route.useSearch()
   const navigate = useNavigate()

   const reset = useMutation({
      mutationFn: async (json: { newPassword: string }) => {
         const res = await authClient.resetPassword({
            newPassword: json.newPassword,
            token: search.token,
         })

         if (res.error) throw res.error
      },
      onSuccess: () => {
         toast.success("Пароль змінено!", {
            description: "Увійдіть у аккаунт за новим паролем",
         })
         navigate({ to: "/" })
      },
   })

   return (
      <main className="grid h-svh w-full place-items-center bg-background">
         <div className="w-full max-w-[21rem] px-5">
            <form
               onSubmit={async (e) => {
                  e.preventDefault()
                  const form = formData<{
                     password: string
                  }>(e.target)

                  reset.mutate({ newPassword: form.password })
               }}
            >
               <Logo />
               <h1 className="mt-3 font-semibold text-foreground/75 text-lg">
                  Створіть новий пароль
               </h1>
               <Field>
                  <FieldLabel className={"mt-5"}>Пароль</FieldLabel>
                  <PasswordInput
                     name="password"
                     minLength={MIN_PASSWORD_LENGTH}
                  />
               </Field>
               <Button
                  disabled={reset.isPending || reset.isSuccess}
                  pending={reset.isPending || reset.isSuccess}
                  size={"lg"}
                  className="mt-5 w-full"
               >
                  Підтвердити
               </Button>
            </form>
         </div>
      </main>
   )
}
