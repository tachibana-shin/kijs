import css from "./css";
import $$offset, { Offset } from "./offset";

export default function position<TElement extends HTMLElement>(
  elem: TElement
): Offset {
  // eslint-disable-next-line functional/no-let
  let offsetParent, offset, doc;
  const parentOffset = { top: 0, left: 0 };

  // position:fixed elements are offset from the viewport, which itself always has zero offset
  if (css(elem, "position") === "fixed") {
    // Assume position:fixed implies availability of getBoundingClientRect
    offset = elem.getBoundingClientRect();
  } else {
    offset = $$offset(elem);

    // Account for the *real* offset parent, which can be the document or its root element
    // when a statically positioned element is identified
    doc = elem.ownerDocument;
    offsetParent = elem.offsetParent || doc.documentElement;
    // eslint-disable-next-line functional/no-loop-statement
    while (
      offsetParent &&
      (offsetParent === doc.body || offsetParent === doc.documentElement) &&
      css(offsetParent as HTMLElement, "position") === "static"
    ) {
      offsetParent = offsetParent.parentNode;
    }
  }

  // Subtract parent offsets and element margins
  return {
    top: offset.top - parentOffset.top - (css(elem, "marginTop") as number),
    left: offset.left - parentOffset.left - (css(elem, "marginLeft") as number),
  };
}
