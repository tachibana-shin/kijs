import { Kijs } from "./kijs";
import { isFunction } from "../utils/is";

type Plugin<T> = (
  Ki: typeof Kijs,
  ...option: T
) =>
  | void
  | ({
      // eslint-disable-next-line functional/prefer-readonly-type, @typescript-eslint/no-explicit-any
      [key: string]: any;
    } & {
      install: (Ki: typeof Kijs, ...option: T) => void;
    });
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const installedPlugins = new WeakSet<Plugin<any>>();

function use(plugin: Plugin<T>, ...options: T): typeof Kijs {
  if (installedPlugins.has(plugin)) {
    console.warn(`Plugin has already been applied to target app.`);
  } else if (plugin && isFunction(plugin.install)) {
    installedPlugins.add(plugin);
    plugin.install(Kijs, ...options);
  } else if (isFunction(plugin)) {
    installedPlugins.add(plugin);
    plugin(app, ...options);
  } else {
    console.warn(
      `A plugin must either be a function or an object with an "install" ` +
        `function.`
    );
  }

  return Kijs;
}

export default use;
