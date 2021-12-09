const rreturn = /\r/g;


const valHooks = {
  option: {
    get(elem) {

      const val = elem.getAttribute("value");
      return val != null ?
        val : stripAndCollapse(text(elem));
    }
  },
  select: {
    get: function(elem) {
      var value, option, i,
        options = elem.options,
        index = elem.selectedIndex,
        one = elem.type === "select-one",
        values = one ? null : [],
        max = one ? index + 1 : options.length;

      if (index < 0) {
        i = max;

      } else {
        i = one ? index : 0;
      }

      // Loop through all the selected options
      for (; i < max; i++) {
        option = options[i];

        // Support: IE <=9 only
        // IE8-9 doesn't update selected after form reset (#2551)
        if ((option.selected || i === index) &&

          // Don't return options that are disabled or in a disabled optgroup
          !option.disabled &&
          (!option.parentNode.disabled ||
            !nodeName(option.parentNode, "optgroup"))) {

          // Get the specific value for the option
          value = jQuery(option).val();

          // We don't need an array for one selects
          if (one) {
            return value;
          }

          // Multi-Selects return an array
          values.push(value);
        }
      }

      return values;
    },

    set: function(elem, value) {
      var optionSet, option,
        options = elem.options,
        values = jQuery.makeArray(value),
        i = options.length;

      while (i--) {
        option = options[i];

        /* eslint-disable no-cond-assign */

        if (option.selected =
          jQuery.inArray(jQuery.valHooks.option.get(option), values) > -1
        ) {
          optionSet = true;
        }

        /* eslint-enable no-cond-assign */
      }

      // Force browsers to behave consistently when non-matching value is set
      if (!optionSet) {
        elem.selectedIndex = -1;
      }
      return values;
    }
  }
}


// Radios and checkboxes getter/setter
each(["radio", "checkbox"], function(i, v) {
  valHooks[v] = {
    set(elem, value) {
      if (Array.isArray(value)) {
        return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) > -1);
      }
    }
  };
  if (!support.checkOn) {
    valHooks[v].get = function(elem) {
      return elem.getAttribute("value") === null ? "on" : elem.value;
    };
  }
});


function $$value < TElement = HTMLElement > (elems: LikeArray < TElement > , value) {
  var hooks, ret, valueIsFunction,
    elem = elems[0];

  if (!arguments.length) {
    if (elem) {
      hooks = valHooks[elem.type] ||
        valHooks[elem.nodeName.toLowerCase()];

      if (hooks &&
        "get" in hooks &&
        (ret = hooks.get(elem, "value")) !== undefined
      ) {
        return ret;
      }

      ret = elem.value;

      // Handle most common string cases
      if (typeof ret === "string") {
        return ret.replace(rreturn, "");
      }

      // Handle cases where value is null/undef or number
      return ret == null ? "" : ret;
    }

    return;
  }

  valueIsFunction = isFunction(value);

  each(elems, (i, elem) => {
    var val;

    if (elem.nodeType !== 1) {
      return;
    }

    if (valueIsFunction) {
      val = value.call(elem, i, $$value([elem]));
    } else {
      val = value;
    }

    // Treat null/undefined as ""; convert numbers to string
    if (val == null) {
      val = "";

    } else if (typeof val === "number") {
      val += "";

    } else if (Array.isArray(val)) {
      val = val.map((value) => {
        return value == null ? "" : value + "";
      });
    }

    hooks = valHooks[this.type] || valHooks[this.nodeName.toLowerCase()];

    // If set returns undefined, fall back to normal setting
    if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
      elem.value = val;
    }
  });
}

export default value