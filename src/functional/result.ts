import { compose, identity } from "./index"
import { Maybe } from "./maybe"

const $_kind = "@terrygonguet/utils/functional/result"
const $_variant_Success = "@terrygonguet/utils/functional/result/Success"
const $_variant_Failure = "@terrygonguet/utils/functional/result/Failure"

export interface Result<S, F> {
	isSuccess(): this is Success<S, F>
	isFailure(): this is Failure<S, F>
	merge<T>(whenSuccess: (value: S) => T, whenFailure: (reason: F) => T): T
	match(onSuccess: (value: S) => void, onFailure: (reason: F) => void): void
	map<S2>(f: (value: S) => S2): Result<S2, F>
	flatMap<S2, F2>(f: (value: S) => Result<S2, F | F2>): Result<S2, F | F2>
	toJSON(): Object
}

class Success<S, F> implements Result<S, F> {
	value!: S

	constructor(value: S) {
		Object.defineProperties(this, {
			$_kind: { value: $_kind, enumerable: false, writable: false },
			$_variant: {
				value: $_variant_Success,
				enumerable: false,
				writable: false,
			},
			value: { value, writable: false },
		})
	}

	isSuccess(): true {
		return true
	}
	isFailure(): false {
		return false
	}
	merge<T>(whenSuccess: (value: S) => T) {
		return whenSuccess(this.value)
	}
	match(onSuccess: (value: S) => void) {
		return onSuccess(this.value)
	}
	map<S2>(f: (value: S) => S2) {
		return new Success<S2, F>(f(this.value))
	}
	flatMap<S2, F2>(f: (value: S) => Result<S2, F2>): Result<S2, F | F2> {
		return f(this.value)
	}
	toJSON(this: Success<S, F>) {
		return { $_kind, $_variant: $_variant_Success, value: this.value }
	}
}

class Failure<S, F> implements Result<S, F> {
	reason!: F

	constructor(reason: F) {
		Object.defineProperties(this, {
			$_kind: { value: $_kind, enumerable: false, writable: false },
			$_variant: {
				value: $_variant_Success,
				enumerable: false,
				writable: false,
			},
			reason: { value: reason, writable: false },
		})
	}

	isSuccess(): false {
		return false
	}
	isFailure(): true {
		return true
	}
	merge<T>(_: (value: S) => T, whenFailure: (reason: F) => T) {
		return whenFailure(this.reason)
	}
	match(_: (value: S) => void, onFailure: (reason: F) => void) {
		return onFailure(this.reason)
	}
	map<S2>() {
		return this as unknown as Result<S2, F>
	}
	flatMap<S2, F2>() {
		return this as unknown as Result<S2, F | F2>
	}
	toJSON() {
		return { $_kind, $_variant: $_variant_Failure, reason: this.reason }
	}
}

function resultFromMaybe<S>(maybe: Maybe<S>): Result<S, undefined>
function resultFromMaybe<S, F>(maybe: Maybe<S>, mapNone: () => F): Result<S, F>
function resultFromMaybe<S, F>(maybe: Maybe<S>, mapNone?: () => F) {
	return mapNone ? maybe.toResult(mapNone) : maybe.toResult()
}

export const Result = {
	Success<S, F>(value: S): Result<S, F> {
		return new Success<S, F>(value)
	},
	Failure<S, F>(reason: F): Result<S, F> {
		return new Failure<S, F>(reason)
	},
	try<S, F>(tryFn: () => S) {
		return new TryCatch<S, F>(tryFn)
	},
	fromPromise<S, F>(
		promise: Promise<S>,
		onResolve: (value: S) => S,
		onReject: (reason: unknown) => F,
	): Promise<Result<S, F>> {
		return promise.then(
			compose(onResolve, this.Success<S, F>),
			compose(onReject, this.Failure<S, F>),
		)
	},
	fromMaybe: resultFromMaybe,
	JSONReviver(_key: string, value: any) {
		if (value?.$_kind == $_kind) {
			const $_variant = value?.$_variant
			if ($_variant == $_variant_Success)
				return new Success<unknown, unknown>(value?.value)
			else if ($_variant == $_variant_Failure)
				return new Failure<unknown, unknown>(value?.reason)
			else return value
		} else return value
	},
}

class TryCatch<S, F> {
	tryFn: () => S
	catchFn: (err: unknown) => F

	constructor(tryFn: () => S) {
		this.tryFn = tryFn
		this.catchFn = identity as any
	}

	catch(catchFn: (err: unknown) => F) {
		this.catchFn = catchFn
		return this
	}

	exec(finallyFn?: (result: Result<S, F>) => void): Result<S, F> {
		try {
			const result = Result.Success<S, F>(this.tryFn())
			finallyFn?.(result)
			return result
		} catch (error) {
			const result = Result.Failure<S, F>(this.catchFn(error))
			finallyFn?.(result)
			return result
		}
	}
}

export type { Success, Failure }
