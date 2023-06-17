import { Maybe } from "./maybe.ts";
export interface Result<S, F> {
    isSuccess(): this is Success<S, F>;
    isFailure(): this is Failure<S, F>;
    merge<T>(whenSuccess: (value: S) => T, whenFailure: (reason: F) => T): T;
    match(onSuccess: (value: S) => void, onFailure: (reason: F) => void): void;
    map<S2>(f: (value: S) => S2): Result<S2, F>;
    flatMap<S2, F2>(f: (value: S) => Result<S2, F | F2>): Result<S2, F | F2>;
    toJSON(): Object;
}
declare class Success<S, F> implements Result<S, F> {
    value: S;
    constructor(value: S);
    isSuccess(): true;
    isFailure(): false;
    merge<T>(whenSuccess: (value: S) => T): T;
    match(onSuccess: (value: S) => void): void;
    map<S2>(f: (value: S) => S2): Success<S2, F>;
    flatMap<S2, F2>(f: (value: S) => Result<S2, F2>): Result<S2, F | F2>;
    toJSON(this: Success<S, F>): {
        $_kind: string;
        $_variant: string;
        value: S;
    };
}
declare class Failure<S, F> implements Result<S, F> {
    reason: F;
    constructor(reason: F);
    isSuccess(): false;
    isFailure(): true;
    merge<T>(_: (value: S) => T, whenFailure: (reason: F) => T): T;
    match(_: (value: S) => void, onFailure: (reason: F) => void): void;
    map<S2>(): Result<S2, F>;
    flatMap<S2, F2>(): Result<S2, F | F2>;
    toJSON(): {
        $_kind: string;
        $_variant: string;
        reason: F;
    };
}
declare function resultFromMaybe<S>(maybe: Maybe<S>): Result<S, undefined>;
declare function resultFromMaybe<S, F>(maybe: Maybe<S>, mapNone: () => F): Result<S, F>;
export declare const Result: {
    Success<S, F>(value: S): Result<S, F>;
    Failure<S_1, F_1>(reason: F_1): Result<S_1, F_1>;
    try<S_2, F_2>(tryFn: () => S_2): TryCatch<S_2, F_2>;
    fromPromise<S_3, F_3>(promise: Promise<S_3>, onResolve: (value: S_3) => S_3, onReject: (reason: unknown) => F_3): Promise<Result<S_3, F_3>>;
    fromMaybe: typeof resultFromMaybe;
    JSONReviver(_key: string, value: any): any;
};
declare class TryCatch<S, F> {
    tryFn: () => S;
    catchFn: (err: unknown) => F;
    constructor(tryFn: () => S);
    catch(catchFn: (err: unknown) => F): this;
    exec(finallyFn?: (result: Result<S, F>) => void): Result<S, F>;
}
export type { Success, Failure };
