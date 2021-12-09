setOffset: function(elem, options, i) {
  var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
    position = jQuery.css(elem, "position"),
    curElem = jQuery(elem),
    props = {};

  // Set position first, in-case top/left are set even on static elem
  if (position === "static") {
    elem.style.position = "relative";
  }

  curOffset = curElem.offset();
  curCSSTop = jQuery.css(elem, "top");
  curCSSLeft = jQuery.css(elem, "left");
  calculatePosition = (position === "absolute" || position === "fixed") &&
    (curCSSTop + curCSSLeft).indexOf("auto") > -1;

  // Need to be able to calculate position if either
  // top or left is auto and position is either absolute or fixed
  if (calculatePosition) {
    curPosition = curElem.position();
    curTop = curPosition.top;
    curLeft = curPosition.left;

  } else {
    curTop = parseFloat(curCSSTop) || 0;
    curLeft = parseFloat(curCSSLeft) || 0;
  }

  if (isFunction(options)) {

    // Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
    options = options.call(elem, i, jQuery.extend({}, curOffset));
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
    curElem.css(props);
  }
}