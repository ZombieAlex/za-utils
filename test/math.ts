import test from "ava";
import _ from "lodash";
import { ascending, average, descending, percentiles, stddev, sum } from "../src/index.js";

test("nearest rank percentiles retrieves exact indices when there are precise matches", (t) => {
    let values: number[] = [];
    for (let i = 0; i <= 100; i++) {
        values.push(i);
    }

    values = _.shuffle(values);

    const [p0, p25, p75, p99, p100] = percentiles(values, [0, 0.25, 0.75, 0.99, 1], { method: "nearest" });
    t.is(p0, 0);
    t.is(p25, 25);
    t.is(p75, 75);
    t.is(p99, 99);
    t.is(p100, 100);
});

test("nearest rank percentiles retrieves floor indices when there are no precise matches", (t) => {
    const values = [0, 25, 50, 75, 100];
    const [p74, p75, p76, p99, p100] = percentiles(values, [0.74, 0.75, 0.76, 0.99, 1], { method: "nearest" });
    t.is(p74, 50);
    t.is(p75, 75);
    t.is(p76, 75);
    t.is(p99, 75);
    t.is(p100, 100);
});

test("linear rank percentiles retrieves exact indices when there are precise matches", (t) => {
    let values: number[] = [];
    for (let i = 0; i <= 100; i++) {
        values.push(i);
    }

    values = _.shuffle(values);

    const [p0, p25, p75, p99, p100] = percentiles(values, [0, 0.25, 0.75, 0.99, 1], { method: "linear" });
    t.is(p0, 0);
    t.is(p25, 25);
    t.is(p75, 75);
    t.is(p99, 99);
    t.is(p100, 100);
});

test("linear rank percentiles retrieves interpolated values when there are no precise matches", (t) => {
    const values = [0, 25, 50, 75, 100];
    const [p50, p74, p75, p76, p99, p100] = percentiles(values, [0.5, 0.74, 0.75, 0.76, 0.99, 1], { method: "linear" });
    t.is(p50, 50);
    t.is(p74, 74);
    t.is(p75, 75);
    t.is(p76, 76);
    t.is(p99, 99);
    t.is(p100, 100);
});

test("stddev", (t) => {
    const [mean, deviation] = stddev([0, 50, 100]);
    t.is(mean, 50);
    t.is(deviation, 50);
});

test("average", (t) => {
    t.is(average([0, 10]), 5);
});

test("sum", (t) => {
    t.is(sum([10, 7, 3]), 20);
});

test("ascending", (t) => {
    t.deepEqual(ascending([9, 7, 8, 2]), [2, 7, 8, 9]);
});

test("descending", (t) => {
    t.deepEqual(descending([9, 7, 8, 2]), [9, 8, 7, 2]);
});
