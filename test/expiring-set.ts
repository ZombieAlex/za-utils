import test from "ava";
import { delay, ExpiringSet } from "../src/index.js";

test("is type compatible with Set<T>", (t) => {
    // This is to see if TypeScript believes the types are compatible
    const validator = (set: Set<number>) => set.size === 0;
    const eset = new ExpiringSet<number>();
    t.true(validator(eset));
});

test("set items with expiry and callbacks works", async (t) => {
    let callbackInvoked = false;
    const eset = new ExpiringSet<number>();
    t.is(eset.size, 0);
    t.false(eset.has(32));

    // eslint-disable-next-line no-return-assign
    eset.add(32, { expiryMs: 50, expiryCallback: () => (callbackInvoked = true) });
    t.is(eset.size, 1);
    t.true(eset.has(32));
    t.false(callbackInvoked);

    await delay(70);
    t.is(eset.size, 0);
    t.false(eset.has(32));
    t.true(callbackInvoked);
});

test("set items with expiry and no callback works", async (t) => {
    const eset = new ExpiringSet<number>();
    t.is(eset.size, 0);
    t.false(eset.has(32));

    eset.add(32, { expiryMs: 50 });
    t.is(eset.size, 1);
    t.true(eset.has(32));

    await delay(70);
    t.is(eset.size, 0);
    t.false(eset.has(32));
});

test("set expiry callbacks can be async", async (t) => {
    let callbackInvoked = false;
    const eset = new ExpiringSet<number>();
    t.is(eset.size, 0);

    eset.add(32, {
        expiryMs: 50,
        async expiryCallback() {
            await delay(5);
            callbackInvoked = true;
        },
    });
    t.is(eset.size, 1);
    t.false(callbackInvoked);

    await delay(100);
    t.is(eset.size, 0);
    t.true(callbackInvoked);
});

test("delete removes items and stops callbacks", async (t) => {
    let callbackInvoked = false;
    const eset = new ExpiringSet<number>();
    t.is(eset.size, 0);

    // eslint-disable-next-line no-return-assign
    eset.add(32, { expiryMs: 50, expiryCallback: () => (callbackInvoked = true) });
    t.is(eset.size, 1);
    t.false(callbackInvoked);

    await delay(5);

    eset.delete(32);
    t.is(eset.size, 0);
    t.false(callbackInvoked);

    await delay(70);
    t.false(callbackInvoked);
});

test("clear removes items and stops callbacks", async (t) => {
    let callbackInvoked = false;
    const eset = new ExpiringSet<number>();
    t.is(eset.size, 0);

    // eslint-disable-next-line no-return-assign
    eset.add(32, { expiryMs: 50, expiryCallback: () => (callbackInvoked = true) });
    eset.add(99);
    t.is(eset.size, 2);
    t.false(callbackInvoked);

    await delay(5);

    eset.clear();
    t.is(eset.size, 0);
    t.false(callbackInvoked);

    await delay(70);
    t.false(callbackInvoked);
});

test("entries and iterator functionality", async (t) => {
    const eset = new ExpiringSet<number>();
    const contents = [10, 20, 30, 40, 50];

    for (const key of contents) {
        eset.add(key);
    }

    let counter = 0;
    for (const [key, value] of eset.entries()) {
        t.is(key, value);
        const expectedKey = contents[counter]!;
        t.is(key, expectedKey);
        counter++;
    }

    counter = 0;
    for (const key of eset) {
        const expectedKey = contents[counter]!;
        t.is(key, expectedKey);
        counter++;
    }

    counter = 0;
    // eslint-disable-next-line unicorn/no-array-for-each
    await eset.forEach((value, key) => {
        t.is(key, value);
        const expectedKey = contents[counter]!;
        t.is(key, expectedKey);
        counter++;
    });

    counter = 0;
    for (const value of eset.values()) {
        const expectedValue = contents[counter]!;
        t.is(value, expectedValue);
        counter++;
    }

    counter = 0;
    for (const value of eset.keys()) {
        const expectedValue = contents[counter]!;
        t.is(value, expectedValue);
        counter++;
    }
});

test("setExpiry returns false for non-existing keys", (t) => {
    const eset = new ExpiringSet<number>();
    t.false(eset.setExpiry(10, 300));
});

test("toString", (t) => {
    const eset = new ExpiringSet();
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    t.is(eset.toString(), "[object ExpiringSet]");
});

test("setMinExpiry", (t) => {
    const eset = new ExpiringSet<number>();

    t.false(eset.setMinimumExpiry(32, 50), "because the key is not in the map");

    eset.add(32);
    t.false(eset.setMinimumExpiry(32, 50), "because the key has no existing expiry");

    const expiry = 500;
    const earliestExpiry = Date.now() + expiry;
    eset.setExpiry(32, expiry);
    const latestExpiry = Date.now() + expiry;
    const currentExpiry = eset.getExpiry(32)!;
    t.assert(earliestExpiry <= currentExpiry && currentExpiry <= latestExpiry);

    eset.setMinimumExpiry(32, 100);
    t.is(eset.getExpiry(32)!, currentExpiry, "because the pre-existing expiry was already after the minimum");

    eset.setMinimumExpiry(32, 700);
    t.assert(eset.getExpiry(32)! > currentExpiry, "because the pre-existing expiry was earlier than the minimum");
});

test("expireAll", async (t) => {
    let callbackInvoked = false;
    const eset = new ExpiringSet<number>();
    eset.add(1);
    eset.add(2, { expiryMs: 900 });
    // eslint-disable-next-line no-return-assign
    eset.add(4, { expiryMs: 7000, expiryCallback: () => (callbackInvoked = true) });
    t.is(eset.size, 3);

    await eset.expireAll();
    t.is(eset.size, 0);
    t.true(callbackInvoked);
});

test("expire", async (t) => {
    let callbackInvoked = false;
    const eset = new ExpiringSet<number>();
    eset.add(1);
    eset.add(2, { expiryMs: 900 });
    // eslint-disable-next-line no-return-assign
    eset.add(4, { expiryMs: 7000, expiryCallback: () => (callbackInvoked = true) });
    t.is(eset.size, 3);

    t.true(await eset.expire(2));
    t.is(eset.size, 2);
    t.true(await eset.expire(1));
    t.is(eset.size, 1);
    t.true(await eset.expire(4));
    t.is(eset.size, 0);
    t.true(callbackInvoked);

    t.false(await eset.expire(678));
});

test("clearExpiry", (t) => {
    const expiry = 2000;
    const eset = new ExpiringSet<number>({ defaultExpiryMs: expiry });
    const minimumExpiryTime = Date.now() + expiry;
    eset.add(7);
    t.assert(eset.getExpiry(7)! >= minimumExpiryTime);
    t.true(eset.clearExpiry(7));
    t.is(eset.getExpiry(7), undefined);
    t.false(eset.clearExpiry(79));
});
