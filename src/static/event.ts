/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import LikeArray from "../types/LikeArray";

import each from "./each";

export const weakCacheEvent = new WeakMap<
  Element,
  // eslint-disable-next-line functional/prefer-readonly-type
  Map<
    string,
    // eslint-disable-next-line functional/prefer-readonly-type
    Set<{
      // eslint-disable-next-line @typescript-eslint/ban-types
      readonly handler: Function;
      readonly selector: string | null;
    }>
  >
>();
// eslint-disable-next-line @typescript-eslint/ban-types
const weakCacheFunctionEvent = new WeakMap<Function, Function>();

function on<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  callback: (this: TElement, event: E) => void
): void;

function on<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  selector: string,
  callback: (this: TElement, event: E) => void
): void;

function on<N extends string, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  selector: any,
  callback?: any
): void {
  if (typeof selector === "function") {
    callback = selector;
    selector = void 0;
  }

  const handler = selector
    ? function handler(this: any, e: any) {
        // eslint-disable-next-line functional/no-let
        let t = e.target;
        // eslint-disable-next-line functional/no-loop-statement
        while (t && t !== this) {
          if (t.matches(selector)) {
            callback.call(t, e);
          }
          t = t.parentNode;
        }
      }
    : function handler(this: any, e: any) {
        callback.call(this, e);
      };

  weakCacheFunctionEvent.set(callback, handler);

  each(elements, (value) => {
    if (weakCacheEvent.has(value) === false) {
      weakCacheEvent.set(value, new Map());
    }

    if (weakCacheEvent.get(value)!.has(name) === false) {
      weakCacheEvent.get(value)!.set(name, new Set());
    }

    weakCacheEvent.get(value)!.get(name)!.add({ handler, selector });
    value.addEventListener(name, handler);
  });
}

function one<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  callback: (this: TElement, event: E) => void
): void;

function one<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  selector: string,
  callback: (this: TElement, event: E) => void
): void;

function one<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  selector: any,
  callback?: (this: TElement, event: E) => void
): void {
  if (typeof selector === "function") {
    callback = selector;
    selector = void 0;
  }
  if (callback) {
    // eslint-disable-next-line no-inner-declarations
    function handler(this: any, e: any) {
      (callback as any).call(this, e);
      off(elements, name, selector, handler);
    }
    on(elements, name, selector, handler);
  } else {
    // eslint-disable-next-line no-inner-declarations
    function handler(this: any, e: any) {
      (callback as any).call(this, e);
      off(elements, name, handler);
    }
    on(elements, name, handler);
  }
}

// function off<TElement extends Element>(elements: LikeArray<TElement>): void;
function off<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name?: N,
  callback?: (this: TElement, event: E) => void
): void;

function off<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  selector: string,
  callback: (this: TElement, event: E) => void
): void;

function off<N extends string, E extends Event, TElement extends Element>(
  elements: LikeArray<TElement>,
  name: N,
  selector: any,
  callback?: (this: TElement, event: E) => void
): void {
  if (typeof selector === "function") {
    callback = selector;
    selector = void 0;
  }

  callback = (weakCacheFunctionEvent.get(callback!)! || callback!) as any;

  if (callback !== undefined) {
    each(elements, (value) => {
      weakCacheEvent.get(value)?.set(
        name,
        new Set(
          Array.from(
            weakCacheEvent.get(value)?.get(name)?.values() || []
          ).filter((v) => {
            if (
              selector === "*" ||
              (v.handler === callback && v.selector === selector)
            ) {
              (value as any).removeEventListener(name, v.handler);
              return false;
            }
          })
        )
      );
    });

    return;
  }

  if (name !== undefined) {
    each(elements, (value) => {
      weakCacheEvent
        .get(value)
        ?.get(name)
        ?.forEach((cb) => {
          (value as any).removeEventListener(name, cb.handler);
        });
      weakCacheEvent.get(value)?.delete(name);
    });

    return;
  }

  each(elements, (value) => {
    weakCacheEvent.get(value)?.forEach((list, name) => {
      list.forEach((cb) => {
        (value as any).removeEventListener(name, cb.handler);
      });
    });

    weakCacheEvent.delete(value);
  });
}

export { on, one, off };
