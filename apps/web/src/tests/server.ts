import type { useAuth } from "@/auth/hooks"
import type { useSocket } from "@/socket"
import { setupServer } from "msw/node"
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

vi.mock("@/auth/hooks", () => ({
   useAuth: vi.fn(
      () =>
         ({
            workspace: {
               id: "mock-workspace-id-123",
               createdAt: new Date(),
               creatorId: "mock",
               name: "mock",
               role: "manager",
               image: null,
               inviteCode: "mock",
               updatedAt: new Date(),
            },
            user: {
               id: "mock-user-id-456",
               name: "Test User",
               image: null,
               createdAt: new Date(),
               updatedAt: new Date(),
               email: "test@example.com",
               emailVerified: true,
            },
            signout: { mutate: vi.fn() } as any,
            queryOptions: {} as any,
         }) satisfies ReturnType<typeof useAuth>,
   ),
}))

export const server = setupServer()
