/* eslint-disable @typescript-eslint/no-explicit-any */
import kijs from "../core/kijs";
import addGetHookIf from "../helpers/addGetHookIf";
import css, { curCSS } from "../static/css";
import each from "../static/each";
import isSupport from "../static/isSupport";
import getStyles from "../utils/getStyles";

const hooks = new Map<
  string,
  {
    // eslint-disable-next-line functional/prefer-readonly-type
    get?: (
      elem: HTMLElement,
      computed: boolean,
      extra: boolean | string
    ) => string | void;
    // eslint-disable-next-line functional/prefer-readonly-type
    set?: (
      elem: HTMLElement,
      value: string,
      subtract: number
    ) => string | number | void;
    // eslint-disable-next-line functional/prefer-readonly-type
    expand?: (value: string) => Record<string, string | number>;
  }
>();

hooks.set("opacity", {
  get<TElement extends HTMLElement>(
    elem: TElement,
    computed: boolean
  ): string | void {
    if (computed) {
      const ret = curCSS(elem, "opacity");
      return ret === "" ? "1" : ret;
    }
  },
});

const rdisplayswap = /^(none|table(?!-c[ea]).+)/;

function swap<T = string | void>(
  elem: HTMLElement,
  options: {
    // eslint-disable-next-line functional/prefer-readonly-type
    [key: string]: string | number;
  },
  callback: (this: HTMLElement) => T
): T {
  const old: typeof options = {};
  // Remember the old values, and insert the new ones
  // eslint-disable-next-line functional/no-loop-statement
  for (const name in options) {
    // eslint-disable-next-line functional/immutable-data
    (old as any)[name] = elem.style[name as keyof typeof elem.style];
    // eslint-disable-next-line functional/immutable-data
    (elem.style as any)[name] = options[name];
  }

  const ret = callback.call(elem);

  // Revert the old values
  // eslint-disable-next-line functional/no-loop-statement
  for (const name in options) {
    // eslint-disable-next-line functional/immutable-data
    (elem.style as any)[name] = old[name];
  }

  return ret;
}

const cssShow = {
  position: "absolute",
  visibility: "hidden",
  display: "block",
};
const cssExpand = ["Top", "Right", "Bottom", "Left"];

function boxModelAdjustment(
  elem: HTMLElement,
  dimension: string,
  box: string | boolean,
  isBorderBox: boolean,
  styles: any,
  computedVal?: number
) {
  // eslint-disable-next-line functional/no-let
  let i = dimension === "width" ? 1 : 0,
    extra = 0,
    delta = 0;

  // Adjustment may not be necessary
  if (box === (isBorderBox ? "border" : "content")) {
    return 0;
  }

  // eslint-disable-next-line functional/no-loop-statement
  for (; i < 4; i += 2) {
    // Both box models exclude margin
    if (box === "margin") {
      delta +=
        (css(elem, box + cssExpand[i], true, styles) as unknown as number) - 0;
    }

    // If we get here with a content-box, we're seeking "padding" or "border" or "margin"
    if (!isBorderBox) {
      // Add padding
      delta +=
        (css(
          elem,
          "padding" + cssExpand[i],
          true,
          styles
        ) as unknown as number) - 0;

      // For "border" or "margin", add border
      if (box !== "padding") {
        delta +=
          (css(
            elem,
            "border" + cssExpand[i] + "Width",
            true,
            styles
          ) as unknown as number) - 0;

        // But still keep track of it otherwise
      } else {
        extra +=
          (css(
            elem,
            "border" + cssExpand[i] + "Width",
            true,
            styles
          ) as unknown as number) - 0;
      }

      // If we get here with a border-box (content + padding + border), we're seeking "content" or
      // "padding" or "margin"
    } else {
      // For "content", subtract padding
      if (box === "content") {
        delta -=
          (css(
            elem,
            "padding" + cssExpand[i],
            true,
            styles
          ) as unknown as number) - 0;
      }

      // For "content" or "padding", subtract border
      if (box !== "margin") {
        delta -=
          (css(
            elem,
            "border" + cssExpand[i] + "Width",
            true,
            styles
          ) as unknown as number) - 0;
      }
    }
  }

  // Account for positive content-box scroll gutter when requested by providing computedVal
  if (!isBorderBox && computedVal !== void 0 && computedVal >= 0) {
    // offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
    // Assuming integer scroll gutter, subtract the rest and round down
    delta +=
      Math.max(
        0,
        Math.ceil(
          (elem as any)[
            "offset" + dimension[0].toUpperCase() + dimension.slice(1)
          ] -
            computedVal -
            delta -
            extra -
            0.5

          // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
          // Use an explicit zero to avoid NaN (gh-3964)
        )
      ) || 0;
  }

  return delta;
}

const pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
const rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
function getWidthOrHeight(
  elem: HTMLElement,
  dimension: string,
  extra: string | boolean
) {
  // Start with computed style
  const styles = getStyles(elem),
    // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
    // Fake content-box until we know it's needed to know the true value.
    boxSizingNeeded = !isSupport.boxSizingReliable() || extra;
  // eslint-disable-next-line functional/no-let
  let isBorderBox =
      boxSizingNeeded && css(elem, "boxSizing", false, styles) === "border-box",
    valueIsBorderBox = isBorderBox;
  // eslint-disable-next-line functional/no-let
  let val = curCSS(elem, dimension, styles);
  const offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);

  // Support: Firefox <=54
  // Return a confounding non-pixel value or feign ignorance, as appropriate.
  if (rnumnonpx.test(val)) {
    if (!extra) {
      return val;
    }
    val = "auto";
  }

  if (
    ((!isSupport.boxSizingReliable() && isBorderBox) ||
      (!isSupport.reliableTrDimensions() && elem.nodeName === "TR") ||
      val === "auto" ||
      (!parseFloat(val) && css(elem, "display", false, styles) === "inline")) &&
    elem.getClientRects().length
  ) {
    isBorderBox = css(elem, "boxSizing", false, styles) === "border-box";

    valueIsBorderBox = offsetProp in elem;
    if (valueIsBorderBox) {
      val = (elem as any)[offsetProp];
    }
  }

  // Normalize "" and auto
  val = parseFloat(val) || 0;

  // Adjust for the element's box model
  return (
    val +
    boxModelAdjustment(
      elem,
      dimension,
      extra || (isBorderBox ? "border" : "content"),
      !!valueIsBorderBox,
      styles,

      // Provide the current computed size to request scroll gutter calculation (gh-3589)
      val
    ) +
    "px"
  );
}

const rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");

function setPositiveNumber(
  _elem: Node,
  value: string,
  subtract: number
): number | string {
  // Any relative (+/-) values have already been
  // normalized at this point
  const matches = rcssNum.exec(value);
  return matches
    ? // Guard against undefined "subtract", e.g., when used as in cssHooks
      Math.max(0, (matches as any)[2] - (subtract || 0)) + (matches[3] || "px")
    : value;
}

each(["height", "width"], (dimension) => {
  hooks.set(dimension, {
    get(elem, computed, extra) {
      if (computed) {
        return rdisplayswap.test(css(elem, "display") as string) &&
          (!elem.getClientRects().length || !elem.getBoundingClientRect().width)
          ? swap(elem, cssShow, () => {
              return getWidthOrHeight(elem, dimension, extra);
            })
          : getWidthOrHeight(elem, dimension, extra);
      }
    },

    set(elem: HTMLElement, value: any, extra: any) {
      // eslint-disable-next-line functional/no-let
      let matches;
      const styles = getStyles(elem),
        // Only read styles.position if the test has a chance to fail
        // to avoid forcing a reflow.
        scrollboxSizeBuggy =
          !isSupport.scrollboxSize() && styles.position === "absolute",
        // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
        boxSizingNeeded = scrollboxSizeBuggy || extra,
        isBorderBox =
          boxSizingNeeded &&
          css(elem, "boxSizing", false, styles) === "border-box";
      // eslint-disable-next-line functional/no-let
      let subtract = extra
        ? boxModelAdjustment(elem, dimension, extra, isBorderBox, styles)
        : 0;

      // Account for unreliable border-box dimensions by comparing offset* to computed and
      // faking a content-box to get border and padding (gh-3699)
      if (isBorderBox && scrollboxSizeBuggy) {
        subtract -= Math.ceil(
          (elem as any)[
            "offset" + dimension[0].toUpperCase() + dimension.slice(1)
          ] -
            parseFloat((styles as any)[dimension]) -
            boxModelAdjustment(elem, dimension, "border", false, styles) -
            0.5
        );
      }

      // Convert to pixels if value adjustment is needed
      if (
        subtract &&
        (matches = rcssNum.exec(value)) &&
        (matches[3] || "px") !== "px"
      ) {
        // eslint-disable-next-line functional/immutable-data
        (elem.style as any)[dimension] = value;
        value = css(elem, dimension);
      }

      return setPositiveNumber(elem, value, subtract);
    },
  });
});

hooks.set(
  "marginLeft",
  addGetHookIf(
    isSupport.reliableMarginLeft,
    function (elem: HTMLElement, computed: any) {
      if (computed) {
        return (
          (parseFloat(curCSS(elem, "marginLeft")) ||
            elem.getBoundingClientRect().left -
              swap(elem, { marginLeft: 0 }, function () {
                return elem.getBoundingClientRect().left;
              })) + "px"
        );
      }
    }
  )
);

// These hooks are used by animate to expand properties
each(
  {
    margin: "",
    padding: "",
    border: "Width",
  },
  (suffix, prefix) => {
    hooks.set(prefix + suffix, {
      expand(value) {
        const expanded = {},
          // Assumes a single number if not a string
          parts = typeof value === "string" ? value.split(" ") : [value];

        // eslint-disable-next-line functional/no-loop-statement, functional/no-let
        for (let i = 0; i < 4; i++) {
          // eslint-disable-next-line functional/immutable-data
          (expanded as any)[prefix + cssExpand[i] + suffix] =
            parts[i] || parts[i - 2] || parts[0];
        }

        return expanded;
      },
    });

    if (prefix !== "margin") {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
      hooks.get(prefix + suffix)!.set = setPositiveNumber;
    }
  }
);

each(["top", "left"], (prop) => {
  hooks.set(
    prop,
    addGetHookIf(isSupport.pixelPosition, function (elem: any, computed: any) {
      if (computed) {
        computed = curCSS(elem, prop);

        // If curCSS returns percentage, fallback to offset
        return rnumnonpx.test(computed)
          ? kijs(elem).position()[prop as "top" | "left"] + "px"
          : computed;
      }
    })
  );
});

export default hooks;
