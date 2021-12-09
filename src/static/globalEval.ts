const preservedScriptAttributes = {
  type: true,
  src: true,
  nonce: true,
  noModule: true
};

export default function DOMEval(code: string, node ? : HTMLScriptElement, doc = document): void {

  const script = doc.createElement("script");

  script.text = code;
  if (node) {
    for (const i in preservedScriptAttributes) {

      const val = node[i] || node.getAttribute(i);
      if (val) {
        script.setAttribute(i, val);
      }
    }
  }
  doc.head.appendChild(script).parentNode.removeChild(script);
}