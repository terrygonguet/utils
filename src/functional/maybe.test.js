import { describe } from "vitest"
import { Some, None, Maybe } from "./maybe.ts"

describe("Maybe", it => {
	describe("Some", it => {
		it("isSome is true", ({ expect }) => {
			expect(Some(5).isSome()).to.be.true
		})
		it("isNone is false", ({ expect }) => {
			expect(Some(5).isNone()).to.be.false
		})
		it("ignore orDefault value", ({ expect }) => {
			expect(Some(5).orDefault(15)).to.equal(5)
		})
	})

	describe("None", it => {
		it("isSome is false", ({ expect }) => {
			expect(None.isSome()).to.be.false
		})
		it("isNone is true", ({ expect }) => {
			expect(None.isNone()).to.be.true
		})
		it("default to orDefault value", ({ expect }) => {
			expect(None.orDefault(15)).to.equal(15)
		})
	})

	describe("Maybe", it => {
		/** @type {Maybe<number>} */
		const some = Some(5)
		/** @type {Maybe<number>} */
		const none = None

		it("isSome is correct", ({ expect }) => {
			expect(some.isSome()).to.be.true
			expect(none.isSome()).to.be.false
		})
		it("isNone is correct", ({ expect }) => {
			expect(some.isNone()).to.be.false
			expect(none.isNone()).to.be.true
		})
		it("orDefault only works on Some", ({ expect }) => {
			expect(some.orDefault(15)).to.equal(5)
			expect(none.orDefault(15)).to.equal(15)
		})
	})
})
