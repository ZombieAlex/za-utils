/**
 * Set object whose entries automatically expire after
 * a specified duration. When the entries expire, an
 * optional expiration callback is invoked.
 */
export declare class ExpiringSet<T> {
    #private;
    /**
     * Constructs an ExpiringSet
     * @param expireErrorCallback Optional callback function to be invoked
     * when any expiration callback throws an error. By default exceptions
     * in expiry callbacks are swallowed.
     */
    constructor(options?: ExpiringSetOptions<T>);
    /**
     * Removes all values from the set. No expiry callbacks are invoked.
     */
    clear(): void;
    /**
     * Removes a specified value from the set without invoking any associated
     * expiry callback.
     * @param value
     * @returns true if the value existed in the set and was removed, false
     * if the value did not exist.
     */
    delete(value: T): boolean;
    /**
     * @returns an iterable of [v,v] pairs for every value `v` in the set.
     */
    entries(): Generator<[T, T]>;
    /**
     * Executes a provided function once per each value in the set.
     * Unlike Set.forEach, ExpiringSet.forEach supports asynchronous functions
     * and will return a promise that resolves when all callbacks have completed.
     */
    forEach(callbackfn: SetForEachCallback<T>): Promise<void>;
    /**
     * @returns a boolean indicating whether an element with the specified
     * value exists in the set or not.
     */
    has(value: T): boolean;
    /**
     * Gets the absolute timestamp that the given entry will expire
     * at. Note this is not milliseconds from now, this is the full
     * date and time number like `Date.now()`.
     */
    getExpiry(value: T): number | undefined;
    /**
     * Appends a new element with a specified value to the end of the Set.
     */
    add(value: T, { expiryMs, expiryCallback }?: {
        expiryMs?: number;
        expiryCallback?: SetExpiryCallback<T>;
    }): this;
    /**
     * Removes any existing expiration timer for the given item in the set.
     * The value remains in the set untouched and expiry callbacks are not
     * invoked.
     * @param key
     * @returns true if the item existed in the set, false if it did not exist.
     */
    clearExpiry(value: T): boolean;
    /**
     * Updates an existing value's expiration time. If the key does not exist
     * in the set, nothing is altered.
     * @param value
     * @param msFromNow
     * @returns true if the value existed and was updated, false if the value
     * does not exist.
     */
    setExpiry(value: T, msFromNow: number): boolean;
    /**
     * Set the entry's expiry to the minimum of the given
     * expiration or the pre-existing expiration.
     *
     * That is, if the entry would already not have expired
     * before minimumMsFromNow, the timeout will not be altered.
     * @param key Entry to alter expiry for
     * @param minimumMsFromNow Minimum expiration time to set
     */
    setMinimumExpiry(value: T, minimumMsFromNow: number): boolean;
    /**
     * Force immediate expiry of the given value, including
     * execution of any expiry callback, unlike delete()
     * @param value Value to expire
     */
    expire(value: T): Promise<boolean>;
    /**
     * Force immediate expiry of all stored values, including
     * execution of all expiry callbacks.
     */
    expireAll(): Promise<void>;
    /**
     * @returns the number of elements in the set.
     */
    get size(): number;
    /**
     * @returns an iterable of the values in the set.
     */
    keys(): IterableIterator<T>;
    /**
     * @returns an iterable of values in the set.
     */
    values(): IterableIterator<T>;
    /**
     * @returns an iterable of values in the set.
     */
    [Symbol.iterator](): IterableIterator<T>;
    get [Symbol.toStringTag](): string;
}
export type SetExpiryCallback<T> = ((value: T, set: ExpiringSet<T>) => void) | ((value: T, set: ExpiringSet<T>) => Promise<void>);
export type SetForEachCallback<T> = ((value1: T, value2: T, set: ExpiringSet<T>) => void) | ((value1: T, value2: T, set: ExpiringSet<T>) => Promise<void>);
export type ExpiringSetOptions<T> = {
    defaultExpiryMs?: number;
    defaultExpiryCallback?: SetExpiryCallback<T>;
    expireErrorCallback?: (error: unknown) => void;
};
