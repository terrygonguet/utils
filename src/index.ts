/**
 * Behaviour is undefined when max < min
 */
export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

type JSONReviver = (key: string, value: any) => any

/**
 * This function does no runtime type checking,
 * make sure that the parsed value is valid
 */
export function safeParse<T>(
	str: string,
	defaultValue: T,
	reviver?: JSONReviver,
): T {
	try {
		return JSON.parse(str, reviver)
	} catch (_) {
		return defaultValue
	}
}

export function composeJSONRevivers(...revivers: JSONReviver[]): JSONReviver {
	return function (key, value) {
		for (const reviver of revivers) {
			value = reviver(key, value)
		}
		return value
	}
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
