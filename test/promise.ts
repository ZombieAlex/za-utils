import { EventEmitter } from "node:events";
import test from "ava";
import { isPromiseCompleted, resolveWhenAny, resolveWhen, rejectWhen } from "../src/index.js";

test("isPromiseCompleted returns false for non-completed promises", async (t) => {
    const prom = new Promise<void>(() => {
        /* Do nothing */
    });
    t.false(await isPromiseCompleted(prom));
});

test("isPromiseCompleted returns true for completed promises", async (t) => {
    const prom = Promise.resolve(42);
    t.true(await isPromiseCompleted(prom));
});

test("isPromiseCompleted returns true for rejected promises", async (t) => {
    const prom = Promise.reject(new Error("Denied!"));
    t.true(await isPromiseCompleted(prom));
});

test("resolveWhenAny handles normal EventEmitter and resolveWhen based resolution", async (t) => {
    const emitter = new EventEmitter();
    const prom1 = resolveWhen(emitter, "event1");
    const prom2 = resolveWhen(emitter, "event2");
    t.is(emitter.listenerCount("event1"), 1);
    t.is(emitter.listenerCount("event2"), 1);

    const combined = resolveWhenAny(prom1, prom2);
    setTimeout(() => {
        emitter.emit("event2", 99);
    }, 30);
    t.is(await combined, 1, "because the second event fired, not the first");
    t.deepEqual(await prom2, [99], "because the emit arguments were 99");
    await t.throwsAsync(async () => prom1, undefined, "because the first listener was cancelled");
    t.is(emitter.listenerCount("event1"), 0, "because all listeners are removed after resolution");
    t.is(emitter.listenerCount("event2"), 0, "because all listeners are removed after resolution");
});

test("resolveWhenAny handles rejectWhen based resolution", async (t) => {
    const emitter = new EventEmitter();
    const prom1 = resolveWhen(emitter, "event1");
    const prom2 = rejectWhen(emitter, "event2");
    t.is(emitter.listenerCount("event1"), 1);
    t.is(emitter.listenerCount("event2"), 1);

    const combined = resolveWhenAny(prom1, prom2);
    setTimeout(() => {
        emitter.emit("event2", "error message");
    }, 30);
    await t.throwsAsync(async () => combined, undefined, "because the combined promise rejected");
    await t.throwsAsync(async () => prom2, undefined, "because the promise was rejected");
    await t.throwsAsync(async () => prom1, undefined, "because the first listener was cancelled");
    t.is(emitter.listenerCount("event1"), 0, "because all listeners are removed after resolution");
    t.is(emitter.listenerCount("event2"), 0, "because all listeners are removed after resolution");
});

test("resolveWhenAny cancel cancels all pending promises", async (t) => {
    const emitter = new EventEmitter();
    const prom1 = resolveWhen(emitter, "event1");
    const prom2 = resolveWhen(emitter, "event2");
    t.is(emitter.listenerCount("event1"), 1);
    t.is(emitter.listenerCount("event2"), 1);

    const combined = resolveWhenAny(prom1, prom2);
    combined.cancel();

    await t.throwsAsync(async () => combined, undefined, "because the combined promise was cancelled");
    await t.throwsAsync(async () => prom1, undefined, "because the first listener was cancelled");
    await t.throwsAsync(async () => prom2, undefined, "because the second listener was cancelled");
    t.is(emitter.listenerCount("event1"), 0, "because all listeners are removed after resolution");
    t.is(emitter.listenerCount("event2"), 0, "because all listeners are removed after resolution");
});
