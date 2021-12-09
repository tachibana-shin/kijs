import each from "./each";
import { removeData } from "./data";
import { off } from "./event";
import type LikeArray from "../types/LikeArray";

export default function cleanData<TElement = HTMLElement>(
  elems: LikeArray<TElement>
): void {
  each(elems, (index, value) => {
    removeData(value);
  });
  off(elems);
}
