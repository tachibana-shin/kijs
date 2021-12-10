import type LikeArray from "../types/LikeArray";

import { removeData } from "./data";
import each from "./each";
import { off } from "./event";

export default function cleanData<TElement extends HTMLElement>(
  elems: LikeArray<TElement>
): void {
  each(elems, (index, value) => {
    removeData(value);
  });
  off(elems);
}
