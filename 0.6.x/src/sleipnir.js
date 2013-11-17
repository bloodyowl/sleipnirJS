// variable to preserve : $super, $static, $e, $resolve, $reject, $progress, $, $$, $next, $route

;(function(root, ns){ "use strict"

    var document = root.document
      , location = document.location

        /* some const-like declarations */
      , STRICT_MODE = function(){
            return this === void 0
        }()

      , ERROR = 1, INIT = 2
      , PENDING = 6, REJECTED = 10, RESOLVED = 18

      , risnative = /\s*\[native code\]\s*/i
      , rtrim = /^\s+|\s+$/g
      , rargs = /(?=^|\s*)function(?:[^\(]*)\(([^\)]*)/

        /* dom nodes */
      , docHead, docElt, docBody

      , toType = function(toString){
            return function(o){
                return toString.call(o)
            }
        }(Object.prototype.toString)

      , isArray = Array.isArray || function(o){
            return toType(o) == "[object Array]"
        }

      , isNative = function(fn){
            if ( typeof fn == "function" )
              return fn.toString().match(risnative)
        }

      , slice = function(slice){
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
        }(Array.prototype.slice)

      , indexOf = function(hasIndexOf){
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
            if ( "textContent" in dummy )
              return function(str){
                  dummy.textContent = str
                  return dummy.textContent
              }
            return function(str){
                dummy.innerText = str
                return dummy.innerText
            }
        }( document.createTextNode("") )

      , enumerate = ns.enumerate = function(hasObjectKeys){
            return function(o){
                var k, rv

                if ( hasObjectKeys )
                  try {
                    rv = Object.keys(o)
                    return rv
                  } catch(e) { }

                rv = []
                o = !!o ? (!!o.callee ? slice(o) : o) : {}

                for ( k in o ) if ( rv.hasOwnProperty.call(o, k) )
                  rv.push(k)

                return rv
            }
        }( isNative(Object.keys) )

      , JSON = ns.JSON = root.JSON || (function(){
            // JSON2.JS by Douglas Crockford
           var JSON = {}
           ;(function(){"use strict";function f(t){return 10>t?"0"+t:t}function quote(t){return escapable.lastIndex=0,escapable.test(t)?'"'+t.replace(escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var r,n,o,f,u,p=gap,i=e[t];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(t)),"function"==typeof rep&&(i=rep.call(e,t,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?i+"":"null";case"boolean":case"null":return i+"";case"object":if(!i)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(i)){for(f=i.length,r=0;f>r;r+=1)u[r]=str(r,i)||"null";return o=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+p+"]":"["+u.join(",")+"]",gap=p,o}if(rep&&"object"==typeof rep)for(f=rep.length,r=0;f>r;r+=1)"string"==typeof rep[r]&&(n=rep[r],o=str(n,i),o&&u.push(quote(n)+(gap?": ":":")+o));else for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(o=str(n,i),o&&u.push(quote(n)+(gap?": ":":")+o));return o=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+p+"}":"{"+u.join(",")+"}",gap=p,o}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;"function"!=typeof JSON.stringify&&(JSON.stringify=function(t,e,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;r>n;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(n=walk(o,r),void 0!==n?o[r]=n:delete o[r]);return reviver.call(t,e,o)}var j;if(text+="",cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}())
           return JSON
        }())


      , invoke = ns.invoke = function(){
            return function(/* fn, args, ctx */){
                var fn, args, ctx

                fn = arguments[0] && typeof arguments[0].handleInvoke == "function" ? ( ctx = arguments[0], ctx.handleInvoke )
                   : typeof arguments[0] == "function" ? arguments[0]
                   : function(){ throw new Error("sleipnir.invoke, invalid function/invokeHandler") }()

                args = isArray(arguments[1]) ? arguments[1]
                     : arguments[1] && ( (!STRICT_MODE&&!!arguments[1].callee)||toType(arguments[1]) == "[object Arguments]" ) ? arguments[1]
                     : arguments[1] && arguments[1].constructor === Object ? buildMagicArguments(fn, arguments[1])
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

      , klass = ns.klass = function(/*SuperClass, prototype*/){
            if ( arguments.length > 2 )
              return function(args, A, b){
                  A = args.shift()
                  b = function(B, proto){
                      proto = B.prototype
                      proto.__trans_implements__ = [].concat(B.__implements__)

                      return proto
                  }( klass(args.shift(), {}) )

                  return invoke(klass, [klass(A, b)].concat(args))
              }( slice(arguments) )

            var SuperClass = arguments.length == 2 ? arguments[0] : null
              , superPrototype = SuperClass ? SuperClass.prototype : {}
              , statics = {}
              , k, __trans_implements__

            , prototype = function(props){
                  return typeof props == "function" ? (invoke(props, { $Super: SuperClass, $static: statics, 0: SuperClass, 1: statics, length: 2 })||{})
                         : toType(props) == "[object Object]" ? props
                         : {}
              }( arguments[arguments.length-1] )

            , Class = prototype.hasOwnProperty("constructor") ? function(){
                  var constructor = prototype.constructor
                  delete prototype.constructor
                  return constructor
              }() : function(){}

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

            Class.prototype = function(){
                function P(){}
                P.prototype = superPrototype
                return new P
            }()

            for ( k in statics ) if ( statics.hasOwnProperty(k) )
              Class[k] = statics[k]

            if ( prototype.__trans_implements__ ) {
              __trans_implements__ = prototype.__trans_implements__
              delete prototype.__trans_implements__
            }

            for ( k in prototype ) if ( prototype.hasOwnProperty(k) )
              Class.prototype[k] = prototype[k]

            Class.prototype.constructor = Class

            Class.__implements__ = [Class]
            Class.hasImplemented = function(){
                var i, l

                if ( SuperClass ) {
                  Class.__implements__.push(SuperClass)

                  if ( SuperClass.__implements__ )
                    for ( i = 0, l = SuperClass.__implements__.length; i < l; i++ )
                      if ( indexOf(Class.__implements__, SuperClass.__implements__[i]) == -1 )
                        Class.__implements__.push(SuperClass.__implements__[i])
                }

                if ( __trans_implements__ ) {
                  for ( i = 0, l = __trans_implements__.length; i < l; i++ )
                    if ( indexOf(Class.__implements__, __trans_implements__[i]) == -1 )
                      Class.__implements__.push(__trans_implements__[i])
                }

                return function(/*superclasses*/){
                    var i = 0, l = arguments.length

                    for ( ; i < l; i++ )
                      if ( indexOf(Class.__implements__, arguments[i]) == -1 )
                        return false

                    return true
                }
            }()

            return Class
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
                constructor: function(dict){
                    var dict = dict && dict.constructor === Object ? dict : {}
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
                      (function(pair){
                          var pair = unescape(pair.replace(/\+/g, "%20"))
                            , idx = pair.indexOf(this&&this.__delimiterSymbol__||delimiter)
                            , key = pair.split(this&&this.__delimiterSymbol__||delimiter, 1)
                            , value = pair.slice(idx+1)

                          o[key] = value
                      }( pairs[keys[i]] ))

                    return o
                }
            }("=", /&amp;|&/g)

            return {
                constructor: function(dict){
                    var dict = dict && dict.constructor === Object ? dict : {}

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


      , EventEmitter = ns.EventEmitter = klass({
            constructor: function(/*emitHandler*/){
                var emitHandler = arguments[0] && (typeof arguments[0].handleInvoke == "function" || typeof arguments[0] == "function") ? arguments[0] : null
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
                  if ( handlers.handleEvent )
                    invoker.invoke(handlers.handleEvent, args, handlers)
                  else if ( handlers.handleInvoke )
                    invoke.invoke(handlers, args)
                  else if ( typeof handlers == "function" )
                    invoker.invoke(handlers, args, this)
                  else for ( _arr = [].concat(handlers), i = 0, l = _arr.length; i < l; i++ )
                    if ( _arr[i].handleEvent )
                      invoker.invoke(_arr[i].handleEvent, args, _arr[i])
                    else if ( _arr[i].handleInvoke )
                      invoker.invoke(_arr[i], args)
                    else
                      invoker.invoke(_arr[i], args, this)


            }

          , on: function(/*type, fn*/){
                if ( arguments.length == 1 && arguments[0].constructor === Object)
                  return function(ee, handlers, k){
                      for ( k in handlers ) if ( handlers.hasOwnProperty(k) )
                          ee.on(k, handlers[k])
                  }(this, arguments[0])

                var events = this.__events__ = this.__events__ || {}
                  , type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , handler = arguments[1] && arguments[1].handleEvent && (typeof arguments[1].handleEvent.handleInvoke == "function" || typeof arguments[1].handleEvent == "function") ? arguments[1]
                            : arguments[1] && (typeof arguments[1].handleInvoke == "function" || typeof arguments[1] == "function") ? arguments[1]
                            : function(){}
                  , handlers = events[type]

                if ( !handlers || handlers === Object.prototype[type] )
                  events[type] = handler
                else if ( isArray(handlers) )
                  handlers.push(handler)
                else
                  events[type] = [handlers, handler]

            }
          , once: function(/*type, fn*/){
                if ( arguments.length == 1 && arguments[0].constructor === Object )
                  return function(ee, handlers, k){
                      for ( k in handlers ) if ( handlers.hasOwnProperty(k) )
                        ee.once(k, handlers[k])
                  }(this, arguments[0])

                var type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , handler = arguments[1] && arguments[1].handleEvent && (typeof arguments[1].handleEvent.handleInvoke == "function" || typeof arguments[1].handleEvent == "function") ? arguments[1]
                            : arguments[1] && (typeof arguments[1].handleInvoke == "function" || typeof arguments[1] == "function") ? arguments[1]
                            : function(){}

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
          , off: function(/*type, fn*/){
                if ( arguments.length == 1 && arguments[0].constructor === Object )
                  return function(ee, handlers, k){
                      for ( k in handlers ) if ( handlers.hasOwnProperty(k) )
                        ee.off(k, handlers[k])
                  }(this, arguments[0])

                var events = this.__events__ || {}
                  , type = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  , handler = arguments[1] == "*" ? function(){ delete events[type] }()
                            : typeof arguments[1] == "function" || typeof arguments[1].handleInvoke == "function" || typeof arguments[1].handleEvent == "function" ? arguments[1]
                            : function(){}
                  , handler = arguments[1] == "*" ? function(){ delete events[type] }()
                            : arguments[1] && arguments[1].handleEvent && (typeof arguments[1].handleEvent.handleInvoke == "function" || typeof arguments[1].handleEvent == "function") ? arguments[1]
                            : arguments[1] && (typeof arguments[1].handleInvoke == "function" || typeof arguments[1] == "function") ? arguments[1]
                            : function(){}
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
                                  (function( fn, idx ){

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
                                          _yield[idx] = slice(arguments)

                                          if ( ++done == l )
                                            ondone()

                                      }, function(){
                                          errors++
                                          _yield[idx] = slice(arguments)

                                          if ( ++done == l )
                                            ondone()
                                      })

                                  }( fns[i], i ))

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
                constructor: function(/*resolveHandler*/){
                    var resolveHandler = arguments[0] && (typeof arguments[0].handleInvoke == "function" || typeof arguments[0] == "function") ? arguments[0] : null
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
              , then: function(/*resolveHandler, rejectHandler, progressHandler*/){
                    var onresolve = arguments[0] && arguments[0].handleResolve && (typeof arguments[0].handleResolve.handleInvoke == "function" || typeof arguments[0].handleResolve == "function") ? arguments[0]
                                  : arguments[0] && (typeof arguments[0].handleInvoke == "function" || typeof arguments[0] == "function" ) ? arguments[0]
                                  : null
                      , onreject = arguments[0] && arguments[0].handleReject && (typeof arguments[0].handleReject.handleInvoke == "function" || typeof arguments[0].handleReject == "function") ? arguments[0]
                                 : arguments[1] && (typeof arguments[1].handleInvoke == "function" || typeof arguments[1] == "function") ? arguments[1]
                                 : null
                      , onprogress = arguments[0] && arguments[0].handleProgress && (typeof arguments[0].handleProgress.handleInvoke == "function" || typeof arguments[0].handleProgress == "function") ? arguments[0]
                                   : arguments[2] && (typeof arguments[2].handleInvoke == "function" || typeof arguments[2] == "function") ? arguments[2]
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
          constructor: function(/* range, opt_keys */){
              var opt_keys = !!arguments[1]
                , keys = enumerate(arguments[0])
                , i = 0, l = keys.length

              this.__pointer__ = -1
              this.__range__ = []

              for ( ; i < l; i++ )
                this.__range__[i] = opt_keys ? [ keys[i] ] : [ keys[i], arguments[0][keys[i]] ]
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
          statics.defaultDispatcher = function(r, c){
              return r === c
          }

          return {
              constructor: function(/*routes, dispatcher*/){
                  this.__routesDisptacher__ = typeof arguments[arguments.length-1] == "function" ? arguments[arguments.length-1] : null

                  if ( arguments[0] && arguments[0].constructor === Object )
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

                  handler = arguments[1] && arguments[1].handleRoute && ( typeof arguments[1].handleRoute.handleInvoke == "function" || typeof arguments[1].handleRoute == "function" ) ? arguments[1]
                          : arguments[1] && (typeof arguments[1].handleInvoke == "function" || typeof arguments[1] == "function") ? arguments[1]
                          : function(){}

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

                  handler = arguments[1] && arguments[1].handleRoute && ( typeof arguments[1].handleRoute.handleInvoke == "function" || typeof arguments[1].handleRoute == "function" ) ? arguments[1]
                          : arguments[1] && (typeof arguments[1].handleInvoke == "function" || typeof arguments[1] == "function") ? arguments[1]
                          : function(){}

                  route = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])

                  if ( this.__routes__[route] === handler )
                    delete this.__routes__[route]
                  else if ( isArray(this.__routes[route]) )
                    while ( this.__routes[route] && (idx = indexOf(this.__routes[route], handler), idx > -1) ) {
                        this.__routes__[route].splice(idx, 1)

                        if ( this.__routes__[route].length )
                          delete this.__routes[route]
                    }
              }
            , dispatch: function(){
                  var route = arguments[0]
                    , args = slice(arguments, 1)
                    , iterator = new Iterator(this.__routes__)
                    , _next
                    , invoker = new Invoker({ $route: route, $next: function(router){
                          return function(){
                              invoke(_next, [], router)
                          }
                      }(this) })
                    , hits = 0
                    , rv
                    , handle = function(router){
                          return function(ite){
                              var handler = ite[1]
                                , i, l

                              if ( !isArray(handler) ) {
                                hits++
                                _next = next
                                rv = invoker.invoke(handler.handleRoute||handler, [].concat(args).concat(_next), handler.handleRoute?handler:null) || rv

                                return typeof rv == "undefined" ? hits : rv
                              } else {
                                  i = -1
                                  l = handler.length -1

                                  _next = function(){
                                      hits++

                                      if ( ++i >= l )
                                        _next = next

                                      rv = invoker.invoke(handler[i].handleRoute||handler[i], [].concat(args).concat(_next), self, handler.handleRoute?handler[i]:null) || rv

                                      return typeof rv == "undefined" ? hits : rv
                                  }

                                  return _next()
                              }
                          }
                      }(this)
                    , next = function(router){
                          return function(){
                              var ite = iterator.next()
                                , hit

                              if ( ite === null )
                                return hits

                              hit = ite[0] === "*" ? true
                                  : invoke( router.__routesDispatcher__||statics.defaultDispatcher, [ite[0], route].concat(args), router )

                              if ( !hit )
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
              }
            , __useSerializer__: Serializer
            , setItem: function(/* key, value */){
                  var key, value, hook, ov, added

                  if ( arguments.length == 1 )
                    return function(model, items){
                        if ( typeof items == "string" )
                          buildFromString(model, items)
                        else if ( items && items.constructor === Object )
                          buildFromHash(model, items)
                    }(this, arguments[0])

                  key = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])

                  value = arguments[1]
                  while ( value && (typeof value.handleInvoke == "function" || typeof value == "function") ) {
                      value = invoke(value, [this])
                  }

                  hook = ( this.__modelHooks__ || {}).hasOwnProperty(key) ? this.__modelHooks__[key] : null
                  ov = (this.__data__ = this.__data__ || {}).hasOwnProperty(key) ? this.__data__[key] : void 0

                  if ( hook && (typeof hook.handleInvoke == "function" || typeof hook == "function") )
                    value = invoke(hook, [value])

                  if ( value && value.constructor === Object )
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

                  if ( indexOf( (this.__lastUpdatedKeys__ = this.__lastUpdatedKeys__ || []), key ) == -1 )
                    this.__lastUpdatedKeys__.push(key)

                  clearTimeout(this.__lastUpdateTimer__)
                  this.__lastUpdateTimer__ = setTimeout(function(model){
                      return function(){
                          model.emit("update", model.__lastUpdatedKeys__.splice(0, model.__lastUpdatedKeys__.length))
                      }
                  }(this), 4)
              }
            , getItem: function(){
                  var keys, i, l, hits

                  if ( arguments.length == 1 && typeof arguments[0] == "string" )
                      return this.__data__[arguments[0]]

                  if ( isArray(arguments[0]) )
                    keys = arguments[0]
                  else
                    keys = slice(arguments)

                  for ( hits = [], i = 0, l = keys.length; i < l; i++ )
                    hits[i] = this.__data__[ (typeof keys[i] == "string" ? keys[i] : toType(keys[i])) ]

                  return hits
              }
            , removeItem: function(){
                  var key, hit, ov

                  if ( arguments.length )
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

                  if ( arguments.length == 1 && arguments[0] && arguments[0].constructor === Object )
                    return function(model, hooks, k){
                        for ( k in hooks ) if ( hooks.hasOwnProperty(k) )
                          model.hookItem(k, hooks[k])
                    }(this, arguments[0])

                  key = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
                  handler = arguments[1] && (typeof arguments[1].handleInvoke == "function" || typeof arguments[1] == "function") ? arguments[1]
                          : function(){}

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
                  var M = arguments[0]

                  if ( M && typeof M.hasImplemented == "function" && M.hasImplemented(Model) )
                    return this.__useModel__ = M, true
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

                  for ( i = 0, l = adds.length; i < l; i++ )
                    if ( adds[i] && adds[i].constructor.hasImplemented && adds[i].constructor.hasImplemented(Model) ) {
                      if ( indexOf( this.__models__, adds[i]) == -1 )
                        this.__models__.push(adds[i])
                    } else {
                        m = new this.__useModel__(adds[i])
                        this.__models__.push(m)
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

                  model = arguments[0] && typeof arguments[0].constructor.hasImplemented == "function" && arguments[0].constructor.hasImplemented(Model) ? arguments[0] : null

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
                    (function( attr, keys, i, l ){
                        for ( i = 0, l = keys.length; i < l; i++ )
                          queries.push( { key: keys[i], value: attr[keys[i]] } )
                    }( attributes[i], enumerate(attributes[i]) ))

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

    , View = ns.View = klass(EventEmitter, {
          constructor: function(/*template, data*/){
              var args = slice(arguments)
                , parsedTemplate, k, i, l

              this.__data__ = args[args.length-1] && typeof args[args.length-1].constructor.hasImplemented == "function"
                            && (args[args.length-1].constructor.hasImplemented(Model) || args[args.length-1].constructor.hasImplemented(Collection)) ? args.pop()
                            : args[args.length-1] && args[args.length-1].constructor === Object ? new this.__useModel__(args.pop())
                            : new this.__useModel__
              this.__template__ = typeof args[0] == "string" ? trim(args.shift()) : ""

              parsedTemplate = htmlExpression.parse(this.__template__, this.__data__)

              this.__fragment__ = parsedTemplate.tree
              this.__elements__ = parsedTemplate.assignments

              this.__elements__.root = this.__elements__.root || []
              for ( i = 0, l = this.__fragment__.childNodes.length; i < l; i++ )
                if ( indexOf(this.__elements__.root, this.__fragment__.childNodes[i]) == -1 )
                  this.__elements__.root.push(this.__fragment__.childNodes[i])

              if ( this.__defaultDOMEvents__ )
                this.DOMEvent(this.__defaultDOMEvents__)

          }
        , __useModel__: Model
        , useModel: function(/*M*/){
              var M = arguments[0]

              if ( M && typeof M.hasImplemented == "function" && (M.hasImplemented(Model) || M.hasImplemented(Collection))  )
                return this.__useModel__ = M, true
              return false
          }
        , html: function(){
              if ( !this.__fragment__.childNodes.length )
                this.recover()

              return this.__fragment__
          }
        , recover: function(){
              var i, l

              if ( !this.__fragment__ || this.__fragment__.nodeType !== 11 )
                this.__fragment__ = document.createDocumentFragment()

              for ( i = 0, l = this.__elements__.root; i < l; i++ )
                this.__fragment__.appendChild(this.__elements__.root[i])
          }
        , clone: function(){
              return new this.constructor(this.__template__, this.__data__)
          }
        , element: function(/*ref*/){
              var refs = arguments.length > 1 ? slice(arguments)
                       : isArray(arguments[0]) ? arguments[0]
                       : [arguments[0]]
                , rv = [], i = 0, l = refs.length
                , _ref, _nodes

              for ( ; i < l; i++ ) {
                _ref = typeof refs[i] == "string" ? refs[i] : toType(refs[i])
                _nodes = this.__elements__[_ref]

                if ( _nodes && _nodes.length == 1 )
                  rv[i] = _nodes[0]
                else if ( _nodes )
                  rv[i] = _nodes
                else
                  rv[i] = null
              }

              return rv
          }
        , DOMEvent: function(/*eltRef, event, handler, capture*/){
              var eltRef, elts, event, handler, capture, i, l

              if ( arguments.length <= 2 && arguments[0].constructor == Object )
                return function(view, events, capture, k, i, l){
                    for ( k in events ) if ( events.hasOwnProperty(k) )
                      (function(eltRef, events, k){
                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            view.DOMEvent(eltRef, k, events[k], !!capture)
                      }(k, events[k]))
                }(this, arguments[0], arguments[1])

              eltRef = typeof arguments[0] == "string" ? arguments[0] : toType(arguments[0])
              event = typeof arguments[1] == "string" ? arguments[1] : toType(arguments[1])
              handler = arguments[2] && (typeof arguments[2].handleEvent == "function" || typeof arguments[2] == "function" ) ? arguments[2] : "function"
              capture = !!arguments[3]

              for ( elts = this.__elements__[eltRef], i = 0, l = elts.length; i < l; i++ )
                addEventListener(elts[i], event, handler, capture)
          }
      })

    , StyleSheet = ns.StyleSheet = klass(Promise, function(Super, statics){
          statics.BLOB_COMPAT = function(blob, url){
              try {
                  blob = new Blob([""], { type: "text/plain" })
                  url = URL.createObjectURL(blob)

                  if ( "msClose" in blob )
                    throw new Error
              } catch(e){
                  return 0
              }
              return 1
          }()

          statics.mode = function(blob, node){
              if ( blob )
                return 5

              try {
                  node = document.createElement("style")
                  node.textContent = node.innerText = ""
                  return 3
              } catch(e){}

              return 0
          }( statics.BLOB_COMPAT )

          statics.rlocal = function(){
              return new RegExp([
                  "^"
                , location.protocol, "//"
                , location.hostname
                , "\\S*\\.css($|\\?|#)"
              ].join(""), "i")
          }()

          statics.isLocalCSSFile = function(a){
              return function(url){
                  a.href = url

                  return a.href.match(statics.rlocal)
              }
          }(document.createElement("a"))

          return {
              constructor: function(){
                  var args = slice(arguments)
                    , sheetHandler = args[args.length-1] && (typeof args[args.length-1].handleInvoke == "function" || typeof args[args.length-1] == "function") ? args.pop() : null
                    , startingRules = isArray(args[args.length-1]) ? args.pop() : []
                    , node = function( sheet, _node, node, blob, url ){
                          if ( _node && _node.hasOwnProperty("tagName") && "link, style".indexOf(_node.tagName.toLowerCase()) != -1 )
                            return _node

                          _node = typeof _node == "string" ? _node : toType(_node)

                          if ( statics.isLocalCSSFile(_node) ) {
                            node = function(node){
                                node.rel = "stylesheet"
                                node.href = _node
                            }( document.createElement("link") )

                            sheet.then(function(sheet){
                                var i = 0, l = startingRules.length

                                for ( ; i < l; i++ )
                                  sheet.insertRule(startingRules[i])
                            })

                          } else if ( statics.mode & 1 ) {
                            if ( statics.mode & 4 )
                              blob = new Blob(startingRules, {type: "text/css"}),
                              url = URL.createObjectURL(blob),
                              node = function(node){
                                  node.rel = "stylesheet"
                                  node.href = url
                                  return node
                              }( document.createElement("link") )
                            else
                              node = function(node){
                                  node.textContent = "\n"+startingRules.join("\n")
                                  return node
                              }( document.createElement("style") )

                            domReady.then(function(nodes){
                                nodes.head.appendChild(node)
                            })
                          } else {
                            document.createStyleSheet(),
                            node = { sheet: document.styleSheets[document.styleSheets.length-1] },
                            node.sheet.cssText = startingRules.join("")
                          }

                          return node
                      }( this, args.shift() )

                    this.__stylesheetReady__ = new Promise(function(sheet){
                        return function(resolve){
                            function wait(){
                                if (!node.sheet && !node.styleSheet)
                                  return setTimeout(wait, 4)

                                try {
                                    if ( node.sheet )
                                      node.sheet.cssRules.length
                                    else
                                      node.styleSheet.rules.length
                                } catch(e){
                                  return setTimeout(wait, 4)
                                }

                                sheet.__sheet__ = node.sheet||node.styleSheet
                                resolve(sheet)
                            }
                            wait()
                        }
                    }(this))

                    if ( sheetHandler )
                      this.__stylesheetReady__.then(function(sheet){
                          var insert = function(){
                                  return invoke(sheet.insertRule, arguments, sheet)
                              }
                            , remove = function(){
                                  return invoke(sheet.removeRule, arguments, sheet)
                              }
                            , cssRules = function(){
                                  return invoke(sheet.getCssRules, arguments, sheet)
                              }

                          return function(){
                              invoke(sheetHandler, { $sheet: sheet, $insert: insert, $remove: remove, $cssRules: cssRules, 0: sheet, 1: insert, 2: remove, 3: cssRules, length: 4 })
                          }
                      }(this))

              }
            , insertRule: function(){
                  var rcssrulesplit = /^([^\{]*){(.*)}$/
                  function decomposeRule(cssText){
                      var match = cssText.match(rcssrulesplit)

                      if ( match )
                        return [match[1], match[2]]
                  }

                  return function(){
                      var args, ruleName, cssText

                      if ( arguments[0] && arguments[0].constructor === Object )
                        return function(rules, k){
                            for ( k in rules ) if ( rules.hasOwnProperty(k) )
                              sheet.insertRule(k, rules[k])
                        }(this, arguments[0])

                      if ( isArray(arguments[0]) )
                        return function(rules, i, l){
                            for ( i = 0, l = rules.length; i < l; i++ )
                              invoke(sheet.insertRule, [rules[i]], sheet)
                        }(this, arguments[0])

                      args = slice(arguments)
                      cssText = typeof args[args.length-1] == "string" ? trim(args.pop()) : toType(args.pop())
                      ruleName = typeof args[0] == "string" ? args[0] : null

                      return this.__stylesheetReady__.then(function(sheet){
                          var hasRule = ruleName ? (sheet.__cssRules__=sheet.__cssRules__||{}).hasOwnProperty(ruleName) : false
                            , idx = hasRule ? sheet.__cssRules__[ruleName] : (sheet.__sheet__.cssRules||sheet.__sheet__.rules).length||0

                          if ( hasRule )
                            (sheet.__sheet__.deleteRule||sheet.__sheet__.removeRule)(idx)
                          else if ( ruleName )
                            sheet.__cssRules__[ruleName] = idx

                          if ( statics.mode & 1 )
                            sheet.__sheet__.insertRule(cssText, idx)
                          else
                            invoke(sheet.__sheet__.addRule, [].concat(decomposeRule(cssText)).concat([idx]), sheet)

                          return idx
                      })
                  }
              }()
            , getCssRules: function(){
                  var args = slice(arguments)
                    , cssRulesHandler = args[args.length-1] && (typeof args[args.length-1].handleInvoke == "function" || typeof args[args.length-1] == "function") ? args.pop() : null
                    , ruleName = typeof args[args.length-1] == "string" ? args.pop() : toType(args.pop())
                    , output = new Promise(function(sheet){
                          return function(resolve, reject){
                              sheet.__stylesheetReady__.then(function(){
                                  var idx = (sheet.__cssRules__=sheet.__cssRules__||{}).hasOwnProperty(ruleName) ? sheet.__cssRules__[ruleName] : null

                                  if ( idx )
                                    resolve((sheet.__sheet__.cssRules||sheet.__sheet__.rules)[idx])
                                  else
                                    reject(new ReferenceError)
                              })
                          }
                      }(this))

                  if ( cssRulesHandler )
                    output = output.then(cssRulesHandler)

                  return output
              }
            , deleteRule: function(){
                  var ruleNames = arguments.length > 1 ? slice(arguments)
                                : isArray(arguments[0]) ? arguments[0]
                                : [arguments[0]]

                  return this.__stylesheetReady__.then(function(sheet){
                      for ( var i = 0, e = 0, l = ruleNames.length; i < l; i++ )
                        if ( typeof ruleNames[i] == "string" ) {
                            if ( sheet.__cssRules__.hasOwnProperty(ruleNames[i]) ) {
                              e = e+1

                              if ( statics.mode & 1 )
                                sheet.__sheet__.deleteRule(sheet.__cssRules__[ruleNames[i]])
                              else
                                sheet.__sheet__.removeRule(sheet.__cssRules__[ruleNames[i]])
                            }
                        }
                        else if ( typeof ruleNames == "number" ) {
                            e = e+1,
                            (sheet.__sheet__.deleteRule||sheet.__sheet.removeRule)(ruleNames[i])
                        }

                      return e
                  })
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
              this.__bcr__ = bcr || BCR.getBoundingClientRect(docBody)
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
        , SE: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height - this.__origin__y)) }
        , S: function(){ return new Point(Math.round(this.__bcr__.left + this.__bcr__.width/2 - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height - this.__origin__y)) }
        , SW: function(){ return new Point(Math.round(this.__bcr__.left - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height - this.__origin__y)) }
        , W: function(){ return new Point(Math.round(this.__bcr__.left - this.__origin__.x), Math.round(this.__bcr__.top + this.__bcr__.height/2 - this.__origin__.y)) }
      })

    , BCR = ns.BCR = klass(function(Super, statics){
           function getBoundingClientRect(node){
              var bcr, clientT, clientL, offsetX, offsetY

              bcr = node.getBoundingClientRect()
              clientT = docElt.clientTop || docBody.clientTop || 0
              clientL = docElt.clientLeft || docBody.clientLeft || 0
              offsetX = root.pageXOffset || root.scrollX || docElt.scrollLeft || docBody.scrollLeft || 0
              offsetY = root.pageYOffset || root.scrollY || docElt.scrollTop || docBody.scrollTop || 0

              return {
                  left: node === docElt || node === docBody ? offsetX : bcr.left + offsetX - clientL
                , top: node === docElt || node === docBody ? offsetY : bcr.left + offsetY - clientL
                , width: bcr.width || bcr.right - bcr.left
                , contentWidth: node.scrollWidth
                , height: bcr.height || bcr.bottom - bcr.top
                , contentHeight: node.scrollHeight
              }
          }

          function getEventCoordinates(e){
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
                    , matrixHandler = args[args.length-1] && ( typeof args[args.length-1].handleInvoke == "function" || typeof args[args.length-1] == "function" ) ? args.pop() : null
                    , bcrDict = args[0] && args[0].constructor === Object ? args.shift()
                              : args[0] && args[0].nodeType == 1 ? { node: args.shift() }
                              : { node: document.documentElement }

                  if ( bcrDict.node && bcrDict.node.nodeType == 1 )
                    this.__node__ = bcrDict.node

                  this.__defaultMatrixHandler__ = matrixHandler || function(matrix){ return matrix }
              }
            , compute: function(){
                  var args = slice(arguments)
                    , matrixHandler = args[args.length-1] && ( typeof args[args.length-1].handleInvoke == "function" || typeof args[args.length-1] == "function" ) ? args.pop() : function(matrix){ return matrix }

                    , node = this.__node__
                    , referenceNode = args[args.length-1] && args[args.length-1].nodeType == 1 ? args.pop() : null
                    , referenceEvent = !referenceNode && args[args.length-1] && (typeof args[args.length-1].pageX == "number" || typeof args[args.length-1].clientX == "number") ? args.pop() : null
                    , referenceOrigin = !referenceNode && !referenceEvent && args[args.length-1] && args[args.length-1].hasOwnProperty("x") && args[args.length-1].hasOwnProperty("y") ? args.pop() : null
                    , referenceCardinalPoint = typeof args[args.length-1] == "string" && Matrix.prototype.hasOwnProperty(args[args.length-1]) ? args.pop() : null

                    , output = new Promise(function(resolve){
                          domReady.then(function(){
                              var ncr = getBoundingClientRect(node)
                                , rcr

                              if ( !referenceCardinalPoint ) {
                                if ( referenceEvent )
                                  rcr = getEventCoordinates(referenceEvent)
                                else if ( referenceNode )
                                  rcr = getBoundingClientRect(referenceNode)
                                else if ( referenceOrigin )
                                  rcr = { left: referenceOrigin.x, top: referenceOrigin.y }
                                else
                                  rcr = {left:0, top:0}

                                return resolve( new Matrix(ncr, new Point(rcr.left, rcr.top)) )
                              }

                              return new BCR(referenceNode).compute(function(matrix){
                                  resolve( new Matrix( ncr, matrix[referenceCardinalPoint]()) )
                              })
                          })
                     })

                  if ( this.__defaultMatrixHandler__ )
                    output = output.then(this.__defaultMatrixHandler__)
                  if ( matrixHandler )
                    output = output.then(matrixHandler)

                  return output
              }
          }
      })

    , nodeExpression = ns.nodeExpression = function(){
          var rvars = /@(.*)@/g
            , renclosingquotes = /^"|^'|"$|'$/g

            , operators = {
                  "[^]": function type(stream, input, output){
                      var pile = input.pile
                        , node = pile === "text" ? document.createTextNode("") : document.createElement(pile||"div")

                      output.tree.appendChild(node)
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

                          while ( hit = rvars.exec(rawId), hit )
                            if ( indexOf(vars, hit) == -1 )
                              vars.push(hit)

                          if ( vars.length )
                            onupdate = function(keys){
                                var i, l, hit, str = rawId, _val

                                for ( i = 0, l = keys.length; i < l; i++ )
                                  if ( indexOf(vars, keys[i]) ) {
                                      hit = true
                                      break
                                  }

                                if ( hit )
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    _val =  model.getItem(vars[i][1])

                                    str = str.replace(vars[i][0], typeof _val !== "undefined" && _val !== null ? _val : vars[i][0])
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
                      function write(node, rawClassName){
                          node.setAttribute("class", escapeHTML(rawClassName))
                      }

                      function set(node, rawClassName, model){
                          var vars = []
                            , hit, onupdate

                            while ( hit = rvars.exec(rawClassName), hit )
                              if ( indexOf(vars, hit) == -1 )
                                vars.push(hit)

                            if ( vars.length )
                              onupdate = function(keys){
                                  var i, l, hit, str = rawClassName, _val

                                  for ( i = 0, l = keys.length; i < l; i++ )
                                    if ( indexOf(vars, keys[i]) ) {
                                        hit = true
                                        break
                                    }

                                  if ( hit )
                                    for ( i = 0, l = vars.length; i < l; i++ ) {
                                      _val =  model.getItem(vars[i][1])

                                      str = str.replace(vars[i][0], typeof _val !== "undefined" && _val !== null ? _val : vars[i][0])
                                    }

                                  write(node, str)

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

                          while ( hit = rvars.exec(rawValue), hit )
                            if ( indexOf(vars, hit) == -1 )
                              vars.push(hit)

                          if ( vars.length )
                            onupdate = function(keys){
                                var i, l, hit, str = rawValue, _val

                                for ( i = 0, l = keys.length; i < l; i++ )
                                  if ( indexOf(vars, keys[i]) ) {
                                      hit = true
                                      break
                                  }

                                if ( hit )
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    _val =  model.getItem(vars[i][1])

                                    str = str.replace(vars[i][0], typeof _val !== "undefined" && _val !== null ? _val : vars[i][0])
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

                          while ( hit = rvars.exec(rawTextContent), hit )
                            if ( indexOf(vars, hit) == -1 )
                              vars.push(hit)

                          if ( vars.length )
                            onupdate = function(keys){
                                var i, l, hit, str = rawTextContent, _val

                                for ( i = 0, l = keys.length; i < l; i++ )
                                  if ( indexOf(vars, keys[i]) ) {
                                      hit = true
                                      break
                                  }

                                if ( hit )
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    _val =  model.getItem(vars[i][1])
                                    str = str.replace(vars[i][0], typeof _val !== "undefined" && _val !== null ? _val : vars[i][0])
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
                        if ( input.operator !== "{" )
                          break
                    case "\\" :
                        input.forceNextOperandAsSymbol = true
                        break
                    default:
                        input.pile += operand
                        input.forceNextOperandAsSymbol = false
                  }

                  return invoke(read, arguments)
              }

          return {
              parse: function(/*expression, data*/){
                  var args = slice(arguments)
                    , expression = typeof args[0] == "string" ? args.shift() : ""
                    , data = args[args.length-1] && typeof args[args.length-1].constructor.hasImplemented == "function"
                           && (args[args.length-1].constructor.hasImplemented(Model) || args[args.length-1].constructor.hasImplemented(Collection)) ? args.pop()
                           : args[args.length-1] && args[args.length-1].constructor === Object ? new Model(args.pop())
                           : new Model()
                    , stream
                    , output = { tree: document.createDocumentFragment() }
                    , input = { data: data, pile: "", operator: "[^]", context: output.tree }
                    , models, i, l, _fragment

                  if ( expression[0] == "*" ) {
                      expression = expression.slice(1)

                      if ( data.constructor.hasImplemented(Collection) ) {
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
          var createSubTree = function(){

              }
            , createNode = function(){

              }
            , operators = {
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
                        input.forceNextOperandAsSymbol = true
                        break
                    default:
                        input.pile += operand
                        input.forceNextOperandAsSymbol = false
                  }

                  return invoke(read, arguments)
              }

          return {
              parse: function(/*expression, data*/){
                  var args = slice(arguments)
                    , expression = typeof args[0] == "string" ? args.shift() : ""
                    , data = args[args.length-1] && typeof args[args.length-1].constructor.hasImplemented == "function"
                           && (args[args.length-1].constructor.hasImplemented(Model) || args[args.length-1].constructor.hasImplemented(Collection)) ? args.pop()
                           : args[args.length-1] && args[args.length-1].constructor === Object ? new Model(args.pop())
                           : new Model()
                    , stream = new Iterator(expression)
                    , output = { assignments: {}, tree: document.createDocumentFragment() }
                    , input = { data: data, pile: "", buffer: null, operator: "[^]", context: output.tree }

                  return invoke(read, [stream, input, output])
              }
          }
      }()


    , addEventListener = ns.addEventListener = function(AEL){
          return function(node, events, eventHandler, capture){
              var events = events.split(" ")
                , i = 0, l = events.length
                , _hooked

              for ( ; i < l; i++ ) {

                  AEL ? node.addEventListener(events[i], eventHandler, !!capture)
                      : node.attachEvent("on"+events[i], function(){
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
                        }())
              }

          }
      }( "addEventListener" in window )

    , removeEventListener = ns.removeEventListener = function(REL){
          return function(node, events, eventHandler, capture){
              var events = events.split(" ")
                , i = 0, l = events.length

              for ( ; i < l; i++ ) {

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
              })
          }

          function onreadystatechange(){
              if ( document.readyState === "complete" )
                onready()
          }

          var ready = 0

          if ( "readyState" in document ) {
            if ( document.readyState === "complete" )
              resolve()
          } else setTimeout(onready, 4)

          addEventListener(root, "DOMContentLoaded", onready, true)
          addEventListener(root, "load", onready, true)
          addEventListener(document, "readystatechange", onreadystatechange, true)
      })

    root.sleipnir = function(k){
        function sleipnir(){
            if ( arguments[0] && (typeof arguments[0].handleInvoke == "function" || typeof arguments[0] == "function") )
            return domReady.then(function(fn){
                return function(nodes){
                    return invoke(fn, { $: sleipnir, $$: sleipnir.dom, 0: nodes, length: 1 })
                }
            }(arguments[0]))
        }

        for ( k in ns ) if ( ns.hasOwnProperty(k) )
          sleipnir[k] = ns[k]

        return sleipnir
    }()

}(window, { version: "ES3-0.6.1" }));