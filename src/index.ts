export { default, Kijs, use } from "./core/kijs";
export { default as globalEval } from "./static/globalEval";

export { default as extend } from "./static/extend";
export {
  default as ready,
  holdReady,
  isReady,
  readyWait,
} from "./static/ready";
export * from "./utils/is";
export { default as each } from "./static/each";
export { default as grep } from "./static/grep";
export { default as filter } from "./static/filter";
export { default as map } from "./static/map";
export { default as support } from "./static/isSupport";
export type { Support } from "./static/isSupport";
export { default as unique } from "./static/unique";
export { default as text } from "./static/text";
export { default as data, removeData, hasData } from "./static/data";
export { default as clone } from "./static/clone";
export { default as cleanData } from "./static/cleanData";

export { default as attrHooks } from "./hooks/attrHooks";
export { default as cssHooks } from "./hooks/cssHooks";
export { default as propHooks } from "./hooks/propHooks";
export { default as valHooks } from "./hooks/valHooks";

export {
  default as style,
  finalPropName,
  vendorPropName,
  adjustCSS,
} from "./static/style";
export { default as css, curCSS } from "./static/css";
export { default as attr, removeAttr } from "./static/attr";
export { default as prop, removeProp } from "./static/prop";
export { default as val } from "./static/value";
export { default as toParam } from "./static/toParam";

export { default as parseHTML } from "./utils/createFragment";
export { default as offset } from "./static/offset";
export { default as camelCase } from "./static/camelCase";
export { default as trim } from "./static/trim";
