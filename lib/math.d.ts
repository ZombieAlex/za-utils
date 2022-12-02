/**
 * Calculates percentiles for a given numeric array
 * @param array Numeric array to calculate percentiles over
 * @param pArray Array of percentiles to calculate like [0.25, 0.75, 0.9, 1]
 * @param param2
 * @returns An array of the requested percentile values in order of the request
 */
export declare function percentiles(array: number[], pArray: number[], { preSorted, method }?: {
    preSorted?: boolean;
    method?: "linear" | "nearest";
}): (number | undefined)[];
/**
 * Computes and returns the [mean, standard deviation] for an array of numbers
 * @param array
 * @returns
 */
export declare function stddev(array: number[]): [number, number];
/**
 * Computes the average for an array of numbers.
 * @param array
 * @returns
 */
export declare function average(array: number[]): number;
/**
 * Sorts a numeric array in place in ascending order and returns a reference to
 * the same array.
 * @param array
 * @returns
 */
export declare function ascending(array: number[]): number[];
/**
 * Sorts a numeric array in place in descending order and returns a reference
 * to the same array.
 * @param array
 * @returns
 */
export declare function descending(array: number[]): number[];
/**
 * Computes the sum for an array of numbers.
 * @param array
 * @returns
 */
export declare function sum(array: number[]): number;
