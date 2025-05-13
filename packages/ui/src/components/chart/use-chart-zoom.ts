import * as React from "react"

type DataPoint = {
   label: string
   value: number
}

export function useChartZoom({ initialData }: { initialData: DataPoint[] }) {
   const [data, setData] = React.useState<DataPoint[]>(initialData || [])
   const [refAreaLeft, setRefAreaLeft] = React.useState<string | null>(null)
   const [refAreaRight, setRefAreaRight] = React.useState<string | null>(null)
   const [startTime, setStartTime] = React.useState<string | null>(null)
   const [endTime, setEndTime] = React.useState<string | null>(null)
   const [originalData, setOriginalData] = React.useState<DataPoint[]>(
      initialData || [],
   )
   const [isSelecting, setIsSelecting] = React.useState(false)
   const chartRef = React.useRef<HTMLDivElement>(null)

   React.useEffect(() => {
      let frame: number

      const check = () => {
         const container = chartRef.current
         if (!container) {
            frame = requestAnimationFrame(check)
            return
         }

         const controller = new AbortController()

         container.addEventListener(
            "wheel",
            (e) => {
               e.preventDefault()
            },
            { passive: false, signal: controller.signal },
         )

         return () => controller.abort()
      }

      frame = requestAnimationFrame(check)

      return () => cancelAnimationFrame(frame)
   }, [])

   React.useEffect(() => {
      if (initialData?.length) {
         setData(initialData)
         setOriginalData(initialData)
         const startTime = initialData[0]?.label
         const endTime = initialData[initialData.length - 1]?.label
         if (!startTime || !endTime) return
         setStartTime(startTime)
         setEndTime(endTime)
      }
   }, [initialData])

   const zoomedData = () => {
      if (!startTime || !endTime) {
         return data
      }

      const dataPointsInRange = originalData.filter(
         (dataPoint) =>
            dataPoint.label >= startTime && dataPoint.label <= endTime,
      )

      // Ensure we have at least two data points for the chart to prevent rendering a single dot
      return dataPointsInRange.length > 1
         ? dataPointsInRange
         : originalData.slice(0, 2)
   }

   const total = zoomedData().reduce((acc, curr) => acc + curr.value, 0)

   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   const onMouseDown = (e: any) => {
      if (e.activeLabel) {
         setRefAreaLeft(e.activeLabel)
         setIsSelecting(true)
      }
   }

   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
   const onMouseMove = (e: any) => {
      if (isSelecting && e.activeLabel) setRefAreaRight(e.activeLabel)
   }

   const onMouseUp = () => {
      if (refAreaLeft && refAreaRight) {
         const [left, right] = [refAreaLeft, refAreaRight].sort()
         if (!left || !right) return
         setStartTime(left)
         setEndTime(right)
      }
      setRefAreaLeft(null)
      setRefAreaRight(null)
      setIsSelecting(false)
   }

   const reset = () => {
      const date = originalData[0]?.label
      const endDate = originalData[originalData.length - 1]?.label
      if (!date || !endDate) return
      setStartTime(date)
      setEndTime(endDate)
   }

   const handle = (
      e: React.WheelEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
   ) => {
      if (!originalData.length || !chartRef.current) return

      const zoomFactor = 0.1
      let direction = 0
      let clientX = 0

      if ("deltaY" in e) {
         // Mouse wheel event
         direction = e.deltaY < 0 ? 1 : -1
         clientX = e.clientX
      } else if (e.touches.length === 2) {
         // Pinch zoom
         const touch1 = e.touches[0]
         const touch2 = e.touches[1]
         if (!touch1 || !touch2) return
         const currentDistance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY,
         )

         // biome-ignore lint/suspicious/noExplicitAny: <explanation>
         if ((e as any).lastTouchDistance) {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            direction = currentDistance > (e as any).lastTouchDistance ? 1 : -1
         }
         // biome-ignore lint/suspicious/noExplicitAny: <explanation>
         ;(e as any).lastTouchDistance = currentDistance

         clientX = (touch1.clientX + touch2.clientX) / 2
      } else {
         return
      }
      const date = originalData[0]?.label ?? 0
      const endDate = originalData[originalData.length - 1]?.label ?? 0

      const currentRange =
         new Date(endTime || endDate).getTime() -
         new Date(startTime || date).getTime()

      const zoomAmount = currentRange * zoomFactor * direction

      const chartRect = chartRef.current.getBoundingClientRect()
      const mouseX = clientX - chartRect.left
      const chartWidth = chartRect.width
      const mousePercentage = mouseX / chartWidth

      const currentStartTime = new Date(startTime || date).getTime()
      const currentEndTime = new Date(endTime || endDate).getTime()

      const newStartTime = new Date(
         currentStartTime + zoomAmount * mousePercentage,
      )
      const newEndTime = new Date(
         currentEndTime - zoomAmount * (1 - mousePercentage),
      )

      setStartTime(newStartTime.toISOString())
      setEndTime(newEndTime.toISOString())
   }

   return {
      zoomedData,
      total,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      reset,
      handle,
      chartRef,
      refAreaLeft,
      refAreaRight,
   }
}
