import { type CancellablePromise } from "./promise.js";
import { hasShapeOf } from "./type-guards.js";

// @TODO - Typed variants based on RefinedEventEmitter

export type EmitterWhenOptions = {
    condition?: (...args: any[]) => boolean;
    timeoutMs?: number;
    prepend?: boolean;
    rejectMessage?: string;
};

/**
 * Returns a promise that resolves when an event matching
 * the given name and condition filter is received on the
 * given EventEmitter. It resolves with all the parameters
 * given to the EventListener callback that matched.
 *
 * After resolving, no additional callbacks remain on the
 * EventEmitter.
 *
 * The returned promise will also have a cancel function,
 * which will cause the promise to immediately remove all
 * EventEmitter listeners and reject.
 */
export function resolveWhen(
    emitter: NodeJS.EventEmitter,
    events: string | symbol | Array<string | symbol>,
    { condition = undefined, timeoutMs = Number.NaN, prepend = false }: EmitterWhenOptions = {},
): CancellablePromise<unknown[]> {
    // Construct rejection Error's before any async work
    // so that the Error callstacks will be useful
    const cancelReason = new Error("Cancelled");
    const timeoutReason = new Error("Timeout");
    let cancel: undefined | ((dontReject?: boolean) => void);
    const prom = new Promise<unknown[]>((resolve, reject) => {
        if (!Array.isArray(events)) {
            events = [events];
        }

        let completed = false;
        const eventNames: Array<string | symbol> = events;
        let timer: NodeJS.Timer;

        // This can't be a constant because we need to
        // refer to it in a closure before we've assigned it.
        // eslint-disable-next-line prefer-const
        let callback: (...args: unknown[]) => void;

        cancel = (dontReject?: boolean): void => {
            // Cancelling after we've already resolved
            // or rejected should be a no-op
            if (!completed) {
                if (typeof timeoutMs === "number" && timeoutMs > 0) {
                    clearTimeout(timer);
                }

                for (const name of eventNames) {
                    emitter.removeListener(name, callback);
                }

                completed = true;
                if (!dontReject) {
                    reject(cancelReason);
                }
            }
        };

        callback = (...args: unknown[]): void => {
            if (typeof condition !== "function" || condition(...args)) {
                (cancel as (dontReject?: boolean) => void)(true);
                resolve(args);
            }
        };

        if (typeof timeoutMs === "number" && timeoutMs > 0) {
            timer = setTimeout(() => {
                (cancel as (dontReject?: boolean) => void)(true);
                reject(timeoutReason);
            }, timeoutMs);
        }

        for (const name of eventNames) {
            // Puppeteer's fake EventEmitter class doesn't implement prependListener
            if (prepend && typeof emitter.prependListener === "function") {
                emitter.prependListener(name, callback);
            } else {
                emitter.addListener(name, callback);
            }
        }
    }) as CancellablePromise<unknown[]>;

    prom.cancel = cancel as unknown as () => void;
    return prom;
}

/**
 * Creates a promise that rejects, rather than resolves, when the given emitter
 * emits an event with the matching conditions. The returned promise will never
 * resolve, but it is cancellable.
 *
 * If rejectMessage is defined, when rejecting the promise will reject with an
 * Error object with the given message. Otherwise rejectWhen attempts to
 * construct an appropriate error from the resolve arguments of the matching
 * event.
 */
export function rejectWhen(
    emitter: NodeJS.EventEmitter,
    events: string | symbol | Array<string | symbol>,
    {
        condition = undefined,
        timeoutMs = Number.NaN,
        prepend = false,
        rejectMessage = undefined,
    }: EmitterWhenOptions = {},
): CancellablePromise<void> {
    const innerProm = resolveWhen(emitter, events, { condition, timeoutMs, prepend });
    const prom = new Promise<void>((_resolve, reject) => {
        innerProm
            .then((result) => {
                if (typeof rejectMessage === "string") {
                    reject(new Error(rejectMessage));
                } else if (!Array.isArray(result) || result.length === 0) {
                    reject();
                } else {
                    // Try to find the error if there was one
                    for (const arg of result) {
                        if (arg === undefined || arg === null) {
                            continue;
                        }

                        if (arg instanceof Error) {
                            reject(arg);
                            return;
                        }

                        if (hasShapeOf<{ error: Error }>(arg, { objects: ["error"] }) && arg.error instanceof Error) {
                            reject(arg.error);
                            return;
                        }

                        if (hasShapeOf<{ error: string }>(arg, { strings: ["error"] })) {
                            reject(new Error(arg.error));
                            return;
                        }

                        if (typeof arg === "string") {
                            reject(new Error(arg));
                            return;
                        }
                    }

                    reject(result);
                }
            })
            .catch((error) => {
                reject(error);
            });
    }) as CancellablePromise<void>;

    prom.cancel = innerProm.cancel;
    return prom;
}
