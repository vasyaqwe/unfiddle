import { Button } from "@ledgerblocks/ui/components/button"
import { useRouter } from "@tanstack/react-router"

export function BackButton({ ...props }: React.ComponentProps<typeof Button>) {
   const router = useRouter()

   return (
      <Button
         onClick={() => router.history.back()}
         {...props}
      />
   )
}
