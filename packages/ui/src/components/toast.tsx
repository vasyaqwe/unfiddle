import { Icons } from "@unfiddle/ui/components/icons"
import { isMobileAtom } from "@unfiddle/ui/store"
import { useAtomValue } from "jotai"
import type * as React from "react"
import { createPortal } from "react-dom"
import { Toaster as Sonner } from "sonner"

export function Toaster(props: React.ComponentProps<typeof Sonner>) {
   const isMobile = useAtomValue(isMobileAtom)

   return createPortal(
      <Sonner
         icons={{
            // loading: <Loading />,
            success: (
               <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  className="!size-[18px] text-green-600"
               >
                  <circle
                     cx="7"
                     cy="7"
                     r="6"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeDasharray="3.14 0"
                     strokeDashoffset="-0.7"
                  />
                  <circle
                     cx="7"
                     cy="7"
                     r="3"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="6"
                     strokeDasharray="18.84955592153876 100"
                     strokeDashoffset="0"
                     transform="rotate(-90 7 7)"
                  />
                  <path
                     stroke="none"
                     fill="white"
                     d="M10.951 4.24896C11.283 4.58091 11.283 5.11909 10.951 5.45104L5.95104 10.451C5.61909 10.783 5.0809 10.783 4.74896 10.451L2.74896 8.45104C2.41701 8.11909 2.41701 7.5809 2.74896 7.24896C3.0809 6.91701 3.61909 6.91701 3.95104 7.24896L5.35 8.64792L9.74896 4.24896C10.0809 3.91701 10.6191 3.91701 10.951 4.24896Z"
                  />
               </svg>
            ),
            error: (
               <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="!size-[18px] text-red-9"
               >
                  <circle
                     cx="10"
                     cy="10"
                     r="10"
                     fill="currentColor"
                  />
                  <path
                     d="M14 6L6 14"
                     stroke="white"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
                  <path
                     d="M6 6L14 14"
                     stroke="white"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </svg>
            ),
            info: (
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
               >
                  <path
                     fillRule="evenodd"
                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                     clipRule="evenodd"
                  />
               </svg>
            ),
            close: (
               <Icons.xMark
                  className="!size-4 text-foreground/80"
                  strokeWidth={3}
               />
            ),
         }}
         toastOptions={{
            unstyled: true,
            classNames: {
               title: "!text-[1rem] !font-[550] ml-6 -mt-1",
               description: "!text-sm line-clamp-2 mt-0.5 !font-normal",
               icon: "!absolute top-[0.75rem] left-4",
               closeButton:
                  "!size-6.5 absolute -top-2 -right-2 bg-background border-primary-12/12 z-[2] hover:bg-surface-2 !duration-75 !transition-colors border cursor-pointer shadow-2xs grid place-items-center rounded-full",
            },
            className:
               "font-primary px-3 py-3 items-center gap-2 w-full shadow-[inset_0_-1px_2px_0_rgb(0_0_0_/_0.12)] flex select-none border border-neutral bg-background pointer-events-auto rounded-2xl",
         }}
         position={isMobile ? "top-right" : "bottom-right"}
         {...props}
      />,
      document.body,
   )
}
