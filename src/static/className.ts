const rnothtmlwhite = (/[^\x20\t\r\n\f]+/g);

function classesToArray(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value.match(rnothtmlwhite) || [];
  }
  return [];
}

function getClass < TElement = HTMLElement > (elem: TElement): string {
  return elem?.getAttribute("class") || elem?.className || ""
}

export function stripAndCollapse(value: string): string {
  var tokens = value.match(rnothtmlwhite) || [];
  return tokens.join(" ");
}

function addClass < TElement = HTMLElement > (elems: LikeArray < TElement > , value: string | string[] | ((index: number, currentClass: string) => string | string[])): void {

  if (isFunction(value)) {
    each(elems, (j, elem) => {
      addClass([elem], value.call(elem, j, getClass(elem)));
    });

    return
  }

  const classes = classesToArray(value);

  if (classes.length) {
    each(elems, (i, elem) => {
      const curValue = getClass(elem);
      let cur = elem.nodeType === 1 && (" " + stripAndCollapse(curValue) + " ");

      if (cur) {
        each(classes, (i, clazz) => {
          if (cur.indexOf(" " + clazz + " ") < 0) {
            cur += clazz + " ";
          }
        })

        // Only assign if different to avoid unneeded rendering.
        finalValue = stripAndCollapse(cur);
        if (curValue !== finalValue) {
          elem.setAttribute("class", finalValue);
        }
      }
    })
  }


}

function removeClass < TElement = HTMLElement > (elems: LikeArray < TElement > , value ? : string | string[] | ((index: number, currentClass: string) => string | string[])): void {

  if (isFunction(value)) {
    each(elems, (j, elem) => {
      removeClass([elem], value.call(elem, j, getClass(elem)));
    });

    return
  }

  if (value === void 0) {
    attr(elems, "class", "");
    return
  }

  const classes = classesToArray(value);

  if (classes.length) {
    each(elems, (i, elem) => {
      const curValue = getClass(elem);

      let cur = elem.nodeType === 1 && (" " + stripAndCollapse(curValue) + " ");

      if (cur) {
        each(classes, (i, clazz) => {
          // Remove *all* instances
          while (cur.indexOf(" " + clazz + " ") > -1) {
            cur = cur.replace(" " + clazz + " ", " ");
          }
        })

        // Only assign if different to avoid unneeded rendering.
        finalValue = stripAndCollapse(cur);
        if (curValue !== finalValue) {
          elem.setAttribute("class", finalValue);
        }
      }
    })
  }

}

function toggleClass < TElement = HTMLElement > (elems: LikeArray < TElement > , value: string | string[] | ((index: number, currentClass: string) => string | string[]), stateVal ? : boolean): void {
  const type = typeof value,
    isValidValue = type === "string" || Array.isArray(value);

  if (typeof stateVal === "boolean" && isValidValue) {
    return stateVal ? addClass(elems, value) : removeClass(elems, value);
  }

  if (isFunction(value)) {
    each(elems, (i, elem) => {
      toggleClass(elem,
        value.call(this, i, getClass(this), stateVal),
        stateVal
      );
    });

    return
  }

  each(elems, (i, elem) => {
    var className, i, self, classNames;

    if (isValidValue) {

      each(classesToArray(value), (i, className) => {
        if (hasClass(elem, className)) {
          removeClass(elem, className);
        } else {
          addClass(elm, className);
        }
      })



      // Toggle whole class name
    } else if (value === undefined || type === "boolean") {
      const className = getClass(elem);
      if (className) {
        data(elem, "__className__", className);
      }

      elem.setAttribute("class",
        className || value === false ?
        "" :
        data(elem, "__className__") || ""
      )

    }
  });
}

function hasClass < TElement = HTMLElement > (elems: LikeArray < TElement > , selector: string): boolean {
  let elem,
    i = 0;

  const className = " " + selector + " ";
  while ((elem = elems[i++])) {
    if (elem.nodeType === 1 &&
      (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
      return true;
    }
  }

  return false;
}

export {
  addClass,
  removeClass,
  toggleClass,
  hasClass
}