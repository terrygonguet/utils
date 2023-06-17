import { findIndex } from "./functional/index.ts"

export function pause(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

interface RetryOptions {
	count?: number
	delay?: number | ((retryCount: number, error: any) => number)
}

export function retry(options: RetryOptions): <T>(provider: () => Promise<T>) => Promise<T>
export function retry<T>(provider: () => Promise<T>, options?: RetryOptions): Promise<T>
export function retry<T>(
	providerOrOptions: RetryOptions | (() => Promise<T>),
	options?: RetryOptions,
) {
	if (typeof providerOrOptions == "function") return _retry(providerOrOptions, options)
	else return (provider: () => Promise<T>) => _retry(provider, providerOrOptions)
}

async function _retry<T>(
	provider: () => Promise<T>,
	{ count = Infinity, delay }: RetryOptions = {},
): Promise<T> {
	let retryCount = 0
	let lastError: any
	do {
		try {
			return await provider()
		} catch (error) {
			lastError = error
			retryCount++
			switch (typeof delay) {
				case "number":
					await pause(delay)
					break
				case "function":
					await pause(delay(retryCount, error))
					break
			}
		}
	} while (retryCount <= count)
	throw lastError
}

interface AsyncMapOptions {
	concurrent?: number
}

export function asyncMap<T, U>(
	f: AsyncMapFn<T, U>,
	options?: AsyncMapOptions,
): (data: T[]) => Promise<U[]>
export function asyncMap<T, U>(
	data: T[],
	f: AsyncMapFn<T, U>,
	options?: AsyncMapOptions,
): Promise<U[]>
export function asyncMap<T, U>(
	dataOrF: T[] | AsyncMapFn<T, U>,
	ForOptions: AsyncMapFn<T, U> | AsyncMapOptions | undefined,
	options?: AsyncMapOptions,
): Promise<U[]> | ((data: T[]) => Promise<U[]>) {
	if (typeof dataOrF == "function" && typeof ForOptions != "function") {
		const f = dataOrF
		const options = ForOptions
		return (data: T[]) => asyncMap_(data, f, options)
	} else if (Array.isArray(dataOrF) && typeof ForOptions == "function") {
		const data = dataOrF
		const f = ForOptions
		return asyncMap_(data, f, options)
	} else throw new Error("Invalid arguments passed to asyncMap")
}

type AsyncMapFn<T, U> = (el: T, i: number, data: T[]) => Promise<U>

async function asyncMap_<T, U>(
	data: T[],
	f: AsyncMapFn<T, U>,
	{ concurrent = 5 }: AsyncMapOptions = {},
): Promise<U[]> {
	return new Promise((resolve, reject) => {
		const resolved: [i: number, result: U][] = []
		const inFlight: [i: number, promise: Promise<void>][] = []

		let next = 0
		function queue(i: number) {
			if (resolved.length == data.length && inFlight.length == 0) return finish()
			if (i >= data.length) return
			const el = data[i]
			inFlight.push([
				i,
				f(el, i, data).then(result => {
					resolved.push([i, result])
					findIndex(inFlight, ([j]) => i == j).map(j => inFlight.splice(j, 1))
					queue(next)
				}, reject),
			])
			next++
		}

		function finish() {
			const sorted = resolved.sort(([a], [b]) => a - b)
			resolve(sorted.map(([, value]) => value))
		}

		for (let i = 0; i < concurrent; i++) {
			queue(next)
		}
	})
}
