export default {
  opacity: {
    get(elem, computed) {
      if (computed) {

        // We should always get a number back from opacity
        var ret = curCSS(elem, "opacity");
        return ret === "" ? "1" : ret;
      }
    }
  }
}