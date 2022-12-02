/**
 * Map object whose entries automatically expire after
 * a specified duration. When the entries expire, an
 * optional expiration callback is invoked.
 */
export declare class ExpiringMap<K, V> {
    #private;
    /**
     * Constructs an ExpiringMap
     */
    constructor(options?: ExpiringMapOptions<K, V>);
    /**
     * Removes all entries from the map. No expiry callbacks are invoked.
     */
    clear(): void;
    /**
     * Removes an entry from the map. No expiry callback is invoked.
     * @param key
     * @returns true if an element in the Map existed and has been removed, or
     * false if the element does not exist.
     */
    delete(key: K): boolean;
    /**
     * @returns an iterable of key, value pairs for every entry in the map.
     */
    entries(): Generator<[K, V]>;
    /**
     * Executes a provided function once per each key/value pair in the Map.
     * Unlike Map.forEach, ExpiringMap.forEach supports asynchronous functions
     * and will return a promise that resolves when all callbacks have completed.
     */
    forEach(callbackfn: MapForEachCallback<K, V>): Promise<void>;
    /**
     * Returns a specified element from the ExpiringMap object. If the value
     * that is associated to the provided key is an object, then you will get a
     * reference to that object and any change made to that object will
     * effectively modify it inside the Map.
     * @returns Returns the element associated with the specified key. If no
     * element is associated with the specified key, undefined is returned.
     */
    get(key: K): V | undefined;
    /**
     * @returns boolean indicating whether an element with the specified key
     * exists or not.
     */
    has(key: K): boolean;
    /**
     * Gets the absolute timestamp at which the element is scheduled to expire.
     * Expiry happens asynchronously and requires that timer loops have been
     * yielded to. The timestamp is not a guarantee.
     * @param key
     * @returns
     */
    getExpiry(key: K): number | undefined;
    /**
     * Returns an iterable of keys in the map
     */
    keys(): IterableIterator<K>;
    /**
     * Adds a new element with a specified key and value to the Map. If an
     * element with the same key already exists, the element will be updated.
     */
    set(key: K, value: V, { expiryMs, expiryCallback }?: {
        expiryMs?: number;
        expiryCallback?: MapExpiryCallback<K, V>;
    }): this;
    /**
     * Removes any existing expiration timer for the given item in the map.
     * The key and value remain in the map untouched and expiry callbacks are
     * not invoked.
     * @param key
     * @returns true if the item existed in the map, false if it did not exist.
     */
    clearExpiry(key: K): boolean;
    /**
     * Updates an existing key's expiration time. The key's value is not
     * altered. If the key does not exist in the map, nothing is altered.
     * @param key
     * @param msFromNow
     * @returns true if the key existed and was updated, false if the key does
     * not exist.
     */
    setExpiry(key: K, msFromNow: number): boolean;
    /**
     * Set the entry's expiry to the minimum of the given
     * expiration or the pre-existing expiration.
     *
     * That is, if the entry would already not have expired
     * before minimumMsFromNow, the timeout will not be altered.
     * @param key Entry to alter expiry for
     * @param minimumMsFromNow Minimum expiration time to set
     */
    setMinimumExpiry(key: K, minimumMsFromNow: number): boolean;
    /**
     * Force immediate expiry of the given key, including
     * execution of any expiry callback, unlike delete()
     * @param key Key to expire
     */
    expire(key: K): Promise<boolean>;
    /**
     * Force immediate expiry of all stored values, including
     * execution of all expiry callbacks.
     */
    expireAll(): Promise<void>;
    /**
     * @returns the number of elements in the Map.
     */
    get size(): number;
    /**
     * @returns an iterable of values in the map
     */
    values(): Generator<V, void, unknown>;
    /**
     * @returns an iterable of key, value pairs for every entry in the map.
     */
    [Symbol.iterator](): Generator<[K, V], any, unknown>;
    get [Symbol.toStringTag](): string;
}
export type MapExpiryCallback<K, V> = ((key: K, value: V, map: ExpiringMap<K, V>) => void) | ((key: K, value: V, map: ExpiringMap<K, V>) => Promise<void>);
export type MapForEachCallback<K, V> = ((value: V, key: K, map: ExpiringMap<K, V>) => void) | ((value: V, key: K, map: ExpiringMap<K, V>) => Promise<void>);
export type ExpiringMapOptions<K, V> = {
    defaultExpiryMs?: number;
    defaultExpiryCallback?: MapExpiryCallback<K, V>;
    expireErrorCallback?: (error: unknown) => void;
};
