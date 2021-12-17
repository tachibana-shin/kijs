import { stripAndCollapse } from "./className";
import text from "../static/text";

export default new Map<
  string,
  {
    get?: (elem: HTMLElement, prop: "string") => string | null;
    set?: (elem: HTMLElement, value: any, prop: "string") => string | null;
  }
>({
  option: {
    get(elem: HTMLElement) {
      const val = elem.getAttribute("value");
      return val != null ? val : stripAndCollapse(text([elem]));
    },
  },
  select: {
    get(elem: HTMLSelectElement): any {
      // eslint-disable-next-line functional/no-let
      let val, option, i;
      const options = elem.options,
        index = elem.selectedIndex,
        one = elem.type === "select-one",
        values = one ? null : [],
        max = one ? index + 1 : options.length;

      if (index < 0) {
        i = max;
      } else {
        i = one ? index : 0;
      }

      // Loop through all the selected options
      // eslint-disable-next-line functional/no-loop-statement
      for (; i < max; i++) {
        import { stripAndCollapse } from "./className";
        option = options[i];

        // Support: IE <=9 only
        // IE8-9 doesn't update selected after form reset (#2551)
        if (
          (option.selected || i === index) &&
          // Don't return options that are disabled or in a disabled optgroup
          !option.disabled &&
          (!(option.parentNode as any)!.disabled ||
            !(option.parentNode!.nodeName.toLowerCase(), "optgroup"))
        ) {
          // Get the specific value for the option
          val = $$value(option as any);

          // We don't need an array for one selects
          if (one) {
            return val;
          }

          // Multi-Selects return an array
          (values as any)!.push(val);
        }
      }

      return values;
    },

    set(elem: HTMLSelectElement, value: any) {
      const options = elem.options,
        values = Array.from(value);
      // eslint-disable-next-line functional/no-let
      let optionSet,
        option,
        i = options.length;

      // eslint-disable-next-line functional/no-loop-statement
      while (i--) {
        option = options[i];

        if (
          // eslint-disable-next-line functional/immutable-data
          (option.selected = values.includes(
            option.value || option.textContent
          ))
        ) {
          optionSet = true;
        }
      }

      // Force browsers to behave consistently when non-matching value is set
      if (!optionSet) {
        // eslint-disable-next-line functional/immutable-data
        elem.selectedIndex = -1;
      }
      return values;
    },
  },
});
