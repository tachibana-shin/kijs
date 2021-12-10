const preservedScriptAttributes = {
  type: true,
  src: true,
  nonce: true,
  noModule: true,
};

export default function DOMEval(
  code: string,
  node?: HTMLScriptElement,
  doc = document
): void {
  const script = doc.createElement("script");

  // eslint-disable-next-line functional/immutable-data
  script.text = code;
  if (node) {
    // eslint-disable-next-line functional/no-loop-statement
    for (const i in preservedScriptAttributes) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (node as any)[i] || node.getAttribute(i);
      if (val) {
        script.setAttribute(i, val);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  doc.head.appendChild(script).parentNode!.removeChild(script);
}
