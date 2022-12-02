/**
 * Computes the nearest rank percentiles of the given numeric array
 * @param array
 * @param pArray
 * @returns
 */
function percentilesNearestRank(array, pArray, { preSorted = false } = {}) {
    if (!preSorted) {
        array = [...array];
        ascending(array);
    }
    const pIndices = pArray.map((p) => Math.floor(p * (array.length - 1)));
    const returnValueValue = pIndices.map((pi) => array[pi]);
    return returnValueValue;
}
function percentilesLinearInterpolation(array, pArray, { preSorted = false } = {}) {
    if (!preSorted) {
        array = [...array];
        ascending(array);
    }
    const result = [];
    for (const p of pArray) {
        const pos = p * (array.length - 1);
        const base = Math.floor(pos);
        const rest = pos - base;
        // eslint-disable-next-line no-negated-condition
        if (array[base + 1] !== undefined) {
            result.push(array[base] + rest * (array[base + 1] - array[base]));
        }
        else {
            result.push(array[base]);
        }
    }
    return result;
}
/**
 * Calculates percentiles for a given numeric array
 * @param array Numeric array to calculate percentiles over
 * @param pArray Array of percentiles to calculate like [0.25, 0.75, 0.9, 1]
 * @param param2
 * @returns An array of the requested percentile values in order of the request
 */
export function percentiles(array, pArray, { preSorted = false, method = "linear" } = {}) {
    if (method === "linear") {
        return percentilesLinearInterpolation(array, pArray, { preSorted });
    }
    return percentilesNearestRank(array, pArray, { preSorted });
}
/**
 * Computes and returns the [mean, standard deviation] for an array of numbers
 * @param array
 * @returns
 */
export function stddev(array) {
    const avg = average(array);
    const diffArray = array.map((a) => (a - avg) ** 2);
    return [avg, Math.sqrt(sum(diffArray) / (array.length - 1))];
}
/**
 * Computes the average for an array of numbers.
 * @param array
 * @returns
 */
export function average(array) {
    return sum(array) / array.length;
}
/**
 * Sorts a numeric array in place in ascending order and returns a reference to
 * the same array.
 * @param array
 * @returns
 */
export function ascending(array) {
    return array.sort((a, b) => a - b);
}
/**
 * Sorts a numeric array in place in descending order and returns a reference
 * to the same array.
 * @param array
 * @returns
 */
export function descending(array) {
    return array.sort((a, b) => b - a);
}
/**
 * Computes the sum for an array of numbers.
 * @param array
 * @returns
 */
export function sum(array) {
    return array.reduce((a, b) => a + b, 0);
}
//# sourceMappingURL=math.js.map