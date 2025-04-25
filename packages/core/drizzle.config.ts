import { clientEnv } from "@unfiddle/infra/env"
import { defineConfig } from "drizzle-kit"

const env = (process.env.NODE_ENV || "development") as
   | "development"
   | "production"

export default process.env.CLOUDFLARE_API_TOKEN
   ? defineConfig({
        dialect: "sqlite",
        driver: "d1-http",
        schema: "./src/database/schema.ts",
        out: "./src/database/migrations",
        dbCredentials: {
           accountId: clientEnv[env].CLOUDFLARE_ACCOUNT_ID,
           databaseId: clientEnv[env].CLOUDFLARE_DATABASE_ID,
           token: process.env.CLOUDFLARE_API_TOKEN,
        },
     })
   : defineConfig({
        dialect: "sqlite",
        schema: "./src/database/schema.ts",
        out: "./src/database/migrations",
        dbCredentials: {
           url: "../../apps/api/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/38267c7b00d3f0baf34e62248a1bf8269eecbec2be4a8dbb0f990e9ed3ca7ffd.sqlite",
        },
     })
