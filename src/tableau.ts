export class Tableau<T> extends Array<T> {
	constructor(length?: number) {
		length == undefined ? super() : super(length)
	}

	i(idx: number) {
		if (idx == 0) throw new TypeError("Cannot access index 0")
		return this.at(idx - 1)
	}

	*iterate(): IterableIterator<[number, T]> {
		for (let i = 0; i < this.length; i++) {
			yield [i + 1, this[i]]
		}
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
