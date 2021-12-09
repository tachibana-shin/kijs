type Offset = {
  top: number
  left: number
}

function setOffset < TElement = HTMLElement > (elem: TElement, options: Offset | ((index: number, currentOffset: Offset) => Offset), i = 0) {
  var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
    position = css(elem, "position"),

    props = {};

  // Set position first, in-case top/left are set even on static elem
  if (position === "static") {
    elem.style.position = "relative";
  }

  curOffset = offset(elem);
  curCSSTop = css(elem, "top");
  curCSSLeft = css(elem, "left");
  calculatePosition = (position === "absolute" || position === "fixed") &&
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
    props.top = (options.top - curOffset.top) + curTop;
  }
  if (options.left != null) {
    props.left = (options.left - curOffset.left) + curLeft;
  }

  if ("using" in options) {
    options.using.call(elem, props);

  } else {
    css(elem, props);
  }
}

function offset < TElement = HTMLElement > (elem: TElement, options: Offset | ((index: number, currentOffset: Offset) => Offset)): void;

function offset < TElement = HTMLElement > (elem: TElement): offset;


function offset < TElement = HTMLElement > (elems: LikeArray < TElement > , options ? : Offset | ((index: number, currentOffset: Offset) => Offset)) {

  // Preserve chaining for setter
  if (arguments.length) {

    each(elems, (i, elem) => {
      setOffset(elem, options, i);
    });

    return
  }

  const rect, win,
    elem = elems[0];

  if (!elem) {
    return;
  }

  if (!elem.getClientRects().length) {
    return {
      top: 0,
      left: 0
    };
  }

  rect = elem.getBoundingClientRect();
  win = elem.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  };
}

export default offset