const r20 = /%20/g,
  rhash = /#.*$/,
  rantiCache = /([?&])_=[^&]*/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

  // #7653, #8125, #8152: local protocol detection
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,

  prefilters = {},

  transports = {},

  // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
  allTypes = "*/".concat("*"),

  // Anchor tag for parsing the document origin
  originAnchor = document.createElement("a");

originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports(structure: Record < string, Function[] > ) {

  return function(dataTypeExpression: Function | string, func ? : Function) {

    if (typeof dataTypeExpression !== "string") {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    const dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

    if (isFunction(func)) {
      let dataType, i = 0;
      while ((dataType = dataTypes[i++])) {

        // Prepend if requested
        if (dataType[0] === "+") {
          dataType = dataType.slice(1) || "*";
          (structure[dataType] = structure[dataType] || []).unshift(func);

          // Otherwise append
        } else {
          (structure[dataType] = structure[dataType] || []).push(func);
        }
      }
    }
  };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {

  const inspected = {},
    seekingTransport = (structure === transports);

  function inspect(dataType) {
    var selected;
    inspected[dataType] = true;
    jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
      var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
      if (typeof dataTypeOrTransport === "string" &&
        !seekingTransport && !inspected[dataTypeOrTransport]) {

        options.dataTypes.unshift(dataTypeOrTransport);
        inspect(dataTypeOrTransport);
        return false;
      } else if (seekingTransport) {
        return !(selected = dataTypeOrTransport);
      }
    });
    return selected;
  }

  return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend(target, src) {
  var key, deep,
    flatOptions = jQuery.ajaxSettings.flatOptions || {};

  for (key in src) {
    if (src[key] !== undefined) {
      (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
    }
  }
  if (deep) {
    jQuery.extend(true, target, deep);
  }

  return target;
}

function ajaxHandleResponses(s, jqXHR, responses) {

  var ct, type, finalDataType, firstDataType,
    contents = s.contents,
    dataTypes = s.dataTypes;

  // Remove auto dataType and get content-type in the process
  while (dataTypes[0] === "*") {
    dataTypes.shift();
    if (ct === undefined) {
      ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
    }
  }

  // Check if we're dealing with a known content-type
  if (ct) {
    for (type in contents) {
      if (contents[type] && contents[type].test(ct)) {
        dataTypes.unshift(type);
        break;
      }
    }
  }

  // Check to see if we have a response for the expected dataType
  if (dataTypes[0] in responses) {
    finalDataType = dataTypes[0];
  } else {

    // Try convertible dataTypes
    for (type in responses) {
      if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
        finalDataType = type;
        break;
      }
      if (!firstDataType) {
        firstDataType = type;
      }
    }

    // Or just use first one
    finalDataType = finalDataType || firstDataType;
  }

  // If we found a dataType
  // We add the dataType to the list if needed
  // and return the corresponding response
  if (finalDataType) {
    if (finalDataType !== dataTypes[0]) {
      dataTypes.unshift(finalDataType);
    }
    return responses[finalDataType];
  }
}

function ajaxConvert(s, response, jqXHR, isSuccess) {
  var conv2, current, conv, tmp, prev,
    converters = {},

    // Work with a copy of dataTypes in case we need to modify it for conversion
    dataTypes = s.dataTypes.slice();

  // Create converters map with lowercased keys
  if (dataTypes[1]) {
    for (conv in s.converters) {
      converters[conv.toLowerCase()] = s.converters[conv];
    }
  }

  current = dataTypes.shift();

  // Convert to each sequential dataType
  while (current) {

    if (s.responseFields[current]) {
      jqXHR[s.responseFields[current]] = response;
    }

    // Apply the dataFilter if provided
    if (!prev && isSuccess && s.dataFilter) {
      response = s.dataFilter(response, s.dataType);
    }

    prev = current;
    current = dataTypes.shift();

    if (current) {

      // There's only work to do if current dataType is non-auto
      if (current === "*") {

        current = prev;

        // Convert response if prev dataType is non-auto and differs from current
      } else if (prev !== "*" && prev !== current) {

        // Seek a direct converter
        conv = converters[prev + " " + current] || converters["* " + current];

        // If none found, seek a pair
        if (!conv) {
          for (conv2 in converters) {

            // If conv2 outputs current
            tmp = conv2.split(" ");
            if (tmp[1] === current) {

              // If prev can be converted to accepted input
              conv = converters[prev + " " + tmp[0]] ||
                converters["* " + tmp[0]];
              if (conv) {

                // Condense equivalence converters
                if (conv === true) {
                  conv = converters[conv2];

                  // Otherwise, insert the intermediate dataType
                } else if (converters[conv2] !== true) {
                  current = tmp[0];
                  dataTypes.unshift(tmp[1]);
                }
                break;
              }
            }
          }
        }

        // Apply converter (if not an equivalence)
        if (conv !== true) {

          // Unless errors are allowed to bubble, catch and return them
          if (conv && s.throws) {
            response = conv(response);
          } else {
            try {
              response = conv(response);
            } catch (e) {
              return {
                state: "parsererror",
                error: conv ? e : "No conversion from " + prev + " to " + current
              };
            }
          }
        }
      }
    }
  }

  return { state: "success", data: response };
}

let active = 0;
const lastModified = new Map < string,
  number | string > ();
const etag = new Map < string,
  number | string > ();

const ajaxSettings = {
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
    json: "application/json, text/javascript"
  },

  contents: {
    xml: /\bxml\b/,
    html: /\bhtml/,
    json: /\bjson\b/
  },

  responseFields: {
    xml: "responseXML",
    text: "responseText",
    json: "responseJSON"
  },

  // Data converters
  // Keys separate source (or catchall "*") and destination types with a single space
  converters: {

    // Convert anything to text
    "* text": String,

    // Text to html (true = no transformation)
    "text html": true,

    // Evaluate text as a json expression
    "text json": JSON.parse,

    // Parse text as xml
    "text xml": jQuery.parseXML
  },

  // For options that shouldn't be deep extended:
  // you can add your own custom options here if
  // and when you create one that shouldn't be
  // deep extended (see ajaxExtend)
  flatOptions: {
    url: true,
    context: true
  },

  xhr() {
    try {
      return new XMLHttpRequest();
    } catch {}
  }
}

