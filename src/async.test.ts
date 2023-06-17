import { describe, vi } from "vitest"
import { asyncMap, pause, retry } from "./async.ts"

describe.concurrent("pause()", it => {
	it("pauses", async ({ expect }) => {
		const start = performance.now()
		await pause(25)
		const delta = performance.now() - start
		expect(delta).to.be.greaterThanOrEqual(25)
	})
})

describe.concurrent("retry()", _ => {
	function makeFailN(n: number) {
		return () => (n-- == 0 ? Promise.resolve("success") : Promise.reject("reason"))
	}

	describe.concurrent("funtional style", it => {
		it("retries until the promise fulfils", async ({ expect }) => {
			const failThrice = makeFailN(3)
			const retryForever = retry({})
			const result = await retryForever(failThrice)
			expect(result).to.equal("success")
		})

		it("rejects with latest error when over count", async ({ expect }) => {
			const fail10 = makeFailN(10)
			const retryThrice = retry({ count: 3 })
			await expect(retryThrice(fail10)).rejects.toThrow("reason")
		})

		it("waits between attemps by a flat delay", async ({ expect }) => {
			const fail3 = makeFailN(3)
			const retryWithDelay = retry({ delay: 15 })
			const start = performance.now()
			const result = await retryWithDelay(fail3)
			expect(result).to.equal("success")
			const delta = performance.now() - start
			expect(delta).to.be.greaterThanOrEqual(3 * 15)
		})

		it("waits between attempts by a variable delay", async ({ expect }) => {
			const fail3 = makeFailN(3)
			const retryWithDelay = retry({ delay: n => n * 10 })
			const start = performance.now()
			const result = await retryWithDelay(fail3)
			expect(result).to.equal("success")
			const delta = performance.now() - start
			expect(delta).to.be.greaterThanOrEqual(10 + 20 + 30)
		})
	})

	describe.concurrent("imperative style", it => {
		it("retries until the promise fulfils", async ({ expect }) => {
			const failThrice = makeFailN(3)
			const result = await retry(failThrice)
			expect(result).to.equal("success")
		})

		it("rejects with latest error when over count", async ({ expect }) => {
			const fail10 = makeFailN(10)
			await expect(retry(fail10, { count: 5 })).rejects.toThrow("reason")
		})

		it("waits between attemps by a flat delay", async ({ expect }) => {
			const fail3 = makeFailN(3)
			const start = performance.now()
			const result = await retry(fail3, { delay: 15 })
			expect(result).to.equal("success")
			const delta = performance.now() - start
			expect(delta).to.be.greaterThanOrEqual(3 * 15)
		})

		it("waits between attempts by a variable delay", async ({ expect }) => {
			const fail3 = makeFailN(3)
			const start = performance.now()
			const result = await retry(fail3, { delay: n => n * 10 })
			expect(result).to.equal("success")
			const delta = performance.now() - start
			expect(delta).to.be.greaterThanOrEqual(10 + 20 + 30)
		})
	})
})

describe.concurrent("asyncMap()", it => {
	function task(n: number) {
		return pause(Math.floor(Math.random() * 400) + 100).then(() => n)
	}
	function throwAt5(n: number) {
		return task(n).then(n => {
			if (n == 5) throw new Error("reason")
			else return n
		})
	}

	it("preserves order", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		const results = await asyncMap(data, task)
		expect(results).to.deep.equal(data)
	})

	it("resolves when given an empty array", async ({ expect }) => {
		const empty = await asyncMap([], task)
		expect(empty).to.deep.equal([])
	})

	it("throws when one of the tasks throws", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		const promise = asyncMap(data, throwAt5)
		expect(promise).rejects.toThrow("reason")
	})

	it("limits the number of promises in flight", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		const temp = { task }
		const spy = vi.spyOn(temp, "task")
		const promise = asyncMap(data, temp.task, { concurrent: 3 })
		expect(spy).toHaveBeenCalledTimes(3)
		expect(await promise).to.deep.equal(data)
		expect(spy).toHaveBeenCalledTimes(5)
	})

	it("works functional style", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		const map = asyncMap(task)
		const results = await map(data)
		expect(results).to.deep.equal(data)
	})
})
