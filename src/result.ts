class Result<Err extends Error, T> {
	value: T | null
	error: Err | null

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
	): ReturnType<F> extends Promise<any>
		? AsyncResult<Err | Err2, Awaited<ReturnType<F>>>
		: Result<Err | Err2, ReturnType<F>> {
		if (this.error || !this.value) return this as any
		try {
			const newValue = f(this.value)
			if (newValue instanceof Promise)
				return new AsyncResult(newValue) as any
			else return new Result(newValue, null) as any
		} catch (error) {
			return new Result(null, RawError.wrap(error)) as any
		}
	}

	unwrap(): T {
		if (this.value && !this.error) return this.value as T
		else throw new Error("Tried to unwrap a failed Result")
	}

	unwrapErr(): Err {
		if (this.error) return this.error
		else throw new Error("Tried to unwrapErr a successful Result")
	}
}

class AsyncResult<Err extends Error, T> {
	promise: Promise<T>

	constructor(promise: Promise<T>) {
		this.promise = promise
	}

	asTuple(): Promise<[Err, null] | [null, T]> {
		return this.then(result => result.asTuple())
	}

	asObject(): Promise<
		{ value: null; error: Err } | { value: T; error: null }
	> {
		return this.then(result => result.asObject())
	}

	then<U>(cb: (value: Result<Err, T>) => U | Promise<U>): Promise<U> {
		return this.promise.then(
			value => cb(new Result<any, any>(value, null)),
			error => cb(new Result<any, any>(null, RawError.wrap(error))),
		)
	}

	andThen<Err2 extends Error, F extends (value: T) => any>(
		f: F,
	): AsyncResult<Err | Err2, Awaited<ReturnType<F>>> {
		return new AsyncResult(this.promise.then(value => f(value)))
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

export function safe<Err extends Error, T>(
	promise: Promise<T>,
): AsyncResult<Error, T>
export function safe<
	Err extends Error,
	F extends (...args: any) => Promise<any>,
>(f: F, ...args: Parameters<F>): AsyncResult<Err, Awaited<ReturnType<F>>>
export function safe<Err extends Error, F extends (...args: any) => any>(
	f: F,
	...args: Parameters<F>
): Result<Err, ReturnType<F>>
export function safe(promiseOrFunction: any, ...args: any): any {
	if (promiseOrFunction instanceof Promise)
		return new AsyncResult(promiseOrFunction)
	try {
		const value = promiseOrFunction(...args)
		if (value instanceof Promise) return new AsyncResult(value)
		else return new Result(value, null)
	} catch (error) {
		return new Result(null, RawError.wrap(error))
	}
}