function ajaxSettings(target: string, settings: Exclude < typeof ajaxSettings, "url" > ): void;

function ajaxSettings(settings: typeof ajaxSettings): void;

function ajaxSetup(target, settings) {
  if (settings)

    // Building a settings object
    ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings)
  else

    // Extending ajaxSettings
    ajaxExtend(jQuery.ajaxSettings, target);
}


const ajaxPrefilter = addToPrefiltersOrTransports(prefilters)
const ajaxTransport = addToPrefiltersOrTransports(transports)


function ajax(url, options) {

  // If url is an object, simulate pre-1.5 signature
  if (typeof url === "object") {
    options = url;
    url = undefined;
  }

  // Force options to be an object
  options = options || {};

  var transport,

    // URL without anti-cache param
    cacheURL,

    // Response headers
    responseHeadersString,
    responseHeaders,

    // timeout handle
    timeoutTimer,

    // Url cleanup var
    urlAnchor,

    // Request state (becomes false upon send and true upon completion)
    completed,

    // To know if global events are to be dispatched
    fireGlobals,

    // Loop variable
    i,

    // uncached part of the url
    uncached,

    // Create the final options object
    s = jQuery.ajaxSetup({}, options),

    // Callbacks context
    callbackContext = s.context || s,

    // Context for global events is callbackContext if it is a DOM node or jQuery collection
    globalEventContext = s.context &&
    (callbackContext.nodeType || callbackContext.jquery) ?
    jQuery(callbackContext) :
    jQuery.event,

    // Status-dependent callbacks
    statusCode = s.statusCode || {},

    // Headers (they are sent all at once)
    requestHeaders = {},
    requestHeadersNames = {},
    resolveWith,
    rejectWith,
    // Default abort message
    strAbort = "canceled",
    completeDeferred = new Set(),
    // Fake xhr
    jqXHR = new class extends Promise {
      readyState = 0

      constructor() {
        super((resolve, reject) => {
          resolveWith = resolve;
          rejectWith = reject;
        })
      }
      // Builds headers hashtable if needed
      getResponseHeader(key) {
        var match;
        if (completed) {
          if (!responseHeaders) {
            responseHeaders = {};
            while ((match = rheaders.exec(responseHeadersString))) {
              responseHeaders[match[1].toLowerCase() + " "] =
                (responseHeaders[match[1].toLowerCase() + " "] || [])
                .concat(match[2]);
            }
          }
          match = responseHeaders[key.toLowerCase() + " "];
        }
        return match == null ? null : match.join(", ");
      }

      // Raw string
      getAllResponseHeaders() {
        return completed ? responseHeadersString : null;
      }

      // Caches the header
      setRequestHeader(name, value) {
        if (completed == null) {
          name = requestHeadersNames[name.toLowerCase()] =
            requestHeadersNames[name.toLowerCase()] || name;
          requestHeaders[name] = value;
        }
        return this;
      }

      // Overrides response content-type header
      overrideMimeType(type) {
        if (completed == null) {
          s.mimeType = type;
        }
        return this;
      }

      // Status-dependent callbacks
      statusCode(map) {
        var code;
        if (map) {
          if (completed) {

            // Execute the appropriate callbacks
            promise.always(map[jqXHR.status]);
          } else {

            // Lazy-add the new callbacks in a way that preserves old ones
            for (code in map) {
              statusCode[code] = [statusCode[code], map[code]];
            }
          }
        }
        return this;
      }

      // Cancel the request
      abort(statusText) {
        var finalText = statusText || strAbort;
        if (transport) {
          transport.abort(finalText);
        }
        done(0, finalText);
        return this;
      }
    
      always(cb) {
        let isError = false;
        
        this.catch(err => {
          isError = true
          return err
        })
        .then(e => {
          cb(e)
          
          if (isError) {
            throw e
          }
        })
        
        
      }
    };

  // Add protocol if not provided (prefilters might expect it)
  // Handle falsy url in the settings object (#10093: consistency with old signature)
  // We also use the url parameter if available
  s.url = ((url || s.url || location.href) + "")
    .replace(rprotocol, location.protocol + "//");

  // Alias method option to type as per ticket #12004
  s.type = options.method || options.type || s.method || s.type;

  // Extract dataTypes list
  s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];

  // A cross-domain request is in order when the origin doesn't match the current origin.
  if (s.crossDomain == null) {
    urlAnchor = document.createElement("a");

    // Support: IE <=8 - 11, Edge 12 - 15
    // IE throws exception on accessing the href property if url is malformed,
    // e.g. http://example.com:80x/
    try {
      urlAnchor.href = s.url;

      // Support: IE <=8 - 11 only
      // Anchor's host property isn't correctly set when s.url is relative
      urlAnchor.href = urlAnchor.href;
      s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
        urlAnchor.protocol + "//" + urlAnchor.host;
    } catch (e) {

      // If there is an error parsing the URL, assume it is crossDomain,
      // it can be rejected by the transport if it is invalid
      s.crossDomain = true;
    }
  }

  // Convert data if not already a string
  if (s.data && s.processData && typeof s.data !== "string") {
    s.data = jQuery.param(s.data, s.traditional);
  }

  // Apply prefilters
  inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

  // If request was aborted inside a prefilter, stop there
  if (completed) {
    return jqXHR;
  }

  // We can fire global events as of now if asked to
  // Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
  fireGlobals = jQuery.event && s.global;

  // Watch for a new set of requests
  if (fireGlobals && active++ === 0) {
    jQuery.event.trigger("ajaxStart");
  }

  // Uppercase the type
  s.type = s.type.toUpperCase();

  // Determine if request has content
  s.hasContent = !rnoContent.test(s.type);

  // Save the URL in case we're toying with the If-Modified-Since
  // and/or If-None-Match header later on
  // Remove hash to simplify url manipulation
  cacheURL = s.url.replace(rhash, "");

  // More options handling for requests with no content
  if (!s.hasContent) {

    // Remember the hash so we can put it back
    uncached = s.url.slice(cacheURL.length);

    // If data is available and should be processed, append data to url
    if (s.data && (s.processData || typeof s.data === "string")) {
      cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

      // #9682: remove data so that it's not used in an eventual retry
      delete s.data;
    }

    // Add or update anti-cache param if needed
    if (s.cache === false) {
      cacheURL = cacheURL.replace(rantiCache, "$1");
      uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + (nonce.guid++) +
        uncached;
    }

    // Put hash and anti-cache on the URL that will be requested (gh-1732)
    s.url = cacheURL + uncached;

    // Change '%20' to '+' if this is encoded form body content (gh-2658)
  } else if (s.data && s.processData &&
    (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
    s.data = s.data.replace(r20, "+");
  }

  // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
  if (s.ifModified) {
    if (lastModified.has(cacheURL)) {
      jqXHR.setRequestHeader("If-Modified-Since", lastModified.get(cacheURL) !);
    }
    if (etag.has(cacheURL)) {
      jqXHR.setRequestHeader("If-None-Match", etag.get(cacheURL));
    }
  }

  // Set the correct header, if data is being sent
  if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
    jqXHR.setRequestHeader("Content-Type", s.contentType);
  }

  // Set the Accepts header for the server, depending on the dataType
  jqXHR.setRequestHeader(
    "Accept",
    s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
    s.accepts[s.dataTypes[0]] +
    (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") :
    s.accepts["*"]
  );

  // Check for headers option
  for (i in s.headers) {
    jqXHR.setRequestHeader(i, s.headers[i]);
  }

  // Allow custom headers/mimetypes and early abort
  if (s.beforeSend &&
    (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed)) {

    // Abort if not done already and return
    return jqXHR.abort();
  }

  // Aborting is no longer a cancellation
  strAbort = "abort";

  // Install callbacks on deferreds
  completeDeferred.add(s.complete);
  jqXHR.done(s.success);
  jqXHR.fail(s.error);

  // Get transport
  transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

  // If no transport, we auto-abort
  if (!transport) {
    done(-1, "No Transport");
  } else {
    jqXHR.readyState = 1;

    // Send global event
    if (fireGlobals) {
      globalEventContext.trigger("ajaxSend", [jqXHR, s]);
    }

    // If request was aborted inside ajaxSend, stop there
    if (completed) {
      return jqXHR;
    }

    // Timeout
    if (s.async && s.timeout > 0) {
      timeoutTimer = window.setTimeout(function() {
        jqXHR.abort("timeout");
      }, s.timeout);
    }

    try {
      completed = false;
      transport.send(requestHeaders, done);
    } catch (e) {

      // Rethrow post-completion exceptions
      if (completed) {
        throw e;
      }

      // Propagate others as results
      done(-1, e);
    }
  }

  // Callback for when everything is done
  function done(status, nativeStatusText, responses, headers) {
    var isSuccess, success, error, response, modified,
      statusText = nativeStatusText;

    // Ignore repeat invocations
    if (completed) {
      return;
    }

    completed = true;

    // Clear timeout if it exists
    if (timeoutTimer) {
      window.clearTimeout(timeoutTimer);
    }

    // Dereference transport for early garbage collection
    // (no matter how long the jqXHR object will be used)
    transport = undefined;

    // Cache response headers
    responseHeadersString = headers || "";

    // Set readyState
    jqXHR.readyState = status > 0 ? 4 : 0;

    // Determine if successful
    isSuccess = status >= 200 && status < 300 || status === 304;

    // Get response data
    if (responses) {
      response = ajaxHandleResponses(s, jqXHR, responses);
    }

    // Use a noop converter for missing script but not if jsonp
    if (!isSuccess &&
      jQuery.inArray("script", s.dataTypes) > -1 &&
      jQuery.inArray("json", s.dataTypes) < 0) {
      s.converters["text script"] = function() {};
    }

    // Convert no matter what (that way responseXXX fields are always set)
    response = ajaxConvert(s, response, jqXHR, isSuccess);

    // If successful, handle type chaining
    if (isSuccess) {

      // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
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

      // if no content
      if (status === 204 || s.type === "HEAD") {
        statusText = "nocontent";

        // if not modified
      } else if (status === 304) {
        statusText = "notmodified";

        // If we have data, let's convert it
      } else {
        statusText = response.state;
        success = response.data;
        error = response.error;
        isSuccess = !error;
      }
    } else {

      // Extract error from statusText and normalize for non-aborts
      error = statusText;
      if (status || !statusText) {
        statusText = "error";
        if (status < 0) {
          status = 0;
        }
      }
    }

    // Set data for the fake xhr object
    jqXHR.status = status;
    jqXHR.statusText = (nativeStatusText || statusText) + "";

    // Success/Error
    if (isSuccess) {
      resolveWith(callbackContext, [success, statusText, jqXHR]);
    } else {
      rejectWith(callbackContext, [jqXHR, statusText, error]);
    }

    // Status-dependent callbacks
    jqXHR.statusCode(statusCode);
    statusCode = undefined;

    if (fireGlobals) {
      globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError",
					[jqXHR, s, isSuccess ? success : error]);
    }

    // Complete
    completeDeferred.forEach(cb => cb(callbackContext, [jqXHR, statusText]));

    if (fireGlobals) {
      globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

      // Handle the global AJAX counter
      if (!(--active)) {
        jQuery.event.trigger("ajaxStop");
      }
    }
  }

  return jqXHR;
},

