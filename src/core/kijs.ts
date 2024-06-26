/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable @typescript-eslint/no-explicit-any */
import attr, { removeAttr } from "../static/attr";
import {
  addClass,
  hasClass,
  removeClass,
  toggleClass,
} from "../static/className";
import cleanData from "../static/cleanData";
import clone from "../static/clone";
import css from "../static/css";
import setData, { removeData } from "../static/data";
import each from "../static/each";
import { off, on, one, weakCacheEvent } from "../static/event";
import extend from "../static/extend";
import offset from "../static/offset";
import pageOffset from "../static/pageOffset";
import position from "../static/position";
import prop, { removeProp } from "../static/prop";
import ready from "../static/ready";
import style from "../static/style";
import getText from "../static/text";
import toParam from "../static/toParam";
import trim from "../static/trim";
import unique from "../static/unique";
import value from "../static/value";
import createFragment from "../utils/createFragment";
import getStyles from "../utils/getStyles";
import { isArrayLike, isFunction, isObject } from "../utils/is";

import use from "./use";

type ArrayLikeNotIsString<T> =
  // eslint-disable-next-line functional/prefer-readonly-type
  | T[]
  | ((
      | {
          // eslint-disable-next-line functional/prefer-readonly-type
          [key: string | number | symbol]: any;
        }
      | Function
    ) & {
      // eslint-disable-next-line functional/prefer-readonly-type
      length: number;
    } & {
      // eslint-disable-next-line functional/prefer-readonly-type
      [index: number]: T;
    });
// type TypeOrArray<T> = T | ArrayLikeNotIsString<T>;
// type Node = Element | Text | Comment | Document | DocumentFragment;
type htmlString = string;
type Selector = keyof HTMLElementTagNameMap & keyof SVGElementTagNameMap;

type ParamNewKijs<TElement = HTMLElement> =
  | Selector
  | TElement
  | htmlString
  | Node
  | Window
  | void
  | null
  | Kijs;
//   | Kijs<TElement>;
type CustomElementAdd = string | Element | Text;

const rSelector = /[a-zA-Z_]|\.|\*|:|>|#/;
const rCRLF = /\r?\n/g,
  rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
  rsubmittable = /^(?:input|select|textarea|keygen)/i;

const rcheckableType = /^(?:checkbox|radio)$/i;

function kijs<T extends Kijs<any, any>, TElement = HTMLElement>(
  selector?: ParamNewKijs<TElement>,
  prevObject?: T,
  context = document
) {
  if (selector instanceof Kijs) {
    return selector;
  }
  return new Kijs(selector, prevObject, context);
}

class Kijs<
  T extends Kijs<any, any> = Kijs<any, any>,
  TElementProp = HTMLElement,
  TElement = TElementProp extends string
    ? HTMLElement
    : TElementProp extends ArrayLikeNotIsString<infer R>
    ? R
    : TElementProp
