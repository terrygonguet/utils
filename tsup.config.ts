import { defineConfig } from "tsup"

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/async.ts",
		"src/json.ts",
		"src/option.ts",
		"src/random.ts",
		"src/result.ts",
		"src/tableau.ts",
	],
	splitting: false,
	clean: true,
	target: "esnext",
	format: "esm",
	dts: true,
})
