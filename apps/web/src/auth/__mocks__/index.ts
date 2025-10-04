import type { useAuth } from "@/auth/hooks"
import { vi } from "vitest"

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
