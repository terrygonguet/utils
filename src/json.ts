/**
 * This function does no runtime type checking,
 * make sure that the parsed value is valid
 */
export function safeParse<T>(
	str: string,
	defaultValue: T,
	reviver?: (key: string, value: any) => any,
): T {
	try {
		return JSON.parse(str, reviver)
	} catch (_) {
		return defaultValue
	}
}
