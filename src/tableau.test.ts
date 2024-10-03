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

	it("throws when accessing 0", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(() => tab.i(0)).toThrowError(RangeError)
		expect(() => tab.iindexOf(1, 0)).toThrowError(RangeError)
		expect(() => tab.ilastIndexOf(1, 0)).toThrowError(RangeError)
		expect(() => tab.isplice(0, 1)).toThrowError(RangeError)
		expect(() => tab.iwith(0, 0)).toThrowError(RangeError)
	})

	it("ientries() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(Array.from(tab.ientries())).to.deep.equal([
			[1, 1],
			[2, 2],
			[3, 3],
		])
	})

	it("ievery() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.ievery((val, i) => val == i)).to.be.true
	})

	it("ifilter() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.ifilter((value, i) => value == i)).to.deep.equal([1, 2, 3])
	})

	it("ifind() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.ifind((_, i) => i == 3)).to.equal(3)
		expect(tab.ifindLast((_, i) => i == 3)).to.equal(3)
	})

	it("ifindIndex() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.ifindIndex(value => value == 2)).to.equal(2)
		expect(tab.ifindLastIndex(value => value == 2)).to.equal(2)
	})

	it("iflatMap() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.iflatMap((_, i) => Tableau.of(i + ""))).to.deep.equal([
			"1",
			"2",
			"3",
		])
	})

	it("iindexOf() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.iindexOf(2, 2)).to.equal(2)
		expect(tab.iindexOf(2, 3)).to.be.undefined
		expect(tab.ilastIndexOf(2, 2)).to.equal(2)
		expect(tab.ilastIndexOf(2, 1)).to.be.undefined
	})

	it("iindexOf() retuns undefined when not found", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.iindexOf(5)).to.be.undefined
		expect(tab.ilastIndexOf(5)).to.be.undefined
	})

	it("ikeys() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(Array.from(tab.ikeys())).to.deep.equal([1, 2, 3])
	})

	it("imap() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.imap((_, i) => i)).to.deep.equal([1, 2, 3])
	})

	it("ireduce() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.ireduce((sum, _, i) => sum + i, 0)).to.equal(6)
		expect(tab.ireduceRight((sum, _, i) => sum + i, 0)).to.equal(6)
	})

	it("isome() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.isome((_, i) => i >= 3)).to.be.true
	})

	it("isort() does not mutate", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		const sorted = tab.isort((a, b) => b - a)
		expect(tab).to.deep.equal([1, 2, 3])
		expect(sorted).to.deep.equal([3, 2, 1])
		expect(tab).to.not.equal(sorted)
	})

	it("isplice() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.isplice(2, 1, 2.5)).to.deep.equal([1, 2.5, 3])
	})

	it("isplice() does not mutate", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		const spliced = tab.isplice(2, 1, 2.5)
		expect(tab).to.deep.equal([1, 2, 3])
		expect(tab).to.not.equal(spliced)
	})

	it("iwith() is 1 based", ({ expect }) => {
		const tab = Tableau.of(1, 2, 3)
		expect(tab.iwith(2, 2.5)).to.deep.equal([1, 2.5, 3])
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
})
