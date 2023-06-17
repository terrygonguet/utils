import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
	build: {
		lib: {
			formats: ["es"],
			entry: {
				index: resolve(__dirname, "src/index.ts"),
				async: resolve(__dirname, "src/async.ts"),
				functional: resolve(__dirname, "src/functional/index.ts"),
			},
		},
	},
	test: {
		coverage: {
			reporter: ["lcov", "html"],
		},
	},
})
