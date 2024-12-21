export function warnOnValueMismatch<T>(originalState: T, updatedState: T) {
  function deepCompare(
    original: any,
    updated: any,
    path: string = ''
  ): boolean {
    if (typeof original !== typeof updated) {
      console.warn(
        `Type mismatch at ${path}: ${typeof original} !== ${typeof updated}`
      );
      return false;
    }

    if (original === null || original === undefined) {
      if (original !== updated) {
        console.warn(`Value mismatch at ${path}: ${original} !== ${updated}`);
        return false;
      }
      return true;
    }

    if (typeof original !== 'object') {
      if (original !== updated) {
        console.warn(`Value mismatch at ${path}: ${original} !== ${updated}`);
        return false;
      }
      return true;
    }

    if (Array.isArray(original)) {
      if (!Array.isArray(updated) || original.length !== updated.length) {
        console.warn(`Array mismatch at ${path}: length or type differs`);
        return false;
      }

      return original.every((item, index) =>
        deepCompare(item, updated[index], `${path}[${index}]`)
      );
    }

    const originalKeys = Object.keys(original);
    const updatedKeys = Object.keys(updated);

    if (originalKeys.length !== updatedKeys.length) {
      console.warn(`Key count mismatch at ${path}`);
      return false;
    }

    return originalKeys.every((key) => {
      if (!(key in updated)) {
        console.warn(`Missing key at ${path}: ${key}`);
        return false;
      }

      return deepCompare(
        original[key],
        updated[key],
        path ? `${path}.${key}` : key
      );
    });
  }

  const isEqual = deepCompare(originalState, updatedState);

  return isEqual;
}
