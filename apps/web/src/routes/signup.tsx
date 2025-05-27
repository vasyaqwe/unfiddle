import { authClient } from "@/auth"
import { validator } from "@/validator"
import { useMutation } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { MIN_PASSWORD_LENGTH } from "@unfiddle/core/auth/constants"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { Icons } from "@unfiddle/ui/components/icons"
import { Logo } from "@unfiddle/ui/components/logo"
import { formData } from "@unfiddle/ui/utils"
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
         const res2 = await authClient.sendVerificationEmail({
            email: json.email,
            callbackURL: search.invite_code
               ? `${window.location.origin}/join/${search.invite_code}`
               : window.location.origin,
         })
         if (res2.error) throw res2.error
      },
      onError: (error: {
         code?:
            | "INVALID_EMAIL"
            | "INVALID_EMAIL_OR_PASSWORD"
            | "USER_ALREADY_EXISTS"
         message?: string | undefined
         status: number
         statusText: string
      }) => {
         if (error.code === "USER_ALREADY_EXISTS")
            return toast.error("Ой-ой!", {
               description: "Уже існує користувач з такою поштою",
            })

         if (error.code === "INVALID_EMAIL")
            return toast.error("Ой-ой!", {
               description: "Уведіть правильну пошту",
            })

         toast.error("Ой-ой!", {
            description: "Сталася помилка. Спробуйте ще раз.",
         })
      },
   })

   const google = useMutation({
      mutationFn: async () => {
         const res = await authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.origin,
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
      onError: () => {
         toast.error("Ой-ой!", {
            description: "Сталася помилка. Спробуйте пізніше.",
         })
      },
   })

   return (
      <main className="grid h-svh w-full place-items-center bg-background">
         <div className="w-full max-w-[21rem] px-5">
            {signup.isSuccess ? (
               <div>
                  <Icons.check className="size-8 text-emerald-600" />
                  <h1 className="mt-3 font-semibold text-foreground/75 text-lg">
                     Зареєстровано!
                  </h1>
                  <p className="mt-3">
                     Перейдіть за посиланням у пошті для підтвердження аккаунту.
                  </p>
               </div>
            ) : (
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
                     Зареєструватись
                  </Button>
                  <Button
                     type="button"
                     disabled={google.isPending || google.isSuccess}
                     pending={google.isPending || google.isSuccess}
                     onClick={() => google.mutate()}
                     variant={"secondary"}
                     size={"lg"}
                     className="mt-3 w-full"
                  >
                     <svg
                        className="size-4"
                        viewBox="0 0 256 262"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid"
                     >
                        <path
                           d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                           fill="#4285F4"
                        />
                        <path
                           d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                           fill="#34A853"
                        />
                        <path
                           d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                           fill="#FBBC05"
                        />
                        <path
                           d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                           fill="#EB4335"
                        />
                     </svg>
                     Google
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
            )}
         </div>
      </main>
   )
}
