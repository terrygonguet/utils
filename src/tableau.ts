type Predicate<T> = (value: T, index: number, tableau: Tableau<T>) => boolean
type AssertPredicate<T, U extends T> = (
	value: T,
	index: number,
	tableau: Tableau<T>,
) => value is U
type Reducer<T, U> = (
	previousValue: U,
	currentValue: T,
	index: number,
	tableau: Tableau<T>,
) => U
type Mapper<T, U> = (value: T, index: number, tableau: Tableau<T>) => U
type Comparer<T> = (a: T, b: T) => number

// Stolen from TS std lib
type FlatTableau<Arr, Depth extends number> = {
	done: Arr
	recur: Arr extends Tableau<infer InnerArr>
		? FlatTableau<
				InnerArr,
				[
					-1,
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
					11,
					12,
					13,
					14,
					15,
					16,
					17,
					18,
					19,
					20,
				][Depth]
		  >
		: Arr
}[Depth extends -1 ? "done" : "recur"]

export class Tableau<T> extends Array<T> {
	constructor(length?: number) {
		length == undefined ? super() : super(length)
	}

	i(idx: number) {
		if (idx == 0) throw new RangeError("Cannot access index 0 in a Tableau")
		return this.at(idx - 1)
	}

	*ientries(): IterableIterator<[number, T]> {
		for (let i = 0; i < this.length; i++) {
			yield [i + 1, this[i]]
		}
	}

	ievery<U extends T>(
		predicate: AssertPredicate<T, U>,
		thisArg?: any,
	): this is Tableau<U>
	ievery(predicate: Predicate<T>, thisArg?: any): boolean
	ievery(predicate: Predicate<T>, thisArg?: any) {
		return this.every((value, i) => predicate(value, i + 1, this), thisArg)
	}

	ifilter<U extends T>(
		predicate: AssertPredicate<T, U>,
		thisArg?: any,
	): Tableau<U>
	ifilter(predicate: Predicate<T>, thisArg?: any): Tableau<T>
	ifilter(predicate: Predicate<T>, thisArg?: any) {
		return this.filter((value, i) => predicate(value, i + 1, this), thisArg)
	}

	ifind<U extends T>(
		predicate: AssertPredicate<T, U>,
		thisArg?: any,
	): U | undefined
	ifind(predicate: Predicate<T>, thisArg?: any): T | undefined
	ifind(predicate: Predicate<T>, thisArg?: any) {
		return this.find((value, i) => predicate(value, i + 1, this), thisArg)
	}

	ifindIndex(predicate: Predicate<T>, thisArg?: any): number | undefined {
		const idx = this.findIndex(
			(value, i) => predicate(value, i + 1, this),
			thisArg,
		)
		return idx == -1 ? undefined : idx + 1
	}

	ifindLast<U extends T>(
		predicate: AssertPredicate<T, U>,
		thisArg?: any,
	): U | undefined
	ifindLast(predicate: Predicate<T>, thisArg?: any): T | undefined
	ifindLast(predicate: Predicate<T>, thisArg?: any) {
		return this.findLast(
			(value, i) => predicate(value, i + 1, this),
			thisArg,
		)
	}

	ifindLastIndex(predicate: Predicate<T>, thisArg?: any): number | undefined {
		const idx = this.findLastIndex(
			(value, i) => predicate(value, i + 1, this),
			thisArg,
		)
		return idx == -1 ? undefined : idx + 1
	}

	iflat<Depth extends number = 1>(depth?: Depth): FlatTableau<T, Depth> {
		return this.flat(depth) as FlatTableau<T, Depth>
	}

	iflatMap<U>(
		callback: Mapper<T, U | Tableau<U>>,
		thisArg?: any,
	): Tableau<U> {
		return this.flatMap(
			(value, i) => callback(value, i + 1, this),
			thisArg,
		) as Tableau<U>
	}

	iindexOf(searchElement: T, fromIndex = 1): number | undefined {
		if (fromIndex == 0)
			throw new RangeError("Cannot access index 0 in a Tableau")
		const idx = this.indexOf(searchElement, fromIndex - 1)
		return idx == -1 ? undefined : idx + 1
	}

	*ikeys(): IterableIterator<number> {
		for (const key of this.keys()) {
			yield key + 1
		}
	}

	ilastIndexOf(
		searchElement: T,
		fromIndex = this.length,
	): number | undefined {
		if (fromIndex == 0)
			throw new RangeError("Cannot access index 0 in a Tableau")
		const idx = this.lastIndexOf(searchElement, fromIndex - 1)
		return idx == -1 ? undefined : idx + 1
	}

	imap<U>(callbackFn: Mapper<T, U>, thisArg?: any): Tableau<U> {
		return this.map(
			(value, i) => callbackFn(value, i + 1, this),
			thisArg,
		) as Tableau<U>
	}

	ireduce<U>(callbackFn: Reducer<T, U>, initialValue: U): U {
		return this.reduce(
			(acc, cur, i) => callbackFn(acc, cur, i + 1, this),
			initialValue,
		)
	}

	ireduceRight<U>(callbackFn: Reducer<T, U>, initialValue: U): U {
		return this.reduceRight(
			(acc, cur, i) => callbackFn(acc, cur, i + 1, this),
			initialValue,
		)
	}

	isome(predicate: Predicate<T>, thisArg?: any): boolean {
		return this.some((value, i) => predicate(value, i + 1, this), thisArg)
	}

	isort(compareFn: Comparer<T>): Tableau<T> {
		return this.toSorted(compareFn) as Tableau<T>
	}

	isplice(start: number, deleteCount?: number, ...items: T[]): Tableau<T> {
		if (start == 0)
			throw new RangeError("Cannot access index 0 in a Tableau")
		return this.toSpliced(start - 1, deleteCount!, ...items) as Tableau<T>
	}

	iwith(index: number, value: T): Tableau<T> {
		if (index == 0)
			throw new RangeError("Cannot access index 0 in a Tableau")
		return this.with(index - 1, value) as Tableau<T>
	}

	static from<T>(source: Iterable<T> | ArrayLike<T>): Tableau<T> {
		if ("length" in source) {
			const litanie = new Tableau<T>(source.length)
			for (let i = 0; i < source.length; i++) {
				litanie[i] = source[i]
			}
			return litanie
		} else {
			const litanie = new Tableau<T>()
			for (const element of source) {
				litanie.push(element)
			}
			return litanie
		}
	}

	static of<T>(...elements: T[]): Tableau<T> {
		return Tableau.from(elements)
	}
}
