/**
 * Behaviour is undefined when max < min
 */
export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

export function safeParse<T>(
	str: string,
	defaultValue: T,
	reviver?: (key: string, value: any) => any,
) {
	try {
		return JSON.parse(str, reviver)
	} catch (_) {
		return defaultValue
	}
}
