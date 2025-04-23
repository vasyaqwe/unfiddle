import { useRouter } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"

export function BackButton({ ...props }: React.ComponentProps<typeof Button>) {
   const router = useRouter()

   return (
      <Button
         onClick={() => router.history.back()}
         {...props}
      />
   )
}
