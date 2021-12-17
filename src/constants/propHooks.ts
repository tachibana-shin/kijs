/* eslint-disable @typescript-eslint/no-explicit-any */
import support from "../static/isSupport";

const hooks = new Map<
  string,
  {
    readonly get?: (elem: any, name: string) => any;
    readonly set?: (elem: any, value: any, name: string) => any;
  }
>();

const rfocusable = /^(?:input|select|textarea|button)$/i,
  rclickable = /^(?:a|area)$/i;

hooks.set("tabIndex", {
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
});

if (!support.optSelected) {
  hooks.set("selected", {
    get(elem: Node) {
      const parent = elem.parentNode;
      if (parent && parent.parentNode) {
        return (parent.parentNode as HTMLSelectElement).selectedIndex;
      }
      return null;
    },
    set(elem: Node, value) {
      /* eslint no-unused-expressions: "off" */

      const parent = elem.parentNode;
      if (parent) {
        (parent as HTMLSelectElement).selectedIndex;

        if (parent.parentNode) {
          // eslint-disable-next-line functional/immutable-data
          return ((parent.parentNode as HTMLSelectElement).selectedIndex =
            value);
        }
      }
    },
  });
}

export default hooks;