function getJSON(url, data, callback) {
  return jQuery.get(url, data, callback, "json");
},

function getScript(url, callback) {
  return jQuery.get(url, undefined, callback, "script");
}


function createMethod(method) {
  return function(url, data, callback, type) {

    // Shift arguments if data argument was omitted
    if (isFunction(data)) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    // The url can be an options object (which then must have .url)
    return ajax(extend({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    }, isObject(url) && url));
  };
}


ajaxPrefilter(function(s) {
  var i;
  for (i in s.headers) {
    if (i.toLowerCase() === "content-type") {
      s.contentType = s.headers[i] || "";
    }
  }
});


function evalUrl(url, options, doc) {
  return jQuery.ajax({
    url: url,

    // Make this explicit, since user can override this through ajaxSetup (#11264)
    type: "GET",
    dataType: "script",
    cache: true,
    async: false,
    global: false,

    // Only evaluate the response if it is successful (gh-4126)
    // dataFilter is not invoked for failure responses, so using it instead
    // of the default converter is kludgy but it works.
    converters: {
      "text script": function() {}
    },
    dataFilter: function(response) {
      jQuery.globalEval(response, options, doc);
    }
  });
};





const xhrSuccessStatus = {

    // File protocol always yields status code 0, assume 200
    0: 200,

    // Support: IE <=9 only
    // #1450: sometimes IE returns 1223 when it should be 204
    1223: 204
  },
  xhrSupported = jQuery.ajaxSettings.xhr();

