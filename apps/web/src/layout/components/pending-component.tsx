import { Logo } from "@ledgerblocks/ui/components/logo"

export function PendingComponent() {
   return (
      <main className="motion-preset-slide-up motion-delay-300 motion-translate-y-in-50 motion-preset-blur-up motion-ease-spring-bouncier absolute inset-0 m-auto flex size-fit items-center gap-2.5">
         <Logo className="size-6" />
         <p
            className="font-medium text-foreground/75 text-lg"
            data-loading-ellipsis
         >
            now ledgerblocking
         </p>
      </main>
   )
}
