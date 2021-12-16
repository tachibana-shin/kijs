/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import LikeArray from "../types/LikeArray";
import { isFunction } from "../utils/is";

import { stripAndCollapse } from "./className";
import each from "./each";
import text from "./text";

const rreturn = /\r/g;

const valHooks: any = {
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
};

function $$value<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  val?: any
) {
  // eslint-disable-next-line functional/no-let
  let hooks, ret, valueIsFunction: boolean;
  const elem = elems[0];

  // eslint-disable-next-line functional/functional-parameters
  if (arguments.length < 2) {
    if (elem) {
      hooks =
        valHooks[(elem as any).type] || valHooks[elem.nodeName.toLowerCase()];

      if (
        hooks &&
        "get" in hooks &&
        (ret = hooks.get(elem, "value")) !== undefined
      ) {
        return ret;
      }

      ret = (elem as any).value;

      // Handle most common string cases
      if (typeof ret === "string") {
        return ret.replace(rreturn, "");
      }

      // Handle cases where value is null/undef or number
      return ret == null ? "" : ret;
    }

    return;
  }

  // eslint-disable-next-line prefer-const
  valueIsFunction = isFunction(val);

  each(elems, (elem, i) => {
    // eslint-disable-next-line functional/no-let
    let $val;

    if (elem.nodeType !== 1) {
      return;
    }

    if (valueIsFunction) {
      $val = val.call(elem, i, $$value([elem]));
    } else {
      $val = val;
    }

    // Treat null/undefined as ""; convert numbers to string
    if ($val == null) {
      $val = "";
    } else if (typeof $val === "number") {
      $val += "" as unknown as any;
    } else if (Array.isArray($val)) {
      $val = $val.map((value) => {
        return value == null ? "" : value + "";
      });
    }

    hooks =
      valHooks[(elem as any).type] || valHooks[elem.nodeName.toLowerCase()];

    // If set returns undefined, fall back to normal setting
    if (
      !hooks ||
      !("set" in hooks) ||
      hooks.set(elem, $val, "value") === undefined
    ) {
      // eslint-disable-next-line functional/immutable-data
      (elem as any).value = $val;
    }
  });
}

export default $$value;
