import support from "./isSupport";

const hooks = new Map<
  string,
  {
    get?: (elem: any, name: string) => any;
    set?: (elem: any, value: any, name: string) => any;
  }
>({
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
});

if (!support.optSelected) {
  // eslint-disable-next-line functional/immutable-data
  hooks.set("selected", {
    get(elem: Node) {
      const parent = elem.parentNode;
      if (parent && parent.parentNode) {
        return parent.parentNode.selectedIndex;
      }
      return null;
    },
    set(elem: Node, value) {
      /* eslint no-unused-expressions: "off" */

      const parent = elem.parentNode;
      if (parent) {
        return (parent.selectedIndex = value);

        if (parent.parentNode) {
          return (parent.parentNode.selectedIndex = value);
        }
      }
    },
  });
}

export default hooks;
