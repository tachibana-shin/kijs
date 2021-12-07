import cloneScript from "./cloneScript";

const rtagName = /<([a-z][^/\0>\x20\t\r\n\f]+)/i;
const rxhtmlTag =
  /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;

const option = [1, "<select multiple='multiple'>", "</select>"];
const thead = [1, "<table>", "</table>"];
const td = [3, "<table><tbody><tr>", "</tr></tbody></table>"];
const wrapMap = {
  option,
  optgroup: option,
  thead,
  tbody: thead,
  tfoot: thead,
  colgroup: thead,
  caption: thead,
  col: [2, "<table><colgroup>", "</colgroup></table>"],
  tr: [2, "<table><tbody>", "</tbody></table>"],
  td,
  th: td,
  _default: [0, "", ""],
};

export default function createFragment(html: string) {
  const frag = document.createDocumentFragment();
  const root = document.createElement("div");
  const tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrap = (wrapMap as any)[tag] || wrapMap._default;

  // eslint-disable-next-line functional/immutable-data
  root.innerHTML = wrap[1] + html.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

  // eslint-disable-next-line functional/no-let
  let j = wrap[0],
    tmp: ChildNode | null = root;
  // eslint-disable-next-line functional/no-loop-statement
  while (j--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tmp = tmp!.lastChild;
  }

  const scripts = (tmp as HTMLElement).getElementsByTagName("script");

  // eslint-disable-next-line functional/no-let
  let { length } = scripts;

  // eslint-disable-next-line functional/no-loop-statement
  while (length--) {
    scripts[length].replaceWith(cloneScript(scripts[length]));
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const all = tmp!.childNodes;
  // eslint-disable-next-line functional/no-let
  let elem;
  // eslint-disable-next-line functional/no-loop-statement
  while ((elem = all[0])) {
    frag.appendChild(elem);
  }

  return frag;
}
