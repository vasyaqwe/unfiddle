import {
   HIDDEN_TEXTAREA_STYLE,
   SIZING_STYLE,
} from "@unfiddle/ui/components/textarea/constants"

export const noop = () => {}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const pick = <Obj extends { [key: string]: any }, Key extends keyof Obj>(
   props: Key[],
   obj: Obj,
): Pick<Obj, Key> =>
   props.reduce(
      (acc, prop) => {
         acc[prop] = obj[prop]
         return acc
      },
      {} as Pick<Obj, Key>,
   )

export const forceHiddenStyles = (node: HTMLElement) => {
   for (const key of Object.keys(HIDDEN_TEXTAREA_STYLE)) {
      node.style.setProperty(
         key,
         HIDDEN_TEXTAREA_STYLE[key as keyof typeof HIDDEN_TEXTAREA_STYLE],
         "important",
      )
   }
}

type SizingProps = Extract<
   (typeof SIZING_STYLE)[number],
   keyof CSSStyleDeclaration
>

type SizingStyle = Pick<CSSStyleDeclaration, SizingProps>

export type SizingData = {
   sizingStyle: SizingStyle
   paddingSize: number
   borderSize: number
}

export const getSizingData = (node: HTMLElement): SizingData | null => {
   const style = window.getComputedStyle(node)

   if (style === null) {
      return null
   }

   const sizingStyle = pick(SIZING_STYLE as unknown as SizingProps[], style)
   const { boxSizing } = sizingStyle

   // probably node is detached from DOM, can't read computed dimensions
   if (boxSizing === "") {
      return null
   }

   const paddingSize =
      parseFloat(sizingStyle.paddingBottom) + parseFloat(sizingStyle.paddingTop)

   const borderSize =
      parseFloat(sizingStyle.borderBottomWidth) +
      parseFloat(sizingStyle.borderTopWidth)

   return {
      sizingStyle,
      paddingSize,
      borderSize,
   }
}

// TODO: use labelled tuples once they are avaiable:
//   export type CalculatedNodeHeights = [height: number, rowHeight: number];
// https://github.com/microsoft/TypeScript/issues/28259
export type CalculatedNodeHeights = number[]

let hiddenTextarea: HTMLTextAreaElement | null = null

const getHeight = (node: HTMLElement, sizingData: SizingData): number => {
   const height = node.scrollHeight

   if (sizingData.sizingStyle.boxSizing === "border-box") {
      // border-box: add border, since height = content + padding + border
      return height + sizingData.borderSize
   }

   // remove padding, since height = content
   return height - sizingData.paddingSize
}

export const calculateNodeHeight = (
   sizingData: SizingData,
   value: string,
   minRows = 1,
   maxRows = Infinity,
): CalculatedNodeHeights => {
   if (!hiddenTextarea) {
      hiddenTextarea = document.createElement("textarea")
      hiddenTextarea.setAttribute("tabindex", "-1")
      hiddenTextarea.setAttribute("aria-hidden", "true")
      forceHiddenStyles(hiddenTextarea)
   }

   if (hiddenTextarea.parentNode === null) {
      document.body.appendChild(hiddenTextarea)
   }

   const { paddingSize, borderSize, sizingStyle } = sizingData
   const { boxSizing } = sizingStyle

   for (const _key of Object.keys(sizingStyle)) {
      const key = _key as keyof typeof sizingStyle
      hiddenTextarea.style[key] = sizingStyle[key] as never
   }
   forceHiddenStyles(hiddenTextarea)

   hiddenTextarea.value = value
   let height = getHeight(hiddenTextarea, sizingData)
   // Double set and calc due to Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1795904
   hiddenTextarea.value = value
   height = getHeight(hiddenTextarea, sizingData)

   // measure height of a textarea with a single row
   hiddenTextarea.value = "x"
   const rowHeight = hiddenTextarea.scrollHeight - paddingSize

   let minHeight = rowHeight * minRows
   if (boxSizing === "border-box") {
      minHeight = minHeight + paddingSize + borderSize
   }
   height = Math.max(minHeight, height)

   let maxHeight = rowHeight * maxRows
   if (boxSizing === "border-box") {
      maxHeight = maxHeight + paddingSize + borderSize
   }
   height = Math.min(maxHeight, height)

   return [height, rowHeight]
}
