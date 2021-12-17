/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/prefer-readonly-type */
import each from "./each";

function map<T = any, R = any, A = ArrayLike<T>>(
  array: A,
  callback: (this: T, value: T, index: number, array: A) => R
): R[];
function map<T, K extends keyof T, R = any>(
  obj: T,
  callback: (this: T, value: T[K], key: K, object: T) => R
): R[];

function map(obj: any, cb: any) {
  const results: any[] = [];

  each(obj, (value, key) => {
    // eslint-disable-next-line functional/immutable-data
    results.push(cb.call(value, value, key, obj));
  });

  return results;
}

export default map;
