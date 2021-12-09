const props = {
  scrollLeft: "pageXOffset",
  scrollTop: "pageYOffset"
}

function pageOffset(elems: LikeArray < TElement > , prop: "scrollLeft" | "scrollTop", val: number): void

function pageOffset(elems: LikeArray < TElement > , prop: "scrollLeft" | "scrollTop"): number

function pageOffset(elems: LikeArray < TElement > , prop: "scrollLeft" | "scrollTop", val ? : number) {
  if (val === undefined) {
    const window = isWindow(elems[0]) ? elems[0] : elems[0].nodeType === 9 ?
      elems[0].defaultView : null

    return win ? win[props[prop]] : elem[method];
  }

  each(elems, (i, elem) => {
    const window = isWindow(elems[0]) ? elems[0] : elems[0].nodeType === 9 ?
      elems[0].defaultView : null


    if (win) {
      const top = prop === "scrollTop"
      win.scrollTo(
        !top ? val : win.pageXOffset,
        top ? val : win.pageYOffset
      );

    } else {
      elem[method] = val;
    }
  })
}

export default pageOffset