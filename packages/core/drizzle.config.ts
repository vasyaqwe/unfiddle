import { clientEnv } from "@unfiddle/infra/env"
import { defineConfig } from "drizzle-kit"

const env = (process.env.NODE_ENV || "development") as
   | "development"
   | "production"

export default defineConfig({
   dialect: "turso",
   schema: "./src/database/schema.ts",
   out: "./src/database/migrations",
   casing: "snake_case",
   dbCredentials: {
      url: clientEnv[env].DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
   },
   verbose: true,
})
