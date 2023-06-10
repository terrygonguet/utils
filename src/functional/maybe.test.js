import { describe } from "vitest"
import { Some, None, Maybe } from "./maybe.ts"

describe.concurrent("Maybe", it => {
	/** @type {Maybe<number>} */
	const some = Some(5)
	/** @type {Maybe<number>} */
	const none = None

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
		expect(mappedSome.value).to.equal(10)
		const mappedNone = none.map(n => n * 2)
		expect(mappedNone.isNone()).to.be.true
	})

	it("flatMap()", ({ expect }) => {
		const some1 = some.flatMap(n => Some(n * 2))
		expect(some1.isSome()).to.be.true
		expect(some1.value).to.equal(10)
		const none1 = some.flatMap(n => None)
		expect(none1.isNone()).to.be.true
		const some2 = none.flatMap(n => Some(n * 2))
		expect(some2.isSome()).to.be.false
		const none2 = some.flatMap(n => None)
		expect(none2.isNone()).to.be.true
	})

	it("toJSON()", ({ expect }) => {
		expect(some.toJSON()).toMatchInlineSnapshot()
		expect(none.toJSON()).toMatchInlineSnapshot()
	})

	it("Maybe.JSONReviver()", ({ expect }) => {
		const $_kind = "@terrygonguet/utils/functional/maybe"
		const $_variant_Some = "@terrygonguet/utils/functional/maybe/Some"
		const $_variant_None = "@terrygonguet/utils/functional/maybe/None"

		const json1 = `{"prop":"value"}`
		const obj1 = JSON.parse(json1, Maybe.JSONReviver)
		expect(obj1).to.deep.equal({ prop: "value" })

		const json2 = `{"prop":"value","some":{"$_kind":"${$_kind}","$_variant":"${$_variant_Some}","value":5}}`
		const obj2 = JSON.parse(json2, Maybe.JSONReviver)
		expect(obj2.prop).to.equal("value")
		expect(obj2.some.isSome()).to.be.true
		expect(obj2.some.value).to.equal(5)

		const json3 = `{"prop":"value","none":{"$_kind":"${$_kind}","$_variant":"${$_variant_None}"}}`
		const obj3 = JSON.parse(json3, Maybe.JSONReviver)
		expect(obj3.prop).to.equal("value")
		expect(obj3.none).to.equal(None)
	})
})
