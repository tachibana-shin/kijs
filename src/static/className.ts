import LikeArray from "../types/LikeArray";
import { isFunction } from "../utils/is";

import { attr } from "./attr";
import data from "./data";
import each from "./each";

const rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

function classesToArray(value: string | readonly string[]): readonly string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value.match(rnothtmlwhite) || [];
  }
  return [];
}

function getClass<TElement extends HTMLElement>(elem: TElement): string {
  return elem?.getAttribute("class") || elem?.className || "";
}

export function stripAndCollapse(value: string): string {
  const tokens = value.match(rnothtmlwhite) || [];
  return tokens.join(" ");
}

function addClass<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  value:
    | string
    | readonly string[]
    | ((index: number, currentClass: string) => string | readonly string[])
): void {
  if (isFunction(value)) {
    each(elems, (elem, j) => {
      addClass([elem], value.call(elem, j, getClass(elem)));
    });

    return;
  }

  const classes = classesToArray(value);

  if (classes.length) {
    each(elems, (elem) => {
      const curValue = getClass(elem);
      // eslint-disable-next-line functional/no-let
      let cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";

      if (cur) {
        each(classes, ( clazz) => {
          if ((cur as string).includes(" " + clazz + " ") === false) {
            cur += clazz + " ";
          }
        });

        // Only assign if different to avoid unneeded rendering.
        const finalValue = stripAndCollapse(cur);
        if (curValue !== finalValue) {
          elem.setAttribute("class", finalValue);
        }
      }
    });
  }
}

function removeClass<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  value?:
    | string
    | readonly string[]
    | ((index: number, currentClass: string) => string | readonly string[])
): void {
  if (isFunction(value)) {
    each(elems, (elem, j) => {
      removeClass([elem], value.call(elem, j, getClass(elem)));
    });

    return;
  }

  if (value === void 0) {
    each(elems, (el) => attr(el, "class", ""));
    return;
  }

  const classes = classesToArray(value);

  if (classes.length) {
    each(elems, (elem) => {
      const curValue = getClass(elem);

      // eslint-disable-next-line functional/no-let
      let cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";

      if (cur) {
        each(classes, (clazz) => {
          // Remove *all* instances
          // eslint-disable-next-line functional/no-loop-statement
          while ((cur as string).includes(" " + clazz + " ")) {
            cur = (cur as string).replace(" " + clazz + " ", " ");
          }
        });

        // Only assign if different to avoid unneeded rendering.
        const finalValue = stripAndCollapse(cur);
        if (curValue !== finalValue) {
          elem.setAttribute("class", finalValue);
        }
      }
    });
  }
}
function toggleClass<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  value: string | readonly string[]
): void;
function toggleClass<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  value:
    | string
    | readonly string[]
    | ((
        index: number,
        currentClass: string,
        exists: boolean
      ) => string | readonly string[]),
  stateVal: boolean
): void;
function toggleClass<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  value:
    | string
    | readonly string[]
    | ((
        index: number,
        currentClass: string,
        exists: boolean
      ) => string | readonly string[]),
  stateVal?: boolean
): void {
  const type = typeof value,
    isValidValue = type === "string" || Array.isArray(value);

  if (typeof stateVal === "boolean" && isValidValue) {
    return stateVal
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addClass(elems, value as any)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        removeClass(elems, value as any);
  }

  if (isFunction(value)) {
    each(elems, (elem, i) => {
      toggleClass(
        [elem],
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        value.call(elem, i, getClass(elem), stateVal!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        stateVal!
      );
    });

    return;
  }

  each(elems, (elem) => {
    if (isValidValue) {
      each(classesToArray(value), (className) => {
        if (hasClass([elem], className)) {
          removeClass([elem], className);
        } else {
          addClass([elem], className);
        }
      });

      // Toggle whole class name
    } else if (value === undefined || type === "boolean") {
      const className = getClass(elem);
      if (className) {
        data(elem, "__className__", className);
      }

      elem.setAttribute(
        "class",
        className ? "" : data(elem, "__className__") || ""
      );
    }
  });
}

function hasClass<TElement extends HTMLElement>(
  elems: LikeArray<TElement>,
  selector: string
): boolean {
  // eslint-disable-next-line functional/no-let
  let elem,
    i = 0;

  const className = " " + selector + " ";
  // eslint-disable-next-line functional/no-loop-statement
  while ((elem = elems[i++])) {
    if (
      elem.nodeType === 1 &&
      (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1
    ) {
      return true;
    }
  }

  return false;
}

export { addClass, removeClass, toggleClass, hasClass };
