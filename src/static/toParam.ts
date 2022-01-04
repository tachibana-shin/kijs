import { isFunction, isPlainObject } from "../utils/is";

import { Kijs } from "../core/kijs";

import each from "./each";

const rbracket = /\[\]$/;

function buildParams(
  prefix: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  traditional: boolean,
  add: (key: string | number, value: any) => void
): void {
  if (Array.isArray(obj)) {
    // Serialize array item.
    each(obj, (v, i) => {
      if (traditional || rbracket.test(prefix)) {
        // Treat each array item as a scalar.
        add(prefix, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(
          prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]",
          v,
          traditional,
          add
        );
      }
    });
  } else if (!traditional && obj && typeof obj === "object") {
    // Serialize object item.
    for (const name in obj) {
      buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}

function toParam(
  data:
    | {
        name: string | number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any;
      }[]
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string | number]: any;
      }
    | Kijs,
  traditional = false
): string {
  const s = new Set<string>(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    add = function (key: string | number, valueOrFunction: any) {
      const value = isFunction(valueOrFunction)
        ? valueOrFunction()
        : valueOrFunction;

      s.add(
        encodeURIComponent(key) +
          "=" +
          encodeURIComponent(value == null ? "" : value)
      );
    };

  if (data == null) {
    return "";
  }

  if (Array.isArray(data) || (data.kijs && !isPlainObject(data))) {
    each(data, ({ name, value }) => {
      add(name, value);
    });
  } else {
    for (const prefix in data) {
      buildParams(prefix, data[prefix], traditional, add);
    }
  }

  return Array.from(s.values()).join("&");
}

export default toParam;
