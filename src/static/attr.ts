import attrHooks from "../constants/attrHooks";

import prop from "./prop";

const matchBool =
  /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i;
const rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

const boolHook = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(elem: Element, value: any, name: string): string | void {
    if (value === false) {
      removeAttr(elem, name);
    } else {
      elem.setAttribute(name, name);
    }
    return name;
  },
};

function attr<TElement extends Element>(elem: TElement, name: string): string;

function attr<TElement extends Element>(
  elem: TElement,
  name: string,
  value: string | number
): void;

function attr<TElement extends Element>(
  elem: TElement,
  name: string,
  value?: string | number
) {
  // eslint-disable-next-line functional/no-let
  let ret, hooks;
  const nType = elem.nodeType;

  // Don't get/set attributes on text, comment and attribute nodes
  if (nType === 3 || nType === 8 || nType === 2) {
    return;
  }

  // Fallback to prop when attributes are not supported
  if (typeof elem.getAttribute === "undefined") {
    return prop(elem, name, value);
  }

  // Attribute hooks are determined by the lowercase version
  // Grab necessary hook if one is defined
  if (nType !== 1) {
    hooks =
      attrHooks.get(name.toLowerCase()) ||
      (matchBool.test(name) ? boolHook : undefined);
  }

  if (value !== undefined) {
    if (value === null) {
      removeAttr(elem, name);
      return;
    }

    if (
      hooks &&
      "set" in hooks &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ret = hooks.set?.(elem as any, value as any, name)) !== undefined
    ) {
      return ret;
    }

    elem.setAttribute(name, value + "");
    return value;
  }

  if (hooks && "get" in hooks && (ret = hooks.get?.(elem, name)) !== null) {
    return ret;
  }

  ret = elem.getAttribute(name);

  // Non-existent attributes return null, we normalize to undefined
  return ret == null ? undefined : ret;
}

function removeAttr<TElement extends Element>(
  elem: TElement,
  value: string
): void {
  const attrNames = value && value.match(rnothtmlwhite);

  if (attrNames && elem.nodeType === 1) {
    // eslint-disable-next-line functional/no-let
    let i = 0;
    const name = attrNames[i++];
    // eslint-disable-next-line functional/no-loop-statement
    while (name) {
      elem.removeAttribute(name);
    }
  }
}

export default attr;
export { removeAttr };
