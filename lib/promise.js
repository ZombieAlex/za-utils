/**
 * Returns true if the given promise has completed, whether
 * it resolved or rejected. And false if the given promise
 * has not yet completed.
 */
export async function isPromiseCompleted(prom) {
    try {
        const sym = Symbol("isPromiseCompleted");
        const result = await Promise.race([prom, Promise.resolve(sym)]);
        if (result === sym) {
            return false;
        }
        return true;
    }
    catch {
        return true;
    }
}
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
export function resolveWhenAny(...args) {
    // Construct rejection Error's before any async work
    // so that the Error callstacks will be useful
    const cancelReason = new Error("Cancelled");
    let cancel;
    const prom = new Promise((resolve, reject) => {
        let completed = false;
        const cancelAllExcept = (skip) => {
            for (const [i, arg] of args.entries()) {
                if (i !== skip && typeof arg?.cancel === "function") {
                    arg?.cancel();
                }
            }
        };
        cancel = () => {
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
    });
    prom.cancel = cancel;
    return prom;
}
//# sourceMappingURL=promise.js.map