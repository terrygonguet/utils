import { describe } from "vitest"
import { clamp, safeParse, composeJSONRevivers } from "./main.ts"
import { Failure, Maybe, None, Result, Some, Success } from "./functional/index.ts"

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

describe.concurrent("combineJSONRevivers()", it => {
	it("does nothing when given nothing", ({ expect }) => {
		const json = `{"prop":"value","other":"ignored"}`
		const obj = JSON.parse(json, composeJSONRevivers())
		expect(obj).toMatchInlineSnapshot(`
			{
			  "other": "ignored",
			  "prop": "value",
			}
		`)
	})

	it("composes revivers", ({ expect }) => {
		const json = JSON.stringify({
			prop: "value",
			other: "ignored",
			maybe: {
				some: Some(5),
				none: None,
			},
			result: {
				success: Success(5),
				failure: Failure("fail"),
			},
		})
		const obj = JSON.parse(
			json,
			composeJSONRevivers(Maybe.JSONReviver, Result.JSONReviver, (key, value) =>
				key == "prop" ? "replaced" : value,
			),
		)
		expect(obj.prop).to.equal("replaced")
		expect(obj.other).to.equal("ignored")
		expect(obj.maybe.some.isSome()).to.be.true
		expect(obj.maybe.some.value).to.equal(5)
		expect(obj.maybe.none.isSome()).to.be.false
		expect(obj.result.success.isSuccess()).to.be.true
		expect(obj.result.success.value).to.equal(5)
		expect(obj.result.failure.isSuccess()).to.be.false
		expect(obj.result.failure.reason).to.equal("fail")
	})
})
