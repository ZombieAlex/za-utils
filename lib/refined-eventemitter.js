import { EventEmitter } from "node:events";
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
export function createRefinedEventEmitterType() {
    return EventEmitter;
}
//# sourceMappingURL=refined-eventemitter.js.map