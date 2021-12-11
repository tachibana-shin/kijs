/* eslint-disable @typescript-eslint/no-explicit-any */
import setData, { removeData } from "./static/data";
import each from "./static/each";
import { off, on, one } from "./static/event";
import extend from "./static/extend";
import ready from "./static/ready";
import type LikeArray from "./types/LikeArray";
import createFragment from "./utils/createFragment";
import { isArrayLike } from "./utils/is";

// eslint-disable-next-line functional/prefer-readonly-type
type TypeOrArray<T> = T | T[];
type Node = Element | Text | Comment | Document | DocumentFragment;
type htmlString = string;
type Selector = string;
type ReturnMyjs<TElement extends Element> = Myjs<TElement> & {
  readonly [index: number]: TElement;
};
type ParamNewMyjs<TElement> = Selector | TypeOrArray<TElement> | htmlString | Node;
type CustomElementAdd = string | Element | Text;

const rSelector = /[a-zA-Z_]|\.|#/;
export default function myjs<TElement extends Element>(
  selector: ParamNewMyjs<TElement>,

  prevObject?: ReturnMyjs<TElement>,
  context = document
): ReturnMyjs<TElement> {
  return new Myjs<TElement>(selector, prevObject, context) as any;
}

class Myjs<TElement extends Element> {
  // eslint-disable-next-line functional/prefer-readonly-type
  length = 0;
  get myjs(): true {
    return true;
  }
  readonly #prevObject: ReturnType<typeof myjs>| void = undefined;
  readonly #context = document;
  constructor(
    selector: Selector | TypeOrArray<TElement> | htmlString | Node,
    prevObject?: ReturnType<typeof myjs>,
    context = document
  ) {
    this.#prevObject = prevObject;
    this.#context = context;
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
  each(
    callback: (this: TElement, index: number, element: TElement) => void | false
  ): this {
    each(this as any, callback);

    return this;
  }
  map<T = any>(
    callback: (this: TElement, index: number, element: TElement) => T
  ): ReturnType<typeof myjs> {
    // eslint-disable-next-line functional/prefer-readonly-type
    const elements: Element[] = [];

    this.each((index, value) => {
      // eslint-disable-next-line functional/immutable-data
      elements.push(callback.call(value, index, value) as any);
    });

    return myjs(elements, this as any);
  }
  filter(
    callback: (
      this: TElement,
      index: number,
      element: TElement
    ) => boolean | void
  ): ReturnType<typeof myjs> {
    const elements: any = [];
    this.each((index, value) => {
      if (callback.call(value, index, value)) {
        elements.push(value);
      }
    });

    return myjs(elements, this as any);
  }
  toArray(): readonly TElement[] {
    return Array.from(this as any);
  }
  get(index: number): TElement | void {
    return (this as any)[index < -1 ? this.length + index : index];
  }
  pushStack(elements: LikeArray<TElement>): ReturnType<typeof myjs> {
    return myjs(Array.from(elements), this);
  }
  slice(start: number, end?: number): ReturnType<typeof myjs> {
    return myjs(Array.prototype.slice.call(this, start, end), this);
  }
  eq(index: number): ReturnType<typeof myjs> {
    return myjs(this.get(index), this);
  }
  first(): ReturnType<typeof myjs> {
    return this.eq(0);
  }
  last(): ReturnType<typeof myjs> {
    return this.eq(-1);
  }
  even(): ReturnType<typeof myjs> {
    return this.filter((index) => index % 2 === 0);
  }
  odd(): ReturnType<typeof myjs> {
    return this.filter((index) => index % 2 !== 0);
  }
  end(): ReturnType<typeof myjs> {
    return this.#prevObject || myjs();
  }
  readonly push = Array.prototype.push;
  readonly sort = Array.prototype.sort;
  readonly splice = Array.prototype.splice;
  readonly extend = extend as (...src: readonly LikeArray<TElement>[]) => this;
  find(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    if (typeof selector === "string") {
      const elements = new Set<TElement>();
      this.each((index, value) => {
        value.querySelectorAll(selector).forEach((i) => elements.add(i));
      });

      return myjs(Array.from(elements.values()), this);
    }

    return myjs(selector).filter((index, value) => {
      let { length } = this;
      while (length--) {
        if (this[length].contains(value)) {
          return true;
        }
      }
    });
  }
  not(selector: ParamNewMyjs): ReturnType<typeof myjs>;
  not(
    filter: (this: TElement, index: number, element: TElement) => void | boolean
  ): ReturnType<typeof myjs>;
  not(selector: any) {
    if (typeof selector === "function") {
      return this.filter((index, value) => {
        return !selector.call(value, index, value);
      });
    }

    const elements = Array.from(myjs(selector)); /* free */

    return this.filter((index, value) => {
      return elements.includes(value) === false;
    });
  }
  is(selector: ParamNewMyjs): ReturnType<typeof myjs>;
  is(
    filter: (this: TElement, index: number, element: TElement) => void | boolean
  ): ReturnType<typeof myjs>;
  is(selector: any) {
    if (typeof selector === "function") {
      return this.filter(selector);
    }

    if (typeof selector === "string") {
      return this.filter((index, value) => {
        return value.matches(selector);
      });
    }

    const elements = Array.from(myjs(selector)); /* free */

    return this.filter((index, value) => {
      return elements.includes(value);
    });
  }
  readonly init = myjs;
  has(element: ParamNewMyjs): ReturnType<typeof myjs> {
    const elements = myjs(element);

    return this.filter((index, value) => {
      let { length } = elements;
      while (length--) {
        if (value.contains(elements[length])) {
          return true;
        }
      }
    });
  }
  closest(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    if (typeof selector === "string") {
      const elements = new Set<TElement>();

      this.each((index, value) => {
        const el = value.closest(selector);
        if (el) {
          elements.add(el);
        }
      });

      return myjs(Array.from(elements.values()), this);
    }

    return myjs(selector).filter((index, value) => {
      let ok = false;
      this.each((index, v) => {
        while ((v = v.parentNode) && v.nodeType < 11) {
          if (value === v) {
            ok = true;

            return false;
          }
        }
      });
    });
  }
  index(selector?: string | ReturnType<typeof myjs> | TElement): number {
    if (selector === undefined) {
      return this[0]?.parentNode ? this.first().prevAll().length : -1;
    }

    if (typeof selector === "string") {
      return Array.prototype.indexOf.call(myjs(selector), this[0]);
    }

    return Array.prototype.indexOf.call(
      this,
      selector instanceof Myjs ? selector[0] : selector
    );
  }
  add(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    return this.pushStack(Array.from(myjs(selector)));
  }
  addBack(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    return myjs(selector).pushStack(Array.from(this));
  }
  parent(selector?: string): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        if (value.parentNode?.nodeType < 11) {
          elements.add(value.parentNode);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (value.matches(selector)) {
            elements.add(value);
            break;
          }
        }
      });
    }

    return myjs(Array.from(elements.value()), this);
  }
  parents(selector?: string): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          elements.add(value);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return myjs(Array.from(elements.values()));
  }
  parentsUntil(
    excludeSelector?: ParamNewMyjs,
    selector?: string
  ): ReturnType<typeof myjs> {
    const exclude = myjs(selectorExclude).toArray();
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (exclude.includes(value)) {
            break;
          }
          elements.add(value);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (exclude.includes(value)) {
            break;
          }
          if (value.matches(selector)) {
            elements.add(value);
          }
        }
      });
    }

    return myjs(Array.from(elements.values()));
  }
  next(selector?: string): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        if (value.nextSibling) {
          elements.add(value.nextSibling);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.nextSibling)) {
          if (value.matches(selector)) {
            elements.push(value);
            break;
          }
        }
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  prev(selector?: string): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        if (value.prevSibling) {
          elements.add(value.prevSibling);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.prevSibling)) {
          if (value.matches(selector)) {
            elements.push(value);
            break;
          }
        }
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  nextAll(selector?: string): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.nextSibling)) {
          elements.push(value);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.nextSibling)) {
          if (value.matches(selector)) {
            elements.push(value);
          }
        }
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  prevAll(selector?: string): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.prevSibling)) {
          elements.push(value);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.prevSibling)) {
          if (value.matches(selector)) {
            elements.push(value);
          }
        }
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  nextUntil(
    selectorExclude?: ParamNewMyjs,
    selector?: string
  ): ReturnType<typeof myjs> {
    const exclude = myjs(selectorExclude).toArray();
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.nextSibling)) {
          if (exclude.includes(value)) {
            break;
          }
          elements.push(value);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.nextSibling)) {
          if (exclide.includes(value)) {
            break;
          }
          if (value.matches(selector)) {
            elements.push(value);
          }
        }
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  prevUntil(
    selectorExclude?: ParamNewMyjs,
    selector?: string
  ): ReturnType<typeof myjs> {
    const exclude = myjs(selectorExclude).toArray();
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.prevSibling)) {
          if (exclude.includes(value)) {
            break;
          }
          elements.push(value);
        }
      });
    } else {
      this.each((index, value) => {
        while ((value = value.prevSibling)) {
          if (exclude.includes(value)) {
            break;
          }
          if (value.matches(selector)) {
            elements.push(value);
          }
        }
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  siblings(selector?: string): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        const children = Array.from(value.parentNode.children);

        children.splice(children.indexOf(value), 1);

        children.forEach((i) => elements.add(i));
      });
    } else {
      this.each((index, value) => {
        const children = Array.from(value.parentNode.children);

        children.splice(children.indexOf(value), 1);

        children.forEach((i) => {
          if (i.matches(selector)) {
            elements.add(i);
          }
        });
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  children(selector?: string): myjs<TElememt> {
    const elements = new Set<TElement>();

    if (selector === void 0) {
      this.each((index, value) => {
        value.children.forEach((i) => elements.add(i));
      });
    } else {
      this.each((index, value) => {
        value.children.forEach((i) => {
          if (i.matches(selector)) {
            elements.add(i);
          }
        });
      });
    }

    return myjs(Array.from(elements.values()), this);
  }
  contents(): ReturnType<typeof myjs> {
    const elements = new Set<TElement>();

    this.each((index, value) => {
      if (
        value.contentDocument != null &&
        Object.getPrototypeOf(value.contentDocument)
      ) {
        value.contentDocument.forEach((i) => elements.add(i));

        return;
      }

      if (value.nodeName === "TEMPLATE") {
        value = value.content || value;
      }

      elem.childNodes.forEach((i) => elements.add(i));
    });

    return myjs(Array.from(elements.values()), this);
  }
  readonly ready = ready;
  data<T extends object>(): T;
  data<R = any>(key: string | number | symbol): R;
  data<V = any>(key: string | number | symbol, value: V): this;
  data<D extends object>(data: D): this;
  data(key?: any, value?: any) {
    if (isObject(key) || value !== undefined) {
      this.each((index, value) => {
        setData(value, key, value);
      });

      return this;
    }

    return setData(this[0], key);
  }
  removeData(): this;
  removeData(key: string | number | symbol): this;
  removeData(key?: any) {
    this.each((index, value) => {
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
    on(this, name, selector, callback);

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
    one(this, name, selector, callback);

    return this;
  }
  off(): this;
  off<N extends string, E extends Event>(
    name: N,
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
    off(this, name, selector, callback);

    return this;
  }
  detach(selector?: string): this {
    if (selector === void 0) {
      this.each((index, value) => {
        value.parentNode.removeChildren(value);
      });
    } else {
      this.each((index, value) => {
        if (value.matches(selector)) {
          value.parentNode.removeChildren(value);
        }
      });
    }

    return this;
  }
  remove(selector?: string): this {
    if (selector === void 0) {
      cleanData(this);
      this.each((index, value) => {
        value.parentNode.removeChildren(value);
      });
    } else {
      this.each((index, value) => {
        if (value.matches(selector)) {
          cleanData([value]);
          value.parentNode.removeChildren(value);
        }
      });
    }

    return this;
  }
  text(): string;
  text(content: string | number): this;
  text(content?: string | number): string | this {
    if (content === undefined) {
      return getText(this);
    }

    this.empty().each((index, value) => {
      if (
        value.nodeType === 1 ||
        value.nodeType === 11 ||
        value.nodeType === 9
      ) {
        value.textContent = content;
      }
    });

    return this;
  }
  empty(): this {
    cleanData(this);
    this.each((index, elem) => {
      if (elem.nodeType === 1) {
        elem.textContent = "";
      }
    });

    return this;
  }
  append(
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(this, (elem, child) => elem.append(...child), ...contents);

    return this;
  }
  prepend(
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(this, (elem, child) => elem.prepend(...child), ...contents);

    return this;
  }
  after(
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(this, (elem, child) => elem.after(...child), ...contents);

    return this;
  }
  before(
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(this, (elem, child) => elem.before(...child), ...contents);

    return this;
  }
  clone(
    dataAndEvent = false,
    deepDataAndEvent?: boolean = dataAndEvent
  ): ReturnType<typeof myjs> {
    return this.map((index, elem) =>
      clone(elem, dataAndEvent, deepDataAndEvent)
    );
  }
  html(): string;
  html(htmlString: string): this;
  html(htmlString?: string): string | this {
    if (htmlString === undefined) {
      return this[0].innerHTML;
    }

    this.each((index, value) => {
      value.innerHTML = htmlString;
    });

    return this;
  }
  replaceWith(
    ...contents: readonly (
      | CustomElementAdd
      | LikeArray<CustomElementAdd>
      | ((
          index: number,
          html: string
        ) => CustomElementAdd | LikeArray<CustomElementAdd>)
    )[]
  ): this {
    insertElements(this, (elem, child) => elem.after(...child), ...contents);

    this.remove();

    return this;
  }
  appendTo(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    return myjs(selector).append(this);
  }
  prependTo(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    return myjs(selector).prepend(this);
  }
  insertAfter(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    return myjs(selector).after(this);
  }
  insertBefore(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    return myjs(selector).before(this);
  }
  replaceAll(selector: ParamNewMyjs): ReturnType<typeof myjs> {
    return myjs(selector).replaceWith(this);
  }
  css<Prop extends keyof HTMLElement["prototype"]["style"]>(
    props: readonly Prop[]
  ): Record<Prop, HTMLElement["prototype"]["style"][Prop]>;
  css<Prop extends keyof HTMLElement["prototype"]["style"]>(
    prop: Prop
  ): HTMLElement["prototype"]["style"][Prop];
  css<Prop extends keyof HTMLElement["prototype"]["style"]>(
    prop: Prop,
    value: HTMLElement["prototype"]["style"][Prop]
  ): this;
  css<Prop extends keyof HTMLElement["prototype"]["style"]>(css: {
    readonly [prop: Prop]: HTMLElement["prototype"]["style"][Prop];
  }): this;
  css(prop: any, value?: any) {
    if (Array.isArray(prop)) {
      const map = {};
      const styles = getStyles(this[0]);

      props.forEach((prop) => {
        map[prop] = css(this[0], prop, false, styles);
      });

      return map;
    }
    if (typeof prop !== "object" && value === undefined) {
      return css(this[0], prop);
    }
    if (isObject(prop)) {
      this.each((i, elem) => {
        each(prop, (prop, value) => {
          style(elem, prop, value);
        });
      });

      return this;
    }

    this.each((i, elem) => {
      style(elem, prop, value);
    });

    return this;

    this.each((i, elem) => {
      style(elem, prop, value);
    });

    return this;
  }
  attr(name: string): void | string;
  attr(name: string, value: string): this;
  attr(name: string, value?: string) {
    if (value === void 0) {
      return attr(this[0], name);
    }

    this.each((i, v) => {
      attr(v, nsme, value);
    });

    return this;
  }
  removeAttr(name: string): this {
    this.each((i, v) => {
      removeAttr(v, name);
    });

    return this;
  }
  prop<T = any>(name: string): void | T;
  prop<T = any>(name: string, value: T): this;
  prop<T = any>(name: string, value?: T) {
    if (value === void 0) {
      return prop(this[0], name);
    }

    this.each((i, v) => {
      prop(v, nsme, value);
    });

    return this;
  }
  removeProp(name: string): this {
    this.each((i, v) => {
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
    addClass(this, classes);

    return this;
  }
  removeClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    removeClass(this, classes);

    return this;
  }
  toggleClass(
    classes:
      | string
      | readonly string[]
      | ((index: number, className: string) => string | readonly string[])
  ): this {
    toggleClass(this, classes);

    return this;
  }
  hasClass(clazz: string): boolean {
    return hasClass(this, classes);
  }
  value(): string | number | readonly (string | number)[];
  value(value: string | number | readonly (string | number)[]): this;
  value(val?: any) {
    if (val === void 0) {
      return value(this);
    }

    value(this, val);

    return this;
  }
  readonly val = value;
  trigger(name: string, data: any) {
    this.each((i, elem) => {
      const event = new Event(name);
      event.data = data;

      if (elem[name] && data === void 0) {
        elem[name]();
      } else {
        elem.dispatchEvent(event);
      }
    });

    return this;
  }
  triggerHandler(name: string, data: any): any {
    let lastVal;
    weakCacheEvent
      .get(this[0])
      ?.get(name)
      .forEach((cb) => {
        const event = new Event(name);
        event.data = data;
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
    return this.map((i, elem) => {
      const elements = prop(elem, "elements");
      return elements ? Array.from(elements) : this;
    })
      .filter(function (i, elem) {
        const type = elem.type;

        return (
          this.name &&
          !myjs(elem).is(":disabled") &&
          rsubmittable.test(elem.nodeName) &&
          !rsubmitterTypes.test(type) &&
          (elem.checked || !rcheckableType.test(type))
        );
      })
      .map(function (_i, elem) {
        const val = value(elem);

        if (val == null) {
          return null;
        }

        if (Array.isArray(val)) {
          return val.map((val) => {
            return {
              name: elem.name,
              value: val.replace(rCRLF, "\r\n"),
            };
          });
        }

        return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
      })
      .get();
  }

  wrapAll(html: ParamNewMyjs): this {
    let wrap;

    if (this[0]) {
      if (isFunction(html)) {
        html = html.call(this[0]);
      }

      // The elements to wrap the target around
      wrap = myjs(html, this, this[0].ownerDocument).eq(0).clone(true);

      if (this[0].parentNode) {
        wrap.insertBefore(this[0]);
      }

      wrap
        .map((i, elem) => {
          while (elem.firstElementChild) {
            elem = elem.firstElementChild;
          }

          return elem;
        })
        .append(this);
    }

    return this;
  }

  wrapInner(html: ParamNewMyjs): this {
    if (isFunction(html)) {
      this.each(function (i, e) {
        myjs(e).wrapInner(html.call(this, i));
      });

      return this;
    }

    this.each(function (i, e) {
      const self = myjs(e),
        contents = self.contents();

      if (contents.length) {
        contents.wrapAll(html);
      } else {
        self.append(html);
      }
    });

    return this;
  }

  wrap(
    html: ParamNewMyjs | ((index: number, element: TElement) => ParamNewMyjs)
  ): this {
    const htmlIsFunction = isFunction(html);

    this.each(function (i) {
      myjs(this).wrapAll(htmlIsFunction ? html.call(this, i) : html);
    });

    return this;
  }

  unwrap(selector: string): this {
    this.parent(selector)
      .not("body")
      .each((i, e) => {
        myjs(e).replaceWith(this.childNodes);
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
      return offset(this);
    }

    offset(this, options);
    return this;
  }

  position(): ReturnType<typeof position> {
    return position(this[0]);
  }

  offsetParent(): HTMLElement["prototype"]["offsetParent"] {
    return this.map(function () {
      let offsetParent = this.offsetParent;

      while (
        offsetParent &&
        css(offsetParent, "position") === "static"
      ) {
        offsetParent = offsetParent.offsetParent;
      }

      return offsetParent || documentElement;
    });
  }

  scrollLeft(): number;
  scrollLeft(value: number): this;
  scrollLeft(value?: number) {
    if (value === void 0) {
      return pageOffset(this, "scrollLeft");
    }

    pageOffset(this, "scrollLeft", value);
  }

  scrollTop(): number;
  scrollTop(value: number): this;
  scrollTop(value?: number) {
    if (value === void 0) {
      return pageOffset(this, "scrollTop");
    }

    pageOffset(this, "scrollTop", value);
  }

  // space
  innerWidth(value: number): this;
  innerWidth(): number;
  width(value: number): this;
  width(): number;
  outerWidth(value: number): this;
  outerWidth(): number;
  innerHeight(value: number): this;
  innerHeight(): number;
  height(value: number): this;
  height(): number;
  outerHeight(value: number): this;
  outerheight(): number;
  bind<N extends string, E extends Event>(
    name: N,
    callback: (this: TElement, event: E) => void
  ): this {
    return this.on(types, null, fn);
  }
  unbind<N extends string, E extends Event>(
    name: N,
    callback: (this: TElement, event: E) => void
  ): this {
    return this.off(name, null, callback);
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
    return arguments.length === 1
      ? this.off(selector, "*")
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
}

each({ Height: "height", Width: "width" }, (name, type) => {
  each(
    {
      padding: "inner" + name,
      content: type,
      "": "outer" + name,
    },
    (defaultExtra, funcName) => {
      Myjs.prototype[funcName] = function (margin, value) {
        const chainable =
            arguments.length && (defaultExtra || typeof margin !== "boolean"),
          extra =
            defaultExtra ||
            (margin === true || value === true ? "margin" : "border");

        let result;
        this.each((i, elem) => {
          let doc;

          if (isWindow(elem)) {
            // $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
            result =
              funcName.indexOf("outer") === 0
                ? elem["inner" + name]
                : elem.document.documentElement["client" + name];
            return false;
          }

          // Get document width or height
          if (elem.nodeType === 9) {
            doc = elem.documentElement;

            // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
            // whichever is greatest
            result = Math.max(
              elem.body["scroll" + name],
              doc["scroll" + name],
              elem.body["offset" + name],
              doc["offset" + name],
              doc["client" + name]
            );

            return false;
          }

          if (value === undefined) {
            result = css(elem, type, extra);

            return false;
          }

          style(elem, type, value, extra);
        });

        return result === void 0 ? this : result;
      };
    }
  );
});

each(
  (
    "blur focus focusin focusout resize scroll click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup contextmenu"
  ).split(" "),
  function (_i, name) {
    // Handle event binding
    Myjs.prototype[name] = function (fn) {
      return arguments.length > 0
        ? this.on(name, null, fn)
        : this.trigger(name);
    };
  }
);

function insertElements<TElement extends Element>(
  elms: LikeArray<TElement>,
  action: (item: TElement, child: any) => void,
  ...contents: readonly (
    | CustomElementAdd
    | LikeArray<CustomElementAdd>
    | ((
        index: number,
        html: string
      ) => CustomElementAdd | LikeArray<CustomElementAdd>)
  )[]
): void {
  each(elems, (index, elem) => {
    const elementsAdd = [];

    each(content, (index, it) => {
      if (typeof it === "function") {
        it = it.call(elem, index, elem);
      }

      if (isLikeArray(it)) {
        this.append(...Array.from(it));
        return;
      }
      if (typeof it === "string" && it.match(/^\s+</)) {
        elementsAdd.push(...Array.from(createFragment(it).childNodes));
        return;
      }

      if (document.documentElement.contains(it)) {
        it = it.cloneNode(true);
      }

      elementsAdd.push(it);
    });

    action(elem, elementsAdd);
  });
}
