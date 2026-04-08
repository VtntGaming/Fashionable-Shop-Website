/**
 * Safely extract an array from API responses that may return
 * a raw array or a paginated wrapper `{ content: T[] }`.
 */
export function toArray<T>(value: T[] | { content?: T[] } | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray((value as { content?: T[] }).content)) {
    return (value as { content?: T[] }).content ?? [];
  }
  return [];
}

/**
 * Remove duplicate items from an array using a key extractor.
 */
export function dedupeBy<T>(items: T[], getKey: (item: T, index: number) => string | number | undefined): T[] {
  const seen = new Set<string | number>();
  return items.filter((item, index) => {
    const key = getKey(item, index) ?? `fallback-${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
