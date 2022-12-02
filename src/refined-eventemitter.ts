import { EventEmitter } from "node:events";
import { type Constructor } from "./typescript.js";

/** EventEmitter with narrowed types for better intellisense and compiler checks */
// Eslint is incorrectly complaining that `this` return types on an `export type` are invalid.
// Rather than disabling that warning on each line below. It's easier to silence it by using
// `export interface` and disabling the warning for it not being `export type`.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface RefinedEventEmitter<
    EventNames extends string | symbol,
    Arg0 = void,
    Arg1 = void,
    Arg2 = void,
    Arg3 = void,
> {
    addListener(event: EventNames, listener: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void): this;
    on(event: EventNames, listener: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void): this;
    once(event: EventNames, listener: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void): this;
    removeListener(event: EventNames, listener: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void): this;
    off(event: EventNames, listener: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void): this;
    removeAllListeners(event?: EventNames): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: EventNames): (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void[];
    rawListeners(event: EventNames): (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void[];
    emit(event: EventNames, a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3): boolean;
    listenerCount(type: EventNames): number;
    prependListener(event: EventNames, listener: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void): this;
    prependOnceListener(event: EventNames, listener: (a0: Arg0, a1: Arg1, a2: Arg2, a3: Arg3) => void): this;
    eventNames(): EventNames[];
}

/**
 * EventEmitter with narrowed types for better intellisense and compiler checks
 * @example
 * const FullyTypedEmitter = createRefinedEventEmitterType<"event1" | "event2", string, string>();
 * const ce = new FullyTypedEmitter();
 *
 * // Valid
 * ce.emit("event1", "hello", "world");
 *
 * // Error: Invalid event name, event3
 * ce.emit("event3", "hello", "world");
 *
 * // Error: 32 is not a string
 * ce.emit("event2", "hello", 32);
 *
 * // Error: not enough arguments
 * ce.emit("event1", "bye");
 * @returns
 */
export function createRefinedEventEmitterType<
    EventNames extends string | symbol,
    Arg0 = void,
    Arg1 = void,
    Arg2 = void,
    Arg3 = void,
>(): Constructor<RefinedEventEmitter<EventNames, Arg0, Arg1, Arg2, Arg3>> {
    return EventEmitter as unknown as Constructor<RefinedEventEmitter<EventNames, Arg0, Arg1, Arg2, Arg3>>;
}
