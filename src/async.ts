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
