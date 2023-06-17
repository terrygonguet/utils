/**
 * Behaviour is undefined when max < min
 */
export declare function clamp(value: number, min: number, max: number): number;
type JSONReviver = (key: string, value: any) => any;
export declare function safeParse<T>(str: string, defaultValue: T, reviver?: JSONReviver): any;
export declare function composeJSONRevivers(...revivers: JSONReviver[]): JSONReviver;
export declare function createNoopProxy<T>(): T;
export declare function noop(): void;
export declare function exhaustive(_: never): never;
export declare function hash(message: string): Promise<ArrayBuffer>;
export declare function range(start: number, end: number, step?: number): Generator<number, void, unknown>;
export {};
