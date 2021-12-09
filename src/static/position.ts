export default function position < TElement = HTMLElement > (elem: TElement): Offset{
 
  var offsetParent, offset, doc,
    parentOffset = { top: 0, left: 0 };

  // position:fixed elements are offset from the viewport, which itself always has zero offset
  if (css(elem, "position") === "fixed") {

    // Assume position:fixed implies availability of getBoundingClientRect
    offset = elem.getBoundingClientRect();

  } else {
    offset = offset([elem]);

    // Account for the *real* offset parent, which can be the document or its root element
    // when a statically positioned element is identified
    doc = elem.ownerDocument;
    offsetParent = elem.offsetParent || doc.documentElement;
    while (offsetParent &&
      (offsetParent === doc.body || offsetParent === doc.documentElement) &&
      css(offsetParent, "position") === "static") {

      offsetParent = offsetParent.parentNode;
    }
    if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {

      // Incorporate borders into its offset, since they are outside its content origin
      parentOffset = offset([offsetParent]);
      parentOffset.top += (offsetParent, "borderTopWidth", true);
      parentOffset.left += (offsetParent, "borderLeftWidth", true);
    }
  }

  // Subtract parent offsets and element margins
  return {
    top: offset.top - parentOffset.top - css(elem, "marginTop", true),
    left: offset.left - parentOffset.left - css(elem, "marginLeft", true)
  };
}