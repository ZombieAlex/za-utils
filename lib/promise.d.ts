/**
 * Returns true if the given promise has completed, whether
 * it resolved or rejected. And false if the given promise
 * has not yet completed.
 */
export declare function isPromiseCompleted<T>(prom: Promise<T>): Promise<boolean>;
/**
 * CancellablePromise<T> represents a Promise<T> with an additional cancel
 * function. If cancel is called before the Promise otherwise resolves or
 * rejects, the Promise will reject with `new Error("Cancelled")`.
 *
 * CancellablePromises can be created on top of EventEmitters and composed
 * with the following 3 functions:
 *  - resolveWhen
 *  - rejectWhen
 *  - resolveWhenAny
 */
export type CancellablePromise<T> = Promise<T> & {
    cancel: () => void;
};
/**
 * Helper function that takes any number of CancellablePromises and returns a
 * combined promise that resolves or rejects whenever the first given promise
 * resolves or rejects. It resolves with a index number indicating which of
 * the given promises resolved first instead of the actual resolve parameters
 * as there is no way to know the shape of the resolve parameters across many
 * different events.
 *
 * Unlike Promise.race(), all cancellable non-resolved promises are then cancelled.
 */
export declare function resolveWhenAny(...args: Array<CancellablePromise<any>>): CancellablePromise<number>;
