import { useRouter } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"

export function BackButton({
   onClick,
   ...props
}: React.ComponentProps<typeof Button>) {
   const router = useRouter()

   return (
      <Button
         onClick={(e) => {
            if (onClick) return onClick(e)
            router.history.back()
         }}
         {...props}
      />
   )
}
