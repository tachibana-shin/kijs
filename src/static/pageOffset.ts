import LikeArray from "../types/LikeArray";

import each from "./each";

const props = {
  scrollLeft: "pageXOffset",
  scrollTop: "pageYOffset",
};

function pageOffset<TElement = HTMLElement>(
  elems: LikeArray<TElement>,
  prop: "scrollLeft" | "scrollTop",
  val: number
): void;

function pageOffset<TElement = HTMLElement>(
  elems: LikeArray<TElement>,
  prop: "scrollLeft" | "scrollTop"
): number;

function pageOffset(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elems: LikeArray<any>,
  prop: "scrollLeft" | "scrollTop",
  val?: number
) {
  const win =
    elems[0] === elems[0].window
      ? elems[0]
      : elems[0].nodeType === 9
      ? elems[0].defaultView
      : null;

  if (val === undefined) {
    return win ? win[props[prop]] : elems[0][prop];
  }

  each(elems, (i, elem) => {
    if (win) {
      const top = prop === "scrollTop";
      win.scrollTo(!top ? val : win.pageXOffset, top ? val : win.pageYOffset);
    } else {
      // eslint-disable-next-line functional/immutable-data
      elem[prop] = val;
    }
  });
}

export default pageOffset;
