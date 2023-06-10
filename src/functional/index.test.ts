import { describe } from "vitest"
import { constant, identity } from "./index.ts"

describe.concurrent("identity()", it => {
	it("does nothing", ({ expect }) => {
		expect(identity(5)).to.equal(5)
		expect(identity("test")).to.equal("test")
		const object = { prop: "value" }
		expect(identity(object)).to.equal(object)
	})
})

describe.concurrent("constant()", it => {
	it("is constant", ({ expect }) => {
		const five = constant(5)
		expect(five()).to.equal(5)
		expect(five()).to.equal(5)
	})
})
