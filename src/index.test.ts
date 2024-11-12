import { describe } from "vitest"
import {
	clamp,
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
		const [err, data] = safe(BigInt, "1n")
		expect(data).to.be.null
		expect(err).to.be.instanceOf(SyntaxError)
	})

	it("passes the result through", ({ expect }) => {
		const [err, data] = safe(BigInt, "1")
		expect(data).to.toMatchInlineSnapshot(`1n`)
		expect(err).to.be.null
	})

	it("catches a promise rejection", async ({ expect }) => {
		const [err, data] = await safe(Promise.reject<number>, new Error())
		expect(data).to.be.null
		expect(err).to.be.instanceof(Error)
	})

	it("passes a promise result through", async ({ expect }) => {
		const dummy = (value: number) => Promise.resolve(value)
		const [err, data] = await safe(dummy, 123)
		expect(data).to.equal(123)
		expect(err).to.be.null
	})
})
