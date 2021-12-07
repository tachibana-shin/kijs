"use strict";

//ownerDocument -- defaultView
const isArray = Array.isArray,
  rtype = /\[object (.+)]/,
  window = isWindow(window) ? window : document.defaultView,
  rDel = /[^\x20\t\r\n\f]+/g,
  rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
  rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i,
  rxhtmlTag =
    /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,
  rhtml = /<|&#?\w+;/,
  selector = /[a-zA-Z_]|\.|#/,
  prefix = " -webkit- -moz- -ms- -o- -khtml-".split(" "),
  xprefix = /\-(?:webkit|moz|ms|o|khtml)\-/i,
  _prefix = prefix.length,
  rhash = /#.*$/,
  rquery = /\?/,
  rantiCache = /([?&])_=[^&]*/,
  rprotocol = /^\/\//,
  r20 = /%20/g,
  rnoContent = /^(?:GET|HEAD)$/,
  rnothtmlwhite = /[^\x20\t\r\n\f]+/g,
  expandoUID = "myJS" + (Math.random() + "").replace(/\D/g, "");

function stripedClass(str) {
  return (str.match(rDel) || []).join(" ");
}

function classToArray(val) {
  if (isArray(val)) return val;
  if (typeof val === "string") return val.match(rDel) || [];
  return [];
}

function htmlPrefilter(html) {
  return html.replace(rxhtmlTag, "<$1></$2>");
}
const wrapMap = {
  option: [1, "<select multiple='multiple'>", "</select>"],
  thead: [1, "<table>", "</table>"],
  col: [2, "<table><colgroup>", "</colgroup></table>"],
  tr: [2, "<table><tbody>", "</tbody></table>"],
  td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
  _default: [0, "", ""],
};
wrapMap.optgroup = wrapMap.option;
wrapMap.tbody =
  wrapMap.tfoot =
  wrapMap.colgroup =
  wrapMap.caption =
    wrapMap.thead;
wrapMap.th = wrapMap.td;

var propFix = {
  for: "htmlFor",
  class: "className",
};

function cloneScript(el) {
  var newEl = document.createElement("script"),
    attrs = el.attributes,
    length = attrs.length;

  while (length--) newEl.setAttribute(attrs[length].name, attrs[length].value);
  newEl.innerHTML = el.innerHTML;
  return newEl;
}

function domify(html) {
  var frag = document.createDocumentFragment(),
    tmp,
    tag,
    wrap,
    scripts,
    all;

  tmp = document.createElement("div");
  tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase();
  wrap = wrapMap[tag] || wrapMap._default;

  tmp.innerHTML = wrap[1] + htmlPrefilter(html) + wrap[2];

  var j = wrap[0];
  while (j--) tmp = tmp.lastChild;

  scripts = tmp.getElementsByTagName("script");
  var i = 0,
    elem;
  while ((elem = scripts[i++])) my(elem).replace(cloneScript(elem));

  all = tmp.childNodes;
  while ((elem = all[0])) frag.appendChild(elem);

  return frag;
}

function targetHTML(html) {
  if (typeof html === "string") {
    if (rhtml.test(html)) return domify(my.trim(html));
    else return document.createTextNode(html);
  } else return html;
}

function camelCase(str) {
  return str.replace(/^-ms-/, "ms-").replace(/-([a-z])/g, function (str, char) {
    return char.toUpperCase();
  });
}

function nodeName(el, name) {
  return el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
}
function cloneCopyEvent(src, dest) {
  var pdataOld, pdataCur, events;

  if (dest.nodeType !== 1) return;

  if (dataPriv.hasData(src)) {
    pdataOld = dataPriv.access(src);
    pdataCur = dataPriv.set(dest, pdataOld);
    events = pdataOld.events;

    dest.my || (dest = my(dest));
    if (events) {
      pdataCur.events = [];

      Loop(events, function (val) {
        dest.on(val.eType, val.callBack, val.more);
      });
    }
  }

  if (dataUser.hasData(src))
    dataUser.set(dest, my.extend({}, dataUser.access(src)));
}
const myXhrStatus = {
  0: 200,
  1223: 204,
};

function ajaxDone(xhr) {
  this.xhr = xhr;
  var _this = this;
  var _promise = new promise(function (resolve, reject) {
    _this.done(resolve);
    _this.fail(reject);
  });
  for (var key in _promise) this[key] = _promise[key];
}

Loop("done error always".split(" "), function (e) {
  ajaxDone.prototype[e == "error" ? "fail" : e] = function (fn) {
    var $store = my(this.xhr).dataUser("$store." + e);
    if ($store && "value" in $store)
      isFunction(fn) && fn.call(this, $store.value, this);
    else
      my(this.xhr).on("ajax." + e, function (f) {
        isFunction(fn) && fn.call(this, f.detail, this);
      });
    return this;
  };
});

