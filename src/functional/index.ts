import { Maybe } from "./maybe.ts"

export * from "./maybe.ts"
export * from "./result.ts"
export { default as compose } from "just-compose"

export function identity<T>(value: T) {
	return value
}

export function constant<T>(value: T) {
	return () => value
}

export function at<T>(arr: T[], idx: number) {
	return Maybe.from(arr.at(idx))
}

export function find<T>(arr: T[], predicate: (value: T, idx: number, arr: T[]) => boolean) {
	return Maybe.from(arr.find(predicate))
}

export function findIndex<T>(arr: T[], predicate: (value: T, idx: number, arr: T[]) => boolean): Maybe<number> {
	const idx = arr.findIndex(predicate)
	return idx == -1 ? Maybe.None : Maybe.Some(idx)
}
