/* eslint-disable @typescript-eslint/no-explicit-any */
import valHooks from "../hooks/valHooks";
import { isFunction } from "../utils/is";

import each from "./each";

const rreturn = /\r/g;

function $$value<TElement extends HTMLElement>(
  elems: ArrayLike<TElement>,
  val?: any
) {
  // eslint-disable-next-line functional/no-let
  let hooks, ret;
  const elem = elems[0];

  // eslint-disable-next-line functional/functional-parameters
  if (arguments.length < 2) {
    if (elem) {
      hooks =
        valHooks.get((elem as any).type) ||
        valHooks.get(elem.nodeName.toLowerCase());

      if (
        hooks &&
        "get" in hooks &&
        (ret = hooks.get?.(elem, "value")) !== undefined
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

  const valueIsFunction = isFunction(val);

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
      valHooks.get((elem as any).type) ||
      valHooks.get(elem.nodeName.toLowerCase());

    // If set returns undefined, fall back to normal setting
    if (
      !hooks ||
      !("set" in hooks) ||
      hooks.set?.(elem, $val, "value") === undefined
    ) {
      // eslint-disable-next-line functional/immutable-data
      (elem as any).value = $val;
    }
  });
}

export default $$value;
