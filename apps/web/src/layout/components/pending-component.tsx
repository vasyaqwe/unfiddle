import { Logo } from "@unfiddle/ui/components/logo"

export function PendingComponent({ animated = false }: { animated?: boolean }) {
   return (
      <main
         data-animated={animated ? "" : undefined}
         className="data-animated:motion-preset-slide-up motion-delay-300 data-animated:motion-translate-y-in-50 data-animated:motion-preset-blur-up md:motion-ease-spring-bouncier absolute inset-0 m-auto flex size-fit items-center gap-2.5"
      >
         <Logo className="size-6" />
         <p
            className="font-medium text-foreground/75 text-lg"
            data-loading-ellipsis
         >
            зачекайте
         </p>
      </main>
   )
}
