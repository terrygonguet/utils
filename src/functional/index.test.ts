import { describe } from "vitest"
import { at, constant, find, findIndex, identity } from "./index.ts"

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

describe.concurrent("at()", _ => {
	const array = ["a", "b", "c"]

	describe.concurrent("functional style", it => {
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
	})

	describe.concurrent("imperative style", it => {
		it("works like Array.prototype.at() when index is in range", ({ expect }) => {
			const maybe = at(array, -1)
			expect(maybe.isSome()).to.be.true
			expect(maybe.orDefault("z")).to.equal(array.at(-1))
		})

		it("returns None when index is out of range", ({ expect }) => {
			const maybe = at(array, 5)
			expect(maybe.isSome()).to.be.false
			expect(maybe.orDefault("z")).to.equal("z")
		})
	})
})

describe.concurrent("find(): functional", _ => {
	const array = ["a", "b", "c"]

	describe.concurrent("functional style", it => {
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
	})

	describe.concurrent("imperative style", it => {
		it("returns Some when element exists", ({ expect }) => {
			const maybe = find(array, c => c > "b")
			expect(maybe.isSome()).to.be.true
			expect(maybe.orDefault("z")).to.equal("c")
		})

		it("returns None when element is not found", ({ expect }) => {
			const maybe = find(array, c => c > "d")
			expect(maybe.isSome()).to.be.false
			expect(maybe.orDefault("z")).to.equal("z")
		})
	})
})

describe.concurrent("findIndex(): functional", _ => {
	const array = ["a", "b", "c"]

	describe.concurrent("functional style", it => {
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
	})

	describe.concurrent("imperative style", it => {
		it("returns Some when element exists", ({ expect }) => {
			const maybe = findIndex(array, c => c > "b")
			expect(maybe.isSome()).to.be.true
			expect(maybe.orDefault(100)).to.equal(2)
		})

		it("returns None when element is not found", ({ expect }) => {
			const maybe = findIndex(array, c => c > "d")
			expect(maybe.isSome()).to.be.false
			expect(maybe.orDefault(100)).to.equal(100)
		})
	})
})
