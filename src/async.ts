/**
 * Returns a promise that resolves after ms milliseconds
 * @param ms
 * @returns
 */
export async function delay(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

/**
 * Returns a promise that resolves when the given condition function returns true
 * @param condition
 * @param param1
 * @returns
 */
export async function delayUntil(
    condition: () => Promise<boolean>,
    { timeoutMs = Number.POSITIVE_INFINITY, checkIntervalMs = 200, swallowExceptions = false } = {},
) {
    const timeoutTime = Date.now() + timeoutMs;

    do {
        try {
            // eslint-disable-next-line no-await-in-loop
            if (await condition()) return;
        } catch (error: unknown) {
            if (!swallowExceptions) {
                throw error;
            }
        }

        // eslint-disable-next-line no-await-in-loop
        await delay(checkIntervalMs);
    } while (Date.now() <= timeoutTime);

    throw new Error("timeout");
}

/**
 * Takes an async function and returns a synchronous function that calls the
 * async function and catches any promise rejection, optionally invoking a
 * given callback on rejection.
 *
 * This is useful for wrapping async functions that are passed as callbacks
 * on events to prevent unhandled promise rejection errors.
 * @param asyncFunc
 * @param errorCallback
 * @returns
 */
export function toSync<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void>(
    asyncFunc: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => Promise<void>,
    errorCallback?: (error: unknown) => void,
): (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void {
    return (...args) => {
        asyncFunc(...args).catch((error) => {
            if (typeof errorCallback === "function") {
                errorCallback(error);
            }
        });
    };
}
