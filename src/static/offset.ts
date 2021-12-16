/* eslint-disable functional/functional-parameters */

/* eslint-disable functional/immutable-data */
import LikeArray from "../types/LikeArray";
import { isFunction } from "../utils/is";

import css from "./css";
import each from "./each";
import $$position from "./position";

export type Offset = {
  readonly top: number;
  readonly left: number;
};

function setOffset<TElement extends HTMLElement>(
  elem: TElement,
  options: Offset | ((index: number, currentOffset: Offset) => Offset),
  i = 0
) {
  // eslint-disable-next-line functional/no-let
  let curPosition,
    curLeft,
    curCSSTop,
    curTop,
    curOffset,
    curCSSLeft,
    calculatePosition,
    // eslint-disable-next-line prefer-const
    position = css(elem, "position"),
    // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
    props = {} as any;

  // Set position first, in-case top/left are set even on static elem
  if (position === "static") {
    elem.style.position = "relative";
  }

  // eslint-disable-next-line prefer-const
  curOffset = offset(elem);
  // eslint-disable-next-line prefer-const
  curCSSTop = css(elem, "top") as string;
  // eslint-disable-next-line prefer-const
  curCSSLeft = css(elem, "left") as string;
  // eslint-disable-next-line prefer-const
  calculatePosition =
    (position === "absolute" || position === "fixed") &&
    (curCSSTop + curCSSLeft).indexOf("auto") > -1;

  // Need to be able to calculate position if either
  // top or left is auto and position is either absolute or fixed
  if (calculatePosition) {
    curPosition = $$position(elem);
    curTop = curPosition.top;
    curLeft = curPosition.left;
  } else {
    curTop = parseFloat(curCSSTop) || 0;
    curLeft = parseFloat(curCSSLeft) || 0;
  }

  if (isFunction(options)) {
    // Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
    options = options.call(elem, i, curOffset);
  }

  if (options.top != null) {
    props.top = options.top - curOffset.top + curTop;
  }
  if (options.left != null) {
    props.left = options.left - curOffset.left + curLeft;
  }

  css(elem, props);
}

function offset<TElement extends HTMLElement>(
  elem: TElement,
  options: Offset | ((index: number, currentOffset: Offset) => Offset)
): void;

function offset<TElement extends HTMLElement>(elem: TElement): Offset;

function offset<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  options?: Offset | ((index: number, currentOffset: Offset) => Offset)
) {
  // Preserve chaining for setter
  if (arguments.length > 1) {
    each(elems, (elem, i) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOffset(elem, options as any, i);
    });

    return;
  }

  const elem = elems[0];

  if (!elem) {
    return;
  }

  if (!elem.getClientRects().length) {
    return {
      top: 0,
      left: 0,
    };
  }

  const rect = elem.getBoundingClientRect();
  const win = elem.ownerDocument.defaultView || window;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
}

export default offset;
