import _ from "lodash";

export type ShapeConfig<T> = {
    /** List of string type properties. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    strings?: Array<keyof T>;
    /** List of number type properties. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    numbers?: Array<keyof T>;
    /** List of boolean type properties. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    booleans?: Array<keyof T>;
    /** List of array type properties. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    arrays?: Array<keyof T>;
    /** List of object type properties. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    objects?: Array<keyof T>;
    /** List of function type properties. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    functions?: Array<keyof T>;
    /** List of properties allowed to be undefined. Accepts lodash path syntax: https://lodash.com/docs/4.17.15#get */
    optionals?: Array<keyof T>;
    /** If true, validation will fail for any extra top level properties */
    strict?: boolean;
};

/**
 * Throws if the given object does not conform to the specified shape.
 * @param object
 * @param param1
 */
export function assertShape(
    object: unknown,
    {
        strings = [],
        numbers = [],
        booleans = [],
        arrays = [],
        objects = [],
        functions = [],
        optionals = [],
        strict = false,
    }: ShapeConfig<any>,
) {
    if (object === undefined || object === null || typeof object !== "object") {
        throw new Error(`Type is not an object`);
    }

    const shapedObject = object as Record<string | number | symbol, unknown>;

    const errors: string[] = [];
    const bags = [strings, numbers, booleans, arrays, objects, functions];
    const expectedTypes = ["string", "number", "boolean", "array", "object", "function"];

    for (const [i, bag] of bags.entries()) {
        if (bag !== undefined) {
            for (const prop of bag) {
                const propValue: unknown = shapedObject[prop] ?? _.get(shapedObject, prop);
                const propType = typeof propValue;
                if (propType !== expectedTypes[i] && (expectedTypes[i] !== "array" || !Array.isArray(propValue))) {
                    const isOptional = optionals.includes(prop);
                    // eslint-disable-next-line max-depth
                    if (propType !== "undefined" || !isOptional) {
                        errors.push(`${String(prop)} must be ${expectedTypes[i]!}${isOptional ? " | undefined" : ""}`);
                    }
                }
            }
        }
    }

    if (strict) {
        const allowedSet = new Set([
            ...strings,
            ...numbers,
            ...booleans,
            ...arrays,
            ...objects,
            ...functions,
            ...optionals,
        ]);
        const actualSet = new Set([
            // All enumerable own and inherited string properties
            ..._.keysIn(shapedObject),
            // All own string properties, enumerable or not
            ...Object.getOwnPropertyNames(shapedObject),
            // All own symbol properties
            ...Object.getOwnPropertySymbols(shapedObject),
        ]);
        const extraneousSet = new Set([...actualSet].filter((s) => !allowedSet.has(s)));
        if (extraneousSet.size > 0) {
            errors.push(`Missing required properties: [${[...extraneousSet].map(String).join(", ")}]`);
        }
    }

    if (errors.length > 0) {
        // eslint-disable-next-line unicorn/error-message
        throw new Error(errors.join("; "));
    }
}

/**
 * Type guard that validates the given object has the given shape.
 * @param object
 * @param shape
 * @returns
 */
export function hasShapeOf<T>(object: unknown, shape: ShapeConfig<T>): object is T {
    try {
        assertShape(object, shape);
        return true;
    } catch {
        return false;
    }
}

/**
 * Assertion type guard that validates the given object has the given shape.
 * @param object
 * @param shape
 */
export function assertShapeOf<T>(object: unknown, shape: ShapeConfig<T>): asserts object is T {
    assertShape(object, shape);
}

/**
 * Like JSON.parse() but with strong type checking based on the specified shape.
 * @param text
 * @param shape
 * @param reviver
 * @returns
 */
export function jsonParse<T>(
    text: string,
    shape: ShapeConfig<T>,
    reviver?: (this: any, key: string, value: any) => any,
): T {
    const object: unknown = JSON.parse(text, reviver);
    assertShapeOf<T>(object, shape);
    return object;
}

/** Shorthand number type check */
export function isNumber(arg: unknown): arg is number {
    return typeof arg === "number";
}

/** Shorthand string type check */
export function isString(arg: unknown): arg is string {
    return typeof arg === "string";
}

/** Shorthand array type check */
export function isArray(arg: unknown): arg is unknown[] {
    return Array.isArray(arg);
}

/** Shorthand function type check */
export function isFunction(arg: unknown): arg is (...args: unknown[]) => unknown {
    return typeof arg === "function";
}
