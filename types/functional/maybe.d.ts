interface API<T> {
    isSome(this: Maybe<T>): this is Some<T>;
    isNone(this: Maybe<T>): this is None<T>;
    orDefault(this: Maybe<T>, defaultValue: T): T;
    map<U>(this: Maybe<T>, f: (value: T) => U): Maybe<U>;
    flatMap<U>(this: Maybe<T>, f: (value: T) => Maybe<U>): Maybe<U>;
    toJSON(this: Maybe<T>): Object;
}
export type Some<T> = {
    value: T;
} & API<T>;
export type None<T> = API<T>;
export type Maybe<T> = Some<T> | None<T>;
export declare function Some<T>(value: NonNullable<T>): Some<T>;
export declare const None: None<any>;
export declare const Maybe: {
    Some: typeof Some;
    None: None<any>;
    from<T>(value: T | null | undefined): Maybe<T>;
    JSONReviver(_key: string, value: any): any;
};
export {};
