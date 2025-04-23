export const DIALOG_STYLES = {
   transition:
      "transition-all duration-150 data-[ending-style]:scale-[98%] data-[starting-style]:scale-[102%] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
   popup: "-mt-8 -translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-96 max-w-[calc(100vw-3rem)] rounded-xl bg-primary-2 p-4 shadow-sm dark:shadow-xl shadow-black/15 dark:shadow-black/60 outline outline-transparent dark:outline-primary-5",
   backdrop:
      "fixed inset-0 bg-black opacity-25 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-50",
   title: "-mt-1 mb-2 font-semibold text-lg",
   description: "mb-6 text-foreground/75 text-sm",
   footer: "flex justify-end gap-3 pt-3",
}
