import { toSync } from "./async.js";

/**
 * Set object whose entries automatically expire after
 * a specified duration. When the entries expire, an
 * optional expiration callback is invoked.
 */
export class ExpiringSet<T> {
    #options?: ExpiringSetOptions<T>;
    readonly #map: Map<
        T,
        {
            expiry?: number;
            timer?: NodeJS.Timeout;
            expiryCallback?: SetExpiryCallback<T>;
        }
    >;

    /**
     * Constructs an ExpiringSet
     * @param expireErrorCallback Optional callback function to be invoked
     * when any expiration callback throws an error. By default exceptions
     * in expiry callbacks are swallowed.
     */
    constructor(options?: ExpiringSetOptions<T>) {
        this.#options = options;
        this.#map = new Map();
    }

    /**
     * Removes all values from the set. No expiry callbacks are invoked.
     */
    public clear(): void {
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
    public delete(value: T): boolean {
        clearTimeout(this.#map.get(value)?.timer);
        return this.#map.delete(value);
    }

    /**
     * @returns an iterable of [v,v] pairs for every value `v` in the set.
     */
    public *entries(): Generator<[T, T]> {
        for (const key of this.#map.keys()) {
            yield [key, key];
        }
    }

    /**
     * Executes a provided function once per each value in the set.
     * Unlike Set.forEach, ExpiringSet.forEach supports asynchronous functions
     * and will return a promise that resolves when all callbacks have completed.
     */
    public async forEach(callbackfn: SetForEachCallback<T>) {
        const promises: Array<void | Promise<void>> = [];

        for (const entry of this.entries()) {
            promises.push(callbackfn(entry[1]!, entry[0]!, this));
        }

        await Promise.all(promises);
    }

    /**
     * @returns a boolean indicating whether an element with the specified
     * value exists in the set or not.
     */
    public has(value: T): boolean {
        return this.#map.has(value);
    }

    /**
     * Gets the absolute timestamp that the given entry will expire
     * at. Note this is not milliseconds from now, this is the full
     * date and time number like `Date.now()`.
     */
    public getExpiry(value: T): number | undefined {
        return this.#map.get(value)?.expiry;
    }

    /**
     * Appends a new element with a specified value to the end of the Set.
     */
    public add(
        value: T,
        { expiryMs, expiryCallback }: { expiryMs?: number; expiryCallback?: SetExpiryCallback<T> } = {},
    ) {
        this.delete(value);
        let timer;
        let expiry;
        expiryMs ??= this.#options?.defaultExpiryMs;
        expiryCallback ??= this.#options?.defaultExpiryCallback;
        if (typeof expiryMs === "number") {
            expiry = Date.now() + expiryMs;
            timer = setTimeout(
                toSync(async () => {
                    this.delete(value);

                    if (typeof expiryCallback === "function") {
                        await expiryCallback(value, this);
                    }
                }, this.#options?.expireErrorCallback),
                expiryMs,
            );
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
    public clearExpiry(value: T): boolean {
        if (this.#map.has(value)) {
            const entry = this.#map.get(value)!;
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
    public setExpiry(value: T, msFromNow: number): boolean {
        if (this.#map.has(value)) {
            const { expiryCallback } = this.#map.get(value)!;
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
    public setMinimumExpiry(value: T, minimumMsFromNow: number): boolean {
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
    public async expire(value: T) {
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
    public async expireAll() {
        const expiries: Array<Promise<boolean | void>> = [];
        for (const value of this.values()) {
            expiries.push(this.expire(value));
        }

        await Promise.all(expiries);
    }

    /**
     * @returns the number of elements in the set.
     */
    public get size() {
        return this.#map.size;
    }

    /**
     * @returns an iterable of the values in the set.
     */
    public keys() {
        return this.values();
    }

    /**
     * @returns an iterable of values in the set.
     */
    public values() {
        return this.#map.keys();
    }

    /**
     * @returns an iterable of values in the set.
     */
    public [Symbol.iterator]() {
        return this.values();
    }

    public get [Symbol.toStringTag]() {
        return "ExpiringSet";
    }
}

export type SetExpiryCallback<T> =
    | ((value: T, set: ExpiringSet<T>) => void)
    | ((value: T, set: ExpiringSet<T>) => Promise<void>);

export type SetForEachCallback<T> =
    | ((value1: T, value2: T, set: ExpiringSet<T>) => void)
    | ((value1: T, value2: T, set: ExpiringSet<T>) => Promise<void>);

export type ExpiringSetOptions<T> = {
    defaultExpiryMs?: number;
    defaultExpiryCallback?: SetExpiryCallback<T>;
    expireErrorCallback?: (error: unknown) => void;
};
