import { describe } from "vitest"
import { identity } from "./index.ts"

describe("identity()", it => {
	it("does nothing", ({ expect }) => {
		expect(identity(5)).to.equal(5)
		expect(identity("test")).to.equal("test")
		const object = { prop: "value" }
		expect(identity(object)).to.equal(object)
	})
})
