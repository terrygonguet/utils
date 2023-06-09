import { describe } from "vitest"
import { wait } from "./async.ts"

describe("wait", it => {
	it("Waits", async ({ expect }) => {
		// TODO: figure out how to test that
		await expect(wait(25)).resolves
	})
})
