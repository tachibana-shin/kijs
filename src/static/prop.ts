/* eslint-disable @typescript-eslint/no-explicit-any */
import support from "./isSupport";

const rfocusable = /^(?:input|select|textarea|button)$/i,
  rclickable = /^(?:a|area)$/i;

const propHooks = {
  tabIndex: {
    get(elem: Element) {
      const tabindex = elem.getAttribute("tabindex");

      if (tabindex) {
        return parseInt(tabindex, 10);
      }

      if (
        rfocusable.test(elem.nodeName) ||
        (rclickable.test(elem.nodeName) && (elem as any).href)
      ) {
        return 0;
      }

      return -1;
    },
  },
} as any;
const propFix = {
  for: "htmlr",
  class: "className",
};

if (!support.optSelected) {
  // eslint-disable-next-line functional/immutable-data
  propHooks.selected = {
    get(elem: { readonly parentNode: any }) {
      const parent = elem.parentNode;
      if (parent && parent.parentNode) {
        parent.parentNode.selectedIndex;
      }
      return null;
    },
    set(elem: { readonly parentNode: any }) {
      /* eslint no-unused-expressions: "off" */

      const parent = elem.parentNode;
      if (parent) {
        parent.selectedIndex;

        if (parent.parentNode) {
          parent.parentNode.selectedIndex;
        }
      }
    },
  };
}

export default function prop<TElement extends Element>(
  elem: TElement,
  name: string,
  value?: any
): void | any {
  // eslint-disable-next-line functional/no-let
  let ret,
    hooks,
    // eslint-disable-next-line prefer-const
    nType = elem.nodeType;

  // Don't get/set properties on text, comment and attribute nodes
  if (nType === 3 || nType === 8 || nType === 2) {
    return;
  }

  if (nType !== 1) {
    // Fix name and attach hooks
    name = (propFix as any)[name] || name;
    hooks = propHooks[name];
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