isSupport.cors = !!xhrSupported && ("withCredentials" in xhrSupported);
isSupport.ajax = xhrSupported = !!xhrSupported;

ajaxTransport(function(options) {
  var callback, errorCallback;

  // Cross domain only allowed if supported through XMLHttpRequest
  if (support.cors || xhrSupported && !options.crossDomain) {
    return {
      send: function(headers, complete) {
        var i,
          xhr = options.xhr();

        xhr.open(
          options.type,
          options.url,
          options.async,
          options.username,
          options.password
        );

        // Apply custom fields if provided
        if (options.xhrFields) {
          for (i in options.xhrFields) {
            xhr[i] = options.xhrFields[i];
          }
        }

        // Override mime type if needed
        if (options.mimeType && xhr.overrideMimeType) {
          xhr.overrideMimeType(options.mimeType);
        }

        // X-Requested-With header
        // For cross-domain requests, seeing as conditions for a preflight are
        // akin to a jigsaw puzzle, we simply never set it to be sure.
        // (it can always be set on a per-request basis or even using ajaxSetup)
        // For same-domain requests, won't change header if already provided.
        if (!options.crossDomain && !headers["X-Requested-With"]) {
          headers["X-Requested-With"] = "XMLHttpRequest";
        }

        // Set headers
        for (i in headers) {
          xhr.setRequestHeader(i, headers[i]);
        }

        // Callback
        callback = function(type) {
          return function() {
            if (callback) {
              callback = errorCallback = xhr.onload =
                xhr.onerror = xhr.onabort = xhr.ontimeout =
                xhr.onreadystatechange = null;

              if (type === "abort") {
                xhr.abort();
              } else if (type === "error") {

                // Support: IE <=9 only
                // On a manual native abort, IE9 throws
                // errors on any property access that is not readyState
                if (typeof xhr.status !== "number") {
                  complete(0, "error");
                } else {
                  complete(

                    // File: protocol always yields status 0; see #8605, #14207
                    xhr.status,
                    xhr.statusText
                  );
                }
              } else {
                complete(
                  xhrSuccessStatus[xhr.status] || xhr.status,
                  xhr.statusText,

                  // Support: IE <=9 only
                  // IE9 has no XHR2 but throws on binary (trac-11426)
                  // For XHR2 non-text, let the caller handle it (gh-2498)
                  (xhr.responseType || "text") !== "text" ||
                  typeof xhr.responseText !== "string" ? { binary: xhr.response } : { text: xhr.responseText },
                  xhr.getAllResponseHeaders()
                );
              }
            }
          };
        };

        // Listen to events
        xhr.onload = callback();
        errorCallback = xhr.onerror = xhr.ontimeout = callback("error");

        // Support: IE 9 only
        // Use onreadystatechange to replace onabort
        // to handle uncaught aborts
        if (xhr.onabort !== undefined) {
          xhr.onabort = errorCallback;
        } else {
          xhr.onreadystatechange = function() {

            // Check readyState before timeout as it changes
            if (xhr.readyState === 4) {

              // Allow onerror to be called first,
              // but that will not handle a native abort
              // Also, save errorCallback to a variable
              // as xhr.onerror cannot be accessed
              window.setTimeout(function() {
                if (callback) {
                  errorCallback();
                }
              });
            }
          };
        }

        // Create the abort callback
        callback = callback("abort");

        try {

          // Do send the request (this may raise an exception)
          xhr.send(options.hasContent && options.data || null);
        } catch (e) {

          // #14683: Only rethrow if this hasn't been notified as an error yet
          if (callback) {
            throw e;
          }
        }
      },

      abort: function() {
        if (callback) {
          callback();
        }
      }
    };
  }
});

