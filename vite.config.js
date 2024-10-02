import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
	test: {
		coverage: {
			reporter: ["lcov", "html"],
		},
	},
})
