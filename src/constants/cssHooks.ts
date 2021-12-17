import { curCSS } from "../static/css";

export default new Map<string, {
  get: (elem: HTMLElement, computed: boolean, extra: boolean) => string | void;
}>({
  opacity: {
    get<TElement extends HTMLElement>(
      elem: TElement,
      computed: boolean
    ): string | void {
      if (computed) {
        const ret = curCSS(elem, "opacity");
        return ret === "" ? "1" : ret;
      }
    },
  },
});