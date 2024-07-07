import { Maybe } from "./maybe"

export * from "./maybe"
export * from "./result"
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
	if (typeof dataOrIdx == "number")
		return (data: T[]) => Maybe.from(data.at(dataOrIdx))
	else return Maybe.from(dataOrIdx.at(idx!))
}

type Predicate<T> = (value: T, idx: number, arr: T[]) => boolean

export function find<T>(predicate: Predicate<T>): (data: T[]) => Maybe<T>
export function find<T>(data: T[], predicate: Predicate<T>): Maybe<T>
export function find<T>(
	dataOrPredicate: T[] | Predicate<T>,
	predicate?: Predicate<T>,
) {
	if (typeof dataOrPredicate == "function")
		return (data: T[]) => Maybe.from(data.find(dataOrPredicate))
	else return Maybe.from(dataOrPredicate.find(predicate!))
}

export function findIndex<T>(
	predicate: Predicate<T>,
): (data: T[]) => Maybe<number>
export function findIndex<T>(data: T[], predicate: Predicate<T>): Maybe<number>
export function findIndex<T>(
	dataOrPredicate: T[] | Predicate<T>,
	predicate?: Predicate<T>,
) {
	if (typeof dataOrPredicate == "function") {
		return (data: T[]) => {
			const idx = data.findIndex(dataOrPredicate)
			return idx == -1 ? Maybe.None<number>() : Maybe.Some(idx)
		}
	} else {
		const idx = dataOrPredicate.findIndex(predicate!)
		return idx == -1 ? Maybe.None<number>() : Maybe.Some(idx)
	}
}

export function prop<T extends {}, K1 extends keyof T = keyof T>(
	data: T,
	key1: K1,
): Maybe<T[K1]>
export function prop<
	T extends {},
	K1 extends keyof T = keyof T,
	K2 extends keyof T[K1] = keyof T[K1],
>(data: T, key1: K1, key2: K2): Maybe<T[K1][K2]>
export function prop<
	T extends {},
	K1 extends keyof T = keyof T,
	K2 extends keyof T[K1] = keyof T[K1],
	K3 extends keyof T[K1][K2] = keyof T[K1][K2],
>(data: T, key1: K1, key2: K2, key: K3): Maybe<T[K1][K2][K3]>
export function prop<
	T extends {},
	K1 extends keyof T = keyof T,
	K2 extends keyof T[K1] = keyof T[K1],
	K3 extends keyof T[K1][K2] = keyof T[K1][K2],
	K4 extends keyof T[K1][K2][K3] = keyof T[K1][K2][K3],
>(data: T, key1: K1, key2: K2, key: K3, key4: K4): Maybe<T[K1][K2][K3][K4]>
export function prop<
	T extends {},
	K1 extends keyof T = keyof T,
	K2 extends keyof T[K1] = keyof T[K1],
	K3 extends keyof T[K1][K2] = keyof T[K1][K2],
	K4 extends keyof T[K1][K2][K3] = keyof T[K1][K2][K3],
	K5 extends keyof T[K1][K2][K3][K4] = keyof T[K1][K2][K3][K4],
>(
	data: T,
	key1: K1,
	key2: K2,
	key: K3,
	key4: K4,
	key5: K5,
): Maybe<T[K1][K2][K3][K4][K5]>

export function prop(data: any, ...path: string[]) {
	for (const key of path) {
		data = data?.[key]
	}
	return Maybe.from(data)
}
