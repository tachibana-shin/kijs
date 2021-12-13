/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { attr, removeAttr } from "./static/attr";
import {
  addClass,
  hasClass,
  removeClass,
  toggleClass,
} from "./static/className";
import cleanData from "./static/cleanData";
import clone from "./static/clone";
import css from "./static/css";
import setData, { removeData } from "./static/data";
import each from "./static/each";
import { off, on, one, weakCacheEvent } from "./static/event";
import extend from "./static/extend";
import offset from "./static/offset";
import pageOffset from "./static/pageOffset";
import position from "./static/position";
import prop, { removeProp } from "./static/prop";
import ready from "./static/ready";
import style from "./static/style";
import getText from "./static/text";
import toParam from "./static/toParam";
import value from "./static/value";
import type LikeArray from "./types/LikeArray";
import createFragment from "./utils/createFragment";
import getStyles from "./utils/getStyles";
import { isArrayLike, isFunction, isObject } from "./utils/is";

// eslint-disable-next-line functional/prefer-readonly-type
type TypeOrArray<T> = T | T[] | readonly T[] | LikeArray<T>;
// type Node = Element | Text | Comment | Document | DocumentFragment;
type htmlString = string;
type Selector = keyof HTMLElementTagNameMap & keyof SVGElementTagNameMap[K];
type ReturnKijs<TElement = Node> = Kijs<TElement> & {
  readonly [index: number]: !TElement;
};
type ParamNewKijs<TElement> =
  | Selector
  | TypeOrArray<TElement>
  | htmlString
  | Node
  | Window
  | void
  | null;
type CustomElementAdd = string | Element | Text;

const rSelector = /[a-zA-Z_]|\.|#/;
const rCRLF = /\r?\n/g,
  rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
  rsubmittable = /^(?:input|select|textarea|keygen)/i;

const rcheckableType = /^(?:checkbox|radio)$/i;

function kijs<TElement = HTMLElement>(
  selector: ParamNewKijs<TElement>,
  prevObject?: ReturnKijs<TElement>,
  context = document
): ReturnKijs<TElement> {
  return new Kijs<TElement>(selector, prevObject, context) as any;
}

