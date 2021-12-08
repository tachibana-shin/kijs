/* eslint-disable @typescript-eslint/no-explicit-any */
import createFragment from "./utils/createFragment";
import { isArrayLike } from "./utils/is";
import each from "./static/each";
import extend from "./static/extend"
import ready from "./static/ready"
import setData, { removeData } from "./static/data"
import { on, one, off } from "./static/event"
import type LikeArray from "./types/LikeArray"

type TypeOrArray<T> = T | readonly T[];
type Node = Element | Text | Comment | Document | DocumentFragment;
type htmlString = string;
type Selector = string;
type ReturnMyjs<TElement> = Myjs<TElement> & {
  readonly [index: number]: TElement;
};
type ParamNewMyjs = Selector | TypeOrArray<Element> | htmlString | Node

const rSelector = /[a-zA-Z_]|\.|#/;
export default function myjs<TElement = HTMLElement>(
  selector: ParamNewMyjs
): ReturnMyjs<TElement> {
  return new Myjs<TElement>(selector) as any;
}


class Myjs<TElement = HTMLElement> {
  // eslint-disable-next-line functional/prefer-readonly-type
  length = 0;
  get myjs(): true {
    return true
  }
  #prevObject: myjs<TElement>|void = undefined
  constructor(selector: Selector | TypeOrArray<Element> | htmlString | Node, prevObject?: myjs<TElement>) {
    this.#prevObject = prevObject
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
  each(callback: (this: TElement, index: number, element: TElement) => void | false): this {
    each(this, callback)
    
    return this
  }
  map<T = TElement>(callback: (this: TElement, index: number, element: TElement) => T): myjs<T> {
    const elements: T[] = []
    
    this.each((index, value) => {
      elements.push(callback.call(value, index, value));
    })
    
    return myjs(elements, this);
  }
  filter(callback: (this: TElement, index: number, element: TElement) => boolean | void): myjs<TElement> {
    const elements = []
    this.each((index, value) => {
      if (!!callback.call(value, index, value)) {
        elements.push(value)
      }
    })
    
    return myjs(elements, this)
  }
  toArray(): TElement[] {
    return Array.from(this)
  }
  get(index: number): TElement | void {
    return this[index < -1 ? this.length + index : index]
  }
  pushStack(elements: LikeArray<TElement>): myjs<TElement> {
    return myjs(Array.from(elements), this)
  }
  slice(start: number, end?: number): myjs<TElement> {
    return myjs(Array.prototype.slice.call(this, start, end), this)
  }
  eq(index: number): myjs<TElement> {
    return myjs(this.get(index), this)
  }
  first(): myjs<TElement> {
    return this.eq(0)
  }
  last(): myjs<TElement> {
    return this.eq(-1)
  }
  even(): myjs<TElement> {
    return this.filter(index => index % 2 === 0)
  }
  odd(): myjs<TElement> {
    return this.filter(index => index % 2 !== 0)
  }
  end(): myjs<TElement> {
    return this.#prevObject || myjs()
  }
  push = Array.prototype.push
  sort = Array.prototype.sort
  splice = Array.prototype.splice
  extend = extend as (...src: LikeArray<TElement>[]) => this
  find(selector: ParamNewMyjs): myjs<TElement> {
    if ( typeof selector === "string" ) {
      const elements = new Set<TElement>()
      this.each((index, value) => {
        value.querySelectorAll(selector).forEach(i => elements.add(i))
      })
      
      return myjs(Array.from(elements.values()), this)
    }
    
    return myjs(selector).filter((index, value) => {
      let { length } = this
      while ( length-- ) {
        if ( this[length].contains(value) ) {
          return true
        }
      }
    })
  }
  not(selector: ParamNewMyjs): myjs<TElement>
  not(filter: (this: TElement, index: number, element: TElement) => void | boolean):  myjs<TElement>
  not(selector: any) {
    if ( typeof selector === "function" ) {
      return this.filter((index, value) => {
        return !selector.call(value, index, value)
      })
    }
    
    const elements = Array.from(myjs(selector)) /* free */
    
    return this.filter((index, value) => {
      return elements.includes(value) === false
    })
  }
  is(selector: ParamNewMyjs): myjs < TElement >
  is(filter: (this: TElement, index: number, element: TElement) => void | boolean): myjs < TElement >
  is(selector: any) {
    if (typeof selector === "function") {
      return this.filter(selector)
    }
    
    if (typeof selector === "string") {
      return this.filter((index, value) => {
        return value.matches(selector)
      })
    }
  
    const elements = Array.from(myjs(selector)) /* free */
  
    return this.filter((index, value) => {
      return elements.includes(value)
    })
  }
  init = myjs
  has(element: ParamNewMyjs): myjs<TElement> {
    const elements = myjs(element)
    
    return this.filter((index, value) => {
      let { length } = elements
      while (length--) {
        if (value.contains(elements[length])) {
          return true
        }
      }
    })
  }
  closest(selector: ParamNewMyjs): myjs<TElement> {
    if (typeof selector === "string") {
      const elements = new Set<TElement>()
      
      this.each((index, value) => {
        const el = (value.closest(selector))
        if (el) {
          elements.add(el)
        }
      })
      
      return myjs(Array.from(elements.values()), this)
    }
    
    return myjs(selector).filter((index, value) => {
      let ok = false
      this.each((index, v) => {
        while ((v = v.parentNode) && v.nodeType < 11) {
          if (value === v) {
            ok = true
            
            return false
          }
        }
      })
    })
  }
  index(selector?: string | ReturnType<typeof myjs<TElement>> | TElement): number {
    if ( selector === undefined ) {
      return this[0]?.parentNode ? this.first().prevAll().length : -1
    }
    
    if (typeof selector === "string" ) {
      return Array.prototype.indexOf.call(myjs(selector), this[0])
    }
    
    return Array.prototype.indexOf.call(this, selector instanceof Myjs ? selector[0] : selector)
  }
  add(selector: ParamNewMyjs): myjs<TElement> {
    return this.pushStack(Array.from(myjs(selector)))
  }
  addBack(selector: ParamNewMyjs): myjs<TElement> {
    return myjs(selector).pushStack(Array.from(this))
  }
  parent(selector?: string): myjs<TElement> {
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        if (value.parentNode?.nodeType < 11) {
          elements.add(value.parentNode)
        }
      })
    } else {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (value.matches(selector)) {
            elements.add(value)
            break
          }
        }
      })
    }
    
    return myjs(Array.from(elements.value()), this)
  }
  parents(selector?: string): myjs<TElement> {
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          elements.add(value)
        }
      })
    } else {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (value.matches(selector)) {
            elements.add(value)
          }
        }
      })
    }
    
    return myjs(Array.from(elements.values()))
  }
  parentsUntil(excludeSelector?: ParamNewMyjs, selector?: string): myjs<TElement> {
    const exclude = myjs(selectorExclude).toArray()
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (exclude.includes(value)) {
            break
          }
          elements.add(value)
        }
      })
    } else {
      this.each((index, value) => {
        while ((value = value.parentNode)?.nodeType < 11) {
          if (exclude.includes(value)) {
            break
          }
          if (value.matches(selector)) {
            elements.add(value)
          }
        }
      })
    }
    
    return myjs(Array.from(elements.values()))
  }
  next(selector?: string): myjs<TElement> {
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        if (value.nextSibling) {
          elements.add(value.nextSibling)
        }
      })
    } else {
      this.each((index, value) => {
        while (value = value.nextSibling) {
          if (value.matches(selector)) {
            elements.push(value)
            break
          }
        }
      })
    }
    
    return myjs(Array.from(elements.values()), this)
  }
  prev(selector ? : string): myjs < TElement > {
    const elements = new Set < TElement > ()
  
    if (selector === void 0) {
      this.each((index, value) => {
        if (value.prevSibling) {
          elements.add(value.prevSibling)
        }
      })
    } else {
      this.each((index, value) => {
        while (value = value.prevSibling) {
          if (value.matches(selector)) {
            elements.push(value)
            break
          }
        }
      })
    }
  
    return myjs(Array.from(elements.values()), this)
  }
  nextAll(selector?: string): myjs<TElement> {
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        while (value = value.nextSibling) {
          elements.push(value)
        }
      })
    } else {
      this.each((index, value) => {
        while (value = value.nextSibling) {
          if (value.matches(selector)) {
            elements.push(value)
          }
        }
      })
    }
    
    return myjs(Array.from(elements.values()), this)
  }
  prevAll(selector?: string): myjs<TElement> {
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        while (value = value.prevSibling) {
          elements.push(value)
        }
      })
    } else {
      this.each((index, value) => {
        while (value = value.prevSibling) {
          if (value.matches(selector)) {
            elements.push(value)
          }
        }
      })
    }
    
    return myjs(Array.from(elements.values()), this)
  }
  nextUntil(selectorExclude?: ParamNewMyjs, selector?: string): myjs<TElement> {
    const exclude = myjs(selectorExclude).toArray()
    const elements = new Set < TElement > ()
    
    if (selector === void 0) {
      this.each((index, value) => {
        while (value = value.nextSibling) {
          if (exclude.includes(value)) {
            break
          }
          elements.push(value)
        }
      })
    } else {
      this.each((index, value) => {
        while (value = value.nextSibling) {
          if (exclide.includes(value)) {
            break
          }
          if (value.matches(selector)) {
            elements.push(value)
          }
        }
      })
    }
    
    return myjs(Array.from(elements.values()), this)
  }
  prevUntil(selectorExclude?: ParamNewMyjs, selector?: string): myjs<TElement> {
    const exclude = myjs(selectorExclude).toArray()
    const elements = new Set < TElement > ()
    
    if (selector === void 0) {
      this.each((index, value) => {
        while (value = value.prevSibling) {
          if (exclude.includes(value)) {
            break
          }
          elements.push(value)
        }
      })
    } else {
      this.each((index, value) => {
        while (value = value.prevSibling) {
          if (exclude.includes(value)) {
            break
          }
          if (value.matches(selector)) {
            elements.push(value)
          }
        }
      })
    }
    
    return myjs(Array.from(elements.values()), this)
  }
  siblings(selector?: string): myjs<TElement> {
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        const children = Array.from(value.parentNode.children)
        
        children.splice(children.indexOf(value), 1)
        
        children.forEach(i => elements.add(i))
      })
    } else {
      this.each((index, value) => {
        const children = Array.from(value.parentNode.children)
        
        children.splice(children.indexOf(value), 1)
        
        children.forEach(i => {
          if (i.matches(selector)) {
            elements.add(i)
          }
        })
      })
    }
    
    return myjs(Array.from(elements.values()), this)
  }
  children(selector?: string): myjs<TElememt> {
    const elements = new Set<TElement>()
    
    if (selector === void 0) {
      this.each((index, value) => {
        value.children.forEach(i => elements.add(i))
      })
    } else {
      this.each((index, value) => {
        value.children.forEach(i => {
          if (i.matches(selector)) {
            elements.add(i)
          }
        })
      })
    }
    
    return myjs(Array.from(elements.values()), this)
  }
  contents(): myjs<TElement> {
    const elements = new Set<TElement>()
    
    this.each((index, value) => {
      if (value.contentDocument != null && Object.getPrototypeOf(value.contentDocument)) {
        value.contentDocument.forEach(i => elements.add(i))
        
        return
      }
      
      if (value.nodeName === "TEMPLATE") {
        value = value.content || value
      }
      
      elem.childNodes.forEach(i => elements.add(i))
    })
    
    return myjs(Array.from(elements.values()), this)
  }
  ready = ready
  data<T extends object>(): T
  data<R = any>(key: string | number|symbol): R;
  data<V = any>(key: string | number | symbol, value: V): this
  data<D extends object>(data: D): this;
  data(key?: any, value?: any) {
    if (isObject(key) || value !== undefined) {
      this.each((index, value) => {
        setData(value, key, value)
      })
      
      return this
    }
  
 
    return setData(this[0], key)
  }
  removeData(): this
  removeData(key: string | number | symbol): this;
  removeData(key?: any) {
    this.each((index, value) => {
      removeData(value, key)
    })
    
    return this
  }
  on<N extends string, E extends Event>(name: N, callback: (this: TElement, event: E) => void): this
  on<N extends string, E extends Event>(name: N, selector: string, callback: (this: TElement, event: E) => void): this
  on<N extends string, E extends Event>(name: N, selector: any, callback?: (this: TElement, event: E) => void): this {
    on(this, name, selector, callback)
    
    return this
  }
  one<N extends string, E extends Event>(name: N, callback: (this: TElement, event: E) => void): this
  one<N extends string, E extends Event>(name: N, selector: string, callback: (this: TElement, event: E) => void): this
  one<N extends string, E extends Event>(name: N, selector: any, callback?: (this: TElement, event: E) => void): this { 
    one(this, name, selector, callback)
    
    return this
  }
  off(): this
  off<N extends string, E extends Event>(name: N, callback?: (this: TElement, event: E) => void): this
  off<N extends string, E extends Event>(name: N, selector: string, callback: (this: TElement, event: E) => void): this
  off<N extends string, E extends Event>(name: N, selector: any, callback?: (this: TElement, event: E) => void): this {
    off(this, name, selector, callback)
    
    return this
  }
  detach(selector?: string): this {
    if (selector === void 0) {
      this.each((index, value) => {
        value.parentNode.removeChildren(value)
      })
    } else {
      this.each((index, value) => {
        if (value.matches(selector)) {
          value.parentNode.removeChildren(value)
        }
      })
    }
    
    return this
  }
  remove(selector?: string): this {
    if (selector === void 0) {
      cleanData(this)
      this.each((index, value) => {
        value.parentNode.removeChildren(value)
      })
    } else {
      this.each((index, value) => {
        if (value.matches(selector)) {
          cleanData([value])
          value.parentNode.removeChildren(value)
        }
      })
    }
    
    return this
  }
  text(): string;
  text(content: string | number): this;
  text(content?: string | number) : string | this {
    if ( content === undefined) {
      return getText(this)
    }
    
    this.empty().each((index, value) => {
      if (value.nodeType === 1 || value.nodeType === 11 || value.nodeType === 9) {
        value.textContent = content
      }
    })
    
    return this
  }
  empty(): this {
    cleanData(this)
    this.each((index, elem) => {
      if (elem.nodeType === 1) {
      
       
        elem.textContent = "";
      }
    })
    
    return this
  }
  append(...contents: (CustomElementAdd | LikeArray<CustomElementAdd> | (index: number, html: string) => CustomElementAdd | LikeArray<CustomElementAdd>)[]): this {
    
    insertElements(this, (elem, child) => elem.append(...child), ...contents)
    
    return this;
  }
  prepend(...contents: (CustomElementAdd | LikeArray<CustomElementAdd> | (index: number, html: string) => CustomElementAdd | LikeArray<CustomElementAdd>)[]): this {
    
    insertElements(this, (elem, child) => elem.prepend(...child), ...contents)
    
    return this;
  }
  after(...contents: (CustomElementAdd | LikeArray<CustomElementAdd> | (index: number, html: string) => CustomElementAdd | LikeArray<CustomElementAdd>)[]): this {
    
    insertElements(this, (elem, child) => elem.after(...child), ...contents)
    
    return this;
  }
  before(...contents: (CustomElementAdd | LikeArray < CustomElementAdd > | (index: number, html: string) => CustomElementAdd | LikeArray < CustomElementAdd > )[]): this {
  
    insertElements(this, (elem, child) => elem.before(...child), ...contents)
  
    return this;
  }
  clone(dataAndEvent: boolean = false, deepDataAndEvent?: boolean = dataAndEvent): myjs<TElement> {
    
    return this.map((index, elem) => clone(elem, dataAndEvent, deepDataAndEvent))
  }
  html(): string;
  html(htmlString: string): this;
  html(htmlString?: string): string | this {
    if (htmlString === undefined) {
      return this[0].innerHTML
    }
    
    this.each((index, value) => {
      value.innerHTML = htmlString
    })
    
    return this
  }
  replaceWith(...contents: (CustomElementAdd | LikeArray < CustomElementAdd > | (index: number, html: string) => CustomElementAdd | LikeArray < CustomElementAdd > )[]): this {
  
    insertElements(this, (elem, child) => elem.after(...child), ...contents)
  
    this.remove();
    
    return this;
  }
  appendTo(selector: ParamNewMyjs): myjs<TElement> {
    return myjs(selector).append(this)
  }
  prependTo(selector: ParamNewMyjs): myjs<TElement> {
    return myjs(selector).prepend(this)
  }
  insertAfter(selector: ParamNewMyjs): myjs<TElement> {
    return myjs(selector).after(this)
  }
  insertBefore(selector: ParamNewMyjs): myjs<TElement> {
    return myjs(selector).before(this)
  }
  replaceAll(selector: ParamNewMyjs): myjs<TElement> {
    return myjs(selector).replaceWith(this)
  }
  css<Prop extends keyof HTMLElement["prototype"]["style"]>(prop: Prop): HTMLElement["prototype"]["style"][Prop];
}

function insertElements<TElement = HTMLElement>(elms: LikeArray<TElement>, action: (item: TElement, child: any) => void, ...contents: (CustomElementAdd | LikeArray<CustomElementAdd> | (index: number, html: string) => CustomElementAdd | LikeArray<CustomElementAdd>)[]): void {
  
    each(elems, (index, elem) => {
      const elementsAdd = []
      
      each(content, (index, it) => {
        if (typeof it === "function") {
          it = it.call(elem, index, elem)
        }
        
        if (isLikeArray(it)) {
          this.append(...Array.from(it))
          return
        }
        if (typeof it === "string" && it.match(/^\s+</)) {
          elementsAdd.push(...Array.from(createFragment(it).childNodes))
          return
        }
        
        if (document.documentElement.contains(it)) {
          it = it.cloneNode(true)
        }
        
        elementsAdd.push(it)
        
      })
    
        action(elem, elementsAdd)
      
    })
    
}
type CustomElementAdd = string | Element | Text