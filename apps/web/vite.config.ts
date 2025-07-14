import { sentryVitePlugin } from "@sentry/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig(() => {
   return {
      plugins: [
         sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "unfiddle",
            project: "unfiddle-web",
            disable: process.env.NODE_ENV === "development",
            telemetry: false,
         }),
         tanstackRouter({ target: "react", autoCodeSplitting: true }),
         react({
            babel: {
               plugins: [["babel-plugin-react-compiler", {}]],
            },
         }),
         tailwindcss(),
         tsconfigPaths(),
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
   }
})
