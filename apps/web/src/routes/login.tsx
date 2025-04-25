import { authClient } from "@/auth"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { MIN_PASSWORD_LENGTH } from "@unfiddle/core/auth/constants"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { formData } from "@unfiddle/ui/utils"

export const Route = createFileRoute("/login")({
   component: RouteComponent,
})

function RouteComponent() {
   const navigate = useNavigate()

   const signin = useMutation({
      mutationFn: async (json: { email: string; password: string }) => {
         const res = await authClient.signIn.email({
            email: json.email,
            password: json.password,
            rememberMe: true,
         })
         if (res.error) throw res.error
      },
      onSuccess: () => {
         navigate({ to: "/" })
      },
   })

   return (
      <div className="grid h-svh w-full place-items-center">
         <div className="w-full max-w-xs px-5">
            <form
               onSubmit={async (e) => {
                  e.preventDefault()
                  const form = formData<{
                     email: string
                     password: string
                  }>(e.target)

                  signin.mutate({ email: form.email, password: form.password })
               }}
            >
               <h1 className="font-semibold text-foreground/75 text-lg">
                  Access Unfiddle
               </h1>
               <Field>
                  <FieldLabel className={"mt-4"}>Email address</FieldLabel>
                  <FieldControl
                     name="email"
                     type="email"
                     required
                     placeholder="example@mail.com"
                  />
               </Field>
               <Field>
                  <FieldLabel className={"mt-5"}>Password</FieldLabel>
                  <FieldControl
                     name="password"
                     type="password"
                     required
                     placeholder="••••••••••••"
                     minLength={MIN_PASSWORD_LENGTH}
                     className={
                        "font-[Verdana] tracking-[10%] placeholder:text-base"
                     }
                  />
               </Field>
               <Button
                  size={"lg"}
                  className="mt-5 w-full"
               >
                  Login
               </Button>
            </form>
         </div>
      </div>
   )
}
