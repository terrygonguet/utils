/**
 * Behaviour is undefined when max < min
 */
export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

type JSONReviver = (key: string, value: any) => any

export function safeParse<T>(str: string, defaultValue: T, reviver?: JSONReviver) {
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
