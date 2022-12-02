/**
 * Returns true if the given promise has completed, whether
 * it resolved or rejected. And false if the given promise
 * has not yet completed.
 */
export async function isPromiseCompleted<T>(prom: Promise<T>): Promise<boolean> {
    try {
        const sym = Symbol("isPromiseCompleted");
        const result = await Promise.race([prom, Promise.resolve(sym)]);
        if (result === sym) {
            return false;
        }

        return true;
    } catch {
        return true;
    }
}

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
export type CancellablePromise<T> = Promise<T> & { cancel: () => void };

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
export function resolveWhenAny(...args: Array<CancellablePromise<any>>): CancellablePromise<number> {
    // Construct rejection Error's before any async work
    // so that the Error callstacks will be useful
    const cancelReason = new Error("Cancelled");
    let cancel: undefined | (() => void);
    const prom = new Promise<number>((resolve, reject) => {
        let completed = false;
        const cancelAllExcept = (skip: number): void => {
            for (const [i, arg] of args.entries()) {
                if (i !== skip && typeof arg?.cancel === "function") {
                    arg?.cancel();
                }
            }
        };

        cancel = (): void => {
            if (!completed) {
                completed = true;
                cancelAllExcept(-1);
                reject(cancelReason);
            }
        };

        for (const [i, arg] of args.entries()) {
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            arg?.then(() => {
                if (!completed) {
                    completed = true;
                    cancelAllExcept(i);
                    resolve(i);
                }
                // eslint-disable-next-line @typescript-eslint/no-loop-func
            }).catch((error) => {
                if (!completed) {
                    completed = true;
                    cancelAllExcept(i);
                    reject(error);
                }
            });
        }
    }) as unknown as CancellablePromise<number>;

    prom.cancel = cancel as unknown as () => void;
    return prom;
}
