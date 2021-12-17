import { isArrayLike } from "../utils/is";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function each<T = any, R = any, A = ArrayLike<T>>(
  array: A,
  callback: (this: T, value: T, index: number, array: A) => R
): A;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function each<T, K extends keyof T, R = any>(
  obj: T,
  callback: (this: T, value: T[K], key: K, object: T) => R
): T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function each(obj: any, callback: any) {
  if (isArrayLike(obj)) {
    const { length } = obj;
    // eslint-disable-next-line functional/no-let
    let i = 0;

    // eslint-disable-next-line functional/no-loop-statement
    while (i < length) {
      if (callback.call(obj[i], obj[i], i, obj) === false) {
        break;
      }
      i++;
    }
  } else {
    // eslint-disable-next-line functional/no-loop-statement
    for (const prop in obj) {
      if (callback.call(obj[prop], obj[prop], prop, obj) === false) {
        break;
      }
    }
  }

  return obj;
}

export default each;
