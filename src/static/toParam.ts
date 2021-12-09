export default function toParam(data: {
  name: string
  value: string | number | (() => string | number)
} [] | {
  [key: string]: string | number | (() => string | number)
}): string {
  const dstr = [],
    isArray = Array.isArray(str);

  each(data, (key, val) => {
    val = isFunction(val) ? val() : val;

    if (isArray) {
      key = val.name
      val = val.value
    }

    dstr.push(
      encodeURIComponent(key) +
      "=" +
      encodeURIComponent(val == null ? "" : val)
    );
  });

  return dstr.join("&");
}