/**
 * Based on Python dict setdefault. This function returns the value of key in
 * the map, setting it to the result of defaultValueGenerator if it is not
 * already set.
 * @param singleLevelMap
 * @param key
 * @param defaultValueGenerator
 * @returns
 */
export function setdefault<T, U>(singleLevelMap: Map<T, U>, key: T, defaultValueGenerator: () => U): U {
    if (!singleLevelMap.has(key)) {
        singleLevelMap.set(key, defaultValueGenerator());
    }

    return singleLevelMap.get(key)!;
}

/**
 * Like setdefault, but for Maps of Maps.
 * @param twoLevelMap
 * @param firstKey
 * @param secondKey
 * @param defaultValueGenerator
 * @returns
 */
export function setdefault2<T, U, V>(
    twoLevelMap: Map<T, Map<U, V>>,
    firstKey: T,
    secondKey: U,
    defaultValueGenerator: () => V,
): V {
    setdefault(twoLevelMap, firstKey, () => new Map());
    return setdefault(twoLevelMap.get(firstKey)!, secondKey, defaultValueGenerator);
}
