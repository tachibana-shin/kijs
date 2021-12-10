import { curCSS } from "../static/css";

export default {
  opacity: {
    get<TElement = HTMLElement>(
      elem: TElement,
      computed: boolean
    ): string | void {
      if (computed) {
        const ret = curCSS(elem, "opacity");
        return ret === "" ? "1" : ret;
      }
    },
  },
};
