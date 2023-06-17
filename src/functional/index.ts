import { Maybe } from "./maybe.ts"

export * from "./maybe.ts"
export * from "./result.ts"
export { default as compose } from "just-compose"
export { default as pipe } from "just-pipe"

export function identity<T>(value: T) {
	return value
}

export function constant<T>(value: T) {
	return () => value
}

export function at(idx: number): <T>(data: T[]) => Maybe<T>
export function at<T>(data: T[], idx: number): Maybe<T>
export function at<T>(dataOrIdx: T[] | number, idx?: number) {
	if (typeof dataOrIdx == "number") return (data: T[]) => Maybe.from(data.at(dataOrIdx))
	else return Maybe.from(dataOrIdx.at(idx!))
}

type Predicate<T> = (value: T, idx: number, arr: T[]) => boolean

export function find<T>(predicate: Predicate<T>): (data: T[]) => Maybe<T>
export function find<T>(data: T[], predicate: Predicate<T>): Maybe<T>
export function find<T>(dataOrPredicate: T[] | Predicate<T>, predicate?: Predicate<T>) {
	if (typeof dataOrPredicate == "function")
		return (data: T[]) => Maybe.from(data.find(dataOrPredicate))
	else return Maybe.from(dataOrPredicate.find(predicate!))
}

export function findIndex<T>(predicate: Predicate<T>): (data: T[]) => Maybe<number>
export function findIndex<T>(data: T[], predicate: Predicate<T>): Maybe<number>
export function findIndex<T>(dataOrPredicate: T[] | Predicate<T>, predicate?: Predicate<T>) {
	if (typeof dataOrPredicate == "function") {
		return (data: T[]) => {
			const idx = data.findIndex(dataOrPredicate)
			return idx == -1 ? Maybe.None : Maybe.Some(idx)
		}
	} else {
		const idx = dataOrPredicate.findIndex(predicate!)
		return idx == -1 ? Maybe.None : Maybe.Some(idx)
	}
}
