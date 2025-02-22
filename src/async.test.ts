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
		return () =>
			n-- == 0 ? Promise.resolve("success") : Promise.reject("reason")
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
			expect(delta).to.be.greaterThanOrEqual(3 * 14)
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

	const taskResult = {
		results: [1, 2, 3, 4, 5],
		errors: [],
	}
	const taskResultWithIndexes = {
		results: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
		],
		errors: [],
	}

	it("preserves order", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		const result1 = await asyncMap(data, task)
		expect(result1).to.deep.equal(taskResult)
		const result2 = await asyncMap(data, task, { withSourceIndexes: true })
		expect(result2).to.deep.equal(taskResultWithIndexes)
		const result3 = await asyncMap(data, task, { failFast: true })
		expect(result3).to.deep.equal(taskResult.results)
		const result4 = await asyncMap(data, task, {
			failFast: true,
			withSourceIndexes: true,
		})
		expect(result4).to.deep.equal(taskResultWithIndexes.results)
	})

	it("resolves when given an empty array", async ({ expect }) => {
		const empty1 = await asyncMap([], task)
		expect(empty1).to.deep.equal({ results: [], errors: [] })
		const empty2 = await asyncMap([], task, { withSourceIndexes: true })
		expect(empty2).to.deep.equal({ results: [], errors: [] })
		const empty3 = await asyncMap([], task, { failFast: true })
		expect(empty3).to.deep.equal([])
		const empty4 = await asyncMap([], task, {
			failFast: true,
			withSourceIndexes: true,
		})
		expect(empty4).to.deep.equal([])
	})

	it("doesn't throw in normal mode", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		expect(await asyncMap(data, throwAt5)).to.deep.equal({
			results: [1, 2, 3, 4],
			errors: [new Error("reason")],
		})
		expect(
			await asyncMap(data, throwAt5, { withSourceIndexes: true }),
		).to.deep.equal({
			results: [
				[0, 1],
				[1, 2],
				[2, 3],
				[3, 4],
			],
			errors: [[4, new Error("reason")]],
		})
	})

	it("throws when one of the tasks throws in fail fast mode", async ({
		expect,
	}) => {
		const data = [1, 2, 3, 4, 5]
		const promise1 = asyncMap(data, throwAt5, { failFast: true })
		await expect(promise1).rejects.toThrow(new Error("reason"))
		const promise2 = asyncMap(data, throwAt5, {
			failFast: true,
			withSourceIndexes: true,
		})
		await expect(promise2).rejects.toThrow(new Error("reason"))
	})

	it("limits the number of promises in flight", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		const temp = { task }
		const spy = vi.spyOn(temp, "task")
		const promise = asyncMap(data, temp.task, { concurrent: 3 })
		expect(spy).toHaveBeenCalledTimes(3)
		expect(await promise).to.deep.equal(taskResult)
		expect(spy).toHaveBeenCalledTimes(5)
	})

	it("works functional style", async ({ expect }) => {
		const data = [1, 2, 3, 4, 5]
		const map1 = asyncMap(task)
		expect(await map1(data)).to.deep.equal(taskResult)
		const map2 = asyncMap(task, { withSourceIndexes: true })
		expect(await map2(data)).to.deep.equal(taskResultWithIndexes)
		const map3 = asyncMap(task, { failFast: true })
		expect(await map3(data)).to.deep.equal(taskResult.results)
		const map4 = asyncMap(task, {
			failFast: true,
			withSourceIndexes: true,
		})
		expect(await map4(data)).to.deep.equal(taskResultWithIndexes.results)
	})
})
