import { setupServer } from "msw/node"
import { trpcMsw } from "@/tests/handlers"

export const server = setupServer(
   trpcMsw.client.list.query(() => []),
)