ajaxPrefilter(function(s) {
  if (s.crossDomain) {
    s.contents.script = false;
  }
});

// Install script dataType
ajaxSetup({
  accepts: {
    script: "text/javascript, application/javascript, " +
      "application/ecmascript, application/x-ecmascript"
  },
  contents: {
    script: /\b(?:java|ecma)script\b/
  },
  converters: {
    "text script": function(text) {
      jQuery.globalEval(text);
      return text;
    }
  }
});

ajaxPrefilter("script", function(s) {
  if (s.cache === undefined) {
    s.cache = false;
  }
  if (s.crossDomain) {
    s.type = "GET";
  }
});

ajaxTransport("script", function(s) {

  // This transport only deals with cross domain or forced-by-attrs requests
  if (s.crossDomain || s.scriptAttrs) {
    var script, callback;
    return {
      send: function(_, complete) {
        script = jQuery("<script>")
          .attr(s.scriptAttrs || {})
          .prop({ charset: s.scriptCharset, src: s.url })
          .on("load error", callback = function(evt) {
            script.remove();
            callback = null;
            if (evt) {
              complete(evt.type === "error" ? 404 : 200, evt.type);
            }
          });

        // Use native DOM manipulation to avoid our domManip AJAX trickery
        document.head.appendChild(script[0]);
      },
      abort: function() {
        if (callback) {
          callback();
        }
      }
    };
  }
});




