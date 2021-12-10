export default function getStyles<TElement extends HTMLElement>(
  elem: TElement
) {
  // eslint-disable-next-line functional/no-let
  let view = elem.ownerDocument.defaultView;

  if (!view || !view.opener) {
    view = window;
  }

  return view.getComputedStyle(elem);
}
