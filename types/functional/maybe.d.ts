interface API<T> {
    isSome(this: Maybe<T>): this is Some<T>;
    isNone(this: Maybe<T>): this is None;
    orDefault(this: Maybe<T>, defaultValue: T): T;
    map<U>(this: Maybe<T>, f: (value: T) => U): Maybe<U>;
    flatMap<U>(this: Maybe<T>, f: (value: T) => Maybe<U>): Maybe<U>;
    toJSON(this: Maybe<T>): Object;
}
export type Some<T> = {
    value: T;
} & API<T>;
export type None = {} & API<never>;
export type Maybe<T> = Some<T> | None;
export declare function Some<T>(value: NonNullable<T>): Some<T>;
export declare const None: None;
export declare const Maybe: {
    from<T>(value: T | null | undefined): Maybe<T>;
    JSONReviver(_key: string, value: any): any;
};
export {};
