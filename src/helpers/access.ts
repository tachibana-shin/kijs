/* eslint-disable @typescript-eslint/no-explicit-any */
import each from "../static/each";
import ArrayLike from "../types/ArrayLike";

function access<TElement = HTMLElement, Return = any>(
  elems: ArrayLike<TElement>,
  callback: (elem: TElement, index: number) => void,
  modeReturn: Return
): Return;
function access<TElement = HTMLElement, Return = any>(
  elems: ArrayLike<TElement>,
  callback: (elem: TElement, index: number) => Return,
  modeReturn: true,
  reduce: boolean
): Return;
function access<TElement = HTMLElement, Return = any>(
  elems: ArrayLike<TElement>,
  callback: (elem: TElement, index: number) => Return,
  modeReturn: true | Return,
  reduce = false
): Return {
  if (modeReturn === true) {
    // eslint-disable-next-line functional/no-let
    let result: Return;
    each(elems, (elem, i) => {
      const r = callback(elem, i);

      if (result === void 0) {
        result = r;
      }

      if (reduce === false) {
        return false;
      }

      result += r as any;
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return result;
  } else {
    each(elems, (elem, i) => {
      callback(elem, i);
    });

    return modeReturn;
  }
}

export default access;
