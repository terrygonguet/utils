import { describe } from "vitest"
import {
	clamp,
	safeParse,
	composeJSONRevivers,
	createNoopProxy,
	noop,
	exhaustive,
	hash,
	range,
	safe,
} from "./index.ts"

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

	// it("composes revivers", ({ expect }) => {
	// 	const json = JSON.stringify({
	// 		prop: "value",
	// 		other: "ignored",
	// 		maybe: {
	// 			some: Maybe.Some(5),
	// 			none: Maybe.None(),
	// 		},
	// 		result: {
	// 			success: Result.Success(5),
	// 			failure: Result.Failure("fail"),
	// 		},
	// 	})
	// 	const obj = JSON.parse(
	// 		json,
	// 		composeJSONRevivers(
	// 			Maybe.JSONReviver,
	// 			Result.JSONReviver,
	// 			(key, value) => (key == "prop" ? "replaced" : value),
	// 		),
	// 	)
	// 	expect(obj.prop).to.equal("replaced")
	// 	expect(obj.other).to.equal("ignored")
	// 	expect(obj.maybe.some.isSome()).to.be.true
	// 	expect(obj.maybe.some.value).to.equal(5)
	// 	expect(obj.maybe.none.isSome()).to.be.false
	// 	expect(obj.result.success.isSuccess()).to.be.true
	// 	expect(obj.result.success.value).to.equal(5)
	// 	expect(obj.result.failure.isSuccess()).to.be.false
	// 	expect(obj.result.failure.reason).to.equal("fail")
	// })
})

describe.concurrent("createNoopProxy()", it => {
	const proxy = createNoopProxy<any>()

	it("does nothing recursively", ({ expect }) => {
		expect(proxy.prop).to.equal(proxy)
		expect(proxy()).to.equal(proxy)
	})

	it("fakes deleting properties", ({ expect }) => {
		expect(delete proxy.prop).to.be.true
	})

	it("lies about having any property", ({ expect }) => {
		expect("prop" in proxy).to.be.true
	})

	it("prevents creating a child class", ({ expect }) => {
		expect(() => {
			class test extends proxy {}
			new test()
		}).to.throw(TypeError)
	})

	it("prevents defining properties", ({ expect }) => {
		expect(() =>
			Object.defineProperty(proxy, "prop", { value: "value" }),
		).to.throw(TypeError)
	})
})

describe.concurrent("noop()", it => {
	it("does nothing", ({ expect }) => {
		expect(noop()).to.be.undefined
	})
})

describe.concurrent("exhaustive()", it => {
	it("throws", ({ expect }) => {
		expect(exhaustive).to.throw("This should never be called")
	})
})

describe.concurrent("hash()", it => {
	it("does the crypto stuff", async ({ expect }) => {
		const buff = await hash("Some message")
		const bytes = new Uint8Array(buff)
		expect(bytes.toString()).toMatchInlineSnapshot(
			'"35,148,215,25,180,1,235,141,243,236,123,23,12,212,205,136,182,122,9,122"',
		)
	})
})

describe.concurrent("range()", it => {
	it("returns a range", ({ expect }) => {
		const arr = [...range(0, 5)]
		expect(arr).to.deep.equal([0, 1, 2, 3, 4])
	})

	it("respects step", ({ expect }) => {
		const arr = [...range(0, 5, 2)]
		expect(arr).to.deep.equal([0, 2, 4])
	})
})

describe.concurrent("safe()", it => {
	it("catches and passes an error", ({ expect }) => {
		const [err, data] = safe(() => JSON.parse("{"))
		expect(data).to.be.null
		expect(err).to.be.instanceOf(SyntaxError)
	})

	it("passes the result through", ({ expect }) => {
		const [err, data] = safe(() => JSON.parse(`{"hello":"world"}`))
		expect(data).to.toMatchInlineSnapshot(`
			{
			  "hello": "world",
			}
		`)
		expect(err).to.be.null
	})
})
