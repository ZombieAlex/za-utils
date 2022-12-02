/**
 * Based on Python dict setdefault. This function returns the value of key in
 * the map, setting it to the result of defaultValueGenerator if it is not
 * already set.
 * @param singleLevelMap
 * @param key
 * @param defaultValueGenerator
 * @returns
 */
export function setdefault(singleLevelMap, key, defaultValueGenerator) {
    if (!singleLevelMap.has(key)) {
        singleLevelMap.set(key, defaultValueGenerator());
    }
    return singleLevelMap.get(key);
}
/**
 * Like setdefault, but for Maps of Maps.
 * @param twoLevelMap
 * @param firstKey
 * @param secondKey
 * @param defaultValueGenerator
 * @returns
 */
export function setdefault2(twoLevelMap, firstKey, secondKey, defaultValueGenerator) {
    setdefault(twoLevelMap, firstKey, () => new Map());
    return setdefault(twoLevelMap.get(firstKey), secondKey, defaultValueGenerator);
}
//# sourceMappingURL=map.js.map