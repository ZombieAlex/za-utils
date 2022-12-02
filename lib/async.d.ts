/**
 * Returns a promise that resolves after ms milliseconds
 * @param ms
 * @returns
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Returns a promise that resolves when the given condition function returns true
 * @param condition
 * @param param1
 * @returns
 */
export declare function delayUntil(condition: () => Promise<boolean>, { timeoutMs, checkIntervalMs, swallowExceptions }?: {
    timeoutMs?: number | undefined;
    checkIntervalMs?: number | undefined;
    swallowExceptions?: boolean | undefined;
}): Promise<void>;
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
export declare function toSync<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void>(asyncFunc: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => Promise<void>, errorCallback?: (error: unknown) => void): (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void;
