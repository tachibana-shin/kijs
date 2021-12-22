const r20 = /%20/g,
  rhash = /#.*$/,
  rantiCache = /([?&])_=[^&]*/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm,
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  prefilters: Record<string, Function[]> = {},
  transports: Record<string, Function[]> = {},
  allTypes = "*/".concat("*"),
  originAnchor = new URL("./", location.href);

function throwerror(err: any) {
  setTimeout(() => {
    throw err;
  });
}
function addToPrefiltersOrTransports(structure: Record<string, Function[]>) {
  return function (dataTypeExpression: Function | string, func?: Function) {
    if (typeof dataTypeExpression !== "string") {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    const dataTypes =
      dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

    if (isFunction(func)) {
      let dataType,
        i = 0;
      while ((dataType = dataTypes[i++])) {
        if (dataType[0] === "+") {
          dataType = dataType.slice(1) || "*";
          (structure[dataType] = structure[dataType] || []).unshift(func);
        } else {
          (structure[dataType] = structure[dataType] || []).push(func);
        }
      }
    }
  };
}

function inspectPrefiltersOrTransports(
  structure: Record<string, Function[]>,
  options: Partial<Options>,
  originalOptions: Partial<Options>,
  jqXHR: XHR
) {
  const inspected = {},
    seekingTransport = structure === transports;

  function inspect(dataType: string): void | string | Function {
    let selected;
    inspected[dataType] = true;
    each(structure[dataType] || [], (prefilterOrFactory) => {
      const dataTypeOrTransport = prefilterOrFactory(
        options,
        originalOptions,
        jqXHR
      );
      if (
        typeof dataTypeOrTransport === "string" &&
        !seekingTransport &&
        !inspected[dataTypeOrTransport]
      ) {
        options.dataTypes.unshift(dataTypeOrTransport);
        inspect(dataTypeOrTransport);
        return false;
      } else if (seekingTransport) {
        return !(selected = dataTypeOrTransport);
      }
    });
    return selected;
  }

  return inspect(options.dataTypes[0]) || (!inspected["*"] && inspect("*"));
}

function ajaxExtend(target: Partial<Options>, src: Partial<Options>): Partial<Options> {
  let deep;
  const flatOptions = ajaxSettings.flatOptions || {};

  for (const key in src) {
    if (src[key] !== undefined) {
      (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
    }
  }
  if (deep) {
    extend(true, target, deep);
  }

  return target;
}

function ajaxHandleResponses(s: Partial<Options>, jqXHR: XHR, responses: Response): any {
  let ct,
    type,
    finalDataType,
    firstDataType,
    contents = s.contents,
    dataTypes = s.dataTypes;

  while (dataTypes[0] === "*") {
    dataTypes.shift();
    if (ct === undefined) {
      ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
    }
  }

  if (ct) {
    for (type in contents) {
      if (contents[type] && contents[type].test(ct)) {
        dataTypes.unshift(type);
        break;
      }
    }
  }

  if (dataTypes[0] in responses) {
    finalDataType = dataTypes[0];
  } else {
    for (type in responses) {
      if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
        finalDataType = type;
        break;
      }
      if (!firstDataType) {
        firstDataType = type;
      }
    }

    finalDataType = finalDataType || firstDataType;
  }

  if (finalDataType) {
    if (finalDataType !== dataTypes[0]) {
      dataTypes.unshift(finalDataType);
    }
    return responses[finalDataType];
  }
}

function ajaxConvert(s: Partial<Options>, response: Response, jqXHR: XHR, isSuccess: boolean): {
  state: string;
  data: any
} {
  let conv2,
    current,
    conv,
    tmp,
    prev,
    converters = {},
    dataTypes = s.dataTypes.slice();

  if (dataTypes[1]) {
    for (conv in s.converters) {
      converters[conv.toLowerCase()] = s.converters[conv];
    }
  }

  current = dataTypes.shift();

  while (current) {
    if (s.responseFields[current]) {
      jqXHR[s.responseFields[current]] = response;
    }

    if (!prev && isSuccess && s.dataFilter) {
      response = s.dataFilter(response, s.dataType);
    }

    prev = current;
    current = dataTypes.shift();

    if (current) {
      if (current === "*") {
        current = prev;
      } else if (prev !== "*" && prev !== current) {
        conv = converters[prev + " " + current] || converters["* " + current];

        if (!conv) {
          for (conv2 in converters) {
            tmp = conv2.split(" ");
            if (tmp[1] === current) {
              conv =
                converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
              if (conv) {
                if (conv === true) {
                  conv = converters[conv2];
                } else if (converters[conv2] !== true) {
                  current = tmp[0];
                  dataTypes.unshift(tmp[1]);
                }
                break;
              }
            }
          }
        }

        if (conv !== true) {
          if (conv && s.throws) {
            response = conv(response);
          } else {
            try {
              response = conv(response);
            } catch (e) {
              return {
                state: "parsererror",
                error: conv
                  ? e
                  : "No conversion from " + prev + " to " + current,
              };
            }
          }
        }
      }
    }
  }

  return { state: "success", data: response };
}

function parseXML(data: string): XMLDocument {
  var xml, parserErrorElem;
  if (!data || typeof data !== "string") {
    return null;
  }

  // Support: IE 9 - 11 only
  // IE throws on parseFromString with invalid input.
  try {
    xml = new window.DOMParser().parseFromString(data, "text/xml");
  } catch (e) {}

  parserErrorElem = xml && xml.getElementsByTagName("parsererror")[0];
  if (!xml || parserErrorElem) {
    throwerror(
      "Invalid XML: " +
        (parserErrorElem
          ? map(parserErrorElem.childNodes, (el) => el.textContent).join("\n")
          : data)
    );
  }
  return xml;
}

let active = 0;
const lastModified = new Map<string, number | string>();
const etag = new Map<string, number | string>();

type Options<
  Data = string | Record | Array<any> | FormData,
  DataType =
    | "xml"
    | "html"
    | "script"
    | "json"
    | "jsonp"
    | "text"
    | "arraybuffer"
    | "blob"
    | "document",
  TextStatus =
    | "success"
    | "notmodified"
    | "nocontent"
    | "error"
    | "timeout"
    | "abort"
    | "parsererror",
  Context = XHR
> = {
  accepts: {
    [key: string]: string;
  };
  async: boolean;
  beforeSend: (this: Context, xhr: XHR, options: Partial<Options>) => void | false;
  cache: boolean;
  complete: (this: Context, xhr: XHR, textStatus: TextStatus) => void;
  contents: {
    [key: string]: RegExp;
  };
  contentType: boolean | string;
  context: Context;
  converters: {
    [key: string]: (this: Context, text: string) => any;
  };
  crossDomain: boolean;
  data: Data;
  dataFilter: (this: Context, data: Data, type: DataType) => any;
  error: (this: Context, xhr, textStatus: TextStatus, errorText: string) => void;
  global: boolean;
  headers: {
    [key: string]: string;
  };
  ifModified: boolean;
  isLocal: boolean;
  jsonp: string | boolean;
  jsonpCallback: string | Function;
  method: "GET" | "POST" | "PUT" | "DELETE";
  mimeType: string;
  password: string;
  processData: boolean;
  scriptAttrs: {
    [key: string]: string;
  };
  scriptCharset: string;
  statusCode: {
    [status: string | number]: (this: XHR) => void;
  };
  success: (this: Context, data: any, textStatus: TextStatus, xhr: XHR) => void;
  traditional: boolean;
  type: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  xhr: () => any;
  xhrFields: {
    [key: string]: boolean | string;
  };
};

interface XHR extends Promise {
  readyState: string;
  getResponseHeader: (key: string) => null | string;

  getAllResponseHeaders: () => any | null;

  setRequestHeader: (name: string, value: string) => any;

  overrideMimeType: (type: string) => any;

  statusCode: (map: Record) => any;

  abort: (statusText: string) => any;

  always: (cb: Function) => any;
}
const ajaxSettings: Options = {
  url: location.href,
  type: "GET",
  isLocal: rlocalProtocol.test(location.protocol),
  global: true,
  processData: true,
  async: true,
  contentType: "application/x-www-form-urlencoded; charset=UTF-8",

  accepts: {
    "*": allTypes,
    text: "text/plain",
    html: "text/html",
    xml: "application/xml, text/xml",
    json: "application/json, text/javascript",
  },

  contents: {
    xml: /\bxml\b/,
    html: /\bhtml/,
    json: /\bjson\b/,
  },

  responseFields: {
    xml: "responseXML",
    text: "responseText",
    json: "responseJSON",
  },

  converters: {
    "* text": String,

    "text html": true,

    "text json": JSON.parse,

    "text xml": parseXML,
  },

  flatOptions: {
    url: true,
    context: true,
  },

  xhr() {
    try {
      return new XMLHttpRequest();
    } catch {}
  },
};

function ajaxSetup(target: string, settings: Exclude<Options, "url">): void;

function ajaxSetup(settings: Options): void;

function ajaxSetup(target: Options, settings: Options): Options {
  if (settings) {
    return ajaxExtend(ajaxExtend(target, ajaxSettings), settings);
  }

  return ajaxExtend(ajaxSettings, target);
}

const ajaxPrefilter = addToPrefiltersOrTransports(prefilters);
const ajaxTransport = addToPrefiltersOrTransports(transports);

function ajax(url: string, options: Exclude<Partial<Options>, "url">): XHR;
function ajax(options: Partial<Options>): XHR;

function ajax(url: string | Partial<Options>, options?: Partial<Options>): XHR {
  if (typeof url === "object") {
    options = url;
    url = undefined;
  }

  options = options || {};

  let transport,
    cacheURL,
    responseHeadersString,
    responseHeaders,
    timeoutTimer,
    urlAnchor,
    completed,
    fireGlobals,
    i,
    uncached,
    s = ajaxSetup({}, options),
    callbackContext = s.context || s,
    globalEventContext =
      s.context && (callbackContext.nodeType || callbackContext.kijs)
        ? kijs(callbackContext)
        : event,
    statusCode = s.statusCode || {},
    requestHeaders = {},
    requestHeadersNames = {},
    resolveWith,
    rejectWith,
    strAbort = "canceled",
    completeDeferred = new Set(),
    jqXHR = new (class extends Promise implements XHR {
      readyState = 0;
      done = this.then;
      failure = this.catch;

      constructor() {
        super((resolve, reject) => {
          resolveWith = resolve;
          rejectWith = reject;
        });
      }

      getResponseHeader(key) {
        let match;
        if (completed) {
          if (!responseHeaders) {
            responseHeaders = {};
            while ((match = rheaders.exec(responseHeadersString))) {
              responseHeaders[match[1].toLowerCase() + " "] = (
                responseHeaders[match[1].toLowerCase() + " "] || []
              ).concat(match[2]);
            }
          }
          match = responseHeaders[key.toLowerCase() + " "];
        }
        return match == null ? null : match.join(", ");
      }

      getAllResponseHeaders() {
        return completed ? responseHeadersString : null;
      }

      setRequestHeader(name, value) {
        if (completed == null) {
          name = requestHeadersNames[name.toLowerCase()] =
            requestHeadersNames[name.toLowerCase()] || name;
          requestHeaders[name] = value;
        }
        return this;
      }

      overrideMimeType(type) {
        if (completed == null) {
          s.mimeType = type;
        }
        return this;
      }

      statusCode(map) {
        let code;
        if (map) {
          if (completed) {
            promise.always(map[jqXHR.status]);
          } else {
            for (code in map) {
              statusCode[code] = [statusCode[code], map[code]];
            }
          }
        }
        return this;
      }

      abort(statusText) {
        let finalText = statusText || strAbort;
        if (transport) {
          transport.abort(finalText);
        }
        done(0, finalText);
        return this;
      }

      always(cb) {
        let isError = false;

        this.catch((err) => {
          isError = true;
          return err;
        }).then((e) => {
          cb(e);

          if (isError) {
            throw e;
          }
        });
      }
    })();

  s.url = ((url || s.url || location.href) + "").replace(
    rprotocol,
    location.protocol + "//"
  );

  s.type = options.method || options.type || s.method || s.type;

  s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];

  if (s.crossDomain == null) {
    urlAnchor = document.createElement("a");

    try {
      urlAnchor.href = s.url;

      urlAnchor.href = urlAnchor.href;
      s.crossDomain =
        originAnchor.protocol + "//" + originAnchor.host !==
        urlAnchor.protocol + "//" + urlAnchor.host;
    } catch (e) {
      s.crossDomain = true;
    }
  }

  if (s.data && s.processData && typeof s.data !== "string") {
    s.data = toParam(s.data, s.traditional);
  }

  inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

  if (completed) {
    return jqXHR;
  }

  fireGlobals = event && s.global;

  if (fireGlobals && active++ === 0) {
    event.trigger("ajaxStart");
  }

  s.type = s.type.toUpperCase();

  s.hasContent = !rnoContent.test(s.type);

  cacheURL = s.url.replace(rhash, "");

  if (!s.hasContent) {
    uncached = s.url.slice(cacheURL.length);

    if (s.data && (s.processData || typeof s.data === "string")) {
      cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

      delete s.data;
    }

    if (s.cache === false) {
      cacheURL = cacheURL.replace(rantiCache, "$1");
      uncached =
        (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce.guid++ + uncached;
    }

    s.url = cacheURL + uncached;
  } else if (
    s.data &&
    s.processData &&
    (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0
  ) {
    s.data = s.data.replace(r20, "+");
  }

  if (s.ifModified) {
    if (lastModified.has(cacheURL)) {
      jqXHR.setRequestHeader("If-Modified-Since", lastModified.get(cacheURL)!);
    }
    if (etag.has(cacheURL)) {
      jqXHR.setRequestHeader("If-None-Match", etag.get(cacheURL));
    }
  }

  if (
    (s.data && s.hasContent && s.contentType !== false) ||
    options.contentType
  ) {
    jqXHR.setRequestHeader("Content-Type", s.contentType);
  }

  jqXHR.setRequestHeader(
    "Accept",
    s.dataTypes[0] && s.accepts[s.dataTypes[0]]
      ? s.accepts[s.dataTypes[0]] +
          (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "")
      : s.accepts["*"]
  );

  for (i in s.headers) {
    jqXHR.setRequestHeader(i, s.headers[i]);
  }

  if (
    s.beforeSend &&
    (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed)
  ) {
    return jqXHR.abort();
  }

  strAbort = "abort";

  completeDeferred.add(s.complete);
  jqXHR.done(s.success);
  jqXHR.fail(s.error);

  transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

  if (!transport) {
    done(-1, "No Transport");
  } else {
    jqXHR.readyState = 1;

    if (fireGlobals) {
      globalEventContext.trigger("ajaxSend", [jqXHR, s]);
    }

    if (completed) {
      return jqXHR;
    }

    if (s.async && s.timeout > 0) {
      timeoutTimer = window.setTimeout(function () {
        jqXHR.abort("timeout");
      }, s.timeout);
    }

    try {
      completed = false;
      transport.send(requestHeaders, done);
    } catch (e) {
      if (completed) {
        throw e;
      }

      done(-1, e);
    }
  }

  function done(status, nativeStatusText, responses, headers) {
    let isSuccess,
      success,
      error,
      response,
      modified,
      statusText = nativeStatusText;

    if (completed) {
      return;
    }

    completed = true;

    if (timeoutTimer) {
      window.clearTimeout(timeoutTimer);
    }

    transport = undefined;

    responseHeadersString = headers || "";

    jqXHR.readyState = status > 0 ? 4 : 0;

    isSuccess = (status >= 200 && status < 300) || status === 304;

    if (responses) {
      response = ajaxHandleResponses(s, jqXHR, responses);
    }

    if (
      !isSuccess &&
      s.dataTypes.includes("script") &&
      !s.dataTypes.includes("json")
    ) {
      s.converters["text script"] = function () {};
    }

    response = ajaxConvert(s, response, jqXHR, isSuccess);

    if (isSuccess) {
      if (s.ifModified) {
        modified = jqXHR.getResponseHeader("Last-Modified");
        if (modified) {
          lastModified.set(cacheURL, modified);
        }
        modified = jqXHR.getResponseHeader("etag");
        if (modified) {
          etag.set(cacheURL, modified);
        }
      }

      if (status === 204 || s.type === "HEAD") {
        statusText = "nocontent";
      } else if (status === 304) {
        statusText = "notmodified";
      } else {
        statusText = response.state;
        success = response.data;
        error = response.error;
        isSuccess = !error;
      }
    } else {
      error = statusText;
      if (status || !statusText) {
        statusText = "error";
        if (status < 0) {
          status = 0;
        }
      }
    }

    jqXHR.status = status;
    jqXHR.statusText = (nativeStatusText || statusText) + "";

    if (isSuccess) {
      resolveWith(callbackContext, [success, statusText, jqXHR]);
    } else {
      rejectWith(callbackContext, [jqXHR, statusText, error]);
    }

    jqXHR.statusCode(statusCode);
    statusCode = undefined;

    if (fireGlobals) {
      globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [
        jqXHR,
        s,
        isSuccess ? success : error,
      ]);
    }

    completeDeferred.forEach((cb) => cb(callbackContext, [jqXHR, statusText]));

    if (fireGlobals) {
      globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

      if (!--active) {
        event.trigger("ajaxStop");
      }
    }
  }

  return jqXHR;
}

function getJSON(url: string, data?: any, callback?: Required<Options>["success"]) {
  return get(url, data, callback, "json");
}

function getScript(url: string, callback?: Required<Options>["success"]) {
  return get(url, undefined, callback, "script");
}

function createMethod(method: string) {
  return function (url: string, data?: any, callback?: Required<Options>["success"], type: Required<Options>["type"] = "GET"): XHR {
    if (isFunction(data)) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return ajax(
      extend(
        {
          url: url,
          type: method,
          dataType: type,
          data: data,
          success: callback,
        },
        isObject(url) && url
      )
    );
  };
}

ajaxPrefilter((s: Partial<Options>): void => {
  let i;
  for (i in s.headers) {
    if (i.toLowerCase() === "content-type") {
      s.contentType = s.headers[i] || "";
    }
  }
});

function evalUrl(url: string, options?: Partial<Options>, doc: Document = document) {
  return ajax({
    url: url,

    type: "GET",
    dataType: "script",
    cache: true,
    async: false,
    global: false,

    converters: {
      "text script"() {},
    },
    dataFilter(response) {
      globalEval(response, options, doc);
    },
  });
}

const xhrSuccessStatus = {
    0: 200,

    1223: 204,
  },
  xhrSupported = ajaxSettings.xhr();

isSupport.cors = !!xhrSupported && "withCredentials" in xhrSupported;
isSupport.ajax = xhrSupported = !!xhrSupported;

ajaxTransport((options) => {
  let callback, errorCallback;

  if (support.cors || (xhrSupported && !options.crossDomain)) {
    return {
      send(headers, complete) {
        let i,
          xhr = options.xhr();

        xhr.open(
          options.type,
          options.url,
          options.async,
          options.username,
          options.password
        );

        if (options.xhrFields) {
          for (i in options.xhrFields) {
            xhr[i] = options.xhrFields[i];
          }
        }

        if (options.mimeType && xhr.overrideMimeType) {
          xhr.overrideMimeType(options.mimeType);
        }

        if (!options.crossDomain && !headers["X-Requested-With"]) {
          headers["X-Requested-With"] = "XMLHttpRequest";
        }

        for (i in headers) {
          xhr.setRequestHeader(i, headers[i]);
        }

        callback = function (type) {
          return function () {
            if (callback) {
              callback =
                errorCallback =
                xhr.onload =
                xhr.onerror =
                xhr.onabort =
                xhr.ontimeout =
                xhr.onreadystatechange =
                  null;

              if (type === "abort") {
                xhr.abort();
              } else if (type === "error") {
                if (typeof xhr.status !== "number") {
                  complete(0, "error");
                } else {
                  complete(xhr.status, xhr.statusText);
                }
              } else {
                complete(
                  xhrSuccessStatus[xhr.status] || xhr.status,
                  xhr.statusText,

                  (xhr.responseType || "text") !== "text" ||
                    typeof xhr.responseText !== "string"
                    ? { binary: xhr.response }
                    : { text: xhr.responseText },
                  xhr.getAllResponseHeaders()
                );
              }
            }
          };
        };

        xhr.onload = callback();
        errorCallback = xhr.onerror = xhr.ontimeout = callback("error");

        if (xhr.onabort !== undefined) {
          xhr.onabort = errorCallback;
        } else {
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              window.setTimeout(function () {
                if (callback) {
                  errorCallback();
                }
              });
            }
          };
        }

        callback = callback("abort");

        try {
          xhr.send((options.hasContent && options.data) || null);
        } catch (e) {
          if (callback) {
            throw e;
          }
        }
      },

      abort() {
        if (callback) {
          callback();
        }
      },
    };
  }
});

