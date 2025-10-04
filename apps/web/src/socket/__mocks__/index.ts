import type { useSocket } from "@/socket"
import { vi } from "vitest"

vi.mock("@/socket", () => ({
   useSocket: vi.fn(
      () =>
         ({
            estimate: { send: vi.fn() },
            estimateProcurement: { send: vi.fn() },
            order: { send: vi.fn() },
            procurement: { send: vi.fn() },
         }) satisfies ReturnType<typeof useSocket>,
   ),
}))
