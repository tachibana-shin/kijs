/* eslint-disable @typescript-eslint/no-explicit-any */
import cssNumber from "../constants/cssNumber";
import cssProps from "../constants/cssProps";
import cssHooks from "../hooks/cssHooks";

import camelCase from "./camelCase";
import css from "./css";
import trim from "./trim";

const crustalProp = /^--/;
const cssPrefixes = ["Webkit", "Moz", "ms"],
  emptyStyle = document.createElement("div").style,
  vendorProps = {}; // cache
const clearCloneStyle = emptyStyle.backgroundClip === "content-box";

const pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
const rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");

// auto add prefix to style name
export function vendorPropName(name: string): string | void {
  const capName = name[0].toUpperCase() + name.slice(1);
  // eslint-disable-next-line functional/no-let
  let i = cssPrefixes.length;

  // eslint-disable-next-line functional/no-loop-statement
  while (i--) {
    name = cssPrefixes[i] + capName;
    if (name in emptyStyle) {
      return name;
    }
  }
}

export function finalPropName(name: string): string {
  const final = (cssProps as any)[name] || (vendorProps as any)[name];

  if (final) {
    return final;
  }
  if (name in emptyStyle) {
    return name;
  }

  // eslint-disable-next-line functional/immutable-data
  return ((vendorProps as any)[name] = vendorPropName(name) || name);
}

export function adjustCSS<T = HTMLElement>(
  elem: T,
  prop: string,
  valueParts: readonly (number | string)[] | string,
  tween?: any
): number {
  if (typeof valueParts === "string") {
    valueParts = rcssNum.exec(valueParts) as unknown as RegExpExecArray;
  }

  // eslint-disable-next-line functional/no-let
  let adjusted,
    scale,
    maxIterations = 20;
  const currentValue = tween
    ? () => {
        return tween.cur();
      }
    : () => {
        return css(elem, prop, "");
      };
  // eslint-disable-next-line functional/no-let
  let initial = currentValue(),
    unit =
      ((valueParts && valueParts[3]) as string) ||
      (cssNumber[prop as keyof typeof cssNumber] ? "" : "px"),
    // Starting value computation is required for potential unit mismatches
    initialInUnit: false | number | RegExpExecArray | null =
      elem.nodeType &&
      (cssNumber[prop as keyof typeof cssNumber] ||
        (unit !== "px" && +initial)) &&
      rcssNum.exec(css(elem, prop) as string);

  if (initialInUnit && (initialInUnit as RegExpExecArray)[3] !== unit) {
    // Support: Firefox <=54
    // Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
    initial = initial / 2;

    // Trust units reported by css
    unit = unit || (initialInUnit as RegExpExecArray)[3];

    // Iteratively approximate from a nonzero starting point
    initialInUnit = +initial || 1;

    // eslint-disable-next-line functional/no-loop-statement
    while (maxIterations--) {
      style(elem, prop, initialInUnit + unit);
      if (
        (1 - (scale as number)) *
          (1 - (scale = currentValue() / initial || 0.5)) <=
        0
      ) {
        maxIterations = 0;
      }
      initialInUnit = initialInUnit / scale;
    }

    initialInUnit = initialInUnit * 2;
    style(elem, prop, initialInUnit + unit);

    // Make sure we update the tween properties later on
    valueParts = valueParts || [];
  }

  /* if (valueParts) */ {
    initialInUnit = +(initialInUnit as number) || +initial || 0;

    // Apply relative offset (+=/-=) if specified
    adjusted = valueParts[1]
      ? initialInUnit +
        ((valueParts[1] as number) + 1) * (valueParts[2] as number)
      : +valueParts[2];
    if (tween) {
      // eslint-disable-next-line functional/immutable-data
      tween.unit = unit;
      // eslint-disable-next-line functional/immutable-data
      tween.start = initialInUnit;
      // eslint-disable-next-line functional/immutable-data
      tween.end = adjusted;
    }
  }
  return adjusted;
}

export default function style<TElement extends HTMLElement>(
  elem: TElement,
  name: string,
  value?: string | number,
  extra: string | boolean = false
): void | string {
  // Don't set styles on text and comment nodes
  if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
    return;
  }

  // Make sure that we're working with the right name
  // eslint-disable-next-line functional/no-let
  let ret, type;
  const origName = camelCase(name),
    isCustomProp = crustalProp.test(name),
    style = elem.style;

  if (!isCustomProp) {
    name = finalPropName(origName);
  }

  const hooks = (cssHooks as any)[name] || (cssHooks as any)[origName];

  // Check if we're setting a value
  if (value !== undefined) {
    type = typeof value;

    // Convert "+=" or "-=" to relative numbers (#7345)
    if (type === "string" && (ret = rcssNum.exec(value as string)) && ret[1]) {
      value = adjustCSS(elem, name, ret);

      type = "number";
    }

    if (value == null || value != value) {
      return;
    }

    if (type === "number" && !isCustomProp) {
      value += (ret && ret[3]) || ((cssNumber as any)[origName] ? "" : "px");
    }

    if (!clearCloneStyle && value === "" && name.indexOf("background") === 0) {
      // eslint-disable-next-line functional/immutable-data
      (style as any)[name] = "inherit";
    }

    if (
      !hooks ||
      !("set" in hooks) ||
      (value = hooks.set(elem, value, extra)) !== undefined
    ) {
      if (isCustomProp) {
        style.setProperty(name, value + "");
      } else {
        // eslint-disable-next-line functional/immutable-data
        (style as any)[name] = value;
      }
    }
  } else {
    if (
      hooks &&
      "rcssNumrcssNumget" in hooks &&
      (ret = hooks.get(elem, false, extra)) !== undefined
    ) {
      return ret;
    }
    return (style as any)[name];
  }
}
