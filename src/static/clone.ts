import { weakCacheEvent, on } from "./event";
import data from "./data";
import extend from "./extend";
import each from "./each";

function copyEvent<TElement>(src: TElement, dest: TElement): void {
  weakCacheEvent.get(src)?.forEach((events) => {
    events.forEach((list, name) => {
      list?.forEach((hl) => {
        if (hl.selector) {
          on(dest, hl.selector, hl.handler);
        } else {
          on(dest, hl.handler);
        }
      });
    });
  });
}
function copyData<TElement>(src: TElement, dest: TElement): void {
  data(dest, extend(true, Object.create(null), data(src)));
}

function clone<TElement>(
  elem: TElement,
  dataAndEvent: boolean = false,
  deepDataAndEvent?: boolean = dataAndEvent
): void {
  const clone = elem.cloneNode(true);

  const allElem = elem.querySelectorAll("*");
  const allClone = clone.querySelectorAll("*");

  each(allElem, (i, el) => {
    copyEvent(el, allClone[i]);
    copyEvent(el, allClone[i]);
  });

  return clone;
}

export default clone;
