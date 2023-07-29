export type ShapeConfig<T> = {
    /** List of string type properties. */
    strings?: Array<keyof T>;
    /** List of string type paths. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    stringPaths?: string[];
    /** List of number type properties. */
    numbers?: Array<keyof T>;
    /** List of number type paths. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    numberPaths?: string[];
    /** List of boolean type properties. */
    booleans?: Array<keyof T>;
    /** List of boolean type paths. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    booleanPaths?: string[];
    /** List of array type properties. */
    arrays?: Array<keyof T>;
    /** List of array type paths. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    arrayPaths?: string[];
    /** List of object type properties. */
    objects?: Array<keyof T>;
    /** List of object type paths. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    objectPaths?: string[];
    /** List of function type properties. */
    functions?: Array<keyof T>;
    /** List of function type paths. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    functionPaths?: string[];
    /** List of properties allowed to be undefined. */
    optionals?: Array<keyof T>;
    /** If true, validation will fail for any extra top level properties */
    strict?: boolean;
};
/**
 * Throws if the given object does not conform to the specified shape.
 * @param object
 * @param param1
 */
export declare function assertShape(object: unknown, { strings, stringPaths, numbers, numberPaths, booleans, booleanPaths, arrays, arrayPaths, objects, objectPaths, functions, functionPaths, optionals, strict, }: ShapeConfig<any>): void;
/**
 * Type guard that validates the given object has the given shape.
 * @param object
 * @param shape
 * @returns
 */
export declare function hasShapeOf<T>(object: unknown, shape: ShapeConfig<T>): object is T;
/**
 * Assertion type guard that validates the given object has the given shape.
 * @param object
 * @param shape
 */
export declare function assertShapeOf<T>(object: unknown, shape: ShapeConfig<T>): asserts object is T;
/**
 * Type guard that validates the given object with a given validator function.
 * @param object
 * @param condition
 * @returns
 */
export declare function isType<T>(object: unknown, validator?: (object?: Partial<T>) => boolean): object is T;
/**
 * Assertion type guard that validates the given object with a given validator function.
 * @param object
 * @param condition
 * @returns
 */
export declare function assertType<T>(object: unknown, validator?: (object?: Partial<T>) => boolean): asserts object is T;
/**
 * Like JSON.parse() but with strong type checking based on the specified shape.
 * @param text
 * @param shape
 * @param reviver
 * @returns
 */
export declare function jsonParse<T>(text: string, shape: ShapeConfig<T>, reviver?: (this: any, key: string, value: any) => any): T;
/** Shorthand number type check */
export declare function isNumber(arg: unknown): arg is number;
/** Shorthand string type check */
export declare function isString(arg: unknown): arg is string;
/** Shorthand array type check */
export declare function isArray(arg: unknown): arg is unknown[];
/** Shorthand function type check */
export declare function isFunction(arg: unknown): arg is (...args: unknown[]) => unknown;