ajaxPrefilter((s) => {
  if (s.crossDomain) {
    s.contents.script = false;
  }
});

ajaxSetup({
  accepts: {
    script:
      "text/javascript, application/javascript, " +
      "application/ecmascript, application/x-ecmascript",
  },
  contents: {
    script: /\b(?:java|ecma)script\b/,
  },
  converters: {
    "text script"(text) {
      globalEval(text);
      return text;
    },
  },
});

ajaxPrefilter("script", (s) => {
  if (s.cache === undefined) {
    s.cache = false;
  }
  if (s.crossDomain) {
    s.type = "GET";
  }
});

ajaxTransport("script", (s) => {
  if (s.crossDomain || s.scriptAttrs) {
    let script, callback;
    return {
      send(_, complete) {
        script = kijs("<script>")
          .attr(s.scriptAttrs || {})
          .prop({ charset: s.scriptCharset, src: s.url })
          .on(
            "load error",
            (callback = function (evt) {
              script.remove();
              callback = null;
              if (evt) {
                complete(evt.type === "error" ? 404 : 200, evt.type);
              }
            })
          );

        document.head.appendChild(script[0]);
      },
      abort() {
        if (callback) {
          callback();
        }
      },
    };
  }
});

const oldCallbacks = [],
  rjsonp = /(=)\?(?=&|$)|\?\?/;

