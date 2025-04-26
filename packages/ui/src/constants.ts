export const MOBILE_BREAKPOINT = 768

export const FOCUS_STYLES =
   "focus-visible:border-primary-10 focus-visible:ring-primary-3 focus-visible:ring-[3px] focus-visible:outline-hidden"

export const POPUP_STYLES = {
   transition:
      "origin-(--transform-origin) transition-[transform_100ms_var(--ease-vaul),opacity_100ms_var(--ease-vaul)] data-[ending-style]:scale-[96%] data-[starting-style]:scale-[97%] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[instant]:duration-0",
   base: "[--popup-radius:var(--radius-2xl)] rounded-(--popup-radius) md:[--popup-radius:var(--radius-xl)] bg-primary-12 text-white shadow-md outline-1 outline-transparent outline-offset-0",
   separator:
      "-mx-(--popup-padding) mt-0.5 mb-1 h-px w-[calc(100%+calc(var(--popup-padding)*2))] bg-black shadow-[0px_1px_0px_hsl(0,0%,20%)]",
   groupLabel: "my-1 mx-2 text-sm text-white/75 uppercase",
}
