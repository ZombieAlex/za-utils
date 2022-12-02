import { EventEmitter } from "node:events";
import test from "ava";
import { delay, isPromiseCompleted, rejectWhen, resolveWhen } from "../src/index.js";

test("resolveWhen resolves when the tracked event is emitted", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    t.is(emitter.listenerCount(event), 0);

    const prom = resolveWhen(emitter, event);
    t.is(emitter.listenerCount(event), 1);
    t.false(await isPromiseCompleted(prom), "because the promise shouldn't resolve until the event is emitted");

    emitter.emit(event, "arg1", "arg2", "arg3");
    t.true(await isPromiseCompleted(prom), "because the event has been emitted");
    t.is(emitter.listenerCount(event), 0, "because the listener is removed when resolving");

    const result = await prom;
    t.true(Array.isArray(result), "because the promise resolved with an array of all the matching emit parameters");
    t.is(result[0], "arg1");
    t.is(result[1], "arg2");
    t.is(result[2], "arg3");
});

test("resolveWhen handles arrays of matching event names", async (t) => {
    const event1 = "signal";
    const event2 = "otherSignal";
    const emitter = new EventEmitter();
    t.is(emitter.listenerCount(event1), 0);
    t.is(emitter.listenerCount(event2), 0);

    const prom = resolveWhen(emitter, [event1, event2]);
    t.is(emitter.listenerCount(event1), 1);
    t.is(emitter.listenerCount(event2), 1);
    t.false(await isPromiseCompleted(prom));

    emitter.emit(event2, 42);
    t.true(await isPromiseCompleted(prom));
    t.is(emitter.listenerCount(event1), 0);
    t.is(emitter.listenerCount(event2), 0);

    const result = await prom;
    t.is(result[0], 42);
});

test("resolveWhen conditional filter is honored", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = resolveWhen(emitter, event, { condition: (a: number) => a > 20 });
    emitter.emit(event, 10);
    t.false(await isPromiseCompleted(prom), "because the condition was not met");
    emitter.emit(event, 30);
    t.true(await isPromiseCompleted(prom), "because the condition was met");
});

test("resolveWhen prepend is honored", async (t) => {
    const event = "signal";
    const callback = () => false;
    const emitter = new EventEmitter();
    emitter.on(event, callback);
    t.assert(emitter.listenerCount(event) === 1);
    t.assert(emitter.listeners(event)[0] === callback);
    const prom = resolveWhen(emitter, event, { prepend: true });
    t.assert(emitter.listenerCount(event) === 2);
    t.assert(emitter.listeners(event)[0] !== callback);
    t.assert(emitter.listeners(event)[1] === callback);

    emitter.emit(event);
    await prom;
});

test("resolveWhen promise can be cancelled", async (t) => {
    const emitter = new EventEmitter();
    const prom = resolveWhen(emitter, "never");
    t.false(await isPromiseCompleted(prom));
    prom.cancel();
    t.true(await isPromiseCompleted(prom));
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Cancelled");
        t.assert(emitter.listenerCount("never") === 0);
    }
});

test("resolveWhen promise can timeout", async (t) => {
    const emitter = new EventEmitter();
    const prom = resolveWhen(emitter, "never", { timeoutMs: 50 });
    t.false(await isPromiseCompleted(prom));
    await delay(60);
    t.true(await isPromiseCompleted(prom));
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Timeout");
        t.assert(emitter.listenerCount("never") === 0);
    }
});

test("rejectWhen rejects when the event is emitted", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, event);
    t.false(await isPromiseCompleted(prom));
    emitter.emit(event);
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error === undefined);
    }
});

test("rejectWhen rejects with rejectMessage when specified", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, event, { rejectMessage: "Custom Reject Message" });
    t.false(await isPromiseCompleted(prom));
    emitter.emit(event, new Error("Emitted Error Message"));
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Custom Reject Message");
    }
});

test("rejectWhen rejects with an emitted Error", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, event);
    t.false(await isPromiseCompleted(prom));
    emitter.emit(event, new Error("Emitted Error Message"));
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Emitted Error Message");
    }
});

test("rejectWhen rejects with an emitted string", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, event);
    t.false(await isPromiseCompleted(prom));
    emitter.emit(event, undefined, null, "Emitted Error Message");
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Emitted Error Message");
    }
});

test("rejectWhen rejects with an emitted embedded string", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, event);
    t.false(await isPromiseCompleted(prom));
    emitter.emit(event, { error: "Emitted Error Message" });
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Emitted Error Message");
    }
});

test("rejectWhen rejects with an emitted embedded Error", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, event);
    t.false(await isPromiseCompleted(prom));
    emitter.emit(event, { error: new Error("Emitted Error Message") });
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Emitted Error Message");
    }
});

test("rejectWhen rejects with an argument array when no error is found", async (t) => {
    const event = "signal";
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, event);
    t.false(await isPromiseCompleted(prom));
    emitter.emit(event, 1, 2, 3, 4);
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(Array.isArray(error) && error[0] === 1 && error[1] === 2 && error[2] === 3 && error[3] === 4);
    }
});

test("rejectwhen can be cancelled", async (t) => {
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, "never");
    t.false(await isPromiseCompleted(prom));
    prom.cancel();
    // At present, it's necessary to yield execution to
    // other tasks in order for the cancel completion
    // to propagate in this scenario.
    await delay(10);
    t.true(await isPromiseCompleted(prom));
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Cancelled");
    }
});

test("rejectwhen can timeout", async (t) => {
    const emitter = new EventEmitter();
    const prom = rejectWhen(emitter, "never", { timeoutMs: 50 });
    t.false(await isPromiseCompleted(prom));
    await delay(60);
    t.true(await isPromiseCompleted(prom));
    try {
        await prom;
        t.fail("Should have thrown");
    } catch (error: unknown) {
        t.assert(error instanceof Error && error.message === "Timeout");
    }
});
