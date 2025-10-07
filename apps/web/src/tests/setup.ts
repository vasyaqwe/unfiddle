import { server } from "@/tests/server"
import "@testing-library/jest-dom"
import { afterAll, afterEach, beforeAll } from "vitest"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

if (window.HTMLElement) {
   window.HTMLElement.prototype.setPointerCapture = () => {}
   window.HTMLElement.prototype.releasePointerCapture = () => {}
}

// --- Patch getComputedStyle safely ---
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = (el: Element) => {
   const style = originalGetComputedStyle(el)
   // Return a Proxy that defaults missing props like transform
   return new Proxy(style, {
      get(target, prop) {
         if (prop === "transform") return "none"
         if (prop === "getPropertyValue")
            return target.getPropertyValue.bind(target)
         return Reflect.get(target, prop)
      },
   })
}
