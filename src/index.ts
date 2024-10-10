/**
 * Behaviour is undefined when max < min
 */
export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

export function createNoopProxy<T>() {
	const noop = () => proxy
	const no = () => false
	const yes = () => true
	const proxy: any = new Proxy(() => {}, {
		get: noop,
		set: noop,
		apply: noop,
		construct: noop,
		deleteProperty: yes,
		has: yes,
		preventExtensions: no,
		defineProperty: no,
	})
	return proxy as T
}

export function noop() {}

export function exhaustive(_: never): never {
	throw new Error("This should never be called")
}

export async function hash(message: string) {
	const encoder = new TextEncoder()
	const data = encoder.encode(message)
	const hash = await crypto.subtle.digest("SHA-1", data)
	return hash
}

export function* range(start: number, end: number, step = 1) {
	for (let i = start; i < end; i += step) {
		yield i
	}
}

export function safe<T, Err = Error>(
	f: () => Promise<T>,
): Promise<[null, T] | [Err, null]>
export function safe<T, Err = Error>(f: () => T): [null, T] | [Err, null]
export function safe<T, Err = Error>(f: () => T | Promise<T>) {
	try {
		const promiseOrResult = f()
		if (promiseOrResult instanceof Promise)
			return promiseOrResult.then(
				result => [null, result],
				error => [error, null],
			)
		else return [null, promiseOrResult]
	} catch (error) {
		return [error as Err, null]
	}
}
