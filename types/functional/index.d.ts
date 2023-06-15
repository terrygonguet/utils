import { Maybe } from "./maybe.ts";
export * from "./maybe.ts";
export * from "./result.ts";
export { default as compose } from "just-compose";
export declare function identity<T>(value: T): T;
export declare function constant<T>(value: T): () => T;
export declare function at<T>(arr: T[], idx: number): Maybe<T>;
export declare function find<T>(arr: T[], predicate: (value: T, idx: number, arr: T[]) => boolean): Maybe<T>;
export declare function findIndex<T>(arr: T[], predicate: (value: T, idx: number, arr: T[]) => boolean): Maybe<number>;
