/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/prefer-readonly-type */
import LikeArray from "../types/LikeArray";

import each from "./each";

function filter<T = any, A = LikeArray<T>>(
  array: A,
  callback: (this: T, value: T, index: number, array: A) => void | boolean
): T[];
function filter<T, K extends keyof T>(
  obj: T,
  callback: (this: T, value: T[K], key: K, object: T) => void | boolean
): T[K][];

function filter(obj: any, cb: any) {
  const results: any[] = [];

  each(obj, (value, key) => {
    if (cb.call(value, value, key, obj) === true) {
      // eslint-disable-next-line functional/immutable-data
      results.push(value);
    }
  });

  return results;
}

export default filter;
