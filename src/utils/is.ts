// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function isFunction<T extends Function>(e: any): e is T {
  return typeof e === "function" && typeof e.nodeType !== "number";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isArrayLike<T = any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arr: any
  // eslint-disable-next-line @typescript-eslint/ban-types
): arr is ArrayLike<T> & object {
  // not accept typeof string
  if (isFunction(arr) || arr === window) {
    return false;
  }
  return isObject(arr) && "length" in arr;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isObject<T extends object>(obj: any): obj is T {
  return obj !== null && typeof obj === "object";
}

const emptyObject = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPlainObject<T extends Record<any, any>>(obj: any): obj is T {
  // Detect obvious negatives
  // Use toString instead of jQuery.type to catch host objects
  if (!obj || emptyObject.toString.call(obj) !== "[object Object]") {
    return false;
  }

  const proto = Object.getPrototypeOf(obj);

  // Objects with no prototype (e.g., `Object.create( null )`) are plain
  if (!proto) {
    return true;
  }

  // Objects with prototype are plain iff they were constructed by a global Object function
  const Ctor =
    emptyObject.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return (
    typeof Ctor === "function" &&
    emptyObject.hasOwnProperty.toString.call(Ctor) ===
      emptyObject.hasOwnProperty.toString.call(Object)
  );
}
