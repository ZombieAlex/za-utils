import test from "ava";
import { delay, ExpiringMap } from "../src/index.js";

test("is type compatible with Map<K, V>", (t) => {
    // This is to see if TypeScript believes the types are compatible
    const validator = (map: Map<number, string>) => map.size === 0;
    const emap = new ExpiringMap<number, string>();
    t.true(validator(emap));
});

test("set items with expiry and callbacks works", async (t) => {
    let callbackInvoked = false;
    const emap = new ExpiringMap<number, string>();
    t.is(emap.size, 0);
    t.false(emap.has(32));

    // eslint-disable-next-line no-return-assign
    emap.set(32, "blue sky", { expiryMs: 50, expiryCallback: () => (callbackInvoked = true) });
    t.is(emap.size, 1);
    t.true(emap.has(32));
    t.is(emap.get(32), "blue sky");
    t.false(callbackInvoked);

    await delay(70);
    t.is(emap.size, 0);
    t.false(emap.has(32));
    t.is(emap.get(32), undefined);
    t.true(callbackInvoked);
});

test("set items with expiry and no callback works", async (t) => {
    const emap = new ExpiringMap<number, string>();
    t.is(emap.size, 0);
    t.false(emap.has(32));
    t.is(emap.get(32), undefined);

    emap.set(32, "blue sky", { expiryMs: 50 });
    t.is(emap.size, 1);
    t.true(emap.has(32));
    t.is(emap.get(32), "blue sky");

    await delay(70);
    t.is(emap.size, 0);
    t.false(emap.has(32));
    t.is(emap.get(32), undefined);
});

test("set expiry callbacks can be async", async (t) => {
    let callbackInvoked = false;
    const emap = new ExpiringMap<number, string>();
    t.is(emap.size, 0);

    emap.set(32, "blue sky", {
        expiryMs: 50,
        async expiryCallback() {
            await delay(5);
            callbackInvoked = true;
        },
    });
    t.is(emap.size, 1);
    t.is(emap.get(32), "blue sky");
    t.false(callbackInvoked);

    await delay(80);
    t.is(emap.size, 0);
    t.is(emap.get(32), undefined);
    t.true(callbackInvoked);
});

test("delete removes items and stops callbacks", async (t) => {
    let callbackInvoked = false;
    const emap = new ExpiringMap<number, string>();
    t.is(emap.size, 0);

    // eslint-disable-next-line no-return-assign
    emap.set(32, "blue sky", { expiryMs: 50, expiryCallback: () => (callbackInvoked = true) });
    t.is(emap.size, 1);
    t.is(emap.get(32), "blue sky");
    t.false(callbackInvoked);

    await delay(5);

    emap.delete(32);
    t.is(emap.size, 0);
    t.is(emap.get(32), undefined);
    t.false(callbackInvoked);

    await delay(70);
    t.false(callbackInvoked);
});

test("clear removes items and stops callbacks", async (t) => {
    let callbackInvoked = false;
    const emap = new ExpiringMap<number, string>();
    t.is(emap.size, 0);

    // eslint-disable-next-line no-return-assign
    emap.set(32, "blue sky", { expiryMs: 50, expiryCallback: () => (callbackInvoked = true) });
    emap.set(99, "hi");
    t.is(emap.size, 2);
    t.is(emap.get(32), "blue sky");
    t.false(callbackInvoked);

    await delay(5);

    emap.clear();
    t.is(emap.size, 0);
    t.is(emap.get(32), undefined);
    t.false(callbackInvoked);

    await delay(70);
    t.false(callbackInvoked);
});

