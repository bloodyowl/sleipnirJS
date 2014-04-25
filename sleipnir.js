/*
    Copyright © 2013 Benjamin Moulin <hello@grid23.net>
    This work is free. You can redistribute it and/or modify it under the
    terms of the Do What The Fuck You Want To Public License, Version 2,
    as published by Sam Hocevar. See the COPYING file for more details.
*/

/*
 variables to preserve : $super, $static, $e, $resolve, $reject, $progress, $, $$, $next, $route, $root, $nodes
*/

;void function(root, ns){ "use strict"

    var document = root.document
      , location = document.location
      , navigator = root.navigator
      , CONST = ns.CONST = {}
        /* some const-like declarations */
      , STRICT_MODE = CONST.STRICT_MODE = function(){
            return this === void 0
        }()

      , BLOB_COMPAT = CONST.BLOB_COMPAT = function(blob, url){
            try {
                blob = new Blob([""], { type: "text/plain" })
                url = URL.createObjectURL(blob)

                if ( "msClose" in blob ) // on ie10 (+?), blobs are treated like x-domain files, making them unwritable
                  throw new Error
            } catch(e){
                return 0
            }
            return 1
        }()
      , COMPUTED_STYLE_COMPAT = CONST.COMPUTED_STYLE_COMPAT = "getComputedStyle" in root ? 0x1 : 0x0
      , COOKIE_ENABLED = CONST.COOKIE_ENABLED = +navigator.cookieEnabled

      , CSS_TRANSITION_COMPAT = CONST.CSS_TRANSITION_COMPAT = "getComputedStyle" in root  && "DOMStringMap" in root && "TransitionEvent" in root ? 0x1 : "WebKitTransitionEvent" in root ? 0x3 : 0
      , CSS_TRANSITION_PROPERTY = CONST.CSS_TRANSITION_PROPERTY = CSS_TRANSITION_COMPAT & 0x1 ? "transition" : CSS_TRANSITION_COMPAT & 0x3 ? "-webkit-transition" : null
      , CSS_TRANSITIONEND_EVENT = CONST.CSS_TRANSITIONEND_EVENT = CSS_TRANSITION_COMPAT & 0x1 ? "transitionend" : CSS_TRANSITION_COMPAT & 0x3 ? "webkitTransitionEnd" : null
      , CUSTOM_EVENTS_COMPAT = CONST.CUSTOM_EVENTS_COMPAT = function(rv, tests, i, l){
            tests = [
                function(){ new CustomEvent("ce", { bubbles: false, cancelable: false }, { detail: {} }); return 0x8 }
              , function(){ document.createEvent("customEvent").initCustomEvent("ce", false, false, {}); return 0x4 }
              , function(){ document.createEvent("Event").initEvent("ce", false, false); return 0x2 }
              , function(){ document.createEventObject(); return 0x1 }
            ]

            for ( i = 0, l = tests.length; i < l; i++ )
              try {
                  rv = tests[i].call()
                  return rv
              } catch(e){ }

            return 0
        }()
      , STYLESHEET_COMPAT = CONST.STYLESHEET_COMPAT = function(blob, node){
            if ( blob )
              return 5

            try {
                node = document.createElement("style")
                node.textContent = node.innerText = ""
                return 3
            } catch(e){}

            return 0
        }( BLOB_COMPAT )
      , CSS_PROPERTIES_COMPAT = CONST.CSS_PROPERTIES_COMPAT = function(props){
            return typeof props.setProperty == "function" && typeof props.getPropertyCSSValue == "function" ? 1 : 0
        }( document.createElement("div").style )
      , TOP_DOMAIN = CONST.TOP_DOMAIN = function(split, i, l, curr, hit){
            function cookie(domain, cookiestr){
                cookiestr = "__sleipTDT__=tdt"

                document.cookie = cookiestr+";domain="+domain

                if ( document.cookie.indexOf(cookiestr) != -1 ) {
                    document.cookie = cookiestr+"; domain="+domain+"; expires=" + new Date( +(new Date) - 1000 ).toUTCString()
                    return true
                }

                return false
            }

            i = split.length

            while ( i-- )
              if ( curr = /*"."+*/split.slice(i).join("."), hit = cookie(curr), hit )
                return curr

            return location.hostname
        }( location.hostname.split(".") )
      , VISIBILITY_COMPAT = CONST.VISIBILITY_COMPAT = "hidden" in document ? 9 : "mozHidden" in document ? 5 : "msHidden" in document ? 3 : "webkitHidden" in document ? 1 : 0
      , VISIBILITY_CHANGE_EVENT = CONST.VISIBILITY_CHANGE_EVENT = function(c){ return c & 8 ? "visibilitychange" : c & 4 ? "mozvisibilitychange" : c & 2 ? "msvisibilitychange" : c & 1 ? "webkitvisibilitychange" : null }( VISIBILITY_COMPAT )
      , VISIBILITY_HIDDEN_PROPERTY = CONST.VISIBILITY_HIDDEN_PROPERTY = function(c){ return c & 8 ? "hidden" : c & 4 ? "mozHidden" : c & 2 ? "msHidden" : c & 1 ? "webkitHidden" : null }( VISIBILITY_COMPAT )
      , XHR_COMPAT = "XMLHttpRequest" in root ? 1 : 0

      , NONE = CONST.NONE = 0, ERROR = CONST.ERROR = 1, INIT = CONST.INIT = 2
      , PENDING = CONST.PENDING = 6, REJECTED = CONST.REJECTED = 10, RESOLVED = CONST.RESOLVED = 18

      , risnative = /\s*\[native code\]\s*/i
      , rtrim = /^\s+|\s+$/g
      , rargs = /(?=^|\s*)function(?:[^\(]*)\(([^\)]*)/
      , rip = /^(?:[\d.]*)$/
      , rtemplatevars = /@(.*)@/g
      , renclosingquotes = /^"|^'|"$|'$/g

        /* dom nodes */
      , docHead, docElt, docBody

      , noop = function(){}

      , toType = ns.toType = function(toString){
            return function(o){
                return toString.call(o)
            }
        }( Object.prototype.toString )

      , isNative = ns.isNative = function(fn){
            try {
              return fn.toString().match(risnative)
            } catch(e) {
              return false
            }
        }

      , isArray = ns.isArray = function(hasIsArray){
            return hasIsArray ? Array.isArray : function(o){
                return toType(o) == "[object Array]"
            }
        }( isNative(Array.isArray) )

      , isObject = ns.isObject = function(o){
            return o && o.constructor === Object
        }

        // sleipnir related isX tests
      , isInvocable = ns.isInvocable = function(o){
            return o && ( typeof o.handleInvoke == "function" || typeof o == "function" )
        }

      , isEventable = ns.isEventable = function(o){
            return isInvocable(o) || ( o && isInvocable(o.handleEvent) )
        }

      , isRoutable = ns.isRoutable = function(o){
            return isInvocable(o) || ( o && isInvocable(o.handleRoute) )
        }

      , isThenable = ns.isThenable = function(o){
            return isInvocable(o) || ( o && (isInvocable(o.handleResolve) || isInvocable(o.handleReject) || isInvocable(o.handleProgress)) )
        }


      , slice = ns.slice = function(slice){
            return function(o, idx){
                var rv, i, l

                try {
                    rv = slice.call(o, idx)
                } catch(e){
                    rv = []

                    for ( i = 0, l = o.length; i < l; i++ )
                      rv.push(o[i])

                    rv.splice(idx)
                }

                return rv
            }
        }( Array.prototype.slice )

      , indexOf = ns.indexOf = function(hasIndexOf){
            if ( hasIndexOf )
              return function(a, s){
                  return a.indexOf(s)
              }
            return function(a, s){
                var i = 0, l = a.length

                for ( ; i < l; i++ )
                  if ( a[i] === s )
                    return i
                return -1
            }
        }( isNative(Array.prototype.indexOf) )

      , trim = function(hasTrim){
            if ( hasTrim )
              return function(s){
                  return s.trim()
              }
            return function(s){
                return s.replace(rtrim, "")
            }
        }( isNative(String.prototype.trim) )

      , escapeHTML = ns.escapeHTML = function(dummy){
            return function(str){
                dummy.nodeValue = str
                return dummy.nodeValue
            }
        }( document.createTextNode("") )

      , enumerate = ns.enumerate = function(hasObjectKeys){
            return function(o){
                var k, i, l, rv

                if ( hasObjectKeys )
                  try {
                    rv = Object.keys(o)
                    return rv
                  } catch(e) { }

                rv = []
                o = !!o ? (!!o.callee ? slice(o) : o) : {}

                if ( typeof o !== "string" ) {
                  for ( k in o ) if ( rv.hasOwnProperty.call(o, k) )
                    rv.push(k)
                } else {
                  for ( i = 0, l = o.length; i < l; i++ )
                    rv[i] = i
                }

                return rv
            }
        }( isNative(Object.keys) )

      , JSON = ns.JSON = root.JSON || function(){
            // JSON2.JS by Douglas Crockford
           var JSON = {}
           ;(function(){"use strict";function f(t){return 10>t?"0"+t:t}function quote(t){return escapable.lastIndex=0,escapable.test(t)?'"'+t.replace(escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var r,n,o,f,u,p=gap,i=e[t];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(t)),"function"==typeof rep&&(i=rep.call(e,t,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?i+"":"null";case"boolean":case"null":return i+"";case"object":if(!i)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(i)){for(f=i.length,r=0;f>r;r+=1)u[r]=str(r,i)||"null";return o=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+p+"]":"["+u.join(",")+"]",gap=p,o}if(rep&&"object"==typeof rep)for(f=rep.length,r=0;f>r;r+=1)"string"==typeof rep[r]&&(n=rep[r],o=str(n,i),o&&u.push(quote(n)+(gap?": ":":")+o));else for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(o=str(n,i),o&&u.push(quote(n)+(gap?": ":":")+o));return o=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+p+"}":"{"+u.join(",")+"}",gap=p,o}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;"function"!=typeof JSON.stringify&&(JSON.stringify=function(t,e,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;r>n;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(n=walk(o,r),void 0!==n?o[r]=n:delete o[r]);return reviver.call(t,e,o)}var j;if(text+="",cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}())
           return JSON
        }()


      , invoke = ns.invoke = function(){
            return function(){
                var fn, args, ctx

                fn = arguments[0] && typeof arguments[0].handleInvoke == "function" ? ( ctx = arguments[0], ctx.handleInvoke )
                   : typeof arguments[0] == "function" ? arguments[0]
                   : function(args){ throw new Error("sleipnir.invoke, invalid function/invokeHandler") }(arguments)

                args = isArray(arguments[1]) ? arguments[1]
                     : arguments[1] && ( (!STRICT_MODE&&!!arguments[1].callee)||toType(arguments[1]) == "[object Arguments]" ) ? arguments[1]
                     : isObject(arguments[1]) ? buildMagicArguments(fn, arguments[1])
                     : []

                ctx = ctx || arguments[2]

                switch ( args.length ){
                    case 0: return fn.call(ctx)
                    case 1: return fn.call(ctx, args[0])
                    case 2: return fn.call(ctx, args[0], args[1])
                    case 3: return fn.call(ctx, args[0], args[1], args[2])
                }

                return fn.apply(ctx, args)
            }

            function extractArguments(fn){
                var args = fn.toString().match(rargs)[1].split(",")
                  , i = 0, l = args.length

                for ( ; i < l; i++ )
                  args[i] = trim(args[i])

                return args
            }

            function buildMagicArguments(fn, args){
                var waited = extractArguments(fn)
                  , i = 0, j = 0, l
                  , rv = []

                for ( l = waited.length||0; i < l; i++ )
                  if ( args.hasOwnProperty(waited[i]) )
                    rv[i] = args[waited[i]]
                  else
                    rv[i] = args[j++]

                for ( l = args.length; j < l; j++)
                  rv.push(args[j])

                return rv
            }
        }()

      , klass = ns.klass = function(){
            var args = slice(arguments)
              , Super = args.length == 2 ? args[0] : null
              , statics = {}, k
              , Class
              , prototype = function(){
                    if ( typeof args[args.length-1] == "function" ) {
                      args[args.length-1] = invoke(args[args.length-1], { $Super: Super, $static: statics, 0: Super, 1: statics, length: 2 })
                    }

                    if ( !isNative(args[args.length-1].constructor) ) {
                        Class = args[args.length-1].constructor
                        delete args[args.length-1].constructor
                    }

                    return invoke(mixin, args)
                }()

            Class = Class || function(){}
            Class.prototype = prototype
            Class.prototype.constructor = Class

            for ( k in statics ) if ( statics.hasOwnProperty(k) )
              Class[k] = statics[k]

            Class.Super = Super

            Class.create = function(){
                var args = arguments
                function F(){
                    return invoke(Class, args, this)
                }
                F.prototype = Class.prototype

                return new F
            }

            Class.extend = function(){
                return invoke(klass, [Class].concat(slice(arguments)))
            }

            Class.isImplementedBy = function(){
                var k, i = 0, l = arguments.length
                  , prototype

                for ( ; i < l; i++ ) {
                    prototype = typeof arguments[i] == "function" ? arguments[i].prototype
                              : arguments[i] ? arguments[i] : {}

                  for ( k in Class.prototype )
                    if ( k != "constructor" && prototype[k] !== Class.prototype[k] )
                      return false
                }

                return true
            }

            Class.implementsOn = function(){
                var k, i = 0, l = arguments.length
                  , prototype

                for ( ; i < l; i++ ) {
                    prototype = typeof arguments[i] == "function" ? arguments[i].prototype
                              : arguments[i] ? arguments[i] : {}

                    for ( k in Class.prototype ) if ( k !== "constructor" )
                      prototype[k] = Class.prototype[k]
                }

            }

            return Class
        }
      , mixin = klass.mixin = function(){
            var args = slice(arguments)
              , k, i = 0, l = args.length
              , prototype = {}
              , superPrototype

            for ( ; i < l; i++ ) {
                superPrototype = typeof args[i] == "function" ? args[i].prototype
                      : args[i] ? args[i] : {}

                for ( k in superPrototype )
                  if ( prototype[k] !== superPrototype[k] && superPrototype[k] !== Object.prototype[k] )
                    prototype[k] = superPrototype[k]
            }

            delete prototype.constructor
            return prototype
        }
      , singleton = ns.singleton = klass.singleton = function(){
            var F = invoke(klass, arguments)
              , G = klass(F, function(Super, statics){
                    var k

                    statics.instance = null

                    for ( k in F ) if ( F.hasOwnProperty(k) )
                      statics[k] = F[k]

                    return {
                        constructor: function(){
                            var g = this

                            if ( G.instance )
                              return  G.instance
                            G.instance = g

                            return invoke(Super, arguments, g)
                        }
                    }
                })

            return G
        }

      , Invoker = ns.Invoker = klass(function(Super, statics){
            statics.invoke = invoke

            return {
                constructor: function(){
                    var dict = isObject(arguments[0]) ? arguments[0] : {}
                      , k

                    this.__magicArguments__ =  this.__magicArguments__ || {}

                    for ( k in dict ) if ( dict.hasOwnProperty(k) )
                      this.__magicArguments__[k] = dict[k]
                }
              , invoke: function(){
                    var args = slice(arguments)

                    args[1] = function(rargs, rkeys, margs, o, k, i, l){
                        for ( k in margs ) if ( margs.hasOwnProperty(k) )
                          o[k] = margs[k]

                        for ( i = 0, l = rkeys.length; i < l; i++ )
                          o[rkeys[i]] = rargs[rkeys[i]]

                        i = 0
                        while ( o.hasOwnProperty(i) )
                          i += 1

                        o.length = i

                        return o
                    }( args[1], enumerate(args[1]), (this.__magicArguments__ = this.__magicArguments__ || {}), {} )

                    return invoke(args[0], args[1], args[2])
                }
            }
        })


      , Serializer = ns.Serializer = klass(function(Super, statics){
            statics.serialize = ns.serialize = function(delimiter, separator){
                return function(o){
                    var args = arguments.length > 1 ? arguments
                             : arguments[0] !== void 0 ? arguments[0]
                             : {}
                      , keys = enumerate(args), i = 0, l = keys.length
                      , str = []

                    for ( ; i < l; i++ )
                      str.push( escape(keys[i]) + (this&&this.__delimiterSymbol__||delimiter) + encodeURIComponent(args[keys[i]]) )

                    return str.join(this&&this.__separatorSymbol__||separator).replace(/%20/g, "+")
                }
            }("=", "&")

            statics.objectify = ns.objectify = function(delimiter, separator){
                return function(str){
                    var o = {}
                      , pairs = !!~str.search(this&&this.__separatorSymbol__||separator) ? str.split(this&&this.__separatorSymbol__||separator) : str.length ? [str] : []
                      , keys = enumerate(pairs), i = 0, l = keys.length

                    for ( ; i < l; i++ )
                      void function(pair){
                          var pair = unescape(pair.replace(/\+/g, "%20"))
                            , idx = pair.indexOf(this&&this.__delimiterSymbol__||delimiter)
                            , key = pair.split(this&&this.__delimiterSymbol__||delimiter, 1)
                            , value = pair.slice(idx+1)

                          o[key] = value
                      }( pairs[keys[i]] )

                    return o
                }
            }("=", /&amp;|&/g)

            return {
                constructor: function(dict){
                    var dict = isObject(arguments[0]) ? arguments[0] : {}

                    if ( dict.delimiter )
                      this.__delimiterSymbol__ = dict.delimiter

                    if ( dict.separator )
                      this.__separatorSymbol__ = dict.separator
                }
              , serialize: function(){
                    return invoke(statics.serialize, arguments, this)
                }
              , objectify: function(){
                    return invoke(statics.objectify, arguments, this)
                }
            }
        })

      , Uuid = ns.Uuid = klass(function(Super, statics, rfcMap, distributed){
            statics.CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
            statics.uuid = function(length, radix, map_args){
                var i = 0, l = typeof arguments[0] == "number" ? arguments[0] : 36
                  , radix = typeof arguments[1] == "number" ? Math.abs(Math.min(arguments[1], statics.CHARS.length)) : statics.CHARS.length
                  , map = this && Uuid.isImplementedBy(this) && this.__map__ ? this.__map__
                        : !arguments.length ? rfcMap
                        : {}
                  , map_args = arguments[2]
                  , uuid = [], rv

                for ( ; i < l; i++ )
                    uuid[i] = function(i, mapped, v){
                        if ( !mapped )
                          return statics.CHARS[ Math.floor(Math.random()*radix) ]

                        if ( isInvocable(mapped) )
                          v = invoke(mapped, [map_args])

                        v = mapped ? mapped.toString() : toType(mapped)

                        return v[0]
                    }(i, map[i])

                rv = uuid.join("")

                return indexOf(distributed, rv) == -1 ? rv : invoke(uuid, arguments, this)
            }

            rfcMap = { 8: "-", 13: "-", 18: "-", 23: "-" , 14: "4" }
            distributed = []

            return {
                constructor: function(){
                    var uuidDict = isObject(arguments[0]) ? arguments[0]
                                 : typeof arguments[0] == "string" ? { length: 36, rfc: true }
                                 : {}

                    this.__rfc__ = !!uuidDict.rfc
                    this.__map__ = !this.__rfc__ && isObject(uuidDict.map) ? uuidDict.map
                                 : this.__rfc__ ? function(add){
                                       var o = {}
                                         , k

                                       for ( k in rfcMap ) if ( rfcMap.hasOwnProperty(k) )
                                          o[k] = rfcMap[k]
                                       for ( k in add ) if ( add.hasOwnProperty(k) )
                                          o[k] = add[k]

                                       return o
                                   }( isObject(uuidDict.map) ? uuidDict.map : {} )
                                 : {}
                    this.__length__ = !this.__rfc__ && +uuidDict.length ? +uuidDict.length : 36
                    this.__radix__ = !this.__rfc__ && +uuidDict.radix ? uuidDict.radix : statics.CHARS.length
                }
              , uuid: function(){
                    return invoke(statics.uuid, [this.__length__, this.__radix__, arguments[0]], this)
                }
            }
        })


      , EventEmitter = ns.EventEmitter = klass({
            constructor: function(){
                var emitHandler = isInvocable(arguments[0]) ? arguments[0] : null
                  , emit = emitHandler && function(emitter){
                        return function(){
                            return invoke(emitter.emit, arguments, emitter)
                        }
                    }(this)

                if ( emitHandler )
                  invoke(emitHandler, { $emit: emit, 0: emit, length:1 })
            }

          , emit: function(){
                var events = this.__events__ || {}
                  , pipes = this.__eventPipes__ || []
                  , type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , invoker = new Invoker({$e: { type: type, timestamp: +(new Date), emitter: this } })
                  , args = arguments.length > 1 ? slice(arguments, 1) : []
                  , i, l
                  , handlers = events[type], _arr

                if ( type === "error" )
                  if ( arguments[1] instanceof Error )
                    throw arguments[1]
                  else if ( typeof arguments[1] == "string" )
                    throw new Error(arguments[1])

                if ( handlers )
                  if ( isInvocable(handlers.handleEvent) )
                    invoker.invoke(handlers.handleEvent, args, handlers)
                  else if ( !isArray(handlers) )
                    invoker.invoke(handlers, args, this)
                  else for ( _arr = [].concat(handlers), i = 0, l = _arr.length; i < l; i++ )
                    if ( isInvocable(_arr[i].handleEvent) )
                      invoker.invoke(_arr[i].handleEvent, args, _arr[i])
                    else
                      invoker.invoke(_arr[i], args, this)
            }

          , on: function(){
                if ( arguments.length == 1 && isObject(arguments[0]) )
                  return function(ee, handlers, k){
                      for ( k in handlers ) if ( handlers.hasOwnProperty(k) )
                          ee.on(k, handlers[k])
                  }(this, arguments[0])

                var events = this.__events__ = this.__events__ || {}
                  , type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , handler = isEventable(arguments[1]) ? arguments[1] : function(){}
                  , handlers = events[type]

                if ( !handlers || handlers === Object.prototype[type] )
                  events[type] = handler
                else if ( isArray(handlers) )
                  handlers.push(handler)
                else
                  events[type] = [handlers, handler]
            }
          , once: function(){
                if ( arguments.length == 1 && isObject(arguments[0]) )
                  return function(ee, handlers, k){
                      for ( k in handlers ) if ( handlers.hasOwnProperty(k) )
                        ee.once(k, handlers[k])
                  }(this, arguments[0])

                var type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , handler = isEventable(arguments[1]) ? arguments[1] : function(){}

                this.on(type, function(self){
                    return function f(){
                        if ( handler.handleEvent )
                          invoke(handler.handleEvent, arguments, handler)
                        else
                          invoke(handler, arguments)

                        self.off(type, f)
                    }
                }(this))
            }
          , off: function(){
                if ( arguments.length == 1 && isObject(arguments[0]) )
                  return function(ee, handlers, k){
                      for ( k in handlers ) if ( handlers.hasOwnProperty(k) )
                        ee.off(k, handlers[k])
                  }(this, arguments[0])

                var events = this.__events__ || {}
                  , type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , handler = arguments[1] == "*" ? function(){ delete events[type] }()
                            : isEventable(arguments[1]) ? arguments[1]
                            : function(){}
                  , handler = arguments[1] == "*" ? function(){ delete events[type] }()
                            : isEventable(arguments[1]) ? arguments[1] : function(){}
                  , handlers = events[type]
                  , idx

                if ( handlers )
                  if ( handlers === handler )
                    delete events[type]
                  else if ( isArray(handlers) ) {
                      while ( handlers && (idx = indexOf(handlers, handler), idx > -1) )
                          events[type].splice(idx, 1)

                      if ( !events[type].length )
                        delete events[type]
                  }
            }

          , listeners: function(){
                var events = this.__events || {}
                  , type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , handlers = events[type]

                return isArray(handlers) ? [].concat(handlers) : handlers ? [handlers] : []
            }
        })


      , Promise = ns.Promise = klass(function(Super, statics){
            statics.PENDING = PENDING
            statics.RESOLVED = RESOLVED
            statics.REJECTED = REJECTED

            statics.group = function(){
                var fns = isArray(arguments[0]) ? arguments[0]
                        : slice(arguments)
                  , i = 0, l = fns.length

                return function(){
                    return new Promise(function(args){
                            return function(resolve, reject, progress){
                                var done = 0
                                  , errors = 0
                                  , _yield = []
                                  , ondone = function(){
                                        if ( errors.length )
                                          invoke(reject, _yield)
                                        else
                                          invoke(resolve, _yield)
                                    }

                                for ( ; i < l; i++ )
                                  void function( fn, idx ){

                                    if ( fn && typeof fn.then != "function" )
                                      new Promise(function(resolve){
                                          var rv =  invoke(fn, args)

                                          if ( rv && typeof rv.then == "function" )
                                            fn = rv
                                          else {
                                            _yield[idx] = rv

                                            if ( ++done == l )
                                              ondone()
                                          }
                                      })

                                    if ( fn && typeof fn.then == "function" )
                                      fn.then(function(){
                                          var args = slice(arguments)
                                          _yield[idx] = args.length > 1 ? args : args[0]

                                          if ( ++done == l )
                                            ondone()

                                      }, function(){
                                          var args = slice(arguments)
                                          errors++
                                          _yield[idx] = args.length > 1 ? args : args[0]

                                          if ( ++done == l )
                                            ondone()
                                      })

                                  }( fns[i], i )

                            }
                        }(arguments))
                }

            }

            statics.sequence = function(){
                var fns = isArray(arguments[0]) ? arguments[0]
                        : slice(arguments)
                  , l = fns.length

                return function(){
                    var promise = new Promise(function(args){
                            return function(resolve){
                                invoke(resolve, args)
                            }
                        }(arguments))
                      , output = promise
                      , i = 0

                    for ( ; i < l; i++ )
                      output = output.then(fns[i])

                    return output
                }
            }


            return {
                constructor: function(){
                    var resolveHandler = isInvocable(arguments[0]) ? arguments[0] : null
                      , resolve = resolveHandler && function(promise){
                            return function(){
                                return invoke(promise.resolve, arguments, promise)
                            }
                        }(this)
                      , reject = resolveHandler && function(promise){
                            return function(){
                                return invoke(promise.reject, arguments, promise)
                            }
                        }(this)
                      , progress = resolveHandler && function(promise){
                            return function(){
                                  return invoke(promise.progress, arguments, promise)
                            }
                        }(this)

                    if ( resolveHandler )
                      invoke(resolveHandler, { $resolve: resolve, $reject: reject, $progress: progress, 0: resolve, 1: reject, 2: progress, length: 3 })
                }
              , __promiseState__: PENDING
              , then: function(){
                    var onresolve = arguments[0] && isInvocable(arguments[0].handleResolve) ? arguments[0]
                                  : isInvocable(arguments[0]) ? arguments[0]
                                  : null
                      , onreject = arguments[0] && isInvocable(arguments[0].handleReject) ? arguments[0]
                                 : isInvocable(arguments[1]) ? arguments[1]
                                 : null
                      , onprogress = arguments[0] && isInvocable(arguments[0].handleProgress) ? arguments[0]
                                   : isInvocable(arguments[2]) ? arguments[2]
                                   : null

                      , oPromise = new Promise
                      , output = oPromise
                      , rv

                    if ( this.__promiseState__ != statics.PENDING ) {

                        if ( this.__promiseState__ == statics.RESOLVED && onresolve )
                          if ( onresolve.handleResolve )
                            rv = invoke(onresolve.handleResolve, this.__promiseYield__, this)
                          else
                            rv = invoke(onresolve, this.__promiseYield__, this)

                        if ( this.__promiseState__ == statics.REJECTED && onreject )
                          if ( onreject.handleReject )
                            rv = invoke(onreject.handleReject, this.__promiseYield__, this)
                          else
                            rv = invoke(onreject, this.__promiseYield__, this)

                        if ( rv && typeof rv.then == "function")
                          output = rv

                        if ( this.__promiseState__ == statics.REJECTED )
                          invoke(output.reject, [rv], output)

                        if ( this.__promiseState__ == statics.RESOLVED )
                          invoke(output.resolve, [rv], output)

                    } else {

                        if ( onresolve )
                          (this.__onresolve__ = this.__onresolve__ || []).push(function(promise){
                              return function(){
                                  if ( onresolve.handleResolve)
                                    rv = invoke(onresolve.handleResolve, promise.__promiseYield__, promise)
                                  else
                                    rv = invoke(onresolve, promise.__promiseYield__, promise)

                                  if ( rv && typeof rv.then == "function" )
                                    rv.then(function(){
                                        invoke(output.resolve, arguments, output)
                                    })
                                  else
                                    invoke(output.resolve, [rv], output)
                              }
                          }(this))

                        if ( onreject )
                          (this.__onreject__ = this.__onreject__ || []).push(function(promise){
                              return function(){
                                  if ( onreject.handleReject )
                                    rv = invoke(onreject.handleReject, promise.__promiseYield__, promise)
                                  else
                                    rv = invoke(onreject, promise.__promiseYield__, promise)

                                  if ( rv && typeof rv.then == "function" )
                                    rv.then(function(){
                                        invoke(output.reject, arguments, output)
                                    })
                                  else
                                    invoke(output.reject, [rv], output)
                              }
                          }(this))

                        if ( onprogress )
                          (this.__onprogress__ = this.__progress__ || []).push(function(promise){
                              return function(){
                                  if ( onprogress.handleProgress )
                                    invoke(onprogress.handleProgress, arguments, promise)
                                  else
                                    invoke(onprogress, arguments, promise)
                                  invoke(output.progress, arguments, output)
                              }
                          }(this))

                    }

                    return output
                }
              , resolve: function(){
                    if ( this.__promiseState__ != statics.PENDING )
                      throw new Error("sleipnir.Promise.resolve: can't alter a promise state")

                    this.__promiseYield__ = slice(arguments)

                    this.__promiseState__ = statics.RESOLVED

                    while( this.__onresolve__ && this.__onresolve__.length > 0 )
                      invoke(this.__onresolve__.shift())
                }
              , reject: function(){
                    if ( this.__promiseState__ != statics.PENDING )
                      throw new Error("sleipnir.Promise.reject: can't alter a promise state")

                    this.__promiseYield__ = slice(arguments)

                    this.__promiseState__ = statics.REJECTED

                    while( this.__onreject__ && this.__onreject__.length > 0 )
                      invoke(this.__onreject__.shift())
                }
              , progress: function(){
                    var progressHandlers, i, l

                    if ( this.__promiseState__ != statics.PENDING )
                      throw new Error("sleipnir.Promise.reject: can't alter a promise state")

                    for ( progressHandlers = this.__onprogress__ ? [].concat(this.__onprogress__) : [], i = 0, l = progressHandlers.length; i < l; i++ )
                      invoke(progressHandlers[i], arguments)
                }
            }
        })


    , Iterator = ns.Iterator = klass({
          constructor: function(){
              var opt_keys = !!arguments[1]
                , keys = enumerate(arguments[0])
                , i = 0, l = keys.length

              this.__pointer__ = -1
              this.__range__ = []

              for ( ; i < l; i++ )
                this.__range__[i] = opt_keys ? [ keys[i] ] : [ keys[i], typeof arguments[0] == "string" ? arguments[0].charAt(keys[i]) : arguments[0][keys[i]] ]
          }
        , next: function(){
              var idx = ++this.__pointer__

              if ( idx == (this.__range__ = this.__range__ || []).length )
                return null
              else if ( idx > this.__range__.length )
                throw new Error

              return this.__range__[idx]
          }
      })


    , Router = ns.Router = klass(function(Super, statics){
          statics.defaultDispatcher = function(cache){
              function getRule(str, regexp, assignments, split, i, l){
                  if ( !cache.hasOwnProperty(str) )
                    if ( str.indexOf(":") == -1 )
                      cache[str] = new RegExp(str)
                    else {
                      for ( assignments = [], regexp = [], split = str.split("/"), i = 0, l = split.length; i < l; i++ )
                        if ( split[i].charAt(0) === ":" )
                          assignments.push(split[i].slice(1)),
                          regexp.push("([^\\\/]*)")
                        else
                          regexp.push(split[i])

                      cache[str] = new RegExp(regexp.join("\\\/"))

                      if ( assignments.length )
                        cache[str].assignments = assignments
                    }

                  return cache[str]
              }

              return function(route, path, rule, match, res, i, l){
                  rule = getRule(route)
                  i = 0
                  l = (rule.assignments||[]).length
                  match = path.match( rule )

                  if ( !match )
                    return false

                  if ( match.length == 1 )
                    return true

                  for ( res = {}; i < l; i++ )
                    res[rule.assignments[i]] = match[i+1]

                  return res
              }
          }( {} )

          return {
              constructor: function(){
                  this.__routesDisptacher__ = typeof arguments[arguments.length-1] == "function" ? arguments[arguments.length-1] : null

                  if ( isObject(arguments[0]) )
                    this.when(arguments[0])
              }
            , when: function(){
                  this.__routes__ = this.__routes__ || {}

                  var route, handler

                  if ( arguments.length == 1 )
                    return function(router, routes, k, i, l){
                        for ( k = enumerate(routes), i = 0, l = k.length; i < l; i++ )
                          router.when(k[i], routes[k[i]])
                    }(this, arguments[0])

                  handler = isRoutable(arguments[1]) ? arguments[1] : function(){}

                  route = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])

                  if ( !this.__routes__[route] || this.__routes__[route] === Object.prototype[route] )
                    this.__routes__[route] = handler
                  else if ( isArray(this.__routes__[route]) )
                    this.__routes__[route].push(handler)
                  else
                    this.__routes__[route] = [this.__routes__[route], handler]
              }
            , unwhen: function(){
                  this.__routes__ = this.__routes__ || {}

                  var route, handler, idx

                  if ( arguments.length == 1 )
                    return function(router, routes, k, i, l){
                        for ( k = enumerate(routes), i = 0, l = k.length; i < l; i++ )
                          router.when(k[i], routes[k[i]])
                    }(this, arguments[0])

                  handler = isRoutable(arguments[1]) ? arguments[1] : function(){}

                  route = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])

                  if ( this.__routes__[route] === handler )
                    delete this.__routes__[route]
                  else if ( isArray(this.__routes[route]) )
                    while ( this.__routes[route] && (idx = indexOf(this.__routes[route], handler), idx > -1) ) {
                        this.__routes__[route].splice(idx, 1)

                        if ( !this.__routes__[route].length )
                          delete this.__routes[route]
                    }
              }
            , dispatch: function(){
                  var route = arguments[0]
                    , args = slice(arguments, 1)
                    , iterator = new Iterator(this.__routes__)
                    , _next, _hit
                    , hits = 0
                    , rv
                    , handle = function(router){
                          return function(ite){
                              var handler = ite[1]
                                , i, l

                              if ( !isArray(handler) ) {
                                if ( ite[0] !== "*" )
                                  hits++

                                _next = next
                                rv = invoke(handler.handleRoute||handler, function(o, i, l){
                                          o = { $req: route, $res: _hit, $args: args.slice(0), $next: _next, 0: _hit }
                                          for ( i = 0, l = args.length; i < l; i++ )
                                            o[i+1] = args[i]
                                          o[i+1] = _next
                                          o.length = l+2
                                          return o
                                      }(), handler.handleRoute?handler:null) || rv

                                return typeof rv == "undefined" ? hits : rv
                              } else {
                                  i = -1
                                  l = handler.length -1

                                  _next = function(){
                                      if ( ite[0] !== "*" )
                                        hits++

                                      if ( ++i >= l )
                                        _next = next

                                      rv = invoke(handler[i].handleRoute||handler[i], function(o, i, l){
                                                o = { $req: route, $res: _hit, $args: args.slice(0), $next: _next, 0: _hit }
                                                for ( i = 0, l = args.length; i < l; i++ )
                                                  o[i+1] = args[i]
                                                o[i+1] = _next
                                                o.length = l+2
                                                return o
                                            }(), handler[i].handleRoute?handler[i]:null) || rv

                                      return typeof rv == "undefined" ? hits : rv
                                  }

                                  return _next()
                              }
                          }
                      }(this)
                    , next = function(router){
                          return function(){
                              var ite = iterator.next()

                              if ( ite == null )
                                return hits

                              _hit = ite[0] === "*" ? true
                                  : invoke( router.__routesDispatcher__||statics.defaultDispatcher, [ite[0], route, args], router )

                              if ( !_hit )
                                return next()
                              return handle(ite)
                          }
                      }(this)

                  return next()
              }
          }
      })


    , Model = ns.Model = klass(EventEmitter, function(Super, statics){
          function buildFromHash(model, items, root){
              var keys = enumerate(items)
                , i = 0, l = keys.length
                , root = !!root ? root+"." : ""

              for ( ; i < l; i++ )
                model.setItem(root+keys[i], items[keys[i]])
          }

          function buildFromString(model, items){
              var hash

              try {
                  hash = JSON.parse(items)
              } catch(e){
                  try {
                      hash = model.__useSerializer__.objectify(items)
                  } catch(e){
                      hash = {}
                  }
              }

              return buildFromHash(model, hash)
          }

          return {
              constructor: function(){
                  if ( arguments[0] )
                    this.setItem(arguments[0])

                  if ( this.__defaults__ )
                    this.setItem(this.__defaults__)
              }
            , __useSerializer__: Serializer
            , useSerializer: function(){
                  if ( arguments[0] && Serializer.isImplementedBy(arguments[0].prototype) )
                    return this.__useSerializer__ = arguments[0], true
                  return false
              }
            , initModel: function(){
                  this.__modelState__ = INIT
              }
            , setItem: function(){
                  var key, value, hook, ov, added

                  if ( arguments.length == 1 )
                    return function(model, items){
                        if ( typeof items == "string" )
                          buildFromString(model, items)
                        else if ( isObject(items) )
                          buildFromHash(model, items)
                    }(this, arguments[0])

                  key = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])

                  value = arguments[1]
                  while ( isInvocable(value) ) {
                      value = invoke(value, [this])
                  }

                  hook = ( this.__modelHooks__ || {}).hasOwnProperty(key) ? this.__modelHooks__[key] : null
                  ov = (this.__data__ = this.__data__ || {}).hasOwnProperty(key) ? this.__data__[key] : void 0

                  if ( isInvocable(hook) )
                    value = invoke(hook, [value])

                  if ( isObject(value) )
                    return buildFromHash(this, value, key)

                  if ( isArray(value) )
                    value = JSON.parse(JSON.stringify(value))

                  if ( !this.__data__.hasOwnProperty(key) )
                    added = true

                  this.__data__[key] = value

                  if ( added )
                    this.emit("add>"+key, value),
                    this.emit("add", key, value)

                  this.emit("change>"+key, value, ov)
                  this.emit("change", key, value, ov)

                  if ( this.__modelState__ & INIT ) {
                    if ( indexOf( (this.__lastUpdatedKeys__ = this.__lastUpdatedKeys__ || []), key ) == -1 )
                      this.__lastUpdatedKeys__.push(key)

                    clearTimeout(this.__lastUpdateTimer__)
                    this.__lastUpdateTimer__ = setTimeout(function(model){
                        return function(){
                            model.emit("update", model.__lastUpdatedKeys__.splice(0, model.__lastUpdatedKeys__.length))
                        }
                    }(this), 4)
                  }

                  this.initModel()
              }
            , getItem: function(){
                  var args = slice(arguments)
                    , getHandler = isThenable(args[args.length-1]) ? args.pop() : null
                    , output
                    , keys, i, l, hits

                  this.__data__ = this.__data__ || {}

                  if ( isArray(args[0]) )
                    keys = args[0]
                  else
                    keys = args

                  for ( hits = [], i = 0, l = keys.length; i < l; i++ )
                    hits[i] = this.__data__[ (typeof keys[i] == "string" ? keys[i] : toType(keys[i])) ]

                  if ( getHandler ) {
                    output = new Promise(function(resolve){
                        invoke(resolve, hits)
                    })
                    output.then(getHandler)

                    return output
                  }

                  return hits.length > 1 ? hits : hits[0]
              }
            , removeItem: function(){
                  var key, hit, ov

                  if ( arguments.length > 1 )
                    return function(model, keys, i, l){
                        for ( i = 0, l = keys.length; i < l; i++ )
                          model.removeItem(keys[i])
                    }(this, slice(arguments))

                  key = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  hit = (this.__data__||{}).hasOwnProperty(key)

                  if ( !hit )
                    return false

                  delete ( this.__data__[key] )
                  this.emit("remove>"+key)
                  this.emit("remove", key)

                  if ( indexOf( (this.__lastUpdatedKeys__ = this.__lastUpdatedKeys__ || []), key ) == -1 )
                      this.__lastUpdatedKeys__.push(key)

                    clearTimeout(this.__lastUpdateTimer__)
                    this.__lastUpdateTimer__ = setTimeout(function(model){
                        return function(){
                            model.emit("update", model.__lastUpdatedKeys__.splice(0, model.__lastUpdatedKeys__.length))
                        }
                    }(this), 4)

                  return true
              }
            , hookItem: function(){
                  var key, handler
                  this.__modelHooks__ = this.__modelHooks__ || {}

                  if ( arguments.length == 1 && isObject(arguments[0]) )
                    return function(model, hooks, k){
                        for ( k in hooks ) if ( hooks.hasOwnProperty(k) )
                          model.hookItem(k, hooks[k])
                    }(this, arguments[0])

                  key = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  handler = isInvocable(arguments[1]) ? arguments[1] : function(){}

                  this.__modelHooks__[key] = handler
              }
            , serialize: function(){
                  return unescape(this.__useSerializer__.serialize(this.__data__))
              }
          }
      })

    , Collection = ns.Collection = klass(EventEmitter, function(Super, statics){
          statics.modelsSerializer = new Serializer({ delimiter: ":", separator: "|" })

          return {
              constructor: function(){
                  if ( arguments.length )
                    invoke(this.addModel, arguments, this)
              }
            , __useModel__: Model
            , __useSerializer__: statics.modelsSerializer
            , useModel: function(){
                  if ( arguments[0] && Model.isImplementedBy(arguments[0].prototype) )
                    return this.__useModel__ = arguments[0], true
                  return false
              }
            , useSerializer: function(){
                  if ( arguments[0] && Serializer.isImplementedBy(arguments[0].prototype) )
                    return this.__useSerializer__ = arguments[0], true
                  return false
              }
            , addModel: function(){
                  this.__models__ = this.__models__ || []

                  var adds, i, l, m

                  if ( !arguments.length )
                    return false
                  else if ( arguments.length > 1 )
                    adds = slice(arguments)
                  else
                    if ( isArray(arguments[0]) )
                      adds = arguments[0]
                    else
                      adds = [arguments[0]]

                  for ( i = 0, l = adds.length; i < l; i++ ) {

                    m = Model.isImplementedBy(adds[i]) && indexOf( this.__models__, adds[i]) == -1 ? adds[i]
                      : isObject(adds[i]) && new this.__useModel__(adds[i])

                    if ( m )
                      this.__models__.push(m)

                    m.on("update", function(collection){
                        return function onupdate(keys){
                            if ( indexOf(collection.__models__, adds[i]) == -1 )
                              return m.off("update", onupdate)

                            collection.emit("update", m, keys)
                        }
                    }( this ))
                  }

                  return true
              }
            , removeModel: function(){
                  var idx, model

                  if ( arguments.length > 1 )
                    return function(collection, models, i, l){
                        for ( i = 0, l = models.length; i < l; i++ )
                          collection.removeModel(models[i])
                    }(this, slice(arguments))

                  model = arguments[0] && Model.isImplementedBy(arguments[0]) ? arguments[0] : null

                  if ( !model || (idx = indexOf((this.__models__ || []), model) == -1) )
                    return false

                  this.__models__.splice(idx, 1)
                  return true
              }
            , sort: function(){
                  this.__models__ = this.__models__ || []
                  invoke(this.__models__.sort, arguments, this.__models__)
              }
            , find: function(){
                  var hits = [], attributes = [], queries = []
                    , i, l

                  this.__models__ = this.__models__ || []

                  if ( !arguments.length )
                    return hits

                  if ( arguments[0] === "*" )
                    return [].concat(this.__models__)

                  if ( arguments.length > 1 )
                    attributes.concat(slice(arguments))
                  else if ( isArray(arguments[0]) )
                    attributes.concat(arguments[0])
                  else
                    attributes.push(arguments[0])

                  for ( i = 0, l = attributes.length; i < l; i++ )
                    void function( attr, keys, i, l ){
                        for ( i = 0, l = keys.length; i < l; i++ )
                          queries.push( { key: keys[i], value: attr[keys[i]] } )
                    }( attributes[i], enumerate(attributes[i]) )

                  for ( i = 0, l = this.__models__.length; i < l; i++ )
                    if ( function(model){
                        var i, l, hits = 0

                        for ( i = 0, l = queries.length; i < l; i++ ) {
                            if ( typeof queries[i].value == "function" ? queries[i].value(model.getItem(queries[i].key)) : model.getItem(queries[i].key) === queries[i].value )
                              hits++
                        }

                        if ( hits === l )
                          return true
                        return false
                    }(this.__models__[i]) )
                      hits.push(this.__models__[i])

                  return hits
              }
            , subset: function(){
                  return new this.constructor( invoke(this.find, arguments, this) )
              }
            , serialize: function(){
                  var serialized = {}
                    , i, l

                  for ( this.__models__ = this.__models__ || [], i = 0, l = this.__models__.length; i < l; i++ )
                    serialized[i] = this.__models__[i].serialize()

                  return unescape(this.__useSerializer__.serialize(serialized))
              }
          }
      })



    , cssHooks = ns.cssHooks = function(cssProperties, hooks){
          function check(p){
              return (COMPUTED_STYLE_COMPAT ? cssProperties.getPropertyValue(p) : cssProperties[p]) != void 0
          }

          hooks = {}

          void function(w3c, webkit){
              if ( !check(w3c) && check(webkit) )
                hooks[w3c] = function(v){
                    return [{ key: webkit, value: v }]
                }
          }("transform", "-webkit-transform")

          return hooks
      }( COMPUTED_STYLE_COMPAT ? getComputedStyle(document.createElement("div")) : document.documentElement.currentStyle )

    , Cookie = ns.Cookie = klass(Model, function(Super, statics, defaultLifespan){
          defaultLifespan = 15552000000

          return {
              constructor: function(){
                  var args = slice(arguments)
                    , cookieHandler = isInvocable(args[args.length-1]) ? args.pop() : null
                    , cookieDict = isObject(args[args.length-1]) ? args.pop() : ""
                    , exist

                  this.__cookieName__ = typeof args[args.length-1] == "string" ? args.shift() : toType(args.shift())
                  this.__cookieLifespan__ = typeof cookieDict.maxAge == "number" ? cookieDict.maxAge : null
                  this.__cookieSession__ = !!cookieDict.session

                  this.__cookieDomain__ = typeof cookieDict.domain == "string" ? cookieDict.domain : "."+TOP_DOMAIN
                  this.__cookiePath__ = typeof cookieDict.path == "string" ? cookieDict.path : "/"
                  this.__cookieExpiration__ = !!cookieDict.session ? ""
                                            : !isNaN(+(new Date(cookieDict.expires))) ? new Date(cookieDict.expires).toUTCString()
                                            : new Date( +(new Date) + this.__cookieLifespan__ ).toUTCString()

                  if ( exist = document.cookie.match(name+"=([^;]*)"), exist )
                    this.setItem(exist[1])

                  if ( cookieHandler )
                    void function(cookie){
                          function set(){ return invoke(cookie.setItem, arguments, cookie) }
                          function get(){ return invoke(cookie.getItem, arguments, cookie) }

                          invoke(cookieHandler, { $set: set, $get: get, 0: set, 1: get, length: 2 })
                    }( this )

                  this.initModel()
                  this.on("update", function(cookie){
                      return function(){ cookie.sync() }
                  }( this ))
              }
            , sync: function(){
                  document.cookie = [this.__cookieName__, "=", this.serialize(), "; domain=", this.__cookieDomain__, "; path=", this.__cookiePath__, "; expires =", this.__cookieExpriration__, ";"].join("")
                  this.emit("sync")
              }
            , clear: function(){
                  var k

                  for ( k in (this.__data__= this.__data__||{}) ) if ( this.__data__.hasOwnProperty(k) )
                    this.removeItem(k)
              }
          }
      })

    , LocalStore = ns.LocalStore = klass(Model, function(Super, statics){

          return {
              constructor: function(){

              }
          }
      })

    , Store = ns.Store = klass({})

    , Service = ns.Service = klass(function(Super, statics){
          statics.defaultRequestHandler = function(status, request){
              return new Promise(function(resolve, reject){
                  if ( status >= 400 )
                    reject(status, request)
                  else
                    resolve(status, request)
              })
          }

          return {
              constructor: function(){
                  invoke(this.initService, arguments, this)
              }
            , initService: function(){
                  var args = slice(arguments)
                    , servDict

                  this.__serviceDefaultRequestHandler__ = isThenable(args[args.length-1]) ? args.pop() : null
                  servDict = isObject(args[args.length-1]) ? args.pop() : { url: args.pop() }

                  this.__serviceType__ = typeof servDict.type == "string" ? servDict.type : "GET"
                  this.__serviceUrl__ = typeof servDict.url == "string" ? servDict.url : toType(servDict.url)
                  this.__serviceSync__ = !!servDict.sync
                  this.__serviceUser__ = typeof servDict.user == "string" ? servDict.user : null
                  this.__servicePassword__ = typeof servDict.password == "string" ? servDict.password : null
                  this.__serviceTimeout__ = typeof servDict.timeout == "number" ? servDict.timeout : 0
                  this.__serviceRequestHeaders = isObject(servDict.headers) ? servDict.headers : {}
                  this.__serviceOverrideMimeType__ = typeof servDict.overrideMimeType == "string" ? servDict.overrideMimeType : null
                  this.__serviceResponseType__ = typeof servDict.responseType == "string" ? servDict.responseType : null
              }
            , requestType: function(){
                  if ( !arguments.length )
                    return this.__serviceType__ = this.__serviceType__ || "GET"

                  this.__serviceType__ = typeof arguments[0] == "string" ? arguments[0] : "GET"
              }
            , requestUrl: function(){
                  if ( !arguments.length )
                    return this.__serviceUrl__ = this.__serviceUrl__ || ""

                  this.__serviceUrl__ = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
              }
            , requestAsync: function(v){
                  if ( !arguments.length )
                    return this.__serviceSync__ = this.__serviceSync__ || false
                  this.__serviceSync__ = !arguments[0]
              }
            , requestCredentials: function(){
                  var user, password

                  if ( !arguments.length ) {
                    user = this.__serviceUser__ = this.__serviceUser__ || null
                    password = this._servicePassword__ = this.__servicePassword || null
                    return { user: user, password: password }
                  }

                  this.__serviceUser__ = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  this.__servicePassword__ = typeof arguments[1] == "string" ? arguments[1] : toType(arguments[1])
              }
            , requestTimeout: function(){
                  var buff

                  if ( !arguments.length )
                    return this.__serviceTimeout__ = this.__serviceTimeout__ || 0

                  this.__serviceTimeout__ = typeof arguments[0] == "number" ? arguments[0] : (buff = parseInt(arguments[0], 10), !isNaN(buff) ? buff : 0)
              }
            , requestHeaders: function(){
                  if ( !arguments.length )
                    return this.__serviceRequestHeaders__ = this.__serviceRequestHeaders__ || {}

                  this.__serviceRequestHeader__ = isObject(arguments[0]) ? arguments[0] : {}
              }
            , requestMimeType: function(){
                  if ( !arguments.length )
                    return this.__serviceOverrideMimeType__ = this.__serviceOverrideMimeType__ || null

                  this.__serviceOverrideMimeType__ = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
              }
            , requestResponseType: function(){
                  if ( !arguments.length )
                    return this.__serviceResponseType__ = this.__serviceResponseType__ || null

                  this.__serviceResponseType__ = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
              }
            , requestDefaultHandler: function(){
                  if ( !arguments.length )
                    return this.__serviceDefaultRequestHandler__ || statics.defaultRequestHandler

                  if ( isThenable(arguments[0]) )
                    this.__serviceDefaultRequestHandler__ = arguments[0]
              }
            , request: function(){
                  var args = slice(arguments)
                    , requestHandler = isThenable(args[args.length-1]) ? args.pop() : statics.defaultRequestHandler
                    , requestBody = args[0] && (Model.isImplementedBy(args[0])||Collection.isImplementedBy(args[0])) ? args.shift().serialize()
                                  : isObject(args[0]) ? Serializer.serialize(args.shift())
                                  : typeof args[0] == "string" ? args.shift()
                                  : null
                    , requestUrl = this.__serviceType__ !== "GET" ? this.__serviceUrl__ : function(url){
                          if ( requestBody )
                            url = url+"?"+requestBody
                          requestBody = null

                          return url
                      }( this.__serviceUrl__ )
                    , requestHeaders = isObject(args[0]) ? args.shift() : {}
                    , output = new Promise(function(service){
                          return function(resolve, reject, request, k){

                              request = XHR_COMPAT & 1 ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP")

                              if ( service.__ongoingxhrrequest__ )
                                service.__ongoingxhrrequest__.abort()
                              service.__ongoingxhrrequest__ = request

                              request.open(service.__serviceType__, requestUrl, !service.__sync__, service.__servuceUser__, service.__servicePassword__)
                              request.timeout = service.__timeout__

                              for ( k in service.__serviceRequestHeaders__ ) if ( service.__serviceRequestHeaders__.hasOwnProperty(k) )
                                request.setRequestHeader(k, service.__serviceRequestHeaders__[k])

                              for ( k in requestHeaders ) if ( requestHeaders.hasOwnProperty(k) )
                                request.setRequestHeader(k, requestHeaders[k])

                              if ( service.__serviceOverrideMimeType__ )
                                request.overrideMimeType(service.__serviceOverrideMimeType__)

                              request.onreadystatechange = function(){
                                  if ( request.readyState < 4)
                                    return

                                  if ( service.__ongoingxhrrequest__ === request  )
                                    service.__ongoingxhrrequest__ = null

                                  resolve(request.status, request)
                              }

                              request.ontimeout = function(){
                                  reject(new Error)
                              }

                              request.send(requestBody)
                          }
                      }( this ))

                  output = output.then(this.__serviceDefaultRequestHandler__||statics.defaultRequestHandler)

                  if ( requestHandler )
                    output.then(requestHandler)

                  return output
              }
          }
      })


    , nodeExpression = ns.nodeExpression = function(){
          var operators = {
                  "[^]": function type(stream, input, output){
                      var pile = input.pile
                        , node = pile === "text" ? document.createTextNode("") : document.createElement(pile||"div")
                        , autoAssignAs

                      output.tree.appendChild(node)

                      if ( node.tagName === "A" || node.tagName === "BUTTON" ) {
                        output.assignAs = output.assignAs || []

                        if ( indexOf(output.assignAs, pile) == -1 )
                          output.assignAs.push(node.tagName.toLowerCase())
                      }

                      input.context = node
                  }
                , "[$]": null
                , "#": function id(){
                      function write(node, rawId){
                          node.setAttribute("id", escapeHTML(rawId))
                      }

                      function set(node, rawId, model){
                          var vars = []
                            , hit, onupdate

                          while ( hit = (rtemplatevars.exec(rawId)||[])[1], hit )
                            if ( indexOf(vars, hit) == -1 )
                              vars.push(hit)

                          if ( vars.length )
                            onupdate = function(keys){
                                var i, l, hit, str = rawId, _val

                                for ( i = 0, l = keys.length; i < l; i++ )
                                  if ( indexOf(vars, keys[i]) != -1 ) {
                                      hit = true
                                      break
                                  }

                                if ( hit )
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    _val =  model.getItem(vars[i])

                                    if ( typeof _val !== "undefined" && _val !== null )
                                      str = str.replace("@"+vars[i]+"@", _val)
                                  }

                                write(node, str)

                                model.once("update", onupdate)
                            }, onupdate(vars)
                          else write(node, rawId)
                      }

                      return function(stream, input, output){
                          var pile = input.pile
                            , node = input.context

                          if ( node.nodeType !== 1 )
                            return

                          set(node, pile, input.data)
                      }
                  }()
                , ".": function className(){
                      function write(node, rawClassName, rawLastValue){
                          if ( !node.className.length )
                            node.className = escapeHTML(rawClassName)
                          else
                            if ( !rawLastValue )
                              node.className += " "+escapeHTML(rawClassName)
                            else
                              node.className = node.className.replace(escapeHTML(rawLastValue), escapeHTML(rawClassName))
                      }

                      function set(node, rawClassName, model){
                          var vars = []
                            , hit, onupdate
                            , lastValue

                            while ( hit = (rtemplatevars.exec(rawClassName)||[])[1], hit )
                              if ( indexOf(vars, hit) == -1 )
                                vars.push(hit)

                            if ( vars.length )
                              onupdate = function(keys){
                                  var i, l, hit, str = rawClassName, _val

                                  for ( i = 0, l = keys.length; i < l; i++ )
                                    if ( indexOf(vars, keys[i]) != -1 ) {
                                        hit = true
                                        break
                                    }

                                  if ( hit )
                                    for ( i = 0, l = vars.length; i < l; i++ ) {
                                      _val =  model.getItem(vars[i])

                                      if ( typeof _val !== "undefined" && _val !== null )
                                        str = str.replace("@"+vars[i]+"@", _val)
                                    }

                                  write(node, str, lastValue)
                                  lastValue = str

                                  model.once("update", onupdate)
                              }, onupdate(vars)
                            else write(node, rawClassName)
                      }

                      return function(stream, input, output){
                          var pile = input.pile
                            , node = input.context

                          if ( node.nodeType !== 1)
                            return

                          set(node, pile, input.data)
                      }
                  }()
                , "]": null
                , "[": function attribute(){
                      function write(node, rawAttr, rawValue){
                          node.setAttribute(escapeHTML(rawAttr), escapeHTML(rawValue))
                      }

                      function set(node, rawAttr, rawValue, model){
                          var vars = []
                            , hit, onupdate

                          while ( hit = (rtemplatevars.exec(rawValue)||[])[1], hit )
                            if ( indexOf(vars, hit) == -1 )
                              vars.push(hit)

                          if ( vars.length )
                            onupdate = function(keys){
                                var i, l, hit, str = rawValue, _val, rval

                                for ( i = 0, l = keys.length; i < l; i++ )
                                  if ( indexOf(vars, keys[i]) != -1 ) {
                                      hit = true
                                      break
                                  }

                                if ( hit )
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    _val =  model.getItem(vars[i])

                                    if ( typeof _val !== "undefined" && _val !== null )
                                      str = str.replace("@"+vars[i]+"@", _val)
                                  }

                                write(node, rawAttr, str)

                                model.once("update", onupdate)
                            }, onupdate(vars)
                          else write(node, rawAttr, rawValue)
                      }

                      return function(stream, input, output){
                          var pile = input.pile
                            , node = input.context
                            , idx = pile.search("=")
                            , key = pile.split("=")[0].replace(renclosingquotes, "")
                            , value = pile.slice(idx+1).replace(renclosingquotes, "")

                          if ( node.nodeType !== 1 )
                            return

                          set(node, key, value, input.data)

                          if ( "INPUT,BUTTON".indexOf(node.tagName) != -1 && (node.type == "submit"||node.value == "submit") ) {
                            output.assignAs = output.assignAs || []

                            if ( indexOf(output.assignAs, pile) == -1 )
                              output.assignAs.push("submit")
                          }
                      }
                  }()
                , "}": null
                , "{": function textContent(){
                      function write(node, rawTextContent){
                          var textNode

                          if ( node.nodeType == 1 ) {
                            textNode = document.createTextNode(rawTextContent)
                            if ( node.childNodes.length )
                              node.innerHTML = ""
                            node.appendChild(textNode)
                          }
                          else if ( node.nodeType == 3 )
                            node.nodeValue = rawTextContent
                      }

                      function set(node, rawTextContent, model){
                          var vars = []
                            , hit, onupdate

                          while ( hit = (rtemplatevars.exec(rawTextContent)||[])[1], hit )
                            if ( indexOf(vars, hit) == -1 )
                              vars.push(hit)

                          if ( vars.length )
                            onupdate = function(keys){
                                var i, l, hit, str = rawTextContent, _val

                                for ( i = 0, l = keys.length; i < l; i++ )
                                  if ( indexOf(vars, keys[i]) != -1 ) {
                                      hit = true
                                      break
                                  }

                                if ( hit )
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    _val =  model.getItem(vars[i])

                                    if ( typeof _val !== "undefined" && _val !== null )
                                      str = str.replace("@"+vars[i]+"@", _val)
                                  }

                                write(node, str)

                                model.once("update", onupdate)
                            }, onupdate(vars)
                          else write(node, rawTextContent)
                      }

                      return function(stream, input, output){
                          var pile = input.pile
                            , node = input.context

                          set(node, pile, input.data)
                      }
                  }()
                , "$" : function assignement(stream, input, output){
                      var pile = input.pile

                      output.assignAs = output.assignAs || []

                      if ( indexOf(output.assignAs, pile) == -1 )
                        output.assignAs.push(pile)
                  }
              }
            , read = function(stream, input, output){
                  var next, operand

                  try {
                    next = stream.next()
                  } catch(e){
                    if ( typeof operators["[$]"] == "function" )
                      invoke(operators["[$]"], arguments)
                    return output
                  }

                  if ( next === null )
                    operand = "[$]",
                    input.forceNextOperandAsSymbol = false
                  else
                    operand = next[1]

                  if ( !input.forceNextOperandAsSymbol && operators.hasOwnProperty(operand) ) {
                    if ( typeof operators[input.operator] == "function" )
                      invoke(operators[input.operator], arguments)

                    input.pile = ""
                    input.operator = operand
                  } else switch (operand){
                    case "\n":
                    case "\r":
                        break
                    case "\\" :
                        input.forceNextOperandAsSymbol = true
                        break
                    default:
                        input.pile += operand
                        input.forceNextOperandAsSymbol = false
                        break
                  }

                  return invoke(read, arguments)
              }

          return {
              parse: function(){
                  var args = slice(arguments)
                    , expression = typeof args[0] == "string" ? args.shift() : ""
                    , data = args[args.length-1] && (Model.isImplementedBy(args[args.length-1]) || Collection.isImplementedBy(args[args.length-1])) ? args.pop()
                           : isObject(args[args.length-1]) ? new Model(args.pop())
                           : new Model()
                    , stream
                    , output = { tree: document.createDocumentFragment() }
                    , input = { data: data, pile: "", operator: "[^]", context: output.tree }
                    , models, i, l, _fragment

                  if ( expression[0] == "*" ) {
                      expression = expression.slice(1)

                      if ( Collection.isImplementedBy(data) ) {
                        models = data.find("*")

                        for ( i = 0, l = models.length; i < l; i++ ) {
                          _fragment = nodeExpression.parse(expression, models[i])

                          if ( _fragment.assignAs )
                            output.assignAs = output.assignAs || _fragment.assignAs

                          output.tree.appendChild(_fragment.tree)
                        }

                        return output
                      }
                  }

                  stream = new Iterator(expression)

                  return invoke(read, [stream, input, output])
              }
          }
      }()

    , htmlExpression = ns.htmlExpression = function(){
          var operators = {
                  "[^]": function(stream, input, output){
                      return invoke(operators["+"], arguments)
                  }
                , "[$]": null
                , "+": function sibling(stream, input, output){
                      var pile = input.pile || null
                        , sub = pile && pile[0] !== "(" ? nodeExpression.parse(pile, input.data)
                              : pile && pile[0] === "(" ? htmlExpression.parse(pile.slice(1, pile.length-1), input.data)
                              : nodeExpression.parse("div")
                        , children = sub.tree.childNodes
                        , lastChild
                        , k, i, l

                      if ( sub.assignments )
                        for ( k in sub.assignments ) if ( sub.assignments.hasOwnProperty(k) ) {
                          output.assignments[k] = output.assignments[k] || []
                          output.assignments[k].concat(sub.assignments[k])
                        }

                      while ( children.length ) {
                        if ( sub.hasOwnProperty("assignAs") )
                          for ( i = 0, l = sub.assignAs.length; i <l; i++ )
                            output.assignments[sub.assignAs[i]] = output.assignments[sub.assignAs[i]] || [],
                            output.assignments[sub.assignAs[i]].push(children[0])

                        lastChild = children[0]
                        input.context.appendChild(children[0])
                      }

                      input.buffer = null
                  }
                , ">": function child(stream, input, output){
                      input.context = input.context.childNodes.length ? input.context.childNodes[input.context.childNodes.length-1] : input.context
                      invoke(operators["+"], arguments)
                  }
                , "^": function moveUp(stream, input, output){
                      if ( input.context.parentNode )
                        input.context = input.context.parentNode
                  }
              }
            , read = function(stream, input, output){
                  var next, operand, ignore = 0

                  try {
                    next = stream.next()
                  } catch(e){
                    if ( typeof operators["[$]"] == "function" )
                      invoke(operators["[$]"], arguments)
                    return output
                  }

                  if ( next === null )
                    operand = "[$]",
                    input.forceNextOperandAsSymbol = false,
                    input.capture = false
                  else
                    operand = next[1]

                  if ( !input.forceNextOperandAsSymbol &&  operand == "(" ) {
                    if ( input.capture )
                      ignore++
                    else
                      input.capture = true
                  }

                  if ( input.capture && !input.forceNextOperandAsSymbol && operand == ")" ) {
                      if ( ignore )
                        ignore--
                      else
                        input.capture = false
                  }

                  if ( !input.capture && !input.forceNextOperandAsSymbol && operators.hasOwnProperty(operand) ) {
                    if ( typeof operators[input.operator] == "function" )
                      invoke(operators[input.operator], arguments)

                    input.pile = ""
                    input.operator = operand

                  } else switch (operand){
                    case "\\":
                        input.pile += "\\"
                        input.forceNextOperandAsSymbol = true
                        break
                    default:
                        input.pile += operand
                        input.forceNextOperandAsSymbol = false
                  }

                  return invoke(read, arguments)
              }

          return {
              parse: function(){
                  var args = slice(arguments)
                    , expression = typeof args[0] == "string" ? args.shift() : ""
                    , data = args[args.length-1] && (Model.isImplementedBy(args[args.length-1])||Collection.isImplementedBy(args[args.length-1])) ? args.pop()
                           : isObject(args[args.length-1]) ? new Model(args.pop())
                           : new Model()
                    , stream = new Iterator(expression)
                    , output = { assignments: {}, tree: document.createDocumentFragment() }
                    , input = { data: data, pile: "", buffer: null, operator: "[^]", context: output.tree }

                  return invoke(read, [stream, input, output])
              }
          }
      }()

    , requestAnimationFrame = ns.requestAnimationFrame = function(){
          return "requestAnimationFrame" in root ? function(){ invoke(root.requestAnimationFrame, arguments) }
               : "mozRequestAnimationFrame" in root ? function(){ invoke(root.mozRequestAnimationFrame, arguments) }
               : "msRequestAnimationFrame" in root ? function(){ invoke(root.msRequestAnimationFrame, arguments) }
               : "webkitRequestAnimationFrame" in root ? function(){ invoke(root.webkitRequestAnimationFrame, arguments) }
               : function(fn){
                    return setTimeout(function(){
                        invoke(fn, [+(new Date)])
                    }, 4)
                 }
      }()

    , createCustomEvent = ns.createCustomEvent = function(){
          switch ( CUSTOM_EVENTS_COMPAT ) {
              case 8: return function(type, dict){
                  type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  dict = isObject(arguments[1]) ? arguments[1] : {}
                  return new CustomEvent(type, dict)
              }
              case 4: return function(type, dict, detail, event){
                  event = document.createEvent("CustomEvent")
                  type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  dict = isObject(arguments[1]) ? arguments[1] : {}
                  detail = isObject(dict.detail) ? dict.detail : {}

                  event.initCustomEvent(type, !!dict.bubbles, !!dict.cancelable, detail)
                  return event
              }
              case 2: return function(type, dict, detail, event){
                  event = document.createEvent("Event")
                  type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  dict = isObject(arguments[1]) ? arguments[1] : {}
                  detail = isObject(dict.detail) ? dict.detail : {}

                  event.initEvent(type, !!dict.bubbles, !!dict.cancelable, detail)
                  return event
              }
              case 1: return function(type, dict, detail, event){
                  event = document.createEventObject()
                  type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  dict = isObject(arguments[1]) ? arguments[1] : {}
                  detail = isObject(dict.detail) ? dict.detail : {}

                  event.type = type
                  event.propertyName = "__on"+type
                  event.cancelable = !dict.bubbles
                  event.returnValue = !!dict.cancelable
                  event.detaul = detail

                  return event
              }
              default: throw new Error
          }
      }()
    , dispatchCustomEvent = ns.dispatchCustomEvent = function(DE_COMPAT){
          return DE_COMPAT ? function(node, event){ return node.dispatchEvent(event) }
                           : function(node, event, now, then){
                                 if ( node === root )
                                   return domReady.then(function(nodes){
                                      invoke(dispatchCustomEvent, [nodes.body, event])
                                   }), undefined

                                 now = node[event.propertyName]

                                 setTimeout(function(){
                                     then = node[event.propertyName]

                                     if ( now === then )
                                       node[event.propertyName] = (parseInt(node[event.propertyName]||0, 10) + 1).toString()
                                 }, 4)
                             }
      }( "dispatchEvent" in root )
    , eventListenerHooks = function(toCloneProps){
          toCloneProps = [
              "screenX", "screenY", "clientX", "clientY", "pageX", "pageY", "layerX, layerY", "view"
            , "altKey", "ctrlKey", "shiftKey", "metaKey", "which"
            , "button", "buttons"
            , "touches"
          ]

          function redispatchEvent(e, node, type, ne, i, l){
              ne = createCustomEvent(type, { bubbles: e.bubbles, cancelable: e.cancelable, detail: e.detail })

              for ( i = 0, l = toCloneProps.length; i < l; i++ )
                ne[toCloneProps[i]] = e[toCloneProps[i]]

              ne.preventDefault = function(){ e.preventDefault() }
              ne.stopPropagation = function(){ e.stopPropagation() }
              ne.stopImmediatePropagation = function(){ e.stopImmediatePropagation() }
              ne.originalEvent = e

              dispatchCustomEvent(node, ne)
          }

          return {
              pointerdown: function(node){
                  if ( "onpointerdown" in node )
                    return

                  node.__pointerdownproxy__ = node.__pointerdownproxy__ || function(e){ redispatchEvent(e, node, "pointerdown") }
                  addEventListener(node, "MSPointerDown" in node ? "MSPointerDown" : "mousedown touchstart", node.__pointerdownproxy__, true)
              }
            , pointerup: function(node){
                  if ( "onpointerup" in node)
                    return

                  node.__pointerupproxy__ = node.__pointerupproxy__ || function(e){ redispatchEvent(e, node, "pointerup") }
                  addEventListener(node, "MSPointerUp" in node ? "MSPointerUp" : "mouseup touchend", node.__pointerupproxy__, true)
              }
            , pointermove: function(node){
                  if ( "onpointermove" in node)
                    return
                  node.__pointermoveproxy__ = node.__pointermoveproxy__ || function(e){ redispatchEvent(e, node, "pointermove") }
                  addEventListener(node, "MSPointerMove" in node ? "MSPointerMove" : "mousemove touchmove", node.__pointermoveproxy__, true)
              }
            , pointerenter: function(node, nevents){
                  if ( "onpointerenter" in node )
                    return
                  node.__pointerenterproxy__ = node.__pointerenterproxy__ || function(e){
                      if ( e.type === "mouseover" && contains(node, e.target) )
                        return
                      redispatchEvent(e, node, "pointerenter")
                  }
                  addEventListener(node, "MSPointerEnter" in node ? "MSPointerEnter" : ("onmouseenter" in root ? "mouseenter" : "mouseover") + "touchenter", node.__pointerenterproxy__, true)
              }
            , pointerleave: function(node){
                  if ( "onpointerleave" in node)
                    return
                  node.__pointerleaveproxy__ = node.__pointerleaveproxy__ || function(e){
                      if ( e.type === "mouseout" && contains(node, e.target) )
                        return
                      redispatchEvent(e, node, "pointerleave")
                  }
                  addEventListener(node, "MSPointerLeave" in node ? "MSPointerLeave" : ("onmouseleave" in root ? "mouseleave" : "mouseout") + "touchleave", node.__pointerleaveproxy__, true)
              }
          }
      }()

    , addEventListener = ns.addEventListener = function(AEL){
          return function(node, events, eventHandler, capture){
              var events = events.split(" ")
                , i = 0, l = events.length
                , hooked

              for ( ; i < l; i++ ) {

                  if ( eventListenerHooks.hasOwnProperty(events[i]) )
                    invoke(eventListenerHooks[events[i]], [node]),
                    hooked = true

                  if ( hooked && !AEL && node === root )
                    return domReady(function(nodes){
                        invoke(addEventListener, [nodes.body, events.join(" "), eventHandler])
                    }), void 0

                  AEL ? node.addEventListener(events[i], eventHandler, !!capture)
                      : node.attachEvent(function(i){
                            return "on" + ( hooked?"propertychange":events[i] )
                        }(i), function(i){
                            var fn = typeof eventHandler.handleEvent == "function" ? eventHandler.handleEvent : eventHandler

                            fn.__sleipnirEventListenerProxy__ = fn.__sleipnirEventListenerProxy__ || function(e){
                                var e = e || root.event, x = {}, k

                                if ( hooked && e.propertyName !== "__on"+events[i] )
                                  return

                                e.target = e.target || e.srcElement
                                e.relatedTarget = e.relatedTarget || e.fromElement
                                e.isImmediatePropagationStopped = e.isImmediatePropagationStopped || false
                                e.preventDefault = e.preventDefault || function(){
                                    e.returnValue = false
                                }

                                e.stopPropagation = e.stopPropagation || function(){
                                    e.cancelBubble = true
                                }

                                e.stopImmediatePropagation = e.stopImmediatePropagation || function(){
                                    e.stopPropagation()
                                    e.isImmediatePropagationStopped = true
                                }

                                if ( !e.isImmediatePropagationStopped ) {
                                    for ( k in e )
                                      x[k] = e[k]

                                    if ( typeof eventHandler.handleEvent == "function" )
                                      eventHandler.handleEvent.call(eventHandler, x)
                                    else
                                      eventHandler(x)
                                }
                            }

                            return fn.__sleipnirEventListenerProxy__
                        }(i))
              }

          }
      }( "addEventListener" in window )

    , removeEventListener = ns.removeEventListener = function(REL){
          return function(node, events, eventHandler, capture){
              var events = events.split(" ")
                , i = 0, l = events.length

              for ( ; i < l; i++ ) {

                  if ( !REL && eventListenerHooks.hasOwnProperty(events[i]) && node === root )
                      return domReady(function(nodes){
                          invoke(removeEventListener, [nodes.body, events.join(" "), eventHandler])
                      }), undefined

                  REL ? node.removeEventListener(events[i], eventHandler, !!capture)
                      : node.detachEvent("on"+events[i], function(){
                            var fn = typeof eventHandler.handleEvent == "function" ? eventHandler.handleEvent : eventHandler

                            return fn.__sleipnirEventListenerProxy__ || eventHandler
                        }())
              }
          }
      }( "removeEventListener" in window)

    , contains = ns.contains = function (a, b){
          return a.contains ? a != b && a.contains(b)
               : !!(a.compareDocumentPosition(b) & 16)
      }

    , domReady = ns.domReady = new Promise(function(resolve, reject){
          function onready(){
              if ( ready )
                return
              ready = 1

              docElt = document.documentElement || document.getElementByTagName("html")[0]
              docHead = document.head || document.getElementsByTagName("head")[0]
              docBody = document.body || document.getElementsByTagName("body")[0]

              resolve({
                  documentElement: docElt
                , head: docHead
                , body: docBody
                , title: function(title){
                      if ( title )
                        return title

                      title = document.createElement("title")
                      docHead.appendChild(title)
                      return title
                  }(document.getElementsByTagName("title")||[])[0]
                , viewport: function(metas, meta, i, l){
                      for ( i = 0, l = metas.length; i < l; i++ )
                        if ( metas[i].name == "viewport" )
                          return metas[i]

                      meta = document.createElement("meta")
                      meta.name = "viewport"
                      meta.content = ""
                      docHead.appendChild(meta)
                      return meta
                  }( document.getElementsByTagName("meta") )
              })
          }

          function onreadystatechange(){
              if ( "interactive, complete".indexOf(document.readyState) != -1 )
                onready()
          }

          var ready = 0

          if ( "readyState" in document ) {
            if ( document.readyState === "complete" )
              onready()
          } else setTimeout(onready, 4)

          addEventListener(root, "DOMContentLoaded", onready, true)
          addEventListener(root, "load", onready, true)
          addEventListener(document, "readystatechange", onreadystatechange, true)
      })

      , View = ns.View = klass(EventEmitter, {
          constructor: function(){
              invoke(this.initView, arguments, this)
          }
        , initView: function(){
              var args = slice(arguments)
                , parsedTemplate, k, i, l
                , viewHandler, domEvents

              viewHandler = isInvocable(args[args.length-1]) ? args.pop() : null

              if ( Promise.isImplementedBy(args[args.length-1]) )
                return this.__viewReady__ = function(view, promise){
                    return view.__viewReady = promise.then({
                        handleResolve: function(data){
                              args.push(data)

                              if ( viewHandler )
                                args.push(viewHandler)

                              invoke(view.initView, args, view)
                          }
                        , handleReject: function(){
                              args.push({})

                              if ( viewHandler )
                                args.push(viewHandler)

                              invoke(view.initView, args, view)
                          }
                    })
                }( this, args.pop() )
              this.__viewReady__ = new Promise(function(resolve){ resolve() })

              this.__data__ = args[args.length-1] && Model.isImplementedBy(args[args.length-1]) ? args.pop()
                            : args.length > 1 && isObject(args[args.length-1]) ? new this.__useModel__(args.pop())
                            : new this.__useModel__

              this.__template__ = typeof args[0] == "string" ? trim(args.shift())
                                : isObject(args[0]) ? function(templateDict){
                                      domEvents = isObject(templateDict.events) ? templateDict.events : null
                                      return typeof templateDict.template == "string" ? templateDict.template : ""
                                  }( args.shift() )
                                : typeof this.__template__ == "string" ? this.__template__
                                : ""

              parsedTemplate = htmlExpression.parse(this.__template__, this.__data__)

              this.__fragment__ = parsedTemplate.tree
              this.__elements__ = parsedTemplate.assignments

              this.__elements__.root = this.__elements__.root || []
              for ( i = 0, l = this.__fragment__.childNodes.length; i < l; i++ )
                if ( indexOf(this.__elements__.root, this.__fragment__.childNodes[i]) == -1 )
                  this.__elements__.root.push(this.__fragment__.childNodes[i])

              if ( this.__defaultDOMEvents__ )
                this.addDOMEventListener(this.__defaultDOMEvents__)

              if ( domEvents )
                this.addDOMEventListener(domEvents)

              this.__viewState__ = INIT

              if ( viewHandler )
                void function(view){
                    function html(){ return invoke(view.html, arguments, view) }
                    function recover(){ return invoke(view.recover, arguments, view) }

                    var model = view.__data__

                    invoke(viewHandler, { $html: html, $recover: recover, $model: model, 0: html, 1: recover, 2: model, length: 3 })
                }(this)
          }
        , __useModel__: Model
        , useModel: function(){
              var M = arguments[0]

              if ( M && (Model.isImplementedBy(M)||Collection.isImplementedBy(M)) )
                return this.__useModel__ = M, true
              return false
          }
        , html: function(){
              if ( !this.__viewState__ )
                if ( arguments.length )
                  return this.__viewReady__.then(function(view, args){
                      return function(){ invoke(view.html, args, view) }
                  }(this, arguments))

              this.__fragment__ = this.__fragment__ || document.createDocumentFragment()

              if ( !this.__fragment__.childNodes.length )
                this.recover()

              if ( isInvocable(arguments[0]) )
                invoke(arguments[0], [this.__fragment__])

              return this.__fragment__
          }
        , recover: function(){
              var i, l

              this.__fragment__ = this.__fragment__ || document.createDocumentFragment()

              if ( !this.__fragment__.childNodes.length )
                for ( i = 0, l = this.__elements__.root.length; i < l; i++ )
                  this.__fragment__.appendChild(this.__elements__.root[i])
          }
        , clone: function(){
              return this.__viewState__ & INIT ? new this.constructor(this.__template__, this.__data__) : new Error
          }
        , element: function(){
              if ( !this.__viewState__ )
                return this.__viewReady__.then(function(view, args){
                    return function(){
                        $.invoke(view.element, args, view)
                    }
                }(this, arguments))

              var args = slice(arguments)
                , elementHandler = isInvocable(args[args.length-1]) ? args.pop() : null
                , requested = args.length > 1 ? args
                           : args.length == 1 ? [args.shift()]
                           : ["root"]
                , i = 0, l = requested.length
                , elements = []

              for ( ; i < l; i++ )
                  requested[i] = typeof requested[i] == "string" ? requested[i] : toType(requested[i]),
                  elements[i] = this.__elements__.hasOwnProperty(requested[i]) ? this.__elements__[requested[i]].length > 1 ? this.__elements__[requested[i]] : this.__elements__[requested[i]][0] : null

              if ( elementHandler )
                return invoke(elementHandler, elements), void 0
              return elements.length > 1 ? elements : elements[0]
          }
        , addDOMEventListener: function(){
              var eltRef, elts, event, handler, capture, i, l

              if ( arguments.length <= 2 && arguments[0].constructor == Object )
                return function(view, events, capture, k, i, l){
                    for ( k in events ) if ( events.hasOwnProperty(k) )
                      void function(eltRef, events, k){
                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            view.addDOMEventListener(eltRef, k, events[k], !!capture)
                      }(k, events[k])
                }(this, arguments[0], arguments[1])

              eltRef = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
              event = typeof arguments[1] == "string" ? arguments[1] : toType(arguments[1])
              handler = isEventable(arguments[2]) ? arguments[2] : function(){}
              capture = !!arguments[3]

              for ( elts = this.__elements__[eltRef], i = 0, l = elts.length; i < l; i++ )
                addEventListener(elts[i], event, handler, capture)
          }
      })


    , CSSRules = ns.CSSRules = klass(function(Super, statics){

          return {
              constructor: function(){
                  var args = slice(arguments)
                    , setProps = isObject(args[args.length-1]) ? args.pop() : null

                  this._cssProperties = args[0] && args[0].nodeType == 1 ? args.pop().style
                                      : args[0] && ( args[0].getPropertyCSSValue || (args[0].getAttribute&&args[0].setAttribute) ) ? args.pop()
                                      : document.createElement("div").style
              }
            , cssText: function(){
                  if ( !arguments.length )
                    return this._cssProperties.cssText

                  this._cssProperties.cssText = typeof arguments[0] == "string" ? arguments[0] : ""
              }
            , setProperty: function(){
                  var prop, value, priority

                  if ( arguments.length == 1 && isObject(arguments[0]) )
                    return function(cssProperties, props, k){
                        for ( k in props ) if ( props.hasOwnProperty(k) )
                          cssProperties.setProperty(k, props[k])
                    }( this, arguments[0] )

                  prop = typeof arguments[0] == "string" ? arguments[0] : ""
                  value = typeof arguments[1] == "string" ? arguments[1] : ""
                  priority = typeof arguments[2] == "string" ? arguments[2] : null

                  if ( CSS_PROPERTIES_COMPAT )
                    return this._cssProperties.setProperty(prop, value, priority)
                  return this._cssProperties.setAttribute(prop, value)
              }
            , getProperty: function(){
                  var args = slice(arguments)
                    , cb = isInvocable(args[args.length-1]) ? args.pop() : null
                    , props = args.length > 1 ? args
                            : args.length == 1 ? [args[0]]
                            : []
                    , i = 0, l = props.length
                    , rv = []

                  for ( ; i < l; i++ )
                    if ( CSS_PROPERTIES_COMPAT & 1 )
                      rv[i] = this._cssProperties.getPropertyValue(props[i])
                    else
                      rv[i] = this._cssProperties.getAttribute(props[i])

                  if ( cb )
                    invoke(cb, rv)

                  if ( l == 1 )
                    return rv[0]
                  return rv
              }
            , removeProperty: function(){
                  var prop = typeof arguments[0] == "string" ? arguments[0] : ""

                  if ( CSS_PROPERTIES_COMPAT & 1 )
                    this._cssProperties.removeProperty(prop)
              }
            , propertyPriority: function(){
                  var prop, value

                  if ( !CSS_PROPERTIES_COMPAT )
                    return null

                  prop = typeof arguments[0] == "string" ? arguments[0] : ""
                  value = typeof arguments[1] == "string" ? arguments[1] : null

                  if ( value !== null )
                    this.setProperty(prop, this.getProperty(prop), value)
                  else
                    return this._cssProperties.getPropertyPriority(prop)
              }
          }
      })

    , StyleSheet = ns.StyleSheet = klass(function(Super, statics){
          statics.isLocalCSSFile = function(a){
              return function(url){
                  a.href = url

                  return a.domain === location.domain
              }
          }(document.createElement("a"))

          return {
              constructor: function(){
                  var args = slice(arguments)
                    , sheetHandler = isInvocable(args[args.length-1]) ? args.pop() : null
                    , startingRules = isObject(args[args.length-1]) ? args.pop() : {}
                    , external
                    , node = this.__node__ = function( sheet, _node, node, blob, url ){
                          if ( _node && _node.hasOwnProperty("tagName") && "link, style".indexOf(_node.tagName.toLowerCase()) != -1 )
                            return _node

                          _node = function(split){
                              return external = split[0] === "css", split.pop()
                          }( (typeof _node == "string" ? _node : "").split("!") )

                          if ( external && statics.isLocalCSSFile(_node) ) {
                            if ( STYLESHEET_COMPAT & 1 )
                              node = nodeExpression.parse("link"+(typeof args[0] == "string" ? args.shift() : "")+"[rel=stylesheet][href=@url@]", {url: _node}).tree.childNodes[0]
                            else
                              document.createStyleSheet(_node, document.styleSheets.length),
                              node = document.styleSheets[document.styleSheets.length-1].owningElement

                            domReady.then(function(nodes){
                                nodes.head.appendChild(node)
                            })

                          } else if ( STYLESHEET_COMPAT & 1 ) {
                            if ( STYLESHEET_COMPAT & 4 )
                              blob = new Blob([""], {type: "text/css"}),
                              url = URL.createObjectURL(blob),
                              node = nodeExpression.parse("link"+_node+"[rel=stylesheet][href=@url@]", {url: url}).tree.childNodes[0]
                            else
                              node = htmlExpression.parse("style"+_node+">text{}").tree.childNodes[0]

                            domReady.then(function(nodes){
                                nodes.head.appendChild(node)
                            })
                          } else {
                            document.createStyleSheet(),
                            node = document.styleSheets[document.styleSheets.length-1].owningElement
                          }

                          node.id = node.id || "SS-"+Uuid.uuid(6, 16)

                          return node
                      }( this, args.pop() )

                    this.__stylesheetReady__ = new Promise(function(sheet){
                        return function(resolve){
                            function wait(){
                                if (!node.sheet && !node.styleSheet)
                                  return setTimeout(wait, 4)

                                try {
                                    if ( STYLESHEET_COMPAT & 1 )
                                      node.sheet.cssRules.length
                                    else
                                      node.styleSheet.rules.length
                                } catch(e){
                                  return setTimeout(wait, 4)
                                }

                                sheet.__sheet__ = node.sheet||node.styleSheet

                                sheet.rule(startingRules)
                                resolve(sheet)
                            }
                            wait()
                        }
                    }(this))

                    if ( sheetHandler )
                      this.__stylesheetReady__.then(function(sheet){
                          function rule(){
                              return invoke(sheet.rule, arguments, sheet)
                          }

                          function rules(){
                              return invoke(sheet.rules, arguments, sheet)
                          }

                          return function(){
                              invoke(sheetHandler, { $rule: rule, $rules: rules, 0: rule, 1: rules, length: 2 })
                          }
                      }(this))

              }
            , rule: function(){
                  var args = slice(arguments)
                    , ruleHandler = isInvocable(args[args.length-1]) ? args.pop() : null
                    , selector, cssText, output, rfn

                  if ( isObject(args[0]) )
                    return function(sheet, rules, k, rv){
                        var o = {}, _args

                        for ( k in rules ) if ( rules.hasOwnProperty(k) ) {
                          _args = isArray(rules[k]) ? [k].concat(rules[k]) : [k, rules[k]]
                          o[k] = invoke(sheet.rule, _args, sheet)
                        }

                        return o
                    }(this, args.shift() )

                  selector = typeof args[0] == "string" ? args.shift() : toType(args.shift())
                  cssText = STYLESHEET_COMPAT & 1  ? typeof args[0] == "string" ? "{"+args.shift()+"}" : "{}"
                                                   : typeof args[0] == "string" ? args.shift() : " "

                  output = new Promise(function(sheet){
                      return function(resolve){
                          sheet.__stylesheetReady__.then(function(){
                              var idx = (sheet.__sheet__.cssRules||sheet.__sheet__.rules).length||0
                                , rv

                              if ( STYLESHEET_COMPAT & 1 )
                                invoke(sheet.__sheet__.insertRule, [selector+cssText, idx], sheet.__sheet__)
                              else
                                sheet.__sheet__.addRule(selector, cssText, idx)

                              rv = new CSSRules( CSS_PROPERTIES_COMPAT & 1 ? sheet.__sheet__.cssRules[idx].style : sheet.__sheet__.rules[idx].style)
                              /*
                              rv = sheet.__sheet__.cssRules ? sheet.__sheet__.cssRules[idx]
                                 : function(cssRules){
                                      var rv = {
                                              selectorText: cssRules.selectorText
                                            , style: {
                                                  setProperty: function(){
                                                      return cssRules.style.setAttribute(arguments[0], arguments[1])
                                                  }
                                                , getPropertyValue: function(){
                                                      return cssRules.style.getAttribute(arguments[0])
                                                  }
                                              }
                                          }
                                        , k

                                      for ( k in cssRules.style ) if ( rv.hasOwnProperty.call(cssRules.style, k) )
                                        rv.style[k] = cssRules.style[k]

                                      return rv
                                   }(sheet.__sheet__.rules[idx])
                              */

                              resolve( rv )
                          })
                      }
                  }(this))

                  if ( ruleHandler )
                     output.then(ruleHandler)

                  rfn = function(){
                      return output.then(isThenable(arguments[0]) ? arguments[0] : function(){})
                  }
                  rfn.__cssRulesPromise__ = output

                  return rfn
              }
            , rules: function(){
                  var args = slice(arguments)
                    , rulesHandler = args[args.length-1] && !args[args.length-1].hasOwnProperty("__cssRulesPromise__") && isThenable(args[args.length-1]) ? args.pop() : null
                    , rules = []
                    , group
                    , i = 0, l = arguments.length-1

                  for ( ; i < l; i++ )
                    if ( arguments[i].hasOwnProperty("__cssRulesPromise__"))
                      rules[i] = new Promise(function(rule){
                          return function(resolve){
                              return rule(function(cssRules){
                                  resolve(cssRules)
                              })
                          }
                      }( arguments[i] ))
                    else if ( typeof arguments[i] == "string" )
                      rules[i] = new Promise(function(rule){
                          return function(resolve){
                              return rule(function(cssRules){
                                  resolve(cssRules)
                              })
                          }
                      }( this.rule(arguments[i]) ))
                    else
                      rules[i] = function(){ return new TypeError() }

                  group = Promise.group(rules)()

                  if ( rulesHandler )
                    group.then(rulesHandler)

                  return function(){
                      return group.then(isThenable(arguments[0])?arguments[0]:function(){})
                  }
              }
            , media: function(){
                  if ( typeof arguments[0] == "string" )
                    this.__stylesheetReady__.then(function(media){
                        return function(sheet){
                            try {
                              sheet.__sheet__.media.mediaText = media
                            } catch(e){ }
                        }
                    }(arguments[0]))

              }
            , disable: function(){
                  return this.__stylesheetReady__.then(function(sheet){
                      if ( !sheet.__sheet__.disabled )
                        sheet.__sheet__.disabled = true

                      return true
                  })
              }
            , enable: function(){
                  return this.__stylesheetReady__.then(function(sheet){
                      if ( sheet.__sheet__.disabled )
                        sheet.__sheet__.disabled = false

                      return false
                  })
              }
          }
      })


    , Point = klass({
          constructor: function(){
              this.x = typeof arguments[0] == "number" ? arguments[0] : 0
              this.y = typeof arguments[1] == "number" ? arguments[1] : 0
          }
      })

    , Matrix = klass({
          constructor: function(bcr, origin){
              this.__bcr__ = bcr || ClientRect.getBoundingClientRect(docBody)
              this.__origin__ = origin || { x:0, y:0 }
          }
        , left: function(){ return Math.round( this.__bcr__.left - this.__origin__.x ) }
        , top: function(){ return Math.round( this.__bcr__.top - this.__origin__.y ) }
        , width: function(){ return Math.round(this.__bcr__.width) }
        , contentWidth: function(){ return Math.round( this.__bcr__.contentWidth ) }
        , height: function(){ return Math.round(this.__bcr__.height) }
        , contentHeight: function(){ return Math.round(this.__bcr__.contentHeight) }
        , C: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width/2 - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height/2 - this.__origin__.y)) }
        , NW: function(){ return new Point(Math.round(this.__bcr__.left - this.__origin__.x), Math.round(this.__bcr__.top - this.__origin__.y)) }
        , N: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width/2 - this.__origin__.x), Math.round(this.__bcr__.top - this.__origin__.y)) }
        , NE: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width - this.__origin__.x), Math.round(this.__bcr__.top - this.__origin__.y)) }
        , E: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height/2 - this.__origin__.y)) }
        , SE: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height - this.__origin__.y)) }
        , S: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width/2 - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height - this.__origin__.y)) }
        , SW: function(){ return new Point(Math.round(this.__bcr__.left - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height - this.__origin__.y)) }
        , W: function(){ return new Point(Math.round(this.__bcr__.left - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height/2 - this.__origin__.y)) }
      })

    , ClientRect = ns.ClientRect = klass(function(Super, statics){

           statics.getBoundingClientRect = function(node){
              var bcr, clientT, clientL, offsetX, offsetY

              bcr = node.getBoundingClientRect()
              clientT = docElt.clientTop || docBody.clientTop || 0
              clientL = docElt.clientLeft || docBody.clientLeft || 0
              offsetX = root.pageXOffset || root.scrollX || docElt.scrollLeft || docBody.scrollLeft || 0
              offsetY = root.pageYOffset || root.scrollY || docElt.scrollTop || docBody.scrollTop || 0

              return {
                  left: node === docElt || node === docBody ? offsetX : bcr.left + offsetX - clientL
                , top: node === docElt || node === docBody ? offsetY : bcr.top + offsetY - clientL
                , width: bcr.width || bcr.right - bcr.left
                , contentWidth: node.scrollWidth
                , height: bcr.height || bcr.bottom - bcr.top
                , contentHeight: node.scrollHeight
              }
          }

          statics.getEventCoordinates = function(e){
              var offsetX, offsetY

              offsetX = root.pageXOffset || root.scrollX || docElt.scrollLeft || docBody.scrollLeft || 0
              offsetY = root.pageYOffset || root.scrollY || docElt.scrollTop || docBody.scrollTop || 0

              return {
                  left: (e.pageX || e.clientX || 0) + offsetX
                , top: (e.pageY || e.clientY || 0) + offsetY
                , width: 0
                , contentWidth: 0
                , height: 0
                , contentHeight: 0
              }
          }

          return {
              constructor: function(){
                  var args = slice(arguments)
                    , matrixHandler = isThenable(args[args.length-1]) ? args.pop() : null
                    , bcrDict = isObject(args[0]) ? args.shift()
                              : args[0] && args[0].nodeType == 1 ? { node: args.shift() }
                              : { node: document.documentElement }

                  if ( bcrDict.node && bcrDict.node.nodeType == 1 )
                    this.__node__ = bcrDict.node

                  this.__defaultMatrixHandler__ = matrixHandler || function(matrix){ return matrix }
              }
            , compute: function(){
                  var args = slice(arguments)
                    , matrixHandler = isThenable(args[args.length-1]) ? args.pop() : function(matrix){ return matrix }

                    , node = this.__node__
                    , referenceNode = args[args.length-1] && args[args.length-1].nodeType == 1 ? args.pop() : null
                    , referenceEvent = !referenceNode && args[args.length-1] && (typeof args[args.length-1].pageX == "number" || typeof args[args.length-1].clientX == "number") ? args.pop() : null
                    , referenceOrigin = !referenceNode && !referenceEvent && args[args.length-1] && args[args.length-1].hasOwnProperty("x") && args[args.length-1].hasOwnProperty("y") ? args.pop() : null
                    , referenceCardinalPoint = typeof args[args.length-1] == "string" && Matrix.prototype.hasOwnProperty(args[args.length-1]) ? args.pop() : null

                    , output = new Promise(function(resolve){
                          domReady.then(function(){
                              var ncr = statics.getBoundingClientRect(node)
                                , rcr

                              if ( !referenceCardinalPoint ) {
                                if ( referenceEvent )
                                  rcr = statics.getEventCoordinates(referenceEvent)
                                else if ( referenceNode )
                                  rcr = statics.getBoundingClientRect(referenceNode)
                                else if ( referenceOrigin )
                                  rcr = { left: referenceOrigin.x, top: referenceOrigin.y }
                                else
                                  rcr = {left:0, top:0}

                                return resolve( new Matrix(ncr, new Point(rcr.left, rcr.top)) )
                              }

                              return new ClientRect(referenceNode).compute(function(matrix){
                                  resolve( new Matrix( ncr, matrix[referenceCardinalPoint]()) )
                              })
                          })
                     })

                  if ( this.__defaultMatrixHandler__ )
                    output = output.then(this.__defaultMatrixHandler__)
                  if ( matrixHandler )
                    output.then(matrixHandler)

                  return output
              }
          }
      })

    , Transition = ns.Transition = klass(function(Super, statics, cssProperties){
          function defaultTransitionShim(node, props, resolve, k){
              for ( k in props ) if ( props.hasOwnProperty(k) )
                try {
                  node.style.setProperty(k, props[k])
                } catch(e){}

              resolve()
          }

          statics.stylesheet = new StyleSheet("#sleipFX-css")

          statics.guid = function( uuid ){
              return function(){
                  return invoke(uuid.uuid, [], uuid)
              }
          }( new Uuid({ length: 10, radix:16, map: { 0: "s", 1: "f", 2: "x", 3: "-" } }) )

          cssProperties = COMPUTED_STYLE_COMPAT ? root.getComputedStyle(document.createElement("div")) : document.documentElement.currentStyle

          return {
              constructor: function(){
                  var args = slice(arguments)
                    , transDict

                  this.__guid__ = statics.guid()
                  this.__defaultTransitionHandler__ = isThenable(args[args.length-1]) ? args.pop() : null

                  transDict = args.length > 1 && isObject(args[args.length-1]) ? args.pop() : {}

                  this.__properties__ = function(transition, aprops, rprops, k, aCssText, rCssText, keys){
                      rCssText = []

                      keys = enumerate(aprops)
                      while ( keys.length )
                        void function(k, hooks){
                            if ( !cssHooks.hasOwnProperty(k) )
                              return

                            hooks = cssHooks[k](aprops[k])
                            while ( hooks.length )
                              void function(hook){
                                  if ( !aprops[hook.key] )
                                    aprops[hook.key] = hook.value
                              }( hooks.shift() )
                            delete aprops[k]
                        }( keys.shift() )

                      for ( k in aprops ) if ( aprops.hasOwnProperty(k) )
                        if ( (COMPUTED_STYLE_COMPAT ? cssProperties.getPropertyValue(k) : cssProperties[k]) != void 0 ) {
                          rprops.push(k)
                          aCssText = [k]

                          if ( typeof aprops[k] == "number" )
                            aCssText.push( aprops[k].toString() + (transDict.timingUnit||"s") )
                          else if ( typeof aprops[k] == "string" )
                            aCssText.push( aprops[k].split(" ") )
                          else if ( isObject(aprops[k]) ) {
                              aCssText.push( aprops[k].duration||0 )

                              if ( aprops[k].hasOwnProperty("timingFunction") )
                                aCssText.push( aprops[k].timingFunction )

                              if ( aprops[k].hasOwnProperty("delay") )
                                aCssText.push( aprops[k].delay )
                          }

                          rCssText.push( aCssText.join(" ") )
                        }

                      transition.__cssRules__ = statics.stylesheet.rule("."+transition.__guid__, CSS_TRANSITION_PROPERTY+":"+rCssText.join(", "))

                      return rprops
                  }( this, args.pop(), [] )
              }
            , animate: function(){
                  var oargs = arguments
                    , args = slice(arguments)

                    , transitionHandler = isThenable(args[args.length-1]) ? args.pop() : null
                    , props = isObject(args[args.length-1]) ? args.pop() : {}
                    , node = args[0] && args[0].nodeType == 1 && args[0].parentNode && args[0].parentNode.nodeType == 1 ? args.shift() : function(){ throw new Error }()

                    , transitionId = this.__guid__ + Uuid.uuid(6, 16)
                    , animating = []
                    , output
                    , k, i, l

                  if ( !CSS_TRANSITION_COMPAT )
                    output = new Promise(function(transition, shim){
                        return function(resolve, reject){ invoke(shim||defaultdefaultTransitionShim, { $resolve: resolve, $reject: reject, 0: node, 1: props, 2: resolve, 3: reject, length: 4 }) }
                    }(this, this.__animationShim__))
                  else
                    output = new Promise(function(transition){
                        return function(resolve, reject){
                            function end(retry){
                                if ( VISIBILITY_COMPAT & 1 ) removeEventListener(document, VISIBILITY_CHANGE_EVENT, onvisibilitychange, true)
                                removeEventListener(node, CSS_TRANSITIONEND_EVENT, ontransitionend, true)

                                //if ( node.dataset.sleipfxtransitionid === transitionId ) {
                                if ( node.getAttribute("data-sleipfxtransitionid") === transitionId ) {
                                    node.className.replace(" "+transition.__guid__, "")
                                    //delete node.dataset.sleipfxtransitionid
                                    node.removeAttribute("data-sleipfxtransitionid")

                                    if ( retry )
                                      requestAnimationFrame(function(){
                                          invoke(transition.animate, [node, props], transition).then(function(){ resolve() }, function(){ reject() })
                                      })
                                    else
                                      resolve()
                                } else reject()
                            }

                            function onvisibilitychange(){
                                if ( document[VISIBILITY_HIDDEN_PROPERTY] )
                                  return

                                end(true)
                            }

                            function ontransitionend(e, idx){
                                if ( e.target !== node )
                                  return

                                if ( idx = indexOf(animating, e.propertyName), idx != -1 )
                                  animating.splice(idx, 1)

                                //if ( !animating.length || node.dataset.sleipfxtransitionid !== transitionId )
                                if ( !animating.length || node.getAttribute("data-sleipfxtransitionid") !== transitionId )
                                  end()
                            }

                            //node.dataset.sleipfxtransitionid = transitionId
                            node.setAttribute("data-sleipfxtransitionid", transitionId)

                            domReady.then(function(nodes, keys){
                                if ( !nodes.body.contains(node) )
                                  return reject()

                                keys = enumerate(props)
                                while ( keys.length )
                                  void function(k, hooks){
                                      if ( !cssHooks.hasOwnProperty(k) )
                                        return

                                      hooks = cssHooks[k](props[k])
                                      while ( hooks.length )
                                        void function(hook){
                                            if ( !props[hook.key] )
                                              props[hook.key] = hook.value
                                        }( hooks.shift() )

                                      delete props[k]
                                  }( keys.shift() )

                                for ( k in props ) if ( props.hasOwnProperty(k) ) {
                                  if ( indexOf(transition.__properties__, k ) != -1 )
                                    void function( k, prop, clone, computedStyles, cloneComputedStyles, curr, next ){
                                          if ( cssProperties.getPropertyValue(k) == void 0 ) {
                                              delete props[k]
                                              return
                                          }

                                          clone.className.replace(" "+transition.__guid__, "")
                                          clone.style.setProperty(k, prop)

                                          curr = computedStyles.getPropertyValue(k)
                                          node.parentNode.insertBefore(clone, node)
                                          cloneComputedStyles = root.getComputedStyle(clone)
                                          next = cloneComputedStyles.getPropertyValue(k)

                                          clone.parentNode.removeChild(clone)

                                          if (  curr !== next )
                                            props[k] = next,
                                            animating.push(k)

                                    }( k, props[k], node.cloneNode(true), root.getComputedStyle(node) )
                                }

                                requestAnimationFrame(function(){
                                    if ( node.className.indexOf(transition.__guid__) == -1 )
                                      node.className += " "+transition.__guid__

                                    if ( VISIBILITY_COMPAT & 1 ) addEventListener(document, VISIBILITY_CHANGE_EVENT, onvisibilitychange, true)
                                    addEventListener(node, CSS_TRANSITIONEND_EVENT, ontransitionend, true)

                                    requestAnimationFrame(function(){
                                        for ( k in props ) if ( props.hasOwnProperty(k) )
                                          node.style.setProperty(k, props[k])

                                        if ( !animating.length )
                                          end()
                                    })
                                })
                            })
                        }
                    }( this ))

                  if ( this.__defaultTransitionHandler__ )
                    output = output.then(this.__defaultTransitionHandler__)
                  if ( transitionHandler )
                    output.then(transitionHandler)

                  return output
              }
          }
      })


    root.__sleipnir__ = function(k){
        function sleipnir(){
            if ( isInvocable(arguments[0]) )
              return domReady.then(function(fn){
                  return function(nodes){
                      return invoke(fn, { $: sleipnir, $root: window, $nodes: nodes, 0: nodes, length: 1 })
                  }
              }(arguments[0]))
        }

        for ( k in ns ) if ( ns.hasOwnProperty(k) )
          sleipnir[k] = ns[k]

        return sleipnir
    }()

    if ( typeof root.define == "function" && define.amd )
      define([], function(){ return __sleipnir__ })
    else
      root.sleipnir = __sleipnir__

}(window, { version: "ES3-0.6.0a41" });
