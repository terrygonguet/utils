import { describe } from "vitest"
import { pause } from "./async.ts"

describe("pause()", it => {
	it("Pauses", async ({ expect }) => {
		const start = performance.now()
		await pause(25)
		const delta = performance.now() - start
		expect(delta).to.be.greaterThanOrEqual(25)
	})
})
