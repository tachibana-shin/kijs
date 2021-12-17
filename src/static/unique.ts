export default function unique<T = any>(array: ArrayLike<T>): T[] {
  return Array.from(new Set(array).values());
}
