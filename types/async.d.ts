export declare function pause(ms: number): Promise<void>;
interface RetryOptions {
    count?: number;
    delay?: number | ((retryCount: number, error: any) => number);
}
export declare function retry(options: RetryOptions): <T>(provider: () => Promise<T>) => Promise<T>;
export declare function retry<T>(provider: () => Promise<T>, options?: RetryOptions): Promise<T>;
export {};
