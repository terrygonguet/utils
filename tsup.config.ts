import { defineConfig } from "tsup"

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/async.ts",
		// "src/functional/index.ts"
	],
	splitting: false,
	clean: true,
	target: "esnext",
	format: "esm",
	dts: true,
})
