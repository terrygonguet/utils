import { describe } from "vitest"
import {
	make_randf,
	make_randi,
	make_shuffle,
	randf,
	randi,
	seeded,
	shuffle,
} from "./random.ts"

describe.concurrent("randi()", it => {
	it("Works with 1 parameter", ({ expect }) => {
		for (let i = 0; i < 10_000; i++) {
			const n = randi(25)
			expect(n).to.be.greaterThanOrEqual(0).and.below(25)
			expect(Number.isInteger(n)).to.be.true
		}
	})

	it("Works with 2 parameters", ({ expect }) => {
		for (let i = 0; i < 10_000; i++) {
			const n = randi(10, 25)
			expect(n).to.be.greaterThanOrEqual(10).and.below(25)
			expect(Number.isInteger(n)).to.be.true
		}
	})

	it("can be created with a prng", ({ expect }) => {
		const randi = make_randi(() => 0.5)
		expect(randi(10)).to.equal(5)
	})
})

describe.concurrent("randf()", it => {
	it("Works with 1 parameter", ({ expect }) => {
		for (let i = 0; i < 10_000; i++) {
			expect(randf(25)).to.be.greaterThanOrEqual(0).and.below(25)
		}
	})

	it("Works with 2 parameters", ({ expect }) => {
		for (let i = 0; i < 10_000; i++) {
			expect(randf(10, 25)).to.be.greaterThanOrEqual(10).and.below(25)
		}
	})

	it("can be created with a prng", ({ expect }) => {
		const randf = make_randf(() => 0.5)
		expect(randf(5)).to.equal(2.5)
	})
})

describe.concurrent("shuffle()", it => {
	it("Doesn't mutate the input array", ({ expect }) => {
		const arr = [1, 2, 3, 4, 5]
		const shuffled = shuffle(arr)
		expect(shuffled).to.not.equal(arr)
		expect(shuffled.length).to.equal(arr.length)
	})

	it("shuffles", ({ expect }) => {
		const arr = [1, 2, 3, 4, 5]
		for (let i = 0; i < 100; i++) {
			const shuffled = shuffle(arr)
			const indexes = shuffled
				.map(n => arr.indexOf(n))
				.sort((a, b) => a - b)
			expect(indexes).to.deep.equal([0, 1, 2, 3, 4])
		}
	})

	it("can be created with a prng", ({ expect }) => {
		const shuffle = make_shuffle(() => 0.5)
		const arr = [1, 2, 3, 4, 5]
		expect(shuffle(arr)).to.deep.equal([3, 4, 2, 1, 5])
	})
})

describe.concurrent("seeded()", it => {
	it("can be seeded with a string", ({ expect }) => {
		const prng = seeded("some string")
		expect(prng()).to.toMatchInlineSnapshot(`0.5650031038094312`)
		expect(prng()).to.toMatchInlineSnapshot(`0.7189167360775173`)
		expect(prng()).to.toMatchInlineSnapshot(`0.5365477467421442`)
		expect(prng()).to.toMatchInlineSnapshot(`0.3206991928163916`)
		expect(prng()).to.toMatchInlineSnapshot(`0.9168797344900668`)
	})

	it("can be seeded with a number", ({ expect }) => {
		const prng = seeded(123456789)
		expect(prng()).to.toMatchInlineSnapshot(`0.9030358924064785`)
		expect(prng()).to.toMatchInlineSnapshot(`0.05076879356056452`)
		expect(prng()).to.toMatchInlineSnapshot(`0.61163734132424`)
		expect(prng()).to.toMatchInlineSnapshot(`0.11888969084247947`)
		expect(prng()).to.toMatchInlineSnapshot(`0.35593327321112156`)
	})
})
