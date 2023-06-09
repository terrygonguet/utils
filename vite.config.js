import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
	build: {
		lib: {
			formats: ["es"],
			entry: {
				main: resolve(__dirname, "src/main.ts"),
			},
		},
	},
})
