/**
 * Behaviour is undefined when max < min
 */
export declare function clamp(value: number, min: number, max: number): number;
export declare function safeParse<T>(str: string, defaultValue: T, reviver?: (key: string, value: any) => any): any;
