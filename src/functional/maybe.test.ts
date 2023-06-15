import { describe } from "vitest"
import { Maybe, type Some } from "./maybe.ts"
import { constant, identity } from "./index.ts"

describe.concurrent("Maybe", it => {
	const some: Maybe<number> = Maybe.Some(5)
	const none: Maybe<number> = Maybe.None

	it("isSome()", ({ expect }) => {
		expect(some.isSome()).to.be.true
		expect(none.isSome()).to.be.false
	})

	it("isNone()", ({ expect }) => {
		expect(some.isNone()).to.be.false
		expect(none.isNone()).to.be.true
	})

	it("orDefault()", ({ expect }) => {
		expect(some.orDefault(15)).to.equal(5)
		expect(none.orDefault(15)).to.equal(15)
	})

	it("map()", ({ expect }) => {
		const mappedSome = some.map(n => n * 2)
		expect(mappedSome.isSome()).to.be.true
		expect((mappedSome as Some<number>).value).to.equal(10)
		const mappedNone = none.map(n => n * 2)
		expect(mappedNone.isNone()).to.be.true
	})

	it("flatMap()", ({ expect }) => {
		const some1 = some.flatMap(n => Maybe.Some(n * 2))
		expect(some1.isSome()).to.be.true
		expect((some1 as Some<number>).value).to.equal(10)
		const none1 = some.flatMap(_ => Maybe.None)
		expect(none1.isNone()).to.be.true
		const some2 = none.flatMap(n => Maybe.Some(n * 2))
		expect(some2.isSome()).to.be.false
		const none2 = some.flatMap(_ => Maybe.None)
		expect(none2.isNone()).to.be.true
	})

	it("toResult()", ({ expect }) => {
		const mapNone = constant("reason")
		const success = Maybe.Some(5).toResult(mapNone)
		const failure = Maybe.None.toResult(mapNone)
		expect(success.isSuccess()).to.be.true
		expect(failure.isFailure()).to.be.true
		expect(success.merge(n => n.toString(), identity)).to.equal("5")
		expect(failure.merge(n => n.toString(), identity)).to.equal("reason")
	})

	it("toJSON()", ({ expect }) => {
		expect(some.toJSON()).toMatchInlineSnapshot()
		expect(none.toJSON()).toMatchInlineSnapshot()
	})

	describe.concurrent("Maybe.from()", it => {
		it("wraps values in a Some", ({ expect }) => {
			const some1 = Maybe.from(5)
			expect(some1.isSome()).to.be.true
			expect(some1.orDefault(10)).to.equal(5)
			const some2 = Maybe.from({ prop: "value" })
			expect(some2.isSome()).to.be.true
			expect(some2.orDefault({ prop: "default" })).to.deep.equal({ prop: "value" })
			const some3 = Maybe.from([1, 2, 3])
			expect(some3.isSome()).to.be.true
			expect(some3.orDefault([4, 5, 6])).to.deep.equal([1, 2, 3])
		})

		it("wraps null & undefined in None", ({ expect }) => {
			const none1 = Maybe.from(null)
			expect(none1.isNone()).to.be.true
			const none2 = Maybe.from(undefined)
			expect(none2.isNone()).to.be.true
		})
	})

	describe.concurrent("Maybe.fromPromise()", it => {
		it("wraps return values in a Some", async ({ expect }) => {
			const promise = Promise.resolve(5)
			const maybe = await Maybe.fromPromise(promise, n => n * 2)
			expect(maybe.isSome()).to.be.true
			expect(maybe.orDefault(0)).to.equal(10)
		})

		it("swallows errors and returns None", async ({ expect }) => {
			const promise = Promise.reject<number>("reason")
			const maybe = await Maybe.fromPromise(promise, n => n * 2)
			expect(maybe.isSome()).to.be.false
			expect(maybe.orDefault(0)).to.equal(0)
		})
	})

	describe.concurrent("Maybe.JSONReviver()", it => {
		const $_kind = "@terrygonguet/utils/functional/maybe"
		const $_variant_Some = "@terrygonguet/utils/functional/maybe/Some"
		const $_variant_None = "@terrygonguet/utils/functional/maybe/None"

		it("does nothing to normal objects", ({ expect }) => {
			const json1 = `{"prop":"value"}`
			const obj1 = JSON.parse(json1, Maybe.JSONReviver)
			expect(obj1).to.deep.equal({ prop: "value" })
		})

		it("revives a Some", ({ expect }) => {
			const json2 = `{"prop":"value","some":{"$_kind":"${$_kind}","$_variant":"${$_variant_Some}","value":5}}`
			const obj2 = JSON.parse(json2, Maybe.JSONReviver)
			expect(obj2.prop).to.equal("value")
			expect(obj2.some.isSome()).to.be.true
			expect(obj2.some.value).to.equal(5)
		})

		it("revives a None", ({ expect }) => {
			const json3 = `{"prop":"value","none":{"$_kind":"${$_kind}","$_variant":"${$_variant_None}"}}`
			const obj3 = JSON.parse(json3, Maybe.JSONReviver)
			expect(obj3.prop).to.equal("value")
			expect(obj3.none).to.equal(Maybe.None)
		})

		it("does a round trip", ({ expect }) => {
			const json4 = JSON.stringify({ prop: "value", some: Maybe.Some(5), none: Maybe.None })
			const obj4 = JSON.parse(json4, Maybe.JSONReviver)
			expect(obj4.prop).to.equal("value")
			expect(obj4.some.isSome()).to.be.true
			expect(obj4.some.value).to.equal(5)
			expect(obj4.none).to.equal(Maybe.None)
		})

		it("ignores unknown variants", ({ expect }) => {
			const json = `{
				"prop":"value",
				"some": {
					"$_kind": "@terrygonguet/utils/functional/maybe",
					"$_variant": "@terrygonguet/utils/functional/maybe/Unknown",
					"value": 5
				}
			}`
			const obj = JSON.parse(json, Maybe.JSONReviver)
			expect(obj.prop).to.equal("value")
			expect(obj.some).to.deep.equal({
				$_kind: "@terrygonguet/utils/functional/maybe",
				$_variant: "@terrygonguet/utils/functional/maybe/Unknown",
				value: 5,
			})
		})
	})
})
