import test from "ava";
import { delay, delayUntil, isPromiseCompleted, toSync } from "../src/index.js";

test("delay does not block and waits for the given time", async (t) => {
    const delayTime = 500;
    const expectedCompletionTime = Date.now() + delayTime;
    const delayProm = delay(delayTime);
    t.assert(delayProm instanceof Promise);
    const prom = new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 50);
    });
    await prom;
    t.assert(Date.now() < expectedCompletionTime && !(await isPromiseCompleted(delayProm)));
    await delayProm;
    t.assert(Date.now() >= expectedCompletionTime);
});

test("delayUntil waits for the signal", async (t) => {
    let signal = false;
    const untilProm = delayUntil(async () => signal);
    t.assert(untilProm instanceof Promise);
    await delay(30);
    t.assert(!(await isPromiseCompleted(untilProm)));
    const latestExpectedCompletionTime = Date.now() + 300;
    signal = true;
    await untilProm;
    t.assert(Date.now() <= latestExpectedCompletionTime);
});

test("delayUntil timeoutMs works", async (t) => {
    const signal = false;
    await t.throwsAsync(delayUntil(async () => signal, { timeoutMs: 10 }));
});

test("delayUntil swallowExceptions true swallows exceptions", async (t) => {
    let didThrow = false;
    let signal = false;
    setTimeout(() => {
        signal = true;
    }, 100);

    await t.notThrowsAsync(
        delayUntil(
            async () => {
                if (!signal) {
                    didThrow = true;
                    throw new Error("Swallowed");
                }

                return true;
            },
            { swallowExceptions: true },
        ),
    );
    t.true(didThrow);
});

test("delayUntil swallowExceptions false does not swallow exceptions", async (t) => {
    let didThrow = false;
    let signal = false;
    setTimeout(() => {
        signal = true;
    }, 100);

    await t.throwsAsync(
        delayUntil(
            async () => {
                if (!signal) {
                    didThrow = true;
                    throw new Error("Propagated");
                }

                return true;
            },
            { swallowExceptions: false },
        ),
    );
    t.true(didThrow);
});

test("toSync swallows exceptions by default", async (t) => {
    let done = false;
    const syncFunc = toSync(async () => {
        await delay(10);
        done = true;
        throw new Error("Swallowed");
    });
    t.notThrows(syncFunc);
    await delayUntil(async () => done);
});

test("toSync invokes a given errorCallback", async (t) => {
    let done = false;
    let callBackInvoked = false;
    const callback = () => {
        callBackInvoked = true;
    };

    const syncFunc = toSync(async () => {
        await delay(10);
        done = true;
        throw new Error("Swallowed");
    }, callback);

    t.notThrows(syncFunc);
    await delayUntil(async () => done);
    t.true(callBackInvoked);
});

test("toSync typings work", (t) => {
    const testFunc = (f: (a: string, b: number) => void) => {
        f("blue", 9);
    };

    const asyncFunc = async (_a: string, _b: number) => {
        await delay(10);
    };

    const syncFunc = toSync(asyncFunc);
    testFunc(syncFunc);
    t.pass();
});