function my(elem) {
  return My(elem);
}

class My {
  static expando = expandoUID;
  static isWindow = isWin;
  static isEmptyObject(e) {
    for (var i in e) return false;
    return true;
  }
  static exCSS(r) {
    return document.documentElement.style[r] != null;
  }
  static prefixCSS(r) {
    r = r.replace(xprefix, "");
    var i = 0;
    while (i < _prefix) {
      if (my.exCSS(prefix[i] + r)) return prefix[i] + r;
      i++;
    }
    return undefined;
  }
  static param(str) {
    var dstr = [],
      is = isArray(str);
    my.each(str, function (key, val) {
      is && ((key = this.name), (val = this.value));
      val = isFunction(val) ? val() : val;
      dstr.push(
        encodeURIComponent(key) +
          "=" +
          encodeURIComponent(val == null ? "" : val)
      );
    });
    return dstr.join("&");
  }
  static strips(str) {
    return str.replace(
      /(\!|"|\#|\$|\%|\&|\\|'|\(|\)|\*|\+|,|-|\.|\:|;|\<|\=|\>|\?|\@|\[|\]|\^|\`|\{|\}|\~|\¡|\¿)/g,
      "\\$1"
    );
  }
  static hasData(elem) {
    return dataUser.hasData(elem) || dataPriv.hasData(elem);
  }
  static data(elem, name, data) {
    return dataUser.access(elem, name, data);
  }
  static removeData(elem, name) {
    dataUser.remove(elem, name);
  }
  static _data(elem, name, data) {
    return dataPriv.access(elem, name, data);
  }
  static _removeData(elem, name) {
    dataPriv.remove(elem, name);
  }
  static ajax(opt) {
    if (!isObject(opt)) opt = { url: opt };

    var xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP"),
      type = (opt.type || "GET").toUpperCase(),
      dataType = (opt.dataType || "text").toLowerCase(),
      cache,
      uncached,
      headers = opt.headers || {};

    opt.url = ((opt.url || location.href) + "").replace(
      rprotocol,
      location.protocol + "//"
    );
    opt.processData === undefined && (opt.processData = true);

    isObject(headers) && (headers = {});

    type !== "GET" &&
      opt.contentType !== false &&
      (headers["Content-Type"] =
        "application/x-www-form-urlencoded; charset=UTF-8");

    "contentType" in opt &&
      typeof opt.contentType !== "boolean" &&
      (headers["Content-Type"] = n.contentType);

    var formData;

    if (opt.data + "" == "[object FormData]") {
      formData = opt.data;
      delete opt.data;
    }

    if (opt.data && opt.processData && typeof opt.data !== "string")
      opt.data = my.param(opt.data);

    if (rnoContent.test(type)) {
      cache = opt.url.replace(rhash, "");
      uncached = opt.url.slice(cache.length);

      if (opt.data && (opt.processData || typeof opt.data === "string")) {
        cache += (rquery.test(cache) ? "&" : "?") + opt.data;
        delete opt.data;
      }

      if (opt.cache === false) {
        cache = cache.replace(rantiCache, "$1");
        uncached =
          (rquery.test(cache) ? "&" : "?") + "_=" + Date.now() + uncached;
      }

      opt.url = cache + uncached;
    } else if (
      opt.data &&
      opt.processData &&
      typeof opt.contentType === "string" &&
      opt.contentType.indexOf("application/x-www-form-urlencoded") === 0
    )
      opt.data = opt.data.replace(r20, "+");

    xhr.open(type, opt.url, deflt(opt.async, true), opt.username, opt.password);

    Number.isNaN(opt.timeout - 0) || (xhr.timeout = opt.timeout - 0);

    isFunction(opt.abort) && opt.abort(xhr) === true && xhr.abort();

    isFunction(opt.beforeSend) && opt.beforeSend.call(xhr, xhr);

    if (dataType == "blob" || dataType == "arraybuffer")
      xhr.responseType = dataType.toLowerCase();

    if (typeof opt.xhrFields == "object")
      for (var key in opt.xhrFields) xhr[key] = opt.xhrFields[key];

    if (opt.mimeType && xhr.overrideMimeType)
      xhr.overrideMimeType(opt.mimeType);

    if (!opt.crossDomain && !headers["X-Requested-With"])
      headers["X-Requested-With"] = "XMLHttpRequest";

    rnoContent.test(type) ||
      my.each(headers, function (key, val) {
        xhr.setRequestHeader(key, val);
      });

    var $xhr = my(xhr);

    $xhr
      .on("error timeout abort", function (t) {
        $xhr
          .trigger("ajax.error", t)
          .trigger("ajax.always", t)
          .dataUser("$store.error", { value: t })
          .dataUser("$store.always", { value: t });
        isFunction(opt.error) && opt.error.call(this, t, this);
        isFunction(opt.completed) &&
          opt.completed.call(this, e.detail.error, this);
      })
      .on("load", function () {
        var response =
          (xhr.responseType || "text") !== "text" ||
          typeof xhr.responseText !== "string"
            ? xhr.response
            : xhr.responseText;

        var data =
            dataType === "xml"
              ? xhr.responseXML
              : dataType === "text"
              ? response
              : dataType === "json"
              ? parseJSON(xhr.responseText)
              : response,
          status = myXhrStatus[xhr.status] || xhr.status,
          state = xhr.readyState;
        // if status = 0; status = 200 fi
        if (state == 4 && ((status >= 200 && status < 300) || status == 304)) {
          $xhr
            .trigger("ajax.done", data)
            .trigger("ajax.always", data)
            .dataUser("$store.done", { value: data })
            .dataUser("$store.always", { value: data });
          isFunction(opt.success) && opt.success.call(this, data, this);
          isFunction(opt.completed) && opt.completed.call(this, data, this);
        }
      });

    isFunction(opt.uploadProgress) &&
      my(xhr.upload).on("progress", function (t) {
        opt.uploadProgress.call(this, t.loaded, t.total, t, xhr);
      });
    isFunction(opt.downloadProgress) &&
      my(xhr).on("progress", function (t) {
        opt.downloadProgress.call(this, t.loaded, t.total, t, xhr);
      });

    xhr.send(formData || opt.data);
    return new ajaxDone(xhr);
  }
  static trim(str) {
    return str == null ? "" : (str + "").replace(rtrim, "");
  }
  static proxy(fn, obj) {
    if (typeof obj === "string")
      var tmp = fn,
        fn = fn[obj],
        obj = tmp;
    if (!isFunction(fn)) return undefined;
    var args = slice.call(arguments, 2);
    return function () {
      fn.apply(obj || this, args.concat(slice.call(arguments)));
    };
  }
  static noArrChild(arr) {
    var length = arr.length,
      i = 0;
    while (i < length) if (Array.isArray(arr[i++])) return false;
    return true;
  }
  static getJSON(url, data, fn) {
    return my.get(url, data, fn, "json");
  }
  static inArray(el, arr, i) {
    return arr == null ? -1 : indexOf.call(arr, el, i);
  }
  static type(e) {
    return e == null
      ? e + ""
      : typeof e === "object" || typeof e === "function"
      ? toString.call(e).replace(rtype, "$1").toLowerCase()
      : typeof obj;
  }
  static promise = promise;
  static camelCase = camelCase;
  static nodeName = nodeName;
  static isNumeric = isNumeric;
  static parseJSON = parseJSON;
  static domify = domify;
  static isFunction = isFunction;
  static isArray = isArray;
  static isLikeArray = isArrayLike;
  static isObject = isObject;
  static randomInt = randInt;
  static random(_1, _2) {
    if (arguments.length == 1)
      return isArrayLike(_1)
        ? _1[Math.floor(Math.random() * _1.length)]
        : Math.random() * _1;

    if (arguments.length == 2) return _1 + Math.random() * (_2 - _1);
  }
  static range($start, $end, $step) {
    $step = $step || 1;
    var arr = [],
      isChar = false;

    if ($end === undefined) ($end = $start), ($start = 1);

    if (typeof $start == "string") {
      $start = $start.charCodeAt(0);
      $end = $end.charCodeAt(0);
      isChar = true;
    }

    if ($start !== $end && Math.abs($end - $start) < Math.abs($step))
      throw new Error("range(): step exceeds the specified range.");

    if ($end > $start) {
      $step < 0 && ($step *= -1);
      while ($start <= $end) {
        arr.push(isChar ? String.fromCharCode($start) : $start);
        $start += $step;
      }
    } else {
      $step > 0 && ($step *= -1);
      while ($start >= $end) {
        arr.push(isChar ? String.fromCharCode($start) : $start);
        $start += $step;
      }
    }

    return arr;
  }
  static randColor = randColor;
  static isTouch = isTouch;
  static device = device;

  constructor(elem) {
    var elems = [],
      i = 0,
      length;

    if (typeof elem === "string") {
      elem = my.trim(elem);

      elems = selector.test(elem[0])
        ? document.querySelectorAll(elem)
        : slice.call(domify(elem).childNodes);
    } else elems = elem === undefined ? [] : isArrayLike(elem) ? elem : [elem];

    length = this.length = elems.length;

    while (i < length) this[i] = elems[i++];
  }

  //  length = 0
  getWindow() {
    return this[0].defaultView || this[0].ownerDocument.defaultView || window;
  }
  prop(k, v) {
    var el = this[0];
    "nodeType" in el && (k = propFix[k] || k);

    if (v === undefined) return el[k];
    if (isObject(k))
      return (
        my.each(k, function (i, e) {
          el[i] = e;
        }),
        this
      );
    el[k] = v;
    return this;
  }
  unProp(arr) {
    var el = this[0];
    Loop(classToArray(arr), function (i, e) {
      delete el[i];
    });
    return this;
  }
  find(q) {
    return my(this[0].querySelectorAll(q));
  }
  trigger(n, d) {
    var elem = this[0];
    if (elem.dispatchEvent)
      return (
        elem.dispatchEvent(new CustomEvent(n, { bubbles: true, detail: d })),
        this
      );
    if (elem.fireEvent)
      return (
        elem.fireEvent(new CustomEvent(n, { bubbles: true, detail: d })), this
      );
    isArray(dataPriv.cache(elem).events) &&
      dataPriv.cache(elem).events.map(function (e) {
        e.eType === n &&
          isFunction(e.callBack) &&
          e.callBack.call(elem, { bubbles: true, detail: d });
      });
    return this;
  }
  load() {
    var that = this,
      args = arguments,
      url = args[0],
      data = args[1],
      fn = args[2],
      length = args.length;

    if (length === 0) return this[0].load(), this;
    if (length === 1 && isFunction(url)) return this.on("load", url);
    if (length === 2 && isFunction(data)) (fn = data), (data = undefined);

    return (
      my.ajax({
        url: url,
        data: data,
        type: data ? "post" : "get",
        success(t) {
          that.empty().append(t);
          isFunction(fn) && fn.apply(this, arguments);
        },
        error: args[4],
      }),
      this
    );
  }
  addClass(val) {
    var elem = this[0];
    if (isFunction(val)) val = val.call(elem, elem.className);
    var lastClass = elem.className;

    var custom = " " + stripedClass(lastClass) + " ";
    var clasess = classToArray(val);

    var i = 0,
      clazz;
    while ((clazz = clasess[i++])) {
      if (custom.indexOf(" " + clazz + " ") < 0) custom += clazz + " ";
    }
    custom = stripedClass(custom);

    if (lastClass !== custom) elem.className = custom;
    return this;
  }
  removeClass(val) {
    var elem = this[0];
    if (isFunction(val)) val = val.call(elem, elem.className);
    var lastClass = elem.className;

    var custom = " " + stripedClass(lastClass) + " ";
    var clasess = classToArray(val);

    var i = 0,
      clazz;
    while ((clazz = clasess[i++])) {
      if (custom.indexOf(" " + clazz + " ") > -1)
        custom = custom.replace(" " + clazz + " ", " ");
    }
    custom = stripedClass(custom);

    if (lastClass !== custom) elem.className = custom;
    return this;
  }
  toggleClass(val) {
    var elem = this[0];
    if (isFunction(val)) val = val.call(elem, elem.className);
    var lastClass = elem.className;

    var custom = " " + stripedClass(lastClass) + " ";
    var clasess = classToArray(val);

    var i = 0,
      clazz;
    while ((clazz = clasess[i++])) {
      if (custom.indexOf(" " + clazz + " ") < 0) custom += clazz + " ";
      else custom = custom.replace(" " + clazz + " ", " ");
    }

    custom = stripedClass(custom);

    if (lastClass !== custom) elem.className = custom;
    return this;
  }
  hasClass(val) {
    var elem = this[0];
    if (isFunction(val)) val = val.call(elem, elem.className);
    return (
      (" " + stripedClass(elem.className) + " ").indexOf(" " + val + " ") > -1
    );
  }
  before() {
    var elem = this[0];
    Loop(arguments, function (e) {
      Loop(toArr(e), function (f) {
        elem.parentNode.insertBefore(targetHTML(f), elem);
      });
    });
    return this;
  }
  after() {
    var elem = this[0];
    Loop(arguments, function (e) {
      Loop(toArr(e), function (f) {
        elem.parentNode.insertBefore(targetHTML(f), elem.nextSibling);
      });
    });
    return this;
  }
  append() {
    var elem = this[0];
    Loop(arguments, function (e) {
      Loop(toArr(e), function (f) {
        elem.appendChild(targetHTML(f));
      });
    });
    return this;
  }
  prepend() {
    var elem = this[0];
    Loop(arguments, function (e) {
      Loop(toArr(e), function (f) {
        elem.firstChild === null
          ? elem.appendChild(targetHTML(e))
          : elem.insertBefore(targetHTML(e), elem.firstChild);
      });
    });
    return this;
  }
  on(name, fn, opt) {
    var that = this,
      elem = this[0];

    isFunction(fn) &&
      Loop(classToArray(name), function (e) {
        that._event_(e, fn, opt);
        isArray(dataPriv.cache(elem).events) ||
          (dataPriv.cache(elem).events = []);
        dataPriv.cache(elem).events.push({
          eType: e,
          callBack: fn,
          more: opt,
        });
      });
    return this.extend({
      prevent(fn, opt) {
        arguments.length < 2 && (opt = { passive: false });
        return that.on(
          name,
          function (n) {
            try {
              n.preventDefault();
            } catch (e) {}
            if (isFunction(fn)) return fn.call(this, n);
          },
          opt
        );
      },
      stop(fn, opt) {
        return that.on(
          name,
          function (n) {
            try {
              n.stopPropagation();
            } catch (e) {}
            if (isFunction(fn)) return fn.call(this, n);
          },
          opt
        );
      },
      then(fn, opt) {
        return that.on(name, fn, opt);
      },
    });
  }
  off(name, fn, opt) {
    var that = this,
      elem = this[0],
      cache = dataPriv.cache(elem),
      events = typeof name == "string" ? classToArray(name) : undefined;

    if (events) {
      if (cache.events) {
        cache.events = cache.events.filter(function (val) {
          if (
            events.indexOf(val.eType) > -1 &&
            (fn === undefined || fn === val.callBack) &&
            (opt === undefined || opt == val.more)
          )
            return that._unEvent_(val.eType, val.callBack, val.more), false;

          return true;
        });
      } else
        Loop(events, function (val) {
          that._unEvent_(val, fn, opt);
        });
    }

    return this;
  }
  one(name, fn, opt) {
    var that = this;
    isFunction(fn) &&
      Loop(classToArray(name), function (w) {
        that.on(w, handler, opt);

        function handler(e) {
          var tmp = fn.call(this, e);
          that.off(w, handler, opt);
          return tmp;
        }
      });
    return this.extend({
      prevent(fn, opt) {
        arguments.length < 2 && (opt = { passive: false });
        return that.one(
          name,
          function (n) {
            try {
              n.preventDefault();
            } catch (e) {}
            if (isFunction(fn)) return fn.call(this, n);
          },
          opt
        );
      },
      stop(fn, opt) {
        return that.one(
          name,
          function (n) {
            try {
              n.stopPropagation();
            } catch (e) {}
            if (isFunction(fn)) return fn.call(this, n);
          },
          opt
        );
      },
      then(fn, opt) {
        return that.one(name, fn, opt);
      },
    });
  }
  _event_(a, b, c) {
    //attachEvent()
    return this[0].addEventListener(a, b, c), this;
  }
  _unEvent_(a, b, c) {
    //detachEvent()
    return this[0].removeEventListener(a, b, c), this;
  }
  css(k, v) {
    var el = this[0];
    if (isObject(k)) {
      for (var i in k) this.css(i, k[i]);
    } else if (arguments.length === 1)
      return (
        el.currentStyle || this.getWindow().getComputedStyle(el)
      ).getPropertyValue(k);
    else {
      isFunction(v) && (v = v.call(el, this.css(k)));
      v !== undefined && (el.style[k] = v);
    }
    return this;
  }
  remove() {
    this[0].remove();
  }
  clone(dataAndEvents, deepDataAndEvents) {
    return this.map(function (el) {
      var i,
        l,
        srcElements,
        destElements,
        clone = el.cloneNode(true),
        allTag;

      if (dataAndEvents)
        if (deepDataAndEvents) {
          allTag = my("*");
          srcElements = my.merge([el], allTag);
          destElements = my.merge([el], allTag);

          for (i = 0, l = srcElements.length; i < l; i++) {
            cloneCopyEvent(srcElements[i], destElements[i]);
          }
        } else cloneCopyEvent(el, clone);

      return clone;
    });
  }
  replace(j) {
    if (Element.prototype.replaceChild)
      this.parent()[0].replaceChild(j, this[0]);
    else {
      this.parent()[0].insertBefore(j, this[0]);
      this.remove();
    }
    return this.constructor(j);
  }
  parent() {
    return my(this[0].parentNode);
  }
  sibling(i) {
    var node = this[0].parentNode.children;
    return my(arguments.length ? node[i < 0 ? node.length + i : i] : node);
  }
  next() {
    return my(this[0].nextElementSibling || this[0].nextSibling);
  }
  prev() {
    return my(this[0].previousElementSibling || this[0].previosSibling);
  }
  nextAll() {
    var el = this[0].nextElementSibling || this[0].nextSibling,
      node = el ? [el] : [];
    while (el && (el = el.nextElementSibling || el.nextSibling)) node.push(el);
    return my(node);
  }
  prevAll() {
    var el = this[0].previousElementSibling || this[0].previosSibling,
      node = el ? [el] : [];
    while (el && (el = el.previousElementSibling || el.previosSibling))
      node.push(el);
    return my(node);
  }
  toArray() {
    return slice.call(this);
  }
  firstChild() {
    return my(this[0].firstChild);
  }
  lastChild() {
    return my(this[0].lastChild);
  }
  empty() {
    return this.html("");
  }
  displayToggle() {
    return this.css("display", function (e) {
      return e === "none" ? "block" : "none";
    });
  }
  attr(key, val) {
    if (isObject(key)) {
      for (var i in key) this.attr(i, key[i]);
    } else if (arguments.length === 1) return this[0].getAttribute(key);
    else {
      isFunction(val) && (val = val.call(this[0], this.attr(key)));
      val !== undefined && this[0].setAttribute(key, val);
    }
    return this;
  }
  unAttr(key) {
    var el = this[0];
    return (
      Loop(classToArray(key), function (e) {
        el.removeAttribute(e);
      }),
      this
    );
  }
  hasAttr(j) {
    return this[0].hasAttribute(j);
  }
  data(type, val) {
    if (isObject(type)) {
      for (var i in type) this.data(i, type[i]);
    } else if (arguments.length === 1) return this.attr("data-" + type);

    isFunction(val) && (val = val.call(this[0], this.data(type)));

    val !== undefined && this.attr("data-" + type, val);

    return this;
  }
  unData(key) {
    var _ = this;
    return (
      Loop(classToArray(key), function (e) {
        _.unAttr("data-" + e);
      }),
      _
    );
  }
  offset() {
    var elem = this[0],
      rect,
      win,
      args = arguments,
      x,
      y;

    if (
      args.length &&
      !(typeof args[0] === "string" && Number.isNaN(args[0] - 0))
    ) {
      this.position() === "static" && this.position("relative");

      if (isObject(args[0])) {
        x = args[0].x || args[0].left;
        y = args[0].y || args[0].top;
      } else (x = args[0]), (y = args[1]);

      isset(y) && this.css("top", addPx(y));
      isset(x) && this.css("left", addPx(x));
      return this;
    }

    if (!elem.getClientRects().length) return { top: 0, left: 0 };
    // Get document-relative position by adding viewport scroll to viewport-relative gBCR
    rect = elem.getBoundingClientRect();
    win = elem.ownerDocument.defaultView;
    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset,
      width: elem.offsetWidth,
      height: elem.offsetHeight,
    };
  }
  select(fn) {
    if (isFunction(fn)) return this.on("select", fn);
    var me = this[0];
    if (/input|textarea/.test(this.tag())) {
      me.select();
      me.setSelectionRange(0, this.val().length);
      return this.val();
    }
    if ("select" === this.tag()) {
      me.focus();
      return this.val();
    }
    var range = document.createRange();
    var select = document.getSelection();
    range.selectNodeContents(me);
    select.removeAllRanges();
    select.addRange(range);
    return select;
  }
  hover(e, n) {
    return this.mouseover(e).mouseout(n || e);
  }
  index(e) {
    if (arguments.length === 0) return indexOf.call(this.sibling(), this[0]);
    if (typeof e === "string") return indexOf.call(my(e), this[0]);

    return indexOf.call(this, e.my ? e[0] : e);
  }
  matches(e) {
    return (
      this[0].webkitMatchesSelector ||
      this[0].msMatchesSelector ||
      this[0].mozMatchesSelector ||
      this[0].oMatchesSelector ||
      this[0].matchesSelector
    ).call(this[0], e);
  }
  closest(e) {
    var el = this[0];
    if (Element.prototype.closest) return my(el.closest(e));
    else
      do {
        if (my(el).matches(e)) return my(el);
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);

    return null;
  }
  dataUser(key, value) {
    var i,
      name,
      data,
      elem = this[0];

    if (key === undefined) {
      if (this.length) {
        data = dataUser.get(elem);
        return data;
      }
    }
    if (typeof key === "object") return dataUser.set(elem, key), this;

    if (elem && value === undefined) return dataUser.get(elem, key);

    dataUser.set(elem, key, value);
    return this;
  }
  unDataUser(key) {
    dataUser.remove(this[0], key);
    return this;
  }
  cleanData() {
    dataPriv.remove(this[0]);
    dataUser.remove(this[0]);
    return this;
  }
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function isPromise(e) {
  return typeof e.then == "function" && typeof e.catch == "function";
}

function callhell(config, args, is, _continue) {
  // if _continue = false: processNow = first resolve run one function and break all function after.

  var callbacks = config.callbacks,
    tmp,
    result;

  while ((tmp = callbacks[config.state])) {
    config.state++;
    if (is ? tmp.isSuccess : !tmp.isSuccess) {
      try {
        result = [tmp.callback.apply(this, args)];
        if (_continue === false) return 0;
        callhell(config, result, true);
      } catch (e) {
        callhell(config, [e]);
      }
      return 0;
    }
  }

  if (!tmp) config[is ? "resoltually" : "rejtualy"] = args;
}

function promise(fnPromise) {
  if (!this._isPromise)
    throw new TypeError("calling Promise constructor without new is invalid.");
  var sett = {
    callbacks: [],
    state: 0,
    resoltually: null,
    rejtualy: null,
    called: [],
  };
  this[PROMISE_ID] = sett;

  this.then(fnPromise);
  //setTimeout allow run script not async run end after callbacks added. Remove function end().
  setTimeout(function () {
    callhell(
      sett,
      [
        function resolve(e) {
          // bất đồng bộ nè
          setTimeout(function () {
            callhell(sett, [e], true);
          });
        },
        function reject(e) {
          // bất đồng bộ tiếp
          setTimeout(function () {
            callhell(sett, [e]);
          });
        },
      ],
      true,
      false
    );
  });
}
promise.prototype = {
  then: function (_fn, _catch) {
    var sett = this[PROMISE_ID];
    // if sett.resoltually !== null -> promise main ending. but don't reverse. state > length -> not ending.
    if (
      typeof _fn == "function" &&
      sett.callbacks.push({
        isSuccess: true,
        callback: _fn,
      }) &&
      sett.resoltually !== null
    ) {
      callhell(sett, sett.resoltually, true, false);
    }
    this.catch(_catch);
    return this;
  },
  catch: function (_fn) {
    var sett = this[PROMISE_ID];
    if (
      typeof _fn == "function" &&
      sett.callbacks.push({
        isSuccess: false,
        callback: _fn,
      }) &&
      sett.rejtualy !== null
    ) {
      callhell(sett, sett.rejtualy, false, false);
    }

    return this;
  },
  _isPromise: true,
  constructor: promise,
};

Object.defineProperty(promise, "length", {
  get: function () {
    return 1;
  },
});

function allPromiseEnd(array) {
  var result = true,
    i = 0,
    length = array.length;
  while (i < length)
    if (!array[i++]) {
      result = false;
      break;
    }
  return result;
}
Loop(["all", "race"], function (key, isRace) {
  isRace = !!isRace;
  promise[key] = function (array) {
    return new promise(function (resolve, reject) {
      var result = Array(array.length),
        isStop = false;

      if ("length" in array && array.length == 0)
        resolve(isRace ? undefined : []);
      Loop(array, function (value, index) {
        (isPromise(value)
          ? value
          : new promise(function (e) {
              e(value);
            })
        )
          .then(function (e) {
            result[index] = { value: e };

            if (!isStop && (isRace || allPromiseEnd(result)))
              resolve(
                isRace
                  ? e
                  : result.map(function (e) {
                      return e.value;
                    })
              ),
                (isStop = true);
            return e;
          })
          .catch(function (error) {
            isStop || reject(error);
            isStop = true;
          });
      });
    });
  };
});
Loop(["resolve", "reject"], function (value, index) {
  promise[value] = function (e) {
    return new promise(function () {
      arguments[index](e);
    });
  };
});
Loop(["allSettled", "any"], function (value, isAny) {
  isAny = !!isAny;
  promise[value] = function (array) {
    return new promise(function (resolve, reject) {
      var result = Array(array.length),
        isFailed = true;

      if ("length" in array && array.length == 0)
        resolve(isAny ? undefined : []);
      Loop(array, function (value, index) {
        (isPromise(value)
          ? value
          : new promise(function (e) {
              e(value);
            })
        )
          .then(function (e) {
            result[index] = { status: "fulfilled", value: e };

            if (isAny || allPromiseEnd(result))
              resolve(isAny ? result[index] : result);
            isFailed = false;
            // hàm allSettled không thể bị catch!
            return e;
          })
          .catch(function (error) {
            result[index] = { status: "rejected", reason: error };

            if (isAny == false) {
              if (allPromiseEnd(result)) resolve(result);
            } //any
            else if (allPromiseEnd(result)) reject(error);
          });
      });
    });
  };
});

function parseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}
my.fn.extend = my.extend = function () {
  var args = arguments,
    target = args[0],
    length = args.length,
    noChild = false,
    i = 1,
    opt,
    src,
    copy,
    Arr = false,
    clone;
  if (typeof target === "boolean") (noChild = target), (target = args[i]), i++;
  if (length === i) (target = this), i--;
  if (typeof target !== "object" && !isFunction(target)) target = {};
  for (; i < length; i++)
    if ((opt = args[i]) != null)
      for (var key in opt) {
        src = target[key];
        copy = opt[key];
        if (src === copy) continue;
        if (noChild && copy && ((Arr = isArray(copy)) || isObject(copy))) {
          //giữ tính chất
          Arr
            ? ((clone = src && isArray(src) ? src : []), (Arr = !1))
            : (clone = src && isObject(src) ? src : {});
          target[key] = my.extend(!0, clone, copy);
        } else if (copy !== undefined) target[key] = copy;
      }
  return target;
};