> {
  static readonly use = use;
  // eslint-disable-next-line functional/prefer-readonly-type
  [index: number]: TElement;
  // eslint-disable-next-line functional/prefer-readonly-type
  length = 0;
  readonly #prevObject?: T;
  readonly #context: Document;
  readonly kijs = true;
  constructor(
    selector?: ParamNewKijs<TElementProp>,
    prevObject?: T,
    context = document
  ) {
    this.#prevObject = prevObject;
    this.#context = context;

    if (selector) {
      const elements = new Set<TElement>();
      if (typeof selector === "string") {
        // document
        selector = trim(selector);

        if (rSelector.test(selector[0])) {
          // this is query
          this.#context
            .querySelectorAll<HTMLElement>(selector)
            .forEach((el) => {
              elements.add(el as any);
            });
        } else {
          // <
          // create element
          createFragment(selector).childNodes.forEach((el) => {
            elements.add(el as any);
          });
        }
      } else if (isArrayLike<TElement>(selector)) {
        each(selector, (i) => elements.add(i));
      } else {
        elements.add(selector)
      }

      // eslint-disable-next-line functional/no-let
      let index = 0;
      elements.forEach((item) => {
        this[index++] = item;
      });

      this.length = index;
    }
  }
  each(
    callback: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => void | false
  ): this {
    each(this, callback as any);

    return this;
  }
  map<T = TElement>(
    callback: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => T
  ) {
    return this.pushStack(
      Array.prototype.map.call(this, (el, index) =>
        callback.call(el, el, index, this)
      ) as readonly T[]
    );
  }
  filter(selector: ParamNewKijs<TElement>): Kijs<this, readonly TElement[]>;
  filter(
    callback: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => boolean | void
  ): Kijs<this, readonly TElement[]>;
  filter(selector: any) {
    if (typeof selector === "function") {
      return this.pushStack(
        Array.prototype.filter.call(this, (el, index) =>
          selector.call(el, el, index, this)
        ) as readonly TElement[]
      );
    }

    const elements = new Kijs(selector).toArray(); /* free */

    return this.pushStack(
      Array.prototype.filter.call(
        this,
        (el) => elements.includes(el) === false
      ) as readonly TElement[]
    );
  }
  // eslint-disable-next-line functional/prefer-readonly-type
  toArray(): TElement[] {
    return Array.from(this);
  }
  get(): readonly TElement[];
  get(index: number): TElement | void;
  get(index?: number): TElement | void | readonly TElement[] {
    if (index === undefined) {
      return Array.from(this);
    }
    return this[index < -1 ? this.length + index : index];
  }
  pushStack<T = TElement>(
    elements: ArrayLikeNotIsString<T>
  ): Kijs<this, readonly T[]> {
    return new Kijs(elements, this);
  }
  slice(start: number, end?: number) {
    return this.pushStack(Array.prototype.slice.call(this, start, end));
  }
  eq(index: number) {
    const item = this.get(index);

    return this.pushStack(item === void 0 ? [] : [item]);
  }
  first() {
    return this.eq(0);
  }
  last() {
    return this.eq(-1);
  }
  even() {
    return this.filter((_el, index) => index % 2 === 0);
  }
  odd() {
    return this.filter((_el, index) => index % 2 !== 0);
  }
  end(): T {
    return this.#prevObject || (new Kijs() as T);
  }
  // eslint-disable-next-line functional/functional-parameters, functional/prefer-readonly-type
  push(...items: TElement[]): number {
    return Array.prototype.push.call(this, ...items);
  }
  sort(compareFn?: (a: TElement, b: TElement) => number): this {
    Array.prototype.sort.call(this, compareFn);
    return this;
  }
  splice(
    start: number,
    deleteCount?: number,
    // eslint-disable-next-line functional/functional-parameters, functional/prefer-readonly-type
    ...items: TElement[]
  ): // eslint-disable-next-line functional/prefer-readonly-type
  TElement[] {
    return Array.prototype.splice.call(
      this,
      start,
      deleteCount as number,
      ...items
    );
  }

  extend<T = any>(
    deep: boolean,
    ...src: readonly {
      // eslint-disable-next-line functional/prefer-readonly-type
      [key: string]: T;
    }[]
  ): this;
  extend<T = any>(
    ...src: readonly {
      // eslint-disable-next-line functional/prefer-readonly-type
      [key: string]: T;
    }[]
  ): this;
  extend(
    // eslint-disable-next-line functional/functional-parameters
    ...params: readonly any[]
  ): this {
    extend.call(this, ...params);
    return this;
  }
  find<T extends Element>(selector: ParamNewKijs<T>) {
    if (typeof selector === "string") {
      const elements = new Set<T>();
      return this.each((value) => {
        if (value instanceof Element) {
          value.querySelectorAll<T>(selector).forEach((i) => elements.add(i));
        }
      }).pushStack(Array.from(elements.values()));
    }

    return this.pushStack(
      new Kijs(selector).filter((value: any) => {
        // eslint-disable-next-line functional/no-let
        let { length } = this;

        while (length--) {
          if ((this[length] as unknown as Node).contains(value)) {
            return true;
          }
        }
      })
    );
  }
  not(selector: ParamNewKijs<TElement>): Kijs<this, readonly TElement[]>;
  not(
    callback: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => boolean | void
  ): Kijs<this, readonly TElement[]>;
  not(filter: any) {
    return this.filter(filter);
  }
  is(selector: ParamNewKijs<TElement>): Kijs<this, readonly TElement[]>;
  is(
    filter: (this: TElement, index: number, element: TElement) => void | boolean
  ): Kijs<this, readonly TElement[]>;
  is(selector: any) {
    if (typeof selector === "function") {
      return this.filter(selector);
    }

    if (typeof selector === "string") {
      return this.filter((value) => {
        return value instanceof Element && value.matches(selector);
      });
    }

    const elements = new Kijs(selector).toArray(); /* free */

    return this.filter((value) => {
      return elements.includes(value);
    });
  }
  readonly init = kijs;
  has(element: ParamNewKijs<TElement>) {
    const elements = new Kijs(element);

    return this.filter((value: { readonly contains?: Function }) => {
      // eslint-disable-next-line functional/no-let
      let { length } = elements;

      while (length--) {
        if (value.contains?.(elements[length])) {
          return true;
        }
      }
    });
  }
  closest<T extends Element>(selector: ParamNewKijs<T>) {
    if (typeof selector === "string") {
      const elements = new Set<T>();

      return this.each((value) => {
        if (value instanceof Element) {
          const el = value.closest<T>(selector);
          if (el) {
            elements.add(el);
          }
        }
      }).pushStack(Array.from(elements.values()));
    }

    return this.pushStack(
      new Kijs(selector).filter((value: any) => {
        // eslint-disable-next-line functional/no-let
        let ok = false;
        this.each((v: any) => {
          while ((v = v.parentNode) && v.nodeType < 11) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            if (value === v) {
              ok = true;

              return false;
            }
          }
        });

        return ok;
      })
    );
  }
  index(selector?: string | Kijs<any, TElement> | TElement): number {
    if (selector === undefined) {
      return (this[0] as unknown as Node)?.parentNode
        ? this.first().prevAll().length || -1
        : -1;
    }

    if (typeof selector === "string") {
      return Array.prototype.indexOf.call(new Kijs(selector), this[0]);
    }

    return Array.prototype.indexOf.call(
      this,
      selector instanceof Kijs ? selector[0] : selector
    );
  }
  add<T = TElement>(selector: ParamNewKijs<T>, context = this.#context) {
    return this.pushStack(
      unique([...new Kijs(selector, this, context).toArray(), ...this.get()])
    );
  }

  addBack<T>(selector?: ParamNewKijs<T>): Kijs<this, TElement | T>;
  addBack(
    filter: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => boolean | void
  ): Kijs<this, TElement>;
  addBack(selector?: any) {
    return this.add(
      (selector === undefined
        ? this.#prevObject
        : this.#prevObject?.filter(selector)) || new Kijs()
    );
  }
  parent<T = Node>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        if (value.parentNode && value.parentNode.nodeType < 11) {
          elements.add(value.parentNode as any);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.parentNode) && value.nodeType < 11) {
          if (value.matches(selector)) {
            elements.add(value);
            break;
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  parents<T extends Element>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        while ((value = value.parentNode) && value.nodeType < 11) {
          elements.add(value);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.parentNode) && value.nodeType < 11) {
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  parentsUntil<T extends Element>(
    excludeSelector?: ParamNewKijs<T>,
    selector?: string
  ) {
    const exclude = new Kijs(excludeSelector).toArray();
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((value: any) => {
        while ((value = value.parentNode) && value.nodeType < 11) {
          if (exclude.includes(value)) {
            break;
          }
          elements.add(value);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.parentNode) && value.nodeType < 11) {
          if (exclude.includes(value)) {
            break;
          }
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  next<T extends Element>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        if (value.nextElementSibling) {
          elements.add(value.nextElementSibling as T);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.nextElementSibling)) {
          if (value.matches(selector)) {
            elements.add(value);
            break;
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  prev<T extends Element>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        if (value.previousElementSibling) {
          elements.add(value.previousElementSibling as any);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.nextElementSibling)) {
          if (value.matches(selector)) {
            elements.add(value);
            break;
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  nextAll<T extends Element>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        while ((value = value.nextElementSibling)) {
          elements.add(value);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.nextElementSibling)) {
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  prevAll<T extends Element>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        while ((value = value.previousElementSibling)) {
          elements.add(value);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.previousElementSibling)) {
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  nextUntil<T extends Element>(
    selectorExclude?: ParamNewKijs<T>,
    selector?: string
  ) {
    const exclude = new Kijs(selectorExclude).toArray();
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((value: any) => {
        while ((value = value.nextElementSibling)) {
          if (exclude.includes(value)) {
            break;
          }
          elements.add(value);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.nextSibling)) {
          if (exclude.includes(value)) {
            break;
          }
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  prevUntil<R extends Element, T extends Element>(
    selectorExclude?: ParamNewKijs<T>,
    selector?: string
  ) {
    const exclude = new Kijs(selectorExclude).toArray();
    const elements = new Set<R>();

    if (selector === void 0) {
      this.each((value: any) => {
        while ((value = value.previosElementSibling)) {
          if (exclude.includes(value)) {
            break;
          }
          elements.add(value);
        }
      });
    } else {
      this.each((value: any) => {
        while ((value = value.previosElementSibling)) {
          if (exclude.includes(value)) {
            break;
          }
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  siblings<T extends Element>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        const children = Array.from(value.parentNode?.children || []);

        // eslint-disable-next-line functional/immutable-data
        children.splice(children.indexOf(value), 1);

        children.forEach((i) => elements.add(i as T));
      });
    } else {
      this.each((value: any) => {
        const children = Array.from(value.parentNode?.children || []);

        // eslint-disable-next-line functional/immutable-data
        children.splice(children.indexOf(value), 1);

        children.forEach((i: any) => {
          if (i.matches(selector)) {
            elements.add(i as T);
          }
        });
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  children<T extends Element>(selector?: string) {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value: any) => {
        Array.from(value.children || []).forEach((i) => elements.add(i as T));
      });
    } else {
      this.each((value: any) => {
        Array.from(value.children || []).forEach((i: any) => {
          if (i.matches(selector)) {
            elements.add(i as T);
          }
        });
      });
    }

    return this.pushStack(Array.from(elements.values()));
  }
  contents<T extends Element>() {
    const elements = new Set<T>();

    return this.each((value: any) => {
      if (
        value.contentDocument != null &&
        Object.getPrototypeOf(value.contentDocument)
      ) {
        value.contentDocument.forEach((i: T) => elements.add(i));

        return;
      }

      if (value.nodeName === "TEMPLATE") {
        value = value.content || value;
      }

      value.childNodes.forEach((i: T) => elements.add(i));
    }).pushStack(Array.from(elements.values()));
  }
  ready(wait: boolean): void;
  ready(callback?: () => void | Promise<void>): Promise<void>;
  ready(v: any): any {
    return ready(v);
  }

  data<T extends object>(): T;
  data<R = any>(key: string | number | symbol): R;
  data<V = any>(key: string | number | symbol, value: V): this;
  data<D extends object>(data: D): this;
  data(key?: any, value?: any) {
    if (isObject(key) || value !== undefined) {
      return this.each((value: any) => {
        setData(value, key, value);
      });
    }

    return setData(this[0], key);
  }
  removeData(): this;
  removeData(key: string | number | symbol): this;
  removeData(key?: any) {
    return this.each((value: any) => {
      removeData(value, key);
    });
  }
  on(
    name: string,
    callback: (
      this: TElement extends Window ? any : TElement,
      event: any
    ) => void
  ): this;
  on(
    name: string,
    selector: string,
    callback: (
      this: TElement extends Window ? typeof self : TElement,
      event: any
    ) => void
  ): this;
  on(
    name: string,
    selector: any,
    callback?: (
      this: TElement extends Window ? typeof self : TElement,
      event: any
    ) => void
  ): this {
    on(this, name, selector, callback as any);

    return this;
  }
  one(
    name: string,
    callback: (
      this: TElement extends Window ? any : TElement,
      event: any
    ) => void
  ): this;
  one(
    name: string,
    selector: string,
    callback: (
      this: TElement extends Window ? typeof self : TElement,
      event: any
    ) => void
  ): this;
  one(
    name: string,
    selector: any,
    callback?: (
      this: TElement extends Window ? typeof self : TElement,
      event: any
    ) => void
  ): this {
    one(this, name, selector, callback as any);

    return this;
  }
  off(
    name?: string,
    callback?: (
      this: TElement extends Window ? any : TElement,
      event: any
    ) => void
  ): this;
  off(
    name: string,
    selector: string,
    callback: (
      this: TElement extends Window ? typeof self : TElement,
      event: any
    ) => void
  ): this;
  off(
    name: string,
    selector: any,
    callback?: (
      this: TElement extends Window ? typeof self : TElement,
      event: any
    ) => void
  ): this {
    off(this, name, selector, callback as any);

    return this;
  }
  detach(selector?: string): this {
    if (selector === void 0) {
      return this.each((value) => {
        if (value instanceof Node) value.parentNode?.removeChild(value);
      });
    }
    return this.each((value: any) => {
      if (value instanceof Element && value.matches?.(selector)) {
        value.parentNode?.removeChild(value);
      }
    });
  }
  remove(selector?: string): this {
    if (selector === void 0) {
      cleanData(this);
      return this.each((value) => {
        if (value instanceof Node) {
          value.parentNode?.removeChild(value);
        }
      });
    }
    return this.each((value: any) => {
      if (value.matches?.(selector)) {
        cleanData([value]);
        value.parentNode?.removeChild(value);
      }
    });
  }
  text(): string;
  text(content: string | number): this;
  text(content?: string | number): string | this {
    if (content === undefined) {
      return getText(this as any);
    }

    return this.each((value) => {
      if (
        value instanceof Node &&
        (value.nodeType === 1 || value.nodeType === 11 || value.nodeType === 9)
      ) {
        // eslint-disable-next-line functional/immutable-data
        value.textContent = content + "";
      }
    });
  }
  empty(): this {
    cleanData(this);
    return this.each((elem) => {
      if (elem instanceof Node && elem.nodeType === 1) {
        // eslint-disable-next-line functional/immutable-data
        elem.textContent = "";
      }
    });
  }
  append(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | ArrayLikeNotIsString<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | ArrayLikeNotIsString<CustomElementAdd>)
    )[]
  ): this {
    return this.each((el) => {
      if (el instanceof Element) {
        el.append(
          ...Array.from(
            toElements(
              el,
              (el) => (el as unknown as Element)?.innerHTML,
              this.#context,
              ...contents
            )
          )
        );
      }
    });
  }
  prepend(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | ArrayLikeNotIsString<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | ArrayLikeNotIsString<CustomElementAdd>)
    )[]
  ): this {
    return this.each((el) => {
      if (el instanceof Element) {
        el.prepend(
          ...Array.from(
            toElements(
              el,
              (el) => (el as unknown as Element)?.innerHTML,
              this.#context,
              ...contents
            )
          )
        );
      }
    });
  }
  after(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | ArrayLikeNotIsString<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | ArrayLikeNotIsString<CustomElementAdd>)
    )[]
  ): this {
    return this.each((el) => {
      if (el instanceof Element) {
        el.after(
          ...Array.from(
            toElements(
              el,
              (el) => (el as unknown as Element)?.innerHTML,
              this.#context,
              ...contents
            )
          )
        );
      }
    });
  }
  before(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | ArrayLikeNotIsString<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | ArrayLikeNotIsString<CustomElementAdd>)
    )[]
  ): this {
    return this.each((el) => {
      if (el instanceof Element) {
        el.before(
          ...Array.from(
            toElements(
              el,
              (el) => (el as unknown as Element)?.innerHTML,
              this.#context,
              ...contents
            )
          )
        );
      }
    });
  }
  clone(dataAndEvent = false, deepDataAndEvent: boolean = dataAndEvent) {
    return this.map((elem: any) => clone(elem, dataAndEvent, deepDataAndEvent));
  }
  html(): string;
  html(htmlString: string): this;
  html(htmlString?: string): string | this {
    if (htmlString === undefined) {
      return (this[0] as unknown as Element)?.innerHTML;
    }

    return this.each((value: any) => {
      // eslint-disable-next-line functional/immutable-data
      value.innerHTML = htmlString;
    });
  }
  replaceWith(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | ArrayLikeNotIsString<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | ArrayLikeNotIsString<CustomElementAdd>)
    )[]
  ): this {
    this.after(...contents);
    this.remove();

    return this;
  }
  appendTo(selector: ParamNewKijs<Element>): this {
    new Kijs(selector).append(this as unknown as ArrayLikeNotIsString<Element>);
    return this;
  }
  prependTo(selector: ParamNewKijs<Element>): this {
    new Kijs(selector).prepend(
      this as unknown as ArrayLikeNotIsString<Element>
    );
    return this;
  }
  insertAfter(selector: ParamNewKijs<Element>): this {
    new Kijs(selector).after(this as unknown as ArrayLikeNotIsString<Element>);
    return this;
  }
  insertBefore(selector: ParamNewKijs<Element>): this {
    new Kijs(selector).before(this as unknown as ArrayLikeNotIsString<Element>);
    return this;
  }
  replaceAll(selector: ParamNewKijs<Element>): this {
    new Kijs(selector).replaceWith(
      this as unknown as ArrayLikeNotIsString<Element>
    );
    return this;
  }
  css(props: readonly string[]): Record<string, string>;
  css(prop: string): string;
  css(prop: string, value: string | number): this;
  css(css: { readonly [prop: string]: string | number }): this;
  css(prop: any, value?: any) {
    if (Array.isArray(prop)) {
      const map = {} as any;
      const el = this[0];

      if (el instanceof Element) {
        const styles = getStyles(el);
        prop.forEach((prop) => {
          // eslint-disable-next-line functional/immutable-data
          map[prop] = css(el as unknown as HTMLElement, prop, false, styles);
        });
      }

      return map;
    }
    if (typeof prop !== "object" && value === undefined) {
      return css(this[0] as unknown as HTMLElement, prop);
    }
    if (isObject(prop)) {
      return this.each((elem) => {
        if (elem instanceof HTMLElement) {
          each(prop, (value, prop: any) => {
            style(elem, prop, value);
          });
        }
      });
    }

    return this.each((elem) => {
      if (elem instanceof HTMLElement) {
        style(elem, prop, value);
      }
    });
  }
  attr(name: string, value: string): this;
  attr(name: string): string;
  attr(attributes: {
    // eslint-disable-next-line functional/prefer-readonly-type
    [name: string]: string;
  }): this;
  attr(name: any, value?: string) {
    if (isObject(name)) {
      each(name, (value, key: string) => this.attr(key, value));

      return this;
    }

    if (value === void 0) {
      return attr(this[0] as unknown as HTMLElement, name);
    }

    return this.each((v) => {
      if (v instanceof Element) attr(v, name, value);
    });
  }
  removeAttr(name: string): this {
    return this.each((v) => {
      if (v instanceof Element) removeAttr(v, name);
    });
  }
  prop<T = any>(name: string): void | T;
  prop(props: {
    // eslint-disable-next-line functional/prefer-readonly-type
    [name: string | number | symbol]: any;
  }): this;
  prop<T = any>(name: string, value: T): this;
  prop<T = any>(name: any, value?: T) {
    if (isObject(name)) {
      each(name, (value, key: string) => this.prop(key, value));

      return this;
    }

    if (value === void 0) {
      return prop(this[0] as unknown as HTMLElement, name);
    }

    return this.each((v: any) => {
      prop(v, name, value);
    });
  }
  removeProp(name: string): this {
    return this.each((v: any) => {
      removeProp(v, name);
    });
  }
  addClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    addClass(this as unknown as readonly HTMLElement[], classes);

    return this;
  }
  removeClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    removeClass(this as unknown as readonly HTMLElement[], classes);

    return this;
  }
  toggleClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    toggleClass(this as unknown as readonly HTMLElement[], classes as any);

    return this;
  }
  hasClass(clazz: string): boolean {
    return hasClass(this as unknown as readonly HTMLElement[], clazz);
  }
  value(): string | number | readonly (string | number)[];
  value(value: string | number | readonly (string | number)[]): this;
  value(val?: any) {
    if (val === void 0) {
      return value(this as unknown as readonly HTMLElement[]);
    }

    value(this as unknown as readonly HTMLElement[], val);

    return this;
  }
  val(): string | number | readonly (string | number)[];
  val(value: string | number | readonly (string | number)[]): this;
  val(val?: any) {
    if (val === void 0) {
      return value(this as unknown as readonly HTMLElement[]);
    }

    value(this as unknown as readonly HTMLElement[], val);

    return this;
  }
  trigger(name: string, data?: any) {
    return this.each((elem) => {
      if (elem instanceof EventTarget) {
        const event = new Event(name);
        // eslint-disable-next-line functional/immutable-data
        (event as any).data = data;

        if ((elem as any)[name] && data === void 0) {
          (elem as any)[name]();
        } else {
          elem.dispatchEvent(event);
        }

        (elem as any)[`on${name}`]?.(event);
      }
    });
  }
  triggerHandler(name: string, data: any): any {
    // eslint-disable-next-line functional/no-let
    let lastVal;
    (weakCacheEvent as any)
      .get(this[0])
      ?.get(name)
      .forEach((cb: any) => {
        const event = new Event(name);
        // eslint-disable-next-line functional/immutable-data
        (event as any).data = data;
        lastVal = cb.handler.call(this[0], event);
      });

    return lastVal;
  }
  serialize(): string {
    return toParam(this.serializeArray());
  }
  serializeArray(): readonly {
    readonly name: string;
    readonly value: string;
  }[] {
    return this.filter((elem: any) => {
      const type = elem.type;

      return (
        elem.name &&
        !new Kijs(elem).is(":disabled") &&
        rsubmittable.test(elem.nodeName) &&
        !rsubmitterTypes.test(type) &&
        (elem.checked || !rcheckableType.test(type))
      );
    })
      .toArray()
      .map((elem: any) => {
        const val = value([elem]);

        if (val == null) {
          return null;
        }

        if (Array.isArray(val)) {
          return val.map((val) => {
            return {
              name: (elem as any).name,
              value: val.replace(rCRLF, "\r\n"),
            };
          });
        }

        return {
          name: (elem as any).name,
          value: val.replace(rCRLF, "\r\n"),
        };
      })
      .filter(Boolean) as any;
  }

  wrapAll(html: ParamNewKijs<Element>): this {
    // eslint-disable-next-line functional/no-let
    let wrap;

    if (this[0]) {
      if (isFunction(html)) {
        html = html.call(this[0]);
      }

      // The elements to wrap the target around

      wrap = new Kijs(
        html,
        this,
        (this[0] as unknown as HTMLElement).ownerDocument
      )
        .eq(0)
        .clone(true);

      if ((this[0] as unknown as HTMLElement).parentNode) {
        wrap.insertBefore(this[0] as unknown as HTMLElement);
      }

      new Kijs(
        wrap.map((elem: any) => {
          while (elem.firstElementChild) {
            elem = elem.firstElementChild;
          }

          return elem;
        })
      ).append(this[0] as unknown as HTMLElement);
    }

    return this;
  }

  wrapInner<T extends Element>(html: ParamNewKijs<T>): this {
    if (isFunction(html)) {
      return this.each((e, i) => {
        new Kijs(e).wrapInner(html.call(this, i));
      });
    }

    return this.each((e) => {
      const self = new Kijs(e),
        contents = self.contents();

      if (contents.length) {
        contents.wrapAll(html);
      } else {
        self.append(html as any);
      }
    });
  }

  wrap<T extends Element>(
    html:
      | ParamNewKijs<T>
      | ((index: number, element: TElement) => ParamNewKijs<T>)
  ): this {
    const htmlIsFunction = isFunction(html);

    return this.each((el, i) => {
      new Kijs(el).wrapAll(htmlIsFunction ? html.call(el, i, el) : html);
    });
  }

  unwrap(selector?: string): this {
    this.parent(selector)
      .not("body")
      .each((e) => {
        new Kijs(e).replaceWith(e.childNodes as any);
      });
    return this;
  }

  offset(options: { readonly top: number; readonly left: number }): this;
  offset(): {
    readonly top: number;
    readonly left: number;
  };
  offset(options?: any) {
    if (options === undefined) {
      return offset(this[0] as unknown as HTMLElement);
    }

    return this.each((el) => offset(el as unknown as HTMLElement, options));
  }

  position(): ReturnType<typeof position> {
    return position(this[0] as unknown as HTMLElement);
  }

  offsetParent(): readonly typeof HTMLElement["prototype"]["offsetParent"][] {
    return this.map((elem) => {
      // eslint-disable-next-line functional/no-let
      let offsetParent = (elem as unknown as any)?.offsetParent;

      while (offsetParent && css(offsetParent, "position") === "static") {
        offsetParent = offsetParent.offsetParent;
      }

      return offsetParent || document.documentElement;
    }) as any;
  }

  scrollLeft(): number;
  scrollLeft(value: number): this;
  scrollLeft(value?: number) {
    if (value === void 0) {
      return pageOffset(this, "scrollLeft");
    }

    pageOffset(this, "scrollLeft", value);

    return this;
  }

  scrollTop(): number;
  scrollTop(value: number): this;
  scrollTop(value?: number) {
    if (value === void 0) {
      return pageOffset(this, "scrollTop");
    }

    pageOffset(this, "scrollTop", value);

    return this;
  }

  bind(name: string, callback: (this: TElement, event: any) => void): this {
    return this.on(name, callback as any);
  }
  unbind(name: string, callback: (this: TElement, event: any) => void): this {
    return this.off(name, callback as any);
  }

  delegate(
    selector: string,
    name: string,
    callback: (this: TElement, event: any) => void
  ): this {
    return this.on(name, selector, callback as any);
  }
  undelegate(
    selector: string,
    name: string,
    callback: (this: TElement, event: any) => void
  ): this {
    // ( namespace ) or ( selector, types [, fn] )
    // eslint-disable-next-line functional/functional-parameters
    return arguments.length === 1
      ? this.off(selector)
      : this.off(name, selector || "*", callback as any);
  }

  height(): number;
  height(value: number, margin?: boolean): this;
  height(value?: number, margin = false): any {
    return callSizeof.call(this, "height", "content", value, margin);
  }
  innerHeight(): number;
  innerHeight(value: number, margin?: boolean): this;
  innerHeight(value?: number, margin = false): any {
    return callSizeof.call(this, "height", "padding", value, margin);
  }
  outerHeight(): number;
  outerHeight(value: number, margin?: boolean): this;
  outerHeight(value?: number, margin = false): any {
    return callSizeof.call(this, "height", "", value, margin);
  }

  width(): number;
  width(value: number, margin?: boolean): this;
  width(value?: number, margin = false): any {
    return callSizeof.call(this, "width", "content", value, margin);
  }
  innerWidth(): number;
  innerWidth(value: number, margin?: boolean): this;
  innerWidth(value?: number, margin = false): any {
    return callSizeof.call(this, "width", "padding", value, margin);
  }
  outerWidth(): number;
  outerWidth(value: number, margin?: boolean): this;
  outerWidth(value?: number, margin = false): any {
    return callSizeof.call(this, "width", "", value, margin);
  }

  blur(callback?: (event: EventOf<"blur">) => void): this {
    return callback === void 0
      ? this.trigger("blur")
      : this.on("blur", callback);
  }
  focus(callback?: (event: EventOf<"focus">) => void): this {
    return callback === void 0
      ? this.trigger("focus")
      : this.on("focus", callback);
  }
  focusin(callback?: (event: EventOf<"focusin">) => void): this {
    return callback === void 0
      ? this.trigger("focusin")
      : this.on("focusin", callback);
  }
  focusout(callback?: (event: EventOf<"focusout">) => void): this {
    return callback === void 0
      ? this.trigger("focusout")
      : this.on("focusout", callback);
  }
  resize(callback?: (event: EventOf<"resize">) => void): this {
    return callback === void 0
      ? this.trigger("resize")
      : this.on("resize", callback);
  }
  scroll(callback?: (event: EventOf<"scroll">) => void): this {
    return callback === void 0
      ? this.trigger("scroll")
      : this.on("scroll", callback);
  }
  click(callback?: (event: EventOf<"click">) => void): this {
    return callback === void 0
      ? this.trigger("click")
      : this.on("click", callback);
  }
  dblclick(callback?: (event: EventOf<"dblclick">) => void): this {
    return callback === void 0
      ? this.trigger("dblclick")
      : this.on("dblclick", callback);
  }
  mousedown(callback?: (event: EventOf<"mousedown">) => void): this {
    return callback === void 0
      ? this.trigger("mousedown")
      : this.on("mousedown", callback);
  }
  mouseup(callback?: (event: EventOf<"mouseup">) => void): this {
    return callback === void 0
      ? this.trigger("mouseup")
      : this.on("mouseup", callback);
  }
  mouseover(callback?: (event: EventOf<"mouseover">) => void): this {
    return callback === void 0
      ? this.trigger("mouseover")
      : this.on("mouseover", callback);
  }
  mouseenter(callback?: (event: EventOf<"mouseenter">) => void): this {
    return callback === void 0
      ? this.trigger("mouseenter")
      : this.on("mouseenter", callback);
  }
  mouseleave(callback?: (event: EventOf<"mouseleave">) => void): this {
    return callback === void 0
      ? this.trigger("mouseleave")
      : this.on("mouseleave", callback);
  }
  change(callback?: (event: EventOf<"change">) => void): this {
    return callback === void 0
      ? this.trigger("change")
      : this.on("change", callback);
  }
  select(callback?: (event: EventOf<"select">) => void): this {
    return callback === void 0
      ? this.trigger("select")
      : this.on("select", callback);
  }
  submit(callback?: (event: EventOf<"submit">) => void): this {
    return callback === void 0
      ? this.trigger("submit")
      : this.on("submit", callback);
  }
  keydown(callback?: (event: EventOf<"keydown">) => void): this {
    return callback === void 0
      ? this.trigger("keydown")
      : this.on("keydown", callback);
  }
  keypress(callback?: (event: EventOf<"keypress">) => void): this {
    return callback === void 0
      ? this.trigger("keypress")
      : this.on("keypress", callback);
  }
  keyup(callback?: (event: EventOf<"keyup">) => void): this {
    return callback === void 0
      ? this.trigger("keyup")
      : this.on("keyup", callback);
  }
  contextmenu(callback?: (event: EventOf<"contextmenu">) => void): this {
    return callback === void 0
      ? this.trigger("contextmenu")
      : this.on("contextmenu", callback);
  }

  hover(
    cb: (event: EventOf<"mouseenter"> | EventOf<"mouseleave">) => void
  ): this;
  hover(
    fnOver: (event: EventOf<"mouseenter">) => void,
    fnOut: (event: EventOf<"mouseleave">) => void
  ): this;
  hover(
    fnOver: (event: EventOf<"mouseenter">) => void,
    fnOut?: (event: EventOf<"mouseleave">) => void
  ): this {
    this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    return this;
  }
}

