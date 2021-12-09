export default function getText<TElement = HTMLElement>(
  elem: LikeArray<TElement>
): string {
  let ret = "";
  const nodeType = elem.nodeType;

  if (!nodeType) {
    let node,
      i = 0;
    // If no nodeType, this is expected to be an array
    while ((node = elem[i++])) {
      // Do not traverse comment nodes
      ret += getText(node);
    }
  } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
    // Use textContent for elements
    // innerText usage removed for consistency of new lines (jQuery #11153)
    if (typeof elem.textContent === "string") {
      return elem.textContent;
    } else {
      // Traverse its children
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
