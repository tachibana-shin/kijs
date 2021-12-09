let isReady = false;
let readyWait = 1;

let startRunStack: () => void;
const queue = new Promise((resolve) => {
  startRunStack = resolve;
});

function completed() {
  document.removeEventListener("DOMContentLoaded", completed);
  removeEventListener("load", completed);
  ready();
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  setTimeout(ready);
} else {
  document.addEventListener("DOMContentLoaded", completed);

  addEventListener("load", completed);
}

function ready(wait: boolean): void;

function ready(callback?: () => void | Promise<void>): Promise<void>;

function ready(wait?: any) {
  if (typeof wait === "function") {
    return queue.then(() => {
      try {
        return wait();
      } catch (e) {
        setTimeout(() => {
          throw e;
        });
      }
    });
  }
  if (wait === true ? --readyWait : isReady) {
    return;
  }

  // Remember that the DOM is ready
  isReady = true;

  // If a normal DOM Ready event fired, decrement, and wait if need be
  if (wait !== true && --readyWait > 0) {
    return;
  }

  startRunStack();
  return queue;
}

export function holdReady(wait) {
  if (wait) {
    readyWait++;
  } else {
    ready(true);
  }
}

export default ready;
