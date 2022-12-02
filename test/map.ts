import test from "ava";
import { setdefault, setdefault2 } from "../src/index.js";

test("setdefault", (t) => {
    const map = new Map<number, number>();
    t.false(map.has(0));
    t.is(
        setdefault(map, 0, () => 97),
        97,
    );
    t.is(map.get(0), 97);

    map.set(1, 79);
    t.is(
        setdefault(map, 1, () => 7000),
        79,
    );
});

test("setdefault2", (t) => {
    const map = new Map<number, Map<number, number>>();
    t.false(map.has(0));
    t.is(
        setdefault2(map, 0, 0, () => 97),
        97,
    );
    t.is(map.get(0)?.get(0), 97);

    map.get(0)?.set(1, 400);
    t.is(
        setdefault2(map, 0, 1, () => 7000),
        400,
    );
});