function callSizeof(
  this: any,
  type: "height" | "width",
  defaultExtra: "padding" | "content" | "",
  value?: number,
  margin = false
) {
  const name = type.toUpperCase();
  const funcName = {
    padding: "inner" + name,
    content: type,
    "": "outer" + name,
  }[defaultExtra];

  const extra = !!defaultExtra || (margin === true ? "margin" : "border");

  // eslint-disable-next-line functional/no-let
  let result: number | string | void;
  this.each((elem: Element) => {
    // eslint-disable-next-line functional/no-let
    let doc;

    if ((elem as any).window === elem) {
      // $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
      result =
        funcName.indexOf("outer") === 0
          ? (elem as any)["inner" + name]
          : (elem as any).document.documentElement["client" + name];
      return false;
    }

    // Get document width or height
    if (elem.nodeType === 9) {
      doc = (elem as any).documentElement;

      // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
      // whichever is greatest
      result = Math.max(
        (elem as any).body["scroll" + name],
        doc["scroll" + name],
        (elem as any).body["offset" + name],
        doc["offset" + name],
        doc["client" + name]
      );

      return false;
    }

    if (value === undefined) {
      result = css(elem as any, type, extra);

      return false;
    }

    style(elem as any, type, value, extra);
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return result === undefined ? this : result;
}

type Events = {
  readonly blur: Event;
  readonly focus: FocusEvent;
  readonly focusin: FocusEvent;
  readonly focusout: FocusEvent;
  readonly resize: UIEvent;
  readonly scroll: Event;
  readonly click: MouseEvent;
  readonly dblclick: MouseEvent;
  readonly mousedown: MouseEvent;
  readonly mouseup: MouseEvent;
  readonly mouseover: MouseEvent;
  readonly mouseenter: MouseEvent;
  readonly mouseleave: MouseEvent;
  readonly change: Event;
  readonly select: UIEvent | Event;
  readonly submit: SubmitEvent;
  readonly keydown: KeyboardEvent;
  readonly keypress: KeyboardEvent;
  readonly keyup: KeyboardEvent;
  readonly contextmenu: MouseEvent;
};

type EventOf<T extends keyof Events> = Events[T];

function toElements<TElement = HTMLElement, T = TElement>(
  elem: TElement,
  callParm: (item: TElement) => T,
  context: Document,
  // eslint-disable-next-line functional/functional-parameters
  ...contents: readonly (
    | CustomElementAdd
    | ArrayLikeNotIsString<CustomElementAdd>
    | Kijs<any, any>
    | ((
        index: number,
        html: T
      ) =>
        | CustomElementAdd
        | ArrayLikeNotIsString<CustomElementAdd>
        | Kijs<any, any>)
  )[]
) {
  const elementsAdd = new Set<Node>();

  each(contents, (it, index) => {
    if (typeof it === "function") {
      it = it.call(elem, index, callParm(elem));
    }

    if (isArrayLike(it)) {
      toElements(
        elem,
        callParm,
        context,
        ...(Array.from(it as any) as any)
      ).forEach((el) => {
        elementsAdd.add(el);
      });

      return;
    }

    if (typeof it === "string") {
      const itTrimed = trim(it);
      if (!rSelector.test(itTrimed[0])) {
        Array.from(createFragment(it).childNodes).forEach((i) =>
          elementsAdd.add(i)
        );
      } else {
        elementsAdd.add(document.createTextNode(it));
      }

      return;
    }

    if (it instanceof Node) {
      if (context.documentElement.contains(it)) {
        elementsAdd.add(it.cloneNode(true));
      }
    }
  });

  return elementsAdd;
}

export default kijs;
export { Kijs };
