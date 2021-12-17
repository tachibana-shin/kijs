import { removeData } from "./data";
import each from "./each";
import { off } from "./event";

export default function cleanData<TElement = HTMLElement>(
  elems: ArrayLike<TElement>
): void {
  each(elems, (value) => {
    removeData(value);
  });
  off(elems);
}
