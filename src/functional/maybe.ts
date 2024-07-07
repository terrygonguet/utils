import { compose, constant, identity } from "./index"
import { Result } from "./result"

const $_kind = "@terrygonguet/utils/functional/maybe"
const $_variant_Some = "@terrygonguet/utils/functional/maybe/Some"
const $_variant_None = "@terrygonguet/utils/functional/maybe/None"

export interface Maybe<T> {
	isSome(): this is Some<T>
	isNone(): this is None<T>
	orDefault(defaultValue: T): T
	map<U>(f: (value: T) => U): Maybe<U>
	flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U>
	toResult(): Result<T, undefined>
	toResult<U>(mapNone: () => U): Result<T, U>
	toJSON(): Object
}

class Some<T> implements Maybe<T> {
	value!: T

	constructor(value: T) {
		Object.defineProperties(this, {
			$_kind: { value: $_kind, enumerable: false, writable: false },
			$_variant: {
				value: $_variant_Some,
				enumerable: false,
				writable: false,
			},
			value: { value, writable: false },
		})
	}

	isSome(): true {
		return true
	}
	isNone(): false {
		return false
	}
	orDefault() {
		return this.value
	}
	map<U>(f: (value: T) => U) {
		return new Some(f(this.value))
	}
	flatMap<U>(f: (value: T) => Maybe<U>) {
		return f(this.value)
	}
	toResult<U>(): Result<T, U> {
		return Result.Success(this.value)
	}
	toJSON(): Object {
		return { $_kind, $_variant: $_variant_Some, value: this.value }
	}
}

class None<T> implements Maybe<T> {
	constructor() {}

	isSome(): false {
		return false
	}
	isNone(): true {
		return true
	}
	orDefault(defaultValue: T) {
		return defaultValue
	}
	map<U>() {
		return this as unknown as Maybe<U>
	}
	flatMap<U>() {
		return this as unknown as Maybe<U>
	}
	toResult(): Result<T, undefined>
	toResult<U>(mapNone: () => U): Result<T, U>
	toResult<U>(mapNone?: () => U) {
		return mapNone
			? Result.Failure<T, U>(mapNone?.())
			: Result.Failure<T, undefined>(undefined)
	}
	toJSON(): Object {
		return { $_kind, $_variant: $_variant_None }
	}
}

const none = new None()
export const Maybe = {
	Some<T>(value: T): Maybe<T> {
		return new Some(value)
	},
	None<T>() {
		return none as Maybe<T>
	},
	from<T>(value: T | undefined | null): Maybe<T> {
		switch (value) {
			case null:
			case undefined:
				return this.None()
			default:
				return new Some(value!)
		}
	},
	/**
	 * CAUTION: this method swallows errors and simply returns None!
	 * Use `Result.fromPromise()` if you need error details.
	 */
	fromPromise<T>(
		promise: Promise<T>,
		onResolve: (value: T) => T = identity,
	): Promise<Maybe<T>> {
		return promise.then(
			compose(onResolve, Maybe.from),
			constant(this.None()),
		)
	},
	JSONReviver(_key: string, value: any) {
		if (value?.$_kind == $_kind) {
			const $_variant = value?.$_variant
			if ($_variant == $_variant_Some)
				return new Some<unknown>(value?.value)
			else if ($_variant == $_variant_None) return Maybe.None()
			else return value
		} else return value
	},
}

export type { Some, None }
