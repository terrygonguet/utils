import { describe } from "vitest"
import { Some, None, Maybe } from "./maybe.ts"

describe("Maybe", it => {
	/** @type {Maybe<number>} */
	const some = Some(5)
	/** @type {Maybe<number>} */
	const none = None

	it("isSome", ({ expect }) => {
		expect(some.isSome()).to.be.true
		expect(none.isSome()).to.be.false
	})

	it("isNone", ({ expect }) => {
		expect(some.isNone()).to.be.false
		expect(none.isNone()).to.be.true
	})

	it("orDefault", ({ expect }) => {
		expect(some.orDefault(15)).to.equal(5)
		expect(none.orDefault(15)).to.equal(15)
	})

	it("map", ({ expect }) => {
		const mappedSome = some.map(n => n * 2)
		expect(mappedSome.isSome()).to.be.true
		expect(mappedSome.value).to.equal(10)
		const mappedNone = none.map(n => n * 2)
		expect(mappedNone.isNone()).to.be.true
	})

	it("flatMap", ({ expect }) => {
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
})
