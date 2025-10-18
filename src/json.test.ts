import { describe } from "vitest"
import { safeParse, schemaParse, schemaParseWithDefault } from "./json.ts"
import type { StandardSchemaV1 } from "@standard-schema/spec"

describe.concurrent("safeParse()", it => {
	it("works the same as JSON.parse for valid objects", ({ expect }) => {
		const data = { prop: "value" }
		const json = JSON.stringify(data)
		expect(safeParse(json, {})).to.deep.equal(data)
	})

	it("uses default value for malformed JSON", ({ expect }) => {
		expect(safeParse(`{"prop":}`, { prop: "default" })).to.deep.equal({
			prop: "default",
		})
	})

	it("uses revivers", ({ expect }) => {
		expect(
			safeParse(
				`{"prop":"value","other":"ignored"}`,
				{ prop: "value", other: "ignored" },
				function (key: string, value: any) {
					if (key == "prop") return "replaced"
					else return value
				},
			),
		).to.deep.equal({
			prop: "replaced",
			other: "ignored",
		})
	})
})

describe.concurrent("schemaParse()", it => {
	it("parses and validates valid JSON", ({ expect }) => {
		const data = { prop: "value" }
		const json = JSON.stringify(data)

		expect(schemaParse(schemaSuccess, json)).to.deep.equal([
			null,
			null,
			data,
		])
		expect(schemaParse(schemaFailure, json)).to.deep.equal([
			null,
			{ issues },
			null,
		])
	})

	it("fails for malformed JSON", ({ expect }) => {
		const err1 = schemaParse(schemaSuccess, `{"prop":}`)
		expect(err1[0]).to.toBeInstanceOf(SyntaxError)
		expect(err1[1]).to.be.null
		expect(err1[2]).to.be.null

		const err2 = schemaParse(schemaFailure, `{"prop":}`)
		expect(err2[0]).to.toBeInstanceOf(SyntaxError)
		expect(err2[1]).to.be.null
		expect(err2[2]).to.be.null
	})

	it("fails when given an async validator in sync mode", async ({
		expect,
	}) => {
		const data = { prop: "value" }
		const json = JSON.stringify(data)

		const err1 = schemaParse(schemaAsyncSuccess, json)
		expect(err1[0]).to.toBeInstanceOf(Error)
		expect(err1[1]).to.be.null
		expect(err1[2]).to.be.null

		// but doesn't fail if we pass a sync validator with async flag
		const promise = schemaParse(schemaSuccess, json, { async: true })
		expect(promise).to.toBeInstanceOf(Promise)
		expect(await promise).to.deep.equal([null, null, data])
	})

	it("uses revivers", ({ expect }) => {
		expect(
			schemaParse(schemaSuccess, `{"prop":"value","other":"ignored"}`, {
				reviver(key: string, value: any) {
					if (key == "prop") return "replaced"
					else return value
				},
			}),
		).to.deep.equal([null, null, { prop: "replaced" }])
	})

	it("works the same in async mode", async ({ expect }) => {
		const data = { prop: "value" }
		const json = JSON.stringify(data)

		expect(
			await schemaParse(schemaAsyncSuccess, json, { async: true }),
		).to.deep.equal([null, null, data])

		expect(
			await schemaParse(schemaAsyncFailure, json, { async: true }),
		).to.deep.equal([null, { issues }, null])

		const err1 = await schemaParse(schemaAsyncSuccess, `{"prop":}`, {
			async: true,
		})
		expect(err1[0]).to.toBeInstanceOf(SyntaxError)
		expect(err1[1]).to.be.null
		expect(err1[2]).to.be.null

		expect(
			await schemaParse(
				schemaAsyncSuccess,
				`{"prop":"value","other":"ignored"}`,
				{
					async: true,
					reviver(key: string, value: any) {
						if (key == "prop") return "replaced"
						else return value
					},
				},
			),
		).to.deep.equal([null, null, { prop: "replaced" }])
	})
})