const expando = (Math.random() * Number.MAX_SAFE_INTEGER).toString(34);

ajaxSetup({
  jsonp: "callback",
  jsonpCallback() {
    const callback = oldCallbacks.pop() || expando + "_" + nonce.guid++;
    this[callback] = true;
    return callback;
  },
});

ajaxPrefilter("json jsonp", (s, originalSettings, jqXHR) => {
  let callbackName, overwritten, responseContainer;
  const jsonProp =
    s.jsonp !== false &&
    (rjsonp.test(s.url)
      ? "url"
      : typeof s.data === "string" &&
        (s.contentType || "").indexOf("application/x-www-form-urlencoded") ===
          0 &&
        rjsonp.test(s.data) &&
        "data");

  if (jsonProp || s.dataTypes[0] === "jsonp") {
    callbackName = s.jsonpCallback = isFunction(s.jsonpCallback)
      ? s.jsonpCallback()
      : s.jsonpCallback;

    if (jsonProp) {
      s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
    } else if (s.jsonp !== false) {
      s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
    }

    s.converters["script json"] = function () {
      if (!responseContainer) {
        throwerror(callbackName + " was not called");
      }
      return responseContainer[0];
    };

    s.dataTypes[0] = "json";

    overwritten = window[callbackName];
    window[callbackName] = function () {
      responseContainer = arguments;
    };

    jqXHR.always(function () {
      if (overwritten === undefined) {
        kijs(window).removeProp(callbackName);
      } else {
        window[callbackName] = overwritten;
      }

      if (s[callbackName]) {
        s.jsonpCallback = originalSettings.jsonpCallback;

        oldCallbacks.push(callbackName);
      }

      if (responseContainer && isFunction(overwritten)) {
        overwritten(responseContainer[0]);
      }

      responseContainer = overwritten = undefined;
    });

    return "script";
  }
});

