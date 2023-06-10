import { describe } from "vitest"
import { Success, Failure, Result } from "./result.ts"

describe.concurrent("Result", it => {
	const success: Result<number, string> = Success(5)
	const failure: Result<number, string> = Failure("reason")

	it("isSuccess()", ({ expect }) => {
		expect(success.isSuccess()).to.be.true
		expect(failure.isSuccess()).to.be.false
	})

	it("isFailure()", ({ expect }) => {
		expect(success.isFailure()).to.be.false
		expect(failure.isFailure()).to.be.true
	})

	it("map()", ({ expect }) => {
		const mappedSuccess = success.map(n => n * 2)
		expect(mappedSuccess.isSuccess()).to.be.true
		expect((mappedSuccess as Success<number, string>).value).to.equal(10)
		const mappedFailure = failure.map(n => n * 2)
		expect(mappedFailure.isSuccess()).to.be.false
	})

	it("flatMap()", ({ expect }) => {
		const succ1 = success.flatMap(n => Success(n * 2))
		expect(succ1.isSuccess()).to.be.true
		expect((succ1 as Success<number, string>).value).to.equal(10)

		const fail1 = success.flatMap(_ => Failure("fail"))
		expect(fail1.isSuccess()).to.be.false
		expect((fail1 as Failure<number, string>).reason).to.equal("fail")

		const fail2 = failure.flatMap(n => Success(n * 2))
		expect(fail2.isSuccess()).to.be.false
		expect((fail2 as Failure<number, string>).reason).to.equal("reason")

		const fail3 = failure.flatMap(_ => Failure("fail"))
		expect(fail3.isSuccess()).to.be.false
		expect((fail3 as Failure<number, string>).reason).to.equal("reason")
	})

	it("toJSON()", ({ expect }) => {
		expect(success.toJSON()).toMatchInlineSnapshot(`
			{
			  "$_kind": "@terrygonguet/utils/functional/result",
			  "$_variant": "@terrygonguet/utils/functional/result/Success",
			  "value": 5,
			}
		`)
		expect(failure.toJSON()).toMatchInlineSnapshot(`
			{
			  "$_kind": "@terrygonguet/utils/functional/result",
			  "$_variant": "@terrygonguet/utils/functional/result/Failure",
			  "reason": "reason",
			}
		`)
	})

	describe.concurrent("Result.JSONReviver()", it => {
		it("does nothing to normal objects", ({ expect }) => {
			const json = `{"prop":"value"}`
			const obj = JSON.parse(json, Result.JSONReviver)
			expect(obj.prop).to.equal("value")
		})

		it("revives a Success", ({ expect }) => {
			const json = `{
				"prop":"value",
				"success": {
					"$_kind": "@terrygonguet/utils/functional/result",
					"$_variant": "@terrygonguet/utils/functional/result/Success",
					"value": 5
				}
			}`
			const obj = JSON.parse(json, Result.JSONReviver)
			expect(obj.prop).to.equal("value")
			expect(obj.success.isSuccess()).to.be.true
			expect(obj.success.value).to.equal(5)
		})

		it("revives a Failure", ({ expect }) => {
			const json = `{
				"prop":"value",
				"failure": {
					"$_kind": "@terrygonguet/utils/functional/result",
					"$_variant": "@terrygonguet/utils/functional/result/Failure",
					"reason": "reason"
				}
			}`
			const obj = JSON.parse(json, Result.JSONReviver)
			expect(obj.prop).to.equal("value")
			expect(obj.failure.isSuccess()).to.be.false
			expect(obj.failure.reason).to.equal("reason")
		})

		it("does a round trip", ({ expect }) => {
			const json = JSON.stringify({ prop: "value", success, failure })
			const obj = JSON.parse(json, Result.JSONReviver)
			expect(obj.prop).to.equal("value")
			expect(obj.success.isSuccess()).to.be.true
			expect(obj.success.value).to.equal(5)
			expect(obj.failure.isSuccess()).to.be.false
			expect(obj.failure.reason).to.equal("reason")
		})

		it("ignores unknown variants", ({ expect }) => {
			const json = `{
				"prop":"value",
				"failure": {
					"$_kind": "@terrygonguet/utils/functional/result",
					"$_variant": "@terrygonguet/utils/functional/result/Unknown",
					"reason": "reason"
				}
			}`
			const obj = JSON.parse(json, Result.JSONReviver)
			expect(obj.prop).to.equal("value")
			expect(obj.failure).to.deep.equal({
				$_kind: "@terrygonguet/utils/functional/result",
				$_variant: "@terrygonguet/utils/functional/result/Unknown",
				reason: "reason",
			})
		})
	})

	describe("Result.try()", it => {
		it("gets the value from the try function", ({ expect }) => {
			const result = Result.try(() => {
				const n = 5
				return n * 2
			}).exec()
			expect(result.isSuccess()).to.be.true
			expect((result as Success<number, string>).value).to.equal(10)
		})

		it("gets the value from catch on error", ({ expect }) => {
			const result = Result.try(() => {
				throw new Error("fail")
			})
				.catch(err => {
					return (err as Error).message
				})
				.exec()
			expect(result.isSuccess()).to.be.false
			expect((result as Failure<number, string>).reason).to.equal("fail")
		})

		it("ignores catch if try does not throw", ({ expect }) => {
			const result = Result.try(() => {
				const n = 5
				return n * 2
			})
				.catch(_ => {
					throw new Error("Should not run")
				})
				.exec()
			expect(result.isSuccess()).to.be.true
			expect((result as Success<number, string>).value).to.equal(10)
		})
	})
})