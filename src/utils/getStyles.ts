export default function getStyles < TElement = HTMLElement > (elem: TElement) {
  const view = elem.ownerDocument.defaultView;

  if (!view || !view.opener) {
    view = window;
  }

  return view.getComputedStyle(elem);
};