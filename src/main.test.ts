import { describe } from "vitest";
import { clamp } from "./main.ts"

describe.concurrent("clamp", it => {
	it("Does nothing to values within range", ({ expect }) => {
		expect(clamp(5, 0, 10)).to.equal(5)
		expect(clamp(10, 10, 10)).to.equal(10)
		expect(clamp(0, 0, 10)).to.equal(0)
		expect(clamp(10, 0, 10)).to.equal(10)
	})

	it("Clamps values outside of range", ({ expect }) => {
		expect(clamp(-5, 0, 10)).to.equal(0)
		expect(clamp(15, 0, 10)).to.equal(10)
		expect(clamp(-5, 10, 10)).to.equal(10)
		expect(clamp(15, 10, 10)).to.equal(10)
	})
})