my.fn.once = my.fn.one;
my.fn.init.prototype = my.fn;

my.prefix = my.prefixCSS;
my.each(
  {
    val: "value",
    html: "innerHTML",
    text: "innerText",
  },
  function (fname, prop) {
    my.fn[fname] = function (val) {
      var el = this[0],
        _val = el[prop];
      if (!arguments.length) return _val;

      isFunction(val) && (val = val.call(el, _val));

      val !== undefined && (el[prop] = val);
      return this;
    };
  }
);
my.each(
  {
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replace",
  },
  function (name, original) {
    my.fn[name] = function (selector) {
      var elems,
        ret = [],
        insert = my(selector),
        last = insert.length - 1,
        i = 0;

      for (; i <= last; i++) {
        elems = i === last ? this : this.clone(true);
        my(insert[i])[original](elems);
        ret.push(elems);
      }

      return my(elems);
    };
  }
);
my.each(
  {
    Height: "height",
    Width: "width",
  },
  function (name, type) {
    my.each(
      {
        padding: "inner" + name,
        content: type,
        "": "outer" + name,
      },
      function (defaultExtra, fname) {
        my.fn[fname] = function (value) {
          var el = this[0],
            doc,
            rect,
            padName = type === "width" ? ["left", "right"] : ["top", "bottom"],
            extra;

          if (isWin(el)) {
            return fname.indexOf("outer") === 0
              ? el["inner" + name]
              : el.document.documentElement["client" + name];
          }

          if (el.nodeType === 9) {
            /* if is document */
            doc = el.documentElement;

            return Math.max(
              el.body["scroll" + name],
              doc["scroll" + name],
              el.body["offset" + name],
              doc["offset" + name],
              doc["client" + name]
            );
          }
          if (!el.getClientRects().length)
            return value === undefined ? 0 : this;
          rect = el.getBoundingClientRect();
          extra =
            defaultExtra === "content"
              ? parseFloat(this.css("padding-" + padName[0])) +
                parseFloat(this.css("padding-" + padName[1]))
              : 0;

          return value === undefined
            ? rect[type] - extra
            : this.css(type, addPx(value));
        };
      }
    );
  }
);

