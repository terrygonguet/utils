import { describe } from "vitest"
import { Option } from "./option.ts"

describe.concurrent("class Option", it => {
	it("from()", ({ expect }) => {
		expect(Option.from(0)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 0,
			}
		`)
		expect(Option.from("")).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": "",
			}
		`)
		expect(Option.from(false)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": false,
			}
		`)
		expect(Option.from(null)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.from(undefined)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.from(Option.Some(5))).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
		expect(Option.from(Option.None())).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.from({ _kind: "Some", value: 5 })).to
			.toMatchInlineSnapshot(`
				Option {
				  "_kind": "Some",
				  "value": {
				    "_kind": "Some",
				    "value": 5,
				  },
				}
			`)
		expect(Option.from({ _kind: "None" })).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": {
			    "_kind": "None",
			  },
			}
		`)
		expect(
			Option.from(
				{ _kind: "Some", value: 5 },
				{ allowOptionLikePOJO: true },
			),
		).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
		expect(Option.from({ _kind: "None" }, { allowOptionLikePOJO: true })).to
			.toMatchInlineSnapshot(`
				Option {
				  "_kind": "None",
				  "value": undefined,
				}
			`)
	})

	it("isOption(), isSome() & isNone()", ({ expect }) => {
		expect(Option.isOption(Option.Some(5))).to.be.true
		expect(Option.isOption(Option.None())).to.be.true
		expect(Option.isOption({ _kind: "Some", value: 5 })).to.be.false
		expect(Option.isOption({ _kind: "None" })).to.be.false
		expect(Option.isOption(null)).to.be.false
		expect(Option.isOption(undefined)).to.be.false
		expect(Option.Some(5).isSome()).to.be.true
		expect(Option.None().isSome()).to.be.false
		expect(Option.Some(5).isNone()).to.be.false
		expect(Option.None().isNone()).to.be.true
	})

	it("wrapFunction()", ({ expect }) => {
		const map = new Map<number, any>([
			[1, null],
			[2, undefined],
			[3, 0],
			[4, ""],
			[5, { _kind: "None" }],
			[6, { _kind: "Some", value: 5 }],
		])
		const get1 = Option.wrapFunction((key: number) => map.get(key))
		const get2 = Option.wrapFunction((key: number) => map.get(key), {
			allowOptionLikePOJO: true,
		})
		expect(get1(0)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(get1(1)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(get1(2)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(get1(3)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 0,
			}
		`)
		expect(get1(4)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": "",
			}
		`)
		expect(get1(5)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": {
			    "_kind": "None",
			  },
			}
		`)
		expect(get1(6)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": {
			    "_kind": "Some",
			    "value": 5,
			  },
			}
		`)
		expect(get2(5)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(get2(6)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
	})

	it("toString()", ({ expect }) => {
		expect(Option.Some(5).toString()).to.equal("Some(5)")
		expect(Option.Some("five").toString()).to.equal('Some("five")')
		expect(Option.Some({ five: 5 }).toString()).to.equal('Some({"five":5})')
		expect(Option.None().toString()).to.equal("None()")
		expect(Option.Some(5) + "").to.equal("Some(5)")
		expect(Option.None() + "").to.equal("None()")
		expect(+Option.Some(5)).to.be.NaN
	})

	it("equals()", ({ expect }) => {
		expect(Option.Some(5).equals(Option.Some(5))).to.be.true
		expect(Option.Some(5).equals(Option.None())).to.be.false
		expect(Option.None().equals(Option.Some(5))).to.be.false
		expect(Option.None().equals(Option.None())).to.be.true
	})

	it("map()", ({ expect }) => {
		expect(Option.Some(5).map(n => n + 5)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 10,
			}
		`)
		expect(Option.None<number>().map(n => n + 5)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.Some(new Map()).map(map => map.get("key"))).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": undefined,
			}
		`)
		expect(
			Option.Some(new Map()).map(map => map.get("key"), {
				coalesce: true,
			}),
		).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.Some(5).map(n => Option.Some(n))).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": Option {
			    "_kind": "Some",
			    "value": 5,
			  },
			}
		`)
	})

	it("flatMap()", ({ expect }) => {
		const divide = (a: number, b: number) =>
			b == 0 ? Option.None() : Option.Some(a / b)

		expect(Option.Some(2).flatMap(n => divide(5, n))).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 2.5,
			}
		`)
		expect(Option.Some(0).flatMap(n => divide(5, n))).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.None<number>().flatMap(n => divide(n, 2))).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
	})

	it("flatten()", ({ expect }) => {
		expect(Option.Some(5).flatten()).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
		expect(Option.None().flatten()).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.Some(Option.Some(5)).flatten()).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
		expect(Option.Some(Option.Some(Option.Some(5))).flatten()).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": Option {
			    "_kind": "Some",
			    "value": 5,
			  },
			}
		`)
		expect(
			Option.Some(Option.Some(Option.Some(5)))
				.flatten()
				.flatten(),
		).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
	})

	it("or(), orDefault(), orUndefined() & orNull()", ({ expect }) => {
		expect(Option.Some(5).or(Option.Some(10))).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
		expect(Option.None().or(Option.Some(10))).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 10,
			}
		`)
		expect(Option.Some(5).orDefault(10)).to.equal(5)
		expect(Option.None().orDefault(10)).to.equal(10)
		expect(Option.Some(5).orUndefined()).to.equal(5)
		expect(Option.None().orUndefined()).to.equal(undefined)
		expect(Option.Some(5).orNull()).to.equal(5)
		expect(Option.None().orNull()).to.equal(null)
	})

	it("unwrap()", ({ expect }) => {
		expect(Option.Some(5).unwrap()).to.equal(5)
		expect(Option.Some(Option.Some(5)).unwrap()).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 5,
			}
		`)
		expect(() => Option.None().unwrap()).to.throw(
			"Tried to unwrap a None()",
		)
	})

	it("filter()", ({ expect }) => {
		expect(Option.Some(10).filter(n => n > 5)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": 10,
			}
		`)
		expect(Option.Some(5).filter(n => n > 5)).to.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		expect(Option.None<number>().filter(n => n > 5)).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "None",
			  "value": undefined,
			}
		`)
		// pay attention to the type narrowing
		expect(Option.Some("string").filter(str => str == "string")).to
			.toMatchInlineSnapshot(`
			Option {
			  "_kind": "Some",
			  "value": "string",
			}
		`)
	})
})

// TODO: test array utils
