export default {
  opacity: {
    get<TElement = HTMLElement>(
      elem: TElement,
      computed: boolean
    ): string | void {
      if (computed) {
        // We should always get a number back from opacity
        var ret = curCSS(elem, "opacity");
        return ret === "" ? "1" : ret;
      }
    },
  },
};
