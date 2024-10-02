import { describe } from "vitest"
import { safeParse } from "./json.ts"

describe.concurrent("safeParse()", it => {
	it("works the same as JSON.parse for valid objects", ({ expect }) => {
		const data = { prop: "value" }
		const json = JSON.stringify(data)
		expect(safeParse(json, {})).to.deep.equal(data)
	})

	it("uses default value for malformed JSON", ({ expect }) => {
		const json = `{"prop":}`
		expect(safeParse(json, { prop: "default" })).to.deep.equal({
			prop: "default",
		})
	})

	it("uses revivers", ({ expect }) => {
		const json = `{"prop":"value","other":"ignored"}`
		function reviver(key: string, value: any) {
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
