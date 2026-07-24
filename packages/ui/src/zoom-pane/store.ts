// @ts-nocheck
import type { Selection as D3Selection } from "d3-selection"
import { type ZoomBehavior, ZoomTransform } from "d3-zoom"
import { atom } from "jotai"

const _TRANSITION_DURATION_MS = 300

type ZoomState = {
   d3Zoom: ZoomBehavior<Element, unknown> | null
   d3Container: D3Selection<Element, unknown, null, undefined> | null
   panning: boolean
   viewport: { width: number; height: number }
   size: { width: number; height: number }
   transform: ZoomTransform
}

const _zoomAtom = atom<ZoomState>({
   d3Zoom: null,
   d3Container: null,
   viewport: { width: 0, height: 0 },
   size: { width: 0, height: 0 },
   transform: new ZoomTransform(0, 0, 0),
   panning: false,
})

export const zoomAtom = atom((get) => get(_zoomAtom))

export const setupZoomAtom = atom(
   null,
   (_get, set, state: Omit<ZoomState, "panning">) => {
      set(_zoomAtom, { panning: false, ...state })
   },
)

export const setZoomAtom = atom(
   null,
   (
      _get,
      set,
      data: Partial<
         Pick<ZoomState, "viewport" | "size" | "transform" | "panning">
      >,
   ) => set(_zoomAtom, (prev) => ({ ...prev, ...data })),
)
