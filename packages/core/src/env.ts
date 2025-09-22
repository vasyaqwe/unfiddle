const API_URL = {
   development: "http://localhost:8787",
   production: "https://api.unfiddle.com",
}

export const clientEnv = {
   development: {
      API_URL: API_URL.development,
      WEB_URL: "http://localhost:3000",
      COLLABORATION_URL: "collaboration.unfiddle.com",
      STORAGE_URL: `${API_URL.development}/r2`,
      CLOUDFLARE_ACCOUNT_ID: "bfef1e994f1aac7e7a42dc4ba75197a0",
      CLOUDFLARE_DATABASE_ID: "b3c5c658-0eec-4ad5-95b2-63948fd304dd",
   },
   production: {
      API_URL: API_URL.production,
      WEB_URL: "https://unfiddle.com",
      COLLABORATION_URL: "collaboration.unfiddle.com",
      STORAGE_URL: "https://bucket.unfiddle.com",
      CLOUDFLARE_ACCOUNT_ID: "bfef1e994f1aac7e7a42dc4ba75197a0",
      CLOUDFLARE_DATABASE_ID: "b3c5c658-0eec-4ad5-95b2-63948fd304dd",
   },
} as const

type Environment = "production" | "development"

export type ApiEnv = {
   ENVIRONMENT: Environment
   GOOGLE_CLIENT_ID: string
   GOOGLE_CLIENT_SECRET: string
   RESEND_API_KEY: string
   RATE_LIMITER: RateLimit
   KV: KVNamespace
   DATABASE: D1Database
   BETTER_AUTH_SECRET: string
   BUCKET: R2Bucket
}

export type ClientEnv = (typeof clientEnv)[Environment]

export type Env = ApiEnv & ClientEnv
