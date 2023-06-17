import { Maybe } from "./maybe.ts";
interface API<S, F> {
    isSuccess(this: Result<S, F>): this is Success<S, F>;
    isFailure(this: Result<S, F>): this is Failure<S, F>;
    merge<T>(this: Result<S, F>, f: (value: S) => T, g: (reason: F) => T): T;
    match(this: Result<S, F>, successFn: (value: S) => void, failureFn: (reason: F) => void): void;
    map<S2>(this: Result<S, F>, f: (value: S) => S2): Result<S2, F>;
    flatMap<S2, F2>(this: Result<S, F>, f: (value: S) => Result<S2, F | F2>): Result<S2, F | F2>;
    toJSON(this: Result<S, F>): Object;
}
export type Success<S, F> = {
    value: S;
} & API<S, F>;
export type Failure<S, F> = {
    reason: F;
} & API<S, F>;
export type Result<S, F> = Success<S, F> | Failure<S, F>;
declare function Success<S, F>(value: S): Success<S, F>;
declare function Failure<S, F>(reason: F): Failure<S, F>;
declare function resultFromMaybe<S>(maybe: Maybe<S>): Result<S, undefined>;
declare function resultFromMaybe<S, F>(maybe: Maybe<S>, mapNone: () => F): Result<S, F>;
export declare const Result: {
    Success: typeof Success;
    Failure: typeof Failure;
    try<S, F>(tryFn: () => S): TryCatch<S, F>;
    fromPromise<S_1, F_1>(promise: Promise<S_1>, onResolve: (value: S_1) => S_1, onReject: (reason: unknown) => F_1): Promise<Result<S_1, F_1>>;
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
export {};
