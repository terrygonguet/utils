export * from "./maybe.ts"
export * from "./result.ts"
export { default as compose } from "just-compose"

export function identity<T>(value: T) {
	return value
}

export function constant<T>(value: T) {
	return () => value
}
