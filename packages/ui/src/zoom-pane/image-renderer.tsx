import type { ZoomTransform } from "d3-zoom"
import { useAtomValue } from "jotai"
import * as React from "react"
import { SVGPreview } from "../components/svg-preview"
import { zoomAtom } from "./store"
import { getCurrentTransform } from "./utils"

export function ZoomImageRenderer({
   width,
   height,
   src,
   style,
   isSvg,
}: {
   width: number
   height: number
   src: string
   style?: React.CSSProperties
   isSvg: boolean
}) {
   const containerRef = React.useRef<HTMLDivElement>(null)
   const { d3Zoom, d3Container } = useAtomValue(zoomAtom)
   const [isReady, setIsReady] = React.useState(false)

   const initialTransform = d3Container
      ? getCurrentTransform(d3Container)
      : null

   React.useEffect(() => {
      if (!d3Zoom || !d3Container) return

      setIsReady(true)

      const updateContainerTransform = (transform: ZoomTransform) => {
         if (!containerRef.current) return
         containerRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`
      }

      d3Zoom.on("zoom.image", (event) =>
         updateContainerTransform(event.transform),
      )
   }, [d3Container, d3Zoom])

   if (!isReady) return null

   return (
      <div
         ref={containerRef}
         className="absolute block origin-top-left"
         style={{
            top: 0,
            left: 0,
            width,
            height,
            transform: `translate(${initialTransform.x}px, ${initialTransform.y}px) scale(${initialTransform.k})`,
            ...style,
         }}
      >
         {isSvg ? (
            <SVGPreview url={src} />
         ) : (
            <img
               width={width}
               height={height}
               src={src}
               alt=""
            />
         )}
      </div>
   )
}
