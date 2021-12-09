const rmsPrefix = /^-ms-/,
  rdashAlpha = /-([a-z])/g;


export default function camelCase(str: string): string {
  return str.replace(rmsPrefix, "ms-").replace(rdashAlpha, (a, l) => l.toUpperCase());
}