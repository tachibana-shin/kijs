// eslint-disable-next-line functional/prefer-readonly-type, @typescript-eslint/no-explicit-any
export default function unique<T = any>(array: ArrayLike<T>): T[] {
  return Array.from(new Set<T>(Array.from(array)).values());
}
