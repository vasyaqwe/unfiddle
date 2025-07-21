import { useQuery } from "@tanstack/react-query"
import { cn } from "../utils"

const fetcher = (url: string) => fetch(url).then((res) => res.text())

export function SVGPreview({
   url,
   className,
   ...props
}: { url: string } & React.ComponentProps<"img">) {
   const query = useQuery({
      queryKey: ["svg", url],
      queryFn: () => fetcher(url),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
   })

   if (query.error) return null
   if (!query.data) return null

   const encodedData = encodeURIComponent(query.data)
   const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedData}`

   return (
      <img
         loading="lazy"
         className={cn("size-full shrink-0 object-contain", className)}
         src={svgDataUrl}
         {...props}
         alt=""
      />
   )
}
