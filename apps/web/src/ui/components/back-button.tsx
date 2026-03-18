import { useRouter } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"

export function BackButton({
   onClick,
   ...props
}: React.ComponentProps<typeof Button>) {
   const router = useRouter()

   return (
      <Button
         onClick={() => {
            if (onClick) return onClick()
            router.history.back()
         }}
         {...props}
      />
   )
}
