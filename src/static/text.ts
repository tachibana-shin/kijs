export default function getText<TElement = HTMLElement>(
  elem: ArrayLike<TElement>
): string {
  // eslint-disable-next-line functional/no-let
  let ret = "";
  const nodeType = elem.nodeType;

  if (!nodeType) {
    // eslint-disable-next-line functional/no-let
    let node,
      i = 0;
    // If no nodeType, this is expected to be an array
    // eslint-disable-next-line functional/no-loop-statement
    while ((node = elem[i++])) {
      // Do not traverse comment nodes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ret += getText(node as any);
    }
  } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
    // Use textContent for elements
    // innerText usage removed for consistency of new lines (jQuery #11153)
    if (typeof elem.textContent === "string") {
      return elem.textContent;
    } else {
      // Traverse its children
      // eslint-disable-next-line functional/no-loop-statement
      for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
        ret += getText(elem);
      }
    }
  } else if (nodeType === 3 || nodeType === 4) {
    return elem.nodeValue;
  }

  // Do not include comment or processing instruction nodes

  return ret;
}
