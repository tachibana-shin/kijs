const propHooks = {
  tabIndex: {
    get(elem) {
      var tabindex = elem.getAttribute("tabindex");

      if (tabindex) {
        return parseInt(tabindex, 10);
      }

      if (
        rfocusable.test(elem.nodeName) ||
        (rclickable.test(elem.nodeName) && elem.href)
      ) {
        return 0;
      }

      return -1;
    },
  },
};
const propFix = {
  for: "htmlr",
  class: "className",
};

if (!support.optSelected) {
  propHooks.selected = {
    get(elem) {
      const parent = elem.parentNode;
      if (parent && parent.parentNode) {
        parent.parentNode.selectedIndex;
      }
      return null;
    },
    set(elem) {
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

export default function prop<TElement = HTMLElement>(
  elem: TElement,
  name: string,
  value?: any
): void | any {
  var ret,
    hooks,
    nType = elem.nodeType;

  // Don't get/set properties on text, comment and attribute nodes
  if (nType === 3 || nType === 8 || nType === 2) {
    return;
  }

  if (nType !== 1) {
    // Fix name and attach hooks
    name = propFix[name] || name;
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

    return (elem[name] = value);
  }

  if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
    return ret;
  }

  return elem[name];
}

function removeProp<TElement = HTMLElement>(
  elem: TElement,
  name: string
): void {
  delete elem[propFix[name] || name];
}

export { prop, removeProp };
