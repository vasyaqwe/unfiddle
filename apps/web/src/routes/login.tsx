import { authClient } from "@/auth"
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
      onError: (error: {
         code?: "INVALID_EMAIL" | "INVALID_EMAIL_OR_PASSWORD"
         message?: string | undefined
         status: number
         statusText: string
      }) => {
         if (error.code === "INVALID_EMAIL")
            return toast.error("Ой-ой!", { description: "Неправильна пошта" })
         if (error.code === "INVALID_EMAIL_OR_PASSWORD")
            return toast.error("Ой-ой!", {
               description: "Неправильна пошта або пароль",
            })

         toast.error("Ой-ой!", {
            description: "Сталася помилка. Спробуйте пізніше.",
         })
      },
   })

   return (
      <div className="grid h-svh w-full place-items-center">
         <div className="w-full max-w-[21rem] px-5">
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
               <Logo />
               <h1 className="mt-3 font-semibold text-foreground/75 text-lg">
                  Увійдіть в аккаунт
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
                  disabled={signin.isPending || signin.isSuccess}
                  pending={signin.isPending || signin.isSuccess}
                  size={"lg"}
                  className="mt-5 w-full"
               >
                  Увійти
               </Button>
               <p className="mt-5 text-foreground/75 text-sm">
                  Не маєте аккаунта?{" "}
                  <Link
                     to={"/signup"}
                     className="transition-colors duration-75 hover:text-foreground"
                  >
                     <u>Зареєструватись</u>
                  </Link>
               </p>
            </form>
         </div>
      </div>
   )
}