var oldCallbacks = [],
  rjsonp = /(=)\?(?=&|$)|\?\?/;

ajaxSetup({
  jsonp: "callback",
  jsonpCallback: function() {
    var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (nonce.guid++));
    this[callback] = true;
    return callback;
  }
});

ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {

  var callbackName, overwritten, responseContainer,
    jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ?
      "url" :
      typeof s.data === "string" &&
      (s.contentType || "")
      .indexOf("application/x-www-form-urlencoded") === 0 &&
      rjsonp.test(s.data) && "data"
    );

  // Handle iff the expected data type is "jsonp" or we have a parameter to set
  if (jsonProp || s.dataTypes[0] === "jsonp") {

    // Get callback name, remembering preexisting value associated with it
    callbackName = s.jsonpCallback = isFunction(s.jsonpCallback) ?
      s.jsonpCallback() :
      s.jsonpCallback;

    // Insert callback into url or form data
    if (jsonProp) {
      s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
    } else if (s.jsonp !== false) {
      s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
    }

    // Use data converter to retrieve json after script execution
    s.converters["script json"] = function() {
      if (!responseContainer) {
        jQuery.error(callbackName + " was not called");
      }
      return responseContainer[0];
    };

    // Force json dataType
    s.dataTypes[0] = "json";

    // Install callback
    overwritten = window[callbackName];
    window[callbackName] = function() {
      responseContainer = arguments;
    };

    // Clean-up function (fires after converters)
    jqXHR.always(function() {

      // If previous value didn't exist - remove it
      if (overwritten === undefined) {
        jQuery(window).removeProp(callbackName);

        // Otherwise restore preexisting value
      } else {
        window[callbackName] = overwritten;
      }

      // Save back as free
      if (s[callbackName]) {

        // Make sure that re-using the options doesn't screw things around
        s.jsonpCallback = originalSettings.jsonpCallback;

        // Save the callback name for future use
        oldCallbacks.push(callbackName);
      }

      // Call if it was a function and we have a response
      if (responseContainer && isFunction(overwritten)) {
        overwritten(responseContainer[0]);
      }

      responseContainer = overwritten = undefined;
    });

    // Delegate to script
    return "script";
  }
});


