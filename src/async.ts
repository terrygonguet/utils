export function pause(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

interface RetryOptions {
	count?: number
	delay?: number | ((retryCount: number, error: any) => number)
}

export function retry(
	options: RetryOptions,
): <T>(provider: () => Promise<T>) => Promise<T>
export function retry<T>(
	provider: () => Promise<T>,
	options?: RetryOptions,
): Promise<T>
export function retry<T>(
	providerOrOptions: RetryOptions | (() => Promise<T>),
	options?: RetryOptions,
) {
	if (typeof providerOrOptions == "function")
		return _retry(providerOrOptions, options)
	else
		return (provider: () => Promise<T>) =>
			_retry(provider, providerOrOptions)
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

interface AsyncMapOptions<
	FailFast extends boolean = false,
	WithSourceIndexes extends boolean = false,
> {
	concurrent?: number
	failFast?: FailFast
	withSourceIndexes?: WithSourceIndexes
}

interface AsyncMapResultWithIndexes<U> {
	results: [i: number, value: U][]
	errors: [i: number, error: unknown][]
}

interface AsyncMapResult<U> {
	results: U[]
	errors: unknown[]
}

type AsyncMapFn<T, U> = (el: T, i: number, data: T[]) => Promise<U>

// --- Interface ---
export function asyncMap<
	T,
	U,
	FailFast extends boolean = false,
	WithSourceIndexes extends boolean = false,
>(
	f: AsyncMapFn<T, U>,
	options?: AsyncMapOptions<FailFast, WithSourceIndexes>,
): (
	data: T[],
) => Promise<
	FailFast extends true
		? WithSourceIndexes extends true
			? [i: number, value: U][]
			: U[]
		: WithSourceIndexes extends true
		? AsyncMapResultWithIndexes<U>
		: AsyncMapResult<U>
>
export function asyncMap<
	T,
	U,
	FailFast extends boolean = false,
	WithSourceIndexes extends boolean = false,
>(
	data: T[],
	f: AsyncMapFn<T, U>,
	options?: AsyncMapOptions<FailFast, WithSourceIndexes>,
): Promise<
	FailFast extends true
		? WithSourceIndexes extends true
			? [i: number, value: U][]
			: U[]
		: WithSourceIndexes extends true
		? AsyncMapResultWithIndexes<U>
		: AsyncMapResult<U>
>
// --- Implementation ---
export function asyncMap<T, U, V extends boolean, W extends boolean>(
	dataOrF: T[] | AsyncMapFn<T, U>,
	ForOptions: AsyncMapFn<T, U> | AsyncMapOptions<V, W> | undefined,
	options?: AsyncMapOptions<V, W>,
): any {
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

async function asyncMap_<T, U, V extends boolean, W extends boolean>(
	data: T[],
	f: AsyncMapFn<T, U>,
	{
		concurrent = 5,
		failFast = false as V,
		withSourceIndexes = false as W,
	}: AsyncMapOptions<V, W> = {},
): Promise<any> {
	return new Promise((resolve, reject) => {
		const resolved: [i: number, result: U][] = []
		const errors: [i: number, error: unknown][] = []
		const inFlight: Map<number, Promise<void>> = new Map()

		let next = 0
		let stop = false
		/** @param {number} i */
		function queue(i: number) {
			if (!stop && i > 0 && inFlight.size == 0) return finish()
			if (stop || i >= data.length) return
			inFlight.set(
				i,
				f(data[i], i, data)
					.then(
						result => void resolved.push([i, result]),
						error => {
							if (!failFast) errors.push([i, error])
							else {
								stop = true
								reject(error)
							}
						},
					)
					.finally(() => {
						inFlight.delete(i)
						queue(next)
					}),
			)
			next++
		}

		function finish() {
			resolved.sort(([a], [b]) => a - b)
			if (failFast) {
				if (withSourceIndexes) resolve(resolved)
				else resolve(resolved.map(([, value]) => value))
			} else {
				errors.sort(([a], [b]) => a - b)
				if (withSourceIndexes)
					resolve({
						results: resolved,
						errors: errors,
					})
				else
					resolve({
						results: resolved.map(([, value]) => value),
						errors: errors.map(([, error]) => error),
					})
			}
		}

		if (data.length == 0) finish()
		else
			for (let i = 0; i < concurrent; i++) {
				queue(next)
			}
	})
}
