/// <reference types="vitest" />

import { sentryVitePlugin } from "@sentry/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
   return {
      plugins: [
         tanstackRouter({ target: "react", autoCodeSplitting: true }),
         react({
            babel: {
               plugins: [["babel-plugin-react-compiler", {}]],
            },
         }),
         tailwindcss(),
         tsconfigPaths(),
         sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "unfiddle",
            project: "unfiddle-web",
            disable: mode === "development",
            telemetry: false,
         }),
      ],
      build: {
         sourcemap: true,
      },
      preview: {
         port: 3000,
      },
      server: {
         port: 3000,
      },
      test: {
         globals: true,
         environment: "jsdom",
         setupFiles: "./src/tests/setup.ts",
         include: ["./src/**/*.test.{ts,tsx}"],
      },
   }
})