my.each(
  {
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset",
  },
  function (method, prop) {
    var top = "pageYOffset" === prop;

    my.fn[method] = function (val) {
      var win,
        el = this[0];
      if (isWin(el)) win = el;
      else if (el.nodeType === 9)
        /* if is document */
        win = el.defaultView;
      if (val === undefined) return win ? win[prop] : el[method];

      if (win)
        win.scrollTo(!top ? val : win.pageXOffset, top ? val : win.pageYOffset);
      else el[method] = val;

      return this;
    };
  }
);

my.each(["get", "post"], function (i, method) {
  my[method] = function (url, data, fn, type) {
    if (isFunction(data)) {
      type = type || fn;
      fn = data;
      data = undefined;
    }
    return my.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: fn,
    });
  };

  my[method + "Sync"] = function (url, data, fn, type) {
    if (isFunction(data)) {
      type = type || fn;
      fn = data;
      data = undefined;
    }
    var result;
    my.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: fn,
      async: false,
      completed: function (e) {
        result = e;
      },
    });
    return result;
  };
});

var eventReplace = {
  mouseenter: "mouseover",
  mouseleave: "mouseout",
};

my.each(
  "click change input submit blur focus focusin focusout resize mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave scroll keydown keypress keyup touchmove touchstart touchend contextmenu".split(
    " "
  ),
  function (i, e) {
    var f = eventReplace[e] || e;
    my.fn[e] = function (fn) {
      return isFunction(fn)
        ? this.on(f, fn)
        : isFunction(this[0][f])
        ? this[0][f]()
        : this.trigger(f);
    };
  }
);

