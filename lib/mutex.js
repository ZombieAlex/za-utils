var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Mutex_owned;
import { delayUntil } from "./async.js";
/**
 * Simple synchronization construct to help
 * guard against unexpected behavior in asynchronous
 * applications.
 */
export class Mutex {
    constructor() {
        _Mutex_owned.set(this, false);
    }
    /**
     * Asynchronously waits for the mutex to be free and acquires it
     * @param timeoutMs How long to wait. Default is infinite wait.
     * @returns True if the lock was acquired. False if the timeout was hit.
     */
    async acquire(timeoutMs = Number.POSITIVE_INFINITY) {
        try {
            if (__classPrivateFieldGet(this, _Mutex_owned, "f")) {
                await delayUntil(async () => !__classPrivateFieldGet(this, _Mutex_owned, "f"), { timeoutMs });
            }
            __classPrivateFieldSet(this, _Mutex_owned, true, "f");
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Releases the mutex so that others can acquire it
     */
    release() {
        if (!__classPrivateFieldGet(this, _Mutex_owned, "f")) {
            throw new Error("Unbalanced release");
        }
        __classPrivateFieldSet(this, _Mutex_owned, false, "f");
    }
}
_Mutex_owned = new WeakMap();
//# sourceMappingURL=mutex.js.map