import { isLikeArray } from "../utils/is"
import LikeArray from "../types/LikeArray";

function each<T = any>(array: LikeArray<T>, callback: (this: T, index: number, value: T) => void | false): void;
function each<K = string, V = any>(object: {
  [key: K]: V
}, callback: (this: T, index: number, value: T) => void | false): void;

function each(obj: any, callback: any): void {
  if ( isLikeArray(obj) ) {
    const { length } = obj;
    let i = 0;
    
    while ( i < length ) {
      if (callback.call(obj[i], i, obj[i]) === false) {
        break
      }
      i++
    }
  } else {
    for (const prop in obj) {
      if (callback.call(obj[prop], prop, obj[prop]) === false) {
        break
      }
    }
  }
}

export default each;