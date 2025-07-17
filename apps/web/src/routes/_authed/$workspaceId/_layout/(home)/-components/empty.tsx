import { useAuth } from "@/auth/hooks"
import { useSearch } from "@tanstack/react-router"

export function Empty() {
   const search = useSearch({
      from: "/_authed/$workspaceId/_layout/(home)/",
   })
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
               <>
                  {search.archived ? (
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
                  ) : (
                     <svg
                        className="size-12"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                     >
                        <g fill="currentColor">
                           <path
                              d="M2.424,17.977l.068-10.18c.012-1.843,1.301-3.423,3.08-3.775l9.831-1.949c2.362-.468,4.555,1.38,4.539,3.827l-.068,10.182c-.013,1.842-1.302,3.421-3.081,3.774l-9.831,1.949c-2.362,.468-4.555-1.38-4.539-3.828Z"
                              opacity=".2"
                           />
                           <path
                              d="M7.241,22.039l.068-10.182c.011-1.841,1.301-3.42,3.08-3.773l9.831-1.948c2.362-.468,4.555,1.38,4.539,3.827l-.068,10.182c-.012,1.842-1.301,3.421-3.08,3.774l-9.831,1.949c-2.362,.468-4.555-1.38-4.539-3.827v-.002Z"
                              opacity=".5"
                           />
                           <path
                              d="M12.058,26.1l.068-10.182c.012-1.843,1.301-3.421,3.08-3.774l9.831-1.949c2.362-.468,4.555,1.38,4.539,3.827l-.068,10.182c-.012,1.843-1.301,3.422-3.08,3.774l-9.831,1.949c-2.362,.468-4.555-1.38-4.539-3.827h0Z"
                              opacity=".8"
                           />
                        </g>
                     </svg>
                  )}
               </>
            )}
         </div>
         <p className="mb-2 font-medium text-foreground/90 text-lg">
            {search.archived ? "В архіві нічого немає" : "Немає замовлень"}
         </p>
      </div>
   )
}
