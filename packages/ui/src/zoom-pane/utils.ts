import type { Selection as D3Selection } from "d3-selection"
import { type ZoomBehavior, zoomIdentity } from "d3-zoom"

type CoordinateExtent = [[number, number], [number, number]]

const infiniteExtent: CoordinateExtent = [
   [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
   [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
]

export const constrainedFitTransform = ({
   d3Zoom,
   width,
   height,
   containerWidth,
   containerHeight,
   maxZoom,
}: {
   d3Zoom: ZoomBehavior<Element, unknown>
   width: number
   height: number
   containerWidth: number
   containerHeight: number
   maxZoom?: number
}) => {
   const extent: CoordinateExtent = [
      [0, 0],
      [containerWidth, containerHeight],
   ]
   const initialZoom = Math.min(
      Math.min(containerWidth / width, containerHeight / height),
      maxZoom ?? Infinity,
   )
   const [minZoomExtent, maxZoomExtent] = d3Zoom.scaleExtent()
   const clampedZoom = clamp(
      initialZoom,
      minZoomExtent,
      maxZoom ?? maxZoomExtent,
   )
   const translateX = (containerWidth - width * clampedZoom) * 0.5
   const translateY = (containerHeight - height * clampedZoom) * 0.5
   const updatedTransform = zoomIdentity
      .translate(translateX, translateY)
      .scale(clampedZoom)

   return d3Zoom.constrain()(updatedTransform, extent, infiniteExtent)
}

const clamp = (val: number, min = 0, max = 1): number =>
   Math.min(Math.max(val, min), max)

export const getCurrentTransform = (
   selection: D3Selection<Element, unknown, null, undefined>,
) => selection.property("__zoom")

export const eventTargetClickDisabled = (target: HTMLElement) =>
   target.closest(".zoom-pane [data-zoom-click-disabled]")

export const eventTargetWheelDisabled = (target: HTMLElement) =>
   target.closest(".zoom-pane [data-zoom-wheel-disabled]")
