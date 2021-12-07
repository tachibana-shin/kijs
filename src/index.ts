import createFragment from "./utils/createFragment";
import { isArrayLike } from "./utils/is";

const rSelector = /[a-zA-Z_]|\.|#/;

class My {
  readonly elements = new Set<Element>();
  get length(): number {
    return this.elements.size;
  }

  constructor(selectors: string | Element | Element[] | My) {
    if (selectors instanceof My) {
      return selectors as any;
    }
    if (typeof selectors === "string") {
      // document
      selectors = selectors.trim();

      if (rSelector.test((selectors as any)[0])) {
        // this is query
        document.querySelectorAll(selectors as string).forEach((el) => {
          this.elements.add(el as any);
        });
      } else {
        // create element
        createFragment(selectors).childNodes.forEach((el) => {
          this.elements.add(el as unknown as Element);
        });
      }

      return;
    }
    if (Array.isArray(selectors)) {
      selectors.forEach((el) => {
        this.elements.add(el);
      });

      return;
    }
    this.elements.add(selectors);
  }

  eq(index: number): My {
    return new My(
      Array.from(this.elements.values())[
        index < 0 ? this.length + index : index
      ]
    );
  }
  get(index: number) {
    return Array.from(this.elements.values())[
      index < 0 ? this.length + index : index
    ];
  }
  first() {
    return this.eq(0);
  }
  last() {
    return this.eq(-1);
  }
  child(index: number) {
    const els = new Set<Element>();

    this.elements.forEach((el) => {
      const a = el.children[index < 0 ? el.children.length + index : index];
      els.add(a);
    });

    return new My([...els.values()]);
  }
  contents() {
    const els: ChildNode[] = [];

    this.elements.forEach((el) => {
      if (el.nodeName === "IFRAME") {
        els.push(
          ...((el as HTMLIFrameElement).contentDocument?.childNodes || [])
        );
      } else if (el.nodeName === "TEMPLATE") {
        els.push(...(el as HTMLTemplateElement).content.childNodes);
      }
    });

    return new My(els as any);
  }
  prop(propName: keyof Element | string): typeof propName extends keyof Element ? Element[typeof propName] : any;
  prop(propName: keyof Element | string, value: Element[typeof propName]): this;
  prop(
    propName: keyof Element,
    value?: Element[typeof propName]
  ): Element[typeof propName] | this {
    if (value === undefined) {
      return this.get(0)[propName];
    }

    (this.get(0) as any)[propName as unknown as any] = value;

    return this;
  }
  removeProp(propName: )
}
