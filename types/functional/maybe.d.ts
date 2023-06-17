import { Result } from "./result.ts";
export interface Maybe<T> {
    isSome(): this is Some<T>;
    isNone(): this is None<T>;
    orDefault(defaultValue: T): T;
    map<U>(f: (value: T) => U): Maybe<U>;
    flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U>;
    toResult(): Result<T, undefined>;
    toResult<U>(mapNone: () => U): Result<T, U>;
    toJSON(): Object;
}
declare class Some<T> implements Maybe<T> {
    value: T;
    constructor(value: T);
    isSome(): true;
    isNone(): false;
    orDefault(): T;
    map<U>(f: (value: T) => U): Some<U>;
    flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U>;
    toResult<U>(): Result<T, U>;
    toJSON(): Object;
}
declare class None<T> implements Maybe<T> {
    constructor();
    isSome(): false;
    isNone(): true;
    orDefault(defaultValue: T): T;
    map<U>(): Maybe<U>;
    flatMap<U>(): Maybe<U>;
    toResult(): Result<T, undefined>;
    toResult<U>(mapNone: () => U): Result<T, U>;
    toJSON(): Object;
}
export declare const Maybe: {
    Some<T>(value: T): Maybe<T>;
    None<T_1>(): Maybe<T_1>;
    from<T_2>(value: T_2 | null | undefined): Maybe<T_2>;
    /**
     * CAUTION: this method swallows errors and simply returns None!
     * Use `Result.fromPromise()` if you need error details.
     */
    fromPromise<T_3>(promise: Promise<T_3>, onResolve?: (value: T_3) => T_3): Promise<Maybe<T_3>>;
    JSONReviver(_key: string, value: any): any;
};
export type { Some, None };
