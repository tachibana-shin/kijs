// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function grep<T = any>(
  array: ArrayLike<T>,
  callback: (item: T, index: number, array: ArrayLike<T>) => boolean | void,
  invert = false
  // eslint-disable-next-line functional/prefer-readonly-type
): T[] {
  return Array.prototype.filter.call(array, (item, index) => {
    if (callback(item, index, array) !== invert) {
      return true;
    }
  });
}
