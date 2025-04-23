import { join } from "path"
import path from "path"
const __dirname = path.resolve()

export default {
   plugins: {
      "@tailwindcss/postcss": {
         base: join(__dirname, "../../"),
      },
   },
}
