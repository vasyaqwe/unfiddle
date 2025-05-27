import { authClient } from "@/auth"
import { useMutation } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { Icons } from "@unfiddle/ui/components/icons"
import { Logo } from "@unfiddle/ui/components/logo"
import { formData } from "@unfiddle/ui/utils"

export const Route = createFileRoute("/forgot-password")({
   component: RouteComponent,
})

function RouteComponent() {
   const search = Route.useSearch()

   const forgot = useMutation({
      mutationFn: async (json: { email: string }) => {
         const res = await authClient.forgetPassword({
            email: json.email,
            redirectTo: `${window.location.origin}/reset-password`,
         })

         if (res.error) throw res.error
      },
   })

   return (
      <main className="grid h-svh w-full place-items-center bg-background">
         <div className="w-full max-w-[21rem] px-5">
            <form
               onSubmit={async (e) => {
                  e.preventDefault()
                  const form = formData<{
                     email: string
                  }>(e.target)

                  forgot.mutate({ email: form.email })
               }}
            >
               <Logo />
               <h1 className="mt-3 font-semibold text-foreground/75 text-lg">
                  Забули пароль?
               </h1>
               <Field>
                  <FieldLabel className={"mt-4"}>Пошта</FieldLabel>
                  <FieldControl
                     autoFocus
                     name="email"
                     type="email"
                     required
                     placeholder="example@mail.com"
                  />
               </Field>
               <Button
                  disabled={forgot.isPending || forgot.isSuccess}
                  pending={forgot.isPending}
                  size={"lg"}
                  className="mt-5 w-full"
               >
                  {forgot.isSuccess ? (
                     <>
                        <Icons.check className="size-5" />
                        Надіслано!
                     </>
                  ) : (
                     "Надіслати підтвердження"
                  )}
               </Button>
               <p className="mt-5 text-foreground/75 text-sm">
                  Все ок?{" "}
                  <Link
                     to={"/login"}
                     search={search}
                     className="transition-colors duration-75 hover:text-foreground"
                  >
                     <u>Увійти</u>
                  </Link>
               </p>
            </form>
         </div>
      </main>
   )
}
