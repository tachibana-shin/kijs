/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/no-let */
import cssHooks from "../hooks/cssHooks";
import getStyles from "../utils/getStyles";

import camelCase from "./camelCase";
import support from "./isSupport";
import { finalPropName } from "./style";

const pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
const rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"),
  rcustomProp = /^--/;
const cssNormalTransform = {
  letterSpacing: "0",
  fontWeight: "400",
};
export function curCSS<TElement extends HTMLElement>(
  elem: TElement,
  name: string,
  computed?: Record<string, any>
) {
  let width, minWidth, maxWidth, ret;

  const style = (elem as any).style;

  computed = computed || getStyles(elem);

  // getPropertyValue is needed for:
  //   .css('filter') (IE 9 only, #12537)
  //   .css('--customProperty) (#3144)
  if (computed) {
    ret = computed.getPropertyValue(name) || computed[name];

    if (ret === "" && !(elem as any).ownerDocument.contains(elem)) {
      ret = style(elem, name);
    }

    if (
      !support.pixelBoxStyles() &&
      rnumnonpx.test(ret) &&
      rcustomProp.test(name)
    ) {
      // Remember the original values
      width = style.width;
      minWidth = style.minWidth;
      maxWidth = style.maxWidth;

      // Put in the new values to get a computed value out
      // eslint-disable-next-line functional/immutable-data
      style.minWidth = style.maxWidth = style.width = ret;
      ret = computed.width;

      // Revert the changed values
      // eslint-disable-next-line functional/immutable-data
      style.width = width;
      // eslint-disable-next-line functional/immutable-data
      style.minWidth = minWidth;
      // eslint-disable-next-line functional/immutable-data
      style.maxWidth = maxWidth;
    }
  }

  return ret !== undefined
    ? // Support: IE <=9 - 11 only
      // IE returns zIndex value as an integer.
      ret + ""
    : ret;
}

function css<TElement extends HTMLElement>(
  elem: TElement,
  name: string
): string | number | void;

function css<TElement extends HTMLElement>(
  elem: TElement,
  name: string,
  extra: boolean | string,
  styles?: any
): void;

function css<TElement extends HTMLElement>(
  elem: TElement,
  name: string,
  extra: boolean | string = false,
  styles?: Record<string, any>
) {
  let val, num;
  const origName = camelCase(name),
    isCustomProp = rcustomProp.test(name);

  // Make sure that we're working with the right name. We don't
  // want to modify the value if it is a CSS custom property
  // since they are user-defined.
  if (!isCustomProp) {
    name = finalPropName(origName);
  }

  const hooks = cssHooks.get(origName);

  // If a hook was provided get the computed value from there
  if (hooks) {
    val = hooks.get(elem, true, extra);
  }

  // Otherwise, if a way to get the computed value exists, use that
  if (val === undefined) {
    val = curCSS(elem, name, styles);
  }

  // Convert "normal" to computed value
  if (val === "normal" && name in cssNormalTransform) {
    val = (cssNormalTransform as any)[name];
  }

  // Make numeric if forced or a qualifier was provided and val looks numeric
  if (extra === "" || extra) {
    num = parseFloat(val);
    return extra === true || isFinite(num) ? num || 0 : val;
  }

  return val;
}

export default css;
