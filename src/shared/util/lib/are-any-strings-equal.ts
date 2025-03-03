export function areAnyStringsEqual(arr: string[]): boolean {
  const normalizedStrings = arr.map((str) =>
    str.replace(/\s+/g, '').toLowerCase()
  );
  const uniqueStrings = new Set(normalizedStrings);
  return uniqueStrings.size < normalizedStrings.length;
}
