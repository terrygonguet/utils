import { compose, identity } from "./index.ts"
import { Maybe } from "./maybe.ts"

interface API<S, F> {
	isSuccess(this: Result<S, F>): this is Success<S, F>
	isFailure(this: Result<S, F>): this is Failure<S, F>
	merge<T>(this: Result<S, F>, f: (value: S) => T, g: (reason: F) => T): T
	map<S2>(this: Result<S, F>, f: (value: S) => S2): Result<S2, F>
	flatMap<S2, F2>(this: Result<S, F>, f: (value: S) => Result<S2, F | F2>): Result<S2, F | F2>
	toJSON(this: Result<S, F>): Object
}

export type Success<S, F> = { value: S } & API<S, F>
export type Failure<S, F> = { reason: F } & API<S, F>
export type Result<S, F> = Success<S, F> | Failure<S, F>

const $_kind = "@terrygonguet/utils/functional/result"
const $_variant_Success = "@terrygonguet/utils/functional/result/Success"
const $_variant_Failure = "@terrygonguet/utils/functional/result/Failure"

function Success<S, F>(value: S): Success<S, F> {
	return Object.create(
		{
			isSuccess: () => true,
			isFailure: () => false,
			merge<T>(this: Success<S, F>, f: (value: S) => T) {
				return f(this.value)
			},
			map<S2>(this: Success<S, F>, f: (value: S) => S2) {
				return Success(f(this.value))
			},
			flatMap<S2, F2>(this: Success<S, F>, f: (value: S) => Result<S2, F2>) {
				return f(this.value)
			},
			toJSON(this: Success<S, F>) {
				return { $_kind, $_variant: $_variant_Success, value: this.value }
			},
		} as API<S, F>,
		{
			$_kind: { value: $_kind, enumerable: false, writable: false },
			$_variant: { value: $_variant_Success, enumerable: false, writable: false },
			value: { value, writable: false },
		},
	)
}

function Failure<S, F>(reason: F): Failure<S, F> {
	return Object.create(
		{
			isSuccess: () => false,
			isFailure: () => true,
			merge<T>(this: Failure<S, F>, _: (value: S) => T, g: (reason: F) => T) {
				return g(this.reason)
			},
			map<S2>(this: Failure<S, F>) {
				return this as unknown as Result<S2, F>
			},
			flatMap<S2, F2>(this: Failure<S, F>) {
				return this as unknown as Result<S2, F | F2>
			},
			toJSON(this: Failure<S, F>) {
				return { $_kind, $_variant: $_variant_Failure, reason: this.reason }
			},
		} as API<S, F>,
		{
			$_kind: { value: $_kind, enumerable: false, writable: false },
			$_variant: { value: $_variant_Success, enumerable: false, writable: false },
			reason: { value: reason, writable: false },
		},
	)
}

export const Result = {
	Success,
	Failure,
	try<S, F>(tryFn: () => S) {
		return new TryCatch<S, F>(tryFn)
	},
	fromPromise<S, F>(
		promise: Promise<S>,
		onResolve: (value: S) => S,
		onReject: (reason: unknown) => F,
	): Promise<Result<S, F>> {
		return promise.then(compose(onResolve, Success<S, F>), compose(onReject, Failure<S, F>))
	},
	fromMaybe<S, F>(maybe: Maybe<S>, mapNone?: () => F) {
		return maybe.toResult(mapNone)
	},
	JSONReviver(_key: string, value: any) {
		if (value?.$_kind == $_kind) {
			const $_variant = value?.$_variant
			if ($_variant == $_variant_Success) return Success<unknown, unknown>(value?.value)
			else if ($_variant == $_variant_Failure) return Failure<unknown, unknown>(value?.reason)
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
			const result = Success<S, F>(this.tryFn())
			finallyFn?.(result)
			return result
		} catch (error) {
			const result = Failure<S, F>(this.catchFn(error))
			finallyFn?.(result)
			return result
		}
	}
}
