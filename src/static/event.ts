export const weakCacheEvent = new WeakMap <Element, Map<string, Set<{
    handler: Function;
    selector: string | null
  }>>> ()
const weakCacheFunctionEvent = new WeakMap < Function,
  Function > ()

function on < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, callback: (this: TElement, event: E) => void): void

function on < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, selector: string, callback: (this: TElement, event: E) => void): void

function on < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, selector: any, callback ? : (this: TElement, event: E) => void): void {
  if (typeof selector === "function") {
    callback = selector;
    selector = void 0
  }

  const handler = selector ? function handler(e) {
    let t = e.target
    while (t && t !== this) {
      if (t.matches(selector)) {
        callback.call(t, e);
      }
      t = t.parentNode;
    }
  } : function handler(e) {
    callback.call(this, e)
  }

  weakCacheFunctionEvent.set(callback, handler)

  each(elements, (index, value) => {
    if (weakCacheEvent.has(value) === false) {
      weakCacheEvent.set(value, new Map())
    }

    if (weakCacheEvent.get(value) !.has(name) === false) {
      weakCacheEvent.get(value) !.set(name, new Set())
    }

    weakCacheEvent.get(value) !.get(name) !.add({ handler, selector })
    value.addEventListener(name, handler)
  })
}

function one < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, callback: (this: TElement, event: E) => void): void

function one < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, selector: string, callback: (this: TElement, event: E) => void): void

function one < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, selector: any, callback ? : (this: TElement, event: E) => void): void {

  if (callback) {
    function handler(e) {
      callback.call(this, e)
      off(elements, name, selector, handler)
    }
    on(elements, name, selector, handler)
  } else {
    function handler(e) {
      callback.call(this, e)
      off(elements, name, handler)
    }
    on(elements, name, handler)
  }

}


function off < TElement = HTMLElement > (elements: LikeArray < Element > ): void

function off < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, callback ? : (this: TElement, event: E) => void): void

function off < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, selector: string, callback: (this: TElement, event: E) => void): void

function off < N extends string, E extends Event, TElement = HTMLElement > (elements: LikeArray < TElement > , name: N, selector: any, callback ? : (this: TElement, event: E) => void): void {
  if (typeof selector === "function") {
    callback = selector;
    selector = void 0
  }

  callback = weakCacheFunctionEvent.get(callback) || callback

  if (callback !== undefined) {
    each(elements, (index, value) => {
      weakCacheEvent.get(value)?.set(name, new Set(Array.from(weakCacheEvent.get(value)?.get(name)?.values()).filter(v => {
        if (v.handler === callback && v.selector === selector) {
          value.removeEventListener(name, v.handler)
          return false
        }
      })))

    })

    return
  }

  if (name !== undefined) {
    each(elements, (index, value) => {
      weakCacheEvent.get(value)?.get(name)?.forEach(cb => {
        value.removeEventListener(name, cb.handler)
      })
      weakCacheEvent.get(value)?.delete(name)
    })

    return
  }

  each(elements, (index, value) => {
    weakCacheEvent.get(value)?.forEach((name, list) => {
      list.forEach(cb => {
        value.removeEventListener(name, cb.handler)
      })
    })

    weakCacheEvent.delete(value)
  })
}

export {
  on,
  one,
  off
}