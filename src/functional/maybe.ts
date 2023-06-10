import { identity } from "./index.ts"

interface API<T> {
	isSome(this: Maybe<T>): this is Some<T>
	isNone(this: Maybe<T>): this is None<T>
	orDefault(this: Maybe<T>, defaultValue: T): T
	map<U>(this: Maybe<T>, f: (value: T) => U): Maybe<U>
	flatMap<U>(this: Maybe<T>, f: (value: T) => Maybe<U>): Maybe<U>
	toJSON(this: Maybe<T>): Object
}

export type Some<T> = { value: T } & API<T>
export type None<T> = API<T>
export type Maybe<T> = Some<T> | None<T>

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
		toJSON(this: Some<T>) {
			return { $_kind, $_variant: $_variant_Some, value: this.value }
		},
	}
	return Object.create(SomePrototype, {
		$_kind: { value: $_kind, enumerable: false, writable: false },
		$_variant: { value: $_variant_Some, enumerable: false, writable: false },
		value: { value, writable: false },
	})
}

export const None: None<never> = Object.create(
	{
		isSome: () => false,
		isNone: () => true,
		orDefault: identity,
		map: () => None,
		flatMap: () => None,
		toJSON: () => ({ $_kind, $_variant: $_variant_None }),
	},
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
	JSONReviver(_key: string, value: any) {
		if (value?.$_kind == $_kind) {
			const $_variant = value?.$_variant
			if ($_variant == $_variant_Some) return Some<unknown>(value?.value)
			else if ($_variant == $_variant_None) return None
			else return value
		} else return value
	},
}
