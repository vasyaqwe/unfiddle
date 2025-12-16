import { vi } from "vitest"

vi.mock("@tanstack/react-router", async (importOriginal) => {
   const actual = (await importOriginal()) as Record<string, any>
   return {
      ...actual,
      useParams: vi.fn(() => ({
         workspaceId: "mock",
      })),
   }
})
