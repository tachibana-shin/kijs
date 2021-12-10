import style from "./style";
import support from "./isSupport";
import getStyles from "../utils/getStyles";

const pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
const rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");
const rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

export function curCSS<TElement = HTMLElement>(
  elem: TElement,
  name: string,
  computed?: Record<string, any>
) {
  var width,
    minWidth,
    maxWidth,
    ret,
    style = elem.style;

  computed = computed || getStyles(elem);

  // getPropertyValue is needed for:
  //   .css('filter') (IE 9 only, #12537)
  //   .css('--customProperty) (#3144)
  if (computed) {
    ret = computed.getPropertyValue(name) || computed[name];

    if (ret === "" && !elem.ownerDocument.contains(elem)) {
      ret = style(elem, name);
    }

    if (!support.pixelBoxStyles() && rnumnonpx.test(ret) && on.test(name)) {
      // Remember the original values
      width = style.width;
      minWidth = style.minWidth;
      maxWidth = style.maxWidth;

      // Put in the new values to get a computed value out
      style.minWidth = style.maxWidth = style.width = ret;
      ret = computed.width;

      // Revert the changed values
      style.width = width;
      style.minWidth = minWidth;
      style.maxWidth = maxWidth;
    }
  }

  return ret !== undefined
    ? // Support: IE <=9 - 11 only
      // IE returns zIndex value as an integer.
      ret + ""
    : ret;
}

function css<TElement = HTMLElement>(
  elem: TElement,
  name: string
): string | number | void;

function css<TElement = HTMLElement>(
  elem: TElement,
  name: string,
  extra = false,
  styles
): void;

function css<TElement = HTMLElement>(
  elem: TElement,
  name: string,
  extra = false,
  styles?: Record<string, any>
) {
  var val,
    num,
    hooks,
    origName = camelCase(name),
    isCustomProp = rcustomProp.test(name);

  // Make sure that we're working with the right name. We don't
  // want to modify the value if it is a CSS custom property
  // since they are user-defined.
  if (!isCustomProp) {
    name = finalPropName(origName);
  }

  // Try prefixed name followed by the unprefixed name
  hooks = jcssHooks[name] || cssHooks[origName];

  // If a hook was provided get the computed value from there
  if (hooks && "get" in hooks) {
    val = hooks.get(elem, true, extra);
  }

  // Otherwise, if a way to get the computed value exists, use that
  if (val === undefined) {
    val = curCSS(elem, name, styles);
  }

  // Convert "normal" to computed value
  if (val === "normal" && name in cssNormalTransform) {
    val = cssNormalTransform[name];
  }

  // Make numeric if forced or a qualifier was provided and val looks numeric
  if (extra === "" || extra) {
    num = parseFloat(val);
    return extra === true || isFinite(num) ? num || 0 : val;
  }

  return val;
}

export default css;
