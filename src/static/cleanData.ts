export default function cleanData<TElement = HTMLElement>(elems: LikeArray<TElement>): void {
  each(elems, (index, value) => {
    removeData(value)
  })
  offEvent(elems)
}