isSpport.createHTMLDocument = (() => {
  const body = document.implementation.createHTMLDocument("").body;
  body.innerHTML = "<form></form><form></form>";
  return body.childNodes.length === 2;
})();

function installer(Kijs: Kijs): void {
  Kijs.prototype.load = function (url: string, params?: any, callback?: Required<Options>["success"]) {
    let selector,
      type,
      response,
      self = this,
      off = url.indexOf(" ");

    if (off > -1) {
      selector = stripAndCollapse(url.slice(off));
      url = url.slice(0, off);
    }

    if (isFunction(params)) {
      callback = params;
      params = undefined;
    } else if (params && typeof params === "object") {
      type = "POST";
    }

    if (self.length > 0) {
      ajax({
        url: url,

        type: type || "GET",
        dataType: "html",
        data: params,
      })
        .done(function (responseText) {
          response = arguments;

          self.html(
            selector
              ? kijs("<div>").append(parseHTML(responseText)).find(selector)
              : responseText
          );
        })
        .always(
          callback &&
            function (jqXHR, status) {
              self.each(function () {
                callback.apply(
                  this,
                  response || [jqXHR.responseText, status, jqXHR]
                );
              });
            }
        );
    }

    return this;
  };

  each(
    [
      "ajaxStart",
      "ajaxStop",
      "ajaxComplete",
      "ajaxError",
      "ajaxSuccess",
      "ajaxSend",
    ],
    (type) => {
      Kijs.prototype[type] = function (fn) {
        return this.on(type, fn);
      };
    }
  );
}

const get = createMethod("get");
const post = createMethod("post");

export default installer;
export {
  active,
  lastModified,
  etag,
  ajaxSettings,
  ajaxSetup,
  ajaxPrefilter,
  ajaxTransport,
  ajax,
  getJSON,
  getScript,
  evalUrl,
};
