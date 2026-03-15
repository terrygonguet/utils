import { assertType, describe, vi } from "vitest"
import { safe } from "./result.ts"

describe.concurrent("safe()", it => {
	it("accepts a simple function", ({ expect }) => {
		const result = safe(() => 10)
		expect(result.value).to.equal(10)
		expect(result.error).to.equal(null)
	})

	it("accepts a function with args", ({ expect }) => {
		const result = safe((n: number) => n + 10, 5)
		expect(result.value).to.equal(15)
		expect(result.error).to.equal(null)
	})

	it("passes an error without throwing", ({ expect }) => {
		const result = safe(() => {
			throw new Error("test")
			return 10
		})
		expect(result.value).to.equal(null)
		expect(result.error).to.deep.equal(new Error("test"))
	})

	it("allows destructuring", ({ expect }) => {
		const { error: err1, value: val1 } = safe(() => 10).asObject()
		expect(val1).to.equal(10)
		expect(err1).to.equal(null)
		const [err2, val2] = safe(() => 10).asTuple()
		expect(val2).to.equal(10)
		expect(err2).to.equal(null)
		const [err3, val3] = safe(() => {
			throw new Error("test")
			return 10
		}).asTuple()
		expect(val3).to.equal(null)
		expect(err3).to.deep.equal(new Error("test"))
	})

	it("destructured types are exclusive", () => {
		const { error: err1, value: val1 } = safe(() => 10).asObject()
		if (err1) {
			assertType<null>(val1)
			assertType<Error>(err1)
		} else {
			assertType<number>(val1)
			assertType<null>(err1)
		}
		const [err2, val2] = safe(() => 10).asTuple()
		if (err2) {
			assertType<null>(val2)
			assertType<Error>(err2)
		} else {
			assertType<number>(val2)
			assertType<null>(err2)
		}
	})

	it("can be chained", ({ expect }) => {
		const result = safe(() => 10).andThen(n => n + 5)
		expect(result.value).to.equal(15)
		expect(result.error).to.equal(null)
	})

	it("errors interupt the chaining", ({ expect }) => {
		const spy = vi.fn((n: number) => n + 5)
		const result = safe(() => {
			throw new Error("test")
			return 10
		}).andThen(spy)
		expect(result.value).to.equal(null)
		expect(result.error).to.deep.equal(new Error("test"))
		expect(spy).not.toHaveBeenCalled()
	})

	it("works with promises", async ({ expect }) => {
		const result1 = await safe(Promise.resolve(10))
		expect(result1.value).to.equal(10)
		expect(result1.error).to.equal(null)
		const result2 = await safe(Promise.reject(new Error("test")))
		expect(result2.value).to.equal(null)
		expect(result2.error).to.deep.equal(new Error("test"))
	})

	it("can throw in `then()`", async ({ expect }) => {
		const willThrow = safe(Promise.resolve(10)).then(result => {
			throw new Error("test")
			return result.value || 10
		})
		await expect(willThrow).rejects.toThrow(new Error("test"))
	})

	it("cannot thow in `andThen()`", async ({ expect }) => {
		const result = await safe(async () => 10).andThen(n => {
			throw new Error("test")
			return n + 5
		})
		expect(result.value).to.equal(null)
		expect(result.error).to.deep.equal(new Error("test"))
	})

	it("can be async chained", async ({ expect }) => {
		const result = await safe(async () => 10).andThen(n => n + 5)
		expect(result.value).to.equal(15)
		expect(result.error).to.equal(null)
	})

	it("errors interrupt the async chaining", async ({ expect }) => {
		const spy = vi.fn((n: number) => n + 5)
		const result = await safe(async () => {
			throw new Error("test")
			return 10
		}).andThen(spy)
		expect(result.value).to.equal(null)
		expect(result.error).to.deep.equal(new Error("test"))
		expect(spy).not.toHaveBeenCalled()
	})

	it("allows async destructuring", async ({ expect }) => {
		const { error: err1, value: val1 } = await safe(async () => 10).asObject()
		expect(val1).to.equal(10)
		expect(err1).to.equal(null)
		const [err2, val2] = await safe(async () => 10).asTuple()
		expect(val2).to.equal(10)
		expect(err2).to.equal(null)
		const [err3, val3] = await safe(async () => {
			throw new Error("test")
			return 10
		}).asTuple()
		expect(val3).to.equal(null)
		expect(err3).to.deep.equal(new Error("test"))
	})

	it("allows recovering", ({ expect }) => {
		const result = safe(() => 10)
			.andThen(n => {
				throw new Error("test")
				return n + 5
			})
			.recover(error => error.message.length)
		expect(result.value).to.equal(4)
		expect(result.error).to.equal(null)
	})

	it("allows async recovering", async ({ expect }) => {
		const result = await safe(async () => 10)
			.andThen(n => {
				throw new Error("test")
				return n + 5
			})
			.recover(error => error.message.length)
		expect(result.value).to.equal(4)
		expect(result.error).to.equal(null)
	})

	it("cannot throw while recovering", async ({ expect }) => {
		const result = await safe(async () => {
			throw new Error("test")
			return 10
		}).recover(() => {
			throw new Error("test2")
		})
		expect(result.value).to.equal(null)
		expect(result.error).to.deep.equal(new Error("test2"))
	})

	it("can unwrap", async ({ expect }) => {
		expect(safe(() => 10).unwrap()).to.equal(10)
		await expect(safe(async () => 10).unwrap()).resolves.equal(10)
		expect(
			safe(() => {
				throw new Error("test")
				return 10
			}).unwrapErr(),
		).to.deep.equal(new Error("test"))
		await expect(
			safe(async () => {
				throw new Error("test")
				return 10
			}).unwrapErr(),
		).resolves.deep.equal(new Error("test"))
	})

	it("can fail to unwrap", async ({ expect }) => {
		expect(() => safe(() => 10).unwrapErr()).toThrow()
		await expect(safe(async () => 10).unwrapErr()).rejects.toThrow()
		expect(() =>
			safe(() => {
				throw new Error("test")
				return 10
			}).unwrap(),
		).toThrow()
		await expect(
			safe(async () => {
				throw new Error("test")
				return 10
			}).unwrap(),
		).rejects.toThrow()
	})

	it("can run a function on success", async ({ expect }) => {
		const spy = vi.fn((n: number) => n + 5)

		expect(safe(() => 10).match(spy)).to.be.undefined
		expect(spy).toHaveBeenCalledOnce()

		spy.mockClear()
		expect(await safe(async () => 10).match(spy)).to.be.undefined
		expect(spy).toHaveBeenCalledOnce()
	})

	it("can run a function on either success or failure", async ({ expect }) => {
		const spy1 = vi.fn((n: number) => n + 5)
		const spy2 = vi.fn((err: Error) => err.message.length)

		expect(safe(() => 10).match(spy1, spy2)).to.equal(15)
		expect(spy1).toHaveBeenCalledOnce()
		expect(spy2).not.toHaveBeenCalled()

		spy1.mockClear()
		spy2.mockClear()
		expect(await safe(async () => 10).match(spy1, spy2)).to.equal(15)
		expect(spy1).toHaveBeenCalledOnce()
		expect(spy2).not.toHaveBeenCalled()

		spy1.mockClear()
		spy2.mockClear()
		expect(
			safe(() => {
				throw new Error("test")
				return 10
			}).match(spy1, spy2),
		).to.equal(4)
		expect(spy1).not.toHaveBeenCalled()
		expect(spy2).toHaveBeenCalledOnce()

		spy1.mockClear()
		spy2.mockClear()
		expect(
			await safe(async () => {
				throw new Error("test")
				return 10
			}).match(spy1, spy2),
		).to.equal(4)
		expect(spy1).not.toHaveBeenCalled()
		expect(spy2).toHaveBeenCalledOnce()
	})
})
