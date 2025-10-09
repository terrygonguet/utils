import { describe } from "vitest"
import {
	clamp,
	createNoopProxy,
	noop,
	exhaustive,
	hash,
	range,
	tryCatch,
	yesno,
	mapListPush,
	recordListPush,
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

describe.concurrent("yesno()", it => {
	it("returns true for any case variation", ({ expect }) => {
		const yes = [
			"1",
			"y",
			"Y",
			"yes",
			"YES",
			"YeS",
			"Yes",
			"true",
			"True",
			"TRue",
			"TRUE",
			"on",
			"On",
			"ON",
			"oN",
		]
		for (const value of yes) {
			expect(yesno(value)).to.be.true
		}
	})
})

describe.concurrent("mapListPush()", it => {
	it("works", ({ expect }) => {
		const map = new Map<string, number[]>()
		mapListPush(map, "a", 1)
		mapListPush(map, "a", 2)
		mapListPush(map, "b", 3)
		expect(map).to.toMatchInlineSnapshot(`
			Map {
			  "a" => [
			    1,
			    2,
			  ],
			  "b" => [
			    3,
			  ],
			}
		`)
	})

	it("works with non string keys", ({ expect }) => {
		const map = new Map<{}, number[]>()
		const key1 = {}
		const key2 = {}
		mapListPush(map, key1, 1)
		mapListPush(map, key1, 2)
		mapListPush(map, key2, 3)
		expect(map).to.toMatchInlineSnapshot(`
			Map {
			  {} => [
			    1,
			    2,
			  ],
			  {} => [
			    3,
			  ],
			}
		`)
	})

	it("works with Array.prototype.reduce()", ({ expect }) => {
		const map1 = new Map<string, number[]>()
		const values = [
			{ key: "a", value: 1 },
			{ key: "a", value: 2 },
			{ key: "b", value: 3 },
		]
		const map2 = values.reduce(
			(acc, cur) => mapListPush(acc, cur.key, cur.value),
			map1,
		)
		expect(map2).toStrictEqual(map1)
		expect(map2).to.toMatchInlineSnapshot(`
			Map {
			  "a" => [
			    1,
			    2,
			  ],
			  "b" => [
			    3,
			  ],
			}
		`)
	})
})

describe.concurrent("recordListPush()", it => {
	it("works", ({ expect }) => {
		const record: Record<string, number[]> = {}
		recordListPush(record, "a", 1)
		recordListPush(record, "a", 2)
		recordListPush(record, "b", 3)
		expect(record).to.toMatchInlineSnapshot(`
			{
			  "a": [
			    1,
			    2,
			  ],
			  "b": [
			    3,
			  ],
			}
		`)
	})

	it("works with Array.prototype.reduce()", ({ expect }) => {
		const record1: Record<string, number[]> = {}
		const values = [
			{ key: "a", value: 1 },
			{ key: "a", value: 2 },
			{ key: "b", value: 3 },
		]
		const record2 = values.reduce(
			(acc, cur) => recordListPush(acc, cur.key, cur.value),
			record1,
		)
		expect(record2).toStrictEqual(record1)
		expect(record2).to.toMatchInlineSnapshot(`
			{
			  "a": [
			    1,
			    2,
			  ],
			  "b": [
			    3,
			  ],
			}
		`)
	})
})

describe.concurrent("tryCatch()", it => {
	it("catches and passes an error", ({ expect }) => {
		const [err, data] = tryCatch(BigInt, "1n")
		expect(data).to.be.null
		expect(err).to.be.instanceOf(SyntaxError)
	})

	it("passes the result through", ({ expect }) => {
		const [err, data] = tryCatch(BigInt, "1")
		expect(data).to.toMatchInlineSnapshot(`1n`)
		expect(err).to.be.null
	})

	it("catches a promise rejection", async ({ expect }) => {
		const [err, data] = await tryCatch(Promise.reject<number>, new Error())
		expect(data).to.be.null
		expect(err).to.be.instanceof(Error)
	})

	it("passes a promise result through", async ({ expect }) => {
		const dummy = (value: number) => Promise.resolve(value)
		const [err, data] = await tryCatch(dummy, 123)
		expect(data).to.equal(123)
		expect(err).to.be.null
	})
})
