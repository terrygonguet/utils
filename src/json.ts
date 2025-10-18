import { StandardSchemaV1 } from "@standard-schema/spec"

/**
 * This function does no runtime type checking,
 * make sure that the parsed value is valid
 */
export function safeParse<T>(
	str: string,
	defaultValue: T,
	reviver?: (key: string, value: any) => any,
): T {
	try {
		return JSON.parse(str, reviver)
	} catch (_) {
		return defaultValue
	}
}

type SchemaParseReturn<Schema extends StandardSchemaV1> =
	| [parseError: Error, validationFailure: null, output: null]
	| [
			parseError: null,
			validationFailure: StandardSchemaV1.FailureResult,
			output: null,
	  ]
	| [
			parseError: null,
			validationFailure: null,
			output: StandardSchemaV1.InferOutput<Schema>,
	  ]

export function schemaParse<
	Schema extends StandardSchemaV1,
	Async extends boolean = false,
>(
	schema: Schema,
	str: string,
	options?: { reviver?(key: string, value: any): any; async?: Async },
): Async extends true
	? Promise<SchemaParseReturn<Schema>>
	: SchemaParseReturn<Schema>
/**
 * ! HACK relax type constraints because TS has trouble with options.async for some reason
 */
export function schemaParse(
	schema: StandardSchemaV1,
	str: string,
	options?: { reviver?(key: string, value: any): any; async?: boolean },
):
	| Promise<SchemaParseReturn<StandardSchemaV1>>
	| SchemaParseReturn<StandardSchemaV1> {
	try {
		const parsed = JSON.parse(str, options?.reviver)
		const result = schema["~standard"].validate(parsed)

		if (options?.async) {
			if (result instanceof Promise) {
				return result.then(
					result =>
						result.issues
							? [null, result, null]
							: [null, null, result.value],
					err => [err, null, null],
				)
			} else {
				return Promise.resolve(
					result.issues
						? [null, result, null]
						: [null, null, result.value],
				)
			}
		} else {
			if (result instanceof Promise)
				throw new Error(
					"Function schemaParse() whas called with an async schema but without the async flag",
				)
			else if (result.issues) return [null, result, null]
			else return [null, null, result.value]
		}
	} catch (error) {
		return [error as any, null, null]
	}
}

export function schemaParseWithDefault<
	Schema extends StandardSchemaV1,
	Async extends boolean = false,
>(
	schema: Schema,
	str: string,
	defaultValue: StandardSchemaV1.InferOutput<Schema>,
	options?: {
		reviver?(key: string, value: any): any
		async?: Async
		out_parseError?: Error[]
		out_validationFailure?: StandardSchemaV1.FailureResult[]
	},
): Async extends true
	? Promise<StandardSchemaV1.InferOutput<Schema>>
	: StandardSchemaV1.InferOutput<Schema>
/**
 * ! HACK relax type constraints because TS has trouble with options.async for some reason
 */
export function schemaParseWithDefault(
	schema: StandardSchemaV1,
	str: string,
	defaultValue: any,
	options?: {
		reviver?(key: string, value: any): any
		async?: boolean
		out_parseError?: Error[]
		out_validationFailure?: StandardSchemaV1.FailureResult[]
	},
): Promise<any> | any {
	const result = schemaParse(schema, str, options)
	if (result instanceof Promise) {
		return result.then(([error, failure, value]) => {
			if (failure) {
				options?.out_validationFailure?.push(failure)
				return defaultValue
			} else if (error) {
				options?.out_parseError?.push(error)
				return defaultValue
			} else return value
		})
	} else {
		const [error, failure, value] = result
		if (failure) {
			options?.out_validationFailure?.push(failure)
			return defaultValue
		} else if (error) {
			options?.out_parseError?.push(error)
			return defaultValue
		} else return value
	}
}
