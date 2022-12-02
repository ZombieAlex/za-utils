import { toSync } from "./async.js";

/**
 * Map object whose entries automatically expire after
 * a specified duration. When the entries expire, an
 * optional expiration callback is invoked.
 */
export class ExpiringMap<K, V> {
    #options?: ExpiringMapOptions<K, V>;
    readonly #map: Map<
        K,
        {
            /** Full timestamp of when the entry will expire */
            expiry?: number;
            timer?: NodeJS.Timeout;
            expiryCallback?: MapExpiryCallback<K, V>;
            value: V;
        }
    >;

    /**
     * Constructs an ExpiringMap
     */
    constructor(options?: ExpiringMapOptions<K, V>) {
        this.#options = options;
        this.#map = new Map();
    }

    /**
     * Removes all entries from the map. No expiry callbacks are invoked.
     */
    public clear(): void {
        for (const key of this.keys()) {
            this.delete(key);
        }
    }

    /**
     * Removes an entry from the map. No expiry callback is invoked.
     * @param key
     * @returns true if an element in the Map existed and has been removed, or
     * false if the element does not exist.
     */
    public delete(key: K): boolean {
        clearTimeout(this.#map.get(key)?.timer);
        return this.#map.delete(key);
    }

    /**
     * @returns an iterable of key, value pairs for every entry in the map.
     */
    public *entries(): Generator<[K, V]> {
        for (const entry of this.#map.entries()) {
            yield [entry[0], entry[1].value];
        }
    }

    /**
     * Executes a provided function once per each key/value pair in the Map.
     * Unlike Map.forEach, ExpiringMap.forEach supports asynchronous functions
     * and will return a promise that resolves when all callbacks have completed.
     */
    public async forEach(callbackfn: MapForEachCallback<K, V>) {
        const promises: Array<void | Promise<void>> = [];

        for (const entry of this.entries()) {
            promises.push(callbackfn(entry[1], entry[0], this));
        }

        await Promise.all(promises);
    }

    /**
     * Returns a specified element from the ExpiringMap object. If the value
     * that is associated to the provided key is an object, then you will get a
     * reference to that object and any change made to that object will
     * effectively modify it inside the Map.
     * @returns Returns the element associated with the specified key. If no
     * element is associated with the specified key, undefined is returned.
     */
    public get(key: K): V | undefined {
        return this.#map.get(key)?.value;
    }

    /**
     * @returns boolean indicating whether an element with the specified key
     * exists or not.
     */
    public has(key: K): boolean {
        return this.#map.has(key);
    }

    /**
     * Gets the absolute timestamp at which the element is scheduled to expire.
     * Expiry happens asynchronously and requires that timer loops have been
     * yielded to. The timestamp is not a guarantee.
     * @param key
     * @returns
     */
    public getExpiry(key: K): number | undefined {
        return this.#map.get(key)?.expiry;
    }

    /**
     * Returns an iterable of keys in the map
     */
    public keys() {
        return this.#map.keys();
    }

    /**
     * Adds a new element with a specified key and value to the Map. If an
     * element with the same key already exists, the element will be updated.
     */
    public set(
        key: K,
        value: V,
        { expiryMs, expiryCallback }: { expiryMs?: number; expiryCallback?: MapExpiryCallback<K, V> } = {},
    ) {
        this.delete(key);
        let timer;
        let expiry;
        expiryMs ??= this.#options?.defaultExpiryMs;
        expiryCallback ??= this.#options?.defaultExpiryCallback;
        if (typeof expiryMs === "number") {
            expiry = Date.now() + expiryMs;
            timer = setTimeout(
                toSync(async () => {
                    this.delete(key);

                    if (typeof expiryCallback === "function") {
                        await expiryCallback(key, value, this);
                    }
                }, this.#options?.expireErrorCallback),
                expiryMs,
            );
        }

        this.#map.set(key, { timer, expiry, expiryCallback, value });
        return this;
    }

    /**
     * Removes any existing expiration timer for the given item in the map.
     * The key and value remain in the map untouched and expiry callbacks are
     * not invoked.
     * @param key
     * @returns true if the item existed in the map, false if it did not exist.
     */
    public clearExpiry(key: K): boolean {
        if (this.#map.has(key)) {
            const entry = this.#map.get(key)!;
            clearTimeout(entry.timer);
            entry.expiry = undefined;
            entry.timer = undefined;
            return true;
        }

        return false;
    }

    /**
     * Updates an existing key's expiration time. The key's value is not
     * altered. If the key does not exist in the map, nothing is altered.
     * @param key
     * @param msFromNow
     * @returns true if the key existed and was updated, false if the key does
     * not exist.
     */
    public setExpiry(key: K, msFromNow: number): boolean {
        if (this.#map.has(key)) {
            const { value, expiryCallback } = this.#map.get(key)!;
            this.set(key, value, { expiryMs: msFromNow, expiryCallback });
            return true;
        }

        return false;
    }

    /**
     * Set the entry's expiry to the minimum of the given
     * expiration or the pre-existing expiration.
     *
     * That is, if the entry would already not have expired
     * before minimumMsFromNow, the timeout will not be altered.
     * @param key Entry to alter expiry for
     * @param minimumMsFromNow Minimum expiration time to set
     */
    public setMinimumExpiry(key: K, minimumMsFromNow: number): boolean {
        const oldExpiry = this.getExpiry(key);
        if (typeof oldExpiry === "number") {
            const targetExpiry = Date.now() + minimumMsFromNow;
            if (targetExpiry > oldExpiry) {
                return this.setExpiry(key, minimumMsFromNow);
            }

            return true;
        }

        return false;
    }

    /**
     * Force immediate expiry of the given key, including
     * execution of any expiry callback, unlike delete()
     * @param key Key to expire
     */
    public async expire(key: K) {
        const entry = this.#map.get(key);
        if (entry !== undefined) {
            this.delete(key);
            if (typeof entry.expiryCallback === "function") {
                await entry.expiryCallback(key, entry.value, this);
            }

            return true;
        }

        return false;
    }

    /**
     * Force immediate expiry of all stored values, including
     * execution of all expiry callbacks.
     */
    public async expireAll() {
        const expiries: Array<Promise<boolean | void>> = [];
        for (const key of this.keys()) {
            expiries.push(this.expire(key));
        }

        await Promise.all(expiries);
    }

    /**
     * @returns the number of elements in the Map.
     */
    public get size() {
        return this.#map.size;
    }

    /**
     * @returns an iterable of values in the map
     */
    public *values() {
        for (const entry of this.entries()) {
            yield entry[1];
        }
    }

    /**
     * @returns an iterable of key, value pairs for every entry in the map.
     */
    public [Symbol.iterator]() {
        return this.entries();
    }

    public get [Symbol.toStringTag]() {
        return "ExpiringMap";
    }
}

export type MapExpiryCallback<K, V> =
    | ((key: K, value: V, map: ExpiringMap<K, V>) => void)
    | ((key: K, value: V, map: ExpiringMap<K, V>) => Promise<void>);

export type MapForEachCallback<K, V> =
    | ((value: V, key: K, map: ExpiringMap<K, V>) => void)
    | ((value: V, key: K, map: ExpiringMap<K, V>) => Promise<void>);

export type ExpiringMapOptions<K, V> = {
    defaultExpiryMs?: number;
    defaultExpiryCallback?: MapExpiryCallback<K, V>;
    expireErrorCallback?: (error: unknown) => void;
};
