/**
 * Behaviour is undefined when max < min
 */
export declare function clamp(value: number, min: number, max: number): number;
type JSONReviver = (key: string, value: any) => any;
export declare function safeParse<T>(str: string, defaultValue: T, reviver?: JSONReviver): any;
export declare function composeJSONRevivers(...revivers: JSONReviver[]): JSONReviver;
export {};
