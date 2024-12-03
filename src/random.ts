const base_randi = make_randi(Math.random)

/**
 * Generates a random integer between `0` (inclusive) and `max` (exlusive)
 */
export function randi(max: number): number
/**
 * Generates a random integer between `min` (inclusive) and `max` (exlusive)
 */
export function randi(min: number, max: number): number
export function randi(minOrMax: number, max?: number) {
	if (typeof max == "number") return base_randi(minOrMax, max)
	else return base_randi(minOrMax)
}

const base_randf = make_randf(Math.random)

/**
 * Generates a random real between `0` (inclusive) and `max` (exlusive)
 */
export function randf(max: number): number
/**
 * Generates a random real between `min` (inclusive) and `max` (exlusive)
 */
export function randf(min: number, max: number): number
export function randf(minOrMax: number, max?: number) {
	if (typeof max == "number") return base_randf(minOrMax, max)
	else return base_randf(minOrMax)
}

export const shuffle = make_shuffle(Math.random)

export function make_randi(prng: typeof Math.random): typeof randi {
	return function randi(minOrMax: number, max?: number) {
		if (typeof max == "number") {
			const min = minOrMax
			const delta = max - min
			return min + Math.floor(prng() * delta)
		} else return Math.floor(prng() * minOrMax)
	}
}

export function make_randf(prng: typeof Math.random) {
	return function randf(minOrMax: number, max?: number) {
		if (typeof max == "number") {
			const min = minOrMax
			const delta = max - min
			return min + prng() * delta
		} else return prng() * minOrMax
	}
}

export function make_shuffle(prng: typeof Math.random) {
	const randi = make_randi(prng)
	return function shuffle<T>(arr: T[]): T[] {
		const clone = Array.from(arr)
		for (let i = 0; i < clone.length - 2; i++) {
			const j = randi(i, clone.length)
			const temp = clone[i]
			clone[i] = clone[j]
			clone[j] = temp
		}
		return clone
	}
}

export function seeded(seed: string | number): typeof Math.random {
	if (typeof seed == "string") seed = cyrb128(seed)
	else seed ^= 0xdeadbeef

	const prng = splitmix32(seed)
	for (let i = 0; i < 15; i++) prng()

	return prng
}

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

function cyrb128(str: string) {
	let h1 = 1779033703,
		h2 = 3144134277,
		h3 = 1013904242,
		h4 = 2773480762
	for (let i = 0, k; i < str.length; i++) {
		k = str.charCodeAt(i)
		h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
		h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
		h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
		h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
	}
	h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
	h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
	h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
	h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
	h1 ^= h2 ^ h3 ^ h4
	return h1 >>> 0
}

function splitmix32(a: number): typeof Math.random {
	return function () {
		a |= 0
		a = (a + 0x9e3779b9) | 0
		let t = a ^ (a >>> 16)
		t = Math.imul(t, 0x21f0aaad)
		t = t ^ (t >>> 15)
		t = Math.imul(t, 0x735a2d97)
		return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
	}
}
