
type LikeArray<T> = {
  [key: string]: any
} & {
  [index: number]: T
} & {
  length: number
}

export default LikeArray