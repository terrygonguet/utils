import { StandardSchemaV1 } from "@standard-schema/spec"

export class Result<Err extends Error, T> {
	value: T | null
	error: Err | null

	constructor(value: null, error: Err)
	constructor(value: T, error: null)
	constructor(value: T | null, error: Err | null) {
		this.value = value
		this.error = error
	}

	asTuple(): [Err, null] | [null, T] {
		return [this.error, this.value] as any
	}

	asObject(): { value: null; error: Err } | { value: T; error: null } {
		return { value: this.value, error: this.error } as any
	}

	andThen<Err2 extends Error, F extends (value: T) => any>(
		f: F,
	): ReturnType<F> extends Promise<infer U> ? AsyncResult<Err | Err2, U> : Result<Err | Err2, ReturnType<F>> {
		if (this.error) return this as any
		try {
			const newValue = f(this.value!)
			if (newValue instanceof Promise) return new AsyncResult(newValue) as any
			else return new Result(newValue, null) as any
		} catch (error) {
			return new Result(null, RawError.wrap(error)) as any
		}
	}

	match(onValue: (value: T) => void): void
	match<U>(onValue: (value: T) => U, onError: (error: Err) => U): U
	match<U>(onValue: (value: T) => U, onError?: (error: Err) => U) {
		if (this.error) return onError?.(this.error)
		else return onError ? onValue(this.value!) : void onValue(this.value!)
	}

	recover<Err2 extends Error, F extends (error: Err) => T | Promise<T>>(
		f: F,
	): ReturnType<F> extends Promise<T> ? AsyncResult<Err2, T> : Result<Err2, T> {
		if (!this.error) return this as any
		try {
			const newValue = f(this.error)
			if (newValue instanceof Promise) return new AsyncResult(newValue) as any
			else return new Result(newValue, null) as any
		} catch (error) {
			return new Result(null, RawError.wrap(error)) as any
		}
	}

	unwrap(): T {
		if (!this.error) return this.value as T
		else throw new Error("Tried to unwrap a failed Result")
	}

	unwrapErr(): Err {
		if (this.error) return this.error
		else throw new Error("Tried to unwrapErr a successful Result")
	}
}

export class AsyncResult<Err extends Error, T> {
	promise: Promise<T>

	constructor(promise: Promise<T>) {
		this.promise = promise
	}

	asTuple(): Promise<[Err, null] | [null, T]> {
		return this.then(result => result.asTuple())
	}

	asObject(): Promise<{ value: null; error: Err } | { value: T; error: null }> {
		return this.then(result => result.asObject())
	}

	then<U>(cb: (value: Result<Err, T>) => U | Promise<U>): Promise<U> {
		return this.promise.then(
			value => cb(new Result<any, any>(value, null)),
			error => cb(new Result<any, any>(null, RawError.wrap(error))),
		)
	}

	andThen<Err2 extends Error, F extends (value: T) => any>(f: F): AsyncResult<Err | Err2, Awaited<ReturnType<F>>> {
		return new AsyncResult(this.promise.then(value => f(value)))
	}

	match(onValue: (value: T) => void): Promise<void>
	match<U>(onValue: (value: T) => U, onError: (error: Err) => U): Promise<U>
	match<U>(onValue: (value: T) => U, onError?: (error: Err) => U) {
		return this.promise.then(
			value => (onError ? onValue(value) : void onValue(value)),
			error => onError?.(error),
		)
	}

	recover<Err2 extends Error, F extends (error: Err) => T | Promise<T>>(f: F): AsyncResult<Err2, T> {
		return new AsyncResult(
			this.promise.then(
				value => value,
				error => f(error),
			),
		)
	}

	unwrap(): Promise<T> {
		return this.then(result => result.unwrap())
	}

	unwrapErr(): Promise<Err> {
		return this.then(result => result.unwrapErr())
	}
}

class RawError extends Error {
	name = "RawError"
	value: unknown

	constructor(value: unknown) {
		super()
		this.value = value
	}

	static wrap(error: unknown): Error {
		if (error instanceof Error) return error
		else return new RawError(error)
	}
}

export function safe<Err extends Error, T>(promise: Promise<T>): AsyncResult<Error, T>
export function safe<Err extends Error, F extends (...args: any) => Promise<any>>(
	f: F,
	...args: Parameters<F>
): AsyncResult<Err, Awaited<ReturnType<F>>>
export function safe<Err extends Error, F extends (...args: any) => any>(
	f: F,
	...args: Parameters<F>
): Result<Err, ReturnType<F>>
export function safe(promiseOrFunction: any, ...args: any): any {
	if (promiseOrFunction instanceof Promise) return new AsyncResult(promiseOrFunction)
	try {
		const value = promiseOrFunction(...args)
		if (value instanceof Promise) return new AsyncResult(value)
		else return new Result(value, null)
	} catch (error) {
		return new Result(null, RawError.wrap(error))
	}
}

export class SafeFunctionValidationError extends Error {
	name = "SafeFunctionValidationError"
	issues: StandardSchemaV1.FailureResult["issues"]

	constructor(message: string, issues: StandardSchemaV1.FailureResult["issues"], options?: ErrorOptions) {
		super(message, options)
		this.issues = issues
	}
}

interface MakeSafeFnOptions<
	ParamsSchema extends StandardSchemaV1 | undefined,
	ReturnSchema extends StandardSchemaV1 | undefined,
> {
	paramsSchema?: ParamsSchema
	returnSchema?: ReturnSchema
}

// TODO figure out how to accept async functions with validation
export function makeSafeFn<
	Err extends Error,
	ParamsSchema extends StandardSchemaV1 | undefined,
	ReturnSchema extends StandardSchemaV1 | undefined,
	F extends (
		...args: ParamsSchema extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<ParamsSchema> : any
	) => ReturnSchema extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<ReturnSchema> : any,
>(
	f: F,
	options?: MakeSafeFnOptions<ParamsSchema, ReturnSchema>,
): (...args: Parameters<F>) => Result<Err, ReturnType<F>> {
	return function (...args: any): any {
		if (options?.paramsSchema) {
			const parsed = options.paramsSchema["~standard"].validate(args)
			if ("then" in parsed)
				return new Result(
					null,
					new TypeError("[makeSafeFn] Parameters check failed: Async schemas are not supported"),
				)
			else if (parsed.issues)
				return new Result(
					null,
					new SafeFunctionValidationError("[makeSafeFn] Parameters check failed", parsed.issues),
				)
			else args = parsed.value
		}

		if (options?.returnSchema)
			return safe(f, ...args).andThen(returned => {
				const parsed = options.returnSchema!["~standard"].validate(returned)
				if ("then" in parsed)
					throw new TypeError("[makeSafeFn] Return check failed: Async schemas are not supported")
				else if (parsed.issues)
					throw new SafeFunctionValidationError("[makeSafeFn] Return check failed", parsed.issues)
				else return parsed.value
			})
		else return safe(f, ...args)
	}
}
