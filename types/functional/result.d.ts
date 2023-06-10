interface API<S, F> {
    isSuccess(this: Result<S, F>): this is Success<S, F>;
    isFailure(this: Result<S, F>): this is Failure<S, F>;
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
export declare function Success<S, F>(value: S): Success<S, F>;
export declare function Failure<S, F>(reason: F): Failure<S, F>;
export declare const Result: {
    try<S, F>(tryFn: () => S): TryCatch<S, F>;
    JSONReviver(_key: string, value: any): any;
};
declare class TryCatch<S, F> {
    tryFn: () => S;
    catchFn: (err: unknown) => F;
    constructor(tryFn: () => S);
    catch(catchFn: (err: unknown) => F): this;
    exec(): Result<S, F>;
}
export {};
