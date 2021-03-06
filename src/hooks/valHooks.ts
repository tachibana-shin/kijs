/* eslint-disable @typescript-eslint/no-explicit-any */
import kijs from "../core/kijs";
import { stripAndCollapse } from "../static/className";
import each from "../static/each";
import isSupport from "../static/isSupport";
import text from "../static/text";
import value from "../static/value";

const hooks = new Map<
  string,
  {
    // eslint-disable-next-line functional/prefer-readonly-type
    get?: (elem: HTMLElement, prop: string) => string | null | void;
    // eslint-disable-next-line functional/prefer-readonly-type
    set?: (
      elem: HTMLElement,
      value: any,
      prop: string
    ) => string | null | boolean | void;
  }
>();

hooks.set("option", {
  get(elem: HTMLElement) {
    const val = elem.getAttribute("value");
    return val != null ? val : stripAndCollapse(text([elem]));
  },
});
hooks.set("select", {
  get(elem): any {
    if (elem instanceof HTMLSelectElement) {
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
        option = options[i];

        // Support: IE <=9 only
        // IE8-9 doesn't update selected after form reset (#2551)
        if (
          (option.selected || i === index) &&
          // Don't return options that are disabled or in a disabled optgroup
          !option.disabled &&
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (!(option.parentNode as any)!.disabled ||
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            !(option.parentNode!.nodeName.toLowerCase(), "optgroup"))
        ) {
          // Get the specific value for the option
          val = value(option as any);

          // We don't need an array for one selects
          if (one) {
            return val;
          }

          // Multi-Selects return an array
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (values as any)!.push(val);
        }
      }

      return values;
    }
  },

  set(elem, value): any {
    if (elem instanceof HTMLSelectElement) {
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
    }
  },
});

each(["radio", "checkbox"], (prop) => {
  hooks.set(prop, {
    set(elem, value) {
      if (Array.isArray(value)) {
        // eslint-disable-next-line functional/immutable-data
        return ((elem as HTMLInputElement).checked = value.includes(
          kijs(elem).val()
        ));
      }
    },
  });
  if (!isSupport.checkOn) {
    // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
    hooks.get(prop)!.get = (elem) => {
      return elem.getAttribute("value") === null
        ? "on"
        : (elem as HTMLInputElement).value;
    };
  }
});

export default hooks;
