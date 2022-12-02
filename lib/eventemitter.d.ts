/// <reference types="node" resolution-mode="require"/>
import { type CancellablePromise } from "./promise.js";
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
export declare function resolveWhen(emitter: NodeJS.EventEmitter, events: string | symbol | Array<string | symbol>, { condition, timeoutMs, prepend }?: EmitterWhenOptions): CancellablePromise<unknown[]>;
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
export declare function rejectWhen(emitter: NodeJS.EventEmitter, events: string | symbol | Array<string | symbol>, { condition, timeoutMs, prepend, rejectMessage, }?: EmitterWhenOptions): CancellablePromise<void>;
