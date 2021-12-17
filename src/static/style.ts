/* eslint-disable @typescript-eslint/no-explicit-any */
import cssHooks from "../constants/cssHooks";
import cssNumber from "../constants/cssNumber";
import cssProps from "../constants/cssProps";

import camelCase from "./camelCase";

const crustalProp = /^--/;
const cssPrefixes = ["Webkit", "Moz", "ms"],
  emptyStyle = document.createElement("div").style,
  vendorProps = {}; // cache
const clearCloneStyle = emptyStyle.backgroundClip === "content-box";

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

    if (value == null) {
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
