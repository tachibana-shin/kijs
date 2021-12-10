/* eslint-disable @typescript-eslint/no-explicit-any */
const weakCache = new WeakMap<Element, any>();

function data<T extends Record<any, any>>(object: Element): T;
function data<T = any>(
  object: Element,
  key: string | number | symbol
): T;
function data<V extends Record<any, any>, T = any>(
  object: Element,
  key: string | number | symbol,
  value: T
): V;
function data<
  K extends string | number | symbol,
  B extends Record<any, any>,
  V = any
>(object: Element, data: Record<K, V>): B;

function data(object: Element, key?: any, value?: any) {
  if (key === undefined) {
    return weakCache.get(object) || Object.create(null);
  }

  if (typeof key === "string") {
    if (value === undefined) {
      return weakCache.get(object)?.[key];
    } else {
      if (weakCache.has(object) === false) {
        weakCache.set(object, Object.create(null));
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newLocal = weakCache.get(object)!;
      // eslint-disable-next-line functional/immutable-data
      newLocal[key] = value;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return weakCache.get(object)!;
    }
  }

  if (weakCache.has(object) === false) {
    weakCache.set(object, Object.create(null));
  }

  // eslint-disable-next-line functional/no-loop-statement
  for (const prop in key) {
    // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
    weakCache.get(object)![prop] = key[prop];
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return weakCache.get(object)!;
}

function removeData(object: Element): void;
function removeData(object: Element, key: string | number | symbol): void;

function removeData(object: Element, key?: any) {
  if (key === undefined) {
    weakCache.delete(object);
  } else {
    delete weakCache.get(object)?.[key];
  }
}

export { removeData };
export default data;
