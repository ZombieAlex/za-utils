var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ExpiringMap_options, _ExpiringMap_map;
import { toSync } from "./async.js";
/**
 * Map object whose entries automatically expire after
 * a specified duration. When the entries expire, an
 * optional expiration callback is invoked.
 */
export class ExpiringMap {
    /**
     * Constructs an ExpiringMap
     */
    constructor(options) {
        _ExpiringMap_options.set(this, void 0);
        _ExpiringMap_map.set(this, void 0);
        __classPrivateFieldSet(this, _ExpiringMap_options, options, "f");
        __classPrivateFieldSet(this, _ExpiringMap_map, new Map(), "f");
    }
    /**
     * Removes all entries from the map. No expiry callbacks are invoked.
     */
    clear() {
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
    delete(key) {
        clearTimeout(__classPrivateFieldGet(this, _ExpiringMap_map, "f").get(key)?.timer);
        return __classPrivateFieldGet(this, _ExpiringMap_map, "f").delete(key);
    }
    /**
     * @returns an iterable of key, value pairs for every entry in the map.
     */
    *entries() {
        for (const entry of __classPrivateFieldGet(this, _ExpiringMap_map, "f").entries()) {
            yield [entry[0], entry[1].value];
        }
    }
    /**
     * Executes a provided function once per each key/value pair in the Map.
     * Unlike Map.forEach, ExpiringMap.forEach supports asynchronous functions
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
     * Returns a specified element from the ExpiringMap object. If the value
     * that is associated to the provided key is an object, then you will get a
     * reference to that object and any change made to that object will
     * effectively modify it inside the Map.
     * @returns Returns the element associated with the specified key. If no
     * element is associated with the specified key, undefined is returned.
     */
    get(key) {
        return __classPrivateFieldGet(this, _ExpiringMap_map, "f").get(key)?.value;
    }
    /**
     * @returns boolean indicating whether an element with the specified key
     * exists or not.
     */
    has(key) {
        return __classPrivateFieldGet(this, _ExpiringMap_map, "f").has(key);
    }
    /**
     * Gets the absolute timestamp at which the element is scheduled to expire.
     * Expiry happens asynchronously and requires that timer loops have been
     * yielded to. The timestamp is not a guarantee.
     * @param key
     * @returns
     */
    getExpiry(key) {
        return __classPrivateFieldGet(this, _ExpiringMap_map, "f").get(key)?.expiry;
    }
    /**
     * Returns an iterable of keys in the map
     */
    keys() {
        return __classPrivateFieldGet(this, _ExpiringMap_map, "f").keys();
    }
    /**
     * Adds a new element with a specified key and value to the Map. If an
     * element with the same key already exists, the element will be updated.
     */
    set(key, value, { expiryMs, expiryCallback } = {}) {
        this.delete(key);
        let timer;
        let expiry;
        expiryMs ?? (expiryMs = __classPrivateFieldGet(this, _ExpiringMap_options, "f")?.defaultExpiryMs);
        expiryCallback ?? (expiryCallback = __classPrivateFieldGet(this, _ExpiringMap_options, "f")?.defaultExpiryCallback);
        if (typeof expiryMs === "number") {
            expiry = Date.now() + expiryMs;
            timer = setTimeout(toSync(async () => {
                this.delete(key);
                if (typeof expiryCallback === "function") {
                    await expiryCallback(key, value, this);
                }
            }, __classPrivateFieldGet(this, _ExpiringMap_options, "f")?.expireErrorCallback), expiryMs);
        }
        __classPrivateFieldGet(this, _ExpiringMap_map, "f").set(key, { timer, expiry, expiryCallback, value });
        return this;
    }
    /**
     * Removes any existing expiration timer for the given item in the map.
     * The key and value remain in the map untouched and expiry callbacks are
     * not invoked.
     * @param key
     * @returns true if the item existed in the map, false if it did not exist.
     */
    clearExpiry(key) {
        if (__classPrivateFieldGet(this, _ExpiringMap_map, "f").has(key)) {
            const entry = __classPrivateFieldGet(this, _ExpiringMap_map, "f").get(key);
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
    setExpiry(key, msFromNow) {
        if (__classPrivateFieldGet(this, _ExpiringMap_map, "f").has(key)) {
            const { value, expiryCallback } = __classPrivateFieldGet(this, _ExpiringMap_map, "f").get(key);
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
    setMinimumExpiry(key, minimumMsFromNow) {
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
    async expire(key) {
        const entry = __classPrivateFieldGet(this, _ExpiringMap_map, "f").get(key);
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
    async expireAll() {
        const expiries = [];
        for (const key of this.keys()) {
            expiries.push(this.expire(key));
        }
        await Promise.all(expiries);
    }
    /**
     * @returns the number of elements in the Map.
     */
    get size() {
        return __classPrivateFieldGet(this, _ExpiringMap_map, "f").size;
    }
    /**
     * @returns an iterable of values in the map
     */
    *values() {
        for (const entry of this.entries()) {
            yield entry[1];
        }
    }
    /**
     * @returns an iterable of key, value pairs for every entry in the map.
     */
    [(_ExpiringMap_options = new WeakMap(), _ExpiringMap_map = new WeakMap(), Symbol.iterator)]() {
        return this.entries();
    }
    get [Symbol.toStringTag]() {
        return "ExpiringMap";
    }
}
//# sourceMappingURL=expiring-map.js.map