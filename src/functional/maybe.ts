import { identity } from "./index.ts"

interface API<T> {
	isSome(this: Maybe<T>): this is Some<T>
	isNone(this: Maybe<T>): this is None
	orDefault(this: Maybe<T>, defaultValue: T): T
	map<U>(this: Maybe<T>, f: (value: T) => U): Maybe<U>
	flatMap<U>(this: Maybe<T>, f: (value: T) => Maybe<U>): Maybe<U>
}

export type Some<T> = { value: T } & API<T>
export type None = {} & API<never>
export type Maybe<T> = Some<T> | None

const $_kind = "@terrygonguet/utils/functional/maybe"
const $_variant_Some = "@terrygonguet/utils/functional/maybe/Some"
const $_variant_None = "@terrygonguet/utils/functional/maybe/None"

export function Some<T>(value: NonNullable<T>): Some<T> {
	const SomePrototype: API<T> = {
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
	}
	return Object.create(SomePrototype, {
		$_kind: { value: $_kind, enumerable: false, writable: false },
		$_variant: { value: $_variant_Some, enumerable: false, writable: false },
		value: { value },
	})
}

const NonePrototype: API<never> = {
	isSome: () => false,
	isNone: () => true,
	orDefault: identity,
	map: () => None,
	flatMap: () => None,
}
export const None: None = Object.create(NonePrototype, {
	$_kind: { value: $_kind, enumerable: false, writable: false },
	$_variant: { value: $_variant_None, enumerable: false, writable: false },
})

export const Maybe = {
	from<T>(value: T | undefined | null): Maybe<T> {
		switch (value) {
			case null:
			case undefined:
				return None
			default:
				return Some(value!)
		}
	},
}
