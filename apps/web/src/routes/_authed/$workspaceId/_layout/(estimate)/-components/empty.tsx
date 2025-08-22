import { useAuth } from "@/auth/hooks"

export function EstimatesEmpty() {
   const auth = useAuth()

   return (
      <div className="-translate-y-8 absolute inset-0 m-auto size-fit text-center">
         <div className="mx-auto mb-5 flex max-w-30 flex-col items-center">
            {auth.workspace.image ? (
               <img
                  src={auth.workspace.image}
                  alt=""
               />
            ) : (
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-12"
                  viewBox="0 0 18 18"
               >
                  <g fill="currentColor">
                     <path
                        d="M15.75,8.5c-.414,0-.75-.336-.75-.75v-1.5c0-.689-.561-1.25-1.25-1.25h-5.386c-.228,0-.443-.104-.585-.281l-.603-.752c-.238-.297-.594-.467-.975-.467h-1.951c-.689,0-1.25,.561-1.25,1.25v3c0,.414-.336,.75-.75,.75s-.75-.336-.75-.75v-3c0-1.517,1.233-2.75,2.75-2.75h1.951c.838,0,1.62,.375,2.145,1.029l.378,.471h5.026c1.517,0,2.75,1.233,2.75,2.75v1.5c0,.414-.336,.75-.75,.75Z"
                        fill="currentColor"
                     />
                     <path
                        d="M17.082,7.879c-.43-.559-1.08-.879-1.785-.879H2.703c-.705,0-1.355,.32-1.785,.879-.429,.559-.571,1.27-.39,1.951l1.101,4.128c.32,1.202,1.413,2.042,2.657,2.042H13.713c1.244,0,2.337-.839,2.657-2.042l1.101-4.128c.182-.681,.04-1.392-.39-1.951Z"
                        fill="currentColor"
                     />
                  </g>
               </svg>
            )}
         </div>
         <p className="mb-2 font-medium text-foreground/90 text-lg">
            Немає прорахунків
         </p>
      </div>
   )
}
