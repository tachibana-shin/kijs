import data from "./data";
import each from "./each";
import { on, weakCacheEvent } from "./event";
import extend from "./extend";

function copyEvent<TElement extends Element>(
  src: TElement,
  dest: TElement
): void {
  weakCacheEvent.get(src)?.forEach((list, name) => {
    list?.forEach((hl) => {
      if (hl.selector) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        on([dest], name, hl.selector, hl.handler as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        on([dest], name, hl.handler as any);
      }
    });
  });
}
function copyData<TElement extends Element>(
  src: TElement,
  dest: TElement,
  deep = false
): void {
  if (deep) {
    data(dest, extend(true, Object.create(null), data(src)));
  } else {
    data(dest, data(src));
  }
}

function clone<TElement extends Element>(
  elem: TElement,
  dataAndEvent = false,
  deepDataAndEvent: boolean = dataAndEvent
): TElement {
  const clone = elem.cloneNode(true) as TElement;

  const allElem = elem.querySelectorAll("*");
  const allClone = clone.querySelectorAll("*");

  each(allElem, (el, i) => {
    copyEvent(el, allClone[i]);
    copyData(el, allClone[i], deepDataAndEvent);
  });

  return clone;
}

export default clone;
