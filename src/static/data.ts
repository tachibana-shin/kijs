const weakCache = new WeakMap<object, object>();

function data<T extends object>(objec: object): T;
function data<T = any>(object: object, key: string | number | symbol): T;
function data<T = any, V extends object>(
  object: object,
  key: string | number | symbol,
  value: T
): V;
function data<K extends string | number | symbol, V = any, B extends object>(
  object: object,
  data: {
    [key: K]: V;
  }
): B;

function data(object: object, key?: any, value?: any) {
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

      weakCache.get(object)![key] = value;

      return weakCache.get(object)!;
    }
  }

  if (weakCache.has(object) === false) {
    weakCache.set(object, Object.create(null));
  }

  for (const prop in key) {
    weakCache.get(object)![prop] = key[prop];
  }

  return weakCache.get(object)!;
}

function removeData(object: object): void;
function removeData(object: object, key: string | number | symbol): void;

function removeData(object: object, key?: any) {
  if (key === undefined) {
    weakCache.delete(object);
  } else {
    delete weakCache.get(object)?.[key];
  }
}

export { removeData };
export default dât;
