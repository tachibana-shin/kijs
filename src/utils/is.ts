// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function isFunction(e: any): e is Function {
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
export function isObject(obj: any) {
  return obj !== null && typeof obj === "object";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPlainObject<T extends Record<any, any>>(obj: any): obj is T {
  // Detect obvious negatives
  // Use toString instead of jQuery.type to catch host objects
  if (!obj || Object.prototype.toString.call(obj) !== "[object Object]") {
    return false;
  }

  const proto = Object.getPrototypeOf(obj);

  // Objects with no prototype (e.g., `Object.create( null )`) are plain
  if (!proto) {
    return true;
  }

  // Objects with prototype are plain iff they were constructed by a global Object function
  const Ctor =
    Object.prototype.hasOwnProperty.call(proto, "constructor") &&
    proto.constructor;
  return (
    typeof Ctor === "function" &&
    Object.prototye.hasOwnProperty.toString.call(Ctor) ===
      Object.prototye.hasOwnProperty.toString.call(Object)
  );
}
