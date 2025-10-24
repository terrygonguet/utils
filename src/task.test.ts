import { describe } from "vitest"
import { Task } from "./task.ts"
import { pause } from "./async.ts"

describe.concurrent("Class Task", it => {
	it("from()", async ({ expect }) => {
		await expect(Task.from(5)).resolves.toMatchInlineSnapshot(`5`)
		await expect(Task.from(undefined)).resolves.toMatchInlineSnapshot(
			`undefined`,
		)
		await expect(
			Task.from(new Error("test")),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)

		const promise = pause(50).then(() => 5)
		const task = Task.from(promise)
		expect(task.toString()).toMatchInlineSnapshot(`"Task(Pending)"`)
		await expect(task).resolves.toMatchInlineSnapshot(`5`)

		await expect(
			Task.from(Promise.reject(new Error("test"))),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)
	})

	it("fromPromise()", async ({ expect }) => {
		const promise = pause(50).then(() => 5)
		const task = Task.fromPromise(promise)
		expect(task.toString()).toMatchInlineSnapshot(`"Task(Pending)"`)
		await expect(task).resolves.toMatchInlineSnapshot(`5`)

		await expect(
			Task.fromPromise(Promise.reject(new Error("test"))),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)
	})

	it("complete() & failed()", async ({ expect }) => {
		await expect(Task.complete(5)).resolves.toMatchInlineSnapshot(`5`)
		await expect(Task.complete(null)).resolves.toMatchInlineSnapshot(`null`)
		await expect(
			Task.failed(new Error("test")),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)
	})

	it("isTask(), isComplete(), isPending() & isFailed()", ({ expect }) => {
		expect(Task.isTask(Task.from(5))).to.be.true
		expect(Task.isTask(Task.from(new Error("test")))).to.be.true
		expect(Task.isTask(Task.from(pause(50)))).to.be.true
		expect(Task.isTask(null)).to.be.false
		expect(Task.isTask({})).to.be.false
		expect(Task.isTask(new Error("test"))).to.be.false
		expect(Task.isTask(pause(50))).to.be.false

		const complete = Task.from(5)
		expect(complete.isComplete()).to.be.true
		expect(complete.isPending()).to.be.false
		expect(complete.isFailed()).to.be.false

		const failed = Task.from(new Error("test"))
		expect(failed.isComplete()).to.be.false
		expect(failed.isPending()).to.be.false
		expect(failed.isFailed()).to.be.true

		const pending = Task.from(pause(50))
		expect(pending.isComplete()).to.be.false
		expect(pending.isPending()).to.be.true
		expect(pending.isFailed()).to.be.false
	})

	it("wrapFunction()", async ({ expect }) => {
		const f = Task.wrapFunction((causeError: boolean) => {
			if (causeError) throw new Error("test")
			else return 5
		})

		await expect(f(false)).resolves.toMatchInlineSnapshot(`5`)
		await expect(f(true)).rejects.toMatchInlineSnapshot(`[Error: test]`)
	})

	it("toString()", ({ expect }) => {
		expect(Task.from(5).toString()).to.equal("Task(Complete: 5)")
		expect(Task.from("test").toString()).to.equal(`Task(Complete: "test")`)
		expect(Task.from({ key: "value" }).toString()).to.equal(
			`Task(Complete: {"key":"value"})`,
		)
		expect(Task.from(true).toString()).to.equal(`Task(Complete: true)`)
		expect(Task.from(new Error("test")).toString()).to.equal(
			`Task(Failed: test)`,
		)
		expect(Task.from(pause(50)).toString()).to.equal(`Task(Pending)`)
	})

	it("map()", async ({ expect }) => {
		await expect(
			Task.from(5).map(n => n + 5),
		).resolves.toMatchInlineSnapshot(`10`)
		await expect(
			Task.from<number>(new Error("test")).map(n => n + 5),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)

		await expect(
			Task.from(5).map(() => {
				throw new Error("other")
			}),
		).rejects.toMatchInlineSnapshot(`[Error: other]`)
		await expect(
			Task.from(new Error("test")).map(() => {
				throw new Error("other")
			}),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)

		await expect(
			Task.from(pause(50).then(() => 5)).map(n => n + 5),
		).resolves.toMatchInlineSnapshot(`10`)
		await expect(
			Task.from(pause(50).then(() => 5)).map(() => {
				throw new Error("test")
			}),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)
	})

	it("flatMap()", async ({ expect }) => {
		const f = (causeError: boolean) =>
			causeError ? Task.failed(new Error("test")) : Task.complete(5)
		await expect(
			Task.from(false).flatMap(f),
		).resolves.toMatchInlineSnapshot(`5`)
		await expect(Task.from(true).flatMap(f)).rejects.toMatchInlineSnapshot(
			`[Error: test]`,
		)

		await expect(
			Task.from<boolean>(new Error("other")).flatMap(f),
		).rejects.toMatchInlineSnapshot(`[Error: other]`)
		await expect(
			Task.from(Promise.reject(new Error("other"))),
		).rejects.toMatchInlineSnapshot(`[Error: other]`)

		await expect(
			Task.from(pause(50).then(() => false)).flatMap(f),
		).resolves.toMatchInlineSnapshot(`5`)
		await expect(
			Task.from(pause(50).then(() => true)).flatMap(f),
		).rejects.toMatchInlineSnapshot(`[Error: test]`)
	})

	it("unwrap()", ({ expect }) => {
		expect(Task.complete(5).unwrap()).to.equal(5)
		expect(() => Task.failed(new Error("test")).unwrap()).to.throw()
		expect(() => Task.fromPromise(pause(50)).unwrap()).to.throw()
	})

	it("orDefault()", async ({ expect }) => {
		await expect(Task.complete(5).orDefault(10)).resolves.toEqual(5)
		await expect(
			Task.failed(new Error("test")).orDefault(10),
		).resolves.toEqual(10)
		await expect(
			Task.fromPromise(pause(50).then(() => 5)).orDefault(10),
		).resolves.toEqual(5)
		await expect(
			Task.fromPromise<number>(
				pause(50).then(() => {
					throw new Error("test")
				}),
			).orDefault(10),
		).resolves.toEqual(10)
	})

	it("do()", async ({ expect }) => {
		const fetchUser = (id: number) =>
			Task.fromPromise(
				pause(50).then(() => {
					if (id == 3) throw new TypeError("test")
					else return { id }
				}),
			)
		const fetchPosts = (id: number) =>
			Task.from(id == 2 ? [] : ["some post"])

		const result1 = Task.do(function* () {
			const user = yield* fetchUser(1)
			const posts = yield* fetchPosts(user.id)
			return posts.length
		})
		await expect(result1).resolves.toEqual(1)

		const result2 = Task.do(function* () {
			const user = yield* fetchUser(2)
			const posts = yield* fetchPosts(user.id)
			return posts.length
		})
		await expect(result2).resolves.toEqual(0)

		const result3 = Task.do(function* () {
			const user = yield* fetchUser(3)
			const posts = yield* fetchPosts(user.id)
			return posts.length
		})
		await expect(result3).rejects.toMatchInlineSnapshot(`[TypeError: test]`)
	})
})