describe.concurrent("schemaParseWithDefaults()", it => {
	it("works the same when no error", async ({ expect }) => {
		const data = { prop: "value" }
		const json = JSON.stringify(data)

		expect(schemaParseWithDefault(schemaSuccess, json, data)).to.deep.equal(
			data,
		)
		expect(
			await schemaParseWithDefault(schemaSuccess, json, data, {
				async: true,
			}),
		).to.deep.equal(data)
		expect(
			schemaParseWithDefault(
				schemaSuccess,
				`{"prop":"value","other":"ignored"}`,
				data,
				{
					reviver(key: string, value: any) {
						if (key == "prop") return "replaced"
						else return value
					},
				},
			),
		).to.deep.equal({ prop: "replaced" })
	})

	it("returns default value for any problem", async ({ expect }) => {
		const data = { prop: "value" }
		expect(
			schemaParseWithDefault(schemaSuccess, `{"prop":}`, data),
		).to.deep.equal(data)
		expect(
			schemaParseWithDefault(
				schemaFailure,
				JSON.stringify({ whatever: "stuff" }),
				data,
			),
		).to.deep.equal(data)
		expect(
			await schemaParseWithDefault(
				schemaAsyncSuccess,
				`{"prop":}`,
				data,
				{
					async: true,
				},
			),
		).to.deep.equal(data)
		expect(
			await schemaParseWithDefault(
				schemaAsyncFailure,
				JSON.stringify({ whatever: "stuff" }),
				data,
				{
					async: true,
				},
			),
		).to.deep.equal(data)
	})

	it("gives access to errors & validation via out params", async ({
		expect,
	}) => {
		const data = { prop: "value" }
		const out_parseError: Error[] = []
		const out_validationFailure: StandardSchemaV1.FailureResult[] = []

		schemaParseWithDefault(schemaSuccess, `{"prop":}`, data, {
			out_parseError,
			out_validationFailure,
		})
		expect(out_parseError[0]).to.toBeInstanceOf(SyntaxError)
		expect(out_validationFailure).to.deep.equal([])
		out_parseError.length = 0
		out_validationFailure.length = 0

		schemaParseWithDefault(
			schemaFailure,
			JSON.stringify({ whatever: "stuff" }),
			data,
			{
				out_parseError,
				out_validationFailure,
			},
		)
		expect(out_parseError).to.deep.equal([])
		expect(out_validationFailure).to.deep.equal([{ issues }])
		out_parseError.length = 0
		out_validationFailure.length = 0

		await schemaParseWithDefault(schemaAsyncSuccess, `{"prop":}`, data, {
			async: true,
			out_parseError,
			out_validationFailure,
		})
		expect(out_parseError[0]).to.toBeInstanceOf(SyntaxError)
		expect(out_validationFailure).to.deep.equal([])
		out_parseError.length = 0
		out_validationFailure.length = 0

		await schemaParseWithDefault(
			schemaAsyncFailure,
			JSON.stringify({ whatever: "stuff" }),
			data,
			{
				async: true,
				out_parseError,
				out_validationFailure,
			},
		)
		expect(out_parseError).to.deep.equal([])
		expect(out_validationFailure).to.deep.equal([{ issues }])
		out_parseError.length = 0
		out_validationFailure.length = 0
	})
})

const schemaSuccess: StandardSchemaV1<unknown, { prop: string }> = {
	"~standard": {
		version: 1,
		vendor: "test",
		validate(input: any) {
			return {
				value: { prop: input.prop },
			}
		},
	},
}

const schemaAsyncSuccess: StandardSchemaV1<unknown, { prop: string }> = {
	"~standard": {
		version: 1,
		vendor: "test",
		async validate(input: any) {
			return {
				value: { prop: input.prop },
			}
		},
	},
}

const issues = [{ message: "test failure", path: ["prop"] }]
const schemaFailure: StandardSchemaV1<unknown, { prop: string }> = {
	"~standard": {
		version: 1,
		vendor: "test",
		validate(_) {
			return { issues }
		},
	},
}
const schemaAsyncFailure: StandardSchemaV1<unknown, { prop: string }> = {
	"~standard": {
		version: 1,
		vendor: "test",
		async validate(_) {
			return { issues }
		},
	},
}
