/* eslint-disable @typescript-eslint/no-explicit-any */
import createFragment from "./utils/createFragment";
import { isArrayLike } from "./utils/is";

type TypeOrArray<T> = T | readonly T[];
type Node = Element | Text | Comment | Document | DocumentFragment;
type htmlString = string;
type Selector = string;
type ReturnMyjs<TElement> = Myjs<TElement> & {
  readonly [index: number]: TElement;
};

const rSelector = /[a-zA-Z_]|\.|#/;
export default function myjs<TElement = HTMLElement>(
  selector: Selector | TypeOrArray<Element> | htmlString | Node
): ReturnMyjs<TElement> {
  return new Myjs<TElement>(selector) as any;
}

class Myjs<TElement = HTMLElement> {
  // eslint-disable-next-line functional/prefer-readonly-type
  length = 0;
  constructor(selector: Selector | TypeOrArray<Element> | htmlString | Node) {
    if (selector instanceof Myjs) {
      return selector as any;
    }

    // eslint-disable-next-line functional/prefer-readonly-type
    const elements: Element[] = [];
    if (typeof selector === "string") {
      // document
      selector = selector.trim();

      if (rSelector.test(selector[0])) {
        // this is query
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          // eslint-disable-next-line functional/immutable-data
          elements.push(el as any);
        });
      } else {
        // create element
        createFragment(selector).childNodes.forEach((el) => {
          // eslint-disable-next-line functional/immutable-data
          elements.push(el as any);
        });
      }
    }
    if (isArrayLike(selector)) {
      // eslint-disable-next-line functional/immutable-data
      elements.push(...selector);
    }

    elements.forEach((item, index) => {
      (this as any)[index] = item;
    });
  }
}
