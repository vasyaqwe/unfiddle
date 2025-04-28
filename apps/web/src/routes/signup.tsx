import { authClient } from "@/auth"
import { validator } from "@/validator"
import { MIN_PASSWORD_LENGTH } from "@ledgerblocks/core/auth/constants"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Field,
   FieldControl,
   FieldLabel,
} from "@ledgerblocks/ui/components/field"
import { Logo } from "@ledgerblocks/ui/components/logo"
import { formData } from "@ledgerblocks/ui/utils"
import { useMutation } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/signup")({
   component: RouteComponent,
   validateSearch: validator(z.object({ invite_code: z.string().optional() })),
})

function RouteComponent() {
   const search = Route.useSearch()
   const navigate = useNavigate()

   const signup = useMutation({
      mutationFn: async (json: {
         email: string
         password: string
         name: string
      }) => {
         const res = await authClient.signUp.email({
            name: json.name,
            email: json.email,
            password: json.password,
         })
         if (res.error) throw res.error
      },
      onSuccess: () => {
         if (search.invite_code)
            return navigate({
               to: "/join/$code",
               params: { code: search.invite_code },
            })
         navigate({ to: "/" })
      },
      onError: (error: {
         code?: "INVALID_EMAIL" | "INVALID_EMAIL_OR_PASSWORD"
         message?: string | undefined
         status: number
         statusText: string
      }) => {
         if (error.code === "INVALID_EMAIL")
            return toast.error("Ой-ой!", {
               description: "Уведіть правильну пошту",
            })

         toast.error("Ой-ой!", {
            description: "Сталася помилка. Спробуйте пізніше.",
         })
      },
   })

   return (
      <main className="grid h-svh w-full place-items-center bg-background">
         <div className="w-full max-w-[21rem] px-5">
            <form
               onSubmit={async (e) => {
                  e.preventDefault()
                  const form = formData<{
                     name: string
                     email: string
                     password: string
                  }>(e.target)

                  signup.mutate({
                     name: form.name,
                     email: form.email,
                     password: form.password,
                  })
               }}
            >
               <Logo />
               <h1 className="mt-3 font-semibold text-foreground/75 text-lg">
                  Створіть аккаунт
               </h1>
               <Field>
                  <FieldLabel className={"mt-4"}>Ім'я</FieldLabel>
                  <FieldControl
                     autoFocus
                     name="name"
                     required
                     placeholder="Як вас звати?"
                  />
               </Field>
               <Field>
                  <FieldLabel className={"mt-4"}>Пошта</FieldLabel>
                  <FieldControl
                     name="email"
                     type="email"
                     required
                     placeholder="example@mail.com"
                  />
               </Field>
               <Field>
                  <FieldLabel className={"mt-5"}>Пароль</FieldLabel>
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
                  disabled={signup.isPending || signup.isSuccess}
                  pending={signup.isPending || signup.isSuccess}
                  size={"lg"}
                  className="mt-5 w-full"
               >
                  Увійти
               </Button>
               <p className="mt-5 text-foreground/75 text-sm">
                  Вже зареєстровані?{" "}
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
