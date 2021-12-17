import isSupport from "../static/isSupport";

const hooks = new Map<
  string,
  {
    readonly set?: <T extends Element>(elem: T, value: string) => string | void;
    readonly get?: <T extends Element>(
      elem: T,
      value: string,
      name?: string
    ) => string;
  }
>();

hooks.set("type", {
  set(elem, value: string): string | void {
    if (
      elem instanceof HTMLInputElement &&
      !isSupport.radioValue &&
      value === "radio" &&
      elem.nodeName === "INPUT"
    ) {
      const val = elem.value;
      elem.setAttribute("type", value);
      if (val) {
        // eslint-disable-next-line functional/immutable-data
        elem.value = val;
      }
      return value;
    }
  },
});

export default hooks;
