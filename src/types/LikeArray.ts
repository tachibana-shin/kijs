type LikeArray<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [key: string]: any;
} & {
  readonly [index: number]: T;
} & {
  readonly length: number;
};

export default LikeArray;
