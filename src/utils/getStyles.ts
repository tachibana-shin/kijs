export default function getStyles<TElement extends Element>(
  elem: TElement
) {
  // eslint-disable-next-line functional/no-let
  let view = elem.ownerDocument?.defaultView || window;

  if (!view || !view.opener) {
    view = window;
  }

  return view.getComputedStyle(elem);
}
