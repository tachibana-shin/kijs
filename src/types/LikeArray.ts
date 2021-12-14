/* eslint-disable functional/prefer-readonly-type */
type LikeArray<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} & {
  [index: number]: T;
} & {
  length: number;
};

export default LikeArray;
