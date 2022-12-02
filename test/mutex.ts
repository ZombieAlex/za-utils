import test from "ava";
import { Mutex } from "../src/index.js";

test("mutex functionality", async (t) => {
    const mutex = new Mutex();
    t.throws(
        () => {
            mutex.release();
        },
        undefined,
        "because the mutex has not been acquired yet",
    );
    t.true(await mutex.acquire(), "because the mutex is available");
    t.false(await mutex.acquire(10), "because the mutex is taken and we hit the timeout");
    t.notThrows(() => {
        mutex.release();
    }, "because this is a balanced release");

    t.true(await mutex.acquire());
    setTimeout(() => {
        mutex.release();
    }, 75);
    t.true(await mutex.acquire(), "because the mutex was asynchronously released and we re-acquired it");
});
