export default function addGetHookIf(
  conditionFn: () => boolean,
  // eslint-disable-next-line @typescript-eslint/ban-types
  hookFn: Function
) {
  return {
    get() {
      if (conditionFn()) {
        // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
        delete (this as any).get;
        return;
      }

      // eslint-disable-next-line functional/immutable-data, functional/functional-parameters, prefer-rest-params, @typescript-eslint/no-explicit-any
      return ((this as any).get = hookFn).apply(this, arguments);
    },
  };
}
