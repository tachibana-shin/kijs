import { isFunction } from "../utils/is";

import each from "./each";

export default function toParam(
  data:
    | readonly {
        readonly name: string;
        readonly value: string | number | (() => string | number);
      }[]
    | {
        readonly [key: string]: string | number | (() => string | number);
      }
): string {
  // eslint-disable-next-line functional/prefer-readonly-type
  const dstr: string[] = [],
    isArray = Array.isArray(dstr);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  each(data as any, (val, key) => {
    val = isFunction(val) ? val() : val;

    if (isArray) {
      key = val.name;
      val = val.value;
    }

    // eslint-disable-next-line functional/immutable-data
    dstr.push(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      encodeURIComponent(key as any) +
        "=" +
        encodeURIComponent(val == null ? "" : val)
    );
  });

  return dstr.join("&");
}