my.fx = {
  over: isTouch ? "touchstart" : "mousedown",
  out: isTouch ? "touchend" : "mouseup",
  move: isTouch ? "touchmove" : "mousemove",
};
my.each(["transition", "animation"], function (i, type) {
  my.each(prefix, function (i, e) {
    if (window["on" + e.replace(/-/g, "") + type + "end"] !== undefined) {
      my.each("End Run Start Cancel".split(" "), function (i, f) {
        my.fx[type + f] =
          e === ""
            ? type + f.toLowerCase()
            : e.replace(/-/g, "") + camelCase("-" + type) + f;
      });
      return (
        (my.fx[type + "Prop"] = e === "" ? type : camelCase(e + type)), false
      );
    }
  });
});
// toElement & srcElement

my.each("color position display background".split(" "), function (i, e) {
  my.fn[e] = function (v) {
    return v === undefined ? this.css(e) : this.css(e, v);
  };
});
my.fn.bg = my.fn.background;
my.ready = my.fn.ready = function (e) {
  function loadDone() {
    root.removeEventListener("load", loadDone);
    document.removeEventListener("documentContentLoaded", loadDone);
    isFunction(e) && e(my);
  }
  if (document.readyState === "complete") isFunction(e) && e(my);
  else {
    root.addEventListener("load", loadDone);
    document.addEventListener("documentContentLoaded", loadDone);
  }
  return this;
};
