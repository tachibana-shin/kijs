const matchBool = /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i
const attrHooks = {
  type: {
    set(elem, value) {
      if (!support.radioValue && value === "radio" &&
        elem.nodeName === "INPUT") {
        var val = elem.value;
        elem.setAttribute("type", value);
        if (val) {
          elem.value = val;
        }
        return value;
      }
    }
  }
}

function attr < TElement = HTMLElement > (elem: TElement, name: string): string;

function attr < TElement = HTMLElement > (elem: TElement, name: string, value: string | number): void

function attr < TElement = HTMLElement > (elem: TElement, name: string, value ? : string | number) {
  var ret, hooks,
    nType = elem.nodeType;

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
  if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
    hooks = attrHooks[name.toLowerCase()] ||
      (matchBool.test(name) ? boolHook : undefined);
  }

  if (value !== undefined) {
    if (value === null) {
      removeAttr(elem, name);
      return;
    }

    if (hooks && "set" in hooks &&
      (ret = hooks.set(elem, value, name)) !== undefined) {
      return ret;
    }

    elem.setAttribute(name, value + "");
    return value;
  }

  if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
    return ret;
  }

  ret = elem.getAttribute(name)

  // Non-existent attributes return null, we normalize to undefined
  return ret == null ? undefined : ret;
}

function removeAttr< TElement = HTMLElement > (elem: TElement, value: string) {
  var name,
    i = 0,

    // Attribute names can contain non-HTML whitespace characters
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    attrNames = value && value.match(rnothtmlwhite);

  if (attrNames && elem.nodeType === 1) {
    while ((name = attrNames[i++])) {
      elem.removeAttribute(name);
    }
  }
}

export { attr, removeAttr }