/* eslint-disable @typescript-eslint/no-explicit-any */
import propHooks from "../constants/propHooks";

const rfocusable = /^(?:input|select|textarea|button)$/i,
  rclickable = /^(?:a|area)$/i;

const propFix = {
  for: "htmlr",
  class: "className",
};

export default function prop<TElement extends Element>(
  elem: TElement,
  name: string,
  value?: any
): void | any {
  // eslint-disable-next-line functional/no-let
  let ret, hooks;
  const nType = elem.nodeType;

  // Don't get/set properties on text, comment and attribute nodes
  if (nType === 3 || nType === 8 || nType === 2) {
    return;
  }

  if (nType !== 1) {
    // Fix name and attach hooks
    name = (propFix as any)[name] || name;
    hooks = propHooks.get(name);
  }

  if (value !== undefined) {
    if (
      hooks &&
      "set" in hooks &&
      (ret = hooks.set(elem, value, name)) !== undefined
    ) {
      return ret;
    }

    // eslint-disable-next-line functional/immutable-data
    return ((elem as any)[name] = value);
  }

  if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
    return ret;
  }

  return (elem as any)[name];
}

function removeProp<TElement = HTMLElement>(
  elem: TElement,
  name: string
): void {
  // eslint-disable-next-line functional/immutable-data
  delete (elem as any)[(propFix as any)[name] || name];
}

export { prop, removeProp };
