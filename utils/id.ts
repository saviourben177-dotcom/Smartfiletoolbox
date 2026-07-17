/**
 * Lightweight unique id generator.
 *
 * Do not use the `uuid` package here — it depends on crypto.getRandomValues()
 * which crashes on iOS/Android in this runtime. This time-plus-random scheme
 * is sufficient for local-only identifiers (history entries, temp filenames).
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}
