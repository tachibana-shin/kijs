/* eslint-disable functional/immutable-data */
// eslint-disable-next-line functional/no-let
let pixelPositionVal: boolean,
  boxSizingReliableVal: boolean,
  scrollboxSizeVal: boolean,
  pixelBoxStylesVal: boolean,
  reliableTrDimensionsVal: boolean | null,
  reliableMarginLeftVal: boolean;
const container = document.createElement("div");
// eslint-disable-next-line functional/no-let
let div: HTMLDivElement | void = document.createElement("div");

function computeStyleTests() {
  // This is a singleton, we need to execute it only once
  if (!div) {
    return;
  }

  container.style.cssText =
    "position:absolute;left:-11111px;width:60px;" +
    "margin-top:1px;padding:0;border:0";
  div.style.cssText =
    "position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
    "margin:auto;border:1px;padding:1px;" +
    "width:60%;top:1%";
  document.documentElement.appendChild(container).appendChild(div);

  const divStyle = window.getComputedStyle(div);
  pixelPositionVal = divStyle.top !== "1%";

  // Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
  reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12;

  // Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
  // Some styles come back with percentage values, even though they shouldn't
  div.style.right = "60%";
  pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36;

  // Support: IE 9 - 11 only
  // Detect misreporting of content dimensions for box-sizing:border-box elements
  boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36;

  // Support: IE 9 only
  // Detect overflow:scroll screwiness (gh-3699)
  // Support: Chrome <=64
  // Don't get tricked when zoom affects offsetWidth (gh-4029)
  div.style.position = "absolute";
  scrollboxSizeVal = roundPixelMeasures(div.offsetWidth / 3 + "") === 12;

  document.documentElement.removeChild(container);

  // Nullify the div so it wouldn't be stored in the memory and
  // it will also be a sign that checks already performed
  div = void 0;
}

function roundPixelMeasures(measure: string) {
  return Math.round(parseFloat(measure));
}

// Support: IE <=9 - 11 only
// Style of cloned element affects source element cloned (#8908)
div.style.backgroundClip = "content-box";

(div.cloneNode(true) as HTMLElement).style.backgroundClip = "";
// eslint-disable-next-line functional/no-let
let input = document.createElement("input");
const select = document.createElement("select"),
  opt = select.appendChild(document.createElement("option"));

input.type = "checkbox";

const checkOn = input.value !== "";

input = document.createElement("input");
input.value = "t";
input.type = "radio";

export default {
  checkOn,
  optSelected: opt.selected,
  radioValue: input.value === "t",
  clearCloneStyle: div.style.backgroundClip === "content-box",
  boxSizingReliable() {
    computeStyleTests();
    return boxSizingReliableVal;
  },
  pixelBoxStyles() {
    computeStyleTests();
    return pixelBoxStylesVal;
  },
  pixelPosition() {
    computeStyleTests();
    return pixelPositionVal;
  },
  reliableMarginLeft() {
    computeStyleTests();
    return reliableMarginLeftVal;
  },
  scrollboxSize() {
    computeStyleTests();
    return scrollboxSizeVal;
  },
  reliableTrDimensions() {
    // eslint-disable-next-line functional/no-let
    let table, tr, trChild, trStyle;
    if (reliableTrDimensionsVal == null) {
      table = document.createElement("table");
      tr = document.createElement("tr");
      trChild = document.createElement("div");

      table.style.cssText =
        "position:absolute;left:-11111px;border-collapse:separate";
      tr.style.cssText = "border:1px solid";

      tr.style.height = "1px";
      trChild.style.height = "9px";
      trChild.style.display = "block";

      document.documentElement
        .appendChild(table)
        .appendChild(tr)
        .appendChild(trChild);

      trStyle = window.getComputedStyle(tr);
      reliableTrDimensionsVal =
        parseInt(trStyle.height, 10) +
          parseInt(trStyle.borderTopWidth, 10) +
          parseInt(trStyle.borderBottomWidth, 10) ===
        tr.offsetHeight;

      document.documentElement.removeChild(table);
    }
    return reliableTrDimensionsVal;
  },
};
