// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function isFunction(e: any): e is Function {
  return typeof e === "function" && typeof e.nodeType !== "number";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isArrayLike(arr: any): arr is readonly any[] {
  if (isFunction(arr) || arr === window) return false;
  return isObject(arr) && "length" in arr;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isObject(obj: any) {
  return obj !== null && typeof obj === "object";
}