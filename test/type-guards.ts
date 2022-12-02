import test from "ava";
import {
    assertShape,
    hasShapeOf,
    assertShapeOf,
    jsonParse,
    isNumber,
    isString,
    isArray,
    isFunction,
} from "../src/index.js";

test("assertShape validates strings", (t) => {
    t.throws(() => {
        assertShape({}, { strings: ["blue", "red"] });
    });
    t.throws(() => {
        assertShape({ blue: 99, red: "str" }, { strings: ["blue", "red"] });
    });
    t.notThrows(() => {
        assertShape({ blue: "99", red: "str" }, { strings: ["blue", "red"] });
    });
});

test("assertShape validates numbers", (t) => {
    t.throws(() => {
        assertShape({}, { numbers: ["blue", "red"] });
    });
    t.throws(() => {
        assertShape({ blue: 99, red: "str" }, { numbers: ["blue", "red"] });
    });
    t.notThrows(() => {
        assertShape({ blue: 99, red: 12 }, { numbers: ["blue", "red"] });
    });
});

test("assertShape validates booleans", (t) => {
    t.throws(() => {
        assertShape({}, { booleans: ["blue", "red"] });
    });
    t.throws(() => {
        assertShape({ blue: true, red: "str" }, { booleans: ["blue", "red"] });
    });
    t.notThrows(() => {
        assertShape({ blue: true, red: false }, { booleans: ["blue", "red"] });
    });
});

test("assertShape validates arrays", (t) => {
    t.throws(() => {
        assertShape({}, { arrays: ["blue", "red"] });
    });
    t.throws(() => {
        assertShape({ blue: [], red: "str" }, { arrays: ["blue", "red"] });
    });
    t.notThrows(() => {
        assertShape({ blue: [], red: [32, 9] }, { arrays: ["blue", "red"] });
    });
});

test("assertShape validates objects", (t) => {
    t.throws(() => {
        assertShape({}, { objects: ["blue", "red"] });
    });
    t.throws(() => {
        assertShape({ blue: {}, red: "str" }, { objects: ["blue", "red"] });
    });
    t.notThrows(() => {
        assertShape({ blue: {}, red: { x: 32 } }, { objects: ["blue", "red"] });
    });
});

test("assertShape validates functions", (t) => {
    t.throws(() => {
        assertShape({}, { functions: ["blue", "red"] });
    });
    t.throws(() => {
        assertShape({ blue: {}, red: () => false }, { functions: ["blue", "red"] });
    });
    t.notThrows(() => {
        assertShape({ blue: () => 32, red: () => false }, { functions: ["blue", "red"] });
    });
});

test("assertShape validates lodash paths", (t) => {
    const example = { one: 1, arr: [32, "string", [99]], nested: { two: 99, arr: ["blue", 12] } };
    t.throws(() => {
        assertShape(example, { strings: ["arr[2][0]"] });
    });
    t.notThrows(() => {
        assertShape(example, { strings: ["arr[1]"], numbers: ["arr[2][0]", "nested.two", "nested.arr[1]"] });
    });
});

test("assertShape throws for non-objects", (t) => {
    t.throws(() => {
        assertShape("hi", {});
    });
});

test("assertShape strict mode throws for extra properties", (t) => {
    t.throws(() => {
        assertShape({ blue: "cheese", red: 97 }, { strings: ["blue"], strict: true });
    });
    t.notThrows(() => {
        assertShape({ blue: "cheese", red: 97 }, { strings: ["blue"], numbers: ["red"], strict: true });
    });
});

test("assertShape optional properties work", (t) => {
    const object = { blue: "sky" };
    t.throws(() => {
        assertShape(object, { strings: ["blue", "red"] });
    });
    t.notThrows(() => {
        assertShape(object, { strings: ["blue", "red"], optionals: ["red"] });
    });
    t.throws(() => {
        assertShape(object, { numbers: ["blue"], optionals: ["blue"] });
    });
});

test("hasShapeOf works", (t) => {
    t.true(hasShapeOf<{ a: string; b: number }>({ a: "hi", b: 99 }, { strings: ["a"], numbers: ["b"] }));
    t.false(hasShapeOf<{ a: string; b: number }>({ a: "hi", b: 99 }, { strings: ["a", "b"] }));
});

test("assertShapeOf works", (t) => {
    const func = (object: { a: string }) => typeof object === "object";
    const object = { a: 32 };
    // Assert something that's blatantly false and would otherwise cause a TS error
    assertShapeOf<{ a: string }>(object, { numbers: ["a"] });
    t.true(func(object));
});

test("jsonParse works", (t) => {
    const func = (object: { a: number }) => typeof object === "object";
    const object = { a: 32 };
    const parsedObject = jsonParse<{ a: number }>(JSON.stringify(object), { numbers: ["a"] });
    t.true(func(parsedObject));
});

test("isNumber works", (t) => {
    t.false(isNumber("nope"));
    t.true(isNumber(32));
    t.true(isNumber(Number.NaN));
    t.true(isNumber(Number.POSITIVE_INFINITY));
});

test("isString works", (t) => {
    t.false(isString(32));
    t.true(isString("yep"));
});

test("isArray works", (t) => {
    t.false(isArray(32));
    t.true(isArray([]));
});

test("isFunction works", (t) => {
    t.false(isFunction(32));
    t.true(isFunction(() => true));
});
