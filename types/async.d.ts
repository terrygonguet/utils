export declare function pause(ms: number): Promise<void>;
interface RetryOptions {
    count?: number;
    delay?: number | ((retryCount: number, error: any) => number);
}
export declare function retry(options: RetryOptions): <T>(provider: () => Promise<T>) => Promise<T>;
export declare function retry<T>(provider: () => Promise<T>, options?: RetryOptions): Promise<T>;
interface AsyncMapOptions {
    concurrent?: number;
}
export declare function asyncMap<T, U>(f: AsyncMapFn<T, U>, options?: AsyncMapOptions): (data: T[]) => Promise<U[]>;
export declare function asyncMap<T, U>(data: T[], f: AsyncMapFn<T, U>, options?: AsyncMapOptions): Promise<U[]>;
type AsyncMapFn<T, U> = (el: T, i: number, data: T[]) => Promise<U>;
export {};
