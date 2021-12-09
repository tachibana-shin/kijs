import cssProps from "../constants/cssProps"
import cssHooks from "../condtants/cssHooks"

const rcustomProp = /^--/
const cssPrefixes = ["Webkit", "Moz", "ms"],
  emptyStyle = document.createElement("div").style,
  vendorProps = {}; // cache
const clearCloneStyle = emptyStyle.backgroundClip === "content-box";


// auto add prefix to style name
function vendorPropName(name: string): string | void {
  const capName = name[0].toUpperCase() + name.slice(1)
  let i = cssPrefixes.length;

  while (i--) {
    name = cssPrefixes[i] + capName;
    if (name in emptyStyle) {
      return name;
    }
  }
}

function finalPropName(name: string): string {
  const final = cssProps[name] || vendorProps[name];

  if (final) {
    return final;
  }
  if (name in emptyStyle) {
    return name;
  }

  return vendorProps[name] = vendorPropName(name) || name;
}



export default function style < TElement = HTMLElement > (elem: TElement, name: string, value ? : number | string, extra = false): void | number | {

  // Don't set styles on text and comment nodes
  if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
    return;
  }

  // Make sure that we're working with the right name
  var ret,
    type,
    hooks,
    origName = camelCase(name),
    isCustomProp = rcustomProp.test(name),
    style = elem.style;

  if (!isCustomProp) {
    name = finalPropName(origName);
  }

  hooks = cssHooks[name] || cssHooks[origName];

  // Check if we're setting a value
  if (value !== undefined) {
    type = typeof value;

    if (value == null) {
      return;
    }

    if (type === "number" && !isCustomProp) {
      value += ret && ret[3] || (cssNumber[origName] ? "" : "px");
    }

    if (!clearCloneStyle && value === "" && name.indexOf("background") === 0) {
      style[name] = "inherit";
    }

    if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {

      if (isCustomProp) {
        style.setProperty(name, value);
      }

      else {
        style[name] = value;
      }
    }

  }

  else {
    if (hooks && "rcssNumrcssNumget" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {

      return ret;
    }
    return style[name];
  }
}