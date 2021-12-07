/* eslint-disable functional/no-let */
export default function cloneScript(el: HTMLScriptElement): HTMLScriptElement {
  const newEl = document.createElement("script");

  const { length } = el.attributes;
  let i = 0;

  // eslint-disable-next-line functional/no-loop-statement
  while (i < length) {
    newEl.setAttribute(el.attributes[i].name, el.attributes[i].value);
    i++;
  }

  // eslint-disable-next-line functional/immutable-data
  newEl.innerHTML = el.innerHTML;
  return newEl;
}