isSpport.createHTMLDocument = (function() {
  var body = document.implementation.createHTMLDocument("").body;
  body.innerHTML = "<form></form><form></form>";
  return body.childNodes.length === 2;
})();



function installer(Kijs) {
  Kijs.prototype.load = function(url, params, callback) {
    var selector, type, response,
      self = this,
      off = url.indexOf(" ");

    if (off > -1) {
      selector = stripAndCollapse(url.slice(off));
      url = url.slice(0, off);
    }

    // If it's a function
    if (isFunction(params)) {

      // We assume that it's the callback
      callback = params;
      params = undefined;

      // Otherwise, build a param string
    } else if (params && typeof params === "object") {
      type = "POST";
    }

    // If we have elements to modify, make the request
    if (self.length > 0) {
      jQuery.ajax({
        url: url,

        // If "type" variable is undefined, then "GET" method will be used.
        // Make value of this field explicit since
        // user can override it through ajaxSetup method
        type: type || "GET",
        dataType: "html",
        data: params
      }).done(function(responseText) {

        // Save response for use in complete callback
        response = arguments;

        self.html(selector ?

          // If a selector was specified, locate the right elements in a dummy div
          // Exclude scripts to avoid IE 'Permission Denied' errors
          jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

          // Otherwise use the full result
          responseText);

        // If the request succeeds, this function gets "data", "status", "jqXHR"
        // but they are ignored because response was set above.
        // If it fails, this function gets "jqXHR", "status", "error"
      }).always(callback && function(jqXHR, status) {
        self.each(function() {
          callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
        });
      });
    }

    return this;
  };

  each([
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], (type) => {
    Kijs.prototype[type] = function(fn) {
      return this.on(type, fn);
    };
  });
}


const get = createMethod("get")
const post = createMethod("post")

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
  evalUrl
}