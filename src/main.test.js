import { describe } from "vitest"
import { clamp, safeParse } from "./main.ts"

describe.concurrent("clamp()", it => {
	it("does nothing to values within range", ({ expect }) => {
		expect(clamp(5, 0, 10)).to.equal(5)
		expect(clamp(10, 10, 10)).to.equal(10)
		expect(clamp(0, 0, 10)).to.equal(0)
		expect(clamp(10, 0, 10)).to.equal(10)
	})

	it("clamps values outside of range", ({ expect }) => {
		expect(clamp(-5, 0, 10)).to.equal(0)
		expect(clamp(15, 0, 10)).to.equal(10)
		expect(clamp(-5, 10, 10)).to.equal(10)
		expect(clamp(15, 10, 10)).to.equal(10)
	})
})

describe.concurrent("safeParse()", it => {
	it("works the same as JSON.parse for valid objects", ({ expect }) => {
		const json = `{"prop":"value"}`
		expect(safeParse(json, {})).to.deep.equal(JSON.parse(json))
	})

	it("uses default value for malformed JSON", ({ expect }) => {
		const json = `{"prop":}`
		expect(safeParse(json, { prop: "default" })).to.deep.equal({ prop: "default" })
	})

	it("uses revivers", ({ expect }) => {
		const json = `{"prop":"value","other":"ignored"}`
		function reviver(key, value) {
			if (key == "prop") return "replaced"
			else return value
		}
		const defaultValue = { prop: "value", other: "ignored" }
		expect(safeParse(json, defaultValue, reviver)).to.deep.equal({
			prop: "replaced",
			other: "ignored",
		})
	})
})
