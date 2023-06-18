import { describe } from "vitest"
import { at, constant, find, findIndex, identity, prop } from "./index.ts"

describe.concurrent("identity()", it => {
	it("does nothing", ({ expect }) => {
		expect(identity(5)).to.equal(5)
		expect(identity("test")).to.equal("test")
		const object = { prop: "value" }
		expect(identity(object)).to.equal(object)
	})
})

describe.concurrent("constant()", it => {
	it("is constant", ({ expect }) => {
		const five = constant(5)
		expect(five()).to.equal(5)
		expect(five()).to.equal(5)
	})
})

describe.concurrent("at()", it => {
	const array = ["a", "b", "c"]

	it("works like Array.prototype.at() when index is in range", ({ expect }) => {
		const last = at(-1)
		const maybe = last(array)
		expect(maybe.isSome()).to.be.true
		expect(maybe.orDefault("z")).to.equal(array.at(-1))
	})

	it("returns None when index is out of range", ({ expect }) => {
		const fifth = at(5)
		const maybe = fifth(array)
		expect(maybe.isSome()).to.be.false
		expect(maybe.orDefault("z")).to.equal("z")
	})

	it("works imperative style", ({ expect }) => {
		const maybe = at(array, -1)
		expect(maybe.isSome()).to.be.true
		expect(maybe.orDefault("z")).to.equal(array.at(-1))
		const none = at(array, 5)
		expect(none.isSome()).to.be.false
		expect(none.orDefault("z")).to.equal("z")
	})
})

describe.concurrent("find()", it => {
	const array = ["a", "b", "c"]

	it("returns Some when element exists", ({ expect }) => {
		const greaterThanB = find<string>(c => c > "b")
		const maybe = greaterThanB(array)
		expect(maybe.isSome()).to.be.true
		expect(maybe.orDefault("z")).to.equal("c")
	})

	it("returns None when element is not found", ({ expect }) => {
		const greaterThanD = find<string>(c => c > "d")
		const maybe = greaterThanD(array)
		expect(maybe.isSome()).to.be.false
		expect(maybe.orDefault("z")).to.equal("z")
	})

	it("works imperative style", ({ expect }) => {
		const some = find<string>(array, c => c > "b")
		expect(some.isSome()).to.be.true
		expect(some.orDefault("z")).to.equal("c")
		const none = find<string>(array, c => c > "d")
		expect(none.isSome()).to.be.false
		expect(none.orDefault("z")).to.equal("z")
	})
})

describe.concurrent("findIndex()", it => {
	const array = ["a", "b", "c"]

	it("returns Some when element exists", ({ expect }) => {
		const greaterThanB = findIndex<string>(c => c > "b")
		const maybe = greaterThanB(array)
		expect(maybe.isSome()).to.be.true
		expect(maybe.orDefault(100)).to.equal(2)
	})

	it("returns None when element is not found", ({ expect }) => {
		const greaterThanD = findIndex<string>(c => c > "d")
		const maybe = greaterThanD(array)
		expect(maybe.isSome()).to.be.false
		expect(maybe.orDefault(100)).to.equal(100)
	})

	it("works imperative style", ({ expect }) => {
		const maybe = findIndex(array, c => c > "b")
		expect(maybe.isSome()).to.be.true
		expect(maybe.orDefault(100)).to.equal(2)
		const none = findIndex(array, c => c > "d")
		expect(none.isSome()).to.be.false
		expect(none.orDefault(100)).to.equal(100)
	})
})

describe.concurrent("prop()", it => {
	it("wraps target in a Some", ({ expect }) => {
		const data = { a: { b: { c: 5 }, prop: "value" } }
		const maybe = prop(data, "a", "b")
		expect(maybe.isSome()).to.be.true
		expect(maybe.orDefault({ c: 0 })).to.deep.equal({ c: 5 })
	})

	it("wraps a missing path in a None", ({ expect }) => {
		const data: { [id: string]: { prop: string } } = { abc: { prop: "value" } }
		const some = prop(data, "abc", "prop")
		expect(some.isSome()).to.be.true
		expect(some.orDefault("zzz")).to.equal("value")
		const none = prop(data, "xyz", "prop")
		expect(none.isNone()).to.be.true
		expect(none.orDefault("zzz")).to.equal("zzz")
	})
})
