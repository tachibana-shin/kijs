/* eslint-disable @typescript-eslint/no-explicit-any */
import type LikeArray from "../types/LikeArray";
import { isArrayLike } from "../utils/is";

function each<T = any>(
  array: LikeArray<T>,
  callback: (this: T, index: number, value: T) => void | false
): void;
function each<K extends string | number, V = any>(
  object: Record<K, V>,
  callback: (this: V, index: number, value: V) => void | false
): void;

function each(obj: any, callback: any): void {
  if (isArrayLike(obj)) {
    const { length } = obj;
    // eslint-disable-next-line functional/no-let
    let i = 0;

    // eslint-disable-next-line functional/no-loop-statement
    while (i < length) {
      if (callback.call(obj[i], i, obj[i]) === false) {
        break;
      }
      i++;
    }
  } else {
    // eslint-disable-next-line functional/no-loop-statement
    for (const prop in obj) {
      if (callback.call(obj[prop], prop, obj[prop]) === false) {
        break;
      }
    }
  }
}

export default each;
