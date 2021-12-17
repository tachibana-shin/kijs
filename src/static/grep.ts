export function grep<T = any>(
  array: ArrayLike<T>,
  callback: (item: T, index: number, array: typeof array) => boolean | void,
  invert = false
): T[] {
  const { length } = array;

  return Array.prototype.filter.call(array, (item, index) => {
    if (callback(item, index, array) !== invert) {
      return true;
    }
  });
}
