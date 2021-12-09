export default {
  linear(p: number): numbee {
    return p;
  },
  swing(p: number): number {
    return 0.5 - Math.cos(p * Math.PI) / 2;
  },
  _default: "swing",
};
