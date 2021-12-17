import { curCSS } from "../static/css";

const hooks = new Map<
  string,
  {
    readonly get: (
      elem: HTMLElement,
      computed: boolean,
      extra: boolean | string
    ) => string | void;
  }
>();

hooks.set("opacity", {
  get<TElement extends HTMLElement>(
    elem: TElement,
    computed: boolean
  ): string | void {
    if (computed) {
      const ret = curCSS(elem, "opacity");
      return ret === "" ? "1" : ret;
    }
  },
});

export default hooks;