test("entries and iterator functionality", async (t) => {
    const emap = new ExpiringMap<number, string>();
    const contents: Array<[number, string]> = [
        [10, "ten"],
        [20, "twenty"],
        [30, "thirty"],
        [40, "fourty"],
        [50, "fifty"],
    ];

    for (const [key, value] of contents) {
        emap.set(key, value);
    }

    let counter = 0;
    for (const [key, value] of emap.entries()) {
        const expectedKey = contents[counter]![0]!;
        const expectedValue = contents[counter]![1]!;

        t.is(key, expectedKey);
        t.is(value, expectedValue);

        counter++;
    }

    counter = 0;
    for (const [key, value] of emap) {
        const expectedKey = contents[counter]![0]!;
        const expectedValue = contents[counter]![1]!;

        t.is(key, expectedKey);
        t.is(value, expectedValue);

        counter++;
    }

    counter = 0;
    // eslint-disable-next-line unicorn/no-array-for-each
    await emap.forEach((value, key) => {
        const expectedKey = contents[counter]![0]!;
        const expectedValue = contents[counter]![1]!;

        t.is(key, expectedKey);
        t.is(value, expectedValue);

        counter++;
    });

    counter = 0;
    for (const value of emap.values()) {
        const expectedValue = contents[counter]![1]!;
        t.is(value, expectedValue);
        counter++;
    }
});

test("setExpiry updates expiry without changing the value", async (t) => {
    const emap = new ExpiringMap<number, string>();
    t.false(emap.setExpiry(10, 300));

    const insertionTime = Date.now();
    emap.set(10, "ten");
    t.true(emap.has(10));
    t.assert(undefined === emap.getExpiry(10));

    t.true(emap.setExpiry(10, 20));
    const expiry = emap.getExpiry(10);
    t.assert(typeof expiry === "number" && expiry > insertionTime + 10 && expiry < insertionTime + 50);
    t.is(emap.get(10), "ten");
    await delay(30);
    t.false(emap.has(10));
});

test("toString", (t) => {
    const emap = new ExpiringMap();
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    t.is(emap.toString(), "[object ExpiringMap]");
});

test("setMinExpiry", (t) => {
    const emap = new ExpiringMap<number, number>();

    t.false(emap.setMinimumExpiry(32, 50), "because the key is not in the map");

    emap.set(32, 99);
    t.false(emap.setMinimumExpiry(32, 50), "because the key has no existing expiry");

    const expiry = 500;
    const earliestExpiry = Date.now() + expiry;
    emap.setExpiry(32, expiry);
    const latestExpiry = Date.now() + expiry;
    const currentExpiry = emap.getExpiry(32)!;
    t.assert(earliestExpiry <= currentExpiry && currentExpiry <= latestExpiry);

    emap.setMinimumExpiry(32, 100);
    t.is(emap.getExpiry(32)!, currentExpiry, "because the pre-existing expiry was already after the minimum");

    emap.setMinimumExpiry(32, 700);
    t.assert(emap.getExpiry(32)! > currentExpiry, "because the pre-existing expiry was earlier than the minimum");
});

test("expireAll", async (t) => {
    let callbackInvoked = false;
    const emap = new ExpiringMap<number, number>();
    emap.set(1, 1);
    emap.set(2, 90, { expiryMs: 900 });
    // eslint-disable-next-line no-return-assign
    emap.set(4, 32, { expiryMs: 7000, expiryCallback: () => (callbackInvoked = true) });
    t.is(emap.size, 3);

    await emap.expireAll();
    t.is(emap.size, 0);
    t.true(callbackInvoked);
});

test("expire", async (t) => {
    let callbackInvoked = false;
    const emap = new ExpiringMap<number, number>();
    emap.set(1, 1);
    emap.set(2, 90, { expiryMs: 900 });
    // eslint-disable-next-line no-return-assign
    emap.set(4, 32, { expiryMs: 7000, expiryCallback: () => (callbackInvoked = true) });
    t.is(emap.size, 3);

    t.true(await emap.expire(2));
    t.is(emap.size, 2);
    t.true(await emap.expire(1));
    t.is(emap.size, 1);
    t.true(await emap.expire(4));
    t.is(emap.size, 0);
    t.true(callbackInvoked);

    t.false(await emap.expire(678));
});

test("clearExpiry", (t) => {
    const expiry = 2000;
    const emap = new ExpiringMap<number, number>({ defaultExpiryMs: expiry });
    const minimumExpiryTime = Date.now() + expiry;
    emap.set(7, 99);
    t.assert(emap.getExpiry(7)! >= minimumExpiryTime);
    t.true(emap.clearExpiry(7));
    t.is(emap.getExpiry(7), undefined);
    t.false(emap.clearExpiry(79));
});
