import _ from "lodash";
/**
 * Throws if the given object does not conform to the specified shape.
 * @param object
 * @param param1
 */
export function assertShape(object, { strings = [], numbers = [], booleans = [], arrays = [], objects = [], functions = [], optionals = [], strict = false, }) {
    if (object === undefined || object === null || typeof object !== "object") {
        throw new Error(`Type is not an object`);
    }
    const shapedObject = object;
    const errors = [];
    const bags = [strings, numbers, booleans, arrays, objects, functions];
    const expectedTypes = ["string", "number", "boolean", "array", "object", "function"];
    for (const [i, bag] of bags.entries()) {
        if (bag !== undefined) {
            for (const prop of bag) {
                const propValue = shapedObject[prop] ?? _.get(shapedObject, prop);
                const propType = typeof propValue;
                if (propType !== expectedTypes[i] && (expectedTypes[i] !== "array" || !Array.isArray(propValue))) {
                    const isOptional = optionals.includes(prop);
                    // eslint-disable-next-line max-depth
                    if (propType !== "undefined" || !isOptional) {
                        errors.push(`${String(prop)} must be ${expectedTypes[i]}${isOptional ? " | undefined" : ""}`);
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
export function hasShapeOf(object, shape) {
    try {
        assertShape(object, shape);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Assertion type guard that validates the given object has the given shape.
 * @param object
 * @param shape
 */
export function assertShapeOf(object, shape) {
    assertShape(object, shape);
}
/**
 * Type guard that validates the given object with a given validator function.
 * @param object
 * @param condition
 * @returns
 */
export function isType(object, validator) {
    if (typeof validator === "function") {
        return validator(object);
    }
    return true;
}
/**
 * Assertion type guard that validates the given object with a given validator function.
 * @param object
 * @param condition
 * @returns
 */
export function assertType(object, validator) {
    if (typeof validator === "function" && !validator(object)) {
        throw new TypeError("object was not the expected type");
    }
}
/**
 * Like JSON.parse() but with strong type checking based on the specified shape.
 * @param text
 * @param shape
 * @param reviver
 * @returns
 */
export function jsonParse(text, shape, reviver) {
    const object = JSON.parse(text, reviver);
    assertShapeOf(object, shape);
    return object;
}
/** Shorthand number type check */
export function isNumber(arg) {
    return typeof arg === "number";
}
/** Shorthand string type check */
export function isString(arg) {
    return typeof arg === "string";
}
/** Shorthand array type check */
export function isArray(arg) {
    return Array.isArray(arg);
}
/** Shorthand function type check */
export function isFunction(arg) {
    return typeof arg === "function";
}
//# sourceMappingURL=type-guards.js.map