class Kijs<TElement = HTMLElement> {
  // eslint-disable-next-line functional/prefer-readonly-type
  length = 0;
  readonly #prevObject: ReturnKijs<TElement> | undefined;
  readonly #context: Document;
  readonly kijs = true;
  constructor(
    selector: ParamNewKijs<TElement>,
    prevObject?: ReturnKijs<TElement>,
    context = document
  ) {
    this.#prevObject = prevObject;
    this.#context = context;
    if (selector instanceof Kijs) {
      return selector as any;
    }

    const elements = new Set<TElement>();
    if (typeof selector === "string") {
      // document
      selector = selector.trim();

      if (rSelector.test(selector[0])) {
        // this is query
        this.#context.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          elements.add(el as any);
        });
      } else {
        // create element
        createFragment(selector).childNodes.forEach((el) => {
          elements.add(el as any);
        });
      }
    }
    if (isArrayLike(selector)) {
      selector.forEach((i) => elements.add(i));
    }

    // eslint-disable-next-line functional/no-let
    let index = 0;
    Array.from(elements.values()).forEach((item) => {
      (this as any)[index++] = item;
    });
  }
  each(
    callback: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => void | false
  ): this {
    each(this as any, callback);

    return this;
  }
  map<T = TElement>(
    callback: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => T
  ): ReturnKijs<T> {
    return kijs(Array.prototype.map.call(this, callback));
  }
  filter(
    callback: (
      this: TElement,
      element: TElement,
      index: number,
      kijs: this
    ) => boolean | void
  ): ReturnKijs<TElement> {
    return kijs(Array.prototype.filter.call(this, callback));
  }
  toArray(): TElement[] {
    return Array.from(this as any);
  }
  get(index: number): TElement | void {
    return (this as any)[index < -1 ? this.length + index : index];
  }
  pushStack(elements: LikeArray<TElement>): ReturnKijs<TElement> {
    return kijs(elements, this as any);
  }
  slice(start: number, end?: number): ReturnKijs<TElement> {
    return kijs(
      Array.prototype.slice.call(this as any, start, end),
      this as any
    );
  }
  eq(index: number): ReturnKijs<TElement> {
    return kijs(this.get(index), this as any);
  }
  first(): ReturnKijs<TElement> {
    return this.eq(0);
  }
  last(): ReturnKijs<TElement> {
    return this.eq(-1);
  }
  even(): ReturnKijs<TElement> {
    return this.filter((_el, index) => index % 2 === 0);
  }
  odd(): ReturnKijs<TElement> {
    return this.filter((_el, index) => index % 2 !== 0);
  }
  end() {
    return this.#prevObject || kijs();
  }
  readonly push = Array.prototype.push;
  readonly sort = Array.prototype.sort;
  readonly splice = Array.prototype.splice;
  readonly extend = extend as unknown as (
    ...src: readonly LikeArray<TElement>[]
  ) => this;
  find<T = Element>(selector: ParamNewKijs<T>): ReturnKijs<T> {
    if (typeof selector === "string") {
      const elements = new Set<T>();
      this.each((value) => {
        if (value instanceof Element) {
          value.querySelectorAll<T>(selector).forEach((i) => elements.add(i));
        }
      });

      return kijs(Array.from(elements.values()), this as any);
    }

    return kijs(selector).filter((value) => {
      // eslint-disable-next-line functional/no-let
      let { length } = this;

      while (length--) {
        if ((this as any)[length].contains(value)) {
          return true;
        }
      }
    });
  }
  not(selector: ParamNewKijs<TElement>): ReturnKijs<TElement>;
  not(
    filter: (this: TElement, index: number, element: TElement) => void | boolean
  ): ReturnKijs<TElement>;
  not(selector: any) {
    if (typeof selector === "function") {
      return this.filter((value, index) => {
        return !selector.call(value, index, value);
      });
    }

    const elements = Array.from(kijs(selector)); /* free */

    return this.filter((value) => {
      return elements.includes(value) === false;
    });
  }
  is(selector: ParamNewKijs<TElement>): ReturnKijs<TElement>;
  is(
    filter: (this: TElement, index: number, element: TElement) => void | boolean
  ): ReturnKijs<TElement>;
  is(selector: any) {
    if (typeof selector === "function") {
      return this.filter(selector);
    }

    if (typeof selector === "string") {
      return this.filter((value) => {
        return value instanceof Element && value.matches(selector);
      });
    }

    const elements = Array.from(kijs(selector)); /* free */

    return this.filter((value) => {
      return elements.includes(value);
    });
  }
  readonly init = kijs;
  has(element: ParamNewKijs<TElement>): ReturnKijs<TElement> {
    const elements = kijs(element);

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
  closest<T extends Element>(selector: ParamNewKijs<T>): ReturnKijs<T> {
    if (typeof selector === "string") {
      const elements = new Set<T>();

      this.each((value) => {
        if (value instanceof Element) {
          const el = value.closest<T>(selector);
          if (el) {
            elements.add(el);
          }
        }
      });

      return kijs(Array.from(elements.values()), this as any);
    }

    return kijs(selector).filter((value) => {
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
    });
  }
  index(selector?: string | ReturnKijs<TElement> | TElement): number {
    if (selector === undefined) {
      return (this as any)[0]?.parentNode
        ? this.first().prevAll().length || -1
        : -1;
    }

    if (typeof selector === "string") {
      return Array.prototype.indexOf.call(kijs(selector), (this as any)[0]);
    }

    return Array.prototype.indexOf.call(
      this as any,
      selector instanceof Kijs ? selector[0] : selector
    );
  }
  add(selector: ParamNewKijs<TElement>): ReturnKijs<TElement> {
    return this.pushStack(kijs(selector));
  }
  addBack(selector: ParamNewKijs<TElement>): ReturnKijs<TElement> {
    return kijs(selector).pushStack(this.toArray());
  }
  parent<T = Node>(selector?: string): ReturnKijs<T> {
    const elements = new Set<T>();

    if (selector === void 0) {
      this.each((value) => {
        if (
          value instanceof Node &&
          value.parentNode &&
          value.parentNode.nodeType < 11
        ) {
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

    return kijs(Array.from(elements.values()), this as any);
  }
  parents<T extends Element>(selector?: string): ReturnKijs<T> {
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

    return kijs(Array.from(elements.values()));
  }
  parentsUntil<T extends Element>(
    excludeSelector?: ParamNewKijs<T>,
    selector?: string
  ): ReturnKijs<TElement> {
    const exclude = kijs(excludeSelector || []).toArray();
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

    return kijs(Array.from(elements.values()));
  }
  next<T extends Element>(selector?: string): ReturnKijs<T> {
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

    return kijs(Array.from(elements.values()), this as any);
  }
  prev<T extends Element>(selector?: string): ReturnKijs<T> {
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

    return kijs(Array.from(elements.values()), this as any);
  }
  nextAll<T extends Element>(selector?: string): ReturnKijs<T> {
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

    return kijs(Array.from(elements.values()), this as any);
  }
  prevAll<T extends Element>(selector?: string): ReturnKijs<T> {
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

    return kijs(Array.from(elements.values()), this as any);
  }
  nextUntil<T extends Element>(
    selectorExclude?: ParamNewKijs<T>,
    selector?: string
  ): ReturnKijs<TElement> {
    const exclude = kijs(selectorExclude || []).toArray();
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

    return kijs(Array.from(elements.values()), this as any);
  }
  prevUntil<R extends Element, T extends Element>(
    selectorExclude?: ParamNewKijs<T>,
    selector?: string
  ): ReturnKijs<R> {
    const exclude = kijs(selectorExclude || []).toArray();
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

    return kijs(Array.from(elements.values()), this as any);
  }
  siblings<T extends Element>(selector?: string): ReturnKijs<T> {
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

    return kijs(Array.from(elements.values()), this as any);
  }
  children<T extends Element>(selector?: string): ReturnKijs<T> {
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

    return kijs(Array.from(elements.values()), this as any);
  }
  contents<T extends Element>(): ReturnKijs<T> {
    const elements = new Set<T>();

    this.each((value: any) => {
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
    });

    return kijs(Array.from(elements.values()), this as any);
  }
  readonly ready = ready;

  data<T extends object>(): T;
  data<R = any>(key: string | number | symbol): R;
  data<V = any>(key: string | number | symbol, value: V): this;
  data<D extends object>(data: D): this;
  data(key?: any, value?: any) {
    if (isObject(key) || value !== undefined) {
      this.each((value: any) => {
        setData(value, key, value);
      });

      return this;
    }

    return setData((this as any)[0], key);
  }
  removeData(): this;
  removeData(key: string | number | symbol): this;
  removeData(key?: any) {
    this.each((value: any) => {
      removeData(value, key);
    });

    return this;
  }
  on<N extends string, E extends Event>(
    name: N,
    callback: (this: TElement, event: E) => void
  ): this;
  on<N extends string, E extends Event>(
    name: N,
    selector: string,
    callback: (this: TElement, event: E) => void
  ): this;
  on<N extends string, E extends Event>(
    name: N,
    selector: any,
    callback?: (this: TElement, event: E) => void
  ): this {
    on(this as any, name, selector, callback as any);

    return this;
  }
  one<N extends string, E extends Event>(
    name: N,
    callback: (this: TElement, event: E) => void
  ): this;
  one<N extends string, E extends Event>(
    name: N,
    selector: string,
    callback: (this: TElement, event: E) => void
  ): this;
  one<N extends string, E extends Event>(
    name: N,
    selector: any,
    callback?: (this: TElement, event: E) => void
  ): this {
    one(this as any, name, selector, callback as any);

    return this;
  }
  off<N extends string, E extends Event>(
    name?: N,
    callback?: (this: TElement, event: E) => void
  ): this;
  off<N extends string, E extends Event>(
    name: N,
    selector: string,
    callback: (this: TElement, event: E) => void
  ): this;
  off<N extends string, E extends Event>(
    name: N,
    selector: any,
    callback?: (this: TElement, event: E) => void
  ): this {
    off(this as any, name, selector, callback as any);

    return this;
  }
  detach(selector?: string): this {
    if (selector === void 0) {
      this.each((value) => {
        if (value instanceof Node) value.parentNode?.removeChild(value);
      });
    } else {
      this.each((value: any) => {
        if (value instanceof Element && value.matches?.(selector)) {
          value.parentNode?.removeChild(value);
        }
      });
    }

    return this;
  }
  remove(selector?: string): this {
    if (selector === void 0) {
      cleanData(this as any);
      this.each((value) => {
        if (value instanceof Node) {
          value.parentNode?.removeChild(value);
        }
      });
    } else {
      this.each((value: any) => {
        if (value.matches?.(selector)) {
          cleanData([value]);
          value.parentNode?.removeChild(value);
        }
      });
    }

    return this;
  }
  text(): string;
  text(content: string | number): this;
  text(content?: string | number): string | this {
    if (content === undefined) {
      return getText(this as any);
    }

    this.empty().each((value) => {
      if (
        value instanceof Node &&
        (value.nodeType === 1 || value.nodeType === 11 || value.nodeType === 9)
      ) {
        // eslint-disable-next-line functional/immutable-data
        value.textContent = content + "";
      }
    });

    return this;
  }
  empty(): this {
    cleanData(this as any);
    this.each((elem) => {
      if (elem instanceof Node && elem.nodeType === 1) {
        // eslint-disable-next-line functional/immutable-data
        elem.textContent = "";
      }
    });

    return this;
  }
  append(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(
      this as any,
      (elem, child) => elem.append(...child),
      (e) => e.innerHTML,
      ...contents
    );

    return this;
  }
  prepend(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(
      this as any,
      (elem, child) => elem.prepend(...child),
      (e) => e.innerHTML,
      ...contents
    );

    return this;
  }
  after(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(
      this as any,
      (elem, child) => elem.after(...child),
      (e) => e.innerHTML,
      ...contents
    );

    return this;
  }
  before(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(
      this as any,
      (elem, child) => elem.before(...child),
      (e) => e.innerHTML,
      ...contents
    );

    return this;
  }
  clone(
    dataAndEvent = false,
    deepDataAndEvent: boolean = dataAndEvent
  ): ReturnKijs<TElement> {
    return this.map((elem: any) => clone(elem, dataAndEvent, deepDataAndEvent));
  }
  html(): string;
  html(htmlString: string): this;
  html(htmlString?: string): string | this {
    if (htmlString === undefined) {
      return (this as any)[0].innerHTML;
    }

    this.each((value: any) => {
      // eslint-disable-next-line functional/immutable-data
      value.innerHTML = htmlString;
    });

    return this;
  }
  replaceWith(
    // eslint-disable-next-line functional/functional-parameters
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(
      this as any,
      (elem, child) => elem.after(...child),
      (e) => e.innerHTML,
      ...contents
    );

    this.remove();

    return this;
  }
  appendTo(selector: ParamNewKijs<Element>): this {
    kijs(selector).append(this as any);
    return this;
  }
  prependTo(selector: ParamNewKijs<Element>): this {
    kijs(selector).prepend(this as any);
    return this;
  }
  insertAfter(selector: ParamNewKijs<Element>): this {
    kijs(selector).after(this as any);
    return this;
  }
  insertBefore(selector: ParamNewKijs<Element>): this {
    kijs(selector).before(this as any);
    return this;
  }
  replaceAll(selector: ParamNewKijs<Element>): this {
    kijs(selector).replaceWith(this as any);
    return this;
  }
  css<Prop extends keyof CSSStyleDeclaration>(
    props: readonly Prop[]
  ): Record<Prop, CSSStyleDeclaration[Prop]>;
  css<Prop extends keyof CSSStyleDeclaration>(
    prop: Prop
  ): CSSStyleDeclaration[Prop];
  css<Prop extends keyof CSSStyleDeclaration>(
    prop: Prop,
    value: CSSStyleDeclaration[Prop]
  ): this;
  css<Prop extends keyof CSSStyleDeclaration>(css: {
    readonly [prop: string]: CSSStyleDeclaration[Prop];
  }): this;
  css(prop: any, value?: any) {
    if (Array.isArray(prop)) {
      const map = {} as any;
      const styles = getStyles((this as any)[0]);

      prop.forEach((prop) => {
        // eslint-disable-next-line functional/immutable-data
        map[prop] = css((this as any)[0], prop, false, styles);
      });

      return map;
    }
    if (typeof prop !== "object" && value === undefined) {
      return css((this as any)[0], prop);
    }
    if (isObject(prop)) {
      this.each((elem) => {
        if (elem instanceof HTMLElement) {
          each(prop, (value, prop: any) => {
            style(elem, prop, value);
          });
        }
      });

      return this;
    }

    this.each((elem) => {
      if (elem instanceof HTMLElement) {
        style(elem, prop, value);
      }
    });

    return this;
  }
  attr(name: string): this | string;
  attr(name: string, value: string): this;
  attr(name: string, value?: string) {
    if (value === void 0) {
      return attr((this as any)[0], name);
    }

    this.each((v) => {
      if (v instanceof Element) attr(v, name, value);
    });

    return this;
  }
  removeAttr(name: string): this {
    this.each((v) => {
      if (v instanceof Element) removeAttr(v, name);
    });

    return this;
  }
  prop<T = any>(name: string): void | T;
  prop<T = any>(name: string, value: T): this;
  prop<T = any>(name: string, value?: T) {
    if (value === void 0) {
      return prop((this as any)[0], name);
    }

    this.each((v: any) => {
      prop(v, name, value);
    });

    return this;
  }
  removeProp(name: string): this {
    this.each((v: any) => {
      removeProp(v, name);
    });

    return this;
  }
  addClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    addClass(this as any, classes);

    return this;
  }
  removeClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    removeClass(this as any, classes);

    return this;
  }
  toggleClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    toggleClass(this as any, classes as any);

    return this;
  }
  hasClass(clazz: string): boolean {
    return hasClass(this as any, clazz);
  }
  value(): string | number | readonly (string | number)[];
  value(value: string | number | readonly (string | number)[]): this;
  value(val?: any) {
    if (val === void 0) {
      return value(this as any);
    }

    value(this as any, val);

    return this;
  }
  readonly val = this.value;
  trigger(name: string, data: any) {
    this.each((elem) => {
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

    return this;
  }
  triggerHandler(name: string, data: any): any {
    // eslint-disable-next-line functional/no-let
    let lastVal;
    (weakCacheEvent as any)
      .get((this as any)[0])
      ?.get(name)
      .forEach((cb: any) => {
        const event = new Event(name);
        // eslint-disable-next-line functional/immutable-data
        (event as any).data = data;
        lastVal = cb.handler.call((this as any)[0], event);
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
    return this.filter(function (elem: any) {
      const type = elem.type;

      return (
        elem.name &&
        !kijs(elem).is(":disabled") &&
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

    if ((this as any)[0]) {
      if (isFunction(html)) {
        html = html.call((this as any)[0]);
      }

      // The elements to wrap the target around
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      wrap = kijs(html, this as any, (this as any)[0].ownerDocument)
        .eq(0)
        .clone(true);

      if ((this as any)[0].parentNode) {
        wrap.insertBefore((this as any)[0]);
      }

      kijs(
        wrap.map((elem) => {
          while (elem.firstElementChild) {
            elem = elem.firstElementChild;
          }

          return elem;
        })
      ).append(this as any);
    }

    return this;
  }

  wrapInner<T extends Element>(html: ParamNewKijs<T>): this {
    if (isFunction(html)) {
      this.each(function (e, i) {
        kijs(e).wrapInner(html.call(this as any, i));
      });

      return this;
    }

    this.each(function (e) {
      const self = kijs(e),
        contents = self.contents();

      if (contents.length) {
        contents.wrapAll(html);
      } else {
        self.append(html as any);
      }
    });

    return this;
  }

  wrap<T extends Element>(
    html:
      | ParamNewKijs<T>
      | ((index: number, element: TElement) => ParamNewKijs<T>)
  ): this {
    const htmlIsFunction = isFunction(html);

    this.each((el, i) => {
      kijs(el).wrapAll(htmlIsFunction ? html.call(el, i, el) : html);
    });

    return this;
  }

  unwrap(selector: string): this {
    this.parent(selector)
      .not("body")
      .each((e) => {
        kijs(e).replaceWith(e.childNodes as any);
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
      return offset(this as any);
    }

    offset(this as any, options);
    return this;
  }

  position(): ReturnType<typeof position> {
    return position((this as any)[0]);
  }

  offsetParent(): readonly typeof HTMLElement["prototype"]["offsetParent"][] {
    return this.map(function () {
      // eslint-disable-next-line functional/no-let
      let offsetParent = (this as any).offsetParent;

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
      return pageOffset(this as any, "scrollLeft");
    }

    pageOffset(this as any, "scrollLeft", value);

    return this;
  }

  scrollTop(): number;
  scrollTop(value: number): this;
  scrollTop(value?: number) {
    if (value === void 0) {
      return pageOffset(this as any, "scrollTop");
    }

    pageOffset(this as any, "scrollTop", value);

    return this;
  }

  bind<N extends string, E extends Event>(
    name: N,
    callback: (this: TElement, event: E) => void
  ): this {
    return this.on(name, callback);
  }
  unbind<N extends string, E extends Event>(
    name: N,
    callback: (this: TElement, event: E) => void
  ): this {
    return this.off(name, callback);
  }

  delegate<N extends string, E extends Event>(
    selector: string,
    name: N,
    callback: (this: TElement, event: E) => void
  ): this {
    return this.on(name, selector, callback);
  }
  undelegate<N extends string, E extends Event>(
    selector: string,
    name: N,
    callback: (this: TElement, event: E) => void
  ): this {
    // ( namespace ) or ( selector, types [, fn] )
    // eslint-disable-next-line functional/functional-parameters
    return arguments.length === 1
      ? this.off(selector)
      : this.off(name, selector || "*", callback);
  }

  mouseenter(cb: (event: MouseEvent) => void): this {
    return this.on("mouseover", cb);
  }
  mouseleave(cb: (event: MouseEvent) => void): this {
    return this.on("mouseout", cb);
  }

  hover(
    fnOver: (event: MouseEvent) => void,
    fnOut: (event: MouseEvent) => void
  ) {
    return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
  }

  readonly height = (callSizeof("height", "content") as any).bind(
    this
  ) as FnSize<this>;
  readonly innerHeight = (callSizeof("height", "padding") as any).bind(
    this
  ) as FnSize<this>;
  readonly outerHeight = (callSizeof("height") as any).bind(
    this
  ) as FnSize<this>;
  readonly width = (callSizeof("width", "content") as any).bind(
    this
  ) as FnSize<this>;
  readonly innerWidth = (callSizeof("width", "padding") as any).bind(
    this
  ) as FnSize<this>;
  readonly outerWidth = (callSizeof("width") as any).bind(this) as FnSize<this>;

  blur = generateListenerEvent("blur").bind(this)
  focus = generateListenerEvent("blur").bind(this)
  focusin = generateListenerEvent("blur").bind(this)
  focusout = generateListenerEvent("blur").bind(this)
  resize = generateListenerEvent("blur").bind(this)
  scroll = generateListenerEvent("blur").bind(this)
  click = generateListenerEvent("blur").bind(this)
  dblclick = generateListenerEvent("blur").bind(this)
  mousedown = generateListenerEvent("blur").bind(this)
  mouseup = generateListenerEvent("blur").bind(this)
  mouseover = generateListenerEvent("blur").bind(this)
  mouseenter = generateListenerEvent("blur").bind(this)
  mouseleave = generateListenerEvent("blur").bind(this)
  change = generateListenerEvent("blur").bind(this)
  select = generateListenerEvent("blur").bind(this)
  submit = generateListenerEvent("blur").bind(this)
  keydown = generateListenerEvent("blur").bind(this)
  keypress = generateListenerEvent("blur").bind(this)
  keyup = generateListenerEvent("blur").bind(this)
  contextmenu = generateListenerEvent("blur").bind(this)
}

type FnSize<T> = {
  (): number;
  (value: number): T;
};
function callSizeof(
  type: "height" | "width",
  defaultExtra: "padding" | "content" | "" = ""
) {
  const name = type.toUpperCase();
  const funcName = {
    padding: "inner" + name,
    content: type,
    "": "outer" + name,
  }[defaultExtra];

  return function (this: ReturnKijs<Element>, value: number, margin = false) {
    const extra = !!defaultExtra || (margin === true ? "margin" : "border");

    // eslint-disable-next-line functional/no-let
    let result;
    this.each((elem) => {
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

    return result === void 0 ? this : result;
  };
}

type Events = {
  blur: Event;
  focus: FocusEvent;
  focusin: FocusEvent;
  focusout: FocusEvent;
  resize: UIEvent;
  scroll: Event;
  click: MouseEvent;
  dblclick: MouseEvent;
  mousedown: MouseEvent;
  mouseup: MouseEvent;
  mouseover: MouseEvent;
  mouseenter: MouseEvent;
  mouseleave: MouseEvent;
  change: Event;
  select: UIEvent | Event;
  submit: SubmitEvent;
  keydown: KeyboardEvent;
  keypress: KeyboardEvent;
  keyup: KeyboardEvent;
  contextmenu: MouseEvent;
};

type EventOf<T extends keyof Events> = Events[T];

function generateListenerEvent<T extends keyof Events>(
  name: T
): {
  (this: ReturnKijs, callback?: (event: EventOf<T>) => void): void;
} {
  return function (callback) {
    return callback === void 0 ? this.trigger(name) : this.on(name, callback);
  };
}
// each(
//   (
//     "blur focus focusin focusout resize scroll click dblclick " +
//     "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
//     "change select submit keydown keypress keyup contextmenu"
//   ).split(" "),
//   function (_i, name) {
//     // Handle event binding
//     Kijs.prototype[name] = function (fn) {
//       return arguments.length > 0
//         ? this.on(name, null, fn)
//         : this.trigger(name);
//     };
//   }
// );

function insertElements<TElement extends Element, T = TElement>(
  elems: LikeArray<TElement>,
  action: (item: TElement, child: any) => void,
  callParm: (item: TElement) => T,
  // eslint-disable-next-line functional/functional-parameters
  ...contents: readonly (
    | CustomElementAdd
    | LikeArray<CustomElementAdd>
    | ((
        index: number,
        html: T
      ) => CustomElementAdd | LikeArray<CustomElementAdd>)
  )[]
): void {
  each(elems, (elem) => {
    const elementsAdd = new Set<any>();

    each(contents, (it, index) => {
      if (typeof it === "function") {
        it = it.call(elem, index, callParm(elem));
      }

      if (isArrayLike(it as any)) {
        Array.from(it as any).forEach((i) => elementsAdd.add(i));
        return;
      }
      if (typeof it === "string" && it.match(/^\s+</)) {
        Array.from(createFragment(it).childNodes).forEach((i) =>
          elementsAdd.add(i)
        );

        return;
      }

      if (document.documentElement.contains(it as any)) {
        it = (it as any).cloneNode(true);
      }

      elementsAdd.add(it);
    });

    action(elem, elementsAdd);
  });
}

export default kijs;
