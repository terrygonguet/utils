//#region Option

export class Option<T> {
	readonly _kind: "Some" | "None"
	readonly value: T

	private constructor(
		_kind: "Some" | "None",
		value: T | undefined = undefined,
	) {
		this._kind = _kind
		this.value = value!
	}

	*[Symbol.iterator](): Iterator<Option<T>, T> {
		yield this
		if (this.isNone())
			throw new Error("Tried to unwrap a None() via its iterator")
		else return this.value
	}

	static do<T>(f: () => Iterator<Option<any>, T, any>): Option<T> {
		const gen = f()
		let iter = gen.next()
		while (!iter.done) {
			switch (iter.value._kind) {
				case "Some":
					iter = gen.next(iter.value.value)
					break
				case "None":
					gen.return?.(undefined as any)
					return Option.None()
			}
		}
		return Option.Some(iter.value)
	}

	static from<T>(
		maybeValue: unknown,
		{ allowOptionLikePOJO = false } = {},
	): Option<T> {
		if (maybeValue === undefined || maybeValue === null)
			return Option.None()
		else if (Option.isOption<T>(maybeValue)) return maybeValue
		else if (
			allowOptionLikePOJO &&
			maybeValue &&
			typeof maybeValue == "object" &&
			"_kind" in maybeValue &&
			(maybeValue._kind == "Some" || maybeValue._kind == "None")
		)
			return new Option<T>(
				maybeValue._kind as "Some" | "None",
				(maybeValue as any).value,
			)
		else return Option.Some(maybeValue as T)
	}

	static wrapFunction<T, Args extends any[]>(
		f: (...args: Args) => T | undefined | null,
		{ allowOptionLikePOJO = false } = {},
	): (...args: Args) => Option<T> {
		return (...args: Args) =>
			Option.from(f(...args), { allowOptionLikePOJO })
	}

	static isOption<T>(maybeOption: unknown): maybeOption is Option<T> {
		return maybeOption instanceof Option
	}

	static Some<T>(value: T): Option<T> {
		return new Option<T>("Some", value)
	}

	static #None = new Option<never>("None")
	static None<T>(): Option<T> {
		return this.#None
	}

	[Symbol.toPrimitive]() {
		return this.toString()
	}

	isSome(): boolean {
		return this._kind == "Some"
	}

	isNone(): boolean {
		return this._kind == "None"
	}

	equals(other: Option<T>): boolean {
		if (this.isNone()) return other.isNone()
		else if (other.isNone()) return false
		else return this.value == other.value
	}

	map<U>(f: (value: T) => U, { coalesce = false } = {}): Option<U> {
		if (this.isNone()) return Option.None()
		else if (coalesce) return Option.from(f(this.value))
		else return Option.Some(f(this.value))
	}

	flatMap<U>(f: (value: T) => Option<U>): Option<U> {
		if (this.isNone()) return Option.None()
		else return f(this.value)
	}

	flatten(): T extends Option<infer U> ? Option<U> : Option<T>
	flatten(): Option<any> {
		if (this.isNone()) return Option.None()
		else return Option.isOption(this.value) ? this.value : this
	}

	orDefault(defaultValue: T): T {
		if (this.isNone()) return defaultValue
		else return this.value
	}

	orNull(): T | null {
		if (this.isNone()) return null
		else return this.value
	}

	orUndefined(): T | undefined {
		if (this.isNone()) return undefined
		else return this.value
	}

	or<U>(other: Option<U>): Option<T> | Option<U> {
		if (this.isNone()) return other
		else return this
	}

	unwrap(): T {
		if (this.isNone()) throw new Error("Tried to unwrap a None()")
		else return this.value
	}

	filter<U extends T>(predicate: (value: T) => value is U): Option<U>
	filter(predicate: (value: T) => boolean): Option<T>
	filter(predicate: (value: T) => boolean): Option<T> {
		if (this.isNone()) return this
		else return predicate(this.value) ? this : Option.None()
	}

	toString() {
		if (this.isNone()) return "None()"
		switch (typeof this.value) {
			case "string":
				return `Some("${this.value}")`
			case "function":
			case "object":
				return `Some(${JSON.stringify(this.value)})`
			default:
				return `Some(${this.value})`
		}
	}
}

//#endregion

//#region Array utils

export function arrayGet<T>(arr: T[], i: number): Option<T> {
	if (i >= arr.length || i < 0) return Option.None()
	else return Option.Some(arr[i])
}

export function arrayFind<T>(
	arr: T[],
	predicate: (item: T, i: number, arr: T[]) => boolean,
	thisArg?: any,
): Option<T> {
	return Option.from(arr.find(predicate, thisArg))
}

export function arrayFindLast<T>(
	arr: T[],
	predicate: (item: T, i: number, arr: T[]) => boolean,
	thisArg?: any,
): Option<T> {
	return Option.from(arr.findLast(predicate, thisArg))
}

export function arrayFindIndex<T>(
	arr: T[],
	predicate: (item: T, i: number, arr: T[]) => boolean,
	thisArg?: any,
): Option<number> {
	const idx = arr.findIndex(predicate, thisArg)
	return idx == -1 ? Option.None() : Option.Some(idx)
}

export function arrayFindLastIndex<T>(
	arr: T[],
	predicate: (item: T, i: number, arr: T[]) => boolean,
	thisArg?: any,
): Option<number> {
	const idx = arr.findLastIndex(predicate, thisArg)
	return idx == -1 ? Option.None() : Option.Some(idx)
}

export function arrayIndexOf<T>(
	arr: T[],
	item: T,
	fromIndex?: number,
): Option<number> {
	const idx = arr.indexOf(item, fromIndex)
	return idx == -1 ? Option.None() : Option.Some(idx)
}

export function arrayLastIndexOf<T>(
	arr: T[],
	item: T,
	fromIndex?: number,
): Option<number> {
	const idx = arr.lastIndexOf(item, fromIndex)
	return idx == -1 ? Option.None() : Option.Some(idx)
}

export function arrPop<T>(arr: T[]): Option<T> {
	if (arr.length == 0) return Option.None()
	else return Option.Some(arr.pop()!)
}

export function arrShift<T>(arr: T[]): Option<T> {
	if (arr.length == 0) return Option.None()
	else return Option.Some(arr.shift()!)
}

//#endregion
