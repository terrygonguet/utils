import { compose, constant, identity } from "./index.ts"
import { Result } from "./result.ts"

interface API<T> {
	isSome(this: Maybe<T>): this is Some<T>
	isNone(this: Maybe<T>): this is None<T>
	orDefault(this: Maybe<T>, defaultValue: T): T
	map<U>(this: Maybe<T>, f: (value: T) => U): Maybe<U>
	flatMap<U>(this: Maybe<T>, f: (value: T) => Maybe<U>): Maybe<U>
	toResult<U>(this: Maybe<T>, mapNone?: () => U): Result<T, U>
	toJSON(this: Maybe<T>): Object
}

export type Some<T> = { value: T } & API<T>
export type None<T> = API<T>
export type Maybe<T> = Some<T> | None<T>

const $_kind = "@terrygonguet/utils/functional/maybe"
const $_variant_Some = "@terrygonguet/utils/functional/maybe/Some"
const $_variant_None = "@terrygonguet/utils/functional/maybe/None"

function Some<T>(value: NonNullable<T>): Some<T> {
	return Object.create(
		{
			isSome: () => true,
			isNone: () => false,
			orDefault(this: Some<T>) {
				return this.value
			},
			map(this: Some<T>, f) {
				return Some(f(this.value)!)
			},
			flatMap(this: Some<T>, f) {
				return f(this.value)
			},
			toResult(this: Some<T>) {
				return Result.Success(this.value)
			},
			toJSON(this: Some<T>) {
				return { $_kind, $_variant: $_variant_Some, value: this.value }
			},
		} as API<T>,
		{
			$_kind: { value: $_kind, enumerable: false, writable: false },
			$_variant: { value: $_variant_Some, enumerable: false, writable: false },
			value: { value, writable: false },
		},
	)
}

const None: None<any> = Object.create(
	{
		isSome: () => false,
		isNone: () => true,
		orDefault: defaultValue => defaultValue,
		map: () => None,
		flatMap: () => None,
		toResult: mapNone => Result.Failure(mapNone?.()),
		toJSON: () => ({ $_kind, $_variant: $_variant_None }),
	} as API<any>,
	{
		$_kind: { value: $_kind, enumerable: false, writable: false },
		$_variant: { value: $_variant_None, enumerable: false, writable: false },
	},
)

export const Maybe = {
	Some,
	None,
	from<T>(value: T | undefined | null): Maybe<T> {
		switch (value) {
			case null:
			case undefined:
				return None
			default:
				return Some(value!)
		}
	},
	/**
	 * CAUTION: this method swallows errors and simply returns None!
	 * Use `Result.fromPromise()` if you need error details.
	 */
	fromPromise<T>(promise: Promise<T>, onResolve: (value: T) => T = identity): Promise<Maybe<T>> {
		return promise.then(compose(onResolve, Maybe.from), constant(None))
	},
	JSONReviver(_key: string, value: any) {
		if (value?.$_kind == $_kind) {
			const $_variant = value?.$_variant
			if ($_variant == $_variant_Some) return Some<unknown>(value?.value)
			else if ($_variant == $_variant_None) return None
			else return value
		} else return value
	},
}
