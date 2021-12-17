import { isArrayLike } from "../utils/is";

export default function getText<TElement extends Node>(
  elems: ArrayLike<TElement> | TElement
): string {
  // eslint-disable-next-line functional/no-let
  let ret = "";

  const nodeType = isArrayLike(elems) ? false : (elems as TElement).nodeType;

  if (isArrayLike(elems)) {
    // eslint-disable-next-line functional/no-let
    let node,
      i = 0;
    // eslint-disable-next-line functional/no-loop-statement
    while ((node = elems[i++])) {
      ret += getText(node);
    }
  } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
    // Use textContent for elements
    // innerText usage removed for consistency of new lines (jQuery #11153)
    if (typeof elems.textContent === "string") {
      return elems.textContent;
    } else {
      // Traverse its children
      // eslint-disable-next-line functional/no-loop-statement
      for (
        elems = elems.firstChild as unknown as TElement;
        elems;
        elems = elems.nextSibling as unknown as TElement
      ) {
        ret += getText(elems);
      }
    }
  } else if (nodeType === 3 || nodeType === 4) {
    return elems.nodeValue || "";
  }

  return ret;
}
