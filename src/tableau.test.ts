import { describe } from "vitest"
import { Tableau } from "./tableau.ts"
import { range } from "./index.ts"

describe.concurrent("Tableau", it => {
	it("i() is 1 indexed", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.i(1)).to.equal(1)
		expect(tab.i(2)).to.equal(2)
		expect(tab.i(3)).to.equal(3)
	})

	it("i() throws when accessing 0", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(() => tab.i(0)).to.toThrowError(TypeError)
	})

	it("Tableau.from() constructs a new object", ({ expect }) => {
		const tab = Tableau.from(range(1, 4))
		expect(tab).to.instanceOf(Tableau)
		expect(tab.i(1)).to.equal(1)
		expect(tab.i(2)).to.equal(2)
		expect(tab.i(3)).to.equal(3)
	})

	it("Tableau.of() constructs a new object", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab).to.deep.equal([1, 2, 3])
	})

	it("iterate() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(Array.from(tab.iterate())).to.deep.equal([
			[1, 1],
			[2, 2],
			[3, 3],
		])
	})
})
