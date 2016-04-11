/*! 
* DevExtreme (Core Library)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!window.DevExpress) {
    /*! Module core, file devexpress.js */
    (function($, global, undefined) {
        (function checkjQueryVersion(version) {
            version = version.split(".");
            if (version[0] < 1 || version[0] == 1 && version[1] < 10)
                throw Error("Your version of jQuery is too old. Please upgrade jQuery to 1.10.0 or later.");
        })($.fn.jquery);
        var Class = function() {
                var wrapOverridden = function(baseProto, methodName, method) {
                        return function() {
                                var prevCallBase = this.callBase;
                                this.callBase = baseProto[methodName];
                                try {
                                    return method.apply(this, arguments)
                                }
                                finally {
                                    this.callBase = prevCallBase
                                }
                            }
                    };
                var clonePrototype = function(obj) {
                        var func = function(){};
                        func.prototype = obj.prototype;
                        return new func
                    };
                var classImpl = function(){};
                var redefine = function(members) {
                        var that = this;
                        if (!members)
                            return that;
                        var memberNames = $.map(members, function(_, k) {
                                return k
                            });
                        $.each(["toString", "toLocaleString", "valueOf"], function() {
                            if (members[this])
                                memberNames.push(this)
                        });
                        $.each(memberNames, function() {
                            var overridden = $.isFunction(that.prototype[this]) && $.isFunction(members[this]);
                            that.prototype[this] = overridden ? wrapOverridden(that.parent.prototype, this, members[this]) : members[this]
                        });
                        return that
                    };
                var include = function() {
                        var classObj = this;
                        $.each(arguments, function() {
                            if (this.ctor)
                                classObj._includedCtors.push(this.ctor);
                            for (var name in this) {
                                if (name === "ctor")
                                    continue;
                                if (name in classObj.prototype)
                                    throw Error("Member name collision: " + name);
                                classObj.prototype[name] = this[name]
                            }
                        });
                        return classObj
                    };
                var subclassOf = function(parentClass) {
                        if (this.parent === parentClass)
                            return true;
                        if (!this.parent || !this.parent.subclassOf)
                            return false;
                        return this.parent.subclassOf(parentClass)
                    };
                classImpl.inherit = function(members) {
                    var inheritor = function() {
                            if (!this || this === global || typeof this.constructor !== "function")
                                throw Error("A class must be instantiated using the 'new' keyword");
                            var instance = this,
                                ctor = instance.ctor;
                            if (ctor)
                                ctor.apply(instance, arguments);
                            $.each(instance.constructor._includedCtors, function() {
                                this.call(instance)
                            })
                        };
                    inheritor.prototype = clonePrototype(this);
                    inheritor.inherit = this.inherit;
                    inheritor.redefine = redefine;
                    inheritor.include = include;
                    inheritor.subclassOf = subclassOf;
                    inheritor.parent = this;
                    inheritor._includedCtors = this._includedCtors ? this._includedCtors.slice(0) : [];
                    inheritor.prototype.constructor = inheritor;
                    inheritor.redefine(members);
                    return inheritor
                };
                return classImpl
            }();
        function createQueue(discardPendingTasks) {
            var _tasks = [],
                _busy = false;
            function exec() {
                while (_tasks.length) {
                    _busy = true;
                    var task = _tasks.shift(),
                        result = task();
                    if (result === undefined)
                        continue;
                    if (result.then) {
                        $.when(result).always(exec);
                        return
                    }
                    throw Error("Queued task returned unexpected result");
                }
                _busy = false
            }
            function add(task, removeTaskCallback) {
                if (!discardPendingTasks)
                    _tasks.push(task);
                else {
                    if (_tasks[0] && removeTaskCallback)
                        removeTaskCallback(_tasks[0]);
                    _tasks = [task]
                }
                if (!_busy)
                    exec()
            }
            function busy() {
                return _busy
            }
            return {
                    add: add,
                    busy: busy
                }
        }
        var parseUrl = function() {
                var a = document.createElement("a"),
                    props = ["protocol", "hostname", "port", "pathname", "search", "hash"];
                var normalizePath = function(value) {
                        if (value.charAt(0) !== "/")
                            value = "/" + value;
                        return value
                    };
                return function(url) {
                        a.href = url;
                        var result = {};
                        $.each(props, function() {
                            result[this] = a[this]
                        });
                        result.pathname = normalizePath(result.pathname);
                        return result
                    }
            }();
        global.DevExpress = global.DevExpress || {};
        var enqueueAsync = function(task) {
                var deferred = $.Deferred();
                setTimeout(function() {
                    deferred.resolve(task())
                }, 60);
                return deferred
            };
        var hideTopOverlayCallback = function() {
                var callbacks = [];
                return {
                        add: function(callback) {
                            var indexOfCallback = $.inArray(callback, callbacks);
                            if (indexOfCallback === -1)
                                callbacks.push(callback)
                        },
                        remove: function(callback) {
                            var indexOfCallback = $.inArray(callback, callbacks);
                            if (indexOfCallback !== -1)
                                callbacks.splice(indexOfCallback, 1)
                        },
                        fire: function() {
                            var callback = callbacks.pop(),
                                result = !!callback;
                            if (result)
                                callback();
                            return result
                        },
                        hasCallback: function() {
                            return callbacks.length > 0
                        },
                        reset: function() {
                            callbacks = []
                        }
                    }
            }();
        var overlayTargetContainer = function() {
                var defaultTargetContainer = "body";
                return function(targetContainer) {
                        if (arguments.length)
                            defaultTargetContainer = targetContainer;
                        return defaultTargetContainer
                    }
            }();
        $.extend(global.DevExpress, {
            VERSION: "14.1.7",
            abstract: function() {
                throw Error("Not implemented");
            },
            Class: Class,
            createQueue: createQueue,
            enqueue: createQueue().add,
            enqueueAsync: enqueueAsync,
            parseUrl: parseUrl,
            hideTopOverlayCallback: hideTopOverlayCallback,
            hardwareBackButton: $.Callbacks(),
            overlayTargetContainer: overlayTargetContainer,
            rtlEnabled: false
        })
    })(jQuery, this);
    /*! Module core, file inflector.js */
    (function($, DX, undefined) {
        var _normalize = function(text) {
                if (text === undefined || text === null)
                    return "";
                return String(text)
            };
        var _ucfirst = function(text) {
                return _normalize(text).charAt(0).toUpperCase() + text.substr(1)
            };
        var _chop = function(text) {
                return _normalize(text).replace(/([a-z\d])([A-Z])/g, "$1 $2").split(/[\s_-]+/)
            };
        var dasherize = function(text) {
                return $.map(_chop(text), function(p) {
                        return p.toLowerCase()
                    }).join("-")
            };
        var underscore = function(text) {
                return dasherize(text).replace(/-/g, "_")
            };
        var camelize = function(text, upperFirst) {
                return $.map(_chop(text), function(p, i) {
                        p = p.toLowerCase();
                        if (upperFirst || i > 0)
                            p = _ucfirst(p);
                        return p
                    }).join("")
            };
        var humanize = function(text) {
                return _ucfirst(dasherize(text).replace(/-/g, " "))
            };
        var titleize = function(text) {
                return $.map(_chop(text), function(p) {
                        return _ucfirst(p.toLowerCase())
                    }).join(" ")
            };
        DX.inflector = {
            dasherize: dasherize,
            camelize: camelize,
            humanize: humanize,
            titleize: titleize,
            underscore: underscore
        }
    })(jQuery, DevExpress);
    /*! Module core, file utils.common.js */
    (function($, DX, undefined) {
        var isDefined = function(object) {
                return object !== null && object !== undefined
            };
        var isString = function(object) {
                return $.type(object) === 'string'
            };
        var isNumber = function(object) {
                return typeof object === "number" && isFinite(object) || $.isNumeric(object)
            };
        var isObject = function(object) {
                return $.type(object) === 'object'
            };
        var isArray = function(object) {
                return $.type(object) === 'array'
            };
        var isDate = function(object) {
                return $.type(object) === 'date'
            };
        var isFunction = function(object) {
                return $.type(object) === 'function'
            };
        var isExponential = function(value) {
                return isNumber(value) && value.toString().indexOf('e') !== -1
            };
        var extendFromObject = function(target, source, overrideExistingValues) {
                target = target || {};
                for (var prop in source)
                    if (source.hasOwnProperty(prop)) {
                        var value = source[prop];
                        if (!(prop in target) || overrideExistingValues)
                            target[prop] = value
                    }
                return target
            };
        var clone = function() {
                function Clone(){}
                return function(obj) {
                        Clone.prototype = obj;
                        return new Clone
                    }
            }();
        var executeAsync = function(action, context) {
                var deferred = $.Deferred(),
                    normalizedContext = context || this;
                setTimeout(function() {
                    var result = action.call(normalizedContext);
                    if (result && result.done && $.isFunction(result.done))
                        result.done(function() {
                            deferred.resolveWith(normalizedContext)
                        });
                    else
                        deferred.resolveWith(normalizedContext)
                }, 0);
                return deferred.promise()
            };
        var stringFormat = function() {
                var s = arguments[0];
                for (var i = 0; i < arguments.length - 1; i++) {
                    var reg = new RegExp("\\{" + i + "\\}", "gm");
                    s = s.replace(reg, arguments[i + 1])
                }
                return s
            };
        var findBestMatches = function(targetFilter, items, mapFn) {
                var bestMatches = [],
                    maxMatchCount = 0;
                $.each(items, function(index, itemSrc) {
                    var matchCount = 0,
                        item = mapFn ? mapFn(itemSrc) : itemSrc;
                    $.each(targetFilter, function(paramName) {
                        var value = item[paramName];
                        if (value === undefined)
                            return;
                        if (value === targetFilter[paramName]) {
                            matchCount++;
                            return
                        }
                        matchCount = -1;
                        return false
                    });
                    if (matchCount < maxMatchCount)
                        return;
                    if (matchCount > maxMatchCount) {
                        bestMatches.length = 0;
                        maxMatchCount = matchCount
                    }
                    bestMatches.push(itemSrc)
                });
                return bestMatches
            };
        var preg_quote = function(str) {
                return (str + "").replace(/([\+\*\?\\\.\[\^\]\$\(\)\{\}\>\<\|\=\!\:])/g, "\\$1")
            };
        var replaceAll = function(text, searchToken, replacementToken) {
                return text.replace(new RegExp("(" + preg_quote(searchToken) + ")", "gi"), replacementToken)
            };
        var splitPair = function(raw) {
                switch (typeof raw) {
                    case"string":
                        return raw.split(/\s+/, 2);
                    case"object":
                        return [raw.x || raw.h, raw.y || raw.v];
                    case"number":
                        return [raw];
                    default:
                        return raw
                }
            };
        var stringPairToObject = function(raw) {
                var pair = splitPair(raw),
                    x = parseInt(pair && pair[0], 10),
                    y = parseInt(pair && pair[1], 10);
                if (!isFinite(x))
                    x = 0;
                if (!isFinite(y))
                    y = x;
                return {
                        x: x,
                        y: y
                    }
            };
        function icontains(elem, text) {
            var result = false;
            $.each($(elem).contents(), function(index, content) {
                if (content.nodeType === 3 && (content.textContent || content.nodeValue || "").toLowerCase().indexOf((text || "").toLowerCase()) > -1) {
                    result = true;
                    return false
                }
            });
            return result
        }
        $.expr[":"].dxicontains = $.expr.createPseudo(function(text) {
            return function(elem) {
                    return icontains(elem, text)
                }
        });
        function deepExtendArraySafe(target, changes) {
            var prevValue,
                newValue;
            for (var name in changes) {
                prevValue = target[name];
                newValue = changes[name];
                if (target === newValue)
                    continue;
                if ($.isPlainObject(newValue) && !(newValue instanceof $.Event))
                    target[name] = deepExtendArraySafe($.isPlainObject(prevValue) ? prevValue : {}, newValue);
                else if (newValue !== undefined)
                    target[name] = newValue
            }
            return target
        }
        function unwrapObservable(value) {
            if (DX.support.hasKo)
                return ko.utils.unwrapObservable(value);
            return value
        }
        DX.utils = {
            isDefined: isDefined,
            isString: isString,
            isNumber: isNumber,
            isObject: isObject,
            isArray: isArray,
            isDate: isDate,
            isFunction: isFunction,
            isExponential: isExponential,
            extendFromObject: extendFromObject,
            clone: clone,
            executeAsync: executeAsync,
            stringFormat: stringFormat,
            findBestMatches: findBestMatches,
            replaceAll: replaceAll,
            deepExtendArraySafe: deepExtendArraySafe,
            splitPair: splitPair,
            stringPairToObject: stringPairToObject,
            unwrapObservable: unwrapObservable
        }
    })(jQuery, DevExpress);
    /*! Module core, file utils.console.js */
    (function($, DX, undefined) {
        var logger = function() {
                var console = window.console;
                function info(text) {
                    if (!console || !$.isFunction(console.info))
                        return;
                    console.info(text)
                }
                function warn(text) {
                    if (!console || !$.isFunction(console.warn))
                        return;
                    console.warn(text)
                }
                function error(text) {
                    if (!console || !$.isFunction(console.error))
                        return;
                    console.error(text)
                }
                return {
                        info: info,
                        warn: warn,
                        error: error
                    }
            }();
        var debug = function() {
                function assert(condition, message) {
                    if (!condition)
                        throw new Error(message);
                }
                function assertParam(parameter, message) {
                    assert(parameter !== null && parameter !== undefined, message)
                }
                return {
                        assert: assert,
                        assertParam: assertParam
                    }
            }();
        $.extend(DX.utils, {
            logger: logger,
            debug: debug
        })
    })(jQuery, DevExpress);
    /*! Module core, file utils.math.js */
    (function($, DX, undefined) {
        var PI = Math.PI,
            LN10 = Math.LN10;
        var cos = Math.cos,
            sin = Math.sin,
            abs = Math.abs,
            log = Math.log,
            floor = Math.floor,
            ceil = Math.ceil,
            max = Math.max,
            min = Math.min,
            isNaN = window.isNaN,
            Number = window.Number,
            NaN = window.NaN;
        var isNumber = DX.utils.isNumber,
            isExponential = DX.utils.isExponential;
        var getPrecision = function(value) {
                var stringFraction,
                    stringValue = value.toString(),
                    pointIndex = stringValue.indexOf('.'),
                    startIndex,
                    precision;
                if (isExponential(value)) {
                    precision = getDecimalOrder(value);
                    if (precision < 0)
                        return Math.abs(precision);
                    else
                        return 0
                }
                if (pointIndex !== -1) {
                    startIndex = pointIndex + 1;
                    stringFraction = stringValue.substring(startIndex, startIndex + 20);
                    return stringFraction.length
                }
                return 0
            };
        var getLog = function(value, base) {
                if (!value)
                    return 0;
                return Math.log(value) / Math.log(base)
            };
        var raiseTo = function(power, base) {
                return Math.pow(base, power)
            };
        var sign = function(value) {
                if (value === 0)
                    return 0;
                return value / abs(value)
            };
        var normalizeAngle = function(angle) {
                return (angle % 360 + 360) % 360
            };
        var convertAngleToRendererSpace = function(angle) {
                return 90 - angle
            };
        var degreesToRadians = function(value) {
                return PI * value / 180
            };
        var getCosAndSin = function(angle) {
                var angleInRadians = degreesToRadians(angle);
                return {
                        cos: cos(angleInRadians),
                        sin: sin(angleInRadians)
                    }
            };
        var DECIMAL_ORDER_THRESHOLD = 1E-14;
        var getDecimalOrder = function(number) {
                var n = abs(number),
                    cn;
                if (!isNaN(n)) {
                    if (n > 0) {
                        n = log(n) / LN10;
                        cn = ceil(n);
                        return cn - n < DECIMAL_ORDER_THRESHOLD ? cn : floor(n)
                    }
                    return 0
                }
                return NaN
            };
        var getAppropriateFormat = function(start, end, count) {
                var order = max(getDecimalOrder(start), getDecimalOrder(end)),
                    precision = -getDecimalOrder(abs(end - start) / count),
                    format;
                if (!isNaN(order) && !isNaN(precision)) {
                    if (abs(order) <= 4) {
                        format = 'fixedPoint';
                        precision < 0 && (precision = 0);
                        precision > 4 && (precision = 4)
                    }
                    else {
                        format = 'exponential';
                        precision += order - 1;
                        precision > 3 && (precision = 3)
                    }
                    return {
                            format: format,
                            precision: precision
                        }
                }
                return null
            };
        var getFraction = function(value) {
                var valueString,
                    dotIndex;
                if (isNumber(value)) {
                    valueString = value.toString();
                    dotIndex = valueString.indexOf('.');
                    if (dotIndex >= 0)
                        if (isExponential(value))
                            return valueString.substr(dotIndex + 1, valueString.indexOf('e') - dotIndex - 1);
                        else {
                            valueString = value.toFixed(20);
                            return valueString.substr(dotIndex + 1, valueString.length - dotIndex + 1)
                        }
                }
                return ''
            };
        var getSignificantDigitPosition = function(value) {
                var fraction = getFraction(value),
                    i;
                if (fraction)
                    for (i = 0; i < fraction.length; i++)
                        if (fraction.charAt(i) !== '0')
                            return i + 1;
                return 0
            };
        var adjustValue = function(value) {
                var fraction = getFraction(value),
                    nextValue,
                    i;
                if (fraction)
                    for (i = 1; i <= fraction.length; i++) {
                        nextValue = roundValue(value, i);
                        if (nextValue !== 0 && fraction[i - 2] && fraction[i - 1] && fraction[i - 2] === fraction[i - 1])
                            return nextValue
                    }
                return value
            };
        var roundValue = function(value, precision) {
                if (precision > 20)
                    precision = 20;
                if (isNumber(value))
                    if (isExponential(value))
                        return Number(value.toExponential(precision));
                    else
                        return Number(value.toFixed(precision))
            };
        var applyPrecisionByMinDelta = function(min, delta, value) {
                var minPrecision = getPrecision(min),
                    deltaPrecision = getPrecision(delta);
                return roundValue(value, minPrecision < deltaPrecision ? deltaPrecision : minPrecision)
            };
        $.extend(DX.utils, {
            getLog: getLog,
            raiseTo: raiseTo,
            sign: sign,
            normalizeAngle: normalizeAngle,
            convertAngleToRendererSpace: convertAngleToRendererSpace,
            degreesToRadians: degreesToRadians,
            getCosAndSin: getCosAndSin,
            getDecimalOrder: getDecimalOrder,
            getAppropriateFormat: getAppropriateFormat,
            getFraction: getFraction,
            adjustValue: adjustValue,
            roundValue: roundValue,
            applyPrecisionByMinDelta: applyPrecisionByMinDelta,
            getSignificantDigitPosition: getSignificantDigitPosition
        });
        DX.utils.getPrecision = getPrecision
    })(jQuery, DevExpress);
    /*! Module core, file utils.date.js */
    (function($, DX, undefined) {
        var isObject = DX.utils.isObject,
            isString = DX.utils.isString,
            isDate = DX.utils.isDate;
        var dateUnitIntervals = ['millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'];
        var addSubValues = function(value1, value2, isSub) {
                return value1 + (isSub ? -1 : 1) * value2
            };
        var toMilliseconds = function(value) {
                switch (value) {
                    case'millisecond':
                        return 1;
                    case'second':
                        return toMilliseconds('millisecond') * 1000;
                    case'minute':
                        return toMilliseconds('second') * 60;
                    case'hour':
                        return toMilliseconds('minute') * 60;
                    case'day':
                        return toMilliseconds('hour') * 24;
                    case'week':
                        return toMilliseconds('day') * 7;
                    case'month':
                        return toMilliseconds('day') * 30;
                    case'quarter':
                        return toMilliseconds('month') * 3;
                    case'year':
                        return toMilliseconds('day') * 365;
                    default:
                        return 0
                }
            };
        function parseISO8601(isoString) {
            var result = new Date(0);
            var chunks = isoString.replace("Z", "").split("T"),
                date = String(chunks[0]).split("-"),
                time = String(chunks[1]).split(":");
            var year,
                month,
                day,
                hours,
                minutes,
                seconds,
                milliseconds;
            year = Number(date[0]);
            month = Number(date[1]) - 1;
            day = Number(date[2]);
            result.setUTCDate(day);
            result.setUTCMonth(month);
            result.setUTCFullYear(year);
            if (time.length) {
                hours = Number(time[0]);
                minutes = Number(time[1]);
                seconds = Number(String(time[2]).split(".")[0]);
                milliseconds = Number(String(time[2]).split(".")[1]) || 0;
                result.setUTCHours(hours);
                result.setUTCMinutes(minutes);
                result.setUTCSeconds(seconds);
                result.setUTCMilliseconds(milliseconds)
            }
            return result
        }
        function formatISO8601(date) {
            function pad(n) {
                if (n < 10)
                    return "0".concat(n);
                return String(n)
            }
            return [date.getFullYear(), "-", pad(date.getMonth() + 1), "-", pad(date.getDate()), "T", pad(date.getHours()), ":", pad(date.getMinutes()), ":", pad(date.getSeconds()), "Z"].join("")
        }
        var convertMillisecondsToDateUnits = function(value) {
                var i,
                    dateUnitCount,
                    dateUnitInterval,
                    dateUnitIntervals = ['millisecond', 'second', 'minute', 'hour', 'day', 'month', 'year'],
                    result = {};
                for (i = dateUnitIntervals.length - 1; i >= 0; i--) {
                    dateUnitInterval = dateUnitIntervals[i];
                    dateUnitCount = Math.floor(value / toMilliseconds(dateUnitInterval));
                    if (dateUnitCount > 0) {
                        result[dateUnitInterval + 's'] = dateUnitCount;
                        value -= convertDateUnitToMilliseconds(dateUnitInterval, dateUnitCount)
                    }
                }
                return result
            };
        var convertDateTickIntervalToMilliseconds = function(tickInterval) {
                var milliseconds = 0;
                if (isObject(tickInterval))
                    $.each(tickInterval, function(key, value) {
                        milliseconds += convertDateUnitToMilliseconds(key.substr(0, key.length - 1), value)
                    });
                if (isString(tickInterval))
                    milliseconds = convertDateUnitToMilliseconds(tickInterval, 1);
                return milliseconds
            };
        var convertDateUnitToMilliseconds = function(dateUnit, count) {
                return toMilliseconds(dateUnit) * count
            };
        var getDateUnitInterval = function(tickInterval) {
                var maxInterval = -1,
                    i;
                if (isString(tickInterval))
                    return tickInterval;
                if (isObject(tickInterval)) {
                    $.each(tickInterval, function(key, value) {
                        for (i = 0; i < dateUnitIntervals.length; i++)
                            if (value && (key === dateUnitIntervals[i] + 's' || key === dateUnitIntervals[i]) && maxInterval < i)
                                maxInterval = i
                    });
                    return dateUnitIntervals[maxInterval]
                }
                return ''
            };
        var correctDateWithUnitBeginning = function(date, dateInterval) {
                var dayMonth,
                    firstQuarterMonth,
                    dateUnitInterval = getDateUnitInterval(dateInterval);
                switch (dateUnitInterval) {
                    case'second':
                        date.setMilliseconds(0);
                        break;
                    case'minute':
                        date.setSeconds(0, 0);
                        break;
                    case'hour':
                        date.setMinutes(0, 0, 0);
                        break;
                    case'year':
                        date.setMonth(0);
                    case'month':
                        date.setDate(1);
                    case'day':
                        date.setHours(0, 0, 0, 0);
                        break;
                    case'week':
                        dayMonth = date.getDate();
                        if (date.getDay() !== 0)
                            dayMonth += 7 - date.getDay();
                        date.setDate(dayMonth);
                        date.setHours(0, 0, 0, 0);
                        break;
                    case'quarter':
                        firstQuarterMonth = DX.formatHelper.getFirstQuarterMonth(date.getMonth());
                        if (date.getMonth() !== firstQuarterMonth)
                            date.setMonth(firstQuarterMonth);
                        date.setDate(1);
                        date.setHours(0, 0, 0, 0);
                        break
                }
            };
        var getDatesDifferences = function(date1, date2) {
                var differences,
                    counter = 0;
                differences = {
                    year: date1.getFullYear() !== date2.getFullYear(),
                    month: date1.getMonth() !== date2.getMonth(),
                    day: date1.getDate() !== date2.getDate(),
                    hour: date1.getHours() !== date2.getHours(),
                    minute: date1.getMinutes() !== date2.getMinutes(),
                    second: date1.getSeconds() !== date2.getSeconds()
                };
                $.each(differences, function(key, value) {
                    if (value)
                        counter++
                });
                differences.count = counter;
                return differences
            };
        var addInterval = function(value, interval, isNegative) {
                var result = null,
                    intervalObject;
                if (isDate(value)) {
                    intervalObject = isString(interval) ? getDateIntervalByString(interval.toLowerCase()) : interval;
                    result = new Date(value.getTime());
                    if (intervalObject.years)
                        result.setFullYear(addSubValues(result.getFullYear(), intervalObject.years, isNegative));
                    if (intervalObject.quarters)
                        result.setMonth(addSubValues(result.getMonth(), 3 * intervalObject.quarters, isNegative));
                    if (intervalObject.months)
                        result.setMonth(addSubValues(result.getMonth(), intervalObject.months, isNegative));
                    if (intervalObject.weeks)
                        result.setDate(addSubValues(result.getDate(), 7 * intervalObject.weeks, isNegative));
                    if (intervalObject.days)
                        result.setDate(addSubValues(result.getDate(), intervalObject.days, isNegative));
                    if (intervalObject.hours)
                        result.setHours(addSubValues(result.getHours(), intervalObject.hours, isNegative));
                    if (intervalObject.minutes)
                        result.setMinutes(addSubValues(result.getMinutes(), intervalObject.minutes, isNegative));
                    if (intervalObject.seconds)
                        result.setSeconds(addSubValues(result.getSeconds(), intervalObject.seconds, isNegative));
                    if (intervalObject.milliseconds)
                        result.setMilliseconds(addSubValues(value.getMilliseconds(), intervalObject.milliseconds, isNegative))
                }
                else
                    result = addSubValues(value, interval, isNegative);
                return result
            };
        var getDateIntervalByString = function(intervalString) {
                var result = {};
                switch (intervalString) {
                    case'year':
                        result.years = 1;
                        break;
                    case'month':
                        result.months = 1;
                        break;
                    case'quarter':
                        result.months = 3;
                        break;
                    case'week':
                        result.days = 7;
                        break;
                    case'day':
                        result.days = 1;
                        break;
                    case'hour':
                        result.hours = 1;
                        break;
                    case'minute':
                        result.minutes = 1;
                        break;
                    case'second':
                        result.seconds = 1;
                        break;
                    case'millisecond':
                        result.milliseconds = 1;
                        break
                }
                return result
            };
        var sameMonthAndYear = function(date1, date2) {
                return date1 && date2 && date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
            };
        var getFirstMonthDate = function(date) {
                return new Date(date.getFullYear(), date.getMonth(), 1)
            };
        var dateInRange = function(date, min, max) {
                return normalizeDate(date, min, max) === date
            };
        var normalizeDate = function(date, min, max) {
                var normalizedDate = date;
                if (date < min)
                    normalizedDate = min;
                else if (date > max)
                    normalizedDate = max;
                return normalizedDate
            };
        var getPower = function(value) {
                return value.toExponential().split("e")[1]
            };
        $.extend(DX.utils, {
            dateUnitIntervals: dateUnitIntervals,
            parseIso8601Date: parseISO8601,
            formatIso8601Date: formatISO8601,
            convertMillisecondsToDateUnits: convertMillisecondsToDateUnits,
            convertDateTickIntervalToMilliseconds: convertDateTickIntervalToMilliseconds,
            convertDateUnitToMilliseconds: convertDateUnitToMilliseconds,
            getDateUnitInterval: getDateUnitInterval,
            getDatesDifferences: getDatesDifferences,
            correctDateWithUnitBeginning: correctDateWithUnitBeginning,
            addInterval: addInterval,
            getDateIntervalByString: getDateIntervalByString,
            sameMonthAndYear: sameMonthAndYear,
            getFirstMonthDate: getFirstMonthDate,
            dateInRange: dateInRange,
            normalizeDate: normalizeDate,
            getPower: getPower
        })
    })(jQuery, DevExpress);
    /*! Module core, file utils.dom.js */
    (function($, DX, undefined) {
        var IOS_APP_BAR_HEIGHT = "20px";
        var timeRedrawOnResize = 100;
        var createResizeHandler = function(callback) {
                var $window = $(window),
                    timeout;
                var debug_callback = arguments[1];
                var handler = function() {
                        var width = $window.width(),
                            height = $window.height();
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            $window.width() === width && $window.height() === height && callback();
                            debug_callback && debug_callback()
                        }, timeRedrawOnResize)
                    };
                handler.stop = function() {
                    clearTimeout(timeout);
                    return this
                };
                return handler
            };
        var windowResizeCallbacks = function() {
                var prevSize,
                    callbacks = $.Callbacks(),
                    jqWindow = $(window),
                    resizeEventHandlerAttached = false,
                    originalCallbacksAdd = callbacks.add,
                    originalCallbacksRemove = callbacks.remove;
                var formatSize = function() {
                        return [jqWindow.width(), jqWindow.height()].join()
                    };
                var handleResize = function() {
                        var now = formatSize();
                        if (now === prevSize)
                            return;
                        prevSize = now;
                        setTimeout(callbacks.fire)
                    };
                prevSize = formatSize();
                callbacks.add = function() {
                    var result = originalCallbacksAdd.apply(callbacks, arguments);
                    if (!resizeEventHandlerAttached && callbacks.has()) {
                        jqWindow.on("resize", handleResize);
                        resizeEventHandlerAttached = true
                    }
                    return result
                };
                callbacks.remove = function() {
                    var result = originalCallbacksRemove.apply(callbacks, arguments);
                    if (!callbacks.has() && resizeEventHandlerAttached) {
                        jqWindow.off("resize", handleResize);
                        resizeEventHandlerAttached = false
                    }
                    return result
                };
                return callbacks
            }();
        var resetActiveElement = function() {
                var activeElement = document.activeElement;
                if (activeElement && activeElement !== document.body && activeElement.blur)
                    activeElement.blur()
            };
        var createMarkupFromString = function(str) {
                var tempElement = $("<div />");
                if (window.WinJS)
                    WinJS.Utilities.setInnerHTMLUnsafe(tempElement.get(0), str);
                else
                    tempElement.append(str);
                return tempElement.contents()
            };
        var initMobileViewport = function(options) {
                options = $.extend({}, options);
                var device = DX.devices.current();
                var realDevice = DX.devices.real();
                var allowZoom = options.allowZoom,
                    allowPan = options.allowPan,
                    allowSelection = "allowSelection" in options ? options.allowSelection : device.platform == "desktop";
                DX.overlayTargetContainer(".dx-viewport");
                var metaSelector = "meta[name=viewport]";
                if (!$(metaSelector).length)
                    $("<meta />").attr("name", "viewport").appendTo("head");
                var metaVerbs = ["width=device-width"],
                    msTouchVerbs = [];
                if (allowZoom)
                    msTouchVerbs.push("pinch-zoom");
                else
                    metaVerbs.push("initial-scale=1.0", "maximum-scale=1.0, user-scalable=no");
                if (allowPan)
                    msTouchVerbs.push("pan-x", "pan-y");
                if (!allowPan && !allowZoom)
                    $("html, body").css({
                        "-ms-content-zooming": "none",
                        "-ms-user-select": "none",
                        overflow: "hidden"
                    });
                else
                    $("html").css("-ms-overflow-style", "-ms-autohiding-scrollbar");
                if (!allowSelection) {
                    if (realDevice.ios)
                        $(document).on("selectstart", function() {
                            return false
                        });
                    $(".dx-viewport").css("user-select", "none")
                }
                $(metaSelector).attr("content", metaVerbs.join());
                $("html").css("-ms-touch-action", msTouchVerbs.join(" ") || "none");
                if (DX.support.touch)
                    $(document).off(".dxInitMobileViewport").on("touchmove.dxInitMobileViewport", function(e) {
                        var count = e.originalEvent.touches.length,
                            zoomDisabled = !allowZoom && count > 1,
                            panDisabled = !allowPan && count === 1 && !e.isScrollingEvent;
                        if (zoomDisabled || panDisabled)
                            e.preventDefault()
                    });
                realDevice = DX.devices.real();
                if (realDevice.ios) {
                    var isPhoneGap = document.location.protocol === "file:";
                    if (!isPhoneGap)
                        windowResizeCallbacks.add(function() {
                            var windowWidth = $(window).width();
                            $("body").width(windowWidth)
                        });
                    else if (realDevice.version[0] > 6) {
                        $(".dx-viewport").css("position", "relative");
                        $("body").css({"box-sizing": "border-box"});
                        $("body").css("padding-top", IOS_APP_BAR_HEIGHT);
                        if (realDevice.version[0] === 7 && realDevice.version[1] < 1) {
                            var setDeviceHeight = function() {
                                    var deviceHeight = "height=device-" + (Math.abs(window.orientation) === 90 ? "width" : "height");
                                    $(metaSelector).attr("content", metaVerbs.join() + "," + deviceHeight)
                                };
                            $(window).on("orientationchange", setDeviceHeight);
                            setDeviceHeight()
                        }
                    }
                }
            };
        var triggerVisibilityChangeEvent = function(event) {
                return function(element) {
                        $(element || "body").find(".dx-visibility-change-handler").each(function() {
                            $(this).triggerHandler(event)
                        })
                    }
            };
        $.extend(DX.utils, {
            createResizeHandler: createResizeHandler,
            windowResizeCallbacks: windowResizeCallbacks,
            resetActiveElement: resetActiveElement,
            createMarkupFromString: createMarkupFromString,
            triggerShownEvent: triggerVisibilityChangeEvent("dxshown"),
            triggerHidingEvent: triggerVisibilityChangeEvent("dxhiding"),
            initMobileViewport: initMobileViewport
        });
        DX.utils.__timeRedrawOnResize = timeRedrawOnResize
    })(jQuery, DevExpress);
    /*! Module core, file utils.graphics.js */
    (function($, DX, undefined) {
        var isFunction = DX.utils.isFunction,
            iDevice = /iphone|ipad/.test(navigator.userAgent.toLowerCase());
        var processSeriesTemplate = function(seriesTemplate, items) {
                var customizeSeries = isFunction(seriesTemplate.customizeSeries) ? seriesTemplate.customizeSeries : $.noop,
                    nameField = seriesTemplate.nameField || 'series',
                    generatedSeries = {},
                    seriesOrder = [],
                    series;
                for (var i = 0, length = items.length; i < length; i++) {
                    var data = items[i];
                    if (nameField in data) {
                        series = generatedSeries[data[nameField]];
                        if (!series) {
                            series = generatedSeries[data[nameField]] = {
                                name: data[nameField],
                                data: []
                            };
                            seriesOrder.push(series.name)
                        }
                        series.data.push(data)
                    }
                }
                return $.map(seriesOrder, function(orderedName) {
                        var group = generatedSeries[orderedName],
                            seriesOptions = customizeSeries.call(null, group.name);
                        return $.extend(group, seriesOptions)
                    })
            };
        var getNextDefsSvgId = function() {
                var numDefsSvgElements = 1;
                return function() {
                        return 'DevExpress_' + numDefsSvgElements++
                    }
            }();
        var getRootOffset = function(renderer) {
                var node,
                    result = {
                        left: 0,
                        top: 0
                    },
                    pointTransform,
                    root = renderer.getRoot();
                if (root) {
                    node = root.element;
                    if (node.getScreenCTM && !iDevice) {
                        var ctm = node.getScreenCTM();
                        if (ctm) {
                            pointTransform = node.createSVGPoint().matrixTransform(ctm);
                            result.left = pointTransform.x + (document.body.scrollLeft || document.documentElement.scrollLeft);
                            result.top = pointTransform.y + (document.body.scrollTop || document.documentElement.scrollTop)
                        }
                        else {
                            result.left = document.body.scrollLeft || document.documentElement.scrollLeft;
                            result.top = document.body.scrollTop || document.documentElement.scrollTop
                        }
                    }
                    else
                        result = $(node).offset()
                }
                return result
            };
        $.extend(DX.utils, {
            processSeriesTemplate: processSeriesTemplate,
            getNextDefsSvgId: getNextDefsSvgId,
            getRootOffset: getRootOffset
        })
    })(jQuery, DevExpress);
    /*! Module core, file utils.arrays.js */
    (function($, DX, undefined) {
        var wrapToArray = function(entity) {
                return $.isArray(entity) ? entity : [entity]
            };
        var removeDublicates = function(from, what) {
                if (!$.isArray(from) || from.length === 0)
                    return [];
                if (!$.isArray(what) || what.length === 0)
                    return from.slice();
                var result = [];
                $.each(from, function(_, value) {
                    var bIndex = $.inArray(value, what);
                    if (bIndex === -1)
                        result.push(value)
                });
                return result
            };
        $.extend(DX.utils, {
            wrapToArray: wrapToArray,
            removeDublicates: removeDublicates
        })
    })(jQuery, DevExpress);
    /*! Module core, file devices.js */
    (function($, DX, undefined) {
        var KNOWN_UA_TABLE = {
                iPhone: "iPhone",
                iPhone5: "iPhone 5",
                iPad: "iPad",
                iPadMini: "iPad Mini",
                androidPhone: "Android Mobile",
                androidTablet: "Android",
                win8: "MSAppHost",
                win8Phone: "Windows Phone 8",
                msSurface: "MSIE ARM Tablet PC",
                desktop: "desktop",
                tizen: "Tizen Mobile"
            };
        var DEFAULT_DEVICE = {
                deviceType: "",
                platform: "",
                version: [],
                phone: false,
                tablet: false,
                android: false,
                ios: false,
                win8: false,
                tizen: false,
                generic: false
            };
        var GENERIC_DEVICE = $.extend(DEFAULT_DEVICE, {
                platform: "generic",
                deviceType: "desktop",
                generic: true
            });
        var uaParsers = {
                win8: function(userAgent) {
                    var isPhone = /windows phone/i.test(userAgent),
                        isTablet = !isPhone && /arm(.*)trident/i.test(userAgent),
                        isDesktop = !isPhone && !isTablet && /msapphost/i.test(userAgent);
                    if (!(isPhone || isTablet || isDesktop))
                        return;
                    var matches = userAgent.match(/windows phone (\d+).(\d+)/i) || userAgent.match(/windows nt (\d+).(\d+)/i),
                        version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : isTablet ? "tablet" : "desktop",
                            platform: "win8",
                            version: version
                        }
                },
                ios: function(userAgent) {
                    if (!/ip(hone|od|ad)/i.test(userAgent))
                        return;
                    var isPhone = /ip(hone|od)/i.test(userAgent);
                    var matches = userAgent.match(/os (\d+)_(\d+)_?(\d+)?/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3] || 0, 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "ios",
                            version: version
                        }
                },
                android: function(userAgent) {
                    if (!/android|htc_|silk/i.test(userAgent))
                        return;
                    var isPhone = /mobile/i.test(userAgent);
                    var matches = userAgent.match(/android (\d+)\.(\d+)\.?(\d+)?/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3] || 0, 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "android",
                            version: version
                        }
                },
                tizen: function(userAgent) {
                    if (!/tizen/i.test(userAgent))
                        return;
                    var isPhone = /mobile/i.test(userAgent);
                    var matches = userAgent.match(/tizen (\d+)\.(\d+)/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "tizen",
                            version: version
                        }
                }
            };
        DX.Devices = DX.Class.inherit({
            ctor: function(options) {
                this._window = options && options.window || window;
                this._realDevice = this._getDevice();
                this._currentDevice = undefined;
                this._currentOrientation = undefined;
                this.orientationChanged = $.Callbacks();
                this._recalculateOrientation();
                DX.utils.windowResizeCallbacks.add($.proxy(this._recalculateOrientation, this))
            },
            current: function(deviceOrName) {
                if (deviceOrName) {
                    this._currentDevice = this._getDevice(deviceOrName);
                    DX.ui.themes.init({_autoInit: true})
                }
                else {
                    if (!this._currentDevice) {
                        deviceOrName = undefined;
                        try {
                            deviceOrName = this._getDeviceOrNameFromWindowScope()
                        }
                        catch(e) {
                            deviceOrName = this._getDeviceNameFromSessionStorage()
                        }
                        finally {
                            if (!deviceOrName)
                                deviceOrName = this._getDeviceNameFromSessionStorage()
                        }
                        this._currentDevice = this._getDevice(deviceOrName)
                    }
                    return this._currentDevice
                }
            },
            real: function() {
                var forceDevice = arguments[0];
                if ($.isPlainObject(forceDevice)) {
                    $.extend(this._realDevice, forceDevice);
                    return
                }
                return $.extend({}, this._realDevice)
            },
            orientation: function() {
                return this._currentOrientation
            },
            isRippleEmulator: function() {
                return !!this._window.tinyHippos
            },
            attachCssClasses: function(element, device) {
                var realDevice = this._realDevice,
                    $element = $(element);
                device = device || this.current();
                if (device.deviceType)
                    $element.addClass("dx-device-" + device.deviceType);
                $element.addClass("dx-device-" + realDevice.platform);
                if (realDevice.version && realDevice.version.length)
                    $element.addClass("dx-device-" + realDevice.platform + "-" + realDevice.version[0]);
                if (DX.devices.isSimulator())
                    $element.addClass("dx-simulator");
                if (DX.rtlEnabled)
                    $element.addClass("dx-rtl")
            },
            isSimulator: function() {
                try {
                    return this._isSimulator || this._window.top !== this._window.self && this._window.top["dx-force-device"] || this.isRippleEmulator()
                }
                catch(e) {
                    return false
                }
            },
            forceSimulator: function() {
                this._isSimulator = true
            },
            _getDevice: function(deviceName) {
                if (deviceName === "genericPhone")
                    deviceName = {
                        deviceType: "phone",
                        platform: "generic",
                        generic: true
                    };
                if ($.isPlainObject(deviceName))
                    return this._fromConfig(deviceName);
                else {
                    var ua;
                    if (deviceName) {
                        ua = KNOWN_UA_TABLE[deviceName];
                        if (!ua)
                            throw Error("Unknown device");
                    }
                    else
                        ua = navigator.userAgent;
                    return this._fromUA(ua)
                }
            },
            _getDeviceOrNameFromWindowScope: function() {
                var result;
                if (this._window.top["dx-force-device-object"] || this._window.top["dx-force-device"])
                    result = this._window.top["dx-force-device-object"] || this._window.top["dx-force-device"];
                return result
            },
            _getDeviceNameFromSessionStorage: function() {
                return this._window.sessionStorage && (sessionStorage.getItem("dx-force-device") || sessionStorage.getItem("dx-simulator-device"))
            },
            _fromConfig: function(config) {
                var shortcuts = {
                        phone: config.deviceType === "phone",
                        tablet: config.deviceType === "tablet",
                        android: config.platform === "android",
                        ios: config.platform === "ios",
                        win8: config.platform === "win8",
                        tizen: config.platform === "tizen",
                        generic: config.platform === "generic"
                    };
                return $.extend({}, DEFAULT_DEVICE, this._currentDevice, shortcuts, config)
            },
            _fromUA: function(ua) {
                var config;
                $.each(uaParsers, function(platform, parser) {
                    config = parser(ua);
                    return !config
                });
                if (config)
                    return this._fromConfig(config);
                return GENERIC_DEVICE
            },
            _changeOrientation: function() {
                var $window = $(this._window),
                    orientation = $window.height() > $window.width() ? "portrait" : "landscape";
                if (this._currentOrientation === orientation)
                    return;
                this._currentOrientation = orientation;
                this.orientationChanged.fire({orientation: orientation})
            },
            _recalculateOrientation: function() {
                var windowWidth = $(this._window).width();
                if (this._currentWidth === windowWidth)
                    return;
                this._currentWidth = windowWidth;
                this._changeOrientation()
            }
        });
        DX.devices = new DX.Devices
    })(jQuery, DevExpress);
    /*! Module core, file browser.js */
    (function($, DX, global, undefined) {
        var webkitRegExp = /(webkit)[ \/]([\w.]+)/,
            operaRegExp = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            ieRegExp = /(msie) (\d{1,2}\.\d)/,
            ie11RegExp = /(trident).*rv:(\d{1,2}\.\d)/,
            mozillaRegExp = /(mozilla)(?:.*? rv:([\w.]+))?/;
        var ua = navigator.userAgent.toLowerCase();
        var browser = function() {
                var result = {},
                    matches = webkitRegExp.exec(ua) || operaRegExp.exec(ua) || ieRegExp.exec(ua) || ie11RegExp.exec(ua) || ua.indexOf("compatible") < 0 && mozillaRegExp.exec(ua) || [],
                    browserName = matches[1],
                    browserVersion = matches[2];
                if (browserName === "trident")
                    browserName = "msie";
                if (browserName) {
                    result[browserName] = true;
                    result.version = browserVersion
                }
                return result
            }();
        DX.browser = browser
    })(jQuery, DevExpress, this);
    /*! Module core, file support.js */
    (function($, DX, window) {
        var cssPrefixes = ["", "Webkit", "Moz", "O", "ms"],
            styles = document.createElement("dx").style;
        var transitionEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd',
                msTransition: 'MsTransitionEnd',
                transition: 'transitionend'
            };
        var styleProp = function(prop) {
                prop = DX.inflector.camelize(prop, true);
                for (var i = 0, cssPrefixesCount = cssPrefixes.length; i < cssPrefixesCount; i++) {
                    var specific = cssPrefixes[i] + prop;
                    if (specific in styles)
                        return specific
                }
            };
        var supportProp = function(prop) {
                return !!styleProp(prop)
            };
        var isNativeScrollingSupported = function(device) {
                var realDevice = DX.devices.real(),
                    realPlatform = realDevice.platform,
                    realVersion = realDevice.version,
                    isObsoleteAndroid = realVersion && realVersion[0] < 4 && realPlatform === "android",
                    isNativeScrollDevice = !isObsoleteAndroid && $.inArray(realPlatform, ["ios", "android", "win8"]) > -1;
                return isNativeScrollDevice
            };
        DX.support = {
            touch: "ontouchstart" in window,
            pointer: window.navigator.pointerEnabled,
            transform3d: supportProp("transform"),
            transition: supportProp("transition"),
            transitionEndEventName: transitionEndEventNames[styleProp("transition")],
            animation: supportProp("animation"),
            nativeScrolling: isNativeScrollingSupported(),
            winJS: "WinJS" in window,
            styleProp: styleProp,
            supportProp: supportProp,
            hasKo: !!window.ko,
            hasNg: !window.ko && !!window.angular,
            inputType: function(type) {
                if (type === "text")
                    return true;
                var input = document.createElement("input");
                try {
                    input.setAttribute("type", type);
                    input.value = "wrongValue";
                    return !input.value
                }
                catch(e) {
                    return false
                }
            }
        }
    })(jQuery, DevExpress, this);
    /*! Module core, file position.js */
    (function($, DX, undefined) {
        var horzRe = /left|right/,
            vertRe = /top|bottom/,
            collisionRe = /fit|flip|none/;
        var normalizeAlign = function(raw) {
                var result = {
                        h: "center",
                        v: "center"
                    };
                var pair = DX.utils.splitPair(raw);
                if (pair)
                    $.each(pair, function() {
                        var w = String(this).toLowerCase();
                        if (horzRe.test(w))
                            result.h = w;
                        else if (vertRe.test(w))
                            result.v = w
                    });
                return result
            };
        var normalizeOffset = function(raw) {
                var values = DX.utils.stringPairToObject(raw);
                return {
                        h: values.x,
                        v: values.y
                    }
            };
        var normalizeCollision = function(raw) {
                var pair = DX.utils.splitPair(raw),
                    h = String(pair && pair[0]).toLowerCase(),
                    v = String(pair && pair[1]).toLowerCase();
                if (!collisionRe.test(h))
                    h = "none";
                if (!collisionRe.test(v))
                    v = h;
                return {
                        h: h,
                        v: v
                    }
            };
        var getAlignFactor = function(align) {
                switch (align) {
                    case"center":
                        return 0.5;
                    case"right":
                    case"bottom":
                        return 1;
                    default:
                        return 0
                }
            };
        var inverseAlign = function(align) {
                switch (align) {
                    case"left":
                        return "right";
                    case"right":
                        return "left";
                    case"top":
                        return "bottom";
                    case"bottom":
                        return "top";
                    default:
                        return align
                }
            };
        var calculateOversize = function(data, bounds) {
                var oversize = 0;
                if (data.myLocation < bounds.min)
                    oversize += bounds.min - data.myLocation;
                if (data.myLocation > bounds.max)
                    oversize += data.myLocation - bounds.max;
                return oversize
            };
        var initMyLocation = function(data) {
                data.myLocation = data.atLocation + getAlignFactor(data.atAlign) * data.atSize - getAlignFactor(data.myAlign) * data.mySize + data.offset
            };
        var decolliders = {
                fit: function(data, bounds) {
                    var result = false;
                    if (data.myLocation > bounds.max) {
                        data.myLocation = bounds.max;
                        result = true
                    }
                    if (data.myLocation < bounds.min) {
                        data.myLocation = bounds.min;
                        result = true
                    }
                    return result
                },
                flip: function(data, bounds) {
                    if (data.myAlign === "center" && data.atAlign === "center")
                        return false;
                    if (data.myLocation < bounds.min || data.myLocation > bounds.max) {
                        var inverseData = $.extend({}, data, {
                                myAlign: inverseAlign(data.myAlign),
                                atAlign: inverseAlign(data.atAlign),
                                offset: -data.offset
                            });
                        initMyLocation(inverseData);
                        inverseData.oversize = calculateOversize(inverseData, bounds);
                        if (inverseData.myLocation >= bounds.min && inverseData.myLocation <= bounds.max || inverseData.myLocation > data.myLocation || inverseData.oversize < data.oversize) {
                            data.myLocation = inverseData.myLocation;
                            data.oversize = inverseData.oversize;
                            return true
                        }
                    }
                    return false
                }
            };
        var scrollbarWidth;
        var defaultPositionResult = {
                h: {
                    location: 0,
                    flip: false,
                    fit: false,
                    oversize: 0
                },
                v: {
                    location: 0,
                    flip: false,
                    fit: false,
                    oversize: 0
                }
            };
        var calculatePosition = function(what, options) {
                var $what = $(what),
                    currentOffset = $what.offset(),
                    result = $.extend(true, {}, defaultPositionResult, {
                        h: {location: currentOffset.left},
                        v: {location: currentOffset.top}
                    });
                if (!options)
                    return result;
                var my = normalizeAlign(options.my),
                    at = normalizeAlign(options.at),
                    of = options.of || window,
                    offset = normalizeOffset(options.offset),
                    collision = normalizeCollision(options.collision),
                    boundaryOffset = normalizeOffset(options.boundaryOffset);
                var h = {
                        mySize: $what.outerWidth(),
                        myAlign: my.h,
                        atAlign: at.h,
                        offset: offset.h,
                        collision: collision.h,
                        boundaryOffset: boundaryOffset.h
                    };
                var v = {
                        mySize: $what.outerHeight(),
                        myAlign: my.v,
                        atAlign: at.v,
                        offset: offset.v,
                        collision: collision.v,
                        boundaryOffset: boundaryOffset.v
                    };
                if (of.preventDefault) {
                    h.atLocation = of.pageX;
                    v.atLocation = of.pageY;
                    h.atSize = 0;
                    v.atSize = 0
                }
                else {
                    of = $(of);
                    if ($.isWindow(of[0])) {
                        h.atLocation = of.scrollLeft();
                        v.atLocation = of.scrollTop();
                        h.atSize = of.width();
                        v.atSize = of.height()
                    }
                    else if (of[0].nodeType === 9) {
                        h.atLocation = 0;
                        v.atLocation = 0;
                        h.atSize = of.width();
                        v.atSize = of.height()
                    }
                    else {
                        var o = of.offset();
                        h.atLocation = o.left;
                        v.atLocation = o.top;
                        h.atSize = of.outerWidth();
                        v.atSize = of.outerHeight()
                    }
                }
                initMyLocation(h);
                initMyLocation(v);
                var bounds = function() {
                        var win = $(window),
                            windowWidth = win.width(),
                            windowHeight = win.height(),
                            left = win.scrollLeft(),
                            top = win.scrollTop(),
                            hScrollbar = document.width > document.documentElement.clientWidth,
                            vScrollbar = document.height > document.documentElement.clientHeight,
                            hZoomLevel = DX.support.touch ? document.documentElement.clientWidth / (vScrollbar ? windowWidth - scrollbarWidth : windowWidth) : 1,
                            vZoomLevel = DX.support.touch ? document.documentElement.clientHeight / (hScrollbar ? windowHeight - scrollbarWidth : windowHeight) : 1;
                        if (scrollbarWidth === undefined)
                            scrollbarWidth = calculateScrollbarWidth();
                        return {
                                h: {
                                    min: left + h.boundaryOffset,
                                    max: left + windowWidth / hZoomLevel - h.mySize - h.boundaryOffset
                                },
                                v: {
                                    min: top + v.boundaryOffset,
                                    max: top + windowHeight / vZoomLevel - v.mySize - v.boundaryOffset
                                }
                            }
                    }();
                h.oversize = calculateOversize(h, bounds.h);
                v.oversize = calculateOversize(v, bounds.v);
                if (decolliders[h.collision])
                    result.h[h.collision] = decolliders[h.collision](h, bounds.h);
                if (decolliders[v.collision])
                    result.v[v.collision] = decolliders[v.collision](v, bounds.v);
                $.extend(true, result, {
                    h: {
                        location: Math.round(h.myLocation),
                        oversize: Math.round(h.oversize)
                    },
                    v: {
                        location: Math.round(v.myLocation),
                        oversize: Math.round(v.oversize)
                    }
                });
                return result
            };
        var position = function(what, options) {
                var $what = $(what);
                if (!options)
                    return $what.offset();
                DX.translator.resetPosition($what);
                var offset = $what.offset(),
                    targetPosition = options.h && options.v ? options : calculatePosition($what, options);
                DX.translator.move($what, {
                    left: Math.round(targetPosition.h.location - offset.left),
                    top: Math.round(targetPosition.v.location - offset.top)
                });
                return targetPosition
            };
        $.extend(DX, {
            calculatePosition: calculatePosition,
            position: position,
            inverseAlign: inverseAlign
        });
        var calculateScrollbarWidth = function() {
                var $scrollDiv = $("<div>").css({
                        width: 100,
                        height: 100,
                        overflow: "scroll",
                        position: "absolute",
                        top: -9999
                    }).appendTo($("body")),
                    result = $scrollDiv.get(0).offsetWidth - $scrollDiv.get(0).clientWidth;
                $scrollDiv.remove();
                return result
            }
    })(jQuery, DevExpress);
    /*! Module core, file action.js */
    (function($, DX, undefined) {
        var actionExecutors = {};
        var registerExecutor = function(name, executor) {
                if ($.isPlainObject(name)) {
                    $.each(name, registerExecutor);
                    return
                }
                actionExecutors[name] = executor
            };
        var unregisterExecutor = function(name) {
                var args = $.makeArray(arguments);
                $.each(args, function() {
                    delete actionExecutors[this]
                })
            };
        registerExecutor({
            func: {execute: function(e) {
                    if ($.isFunction(e.action)) {
                        e.result = e.action.apply(e.context, e.args);
                        e.handled = true
                    }
                }},
            url: {execute: function(e) {
                    if (typeof e.action === "string" && e.action.charAt(0) !== "#")
                        document.location = e.action
                }},
            hash: {execute: function(e) {
                    if (typeof e.action === "string" && e.action.charAt(0) === "#")
                        document.location.hash = e.action
                }}
        });
        var Action = DX.Class.inherit({
                ctor: function(action, config) {
                    config = config || {};
                    this._action = action || $.noop;
                    this._context = config.context || window;
                    this._beforeExecute = config.beforeExecute || $.noop;
                    this._afterExecute = config.afterExecute || $.noop;
                    this._component = config.component;
                    this._excludeValidators = config.excludeValidators
                },
                execute: function() {
                    var e = {
                            action: this._action,
                            args: Array.prototype.slice.call(arguments),
                            context: this._context,
                            component: this._component,
                            cancel: false,
                            handled: false
                        };
                    if (!this._validateAction(e))
                        return;
                    this._beforeExecute.call(this._context, e);
                    if (e.cancel)
                        return;
                    var result = this._executeAction(e);
                    this._afterExecute.call(this._context, e);
                    return result
                },
                _validateAction: function(e) {
                    var excludeValidators = this._excludeValidators;
                    $.each(actionExecutors, function(name, executor) {
                        if (excludeValidators && $.inArray(name, excludeValidators) > -1)
                            return;
                        if (executor.validate)
                            executor.validate(e);
                        if (e.cancel)
                            return false
                    });
                    return !e.cancel
                },
                _executeAction: function(e) {
                    var result;
                    $.each(actionExecutors, function(index, executor) {
                        if (executor.execute)
                            executor.execute(e);
                        if (e.handled) {
                            result = e.result;
                            return false
                        }
                    });
                    return result
                }
            });
        $.extend(DX, {
            registerActionExecutor: registerExecutor,
            unregisterActionExecutor: unregisterExecutor,
            Action: Action
        });
        DX.__internals = {actionExecutors: actionExecutors}
    })(jQuery, DevExpress);
    /*! Module core, file translator.js */
    (function($, DX, undefined) {
        var support = DX.support,
            TRANSLATOR_DATA_KEY = "dxTranslator",
            TRANSFORM_MATRIX_REGEX = /matrix(3d)?\((.+?)\)/,
            TRANSLATE_REGEX = /translate(?:3d)?\((.+?)\)/;
        var locate = function($element) {
                var result,
                    position,
                    finalPosition;
                if (support.transform3d) {
                    var translate = getTranslate($element);
                    result = {
                        left: translate.x,
                        top: translate.y
                    }
                }
                else {
                    var originalTop = $element.css("top"),
                        originalLeft = $element.css("left");
                    position = $element.position();
                    $element.css({
                        transform: "none",
                        top: 0,
                        left: 0
                    });
                    clearCache($element);
                    finalPosition = $element.position();
                    result = {
                        left: position.left - finalPosition.left || parseInt(originalLeft) || 0,
                        top: position.top - finalPosition.top || parseInt(originalTop) || 0
                    };
                    $element.css({
                        top: originalTop,
                        left: originalLeft
                    })
                }
                return result
            };
        var move = function($element, position) {
                if (!support.transform3d) {
                    $element.css(position);
                    return
                }
                var translate = getTranslate($element),
                    left = position.left,
                    top = position.top;
                if (left !== undefined)
                    translate.x = left || 0;
                if (top !== undefined)
                    translate.y = top || 0;
                $element.css({transform: getTranslateCss(translate)});
                if (isPersentValue(left) || isPersentValue(top))
                    clearCache($element)
            };
        var isPersentValue = function(value) {
                return $.type(value) === "string" && value[value.length - 1] === "%"
            };
        var getTranslate = function($element) {
                var result = $element.data(TRANSLATOR_DATA_KEY);
                if (!result) {
                    var transformValue = $element.css("transform") || getTranslateCss({
                            x: 0,
                            y: 0
                        }),
                        matrix = transformValue.match(TRANSFORM_MATRIX_REGEX),
                        is3D = matrix && matrix[1];
                    if (matrix) {
                        matrix = matrix[2].split(",");
                        if (is3D === "3d")
                            matrix = matrix.slice(12, 15);
                        else {
                            matrix.push(0);
                            matrix = matrix.slice(4, 7)
                        }
                    }
                    else
                        matrix = [0, 0, 0];
                    result = {
                        x: parseFloat(matrix[0]),
                        y: parseFloat(matrix[1]),
                        z: parseFloat(matrix[2])
                    };
                    cacheTranslate($element, result)
                }
                return result
            };
        var cacheTranslate = function($element, translate) {
                $element.data(TRANSLATOR_DATA_KEY, translate)
            };
        var clearCache = function($element) {
                $element.removeData(TRANSLATOR_DATA_KEY)
            };
        var resetPosition = function($element) {
                $element.css({
                    left: 0,
                    top: 0,
                    transform: "none"
                });
                clearCache($element)
            };
        var parseTranslate = function(translateString) {
                var result = translateString.match(TRANSLATE_REGEX);
                if (!result || !result[1])
                    return;
                result = result[1].split(",");
                result = {
                    x: parseFloat(result[0]),
                    y: parseFloat(result[1]),
                    z: parseFloat(result[2])
                };
                return result
            };
        var getTranslateCss = function(translate) {
                translate.x = translate.x || 0;
                translate.y = translate.y || 0;
                var xValueString = isPersentValue(translate.x) ? translate.x : translate.x + "px";
                var yValueString = isPersentValue(translate.y) ? translate.y : translate.y + "px";
                return "translate(" + xValueString + ", " + yValueString + ")"
            };
        DX.translator = {
            move: move,
            locate: locate,
            clearCache: clearCache,
            parseTranslate: parseTranslate,
            getTranslate: getTranslate,
            getTranslateCss: getTranslateCss,
            resetPosition: resetPosition
        }
    })(jQuery, DevExpress);
    /*! Module core, file animationFrame.js */
    (function($, DX, undefined) {
        var FRAME_ANIMATION_STEP_TIME = 1000 / 60,
            requestAnimationFrame = function(callback, element) {
                return this.setTimeout(callback, FRAME_ANIMATION_STEP_TIME)
            },
            cancelAnimationFrame = function(requestID) {
                return this.clearTimeout(requestID)
            },
            nativeRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
            nativeCancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame;
        if (nativeRequestAnimationFrame && nativeCancelAnimationFrame) {
            requestAnimationFrame = nativeRequestAnimationFrame;
            cancelAnimationFrame = nativeCancelAnimationFrame
        }
        if (nativeRequestAnimationFrame && !nativeCancelAnimationFrame) {
            var cancelledRequests = {};
            requestAnimationFrame = function(callback) {
                var requestId = nativeRequestAnimationFrame.call(window, function() {
                        try {
                            if (requestId in cancelledRequests)
                                return;
                            callback.apply(this, arguments)
                        }
                        finally {
                            delete cancelledRequests[requestId]
                        }
                    });
                return requestId
            };
            cancelAnimationFrame = function(requestId) {
                cancelledRequests[requestId] = true
            }
        }
        requestAnimationFrame = $.proxy(requestAnimationFrame, window);
        cancelAnimationFrame = $.proxy(cancelAnimationFrame, window);
        $.extend(DX, {
            requestAnimationFrame: requestAnimationFrame,
            cancelAnimationFrame: cancelAnimationFrame
        })
    })(jQuery, DevExpress);
    /*! Module core, file animator.js */
    (function($, DX, undefined) {
        DX.Animator = DX.Class.inherit({
            ctor: function() {
                this._finished = true;
                this._stopped = false
            },
            start: function() {
                this._stopped = false;
                this._finished = false;
                this._stepCore()
            },
            stop: function() {
                this._stopped = true
            },
            _stepCore: function() {
                if (this._isStopped()) {
                    this._stop();
                    return
                }
                if (this._isFinished()) {
                    this._finished = true;
                    this._complete();
                    return
                }
                this._step();
                DX.requestAnimationFrame.call(window, $.proxy(this._stepCore, this))
            },
            _step: DX.abstract,
            _isFinished: $.noop,
            _stop: $.noop,
            _complete: $.noop,
            _isStopped: function() {
                return this._stopped
            },
            inProgress: function() {
                return !(this._stopped || this._finished)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file fx.js */
    (function($, DX, undefined) {
        var translator = DX.translator,
            support = DX.support,
            transitionEndEventName = support.transitionEndEventName + ".dxFX";
        var CSS_TRANSITION_EASING_REGEX = /cubic-bezier\((\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\)/,
            RELATIVE_VALUE_REGEX = /^([+-])=(.*)/i,
            ANIM_DATA_KEY = "dxAnimData",
            ANIM_QUEUE_KEY = "dxAnimQueue",
            TRANSFORM_PROP = "transform";
        var TransitionAnimationStrategy = {
                animate: function($element, config) {
                    var that = this,
                        deferred = $.Deferred();
                    config.transitionAnimation = {finish: function() {
                            that._cleanup($element, config);
                            deferred.resolveWith($element, [config, $element])
                        }};
                    this._startAnimation($element, config);
                    this._completeAnimationCallback($element, config).done(function() {
                        config.transitionAnimation.finish()
                    });
                    if (!config.duration)
                        config.transitionAnimation.finish();
                    return deferred.promise()
                },
                _completeAnimationCallback: function($element, config) {
                    var startTime = $.now() + config.delay,
                        deferred = $.Deferred(),
                        transitionEndFired = $.Deferred(),
                        simulatedTransitionEndFired = $.Deferred();
                    $element.one(transitionEndEventName, function(e) {
                        if ($.now() - startTime >= config.duration)
                            transitionEndFired.reject()
                    });
                    config.transitionAnimation.simulatedEndEventTimer = setTimeout(function() {
                        simulatedTransitionEndFired.reject()
                    }, config.duration + config.delay);
                    $.when(transitionEndFired, simulatedTransitionEndFired).fail($.proxy(function() {
                        deferred.resolve()
                    }, this));
                    return deferred.promise()
                },
                _startAnimation: function($element, config) {
                    $element.css("transform");
                    $element.css({
                        transitionProperty: "all",
                        transitionDelay: config.delay + "ms",
                        transitionDuration: config.duration + "ms",
                        transitionTimingFunction: config.easing
                    });
                    setProps($element, config.to)
                },
                _cleanup: function($element, config) {
                    $element.css("transition", "none").off(transitionEndEventName);
                    clearTimeout(config.transitionAnimation.simulatedEndEventTimer)
                },
                stop: function($element, config, jumpToEnd) {
                    if (!config)
                        return;
                    if (jumpToEnd)
                        config.transitionAnimation.finish();
                    else {
                        $.each(config.to, function(key) {
                            $element.css(key, $element.css(key))
                        });
                        this._cleanup($element, config)
                    }
                }
            };
        var FrameAnimationStrategy = {
                animate: function($element, config) {
                    var deferred = $.Deferred(),
                        that = this;
                    if (!config)
                        return deferred.reject().promise();
                    $.each(config.to, function(prop) {
                        if (config.from[prop] === undefined)
                            config.from[prop] = that._normalizeValue($element.css(prop))
                    });
                    if (config.to[TRANSFORM_PROP]) {
                        config.from[TRANSFORM_PROP] = that._parseTransform(config.from[TRANSFORM_PROP]);
                        config.to[TRANSFORM_PROP] = that._parseTransform(config.to[TRANSFORM_PROP])
                    }
                    config.frameAnimation = {
                        to: config.to,
                        from: config.from,
                        currentValue: config.from,
                        easing: convertTransitionTimingFuncToJQueryEasing(config.easing),
                        duration: config.duration,
                        startTime: (new Date).valueOf(),
                        finish: function() {
                            this.currentValue = this.to;
                            this.draw();
                            deferred.resolve()
                        },
                        draw: function() {
                            var currentValue = $.extend({}, this.currentValue);
                            if (currentValue[TRANSFORM_PROP])
                                currentValue[TRANSFORM_PROP] = $.map(currentValue[TRANSFORM_PROP], function(value, prop) {
                                    if (prop === "translate")
                                        return translator.getTranslateCss(value);
                                    else if (prop === "scale")
                                        return "scale(" + value + ")";
                                    else if (prop.substr(0, prop.length - 1) === "rotate")
                                        return prop + "(" + value + "deg)"
                                }).join(" ");
                            $element.css(currentValue)
                        }
                    };
                    if (config.delay) {
                        config.frameAnimation.startTime += config.delay;
                        config.frameAnimation.delayTimeout = setTimeout(function() {
                            that._animationStep($element, config)
                        }, config.delay)
                    }
                    else
                        that._animationStep($element, config);
                    return deferred.promise()
                },
                _parseTransform: function(transformString) {
                    var result = {};
                    $.each(transformString.match(/(\w|\d)+\([^\)]*\)\s*/g), function(i, part) {
                        var translateData = translator.parseTranslate(part),
                            scaleData = part.match(/scale\((.+?)\)/),
                            rotateData = part.match(/(rotate.)\((.+)deg\)/);
                        if (translateData)
                            result.translate = translateData;
                        if (scaleData && scaleData[1])
                            result.scale = parseFloat(scaleData[1]);
                        if (rotateData && rotateData[1])
                            result[rotateData[1]] = parseFloat(rotateData[2])
                    });
                    return result
                },
                stop: function($element, config, jumpToEnd) {
                    var frameAnimation = config && config.frameAnimation;
                    if (!frameAnimation)
                        return;
                    clearTimeout(frameAnimation.delayTimeout);
                    if (jumpToEnd)
                        frameAnimation.finish();
                    delete config.frameAnimation
                },
                _animationStep: function($element, config) {
                    var frameAnimation = config && config.frameAnimation;
                    if (!frameAnimation)
                        return;
                    var now = (new Date).valueOf();
                    if (now >= frameAnimation.startTime + frameAnimation.duration) {
                        frameAnimation.finish();
                        return
                    }
                    frameAnimation.currentValue = this._calcStepValue(frameAnimation, now - frameAnimation.startTime);
                    frameAnimation.draw();
                    DX.requestAnimationFrame($.proxy(function() {
                        this._animationStep($element, config)
                    }, this))
                },
                _calcStepValue: function(frameAnimation, currentDuration) {
                    var calcValueRecursively = function(from, to) {
                            var result = $.isArray(to) ? [] : {};
                            var calcEasedValue = function(propName) {
                                    var x = currentDuration / frameAnimation.duration,
                                        t = currentDuration,
                                        b = 1 * from[propName],
                                        c = to[propName] - from[propName],
                                        d = frameAnimation.duration;
                                    return $.easing[frameAnimation.easing](x, t, b, c, d)
                                };
                            $.each(to, function(propName, endPropValue) {
                                if (typeof endPropValue === "string" && parseFloat(endPropValue, 10) === false)
                                    return true;
                                result[propName] = typeof endPropValue === "object" ? calcValueRecursively(from[propName], endPropValue) : calcEasedValue(propName)
                            });
                            return result
                        };
                    return calcValueRecursively(frameAnimation.from, frameAnimation.to)
                },
                _normalizeValue: function(value) {
                    var numericValue = parseFloat(value, 10);
                    if (numericValue === false)
                        return value;
                    return numericValue
                }
            };
        var animationStrategies = {
                transition: support.transition ? TransitionAnimationStrategy : FrameAnimationStrategy,
                frame: FrameAnimationStrategy
            };
        var getAnimationStrategy = function(config) {
                return animationStrategies[config && config.strategy || "transition"]
            };
        var TransitionTimingFuncMap = {
                linear: "cubic-bezier(0, 0, 1, 1)",
                ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
                "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
                "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)"
            };
        var convertTransitionTimingFuncToJQueryEasing = function(cssTransitionEasing) {
                cssTransitionEasing = TransitionTimingFuncMap[cssTransitionEasing] || cssTransitionEasing;
                var bezCoeffs = cssTransitionEasing.match(CSS_TRANSITION_EASING_REGEX);
                if (!bezCoeffs)
                    return "linear";
                bezCoeffs = bezCoeffs.slice(1, 5);
                $.each(bezCoeffs, function(index, value) {
                    bezCoeffs[index] = parseFloat(value)
                });
                var easingName = "cubicbezier_" + bezCoeffs.join("_").replace(/\./g, "p");
                if (!$.isFunction($.easing[easingName])) {
                    var polynomBezier = function(x1, y1, x2, y2) {
                            var Cx = 3 * x1,
                                Bx = 3 * (x2 - x1) - Cx,
                                Ax = 1 - Cx - Bx,
                                Cy = 3 * y1,
                                By = 3 * (y2 - y1) - Cy,
                                Ay = 1 - Cy - By;
                            var bezierX = function(t) {
                                    return t * (Cx + t * (Bx + t * Ax))
                                };
                            var bezierY = function(t) {
                                    return t * (Cy + t * (By + t * Ay))
                                };
                            var findXfor = function(t) {
                                    var x = t,
                                        i = 0,
                                        z;
                                    while (i < 14) {
                                        z = bezierX(x) - t;
                                        if (Math.abs(z) < 1e-3)
                                            break;
                                        x = x - z / derivativeX(x);
                                        i++
                                    }
                                    return x
                                };
                            var derivativeX = function(t) {
                                    return Cx + t * (2 * Bx + t * 3 * Ax)
                                };
                            return function(t) {
                                    return bezierY(findXfor(t))
                                }
                        };
                    $.easing[easingName] = function(x, t, b, c, d) {
                        return c * polynomBezier(bezCoeffs[0], bezCoeffs[1], bezCoeffs[2], bezCoeffs[3])(t / d) + b
                    }
                }
                return easingName
            };
        var baseConfigValidator = function(config, animationType) {
                $.each(["from", "to"], function() {
                    if (!$.isPlainObject(config[this]))
                        throw Error("Animation with the '" + animationType + "' type requires '" + this + "' configuration as an plain object.");
                })
            };
        var CustomAnimationConfigurator = {setup: function($element, config){}};
        var SlideAnimationConfigurator = {
                validateConfig: function(config) {
                    baseConfigValidator(config, "slide")
                },
                setup: function($element, config) {
                    var location = translator.locate($element);
                    this._setUpConfig(location, config.from);
                    this._setUpConfig(location, config.to);
                    translator.clearCache($element);
                    if (!support.transform3d && $element.css("position") === "static")
                        $element.css("position", "relative")
                },
                _setUpConfig: function(location, config) {
                    config.left = "left" in config ? config.left : "+=0";
                    config.top = "top" in config ? config.top : "+=0";
                    this._initNewPosition(location, config)
                },
                _initNewPosition: function(location, config) {
                    var position = {
                            left: config.left,
                            top: config.top
                        };
                    delete config.left;
                    delete config.top;
                    var relativeValue = this._getRelativeValue(position.left);
                    if (relativeValue !== undefined)
                        position.left = relativeValue + location.left;
                    else
                        config.left = 0;
                    relativeValue = this._getRelativeValue(position.top);
                    if (relativeValue !== undefined)
                        position.top = relativeValue + location.top;
                    else
                        config.top = 0;
                    var translate = {
                            x: 0,
                            y: 0
                        };
                    if (support.transform3d)
                        translate = {
                            x: position.left,
                            y: position.top
                        };
                    else {
                        config.left = position.left;
                        config.top = position.top
                    }
                    config[TRANSFORM_PROP] = translator.getTranslateCss(translate)
                },
                _getRelativeValue: function(value) {
                    var relativeValue;
                    if (typeof value === "string" && (relativeValue = RELATIVE_VALUE_REGEX.exec(value)))
                        return parseInt(relativeValue[1] + "1") * relativeValue[2]
                }
            };
        var FadeAnimationConfigurator = {setup: function($element, config) {
                    var from = config.from,
                        fromOpacity = $.isPlainObject(from) ? $element.css("opacity") : String(from),
                        toOpacity = String(config.to);
                    config.from = {opacity: fromOpacity};
                    config.to = {opacity: toOpacity}
                }};
        var PopAnimationConfigurator = {
                validateConfig: function(config) {
                    baseConfigValidator(config, "pop")
                },
                setup: function($element, config) {
                    var from = config.from,
                        to = config.to,
                        fromOpacity = "opacity" in from ? from.opacity : $element.css("opacity"),
                        toOpacity = "opacity" in to ? to.opacity : 1,
                        fromScale = "scale" in from ? from.scale : 0,
                        toScale = "scale" in to ? to.scale : 1;
                    config.from = {opacity: fromOpacity};
                    var translate = translator.getTranslate($element);
                    config.from[TRANSFORM_PROP] = this._getCssTransform(translate, fromScale);
                    config.to = {opacity: toOpacity};
                    config.to[TRANSFORM_PROP] = this._getCssTransform(translate, toScale)
                },
                _getCssTransform: function(translate, scale) {
                    return translator.getTranslateCss(translate) + "scale(" + scale + ")"
                }
            };
        var animationConfigurators = {
                custom: CustomAnimationConfigurator,
                slide: SlideAnimationConfigurator,
                fade: FadeAnimationConfigurator,
                pop: PopAnimationConfigurator
            };
        var getAnimationConfigurator = function(type) {
                var result = animationConfigurators[type];
                if (!result)
                    throw Error("Unknown animation type \"" + type + "\"");
                return result
            };
        var defaultConfig = {
                type: "custom",
                from: {},
                to: {},
                duration: 400,
                start: $.noop,
                complete: $.noop,
                easing: "ease",
                delay: 0
            };
        var animate = function(element, config) {
                var $element = $(element);
                config = $.extend(true, {}, defaultConfig, config);
                if (!$element.length)
                    return $.Deferred().resolve().promise();
                var configurator = getAnimationConfigurator(config.type);
                if ($.isFunction(configurator.validateConfig))
                    configurator.validateConfig(config);
                return pushInAnimationQueue($element, config)
            };
        var pushInAnimationQueue = function($element, config) {
                config.deferred = config.deferred || $.Deferred();
                var queueData = getAnimQueueData($element);
                writeAnimQueueData($element, queueData);
                queueData.push(config);
                if (!isAnimating($element))
                    shiftFromAnimationQueue($element, queueData);
                return config.deferred.promise()
            };
        var getAnimQueueData = function($element) {
                return $element.data(ANIM_QUEUE_KEY) || []
            };
        var writeAnimQueueData = function($element, queueData) {
                $element.data(ANIM_QUEUE_KEY, queueData)
            };
        var destroyAnimQueueData = function($element) {
                $element.removeData(ANIM_QUEUE_KEY)
            };
        var isAnimating = function($element) {
                return !!$element.data(ANIM_DATA_KEY)
            };
        var shiftFromAnimationQueue = function($element, queueData) {
                var queueData = getAnimQueueData($element);
                if (!queueData.length)
                    return;
                var config = queueData.shift();
                if (queueData.length === 0)
                    destroyAnimQueueData($element);
                executeAnimation($element, config).done(function() {
                    shiftFromAnimationQueue($element)
                })
            };
        var executeAnimation = function($element, config) {
                setupPosition($element, config.from);
                setupPosition($element, config.to);
                var configurator = getAnimationConfigurator(config.type);
                configurator.setup($element, config);
                $element.data(ANIM_DATA_KEY, config);
                if (DX.fx.off)
                    config.duration = 0;
                setProps($element, config.from);
                config.start.apply(this, [$element, config]);
                return getAnimationStrategy(config).animate($element, config).done(function() {
                        $element.removeData(ANIM_DATA_KEY);
                        config.complete.apply(this, [$element, config]);
                        config.deferred.resolveWith(this, [$element, config])
                    })
            };
        var setupPosition = function($element, config) {
                if (!config.position)
                    return;
                var position = DX.calculatePosition($element, config.position),
                    offset = $element.offset(),
                    currentPosition = $element.position();
                $.extend(config, {
                    left: position.h.location - offset.left + currentPosition.left,
                    top: position.v.location - offset.top + currentPosition.top
                });
                delete config.position
            };
        var setProps = function($element, props) {
                $.each(props, function(key, value) {
                    $element.css(key, value)
                })
            };
        var stop = function(element, jumpToEnd) {
                var $element = $(element),
                    queueData = getAnimQueueData($element);
                $.each(queueData, function(_, config) {
                    config.duration = 0
                });
                var config = $element.data(ANIM_DATA_KEY);
                getAnimationStrategy(config).stop($element, config, jumpToEnd);
                $element.removeData(ANIM_DATA_KEY);
                destroyAnimQueueData($element)
            };
        DX.fx = {
            off: false,
            animationTypes: animationConfigurators,
            animate: animate,
            isAnimating: isAnimating,
            stop: stop
        };
        DX.fx.__internals = {convertTransitionTimingFuncToJQueryEasing: convertTransitionTimingFuncToJQueryEasing}
    })(jQuery, DevExpress);
    /*! Module core, file endpointSelector.js */
    (function($, DX, undefined) {
        var location = window.location,
            DXPROXY_HOST = "dxproxy.devexpress.com:8000",
            WIN_JS = location.protocol === "ms-appx:",
            IS_DXPROXY = location.host === DXPROXY_HOST,
            IS_LOCAL = isLocalHostName(location.hostname);
        function isLocalHostName(url) {
            return /^(localhost$|127\.)/i.test(url)
        }
        var extractProxyAppId = function() {
                return location.pathname.split("/")[1]
            };
        var formatProxyUrl = function(localUrl) {
                var urlData = DX.parseUrl(localUrl);
                if (!isLocalHostName(urlData.hostname))
                    return localUrl;
                return "http://" + DXPROXY_HOST + "/" + extractProxyAppId() + "_" + urlData.port + urlData.pathname + urlData.search
            };
        var EndpointSelector = DX.EndpointSelector = function(config) {
                this.config = config
            };
        EndpointSelector.prototype = {urlFor: function(key) {
                var bag = this.config[key];
                if (!bag)
                    throw Error("Unknown endpoint key");
                if (IS_DXPROXY)
                    return formatProxyUrl(bag.local);
                if (bag.production)
                    if (WIN_JS && !Debug.debuggerEnabled || !WIN_JS && !IS_LOCAL)
                        return bag.production;
                return bag.local
            }}
    })(jQuery, DevExpress);
    /*! Module core, file formatHelper.js */
    (function($, DX, undefined) {
        var utils = DX.utils;
        DX.NumericFormat = {
            currency: 'C',
            fixedpoint: 'N',
            exponential: '',
            percent: 'P',
            decimal: 'D'
        };
        DX.LargeNumberFormatPostfixes = {
            1: 'K',
            2: 'M',
            3: 'B',
            4: 'T'
        };
        var MAX_LARGE_NUMBER_POWER = 4,
            DECIMAL_BASE = 10;
        DX.LargeNumberFormatPowers = {
            largenumber: 'auto',
            thousands: 1,
            millions: 2,
            billions: 3,
            trillions: 4
        };
        DX.DateTimeFormat = {
            longdate: 'D',
            longtime: 'T',
            monthandday: 'M',
            monthandyear: 'Y',
            quarterandyear: 'qq',
            shortdate: 'd',
            shorttime: 't',
            millisecond: 'fff',
            second: 'T',
            minute: 't',
            hour: 't',
            day: 'dd',
            week: 'dd',
            month: 'MMMM',
            quarter: 'qq',
            year: 'yyyy',
            longdatelongtime: 'D',
            shortdateshorttime: 'd'
        };
        DX.formatHelper = {
            defaultQuarterFormat: 'Q{0}',
            romanDigits: ['I', 'II', 'III', 'IV'],
            _addFormatSeparator: function(format1, format2) {
                var separator = ' ';
                if (format2)
                    return format1 + separator + format2;
                return format1
            },
            _getDateTimeFormatPattern: function(dateTimeFormat) {
                return Globalize.findClosestCulture().calendar.patterns[DX.DateTimeFormat[dateTimeFormat.toLowerCase()]]
            },
            _isDateFormatContains: function(format) {
                var result = false;
                $.each(DX.DateTimeFormat, function(key, value) {
                    result = key === format.toLowerCase();
                    return !result
                });
                return result
            },
            getQuarter: function(month) {
                return Math.floor(month / 3)
            },
            getFirstQuarterMonth: function(month) {
                return this.getQuarter(month) * 3
            },
            _getQuarterString: function(date, format) {
                var quarter = this.getQuarter(date.getMonth());
                switch (format) {
                    case'q':
                        return this.romanDigits[quarter];
                    case'qq':
                        return utils.stringFormat(this.defaultQuarterFormat, this.romanDigits[quarter]);
                    case'Q':
                        return (quarter + 1).toString();
                    case'QQ':
                        return utils.stringFormat(this.defaultQuarterFormat, (quarter + 1).toString())
                }
                return ''
            },
            _formatCustomString: function(value, format) {
                var regExp = /qq|q|QQ|Q/g,
                    quarterFormat,
                    result = '',
                    index = 0;
                regExp.lastIndex = 0;
                while (index < format.length) {
                    quarterFormat = regExp.exec(format);
                    if (!quarterFormat || quarterFormat.index > index)
                        result += Globalize.format(value, format.substring(index, quarterFormat ? quarterFormat.index : format.length));
                    if (quarterFormat) {
                        result += this._getQuarterString(value, quarterFormat[0]);
                        index = quarterFormat.index + quarterFormat[0].length
                    }
                    else
                        index = format.length
                }
                return result
            },
            _parseNumberFormatString: function(format) {
                var formatList,
                    formatObject = {};
                if (!format || typeof format !== 'string')
                    return;
                formatList = format.toLowerCase().split(' ');
                $.each(formatList, function(index, value) {
                    if (value in DX.NumericFormat)
                        formatObject.formatType = value;
                    else if (value in DX.LargeNumberFormatPowers)
                        formatObject.power = DX.LargeNumberFormatPowers[value]
                });
                if (formatObject.power && !formatObject.formatType)
                    formatObject.formatType = 'fixedpoint';
                if (formatObject.formatType)
                    return formatObject
            },
            _calculateNumberPower: function(value, base, minPower, maxPower) {
                var number = Math.abs(value);
                var power = 0;
                if (number > 1)
                    while (number && number >= base && (maxPower === undefined || power < maxPower)) {
                        power++;
                        number = number / base
                    }
                else if (number > 0 && number < 1)
                    while (number < 1 && (minPower === undefined || power > minPower)) {
                        power--;
                        number = number * base
                    }
                return power
            },
            _getNumberByPower: function(number, power, base) {
                var result = number;
                while (power > 0) {
                    result = result / base;
                    power--
                }
                while (power < 0) {
                    result = result * base;
                    power++
                }
                return result
            },
            _formatNumber: function(value, formatObject, precision) {
                var powerPostfix;
                if (formatObject.power === 'auto')
                    formatObject.power = this._calculateNumberPower(value, 1000, 0, MAX_LARGE_NUMBER_POWER);
                if (formatObject.power)
                    value = this._getNumberByPower(value, formatObject.power, 1000);
                powerPostfix = DX.LargeNumberFormatPostfixes[formatObject.power] || '';
                return this._formatNumberCore(value, formatObject.formatType, precision) + powerPostfix
            },
            _formatNumberExponential: function(value, precision) {
                var power = this._calculateNumberPower(value, DECIMAL_BASE),
                    number = this._getNumberByPower(value, power, DECIMAL_BASE),
                    powString;
                precision = precision === undefined ? 1 : precision;
                if (number.toFixed(precision || 0) >= DECIMAL_BASE) {
                    power++;
                    number = number / DECIMAL_BASE
                }
                powString = (power >= 0 ? '+' : '') + power.toString();
                return this._formatNumberCore(number, 'fixedpoint', precision) + 'E' + powString
            },
            _formatNumberCore: function(value, format, precision) {
                if (format === 'exponential')
                    return this._formatNumberExponential(value, precision);
                else
                    return Globalize.format(value, DX.NumericFormat[format] + (utils.isNumber(precision) ? precision : 0))
            },
            _formatDate: function(date, format, formatString) {
                var resultFormat = DX.DateTimeFormat[format.toLowerCase()];
                format = format.toLowerCase();
                if (format === 'quarterandyear')
                    resultFormat = this._getQuarterString(date, resultFormat) + ' yyyy';
                if (format === 'quarter')
                    return this._getQuarterString(date, resultFormat);
                if (format === 'longdatelongtime')
                    return this._formatDate(date, 'longdate') + ' ' + this._formatDate(date, 'longtime');
                if (format === 'shortdateshorttime')
                    return this._formatDate(date, 'shortDate') + ' ' + this._formatDate(date, 'shortTime');
                return Globalize.format(date, resultFormat)
            },
            format: function(value, format, precision) {
                if (format && format.format)
                    if (format.dateType)
                        return this._formatDateEx(value, format);
                    else if (utils.isNumber(value) && isFinite(value))
                        return this._formatNumberEx(value, format);
                return this._format(value, format, precision)
            },
            _format: function(value, format, precision) {
                var numberFormatObject;
                if (!utils.isString(format) || format === '' || !utils.isNumber(value) && !utils.isDate(value))
                    return utils.isDefined(value) ? value.toString() : '';
                numberFormatObject = this._parseNumberFormatString(format);
                if (utils.isNumber(value) && numberFormatObject)
                    return this._formatNumber(value, numberFormatObject, precision);
                if (utils.isDate(value) && this._isDateFormatContains(format))
                    return this._formatDate(value, format);
                if (!numberFormatObject && !this._isDateFormatContains(format))
                    return this._formatCustomString(value, format)
            },
            _formatNumberEx: function(value, formatInfo) {
                var that = this,
                    numericFormatType = DX.NumericFormat[formatInfo.format.toLowerCase()],
                    numberFormat = Globalize.culture().numberFormat,
                    currencyFormat = formatInfo.currencyCulture && Globalize.cultures[formatInfo.currencyCulture] ? Globalize.cultures[formatInfo.currencyCulture].numberFormat.currency : numberFormat.currency,
                    percentFormat = numberFormat.percent,
                    formatSettings = that._getUnitFormatSettings(value, formatInfo),
                    unit = formatSettings.unit,
                    precision = formatSettings.precision,
                    showTrailingZeros = formatSettings.showTrailingZeros,
                    includeGroupSeparator = formatSettings.includeGroupSeparator,
                    groupSymbol = numberFormat[","],
                    floatingSymbol = numberFormat["."],
                    number,
                    isNegative,
                    pattern,
                    currentFormat,
                    regexParts = /n|\$|-|%/g,
                    result = "";
                value = that._applyUnitToValue(value, unit);
                number = Math.abs(value);
                isNegative = value < 0;
                switch (numericFormatType) {
                    case DX.NumericFormat.decimal:
                        pattern = "n";
                        number = Math[isNegative ? "ceil" : "floor"](number);
                        if (precision > 0) {
                            var str = "" + number;
                            for (var i = str.length; i < precision; i += 1)
                                str = "0" + str;
                            number = str
                        }
                        if (isNegative)
                            number = "-" + number;
                        break;
                    case DX.NumericFormat.fixedpoint:
                        currentFormat = numberFormat;
                    case DX.NumericFormat.currency:
                        currentFormat = currentFormat || currencyFormat;
                    case DX.NumericFormat.percent:
                        currentFormat = currentFormat || percentFormat;
                        pattern = isNegative ? currentFormat.pattern[0] : currentFormat.pattern[1] || "n";
                        number = Globalize.format(number * (numericFormatType === DX.NumericFormat.percent ? 100 : 1), "N" + precision);
                        if (!showTrailingZeros)
                            number = that._excludeTrailingZeros(number, floatingSymbol);
                        if (!includeGroupSeparator)
                            number = number.replace(new RegExp('\\' + groupSymbol, 'g'), '');
                        break;
                    case DX.NumericFormat.exponential:
                        return that._formatNumberExponential(value, precision);
                    default:
                        throw"Illegal numeric format: '" + numericFormatType + "'";
                }
                for (; ; ) {
                    var lastIndex = regexParts.lastIndex,
                        matches = regexParts.exec(pattern);
                    result += pattern.slice(lastIndex, matches ? matches.index : pattern.length);
                    if (matches)
                        switch (matches[0]) {
                            case"-":
                                if (/[1-9]/.test(number))
                                    result += numberFormat["-"];
                                break;
                            case"$":
                                result += currencyFormat.symbol;
                                break;
                            case"%":
                                result += percentFormat.symbol;
                                break;
                            case"n":
                                result += number + unit;
                                break
                        }
                    else
                        break
                }
                return (formatInfo.plus && value > 0 ? "+" : '') + result
            },
            _excludeTrailingZeros: function(strValue, floatingSymbol) {
                var floatingIndex = strValue.indexOf(floatingSymbol),
                    stopIndex,
                    i;
                if (floatingIndex < 0)
                    return strValue;
                stopIndex = strValue.length;
                for (i = stopIndex - 1; i >= floatingIndex && (strValue[i] === '0' || i === floatingIndex); i--)
                    stopIndex--;
                return strValue.substring(0, stopIndex)
            },
            _getUnitFormatSettings: function(value, formatInfo) {
                var unit = formatInfo.unit || '',
                    precision = formatInfo.precision || 0,
                    includeGroupSeparator = formatInfo.includeGroupSeparator || false,
                    showTrailingZeros = formatInfo.showTrailingZeros === undefined ? true : formatInfo.showTrailingZeros,
                    significantDigits = formatInfo.significantDigits || 1,
                    absValue;
                if (unit.toLowerCase() === 'auto') {
                    showTrailingZeros = false;
                    absValue = Math.abs(value);
                    if (significantDigits < 1)
                        significantDigits = 1;
                    if (absValue >= 1000000000) {
                        unit = 'B';
                        absValue /= 1000000000
                    }
                    else if (absValue >= 1000000) {
                        unit = 'M';
                        absValue /= 1000000
                    }
                    else if (absValue >= 1000) {
                        unit = 'K';
                        absValue /= 1000
                    }
                    else
                        unit = '';
                    if (absValue == 0)
                        precision = 0;
                    else if (absValue < 1) {
                        precision = significantDigits;
                        var smallValue = Math.pow(10, -significantDigits);
                        while (absValue < smallValue) {
                            smallValue /= 10;
                            precision++
                        }
                    }
                    else if (absValue >= 100)
                        precision = significantDigits - 3;
                    else if (absValue >= 10)
                        precision = significantDigits - 2;
                    else
                        precision = significantDigits - 1
                }
                if (precision < 0)
                    precision = 0;
                return {
                        unit: unit,
                        precision: precision,
                        showTrailingZeros: showTrailingZeros,
                        includeGroupSeparator: includeGroupSeparator
                    }
            },
            _applyUnitToValue: function(value, unit) {
                if (unit == 'B')
                    return value.toFixed(1) / 1000000000;
                if (unit == 'M')
                    return value / 1000000;
                if (unit == 'K')
                    return value / 1000;
                return value
            },
            _formatDateEx: function(value, formatInfo) {
                var that = this,
                    format = formatInfo.format,
                    dateType = formatInfo.dateType,
                    calendar = Globalize.culture().calendars.standard,
                    time = undefined,
                    index,
                    dateStr;
                format = format.toLowerCase();
                if (dateType !== 'num' || format === 'dayofweek')
                    switch (format) {
                        case'monthyear':
                            return that._formatDate(value, 'monthandyear');
                        case'quarteryear':
                            return that._getQuarterString(value, 'QQ') + ' ' + value.getFullYear();
                        case'daymonthyear':
                            return that._formatDate(value, dateType + 'Date');
                        case'datehour':
                            time = new Date(value.getTime());
                            time.setMinutes(0);
                            dateStr = dateType === 'timeOnly' ? '' : that._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? that._formatDate(time, 'shorttime') : dateStr + ' ' + that._formatDate(time, 'shorttime');
                        case'datehourminute':
                            dateStr = dateType === 'timeOnly' ? '' : that._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? that._formatDate(value, 'shorttime') : dateStr + ' ' + that._formatDate(value, 'shorttime');
                        case'datehourminutesecond':
                            dateStr = dateType === 'timeOnly' ? '' : that._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? that._formatDate(value, 'longtime') : dateStr + ' ' + that._formatDate(value, 'longtime');
                        case'year':
                            dateStr = value.toString();
                            return dateType === 'abbr' ? dateStr.slice(2, 4) : dateStr;
                        case'quarter':
                            return utils.stringFormat(that.defaultQuarterFormat, value.toString());
                        case'month':
                            index = value - 1;
                            return dateType === 'abbr' ? calendar.months.namesAbbr[index] : calendar.months.names[index];
                        case'hour':
                            if (dateType === 'long') {
                                time = new Date;
                                time.setHours(value);
                                time.setMinutes(0);
                                return that._formatDate(time, 'shorttime')
                            }
                            else
                                return value.toString();
                        case'dayofweek':
                            index = utils.isString(value) ? $.inArray(value, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) : value;
                            if (dateType !== 'num')
                                return dateType === 'abbr' ? calendar.days.namesAbbr[index] : calendar.days.names[index];
                            else
                                return ((index - calendar.firstDay + 1 + 7) % 8).toString();
                        default:
                            return value.toString()
                    }
                else
                    return value.toString()
            },
            getTimeFormat: function(showSecond) {
                if (showSecond)
                    return this._getDateTimeFormatPattern('longtime');
                return this._getDateTimeFormatPattern('shorttime')
            },
            getDateFormatByDifferences: function(dateDifferences) {
                var resultFormat = '';
                if (dateDifferences.millisecond)
                    resultFormat = DX.DateTimeFormat.millisecond;
                if (dateDifferences.hour || dateDifferences.minute || dateDifferences.second)
                    resultFormat = this._addFormatSeparator(this.getTimeFormat(dateDifferences.second), resultFormat);
                if (dateDifferences.year && dateDifferences.month && dateDifferences.day)
                    return this._addFormatSeparator(this._getDateTimeFormatPattern('shortdate'), resultFormat);
                if (dateDifferences.year && dateDifferences.month)
                    return DX.DateTimeFormat['monthandyear'];
                if (dateDifferences.year)
                    return DX.DateTimeFormat['year'];
                if (dateDifferences.month && dateDifferences.day)
                    return this._addFormatSeparator(this._getDateTimeFormatPattern('monthandday'), resultFormat);
                if (dateDifferences.month)
                    return DX.DateTimeFormat['month'];
                if (dateDifferences.day)
                    return this._addFormatSeparator('dddd, dd', resultFormat);
                return resultFormat
            },
            getDateFormatByTicks: function(ticks) {
                var resultFormat,
                    maxDif,
                    currentDif,
                    i,
                    dateUnitInterval;
                if (ticks.length > 1) {
                    maxDif = utils.getDatesDifferences(ticks[0], ticks[1]);
                    for (i = 1; i < ticks.length - 1; i++) {
                        currentDif = utils.getDatesDifferences(ticks[i], ticks[i + 1]);
                        if (maxDif.count < currentDif.count)
                            maxDif = currentDif
                    }
                }
                else
                    maxDif = {
                        year: true,
                        month: true,
                        day: true,
                        hour: ticks[0].getHours() > 0,
                        minute: ticks[0].getMinutes() > 0,
                        second: ticks[0].getSeconds() > 0
                    };
                resultFormat = this.getDateFormatByDifferences(maxDif);
                return resultFormat
            },
            getDateFormatByTickInterval: function(startValue, endValue, tickInterval) {
                var resultFormat,
                    dateDifferences,
                    dateUnitInterval,
                    dateDifferencesConverter = {
                        quarter: 'month',
                        week: 'day'
                    },
                    correctDateDifferences = function(dateDifferences, tickInterval, value) {
                        switch (tickInterval) {
                            case'year':
                                dateDifferences.month = value;
                            case'quarter':
                            case'month':
                                dateDifferences.day = value;
                            case'week':
                            case'day':
                                dateDifferences.hour = value;
                            case'hour':
                                dateDifferences.minute = value;
                            case'minute':
                                dateDifferences.second = value;
                            case'second':
                                dateDifferences.millisecond = value
                        }
                    },
                    correctDifferencesByMaxDate = function(differences, minDate, maxDate) {
                        if (!maxDate.getMilliseconds() && maxDate.getSeconds()) {
                            if (maxDate.getSeconds() - minDate.getSeconds() === 1) {
                                differences.millisecond = true;
                                differences.second = false
                            }
                        }
                        else if (!maxDate.getSeconds() && maxDate.getMinutes()) {
                            if (maxDate.getMinutes() - minDate.getMinutes() === 1) {
                                differences.second = true;
                                differences.minute = false
                            }
                        }
                        else if (!maxDate.getMinutes() && maxDate.getHours()) {
                            if (maxDate.getHours() - minDate.getHours() === 1) {
                                differences.minute = true;
                                differences.hour = false
                            }
                        }
                        else if (!maxDate.getHours() && maxDate.getDate() > 1) {
                            if (maxDate.getDate() - minDate.getDate() === 1) {
                                differences.hour = true;
                                differences.day = false
                            }
                        }
                        else if (maxDate.getDate() === 1 && maxDate.getMonth()) {
                            if (maxDate.getMonth() - minDate.getMonth() === 1) {
                                differences.day = true;
                                differences.month = false
                            }
                        }
                        else if (!maxDate.getMonth() && maxDate.getFullYear())
                            if (maxDate.getFullYear() - minDate.getFullYear() === 1) {
                                differences.month = true;
                                differences.year = false
                            }
                    };
                tickInterval = utils.isString(tickInterval) ? tickInterval.toLowerCase() : tickInterval;
                dateDifferences = utils.getDatesDifferences(startValue, endValue);
                if (startValue !== endValue)
                    correctDifferencesByMaxDate(dateDifferences, startValue > endValue ? endValue : startValue, startValue > endValue ? startValue : endValue);
                dateUnitInterval = utils.getDateUnitInterval(dateDifferences);
                correctDateDifferences(dateDifferences, dateUnitInterval, true);
                dateUnitInterval = utils.getDateUnitInterval(tickInterval || 'second');
                correctDateDifferences(dateDifferences, dateUnitInterval, false);
                dateDifferences[dateDifferencesConverter[dateUnitInterval] || dateUnitInterval] = true;
                resultFormat = this.getDateFormatByDifferences(dateDifferences);
                return resultFormat
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file color.js */
    (function(DX, undefined) {
        var standardColorNames = {
                aliceblue: 'f0f8ff',
                antiquewhite: 'faebd7',
                aqua: '00ffff',
                aquamarine: '7fffd4',
                azure: 'f0ffff',
                beige: 'f5f5dc',
                bisque: 'ffe4c4',
                black: '000000',
                blanchedalmond: 'ffebcd',
                blue: '0000ff',
                blueviolet: '8a2be2',
                brown: 'a52a2a',
                burlywood: 'deb887',
                cadetblue: '5f9ea0',
                chartreuse: '7fff00',
                chocolate: 'd2691e',
                coral: 'ff7f50',
                cornflowerblue: '6495ed',
                cornsilk: 'fff8dc',
                crimson: 'dc143c',
                cyan: '00ffff',
                darkblue: '00008b',
                darkcyan: '008b8b',
                darkgoldenrod: 'b8860b',
                darkgray: 'a9a9a9',
                darkgreen: '006400',
                darkkhaki: 'bdb76b',
                darkmagenta: '8b008b',
                darkolivegreen: '556b2f',
                darkorange: 'ff8c00',
                darkorchid: '9932cc',
                darkred: '8b0000',
                darksalmon: 'e9967a',
                darkseagreen: '8fbc8f',
                darkslateblue: '483d8b',
                darkslategray: '2f4f4f',
                darkturquoise: '00ced1',
                darkviolet: '9400d3',
                deeppink: 'ff1493',
                deepskyblue: '00bfff',
                dimgray: '696969',
                dodgerblue: '1e90ff',
                feldspar: 'd19275',
                firebrick: 'b22222',
                floralwhite: 'fffaf0',
                forestgreen: '228b22',
                fuchsia: 'ff00ff',
                gainsboro: 'dcdcdc',
                ghostwhite: 'f8f8ff',
                gold: 'ffd700',
                goldenrod: 'daa520',
                gray: '808080',
                green: '008000',
                greenyellow: 'adff2f',
                honeydew: 'f0fff0',
                hotpink: 'ff69b4',
                indianred: 'cd5c5c',
                indigo: '4b0082',
                ivory: 'fffff0',
                khaki: 'f0e68c',
                lavender: 'e6e6fa',
                lavenderblush: 'fff0f5',
                lawngreen: '7cfc00',
                lemonchiffon: 'fffacd',
                lightblue: 'add8e6',
                lightcoral: 'f08080',
                lightcyan: 'e0ffff',
                lightgoldenrodyellow: 'fafad2',
                lightgrey: 'd3d3d3',
                lightgreen: '90ee90',
                lightpink: 'ffb6c1',
                lightsalmon: 'ffa07a',
                lightseagreen: '20b2aa',
                lightskyblue: '87cefa',
                lightslateblue: '8470ff',
                lightslategray: '778899',
                lightsteelblue: 'b0c4de',
                lightyellow: 'ffffe0',
                lime: '00ff00',
                limegreen: '32cd32',
                linen: 'faf0e6',
                magenta: 'ff00ff',
                maroon: '800000',
                mediumaquamarine: '66cdaa',
                mediumblue: '0000cd',
                mediumorchid: 'ba55d3',
                mediumpurple: '9370d8',
                mediumseagreen: '3cb371',
                mediumslateblue: '7b68ee',
                mediumspringgreen: '00fa9a',
                mediumturquoise: '48d1cc',
                mediumvioletred: 'c71585',
                midnightblue: '191970',
                mintcream: 'f5fffa',
                mistyrose: 'ffe4e1',
                moccasin: 'ffe4b5',
                navajowhite: 'ffdead',
                navy: '000080',
                oldlace: 'fdf5e6',
                olive: '808000',
                olivedrab: '6b8e23',
                orange: 'ffa500',
                orangered: 'ff4500',
                orchid: 'da70d6',
                palegoldenrod: 'eee8aa',
                palegreen: '98fb98',
                paleturquoise: 'afeeee',
                palevioletred: 'd87093',
                papayawhip: 'ffefd5',
                peachpuff: 'ffdab9',
                peru: 'cd853f',
                pink: 'ffc0cb',
                plum: 'dda0dd',
                powderblue: 'b0e0e6',
                purple: '800080',
                red: 'ff0000',
                rosybrown: 'bc8f8f',
                royalblue: '4169e1',
                saddlebrown: '8b4513',
                salmon: 'fa8072',
                sandybrown: 'f4a460',
                seagreen: '2e8b57',
                seashell: 'fff5ee',
                sienna: 'a0522d',
                silver: 'c0c0c0',
                skyblue: '87ceeb',
                slateblue: '6a5acd',
                slategray: '708090',
                snow: 'fffafa',
                springgreen: '00ff7f',
                steelblue: '4682b4',
                tan: 'd2b48c',
                teal: '008080',
                thistle: 'd8bfd8',
                tomato: 'ff6347',
                turquoise: '40e0d0',
                violet: 'ee82ee',
                violetred: 'd02090',
                wheat: 'f5deb3',
                white: 'ffffff',
                whitesmoke: 'f5f5f5',
                yellow: 'ffff00',
                yellowgreen: '9acd32'
            };
        var standardColorTypes = [{
                    re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 10), parseInt(colorString[2], 10), parseInt(colorString[3], 10)]
                    }
                }, {
                    re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*\.*\d+)\)$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 10), parseInt(colorString[2], 10), parseInt(colorString[3], 10), parseFloat(colorString[4])]
                    }
                }, {
                    re: /^#(\w{2})(\w{2})(\w{2})$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 16), parseInt(colorString[2], 16), parseInt(colorString[3], 16)]
                    }
                }, {
                    re: /^#(\w{1})(\w{1})(\w{1})$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1] + colorString[1], 16), parseInt(colorString[2] + colorString[2], 16), parseInt(colorString[3] + colorString[3], 16)]
                    }
                }, {
                    re: /^hsv\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                    process: function(colorString) {
                        var h = parseInt(colorString[1], 10),
                            s = parseInt(colorString[2], 10),
                            v = parseInt(colorString[3], 10),
                            rgb = hsvToRgb(h, s, v);
                        return [rgb[0], rgb[1], rgb[2], 1, [h, s, v]]
                    }
                }, {
                    re: /^hsl\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                    process: function(colorString) {
                        var h = parseInt(colorString[1], 10),
                            s = parseInt(colorString[2], 10),
                            l = parseInt(colorString[3], 10),
                            rgb = hslToRgb(h, s, l);
                        return [rgb[0], rgb[1], rgb[2], 1, null, [h, s, l]]
                    }
                }];
        function Color(value) {
            this.baseColor = value;
            var color;
            if (value) {
                color = String(value).toLowerCase().replace(/ /g, '');
                color = standardColorNames[color] ? '#' + standardColorNames[color] : color;
                color = parseColor(color)
            }
            if (!color)
                this.colorIsInvalid = true;
            color = color || {};
            this.r = normalize(color[0]);
            this.g = normalize(color[1]);
            this.b = normalize(color[2]);
            this.a = normalize(color[3], 1, 1);
            if (color[4])
                this.hsv = {
                    h: color[4][0],
                    s: color[4][1],
                    v: color[4][2]
                };
            else
                this.hsv = toHsvFromRgb(this.r, this.g, this.b);
            if (color[5])
                this.hsl = {
                    h: color[5][0],
                    s: color[5][1],
                    l: color[5][2]
                };
            else
                this.hsl = toHslFromRgb(this.r, this.g, this.b)
        }
        function parseColor(color) {
            if (color === "transparent")
                return [0, 0, 0, 0];
            var result,
                i = 0,
                ii = standardColorTypes.length,
                str;
            for (; i < ii; ++i) {
                str = standardColorTypes[i].re.exec(color);
                if (str)
                    return standardColorTypes[i].process(str)
            }
            return null
        }
        function normalize(colorComponent, def, max) {
            def = def || 0;
            max = max || 255;
            return colorComponent < 0 || isNaN(colorComponent) ? def : colorComponent > max ? max : colorComponent
        }
        function toHexFromRgb(r, g, b) {
            return '#' + (0X01000000 | r << 16 | g << 8 | b).toString(16).slice(1)
        }
        function toHsvFromRgb(r, g, b) {
            var max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                delta = max - min,
                H,
                S,
                V;
            V = max;
            S = max === 0 ? 0 : 1 - min / max;
            if (max === min)
                H = 0;
            else
                switch (max) {
                    case r:
                        H = 60 * ((g - b) / delta);
                        if (g < b)
                            H = H + 360;
                        break;
                    case g:
                        H = 60 * ((b - r) / delta) + 120;
                        break;
                    case b:
                        H = 60 * ((r - g) / delta) + 240;
                        break
                }
            S *= 100;
            V *= 100 / 255;
            return {
                    h: Math.round(H),
                    s: Math.round(S),
                    v: Math.round(V)
                }
        }
        function hsvToRgb(h, s, v) {
            var Vdec,
                Vinc,
                Vmin,
                Hi,
                a,
                r,
                g,
                b;
            Hi = Math.floor(h / 60);
            Vmin = (100 - s) * v / 100;
            a = (v - Vmin) * (h % 60 / 60);
            Vinc = Vmin + a;
            Vdec = v - a;
            switch (Hi) {
                case 0:
                    r = v;
                    g = Vinc;
                    b = Vmin;
                    break;
                case 1:
                    r = Vdec;
                    g = v;
                    b = Vmin;
                    break;
                case 2:
                    r = Vmin;
                    g = v;
                    b = Vinc;
                    break;
                case 3:
                    r = Vmin;
                    g = Vdec;
                    b = v;
                    break;
                case 4:
                    r = Vinc;
                    g = Vmin;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = Vmin;
                    b = Vdec;
                    break
            }
            return [Math.round(r * 2.55), Math.round(g * 2.55), Math.round(b * 2.55)]
        }
        function calculateHue(r, g, b, delta) {
            var max = Math.max(r, g, b);
            switch (max) {
                case r:
                    return (g - b) / delta + (g < b ? 6 : 0);
                case g:
                    return (b - r) / delta + 2;
                case b:
                    return (r - g) / delta + 4
            }
        }
        function toHslFromRgb(r, g, b) {
            r = convertTo01Bounds(r, 255);
            g = convertTo01Bounds(g, 255);
            b = convertTo01Bounds(b, 255);
            var max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                maxMinSumm = max + min,
                h,
                s,
                l = maxMinSumm / 2;
            if (max === min)
                h = s = 0;
            else {
                var delta = max - min;
                if (l > 0.5)
                    s = delta / (2 - maxMinSumm);
                else
                    s = delta / maxMinSumm;
                h = calculateHue(r, g, b, delta);
                h /= 6
            }
            return {
                    h: _round(h * 360),
                    s: _round(s * 100),
                    l: _round(l * 100)
                }
        }
        function makeTc(colorPart, h) {
            var Tc = h;
            if (colorPart === "r")
                Tc = h + 1 / 3;
            if (colorPart === "b")
                Tc = h - 1 / 3;
            return Tc
        }
        function modifyTc(Tc) {
            if (Tc < 0)
                Tc += 1;
            if (Tc > 1)
                Tc -= 1;
            return Tc
        }
        function hueToRgb(p, q, Tc) {
            Tc = modifyTc(Tc);
            if (Tc < 1 / 6)
                return p + (q - p) * 6 * Tc;
            if (Tc < 1 / 2)
                return q;
            if (Tc < 2 / 3)
                return p + (q - p) * (2 / 3 - Tc) * 6;
            return p
        }
        function hslToRgb(h, s, l) {
            var r,
                g,
                b,
                h = convertTo01Bounds(h, 360),
                s = convertTo01Bounds(s, 100),
                l = convertTo01Bounds(l, 100);
            if (s === 0)
                r = g = b = l;
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;
                r = hueToRgb(p, q, makeTc("r", h));
                g = hueToRgb(p, q, makeTc("g", h));
                b = hueToRgb(p, q, makeTc("b", h))
            }
            return [_round(r * 255), _round(g * 255), _round(b * 255)]
        }
        function convertTo01Bounds(n, max) {
            n = Math.min(max, Math.max(0, parseFloat(n)));
            if (Math.abs(n - max) < 0.000001)
                return 1;
            return n % max / parseFloat(max)
        }
        function isIntegerBtwMinAndMax(number, min, max) {
            min = min || 0;
            max = max || 255;
            if (number % 1 !== 0 || number < min || number > max || typeof number !== 'number' || isNaN(number))
                return false;
            return true
        }
        var _round = Math.round;
        Color.prototype = {
            constructor: Color,
            highlight: function(step) {
                step = step || 10;
                return this.alter(step).toHex()
            },
            darken: function(step) {
                step = step || 10;
                return this.alter(-step).toHex()
            },
            alter: function(step) {
                var result = new Color;
                result.r = normalize(this.r + step);
                result.g = normalize(this.g + step);
                result.b = normalize(this.b + step);
                return result
            },
            blend: function(blendColor, opacity) {
                var other = blendColor instanceof Color ? blendColor : new Color(blendColor),
                    result = new Color;
                result.r = normalize(_round(this.r * (1 - opacity) + other.r * opacity));
                result.g = normalize(_round(this.g * (1 - opacity) + other.g * opacity));
                result.b = normalize(_round(this.b * (1 - opacity) + other.b * opacity));
                return result
            },
            toHex: function() {
                return toHexFromRgb(this.r, this.g, this.b)
            },
            getPureColor: function() {
                var rgb = hsvToRgb(this.hsv.h, 100, 100);
                return new Color("rgb(" + rgb.join(",") + ")")
            },
            isValidHex: function(hex) {
                return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex)
            },
            isValidRGB: function(r, g, b) {
                if (!isIntegerBtwMinAndMax(r) || !isIntegerBtwMinAndMax(g) || !isIntegerBtwMinAndMax(b))
                    return false;
                return true
            },
            isValidAlpha: function(a) {
                if (isNaN(a) || a < 0 || a > 1 || typeof a !== 'number')
                    return false;
                return true
            },
            colorIsInvalid: false
        };
        DX.Color = Color
    })(DevExpress);
    /*! Module core, file localization.js */
    (function($, DX, undefined) {
        Globalize.localize = function(key, cultureSelector) {
            var neutral = (cultureSelector || this.cultureSelector || "").substring(0, 2);
            return this.findClosestCulture(cultureSelector).messages[key] || this.findClosestCulture(neutral).messages[key] || this.cultures["default"].messages[key]
        };
        var localization = function() {
                var newMessages = {};
                return {
                        setup: function(localizablePrefix) {
                            this.localizeString = function(text) {
                                var regex = new RegExp("(^|[^a-zA-Z_0-9" + localizablePrefix + "-]+)(" + localizablePrefix + "{1,2})([a-zA-Z_0-9-]+)", "g"),
                                    escapeString = localizablePrefix + localizablePrefix;
                                return text.replace(regex, function(str, prefix, escape, localizationKey) {
                                        var result = prefix + localizablePrefix + localizationKey;
                                        if (escape !== escapeString)
                                            if (Globalize.cultures["default"].messages[localizationKey])
                                                result = prefix + Globalize.localize(localizationKey);
                                            else
                                                newMessages[localizationKey] = DX.inflector.humanize(localizationKey);
                                        return result
                                    })
                            }
                        },
                        localizeNode: function(node) {
                            var that = this;
                            $(node).each(function(index, nodeItem) {
                                if (!nodeItem.nodeType)
                                    return;
                                if (nodeItem.nodeType === 3)
                                    nodeItem.nodeValue = that.localizeString(nodeItem.nodeValue);
                                else {
                                    $.each(nodeItem.attributes || [], function(index, attr) {
                                        if (typeof attr.value === "string") {
                                            var localizedValue = that.localizeString(attr.value);
                                            if (attr.value !== localizedValue)
                                                attr.value = localizedValue
                                        }
                                    });
                                    $(nodeItem).contents().each(function(index, node) {
                                        that.localizeNode(node)
                                    })
                                }
                            })
                        },
                        getDictionary: function(onlyNew) {
                            if (onlyNew)
                                return newMessages;
                            return $.extend({}, newMessages, Globalize.cultures["default"].messages)
                        }
                    }
            }();
        localization.setup("@");
        DX.localization = localization
    })(jQuery, DevExpress);
    /*! Module core, file localization.en.js */
    Globalize.addCultureInfo("default", {messages: {
            Yes: "Yes",
            No: "No",
            Cancel: "Cancel",
            Clear: "Clear",
            Done: "Done",
            Loading: "Loading...",
            Select: "Select...",
            Search: "Search",
            Back: "Back",
            OK: "OK",
            "dxLookup-searchPlaceholder": "Minimum character number: {0}",
            "dxCollectionContainerWidget-noDataText": "No data to display",
            "dxList-pullingDownText": "Pull down to refresh...",
            "dxList-pulledDownText": "Release to refresh...",
            "dxList-refreshingText": "Refreshing...",
            "dxList-pageLoadingText": "Loading...",
            "dxList-nextButtonText": "More",
            "dxListEditDecorator-delete": "Delete",
            "dxListEditDecorator-more": "More",
            "dxScrollView-pullingDownText": "Pull down to refresh...",
            "dxScrollView-pulledDownText": "Release to refresh...",
            "dxScrollView-refreshingText": "Refreshing...",
            "dxScrollView-reachBottomText": "Loading...",
            "dxSwitch-onText": "ON",
            "dxSwitch-offText": "OFF",
            "dxDateBox-simulatedDataPickerTitleTime": "Select time",
            "dxDateBox-simulatedDataPickerTitleDate": "Select date",
            "dxDateBox-simulatedDataPickerTitleDateTime": "Select date and time",
            "dxDataGrid-columnChooserTitle": "Column Chooser",
            "dxDataGrid-columnChooserEmptyText": "Drag a column here to hide it",
            "dxDataGrid-groupContinuesMessage": "Continues on the next page",
            "dxDataGrid-groupContinuedMessage": "Continued from the previous page",
            "dxDataGrid-editingEditRow": "Edit",
            "dxDataGrid-editingSaveRowChanges": "Save",
            "dxDataGrid-editingCancelRowChanges": "Cancel",
            "dxDataGrid-editingDeleteRow": "Delete",
            "dxDataGrid-editingUndeleteRow": "Undelete",
            "dxDataGrid-editingConfirmDeleteMessage": "Are you sure you want to delete this record?",
            "dxDataGrid-editingConfirmDeleteTitle": "",
            "dxDataGrid-groupPanelEmptyText": "Drag a column header here to group by that column",
            "dxDataGrid-noDataText": "No data",
            "dxDataGrid-searchPanelPlaceholder": "Search...",
            "dxDataGrid-filterRowShowAllText": "(All)",
            "dxDataGrid-filterRowResetOperationText": "Reset",
            "dxDataGrid-filterRowOperationEquals": "Equals",
            "dxDataGrid-filterRowOperationNotEquals": "Does not equal",
            "dxDataGrid-filterRowOperationLess": "Less than",
            "dxDataGrid-filterRowOperationLessOrEquals": "Less than or equal to",
            "dxDataGrid-filterRowOperationGreater": "Greater than",
            "dxDataGrid-filterRowOperationGreaterOrEquals": "Greater than or equal to",
            "dxDataGrid-filterRowOperationStartsWith": "Starts with",
            "dxDataGrid-filterRowOperationContains": "Contains",
            "dxDataGrid-filterRowOperationNotContains": "Does not contain",
            "dxDataGrid-filterRowOperationEndsWith": "Ends with",
            "dxDataGrid-trueText": "true",
            "dxDataGrid-falseText": "false",
            "dxDataGrid-sortingAscendingText": "Sort Ascending",
            "dxDataGrid-sortingDescendingText": "Sort Descending",
            "dxDataGrid-sortingClearText": "Clear Sorting"
        }});
    /*! Module core, file data.js */
    (function($, DX, undefined) {
        var bracketsToDots = function(expr) {
                return expr.replace(/\[/g, ".").replace(/\]/g, "")
            };
        var unwrapObservable = DX.utils.unwrapObservable;
        var isObservable = function(value) {
                return DX.support.hasKo && ko.isObservable(value)
            };
        var readPropValue = function(obj, propName) {
                if (propName === "this")
                    return obj;
                return obj[propName]
            };
        var assignPropValue = function(obj, propName, value) {
                if (propName === "this")
                    throw Error("Cannot assign to self");
                var propValue = obj[propName];
                if (isObservable(propValue))
                    propValue(value);
                else
                    obj[propName] = value
            };
        var compileGetter = function(expr) {
                if (arguments.length > 1)
                    expr = $.makeArray(arguments);
                if (!expr || expr === "this")
                    return function(obj) {
                            return obj
                        };
                if ($.isFunction(expr))
                    return expr;
                if ($.isArray(expr))
                    return combineGetters(expr);
                expr = bracketsToDots(expr);
                var path = expr.split(".");
                return function(obj, options) {
                        options = options || {};
                        var current = unwrapObservable(obj);
                        $.each(path, function() {
                            if (!current)
                                return false;
                            var next = unwrapObservable(current[this]);
                            if ($.isFunction(next) && !options.functionsAsIs)
                                next = next.call(current);
                            current = next
                        });
                        return current
                    }
            };
        var combineGetters = function(getters) {
                var compiledGetters = {};
                $.each(getters, function() {
                    compiledGetters[this] = compileGetter(this)
                });
                return function(obj, options) {
                        var result = {};
                        $.each(compiledGetters, function(name) {
                            var value = this(obj, options),
                                current,
                                path,
                                last,
                                i;
                            if (value === undefined)
                                return;
                            current = result;
                            path = name.split(".");
                            last = path.length - 1;
                            for (i = 0; i < last; i++)
                                current = current[path[i]] = {};
                            current[path[i]] = value
                        });
                        return result
                    }
            };
        var compileSetter = function(expr) {
                expr = expr || "this";
                expr = bracketsToDots(expr);
                var pos = expr.lastIndexOf("."),
                    targetGetter = compileGetter(expr.substr(0, pos)),
                    targetPropName = expr.substr(1 + pos);
                return function(obj, value, options) {
                        options = options || {};
                        var target = targetGetter(obj, {functionsAsIs: options.functionsAsIs}),
                            prevTargetValue = readPropValue(target, targetPropName);
                        if (!options.functionsAsIs && $.isFunction(prevTargetValue) && !isObservable(prevTargetValue))
                            target[targetPropName](value);
                        else {
                            prevTargetValue = unwrapObservable(prevTargetValue);
                            if (options.merge && $.isPlainObject(value) && (prevTargetValue === undefined || $.isPlainObject(prevTargetValue)) && !(value instanceof $.Event)) {
                                if (!prevTargetValue)
                                    assignPropValue(target, targetPropName, {});
                                DX.utils.deepExtendArraySafe(unwrapObservable(readPropValue(target, targetPropName)), value)
                            }
                            else
                                assignPropValue(target, targetPropName, value)
                        }
                    }
            };
        var normalizeBinaryCriterion = function(crit) {
                return [crit[0], crit.length < 3 ? "=" : String(crit[1]).toLowerCase(), crit.length < 2 ? true : crit[crit.length - 1]]
            };
        var normalizeSortingInfo = function(info) {
                if (!$.isArray(info))
                    info = [info];
                return $.map(info, function(i) {
                        return {
                                selector: $.isFunction(i) || typeof i === "string" ? i : i.getter || i.field || i.selector,
                                desc: !!(i.desc || String(i.dir).charAt(0).toLowerCase() === "d")
                            }
                    })
            };
        var Guid = DX.Class.inherit({
                ctor: function(value) {
                    if (value)
                        value = String(value);
                    this._value = this._normalize(value || this._generate())
                },
                _normalize: function(value) {
                    value = value.replace(/[^a-f0-9]/ig, "").toLowerCase();
                    while (value.length < 32)
                        value += "0";
                    return [value.substr(0, 8), value.substr(8, 4), value.substr(12, 4), value.substr(16, 4), value.substr(20, 12)].join("-")
                },
                _generate: function() {
                    var value = "";
                    for (var i = 0; i < 32; i++)
                        value += Math.round(Math.random() * 15).toString(16);
                    return value
                },
                toString: function() {
                    return this._value
                },
                valueOf: function() {
                    return this._value
                },
                toJSON: function() {
                    return this._value
                }
            });
        var toComparable = function(value, caseSensitive) {
                if (value instanceof Date)
                    return value.getTime();
                if (value instanceof Guid)
                    return value.valueOf();
                if (!caseSensitive && typeof value === "string")
                    return value.toLowerCase();
                return value
            };
        var keysEqual = function(keyExpr, key1, key2) {
                if ($.isArray(keyExpr)) {
                    var names = $.map(key1, function(v, k) {
                            return k
                        }),
                        name;
                    for (var i = 0; i < names.length; i++) {
                        name = names[i];
                        if (toComparable(key1[name], true) != toComparable(key2[name], true))
                            return false
                    }
                    return true
                }
                return toComparable(key1, true) == toComparable(key2, true)
            };
        var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var base64_encode = function(input) {
                if (!$.isArray(input))
                    input = stringToByteArray(String(input));
                var result = "";
                for (var i = 0; i < input.length; i += 3) {
                    var octet1 = input[i],
                        octet2 = input[i + 1],
                        octet3 = input[i + 2];
                    result += $.map([octet1 >> 2, (octet1 & 3) << 4 | octet2 >> 4, isNaN(octet2) ? 64 : (octet2 & 15) << 2 | octet3 >> 6, isNaN(octet3) ? 64 : octet3 & 63], function(item) {
                        return BASE64_CHARS.charAt(item)
                    }).join("")
                }
                return result
            };
        var stringToByteArray = function(str) {
                var bytes = [],
                    code,
                    i;
                for (i = 0; i < str.length; i++) {
                    code = str.charCodeAt(i);
                    if (code < 128)
                        bytes.push(code);
                    else if (code < 2048)
                        bytes.push(192 + (code >> 6), 128 + (code & 63));
                    else if (code < 65536)
                        bytes.push(224 + (code >> 12), 128 + (code >> 6 & 63), 128 + (code & 63));
                    else if (code < 2097152)
                        bytes.push(240 + (code >> 18), 128 + (code >> 12 & 63), 128 + (code >> 6 & 63), 128 + (code & 63))
                }
                return bytes
            };
        var errorMessageFromXhr = function() {
                var textStatusMessages = {
                        timeout: "Network connection timeout",
                        error: "Unspecified network error",
                        parsererror: "Unexpected server response"
                    };
                var textStatusDetails = {
                        timeout: "possible causes: the remote host is not accessible, overloaded or is not included into the domain white-list when being run in the native container",
                        error: "if the remote host is located on another domain, make sure it properly supports cross-origin resource sharing (CORS), or use the JSONP approach instead",
                        parsererror: "the remote host did not respond with valid JSON data"
                    };
                var explainTextStatus = function(textStatus) {
                        var result = textStatusMessages[textStatus];
                        if (!result)
                            return textStatus;
                        result += " (" + textStatusDetails[textStatus] + ")";
                        return result
                    };
                return function(xhr, textStatus) {
                        if (xhr.status < 400)
                            return explainTextStatus(textStatus);
                        return xhr.statusText
                    }
            }();
        var data = DX.data = {
                utils: {
                    compileGetter: compileGetter,
                    compileSetter: compileSetter,
                    normalizeBinaryCriterion: normalizeBinaryCriterion,
                    normalizeSortingInfo: normalizeSortingInfo,
                    toComparable: toComparable,
                    keysEqual: keysEqual,
                    errorMessageFromXhr: errorMessageFromXhr
                },
                Guid: Guid,
                base64_encode: base64_encode,
                queryImpl: {},
                queryAdapters: {},
                query: function() {
                    var impl = $.isArray(arguments[0]) ? "array" : "remote";
                    return data.queryImpl[impl].apply(this, arguments)
                },
                errorHandler: null,
                _handleError: function(error) {
                    if (window.console)
                        console.warn("[DevExpress.data]: " + error);
                    if (data.errorHandler)
                        data.errorHandler(error)
                }
            }
    })(jQuery, DevExpress);
    /*! Module core, file data.query.array.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            data = DX.data,
            queryImpl = data.queryImpl,
            compileGetter = data.utils.compileGetter,
            toComparable = data.utils.toComparable;
        var Iterator = Class.inherit({
                toArray: function() {
                    var result = [];
                    this.reset();
                    while (this.next())
                        result.push(this.current());
                    return result
                },
                countable: function() {
                    return false
                }
            });
        var ArrayIterator = Iterator.inherit({
                ctor: function(array) {
                    this.array = array;
                    this.index = -1
                },
                next: function() {
                    if (this.index + 1 < this.array.length) {
                        this.index++;
                        return true
                    }
                    return false
                },
                current: function() {
                    return this.array[this.index]
                },
                reset: function() {
                    this.index = -1
                },
                toArray: function() {
                    return this.array.slice(0)
                },
                countable: function() {
                    return true
                },
                count: function() {
                    return this.array.length
                }
            });
        var WrappedIterator = Iterator.inherit({
                ctor: function(iter) {
                    this.iter = iter
                },
                next: function() {
                    return this.iter.next()
                },
                current: function() {
                    return this.iter.current()
                },
                reset: function() {
                    return this.iter.reset()
                }
            });
        var MapIterator = WrappedIterator.inherit({
                ctor: function(iter, mapper) {
                    this.callBase(iter);
                    this.index = -1;
                    this.mapper = mapper
                },
                current: function() {
                    return this.mapper(this.callBase(), this.index)
                },
                next: function() {
                    var hasNext = this.callBase();
                    if (hasNext)
                        this.index++;
                    return hasNext
                }
            });
        var SortIterator = Iterator.inherit({
                ctor: function(iter, getter, desc) {
                    if (!(iter instanceof MapIterator))
                        iter = new MapIterator(iter, this._wrap);
                    this.iter = iter;
                    this.rules = [{
                            getter: getter,
                            desc: desc
                        }]
                },
                thenBy: function(getter, desc) {
                    var result = new SortIterator(this.sortedIter || this.iter, getter, desc);
                    if (!this.sortedIter)
                        result.rules = this.rules.concat(result.rules);
                    return result
                },
                next: function() {
                    this._ensureSorted();
                    return this.sortedIter.next()
                },
                current: function() {
                    this._ensureSorted();
                    return this.sortedIter.current()
                },
                reset: function() {
                    delete this.sortedIter
                },
                countable: function() {
                    return this.sortedIter || this.iter.countable()
                },
                count: function() {
                    if (this.sortedIter)
                        return this.sortedIter.count();
                    return this.iter.count()
                },
                _ensureSorted: function() {
                    if (this.sortedIter)
                        return;
                    $.each(this.rules, function() {
                        this.getter = compileGetter(this.getter)
                    });
                    this.sortedIter = new MapIterator(new ArrayIterator(this.iter.toArray().sort($.proxy(this._compare, this))), this._unwrap)
                },
                _wrap: function(record, index) {
                    return {
                            index: index,
                            value: record
                        }
                },
                _unwrap: function(wrappedItem) {
                    return wrappedItem.value
                },
                _compare: function(x, y) {
                    var xIndex = x.index,
                        yIndex = y.index;
                    x = x.value;
                    y = y.value;
                    if (x === y)
                        return xIndex - yIndex;
                    for (var i = 0, rulesCount = this.rules.length; i < rulesCount; i++) {
                        var rule = this.rules[i],
                            xValue = toComparable(rule.getter(x)),
                            yValue = toComparable(rule.getter(y)),
                            factor = rule.desc ? -1 : 1;
                        if (xValue < yValue)
                            return -factor;
                        if (xValue > yValue)
                            return factor;
                        if (xValue !== yValue)
                            return !xValue ? -factor : factor
                    }
                    return xIndex - yIndex
                }
            });
        var compileCriteria = function() {
                var compileGroup = function(crit) {
                        var operands = [],
                            bag = ["return function(d) { return "],
                            index = 0,
                            pushAnd = false;
                        $.each(crit, function() {
                            if ($.isArray(this) || $.isFunction(this)) {
                                if (pushAnd)
                                    bag.push(" && ");
                                operands.push(compileCriteria(this));
                                bag.push("op[", index, "](d)");
                                index++;
                                pushAnd = true
                            }
                            else {
                                bag.push(/and|&/i.test(this) ? " && " : " || ");
                                pushAnd = false
                            }
                        });
                        bag.push(" }");
                        return new Function("op", bag.join(""))(operands)
                    };
                var toString = function(value) {
                        return DX.utils.isDefined(value) ? value.toString() : ''
                    };
                var compileBinary = function(crit) {
                        crit = data.utils.normalizeBinaryCriterion(crit);
                        var getter = compileGetter(crit[0]),
                            op = crit[1],
                            value = crit[2];
                        value = toComparable(value);
                        switch (op.toLowerCase()) {
                            case"=":
                                return compileEquals(getter, value);
                            case"<>":
                                return compileEquals(getter, value, true);
                            case">":
                                return function(obj) {
                                        return toComparable(getter(obj)) > value
                                    };
                            case"<":
                                return function(obj) {
                                        return toComparable(getter(obj)) < value
                                    };
                            case">=":
                                return function(obj) {
                                        return toComparable(getter(obj)) >= value
                                    };
                            case"<=":
                                return function(obj) {
                                        return toComparable(getter(obj)) <= value
                                    };
                            case"startswith":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) === 0
                                    };
                            case"endswith":
                                return function(obj) {
                                        var getterValue = toComparable(toString(getter(obj)));
                                        return getterValue.lastIndexOf(value) === getterValue.length - toString(value).length
                                    };
                            case"contains":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) > -1
                                    };
                            case"notcontains":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) === -1
                                    }
                        }
                        throw Error("Unknown filter operation: " + op);
                    };
                function compileEquals(getter, value, negate) {
                    return function(obj) {
                            obj = toComparable(getter(obj));
                            var result = useStrictComparison(value) ? obj === value : obj == value;
                            if (negate)
                                result = !result;
                            return result
                        }
                }
                function useStrictComparison(value) {
                    return value === "" || value === 0 || value === null || value === false || value === undefined
                }
                return function(crit) {
                        if ($.isFunction(crit))
                            return crit;
                        if ($.isArray(crit[0]))
                            return compileGroup(crit);
                        return compileBinary(crit)
                    }
            }();
        var FilterIterator = WrappedIterator.inherit({
                ctor: function(iter, criteria) {
                    this.callBase(iter);
                    this.criteria = compileCriteria(criteria)
                },
                next: function() {
                    while (this.iter.next())
                        if (this.criteria(this.current()))
                            return true;
                    return false
                }
            });
        var GroupIterator = Iterator.inherit({
                ctor: function(iter, getter) {
                    this.iter = iter;
                    this.getter = getter
                },
                next: function() {
                    this._ensureGrouped();
                    return this.groupedIter.next()
                },
                current: function() {
                    this._ensureGrouped();
                    return this.groupedIter.current()
                },
                reset: function() {
                    delete this.groupedIter
                },
                countable: function() {
                    return !!this.groupedIter
                },
                count: function() {
                    return this.groupedIter.count()
                },
                _ensureGrouped: function() {
                    if (this.groupedIter)
                        return;
                    var hash = {},
                        keys = [],
                        iter = this.iter,
                        getter = compileGetter(this.getter);
                    iter.reset();
                    while (iter.next()) {
                        var current = iter.current(),
                            key = getter(current);
                        if (key in hash)
                            hash[key].push(current);
                        else {
                            hash[key] = [current];
                            keys.push(key)
                        }
                    }
                    this.groupedIter = new ArrayIterator($.map(keys, function(key) {
                        return {
                                key: key,
                                items: hash[key]
                            }
                    }))
                }
            });
        var SelectIterator = WrappedIterator.inherit({
                ctor: function(iter, getter) {
                    this.callBase(iter);
                    this.getter = compileGetter(getter)
                },
                current: function() {
                    return this.getter(this.callBase())
                },
                countable: function() {
                    return this.iter.countable()
                },
                count: function() {
                    return this.iter.count()
                }
            });
        var SliceIterator = WrappedIterator.inherit({
                ctor: function(iter, skip, take) {
                    this.callBase(iter);
                    this.skip = Math.max(0, skip);
                    this.take = Math.max(0, take);
                    this.pos = 0
                },
                next: function() {
                    if (this.pos >= this.skip + this.take)
                        return false;
                    while (this.pos < this.skip && this.iter.next())
                        this.pos++;
                    this.pos++;
                    return this.iter.next()
                },
                reset: function() {
                    this.callBase();
                    this.pos = 0
                },
                countable: function() {
                    return this.iter.countable()
                },
                count: function() {
                    return Math.min(this.iter.count() - this.skip, this.take)
                }
            });
        queryImpl.array = function(iter, queryOptions) {
            queryOptions = queryOptions || {};
            if (!(iter instanceof Iterator))
                iter = new ArrayIterator(iter);
            var handleError = function(error) {
                    var handler = queryOptions.errorHandler;
                    if (handler)
                        handler(error);
                    data._handleError(error)
                };
            var aggregate = function(seed, step, finalize) {
                    var d = $.Deferred().fail(handleError);
                    try {
                        iter.reset();
                        if (arguments.length < 2) {
                            step = arguments[0];
                            seed = iter.next() ? iter.current() : undefined
                        }
                        var accumulator = seed;
                        while (iter.next())
                            accumulator = step(accumulator, iter.current());
                        d.resolve(finalize ? finalize(accumulator) : accumulator)
                    }
                    catch(x) {
                        d.reject(x)
                    }
                    return d.promise()
                };
            var select = function(getter) {
                    if (!$.isFunction(getter) && !$.isArray(getter))
                        getter = $.makeArray(arguments);
                    return chainQuery(new SelectIterator(iter, getter))
                };
            var selectProp = function(name) {
                    return select(compileGetter(name))
                };
            var chainQuery = function(iter) {
                    return queryImpl.array(iter, queryOptions)
                };
            return {
                    toArray: function() {
                        return iter.toArray()
                    },
                    enumerate: function() {
                        var d = $.Deferred().fail(handleError);
                        try {
                            d.resolve(iter.toArray())
                        }
                        catch(x) {
                            d.reject(x)
                        }
                        return d.promise()
                    },
                    sortBy: function(getter, desc) {
                        return chainQuery(new SortIterator(iter, getter, desc))
                    },
                    thenBy: function(getter, desc) {
                        if (iter instanceof SortIterator)
                            return chainQuery(iter.thenBy(getter, desc));
                        throw Error();
                    },
                    filter: function(criteria) {
                        if (!$.isArray(criteria))
                            criteria = $.makeArray(arguments);
                        return chainQuery(new FilterIterator(iter, criteria))
                    },
                    slice: function(skip, take) {
                        if (take === undefined)
                            take = Number.MAX_VALUE;
                        return chainQuery(new SliceIterator(iter, skip, take))
                    },
                    select: select,
                    groupBy: function(getter) {
                        return chainQuery(new GroupIterator(iter, getter))
                    },
                    aggregate: aggregate,
                    count: function() {
                        if (iter.countable()) {
                            var d = $.Deferred().fail(handleError);
                            try {
                                d.resolve(iter.count())
                            }
                            catch(x) {
                                d.reject(x)
                            }
                            return d.promise()
                        }
                        return aggregate(0, function(count) {
                                return 1 + count
                            })
                    },
                    sum: function(getter) {
                        if (getter)
                            return selectProp(getter).sum();
                        return aggregate(0, function(sum, item) {
                                return sum + item
                            })
                    },
                    min: function(getter) {
                        if (getter)
                            return selectProp(getter).min();
                        return aggregate(function(min, item) {
                                return item < min ? item : min
                            })
                    },
                    max: function(getter) {
                        if (getter)
                            return selectProp(getter).max();
                        return aggregate(function(max, item) {
                                return item > max ? item : max
                            })
                    },
                    avg: function(getter) {
                        if (getter)
                            return selectProp(getter).avg();
                        var count = 0;
                        return aggregate(0, function(sum, item) {
                                count++;
                                return sum + item
                            }, function(sum) {
                                return count ? sum / count : undefined
                            })
                    }
                }
        }
    })(jQuery, DevExpress);
    /*! Module core, file data.query.remote.js */
    (function($, DX, undefined) {
        var data = DX.data,
            queryImpl = data.queryImpl;
        queryImpl.remote = function(url, queryOptions, tasks) {
            tasks = tasks || [];
            queryOptions = queryOptions || {};
            var createTask = function(name, args) {
                    return {
                            name: name,
                            args: args
                        }
                };
            var exec = function(executorTask) {
                    var d = $.Deferred(),
                        adapterFactory,
                        adapter,
                        taskQueue,
                        currentTask;
                    var rejectWithNotify = function(error) {
                            var handler = queryOptions.errorHandler;
                            if (handler)
                                handler(error);
                            data._handleError(error);
                            d.reject(error)
                        };
                    try {
                        adapterFactory = queryOptions.adapter || "odata";
                        if (!$.isFunction(adapterFactory))
                            adapterFactory = data.queryAdapters[adapterFactory];
                        adapter = adapterFactory(queryOptions);
                        taskQueue = [].concat(tasks).concat(executorTask);
                        while (taskQueue.length) {
                            currentTask = taskQueue[0];
                            if (String(currentTask.name) !== "enumerate")
                                if (!adapter[currentTask.name] || adapter[currentTask.name].apply(adapter, currentTask.args) === false)
                                    break;
                            taskQueue.shift()
                        }
                        adapter.exec(url).done(function(result, extra) {
                            if (!taskQueue.length)
                                d.resolve(result, extra);
                            else {
                                var clientChain = queryImpl.array(result, {errorHandler: queryOptions.errorHandler});
                                $.each(taskQueue, function() {
                                    clientChain = clientChain[this.name].apply(clientChain, this.args)
                                });
                                clientChain.done($.proxy(d.resolve, d)).fail($.proxy(d.reject, d))
                            }
                        }).fail(rejectWithNotify)
                    }
                    catch(x) {
                        rejectWithNotify(x)
                    }
                    return d.promise()
                };
            var query = {};
            $.each(["sortBy", "thenBy", "filter", "slice", "select", "groupBy"], function() {
                var name = this;
                query[name] = function() {
                    return queryImpl.remote(url, queryOptions, tasks.concat(createTask(name, arguments)))
                }
            });
            $.each(["count", "min", "max", "sum", "avg", "aggregate", "enumerate"], function() {
                var name = this;
                query[name] = function() {
                    return exec.call(this, createTask(name, arguments))
                }
            });
            return query
        }
    })(jQuery, DevExpress);
    /*! Module core, file data.odata.js */
    (function($, DX, undefined) {
        var data = DX.data,
            utils = DX.utils,
            Guid = data.Guid;
        var VERBOSE_DATE_REGEX = /^\/Date\((-?\d+)((\+|-)?(\d+)?)\)\/$/;
        var ISO8601_DATE_REGEX = /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/;
        var TIMEZONE_OFFSET = (new Date).getTimezoneOffset() * 60 * 1000;
        var JSON_VERBOSE_MIME_TYPE = "application/json;odata=verbose";
        function stringify(object) {
            return JSON.stringify(object, replacer);
            function replacer(key, value) {
                if (this[key] instanceof Date)
                    return utils.formatIso8601Date(this[key]);
                return value
            }
        }
        var ajaxOptionsForRequest = function(request, requestOptions) {
                request = $.extend({
                    method: "get",
                    url: "",
                    params: {},
                    payload: null,
                    headers: {}
                }, request);
                requestOptions = requestOptions || {};
                var beforeSend = requestOptions.beforeSend;
                if (beforeSend)
                    beforeSend(request);
                var method = (request.method || "get").toLowerCase(),
                    isGet = method === "get",
                    useJsonp = isGet && requestOptions.jsonp,
                    params = $.extend({}, request.params),
                    ajaxData = isGet ? params : stringify(request.payload),
                    qs = !isGet && $.param(params),
                    url = request.url,
                    contentType = !isGet && JSON_VERBOSE_MIME_TYPE;
                if (qs)
                    url += (url.indexOf("?") > -1 ? "&" : "?") + qs;
                if (useJsonp)
                    ajaxData["$format"] = "json";
                return {
                        url: url,
                        data: ajaxData,
                        dataType: useJsonp ? "jsonp" : "json",
                        jsonp: useJsonp && "$callback",
                        type: method,
                        timeout: 30000,
                        headers: request.headers,
                        contentType: contentType,
                        accepts: {json: [JSON_VERBOSE_MIME_TYPE, "text/plain"].join()},
                        xhrFields: {withCredentials: requestOptions.withCredentials}
                    }
            };
        var sendRequest = function(request, requestOptions) {
                var d = $.Deferred();
                $.ajax(ajaxOptionsForRequest(request, requestOptions)).always(function(obj, textStatus) {
                    var tuplet = interpretJsonFormat(obj, textStatus),
                        error = tuplet.error,
                        data = tuplet.data,
                        nextUrl = tuplet.nextUrl,
                        extra;
                    if (error)
                        d.reject(error);
                    else if (requestOptions.countOnly)
                        d.resolve(tuplet.count);
                    else if (nextUrl)
                        sendRequest({url: nextUrl}, requestOptions).fail($.proxy(d.reject, d)).done(function(nextData) {
                            d.resolve(data.concat(nextData))
                        });
                    else {
                        if (isFinite(tuplet.count))
                            extra = {totalCount: tuplet.count};
                        d.resolve(data, extra)
                    }
                });
                return d.promise()
            };
        var formatDotNetError = function(errorObj) {
                var message,
                    currentError = errorObj;
                if ("message" in errorObj)
                    if (errorObj.message.value)
                        message = errorObj.message.value;
                    else
                        message = errorObj.message;
                while (currentError = currentError.innererror || currentError.internalexception) {
                    message = currentError.message;
                    if (currentError.internalexception && message.indexOf("inner exception") === -1)
                        break
                }
                return message
            };
        var errorFromResponse = function(obj, textStatus) {
                if (textStatus === "nocontent")
                    return null;
                var httpStatus = 200,
                    message = "Unknown error",
                    response = obj;
                if (textStatus !== "success") {
                    httpStatus = obj.status;
                    message = data.utils.errorMessageFromXhr(obj, textStatus);
                    try {
                        response = $.parseJSON(obj.responseText)
                    }
                    catch(x) {}
                }
                var errorObj = response && (response.error || response["@odata.error"]);
                if (errorObj) {
                    message = formatDotNetError(errorObj) || message;
                    if (httpStatus === 200)
                        httpStatus = 500;
                    if (errorObj.code)
                        httpStatus = Number(errorObj.code);
                    return $.extend(Error(message), {
                            httpStatus: httpStatus,
                            errorDetails: errorObj
                        })
                }
                else if (httpStatus !== 200)
                    return $.extend(Error(message), {httpStatus: httpStatus})
            };
        var interpretJsonFormat = function(obj, textStatus) {
                var error = errorFromResponse(obj, textStatus),
                    value;
                if (error)
                    return {error: error};
                if (!$.isPlainObject(obj))
                    return {data: obj};
                if ("d" in obj && (utils.isArray(obj.d) || utils.isObject(obj.d)))
                    value = interpretVerboseJsonFormat(obj, textStatus);
                else
                    value = interpretLightJsonFormat(obj, textStatus);
                transformDates(value);
                return value
            };
        var interpretVerboseJsonFormat = function(obj, textStatus) {
                var data = obj.d;
                if (!data)
                    return {error: Error("Malformed or unsupported JSON response received")};
                data = data.results || data;
                return {
                        data: data,
                        nextUrl: obj.d.__next,
                        count: parseInt(obj.d.__count, 10)
                    }
            };
        var interpretLightJsonFormat = function(obj, textStatus) {
                var data = obj.value || obj;
                if (!data)
                    return {error: Error("Malformed or unsupported JSON response received")};
                return {
                        data: data,
                        nextUrl: obj["@odata.nextLink"],
                        count: parseInt(obj["@odata.count"], 10)
                    }
            };
        var EdmLiteral = DX.Class.inherit({
                ctor: function(value) {
                    this._value = value
                },
                valueOf: function() {
                    return this._value
                }
            });
        var transformDates = function(obj) {
                $.each(obj, function(key, value) {
                    if (value !== null && typeof value === "object")
                        transformDates(value);
                    else if (typeof value === "string")
                        if (value.match(VERBOSE_DATE_REGEX))
                            obj[key] = new Date(TIMEZONE_OFFSET + Number(RegExp.$1) + RegExp.$2 * 60000);
                        else if (ISO8601_DATE_REGEX.test(value))
                            obj[key] = new Date(TIMEZONE_OFFSET + utils.parseIso8601Date(obj[key]).valueOf())
                })
            };
        var serializeDate = function() {
                var pad = function(part) {
                        part = String(part);
                        if (part.length < 2)
                            part = "0" + part;
                        return part
                    };
                return function(date) {
                        var result = ["datetime'", date.getFullYear(), "-", pad(date.getMonth() + 1), "-", pad(date.getDate())];
                        if (date.getHours() || date.getMinutes() || date.getSeconds() || date.getMilliseconds()) {
                            result.push("T", pad(date.getHours()), ":", pad(date.getMinutes()), ":", pad(date.getSeconds()));
                            if (date.getMilliseconds())
                                result.push(".", date.getMilliseconds())
                        }
                        result.push("'");
                        return result.join("")
                    }
            }();
        var serializeString = function(value) {
                return "'" + value.replace(/</g, "%26lt").replace(/'/g, "''") + "'"
            };
        var serializePropName = function(propName) {
                if (propName instanceof EdmLiteral)
                    return propName.valueOf();
                return propName.replace(/\./g, "/")
            };
        var serializeValueV4 = function(value) {
                if (value instanceof Date)
                    return utils.formatIso8601Date(value);
                return serializeValueV2(value)
            };
        var serializeValueV2 = function(value) {
                if (value instanceof Date)
                    return serializeDate(value);
                if (value instanceof Guid)
                    return "guid'" + value + "'";
                if (value instanceof EdmLiteral)
                    return value.valueOf();
                if (typeof value === "string")
                    return serializeString(value);
                return String(value)
            };
        var DEFAULT_PROTOCOL_VERSION = 2;
        var serializeValue = function(value, protocolVersion) {
                protocolVersion = protocolVersion || DEFAULT_PROTOCOL_VERSION;
                switch (protocolVersion) {
                    case 2:
                    case 3:
                        return serializeValueV2(value);
                    case 4:
                        return serializeValueV4(value);
                    default:
                        throw new Error("Unknown OData protocol version");
                }
            };
        var serializeKey = function(key, protocolVersion) {
                if ($.isPlainObject(key)) {
                    var parts = [];
                    $.each(key, function(k, v) {
                        parts.push(serializePropName(k) + "=" + serializeValue(v, protocolVersion))
                    });
                    return parts.join()
                }
                return serializeValue(key)
            };
        var keyConverters = {
                String: function(value) {
                    return value + ""
                },
                Int32: function(value) {
                    return Math.floor(value)
                },
                Int64: function(value) {
                    if (value instanceof EdmLiteral)
                        return value;
                    return new EdmLiteral(value + "L")
                },
                Guid: function(value) {
                    if (value instanceof Guid)
                        return value;
                    return new Guid(value)
                },
                Boolean: function(value) {
                    return !!value
                },
                Single: function(value) {
                    if (value instanceof EdmLiteral)
                        return value;
                    return new EdmLiteral(value + "f")
                },
                Decimal: function(value) {
                    if (value instanceof EdmLiteral)
                        return value;
                    return new EdmLiteral(value + "m")
                }
            };
        var compileCriteria = function() {
                var createBinaryOperationFormatter = function(op) {
                        return function(prop, val, bag) {
                                bag.push(prop, " ", op, " ", val)
                            }
                    };
                var createStringFuncFormatter = function(op, reverse) {
                        return function(prop, val, bag) {
                                if (reverse)
                                    bag.push(op, "(", val, ",", prop, ")");
                                else
                                    bag.push(op, "(", prop, ",", val, ")")
                            }
                    };
                var formatters = {
                        "=": createBinaryOperationFormatter("eq"),
                        "<>": createBinaryOperationFormatter("ne"),
                        ">": createBinaryOperationFormatter("gt"),
                        ">=": createBinaryOperationFormatter("ge"),
                        "<": createBinaryOperationFormatter("lt"),
                        "<=": createBinaryOperationFormatter("le"),
                        startswith: createStringFuncFormatter("startswith"),
                        endswith: createStringFuncFormatter("endswith")
                    };
                var formattersV2 = $.extend({}, formatters, {
                        contains: createStringFuncFormatter("substringof", true),
                        notcontains: createStringFuncFormatter("not substringof", true)
                    });
                var formattersV4 = $.extend({}, formatters, {
                        contains: createStringFuncFormatter("contains"),
                        notcontains: createStringFuncFormatter("not contains")
                    });
                var compileBinary = function(criteria, bag, protocolVersion) {
                        criteria = data.utils.normalizeBinaryCriterion(criteria);
                        var op = criteria[1],
                            formatters = protocolVersion === 4 ? formattersV4 : formattersV2,
                            formatter = formatters[op.toLowerCase()];
                        if (!formatter)
                            throw Error("Unknown filter operation: " + op);
                        formatter(serializePropName(criteria[0]), serializeValue(criteria[2], protocolVersion), bag)
                    };
                var compileGroup = function(criteria, bag, protocolVersion) {
                        var pushAnd = false;
                        $.each(criteria, function() {
                            if ($.isArray(this)) {
                                if (pushAnd)
                                    bag.push(" and ");
                                bag.push("(");
                                compileCore(this, bag, protocolVersion);
                                bag.push(")");
                                pushAnd = true
                            }
                            else {
                                bag.push(/and|&/i.test(this) ? " and " : " or ");
                                pushAnd = false
                            }
                        })
                    };
                var compileCore = function(criteria, bag, protocolVersion) {
                        if ($.isArray(criteria[0]))
                            compileGroup(criteria, bag, protocolVersion);
                        else
                            compileBinary(criteria, bag, protocolVersion)
                    };
                return function(criteria, protocolVersion) {
                        var bag = [];
                        compileCore(criteria, bag, protocolVersion);
                        return bag.join("")
                    }
            }();
        var createODataQueryAdapter = function(queryOptions) {
                var sorting = [],
                    criteria = [],
                    select,
                    skip,
                    take,
                    countQuery;
                var hasSlice = function() {
                        return skip || take !== undefined
                    };
                var sortCore = function(getter, desc, reset) {
                        if (hasSlice() || typeof getter !== "string")
                            return false;
                        if (reset)
                            sorting = [];
                        var rule = serializePropName(getter);
                        if (desc)
                            rule += " desc";
                        sorting.push(rule)
                    };
                var generateExpand = function() {
                        var hash = {};
                        if (queryOptions.expand)
                            $.each($.makeArray(queryOptions.expand), function() {
                                hash[serializePropName(this)] = 1
                            });
                        if (select)
                            $.each(select, function() {
                                var path = this.split(".");
                                if (path.length < 2)
                                    return;
                                path.pop();
                                hash[serializePropName(path.join("."))] = 1
                            });
                        return $.map(hash, function(k, v) {
                                return v
                            }).join() || undefined
                    };
                var requestData = function() {
                        var result = {};
                        if (!countQuery) {
                            if (sorting.length)
                                result["$orderby"] = sorting.join(",");
                            if (skip)
                                result["$skip"] = skip;
                            if (take !== undefined)
                                result["$top"] = take;
                            if (select)
                                result["$select"] = serializePropName(select.join());
                            result["$expand"] = generateExpand()
                        }
                        if (criteria.length)
                            result["$filter"] = compileCriteria(criteria.length < 2 ? criteria[0] : criteria, queryOptions.version);
                        if (countQuery)
                            result["$top"] = 0;
                        if (queryOptions.requireTotalCount || countQuery)
                            if (queryOptions.version !== 4)
                                result["$inlinecount"] = "allpages";
                            else
                                result["$count"] = "true";
                        return result
                    };
                return {
                        exec: function(url) {
                            return sendRequest({
                                    url: url,
                                    params: $.extend(requestData(), queryOptions && queryOptions.params)
                                }, {
                                    beforeSend: queryOptions.beforeSend,
                                    jsonp: queryOptions.jsonp,
                                    withCredentials: queryOptions.withCredentials,
                                    countOnly: countQuery
                                })
                        },
                        sortBy: function(getter, desc) {
                            return sortCore(getter, desc, true)
                        },
                        thenBy: function(getter, desc) {
                            return sortCore(getter, desc, false)
                        },
                        slice: function(skipCount, takeCount) {
                            if (hasSlice())
                                return false;
                            skip = skipCount;
                            take = takeCount
                        },
                        filter: function(criterion) {
                            if (hasSlice() || $.isFunction(criterion))
                                return false;
                            if (!$.isArray(criterion))
                                criterion = $.makeArray(arguments);
                            if (criteria.length)
                                criteria.push("and");
                            criteria.push(criterion)
                        },
                        select: function(expr) {
                            if (select || $.isFunction(expr))
                                return false;
                            if (!$.isArray(expr))
                                expr = $.makeArray(arguments);
                            select = expr
                        },
                        count: function() {
                            countQuery = true
                        }
                    }
            };
        $.extend(true, data, {
            EdmLiteral: EdmLiteral,
            utils: {odata: {
                    sendRequest: sendRequest,
                    serializePropName: serializePropName,
                    serializeValue: serializeValue,
                    serializeKey: serializeKey,
                    keyConverters: keyConverters
                }},
            queryAdapters: {odata: createODataQueryAdapter}
        });
        data.OData__internals = {interpretJsonFormat: interpretJsonFormat}
    })(jQuery, DevExpress);
    /*! Module core, file data.store.abstract.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            abstract = DX.abstract,
            data = DX.data,
            normalizeSortingInfo = data.utils.normalizeSortingInfo;
        var STORE_CALLBACK_NAMES = ["loading", "loaded", "modifying", "modified", "inserting", "inserted", "updating", "updated", "removing", "removed"];
        function multiLevelGroup(query, groupInfo) {
            query = query.groupBy(groupInfo[0].selector);
            if (groupInfo.length > 1)
                query = query.select(function(g) {
                    return $.extend({}, g, {items: multiLevelGroup(data.query(g.items), groupInfo.slice(1)).toArray()})
                });
            return query
        }
        data.utils.multiLevelGroup = multiLevelGroup;
        function arrangeSortingInfo(groupInfo, sortInfo) {
            var filteredGroup = [];
            $.each(groupInfo, function(_, group) {
                var collision = $.grep(sortInfo, function(sort) {
                        return group.selector == sort.selector
                    });
                if (collision.length < 1)
                    filteredGroup.push(group)
            });
            return filteredGroup.concat(sortInfo)
        }
        data.Store = Class.inherit({
            ctor: function(options) {
                var that = this;
                options = options || {};
                $.each(STORE_CALLBACK_NAMES, function() {
                    var callbacks = that[this] = $.Callbacks();
                    if (this in options)
                        callbacks.add(options[this])
                });
                this._key = options.key;
                this._errorHandler = options.errorHandler;
                this._useDefaultSearch = true
            },
            _customLoadOptions: function() {
                return null
            },
            key: function() {
                return this._key
            },
            keyOf: function(obj) {
                if (!this._keyGetter)
                    this._keyGetter = data.utils.compileGetter(this.key());
                return this._keyGetter(obj)
            },
            _requireKey: function() {
                if (!this.key())
                    throw Error("Key expression is required for this operation");
            },
            load: function(options) {
                var that = this;
                options = options || {};
                this.loading.fire(options);
                return this._loadImpl(options).done(function(result, extra) {
                        that.loaded.fire(result, extra)
                    })
            },
            _loadImpl: function(options) {
                var filter = options.filter,
                    sort = options.sort,
                    select = options.select,
                    group = options.group,
                    skip = options.skip,
                    take = options.take,
                    q = this.createQuery(options);
                if (filter)
                    q = q.filter(filter);
                if (group)
                    group = normalizeSortingInfo(group);
                if (sort || group) {
                    sort = normalizeSortingInfo(sort || []);
                    if (group)
                        sort = arrangeSortingInfo(group, sort);
                    $.each(sort, function(index) {
                        q = q[index ? "thenBy" : "sortBy"](this.selector, this.desc)
                    })
                }
                if (select)
                    q = q.select(select);
                if (group)
                    q = multiLevelGroup(q, group);
                if (take || skip)
                    q = q.slice(skip || 0, take);
                return q.enumerate()
            },
            createQuery: abstract,
            totalCount: function(options) {
                return this._addFailHandlers(this._totalCountImpl(options))
            },
            _totalCountImpl: function(options) {
                options = options || {};
                var q = this.createQuery(),
                    group = options.group,
                    filter = options.filter;
                if (filter)
                    q = q.filter(filter);
                if (group) {
                    group = normalizeSortingInfo(group);
                    q = multiLevelGroup(q, group)
                }
                return q.count()
            },
            byKey: function(key, extraOptions) {
                return this._addFailHandlers(this._byKeyImpl(key, extraOptions))
            },
            _byKeyImpl: abstract,
            insert: function(values) {
                var that = this;
                that.modifying.fire();
                that.inserting.fire(values);
                return that._addFailHandlers(that._insertImpl(values).done(function(callbackValues, callbackKey) {
                        that.inserted.fire(callbackValues, callbackKey);
                        that.modified.fire()
                    }))
            },
            _insertImpl: abstract,
            update: function(key, values) {
                var that = this;
                that.modifying.fire();
                that.updating.fire(key, values);
                return that._addFailHandlers(that._updateImpl(key, values).done(function(callbackKey, callbackValues) {
                        that.updated.fire(callbackKey, callbackValues);
                        that.modified.fire()
                    }))
            },
            _updateImpl: abstract,
            remove: function(key) {
                var that = this;
                that.modifying.fire();
                that.removing.fire(key);
                return that._addFailHandlers(that._removeImpl(key).done(function(callbackKey) {
                        that.removed.fire(callbackKey);
                        that.modified.fire()
                    }))
            },
            _removeImpl: abstract,
            _addFailHandlers: function(deferred) {
                return deferred.fail(this._errorHandler, data._handleError)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.array.js */
    (function($, DX, undefined) {
        var data = DX.data,
            Guid = data.Guid;
        var trivialPromise = function(_) {
                var d = $.Deferred();
                return d.resolve.apply(d, arguments).promise()
            };
        var rejectedPromise = function(_) {
                var d = $.Deferred();
                return d.reject.apply(d, arguments).promise()
            };
        data.ArrayStore = data.Store.inherit({
            ctor: function(options) {
                if ($.isArray(options))
                    options = {data: options};
                else
                    options = options || {};
                this.callBase(options);
                var initialArray = options.data;
                if (initialArray && !$.isArray(initialArray))
                    throw Error("Invalid 'data' option value");
                this._array = initialArray || []
            },
            createQuery: function() {
                return data.query(this._array, {errorHandler: this._errorHandler})
            },
            _byKeyImpl: function(key) {
                return trivialPromise(this._array[this._indexByKey(key)])
            },
            _insertImpl: function(values) {
                var keyExpr = this.key(),
                    keyValue,
                    obj = {};
                $.extend(obj, values);
                if (keyExpr) {
                    keyValue = this.keyOf(obj);
                    if (keyValue === undefined || typeof keyValue === "object" && $.isEmptyObject(keyValue)) {
                        if ($.isArray(keyExpr))
                            throw Error("Compound keys cannot be auto-generated");
                        keyValue = obj[keyExpr] = String(new Guid)
                    }
                    else if (this._array[this._indexByKey(keyValue)] !== undefined)
                        return rejectedPromise(Error("Attempt to insert an item with the duplicate key"))
                }
                else
                    keyValue = obj;
                this._array.push(obj);
                return trivialPromise(values, keyValue)
            },
            _updateImpl: function(key, values) {
                var target;
                if (this.key()) {
                    var index = this._indexByKey(key);
                    if (index < 0)
                        return rejectedPromise(Error("Data item not found"));
                    target = this._array[index]
                }
                else
                    target = key;
                DX.utils.deepExtendArraySafe(target, values);
                return trivialPromise(key, values)
            },
            _removeImpl: function(key) {
                var index = this._indexByKey(key);
                if (index > -1)
                    this._array.splice(index, 1);
                return trivialPromise(key)
            },
            _indexByKey: function(key) {
                for (var i = 0, arrayLength = this._array.length; i < arrayLength; i++)
                    if (data.utils.keysEqual(this.key(), this.keyOf(this._array[i]), key))
                        return i;
                return -1
            },
            clear: function() {
                this._array = []
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.local.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            abstract = DX.abstract,
            data = DX.data;
        var LocalStoreBackend = Class.inherit({
                ctor: function(store, storeOptions) {
                    this._store = store;
                    this._dirty = false;
                    var immediate = this._immediate = storeOptions.immediate;
                    var flushInterval = Math.max(100, storeOptions.flushInterval || 10 * 1000);
                    if (!immediate) {
                        var saveProxy = $.proxy(this.save, this);
                        setInterval(saveProxy, flushInterval);
                        $(window).on("beforeunload", saveProxy);
                        if (window.cordova)
                            document.addEventListener("pause", saveProxy, false)
                    }
                },
                notifyChanged: function() {
                    this._dirty = true;
                    if (this._immediate)
                        this.save()
                },
                load: function() {
                    this._store._array = this._loadImpl();
                    this._dirty = false
                },
                save: function() {
                    if (!this._dirty)
                        return;
                    this._saveImpl(this._store._array);
                    this._dirty = false
                },
                _loadImpl: abstract,
                _saveImpl: abstract
            });
        var DomLocalStoreBackend = LocalStoreBackend.inherit({
                ctor: function(store, storeOptions) {
                    this.callBase(store, storeOptions);
                    var name = storeOptions.name;
                    if (!name)
                        throw Error("Name is required");
                    this._key = "dx-data-localStore-" + name
                },
                _loadImpl: function() {
                    var raw = localStorage.getItem(this._key);
                    if (raw)
                        return JSON.parse(raw);
                    return []
                },
                _saveImpl: function(array) {
                    if (!array.length)
                        localStorage.removeItem(this._key);
                    else
                        localStorage.setItem(this._key, JSON.stringify(array))
                }
            });
        var localStoreBackends = {dom: DomLocalStoreBackend};
        data.LocalStore = data.ArrayStore.inherit({
            ctor: function(options) {
                if (typeof options === "string")
                    options = {name: options};
                else
                    options = options || {};
                this.callBase(options);
                this._backend = new localStoreBackends[options.backend || "dom"](this, options);
                this._backend.load()
            },
            clear: function() {
                this.callBase();
                this._backend.notifyChanged()
            },
            _insertImpl: function(values) {
                var b = this._backend;
                return this.callBase(values).done($.proxy(b.notifyChanged, b))
            },
            _updateImpl: function(key, values) {
                var b = this._backend;
                return this.callBase(key, values).done($.proxy(b.notifyChanged, b))
            },
            _removeImpl: function(key) {
                var b = this._backend;
                return this.callBase(key).done($.proxy(b.notifyChanged, b))
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.odata.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            data = DX.data,
            odataUtils = data.utils.odata;
        var escapeServiceOperationParams = function(params, version) {
                if (!params)
                    return params;
                var result = {};
                $.each(params, function(k, v) {
                    result[k] = odataUtils.serializeValue(v, version)
                });
                return result
            };
        var convertSimpleKey = function(keyType, keyValue) {
                var converter = odataUtils.keyConverters[keyType];
                if (!converter)
                    throw Error("Unknown key type: " + keyType);
                return converter(keyValue)
            };
        var SharedMethods = {
                _extractServiceOptions: function(options) {
                    options = options || {};
                    this._url = String(options.url).replace(/\/+$/, "");
                    this._beforeSend = options.beforeSend;
                    this._jsonp = options.jsonp;
                    this._version = options.version;
                    this._withCredentials = options.withCredentials
                },
                _sendRequest: function(url, method, params, payload) {
                    return odataUtils.sendRequest({
                            url: url,
                            method: method,
                            params: params || {},
                            payload: payload
                        }, {
                            beforeSend: this._beforeSend,
                            jsonp: this._jsonp,
                            withCredentials: this._withCredentials
                        })
                },
                version: function() {
                    return this._version
                }
            };
        var ODataStore = data.Store.inherit({
                ctor: function(options) {
                    this.callBase(options);
                    this._extractServiceOptions(options);
                    this._keyType = options.keyType
                },
                _customLoadOptions: function() {
                    return ["expand", "customQueryParams"]
                },
                _byKeyImpl: function(key, extraOptions) {
                    var params = {};
                    if (extraOptions)
                        if (extraOptions.expand)
                            params["$expand"] = $.map($.makeArray(extraOptions.expand), odataUtils.serializePropName).join();
                    return this._sendRequest(this._byKeyUrl(key), "GET", params)
                },
                createQuery: function(loadOptions) {
                    loadOptions = loadOptions || {};
                    return data.query(this._url, {
                            beforeSend: this._beforeSend,
                            errorHandler: this._errorHandler,
                            jsonp: this._jsonp,
                            version: this._version,
                            withCredentials: this._withCredentials,
                            params: escapeServiceOperationParams(loadOptions.customQueryParams, this._version),
                            expand: loadOptions.expand,
                            requireTotalCount: loadOptions.requireTotalCount
                        })
                },
                _insertImpl: function(values) {
                    this._requireKey();
                    var that = this,
                        d = $.Deferred();
                    $.when(this._sendRequest(this._url, "POST", null, values)).done(function(serverResponse) {
                        d.resolve(values, that.keyOf(serverResponse))
                    }).fail($.proxy(d.reject, d));
                    return d.promise()
                },
                _updateImpl: function(key, values) {
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._byKeyUrl(key), "MERGE", null, values)).done(function() {
                        d.resolve(key, values)
                    }).fail($.proxy(d.reject, d));
                    return d.promise()
                },
                _removeImpl: function(key) {
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._byKeyUrl(key), "DELETE")).done(function() {
                        d.resolve(key)
                    }).fail($.proxy(d.reject, d));
                    return d.promise()
                },
                _byKeyUrl: function(key) {
                    var keyType = this._keyType;
                    if ($.isPlainObject(keyType))
                        $.each(keyType, function(subKeyName, subKeyType) {
                            key[subKeyName] = convertSimpleKey(subKeyType, key[subKeyName])
                        });
                    else if (keyType)
                        key = convertSimpleKey(keyType, key);
                    return this._url + "(" + encodeURIComponent(odataUtils.serializeKey(key, this._version)) + ")"
                }
            }).include(SharedMethods);
        var ODataContext = Class.inherit({
                ctor: function(options) {
                    var that = this;
                    that._extractServiceOptions(options);
                    that._errorHandler = options.errorHandler;
                    $.each(options.entities || [], function(entityAlias, entityOptions) {
                        that[entityAlias] = new ODataStore($.extend({}, options, {url: that._url + "/" + encodeURIComponent(entityOptions.name || entityAlias)}, entityOptions))
                    })
                },
                get: function(operationName, params) {
                    return this.invoke(operationName, params, "GET")
                },
                invoke: function(operationName, params, httpMethod) {
                    httpMethod = httpMethod || "POST";
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._url + "/" + encodeURIComponent(operationName), httpMethod, escapeServiceOperationParams(params, this._version))).done(function(r) {
                        if (r && operationName in r)
                            r = r[operationName];
                        d.resolve(r)
                    }).fail([this._errorHandler, data._handleError, $.proxy(d.reject, d)]);
                    return d.promise()
                },
                objectLink: function(entityAlias, key) {
                    var store = this[entityAlias];
                    if (!store)
                        throw Error("Unknown entity name or alias: " + entityAlias);
                    return {__metadata: {uri: store._byKeyUrl(key)}}
                }
            }).include(SharedMethods);
        $.extend(data, {
            ODataStore: ODataStore,
            ODataContext: ODataContext
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.rest.js */
    (function($, DX, undefined) {
        var data = DX.data;
        function createAjaxFailureHandler(deferred) {
            return function(xhr, textStatus) {
                    if (!xhr || !xhr.getResponseHeader)
                        deferred.reject.apply(deferred, arguments);
                    else
                        deferred.reject(Error(data.utils.errorMessageFromXhr(xhr, textStatus)))
                }
        }
        function operationCustomizerPropName(operationName) {
            return "_customize" + DX.inflector.camelize(operationName, true)
        }
        function pathPropName(operationName) {
            return "_" + operationName + "Path"
        }
        data.RestStore = data.Store.inherit({
            ctor: function(options) {
                DX.utils.logger.warn("RestStore is deprecated, use CustomStore instead");
                var that = this;
                that.callBase(options);
                options = options || {};
                that._url = String(options.url).replace(/\/+$/, "");
                that._jsonp = options.jsonp;
                that._withCredentials = options.withCredentials;
                $.each(["Load", "Insert", "Update", "Remove", "ByKey", "Operation"], function() {
                    var value = options["customize" + this];
                    if (value)
                        that[operationCustomizerPropName(this)] = value
                });
                $.each(["load", "insert", "update", "remove", "byKey"], function() {
                    var value = options[this + "Path"];
                    if (value)
                        that[pathPropName(this)] = value
                })
            },
            _loadImpl: function(options) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlNoKey("load"),
                        type: "GET"
                    };
                $.when(this._createAjax(ajaxOptions, "load", options)).done($.proxy(d.resolve, d)).fail(createAjaxFailureHandler(d));
                return this._addFailHandlers(d.promise())
            },
            createQuery: function() {
                throw Error("Not supported");
            },
            _insertImpl: function(values) {
                var d = $.Deferred(),
                    that = this,
                    ajaxOptions = {
                        url: this._formatUrlNoKey("insert"),
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(values)
                    };
                $.when(this._createAjax(ajaxOptions, "insert")).done(function(serverResponse) {
                    d.resolve(values, that.key() && that.keyOf(serverResponse))
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _updateImpl: function(key, values) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlWithKey("update", key),
                        type: "PUT",
                        contentType: "application/json",
                        data: JSON.stringify(values)
                    };
                $.when(this._createAjax(ajaxOptions, "update")).done(function() {
                    d.resolve(key, values)
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _removeImpl: function(key) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlWithKey("remove", key),
                        type: "DELETE"
                    };
                $.when(this._createAjax(ajaxOptions, "remove")).done(function() {
                    d.resolve(key)
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _byKeyImpl: function(key) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlWithKey("byKey", key),
                        type: "GET"
                    };
                $.when(this._createAjax(ajaxOptions, "byKey")).done(function(data) {
                    d.resolve(data)
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _createAjax: function(ajaxOptions, operationName, extra) {
                var customizationFunc,
                    customizationResult;
                function isDeferred(obj) {
                    return "done" in obj && "fail" in obj
                }
                if (this._jsonp && ajaxOptions.type === "GET")
                    ajaxOptions.dataType = "jsonp";
                else
                    $.extend(true, ajaxOptions, {xhrFields: {withCredentials: this._withCredentials}});
                customizationFunc = this[operationCustomizerPropName("operation")];
                if (customizationFunc) {
                    customizationResult = customizationFunc(ajaxOptions, operationName, extra);
                    if (customizationResult) {
                        if (isDeferred(customizationResult))
                            return customizationResult;
                        ajaxOptions = customizationResult
                    }
                }
                customizationFunc = this[operationCustomizerPropName(operationName)];
                if (customizationFunc) {
                    customizationResult = customizationFunc(ajaxOptions, extra);
                    if (customizationResult) {
                        if (isDeferred(customizationResult))
                            return customizationResult;
                        ajaxOptions = customizationResult
                    }
                }
                return $.ajax(ajaxOptions)
            },
            _formatUrlNoKey: function(operationName) {
                var url = this._url,
                    path = this[pathPropName(operationName)];
                if (!path)
                    return url;
                if ($.isFunction(path))
                    return path(url);
                return url + "/" + path
            },
            _formatUrlWithKey: function(operationName, key) {
                var url = this._url,
                    path = this[pathPropName(operationName)];
                if (!path)
                    return url + "/" + encodeURIComponent(key);
                if ($.isFunction(path))
                    return path(url, key);
                return url + "/" + path + "/" + encodeURIComponent(key)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.custom.js */
    (function($, DX, undefined) {
        var data = DX.data;
        var ERROR_QUERY_NOT_SUPPORTED = "CustomStore does not support creating queries",
            ERROR_MISSING_USER_FUNC = "Required option is not specified or is not a function: ",
            ERROR_INVALID_RETURN = "Invalid return value: ";
        var TOTAL_COUNT = "totalCount",
            LOAD = "load",
            BY_KEY = "byKey",
            INSERT = "insert",
            UPDATE = "update",
            REMOVE = "remove";
        function isPromise(obj) {
            return obj && $.isFunction(obj.done) && $.isFunction(obj.fail) && $.isFunction(obj.promise)
        }
        function trivialPromise(value) {
            return $.Deferred().resolve(value).promise()
        }
        function ensureRequiredFuncOption(name, obj) {
            if (!$.isFunction(obj))
                throw Error(ERROR_MISSING_USER_FUNC + name);
        }
        function throwInvalidUserFuncResult(name) {
            throw Error(ERROR_INVALID_RETURN + name);
        }
        function createUserFuncFailureHandler(pendingDeferred) {
            function errorMessageFromXhr(promiseArguments) {
                var xhr = promiseArguments[0],
                    textStatus = promiseArguments[1];
                if (!xhr || !xhr.getResponseHeader)
                    return null;
                return data.utils.errorMessageFromXhr(xhr, textStatus)
            }
            return function(arg) {
                    var error;
                    if (arg instanceof Error)
                        error = arg;
                    else
                        error = Error(errorMessageFromXhr(arguments) || arg && String(arg) || "Unknown error");
                    pendingDeferred.reject(error)
                }
        }
        data.CustomStore = data.Store.inherit({
            ctor: function(options) {
                options = options || {};
                this.callBase(options);
                this._useDefaultSearch = false;
                this._loadFunc = options[LOAD];
                this._totalCountFunc = options[TOTAL_COUNT];
                this._byKeyFunc = options[BY_KEY] || options.lookup;
                this._insertFunc = options[INSERT];
                this._updateFunc = options[UPDATE];
                this._removeFunc = options[REMOVE]
            },
            createQuery: function() {
                throw Error(ERROR_QUERY_NOT_SUPPORTED);
            },
            _totalCountImpl: function(options) {
                var userFunc = this._totalCountFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(TOTAL_COUNT, userFunc);
                userResult = userFunc(options);
                if (!isPromise(userResult)) {
                    userResult = Number(userResult);
                    if (!isFinite(userResult))
                        throwInvalidUserFuncResult(TOTAL_COUNT);
                    userResult = trivialPromise(userResult)
                }
                userResult.done(function(count) {
                    d.resolve(Number(count))
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _loadImpl: function(options) {
                var userFunc = this._loadFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(LOAD, userFunc);
                userResult = userFunc(options);
                if ($.isArray(userResult))
                    userResult = trivialPromise(userResult);
                else if (userResult === null || userResult === undefined)
                    userResult = trivialPromise([]);
                else if (!isPromise(userResult))
                    throwInvalidUserFuncResult(LOAD);
                userResult.done(function(data, extra) {
                    d.resolve(data, extra)
                }).fail(createUserFuncFailureHandler(d));
                return this._addFailHandlers(d.promise())
            },
            _byKeyImpl: function(key) {
                var userFunc = this._byKeyFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(BY_KEY, userFunc);
                userResult = userFunc(key);
                if (!isPromise(userResult))
                    userResult = trivialPromise(userResult);
                userResult.done(function(obj) {
                    d.resolve(obj)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _insertImpl: function(values) {
                var userFunc = this._insertFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(INSERT, userFunc);
                userResult = userFunc(values);
                if (!isPromise(userResult))
                    userResult = trivialPromise(userResult);
                userResult.done(function(newKey) {
                    d.resolve(values, newKey)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _updateImpl: function(key, values) {
                var userFunc = this._updateFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(UPDATE, userFunc);
                userResult = userFunc(key, values);
                if (!isPromise(userResult))
                    userResult = trivialPromise();
                userResult.done(function() {
                    d.resolve(key, values)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _removeImpl: function(key) {
                var userFunc = this._removeFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(REMOVE, userFunc);
                userResult = userFunc(key);
                if (!isPromise(userResult))
                    userResult = trivialPromise();
                userResult.done(function() {
                    d.resolve(key)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            }
        });
        data.CustomStore_internals = {ERRORS: {
                QUERY_NOT_SUPPORTED: ERROR_QUERY_NOT_SUPPORTED,
                MISSING_USER_FUNC: ERROR_MISSING_USER_FUNC,
                INVALID_RETURN: ERROR_INVALID_RETURN
            }}
    })(jQuery, DevExpress);
    /*! Module core, file data.dataSource.js */
    (function($, DX, undefined) {
        var data = DX.data,
            CustomStore = data.CustomStore,
            Class = DX.Class;
        var storeTypeRegistry = {
                jaydata: "JayDataStore",
                breeze: "BreezeStore",
                odata: "ODataStore",
                local: "LocalStore",
                array: "ArrayStore"
            };
        function normalizeDataSourceOptions(options) {
            var store;
            function createCustomStoreFromLoadFunc() {
                var storeConfig = {};
                $.each(["key", "load", "byKey", "lookup", "totalCount", "insert", "update", "remove"], function() {
                    storeConfig[this] = options[this];
                    delete options[this]
                });
                return new CustomStore(storeConfig)
            }
            function createStoreFromConfig(storeConfig) {
                var storeCtor = data[storeTypeRegistry[storeConfig.type]];
                delete storeConfig.type;
                return new storeCtor(storeConfig)
            }
            function createCustomStoreFromUrl(url) {
                return new CustomStore({load: function() {
                            return $.getJSON(url)
                        }})
            }
            if (typeof options === "string")
                options = createCustomStoreFromUrl(options);
            if (options === undefined)
                options = [];
            if ($.isArray(options) || options instanceof data.Store)
                options = {store: options};
            else
                options = $.extend({}, options);
            if (options.store === undefined)
                options.store = [];
            store = options.store;
            if ("load" in options)
                store = createCustomStoreFromLoadFunc();
            else if ($.isArray(store))
                store = new data.ArrayStore(store);
            else if ($.isPlainObject(store))
                store = createStoreFromConfig($.extend({}, store));
            options.store = store;
            return options
        }
        function normalizeStoreLoadOptionAccessorArguments(originalArguments) {
            switch (originalArguments.length) {
                case 0:
                    return undefined;
                case 1:
                    return originalArguments[0]
            }
            return $.makeArray(originalArguments)
        }
        function generateStoreLoadOptionAccessor(optionName) {
            return function() {
                    var args = normalizeStoreLoadOptionAccessorArguments(arguments);
                    if (args !== undefined)
                        this._storeLoadOptions[optionName] = args;
                    return this._storeLoadOptions[optionName]
                }
        }
        function addOldUserDataSourceBackwardCompatibilityOptions(dataSource, storeLoadOptions) {
            storeLoadOptions.refresh = !dataSource._paginate || dataSource._pageIndex === 0;
            if (storeLoadOptions.searchValue !== null)
                storeLoadOptions.searchString = storeLoadOptions.searchValue
        }
        var DataSource = Class.inherit({
                ctor: function(options) {
                    options = normalizeDataSourceOptions(options);
                    this._store = options.store;
                    this._storeLoadOptions = this._extractLoadOptions(options);
                    this._mapFunc = options.map;
                    this._postProcessFunc = options.postProcess;
                    this._pageIndex = 0;
                    this._pageSize = options.pageSize !== undefined ? options.pageSize : 20;
                    this._items = [];
                    this._totalCount = -1;
                    this._isLoaded = false;
                    this._loadingCount = 0;
                    this._preferSync = options._preferSync;
                    this._loadQueue = this._createLoadQueue();
                    this._searchValue = "searchValue" in options ? options.searchValue : null;
                    this._searchOperation = options.searchOperation || "contains";
                    this._searchExpr = options.searchExpr;
                    this._paginate = options.paginate;
                    if (this._paginate === undefined)
                        this._paginate = !this.group();
                    this._isLastPage = !this._paginate;
                    this._userData = {};
                    this.changed = $.Callbacks();
                    this.loadError = $.Callbacks();
                    this.loadingChanged = $.Callbacks()
                },
                dispose: function() {
                    this.changed.empty();
                    this.loadError.empty();
                    this.loadingChanged.empty();
                    delete this._store;
                    this._disposed = true
                },
                _extractLoadOptions: function(options) {
                    var result = {},
                        names = ["sort", "filter", "select", "group", "requireTotalCount"],
                        customNames = this._store._customLoadOptions();
                    if (customNames)
                        names = names.concat(customNames);
                    $.each(names, function() {
                        result[this] = options[this]
                    });
                    return result
                },
                loadOptions: function() {
                    return this._storeLoadOptions
                },
                items: function() {
                    return this._items
                },
                pageIndex: function(newIndex) {
                    if (newIndex !== undefined) {
                        this._pageIndex = newIndex;
                        this._isLastPage = !this._paginate
                    }
                    return this._pageIndex
                },
                paginate: function(value) {
                    if (arguments.length < 1)
                        return this._paginate;
                    value = !!value;
                    if (this._paginate !== value) {
                        this._paginate = value;
                        this.pageIndex(0)
                    }
                },
                isLastPage: function() {
                    return this._isLastPage
                },
                sort: generateStoreLoadOptionAccessor("sort"),
                filter: function() {
                    var newFilter = normalizeStoreLoadOptionAccessorArguments(arguments);
                    if (newFilter !== undefined) {
                        this._storeLoadOptions.filter = newFilter;
                        this.pageIndex(0)
                    }
                    return this._storeLoadOptions.filter
                },
                group: generateStoreLoadOptionAccessor("group"),
                select: generateStoreLoadOptionAccessor("select"),
                searchValue: function(value) {
                    if (value !== undefined) {
                        this.pageIndex(0);
                        this._searchValue = value
                    }
                    return this._searchValue
                },
                searchOperation: function(op) {
                    if (op !== undefined) {
                        this.pageIndex(0);
                        this._searchOperation = op
                    }
                    return this._searchOperation
                },
                searchExpr: function(expr) {
                    var argc = arguments.length;
                    if (argc) {
                        if (argc > 1)
                            expr = $.makeArray(arguments);
                        this.pageIndex(0);
                        this._searchExpr = expr
                    }
                    return this._searchExpr
                },
                store: function() {
                    return this._store
                },
                key: function() {
                    return this._store && this._store.key()
                },
                totalCount: function() {
                    return this._totalCount
                },
                isLoaded: function() {
                    return this._isLoaded
                },
                isLoading: function() {
                    return this._loadingCount > 0
                },
                _createLoadQueue: function() {
                    return DX.createQueue()
                },
                _changeLoadingCount: function(increment) {
                    var oldLoading = this.isLoading(),
                        newLoading;
                    this._loadingCount += increment;
                    newLoading = this.isLoading();
                    if (oldLoading ^ newLoading)
                        this.loadingChanged.fire(newLoading)
                },
                _scheduleLoadCallbacks: function(deferred) {
                    var thisSource = this;
                    thisSource._changeLoadingCount(1);
                    deferred.always(function() {
                        thisSource._changeLoadingCount(-1)
                    })
                },
                _scheduleChangedCallbacks: function(deferred) {
                    var that = this;
                    deferred.done(function() {
                        that.changed.fire()
                    })
                },
                loadSingle: function(propName, propValue) {
                    var that = this;
                    var d = $.Deferred().fail(this.loadError.fire),
                        key = this.key(),
                        store = this._store,
                        loadOptions = this._createStoreLoadOptions();
                    function handleSuccess(data) {
                        d.resolve(that._transformLoadedData(data)[0])
                    }
                    if (arguments.length < 2) {
                        propValue = propName;
                        propName = key
                    }
                    delete loadOptions.skip;
                    delete loadOptions.group;
                    delete loadOptions.refresh;
                    delete loadOptions.pageIndex;
                    delete loadOptions.searchString;
                    if (propName === key || store instanceof data.CustomStore)
                        store.byKey(propValue, loadOptions).done(handleSuccess).fail(d.reject);
                    else {
                        loadOptions.take = 1;
                        loadOptions._preferSync = true;
                        loadOptions.filter = loadOptions.filter ? [loadOptions.filter, [propName, propValue]] : [propName, propValue];
                        store.load(loadOptions).done(handleSuccess).fail(d.reject)
                    }
                    return d.promise()
                },
                load: function() {
                    var thisSource = this,
                        d = $.Deferred(),
                        errorCallback = this.loadError,
                        storeLoadOptions;
                    this._scheduleLoadCallbacks(d);
                    this._scheduleChangedCallbacks(d);
                    storeLoadOptions = this._createStoreLoadOptions();
                    function loadTask() {
                        if (thisSource._disposed)
                            return undefined;
                        return thisSource._loadFromStore(storeLoadOptions, d)
                    }
                    this._loadQueue.add(function() {
                        loadTask();
                        return d.promise()
                    }, function() {
                        thisSource._changeLoadingCount(-1)
                    });
                    return d.promise().fail($.proxy(errorCallback.fire, errorCallback))
                },
                _addSearchOptions: function(storeLoadOptions) {
                    if (this._disposed)
                        return;
                    if (this.store()._useDefaultSearch)
                        this._addSearchFilter(storeLoadOptions);
                    else {
                        storeLoadOptions.searchValue = this._searchValue;
                        storeLoadOptions.searchExpr = this._searchExpr
                    }
                },
                _createStoreLoadOptions: function() {
                    var result = $.extend({}, this._storeLoadOptions);
                    this._addSearchOptions(result);
                    if (this._paginate) {
                        result.pageIndex = this._pageIndex;
                        if (this._pageSize) {
                            result.skip = this._pageIndex * this._pageSize;
                            result.take = this._pageSize
                        }
                    }
                    result.userData = this._userData;
                    addOldUserDataSourceBackwardCompatibilityOptions(this, result);
                    return result
                },
                _addSearchFilter: function(storeLoadOptions) {
                    var value = this._searchValue,
                        op = this._searchOperation,
                        selector = this._searchExpr,
                        searchFilter = [];
                    if (!value)
                        return;
                    if (!selector)
                        selector = "this";
                    if (!$.isArray(selector))
                        selector = [selector];
                    $.each(selector, function(i, item) {
                        if (searchFilter.length)
                            searchFilter.push("or");
                        searchFilter.push([item, op, value])
                    });
                    if (storeLoadOptions.filter)
                        storeLoadOptions.filter = [searchFilter, storeLoadOptions.filter];
                    else
                        storeLoadOptions.filter = searchFilter
                },
                _loadFromStore: function(storeLoadOptions, pendingDeferred) {
                    var thisSource = this;
                    function handleSuccess(data, extra) {
                        function processResult() {
                            thisSource._processStoreLoadResult(data, extra, storeLoadOptions, pendingDeferred)
                        }
                        if (thisSource._preferSync)
                            processResult();
                        else
                            DX.utils.executeAsync(processResult)
                    }
                    return this.store().load(storeLoadOptions).done(handleSuccess).fail($.proxy(pendingDeferred.reject, pendingDeferred))
                },
                _processStoreLoadResult: function(data, extra, storeLoadOptions, pendingDeferred) {
                    var thisSource = this;
                    function resolvePendingDeferred() {
                        thisSource._isLoaded = true;
                        thisSource._totalCount = isFinite(extra.totalCount) ? extra.totalCount : -1;
                        return pendingDeferred.resolve(data, extra)
                    }
                    function proceedLoadingTotalCount() {
                        thisSource.store().totalCount(storeLoadOptions).done(function(count) {
                            extra.totalCount = count;
                            resolvePendingDeferred()
                        }).fail(function(){})
                    }
                    if (thisSource._disposed)
                        return;
                    data = thisSource._transformLoadedData(data);
                    if (!$.isPlainObject(extra))
                        extra = {};
                    thisSource._items = data;
                    if (!data.length || !thisSource._paginate || thisSource._pageSize && data.length < thisSource._pageSize)
                        thisSource._isLastPage = true;
                    if (storeLoadOptions.requireTotalCount && !isFinite(extra.totalCount))
                        proceedLoadingTotalCount();
                    else
                        resolvePendingDeferred()
                },
                _transformLoadedData: function(data) {
                    var result = $.makeArray(data);
                    if (this._mapFunc)
                        result = $.map(result, this._mapFunc);
                    if (this._postProcessFunc)
                        result = this._postProcessFunc(result);
                    return result
                }
            });
        data.Store.redefine({toDataSource: function(options) {
                DX.utils.logger.warn("toDataSource() method is deprecated, use 'new DevExpress.data.DataSource(...)' instead");
                return new DataSource($.extend({store: this}, options))
            }});
        $.extend(true, data, {
            DataSource: DataSource,
            createDataSource: function(options) {
                DX.utils.logger.warn("createDataSource() method is deprecated, use 'new DevExpress.data.DataSource(...)' instead");
                return new DataSource(options)
            },
            utils: {
                storeTypeRegistry: storeTypeRegistry,
                normalizeDataSourceOptions: normalizeDataSourceOptions
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ko.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko;
        (function checkKnockoutVersion(version) {
            version = version.split(".");
            if (version[0] < 2 || version[0] == 2 && version[1] < 3)
                throw Error("Your version of KnockoutJS is too old. Please upgrade KnockoutJS to 2.3.0 or later.");
        })(ko.version)
    })(jQuery, DevExpress);
    /*! Module core, file ng.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        DX.ng = {module: window.angular.module("dx", ["ngSanitize"])}
    })(jQuery, DevExpress);
    /*! Module core, file component.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            dataUtils = DX.data.utils;
        var Component = DX.Class.inherit({
                NAME: "Component",
                _deprecatedOptions: {},
                _optionAliases: {},
                _setDefaultOptions: function(){},
                _defaultOptionsRules: function() {
                    return []
                },
                _setOptionsByDevice: function() {
                    var rules = this._defaultOptionsRules(),
                        currentDevice = DX.devices.current(),
                        result = {};
                    if (this._customRules)
                        rules = rules.concat(this._customRules);
                    var deviceMatch = function(device, filter) {
                            filter = $.makeArray(filter);
                            return filter.length === 1 && $.isEmptyObject(filter[0]) || utils.findBestMatches(device, filter).length > 0
                        };
                    $.each(rules, function(index, rule) {
                        var deviceFilter = rule.device || {},
                            match;
                        if ($.isFunction(deviceFilter))
                            match = deviceFilter(currentDevice);
                        else
                            match = deviceMatch(currentDevice, deviceFilter);
                        if (match)
                            $.extend(result, rule.options)
                    });
                    this.option(result)
                },
                _optionsByReference: function() {
                    return {}
                },
                ctor: function(options) {
                    if (!this.NAME)
                        throw Error("NAME is not specified");
                    this._options = {};
                    this._updateLockCount = 0;
                    this.optionChanged = $.Callbacks();
                    this.beginUpdate();
                    try {
                        this._suppressDeprecatedWarnings();
                        this._setDefaultOptions();
                        this._setOptionsByDevice();
                        this._resumeDeprecatedWarnings();
                        this._initialOptions = $.extend({}, this.option());
                        this._initOptions(options || {})
                    }
                    finally {
                        this.endUpdate()
                    }
                },
                _initOptions: function(options) {
                    this.option(options)
                },
                _optionValuesEqual: function(name, oldValue, newValue) {
                    oldValue = dataUtils.toComparable(oldValue, true);
                    newValue = dataUtils.toComparable(newValue, true);
                    if (oldValue && newValue && oldValue.jquery && newValue.jquery)
                        return newValue.is(oldValue);
                    if (oldValue === null || typeof oldValue !== "object")
                        return oldValue === newValue;
                    return false
                },
                _init: $.noop,
                _optionChanged: $.noop,
                instance: function() {
                    return this
                },
                beginUpdate: function() {
                    this._updateLockCount++
                },
                endUpdate: function() {
                    this._updateLockCount--;
                    if (!this._updateLockCount)
                        if (!this._initializing && !this._initialized) {
                            this._initializing = true;
                            try {
                                this._init()
                            }
                            finally {
                                this._initializing = false;
                                this._initialized = true
                            }
                        }
                },
                _logWarningIfDeprecated: function(option) {
                    var info = this._deprecatedOptions[option];
                    if (info && !this._deprecatedOptionsSuppressed)
                        this._logDeprecatedWarning(option, info)
                },
                _logDeprecatedWarningCount: 0,
                _logDeprecatedWarning: function(option, info) {
                    utils.logger.warn("'" + option + "' option is deprecated since " + info.since + ". " + info.message);
                    ++this._logDeprecatedWarningCount
                },
                _suppressDeprecatedWarnings: function() {
                    this._deprecatedOptionsSuppressed = true
                },
                _resumeDeprecatedWarnings: function() {
                    this._deprecatedOptionsSuppressed = false
                },
                _getOptionAliases: function(option) {
                    return $.map(this._optionAliases, function(aliasedOption, alias) {
                            return option === aliasedOption ? alias : undefined
                        })
                },
                _notifyOptionChanged: function(option, value, previousValue) {
                    var that = this,
                        optionWithAliases;
                    if (this._initialized) {
                        optionWithAliases = this._getOptionAliases(option);
                        optionWithAliases.push(option);
                        $.each(optionWithAliases, function(index, name) {
                            var topLevelName = name.split(/[.\[]/)[0];
                            that.optionChanged.fireWith(that, [topLevelName, value, previousValue]);
                            that._optionChanged(topLevelName, value, previousValue)
                        })
                    }
                },
                initialOption: function(optionName) {
                    var options = this._initialOptions;
                    return options[optionName]
                },
                option: function(options) {
                    var that = this,
                        name = options,
                        value = arguments[1];
                    if (arguments.length < 2 && $.type(name) !== "object") {
                        if (name) {
                            this._logWarningIfDeprecated(name);
                            if (this._optionAliases[name])
                                name = this._optionAliases[name]
                        }
                        $.each(this._optionAliases, function(alias, option) {
                            that._options[alias] = dataUtils.compileGetter(option)(that._options, {functionsAsIs: true})
                        });
                        return dataUtils.compileGetter(name)(that._options, {functionsAsIs: true})
                    }
                    if (typeof name === "string") {
                        options = {};
                        options[name] = value
                    }
                    that.beginUpdate();
                    try {
                        $.each(options, function(name, value) {
                            that._logWarningIfDeprecated(name);
                            if (that._optionAliases[name])
                                name = that._optionAliases[name];
                            var prevValue = dataUtils.compileGetter(name)(that._options, {functionsAsIs: true});
                            if (that._optionValuesEqual(name, prevValue, value))
                                return;
                            dataUtils.compileSetter(name)(that._options, value, {
                                functionsAsIs: true,
                                merge: !that._optionsByReference()[name]
                            });
                            that._notifyOptionChanged(name, value, prevValue)
                        })
                    }
                    finally {
                        that.endUpdate()
                    }
                }
            });
        $.extend(DX, {Component: Component})
    })(jQuery, DevExpress);
    /*! Module core, file DOMComponent.js */
    (function($, DX, undefined) {
        var windowResizeCallbacks = DX.utils.windowResizeCallbacks;
        var RTL_DIRECTION_CLASS = "dx-rtl",
            COMPONENT_NAMES_DATA_KEY = "dxComponents",
            VISIBILITY_CHANGE_CLASS = "dx-visibility-change-handler",
            VISIBILITY_CHANGE_EVENTNAMESPACE = "dxVisibilityChange";
        var DOMComponent = DX.Component.inherit({
                NAME: "DOMComponent",
                NAMESPACE: DX,
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({rtlEnabled: DX.rtlEnabled})
                },
                ctor: function(element, options) {
                    this._$element = $(element);
                    this._element().data(this.NAME, this);
                    this._attachInstanceToElement(this._$element);
                    this.disposing = $.Callbacks();
                    this.callBase(options)
                },
                _attachInstanceToElement: $.noop,
                _visibilityChanged: DX.abstract,
                _dimensionChanged: DX.abstract,
                _init: function() {
                    this.callBase();
                    this._attachWindowResizeCallback()
                },
                _attachWindowResizeCallback: function() {
                    if (this._isDimensionChangeSupported()) {
                        var windowResizeCallBack = this._windowResizeCallBack = $.proxy(this._dimensionChanged, this);
                        windowResizeCallbacks.add(windowResizeCallBack)
                    }
                },
                _isDimensionChangeSupported: function() {
                    return this._dimensionChanged !== DX.abstract
                },
                _render: function() {
                    this._toggleRTLDirection(this.option("rtlEnabled"));
                    this._renderVisiblityChange()
                },
                _renderVisiblityChange: function() {
                    if (!this._isVisibilityChangeSupported())
                        return;
                    this._element().addClass(VISIBILITY_CHANGE_CLASS);
                    this._attachVisiblityChangeHandlers()
                },
                _attachVisiblityChangeHandlers: function() {
                    var that = this;
                    that._element().off("." + VISIBILITY_CHANGE_EVENTNAMESPACE).on("dxhiding." + VISIBILITY_CHANGE_EVENTNAMESPACE, function() {
                        that._visibilityChanged(false)
                    }).on("dxshown." + VISIBILITY_CHANGE_EVENTNAMESPACE, function() {
                        that._visibilityChanged(true)
                    })
                },
                _isVisibilityChangeSupported: function() {
                    return this._visibilityChanged !== DX.abstract
                },
                _clean: $.noop,
                _modelByElement: $.noop,
                _invalidate: function() {
                    if (!this._updateLockCount)
                        throw Error("Invalidate called outside update transaction");
                    this._requireRefresh = true
                },
                _refresh: function() {
                    this._clean();
                    this._render()
                },
                _dispose: function() {
                    this._clean();
                    this._detachWindowResizeCallback();
                    this.optionChanged.empty();
                    this.disposing.fireWith(this).empty()
                },
                _detachWindowResizeCallback: function() {
                    if (this._isDimensionChangeSupported())
                        windowResizeCallbacks.remove(this._windowResizeCallBack)
                },
                _toggleRTLDirection: function(rtl) {
                    this._element().toggleClass(RTL_DIRECTION_CLASS, rtl)
                },
                _createAction: function(actionSource, config) {
                    var that = this;
                    config = $.extend({}, config);
                    var element = config.element || that._element(),
                        model = that._modelByElement(element);
                    config.context = model || that;
                    config.component = that;
                    var action = new DX.Action(actionSource, config);
                    return function(e) {
                            if (!arguments.length)
                                e = {};
                            if (e instanceof $.Event)
                                throw Error("Action must be executed with jQuery.Event like action({ jQueryEvent: event })");
                            if (!$.isPlainObject(e))
                                e = {actionValue: e};
                            return action.execute.call(action, $.extend(e, {
                                    component: that,
                                    element: element,
                                    model: model
                                }))
                        }
                },
                _createActionByOption: function(optionName, config) {
                    if (typeof optionName !== "string")
                        throw Error("Option name type is unexpected");
                    this._suppressDeprecatedWarnings();
                    var action = this._createAction(this.option(optionName), config);
                    this._resumeDeprecatedWarnings();
                    return action
                },
                _optionChanged: function(name, value, prevValue) {
                    if (name === "rtlEnabled")
                        this._invalidate()
                },
                _element: function() {
                    return this._$element
                },
                endUpdate: function() {
                    var requireRender = !this._initializing && !this._initialized;
                    this.callBase.apply(this, arguments);
                    if (!this._updateLockCount)
                        if (requireRender)
                            this._render();
                        else if (this._requireRefresh) {
                            this._requireRefresh = false;
                            this._refresh()
                        }
                }
            });
        var registerComponent = function(name, componentClass) {
                componentClass.redefine({_attachInstanceToElement: function($element) {
                        $element.data(name, this);
                        if (!$element.data(COMPONENT_NAMES_DATA_KEY))
                            $element.data(COMPONENT_NAMES_DATA_KEY, []);
                        $element.data(COMPONENT_NAMES_DATA_KEY).push(name)
                    }});
                componentClass.prototype.NAMESPACE[name] = componentClass;
                componentClass.prototype.NAME = name;
                componentClass.defaultOptions = function(rule) {
                    componentClass.prototype._customRules = componentClass.prototype._customRules || [];
                    componentClass.prototype._customRules.push(rule)
                };
                $.fn[name] = function(options) {
                    var isMemberInvoke = typeof options === "string",
                        result;
                    if (isMemberInvoke) {
                        var memberName = options,
                            memberArgs = $.makeArray(arguments).slice(1);
                        this.each(function() {
                            var instance = $(this).data(name);
                            if (!instance)
                                throw Error(DX.utils.stringFormat("Component {0} has not been initialized on this element", name));
                            var member = instance[memberName],
                                memberValue = member.apply(instance, memberArgs);
                            if (result === undefined)
                                result = memberValue
                        })
                    }
                    else {
                        this.each(function() {
                            var instance = $(this).data(name);
                            if (instance)
                                instance.option(options);
                            else
                                new componentClass(this, options)
                        });
                        result = this
                    }
                    return result
                }
            };
        var getComponents = function(element) {
                element = $(element);
                var names = element.data(COMPONENT_NAMES_DATA_KEY);
                if (!names)
                    return [];
                return $.map(names, function(name) {
                        return element.data(name)
                    })
            };
        var disposeComponents = function() {
                $.each(getComponents(this), function() {
                    this._dispose()
                })
            };
        var originalCleanData = $.cleanData;
        $.cleanData = function(element) {
            $.each(element, disposeComponents);
            return originalCleanData.apply(this, arguments)
        };
        registerComponent("DOMComponent", DOMComponent);
        DX.registerComponent = registerComponent
    })(jQuery, DevExpress);
    /*! Module core, file social.js */
    DevExpress.social = {};
    /*! Module core, file facebook.js */
    (function($, DX, undefined) {
        function notifyDeprecated() {
            DX.utils.logger.warn("DevExpress.social API is deprecated. Use official Facebook library instead")
        }
        var social = DX.social;
        var location = window.location,
            navigator = window.navigator,
            encodeURIComponent = window.encodeURIComponent,
            decodeURIComponent = window.decodeURIComponent,
            iosStandaloneMode = navigator.standalone,
            cordovaMode = false;
        if (window.cordova)
            $(document).on("deviceready", function() {
                cordovaMode = true
            });
        var ACCESS_TOKEN_KEY = "dx-facebook-access-token",
            IOS_STANDALONE_STEP1_KEY = "dx-facebook-step1",
            IOS_STANDALONE_STEP2_KEY = "dx-facebook-step2";
        var accessToken = null,
            expires = null,
            connectionChanged = $.Callbacks();
        var pendingLoginRedirectUrl;
        var isConnected = function() {
                return !!accessToken
            };
        var getAccessTokenObject = function() {
                return {
                        accessToken: accessToken,
                        expiresIn: accessToken ? expires : 0
                    }
            };
        var FB = social.Facebook = {
                loginRedirectUrl: "FacebookLoginCallback.html",
                connectionChanged: connectionChanged,
                isConnected: isConnected,
                getAccessTokenObject: getAccessTokenObject,
                jsonp: false
            };
        var login = function(appId, options) {
                notifyDeprecated();
                options = options || {};
                if (cordovaMode)
                    pendingLoginRedirectUrl = "https://www.facebook.com/connect/login_success.html";
                else
                    pendingLoginRedirectUrl = formatLoginRedirectUrl();
                var scope = (options.permissions || []).join(),
                    url = "https://www.facebook.com/dialog/oauth?display=popup&client_id=" + appId + "&redirect_uri=" + encodeURIComponent(pendingLoginRedirectUrl) + "&scope=" + encodeURIComponent(scope) + "&response_type=token";
                if (iosStandaloneMode)
                    putData(IOS_STANDALONE_STEP1_KEY, location.href);
                if (cordovaMode)
                    startLogin_cordova(url);
                else
                    startLogin_browser(url)
            };
        var formatLoginRedirectUrl = function() {
                var pathSegments = location.pathname.split(/\//g);
                pathSegments.pop();
                pathSegments.push(FB.loginRedirectUrl);
                return location.protocol + "//" + location.host + pathSegments.join("/")
            };
        var startLogin_browser = function(loginUrl) {
                var width = 512,
                    height = 320,
                    left = (screen.width - width) / 2,
                    top = (screen.height - height) / 2;
                window.open(loginUrl, null, "width=" + width + ",height=" + height + ",toolbar=0,scrollbars=0,status=0,resizable=0,menuBar=0,left=" + left + ",top=" + top)
            };
        var startLogin_cordova = function(loginUrl) {
                var ref = window.open(loginUrl, "_blank");
                ref.addEventListener('exit', function(event) {
                    pendingLoginRedirectUrl = null
                });
                ref.addEventListener('loadstop', function(event) {
                    var url = unescape(event.url);
                    if (url.indexOf(pendingLoginRedirectUrl) === 0) {
                        ref.close();
                        _processLoginRedirectUrl(url)
                    }
                })
            };
        var handleLoginRedirect = function() {
                var opener = window.opener;
                if (iosStandaloneMode) {
                    putData(IOS_STANDALONE_STEP2_KEY, location.href);
                    location.href = getData(IOS_STANDALONE_STEP1_KEY)
                }
                else if (opener && opener.DevExpress) {
                    opener.DevExpress.social.Facebook._processLoginRedirectUrl(location.href);
                    window.close()
                }
            };
        var _processLoginRedirectUrl = function(url) {
                var params = parseUrlFragment(url);
                expires = params.expires_in;
                changeToken(params.access_token);
                pendingLoginRedirectUrl = null
            };
        var parseUrlFragment = function(url) {
                var hash = url.split("#")[1];
                if (!hash)
                    return {};
                var pairs = hash.split(/&/g),
                    result = {};
                $.each(pairs, function(i) {
                    var splitPair = this.split("=");
                    result[splitPair[0]] = decodeURIComponent(splitPair[1])
                });
                return result
            };
        var logout = function() {
                notifyDeprecated();
                changeToken(null)
            };
        var changeToken = function(value) {
                if (value === accessToken)
                    return;
                accessToken = value;
                putData(ACCESS_TOKEN_KEY, value);
                connectionChanged.fire(!!value)
            };
        var api = function(resource, method, params) {
                notifyDeprecated();
                if (!isConnected())
                    throw Error("Not connected");
                if (typeof method !== "string") {
                    params = method;
                    method = undefined
                }
                method = (method || "get").toLowerCase();
                var d = $.Deferred();
                var args = arguments;
                $.ajax({
                    url: "https://graph.facebook.com/" + resource,
                    type: method,
                    data: $.extend({access_token: accessToken}, params),
                    dataType: FB.jsonp && method === "get" ? "jsonp" : "json"
                }).done(function(response) {
                    response = response || simulateErrorResponse();
                    if (response.error)
                        d.reject(response.error);
                    else
                        d.resolve(response)
                }).fail(function(xhr) {
                    var response;
                    try {
                        response = $.parseJSON(xhr.responseText);
                        var tries = args[3] || 0;
                        if (tries++ < 3 && response.error.code == 190 && response.error.error_subcode == 466) {
                            setTimeout(function() {
                                api(resource, method, params, tries).done(function(result) {
                                    d.resolve(result)
                                }).fail(function(error) {
                                    d.reject(error)
                                })
                            }, 500);
                            return
                        }
                    }
                    catch(x) {
                        response = simulateErrorResponse()
                    }
                    d.reject(response.error)
                });
                return d.promise()
            };
        var simulateErrorResponse = function() {
                return {error: {message: "Unknown error"}}
            };
        var ensureStorageBackend = function() {
                if (!hasStorageBackend())
                    throw Error("HTML5 sessionStorage or jQuery.cookie plugin is required");
            };
        var hasStorageBackend = function() {
                return !!($.cookie || window.sessionStorage)
            };
        var putData = function(key, data) {
                ensureStorageBackend();
                data = JSON.stringify(data);
                if (window.sessionStorage)
                    if (data === null)
                        sess.removeItem(key);
                    else
                        sessionStorage.setItem(key, data);
                else
                    $.cookie(key, data)
            };
        var getData = function(key) {
                ensureStorageBackend();
                try {
                    return JSON.parse(window.sessionStorage ? sessionStorage.getItem(key) : $.cookie(key))
                }
                catch(x) {
                    return null
                }
            };
        if (hasStorageBackend())
            accessToken = getData(ACCESS_TOKEN_KEY);
        if (iosStandaloneMode) {
            var url = getData(IOS_STANDALONE_STEP2_KEY);
            if (url) {
                _processLoginRedirectUrl(url);
                putData(IOS_STANDALONE_STEP1_KEY, null);
                putData(IOS_STANDALONE_STEP2_KEY, null)
            }
        }
        $.extend(FB, {
            login: login,
            logout: logout,
            handleLoginRedirect: handleLoginRedirect,
            _processLoginRedirectUrl: _processLoginRedirectUrl,
            api: api
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.js */
    (function($, DX, undefined) {
        var ui = DX.ui = {};
        var TemplateProvider = DX.Class.inherit({
                getTemplateClass: function() {
                    return Template
                },
                supportDefaultTemplate: function() {
                    return false
                },
                getDefaultTemplate: function() {
                    return null
                }
            });
        var Template = DX.Class.inherit({
                ctor: function(element, owner) {
                    this._template = this._element = $(element).detach();
                    this._owner = owner
                },
                render: function(container) {
                    var renderedTemplate = this._template.clone();
                    container.append(renderedTemplate);
                    return renderedTemplate
                },
                dispose: function() {
                    this._owner = null
                },
                owner: function() {
                    return this._owner
                }
            });
        var GESTURE_LOCK_KEY = "dxGestureLock";
        DX.registerActionExecutor({
            designMode: {validate: function(e) {
                    if (DX.designMode)
                        e.cancel = true
                }},
            gesture: {validate: function(e) {
                    if (!e.args.length)
                        return;
                    var args = e.args[0],
                        jQueryEvent = args.jQueryEvent;
                    if (!jQueryEvent)
                        return;
                    var element = $(jQueryEvent.target);
                    while (element && element.length) {
                        if (element.data(GESTURE_LOCK_KEY)) {
                            e.cancel = true;
                            break
                        }
                        element = element.parent()
                    }
                }},
            disabled: {validate: function(e) {
                    if (!e.args.length)
                        return;
                    var args = e.args[0],
                        element = args.itemElement || args.element;
                    if (element && element.is(".dx-state-disabled, .dx-state-disabled *"))
                        e.cancel = true
                }}
        });
        $.extend(ui, {
            TemplateProvider: TemplateProvider,
            Template: Template,
            initViewport: function() {
                DX.utils.logger.warn("DevExpress.ui.initViewport is deprecated. Use DX.utils.initMobileViewport instead");
                DX.utils.initMobileViewport()
            }
        });
        ui.__internals = ui.__internals || {};
        $.extend(ui.__internals, {Template: Template})
    })(jQuery, DevExpress);
    /*! Module core, file ko.components.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko,
            ui = DX.ui,
            LOCKS_DATA_KEY = "dxKoLocks",
            CREATED_WITH_KO_DATA_KEY = "dxKoCreation";
        var Locks = function() {
                var info = {};
                var currentCount = function(lockName) {
                        return info[lockName] || 0
                    };
                return {
                        obtain: function(lockName) {
                            info[lockName] = currentCount(lockName) + 1
                        },
                        release: function(lockName) {
                            var count = currentCount(lockName);
                            if (count < 1)
                                throw Error("Not locked");
                            if (count === 1)
                                delete info[lockName];
                            else
                                info[lockName] = count - 1
                        },
                        locked: function(lockName) {
                            return currentCount(lockName) > 0
                        }
                    }
            };
        var registerComponentKoBinding = function(componentName) {
                ko.bindingHandlers[componentName] = {init: function(domNode, valueAccessor) {
                        var element = $(domNode),
                            ctorOptions = {},
                            optionNameToModelMap = {};
                        var applyModelValueToOption = function(optionName, modelValue) {
                                var component = element.data(componentName),
                                    locks = element.data(LOCKS_DATA_KEY),
                                    optionValue = ko.utils.unwrapObservable(modelValue);
                                if (ko.isWriteableObservable(modelValue))
                                    optionNameToModelMap[optionName] = modelValue;
                                if (component) {
                                    if (locks.locked(optionName))
                                        return;
                                    locks.obtain(optionName);
                                    try {
                                        component.option(optionName, optionValue)
                                    }
                                    finally {
                                        locks.release(optionName)
                                    }
                                }
                                else
                                    ctorOptions[optionName] = optionValue
                            };
                        var handleOptionChanged = function(optionName, optionValue) {
                                if (!(optionName in optionNameToModelMap))
                                    return;
                                var element = this._$element,
                                    locks = element.data(LOCKS_DATA_KEY);
                                if (locks.locked(optionName))
                                    return;
                                locks.obtain(optionName);
                                try {
                                    optionNameToModelMap[optionName](optionValue)
                                }
                                finally {
                                    locks.release(optionName)
                                }
                            };
                        var createComponent = function() {
                                element.data(CREATED_WITH_KO_DATA_KEY, true);
                                element[componentName](ctorOptions);
                                ctorOptions = null;
                                element.data(LOCKS_DATA_KEY, new Locks);
                                element.data(componentName).optionChanged.add(handleOptionChanged)
                            };
                        ko.computed(function() {
                            var component = element.data(componentName);
                            if (component)
                                component.beginUpdate();
                            $.each(ko.unwrap(valueAccessor()), function(modelName, modelValueExpr) {
                                ko.computed(function() {
                                    applyModelValueToOption(modelName, modelValueExpr)
                                }, null, {disposeWhenNodeIsRemoved: domNode})
                            });
                            if (component)
                                component.endUpdate();
                            else
                                createComponent()
                        }, null, {disposeWhenNodeIsRemoved: domNode});
                        return {controlsDescendantBindings: ui[componentName] && ui[componentName].subclassOf(ui.Widget)}
                    }}
            };
        var KoComponent = DX.DOMComponent.inherit({_modelByElement: function(element) {
                    if (element.length)
                        return ko.dataFor(element.get(0))
                }});
        var originalRegisterComponent = DX.registerComponent;
        var registerKoComponent = function(name, componentClass) {
                originalRegisterComponent(name, componentClass);
                registerComponentKoBinding(name)
            };
        ko.bindingHandlers.dxAction = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var $element = $(element);
                var unwrappedValue = ko.utils.unwrapObservable(valueAccessor()),
                    actionSource = unwrappedValue,
                    actionOptions = {context: element};
                if (unwrappedValue.execute) {
                    actionSource = unwrappedValue.execute;
                    $.extend(actionOptions, unwrappedValue)
                }
                var action = new DX.Action(actionSource, actionOptions);
                $element.off(".dxActionBinding").on("dxclick.dxActionBinding", function(e) {
                    action.execute({
                        element: $element,
                        model: viewModel,
                        evaluate: function(expression) {
                            var context = viewModel;
                            if (expression.length > 0 && expression[0] === "$")
                                context = ko.contextFor(element);
                            var getter = DX.data.utils.compileGetter(expression);
                            return getter(context)
                        },
                        jQueryEvent: e
                    });
                    if (!actionOptions.bubbling)
                        e.stopPropagation()
                })
            }};
        var cleanKoData = function(element, andSelf) {
                var cleanNode = function() {
                        ko.cleanNode(this)
                    };
                if (andSelf)
                    element.each(cleanNode);
                else
                    element.find("*").each(cleanNode)
            };
        var originalEmpty = $.fn.empty;
        $.fn.empty = function() {
            cleanKoData(this, false);
            return originalEmpty.apply(this, arguments)
        };
        var originalRemove = $.fn.remove;
        $.fn.remove = function(selector, keepData) {
            if (!keepData) {
                var subject = this;
                if (selector)
                    subject = subject.filter(selector);
                cleanKoData(subject, true)
            }
            return originalRemove.call(this, selector, keepData)
        };
        var originalHtml = $.fn.html;
        $.fn.html = function(value) {
            if (typeof value === "string")
                cleanKoData(this, false);
            return originalHtml.apply(this, arguments)
        };
        DX.registerComponent = registerKoComponent;
        registerKoComponent("DOMComponent", KoComponent)
    })(jQuery, DevExpress);
    /*! Module core, file ng.components.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        var ui = DX.ui,
            compileSetter = DX.data.utils.compileSetter,
            compileGetter = DX.data.utils.compileGetter;
        var CREATED_WITH_NG_DATA_KEY = "dxNgCreation",
            TEMPLATES_DATA_KEY = "dxTemplates",
            COMPILER_DATA_KEY = "dxNgCompiler",
            DEFAULT_COMPILER_DATA_KEY = "dxDefaultCompilerGetter",
            ANONYMOUS_TEMPLATE_NAME = "template";
        var phoneJsModule = DX.ng.module;
        var ComponentBuilder = DX.Class.inherit({
                ctor: function(options) {
                    this._componentName = options.componentName;
                    this._$element = options.$element;
                    this._$templates = options.$templates;
                    this._scope = options.scope;
                    this._compile = options.compile;
                    this._ngOptions = options.ngOptions;
                    this._componentDisposing = $.Callbacks();
                    this._$element.data(CREATED_WITH_NG_DATA_KEY, true);
                    if (options.ngOptions.data)
                        this._initDataScope(options.ngOptions.data)
                },
                initDefaultCompilerGetter: function() {
                    var that = this;
                    that._$element.data(DEFAULT_COMPILER_DATA_KEY, function($template) {
                        return that._compilerByTemplate($template)
                    })
                },
                initTemplateCompilers: function() {
                    var that = this;
                    if (this._$templates)
                        this._$templates.each(function(i, template) {
                            $(template).data(COMPILER_DATA_KEY, that._compilerByTemplate(template))
                        })
                },
                initComponentWithBindings: function() {
                    this._initComponent(this._scope);
                    this._initComponentBindings()
                },
                _initDataScope: function(data) {
                    if (typeof data === "string") {
                        var dataStr = data,
                            rootScope = this._scope;
                        data = rootScope.$eval(data);
                        this._scope = rootScope.$new();
                        this._synchronizeDataScopes(rootScope, this._scope, data, dataStr)
                    }
                    $.extend(this._scope, data)
                },
                _synchronizeDataScopes: function(parentScope, childScope, data, parentPrefix) {
                    var that = this;
                    $.each(data, function(fieldPath) {
                        that._synchronizeScopeField({
                            parentScope: parentScope,
                            childScope: childScope,
                            fieldPath: fieldPath,
                            parentPrefix: parentPrefix
                        })
                    })
                },
                _initComponent: function(scope) {
                    this._component = this._$element[this._componentName](this._evalOptions(scope)).data(this._componentName)
                },
                _initComponentBindings: function() {
                    var that = this,
                        optionDependencies = {};
                    if (that._ngOptions.bindingOptions)
                        $.each(that._ngOptions.bindingOptions, function(optionPath, valuePath) {
                            var separatorIndex = optionPath.search(/\[|\./),
                                optionForSubscribe = separatorIndex > -1 ? optionPath.substring(0, separatorIndex) : optionPath,
                                watchMethod = $.isArray(that._scope.$eval(valuePath)) ? "$watchCollection" : "$watch";
                            if (!optionDependencies[optionForSubscribe])
                                optionDependencies[optionForSubscribe] = {};
                            optionDependencies[optionForSubscribe][optionPath] = valuePath;
                            var clearWatcher = that._scope[watchMethod](valuePath, function(newValue, oldValue) {
                                    if (newValue !== oldValue)
                                        that._component.option(optionPath, newValue)
                                }, true);
                            that._component.disposing.add(function() {
                                clearWatcher();
                                that._componentDisposing.fire()
                            })
                        });
                    that._component.optionChanged.add(function(optionName, optionValue) {
                        if (that._scope.$root.$$phase === "$digest" || !optionDependencies || !optionDependencies[optionName])
                            return;
                        safeApply(function(scope) {
                            $.each(optionDependencies[optionName], function(optionPath, valuePath) {
                                var setter = compileSetter(valuePath),
                                    getter = compileGetter(optionPath);
                                var tmpData = {};
                                tmpData[optionName] = optionValue;
                                setter(scope, getter(tmpData))
                            })
                        }, that._scope)
                    })
                },
                _compilerByTemplate: function(template) {
                    var that = this,
                        scopeItemsPath = this._getScopeItemsPath();
                    return function(data, index) {
                            var $resultMarkup = $(template).clone(),
                                templateScope;
                            if (data !== undefined) {
                                var dataIsScope = data.$id,
                                    templateScope = dataIsScope ? data : that._createScopeWithData(data);
                                $resultMarkup.on("$destroy", function() {
                                    var destroyAlreadyCalled = !templateScope.$parent;
                                    if (destroyAlreadyCalled)
                                        return;
                                    templateScope.$destroy()
                                })
                            }
                            else
                                templateScope = that._scope;
                            if (scopeItemsPath)
                                that._synchronizeScopes(templateScope, scopeItemsPath, index);
                            safeApply(that._compile($resultMarkup), templateScope);
                            return $resultMarkup
                        }
                },
                _getScopeItemsPath: function() {
                    if (ui[this._componentName].subclassOf(ui.CollectionContainerWidget) && this._ngOptions.bindingOptions)
                        return this._ngOptions.bindingOptions.items
                },
                _createScopeWithData: function(data) {
                    var newScope = this._scope.$new(true);
                    if (typeof data === "object")
                        $.extend(newScope, data);
                    else
                        newScope.scopeValue = data;
                    return newScope
                },
                _synchronizeScopes: function(itemScope, parentPrefix, itemIndex) {
                    var that = this,
                        item = compileGetter(parentPrefix + "[" + itemIndex + "]")(this._scope);
                    if (!$.isPlainObject(item))
                        item = {scopeValue: item};
                    $.each(item, function(itemPath) {
                        that._synchronizeScopeField({
                            parentScope: that._scope,
                            childScope: itemScope,
                            fieldPath: itemPath,
                            parentPrefix: parentPrefix,
                            itemIndex: itemIndex
                        })
                    })
                },
                _synchronizeScopeField: function(args) {
                    var parentScope = args.parentScope,
                        childScope = args.childScope,
                        fieldPath = args.fieldPath,
                        parentPrefix = args.parentPrefix,
                        itemIndex = args.itemIndex;
                    var innerPathSuffix = fieldPath === "scopeValue" ? "" : "." + fieldPath,
                        collectionField = itemIndex !== undefined,
                        optionOuterBag = [parentPrefix],
                        optionOuterPath;
                    if (collectionField)
                        optionOuterBag.push("[", itemIndex, "]");
                    optionOuterBag.push(innerPathSuffix);
                    optionOuterPath = optionOuterBag.join("");
                    var clearParentWatcher = parentScope.$watch(optionOuterPath, function(newValue, oldValue) {
                            if (newValue !== oldValue)
                                compileSetter(fieldPath)(childScope, newValue)
                        });
                    var clearItemWatcher = childScope.$watch(fieldPath, function(newValue, oldValue) {
                            if (newValue !== oldValue) {
                                if (collectionField && !compileGetter(parentPrefix)(parentScope)[itemIndex]) {
                                    clearItemWatcher();
                                    return
                                }
                                compileSetter(optionOuterPath)(parentScope, newValue)
                            }
                        });
                    this._componentDisposing.add([clearParentWatcher, clearItemWatcher])
                },
                _evalOptions: function(scope) {
                    var result = $.extend({}, this._ngOptions);
                    delete result.data;
                    delete result.bindingOptions;
                    if (this._ngOptions.bindingOptions)
                        $.each(this._ngOptions.bindingOptions, function(key, value) {
                            result[key] = scope.$eval(value)
                        });
                    return result
                }
            });
        var safeApply = function(func, scope) {
                if (scope.$root.$$phase)
                    func(scope);
                else
                    scope.$apply(function() {
                        func(scope)
                    })
            };
        var extractTemplates = function($element, componentName) {
                if ($element.data(TEMPLATES_DATA_KEY))
                    return $element.data(TEMPLATES_DATA_KEY);
                var $templates;
                if (ui[componentName] && ui[componentName].subclassOf(ui.Widget) && $.trim($element.html())) {
                    var isAnonymousTemplate = !$element.children().first().attr("data-options");
                    if (isAnonymousTemplate)
                        $templates = $("<div/>").attr("data-options", "dxTemplate: { name: '" + ANONYMOUS_TEMPLATE_NAME + "' }").append($element.contents());
                    else
                        $templates = $element.children().detach();
                    $element.data(TEMPLATES_DATA_KEY, $templates)
                }
                return $templates
            };
        var NgComponent = DX.DOMComponent.inherit({
                _modelByElement: function(element) {
                    if (element.length)
                        return element.scope()
                },
                _createActionByOption: function() {
                    var action = this.callBase.apply(this, arguments);
                    var component = this,
                        wrappedAction = function() {
                            var that = this,
                                scope = component._modelByElement(component._element()),
                                args = arguments;
                            if (!scope || scope.$root.$$phase)
                                return action.apply(that, args);
                            return scope.$apply(function() {
                                    return action.apply(that, args)
                                })
                        };
                    return wrappedAction
                }
            });
        var originalRegisterComponent = DX.registerComponent;
        var registerNgComponent = function(componentName, componentClass) {
                originalRegisterComponent(componentName, componentClass);
                phoneJsModule.directive(componentName, ["$compile", function(compile) {
                        return {
                                restrict: "A",
                                compile: function($element) {
                                    var $templates = extractTemplates($element, componentName);
                                    return function(scope, $element, attrs) {
                                            var componentBuilder = new ComponentBuilder({
                                                    componentName: componentName,
                                                    compile: compile,
                                                    $element: $element,
                                                    scope: scope,
                                                    ngOptions: attrs[componentName] ? scope.$eval(attrs[componentName]) : {},
                                                    $templates: $templates
                                                });
                                            componentBuilder.initTemplateCompilers();
                                            componentBuilder.initDefaultCompilerGetter();
                                            componentBuilder.initComponentWithBindings()
                                        }
                                }
                            }
                    }])
            };
        DX.registerComponent = registerNgComponent;
        registerNgComponent("DOMComponent", NgComponent)
    })(jQuery, DevExpress);
    /*! Module core, file ko.templates.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko,
            ui = DX.ui,
            CREATED_WITH_KO_DATA_KEY = "dxKoCreation";
        var KoTemplate = ui.Template.inherit({
                ctor: function(element) {
                    this.callBase.apply(this, arguments);
                    this._template = $("<div>").append(element);
                    this._registerKoTemplate()
                },
                _cleanTemplateElement: function() {
                    this._element.each(function() {
                        ko.cleanNode(this)
                    })
                },
                _registerKoTemplate: function() {
                    var template = this._template.get(0);
                    new ko.templateSources.anonymousTemplate(template)['nodes'](template)
                },
                render: function(container, data) {
                    data = data !== undefined ? data : ko.dataFor(container.get(0)) || {};
                    var containerBindingContext = ko.contextFor(container[0]);
                    var bindingContext = containerBindingContext ? containerBindingContext.createChildContext(data) : data;
                    var renderBag = $("<div />").appendTo(container);
                    ko.renderTemplate(this._template.get(0), bindingContext, null, renderBag.get(0));
                    var result = renderBag.contents();
                    container.append(result);
                    renderBag.remove();
                    return result
                },
                dispose: function() {
                    this.callBase();
                    this._template.remove()
                }
            });
        var KoTemplateProvider = ui.TemplateProvider.inherit({
                getTemplateClass: function(widget) {
                    return this._createdWithKo(widget) ? KoTemplate : this.callBase(widget)
                },
                supportDefaultTemplate: function(widget) {
                    return this._createdWithKo(widget) ? true : this.callBase(widget)
                },
                getDefaultTemplate: function(widget) {
                    if (this._createdWithKo(widget))
                        return defaultKoTemplate(widget.NAME)
                },
                _createdWithKo: function(widget) {
                    return !!widget._element().data(CREATED_WITH_KO_DATA_KEY)
                }
            });
        var defaultKoTemplate = function() {
                var cache = {};
                return function(widgetName) {
                        if (!DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName])
                            widgetName = "base";
                        if (!cache[widgetName]) {
                            var html = DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName](),
                                markup = DX.utils.createMarkupFromString(html);
                            cache[widgetName] = new KoTemplate(markup)
                        }
                        return cache[widgetName]
                    }
            }();
        var createElementWithBindAttr = function(tagName, bindings, closeTag, additionalProperties) {
                closeTag = closeTag === undefined ? true : closeTag;
                var bindAttr = $.map(bindings, function(value, key) {
                        return key + ":" + value
                    }).join(",");
                additionalProperties = additionalProperties || "";
                return "<" + tagName + " data-bind=\"" + bindAttr + "\" " + additionalProperties + ">" + (closeTag ? "</" + tagName + ">" : "")
            };
        var defaultKoTemplateBasicBindings = {css: "{ 'dx-state-disabled': $data.disabled, 'dx-state-invisible': !($data.visible === undefined || ko.unwrap($data.visible)) }"};
        var DEFAULT_ITEM_TEMPLATE_GENERATORS = {base: function() {
                    var template = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false)],
                        htmlBinding = createElementWithBindAttr("div", {html: "html"}),
                        textBinding = createElementWithBindAttr("div", {text: "text"}),
                        primitiveBinding = createElementWithBindAttr("div", {text: "String($data)"});
                    template.push("<!-- ko if: $data.html && !$data.text -->", htmlBinding, "<!-- /ko -->", "<!-- ko if: !$data.html && $data.text -->", textBinding, "<!-- /ko -->", "<!-- ko ifnot: $.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>");
                    return template.join("")
                }};
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxPivotTabs = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                titleBinding = createElementWithBindAttr("span", {text: "title"});
            var divInnerStart = template.indexOf(">") + 1,
                divInnerFinish = template.length - 6;
            template = [template.substring(0, divInnerStart), titleBinding, template.substring(divInnerFinish, template.length)];
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxPanorama = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                headerBinding = createElementWithBindAttr("div", {text: "header"}, true, 'class="dx-panorama-item-header"');
            var divInnerStart = template.indexOf(">") + 1;
            template = [template.substring(0, divInnerStart), "<!-- ko if: $data.header -->", headerBinding, "<!-- /ko -->", template.substring(divInnerStart, template.length)];
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxList = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                keyBinding = createElementWithBindAttr("div", {text: "key"});
            template = [template.substring(0, template.length - 6), "<!-- ko if: $data.key -->" + keyBinding + "<!-- /ko -->", "</div>"];
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxToolbar = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base();
            template = [template.substring(0, template.length - 6), "<!-- ko if: $data.widget -->"];
            $.each(["button", "tabs", "dropDownMenu"], function() {
                var bindingName = DX.inflector.camelize(["dx", "-", this].join("")),
                    bindingObj = {};
                bindingObj[bindingName] = "$data.options";
                template.push("<!-- ko if: $data.widget === '", this, "' -->", createElementWithBindAttr("div", bindingObj), "<!-- /ko -->")
            });
            template.push("<!-- /ko -->");
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxGallery = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                primitiveBinding = createElementWithBindAttr("div", {text: "String($data)"}),
                imgBinding = createElementWithBindAttr("img", {attr: "{ src: String($data) }"}, false);
            template = template.replace(primitiveBinding, imgBinding);
            return template
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                baseTextBinding = createElementWithBindAttr("div", {text: "text"}),
                iconBinding = createElementWithBindAttr("span", {
                    attr: "{ 'class': 'dx-icon-' + $data.icon }",
                    css: "{ 'dx-icon': true }"
                }),
                iconSrcBinding = createElementWithBindAttr("img", {
                    attr: "{ src: $data.iconSrc }",
                    css: "{ 'dx-icon': true }"
                }, false),
                textBinding = "<!-- ko if: $data.icon -->" + iconBinding + "<!-- /ko -->" + "<!-- ko if: !$data.icon && $data.iconSrc -->" + iconSrcBinding + "<!-- /ko -->" + "<span class=\"dx-tab-text\" data-bind=\"text: $data.text\"></span>";
            template = template.replace("<!-- ko if: !$data.html && $data.text -->", "<!-- ko if: !$data.html && ($data.text || $data.icon || $data.iconSrc) -->").replace(baseTextBinding, textBinding);
            return template
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxActionSheet = function() {
            return createElementWithBindAttr("div", {dxButton: "{ text: $data.text, clickAction: $data.clickAction, type: $data.type, disabled: !!ko.unwrap($data.disabled) }"})
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxNavBar = DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs;
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxMenu = function() {
            var template = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false)],
                iconBinding = createElementWithBindAttr("span", {
                    attr: "{ 'class': 'dx-icon-' + $data.icon }",
                    css: "{ 'dx-icon': true }"
                }),
                iconSrcBinding = createElementWithBindAttr("img", {
                    attr: "{ src: $data.iconSrc }",
                    css: "{ 'dx-icon': true }"
                }),
                textBinding = createElementWithBindAttr("span", {
                    text: "text",
                    css: "{ 'dx-menu-item-text': true }"
                }),
                primitiveBinding = createElementWithBindAttr("span", {
                    text: "String($data)",
                    css: "{ 'dx-menu-item-text': true }"
                }),
                popout = '<span class="dx-menu-item-popout-container"><div class="dx-menu-item-popout"></div></span>';
            template.push('<div class="dx-menu-item-content">', '<!-- ko if: $data.icon -->', iconBinding, '<!-- /ko -->', '<!-- ko if: !$data.icon && $data.iconSrc -->', iconSrcBinding, '<!-- /ko -->', '<!-- ko if: $.isPlainObject($data) -->', textBinding, '<!-- /ko -->', '<!-- ko ifnot: $.isPlainObject($data) -->', primitiveBinding, '<!-- /ko -->', '<!-- ko if: $data.items -->', popout, '<!-- /ko -->', '</div>', '</div>');
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxContextMenu = DEFAULT_ITEM_TEMPLATE_GENERATORS.dxMenu;
        $.extend(ui, {
            TemplateProvider: KoTemplateProvider,
            Template: KoTemplate,
            defaultTemplate: defaultKoTemplate
        });
        ui.__internals = ui.__internals || {};
        $.extend(ui.__internals, {KoTemplate: KoTemplate})
    })(jQuery, DevExpress);
    /*! Module core, file ng.templates.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        var ui = DX.ui;
        var CREATED_WITH_NG_DATA_KEY = "dxNgCreation",
            COMPILER_DATA_KEY = "dxNgCompiler",
            DEFAULT_COMPILER_DATA_KEY = "dxDefaultCompilerGetter";
        var NgTemplate = ui.Template.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    this._compiler = this._template.data(COMPILER_DATA_KEY)
                },
                render: function(container, data, index) {
                    var compiler = this._compiler,
                        result = $.isFunction(compiler) ? compiler(data, index) : compiler;
                    container.append(result);
                    return result
                },
                setCompiler: function(compilerGetter) {
                    this._compiler = compilerGetter(this._element)
                }
            });
        var NgTemplateProvider = ui.TemplateProvider.inherit({
                getTemplateClass: function(widget) {
                    if (this._createdWithNg(widget))
                        return NgTemplate;
                    return this.callBase(widget)
                },
                supportDefaultTemplate: function(widget) {
                    return this._createdWithNg(widget) ? true : this.callBase(widget)
                },
                getDefaultTemplate: function(widget) {
                    if (this._createdWithNg(widget)) {
                        var compilerGetter = widget._element().data(DEFAULT_COMPILER_DATA_KEY),
                            template = defaultNgTemplate(widget.NAME);
                        template.setCompiler(compilerGetter);
                        return template
                    }
                },
                _createdWithNg: function(widget) {
                    return !!widget._element().data(CREATED_WITH_NG_DATA_KEY)
                }
            });
        var defaultNgTemplate = function() {
                var cache = {};
                return function(widgetName) {
                        if (!DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName])
                            widgetName = "base";
                        if (!cache[widgetName])
                            cache[widgetName] = DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName]();
                        return new NgTemplate(cache[widgetName])
                    }
            }();
        var baseElements = {
                container: function() {
                    return $("<div>").attr("ng-class", "{ 'dx-state-invisible': !visible && visible != undefined, 'dx-state-disabled': !!disabled }")
                },
                html: function() {
                    return $("<div>").attr("ng-if", "html").attr("ng-bind-html", "html")
                },
                text: function() {
                    return $("<div>").attr("ng-if", "text").attr("ng-bind", "text")
                },
                primitive: function() {
                    return $("<div>").attr("ng-if", "scopeValue").attr("ng-bind-html", "'' + scopeValue")
                }
            };
        var DEFAULT_ITEM_TEMPLATE_GENERATORS = {base: function() {
                    return baseElements.container().append(baseElements.html()).append(baseElements.text()).append(baseElements.primitive())
                }};
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxList = function() {
            return DEFAULT_ITEM_TEMPLATE_GENERATORS.base().append($("<div>").attr("ng-if", "key").attr("ng-bind", "key"))
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxToolbar = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base();
            $.each(["button", "tabs", "dropDownMenu"], function(i, widgetName) {
                var bindingName = "dx-" + DX.inflector.dasherize(this);
                $("<div>").attr("ng-if", "widget === '" + widgetName + "'").attr(bindingName, "options").appendTo(template)
            });
            return template
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxGallery = function() {
            return baseElements.container().append(baseElements.html()).append(baseElements.text()).append($("<img>").attr("ng-if", "scopeValue").attr("ng-src", "{{'' + scopeValue}}"))
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs = function() {
            var container = baseElements.container();
            var text = $("<span>").addClass("dx-tab-text").attr("ng-bind", "text").attr("ng-if", "text"),
                icon = $("<span>").attr("ng-if", "icon").addClass("dx-icon").attr("ng-class", "'dx-icon-' + icon"),
                iconSrc = $("<img>").attr("ng-if", "iconSrc").addClass("dx-icon").attr("ng-src", "{{iconSrc}}");
            return container.append(baseElements.html()).append(icon).append(iconSrc).append(text).append(baseElements.primitive())
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxMenu = function() {
            var container = baseElements.container();
            var content = $("<div>").addClass("dx-menu-item-content"),
                text = $("<span>").attr("ng-if", "text").addClass("dx-menu-item-text").attr("ng-bind", "text"),
                icon = $("<span>").attr("ng-if", "icon").addClass("dx-icon").attr("ng-class", "'dx-icon-' + icon"),
                iconSrc = $("<img>").attr("ng-if", "iconSrc").addClass("dx-icon").attr("ng-src", "{{iconSrc}}"),
                popout = $("<span>").addClass("dx-menu-item-popout-container").attr("ng-if", "items").append($("<div>").addClass("dx-menu-item-popout"));
            content.append(baseElements.html()).append(icon).append(iconSrc).append(text).append(popout).append(baseElements.primitive()).appendTo(container);
            return container
        },
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxActionSheet = function() {
            return $("<div>").attr("dx-button", "{ bindingOptions: { text: 'text', clickAction: 'clickAction', type: 'type', disabled: 'disabled' } }")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxNavBar = DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs;
        $.extend(ui, {
            Template: NgTemplate,
            TemplateProvider: NgTemplateProvider
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.themes.js */
    (function($, DX, undefined) {
        var DX_LINK_SELECTOR = "link[rel=dx-theme]",
            THEME_ATTR = "data-theme",
            ACTIVE_ATTR = "data-active";
        var context,
            $activeThemeLink,
            knownThemes,
            currentThemeName,
            pendingThemeName;
        var THEME_MARKER_PREFIX = "dx.";
        function readThemeMarker() {
            var element = $("<div></div>", context).addClass("dx-theme-marker").appendTo(context.documentElement),
                result;
            try {
                result = element.css("font-family");
                if (!result)
                    return null;
                result = result.replace(/["']/g, "");
                if (result.substr(0, THEME_MARKER_PREFIX.length) !== THEME_MARKER_PREFIX)
                    return null;
                return result.substr(THEME_MARKER_PREFIX.length)
            }
            finally {
                element.remove()
            }
        }
        function waitForThemeLoad(themeName, callback) {
            var timerId,
                waitStartTime;
            pendingThemeName = themeName;
            function handleLoaded() {
                pendingThemeName = null;
                callback()
            }
            if (isPendingThemeLoaded())
                handleLoaded();
            else {
                waitStartTime = $.now();
                timerId = setInterval(function() {
                    var isLoaded = isPendingThemeLoaded(),
                        isTimeout = !isLoaded && $.now() - waitStartTime > 15 * 1000;
                    if (isTimeout)
                        DX.utils.logger.warn("Theme loading timed out: " + pendingThemeName);
                    if (isLoaded || isTimeout) {
                        clearInterval(timerId);
                        handleLoaded()
                    }
                }, 10)
            }
        }
        function isPendingThemeLoaded() {
            return !pendingThemeName || readThemeMarker() === pendingThemeName
        }
        function processMarkup() {
            var $allThemeLinks = $(DX_LINK_SELECTOR, context);
            if (!$allThemeLinks.length)
                return;
            knownThemes = {};
            $activeThemeLink = $(DX.utils.createMarkupFromString("<link rel=stylesheet>"), context);
            $allThemeLinks.each(function() {
                var link = $(this, context),
                    fullThemeName = link.attr(THEME_ATTR),
                    url = link.attr("href"),
                    isActive = link.attr(ACTIVE_ATTR) === "true";
                knownThemes[fullThemeName] = {
                    url: url,
                    isActive: isActive
                }
            });
            $allThemeLinks.last().after($activeThemeLink);
            $allThemeLinks.remove()
        }
        function resolveFullThemeName(desiredThemeName) {
            var desiredThemeParts = desiredThemeName.split("."),
                result = null;
            if (knownThemes)
                $.each(knownThemes, function(knownThemeName, themeData) {
                    var knownThemeParts = knownThemeName.split(".");
                    if (knownThemeParts[0] !== desiredThemeParts[0])
                        return;
                    if (desiredThemeParts[1] && desiredThemeParts[1] !== knownThemeParts[1])
                        return;
                    if (!result || themeData.isActive)
                        result = knownThemeName;
                    if (themeData.isActive)
                        return false
                });
            return result
        }
        function initContext(newContext) {
            try {
                if (newContext !== context)
                    knownThemes = null
            }
            catch(x) {
                knownThemes = null
            }
            context = newContext
        }
        function init(options) {
            options = options || {};
            initContext(options.context || document);
            processMarkup();
            currentThemeName = undefined;
            current(options)
        }
        function current(options) {
            if (!arguments.length)
                return currentThemeName || readThemeMarker();
            options = options || {};
            if (typeof options === "string")
                options = {theme: options};
            var isAutoInit = options._autoInit,
                loadCallback = options.loadCallback,
                currentThemeData;
            currentThemeName = options.theme || currentThemeName;
            if (isAutoInit && !currentThemeName)
                currentThemeName = themeNameFromDevice(DX.devices.current());
            currentThemeName = resolveFullThemeName(currentThemeName);
            if (currentThemeName)
                currentThemeData = knownThemes[currentThemeName];
            if (currentThemeData) {
                $activeThemeLink.removeAttr("href");
                $activeThemeLink.attr("href", knownThemes[currentThemeName].url);
                if (loadCallback)
                    waitForThemeLoad(currentThemeName, loadCallback);
                else if (pendingThemeName)
                    pendingThemeName = currentThemeName
            }
            else if (isAutoInit) {
                if (loadCallback)
                    loadCallback()
            }
            else
                throw Error("Unknown theme: " + currentThemeName);
        }
        function themeNameFromDevice(device) {
            var themeName = device.platform,
                majorVersion = device.version && device.version[0];
            if (themeName === "ios" && (!majorVersion || majorVersion > 6))
                themeName += "7";
            return themeName
        }
        function getCssClasses(themeName) {
            themeName = themeName || current();
            var result = [],
                themeNameParts = themeName && themeName.split(".");
            if (themeNameParts) {
                result.push("dx-theme-" + themeNameParts[0], "dx-theme-" + themeNameParts[0] + "-typography");
                if (themeNameParts.length > 1)
                    result.push("dx-color-scheme-" + themeNameParts[1])
            }
            return result
        }
        function attachCssClasses(element, themeName) {
            $(element).addClass(getCssClasses(themeName).join(" "))
        }
        function detachCssClasses(element, themeName) {
            $(element).removeClass(getCssClasses(themeName).join(" "))
        }
        $.holdReady(true);
        init({
            _autoInit: true,
            loadCallback: function() {
                $.holdReady(false)
            }
        });
        $(function() {
            if ($(DX_LINK_SELECTOR, context).length)
                throw Error("LINK[rel=dx-theme] tags must go before DevExpress included scripts");
        });
        DX.ui.themes = {
            init: init,
            current: current,
            attachCssClasses: attachCssClasses,
            detachCssClasses: detachCssClasses
        };
        DX.ui.themes.__internals = {
            themeNameFromDevice: themeNameFromDevice,
            waitForThemeLoad: waitForThemeLoad,
            resetTheme: function() {
                $activeThemeLink.attr("href", "about:blank");
                currentThemeName = null;
                pendingThemeName = null
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            eventNS = $.event,
            specialNS = eventNS.special,
            EVENT_SOURCES_REGEX = {
                mouse: /(mouse|wheel|click)/i,
                wheel: /wheel/i,
                touch: /^touch/i,
                keyboard: /^key/i,
                pointer: /pointer/i
            };
        var eventSource = function(e) {
                var result = "other";
                $.each(EVENT_SOURCES_REGEX, function(key) {
                    if (this.test(e.type)) {
                        result = key;
                        return false
                    }
                });
                return result
            };
        var isPointerEvent = function(e) {
                return eventSource(e) === "pointer"
            };
        var isMouseEvent = function(e) {
                return eventSource(e) === "mouse" || isPointerEvent(e) && e.pointerType === "mouse"
            };
        var isTouchEvent = function(e) {
                return eventSource(e) === "touch" || isPointerEvent(e) && e.pointerType === "touch"
            };
        var isKeyboardEvent = function(e) {
                return eventSource(e) === "keyboard"
            };
        var isMouseWheelEvent = function(e) {
                return EVENT_SOURCES_REGEX["wheel"].test(e.type)
            };
        var addNamespace = function(eventNames, namespace) {
                if (!namespace)
                    throw Error("Namespace is not defined");
                if (typeof eventNames === "string")
                    return addNamespace(eventNames.split(/\s+/g), namespace);
                $.each(eventNames, function(index, eventName) {
                    eventNames[index] = eventName + "." + namespace
                });
                return eventNames.join(" ")
            };
        var eventData = function(e) {
                if (isPointerEvent(e) && isTouchEvent(e)) {
                    var touch = (e.originalEvent.originalEvent || e.originalEvent).changedTouches[0];
                    return {
                            x: touch.pageX,
                            y: touch.pageY,
                            time: e.timeStamp
                        }
                }
                if (isMouseEvent(e))
                    return {
                            x: e.pageX,
                            y: e.pageY,
                            time: e.timeStamp
                        };
                if (isTouchEvent(e)) {
                    var touch = (e.changedTouches || e.originalEvent.changedTouches)[0];
                    return {
                            x: touch.pageX,
                            y: touch.pageY,
                            time: e.timeStamp
                        }
                }
            };
        var eventDelta = function(from, to) {
                return {
                        x: to.x - from.x,
                        y: to.y - from.y,
                        time: to.time - from.time || 1
                    }
            };
        var hasTouches = function(e) {
                if (isTouchEvent(e))
                    return (e.originalEvent.touches || []).length;
                return 0
            };
        var needSkipEvent = function(e) {
                var $target = $(e.target),
                    touchInInput = $target.is("input, textarea, select");
                if (isMouseWheelEvent(e) && touchInInput)
                    return false;
                if (isMouseEvent(e))
                    return touchInInput || e.which > 1;
                if (isTouchEvent(e))
                    return touchInInput && $target.is(":focus") || (e.originalEvent.changedTouches || e.originalEvent.originalEvent.changedTouches).length !== 1
            };
        var createEvent = function(sourceEvent, props) {
                var event = $.Event(sourceEvent),
                    originalEvent = event.originalEvent,
                    propNames = $.event.props.slice();
                if (isMouseEvent(sourceEvent) || isTouchEvent(sourceEvent))
                    $.merge(propNames, $.event.mouseHooks.props);
                if (isKeyboardEvent(sourceEvent))
                    $.merge(propNames, $.event.keyHooks.props);
                if (originalEvent)
                    $.each(propNames, function() {
                        event[this] = originalEvent[this]
                    });
                if (props)
                    $.extend(event, props);
                return event
            };
        var fireEvent = function(props) {
                var event = createEvent(props.originalEvent, props);
                $.event.trigger(event, null, props.target || event.target);
                return event
            };
        var handleGestureEvent = function(e, type) {
                var gestureEvent = $(e.target).data("dxGestureEvent");
                if (!gestureEvent || gestureEvent === type) {
                    $(e.target).data("dxGestureEvent", type);
                    return true
                }
                return false
            };
        var registerEvent = function(eventName, eventObject) {
                var strategy = {};
                if ("noBubble" in eventObject)
                    strategy.noBubble = eventObject.noBubble;
                if ("bindType" in eventObject)
                    strategy.bindType = eventObject.bindType;
                if ("delegateType" in eventObject)
                    strategy.delegateType = eventObject.delegateType;
                $.each(["setup", "teardown", "add", "remove", "trigger", "handle", "_default", "dispose"], function(_, methodName) {
                    if (!eventObject[methodName])
                        return;
                    strategy[methodName] = function() {
                        var args = $.makeArray(arguments);
                        args.unshift(this);
                        return eventObject[methodName].apply(eventObject, args)
                    }
                });
                specialNS[eventName] = strategy
            };
        ui.events = {
            eventSource: eventSource,
            isPointerEvent: isPointerEvent,
            isMouseEvent: isMouseEvent,
            isTouchEvent: isTouchEvent,
            isKeyboardEvent: isKeyboardEvent,
            addNamespace: addNamespace,
            hasTouches: hasTouches,
            eventData: eventData,
            eventDelta: eventDelta,
            needSkipEvent: needSkipEvent,
            createEvent: createEvent,
            fireEvent: fireEvent,
            handleGestureEvent: handleGestureEvent,
            registerEvent: registerEvent
        }
    })(jQuery, DevExpress);
    /*! Module core, file ko.events.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko,
            events = DX.ui.events;
        var originalRegisterEvent = events.registerEvent;
        var registerKoEvent = function(eventName, eventObject) {
                originalRegisterEvent(eventName, eventObject);
                var koBindingEventName = events.addNamespace(eventName, eventName + "Binding");
                ko.bindingHandlers[eventName] = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                        var $element = $(element),
                            unwrappedValue = ko.utils.unwrapObservable(valueAccessor()),
                            eventSource = unwrappedValue.execute ? unwrappedValue.execute : unwrappedValue;
                        $element.off(koBindingEventName).on(koBindingEventName, $.isPlainObject(unwrappedValue) ? unwrappedValue : {}, function(e) {
                            eventSource(viewModel, e)
                        })
                    }}
            };
        $.extend(events, {registerEvent: registerKoEvent})
    })(jQuery, DevExpress);
    /*! Module core, file ng.events.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        var events = DX.ui.events;
        var originalRegisterEvent = events.registerEvent;
        var registerNgEvent = function(eventName, eventObject) {
                originalRegisterEvent(eventName, eventObject);
                var ngEventName = eventName.slice(0, 2) + eventName.charAt(2).toUpperCase() + eventName.slice(3);
                DX.ng.module.directive(ngEventName, ['$parse', function($parse) {
                        return function(scope, element, attr) {
                                var attrValue = $.trim(attr[ngEventName]),
                                    handler,
                                    eventOptions = {};
                                if (attrValue.charAt(0) === "{") {
                                    eventOptions = scope.$eval(attrValue);
                                    handler = $parse(eventOptions.execute)
                                }
                                else
                                    handler = $parse(attr[ngEventName]);
                                element.on(eventName, eventOptions, function(e) {
                                    scope.$apply(function() {
                                        handler(scope, {$event: e})
                                    })
                                })
                            }
                    }])
            };
        $.extend(events, {registerEvent: registerNgEvent})
    })(jQuery, DevExpress);
    /*! Module core, file ui.hierarchicalKeyDownProcessor.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        ui.HierarchicalKeyDownProcessor = DX.Class.inherit({
            _keydown: events.addNamespace("keydown", "HierarchicalKeyDownProcessor"),
            codes: {
                "9": "tab",
                "13": "enter",
                "27": "escape",
                "33": "pageUp",
                "34": "pageDown",
                "37": "leftArrow",
                "38": "upArrow",
                "39": "rightArrow",
                "40": "downArrow",
                "32": "space",
                "70": "F",
                "65": "A"
            },
            ctor: function(options) {
                var _this = this;
                options = options || {};
                if (options.element)
                    this._element = $(options.element);
                this._handler = options.handler;
                this._context = options.context;
                this._childProcessors = [];
                if (this._element)
                    this._element.on(this._keydown, function(e) {
                        _this.process(e)
                    })
            },
            dispose: function() {
                if (this._element)
                    this._element.off(this._keydown);
                this._element = undefined;
                this._handler = undefined;
                this._context = undefined;
                this._childProcessors = undefined
            },
            attachChildProcessor: function() {
                var childProcessor = new ui.HierarchicalKeyDownProcessor;
                this._childProcessors.push(childProcessor);
                return childProcessor
            },
            reinitialize: function(childHandler, childContext) {
                this._context = childContext;
                this._handler = childHandler;
                return this
            },
            process: function(e) {
                var args = {
                        key: this.codes[e.which],
                        ctrl: e.ctrlKey,
                        shift: e.shiftKey,
                        originalEvent: e
                    };
                if (this.codes[e.which] && this._handler && this._handler.call(this._context, args))
                    $.each(this._childProcessors, function(index, childProcessor) {
                        childProcessor.process(e)
                    })
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.dialog.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        var DEFAULT_BUTTON = {
                text: "OK",
                clickAction: function() {
                    return true
                }
            };
        var DX_DIALOG_CLASSNAME = "dx-dialog",
            DX_DIALOG_WRAPPER_CLASSNAME = DX_DIALOG_CLASSNAME + "-wrapper",
            DX_DIALOG_ROOT_CLASSNAME = DX_DIALOG_CLASSNAME + "-root",
            DX_DIALOG_CONTENT_CLASSNAME = DX_DIALOG_CLASSNAME + "-content",
            DX_DIALOG_MESSAGE_CLASSNAME = DX_DIALOG_CLASSNAME + "-message",
            DX_DIALOG_BUTTONS_CLASSNAME = DX_DIALOG_CLASSNAME + "-buttons",
            DX_DIALOG_BUTTON_CLASSNAME = DX_DIALOG_CLASSNAME + "-button";
        var FakeDialogComponent = DX.Component.inherit({
                NAME: "dxDialog",
                ctor: function(element, options) {
                    this.callBase(options)
                },
                _defaultOptionsRules: function() {
                    return this.callBase().slice(0).concat([{
                                device: [{platform: "ios"}, {platform: "ios7"}],
                                options: {width: 276}
                            }, {
                                device: {platform: "android"},
                                options: {
                                    lWidth: "60%",
                                    pWidth: "80%"
                                }
                            }, {
                                device: {
                                    platform: "win8",
                                    phone: false
                                },
                                options: {width: function() {
                                        return $(window).width()
                                    }}
                            }, {
                                device: {
                                    platform: "win8",
                                    phone: true
                                },
                                options: {position: {
                                        my: "top center",
                                        at: "top center",
                                        of: window,
                                        offset: "0 0"
                                    }}
                            }])
                }
            });
        var dialog = function(options) {
                var that = this,
                    result;
                if (!ui.dxPopup)
                    throw new Error("DevExpress.ui.dxPopup required");
                var deferred = $.Deferred();
                var defaultOptions = (new FakeDialogComponent).option();
                options = $.extend(defaultOptions, options);
                var $holder = $(DX.overlayTargetContainer());
                var $element = $("<div>").addClass(DX_DIALOG_CLASSNAME).appendTo($holder);
                var $message = $("<div>").addClass(DX_DIALOG_MESSAGE_CLASSNAME).html(String(options.message));
                var $buttons = $("<div>").addClass(DX_DIALOG_BUTTONS_CLASSNAME);
                var popupInstance = $element.dxPopup({
                        title: options.title || that.title,
                        height: "auto",
                        width: function() {
                            var isPortrait = $(window).height() > $(window).width(),
                                key = (isPortrait ? "p" : "l") + "Width",
                                widthOption = options.hasOwnProperty(key) ? options[key] : options["width"];
                            return $.isFunction(widthOption) ? widthOption() : widthOption
                        },
                        contentReadyAction: function() {
                            popupInstance.content().addClass(DX_DIALOG_CONTENT_CLASSNAME).append($message).append($buttons)
                        },
                        animation: {
                            show: {
                                type: "pop",
                                duration: 400
                            },
                            hide: {
                                type: "pop",
                                duration: 400,
                                to: {
                                    opacity: 0,
                                    scale: 0
                                },
                                from: {
                                    opacity: 1,
                                    scale: 1
                                }
                            }
                        },
                        rtlEnabled: DX.rtlEnabled
                    }).data("dxPopup");
                popupInstance._wrapper().addClass(DX_DIALOG_WRAPPER_CLASSNAME);
                if (options.position)
                    popupInstance.option("position", options.position);
                $.each(options.buttons || [DEFAULT_BUTTON], function() {
                    var button = $("<div>").addClass(DX_DIALOG_BUTTON_CLASSNAME).appendTo($buttons);
                    var action = new DX.Action(this.clickAction, {context: popupInstance});
                    button.dxButton($.extend(this, {clickAction: function() {
                            result = action.execute(arguments);
                            hide()
                        }}))
                });
                popupInstance._wrapper().addClass(DX_DIALOG_ROOT_CLASSNAME);
                function show() {
                    popupInstance.show();
                    utils.resetActiveElement();
                    return deferred.promise()
                }
                function hide(value) {
                    popupInstance.hide().done(function() {
                        popupInstance._element().remove()
                    });
                    deferred.resolve(result || value)
                }
                return {
                        show: show,
                        hide: hide
                    }
            };
        var alert = function(message, title) {
                var dialogInstance,
                    options = $.isPlainObject(message) ? message : {
                        title: title,
                        message: message
                    };
                dialogInstance = ui.dialog.custom(options);
                return dialogInstance.show()
            };
        var confirm = function(message, title) {
                var dialogInstance,
                    options = $.isPlainObject(message) ? message : {
                        title: title,
                        message: message,
                        buttons: [{
                                text: Globalize.localize("Yes"),
                                clickAction: function() {
                                    return true
                                }
                            }, {
                                text: Globalize.localize("No"),
                                clickAction: function() {
                                    return false
                                }
                            }]
                    };
                dialogInstance = ui.dialog.custom(options);
                return dialogInstance.show()
            };
        var notify = function(message, type, displayTime) {
                var options = $.isPlainObject(message) ? message : {message: message};
                if (!ui.dxToast) {
                    alert(options.message);
                    return
                }
                var userHiddenAction = options.hiddenAction;
                $.extend(options, {
                    type: type,
                    displayTime: displayTime,
                    hiddenAction: function(args) {
                        args.element.remove();
                        new DX.Action(userHiddenAction, {context: args.model}).execute(arguments)
                    }
                });
                $("<div>").appendTo(DX.overlayTargetContainer()).dxToast(options).dxToast("instance").show()
            };
        $.extend(ui, {
            notify: notify,
            dialog: {
                custom: dialog,
                alert: alert,
                confirm: confirm,
                FakeDialogComponent: FakeDialogComponent
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.dataHelper.js */
    (function($, DX, undefined) {
        var data = DX.data;
        var DATA_SOURCE_OPTIONS_METHOD = "_dataSourceOptions",
            DATA_SOURCE_CHANGED_METHOD = "_handleDataSourceChanged",
            DATA_SOURCE_LOAD_ERROR_METHOD = "_handleDataSourceLoadError",
            DATA_SOURCE_LOADING_CHANGED_METHOD = "_handleDataSourceLoadingChanged";
        DX.ui.DataHelperMixin = {
            ctor: function() {
                this.disposing.add(function() {
                    this._disposeDataSource()
                })
            },
            _refreshDataSource: function() {
                this._initDataSource();
                this._loadDataSource()
            },
            _initDataSource: function() {
                var dataSourceOptions = this.option("dataSource"),
                    widgetDataSourceOptions,
                    dataSourceType;
                this._disposeDataSource();
                if (dataSourceOptions) {
                    if (dataSourceOptions instanceof data.DataSource) {
                        this._isSharedDataSource = true;
                        this._dataSource = dataSourceOptions
                    }
                    else {
                        widgetDataSourceOptions = DATA_SOURCE_OPTIONS_METHOD in this ? this[DATA_SOURCE_OPTIONS_METHOD]() : {};
                        dataSourceType = this._dataSourceType ? this._dataSourceType() : data.DataSource;
                        this._dataSource = new dataSourceType($.extend(true, {}, widgetDataSourceOptions, data.utils.normalizeDataSourceOptions(dataSourceOptions)))
                    }
                    this._addDataSourceHandlers()
                }
            },
            _addDataSourceHandlers: function() {
                if (DATA_SOURCE_CHANGED_METHOD in this)
                    this._addDataSourceChangeHandler();
                if (DATA_SOURCE_LOAD_ERROR_METHOD in this)
                    this._addDataSourceLoadErrorHandler();
                if (DATA_SOURCE_LOADING_CHANGED_METHOD in this)
                    this._addDataSourceLoadingChangedHandler()
            },
            _addDataSourceChangeHandler: function() {
                var that = this,
                    dataSource = this._dataSource;
                this._dataSourceChangedHandler = function() {
                    that[DATA_SOURCE_CHANGED_METHOD](dataSource.items())
                };
                dataSource.changed.add(this._dataSourceChangedHandler)
            },
            _addDataSourceLoadErrorHandler: function() {
                this._dataSourceLoadErrorHandler = $.proxy(this[DATA_SOURCE_LOAD_ERROR_METHOD], this);
                this._dataSource.loadError.add(this._dataSourceLoadErrorHandler)
            },
            _addDataSourceLoadingChangedHandler: function() {
                this._dataSourceLoadingChangedHandler = $.proxy(this[DATA_SOURCE_LOADING_CHANGED_METHOD], this);
                this._dataSource.loadingChanged.add(this._dataSourceLoadingChangedHandler)
            },
            _loadDataSource: function() {
                if (this._dataSource) {
                    var dataSource = this._dataSource;
                    if (dataSource.isLoaded())
                        this._dataSourceChangedHandler();
                    else
                        dataSource.load()
                }
            },
            _loadSingle: function(key, value) {
                key = key === "this" ? this._dataSource.key() || "this" : key;
                return this._dataSource.loadSingle(key, value)
            },
            _disposeDataSource: function() {
                if (this._dataSource) {
                    if (this._isSharedDataSource) {
                        delete this._isSharedDataSource;
                        this._dataSource.changed.remove(this._dataSourceChangedHandler);
                        this._dataSource.loadError.remove(this._dataSourceLoadErrorHandler);
                        this._dataSource.loadingChanged.remove(this._dataSourceLoadingChangedHandler)
                    }
                    else
                        this._dataSource.dispose();
                    delete this._dataSource;
                    delete this._dataSourceChangedHandler;
                    delete this._dataSourceLoadErrorHandler;
                    delete this._dataSourceLoadingChangedHandler
                }
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.mspointer.js */
    (function($, DX, undefined) {
        var POINTER_TYPE_MAP = {
                2: "touch",
                3: "pen",
                4: "mouse"
            };
        var pointerEventHook = {
                filter: function(event, originalEvent) {
                    var pointerType = originalEvent.pointerType;
                    if ($.isNumeric(pointerType))
                        event.pointerType = POINTER_TYPE_MAP[pointerType];
                    return event
                },
                props: $.event.mouseHooks.props.concat(["pointerId", "originalTarget", "namespace", "width", "height", "pressure", "result", "tiltX", "charCode", "tiltY", "detail", "isPrimary", "prevValue"])
            };
        $.each(["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel", "MSPointerOver", "MSPointerOut", "MSPointerEnter", "MSPointerLeave", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout", "pointerenter", "pointerleave"], function() {
            $.event.fixHooks[this] = pointerEventHook
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.touch.js */
    (function($, DX, undefined) {
        var touchEventHook = {
                filter: function(event, originalEvent) {
                    if (originalEvent.changedTouches.length)
                        $.each(["pageX", "pageY", "screenX", "screenY", "clientX", "clientY"], function() {
                            event[this] = originalEvent.changedTouches[0][this]
                        });
                    return event
                },
                props: $.event.mouseHooks.props.concat(["touches", "changedTouches", "targetTouches", "detail", "result", "namespace", "originalTarget", "charCode", "prevValue"])
            };
        $.each(["touchstart", "touchmove", "touchend", "touchcancel"], function() {
            $.event.fixHooks[this] = touchEventHook
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            support = DX.support,
            device = $.proxy(DX.devices.real, DX.devices),
            events = ui.events;
        var POINTER_EVENTS_NAMESPACE = "dxPointerEvents",
            MouseStrategyEventMap = {
                dxpointerdown: "mousedown",
                dxpointermove: "mousemove",
                dxpointerup: "mouseup",
                dxpointercancel: ""
            },
            TouchStrategyEventMap = {
                dxpointerdown: "touchstart",
                dxpointermove: "touchmove",
                dxpointerup: "touchend",
                dxpointercancel: "touchcancel"
            },
            PointerStrategyEventMap = {
                dxpointerdown: "pointerdown",
                dxpointermove: "pointermove",
                dxpointerup: "pointerup",
                dxpointercancel: "pointercancel"
            },
            MouseAndTouchStrategyEventMap = {
                dxpointerdown: "touchstart mousedown",
                dxpointermove: "touchmove mousemove",
                dxpointerup: "touchend mouseup",
                dxpointercancel: "touchcancel"
            };
        var eventMap = function() {
                if (support.touch && !(device().tablet || device().phone))
                    return MouseAndTouchStrategyEventMap;
                if (support.touch)
                    return TouchStrategyEventMap;
                return MouseStrategyEventMap
            }();
        var skipTouchWithSameIdentifier = function(pointerEvent) {
                return device().platform === "ios" && (pointerEvent === "dxpointerdown" || pointerEvent === "dxpointerup")
            };
        var SingleEventStrategy = DX.Class.inherit({
                ctor: function(eventName, originalEvents) {
                    this._eventName = eventName;
                    this._eventNamespace = [POINTER_EVENTS_NAMESPACE, ".", this._eventName].join("");
                    this._originalEvents = originalEvents;
                    this._pointerId = 0;
                    this._handlerCount = 0
                },
                _handler: function(e) {
                    if (this._eventName === "dxpointerdown")
                        $(e.target).data("dxGestureEvent", null);
                    if (events.isTouchEvent(e) && skipTouchWithSameIdentifier(this._eventName)) {
                        var touch = e.changedTouches[0];
                        if (this._pointerId === touch.identifier && this._pointerId !== 0)
                            return;
                        this._pointerId = touch.identifier
                    }
                    return events.fireEvent({
                            type: this._eventName,
                            pointerType: events.eventSource(e),
                            originalEvent: e
                        })
                },
                setup: function() {
                    if (this._handlerCount > 0)
                        return;
                    $(document).on(events.addNamespace(this._originalEvents, this._eventNamespace), $.proxy(this._handler, this))
                },
                add: function() {
                    this._handlerCount++
                },
                remove: function() {
                    this._handlerCount--
                },
                teardown: function() {
                    if (this._handlerCount)
                        return;
                    $(document).off("." + this._eventNamespace)
                },
                dispose: function() {
                    $(document).off("." + this._eventNamespace)
                }
            });
        var MultiEventStrategy = SingleEventStrategy.inherit({
                EVENT_LOCK_TIMEOUT: 100,
                _handler: function(e) {
                    if (events.isTouchEvent(e))
                        this._skipNextEvents = true;
                    if (events.isMouseEvent(e) && this._mouseLocked)
                        return;
                    if (events.isMouseEvent(e) && this._skipNextEvents) {
                        this._skipNextEvents = false;
                        this._mouseLocked = true;
                        clearTimeout(this._unlockMouseTimer);
                        this._unlockMouseTimer = setTimeout($.proxy(function() {
                            this._mouseLocked = false
                        }, this), this.EVENT_LOCK_TIMEOUT);
                        return
                    }
                    return this.callBase(e)
                },
                dispose: function() {
                    this.callBase();
                    this._skipNextEvents = false;
                    this._mouseLocked = false;
                    clearTimeout(this._unlockMouseTimer)
                }
            });
        var getStrategy = function() {
                return eventMap === MouseAndTouchStrategyEventMap ? MultiEventStrategy : SingleEventStrategy
            };
        $.each(eventMap, function(pointerEvent, originalEvents) {
            var Strategy = getStrategy();
            events.registerEvent(pointerEvent, new Strategy(pointerEvent, originalEvents))
        });
        DX.ui.events.__internals = DX.ui.events.__internals || {};
        $.extend(DX.ui.events.__internals, {
            SingleEventStrategy: SingleEventStrategy,
            MultiEventStrategy: MultiEventStrategy,
            MouseStrategyEventMap: MouseStrategyEventMap,
            TouchStrategyEventMap: TouchStrategyEventMap,
            PointerStrategyEventMap: PointerStrategyEventMap,
            MouseAndTouchStrategyEventMap: MouseAndTouchStrategyEventMap,
            eventMap: eventMap
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.click.js */
    (function($, DX, wnd, undefined) {
        var ua = navigator.userAgent,
            screen = wnd.screen,
            ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            support = DX.support,
            device = $.proxy(DX.devices.real, DX.devices),
            EVENTS_NAME_SPACE = "dxSpecialEvents",
            CLICK_NAME_SPACE = "dxClick" + EVENTS_NAME_SPACE,
            CLICK_EVENT_NAME = "dxclick",
            SCROLLABLE_PARENT_DATA_KEY = "dxClickScrollableParent",
            SCROLLABLE_PARENT_SCROLL_OFFSET_DATA_KEY = "dxClickScrollableParentOffset",
            preferNativeClick = function() {
                var iPhone4SAndElder = device().deviceType === "phone" && screen.height <= 480,
                    iPad2AndElder = device().deviceType === "tablet" && wnd.devicePixelRatio < 2,
                    IOS7AndNewer = device().platform === "ios" && device().version[0] > 6;
                return IOS7AndNewer && (iPhone4SAndElder || iPad2AndElder)
            }(),
            useNativeClick = function() {
                if (!support.touch)
                    return true;
                var chromeInfo = ua.match(/Chrome\/([0-9]+)/) || [],
                    chrome = !!chromeInfo[0],
                    chromeVersion = ~~chromeInfo[1],
                    android = device().platform === "android";
                if (chrome)
                    if (android) {
                        if ($("meta[name=viewport][content*='width=device-width']").length)
                            return false;
                        if (chromeVersion > 31 && wnd.innerWidth <= screen.width)
                            return true;
                        if ($("meta[name=viewport][content*='user-scalable=no']").length)
                            return true
                    }
                    else
                        return true;
                return false
            }();
        var SimulatedStrategy = DX.Class.inherit({
                TOUCH_BOUNDARY: 10,
                ctor: function() {
                    this._startX = 0;
                    this._startY = 0;
                    this._handlerCount = 0;
                    this._target = null
                },
                _touchWasMoved: function(e) {
                    var boundary = this.TOUCH_BOUNDARY;
                    return Math.abs(e.pageX - this._startX) > boundary || Math.abs(e.pageY - this._startY) > boundary
                },
                _getClosestScrollable: function($element) {
                    var $scrollParent = $();
                    if ($element.data(SCROLLABLE_PARENT_DATA_KEY))
                        $scrollParent = $element.data(SCROLLABLE_PARENT_DATA_KEY);
                    else {
                        var $current = $element;
                        while ($current.length) {
                            if ($current[0].scrollHeight - $current[0].offsetHeight > 1) {
                                $scrollParent = $current;
                                $element.data(SCROLLABLE_PARENT_DATA_KEY, $scrollParent);
                                break
                            }
                            $current = $current.parent()
                        }
                    }
                    return $scrollParent
                },
                _saveClosestScrollableOffset: function($element) {
                    var $scrollable = this._getClosestScrollable($element);
                    if ($scrollable.length)
                        $element.data(SCROLLABLE_PARENT_SCROLL_OFFSET_DATA_KEY, $scrollable.scrollTop())
                },
                _closestScrollableWasMoved: function($element) {
                    var $scrollable = $element.data(SCROLLABLE_PARENT_DATA_KEY);
                    return $scrollable && $scrollable.scrollTop() !== $element.data(SCROLLABLE_PARENT_SCROLL_OFFSET_DATA_KEY)
                },
                _hasClosestScrollable: function($element) {
                    var $scrollable = this._getClosestScrollable($element);
                    if (!$scrollable.length)
                        return false;
                    if ($scrollable.is("body"))
                        return false;
                    if ($scrollable === window)
                        return false;
                    if ($scrollable.css("overflow") === "hidden")
                        return false;
                    return true
                },
                _handleStart: function(e) {
                    this._reset();
                    if (events.isMouseEvent(e) && e.which !== 1)
                        return;
                    this._saveClosestScrollableOffset($(e.target));
                    this._target = e.target;
                    this._startX = e.pageX;
                    this._startY = e.pageY
                },
                _handleEnd: function(e) {
                    var $target = $(e.target);
                    if (!$target.is(this._target) || this._touchWasMoved(e))
                        return;
                    if (this._nativeClickShouldBeUsed($target) || this._closestScrollableWasMoved($target))
                        return;
                    var targetIsInput = $target.is("input, textarea");
                    if (!targetIsInput && !e.dxPreventBlur)
                        utils.resetActiveElement();
                    this._fireClickEvent(e)
                },
                _handleCancel: function(e) {
                    this._reset()
                },
                _reset: function() {
                    this._target = null
                },
                _handleClick: function(e) {
                    var $target = $(e.target);
                    if ($target.is(this._target)) {
                        if (this._nativeClickShouldBeUsed($target))
                            this._fireClickEvent(e)
                    }
                    else if ($target.is("input, textarea"))
                        utils.resetActiveElement()
                },
                _nativeClickShouldBeUsed: function($target) {
                    return preferNativeClick && this._hasClosestScrollable($target)
                },
                _fireClickEvent: function(e) {
                    if (events.handleGestureEvent(e, CLICK_EVENT_NAME))
                        events.fireEvent({
                            type: CLICK_EVENT_NAME,
                            originalEvent: e
                        })
                },
                _makeElementClickable: function($element) {
                    if (!$element.attr("onclick"))
                        $element.attr("onclick", "void(0)")
                },
                setup: function(element) {
                    var $element = $(element);
                    this._makeElementClickable($element);
                    if (this._handlerCount > 0)
                        return;
                    var $doc = $(document).on(events.addNamespace("dxpointerdown", CLICK_NAME_SPACE), $.proxy(this._handleStart, this)).on(events.addNamespace("dxpointerup", CLICK_NAME_SPACE), $.proxy(this._handleEnd, this)).on(events.addNamespace("dxpointercancel", CLICK_NAME_SPACE), $.proxy(this._handleCancel, this)).on(events.addNamespace("click", CLICK_NAME_SPACE), $.proxy(this._handleClick, this))
                },
                add: function() {
                    this._handlerCount++
                },
                remove: function() {
                    this._handlerCount--
                },
                teardown: function(element) {
                    if (this._handlerCount)
                        return;
                    $(element).off("." + CLICK_NAME_SPACE);
                    this.dispose()
                },
                dispose: function() {
                    $(document).off("." + CLICK_NAME_SPACE)
                }
            });
        var NativeStrategy = DX.Class.inherit({
                bindType: "click",
                delegateType: "click",
                handle: function(element, event) {
                    event.type = "dxclick";
                    if (events.handleGestureEvent(event, CLICK_EVENT_NAME))
                        return event.handleObj.handler.call(element, event)
                }
            });
        events.registerEvent(CLICK_EVENT_NAME, new(useNativeClick ? NativeStrategy : SimulatedStrategy));
        DX.ui.events.__internals = DX.ui.events.__internals || {};
        $.extend(DX.ui.events.__internals, {
            NativeClickStrategy: NativeStrategy,
            SimulatedClickStrategy: SimulatedStrategy,
            preferNativeClickAccessor: function(value) {
                if (!arguments.length)
                    return preferNativeClick;
                preferNativeClick = value
            }
        })
    })(jQuery, DevExpress, window);
    /*! Module core, file ui.events.hold.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            jqSpecialEvent = $.event.special,
            EVENTS_NAME_SPACE = "dxSpecialEvents",
            HOLD_NAME_SPACE = "dxHold",
            HOLD_EVENT_NAME = "dxhold",
            HOLD_TIMER_DATA_KEY = EVENTS_NAME_SPACE + "HoldTimer";
        var Hold = DX.Class.inherit({
                HOLD_TIMEOUT: 750,
                TOUCH_BOUNDARY: 5,
                _startX: 0,
                _startY: 0,
                _touchWasMoved: function(e) {
                    var boundary = this.TOUCH_BOUNDARY;
                    return Math.abs(e.pageX - this._startX) > boundary || Math.abs(e.pageY - this._startY) > boundary
                },
                setup: function(element, data) {
                    var $target,
                        holdInited = false;
                    var handleStart = function(e) {
                            if (holdInited)
                                return;
                            $target = $(e.target);
                            holdInited = true;
                            if ($target.data(HOLD_TIMER_DATA_KEY))
                                return;
                            this._startX = e.pageX;
                            this._startY = e.pageY;
                            var holdTimeout = data && "timeout" in data ? data.timeout : this.HOLD_TIMEOUT;
                            var holdTimer = setTimeout(function() {
                                    $target.removeData(HOLD_TIMER_DATA_KEY);
                                    if (events.handleGestureEvent(e, HOLD_EVENT_NAME))
                                        events.fireEvent({
                                            type: HOLD_EVENT_NAME,
                                            originalEvent: e
                                        })
                                }, holdTimeout);
                            $target.data(HOLD_TIMER_DATA_KEY, holdTimer)
                        };
                    var handleMove = function(e) {
                            if (!this._touchWasMoved(e))
                                return;
                            handleEnd()
                        };
                    var handleEnd = function() {
                            if ($target) {
                                clearTimeout($target.data(HOLD_TIMER_DATA_KEY));
                                $target.removeData(HOLD_TIMER_DATA_KEY);
                                $target = null;
                                holdInited = false
                            }
                        };
                    $(element).on(events.addNamespace("dxpointerdown", HOLD_NAME_SPACE), $.proxy(handleStart, this)).on(events.addNamespace("dxpointermove", HOLD_NAME_SPACE), $.proxy(handleMove, this)).on(events.addNamespace("dxpointerup", HOLD_NAME_SPACE), $.proxy(handleEnd, this))
                },
                teardown: function(element) {
                    element = $(element);
                    clearTimeout(element.data(HOLD_TIMER_DATA_KEY));
                    element.removeData(HOLD_TIMER_DATA_KEY).off("." + HOLD_NAME_SPACE)
                }
            });
        events.registerEvent(HOLD_EVENT_NAME, new Hold)
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.hover.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var HOVER_EVENTS_NAMESPACE = "dxSpecialEvents",
            HOVER_START = "dxhoverstart",
            HOVER_END = "dxhoverend",
            MOUSE_ENTER = "mouseenter",
            MOUSE_LEAVE = "mouseleave",
            TOUCH_START = "dxpointerdown";
        var HoverStart = DX.Class.inherit({
                ctor: function() {
                    this._wasTouch = false;
                    this._selector = undefined
                },
                setup: function(element, data) {
                    var $element = $(element);
                    this._selector = data ? data.selector : undefined;
                    if (!!$element.data("dxHoverStart"))
                        return;
                    $element.data("dxHoverStart", true).on(events.addNamespace(MOUSE_ENTER, HOVER_EVENTS_NAMESPACE), this._selector, $.proxy(this._handleEnter, this)).on(events.addNamespace(TOUCH_START, HOVER_EVENTS_NAMESPACE), $.proxy(this._handleTouchStart, this))
                },
                _handleEnter: function(e) {
                    if (!this._wasTouch)
                        events.fireEvent({
                            type: HOVER_START,
                            originalEvent: e
                        })
                },
                _handleTouchStart: function(e) {
                    this._wasTouch = events.isTouchEvent(e)
                },
                teardown: function(element) {
                    $(element).data("dxHoverStart", false).off(events.addNamespace(MOUSE_ENTER, HOVER_EVENTS_NAMESPACE), this._selector).off(events.addNamespace(TOUCH_START, HOVER_EVENTS_NAMESPACE))
                }
            });
        var HoverEnd = DX.Class.inherit({
                ctor: function() {
                    this._wasTouch = false;
                    this._selector = undefined
                },
                setup: function(element, data) {
                    var $element = $(element);
                    this._selector = data ? data.selector : undefined;
                    if (!!$element.data("dxHoverEnd"))
                        return;
                    $element.data("dxHoverEnd", true).on(events.addNamespace(MOUSE_LEAVE, HOVER_EVENTS_NAMESPACE), this._selector, $.proxy(this._handleLeave, this)).on(events.addNamespace(TOUCH_START, HOVER_EVENTS_NAMESPACE), $.proxy(this._handleTouchStart, this))
                },
                _handleLeave: function(e) {
                    if (!this._wasTouch)
                        events.fireEvent({
                            type: HOVER_END,
                            originalEvent: e
                        })
                },
                _handleTouchStart: function(e) {
                    this._wasTouch = events.isTouchEvent(e)
                },
                teardown: function(element) {
                    $(element).data("dxHoverEnd", false).off(events.addNamespace(MOUSE_LEAVE, HOVER_EVENTS_NAMESPACE), this._selector).off(events.addNamespace(TOUCH_START, HOVER_EVENTS_NAMESPACE))
                }
            });
        events.registerEvent(HOVER_START, new HoverStart);
        events.registerEvent(HOVER_END, new HoverEnd)
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.wheel.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var EVENT_NAME = "dxmousewheel",
            EVENT_NAMESPACE = "dxWheel";
        var WHEEL_DISTANCE = 10;
        $.event.fixHooks["wheel"] = $.event.mouseHooks;
        var wheelEvent = document.onmousewheel !== undefined ? "mousewheel" : "wheel";
        var wheel = {
                setup: function(element, data) {
                    var $element = $(element);
                    $element.on(events.addNamespace(wheelEvent, EVENT_NAMESPACE), $.proxy(wheel._handleWheel, wheel))
                },
                teardown: function(element) {
                    var $element = $(element);
                    $element.off("." + EVENT_NAMESPACE)
                },
                _handleWheel: function(e) {
                    $(e.target).data("dxGestureEvent", null);
                    var delta = this._getWheelDelta(e.originalEvent);
                    events.fireEvent({
                        type: EVENT_NAME,
                        originalEvent: e,
                        delta: delta
                    });
                    e.stopPropagation()
                },
                _getWheelDelta: function(event) {
                    return event.wheelDelta / 60 || -event.deltaY
                }
            };
        events.registerEvent(EVENT_NAME, wheel)
    })(jQuery, DevExpress);
    /*! Module core, file ui.gestureEmitter.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var GestureEmitter = DX.Class.inherit({
                ctor: function(element) {
                    this._$element = $(element);
                    this._cancelCallback = $.Callbacks()
                },
                getElement: function() {
                    return this._$element
                },
                getDirection: function() {
                    return this.direction
                },
                validate: function(e) {
                    return e.type !== "dxmousewheel"
                },
                configurate: function(data) {
                    $.extend(this, data)
                },
                addCancelCallback: function(callback) {
                    this._cancelCallback.add(callback)
                },
                removeCancelCallback: function() {
                    this._cancelCallback.empty()
                },
                init: $.noop,
                start: $.noop,
                move: $.noop,
                end: $.noop,
                cancel: $.noop,
                wheel: $.noop,
                _fireEvent: function(eventName, event, params) {
                    var eventData = {
                            type: eventName,
                            originalEvent: event,
                            target: this.getElement().get(0)
                        };
                    event = events.fireEvent($.extend(eventData, params));
                    if (event.cancel)
                        this._cancel(event);
                    return event
                },
                _cancel: function(e) {
                    this._cancelCallback.fire()
                }
            });
        var gestureEmitters = [];
        $.extend(ui, {
            GestureEmitter: GestureEmitter,
            gestureEmitters: gestureEmitters
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.scrollEmitter.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SCROLL_INIT_EVENT = "dxscrollinit",
            SCROLL_START_EVENT = "dxscrollstart",
            SCROLL_MOVE_EVENT = "dxscroll",
            SCROLL_END_EVENT = "dxscrollend",
            SCROLL_STOP_EVENT = "dxscrollstop",
            SCROLL_CANCEL_EVENT = "dxscrollcancel",
            SCROLL_WHEEL_EVENT = "dxscrollwheel",
            INERTIA_TIMEOUT = 100,
            VELOCITY_CALC_TIMEOUT = 200,
            FRAME_DURATION = Math.round(1000 / 60);
        var ScrollEmitter = ui.GestureEmitter.inherit({
                ctor: function(element) {
                    this.callBase(element);
                    this.direction = "vertical"
                },
                init: function(e) {
                    this._savedEventData = this._prevEventData = events.eventData(e);
                    this._fireEvent(SCROLL_INIT_EVENT, e)
                },
                start: function(e) {
                    this._fireEvent(SCROLL_START_EVENT, e, {delta: events.eventDelta(this._prevEventData, events.eventData(e))})
                },
                move: function(e) {
                    var currentEventData = events.eventData(e);
                    this._fireEvent(SCROLL_MOVE_EVENT, e, {delta: events.eventDelta(this._prevEventData, currentEventData)});
                    var eventDelta = events.eventDelta(this._savedEventData, currentEventData);
                    if (eventDelta.time > VELOCITY_CALC_TIMEOUT)
                        this._savedEventData = this._prevEventData;
                    this._prevEventData = currentEventData
                },
                end: function(e) {
                    var endEventDelta = events.eventDelta(this._prevEventData, events.eventData(e));
                    var velocity = {
                            x: 0,
                            y: 0
                        };
                    if (endEventDelta.time < INERTIA_TIMEOUT) {
                        var deltaEventData = events.eventDelta(this._savedEventData, this._prevEventData);
                        velocity = {
                            x: deltaEventData.x * FRAME_DURATION / deltaEventData.time,
                            y: deltaEventData.y * FRAME_DURATION / deltaEventData.time
                        }
                    }
                    this._fireEvent(SCROLL_END_EVENT, e, {velocity: velocity})
                },
                stop: function(e) {
                    this._fireEvent(SCROLL_STOP_EVENT, e)
                },
                cancel: function(e) {
                    this._fireEvent(SCROLL_CANCEL_EVENT, e)
                },
                wheel: function(e) {
                    this._fireEvent(SCROLL_WHEEL_EVENT, e, {delta: e.delta})
                }
            });
        ui.gestureEmitters.push({
            emitter: ScrollEmitter,
            events: [SCROLL_INIT_EVENT, SCROLL_START_EVENT, SCROLL_MOVE_EVENT, SCROLL_END_EVENT, SCROLL_STOP_EVENT, SCROLL_CANCEL_EVENT, SCROLL_WHEEL_EVENT]
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.swipeEmitter.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            SWIPE_START_EVENT = "dxswipestart",
            SWIPE_EVENT = "dxswipe",
            SWIPE_END_EVENT = "dxswipeend";
        var HorizontalStrategy = {
                defaultItemSizeFunc: function() {
                    return this.getElement().width()
                },
                getBounds: function() {
                    return [this._maxLeftOffset, this._maxRightOffset]
                },
                calcOffsetRatio: function(e) {
                    var endEventData = events.eventData(e);
                    return (endEventData.x - (this._startEventData && this._startEventData.x || 0)) / this._itemSizeFunc().call(this, e)
                },
                isFastSwipe: function(e) {
                    var endEventData = events.eventData(e);
                    return this.FAST_SWIPE_SPEED_LIMIT * Math.abs(endEventData.x - this._tickData.x) >= endEventData.time - this._tickData.time
                }
            };
        var VerticalStrategy = {
                defaultItemSizeFunc: function() {
                    return this.getElement().height()
                },
                getBounds: function() {
                    return [this._maxTopOffset, this._maxBottomOffset]
                },
                calcOffsetRatio: function(e) {
                    var endEventData = events.eventData(e);
                    return (endEventData.y - (this._startEventData && this._startEventData.y || 0)) / this._itemSizeFunc().call(this, e)
                },
                isFastSwipe: function(e) {
                    var endEventData = events.eventData(e);
                    return this.FAST_SWIPE_SPEED_LIMIT * Math.abs(endEventData.y - this._tickData.y) >= endEventData.time - this._tickData.time
                }
            };
        var STRATEGIES = {
                horizontal: HorizontalStrategy,
                vertical: VerticalStrategy
            };
        var SwipeEmitter = ui.GestureEmitter.inherit({
                TICK_INTERVAL: 300,
                FAST_SWIPE_SPEED_LIMIT: 5,
                ctor: function(element) {
                    this.callBase(element);
                    this.direction = "horizontal";
                    this.elastic = true
                },
                _getStrategy: function() {
                    return STRATEGIES[this.direction]
                },
                _defaultItemSizeFunc: function() {
                    return this._getStrategy().defaultItemSizeFunc.call(this)
                },
                _itemSizeFunc: function() {
                    return this.itemSizeFunc || this._defaultItemSizeFunc
                },
                init: function(e) {
                    this._startEventData = events.eventData(e);
                    this._tickData = {time: 0}
                },
                start: function(e) {
                    e = this._fireEvent(SWIPE_START_EVENT, e);
                    if (!e.cancel) {
                        this._maxLeftOffset = e.maxLeftOffset;
                        this._maxRightOffset = e.maxRightOffset;
                        this._maxTopOffset = e.maxTopOffset;
                        this._maxBottomOffset = e.maxBottomOffset
                    }
                },
                move: function(e) {
                    var strategy = this._getStrategy(),
                        moveEventData = events.eventData(e),
                        offset = strategy.calcOffsetRatio.call(this, e);
                    offset = this._fitOffset(offset, this.elastic);
                    if (moveEventData.time - this._tickData.time > this.TICK_INTERVAL)
                        this._tickData = moveEventData;
                    this._fireEvent(SWIPE_EVENT, e, {offset: offset});
                    e.preventDefault()
                },
                end: function(e) {
                    var strategy = this._getStrategy(),
                        offsetRatio = strategy.calcOffsetRatio.call(this, e),
                        isFast = strategy.isFastSwipe.call(this, e),
                        startOffset = offsetRatio,
                        targetOffset = this._calcTargetOffset(offsetRatio, isFast);
                    startOffset = this._fitOffset(startOffset, this.elastic);
                    targetOffset = this._fitOffset(targetOffset, false);
                    this._fireEvent(SWIPE_END_EVENT, e, {
                        offset: startOffset,
                        targetOffset: targetOffset
                    })
                },
                _fitOffset: function(offset, elastic) {
                    var strategy = this._getStrategy(),
                        bounds = strategy.getBounds.call(this);
                    if (offset < -bounds[0])
                        return elastic ? (-2 * bounds[0] + offset) / 3 : -bounds[0];
                    if (offset > bounds[1])
                        return elastic ? (2 * bounds[1] + offset) / 3 : bounds[1];
                    return offset
                },
                _calcTargetOffset: function(offsetRatio, isFast) {
                    var result;
                    if (isFast) {
                        result = Math.ceil(Math.abs(offsetRatio));
                        if (offsetRatio < 0)
                            result = -result
                    }
                    else
                        result = Math.round(offsetRatio);
                    return result
                }
            });
        ui.gestureEmitters.push({
            emitter: SwipeEmitter,
            events: [SWIPE_START_EVENT, SWIPE_EVENT, SWIPE_END_EVENT]
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.dragEmitter.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            wrapToArray = utils.wrapToArray;
        var DRAG_START_EVENT = "dxdragstart",
            DRAG_EVENT = "dxdrag",
            DRAG_END_EVENT = "dxdragend",
            DRAG_ENTER_EVENT = "dxdragenter",
            DRAG_LEAVE_EVENT = "dxdragleave",
            DROP_EVENT = "dxdrop";
        var knownDropTargets = [],
            knownDropTargetConfigs = [];
        var dropTargetRegistration = {
                setup: function(element, data) {
                    var knownDropTarget = $.inArray(element, knownDropTargets) !== -1;
                    if (!knownDropTarget) {
                        knownDropTargets.push(element);
                        knownDropTargetConfigs.push(data || {})
                    }
                },
                teardown: function(element, data) {
                    var elementEvents = $._data(element, "events"),
                        handlersCount = 0;
                    $.each([DRAG_ENTER_EVENT, DRAG_LEAVE_EVENT, DROP_EVENT], function(_, eventName) {
                        var eventHandlers = elementEvents[eventName];
                        if (eventHandlers)
                            handlersCount += eventHandlers.length
                    });
                    if (!handlersCount) {
                        var index = $.inArray(element, knownDropTargets);
                        knownDropTargets.splice(index, 1);
                        knownDropTargetConfigs.splice(index, 1)
                    }
                }
            };
        events.registerEvent(DRAG_ENTER_EVENT, dropTargetRegistration);
        events.registerEvent(DRAG_LEAVE_EVENT, dropTargetRegistration);
        events.registerEvent(DROP_EVENT, dropTargetRegistration);
        var getItemConfig = function($element) {
                var dropTargetIndex = $.inArray($element.get(0), knownDropTargets);
                return knownDropTargetConfigs[dropTargetIndex]
            };
        var getItemPosition = function($element) {
                var dropTargetConfig = getItemConfig($element);
                if (dropTargetConfig.itemPositionFunc)
                    return dropTargetConfig.itemPositionFunc();
                else
                    return $element.offset()
            };
        var getItemSize = function($element) {
                var dropTargetConfig = getItemConfig($element);
                if (dropTargetConfig.itemSizeFunc)
                    return dropTargetConfig.itemSizeFunc();
                else
                    return {
                            width: $element.width(),
                            height: $element.height()
                        }
            };
        var DragEmitter = ui.GestureEmitter.inherit({
                ctor: function(element) {
                    this.callBase(element);
                    this.direction = "both"
                },
                init: function(e) {
                    var eventData = events.eventData(e);
                    this._startEventData = eventData
                },
                start: function(e) {
                    e = this._fireEvent(DRAG_START_EVENT, e);
                    this._maxLeftOffset = e.maxLeftOffset;
                    this._maxRightOffset = e.maxRightOffset;
                    this._maxTopOffset = e.maxTopOffset;
                    this._maxBottomOffset = e.maxBottomOffset;
                    var dropTargets = wrapToArray(e.targetElements || knownDropTargets);
                    this._$dropTargetElements = $.map(dropTargets, function(element) {
                        return $(element)
                    })
                },
                move: function(e) {
                    var eventData = events.eventData(e),
                        dragOffset = this._calculateOffset(eventData);
                    this._fireEvent(DRAG_EVENT, e, {offset: dragOffset});
                    this._processDropTargets(e, dragOffset);
                    e.preventDefault()
                },
                _calculateOffset: function(eventData) {
                    return {
                            x: this._calculateXOffset(eventData),
                            y: this._calculateYOffset(eventData)
                        }
                },
                _calculateXOffset: function(eventData) {
                    if (this.direction !== "vertical") {
                        var offset = eventData.x - this._startEventData.x;
                        return this._fitOffset(offset, this._maxLeftOffset, this._maxRightOffset)
                    }
                    return 0
                },
                _calculateYOffset: function(eventData) {
                    if (this.direction !== "horizontal") {
                        var offset = eventData.y - this._startEventData.y;
                        return this._fitOffset(offset, this._maxTopOffset, this._maxBottomOffset)
                    }
                    return 0
                },
                _fitOffset: function(offset, minOffset, maxOffset) {
                    if (minOffset != null)
                        offset = Math.max(offset, -minOffset);
                    if (maxOffset != null)
                        offset = Math.min(offset, maxOffset);
                    return offset
                },
                _processDropTargets: function(e, dragOffset) {
                    var target = this._findDropTarget(e),
                        sameTarget = target === this._$currentDropTarget;
                    if (!sameTarget) {
                        this._fireDropTargetEvent(e, DRAG_LEAVE_EVENT);
                        this._$currentDropTarget = target;
                        this._fireDropTargetEvent(e, DRAG_ENTER_EVENT)
                    }
                },
                _fireDropTargetEvent: function(event, eventName) {
                    if (!this._$currentDropTarget)
                        return;
                    var eventData = {
                            type: eventName,
                            originalEvent: event,
                            draggingElement: this._$element.get(0),
                            target: this._$currentDropTarget.get(0)
                        };
                    events.fireEvent(eventData)
                },
                _findDropTarget: function(e) {
                    var that = this,
                        $result;
                    $.each(this._$dropTargetElements, function(_, $target) {
                        if (that._checkDropTarget($target, e)) {
                            $result = $target;
                            return false
                        }
                    });
                    return $result
                },
                _checkDropTarget: function($target, e) {
                    var isDraggingElement = $target.get(0) === this._$element.get(0);
                    if (isDraggingElement)
                        return false;
                    var targetPosition = getItemPosition($target);
                    if (e.pageX < targetPosition.left)
                        return false;
                    if (e.pageY < targetPosition.top)
                        return false;
                    var targetSize = getItemSize($target);
                    if (e.pageX > targetPosition.left + targetSize.width)
                        return false;
                    if (e.pageY > targetPosition.top + targetSize.height)
                        return false;
                    return $target
                },
                end: function(e) {
                    var eventData = events.eventData(e);
                    this._fireEvent(DRAG_END_EVENT, e, {offset: this._calculateOffset(eventData)});
                    this._fireDropTargetEvent(e, DROP_EVENT);
                    delete this._$currentDropTarget
                }
            });
        ui.gestureEmitters.push({
            emitter: DragEmitter,
            events: [DRAG_START_EVENT, DRAG_EVENT, DRAG_END_EVENT]
        });
        DX.ui.events.__internals = DX.ui.events.__internals || {};
        $.extend(DX.ui.events.__internals, {dropTargets: knownDropTargets})
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.gesture.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var abs = Math.abs;
        var GESTURE_EVENT = "dxGesture",
            GESTURE_EVENT_DATA = "dxGestureEmitter",
            GESTURE_LOCK_KEY = "dxGestureLock",
            GESTURE_UNLOCK_TIMEOUT = 400,
            TOUCH_BOUNDARY = 10,
            HORIZONTAL = "horizontal",
            VERTICAL = "vertical",
            BOTH = "both";
        var GestureEventManager = DX.Class.inherit({
                SLEEP: 0,
                INITED: 1,
                STARTED: 2,
                ctor: function() {
                    this._attachHandlers();
                    this.reset()
                },
                _attachHandlers: function() {
                    $(document).on(events.addNamespace("dxpointerdown", GESTURE_EVENT), $.proxy(this._handlePointerDown, this)).on(events.addNamespace("dxpointermove", GESTURE_EVENT), $.proxy(this._handlePointerMove, this)).on(events.addNamespace("dxpointerup dxpointercancel", GESTURE_EVENT), $.proxy(this._handlePointerUp, this)).on(events.addNamespace("dxmousewheel", GESTURE_EVENT), $.proxy(this._handleMouseWheel, this))
                },
                _eachEmitter: function(callback) {
                    $.each(this._activeEmitters || {}, function(direction, emitter) {
                        return callback(emitter, direction)
                    })
                },
                _noEmitters: function() {
                    return $.isEmptyObject(this._activeEmitters)
                },
                reset: function() {
                    this._eachEmitter(function(emitter) {
                        emitter.removeCancelCallback()
                    });
                    this._forgetGesture();
                    this._stage = this.SLEEP;
                    this._activeEmitters = {}
                },
                _handlePointerDown: function(e) {
                    if (events.needSkipEvent(e) || events.hasTouches(e) > 1)
                        return;
                    this.reset();
                    this._activeEmitters = this._closestEmitter(e);
                    if (this._noEmitters())
                        return;
                    this._startEvent = e;
                    this._startEventData = events.eventData(e);
                    this._stage = this.INITED;
                    this._applyToActive("init", e)
                },
                _applyToActive: function(method) {
                    var args = $.makeArray(arguments).slice(1);
                    this._eachEmitter(function(emitter) {
                        if (method in emitter)
                            emitter[method].apply(emitter, args)
                    })
                },
                _closestEmitter: function(e) {
                    var result = {},
                        foundForAllDirections = false,
                        $element = $(e.target);
                    while ($element.length && !foundForAllDirections) {
                        var emitter = $element.data(GESTURE_EVENT_DATA);
                        if (emitter && emitter.validate(e)) {
                            var direction = emitter.getDirection(e);
                            if (direction) {
                                emitter.addCancelCallback($.proxy(this._handleCancel, this, emitter, e));
                                result[direction] = result[direction] || emitter
                            }
                        }
                        foundForAllDirections = result[HORIZONTAL] && result[VERTICAL] || result[BOTH];
                        $element = $element.parent()
                    }
                    return result
                },
                _handleCancel: function(canceledEmitter, e) {
                    var canceledDirection;
                    this._eachEmitter(function(emitter, direction) {
                        if (emitter === canceledEmitter) {
                            canceledDirection = direction;
                            emitter.removeCancelCallback()
                        }
                    });
                    this._forgetGesture([canceledEmitter]);
                    this._cancelEmitter(canceledEmitter, e);
                    if (this._noEmitters())
                        this.reset()
                },
                _handlePointerMove: function(e) {
                    if (this._stage === this.INITED && this._directionDetected(e))
                        this._handleStart(e);
                    if (this._stage === this.STARTED)
                        this._handleMove(e)
                },
                _directionDetected: function(e) {
                    var delta = events.eventDelta(this._startEventData, events.eventData(e));
                    return delta.x || delta.y
                },
                _handleStart: function(e) {
                    this._filterEmitters(e);
                    if (this._noEmitters())
                        return;
                    this._resetActiveElement();
                    this._applyToActive("start", this._startEvent);
                    this._stage = this.STARTED
                },
                _resetActiveElement: function() {
                    if (DX.devices.real().platform !== "ios")
                        return;
                    this._eachEmitter(function(emitter) {
                        if ($(":focus", emitter.getElement()).length)
                            utils.resetActiveElement()
                    })
                },
                _filterEmitters: function(e) {
                    this._filterByDirection(e);
                    if (this._emitersAmount() > 1)
                        this._takeFirstEmitter()
                },
                _emitersAmount: function() {
                    var result = 0;
                    this._eachEmitter(function() {
                        result++
                    });
                    return result
                },
                _filterByDirection: function(e) {
                    var delta = events.eventDelta(this._startEventData, events.eventData(e)),
                        horizontalMove = abs(delta.y) < abs(delta.x),
                        verticalMove = abs(delta.y) > abs(delta.x),
                        horizontalEmmiter = this._activeEmitters[HORIZONTAL],
                        verticalEmmiter = this._activeEmitters[VERTICAL],
                        bothEmitter = this._activeEmitters[BOTH],
                        existsHorizontalEmitter = horizontalEmmiter || bothEmitter,
                        existsVerticalEmitter = verticalEmmiter || bothEmitter;
                    if (horizontalMove && existsHorizontalEmitter)
                        this._cancelEmitter(verticalEmmiter, e);
                    else if (verticalMove && existsVerticalEmitter)
                        this._cancelEmitter(horizontalEmmiter, e)
                },
                _cancelEmitter: function(canceledEmmiter, e) {
                    if (!canceledEmmiter)
                        return;
                    canceledEmmiter.cancel(e);
                    delete this._activeEmitters[canceledEmmiter.getDirection(e)]
                },
                _takeFirstEmitter: function() {
                    var activeEmitters = {};
                    this._eachEmitter(function(emitter, direction) {
                        activeEmitters[direction] = emitter;
                        return false
                    });
                    this._activeEmitters = activeEmitters
                },
                _prepareGesture: function() {
                    this._gestureLocked = true;
                    clearTimeout(this._gestureEndTimer);
                    this._eachEmitter(function(emitter) {
                        emitter.getElement().data(GESTURE_LOCK_KEY, true)
                    });
                    ui.feedback.reset()
                },
                _handleMove: function(e) {
                    if (!this._gestureLocked) {
                        var delta = events.eventDelta(this._startEventData, events.eventData(e));
                        if (abs(delta.x) > TOUCH_BOUNDARY || abs(delta.y) > TOUCH_BOUNDARY) {
                            events.handleGestureEvent(e, GESTURE_EVENT);
                            this._prepareGesture()
                        }
                    }
                    this._applyToActive("move", e)
                },
                _forgetGesture: function(activeEmitters) {
                    activeEmitters = activeEmitters || this._activeEmitters;
                    if (this._noEmitters())
                        return;
                    this._gestureLocked = false;
                    this._gestureEndTimer = setTimeout(function() {
                        $.each(activeEmitters, function(_, emitter) {
                            emitter.getElement().data(GESTURE_LOCK_KEY, false)
                        })
                    }, GESTURE_UNLOCK_TIMEOUT)
                },
                _handlePointerUp: function(e) {
                    if (!DX.devices.isRippleEmulator() && events.hasTouches(e))
                        return;
                    if (this._stage === this.STARTED)
                        this._applyToActive("end", e);
                    else if (this._stage === this.INITED)
                        this._applyToActive("stop", e);
                    this.reset()
                },
                _handleMouseWheel: function(e) {
                    this._handlePointerDown(e);
                    if (this._stage !== this.INITED)
                        return;
                    this._takeFirstEmitter();
                    this._eachEmitter(function(emitter, direction) {
                        var prop = direction !== "horizontal" ? "pageY" : "pageX";
                        e[prop] += e.delta
                    });
                    this._handlePointerMove(e);
                    this._handlePointerUp(e)
                },
                isActive: function(element) {
                    var result = false;
                    this._eachEmitter(function(emitter) {
                        result = result || emitter.getElement().is(element)
                    });
                    return result
                }
            });
        var gestureEventManager = new GestureEventManager;
        var registerEmitter = function(emitterConfig) {
                var emitterClass = emitterConfig.emitter;
                $.each(emitterConfig.events, function(_, eventName) {
                    events.registerEvent(eventName, {
                        noBubble: true,
                        setup: function(element, data) {
                            var emitter = $(element).data(GESTURE_EVENT_DATA) || new emitterClass(element);
                            emitter.configurate(data);
                            $(element).data(GESTURE_EVENT_DATA, emitter)
                        },
                        teardown: function(element) {
                            if (gestureEventManager.isActive(element))
                                gestureEventManager.reset();
                            $(element).removeData(GESTURE_EVENT_DATA)
                        }
                    })
                })
            };
        $.each(ui.gestureEmitters, function(_, emitterConfig) {
            registerEmitter(emitterConfig)
        });
        events.__internals = events.__internals || {};
        $.extend(events.__internals, {registerEmitter: registerEmitter})
    })(jQuery, DevExpress);
    /*! Module core, file ui.widget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            UI_FEEDBACK = "UIFeedback",
            UI_FEEDBACK_CLASS = "dx-feedback",
            ACTIVE_STATE_CLASS = "dx-state-active",
            DISABLED_STATE_CLASS = "dx-state-disabled",
            INVISIBLE_STATE_CLASS = "dx-state-invisible",
            HOVER_STATE_CLASS = "dx-state-hover",
            FEEDBACK_SHOW_TIMEOUT = 30,
            FEEDBACK_HIDE_TIMEOUT = 400,
            HOVER_START = "dxhoverstart",
            HOVER_END = "dxhoverend",
            ANONYMOUS_TEMPLATE_NAME = "template",
            TEMPLATE_SELECTOR = "[data-options*='dxTemplate']",
            TEMPLATES_DATA_KEY = "dxTemplates";
        var getTemplateOptions = function(element) {
                var options = $(element).data("options");
                if ($.trim(options).charAt(0) !== "{")
                    options = "{" + options + "}";
                return new Function("return " + options)().dxTemplate
            };
        var activeElement,
            events = ui.events;
        ui.feedback = {reset: function() {
                handleEnd(true)
            }};
        ui.Widget = DX.DOMComponent.inherit({
            NAME: "Widget",
            NAMESPACE: ui,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    disabled: false,
                    visible: true,
                    activeStateEnabled: true,
                    width: undefined,
                    height: undefined,
                    contentReadyAction: null,
                    hoverStateEnabled: false
                })
            },
            _init: function() {
                this.callBase();
                this._feedbackShowTimeout = FEEDBACK_SHOW_TIMEOUT;
                this._feedbackHideTimeout = FEEDBACK_HIDE_TIMEOUT;
                if (this._templatesSupported()) {
                    this._initTemplates();
                    this._initContentReadyAction()
                }
            },
            _templatesSupported: function() {
                return this._renderContentImpl !== DX.abstract
            },
            _initTemplates: function() {
                var that = this,
                    templates = {},
                    dataTemplateElements = this._element().data(TEMPLATES_DATA_KEY),
                    templateElements = dataTemplateElements ? dataTemplateElements : this._element().contents().filter(TEMPLATE_SELECTOR);
                this._templateProvider = new ui.TemplateProvider;
                this._templateClass = this._templateProvider.getTemplateClass(this);
                if (templateElements.length) {
                    var templatesMap = {};
                    templateElements.each(function() {
                        var templateOptions = getTemplateOptions(this);
                        if (!templateOptions)
                            return;
                        if (!templateOptions.name)
                            throw Error("Template name was not specified");
                        templatesMap[templateOptions.name] = templatesMap[templateOptions.name] || [];
                        templatesMap[templateOptions.name].push(this)
                    });
                    $.each(templatesMap, function(templateName, value) {
                        var deviceTemplate = that._findTemplateByDevice(value);
                        if (deviceTemplate)
                            templates[templateName] = that._createTemplate(deviceTemplate)
                    })
                }
                else
                    templates[ANONYMOUS_TEMPLATE_NAME] = that._createTemplate(that._element().contents());
                this.option("_templates", templates)
            },
            _getTemplateByOption: function(optionName) {
                return this._getTemplate(this.option(optionName))
            },
            _getTemplate: function(templateName) {
                var result = this._acquireTemplate.apply(this, arguments);
                if (!result && this._templateProvider.supportDefaultTemplate(this)) {
                    result = this._templateProvider.getDefaultTemplate(this);
                    if (!result)
                        throw Error(DX.utils.stringFormat("Template \"{0}\" was not found and no default template specified!", templateName));
                }
                return result
            },
            _acquireTemplate: function(templateSource) {
                if (templateSource == null)
                    return templateSource;
                if (templateSource instanceof this._templateClass)
                    return templateSource;
                if (templateSource.nodeType || templateSource.jquery) {
                    templateSource = $(templateSource);
                    if (templateSource.is("script"))
                        templateSource = templateSource.html();
                    return this._createTemplate(templateSource)
                }
                if (typeof templateSource === "string")
                    return this.option("_templates")[templateSource];
                if ($.isFunction(templateSource)) {
                    var args = $.makeArray(arguments).slice(1);
                    return this._acquireTemplate(templateSource.apply(this, args))
                }
                return this._acquireTemplate(templateSource.toString())
            },
            _createTemplate: function(element) {
                return new this._templateClass(element, this)
            },
            _findTemplateByDevice: function(templates) {
                var suitableTemplate = DX.utils.findBestMatches(DX.devices.current(), templates, function(template) {
                        return getTemplateOptions(template)
                    })[0];
                $.each(templates, function(index, template) {
                    if (template !== suitableTemplate)
                        $(template).remove()
                });
                return suitableTemplate
            },
            _cleanTemplates: function() {
                var that = this;
                $.each(this.option("_templates"), function(templateName, template) {
                    if (that === template.owner())
                        template.dispose()
                })
            },
            _initContentReadyAction: function() {
                this._contentReadyAction = this._createActionByOption("contentReadyAction", {excludeValidators: ["gesture", "designMode", "disabled"]})
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-widget");
                this._toggleDisabledState(this.option("disabled"));
                this._toggleVisibility(this.option("visible"));
                this._refreshFeedback();
                this._renderDimensions();
                if (this._templatesSupported())
                    this._renderContent();
                this._attachHoverEvents()
            },
            _renderContent: function() {
                this._renderContentImpl();
                this._fireContentReadyAction()
            },
            _renderContentImpl: DX.abstract,
            _fireContentReadyAction: function() {
                this._contentReadyAction({excludeValidators: ["disabled", "gesture"]})
            },
            _dispose: function() {
                if (this._templatesSupported())
                    this._cleanTemplates();
                this._contentReadyAction = null;
                this._clearTimers();
                if (activeElement && activeElement.closest(this._element()).length)
                    activeElement = null;
                this.callBase()
            },
            _clean: function() {
                this.callBase();
                this._element().empty()
            },
            _clearTimers: function() {
                clearTimeout(this._feedbackHideTimer);
                clearTimeout(this._feedbackShowTimer)
            },
            _toggleVisibility: function(visible) {
                this._element().toggleClass(INVISIBLE_STATE_CLASS, !visible)
            },
            _attachHoverEvents: function() {
                var that = this,
                    hoverableSelector = that._activeStateUnit,
                    nameStart = events.addNamespace(HOVER_START, UI_FEEDBACK),
                    nameEnd = events.addNamespace(HOVER_END, UI_FEEDBACK);
                that._element().off(nameStart, hoverableSelector).off(nameEnd, hoverableSelector);
                if (this.option("hoverStateEnabled")) {
                    var startAction = new DX.Action(function(args) {
                            var $target = args.element;
                            that._refreshHoveredElement($target)
                        });
                    that._element().on(nameStart, hoverableSelector, {selector: hoverableSelector}, function(e) {
                        startAction.execute({element: $(e.target)})
                    }).on(nameEnd, hoverableSelector, {selector: hoverableSelector}, function(e) {
                        e.stopImmediatePropagation();
                        that._forgetHoveredElement()
                    })
                }
                else
                    this._toggleHoverClass(false)
            },
            _refreshHoveredElement: function(hoveredElement) {
                var selector = this._activeStateUnit || this._element();
                this._forgetHoveredElement();
                this._hoveredElement = hoveredElement.closest(selector);
                this._toggleHoverClass(true)
            },
            _forgetHoveredElement: function() {
                this._toggleHoverClass(false);
                delete this._hoveredElement
            },
            _toggleHoverClass: function(value) {
                if (this._hoveredElement)
                    this._hoveredElement.toggleClass(HOVER_STATE_CLASS, value && this.option("hoverStateEnabled"))
            },
            _renderDimensions: function() {
                var width = this.option("width"),
                    height = this.option("height");
                this._setDimension(width, "width");
                this._setDimension(height, "height")
            },
            _setDimension: function(dimensionSize, dimension) {
                var $element = this._element();
                dimensionSize = $.isFunction(dimensionSize) ? dimensionSize() : dimensionSize;
                if ($.isNumeric(dimensionSize))
                    dimensionSize = dimensionSize + "px";
                if (!dimensionSize && dimension === "width")
                    dimensionSize = this._calculateWidth();
                $element.css(dimension, dimensionSize)
            },
            _calculateWidth: function() {
                var $element = this._element(),
                    explicitWidth = $element[0].style.width,
                    calculatedWidth;
                if (explicitWidth[explicitWidth.length - 1] === "%" && !this.option("width"))
                    return explicitWidth;
                else
                    calculatedWidth = explicitWidth && explicitWidth !== "auto" && explicitWidth !== "inherit" ? $element.outerWidth() : this.option("width");
                return calculatedWidth
            },
            _refreshFeedback: function() {
                if (this._feedbackDisabled()) {
                    this._feedbackOff(true);
                    this._element().removeClass(UI_FEEDBACK_CLASS)
                }
                else
                    this._element().addClass(UI_FEEDBACK_CLASS)
            },
            _feedbackDisabled: function() {
                return !this.option("activeStateEnabled") || this.option("disabled")
            },
            _feedbackOn: function(element, immediate) {
                if (this._feedbackDisabled())
                    return;
                this._clearTimers();
                if (immediate)
                    this._feedbackShow(element);
                else
                    this._feedbackShowTimer = window.setTimeout($.proxy(this._feedbackShow, this, element), this._feedbackShowTimeout);
                this._saveActiveElement()
            },
            _feedbackShow: function(element) {
                var activeStateElement = this._element();
                if (this._activeStateUnit)
                    activeStateElement = $(element).closest(this._activeStateUnit);
                if (!activeStateElement.hasClass(DISABLED_STATE_CLASS)) {
                    activeStateElement.addClass(ACTIVE_STATE_CLASS);
                    this._toggleHoverClass(false)
                }
            },
            _saveActiveElement: function() {
                activeElement = this._element()
            },
            _feedbackOff: function(immediate) {
                this._clearTimers();
                if (immediate)
                    this._feedbackHide();
                else
                    this._feedbackHideTimer = window.setTimeout($.proxy(this._feedbackHide, this), this._feedbackHideTimeout)
            },
            _feedbackHide: function() {
                var activeStateElement = this._element();
                if (this._activeStateUnit)
                    activeStateElement = activeStateElement.find(this._activeStateUnit);
                activeStateElement.removeClass(ACTIVE_STATE_CLASS);
                this._toggleHoverClass(!this.option("disabled"));
                this._clearActiveElement()
            },
            _clearActiveElement: function() {
                var rootDomElement = this._element().get(0),
                    activeDomElement = activeElement && activeElement.get(0);
                if (activeDomElement && (activeDomElement === rootDomElement || $.contains(rootDomElement, activeDomElement)))
                    activeElement = null
            },
            _toggleDisabledState: function(value) {
                this._element().toggleClass(DISABLED_STATE_CLASS, Boolean(value));
                this._toggleHoverClass(!value)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"disabled":
                        this._toggleDisabledState(value);
                        this._refreshFeedback();
                        break;
                    case"activeStateEnabled":
                        this._refreshFeedback();
                        break;
                    case"hoverStateEnabled":
                        this._attachHoverEvents();
                        break;
                    case"visible":
                        this._toggleVisibility(value);
                        break;
                    case"width":
                    case"height":
                        this._renderDimensions();
                        break;
                    case"contentReadyAction":
                        this._initContentReadyAction();
                        break;
                    case"_templates":
                        this._refresh();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            repaint: function() {
                this._refresh()
            }
        });
        var handleStart = function(args, immediate) {
                var e = args.jQueryEvent,
                    $target = args.element,
                    widget;
                if (events.needSkipEvent(e))
                    return;
                if (activeElement) {
                    widget = getWidget(activeElement);
                    if (widget)
                        widget._feedbackOff(true)
                }
                var closestFeedbackElement = $target.closest("." + UI_FEEDBACK_CLASS);
                if (closestFeedbackElement.length) {
                    widget = getWidget(closestFeedbackElement);
                    if (!widget)
                        return;
                    widget._feedbackOn($target, immediate);
                    if (immediate)
                        widget._feedbackOff()
                }
            };
        var handleEnd = function(immediate) {
                if (!activeElement)
                    return;
                var widget = getWidget(activeElement);
                if (widget)
                    widget._feedbackOff(immediate)
            };
        var getWidget = function(widgetElement) {
                var result;
                $.each(widgetElement.data("dxComponents") || [], function(index, componentName) {
                    if (ui[componentName] && ui[componentName].subclassOf(ui.Widget)) {
                        result = widgetElement.data(componentName);
                        return false
                    }
                });
                return result
            };
        $(function() {
            var startAction = new DX.Action(handleStart);
            $(document).on(events.addNamespace("dxpointerdown", UI_FEEDBACK), function(e) {
                startAction.execute({
                    jQueryEvent: e,
                    element: $(e.target)
                })
            }).on(events.addNamespace("dxpointerup dxpointercancel", UI_FEEDBACK), function(e) {
                var activeElementClicked = activeElement && $(e.target).closest("." + UI_FEEDBACK_CLASS).get(0) === activeElement.get(0);
                if (activeElementClicked)
                    startAction.execute({
                        jQueryEvent: e,
                        element: $(e.target)
                    }, true);
                handleEnd()
            })
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.editor.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        DX.registerComponent("dxEditor", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: undefined,
                    valueChangeAction: undefined
                })
            },
            _recreateValueChangeAction: function() {
                this._valueChangeAction = this._createActionByOption("valueChangeAction")
            },
            _suppressValueChangeAction: function() {
                this._valueChangeActionSuppressed = true
            },
            _resumeValueChangeAction: function() {
                this._valueChangeActionSuppressed = false
            },
            _render: function() {
                this._recreateValueChangeAction();
                this.callBase()
            },
            _raiseValueChangeAction: function(value, previousValue, extraArguments) {
                var args = {
                        value: value,
                        previousValue: previousValue,
                        jQueryEvent: this._valueChangeEventInstance
                    };
                if (extraArguments)
                    args = $.extend(args, extraArguments);
                this._valueChangeAction(args)
            },
            _optionChanged: function(name, value, previousValue) {
                switch (name) {
                    case"valueChangeAction":
                        this._recreateValueChangeAction();
                        break;
                    case"value":
                        if (!this._valueChangeActionSuppressed)
                            this._raiseValueChangeAction(value, previousValue);
                        this._valueChangeEventInstance = undefined;
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module core, file ui.template.js */
    (function($, DX, undefined) {
        var isString = DX.utils.isString;
        var currentTemplateEngine;
        var templateEngines = [];
        var BaseTemplate = DevExpress.Class.inherit({
                _compile: function(html, element) {
                    return element
                },
                _render: function(template, data) {
                    return template
                },
                ctor: function(element) {
                    this._element = $(element);
                    if (this._element.length === 1) {
                        if (this._element[0].nodeName.toLowerCase() !== "script")
                            this._element = $("<div />").append(this._element);
                        this._template = this._compile(this._element.html() || "", this._element)
                    }
                },
                render: function(container, data) {
                    var result;
                    if (this._template) {
                        result = this._render(this._template, data);
                        if (isString(result))
                            result = $.parseHTML(result);
                        result = $(result);
                        if (container)
                            container.append(result);
                        return result
                    }
                },
                owner: $.noop,
                dispose: $.noop
            });
        var createTemplateEngine = function(options) {
                if (options && options.compile && options.render)
                    return BaseTemplate.inherit({
                            allowRenderToDetachedContainer: options.allowRenderToDetachedContainer !== false,
                            _compile: options.compile,
                            _render: options.render
                        });
                else
                    throw Error("Template Engine must contains compile and render methods");
            };
        if (window.ko) {
            var koCustomTemplateEngine = function(){};
            koCustomTemplateEngine.prototype = ko.utils.extend(new ko.templateEngine, {
                renderTemplateSource: function(templateSource, bindingContext, options) {
                    var precompiledTemplate = templateSource["data"]("precompiledTemplate");
                    if (!precompiledTemplate) {
                        precompiledTemplate = new currentTemplateEngine(templateSource.domElement);
                        templateSource["data"]("precompiledTemplate", precompiledTemplate)
                    }
                    return precompiledTemplate.render(null, bindingContext.$data)
                },
                allowTemplateRewriting: false
            })
        }
        DevExpress.ui.setTemplateEngine = function(templateEngine) {
            if (isString(templateEngine)) {
                currentTemplateEngine = templateEngines && templateEngines[templateEngine];
                if (!currentTemplateEngine && templateEngine !== "default")
                    throw Error(DX.utils.stringFormat("Template Engine \"{0}\" is not supported", templateEngine));
            }
            else
                currentTemplateEngine = createTemplateEngine(templateEngine) || currentTemplateEngine;
            if (window.ko)
                ko.setTemplateEngine(currentTemplateEngine ? new koCustomTemplateEngine : new ko.nativeTemplateEngine)
        };
        DevExpress.ui.TemplateProvider = DevExpress.ui.TemplateProvider.inherit({getTemplateClass: function() {
                if (currentTemplateEngine)
                    return currentTemplateEngine;
                return this.callBase.apply(this, arguments)
            }});
        var registerTemplateEngine = function(name, templateOptions) {
                templateEngines[name] = createTemplateEngine(templateOptions)
            };
        registerTemplateEngine("jquery-tmpl", {
            compile: function(html, element) {
                return element
            },
            render: function(template, data) {
                return template.tmpl(data)
            }
        });
        registerTemplateEngine("jsrender", {
            compile: function(html) {
                return $.templates(html)
            },
            render: function(template, data) {
                return template.render(data)
            }
        });
        registerTemplateEngine("mustache", {
            compile: function(html) {
                return Mustache.compile(html)
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("hogan", {
            compile: function(html) {
                return Hogan.compile(html)
            },
            render: function(template, data) {
                return template.render(data)
            }
        });
        registerTemplateEngine("underscore", {
            compile: function(html) {
                return _.template(html)
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("handlebars", {
            compile: function(html) {
                return Handlebars.compile(html)
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("doT", {
            compile: function(html) {
                return doT.template(html)
            },
            render: function(template, data) {
                return template(data)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.collectionContainerWidget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var CollectionContainerWidget = ui.Widget.inherit({
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        items: [],
                        itemTemplate: "item",
                        itemRender: null,
                        itemRenderedAction: null,
                        itemClickAction: null,
                        itemHoldAction: null,
                        itemHoldTimeout: 750,
                        noDataText: Globalize.localize("dxCollectionContainerWidget-noDataText"),
                        dataSource: null,
                        selectedIndex: -1,
                        itemSelectAction: null
                    })
                },
                _init: function() {
                    this.callBase();
                    this._cleanRenderedItems();
                    this._refreshDataSource()
                },
                _dataSourceOptions: function() {
                    var options = {
                            paginate: false,
                            _preferSync: false
                        };
                    if ($.isArray(this.option("dataSource")))
                        options._preferSync = true;
                    return options
                },
                _cleanRenderedItems: function() {
                    this._renderedItemsCount = 0
                },
                _fireSelectItemEvent: function(index, prevIndex) {
                    if (this._selectionEnabled()) {
                        this._updateSelectedIndex(index, prevIndex);
                        this._handleItemEvent(this._selectedItemElement(index), "itemSelectAction", {
                            selectedIndex: index,
                            previousIndex: prevIndex
                        }, {excludeValidators: ["gesture", "disabled"]})
                    }
                },
                _optionChanged: function(name, value, prevValue) {
                    switch (name) {
                        case"items":
                            if (this._selectionEnabled()) {
                                var itemsCount = value && value.length || 0,
                                    maxIndex = Math.max(itemsCount - 1, 0);
                                if (maxIndex < this.option("selectedIndex"))
                                    this.option("selectedIndex", 0)
                            }
                            this._cleanRenderedItems();
                            this._invalidate();
                            break;
                        case"dataSource":
                            this._refreshDataSource();
                            if (!this._dataSource)
                                this.option("items", []);
                            this._renderEmptyMessage();
                            break;
                        case"noDataText":
                            this._renderEmptyMessage();
                            break;
                        case"itemTemplate":
                            this._invalidate();
                            break;
                        case"itemRender":
                            this._itemRender = null;
                            this._invalidate();
                            break;
                        case"itemRenderedAction":
                            this._createItemRenderAction();
                            break;
                        case"itemClickAction":
                            break;
                        case"itemHoldAction":
                        case"itemHoldTimeout":
                            this._attachHoldEvent();
                            break;
                        case"selectedIndex":
                            this._fireSelectItemEvent(value, prevValue);
                            break;
                        case"itemSelectAction":
                            break;
                        default:
                            this.callBase(name, value, prevValue)
                    }
                },
                _expectNextPageLoading: function() {
                    this._startIndexForAppendedItems = 0
                },
                _expectLastItemLoading: function() {
                    this._startIndexForAppendedItems = -1
                },
                _forgetNextPageLoading: function() {
                    this._startIndexForAppendedItems = null
                },
                _handleDataSourceChanged: function(newItems) {
                    var items = this.option("items");
                    if (this._initialized && items && this._shouldAppendItems()) {
                        this._renderedItemsCount = items.length;
                        if (!this._dataSource.isLastPage() || this._startIndexForAppendedItems !== -1)
                            this.option().items = items.concat(newItems.slice(this._startIndexForAppendedItems));
                        this._renderContent();
                        this._forgetNextPageLoading()
                    }
                    else
                        this.option("items", newItems)
                },
                _handleDataSourceLoadError: function() {
                    this._forgetNextPageLoading()
                },
                _shouldAppendItems: function() {
                    return this._startIndexForAppendedItems != null && this._allowDinamicItemsAppend()
                },
                _allowDinamicItemsAppend: function() {
                    return false
                },
                _clean: function() {
                    this._itemContainer().empty()
                },
                _refresh: function() {
                    this._cleanRenderedItems();
                    this.callBase.apply(this, arguments)
                },
                _itemContainer: function() {
                    return this._element()
                },
                _itemClass: DX.abstract,
                _itemSelector: function() {
                    return "." + this._itemClass()
                },
                _itemDataKey: DX.abstract,
                _itemElements: function() {
                    return this._itemContainer().find(this._itemSelector())
                },
                _render: function() {
                    this.callBase();
                    this._attachClickEvent();
                    this._attachHoldEvent();
                    if (this._selectionEnabled()) {
                        this._renderSelectedIndex(this.option("selectedIndex"));
                        this._attachSelectedEvent()
                    }
                },
                _selectionEnabled: function() {
                    return this._renderSelectedIndex !== DX.abstract
                },
                _selectionByClickEnabled: function() {
                    return true
                },
                _renderSelectedIndex: DX.abstract,
                _attachSelectedEvent: function() {
                    if (!this._selectionByClickEnabled())
                        return;
                    var itemSelector = this._itemSelector(),
                        itemSelectHandler = this._createAction($.proxy(function(e) {
                            this._handleItemSelect(e.jQueryEvent)
                        }, this)),
                        eventName = events.addNamespace("dxclick", this.NAME);
                    this._element().off(eventName, itemSelector).on(eventName, itemSelector, $.proxy(function(e) {
                        var $itemElement = $(e.target).closest(itemSelector);
                        itemSelectHandler({
                            itemElement: $itemElement,
                            jQueryEvent: e
                        });
                        this._handleItemClick(e)
                    }, this))
                },
                _handleItemSelect: function(e) {
                    if (events.needSkipEvent(e))
                        return;
                    var items = this.option("items"),
                        selectedItem = $(e.currentTarget).data(this._itemDataKey()),
                        selectedItemIndex = $.inArray(selectedItem, items);
                    this.option("selectedIndex", selectedItemIndex)
                },
                _updateSelectedIndex: function() {
                    this._renderSelectedIndex.apply(this, arguments)
                },
                _selectedItemElement: function(index) {
                    return this._itemElements().eq(index)
                },
                _attachClickEvent: function() {
                    if (this._selectionEnabled() && this._selectionByClickEnabled())
                        return;
                    var itemSelector = this._itemSelector(),
                        eventName = events.addNamespace("dxclick", this.NAME);
                    this._itemContainer().off(eventName, itemSelector).on(eventName, itemSelector, $.proxy(this._handleItemClick, this))
                },
                _handleItemClick: function(e) {
                    this._handleItemJQueryEvent(e, "itemClickAction")
                },
                _attachHoldEvent: function() {
                    var $itemContainer = this._itemContainer(),
                        itemSelector = this._itemSelector(),
                        eventName = events.addNamespace("dxhold", this.NAME);
                    $itemContainer.off(eventName, itemSelector);
                    if (this._shouldAttachHoldEvent())
                        $itemContainer.on(eventName, itemSelector, {timeout: this.option("itemHoldTimeout")}, $.proxy(this._handleItemHold, this))
                },
                _shouldAttachHoldEvent: function() {
                    return this.option("itemHoldAction")
                },
                _handleItemHold: function(e) {
                    this._handleItemJQueryEvent(e, "itemHoldAction")
                },
                _renderContentImpl: function() {
                    var items = this.option("items") || [];
                    if (this._renderedItemsCount)
                        this._renderItems(items.slice(this._renderedItemsCount));
                    else
                        this._renderItems(items)
                },
                _renderItems: function(items) {
                    if (items.length)
                        $.each(items, $.proxy(this._renderItem, this));
                    this._renderEmptyMessage()
                },
                _renderItem: function(index, itemData, container) {
                    container = container || this._itemContainer();
                    var itemRenderer = this._getItemRenderer(),
                        itemTemplateName = this._getItemTemplateName(itemData),
                        itemTemplate = this._getTemplate(itemTemplateName, index, itemData),
                        itemElement,
                        renderArgs = {
                            index: index,
                            item: itemData,
                            container: container
                        };
                    if (itemRenderer)
                        itemElement = this._createItemByRenderer(itemRenderer, renderArgs);
                    else if (itemTemplate)
                        itemElement = this._createItemByTemplate(itemTemplate, renderArgs);
                    else
                        itemElement = this._createItemByRenderer(this._itemRenderDefault, renderArgs);
                    itemElement.addClass(this._itemClass()).data(this._itemDataKey(), itemData);
                    var postprocessRenderArgs = {
                            itemElement: itemElement,
                            itemData: itemData,
                            itemIndex: index
                        };
                    this._postprocessRenderItem(postprocessRenderArgs);
                    this._getItemRenderAction()({
                        itemElement: itemElement,
                        itemData: itemData
                    });
                    return itemElement
                },
                _createItemRenderAction: function() {
                    return this._itemRenderAction = this._createActionByOption("itemRenderedAction", {
                            element: this._element(),
                            excludeValidators: ["gesture", "designMode", "disabled"]
                        })
                },
                _getItemRenderAction: function() {
                    return this._itemRenderAction || this._createItemRenderAction()
                },
                _getItemRenderer: function() {
                    this._itemRender = this._itemRender || this.option("itemRender");
                    return this._itemRender
                },
                _createItemByRenderer: function(itemRenderer, renderArgs) {
                    var itemElement = $("<div />").appendTo(renderArgs.container);
                    var rendererResult = itemRenderer.call(this, renderArgs.item, renderArgs.index, itemElement);
                    if (rendererResult != null && itemElement[0] !== rendererResult[0])
                        itemElement.append(rendererResult);
                    return itemElement
                },
                _getItemTemplateName: function(itemData) {
                    return itemData && itemData.template || this.option("itemTemplate")
                },
                _createItemByTemplate: function(itemTemplate, renderArgs) {
                    return itemTemplate.render(renderArgs.container, renderArgs.item, renderArgs.index, "ignoreTarget")
                },
                _itemRenderDefault: function(item, index, itemElement) {
                    if ($.isPlainObject(item)) {
                        if (item.visible !== undefined && !item.visible)
                            itemElement.hide();
                        if (item.disabled)
                            itemElement.addClass("dx-state-disabled");
                        if (item.text)
                            itemElement.text(item.text);
                        if (item.html)
                            itemElement.html(item.html)
                    }
                    else
                        itemElement.html(String(item))
                },
                _postprocessRenderItem: $.noop,
                _renderEmptyMessage: function() {
                    if (!this._selectionEnabled()) {
                        var noDataText = this.option("noDataText"),
                            items = this.option("items"),
                            dataSourceLoading = this._dataSource && this._dataSource.isLoading(),
                            hideNoData = !noDataText || items && items.length || dataSourceLoading;
                        if (hideNoData && this._$nodata) {
                            this._$nodata.remove();
                            this._$nodata = null
                        }
                        if (!hideNoData) {
                            this._$nodata = this._$nodata || $("<div />").addClass("dx-empty-message");
                            this._$nodata.appendTo(this._itemContainer()).text(noDataText)
                        }
                    }
                },
                _handleItemJQueryEvent: function(jQueryEvent, handlerOptionName, actionArgs, actionConfig) {
                    this._handleItemEvent(jQueryEvent.target, handlerOptionName, $.extend(actionArgs, {jQueryEvent: jQueryEvent}), actionConfig)
                },
                _handleItemEvent: function(initiator, handlerOptionName, actionArgs, actionConfig) {
                    var action = this._createActionByOption(handlerOptionName, actionConfig);
                    return this._handleItemEventImpl(initiator, action, actionArgs)
                },
                _handleItemEventByHandler: function(initiator, handler, actionArgs, actionConfig) {
                    var action = this._createAction(handler, actionConfig);
                    return this._handleItemEventImpl(initiator, action, actionArgs)
                },
                _handleItemEventImpl: function(initiator, action, actionArgs) {
                    var $itemElement = this._closestItemElement($(initiator));
                    actionArgs = $.extend({
                        itemElement: $itemElement,
                        itemData: this._getItemData($itemElement)
                    }, actionArgs);
                    return action(actionArgs)
                },
                _closestItemElement: function($element) {
                    return $($element).closest(this._itemSelector())
                },
                _getItemData: function($itemElement) {
                    return $itemElement.data(this._itemDataKey())
                },
                itemElements: function() {
                    return this._itemElements()
                },
                itemsContainer: function() {
                    return this._itemContainer()
                }
            }).include(ui.DataHelperMixin);
        ui.CollectionContainerWidget = CollectionContainerWidget
    })(jQuery, DevExpress);
    /*! Module core, file ui.tooltip.js */
    (function($, DX, undefined) {
        var $tooltip = null;
        var createTooltip = function(options) {
                options = $.extend({position: "top"}, options);
                var content = options.content;
                delete options.content;
                return $("<div />").html(content).appendTo(DX.overlayTargetContainer()).dxTooltip(options)
            };
        var removeTooltip = function() {
                if (!$tooltip)
                    return;
                $tooltip.remove();
                $tooltip = null
            };
        var tooltip = {
                show: function(options) {
                    removeTooltip();
                    $tooltip = createTooltip(options);
                    return $tooltip.dxTooltip("show")
                },
                hide: function() {
                    if (!$tooltip)
                        return $.when();
                    return $tooltip.dxTooltip("hide").done(removeTooltip).promise()
                }
            };
        DX.ui.tooltip = tooltip
    })(jQuery, DevExpress)
}