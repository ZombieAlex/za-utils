import { toSync } from "./async.js";
/**
 * Set object whose entries automatically expire after
 * a specified duration. When the entries expire, an
 * optional expiration callback is invoked.
 */
export class ExpiringSet {
    #options;
    #map;
    /**
     * Constructs an ExpiringSet
     * @param expireErrorCallback Optional callback function to be invoked
     * when any expiration callback throws an error. By default exceptions
     * in expiry callbacks are swallowed.
     */
    constructor(options) {
        this.#options = options;
        this.#map = new Map();
    }
    /**
     * Removes all values from the set. No expiry callbacks are invoked.
     */
    clear() {
        for (const key of this.#map.keys()) {
            this.delete(key);
        }
    }
    /**
     * Removes a specified value from the set without invoking any associated
     * expiry callback.
     * @param value
     * @returns true if the value existed in the set and was removed, false
     * if the value did not exist.
     */
    delete(value) {
        clearTimeout(this.#map.get(value)?.timer);
        return this.#map.delete(value);
    }
    /**
     * @returns an iterable of [v,v] pairs for every value `v` in the set.
     */
    *entries() {
        for (const key of this.#map.keys()) {
            yield [key, key];
        }
    }
    /**
     * Executes a provided function once per each value in the set.
     * Unlike Set.forEach, ExpiringSet.forEach supports asynchronous functions
     * and will return a promise that resolves when all callbacks have completed.
     */
    async forEach(callbackfn) {
        const promises = [];
        for (const entry of this.entries()) {
            promises.push(callbackfn(entry[1], entry[0], this));
        }
        await Promise.all(promises);
    }
    /**
     * @returns a boolean indicating whether an element with the specified
     * value exists in the set or not.
     */
    has(value) {
        return this.#map.has(value);
    }
    /**
     * Gets the absolute timestamp that the given entry will expire
     * at. Note this is not milliseconds from now, this is the full
     * date and time number like `Date.now()`.
     */
    getExpiry(value) {
        return this.#map.get(value)?.expiry;
    }
    /**
     * Appends a new element with a specified value to the end of the Set.
     */
    add(value, { expiryMs, expiryCallback } = {}) {
        this.delete(value);
        let timer;
        let expiry;
        expiryMs ??= this.#options?.defaultExpiryMs;
        expiryCallback ??= this.#options?.defaultExpiryCallback;
        if (typeof expiryMs === "number") {
            expiry = Date.now() + expiryMs;
            timer = setTimeout(toSync(async () => {
                this.delete(value);
                if (typeof expiryCallback === "function") {
                    await expiryCallback(value, this);
                }
            }, this.#options?.expireErrorCallback), expiryMs);
        }
        this.#map.set(value, { timer, expiry, expiryCallback });
        return this;
    }
    /**
     * Removes any existing expiration timer for the given item in the set.
     * The value remains in the set untouched and expiry callbacks are not
     * invoked.
     * @param key
     * @returns true if the item existed in the set, false if it did not exist.
     */
    clearExpiry(value) {
        if (this.#map.has(value)) {
            const entry = this.#map.get(value);
            clearTimeout(entry.timer);
            entry.expiry = undefined;
            entry.timer = undefined;
            return true;
        }
        return false;
    }
    /**
     * Updates an existing value's expiration time. If the key does not exist
     * in the set, nothing is altered.
     * @param value
     * @param msFromNow
     * @returns true if the value existed and was updated, false if the value
     * does not exist.
     */
    setExpiry(value, msFromNow) {
        if (this.#map.has(value)) {
            const { expiryCallback } = this.#map.get(value);
            this.add(value, { expiryMs: msFromNow, expiryCallback });
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
    setMinimumExpiry(value, minimumMsFromNow) {
        const oldExpiry = this.getExpiry(value);
        if (typeof oldExpiry === "number") {
            const targetExpiry = Date.now() + minimumMsFromNow;
            if (targetExpiry > oldExpiry) {
                return this.setExpiry(value, minimumMsFromNow);
            }
            return true;
        }
        return false;
    }
    /**
     * Force immediate expiry of the given value, including
     * execution of any expiry callback, unlike delete()
     * @param value Value to expire
     */
    async expire(value) {
        const entry = this.#map.get(value);
        if (entry !== undefined) {
            this.delete(value);
            if (typeof entry.expiryCallback === "function") {
                await entry.expiryCallback(value, this);
            }
            return true;
        }
        return false;
    }
    /**
     * Force immediate expiry of all stored values, including
     * execution of all expiry callbacks.
     */
    async expireAll() {
        const expiries = [];
        for (const value of this.values()) {
            expiries.push(this.expire(value));
        }
        await Promise.all(expiries);
    }
    /**
     * @returns the number of elements in the set.
     */
    get size() {
        return this.#map.size;
    }
    /**
     * @returns an iterable of the values in the set.
     */
    keys() {
        return this.values();
    }
    /**
     * @returns an iterable of values in the set.
     */
    values() {
        return this.#map.keys();
    }
    /**
     * @returns an iterable of values in the set.
     */
    [Symbol.iterator]() {
        return this.values();
    }
    get [Symbol.toStringTag]() {
        return "ExpiringSet";
    }
}
//# sourceMappingURL=expiring-set.js.map