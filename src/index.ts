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

export function yesno(value?: string) {
	switch (value?.toLowerCase()) {
		case "1":
		case "y":
		case "yes":
		case "true":
		case "on":
			return true
		default:
			return false
	}
}

export function mapListPush<Key, T>(
	map: Map<Key, T[]>,
	key: Key,
	value: T,
): Map<Key, T[]> {
	const arr = map.get(key) ?? []
	arr.push(value)
	return map.set(key, arr)
}

export function recordListPush<Key extends string, T>(
	record: Record<Key, T[]>,
	key: Key,
	value: T,
): Record<Key, T[]> {
	const arr = record[key] ?? []
	arr.push(value)
	record[key] = arr
	return record
}

export type ExecResult<T, Err = Error> = [null, T] | [Err, null]

export function tryCatch<F extends (...args: any) => any>(
	f: F,
	...args: Parameters<F>
): ReturnType<F> extends Promise<any>
	? Promise<ExecResult<Awaited<ReturnType<F>>>>
	: ExecResult<ReturnType<F>>

export function tryCatch<Err, F extends (...args: any) => any>(
	f: F,
	...args: Parameters<F>
): ReturnType<F> extends Promise<any>
	? Promise<ExecResult<Awaited<ReturnType<F>>, Err>>
	: ExecResult<ReturnType<F>, Err>

export function tryCatch<F extends (...args: any) => any | Promise<any>>(
	f: F,
	...args: Parameters<F>
): ExecResult<ReturnType<F>> | Promise<ExecResult<Awaited<ReturnType<F>>>> {
	try {
		const promiseOrResult = f(...args)
		if (promiseOrResult instanceof Promise)
			return promiseOrResult.then(
				result => [null, result],
				error => [error, null],
			)
		else return [null, promiseOrResult]
	} catch (error) {
		return [error as Error, null]
	}
}
