export default new Map<string, {
  set?: <T = Node>(elem: T, value: string) => string | void;
  get?: <T = Node>(elem: T, value: string, name: string) => string
}>({
  type: {
    set(elem: HTMLInputElement, value: string): string | void {
      if (
        !support.radioValue &&
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
  },
});