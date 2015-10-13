/*! 
* DevExtreme (Visualization Core Library)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_VIZ_CORE) {
    if (!window.DevExpress)
        throw Error('Required module is not referenced: core');
    /*! Module viz-core, file namespaces.js */
    (function(DevExpress) {
        DevExpress.viz = {}
    })(DevExpress);
    /*! Module viz-core, file namespaces.js */
    (function(DevExpress) {
        DevExpress.viz.core = {}
    })(DevExpress);
    /*! Module viz-core, file errorsWarnings.js */
    (function(DevExpress) {
        DevExpress.viz.core.errorsWarnings = {
            E2001: "Invalid data source",
            E2002: "Axis type and data type are incompatible",
            E2003: "\"{0}\" data source field contains data of unsupported type",
            E2004: "\"{0}\" data source field is inconsistent",
            E2101: "Unknown series type was specified: {0}",
            E2102: "Ambiguity occurred between two value axes with the same name",
            E2103: "\"{0}\" option must be a function",
            E2104: "Invalid logarithm base",
            E2105: "Invalid value of a \"{0}\"",
            E2106: "Invalid visible range",
            E2201: "Invalid type of data source field",
            E2202: "Invalid scale {0} value",
            E2203: "The \"{0}\" field of the \"selectedRange\" configuration object is not valid",
            W2001: "{0} cannot be drawn because its container is invisible",
            W2002: "The {0} data field is absent",
            W2003: "Tick interval is too small",
            W2101: "\"{0}\" pane does not exist; \"{1}\" pane is used instead",
            W2102: "Value axis with the \"{0}\" name was created automatically",
            W2103: "Chart title was hidden due to container size",
            W2104: "Legend was hidden due to container size",
            W2105: "Title of \"{0}\" axis was hidden due to container size",
            W2106: "Labels of \"{0}\" axis were hidden due to container size",
            W2301: "Invalid value range"
        }
    })(DevExpress);
    /*! Module viz-core, file tickProvider.js */
    (function($, DX, undefined) {
        var utils = DX.utils,
            math = Math,
            mathCeil = math.ceil,
            mathFloor = math.floor,
            mathAbs = math.abs,
            mathRound = math.round,
            core = DX.viz.core;
        var TICKS_COUNT_LIMIT = 2000;
        core.outOfScreen = {
            x: -1000,
            y: -1000
        };
        core.tickIntervalCalculator = {
            _defaultNumberMultipliers: [1, 2, 3, 5],
            _defaultGridSpacingFactor: 30,
            _getCommonTickInterval: function(deltaCoef, numberMultipliers) {
                var factor,
                    result = 0,
                    hasResult = false,
                    i;
                for (factor = 1; !hasResult; factor *= 10)
                    for (i = 0; i < numberMultipliers.length; i++) {
                        result = numberMultipliers[i] * factor;
                        if (deltaCoef <= result) {
                            hasResult = true;
                            break
                        }
                    }
                return result
            },
            _getNumericTickInterval: function(deltaCoef, numberMultipliers) {
                var factor,
                    result = 0,
                    newResult,
                    hasResult = false,
                    i;
                if (deltaCoef > 1.0)
                    result = this._getCommonTickInterval(deltaCoef, numberMultipliers);
                else if (deltaCoef > 0) {
                    result = 1;
                    for (factor = 0.1; !hasResult; factor /= 10)
                        for (i = numberMultipliers.length - 1; i >= 0; i--) {
                            newResult = numberMultipliers[i] * factor;
                            if (deltaCoef > newResult) {
                                hasResult = true;
                                break
                            }
                            result = newResult
                        }
                }
                return utils.adjustValue(result)
            },
            _getLogarithmicTickInterval: function(deltaCoef, numberMultipliers) {
                var result = 0;
                if (deltaCoef !== 0)
                    result = this._getCommonTickInterval(deltaCoef, numberMultipliers);
                return utils.adjustValue(result)
            },
            _getDateTimeTickInterval: function(deltaCoef, numberMultipliers) {
                var dateTimeMultipliers = {
                        millisecond: [1, 2, 5, 10, 25, 100, 250, 300, 500],
                        second: [1, 2, 3, 5, 10, 15, 20, 30],
                        minute: [1, 2, 3, 5, 10, 15, 20, 30],
                        hour: [1, 2, 3, 4, 6, 8, 12],
                        day: [1, 2, 3, 5, 7, 10, 14],
                        month: [1, 2, 3, 6]
                    },
                    result = {},
                    factor,
                    key,
                    specificMultipliers,
                    yearsCount,
                    i;
                if (deltaCoef > 0 && deltaCoef < 1.0)
                    return {milliseconds: 1};
                else if (deltaCoef === 0)
                    return 0;
                for (key in dateTimeMultipliers)
                    if (dateTimeMultipliers.hasOwnProperty(key)) {
                        specificMultipliers = dateTimeMultipliers[key];
                        for (i = 0; i < specificMultipliers.length; i++)
                            if (deltaCoef <= utils.convertDateUnitToMilliseconds(key, specificMultipliers[i])) {
                                result[key + 's'] = specificMultipliers[i];
                                return result
                            }
                    }
                for (factor = 1; ; factor *= 10)
                    for (i = 0; i < numberMultipliers.length; i++) {
                        yearsCount = factor * numberMultipliers[i];
                        if (deltaCoef <= utils.convertDateUnitToMilliseconds('year', yearsCount))
                            return {years: yearsCount}
                    }
                return null
            },
            getTickInterval: function(options) {
                var that = this,
                    gridSpacingFactor = options.gridSpacingFactor || that._defaultGridSpacingFactor,
                    numberMultipliers = options.numberMultipliers || that._defaultNumberMultipliers,
                    businessDelta = options.businessDelta,
                    screenDelta = options.screenDelta,
                    deltaCoef = screenDelta > 0 && gridSpacingFactor < screenDelta ? gridSpacingFactor * businessDelta / screenDelta : 0;
                that._testNumberMultipliers = numberMultipliers;
                if (options.axisType === 'logarithmic')
                    return that._getLogarithmicTickInterval(deltaCoef, numberMultipliers);
                else
                    switch (options.dataType) {
                        case'numeric':
                            return that._getNumericTickInterval(deltaCoef, numberMultipliers);
                            break;
                        case'datetime':
                            return that._getDateTimeTickInterval(deltaCoef, numberMultipliers);
                            break
                    }
                return null
            }
        };
        core.minorTickIntervalCalculator = {
            _defaultNumberMultipliers: [2, 4, 5, 8, 10],
            _defaultGridSpacingFactor: 15,
            _getDateTimeTickInterval: function(businessDelta, deltaCoef, numberMultipliers) {
                var result,
                    i;
                for (i = numberMultipliers.length - 1; i >= 0; i--) {
                    this.testResultNumberMultiplier = numberMultipliers[i];
                    result = mathFloor(businessDelta / numberMultipliers[i]);
                    if (deltaCoef <= result)
                        return utils.convertMillisecondsToDateUnits(result)
                }
                return 0
            },
            _getCommonTickInterval: function(businessDelta, deltaCoef, numberMultipliers) {
                var result,
                    i;
                for (i = numberMultipliers.length - 1; i >= 0; i--) {
                    this.testResultNumberMultiplier = numberMultipliers[i];
                    result = businessDelta / numberMultipliers[i];
                    if (deltaCoef <= result)
                        return utils.adjustValue(result)
                }
                return 0
            },
            getTickInterval: function(options) {
                var that = this,
                    gridSpacingFactor = !utils.isDefined(options.gridSpacingFactor) ? that._defaultGridSpacingFactor : options.gridSpacingFactor,
                    numberMultipliers = options.numberMultipliers || that._defaultNumberMultipliers,
                    businessDelta = options.businessDelta,
                    deltaCoef = gridSpacingFactor * businessDelta / options.screenDelta;
                if (options.axisType === 'logarithmic')
                    return that._getCommonTickInterval(businessDelta, deltaCoef, numberMultipliers);
                else
                    switch (options.dataType) {
                        case'numeric':
                            return that._getCommonTickInterval(businessDelta, deltaCoef, numberMultipliers);
                        case'datetime':
                            return that._getDateTimeTickInterval(businessDelta, deltaCoef, numberMultipliers)
                    }
                return 0
            }
        };
        core.tickProvider = {
            _appendFakeSVGElement: function(value, text, options) {
                var textOptions = $.extend({}, options.textOptions, {rotate: 0});
                return options.renderer.createText(text, core.outOfScreen.x + (options.translator.translate(value) || 0), core.outOfScreen.y, textOptions).append()
            },
            _getDistanceByAngle: function(elementHeight, rotationAngle) {
                return elementHeight / mathAbs(math.sin(rotationAngle * (math.PI / 180)))
            },
            _areDisplayValuesValid: function(value1, value2, options) {
                var that = this,
                    getText = that._getTextFunc(options),
                    rotationAngle = options.textOptions && utils.isNumber(options.textOptions.rotate) ? options.textOptions.rotate : 0,
                    svgElement1 = that._appendFakeSVGElement(value1, getText(value1), options),
                    svgElement2 = that._appendFakeSVGElement(value2, getText(value2), options),
                    bBox1 = svgElement1.getBBox(),
                    bBox2 = svgElement2.getBBox(),
                    result,
                    translator = options.translator;
                if (rotationAngle !== 0)
                    result = that._getDistanceByAngle(bBox1.height, rotationAngle) <= mathAbs(bBox2.x - bBox1.x);
                else if (options.isHorizontal)
                    result = !translator.getBusinessRange().invert ? bBox1.x + bBox1.width < bBox2.x : bBox2.x + bBox2.width < bBox1.x;
                else
                    result = mathAbs(translator.translate(value1) - translator.translate(value2)) > bBox1.height;
                svgElement1.remove();
                svgElement2.remove();
                return result
            },
            _removeInvalidDatesWithUnitBegining: function(dates, options) {
                if (dates.length <= 1 || !options.setTicksAtUnitBeginning || !utils.isDate(options.min))
                    return;
                if (!this._areDisplayValuesValid(dates[0], dates[1], options))
                    dates.splice(1, 1)
            },
            _getValueSize: function(values, options) {
                var that = this,
                    value,
                    rotationAngle = options.textOptions ? options.textOptions.rotate : 0,
                    svgElement,
                    bBox,
                    result,
                    getText = that._getTextFunc(options),
                    i;
                if (values.length === 0)
                    return 0;
                options.isRotate = utils.isNumber(rotationAngle) && rotationAngle !== 0;
                if (options.isRotate || !options.isHorizontal)
                    value = getText(values[0]);
                else {
                    value = [];
                    for (i = 0; i < values.length; i++)
                        value.push(getText(values[i]));
                    value = value.join('\n')
                }
                svgElement = that._appendFakeSVGElement(value, value, options);
                bBox = svgElement.getBBox();
                if (options.isRotate)
                    result = that._getDistanceByAngle(bBox.height, rotationAngle);
                else
                    result = options.isHorizontal ? bBox.width : bBox.height;
                svgElement.remove();
                return mathCeil(result)
            },
            _adjustNumericTickValue: function(value, interval, min) {
                return utils.isExponential(value) ? utils.adjustValue(value) : utils.applyPrecisionByMinDelta(min, interval, value)
            },
            _generateStartTick: function(tickInterval, options) {
                var that = this,
                    milliseconds = 0,
                    boundedRule = options.min - options.max < 0,
                    startTick = options.min,
                    isDate = utils.isDate(options.min),
                    currentTickInterval = isDate ? utils.convertDateTickIntervalToMilliseconds(tickInterval) : tickInterval,
                    nextTick;
                if (options.axisType === 'logarithmic')
                    startTick = utils.raiseTo(mathFloor(utils.adjustValue(utils.getLog(options.min, options.base)) / currentTickInterval * currentTickInterval), options.base);
                else {
                    startTick = mathFloor(options.min / currentTickInterval) * currentTickInterval;
                    startTick = isDate ? new Date(startTick) : that._adjustNumericTickValue(startTick, currentTickInterval, options.min)
                }
                while (boundedRule === startTick - options.min < 0 && startTick !== options.min) {
                    nextTick = that._nextTick(startTick, tickInterval, options);
                    if (nextTick !== startTick)
                        startTick = nextTick;
                    else
                        return nextTick
                }
                return startTick
            },
            _nextTick: function(tick, tickInterval, options) {
                var nextTick,
                    lgPower,
                    that = this;
                if (options.axisType === 'logarithmic') {
                    lgPower = utils.addInterval(utils.adjustValue(utils.getLog(tick, options.base)), tickInterval, options.min > options.max);
                    nextTick = utils.raiseTo(lgPower, options.base);
                    nextTick = that._adjustNumericTickValue(nextTick, tickInterval, math.min(options.min, options.max))
                }
                else {
                    nextTick = utils.addInterval(tick, tickInterval, options.min > options.max);
                    if (options.dataType === 'numeric')
                        nextTick = that._adjustNumericTickValue(nextTick, tickInterval, options.min);
                    if (options.dataType === 'datetime' && options.setTicksAtUnitBeginning)
                        utils.correctDateWithUnitBeginning(nextTick, tickInterval)
                }
                return nextTick
            },
            _addMinorTicks: function(majorTick1, majorTick2, ticksInfo, options, isReverse) {
                var that = this,
                    i,
                    dataType = options.dataType,
                    businessDelta,
                    minorTicks = [],
                    interval = 0,
                    minorTickIntervalsCount = options.minorTickCount + 1,
                    intervalsCount,
                    tickInterval;
                options.min = majorTick1;
                options.max = majorTick2;
                if (!utils.isDefined(options.tickInterval)) {
                    options.businessDelta = businessDelta = mathAbs(options.max - options.min);
                    options.screenDelta = businessDelta * options.deltaCoef;
                    if (utils.isDefined(options.minorTickCount)) {
                        if (!ticksInfo.majorTicks.autoArrangementStep || ticksInfo.majorTicks.autoArrangementStep <= 1) {
                            intervalsCount = options.minorTickCount + 1;
                            interval = dataType === 'datetime' ? utils.convertDateTickIntervalToMilliseconds(ticksInfo.majorTickInterval) : ticksInfo.majorTickInterval;
                            minorTickIntervalsCount = mathRound(businessDelta / interval * intervalsCount) || 1
                        }
                        tickInterval = dataType === 'datetime' ? utils.convertMillisecondsToDateUnits(businessDelta / minorTickIntervalsCount) : businessDelta / minorTickIntervalsCount;
                        if ($.isNumeric(tickInterval))
                            tickInterval = utils.adjustValue(tickInterval)
                    }
                    else if (utils.isDate(majorTick1))
                        tickInterval = core.minorTickIntervalCalculator.getTickInterval(options)
                }
                options = $.extend(true, {}, options, {tickInterval: tickInterval});
                minorTicks = that.getTicks(options);
                if (isReverse)
                    minorTicks.reverse();
                if (minorTicks.length > 0)
                    if (mathCeil(mathAbs(majorTick2 - minorTicks[minorTicks.length - 1]) * options.deltaCoef) < 2)
                        minorTicks.pop();
                for (i = 0; i < minorTicks.length; i++) {
                    ticksInfo.minorTicks.push(minorTicks[i]);
                    ticksInfo.fullTicks.push(minorTicks[i])
                }
            },
            _addLeftBoudedTicks: function(ticksInfo, min, minorTicksOptions) {
                if (utils.isDefined(min) && ticksInfo.majorTicks[0].valueOf() !== min.valueOf()) {
                    minorTicksOptions.addMinMax.max = true;
                    this._addMinorTicks(ticksInfo.majorTicks[0], min, ticksInfo, minorTicksOptions, true);
                    minorTicksOptions.addMinMax.max = false;
                    if (minorTicksOptions.showCustomBoundaryTicks) {
                        if (ticksInfo.minorTicks.length > 0 && ticksInfo.minorTicks[0].valueOf() === min.valueOf())
                            ticksInfo.minorTicks.shift(min);
                        ticksInfo.customBoundaryTicks.push(min);
                        ticksInfo.fullTicks.unshift(min)
                    }
                }
            },
            _addRightBoudedTicks: function(ticksInfo, max, minorTicksOptions) {
                var lastMajorTick = ticksInfo.majorTicks[ticksInfo.majorTicks.length - 1];
                ticksInfo.fullTicks.push(lastMajorTick);
                if (utils.isDefined(max) && lastMajorTick.valueOf() !== max.valueOf()) {
                    minorTicksOptions.addMinMax.min = false;
                    minorTicksOptions.addMinMax.max = true;
                    this._addMinorTicks(lastMajorTick, max, ticksInfo, minorTicksOptions);
                    if (minorTicksOptions.showCustomBoundaryTicks) {
                        if (ticksInfo.minorTicks.length > 0 && ticksInfo.minorTicks[ticksInfo.minorTicks.length - 1].valueOf() === max.valueOf())
                            ticksInfo.minorTicks.pop(max);
                        ticksInfo.customBoundaryTicks.push(max);
                        ticksInfo.fullTicks.push(max)
                    }
                }
            },
            _correctBoundedTicks: function(min, max, ticks, addMinMax) {
                addMinMax = $.extend({}, {
                    min: true,
                    max: true
                }, addMinMax);
                if (ticks.length > 0) {
                    if (!addMinMax.min && ticks[0].valueOf() === min.valueOf())
                        ticks.shift();
                    if (!addMinMax.max || ticks[ticks.length - 1].valueOf() !== max.valueOf())
                        ticks.pop()
                }
            },
            _initializeMinorTicksOptions: function(min, max, screenDelta, ticksInfo, options) {
                var that = this,
                    businessDelta,
                    hasMinorsCount = utils.isDefined(options.minorTickCount);
                $.extend(true, options, {
                    addMinMax: {
                        min: false,
                        max: false
                    },
                    deltaCoef: that._getDeltaCoef(screenDelta, max, min, options.axisType, options.base)
                }, options);
                options.numberMultipliers = hasMinorsCount ? [options.minorTickCount + 1] : options.numberMultipliers;
                options.gridSpacingFactor = hasMinorsCount ? 0 : options.gridSpacingFactor;
                if (!hasMinorsCount && ticksInfo.majorTicks.length > 1) {
                    options.businessDelta = businessDelta = that._getBusinessDelta(options.axisType, ticksInfo.majorTicks[0], ticksInfo.majorTicks[1], options.base);
                    if (that.needTickIntervalCalculation(businessDelta, ticksInfo.minorTickInterval, options.incidentOccured)) {
                        options.screenDelta = businessDelta * options.deltaCoef;
                        ticksInfo.minorTickInterval = core.minorTickIntervalCalculator.getTickInterval(options);
                        if (utils.isNumber(min))
                            options.tickInterval = ticksInfo.minorTickInterval;
                        else
                            options.tickInterval = undefined
                    }
                }
            },
            _getDataType: function(value) {
                return utils.isDate(value) ? 'datetime' : 'numeric'
            },
            _getBusinessDelta: function(type, min, max, base) {
                return type === 'logarithmic' ? mathRound(mathAbs(utils.getLog(min, base) - utils.getLog(max, base))) : mathAbs(min - max)
            },
            _getDeltaCoef: function(screenDelta, max, min, type, base) {
                return screenDelta / this._getBusinessDelta(type, min, max, base)
            },
            _initializeMajorTicksOptions: function(min, max, screenDelta, ticksInfo, options) {
                var businessDelta;
                options.screenDelta = screenDelta;
                $.extend(true, options, {
                    min: min,
                    max: max,
                    screenDelta: screenDelta,
                    isHorizontal: true
                });
                if (utils.isDefined(min) && utils.isDefined(max)) {
                    options.businessDelta = businessDelta = this._getBusinessDelta(options.axisType, min, max, options.base);
                    if (this.needTickIntervalCalculation(businessDelta, ticksInfo.majorTickInterval, options.incidentOccured)) {
                        options.isStartTickGenerated = true;
                        ticksInfo.majorTickInterval = core.tickIntervalCalculator.getTickInterval(options);
                        options.tickInterval = ticksInfo.majorTickInterval
                    }
                }
            },
            _getTextFunc: function(options) {
                return options.getText || function(value) {
                        return value.toString()
                    }
            },
            _generateTicks: function(options) {
                var that = this,
                    ticks = [],
                    tick,
                    boundedRule = options.max - options.min > 0,
                    leftBound,
                    rightBound,
                    tickInterval,
                    isStartTickGenerated = options.isStartTickGenerated,
                    businessDelta,
                    useTicksAutoArrangement = options.useTicksAutoArrangement;
                options.dataType = options.dataType || that._getDataType(options.min);
                options.businessDelta = businessDelta = that._getBusinessDelta(options.axisType, options.min, options.max, options.base);
                if (!utils.isDefined(options.min) || !utils.isDefined(options.max) || isNaN(options.min) || isNaN(options.max)) {
                    ticks = options.isHorizontal ? ['canvas_position_left', 'canvas_position_center', 'canvas_position_right'] : ['canvas_position_bottom', 'canvas_position_middle', 'canvas_position_top'];
                    useTicksAutoArrangement = false;
                    ticks.hideLabels = true
                }
                else {
                    tickInterval = $.isNumeric(options.min) && $.isNumeric(options.max) && !$.isNumeric(options.tickInterval) ? undefined : options.tickInterval;
                    if (this.needTickIntervalCalculation(businessDelta, tickInterval, options.incidentOccured)) {
                        isStartTickGenerated = utils.isDefined(isStartTickGenerated) ? isStartTickGenerated : true;
                        tickInterval = core.tickIntervalCalculator.getTickInterval(options)
                    }
                    ticks.tickInterval = tickInterval;
                    that.isTestStartTickGenerated = isStartTickGenerated;
                    that.isTestTickInterval = tickInterval;
                    that.testGridSpacingFactor = options.gridSpacingFactor;
                    if (tickInterval && tickInterval.valueOf() !== 0 && options.min.valueOf() !== options.max.valueOf()) {
                        tick = isStartTickGenerated ? that._generateStartTick(tickInterval, options) : options.min;
                        do {
                            ticks.push(tick);
                            tick = that._nextTick(tick, tickInterval, options);
                            if (ticks[ticks.length - 1].valueOf() === tick.valueOf())
                                break;
                            leftBound = tick - options.min > 0;
                            rightBound = options.max - tick > 0
                        } while (boundedRule === leftBound && boundedRule === rightBound);
                        ticks.push(tick);
                        that._correctBoundedTicks(options.min, options.max, ticks, options.addMinMax)
                    }
                    if (options.min.valueOf() === options.max.valueOf()) {
                        tick = options.min;
                        ticks.push(tick)
                    }
                }
                return ticks
            },
            _getAutoArrangementStep: function(ticks, options) {
                var that = this,
                    requiredValuesCount,
                    addedSpacing = options.isHorizontal ? options.textSpacing : 0;
                if (options.getCustomAutoArrangementStep)
                    return options.getCustomAutoArrangementStep(ticks, options);
                if (options.maxDisplayValueSize > 0) {
                    requiredValuesCount = mathFloor((options.screenDelta + options.textSpacing) / (options.maxDisplayValueSize + addedSpacing));
                    return mathCeil((options.ticksCount || ticks.length) / requiredValuesCount)
                }
                return 1
            },
            _getAutoArrangementTicks: function(ticks, options, step) {
                var that = this,
                    resultTicks = ticks,
                    i;
                if (step > 1) {
                    resultTicks = [];
                    for (i = 0; i < ticks.length; i += step)
                        resultTicks.push(ticks[i]);
                    resultTicks.tickInterval = ticks.tickInterval * step
                }
                return resultTicks
            },
            isOverlappedTicks: function(ticks, options) {
                options.maxDisplayValueSize = this._getValueSize(ticks, options);
                return this._getAutoArrangementStep(ticks, options) > 1
            },
            getCorrectedTicks: function(ticks, ticksOptions) {
                var step = Math.ceil(core.tickIntervalCalculator.getTickInterval({
                        screenDelta: ticksOptions.screenDelta * 4,
                        businessDelta: ticks.length,
                        gridSpacingFactor: ticksOptions.gridSpacingFactor,
                        numberMultipliers: ticksOptions.numberMultipliers,
                        dataType: "numeric"
                    })) || ticks.length;
                return this._getAutoArrangementTicks(ticks, ticksOptions, step)
            },
            needTickIntervalCalculation: function(businessDelta, tickInterval, incidentOccured) {
                var date;
                if (utils.isDefined(tickInterval)) {
                    if (!utils.isNumber(tickInterval)) {
                        date = new Date;
                        tickInterval = utils.addInterval(date, tickInterval) - date;
                        if (!tickInterval)
                            return true
                    }
                    if (utils.isNumber(tickInterval))
                        if (tickInterval > 0 && businessDelta / tickInterval > TICKS_COUNT_LIMIT) {
                            if (incidentOccured)
                                incidentOccured('W2003')
                        }
                        else
                            return false
                }
                return true
            },
            getTickIntervals: function(min, max, screenDelta, majorTicksOptions, minorTicksOptions, options) {
                var that = this,
                    i,
                    options = options || {},
                    ticksInfo = {
                        majorTickInterval: majorTicksOptions.tickInterval,
                        minorTickInterval: minorTicksOptions.tickInterval,
                        majorTicks: []
                    };
                majorTicksOptions.base = minorTicksOptions.base = options.base;
                majorTicksOptions.axisType = minorTicksOptions.axisType = options.axisType;
                majorTicksOptions.dataType = minorTicksOptions.dataType = options.dataType;
                that._initializeMajorTicksOptions(min, max, screenDelta, ticksInfo, majorTicksOptions);
                if (utils.isDefined(min) && utils.isDefined(max)) {
                    ticksInfo.majorTicks.push(min);
                    ticksInfo.majorTicks.push(that._nextTick(min, ticksInfo.majorTickInterval, {
                        min: min,
                        max: max,
                        setTicksAtUnitBeginning: majorTicksOptions.setTicksAtUnitBeginning,
                        dataType: options.dataType,
                        axisType: options.axisType,
                        base: options.base
                    }));
                    that._initializeMinorTicksOptions(min, max, screenDelta, ticksInfo, minorTicksOptions)
                }
                return ticksInfo
            },
            getFullTicks: function(min, max, screenDelta, majorTicksOptions, minorTicksOptions, options) {
                var that = this,
                    i,
                    options = options || {},
                    ticksInfo = {
                        customBoundaryTicks: [],
                        fullTicks: [],
                        majorTickInterval: majorTicksOptions.tickInterval,
                        majorTicks: [],
                        minorTickInterval: minorTicksOptions.tickInterval,
                        minorTicks: []
                    };
                majorTicksOptions.base = minorTicksOptions.base = options.base;
                majorTicksOptions.axisType = minorTicksOptions.axisType = options.axisType;
                majorTicksOptions.dataType = minorTicksOptions.dataType = options.dataType || that._getDataType(min);
                that._initializeMajorTicksOptions(min, max, screenDelta, ticksInfo, majorTicksOptions);
                ticksInfo.majorTicks = that.getTicks(majorTicksOptions);
                if (utils.isDefined(min) && utils.isDefined(max) && ticksInfo.majorTicks.length > 0) {
                    if (ticksInfo.majorTicks.autoArrangementStep && ticksInfo.majorTicks.autoArrangementStep > 1 && !utils.isDefined(minorTicksOptions.tickInterval) && !utils.isDefined(minorTicksOptions.minorTickCount))
                        minorTicksOptions.tickInterval = ticksInfo.minorTickInterval = majorTicksOptions.tickInterval;
                    that._initializeMinorTicksOptions(min, max, screenDelta, ticksInfo, minorTicksOptions);
                    that._addLeftBoudedTicks(ticksInfo, min, minorTicksOptions);
                    for (i = 0; i < ticksInfo.majorTicks.length - 1; i++) {
                        ticksInfo.fullTicks.push(ticksInfo.majorTicks[i]);
                        that._addMinorTicks(ticksInfo.majorTicks[i], ticksInfo.majorTicks[i + 1], ticksInfo, minorTicksOptions)
                    }
                    that._addRightBoudedTicks(ticksInfo, max, minorTicksOptions)
                }
                return ticksInfo
            },
            getTicks: function(options) {
                var that = this,
                    step,
                    maxDisplayValue,
                    ticks = options.customTicks ? options.customTicks : that._generateTicks(options);
                if (options.useTicksAutoArrangement) {
                    options.maxDisplayValueSize = that._getValueSize(ticks, options);
                    step = that._getAutoArrangementStep(ticks, options);
                    if (step > 1) {
                        if (utils.isDefined(options.tickInterval) || utils.isDefined(options.customTicks)) {
                            utils.isDefined(options.customTicks) && (ticks.tickInterval = options.tickInterval);
                            ticks = that._getAutoArrangementTicks(ticks, options, step)
                        }
                        else
                            ticks = that._generateTicks($.extend({}, options, {gridSpacingFactor: options.maxDisplayValueSize}));
                        ticks.autoArrangementStep = step
                    }
                    that._removeInvalidDatesWithUnitBegining(ticks, options)
                }
                return ticks
            }
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file numericTranslator.js */
    (function($, DX, undefined) {
        var utils = DX.utils,
            isDefined = utils.isDefined,
            getPower = utils.getPower,
            round = Math.round;
        DX.viz.core.numericTranslatorFunctions = {
            translate: function(bp) {
                var that = this,
                    canvasOptions = that._canvasOptions,
                    doubleError = canvasOptions.rangeDoubleError,
                    specialValue = that.translateSpecialCase(bp);
                if (isDefined(specialValue))
                    return specialValue;
                if (isNaN(bp) || bp.valueOf() + doubleError < canvasOptions.rangeMin || bp.valueOf() - doubleError > canvasOptions.rangeMax)
                    return null;
                return round(that._calculateProjection((bp - canvasOptions.rangeMinVisible) * canvasOptions.ratioOfCanvasRange))
            },
            untranslate: function(pos) {
                var canvasOptions = this._canvasOptions,
                    startPoint = canvasOptions.startPoint;
                if (pos < startPoint || pos > canvasOptions.endPoint)
                    return null;
                return this._calculateUnProjection((pos - startPoint) / canvasOptions.ratioOfCanvasRange)
            },
            getInterval: function() {
                return round(this._canvasOptions.ratioOfCanvasRange * (this._businessRange.interval || Math.abs(this._canvasOptions.rangeMax - this._canvasOptions.rangeMin)))
            }
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file datetimeTranslator.js */
    (function($, DX, undefined) {
        var core = DX.viz.core,
            numericTranslator = core.numericTranslatorFunctions;
        core.datetimeTranslatorFunctions = {
            translate: numericTranslator.translate,
            untranslate: function(pos) {
                var result = numericTranslator.untranslate.call(this, pos);
                return result === null ? result : new Date(result)
            },
            getInterval: numericTranslator.getInterval
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file categoryTranslator.js */
    (function($, DX, undefined) {
        var isDefined = DX.utils.isDefined,
            round = Math.round;
        function doubleRound(value) {
            return round(round(value * 10) / 10)
        }
        DX.viz.core.categoryTranslatorFunctions = {
            translate: function(category) {
                var that = this,
                    canvasOptions = that._canvasOptions,
                    categoryRecord = that._categoriesToPoints[category],
                    stickDelta,
                    specialValue = that.translateSpecialCase(category);
                if (isDefined(specialValue))
                    return specialValue;
                if (!categoryRecord)
                    return 0;
                stickDelta = that._businessRange.stick ? categoryRecord.index : categoryRecord.index + 0.5;
                return round(canvasOptions.startPoint + canvasOptions.interval * stickDelta)
            },
            untranslate: function(pos) {
                var that = this,
                    canvasOptions = that._canvasOptions,
                    startPoint = canvasOptions.startPoint,
                    categoriesLength = that._categories.length,
                    result = 0;
                if (pos < startPoint || pos > canvasOptions.endPoint)
                    return null;
                result = doubleRound((pos - startPoint) / canvasOptions.interval + (that._businessRange.stick ? 0.5 : 0) - 0.5);
                if (categoriesLength === result)
                    result--;
                if (canvasOptions.invert)
                    result = categoriesLength - result - 1;
                return that._categories[result]
            },
            getInterval: function() {
                return this._canvasOptions.interval
            }
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file logarithmicTranslator.js */
    (function($, DX, undefined) {
        var core = DX.viz.core,
            numericTranslator = core.numericTranslatorFunctions,
            utils = DX.utils,
            raiseTo = utils.raiseTo,
            getLog = utils.getLog;
        core.logarithmicTranslatorFunctions = {
            translate: function(bp) {
                var that = this,
                    specialValue = that.translateSpecialCase(bp);
                if (utils.isDefined(specialValue))
                    return specialValue;
                return numericTranslator.translate.call(that, getLog(bp, that._businessRange.base))
            },
            untranslate: function(pos) {
                var result = numericTranslator.untranslate.call(this, pos);
                return result === null ? result : raiseTo(result, this._businessRange.base)
            },
            getInterval: numericTranslator.getInterval
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file translator1D.js */
    (function(DX, undefined) {
        var _Number = Number;
        function Translator1D() {
            this.setDomain(arguments[0], arguments[1]).setCodomain(arguments[2], arguments[3])
        }
        Translator1D.prototype = {
            constructor: Translator1D,
            setDomain: function(domain1, domain2) {
                var that = this;
                that._domain1 = _Number(domain1);
                that._domain2 = _Number(domain2);
                that._domainDelta = that._domain2 - that._domain1;
                return that
            },
            setCodomain: function(codomain1, codomain2) {
                var that = this;
                that._codomain1 = _Number(codomain1);
                that._codomain2 = _Number(codomain2);
                that._codomainDelta = that._codomain2 - that._codomain1;
                return that
            },
            getDomain: function() {
                return [this._domain1, this._domain2]
            },
            getCodomain: function() {
                return [this._codomain1, this._codomain2]
            },
            getDomainStart: function() {
                return this._domain1
            },
            getDomainEnd: function() {
                return this._domain2
            },
            getCodomainStart: function() {
                return this._codomain1
            },
            getCodomainEnd: function() {
                return this._codomain2
            },
            getDomainRange: function() {
                return this._domainDelta
            },
            getCodomainRange: function() {
                return this._codomainDelta
            },
            translate: function(value) {
                var ratio = (_Number(value) - this._domain1) / this._domainDelta;
                return 0 <= ratio && ratio <= 1 ? this._codomain1 + ratio * this._codomainDelta : NaN
            },
            adjust: function(value) {
                var ratio = (_Number(value) - this._domain1) / this._domainDelta,
                    result = NaN;
                if (ratio < 0)
                    result = this._domain1;
                else if (ratio > 1)
                    result = this._domain2;
                else if (0 <= ratio && ratio <= 1)
                    result = _Number(value);
                return result
            }
        };
        DX.viz.core.Translator1D = Translator1D
    })(DevExpress);
    /*! Module viz-core, file translator2D.js */
    (function($, DX, undefined) {
        var core = DX.viz.core,
            utils = DX.utils,
            getLog = utils.getLog,
            getPower = utils.getPower,
            raiseTo = utils.raiseTo,
            isDefined = utils.isDefined,
            CANVAS_PROP = ["width", "height", "left", "top", "bottom", "right"],
            NUMBER_EQUALITY_CORRECTION = 1,
            DATETIME_EQUALITY_CORRECTION = 60000;
        var validateCanvas = function(canvas) {
                $.each(CANVAS_PROP, function(_, prop) {
                    canvas[prop] = parseInt(canvas[prop]) || 0
                });
                return canvas
            };
        var raiseToFlooredLog = function(value, base, correction) {
                return raiseTo(Math.floor(getLog(value, base)) + (correction || 0), base)
            };
        var makeCategoriesToPoints = function(categories, invert) {
                var categoriesToPoints = {},
                    category,
                    length = categories.length,
                    i;
                for (i = 0; i < length; i++) {
                    category = categories[i];
                    categoriesToPoints[category] = {
                        name: category,
                        index: invert ? length - 1 - i : i
                    }
                }
                return categoriesToPoints
            };
        var validateBusinessRange = function(businessRange) {
                function validate(valueSelector, baseValueSeletor) {
                    if (!isDefined(businessRange[valueSelector]) && isDefined(businessRange[baseValueSeletor]))
                        businessRange[valueSelector] = businessRange[baseValueSeletor]
                }
                validate("minVisible", "min");
                validate("maxVisible", "max");
                return businessRange
            };
        core.Translator2D = function(businessRange, canvas, options) {
            var that = this;
            that._options = $.extend(that._options || {}, options);
            that._canvas = validateCanvas(canvas);
            that.updateBusinessRange(businessRange)
        };
        $.extend(core.Translator2D.prototype, {
            reinit: function() {
                var that = this,
                    range = that._businessRange,
                    categories = range.categories || [],
                    script = {},
                    canvasOptions = that._prepareCanvasOptions(),
                    interval,
                    correctedCategoriesCount;
                switch (range.axisType) {
                    case"logarithmic":
                        script = core.logarithmicTranslatorFunctions;
                        break;
                    case"discrete":
                        script = core.categoryTranslatorFunctions;
                        that._categories = categories;
                        correctedCategoriesCount = categories.length - (range.stick ? 1 : 0);
                        if (correctedCategoriesCount > 0)
                            interval = canvasOptions.canvasLength / correctedCategoriesCount;
                        else
                            interval = canvasOptions.canvasLength;
                        canvasOptions.interval = interval;
                        that._categoriesToPoints = makeCategoriesToPoints(categories, canvasOptions.invert);
                        break;
                    default:
                        if (range.dataType === "datetime")
                            script = core.datetimeTranslatorFunctions;
                        else
                            script = core.numericTranslatorFunctions
                }
                that.translate = script.translate;
                that.untranslate = script.untranslate;
                that.getInterval = script.getInterval
            },
            _getCanvasBounds: function(range) {
                var min = range.min,
                    max = range.max,
                    minVisible = range.minVisible,
                    maxVisible = range.maxVisible,
                    newMin,
                    newMax,
                    base = range.base,
                    isDateTime = utils.isDate(max) || utils.isDate(min),
                    correction = isDateTime ? DATETIME_EQUALITY_CORRECTION : NUMBER_EQUALITY_CORRECTION;
                if (isDefined(min) && isDefined(max) && min.valueOf() === max.valueOf()) {
                    newMin = min.valueOf() - correction;
                    newMax = max.valueOf() + correction;
                    if (isDateTime) {
                        min = new Date(newMin);
                        max = new Date(newMax)
                    }
                    else {
                        min = min !== 0 ? newMin : 0;
                        max = newMax
                    }
                }
                if (isDefined(minVisible) && isDefined(maxVisible) && minVisible.valueOf() === maxVisible.valueOf()) {
                    newMin = minVisible.valueOf() - correction;
                    newMax = maxVisible.valueOf() + correction;
                    if (isDateTime) {
                        minVisible = newMin < min.valueOf() ? min : new Date(newMin);
                        maxVisible = newMax > max.valueOf() ? max : new Date(newMax)
                    }
                    else {
                        if (minVisible !== 0)
                            minVisible = newMin < min ? min : newMin;
                        maxVisible = newMax > max ? max : newMax
                    }
                }
                if (range.axisType === 'logarithmic') {
                    maxVisible = getLog(maxVisible, base);
                    minVisible = getLog(minVisible, base);
                    min = getLog(min, base);
                    max = getLog(max, base)
                }
                return {
                        base: base,
                        rangeMin: min,
                        rangeMax: max,
                        rangeMinVisible: minVisible,
                        rangeMaxVisible: maxVisible
                    }
            },
            _prepareCanvasOptions: function() {
                var that = this,
                    rangeMin,
                    rangeMax,
                    rangeMinVisible,
                    rangeMaxVisible,
                    businessRange = that._businessRange,
                    canvasOptions = that._canvasOptions = that._getCanvasBounds(businessRange),
                    length;
                if (that._options.direction === "horizontal") {
                    canvasOptions.startPoint = that._canvas.left;
                    length = that._canvas.width;
                    canvasOptions.endPoint = that._canvas.width - that._canvas.right;
                    canvasOptions.invert = businessRange.invert
                }
                else {
                    canvasOptions.startPoint = that._canvas.top;
                    length = that._canvas.height;
                    canvasOptions.endPoint = that._canvas.height - that._canvas.bottom;
                    canvasOptions.invert = !businessRange.invert
                }
                that.canvasLength = canvasOptions.canvasLength = canvasOptions.endPoint - canvasOptions.startPoint;
                canvasOptions.rangeDoubleError = Math.pow(10, getPower(canvasOptions.rangeMax - canvasOptions.rangeMin) - getPower(length) - 2);
                canvasOptions.ratioOfCanvasRange = canvasOptions.canvasLength / (canvasOptions.rangeMaxVisible - canvasOptions.rangeMinVisible);
                return canvasOptions
            },
            updateBusinessRange: function(businessRange) {
                this._businessRange = validateBusinessRange(businessRange);
                this.reinit()
            },
            getBusinessRange: function() {
                return this._businessRange
            },
            getCanvasVisibleArea: function() {
                return {
                        min: this._canvasOptions.startPoint,
                        max: this._canvasOptions.endPoint
                    }
            },
            translateSpecialCase: function(value) {
                var that = this,
                    canvasOptions = that._canvasOptions,
                    startPoint = canvasOptions.startPoint,
                    endPoint = canvasOptions.endPoint,
                    range = that._businessRange,
                    minVisible = range.minVisible,
                    maxVisible = range.maxVisible,
                    invert,
                    result = null;
                switch (value) {
                    case"canvas_position_default":
                        if (minVisible <= 0 && maxVisible >= 0)
                            result = that.translate(0);
                        else {
                            invert = range.invert ^ (minVisible <= 0 && maxVisible <= 0);
                            if (that._options.direction === "horizontal")
                                result = invert ? endPoint : startPoint;
                            else
                                result = invert ? startPoint : endPoint
                        }
                        break;
                    case"canvas_position_left":
                    case"canvas_position_top":
                        result = startPoint;
                        break;
                    case"canvas_position_center":
                    case"canvas_position_middle":
                        result = startPoint + canvasOptions.canvasLength / 2;
                        break;
                    case"canvas_position_right":
                    case"canvas_position_bottom":
                        result = endPoint;
                        break;
                    case"canvas_position_start":
                        result = range.invert ? endPoint : startPoint;
                        break;
                    case"canvas_position_end":
                        result = range.invert ? startPoint : endPoint;
                        break
                }
                return result
            },
            _calculateProjection: function(distance) {
                var canvasOptions = this._canvasOptions;
                return canvasOptions.invert ? canvasOptions.endPoint - distance : canvasOptions.startPoint + distance
            },
            _calculateUnProjection: function(distance) {
                var canvasOptions = this._canvasOptions;
                return canvasOptions.invert ? canvasOptions.rangeMaxVisible.valueOf() - distance : canvasOptions.rangeMinVisible.valueOf() + distance
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file rectangle.js */
    (function(DX, undefined) {
        var isFinite = window.isFinite;
        DX.viz.core.Rectangle = DX.Class.inherit({
            ctor: function(options) {
                var that = this;
                options = options || {};
                that.left = Number(options.left) || 0;
                that.right = Number(options.right) || 0;
                that.top = Number(options.top) || 0;
                that.bottom = Number(options.bottom) || 0
            },
            width: function() {
                return this.right - this.left
            },
            height: function() {
                return this.bottom - this.top
            },
            horizontalMiddle: function() {
                return (this.left + this.right) / 2
            },
            verticalMiddle: function() {
                return (this.top + this.bottom) / 2
            },
            raw: function() {
                var that = this;
                return {
                        left: that.left,
                        top: that.top,
                        right: that.right,
                        bottom: that.bottom
                    }
            },
            clone: function() {
                return new this.constructor(this.raw())
            },
            move: function(dx, dy) {
                var result = this.clone();
                if (isFinite(dx) && isFinite(dy)) {
                    result.left += Number(dx);
                    result.right += Number(dx);
                    result.top += Number(dy);
                    result.bottom += Number(dy)
                }
                return result
            },
            inflate: function(dx, dy) {
                var result = this.clone();
                if (isFinite(dx) && isFinite(dy)) {
                    result.left -= Number(dx);
                    result.right += Number(dx);
                    result.top -= Number(dy);
                    result.bottom += Number(dy)
                }
                return result
            },
            scale: function(factor) {
                var that = this;
                if (factor > 0)
                    return that.inflate(that.width() * (factor - 1) / 2, that.height() * (factor - 1) / 2);
                return that.clone()
            }
        })
    })(DevExpress);
    /*! Module viz-core, file themes.js */
    (function($, DX, undefined) {
        var viz = DX.viz,
            core = viz.core;
        var currentThemeId = 0;
        var findThemeId = function(themeName) {
                var themeId,
                    themes = viz.themes;
                for (themeId = 0; themeId < themes.length; themeId++)
                    if (themes[themeId].name === themeName)
                        return themeId;
                return -1
            };
        core.findTheme = function(themeName) {
            var themeId = findThemeId(themeName),
                themes = viz.themes;
            if (themeId < 0)
                themeId = currentThemeId;
            return themes[themeId]
        };
        core.currentTheme = function(themeName, colorScheme, version) {
            var themeId = -1,
                themes = viz.themes;
            if (themeName === undefined)
                return themes[currentThemeId].name;
            else {
                if (version && colorScheme)
                    themeId = findThemeId(themeName + ':' + version + '-' + colorScheme);
                if (themeId < 0 && version)
                    themeId = findThemeId(themeName + ':' + version);
                if (colorScheme && themeId < 0)
                    themeId = findThemeId(themeName + '-' + colorScheme);
                if (themeId < 0)
                    themeId = findThemeId(themeName);
                currentThemeId = themeId >= 0 ? themeId : 0
            }
        };
        core.registerTheme = function(theme, basedOnThemeName) {
            var baseTheme,
                extendedTheme,
                themes = viz.themes;
            if (!theme || !theme.name || !core.findTheme(theme.name))
                return;
            baseTheme = core.findTheme(basedOnThemeName);
            if (baseTheme) {
                extendedTheme = $.extend(true, {}, baseTheme, theme);
                themes.push(extendedTheme)
            }
            else
                themes.push(theme)
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file palette.js */
    (function(DX, $, undefined) {
        var _String = window.String,
            _Color = DX.Color,
            _isArray = DX.utils.isArray,
            _isString = DX.utils.isString,
            _extend = $.extend;
        var palettes = {
                'default': {
                    simpleSet: ['#5f8b95', '#ba4d51', '#af8a53', '#955f71', '#859666', '#7e688c'],
                    indicatingSet: ['#a3b97c', '#e1b676', '#ec7f83'],
                    gradientSet: ['#5f8b95', '#ba4d51']
                },
                'harmony light': {
                    simpleSet: ['#fcb65e', '#679ec5', '#ad79ce', '#7abd5c', '#e18e92', '#b6d623', '#b7abea', '#85dbd5'],
                    indicatingSet: ['#b6d623', '#fcb65e', '#e18e92'],
                    gradientSet: ['#7abd5c', '#fcb65e']
                },
                'soft pastel': {
                    simpleSet: ['#60a69f', '#78b6d9', '#6682bb', '#a37182', '#eeba69', '#90ba58', '#456c68', '#7565a4'],
                    indicatingSet: ['#90ba58', '#eeba69', '#a37182'],
                    gradientSet: ['#78b6d9', '#eeba69']
                },
                pastel: {
                    simpleSet: ['#bb7862', '#70b3a1', '#bb626a', '#057d85', '#ab394b', '#dac599', '#153459', '#b1d2c6'],
                    indicatingSet: ['#70b3a1', '#dac599', '#bb626a'],
                    gradientSet: ['#bb7862', '#70b3a1']
                },
                bright: {
                    simpleSet: ['#70c92f', '#f8ca00', '#bd1550', '#e97f02', '#9d419c', '#7e4452', '#9ab57e', '#36a3a6'],
                    indicatingSet: ['#70c92f', '#f8ca00', '#bd1550'],
                    gradientSet: ['#e97f02', '#f8ca00']
                },
                soft: {
                    simpleSet: ['#cbc87b', '#9ab57e', '#e55253', '#7e4452', '#e8c267', '#565077', '#6babac', '#ad6082'],
                    indicatingSet: ['#9ab57e', '#e8c267', '#e55253'],
                    gradientSet: ['#9ab57e', '#e8c267']
                },
                ocean: {
                    simpleSet: ['#75c099', '#acc371', '#378a8a', '#5fa26a', '#064970', '#38c5d2', '#00a7c6', '#6f84bb'],
                    indicatingSet: ['#c8e394', '#7bc59d', '#397c8b'],
                    gradientSet: ['#acc371', '#38c5d2']
                },
                vintage: {
                    simpleSet: ['#dea484', '#efc59c', '#cb715e', '#eb9692', '#a85c4c', '#f2c0b5', '#c96374', '#dd956c'],
                    indicatingSet: ['#ffe5c6', '#f4bb9d', '#e57660'],
                    gradientSet: ['#efc59c', '#cb715e']
                },
                violet: {
                    simpleSet: ['#d1a1d1', '#eeacc5', '#7b5685', '#7e7cad', '#a13d73', '#5b41ab', '#e287e2', '#689cc1'],
                    indicatingSet: ['#d8e2f6', '#d0b2da', '#d56a8a'],
                    gradientSet: ['#eeacc5', '#7b5685']
                }
            };
        var currentPaletteName = 'default';
        function currentPalette(name) {
            if (name === undefined)
                return currentPaletteName;
            else {
                name = String(name).toLowerCase();
                currentPaletteName = name in palettes ? name : 'default'
            }
        }
        function getPalette(palette, parameters) {
            var result;
            if (_isArray(palette))
                result = palette;
            else {
                parameters = parameters || {};
                var type = parameters.type || 'simpleSet';
                if (_isString(palette)) {
                    var name = palette.toLowerCase(),
                        baseContainer = palettes[name],
                        themedContainer = parameters.theme && palettes[name + '_' + _String(parameters.theme).toLowerCase()];
                    result = themedContainer && themedContainer[type] || baseContainer && baseContainer[type]
                }
                if (!result)
                    result = palettes[currentPaletteName][type]
            }
            return result ? result.slice(0) : null
        }
        function registerPalette(name, palette, theme) {
            var item = {};
            if (_isArray(palette))
                item.simpleSet = palette.slice(0);
            else if (palette) {
                item.simpleSet = _isArray(palette.simpleSet) ? palette.simpleSet.slice(0) : undefined;
                item.indicatingSet = _isArray(palette.indicatingSet) ? palette.indicatingSet.slice(0) : undefined;
                item.gradientSet = _isArray(palette.gradientSet) ? palette.gradientSet.slice(0) : undefined
            }
            if (item.simpleSet || item.indicatingSet || item.gradientSet) {
                var paletteName = _String(name).toLowerCase();
                if (theme)
                    paletteName = paletteName + '_' + _String(theme).toLowerCase();
                _extend(palettes[paletteName] = palettes[paletteName] || {}, item)
            }
        }
        function RingBuf(buf) {
            var ind = 0;
            this.next = function() {
                var res = buf[ind++];
                if (ind == buf.length)
                    this.reset();
                return res
            };
            this.reset = function() {
                ind = 0
            }
        }
        function Palette(palette, parameters) {
            parameters = parameters || {};
            this._originalPalette = getPalette(palette, parameters);
            var stepHighlight = parameters ? parameters.stepHighlight || 0 : 0;
            this._paletteSteps = new RingBuf([0, stepHighlight, -stepHighlight]);
            this._resetPalette()
        }
        _extend(Palette.prototype, {
            dispose: function() {
                this._originalPalette = this._palette = this._paletteSteps = null;
                return this
            },
            getNextColor: function() {
                var that = this;
                if (that._currentColor >= that._palette.length)
                    that._resetPalette();
                return that._palette[that._currentColor++]
            },
            _resetPalette: function() {
                var that = this;
                that._currentColor = 0;
                var step = that._paletteSteps.next(),
                    originalPalette = that._originalPalette;
                if (step) {
                    var palette = that._palette = [],
                        i = 0,
                        ii = originalPalette.length;
                    for (; i < ii; ++i)
                        palette[i] = getNewColor(originalPalette[i], step)
                }
                else
                    that._palette = originalPalette.slice(0)
            },
            reset: function() {
                this._paletteSteps.reset();
                this._resetPalette();
                return this
            }
        });
        function getNewColor(currentColor, step) {
            var newColor = new _Color(currentColor).alter(step),
                lightness = getLightness(newColor);
            if (lightness > 200 || lightness < 55)
                newColor = new _Color(currentColor).alter(-step / 2);
            return newColor.toHex()
        }
        function getLightness(color) {
            return color.r * 0.3 + color.g * 0.59 + color.b * 0.11
        }
        function GradientPalette(source, size) {
            var palette = getPalette(source, {type: 'gradientSet'});
            palette = size > 0 ? createGradientColors(palette[0], palette[1], size) : [];
            this.getColor = function(index) {
                return palette[index] || null
            };
            this._DEBUG_source = source;
            this._DEBUG_size = size
        }
        function createGradientColors(start, end, count) {
            var startColor = new _Color(start),
                endColor = new _Color(end);
            if (count === 1)
                return [startColor.blend(endColor, 0.5).toHex()];
            else {
                var list = [],
                    step = 1 / (count - 1),
                    i,
                    ii = count;
                list.push(0);
                for (i = 1; i < ii - 1; ++i)
                    list.push(step * i);
                list.push(1);
                for (i = 0; i < ii; ++i)
                    list[i] = startColor.blend(endColor, list[i]).toHex();
                return list
            }
        }
        _extend(DX.viz.core, {
            registerPalette: registerPalette,
            getPalette: getPalette,
            Palette: Palette,
            GradientPalette: GradientPalette,
            currentPalette: currentPalette
        });
        DX.viz.core._DEBUG_palettes = palettes
    })(DevExpress, jQuery);
    /*! Module viz-core, file baseThemeManager.js */
    (function(DX, $, undefined) {
        var _isString = DX.utils.isString,
            _findTheme = DX.viz.core.findTheme,
            _extend = $.extend,
            _each = $.each;
        DX.viz.core.BaseThemeManager = DX.Class.inherit({
            dispose: function() {
                this._theme = this._font = null;
                return this
            },
            setTheme: function(theme) {
                theme = theme || {};
                var that = this,
                    themeObj = _findTheme(_isString(theme) ? theme : theme.name);
                that._themeName = themeObj.name;
                that._font = _extend({}, themeObj.font, theme.font);
                that._themeSection && _each(that._themeSection.split('.'), function(_, path) {
                    themeObj = _extend(true, {}, themeObj[path], that._IE8 ? themeObj[path + 'IE8'] : {})
                });
                that._theme = _extend(true, {}, themeObj, _isString(theme) ? {} : theme);
                that._initializeTheme();
                return that
            },
            theme: function() {
                return this._theme
            },
            themeName: function() {
                return this._themeName
            },
            _initializeTheme: function(){},
            _initializeFont: function(font) {
                _extend(font, this._font, _extend({}, font))
            }
        })
    })(DevExpress, jQuery);
    /*! Module viz-core, file textCloud.js */
    (function(DX, undefined) {
        var min = Math.min;
        DX.viz.core.TextCloud = DX.Class.inherit(function() {
            var DEFAULT_OPTIONS = {
                    horMargin: 8,
                    verMargin: 4,
                    tailLength: 10
                };
            var COEFFICIENTS_MAP = {};
            COEFFICIENTS_MAP['right-bottom'] = COEFFICIENTS_MAP['rb'] = [0, -1, -1, 0, 0, 1, 1, 0];
            COEFFICIENTS_MAP['bottom-right'] = COEFFICIENTS_MAP['br'] = [-1, 0, 0, -1, 1, 0, 0, 1];
            COEFFICIENTS_MAP['left-bottom'] = COEFFICIENTS_MAP['lb'] = [0, -1, 1, 0, 0, 1, -1, 0];
            COEFFICIENTS_MAP['bottom-left'] = COEFFICIENTS_MAP['bl'] = [1, 0, 0, -1, -1, 0, 0, 1];
            COEFFICIENTS_MAP['left-top'] = COEFFICIENTS_MAP['lt'] = [0, 1, 1, 0, 0, -1, -1, 0];
            COEFFICIENTS_MAP['top-left'] = COEFFICIENTS_MAP['tl'] = [1, 0, 0, 1, -1, 0, 0, -1];
            COEFFICIENTS_MAP['right-top'] = COEFFICIENTS_MAP['rt'] = [0, 1, -1, 0, 0, -1, 1, 0];
            COEFFICIENTS_MAP['top-right'] = COEFFICIENTS_MAP['tr'] = [-1, 0, 0, 1, 1, 0, 0, -1];
            return {
                    setup: function(options) {
                        var that = this,
                            ops = $.extend({}, DEFAULT_OPTIONS, options),
                            x = ops.x,
                            y = ops.y,
                            type = COEFFICIENTS_MAP[ops.type],
                            cloudWidth = ops.textWidth + 2 * ops.horMargin,
                            cloudHeight = ops.textHeight + 2 * ops.verMargin,
                            tailWidth = ops.tailLength,
                            tailHeight = tailWidth,
                            cx = x,
                            cy = y;
                        if (type[0] & 1)
                            tailHeight = min(tailHeight, cloudHeight / 3);
                        else
                            tailWidth = min(tailWidth, cloudWidth / 3);
                        that._points = [x, y, x += type[0] * (cloudWidth + tailWidth), y += type[1] * (cloudHeight + tailHeight), x += type[2] * cloudWidth, y += type[3] * cloudHeight, x += type[4] * cloudWidth, y += type[5] * cloudHeight, x += type[6] * (cloudWidth - tailWidth), y += type[7] * (cloudHeight - tailHeight)];
                        that._cx = cx + type[0] * tailWidth + (type[0] + type[2]) * cloudWidth / 2;
                        that._cy = cy + type[1] * tailHeight + (type[1] + type[3]) * cloudHeight / 2;
                        that._cloudWidth = cloudWidth;
                        that._cloudHeight = cloudHeight;
                        that._tailLength = ops.tailLength;
                        return that
                    },
                    points: function() {
                        return this._points.slice(0)
                    },
                    cx: function() {
                        return this._cx
                    },
                    cy: function() {
                        return this._cy
                    },
                    width: function() {
                        return this._cloudWidth
                    },
                    height: function() {
                        return this._cloudHeight
                    },
                    tailLength: function() {
                        return this._tailLength
                    }
                }
        }())
    })(DevExpress);
    /*! Module viz-core, file parseUtils.js */
    (function($, DX) {
        var viz = DX.viz,
            core = viz.core,
            Class = DX.Class,
            isDefined = DX.utils.isDefined;
        var parseUtils = Class.inherit({
                ctor: function(options) {
                    options = options || {};
                    this._incidentOccured = $.isFunction(options.incidentOccured) ? options.incidentOccured : $.noop
                },
                correctValueType: function(type) {
                    return type === 'numeric' || type === 'datetime' || type === 'string' ? type : ''
                },
                _parsers: {
                    string: function(val) {
                        return isDefined(val) ? '' + val : val
                    },
                    numeric: function(val) {
                        if (!isDefined(val))
                            return val;
                        var parsedVal = Number(val);
                        if (isNaN(parsedVal))
                            parsedVal = undefined;
                        return parsedVal
                    },
                    datetime: function(val) {
                        if (!isDefined(val))
                            return val;
                        var parsedVal,
                            numVal = Number(val);
                        if (!isNaN(numVal))
                            parsedVal = new Date(numVal);
                        else
                            parsedVal = new Date(val);
                        if (isNaN(Number(parsedVal)))
                            parsedVal = undefined;
                        return parsedVal
                    }
                },
                getParser: function(valueType, entity) {
                    var that = this,
                        parser,
                        message = 'valueType is unknown.';
                    if (entity)
                        message = 'The type specified as the "valueType" field of the ' + entity + ' configuration object is unknown.';
                    valueType = that.correctValueType(valueType);
                    parser = that._parsers[valueType];
                    if (!parser)
                        this._incidentOccured.call(null, message);
                    return parser || $.noop
                }
            });
        core.ParseUtils = parseUtils
    })(jQuery, DevExpress);
    /*! Module viz-core, file utils.js */
    (function($, DX) {
        var core = DX.viz.core,
            math = Math;
        core.utils = {decreaseGaps: function(object, keys, decrease) {
                var arrayGaps,
                    eachDecrease,
                    middleValue;
                do {
                    arrayGaps = $.map(keys, function(key) {
                        return object[key] ? object[key] : null
                    });
                    middleValue = math.ceil(decrease / arrayGaps.length);
                    arrayGaps.push(middleValue);
                    eachDecrease = math.min.apply(null, arrayGaps);
                    $.each(keys, function(_, key) {
                        if (object[key]) {
                            object[key] -= eachDecrease;
                            decrease -= eachDecrease
                        }
                    })
                } while (decrease > 0 && arrayGaps.length > 1);
                return decrease
            }}
    })(jQuery, DevExpress);
    /*! Module viz-core, file loadIndicator.js */
    (function($, DX) {
        var viz = DX.viz,
            core = viz.core,
            ANIMATION_SETTINGS = {
                easing: 'linear',
                duration: 150
            },
            INVISIBLE_POINT = {
                x: -10000,
                y: -10000
            };
        var applySettings = function(element, settings, animate, complete) {
                var prevAnimation = element.animation;
                if (prevAnimation) {
                    prevAnimation.options.complete = null;
                    prevAnimation.stop()
                }
                if (animate)
                    element.animate(settings, {complete: complete});
                else {
                    element.applySettings(settings);
                    complete && complete()
                }
            };
        core.LoadIndicator = DX.Class.inherit({
            ctor: function(options, widgetContainer) {
                var that = this;
                that._$widgetContainer = $(widgetContainer);
                that._$container = $('<div>', {css: {
                        position: 'relative',
                        height: 0,
                        padding: 0,
                        margin: 0,
                        border: 0
                    }}).appendTo(that._$widgetContainer);
                that._updateContainer();
                that.applyOptions(options);
                that._endLoadingCompleteHandler = function() {
                    that._endLoad = false;
                    that._externalComplete && that._externalComplete();
                    that._externalComplete = null;
                    that._onCompleteAction && that[that._onCompleteAction]();
                    that._onCompleteAction = null
                };
                that._$container.hide()
            },
            _updateRenderer: function(width, height, top) {
                if (this._renderer)
                    this._renderer.recreateCanvas(width, height);
                else if (this._$container.get(0)) {
                    this._renderer = new viz.renderers.Renderer({
                        width: width,
                        height: height,
                        animation: ANIMATION_SETTINGS
                    });
                    this._renderer.draw(this._$container[0])
                }
                this._renderer && this._renderer.getRoot().applySettings({style: {
                        position: 'absolute',
                        top: top,
                        left: 0
                    }});
                return this._renderer
            },
            applyOptions: function(options, width, height) {
                var pane = this._pane;
                if (pane && options) {
                    pane.rect.applySettings({fill: options.backgroundColor});
                    pane.text.applySettings({
                        font: options.font,
                        text: options.text
                    })
                }
                if (this.isShown && (width || height))
                    this._updateContainer(width, height)
            },
            _draw: function() {
                var pane,
                    renderer = this._renderer;
                if (renderer) {
                    pane = this._pane = {};
                    pane.rect = renderer.createRect(0, 0, 0, 0, 0, {opacity: 0}).append();
                    pane.text = renderer.createText('', 0, 0, {
                        align: 'center',
                        translateX: INVISIBLE_POINT.x,
                        translateY: INVISIBLE_POINT.y
                    }).append()
                }
            },
            _updateContainer: function(width, height) {
                var that = this,
                    $widgetContainer = that._$widgetContainer,
                    canvasTop;
                width = width || $widgetContainer.width();
                height = height || $widgetContainer.height();
                if ($widgetContainer.get(0))
                    canvasTop = $widgetContainer.offset().top - that._$container.offset().top;
                else
                    canvasTop = -height;
                that._updateRenderer(width, height, canvasTop);
                if (!that._pane)
                    that._draw();
                else {
                    that._pane.rect.applySettings({
                        width: width,
                        height: height
                    });
                    that._pane.text.move(width / 2, height / 2)
                }
            },
            dispose: function() {
                this._$widgetContainer = null;
                this._$container.remove().detach();
                this._$container = null;
                this._renderer.dispose();
                this._renderer = null;
                this._pane = null
            },
            toForeground: function() {
                this._$container.appendTo(this._$widgetContainer)
            },
            show: function(width, height) {
                if (this._endLoad) {
                    this._onCompleteAction = 'show';
                    return
                }
                this._$container.show();
                this._updateContainer(width, height);
                applySettings(this._pane.rect, {opacity: 0.85}, true);
                this.isShown = true
            },
            endLoading: function(complete, disableAnimation) {
                this._externalComplete = complete;
                if (this._endLoad)
                    return;
                if (this.isShown) {
                    this._endLoad = true;
                    applySettings(this._pane.rect, {opacity: 1}, !disableAnimation, this._endLoadingCompleteHandler)
                }
                else
                    complete && complete()
            },
            hide: function() {
                var that = this;
                if (this._endLoad) {
                    this._onCompleteAction = 'hide';
                    return
                }
                if (this.isShown) {
                    this._pane.text.move(INVISIBLE_POINT.x, INVISIBLE_POINT.y);
                    applySettings(that._pane.rect, {opacity: 0}, true, function() {
                        that._$container.hide()
                    });
                    this.isShown = false
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file tooltip.js */
    (function($, DX, undefined) {
        var ARROW_WIDTH = 20,
            MAX_SHADOW_SIZE = 10,
            formatHelper = DX.formatHelper,
            X_INTERVAL = 15,
            _max = Math.max,
            _round = Math.round,
            _isFunction = DX.utils.isFunction,
            _isDefined = DX.utils.isDefined,
            _extend = $.extend,
            FORMAT_PRECISION = {
                argument: ['argumentFormat', 'argumentPrecision'],
                percent: ['percent', 'percentPrecision'],
                value: ['format', 'precision']
            },
            VISIBLE = {visibility: 'visible'},
            HIDDEN = {visibility: 'hidden'},
            LEFT = 'left',
            RIGHT = 'right';
        DX.viz.core.Tooltip = DX.Class.inherit({
            ctor: function(options, group, renderer) {
                this._state = {};
                this._options = {};
                this._renderer = renderer;
                this._group = group;
                this._cloud = renderer.createArea();
                this._textGroup = renderer.createGroup();
                if (!$.isEmptyObject(options))
                    this.update(options);
                this._createTextContent()
            },
            dispose: function() {
                this._shadow.dispose();
                this._shadow = null;
                this._cloud = null;
                this._text = null;
                this._group = null;
                this._options = null;
                this._renderer = null;
                this._tooltipTextArray = null;
                this._textGroup = null;
                return this
            },
            update: function(options) {
                options = options || {};
                var that = this,
                    group = that._group,
                    shadowOptions = options.shadow || {},
                    shadow = that._shadow = that._shadow || that._renderer.createFilter('shadow').applySettings({
                        width: '200%',
                        height: '200%',
                        color: shadowOptions.color,
                        opacity: shadowOptions.opacity,
                        dx: shadowOptions.offsetX,
                        dy: shadowOptions.offsetY,
                        blur: shadowOptions.blur,
                        x: '-50%',
                        y: '-50%'
                    }),
                    borderSettings = options.border,
                    shapeSettings = _extend({
                        opacity: options.opacity,
                        filter: shadow.append().ref
                    }, borderSettings && borderSettings.visible ? {
                        strokeWidth: borderSettings.width,
                        stroke: borderSettings.color,
                        strokeOpacity: borderSettings.opacity,
                        dashStyle: borderSettings.dashStyle
                    } : {
                        strokeWidth: null,
                        stroke: null
                    }),
                    textSettings = _extend({}, {
                        align: 'center',
                        font: options.font
                    }, options.text);
                that._options = options;
                that.setSize(options.canvasWidth, options.canvasHeight);
                that._customizeTooltip = _isFunction(options.customizeTooltip) ? options.customizeTooltip : null;
                if (!that._customizeTooltip && _isFunction(options.customizeText))
                    that._customizeTooltip = function() {
                        return {text: options.customizeText.apply(this, arguments)}
                    };
                that._cloud.applySettings(shapeSettings).append(group);
                that._text && options.font && that._text.applySettings({font: {size: options.font.size}});
                that._textGroup.applySettings(textSettings).append(group);
                that.hide();
                return that
            },
            formatValue: function(value, specialFormat) {
                var formatObj = FORMAT_PRECISION[specialFormat || 'value'],
                    format = formatObj[0] in this._options ? this._options[formatObj[0]] : specialFormat;
                return formatHelper.format(value, format, this._options[formatObj[1]] || 0)
            },
            prepare: function(formatObject, params, defaultTextValueField) {
                this._state = this._state || {};
                defaultTextValueField = defaultTextValueField || 'valueText';
                var defaultText = formatObject[defaultTextValueField] || '';
                _extend(this._state, params);
                if (this._customizeTooltip) {
                    var customize = this._customizeTooltip.call(formatObject, formatObject);
                    customize = $.isPlainObject(customize) ? customize : {};
                    if ('text' in customize)
                        this._state.text = _isDefined(customize.text) ? String(customize.text) : '';
                    else {
                        if ($.isArray(defaultText)) {
                            this._options._justify = true;
                            this._createTextContent();
                            defaultText = defaultText.join('<br/>')
                        }
                        this._state.text = defaultText
                    }
                    this._state.color = customize.color || this._options.color
                }
                else {
                    this._state.text = defaultText;
                    this._state.color = this._options.color
                }
                if (this._options._justify)
                    this._state.text = this._state.text.split('<br/>');
                if (this._state.visibility == VISIBLE && !!this._state.text)
                    this.show();
                return !!this._state.text
            },
            enabled: function() {
                return !!this._options.enabled
            },
            formatColorTooltip: function(that) {
                return that._customizeTooltip && that._customizeTooltip.call(this, this)
            },
            _getData: function() {
                var that = this,
                    x = that._state.x,
                    y = that._state.y,
                    xt = x,
                    yt = y,
                    align = 'center',
                    points = [],
                    bbox = that._state.textBBox,
                    options = that._options,
                    paddingLeftRight = options.paddingLeftRight,
                    paddingTopBottom = options.paddingTopBottom,
                    arrowLength = options.arrowLength > 0 ? options.arrowLength : 0,
                    horPosition = options.cloudHorizontalPosition,
                    verPosition = options.cloudVerticalPosition,
                    isHorPositionDefined = horPosition !== undefined && horPosition !== null,
                    isVerPositionDefined = verPosition !== undefined && verPosition !== null,
                    cloudWidth = bbox.width + paddingLeftRight * 2,
                    cloudHeight = bbox.height + paddingTopBottom * 2,
                    updatedText;
                updatedText = that._checkWidthText(cloudWidth, cloudHeight);
                if (updatedText) {
                    that._state.textBBox = bbox = updatedText.bbox;
                    cloudWidth = updatedText.cloudWidth;
                    cloudHeight = updatedText.cloudHeight;
                    paddingLeftRight = updatedText.paddingLeftRight;
                    paddingTopBottom = updatedText.paddingTopBottom
                }
                if (isHorPositionDefined ? horPosition === RIGHT : cloudWidth / 2 > x) {
                    points = that._setArrowLeft(cloudWidth, cloudHeight, arrowLength, x, y);
                    align = LEFT;
                    xt += paddingLeftRight
                }
                else if (isHorPositionDefined ? horPosition === LEFT : x + cloudWidth / 2 > that._canvasWidth) {
                    points = that._setArrowRight(cloudWidth, cloudHeight, arrowLength, x, y);
                    align = RIGHT;
                    xt -= paddingLeftRight
                }
                else
                    points = that._setArrowCenter(cloudWidth, cloudHeight, arrowLength, x, y);
                if (isVerPositionDefined ? verPosition === 'top' : cloudHeight + arrowLength < y) {
                    yt -= arrowLength + cloudHeight / 2 - bbox.height / 2 + that._state.offset;
                    that.tooltipInverted = false
                }
                else {
                    yt += arrowLength + cloudHeight / 2 + bbox.height / 2 + that._state.offset;
                    that.tooltipInverted = true
                }
                yt = that._correctYTextContent(yt);
                return {
                        points: points,
                        text: {
                            x: xt,
                            y: yt,
                            align: align
                        }
                    }
            },
            _updateTextContent: function() {
                if (this._options._justify) {
                    this._textGroup.clear();
                    this._calculateTextContent();
                    this._locateTextContent(0, 0, 'center')
                }
                else
                    this._text.updateText(this._state.text);
                this._state.textBBox = this._textGroup.getBBox()
            },
            _correctYTextContent: function(y) {
                var bbox;
                if (this._options._justify) {
                    this._locateTextContent(0, y, 'center');
                    bbox = this._textGroup.getBBox()
                }
                else {
                    this._text.applySettings({y: y});
                    bbox = this._text.getBBox()
                }
                return y - (bbox.y + bbox.height - y)
            },
            _adjustTextContent: function(data) {
                if (this._options._justify)
                    this._locateTextContent(data.text.x, data.text.y, data.text.align);
                else
                    this._text.applySettings({
                        x: data.text.x,
                        y: data.text.y,
                        align: data.text.align
                    })
            },
            _updateTooltip: function() {
                var that = this,
                    box,
                    data,
                    scale;
                data = that._getData();
                that._cloud.applySettings({
                    points: data.points,
                    fill: that._state.color,
                    'class': that._state.className
                });
                that._adjustTextContent(data);
                box = that._group.getBBox();
                if (box.y + box.height > that._canvasHeight) {
                    scale = (that._canvasHeight - box.y) / box.height;
                    that._group.applySettings({
                        scale: scale,
                        translateX: that._state.x * (1 - scale),
                        translateY: that._state.y * (1 - scale)
                    })
                }
                else
                    that._group.applySettings({
                        scale: 1,
                        translateX: 0,
                        translateY: 0
                    })
            },
            _createTextContent: function() {
                var that = this,
                    options = that._options,
                    fontSize;
                that._textGroup.clear();
                that._text = null;
                if (!options._justify) {
                    fontSize = options.font && options.font.size;
                    that._text = that._renderer.createText(undefined, 0, 0, {font: {size: fontSize}}).append(that._textGroup)
                }
            },
            _getTextContentParams: function() {
                var that = this,
                    i,
                    text,
                    textBBox,
                    textArray = that._state.text,
                    textArrayLength = textArray.length,
                    textParams = {
                        width: [],
                        height: []
                    };
                that._tooltipTextArray = [];
                for (i = 0; i < textArrayLength; i++) {
                    text = that._renderer.createText(textArray[i], 0, 0, {}).append(this._textGroup);
                    that._tooltipTextArray.push(text);
                    textBBox = text.getBBox();
                    textParams.width.push(textBBox.width)
                }
                that._lineHeight = -2 * textBBox.y - textBBox.height;
                return textParams
            },
            _locateTextContent: function(x, y, alignment) {
                var that = this,
                    tooltipTextArray = that._tooltipTextArray,
                    textWidth = that._textContentWidth,
                    lineSpacing = that._options.lineSpacing,
                    yDelta = (lineSpacing > 0 ? lineSpacing : 0) + that._lineHeight,
                    leftXCoord,
                    rightXCoord,
                    i,
                    rtl = that._options._rtl;
                if (alignment === LEFT)
                    leftXCoord = x;
                else if (alignment === RIGHT)
                    leftXCoord = x - textWidth;
                else
                    leftXCoord = _round(x - textWidth / 2);
                rightXCoord = leftXCoord + textWidth;
                for (i = tooltipTextArray.length - 1; i >= 0; i -= 2) {
                    tooltipTextArray[i].applySettings({
                        x: !rtl ? rightXCoord : leftXCoord,
                        y: y,
                        align: !rtl ? RIGHT : LEFT
                    });
                    if (tooltipTextArray[i - 1])
                        tooltipTextArray[i - 1].applySettings({
                            x: !rtl ? leftXCoord : rightXCoord,
                            y: y,
                            align: !rtl ? LEFT : RIGHT
                        });
                    y -= yDelta
                }
            },
            _calculateTextContent: function() {
                var that = this,
                    textArray = that._state.text,
                    textArrayLength = textArray.length,
                    textParams,
                    width,
                    stringWidthArray = [],
                    i;
                textParams = that._getTextContentParams();
                for (i = 0; i < textArrayLength; i += 2) {
                    if (textParams.width[i + 1])
                        width = textParams.width[i] + X_INTERVAL + textParams.width[i + 1];
                    else
                        width = textParams.width[i];
                    stringWidthArray.push(width)
                }
                that._textContentWidth = _max.apply(null, stringWidthArray)
            },
            setSize: function(width, height) {
                this._canvasWidth = _isDefined(width) ? width : this._canvasWidth;
                this._canvasHeight = _isDefined(height) ? height : this._canvasHeight;
                return this
            },
            getBBox: function() {
                var that = this,
                    options = that._options,
                    paddingLeftRight = options.paddingLeftRight || 0,
                    paddingTopBottom = options.paddingTopBottom || 0,
                    borderWidth = options.border.visible && options.border.width || 0,
                    tooltipBBox = that._textGroup.getBBox();
                return tooltipBBox.isEmpty ? tooltipBBox : {
                        x: tooltipBBox.x - paddingLeftRight - borderWidth / 2 - MAX_SHADOW_SIZE,
                        y: tooltipBBox.y - paddingTopBottom - borderWidth / 2 - MAX_SHADOW_SIZE,
                        height: tooltipBBox.height + 2 * paddingTopBottom + borderWidth + MAX_SHADOW_SIZE * 2,
                        width: tooltipBBox.width + 2 * paddingLeftRight + borderWidth + MAX_SHADOW_SIZE * 2,
                        isEmpty: false
                    }
            },
            show: function() {
                this._state.visibility = VISIBLE;
                this._updateTextContent();
                this.move(this._state.x, this._state.y, this._state.offset);
                this._cloud.applySettings(VISIBLE);
                this._textGroup.applySettings(VISIBLE);
                return this
            },
            hide: function() {
                this._state.visibility = HIDDEN;
                this._cloud.applySettings(HIDDEN);
                this._textGroup.applySettings(HIDDEN);
                return this
            },
            move: function(x, y, offset) {
                this._state.x = _isDefined(x) ? x : this._state.x || 0;
                this._state.y = _isDefined(y) ? y : this._state.y || 0;
                this._state.offset = _isDefined(offset) ? offset : this._state.offset || 0;
                this._updateTooltip();
                return this
            },
            _setArrowCenter: function(cloudWidth, cloudHeight, arrowLength, x, y) {
                var that = this,
                    position = that._options.cloudVerticalPosition,
                    isPosDefined = position !== undefined && position !== null,
                    verticalInvert = !(isPosDefined ? position === 'top' : cloudHeight + arrowLength < y),
                    x0 = x,
                    y0 = verticalInvert ? y + that._state.offset : y - that._state.offset,
                    x1 = x0 + ARROW_WIDTH / 2,
                    y1 = verticalInvert ? y0 + arrowLength : y0 - arrowLength,
                    x2 = x1 + cloudWidth / 2 - ARROW_WIDTH / 2,
                    y2 = y1,
                    x3 = x2,
                    y3 = verticalInvert ? y2 + cloudHeight : y2 - cloudHeight,
                    x4 = x3 - cloudWidth,
                    y4 = y3,
                    x5 = x4,
                    y5 = verticalInvert ? y4 - cloudHeight : y4 + cloudHeight,
                    x6 = x5 + cloudWidth / 2 - ARROW_WIDTH / 2,
                    y6 = y5;
                return [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6]
            },
            _setArrowLeft: function(cloudWidth, cloudHeight, arrowLength, x, y) {
                var that = this,
                    position = that._options.cloudVerticalPosition,
                    isPosDefined = position !== undefined && position !== null,
                    verticalInvert = !(isPosDefined ? position === 'top' : cloudHeight + arrowLength < y),
                    x0 = x,
                    y0 = verticalInvert ? y + that._state.offset : y - that._state.offset,
                    x1 = x0 + ARROW_WIDTH,
                    y1 = verticalInvert ? y0 + arrowLength : y0 - arrowLength,
                    x2 = x1 + cloudWidth - ARROW_WIDTH,
                    y2 = y1,
                    x3 = x2,
                    y3 = verticalInvert ? y2 + cloudHeight : y2 - cloudHeight,
                    x4 = x3 - cloudWidth,
                    y4 = y3,
                    x5 = x4,
                    y5 = verticalInvert ? y4 - cloudHeight - arrowLength : y4 + cloudHeight + arrowLength;
                return [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5]
            },
            _setArrowRight: function(cloudWidth, cloudHeight, arrowLength, x, y) {
                var that = this,
                    position = that._options.cloudVerticalPosition,
                    isPosDefined = position !== undefined && position !== null,
                    verticalInvert = !(isPosDefined ? position === 'top' : cloudHeight + arrowLength < y),
                    x0 = x,
                    y0 = verticalInvert ? y + that._state.offset : y - that._state.offset,
                    x1 = x0,
                    y1 = verticalInvert ? y0 + arrowLength + cloudHeight : y0 - arrowLength - cloudHeight,
                    x2 = x1 - cloudWidth,
                    y2 = y1,
                    x3 = x2,
                    y3 = verticalInvert ? y2 - cloudHeight : y2 + cloudHeight,
                    x4 = x3 + cloudWidth - ARROW_WIDTH,
                    y4 = y3,
                    x5 = x4 + ARROW_WIDTH,
                    y5 = verticalInvert ? y4 - arrowLength : y4 + arrowLength;
                return [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5]
            },
            _checkWidthText: function(cloudWidth, cloudHeight) {
                if (this._options._justify)
                    return;
                var x = this._state.x,
                    text = this._state.text,
                    index,
                    paddingLeftRight = this._options.paddingLeftRight,
                    paddingTopBottom = this._options.paddingTopBottom,
                    textLength,
                    maxTooltipWidth,
                    remainLength,
                    newIndex,
                    bbox = this._state.textBBox;
                if (cloudWidth < x || x + cloudWidth < this._canvasWidth || cloudWidth / 2 < x && x + cloudWidth / 2 < this._canvasWidth)
                    return false;
                if (text.indexOf("<br/>") === -1 && text.indexOf(" ") !== -1) {
                    maxTooltipWidth = _max(x, this._canvasWidth - x, 2 * Math.min(x, this._canvasWidth - x));
                    textLength = text.length * maxTooltipWidth / bbox.width;
                    index = text.substr(0, ~~textLength).lastIndexOf(" ");
                    if (index === -1)
                        index = text.substr(0).indexOf(" ");
                    remainLength = text.substr(index + 1).length;
                    this._state.text = text.substr(0, index) + "<br/>";
                    while (textLength <= remainLength) {
                        newIndex = text.substr(index + 1, ~~textLength).lastIndexOf(" ");
                        if (newIndex === -1)
                            newIndex = text.substr(index + 1).indexOf(" ");
                        if (newIndex !== -1) {
                            this._state.text += text.substr(index + 1, newIndex) + "<br/>";
                            remainLength = text.substr(index + 1 + newIndex).length;
                            index += newIndex + 1
                        }
                        else
                            break
                    }
                    this._state.text += text.substr(index + 1);
                    this._text.updateText(this._state.text);
                    bbox = this._text.getBBox();
                    cloudWidth = bbox.width + paddingLeftRight * 2;
                    cloudHeight = bbox.height + paddingTopBottom * 2
                }
                if (cloudWidth > x && x + cloudWidth > this._canvasWidth && (cloudWidth / 2 > x || x + cloudWidth / 2 > this._canvasWidth)) {
                    paddingLeftRight = 5;
                    paddingTopBottom = 5;
                    cloudWidth = bbox.width + 2 * paddingLeftRight;
                    cloudHeight = bbox.height + 2 * paddingTopBottom
                }
                return {
                        bbox: bbox,
                        cloudWidth: cloudWidth,
                        cloudHeight: cloudHeight,
                        paddingTopBottom: paddingTopBottom,
                        paddingLeftRight: paddingLeftRight
                    }
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file legend.js */
    (function(DX, $, undefined) {
        var DEFAULT_MARGIN = 10,
            _math = Math,
            _round = _math.round,
            _ceil = _math.ceil,
            _floor = _math.floor,
            CENTER = 'center',
            RIGHT = 'right',
            LEFT = 'left',
            TOP = 'top',
            BOTTOM = 'bottom',
            HORIZONTAL = 'horizontal',
            VERTICAL = 'vertical',
            INSIDE = 'inside',
            OUTSIDE = 'outside',
            NONE = 'none',
            decreaseGaps = DevExpress.viz.core.utils.decreaseGaps,
            DEFAULT_MARKER_HATCHING_WIDTH = 2,
            DEFAULT_MARKER_HATCHING_STEP = 5;
        function getPatternId(renderer, states, action, color) {
            if (!states)
                return;
            var direction = states[action].hatching.direction,
                hatching,
                colorFromAction = states[action].fill;
            color = colorFromAction === NONE ? color : colorFromAction;
            direction = !direction || direction === NONE ? RIGHT : direction;
            hatching = $.extend({}, states[action].hatching, {
                direction: direction,
                step: DEFAULT_MARKER_HATCHING_STEP,
                width: DEFAULT_MARKER_HATCHING_WIDTH
            });
            return renderer.createPattern(color, hatching).append().id
        }
        DX.viz.core.Legend = DX.Class.inherit({
            ctor: function(data, options, renderer, group) {
                var that = this;
                that._renderer = renderer;
                that._legendGroup = group;
                that._markersPatternsIds = [];
                that._data = data;
                that._init(options)
            },
            _init: function(options) {
                if (!options)
                    return;
                var debug = DX.utils.debug;
                debug.assertParam(options.visible, 'Visibility was not passed');
                debug.assertParam(options.markerSize, 'markerSize was not passed');
                debug.assertParam(options.font.color, 'fontColor was not passed');
                debug.assertParam(options.font.family, 'fontFamily was not passed');
                debug.assertParam(options.font.size, 'fontSize was not passed');
                debug.assertParam(options.paddingLeftRight, 'paddingLeftRight was not passed');
                debug.assertParam(options.paddingTopBottom, 'paddingTopBottom was not passed');
                debug.assertParam(options.columnItemSpacing, 'columnItemSpacing was not passed');
                debug.assertParam(options.rowItemSpacing, 'rowItemSpacing was not passed');
                debug.assertParam(options.equalColumnWidth, 'equalColumnWidth was not passed');
                var that = this,
                    i;
                that._parseMargins(options);
                that._parseAlignments(options);
                options.orientation = (options.orientation || '').toLowerCase();
                if (options.orientation !== VERTICAL && options.orientation !== HORIZONTAL) {
                    if (options.horizontalAlignment === CENTER)
                        options.orientation = HORIZONTAL;
                    if (options.horizontalAlignment === RIGHT || options.horizontalAlignment === LEFT)
                        options.orientation = VERTICAL
                }
                if (!options.itemTextPosition)
                    options.itemTextPosition = options.orientation === HORIZONTAL ? BOTTOM : RIGHT;
                else
                    options.itemTextPosition = options.itemTextPosition;
                options.position = (options.position || '').toLowerCase();
                if (options.position !== OUTSIDE && options.position !== INSIDE)
                    options.position = OUTSIDE;
                options.hoverMode = (options.hoverMode || '').toLowerCase();
                options.customizeText = $.isFunction(options.customizeText) ? options.customizeText : function() {
                    return this.seriesName
                };
                that._options = options;
                !that._trackerGroup && (that._trackerGroup = that._renderer.createGroup({
                    'class': 'dxc-legend-trackers',
                    stroke: NONE,
                    fill: 'grey',
                    opacity: 0.0001
                }));
                that.__initialized = true
            },
            _parseMargins: function(options) {
                if (options.margin >= 0) {
                    options.margin = Number(options.margin);
                    options.margin = {
                        top: options.margin,
                        bottom: options.margin,
                        left: options.margin,
                        right: options.margin
                    }
                }
                else
                    options.margin = {
                        top: options.margin.top >= 0 ? Number(options.margin.top) : DEFAULT_MARGIN,
                        bottom: options.margin.bottom >= 0 ? Number(options.margin.bottom) : DEFAULT_MARGIN,
                        left: options.margin.left >= 0 ? Number(options.margin.left) : DEFAULT_MARGIN,
                        right: options.margin.right >= 0 ? Number(options.margin.right) : DEFAULT_MARGIN
                    }
            },
            _parseAlignments: function(options) {
                options.horizontalAlignment = (options.horizontalAlignment || '').toLowerCase();
                if (options.horizontalAlignment !== CENTER && options.horizontalAlignment !== RIGHT && options.horizontalAlignment !== LEFT)
                    options.horizontalAlignment = RIGHT;
                options.verticalAlignment = (options.verticalAlignment || '').toLowerCase();
                if (options.verticalAlignment !== TOP && options.verticalAlignment !== BOTTOM) {
                    if (options.horizontalAlignment === CENTER)
                        options.verticalAlignment = BOTTOM;
                    if (options.horizontalAlignment === RIGHT || options.horizontalAlignment === LEFT)
                        options.verticalAlignment = TOP
                }
            },
            update: function(data, options) {
                this._data = data;
                this.boundingRect = {
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0
                };
                this._init(options);
                return this
            },
            setSize: function(size) {
                this._size = size;
                return this
            },
            draw: function() {
                if (!this._options)
                    return this;
                var that = this,
                    renderer = that._renderer,
                    options = that._options,
                    items = that._data,
                    itemsLength = items.length,
                    seriesGroups = [],
                    i,
                    label,
                    marker,
                    singleSeriesGroup,
                    trackers = [],
                    insideLegendGroup,
                    markersId = new Array(itemsLength),
                    passedId,
                    border = options.border,
                    borderVisible = border.visible && border.width && border.color && border.color !== NONE,
                    markers = new Array(itemsLength);
                if (!(options.visible && items && itemsLength)) {
                    that._disposeTrackers();
                    return that
                }
                that._cleanLegendGroups();
                insideLegendGroup = that._insideLegendGroup = renderer.createGroup().append(that._legendGroup);
                that._createBackground(borderVisible);
                for (i = 0; i < itemsLength; i++) {
                    singleSeriesGroup = renderer.createGroup({'class': 'dxc-item'}).append(insideLegendGroup);
                    marker = that._createMarker(items[i], singleSeriesGroup, i);
                    passedId = items[i].id;
                    label = that._createLabel(items[i], passedId, singleSeriesGroup);
                    markersId[i] = passedId;
                    that._locateLabelAndMarker(label, marker);
                    markers[i] = marker;
                    trackers.push({
                        rect: renderer.createRect(0, 0, 0, 0, 0, {
                            stroke: NONE,
                            fill: 'grey',
                            opacity: 0.0001,
                            inh: true
                        }),
                        id: passedId
                    });
                    seriesGroups.push(singleSeriesGroup)
                }
                that._seriesGroups = seriesGroups;
                that._trackers = trackers;
                that.drawTrackers();
                that._markers = markers;
                that._markersId = markersId;
                that._locateElements(options);
                return that
            },
            _locateElements: function(options) {
                var that = this,
                    border = options.border,
                    borderVisible = border.visible && border.width && border.color && border.color !== NONE;
                that._moveInInitialValues();
                that._locateRowsColumns(that._seriesGroups, that._trackers, that._data.length, that._background, options);
                if (that._background)
                    that._adjustBackgroundSettings(that._background, borderVisible, options);
                that._setBoundingRect(options)
            },
            _moveInInitialValues: function() {
                var that = this;
                that._legendGroup && that._legendGroup.move(0, 0);
                that._trackerGroup && that._trackerGroup.move(0, 0);
                that._background && that._background.applySettings({
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                })
            },
            _applyMarkerOptions: function(marker, options) {
                if (marker)
                    marker.applySettings(options)
            },
            applySelected: function(id) {
                var index = this._getIndexById(id);
                if (index !== null)
                    this._applyMarkerOptions(this._markers[index], {fill: this._markersPatternsIds[index].selectedPatternId});
                return this
            },
            applyHover: function(id) {
                var index = this._getIndexById(id);
                if (index !== null)
                    this._applyMarkerOptions(this._markers[index], {fill: this._markersPatternsIds[index].hoverPatternId});
                return this
            },
            resetItem: function(id) {
                var index = this._getIndexById(id);
                if (index !== null)
                    this._applyMarkerOptions(this._markers[index], {fill: this._data[index].color || this._data[index].states.normal.fill})
            },
            _getIndexById: function(id) {
                var i,
                    markersId = this._markersId,
                    markersIdLen = markersId.length;
                for (i = 0; i < markersIdLen; i++)
                    if (markersId[i] === id)
                        return i;
                return null
            },
            drawTrackers: function() {
                if (!this._options.visible || !this._insideLegendGroup)
                    return;
                var that = this,
                    trackerGroup = that._trackerGroup.append(that._legendGroup);
                $.each(that._trackers || [], function(i, tracker) {
                    var trackerRect = tracker.rect;
                    trackerRect.data({
                        itemIndex: tracker.id,
                        mode: that._options.hoverMode
                    });
                    trackerRect.append(trackerGroup)
                });
                return that
            },
            _disposeTrackers: function() {
                var that = this;
                $.each(that._trackers || [], function(_, tracker) {
                    tracker.rect.removeData()
                });
                that._trackers = null
            },
            _createMarker: function(data, group, markerIndex) {
                var that = this,
                    renderer = that._renderer,
                    markersPatternsIds = that._markersPatternsIds,
                    size = that._options.markerSize,
                    states = data.states,
                    marker;
                marker = renderer.createRect(0, 0, size, size, 0, {fill: data.color}).append(group);
                markersPatternsIds[markerIndex] = {
                    hoverPatternId: getPatternId(renderer, states, 'hover', data.color),
                    selectedPatternId: getPatternId(renderer, states, 'selection', data.color)
                };
                return marker
            },
            _createLabel: function(data, index, group) {
                var that = this,
                    options = that._options,
                    position = options.itemTextPosition,
                    align = position === TOP || position === BOTTOM ? CENTER : LEFT,
                    text,
                    label,
                    labelFormatObject = {
                        seriesName: data.text,
                        seriesNumber: index,
                        seriesColor: data.color
                    };
                text = that._formatLabel.call(labelFormatObject, options);
                label = that._renderer.createText(text, 0, 0, {
                    font: options.font,
                    align: align
                }).append(group);
                return label
            },
            _cleanLegendGroups: function() {
                var that = this,
                    trackerGroup = that._trackerGroup,
                    legendGroup = that._legendGroup;
                if (legendGroup) {
                    legendGroup.clear();
                    that._insideLegendGroup && that._insideLegendGroup.dispose();
                    that._insideLegendGroup = null
                }
                if (trackerGroup)
                    trackerGroup.clear()
            },
            _createBackground: function(borderVisible) {
                var that = this,
                    options = that._options,
                    isInside = options.position === INSIDE,
                    color = options.backgroundColor,
                    fill = color || (isInside ? options.containerBackgroundColor : NONE);
                if (isInside || color || borderVisible)
                    that._background = that._renderer.createRect(0, 0, 0, 0, 0, {
                        fill: fill,
                        'class': 'dxc-border'
                    }).append(that._insideLegendGroup)
            },
            _formatLabel: function(options) {
                return options.customizeText.call(this, this)
            },
            _locateLabelAndMarker: function(label, marker) {
                var that = this,
                    defaultXMargin = 7,
                    defaultTopMargin = 4,
                    defaultBottomMargin = 2,
                    labelX = 0,
                    labelY = 0,
                    markerX,
                    markerY,
                    labelBox = label.getBBox(),
                    markerWidth = that._options.markerSize,
                    markerHeight = markerWidth,
                    approximateLabelY = markerHeight / 2 - (labelBox.y + labelBox.height / 2),
                    approximateLabelX = markerWidth / 2 - (labelBox.x + labelBox.width / 2);
                switch (that._options.itemTextPosition) {
                    case LEFT:
                        labelY = _round(approximateLabelY);
                        markerX = labelBox.width + defaultXMargin;
                        break;
                    case RIGHT:
                        labelX = markerWidth + defaultXMargin;
                        labelY = _round(approximateLabelY);
                        break;
                    case TOP:
                        labelX = _round(approximateLabelX);
                        markerY = defaultTopMargin;
                        break;
                    case BOTTOM:
                        labelX = _round(approximateLabelX);
                        labelY = markerHeight + defaultBottomMargin - labelBox.y;
                        break
                }
                label.applySettings({
                    x: labelX,
                    y: labelY
                });
                marker.applySettings({
                    x: markerX,
                    y: markerY
                })
            },
            _locateRowsColumns: function(groups, trackers, count, background, options) {
                var that = this,
                    itemTextPosition = options.itemTextPosition,
                    size = that._size,
                    legendBox,
                    rowsColumns = that._getRowsColumns(count),
                    rows = rowsColumns.rows,
                    columns = rowsColumns.columns,
                    margin = options.margin,
                    paddingLeftRight = background ? options.paddingLeftRight : 0,
                    paddingTopBottom = background ? options.paddingTopBottom : 0,
                    placeholderWidth = size.width - margin.left - margin.right - 2 * paddingLeftRight,
                    placeholderHeight = size.height - margin.top - margin.bottom - 2 * paddingTopBottom,
                    rowsColumnsData,
                    condition;
                var moveRowsColumns = function(rows, columns) {
                        rowsColumnsData = that._getDataRowsColumns(groups, columns, rows);
                        that._moveItems(rowsColumnsData, groups, itemTextPosition, trackers, options)
                    };
                moveRowsColumns(rows, columns);
                legendBox = that._insideLegendGroup ? that._insideLegendGroup.getBBox() : {};
                if (rowsColumns.autoEdit)
                    if (rows === 1) {
                        if (legendBox.width > placeholderWidth && columns > 1) {
                            columns = _floor(columns * placeholderWidth / legendBox.width) || 1;
                            columns = validate(columns, count);
                            rows = _ceil(count / columns);
                            moveRowsColumns(rows, columns)
                        }
                    }
                    else if (columns === 1)
                        if (legendBox.height > placeholderHeight && rows > 1) {
                            rows = _floor(rows * placeholderHeight / legendBox.height) || 1;
                            rows = validate(rows, count);
                            columns = _ceil(count / rows);
                            moveRowsColumns(rows, columns)
                        }
                that._rowsCountDrawed = rows;
                that._columnsCountDrawed = columns;
                function validate(rowsOrColumns, count) {
                    if (rowsOrColumns > count || rowsOrColumns < 1)
                        rowsOrColumns = count;
                    return rowsOrColumns
                }
            },
            _moveItems: function(data, seriesGroups, horizontalTextPosition, trackers, options) {
                var that = this,
                    i,
                    j,
                    rows,
                    cols,
                    number,
                    group,
                    box,
                    xShift = 0,
                    yShift = 0,
                    widthColumn,
                    xPadding = options.columnItemSpacing,
                    yPadding = options.rowItemSpacing,
                    equalColumnWidth = options.equalColumnWidth,
                    renderer = that._renderer,
                    maxWidthPerColumn = [],
                    maxWidthColumn = 0,
                    maxHeightRow = 0;
                rows = data.rows;
                cols = data.cols;
                maxHeightRow = data.maxHeightRow;
                maxWidthColumn = data.maxWidthColumn;
                maxWidthPerColumn = data.maxWidthPerColumn;
                for (i = 0; i < rows; i++) {
                    for (j = 0; j < cols; j++) {
                        if (rows < cols)
                            number = i * cols + j;
                        else
                            number = i + j * rows;
                        group = seriesGroups[number];
                        if (!group)
                            break;
                        box = group.getBBox();
                        widthColumn = !equalColumnWidth ? maxWidthPerColumn[j] : maxWidthColumn;
                        if (horizontalTextPosition === RIGHT) {
                            group.move(xShift - box.x, yShift);
                            trackers[number].rect.applySettings({
                                x: xShift - xPadding / 2,
                                y: yShift + box.y - yPadding / 2,
                                height: maxHeightRow + yPadding,
                                width: widthColumn + xPadding
                            })
                        }
                        else if (horizontalTextPosition === LEFT) {
                            group.move(box.x + widthColumn - box.width + xShift - xPadding / 2, yShift);
                            trackers[number].rect.applySettings({
                                x: box.x + widthColumn - box.width + xShift - xPadding / 2,
                                y: yShift + box.y - yPadding / 2,
                                height: maxHeightRow + yPadding,
                                width: widthColumn + xPadding
                            })
                        }
                        else {
                            group.move(xShift - box.x - box.width / 2 + widthColumn / 2, yShift);
                            trackers[number].rect.applySettings({
                                x: xShift - xPadding / 2,
                                y: yShift + box.y - yPadding / 2,
                                height: maxHeightRow + yPadding,
                                width: widthColumn + xPadding
                            })
                        }
                        xShift = xShift + widthColumn + xPadding
                    }
                    yShift = yShift + maxHeightRow + yPadding;
                    xShift = 0
                }
            },
            _getDataRowsColumns: function(seriesGroups, cols, rows) {
                var that = this,
                    i,
                    j,
                    options = that._options,
                    equalColumnWidth = options.equalColumnWidth,
                    series = that.series || {},
                    maxWidthPerColumn = [],
                    maxWidthColumn = 0,
                    maxHeightRow = 0,
                    group,
                    box;
                for (i = 0; i < cols; i++)
                    maxWidthPerColumn[i] = 0;
                for (i = 0; i < rows; i++)
                    for (j = 0; j < cols; j++) {
                        if (rows < cols)
                            group = seriesGroups[i * cols + j];
                        else
                            group = seriesGroups[i + j * rows];
                        if (!group)
                            break;
                        box = group.getBBox();
                        if (maxHeightRow < box.height)
                            maxHeightRow = box.height;
                        if (!equalColumnWidth) {
                            if (maxWidthPerColumn[j] < box.width)
                                maxWidthPerColumn[j] = box.width
                        }
                        else if (maxWidthColumn < box.width)
                            maxWidthColumn = box.width
                    }
                return {
                        rows: rows,
                        cols: cols,
                        maxWidthPerColumn: maxWidthPerColumn,
                        maxWidthColumn: maxWidthColumn,
                        maxHeightRow: maxHeightRow
                    }
            },
            _getRowsColumns: function(count) {
                var that = this,
                    options = that._options,
                    isHorizontal = options.orientation === HORIZONTAL,
                    rows = options.rowCount,
                    onRows = _ceil(count / rows),
                    columns = options.columnCount,
                    onColumns = _ceil(count / columns),
                    autoEdit;
                if (columns && !rows)
                    rows = onColumns;
                else if (!columns && rows)
                    columns = onRows;
                else if (columns && rows) {
                    if (isHorizontal && columns < onRows)
                        columns = onRows;
                    else if (!isHorizontal && rows < onColumns)
                        rows = onColumns
                }
                else {
                    autoEdit = true;
                    if (isHorizontal) {
                        rows = 1;
                        columns = count
                    }
                    else {
                        columns = 1;
                        rows = count
                    }
                }
                return {
                        rows: rows,
                        columns: columns,
                        autoEdit: autoEdit
                    }
            },
            _adjustBackgroundSettings: function(background, borderVisible, options) {
                var that = this,
                    border = options.border,
                    legendBox = that._insideLegendGroup.getBBox(),
                    backgroundSettings = {
                        x: _round(legendBox.x - options.paddingLeftRight),
                        y: _round(legendBox.y - options.paddingTopBottom),
                        width: _round(legendBox.width) + 2 * options.paddingLeftRight,
                        height: _round(legendBox.height) + 2 * options.paddingTopBottom,
                        opacity: options.backgroundOpacity
                    };
                if (borderVisible) {
                    backgroundSettings.strokeWidth = border.width;
                    backgroundSettings.stroke = border.color;
                    backgroundSettings.strokeOpacity = border.opacity;
                    backgroundSettings.dashStyle = border.dashStyle;
                    backgroundSettings.rx = border.cornerRadius || 0;
                    backgroundSettings.ry = border.cornerRadius || 0
                }
                background.applySettings(backgroundSettings)
            },
            _setBoundingRect: function(options) {
                var that = this,
                    box,
                    margin = options.margin;
                if (!that._insideLegendGroup)
                    return;
                box = that._insideLegendGroup.getBBox();
                box.height += margin.top + margin.bottom;
                box.width += margin.left + margin.right;
                box.x -= margin.left;
                box.y -= margin.top;
                that.boundingRect = box
            },
            changeSize: function(size) {
                var that = this,
                    options = $.extend(true, {}, that._options),
                    margin = options.margin;
                if (size.height >= 0) {
                    size.height = decreaseGaps(margin, ["top", "bottom"], size.height);
                    if (options.border.visible)
                        size.height = 2 * decreaseGaps(options, ["paddingTopBottom"], size.height / 2);
                    if (that._rowsCountDrawed - 1)
                        size.height = (that._rowsCountDrawed - 1) * decreaseGaps(options, ["rowItemSpacing"], size.height / (that._rowsCountDrawed - 1))
                }
                if (size.width >= 0) {
                    size.width = decreaseGaps(margin, ["left", "right"], size.width);
                    if (options.border.visible)
                        size.width = 2 * decreaseGaps(options, ["paddingLeftRight"], size.width / 2);
                    if (that._columnsCountDrawed - 1)
                        size.width = (that._columnsCountDrawed - 1) * decreaseGaps(options, ["columnItemSpacing"], size.width / (that._columnsCountDrawed - 1))
                }
                if (that._insideLegendGroup)
                    if (size.height > 0 || size.width > 0) {
                        that._options._incidentOccured("W2104");
                        that._insideLegendGroup.remove();
                        that._insideLegendGroup = null;
                        that._trackerGroup && that._trackerGroup.clear()
                    }
                    else
                        that._locateElements(options)
            },
            getTrackerGroup: function() {
                return this._trackerGroup
            },
            getActionCallback: function(point) {
                var that = this;
                if (that._options.visible)
                    return function(act) {
                            var pointType = point.type,
                                isSeries = pointType ? true : false,
                                seriesType = pointType || point.series.type;
                            if (isSeries || seriesType === 'pie' || seriesType === 'doughnut' || seriesType === 'donut')
                                that[act] && that[act](point.index)
                        };
                else
                    return $.noop
            },
            getLayoutOptions: function() {
                var options = this._options,
                    boundingRect = this._insideLegendGroup ? this.boundingRect : {
                        width: 0,
                        height: 0,
                        x: 0,
                        y: 0
                    };
                if (options) {
                    boundingRect.verticalAlignment = options.verticalAlignment;
                    boundingRect.horizontalAlignment = options.horizontalAlignment;
                    if (options.orientation === 'horizontal')
                        boundingRect.cutLayoutSide = options.verticalAlignment;
                    else
                        boundingRect.cutLayoutSide = options.horizontalAlignment === 'center' ? options.verticalAlignment : options.horizontalAlignment;
                    return boundingRect
                }
                return null
            },
            shift: function(x, y) {
                var that = this,
                    settings = {},
                    box = that.getLayoutOptions();
                settings.translateX = x - box.x;
                settings.translateY = y - box.y;
                that._insideLegendGroup && that._insideLegendGroup.applySettings(settings);
                that._trackerGroup && that._trackerGroup.applySettings(settings)
            },
            getPosition: function() {
                return this._options.position
            },
            dispose: function() {
                var that = this;
                that._disposeTrackers();
                that._legendGroup = null;
                that._trackerGroup = null;
                that._insideLegendGroup = null;
                that._renderer = null;
                that._options = null;
                that._data = null;
                return that
            }
        })
    })(DevExpress, jQuery);
    /*! Module viz-core, file range.js */
    (function($, DX, undefined) {
        var core = DX.viz.core,
            utils = DX.utils,
            isDefinedUtils = utils.isDefined,
            isDateUtils = utils.isDate,
            getLogUtils = utils.getLog,
            raiseToUtils = utils.raiseTo;
        var NUMBER_EQUALITY_CORRECTION = 1,
            DATETIME_EQUALITY_CORRECTION = 60000;
        var minSelector = 'min',
            maxSelector = 'max',
            minVisibleSelector = 'minVisible',
            maxVisibleSelector = 'maxVisible',
            minValueMarginSelector = 'minValueMargin',
            maxValueMarginSelector = 'maxValueMargin',
            categoriesSelector = 'categories',
            keepValueMarginsSelector = 'keepValueMargins',
            baseSelector = 'base',
            axisTypeSelector = 'axisType';
        var raiseToFlooredLog = function(value, base, correction) {
                return raiseToUtils(Math.floor(getLogUtils(value, base)) + (correction || 0), base)
            };
        var otherLessThan = function(thisValue, otherValue) {
                return otherValue < thisValue
            };
        var otherGreaterThan = function(thisValue, otherValue) {
                return otherValue > thisValue
            };
        var compareAndReplace = function(thisValue, otherValue, setValue, compare) {
                var otherValueDefined = isDefinedUtils(otherValue);
                if (isDefinedUtils(thisValue)) {
                    if (otherValueDefined && compare(thisValue, otherValue))
                        setValue(otherValue)
                }
                else if (otherValueDefined)
                    setValue(otherValue)
            };
        var applyMargin = function(value, margin, rangeLength, coef, isDateTime) {
                value = value.valueOf() + coef * rangeLength * margin;
                return isDateTime ? new Date(value) : value
            };
        DX.viz.core.__NUMBER_EQUALITY_CORRECTION = NUMBER_EQUALITY_CORRECTION;
        DX.viz.core.__DATETIME_EQUALITY_CORRECTION = DATETIME_EQUALITY_CORRECTION;
        core.Range = function(range) {
            range && $.extend(this, range)
        };
        $.extend(core.Range.prototype, {
            dispose: function() {
                this[categoriesSelector] = null
            },
            addRange: function(otherRange) {
                var that = this,
                    categories = that[categoriesSelector],
                    categoriesValues,
                    otherCategories = otherRange[categoriesSelector],
                    i,
                    j,
                    length,
                    found;
                var setIndentByPriority = function(prefix) {
                        var prioritySelector = prefix + 'Priority',
                            priorityRelation = (that[prioritySelector] || 0) - (otherRange[prioritySelector] || 0);
                        if ((that[prefix] || 0) < otherRange[prefix] && priorityRelation === 0 || priorityRelation < 0) {
                            that[prefix] = otherRange[prefix];
                            that[prioritySelector] = otherRange[prioritySelector]
                        }
                    };
                var compareAndReplaceByField = function(field, compare) {
                        compareAndReplace(that[field], otherRange[field], function(value) {
                            that[field] = value
                        }, compare)
                    };
                var controlValuesByVisibleBounds = function(valueField, visibleValueField, compare) {
                        compareAndReplace(that[valueField], that[visibleValueField], function(value) {
                            isDefinedUtils(that[valueField]) && (that[valueField] = value)
                        }, compare)
                    };
                var checkField = function(field) {
                        that[field] = that[field] || otherRange[field]
                    };
                if (utils.isDefined(otherRange["stick"]))
                    that["stick"] = otherRange["stick"];
                checkField('invert');
                checkField(axisTypeSelector);
                checkField('dataType');
                checkField(keepValueMarginsSelector);
                if (that[axisTypeSelector] === 'logarithmic')
                    checkField(baseSelector);
                else
                    that[baseSelector] = undefined;
                compareAndReplaceByField(minSelector, otherLessThan);
                compareAndReplaceByField(maxSelector, otherGreaterThan);
                compareAndReplaceByField(minVisibleSelector, otherLessThan);
                compareAndReplaceByField(maxVisibleSelector, otherGreaterThan);
                compareAndReplaceByField('interval', otherLessThan);
                setIndentByPriority(minValueMarginSelector);
                setIndentByPriority(maxValueMarginSelector);
                controlValuesByVisibleBounds(minSelector, minVisibleSelector, otherLessThan);
                controlValuesByVisibleBounds(minSelector, maxVisibleSelector, otherLessThan);
                controlValuesByVisibleBounds(maxSelector, maxVisibleSelector, otherGreaterThan);
                controlValuesByVisibleBounds(maxSelector, minVisibleSelector, otherGreaterThan);
                if (categories === undefined)
                    that[categoriesSelector] = otherCategories;
                else {
                    length = categories.length;
                    if (otherCategories && otherCategories.length)
                        for (i = 0; i < otherCategories.length; i++) {
                            for (j = 0, found = false; j < length; j++)
                                if (categories[j].valueOf() === otherCategories[i].valueOf()) {
                                    found = true;
                                    break
                                }
                            !found && categories.push(otherCategories[i])
                        }
                }
                return this
            },
            isDefined: function() {
                return isDefinedUtils(this[minSelector]) && isDefinedUtils(this[maxSelector]) || isDefinedUtils(this[categoriesSelector])
            },
            setStubData: function(dataType) {
                var that = this,
                    year = (new Date).getYear() - 1,
                    isDate = dataType === 'datetime',
                    isCategories = that.axisType === 'discrete';
                if (isCategories)
                    that.categories = ['0', '1', '2'];
                else {
                    that[minSelector] = isDate ? new Date(year, 0, 1) : 0;
                    that[maxSelector] = isDate ? new Date(year, 11, 31) : 10
                }
                that.stubData = true;
                return that
            },
            applyValueMargins: function() {
                var that = this,
                    base = that[baseSelector],
                    isDateTime = isDateUtils(that[maxSelector]) || isDateUtils(that[minSelector]);
                var applyMarginWithZeroCorrection = function(min, max, rangeLength) {
                        var minValue = that[min],
                            maxValue = that[max],
                            minMargin = that[minValueMarginSelector],
                            maxMargin = that[maxValueMarginSelector],
                            minCorrected = false,
                            maxCorrected = false;
                        if (rangeLength && !isDateTime && !that[keepValueMarginsSelector]) {
                            if (minValue <= 0 && maxValue <= 0 && maxMargin > maxValue / (minValue - maxValue)) {
                                that[max] = 0;
                                maxCorrected = true
                            }
                            if (minValue >= 0 && maxValue >= 0 && minMargin > minValue / (maxValue - minValue)) {
                                that[min] = 0;
                                minCorrected = true
                            }
                        }
                        if (isDefinedUtils(maxValue) && !maxCorrected && maxMargin)
                            that[max] = applyMargin(maxValue, maxMargin, rangeLength, 1, isDateTime);
                        if (isDefinedUtils(minValue) && !minCorrected && minMargin)
                            that[min] = applyMargin(minValue, minMargin, rangeLength, -1, isDateTime)
                    };
                var correctValueByBoundaries = function(visibleSelector, valueSelector) {
                        that[visibleSelector] = isDefinedUtils(that[visibleSelector]) ? that[visibleSelector] : that[valueSelector]
                    };
                var processLogarithmicMinValue = function(valueField) {
                        if (isDefinedUtils(that[valueField])) {
                            var intermediateValue = raiseToFlooredLog(that[valueField], base);
                            if (getLogUtils(that[valueField] / intermediateValue, base) < 0.1 && that.alwaysCorrectMin && !that[keepValueMarginsSelector])
                                that[valueField] = raiseToFlooredLog(that[valueField], base, -1);
                            else if (that.alwaysCorrectMin && !that[keepValueMarginsSelector])
                                that[valueField] = intermediateValue;
                            else if (getLogUtils(that[valueField] / intermediateValue, base) < 0.5)
                                that[valueField] = intermediateValue
                        }
                    };
                var processLogarithmicMaxValue = function(valueField) {
                        if (isDefinedUtils(that[valueField])) {
                            var intermediateValue = raiseToFlooredLog(that[valueField], base);
                            if (getLogUtils(that[valueField] / intermediateValue, base) > 0.5)
                                that[valueField] = raiseToUtils(Math.ceil(getLogUtils(that[valueField], base)), base)
                        }
                    };
                var correctLogVisibleValue = function(visibleValueSelector, valueSelector, compare) {
                        if (!isDefinedUtils(that[visibleValueSelector]) || compare)
                            that[visibleValueSelector] = that[valueSelector]
                    };
                if (that[axisTypeSelector] === 'logarithmic' && that[minSelector] !== that[maxSelector]) {
                    processLogarithmicMinValue(minSelector);
                    processLogarithmicMaxValue(maxSelector);
                    if (that.isValueRange && that[minVisibleSelector] !== that[maxVisibleSelector]) {
                        processLogarithmicMinValue(minVisibleSelector);
                        processLogarithmicMaxValue(maxVisibleSelector)
                    }
                    correctLogVisibleValue(minVisibleSelector, minSelector, that[minVisibleSelector] < that[minSelector]);
                    correctLogVisibleValue(maxVisibleSelector, maxSelector, that[maxVisibleSelector] > that[maxSelector])
                }
                else {
                    correctValueByBoundaries(minVisibleSelector, minSelector);
                    correctValueByBoundaries(maxVisibleSelector, maxSelector);
                    applyMarginWithZeroCorrection(minSelector, maxSelector, that[maxSelector] - that[minSelector]);
                    applyMarginWithZeroCorrection(minVisibleSelector, maxVisibleSelector, that[maxVisibleSelector] - that[minVisibleSelector])
                }
                return this
            },
            correctValueZeroLevel: function() {
                var that = this;
                if (isDateUtils(that[maxSelector]) || isDateUtils(that[minSelector]))
                    return that;
                function setZeroLevel(min, max) {
                    that[min] < 0 && that[max] < 0 && (that[max] = 0);
                    that[min] > 0 && that[max] > 0 && (that[min] = 0)
                }
                setZeroLevel(minSelector, maxSelector);
                setZeroLevel(minVisibleSelector, maxVisibleSelector);
                return that
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file seriesConsts.js */
    (function(DX) {
        DX.viz.core.series = DX.viz.core.series || {};
        DX.viz.core.series.helpers = DX.viz.core.series.helpers || {};
        DX.viz.core.series.helpers.consts = {
            events: {
                mouseover: "mouseover",
                mouseout: "mouseout",
                mousemove: "mousemove",
                touchstart: "touchstart",
                touchmove: "touchmove",
                touchend: "touchend",
                mousedown: "mousedown",
                mouseup: "mouseup",
                click: "click",
                selectSeries: "selectseries",
                deselectSeries: "deselectseries",
                selectPoint: "selectpoint",
                deselectPoint: "deselectpoint",
                showPointTooltip: "showpointtooltip",
                hidePointTooltip: "hidepointtooltip"
            },
            states: {
                hover: "hover",
                normal: "normal",
                selected: "selected",
                normalMark: 0,
                hoverMark: 1,
                selectedMark: 2
            },
            animations: {
                showDuration: {duration: 400},
                hideGroup: {opacity: 0.0001},
                showGroup: {opacity: 1}
            }
        }
    })(DevExpress);
    /*! Module viz-core, file seriesFamily.js */
    (function($, DX, undefined) {
        var utils = DX.utils,
            _round = Math.round,
            _abs = Math.abs,
            _pow = Math.pow;
        DX.viz.core.series.helpers.SeriesFamily = DX.Class.inherit(function() {
            var ctor = function(options) {
                    var debug = DX.utils.debug;
                    debug.assert(options.type, "type was not passed or empty");
                    var that = this,
                        stubFunction = $.noop;
                    $.extend(that, options);
                    that.type = that.type.toLowerCase();
                    that.series = [];
                    switch (that.type) {
                        case"bar":
                            that.adjustSeriesDimensions = adjustBarSeriesDimensions;
                            that.adjustSeriesValues = stubFunction;
                            that.updateSeriesValues = updateBarSeriesValues;
                            break;
                        case"rangebar":
                            that.adjustSeriesDimensions = adjustBarSeriesDimensions;
                            that.adjustSeriesValues = stubFunction;
                            that.updateSeriesValues = stubFunction;
                            break;
                        case"fullstackedbar":
                            that.fullStacked = true;
                            that.adjustSeriesDimensions = adjustStackedBarSeriesDimensions;
                            that.adjustSeriesValues = adjustStackedSeriesValues;
                            that.updateSeriesValues = updateStackedSeriesValues;
                            break;
                        case"stackedbar":
                            that.adjustSeriesDimensions = adjustStackedBarSeriesDimensions;
                            that.adjustSeriesValues = adjustStackedSeriesValues;
                            that.updateSeriesValues = updateStackedSeriesValues;
                            break;
                        case"fullstackedarea":
                        case"fullstackedline":
                            that.fullStacked = true;
                            that.adjustSeriesDimensions = stubFunction;
                            that.adjustSeriesValues = adjustStackedSeriesValues;
                            that.updateSeriesValues = stubFunction;
                            break;
                        case"stackedarea":
                        case"stackedline":
                            that.adjustSeriesDimensions = stubFunction;
                            that.adjustSeriesValues = adjustStackedSeriesValues;
                            that.updateSeriesValues = stubFunction;
                            break;
                        case"candlestick":
                        case"stock":
                            that.adjustSeriesDimensions = adjustCandlestickSeriesDimensions;
                            that.adjustSeriesValues = stubFunction;
                            that.updateSeriesValues = stubFunction;
                            break;
                        case"bubble":
                            that.adjustSeriesDimensions = adjustBubbleSeriesDimensions;
                            that.adjustSeriesValues = stubFunction;
                            that.updateSeriesValues = stubFunction;
                            break;
                        default:
                            that.adjustSeriesDimensions = stubFunction;
                            that.adjustSeriesValues = stubFunction;
                            that.updateSeriesValues = stubFunction;
                            break
                    }
                };
            var dispose = function() {
                    this.series = null;
                    this.translators = null
                };
            var add = function(series) {
                    var that = this,
                        singleSeries,
                        i;
                    if (!$.isArray(series))
                        series = [series];
                    for (i = 0; i < series.length; i++) {
                        singleSeries = series[i];
                        if (singleSeries.type.toLowerCase() === that.type)
                            that.series.push(singleSeries)
                    }
                };
            var adjustBarSeriesDimensionsCore = function(series, interval, stackCount, equalBarWidth, seriesStackIndexCallback) {
                    var spacing,
                        width,
                        maxWidth,
                        middleIndex,
                        stackIndex,
                        i,
                        point,
                        points,
                        seriesOffset,
                        stackName,
                        argumentsKeeper = {},
                        stackKeepers = {},
                        stacksWithArgument,
                        count;
                    if (equalBarWidth) {
                        width = equalBarWidth.width && equalBarWidth.width < 0 ? 0 : equalBarWidth.width;
                        spacing = equalBarWidth.spacing && equalBarWidth.spacing < 0 ? 0 : equalBarWidth.spacing;
                        if (width && !spacing)
                            if (stackCount > 1) {
                                spacing = _round((interval * 0.7 - width * stackCount) / (stackCount - 1));
                                if (spacing < 1)
                                    spacing = 1
                            }
                            else
                                spacing = 0;
                        else if (spacing && !width) {
                            width = _round((interval * 0.7 - spacing * (stackCount - 1)) / stackCount);
                            if (width < 2)
                                width = 2
                        }
                        else if (!spacing && !width) {
                            if (stackCount > 1) {
                                spacing = _round(interval * 0.7 / stackCount * 0.2);
                                if (spacing < 1)
                                    spacing = 1
                            }
                            else
                                spacing = 0;
                            width = _round((interval * 0.7 - spacing * (stackCount - 1)) / stackCount);
                            if (width < 2)
                                width = 2
                        }
                        if (width * stackCount + spacing * (stackCount - 1) > interval) {
                            spacing = _round((interval * 0.7 - width * stackCount) / (stackCount - 1));
                            if (spacing < 1) {
                                spacing = 1;
                                maxWidth = _round((interval * 0.7 - spacing * (stackCount - 1)) / stackCount)
                            }
                        }
                        middleIndex = stackCount / 2;
                        for (i = 0; i < series.length; i++) {
                            stackIndex = seriesStackIndexCallback(i);
                            points = series[i].getPoints();
                            seriesOffset = (stackIndex - middleIndex + 0.5) * (maxWidth || width) - (middleIndex - stackIndex - 0.5) * spacing;
                            $.each(points, function(_, point) {
                                point.correctCoordinates({
                                    width: width,
                                    offset: seriesOffset
                                })
                            })
                        }
                    }
                    else {
                        $.each(series, function(i, singleSeries) {
                            stackName = singleSeries.getStackName && singleSeries.getStackName();
                            stackName = stackName || i.toString();
                            if (!stackKeepers[stackName])
                                stackKeepers[stackName] = [];
                            stackKeepers[stackName].push(singleSeries)
                        });
                        $.each(series, function(i, singleSeries) {
                            $.each(singleSeries.getPoints(), function(_, point) {
                                var argument = point.argument;
                                if (!argumentsKeeper.hasOwnProperty(argument))
                                    argumentsKeeper[argument.valueOf()] = 1
                            })
                        });
                        for (var argument in argumentsKeeper) {
                            if (!argumentsKeeper.hasOwnProperty(argument))
                                continue;
                            stacksWithArgument = [];
                            $.each(stackKeepers, function(stackName, seriesInStack) {
                                $.each(seriesInStack, function(i, singleSeries) {
                                    point = singleSeries.getPointByArg(argument);
                                    if (point && point.value) {
                                        stacksWithArgument.push(stackName);
                                        return false
                                    }
                                })
                            });
                            count = stacksWithArgument.length;
                            spacing = _round(interval * 0.7 / count * 0.2);
                            if (spacing < 1)
                                spacing = 1;
                            width = _round((interval * 0.7 - spacing * (count - 1)) / count);
                            if (width < 2)
                                width = 2;
                            middleIndex = count / 2;
                            $.each(stackKeepers, function(stackName, seriesInStack) {
                                stackIndex = $.inArray(stackName, stacksWithArgument);
                                if (stackIndex === -1)
                                    return;
                                seriesOffset = (stackIndex - middleIndex + 0.5) * width - (middleIndex - stackIndex - 0.5) * spacing;
                                $.each(seriesInStack, function(i, singleSeries) {
                                    var point = singleSeries.getPointByArg(argument);
                                    if (point && point.value)
                                        point.correctCoordinates({
                                            width: width,
                                            offset: seriesOffset
                                        })
                                })
                            })
                        }
                    }
                };
            var getVisibleSeries = function(that) {
                    return $.map(that.series, function(s) {
                            return s.isVisible() ? s : null
                        })
                };
            var adjustBarSeriesDimensions = function(translators) {
                    var debug = DX.utils.debug;
                    debug.assert(translators, "translator was not passed or empty");
                    var that = this,
                        equalBarWidth = that.equalBarWidth,
                        series = getVisibleSeries(that);
                    adjustBarSeriesDimensionsCore(series, getInterval(that, translators), series.length, equalBarWidth, function(seriesIndex) {
                        return seriesIndex
                    })
                };
            var adjustStackedBarSeriesDimensions = function(translators) {
                    var debug = DX.utils.debug;
                    debug.assert(translators, "translators was not passed or empty");
                    var that = this,
                        interval,
                        series = getVisibleSeries(that),
                        stackIndexes = {},
                        stackCount = 0,
                        equalBarWidth = that.equalBarWidth;
                    $.each(series, function() {
                        var stackName = this.getStackName();
                        if (!stackIndexes.hasOwnProperty(stackName))
                            stackIndexes[stackName] = stackCount++
                    });
                    adjustBarSeriesDimensionsCore(series, getInterval(that, translators), stackCount, equalBarWidth, function(seriesIndex) {
                        return stackIndexes[series[seriesIndex].getStackName()]
                    })
                };
            var adjustStackedSeriesValues = function() {
                    var that = this,
                        series = getVisibleSeries(that),
                        stackKeepers = {
                            positive: {},
                            negative: {}
                        };
                    $.each(series, function(_, singleSeries) {
                        var points = singleSeries.getPoints();
                        $.each(points, function(index, point) {
                            var value = point.initialValue,
                                argument = point.argument,
                                stackName = singleSeries.getStackName ? singleSeries.getStackName() : "default",
                                valueType = value >= 0 ? "positive" : "negative",
                                currentStack;
                            stackKeepers[valueType][stackName] = stackKeepers[valueType][stackName] || {};
                            currentStack = stackKeepers[valueType][stackName];
                            if (currentStack[argument.valueOf()]) {
                                points[index].correctValue(currentStack[argument.valueOf()]);
                                currentStack[argument.valueOf()] += value
                            }
                            else {
                                currentStack[argument.valueOf()] = value;
                                points[index].resetCorrection()
                            }
                        })
                    });
                    setPercentStackedValues(series, stackKeepers, that.fullStacked)
                };
            var setPercentStackedValues = function(series, stackKeepers, fullStacked) {
                    $.each(series, function(_, singleSeries) {
                        var points = singleSeries.getPoints();
                        $.each(points, function(index, point) {
                            var value = point.value,
                                stackName = singleSeries.getStackName ? singleSeries.getStackName() : "default",
                                valueType = value >= 0 ? "positive" : "negative",
                                currentStack;
                            stackKeepers[valueType][stackName] = stackKeepers[valueType][stackName] || {};
                            currentStack = stackKeepers[valueType][stackName];
                            points[index].setPercentValue(currentStack[point.argument.valueOf()], fullStacked)
                        })
                    })
                };
            var getMinShownBusinessValue = function(that, translators, minBarSize) {
                    var rotated = that.rotated,
                        valTranslator = rotated ? translators.x : translators.y,
                        canvas = valTranslator.getCanvasVisibleArea();
                    if (minBarSize)
                        return _abs(valTranslator.untranslate(canvas.min) - valTranslator.untranslate(canvas.min + minBarSize))
                };
            var updateStackedSeriesValues = function(translators) {
                    var that = this,
                        series = getVisibleSeries(that),
                        stackKeepers = {
                            positive: {},
                            negative: {}
                        };
                    $.each(series, function(_, singleSeries) {
                        var points = singleSeries.getPoints(),
                            minBarSize = singleSeries.getOptions().minBarSize;
                        $.each(points, function(index, point) {
                            var value = point.value,
                                minValue = point.minValue,
                                argument = point.argument,
                                updateValue,
                                pointSize,
                                minShownBusinessValue,
                                stackName = singleSeries.getStackName ? singleSeries.getStackName() : "default",
                                valueType = value >= 0 ? "positive" : "negative",
                                currentStack;
                            minShownBusinessValue = getMinShownBusinessValue(that, translators, minBarSize);
                            currentStack = stackKeepers[valueType][stackName] = stackKeepers[valueType][stackName] || {};
                            if (currentStack[argument.valueOf()]) {
                                minValue = utils.isNumber(minValue) ? minValue : 0,
                                pointSize = _abs(minValue - value);
                                if (minShownBusinessValue && pointSize < minShownBusinessValue)
                                    updateValue = minShownBusinessValue;
                                else
                                    updateValue = value - minValue;
                                points[index].minValue = currentStack[argument.valueOf()];
                                points[index].value = currentStack[argument.valueOf()] + updateValue;
                                currentStack[argument.valueOf()] += updateValue
                            }
                            else {
                                pointSize = value;
                                if (minShownBusinessValue && pointSize < minShownBusinessValue)
                                    updateValue = minShownBusinessValue;
                                else
                                    updateValue = value;
                                points[index].value = updateValue;
                                currentStack[argument.valueOf()] = updateValue
                            }
                        })
                    });
                    if (that.fullStacked)
                        updateFullStackedSeriesValues(series, stackKeepers)
                };
            var updateFullStackedSeriesValues = function(series, stackKeepers) {
                    $.each(series, function(_, singleSeries) {
                        var stackName = singleSeries.getStackName ? singleSeries.getStackName() : "default",
                            points = singleSeries.getPoints();
                        $.each(points, function(index, point) {
                            var value = point.value,
                                argument = point.argument,
                                valueType = value >= 0 ? "positive" : "negative",
                                currentStack;
                            stackKeepers[valueType][stackName] = stackKeepers[valueType][stackName] || {};
                            currentStack = stackKeepers[valueType][stackName];
                            points[index].value = points[index].value / currentStack[argument.valueOf()] || 0;
                            if (DX.utils.isNumber(points[index].minValue))
                                points[index].minValue = points[index].minValue / currentStack[argument.valueOf()] || 0
                        })
                    })
                };
            var updateBarSeriesValues = function(translators) {
                    var that = this;
                    $.each(that.series, function(_, singleSeries) {
                        var points = singleSeries.getPoints(),
                            minBarSize = singleSeries.getOptions().minBarSize;
                        $.each(points, function(index, point) {
                            var value = point.value,
                                updateValue,
                                pointSize,
                                minShownBusinessValue;
                            minShownBusinessValue = getMinShownBusinessValue(that, translators, minBarSize);
                            pointSize = _abs(value);
                            if (minShownBusinessValue && pointSize < minShownBusinessValue)
                                updateValue = value >= 0 ? minShownBusinessValue : -minShownBusinessValue;
                            else
                                updateValue = value;
                            points[index].value = updateValue
                        })
                    })
                };
            var adjustCandlestickSeriesDimensions = function(translators) {
                    var debug = DX.utils.debug;
                    debug.assert(translators, "translator was not passed or empty");
                    var that = this,
                        series = getVisibleSeries(that);
                    adjustBarSeriesDimensionsCore(series, getInterval(that, translators), series.length, true, function(seriesIndex) {
                        return seriesIndex
                    })
                };
            var getInterval = function(that, translators) {
                    var argTranslator = !that.rotated ? translators.x : translators.y;
                    return that.interval = argTranslator.getInterval()
                };
            var adjustBubbleSeriesDimensions = function(translators) {
                    var debug = DX.utils.debug;
                    debug.assert(translators, "translator was not passed or empty");
                    var that = this,
                        series = getVisibleSeries(that),
                        points,
                        i,
                        visibleAreaX = translators.x.getCanvasVisibleArea(),
                        visibleAreaY = translators.y.getCanvasVisibleArea(),
                        min = Math.min(visibleAreaX.max - visibleAreaX.min, visibleAreaY.max - visibleAreaY.min),
                        minBubbleArea = _pow(that.minBubbleSize, 2),
                        maxBubbleArea = _pow(min * that.maxBubbleSize, 2),
                        equalBubbleSize = (min * that.maxBubbleSize + that.minBubbleSize) / 2,
                        minPointSize = Infinity,
                        maxPointSize = 0,
                        pointSize,
                        bubbleArea,
                        sizeProportion,
                        sizeDispersion,
                        areaDispersion;
                    for (i = 0; i < series.length; i++) {
                        points = series[i].getPoints();
                        $.each(points, function(_, point) {
                            maxPointSize = maxPointSize > point.size ? maxPointSize : point.size;
                            minPointSize = minPointSize < point.size ? minPointSize : point.size
                        })
                    }
                    sizeDispersion = maxPointSize - minPointSize;
                    areaDispersion = _abs(maxBubbleArea - minBubbleArea);
                    minPointSize = minPointSize < 0 ? 0 : minPointSize;
                    for (i = 0; i < series.length; i++) {
                        points = series[i].getPoints();
                        $.each(points, function(_, point) {
                            if (maxPointSize === minPointSize)
                                pointSize = _round(equalBubbleSize);
                            else {
                                sizeProportion = _abs(point.size - minPointSize) / sizeDispersion;
                                bubbleArea = areaDispersion * sizeProportion + minBubbleArea;
                                pointSize = _round(Math.sqrt(bubbleArea))
                            }
                            point.correctCoordinates(pointSize)
                        })
                    }
                };
            return {
                    ctor: ctor,
                    dispose: dispose,
                    add: add
                }
        }())
    })(jQuery, DevExpress);
    /*! Module viz-core, file baseSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            utils = DX.utils,
            _isDefined = utils.isDefined,
            _each = $.each,
            _extend = $.extend,
            _isEmptyObject = $.isEmptyObject,
            _Event = $.Event,
            _noop = $.noop,
            SELECTED_STATE = 2,
            HOVER_STATE = 1,
            NONE_MODE = "none",
            INCLUDE_POINTS = "includepoints",
            EXLUDE_POINTS = "excludepoints",
            ALL_SERIES_POINTS_MODE = "allseriespoints",
            APPLY_SELECTED = "applySelected",
            APPLY_HOVER = "applyHover",
            getEmptyBusinessRange = function() {
                return {
                        arg: {},
                        val: {}
                    }
            };
        viz.core.series.mixins = {
            chart: {},
            pieChart: {}
        };
        viz.core.series.Series = DX.Class.inherit({
            ctor: function(renderer, options) {
                this.fullState = 0;
                this._renderer = renderer;
                this._group = renderer.createGroup({"class": "dxc-series"});
                this.updateOptions(options)
            },
            update: function(data, options) {
                this.updateOptions(options);
                this.updateData(data)
            },
            _createLegendState: function(styleOptions, defaultColor) {
                return {
                        fill: styleOptions.color || defaultColor,
                        hatching: styleOptions.hatching
                    }
            },
            getLegendStyles: function() {
                return this._styles.legendStyles
            },
            _createStyles: function(options) {
                var mainSeriesColor = options.mainSeriesColor,
                    specialMainColor = this._getSpecialColor(mainSeriesColor);
                this._styles = {
                    normal: this._parseStyle(options, mainSeriesColor, mainSeriesColor),
                    hover: this._parseStyle(options.hoverStyle || {}, specialMainColor, mainSeriesColor),
                    selection: this._parseStyle(options.selectionStyle || {}, specialMainColor, mainSeriesColor),
                    legendStyles: {
                        normal: this._createLegendState(options, mainSeriesColor),
                        hover: this._createLegendState(options.hoverStyle || {}, specialMainColor),
                        selection: this._createLegendState(options.selectionStyle || {}, specialMainColor)
                    }
                }
            },
            setAdjustSeriesLabels: function(adjustSeriesLabels) {
                _each(this._points || [], function(_, point) {
                    point.setAdjustSeriesLabels(adjustSeriesLabels)
                })
            },
            setClippingParams: function(id, forceClipping) {
                this._paneClipRectID = id;
                this._forceClipping = forceClipping
            },
            getTagField: function() {
                return this._options.tagField || "tag"
            },
            getValueFields: _noop,
            getArgumentField: _noop,
            getPoints: function() {
                return this._points
            },
            _createPoint: function(data, pointsArray, index) {
                data.index = index;
                if (this._checkData(data)) {
                    var point = pointsArray[index],
                        options = this._customizePoint(data) || this._getCreatingPointOptions();
                    if (point)
                        point.update(data, options);
                    else {
                        point = viz.core.CoreFactory.createPoint(data, options);
                        pointsArray.push(point)
                    }
                    this.pointsByArgument[point.argument.valueOf()] = this.pointsByArgument[point.argument.valueOf()] || point;
                    return true
                }
            },
            getRangeData: function(zoomArgs, calcIntervalFunction) {
                return this._visible ? _extend(true, {}, this._getRangeData(zoomArgs, calcIntervalFunction)) : getEmptyBusinessRange()
            },
            _deleteElementsGroup: function() {
                if (this._elementsGroup) {
                    this._elementsGroup.detach();
                    this._elementsGroup = null
                }
            },
            _deleteBordersGroup: function() {
                if (this._bordersGroup) {
                    this._bordersGroup.detach();
                    this._bordersGroup = null
                }
            },
            _saveOldAnimationMethods: function() {
                this._oldClearingAnimation = this._clearingAnimation;
                this._oldUpdateElement = this._updateElement
            },
            _deleteOldAnimationMethods: function() {
                this._oldClearingAnimation = null;
                this._oldUpdateElement = null
            },
            updateOptions: function(newOptions) {
                var that = this,
                    widgetType = newOptions.widgetType,
                    oldType = that.type,
                    newType = newOptions.type;
                that.type = newType && newType.toString().toLowerCase();
                if (!that._checkType(widgetType)) {
                    that.dispose();
                    that.isUpdated = false;
                    return
                }
                if (oldType !== that.type) {
                    that._firstDrawing = true;
                    that._saveOldAnimationMethods();
                    that._resetType(oldType, widgetType);
                    that._setType(that.type, widgetType)
                }
                that._options = newOptions;
                that._pointOptions = null;
                that._deletePatterns();
                that._patterns = [];
                that.name = newOptions.name;
                that.pane = newOptions.pane;
                that.axis = newOptions.axis;
                that.tag = newOptions.tag;
                that._createStyles(newOptions);
                that._updateOptions(newOptions);
                that._visible = newOptions.visible;
                that.isUpdated = true
            },
            _disposePoints: function(points) {
                $.each(points || [], function(_, p) {
                    p.dispose()
                })
            },
            _correctPointsLength: function(length, points) {
                this._disposePoints(this._oldPoints);
                this._oldPoints = points.splice(length, points.length)
            },
            _getTicksForAggregation: function(min, max, screenDelta, pointSize) {
                return viz.core.tickProvider.getTicks({
                        min: min,
                        max: max,
                        screenDelta: screenDelta,
                        gridSpacingFactor: pointSize
                    })
            },
            updateDataType: function(settings) {
                var that = this;
                that.argumentType = settings.argumentType;
                that.valueType = settings.valueType;
                that.argumentAxisType = settings.argumentAxisType;
                that.valueAxisType = settings.valueAxisType
            },
            getValueCategories: function() {
                return this._options.valueCategories || []
            },
            getOptions: function() {
                return this._options
            },
            getArgumentCategories: function() {
                return this._options.argumentCategories || []
            },
            updateData: function(data) {
                var that = this,
                    points,
                    lastPointIndex = 0,
                    options = that._options,
                    pointData;
                that.pointsByArgument = {};
                points = that._originalPoints || [];
                that._rangeData = getEmptyBusinessRange();
                if (data && data.length)
                    that._canRenderCompleteHandle = true;
                that._beginUpdateData();
                _each(data, function(index, dataItem) {
                    pointData = that._getPointData(dataItem, options);
                    if (that._createPoint(pointData, points, lastPointIndex)) {
                        that._processRange(points[lastPointIndex], lastPointIndex > 0 ? points[lastPointIndex - 1] : null);
                        lastPointIndex++
                    }
                });
                that._points = that._originalPoints = points;
                that._correctPointsLength(lastPointIndex, points);
                that._endUpdateData()
            },
            getTeamplatedFields: function() {
                var that = this,
                    fields = that.getValueFields(),
                    teampleteFields = [];
                fields.push(that.getTagField());
                _each(fields, function(_, field) {
                    var fieldsObject = {};
                    fieldsObject.teamplateField = field + that.name;
                    fieldsObject.originalField = field;
                    teampleteFields.push(fieldsObject)
                });
                return teampleteFields
            },
            resamplePoints: function(translators, min, max) {
                var that = this,
                    originalPoints = that.getAllPoints(),
                    argTranslator = that._options.rotated ? translators.y : translators.x,
                    minI,
                    maxI,
                    sizePoint,
                    ticks;
                if (originalPoints.length) {
                    _each(originalPoints, function(i, point) {
                        minI = point.argument - min <= 0 ? i : minI;
                        if (!maxI)
                            maxI = point.argument - max > 0 ? i : null
                    });
                    minI = minI ? minI : 1;
                    maxI = utils.isDefined(maxI) ? maxI : originalPoints.length - 1;
                    min = originalPoints[minI - 1].argument;
                    max = originalPoints[maxI].argument;
                    sizePoint = that._getPointSize();
                    if (that.argumentAxisType !== "discrete" && that.valueAxisType !== "discrete")
                        ticks = that._getTicksForAggregation(min, max, argTranslator.canvasLength, sizePoint);
                    else
                        ticks = argTranslator.canvasLength / sizePoint;
                    that._points = that._resample(ticks, ticks.tickInterval)
                }
            },
            _removeOldSegments: function(startIndex) {
                var that = this;
                _each(that._graphics.splice(startIndex, that._graphics.length) || [], function(_, elem) {
                    that._removeElement(elem)
                });
                if (that._trackers)
                    _each(that._trackers.splice(startIndex, that._trackers.length) || [], function(_, elem) {
                        elem.remove()
                    })
            },
            draw: function(translators, animationEnabled, hideLayoutLabels, legendCallback) {
                var that = this;
                if (that._oldClearingAnimation && animationEnabled && that._firstDrawing) {
                    var drawComplete = function() {
                            that._draw(translators, true, hideLayoutLabels)
                        };
                    that._oldClearingAnimation(translators, drawComplete)
                }
                else
                    that._draw(translators, animationEnabled, hideLayoutLabels, legendCallback)
            },
            _clearSeries: function() {
                this._deleteElementsGroup();
                this._deleteBordersGroup();
                this._deleteTrackers();
                this._graphics = [];
                this._trackers = []
            },
            _draw: function(translators, animationEnabled, hideLayoutLabels, legendCallback) {
                var that = this,
                    points = that._points || [],
                    segment = [],
                    segmentCount = 0,
                    firstDrawing = that._firstDrawing,
                    markersGroup,
                    labelsGroup;
                that._graphics = that._graphics || [],
                that._graphics = that._graphics || [];
                that._prepareSeriesToDrawing();
                if (!that._visible) {
                    animationEnabled = false;
                    this._group.detach();
                    return
                }
                else
                    that._group.append(that._options.seriesGroup);
                that.translators = translators;
                that._createGroups(animationEnabled, undefined, firstDrawing);
                that._segments = [];
                markersGroup = that._markersGroup;
                labelsGroup = that._labelsGroup;
                that._drawedPoints = [];
                that._firstDrawing = points.length ? false : true;
                _each(this._patterns || [], function(_, pattern) {
                    pattern.append()
                });
                _each(points, function(i, p) {
                    p.translate(translators);
                    if (p.hasValue()) {
                        that._drawPoint(p, markersGroup, labelsGroup, animationEnabled, firstDrawing);
                        segment.push(p)
                    }
                    else if (segment.length) {
                        that._drawSegment(segment, animationEnabled, segmentCount++);
                        segment = []
                    }
                });
                segment.length && that._drawSegment(segment, animationEnabled, segmentCount++);
                that._removeOldSegments(segmentCount);
                that._defaultSegments = that._generateDefaultSegments();
                that._adjustLabels(firstDrawing);
                hideLayoutLabels && that.hideLabels();
                animationEnabled && that._animate(firstDrawing);
                if (that.isSelected())
                    that._changeStyle(legendCallback, APPLY_SELECTED);
                else if (this.isHovered())
                    this._changeStyle(legendCallback, APPLY_HOVER)
            },
            drawTrackers: function() {
                var that = this,
                    trackers = that._trackers = that._trackers || [],
                    trackersGroup = that._trackersGroup = that._trackersGroup || that._renderer.createGroup(),
                    markerTrackerGroup = that._markerTrackerGroup = that._markerTrackerGroup || that._renderer.createGroup();
                if (!that.isVisible()) {
                    trackersGroup.detach();
                    markerTrackerGroup.detach();
                    return
                }
                else {
                    trackersGroup.append(that._options.trackersGroup);
                    markerTrackerGroup.append(that._options.markerTrackerGroup)
                }
                _each(that._segments || [], function(i, segment) {
                    if (!trackers[i]) {
                        trackers[i] = that._drawTrackerElement(segment).append(trackersGroup);
                        trackers[i].data({series: that})
                    }
                    else
                        that._updateTrackerElement(segment, trackers[i])
                });
                _each(that.getVisiblePoints(), function(_, p) {
                    p.drawTracker(that._renderer, markerTrackerGroup)
                });
                that._applyTrackersClippings()
            },
            _checkType: function(widgetType) {
                return !!viz.core.series.mixins[widgetType][this.type]
            },
            _resetType: function(seriesType, widgetType) {
                var that = this;
                if (seriesType)
                    _each(viz.core.series.mixins[widgetType][seriesType], function(methodName) {
                        delete that[methodName]
                    })
            },
            _setType: function(seriesType, widgetType) {
                var that = this;
                _each(viz.core.series.mixins[widgetType][seriesType], function(methodName, method) {
                    that[methodName] = method
                })
            },
            _setSelectedState: function(state, mode, legendCallback) {
                this.lastSelectionMode = mode = (mode || this._options.selectionMode).toLowerCase();
                if (state && !this.isSelected()) {
                    this.fullState = this.fullState | SELECTED_STATE;
                    this._changeStyle(legendCallback, APPLY_SELECTED)
                }
                else if (!state && this.isSelected()) {
                    this.fullState = this.fullState & ~SELECTED_STATE;
                    if (this.isHovered())
                        this._changeStyle(legendCallback, APPLY_HOVER);
                    else
                        this._changeStyle(legendCallback, "resetItem")
                }
            },
            _setHoverState: function(state, mode, legendCallback) {
                this.lastHoverMode = mode = (mode || this._options.hoverMode).toLowerCase();
                if (state && !this.isHovered()) {
                    this.fullState = this.fullState | HOVER_STATE;
                    !this.isSelected() && this._changeStyle(legendCallback, APPLY_HOVER)
                }
                else if (!state && this.isHovered()) {
                    this.fullState = this.fullState & ~HOVER_STATE;
                    !this.isSelected() && this._changeStyle(legendCallback, "resetItem")
                }
            },
            setHoverState: function(mode, legendCallback) {
                this._setHoverState(true, mode, legendCallback)
            },
            releaseHoverState: function(mode, legendCallback) {
                this._setHoverState(false, mode, legendCallback)
            },
            setSelectedState: function(mode, legendCallback) {
                this._setSelectedState(true, mode, legendCallback)
            },
            releaseSelectedState: function(mode, legendCallback) {
                this._setSelectedState(false, mode, legendCallback)
            },
            isFullStackedSeries: function() {
                return this.type.indexOf("fullstacked") === 0
            },
            isStackedSeries: function() {
                return this.type.indexOf("stacked") === 0
            },
            isFinancialSeries: function() {
                return this.type === "stock" || this.type === "candlestick"
            },
            _changeStyle: function(legendCallBack, legendAction) {
                var style = this._calcStyle(),
                    pointStyle;
                if (style.mode === NONE_MODE)
                    return;
                legendCallBack && legendCallBack(legendAction);
                if (style.mode === INCLUDE_POINTS || style.mode === ALL_SERIES_POINTS_MODE) {
                    pointStyle = style.pointStyle;
                    _each(this._points || [], function(_, p) {
                        !p.isSelected() && p.applyStyle(pointStyle)
                    })
                }
                this._applyStyle(style.series)
            },
            _calcStyle: function() {
                var styles = this._styles,
                    isHoverIncludeModeAndSeriesExcludeMode = false,
                    result;
                switch (this.fullState & 3) {
                    case 0:
                        result = {
                            pointStyle: "normal",
                            mode: INCLUDE_POINTS,
                            series: styles.normal
                        };
                        break;
                    case 1:
                        result = {
                            pointStyle: "hover",
                            mode: this.lastHoverMode,
                            series: styles.hover
                        };
                        break;
                    case 2:
                        result = {
                            pointStyle: "selection",
                            mode: this.lastSelectionMode,
                            series: styles.selection
                        };
                        break;
                    case 3:
                        isHoverIncludeModeAndSeriesExcludeMode = this.lastSelectionMode === EXLUDE_POINTS && (this.lastHoverMode === INCLUDE_POINTS || this.lastHoverMode === ALL_SERIES_POINTS_MODE);
                        result = {
                            pointStyle: isHoverIncludeModeAndSeriesExcludeMode ? "normal" : "selection",
                            mode: isHoverIncludeModeAndSeriesExcludeMode ? INCLUDE_POINTS : this.lastSelectionMode,
                            series: styles.selection
                        }
                }
                return result
            },
            _getMainAxisName: function() {
                return this._options.rotated ? "X" : "Y"
            },
            areLabelsVisible: function() {
                return !_isDefined(this._options.maxLabelCount) || this._points.length <= this._options.maxLabelCount
            },
            getLabelVisibility: function() {
                return this.areLabelsVisible() && this._options.label && this._options.label.visible
            },
            _customizePoint: function(pointData) {
                var that = this,
                    options = that._options,
                    customizePoint = that._options.customizePoint,
                    customizeObject,
                    pointOptions,
                    customLabelOptions,
                    customOptions,
                    customizeLabel = that._options.customizeLabel,
                    useLabelCustomOptions,
                    usePointCustomOptions;
                if (customizeLabel && customizeLabel.call) {
                    customizeObject = _extend({
                        seriesName: that.name,
                        series: that
                    }, pointData);
                    customLabelOptions = customizeLabel.call(customizeObject, customizeObject);
                    useLabelCustomOptions = customLabelOptions && !_isEmptyObject(customLabelOptions);
                    customLabelOptions = useLabelCustomOptions ? _extend(true, {}, options.label, customLabelOptions) : null
                }
                if (customizePoint && customizePoint.call) {
                    customizeObject = customizeObject || _extend({
                        seriesName: that.name,
                        series: that
                    }, pointData);
                    customOptions = customizePoint.call(customizeObject, customizeObject);
                    usePointCustomOptions = customOptions && !_isEmptyObject(customOptions)
                }
                if (useLabelCustomOptions || usePointCustomOptions) {
                    pointOptions = that._parsePointOptions(that._preparePointOptions(customOptions), customLabelOptions || options.label);
                    pointOptions.styles.useLabelCustomOptions = useLabelCustomOptions;
                    pointOptions.styles.usePointCustomOptions = usePointCustomOptions
                }
                return pointOptions
            },
            _getLabelOptions: function(labelOptions, defaultColor) {
                var opt = labelOptions || {},
                    labelFont = opt.font || {},
                    labelBorder = opt.border || {},
                    labelConnector = opt.connector || {},
                    labelAttributes = {
                        align: opt.alignment,
                        font: {
                            color: opt.backgroundColor === "none" && labelFont.color.toLowerCase() === "#ffffff" && opt.position !== "inside" ? defaultColor : labelFont.color,
                            family: labelFont.family,
                            weight: labelFont.weight,
                            size: labelFont.size,
                            opacity: labelFont.opacity
                        },
                        style: opt.style
                    },
                    backgroundAttr = {
                        fill: opt.backgroundColor || defaultColor,
                        strokeWidth: labelBorder.visible ? labelBorder.width || 0 : 0,
                        stroke: labelBorder.visible && labelBorder.width ? labelBorder.color : "none",
                        dashStyle: labelBorder.dashStyle
                    },
                    connectorAttr = {
                        stroke: labelConnector.visible && labelConnector.width ? labelConnector.color || defaultColor : "none",
                        strokeWidth: labelConnector.visible ? labelConnector.width || 0 : 0
                    };
                return {
                        format: opt.format,
                        argumentFormat: opt.argumentFormat,
                        precision: opt.precision,
                        argumentPrecision: opt.argumentPrecision,
                        percentPrecision: opt.percentPrecision,
                        customizeText: $.isFunction(opt.customizeText) ? opt.customizeText : undefined,
                        attributes: labelAttributes,
                        visible: labelFont.size !== 0 ? opt.visible : false,
                        showForZeroValues: opt.showForZeroValues,
                        horizontalOffset: opt.horizontalOffset,
                        verticalOffset: opt.verticalOffset,
                        radialOffset: opt.radialOffset,
                        background: backgroundAttr,
                        position: opt.position,
                        connector: connectorAttr,
                        rotationAngle: opt.rotationAngle,
                        resolveLabelsOverlapping: this._options.resolveLabelsOverlapping
                    }
            },
            show: function() {
                if (!this._visible) {
                    this._visible = true;
                    this.hidePointTooltip();
                    this._options.visibilityChanged()
                }
            },
            hide: function() {
                if (this._visible) {
                    this._visible = false;
                    this.hidePointTooltip();
                    this._options.visibilityChanged()
                }
            },
            hideLabels: function() {
                _each(this._points, function(_, point) {
                    point._label.hide()
                })
            },
            _parsePointOptions: function(pointOptions, labelOptions) {
                var options = this._options,
                    styles = this._createPointStyles(pointOptions),
                    parsedOptions;
                parsedOptions = _extend(true, {}, pointOptions, {
                    type: options.type,
                    tag: this.tag,
                    rotated: options.rotated,
                    series: this,
                    styles: styles,
                    visibilityChanged: options.visibilityChanged
                });
                parsedOptions.label = this._getLabelOptions(labelOptions, styles.normal.fill);
                return parsedOptions
            },
            _resample: function(ticks, ticksInterval) {
                var that = this,
                    fusPoints = [],
                    arrayFusPoints,
                    nowIndexTicks = 0,
                    lastPointIndex = 0,
                    originalPoints = that.getAllPoints();
                if (that.argumentAxisType === "discrete" || that.valueAxisType === "discrete") {
                    ticksInterval = originalPoints.length / ticks;
                    arrayFusPoints = $.map(originalPoints, function(point, index) {
                        if (Math.floor(nowIndexTicks) <= index) {
                            nowIndexTicks += ticksInterval;
                            return point
                        }
                        point.setInvisibility();
                        return null
                    });
                    return arrayFusPoints
                }
                that._aggregatedPoints = that._aggregatedPoints || [];
                _each(originalPoints, function(_, point) {
                    switch (that._isInInterval(point.argument, ticks, nowIndexTicks, ticksInterval)) {
                        case true:
                            fusPoints.push(point);
                            break;
                        case"nextInterval":
                            var pointData = that._fusionPoints(fusPoints, ticks[nowIndexTicks], nowIndexTicks);
                            while (that._isInInterval(point.argument, ticks, nowIndexTicks, ticksInterval) === "nextInterval")
                                nowIndexTicks++;
                            fusPoints = [];
                            that._isInInterval(point.argument, ticks, nowIndexTicks, ticksInterval) === true && fusPoints.push(point);
                            if (that._createPoint(pointData, that._aggregatedPoints, lastPointIndex))
                                lastPointIndex++
                    }
                });
                if (fusPoints.length) {
                    var pointData = that._fusionPoints(fusPoints, ticks[nowIndexTicks], nowIndexTicks);
                    if (that._createPoint(pointData, that._aggregatedPoints, lastPointIndex))
                        lastPointIndex++
                }
                that._correctPointsLength(lastPointIndex, that._aggregatedPoints);
                that._endUpdateData();
                return that._aggregatedPoints
            },
            _isInInterval: function(argument, ticks, nowIndexTicks, ticksInterval) {
                var minTick = ticks[nowIndexTicks],
                    maxTick = ticks[nowIndexTicks + 1],
                    sumMinTickTicksInterval;
                ticksInterval = $.isNumeric(ticksInterval) ? ticksInterval : utils.convertDateTickIntervalToMilliseconds(ticksInterval);
                sumMinTickTicksInterval = utils.isDate(minTick) ? new Date(minTick.getTime() + ticksInterval) : minTick + ticksInterval;
                if (argument >= minTick && argument < sumMinTickTicksInterval)
                    return true;
                if (argument < minTick || maxTick === undefined)
                    return false;
                return "nextInterval"
            },
            canRenderCompleteHandle: function() {
                var result = this._canRenderCompleteHandle;
                delete this._canRenderCompleteHandle;
                return !!result
            },
            isHovered: function() {
                return !!(this.fullState & 1)
            },
            isSelected: function() {
                return !!(this.fullState & 2)
            },
            isVisible: function() {
                return this._visible
            },
            getAllPoints: function() {
                return (this._originalPoints || []).slice()
            },
            getPointByPos: function(pos) {
                return (this._points || [])[pos]
            },
            getVisiblePoints: function() {
                return (this._drawedPoints || []).slice()
            },
            setPointHoverState: function(point, legendCallback) {
                point.fullState = point.fullState | HOVER_STATE;
                if (!(this.isSelected() && (this.lastSelectionMode === ALL_SERIES_POINTS_MODE || this.lastSelectionMode === INCLUDE_POINTS)) && !point.isSelected()) {
                    point.applyStyle("hover");
                    legendCallback && legendCallback("applyHover")
                }
            },
            releasePointHoverState: function(point, legendCallback) {
                point.fullState = point.fullState & ~HOVER_STATE;
                if (!(this.isSelected() && (this.lastSelectionMode === ALL_SERIES_POINTS_MODE || this.lastSelectionMode === INCLUDE_POINTS)) && !point.isSelected())
                    if (!(this.isHovered() && (this.lastHoverMode === ALL_SERIES_POINTS_MODE || this.lastHoverMode === INCLUDE_POINTS))) {
                        point.applyStyle("normal");
                        legendCallback && legendCallback("resetItem")
                    }
            },
            setPointSelectedState: function(point, legendCallback) {
                point.fullState = point.fullState | SELECTED_STATE;
                point.applyStyle("selection");
                legendCallback && legendCallback("applySelected")
            },
            releasePointSelectedState: function(point, legendCallback) {
                point.fullState = point.fullState & ~SELECTED_STATE;
                if (this.isHovered() && (this.lastHoverMode === ALL_SERIES_POINTS_MODE || this.lastHoverMode === INCLUDE_POINTS) || point.isHovered()) {
                    point.applyStyle("hover");
                    legendCallback && legendCallback("applyHover")
                }
                else if (this.isSelected() && (this.lastSelectionMode === ALL_SERIES_POINTS_MODE || this.lastSelectionMode === INCLUDE_POINTS)) {
                    point.applyStyle("selection");
                    legendCallback && legendCallback("applySelected")
                }
                else {
                    point.applyStyle("normal");
                    legendCallback && legendCallback("resetItem")
                }
            },
            selectPoint: function(point) {
                this._options.seriesGroup && this._options.seriesGroup.trigger(new _Event("selectpoint"), point)
            },
            deselectPoint: function(point) {
                this._options.seriesGroup && this._options.seriesGroup.trigger(new _Event("deselectpoint"), point)
            },
            showPointTooltip: function(point) {
                this._options.seriesGroup && this._options.seriesGroup.trigger(new _Event("showpointtooltip"), point)
            },
            hidePointTooltip: function(point) {
                this._options.seriesGroup && this._options.seriesGroup.trigger(new _Event("hidepointtooltip"), point)
            },
            select: function() {
                this._options.seriesGroup && this._options.seriesGroup.trigger(new _Event("selectseries", {target: this}), this._options.selectionMode);
                this._group.toForeground();
                this._trackersGroup && this._trackersGroup.toBackground()
            },
            clearSelection: function clearSelection() {
                this._options.seriesGroup && this._options.seriesGroup.trigger(new _Event("deselectseries", {target: this}), this._options.selectionMode)
            },
            getPointByArg: function(arg) {
                return this.pointsByArgument[arg.valueOf()] || null
            },
            _deletePoints: function() {
                this._disposePoints(this._originalPoints);
                this._disposePoints(this._aggregatedPoints);
                this._disposePoints(this._oldPoints);
                this._points = null;
                this._oldPoints = null;
                this._aggregatedPoints = null;
                this._originalPoints = null;
                this._drawedPoint = null
            },
            _deletePatterns: function() {
                _each(this._patterns || [], function(_, pattern) {
                    pattern && pattern.dispose()
                });
                this._patterns = null
            },
            _deleteTrackers: function() {
                var that = this;
                _each(that._trackers || [], function(_, tracker) {
                    tracker.remove()
                });
                that._trackersGroup && that._trackersGroup.detach();
                that._markerTrackerGroup && that._markerTrackerGroup.detach();
                that._trackers = that._trackersGroup = that._markerTrackerGroup = null
            },
            dispose: function() {
                this._deletePoints();
                this._group.detach();
                this._labelsGroup && this._labelsGroup.detach();
                this._deletePatterns();
                this._deleteTrackers();
                this._group = null;
                this._markersGroup = null;
                this._elementsGroup = null;
                this._bordersGroup = null;
                this._labelsGroup = null;
                this._graphics = null;
                this._rangeData = null;
                this._renderer = null;
                this.translators = null;
                this._styles = null;
                this._options = null;
                this._pointOptions = null;
                this._drawedPoints = null;
                this._aggregatedPoints = null;
                this.pointsByArgument = null;
                this._segments = null
            },
            correctPosition: _noop,
            getColor: function() {
                return this.getLegendStyles().normal.fill
            },
            getStackName: function() {
                return this.type === "stackedbar" || this.type === "fullstackedbar" ? this._stackName : null
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file rangeDataCalculator.js */
    (function($, DX) {
        var _math = Math,
            _abs = _math.abs,
            _min = _math.min,
            _each = $.each,
            _isEmptyObject = $.isEmptyObject,
            _isDefined = DevExpress.utils.isDefined,
            FULLSTACKED_SERIES_VALUE_MARGIN_PRIORITY = 15,
            BAR_ZERO_VALUE_MARGIN_PRIORITY = 20,
            SERIES_VALUE_MARGIN_PRIORITY = 20,
            SERIES_LABEL_VALUE_MARGIN = 0.3,
            CATEGORIES_SELECTOR = "categories",
            INTERVAL_SELECTOR = "interval",
            MIN_VALUE_MARGIN_SELECTOR = "minValueMargin",
            MAX_VALUE_MARGIN_SELECTOR = "maxValueMargin",
            MIN = "min",
            MAX = "max",
            MIN_VISIBLE = "minVisible",
            MAX_VISIBLE = "maxVisible";
        DevExpress.viz.core.series.helpers.rangeDataCalculator = function() {
            var _truncateValue = function(data, minField, maxField, value) {
                    var min = data[minField],
                        max = data[maxField];
                    data[minField] = value < min || !_isDefined(min) ? value : data[minField];
                    data[maxField] = value > max || !_isDefined(max) ? value : data[maxField]
                };
            var _processTwoValues = function(series, point, prevPoint, highValueName, lowValueName) {
                    var val = point[highValueName],
                        minVal = point[lowValueName],
                        arg = point.argument,
                        prevVal = prevPoint && prevPoint[highValueName],
                        prevMinVal = prevPoint && prevPoint[lowValueName],
                        prevArg = prevPoint && prevPoint.argument;
                    point.hasValue() && _processRangeValue(series, val, minVal, prevVal, prevMinVal);
                    _processValue(series, "arg", arg, prevArg)
                };
            var _processValue = function(series, type, value, prevValue, calcInterval) {
                    var axis = type === "arg" ? "argument" : "value",
                        data = series._rangeData[type],
                        minInterval = data[INTERVAL_SELECTOR],
                        interval;
                    if (series[axis + "AxisType"] === "discrete") {
                        data[CATEGORIES_SELECTOR] = data[CATEGORIES_SELECTOR] || [];
                        data[CATEGORIES_SELECTOR].push(value)
                    }
                    else {
                        _truncateValue(data, "min", "max", value);
                        if (type === "arg") {
                            interval = _isDefined(prevValue) ? _abs(calcInterval ? calcInterval(value, prevValue) : value - prevValue) : interval;
                            data[INTERVAL_SELECTOR] = _isDefined(interval) && (interval < minInterval || !_isDefined(minInterval)) ? interval : minInterval
                        }
                    }
                };
            var _addToVisibleRange = function(series, value) {
                    var data = series._rangeData.val,
                        isDiscrete = series.valueAxisType === "discrete";
                    if (isDiscrete) {
                        data.visibleCategories = data.visibleCategories || [];
                        data.visibleCategories.push(value)
                    }
                    else {
                        if (value < data.minVisible || !_isDefined(data.minVisible))
                            data.minVisible = value;
                        if (value > data.maxVisible || !_isDefined(data.maxVisible))
                            data.maxVisible = value
                    }
                };
            var _processRangeValue = function(series, val, minVal, prevVal, prevMinVal) {
                    var data = series._rangeData.val,
                        interval,
                        currentInterval = data[INTERVAL_SELECTOR];
                    if (series.valueAxisType === "discrete") {
                        data.categories = data.categories || [];
                        data.categories.push(val, minVal)
                    }
                    else {
                        _truncateValue(data, MIN, MAX, val);
                        _truncateValue(data, MIN, MAX, minVal)
                    }
                };
            var _unique = function(array) {
                    var values = {};
                    return $.map(array, function(item) {
                            var result = !values[item] ? item : null;
                            values[item] = true;
                            return result
                        })
                };
            var _processZoomArgument = function(series, zoomArgs) {
                    var data = series._rangeData.arg,
                        minArg,
                        maxArg;
                    minArg = zoomArgs.minArg < zoomArgs.maxArg ? zoomArgs.minArg : zoomArgs.maxArg;
                    maxArg = zoomArgs.maxArg > zoomArgs.minArg ? zoomArgs.maxArg : zoomArgs.minArg;
                    data.min = minArg < data.min ? minArg : data.min;
                    data.max = maxArg > data.max ? maxArg : data.max;
                    data.minVisible = minArg;
                    data.maxVisible = maxArg
                };
            var _correctZoomValue = function(series, zoomArgs) {
                    var minVal,
                        maxVal;
                    if (_isDefined(zoomArgs.minVal) && _isDefined(zoomArgs.maxVal)) {
                        minVal = zoomArgs.minVal < zoomArgs.maxVal ? zoomArgs.minVal : zoomArgs.maxVal;
                        maxVal = zoomArgs.maxVal > zoomArgs.minVal ? zoomArgs.maxVal : zoomArgs.minVal
                    }
                    if (_isDefined(zoomArgs.minVal)) {
                        series._rangeData.val.min = minVal < series._rangeData.val.min ? minVal : series._rangeData.val.min;
                        series._rangeData.val.minVisible = minVal
                    }
                    if (_isDefined(zoomArgs.maxVal)) {
                        series._rangeData.val.max = maxVal > series._rangeData.val.max ? maxVal : series._rangeData.val.max;
                        series._rangeData.val.maxVisible = maxVal
                    }
                };
            var _processZoomValue = function(series, zoomArgs) {
                    var adjustOnZoom = zoomArgs.adjustOnZoom,
                        points = series._points || [],
                        lastVisibleIndex,
                        prevPointAdded = false;
                    _each(points, function(index, point) {
                        var arg = point.argument,
                            prevPoint = index > 0 ? points[index - 1] : null;
                        if (adjustOnZoom && arg >= series._rangeData.arg.minVisible && arg <= series._rangeData.arg.maxVisible) {
                            if (!prevPointAdded) {
                                prevPoint && prevPoint.hasValue() && _addToVisibleRange(series, prevPoint.value);
                                prevPointAdded = true
                            }
                            point.hasValue() && _addToVisibleRange(series, point.value);
                            lastVisibleIndex = index
                        }
                    });
                    if (_isDefined(lastVisibleIndex) && lastVisibleIndex < points.length - 1 && points[lastVisibleIndex + 1].hasValue())
                        _addToVisibleRange(series, points[lastVisibleIndex + 1].value);
                    _correctZoomValue(series, zoomArgs)
                };
            var _processZoomRangeValue = function(series, zoomArgs, maxValueName, minValueName) {
                    var adjustOnZoom = zoomArgs.adjustOnZoom,
                        points = series._points || [],
                        lastVisibleIndex,
                        prevPointAdded = false;
                    _each(points, function(index, point) {
                        var arg = point.argument,
                            prevPoint = index > 0 ? points[index - 1] : null;
                        if (adjustOnZoom && arg >= series._rangeData.arg.minVisible && arg <= series._rangeData.arg.maxVisible) {
                            if (!prevPointAdded) {
                                if (prevPoint && prevPoint.hasValue()) {
                                    _addToVisibleRange(series, prevPoint[maxValueName]);
                                    _addToVisibleRange(series, prevPoint[minValueName])
                                }
                                prevPointAdded = true
                            }
                            if (point.hasValue()) {
                                _addToVisibleRange(series, point[maxValueName]);
                                _addToVisibleRange(series, point[minValueName])
                            }
                            lastVisibleIndex = index
                        }
                    });
                    if (_isDefined(lastVisibleIndex) && lastVisibleIndex < points.length - 1 && points[lastVisibleIndex + 1].hasValue())
                        _addToVisibleRange(series, points[lastVisibleIndex + 1].value);
                    _correctZoomValue(series, zoomArgs)
                };
            var _processNewInterval = function(series, calcInterval) {
                    var data = series._rangeData,
                        points = series._points || [],
                        isArgumentAxisDiscrete = series.argumentAxisType === "discrete";
                    delete data.arg.interval;
                    _each(points, function(index, point) {
                        var arg = point.argument,
                            prevPoint = index > 0 ? points[index - 1] : null,
                            prevArg = prevPoint && prevPoint.argument;
                        !isArgumentAxisDiscrete && _processValue(series, "arg", arg, prevArg, calcInterval)
                    })
                };
            var _fillRangeData = function(series) {
                    var data = series._rangeData,
                        mainAxis = series._getMainAxisName(),
                        axis = mainAxis === "X" ? "Y" : "X";
                    data.arg.categories && (data.arg.categories = _unique(data.arg.categories));
                    data.val.categories && (data.val.categories = _unique(data.val.categories));
                    data.arg.visibleCategories && (data.arg.visibleCategories = _unique(data.arg.visibleCategories));
                    data.val.visibleCategories && (data.val.visibleCategories = _unique(data.val.visibleCategories));
                    data.arg.axisType = series.argumentAxisType;
                    data.arg.dataType = series.argumentType;
                    data.val.axisType = series.valueAxisType;
                    data.val.dataType = series.valueType;
                    data.val.isValueRange = true
                };
            var _setPadding = function(range, prefix, val, priority) {
                    range[prefix] = val;
                    range[prefix + "Priority"] = priority
                };
            var _setZeroPadding = function(range, val, prefix) {
                    val === 0 && _setPadding(range, prefix, 0, BAR_ZERO_VALUE_MARGIN_PRIORITY)
                };
            var _calculateRangeMinValue = function(series, zoomArgs) {
                    var data = series._rangeData.val,
                        minVisible = data[MIN_VISIBLE],
                        maxVisible = data[MAX_VISIBLE];
                    zoomArgs = zoomArgs || {};
                    if (data) {
                        data.alwaysCorrectMin = true;
                        series._rangeData.arg.keepValueMargins = true;
                        if (series.valueAxisType !== "logarithmic" && series.valueType !== "datetime" && series.getOptions().showZero !== false) {
                            data[MIN_VISIBLE] = minVisible > (zoomArgs.minVal || 0) ? zoomArgs.minVal || 0 : minVisible;
                            data[MAX_VISIBLE] = maxVisible < (zoomArgs.maxVal || 0) ? zoomArgs.maxVal || 0 : maxVisible;
                            data[MIN] = data[MIN] > 0 ? 0 : data[MIN];
                            _setZeroPadding(data, data[MIN], MIN_VALUE_MARGIN_SELECTOR);
                            data[MAX] = data[MAX] < 0 ? 0 : data[MAX];
                            if (data[MAX] === 0 || data[MAX] > 0 && data[MIN] < 0) {
                                data[MIN_VALUE_MARGIN_SELECTOR] = data[MAX_VALUE_MARGIN_SELECTOR];
                                data[MIN_VALUE_MARGIN_SELECTOR + "Priority"] = data[MAX_VALUE_MARGIN_SELECTOR + "Priority"]
                            }
                            _setZeroPadding(data, data[MAX], MAX_VALUE_MARGIN_SELECTOR)
                        }
                    }
                };
            var _processFullStackedRange = function(series) {
                    var data = series._rangeData.val,
                        isRangeEmpty = _isEmptyObject(data);
                    _setPadding(data, "minValueMargin", 0, FULLSTACKED_SERIES_VALUE_MARGIN_PRIORITY);
                    _setPadding(data, "maxValueMargin", 0, FULLSTACKED_SERIES_VALUE_MARGIN_PRIORITY);
                    !isRangeEmpty && (data.min = 0)
                };
            var _processRange = function(series, point, prevPoint) {
                    var val = point.value,
                        arg = point.argument,
                        prevVal = prevPoint && prevPoint.value,
                        prevArg = prevPoint && prevPoint.argument;
                    point.hasValue() && _processValue(series, "val", val, prevVal);
                    _processValue(series, "arg", arg, prevArg)
                };
            var _addLabelPaddings = function(series) {
                    var labelOptions = series.getOptions().label;
                    if (series.areLabelsVisible() && labelOptions && labelOptions.visible && labelOptions.position !== "inside")
                        _setPadding(series._rangeData.val, "maxValueMargin", SERIES_LABEL_VALUE_MARGIN, SERIES_VALUE_MARGIN_PRIORITY)
                };
            var _addRangeSeriesLabelPaddings = function(series) {
                    var data = series._rangeData.val;
                    if (series.areLabelsVisible() && series._options.label.visible && series._options.label.position !== "inside") {
                        _setPadding(data, "maxValueMargin", SERIES_LABEL_VALUE_MARGIN, SERIES_VALUE_MARGIN_PRIORITY);
                        _setPadding(data, "minValueMargin", SERIES_LABEL_VALUE_MARGIN, SERIES_VALUE_MARGIN_PRIORITY)
                    }
                };
            var _calculateRangeData = function(series, zoomArgs, calcIntervalFunction) {
                    var valueData = series._rangeData.val;
                    if (series.argumentAxisType !== "discrete" && zoomArgs && _isDefined(zoomArgs.minArg) && _isDefined(zoomArgs.maxArg)) {
                        valueData[MIN_VISIBLE] = zoomArgs.minVal;
                        valueData[MAX_VISIBLE] = zoomArgs.maxVal;
                        _processZoomArgument(series, zoomArgs);
                        _processZoomValue(series, zoomArgs)
                    }
                    else if (!zoomArgs && calcIntervalFunction)
                        _processNewInterval(series, calcIntervalFunction);
                    _fillRangeData(series)
                };
            var _calculateTwoValuesRangeData = function(series, zoomArgs, calcIntervalFunction, maxValueName, minValueName) {
                    var valueData = series._rangeData.val;
                    if (series.argumentAxisType !== "discrete" && zoomArgs && _isDefined(zoomArgs.minArg) && _isDefined(zoomArgs.maxArg)) {
                        valueData[MIN_VISIBLE] = zoomArgs.minVal;
                        valueData[MAX_VISIBLE] = zoomArgs.maxVal;
                        _processZoomArgument(series, zoomArgs);
                        _processZoomRangeValue(series, zoomArgs, maxValueName, minValueName)
                    }
                    else if (!zoomArgs && calcIntervalFunction)
                        _processNewInterval(series);
                    _fillRangeData(series)
                };
            return {
                    processRange: _processRange,
                    calculateRangeData: _calculateRangeData,
                    calculateTwoValuesRangeData: _calculateTwoValuesRangeData,
                    addLabelPaddings: _addLabelPaddings,
                    addRangeSeriesLabelPaddings: _addRangeSeriesLabelPaddings,
                    processFullStackedRange: _processFullStackedRange,
                    calculateRangeMinValue: _calculateRangeMinValue,
                    processTwoValues: _processTwoValues
                }
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file scatterSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            series = viz.core.series,
            rangeCalculator = series.helpers.rangeDataCalculator(),
            _each = $.each,
            _extend = $.extend,
            _map = $.map,
            _noop = $.noop,
            _isDefined = DX.utils.isDefined,
            _floor = Math.floor,
            DEFAULT_SYMBOL_POINT_SIZE = 2,
            DEFAULT_TRACKER_WIDTH = 20,
            DEFAULT_DURATION = 400;
        series.mixins.chart.scatter = {
            _defaultDuration: DEFAULT_DURATION,
            _defaultTrackerWidth: DEFAULT_TRACKER_WIDTH,
            _applyStyle: _noop,
            _adjustLabels: _noop,
            _updateOptions: _noop,
            _parseStyle: _noop,
            _prepareSegment: _noop,
            _drawSegment: _noop,
            _generateDefaultSegments: _noop,
            _prepareSeriesToDrawing: function() {
                this._deleteOldAnimationMethods();
                this._firstDrawing && this._clearSeries();
                this._disposePoints(this._oldPoints);
                this._oldPoints = null
            },
            _applyTrackersClippings: function() {
                this._markerTrackerGroup.applySettings({clipId: this._forceClipping ? this._paneClipRectID : null})
            },
            updateTeamplateFieldNames: function() {
                var that = this,
                    options = that._options;
                options.valueField = that.getValueFields()[0] + that.name;
                options.tagField = that.getTagField() + that.name
            },
            _applyElementsClipRect: function(settings) {
                settings.clipId = this._paneClipRectID
            },
            _applyMarkerClipRect: function(settings) {
                settings.clipId = this._forceClipping ? this._paneClipRectID : null
            },
            _createGroup: function(groupName, parent, target, settings) {
                var group = parent[groupName];
                if (!group)
                    parent[groupName] = group = this._renderer.createGroup(settings);
                else
                    group.applySettings(settings);
                group.append(target)
            },
            _applyClearingSettings: function(settings) {
                settings.opacity = null;
                settings.scale = null;
                if (this._options.rotated)
                    settings.translateX = null;
                else
                    settings.translateY = null
            },
            _createMarkerGroup: function() {
                var settings = this._getPointOptions().styles.normal;
                settings["class"] = "dxc-markers";
                settings.opacity = 1;
                this._applyMarkerClipRect(settings);
                this._createGroup("_markersGroup", this, this._group, settings)
            },
            _createLabelGroup: function() {
                var settings = {
                        "class": "dxc-labels",
                        visibility: this.getLabelVisibility() ? "visible" : "hidden"
                    };
                this._applyElementsClipRect(settings);
                this._applyClearingSettings(settings);
                this._createGroup("_labelsGroup", this, this._options.labelsGroup, settings)
            },
            _createGroups: function(animationEnabled) {
                this._createMarkerGroup();
                this._createLabelGroup();
                animationEnabled && this._labelsGroup && this._labelsGroup.applySettings({opacity: 0.001})
            },
            _getCreatingPointOptions: function() {
                if (!this._predefinedPointOptions) {
                    var defaultPointOptions = this._getPointOptions(),
                        r = defaultPointOptions.styles && defaultPointOptions.styles.normal && defaultPointOptions.styles.normal.r,
                        strokeWidth = defaultPointOptions.styles && defaultPointOptions.styles.normal && defaultPointOptions.styles.normal.strokeWidth,
                        creatingPointOptions = _extend(true, {}, defaultPointOptions);
                    creatingPointOptions.styles = creatingPointOptions.styles || {};
                    creatingPointOptions.styles.normal = {
                        r: r,
                        strokeWidth: strokeWidth
                    };
                    this._predefinedPointOptions = creatingPointOptions
                }
                return this._predefinedPointOptions
            },
            _getSpecialColor: function(mainSeriesColor) {
                return mainSeriesColor
            },
            _getPointOptions: function() {
                return this._pointOptions || (this._pointOptions = this._parsePointOptions(this._preparePointOptions(), this._options.label))
            },
            _preparePointOptions: function(customOptions) {
                return customOptions ? _extend(true, {}, this._options.point, customOptions) : this._options.point
            },
            _parsePointStyle: function(style, defaultColor, defaultBorderColor) {
                var border = style.border || {};
                return {
                        fill: style.color || defaultColor,
                        stroke: border.color || defaultBorderColor,
                        strokeWidth: border.visible ? border.width : 0,
                        r: style.size / 2 + (border.visible && style.size !== 0 ? ~~(border.width / 2) || 0 : 0)
                    }
            },
            _createPointStyles: function(pointOptions) {
                var mainPointColor = pointOptions.color || this._options.mainSeriesColor,
                    containerColor = this._options.containerBackgroundColor,
                    normalStyle = this._parsePointStyle(pointOptions, mainPointColor, mainPointColor);
                normalStyle.visibility = pointOptions.visible ? "visible" : "hidden";
                return {
                        normal: normalStyle,
                        hover: this._parsePointStyle(pointOptions.hoverStyle, containerColor, mainPointColor),
                        selection: this._parsePointStyle(pointOptions.selectionStyle, containerColor, mainPointColor)
                    }
            },
            _checkData: function(data) {
                return _isDefined(data.argument) && data.value !== undefined
            },
            _processRange: function(point, prevPoint) {
                rangeCalculator.processRange(this, point, prevPoint)
            },
            _getRangeData: function(zoomArgs, calcIntervalFunction) {
                rangeCalculator.calculateRangeData(this, zoomArgs, calcIntervalFunction);
                rangeCalculator.addLabelPaddings(this);
                return this._rangeData
            },
            _getPointData: function(data, options) {
                var argumentField = options.argumentField || "arg",
                    valueField = options.valueField || "val",
                    tagField = options.tagField || "tag";
                return {
                        value: data[valueField],
                        argument: data[argumentField],
                        tag: data[tagField]
                    }
            },
            _drawPoint: function(point, markersGroup, labelsGroup, animationEnabled, firstDrawing) {
                if (point.isInVisibleArea()) {
                    point.clearVisibility();
                    point.draw(this._renderer, markersGroup, labelsGroup, animationEnabled, firstDrawing);
                    this._drawedPoints.push(point)
                }
                else
                    point.setInvisibility()
            },
            _clearingAnimation: function(translators, drawComplete) {
                var that = this,
                    params = {opacity: 0.001},
                    options = {
                        duration: that._defaultDuration,
                        partitionDuration: 0.5
                    };
                that._labelsGroup && that._labelsGroup.animate(params, options, function() {
                    that._markersGroup && that._markersGroup.animate(params, options, drawComplete)
                })
            },
            _animate: function(complete) {
                var that = this,
                    lastPointIndex = that._drawedPoints.length - 1,
                    labelAnimFunc = function() {
                        that._labelsGroup && that._labelsGroup.animate({opacity: 1}, {duration: that._defaultDuration})
                    },
                    settings;
                _each(that._drawedPoints || [], function(i, p) {
                    settings = {translate: {
                            x: p.x,
                            y: p.y
                        }};
                    p.animate(i === lastPointIndex ? labelAnimFunc : undefined, settings)
                })
            },
            _getPointSize: function() {
                return this._options.point.visible ? this._options.point.size : DEFAULT_SYMBOL_POINT_SIZE
            },
            _calcMedianValue: function(fusionPoints, valueField) {
                var result,
                    allValue;
                allValue = _map(fusionPoints, function(point) {
                    return point[valueField]
                });
                allValue.sort(function(a, b) {
                    return a - b
                });
                result = allValue[_floor(allValue.length / 2)];
                return _isDefined(result) ? result : null
            },
            _fusionPoints: function(fusionPoints, tick, index) {
                var result = this._calcMedianValue(fusionPoints, "value");
                return {
                        value: result,
                        argument: tick,
                        tag: null,
                        index: index,
                        seriesName: this.name
                    }
            },
            _endUpdateData: function() {
                delete this._predefinedPointOptions
            },
            getArgumentField: function() {
                return this._options.argumentField || "arg"
            },
            getValueFields: function() {
                return [this._options.valueField || "val"]
            },
            _beginUpdateData: $.noop
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file lineSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            series = viz.core.series.mixins.chart,
            utils = DX.utils,
            scatterSeries = series.scatter,
            _extend = $.extend,
            _map = $.map,
            _each = $.each;
        series.line = _extend({}, scatterSeries, {
            _createElementsGroup: function(elementsStyle) {
                var settings = _extend({"class": "dxc-elements"}, elementsStyle);
                this._applyElementsClipRect(settings);
                this._createGroup("_elementsGroup", this, this._group, settings)
            },
            _createBordersGroup: function(borderStyle) {
                var settings = _extend({"class": "dxc-borders"}, borderStyle);
                this._applyElementsClipRect(settings);
                this._createGroup("_bordersGroup", this, this._group, settings)
            },
            _applyTrackersClippings: function() {
                scatterSeries._applyTrackersClippings.call(this);
                this._trackersGroup.applySettings({clipId: this._paneClipRectID})
            },
            _createGroups: function(animationEnabled, style) {
                var style = style || this._styles.normal;
                this._createElementsGroup(style.elements);
                this._areBordersVisible() && this._createBordersGroup(style.border);
                scatterSeries._createGroups.call(this, animationEnabled, {});
                animationEnabled && this._markersGroup && this._markersGroup.applySettings({opacity: 0.001})
            },
            _areBordersVisible: function() {
                return false
            },
            _getDefaultSegment: function(segment) {
                return {line: _map(segment.line || [], function(pt) {
                            return pt.getDefaultCoords()
                        })}
            },
            _prepareSegment: function(points) {
                return {line: points}
            },
            _parseLineOptions: function(options, defaultColor) {
                return {
                        stroke: options.color || defaultColor,
                        strokeWidth: options.width,
                        dashStyle: options.dashStyle || 'solid'
                    }
            },
            _parseStyle: function(options, defaultColor) {
                return {elements: this._parseLineOptions(options, defaultColor)}
            },
            _applyStyle: function(style) {
                this._elementsGroup && this._elementsGroup.applySettings(style.elements);
                _each(this._graphics || [], function(_, graphic) {
                    graphic.line && graphic.line.applySettings({strokeWidth: style.elements.strokeWidth})
                })
            },
            _drawElement: function(segment, group) {
                return {line: this._createMainElement(segment.line, {strokeWidth: this._styles.normal.elements.strokeWidth}).append(group)}
            },
            _removeElement: function(element) {
                element.line.remove()
            },
            _generateDefaultSegments: function() {
                var that = this,
                    segments = [];
                _each(that._segments || [], function(_, segment) {
                    segments.push(that._getDefaultSegment(segment))
                });
                return segments
            },
            _updateElement: function(element, segment, animate, animateParams, complete) {
                var params = {points: segment.line};
                animate ? element.line.animate(params, animateParams, complete) : element.line.applySettings(params)
            },
            _clearingAnimation: function(translator, drawComplete) {
                var that = this,
                    lastIndex = that._graphics.length - 1,
                    settings = {opacity: 0.001},
                    options = {
                        duration: that._defaultDuration,
                        partitionDuration: 0.5
                    };
                that._labelsGroup && that._labelsGroup.animate(settings, options, function() {
                    that._markersGroup && that._markersGroup.animate(settings, options, function() {
                        _each(that._defaultSegments || [], function(i, segment) {
                            that._oldUpdateElement(that._graphics[i], segment, true, {partitionDuration: 0.5}, i === lastIndex ? drawComplete : undefined)
                        })
                    })
                })
            },
            _animate: function() {
                var that = this,
                    lastIndex = that._graphics.length - 1;
                _each(that._graphics || [], function(i, elem) {
                    that._updateElement(elem, that._segments[i], true, {complete: i === lastIndex ? function() {
                            that._labelsGroup && that._labelsGroup.animate({opacity: 1}, {duration: that._defaultDuration});
                            that._markersGroup && that._markersGroup.animate({opacity: 1}, {duration: that._defaultDuration})
                        } : undefined})
                })
            },
            _drawPoint: function(point, group, labelsGroup) {
                scatterSeries._drawPoint.call(this, point, group, labelsGroup)
            },
            _createMainElement: function(points, settings) {
                return this._renderer.createPath(points, settings)
            },
            _drawSegment: function(points, animationEnabled, segmentCount) {
                var segment = this._prepareSegment(points, this._options.rotated);
                this._segments.push(segment);
                if (!this._graphics[segmentCount])
                    this._graphics[segmentCount] = this._drawElement(animationEnabled ? this._getDefaultSegment(segment) : segment, this._elementsGroup);
                else if (!animationEnabled)
                    this._updateElement(this._graphics[segmentCount], segment)
            },
            _getTrackerSettings: function() {
                return {
                        strokeWidth: this._styles.normal.elements.strokeWidth > this._defaultTrackerWidth ? this._styles.normal.elements.strokeWidth : this._defaultTrackerWidth,
                        fill: "none"
                    }
            },
            _getMainPointsFromSegment: function(segment) {
                return segment.line
            },
            _drawTrackerElement: function(segment) {
                return this._createMainElement(this._getMainPointsFromSegment(segment), this._getTrackerSettings(segment))
            },
            _updateTrackerElement: function(segment, element) {
                var settings = this._getTrackerSettings(segment);
                settings.points = this._getMainPointsFromSegment(segment);
                element.applySettings(settings)
            }
        });
        series.stepline = _extend({}, series.line, {
            _calculateStepLinePoints: function(points) {
                var segment = [];
                _each(points, function(i, pt) {
                    var stepY;
                    if (!i) {
                        segment.push(pt);
                        return
                    }
                    stepY = segment[segment.length - 1].y;
                    if (stepY !== pt.y) {
                        var point = utils.clone(pt);
                        point.y = stepY;
                        segment.push(point)
                    }
                    segment.push(pt)
                });
                return segment
            },
            _prepareSegment: function(points) {
                return series.line._prepareSegment(this._calculateStepLinePoints(points))
            }
        });
        series.stackedline = _extend({}, series.line, {});
        series.fullstackedline = _extend({}, series.line, {_getRangeData: function(zoomArgs, calcIntervalFunction) {
                var rangeCalculator = viz.core.series.helpers.rangeDataCalculator();
                rangeCalculator.calculateRangeData(this, zoomArgs, calcIntervalFunction);
                rangeCalculator.addLabelPaddings(this);
                rangeCalculator.processFullStackedRange(this);
                return this._rangeData
            }});
        series.spline = _extend({}, series.line, {
            _calculateBezierPoints: function(src, rotated) {
                var bezierPoints = [],
                    pointsCopy = src;
                var checkExtr = function(otherPointCoord, pointCoord, controlCoord) {
                        return otherPointCoord > pointCoord && controlCoord > otherPointCoord || otherPointCoord < pointCoord && controlCoord < otherPointCoord ? otherPointCoord : controlCoord
                    };
                var clonePoint = function(point, newX, newY) {
                        var p = utils.clone(point);
                        p.x = newX;
                        p.y = newY;
                        return p
                    };
                if (pointsCopy.length !== 1)
                    _each(pointsCopy, function(i, curPoint) {
                        var leftControlX,
                            leftControlY,
                            rightControlX,
                            rightControlY,
                            prevPoint,
                            nextPoint,
                            xCur,
                            yCur,
                            x1,
                            x2,
                            y1,
                            y2,
                            delta,
                            lambda = 0.5,
                            curIsExtremum,
                            leftPoint,
                            rightPoint,
                            a,
                            b,
                            c,
                            xc,
                            yc,
                            shift;
                        if (!i) {
                            bezierPoints.push(curPoint);
                            bezierPoints.push(curPoint);
                            return
                        }
                        prevPoint = pointsCopy[i - 1];
                        if (i < pointsCopy.length - 1) {
                            nextPoint = pointsCopy[i + 1];
                            xCur = curPoint.x;
                            yCur = curPoint.y;
                            x1 = prevPoint.x;
                            x2 = nextPoint.x;
                            y1 = prevPoint.y;
                            y2 = nextPoint.y;
                            curIsExtremum = !!(!rotated && (yCur <= prevPoint.y && yCur <= nextPoint.y || yCur >= prevPoint.y && yCur >= nextPoint.y) || rotated && (xCur <= prevPoint.x && xCur <= nextPoint.x || xCur >= prevPoint.x && xCur >= nextPoint.x));
                            if (curIsExtremum)
                                if (!rotated) {
                                    rightControlY = leftControlY = yCur;
                                    rightControlX = (xCur + nextPoint.x) / 2;
                                    leftControlX = (xCur + prevPoint.x) / 2
                                }
                                else {
                                    rightControlX = leftControlX = xCur;
                                    rightControlY = (yCur + nextPoint.y) / 2;
                                    leftControlY = (yCur + prevPoint.y) / 2
                                }
                            else {
                                a = y2 - y1;
                                b = x1 - x2;
                                c = y1 * x2 - x1 * y2;
                                if (!rotated) {
                                    xc = xCur;
                                    yc = -1 * (a * xc + c) / b;
                                    shift = yc - yCur || 0;
                                    y1 -= shift;
                                    y2 -= shift
                                }
                                else {
                                    yc = yCur;
                                    xc = -1 * (b * yc + c) / a;
                                    shift = xc - xCur || 0;
                                    x1 -= shift;
                                    x2 -= shift
                                }
                                rightControlX = (xCur + lambda * x2) / (1 + lambda);
                                rightControlY = (yCur + lambda * y2) / (1 + lambda);
                                leftControlX = (xCur + lambda * x1) / (1 + lambda);
                                leftControlY = (yCur + lambda * y1) / (1 + lambda)
                            }
                            if (!rotated) {
                                leftControlY = checkExtr(prevPoint.y, yCur, leftControlY);
                                rightControlY = checkExtr(nextPoint.y, yCur, rightControlY)
                            }
                            else {
                                leftControlX = checkExtr(prevPoint.x, xCur, leftControlX);
                                rightControlX = checkExtr(nextPoint.x, xCur, rightControlX)
                            }
                            leftPoint = clonePoint(curPoint, leftControlX, leftControlY);
                            rightPoint = clonePoint(curPoint, rightControlX, rightControlY);
                            bezierPoints.push(leftPoint, curPoint, rightPoint)
                        }
                        else {
                            bezierPoints.push(curPoint, curPoint);
                            return
                        }
                    });
                else
                    bezierPoints.push(pointsCopy[0]);
                return bezierPoints
            },
            _prepareSegment: function(points, rotated) {
                return series.line._prepareSegment(this._calculateBezierPoints(points, rotated))
            },
            _createMainElement: function(points, settings) {
                return this._renderer.createBezierPath(points, settings)
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file areaSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            utils = DX.utils,
            series = viz.core.series.mixins.chart,
            lineSeries = series.line,
            _map = $.map,
            _extend = $.extend,
            HOVER_COLOR_HIGHLIGHTING = 20;
        series.area = _extend({}, lineSeries, {
            _createBorderElement: lineSeries._createMainElement,
            _processSinglePointsAreaSegment: function(points, rotated) {
                if (points.length == 1) {
                    var p = points[0],
                        p1 = utils.clone(p),
                        coord = rotated ? "y" : "x";
                    p1[coord] += 1;
                    return [p, p1]
                }
                return points
            },
            _prepareSegment: function(points, rotated) {
                var processedPoints = this._processSinglePointsAreaSegment(points, rotated);
                return {
                        line: processedPoints,
                        area: _map(processedPoints, function(pt) {
                            return pt.getCoords()
                        }).concat(_map(processedPoints.slice().reverse(), function(pt) {
                            return pt.getCoords(true)
                        })),
                        singlePointSegment: processedPoints !== points
                    }
            },
            _getSpecialColor: function(color) {
                return this._options._IE8 ? new DX.Color(color).highlight(HOVER_COLOR_HIGHLIGHTING) : color
            },
            _getRangeData: function(zoomArgs, calcIntervalFunction) {
                var rangeCalculator = viz.core.series.helpers.rangeDataCalculator();
                rangeCalculator.calculateRangeData(this, zoomArgs, calcIntervalFunction);
                rangeCalculator.addLabelPaddings(this);
                rangeCalculator.calculateRangeMinValue(this, zoomArgs);
                return this._rangeData
            },
            _getDefaultSegment: function(segment) {
                var defaultSegment = lineSeries._getDefaultSegment(segment);
                defaultSegment.area = defaultSegment.line.concat(defaultSegment.line.slice().reverse());
                return defaultSegment
            },
            _updateElement: function(element, segment, animate, animateParams, complete) {
                var lineParams = {points: segment.line},
                    areaParams = {points: segment.area},
                    borderElement = element.line;
                if (animate) {
                    borderElement && borderElement.animate(lineParams, animateParams);
                    element.area.animate(areaParams, animateParams, complete)
                }
                else {
                    borderElement && borderElement.applySettings(lineParams);
                    element.area.applySettings(areaParams)
                }
            },
            _removeElement: function(element) {
                element.line && element.line.remove();
                element.area.remove()
            },
            _drawElement: function(segment, group) {
                return {
                        line: this._bordersGroup && this._createBorderElement(segment.line, {strokeWidth: this._styles.normal.border.strokeWidth}).append(this._bordersGroup),
                        area: this._createMainElement(segment.area).append(this._elementsGroup)
                    }
            },
            _applyStyle: function(style) {
                this._elementsGroup && this._elementsGroup.applySettings(style.elements);
                this._bordersGroup && this._bordersGroup.applySettings(style.border);
                $.each(this._graphics || [], function(_, graphic) {
                    graphic.line && graphic.line.applySettings({strokeWidth: style.border.strokeWidth})
                })
            },
            _createPattern: function(color, hatching) {
                if (hatching) {
                    var pattern = this._renderer.createPattern(color, hatching);
                    this._patterns.push(pattern);
                    return pattern.id
                }
                return color
            },
            _parseStyle: function(options, defaultColor, defaultBorderColor) {
                var borderOptions = options.border || {},
                    borderStyle = lineSeries._parseLineOptions(borderOptions, defaultBorderColor);
                borderStyle.strokeWidth = borderOptions.visible ? borderStyle.strokeWidth : 0;
                return {
                        border: borderStyle,
                        elements: {
                            stroke: "none",
                            fill: this._createPattern(options.color || defaultColor, options.hatching),
                            opacity: options.opacity
                        }
                    }
            },
            _areBordersVisible: function() {
                var options = this._options;
                return options.border.visible || options.hoverStyle.border.visible || options.selectionStyle.border.visible
            },
            _createMainElement: function(points, settings) {
                return this._renderer.createArea(points, settings)
            },
            _getTrackerSettings: function(segment) {
                return {strokeWidth: segment.singlePointSegment ? this._defaultTrackerWidth : 0}
            },
            _getMainPointsFromSegment: function(segment) {
                return segment.area
            }
        });
        series.steparea = _extend({}, series.area, {_prepareSegment: function(points, rotated) {
                points = series.area._processSinglePointsAreaSegment(points, rotated);
                return series.area._prepareSegment.call(this, series.stepline._calculateStepLinePoints(points))
            }});
        series.splinearea = _extend({}, series.area, {
            _areaPointsToSplineAreaPoints: function(areaPoints) {
                var lastFwPoint = areaPoints[areaPoints.length / 2 - 1],
                    firstBwPoint = areaPoints[areaPoints.length / 2];
                areaPoints.splice(areaPoints.length / 2, 0, {
                    x: lastFwPoint.x,
                    y: lastFwPoint.y
                }, {
                    x: firstBwPoint.x,
                    y: firstBwPoint.y
                });
                if (lastFwPoint.defaultCoords)
                    areaPoints[areaPoints.length / 2].defaultCoords = true;
                if (firstBwPoint.defaultCoords)
                    areaPoints[areaPoints.length / 2 - 1].defaultCoords = true
            },
            _prepareSegment: function(points, rotated) {
                var areaSeries = series.area,
                    processedPoints = areaSeries._processSinglePointsAreaSegment(points, rotated),
                    areaSegment = areaSeries._prepareSegment.call(this, series.spline._calculateBezierPoints(processedPoints, rotated));
                this._areaPointsToSplineAreaPoints(areaSegment.area);
                areaSegment.singlePointSegment = processedPoints !== points;
                return areaSegment
            },
            _getDefaultSegment: function(segment) {
                var areaDefaultSegment = series.area._getDefaultSegment(segment);
                this._areaPointsToSplineAreaPoints(areaDefaultSegment.area);
                return areaDefaultSegment
            },
            _createMainElement: function(points, settings) {
                return this._renderer.createBezierArea(points, settings)
            },
            _createBorderElement: series.spline._createMainElement
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file barSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            series = viz.core.series.mixins.chart,
            scatterSeries = series.scatter,
            areaSeries = series.area,
            _extend = $.extend,
            _each = $.each,
            DEFAULT_BAR_POINT_SIZE = 3;
        series.bar = _extend({}, scatterSeries, {
            _getSpecialColor: areaSeries._getSpecialColor,
            _createPattern: areaSeries._createPattern,
            _updateOptions: function(options) {
                this._stackName = "axis_" + (options.axis || "default") + "_stack_" + (options.stack || "default")
            },
            _getRangeData: function(zoomArgs, calcIntervalFunction) {
                var rangeData = areaSeries._getRangeData.apply(this, arguments);
                rangeData.arg.stick = false;
                return rangeData
            },
            _parsePointStyle: function(style, defaultColor, defaultBorderColor) {
                var color = this._createPattern(style.color || defaultColor, style.hatching),
                    base = scatterSeries._parsePointStyle.call(this, style, color, defaultBorderColor);
                base.fill = color;
                delete base.r;
                return base
            },
            _applyMarkerClipRect: function(settings) {
                settings.clipId = null
            },
            _applyTrackersClippings: function() {
                this._markerTrackerGroup.applySettings({clipId: this._paneClipRectID})
            },
            _clearingAnimation: function(translators, drawComplete) {
                var that = this,
                    settings;
                if (that._options.rotated)
                    settings = {
                        scale: {
                            x: 0.001,
                            y: 1
                        },
                        translate: {x: translators.x.translate("canvas_position_default")}
                    };
                else
                    settings = {
                        scale: {
                            x: 1,
                            y: 0.001
                        },
                        translate: {y: translators.y.translate("canvas_position_default")}
                    };
                that._labelsGroup && that._labelsGroup.animate({opacity: 0.001}, {
                    duration: that._defaultDuration,
                    partitionDuration: 0.5
                }, function() {
                    that._markersGroup.animate(settings, {partitionDuration: 0.5}, function() {
                        that._markersGroup.applySettings({
                            scale: null,
                            translateX: 0,
                            translateY: 0
                        });
                        drawComplete()
                    })
                })
            },
            _createGroups: function(animationEnabled, style, firstDrawing) {
                var settings = {};
                scatterSeries._createGroups.apply(this, arguments);
                if (animationEnabled && firstDrawing)
                    if (!this._options.rotated)
                        settings = {
                            scale: {
                                x: 1,
                                y: 0.001
                            },
                            translateY: this.translators.y.translate("canvas_position_default")
                        };
                    else
                        settings = {
                            scale: {
                                x: 0.001,
                                y: 1
                            },
                            translateX: this.translators.x.translate("canvas_position_default")
                        };
                else if (!animationEnabled)
                    settings = {
                        scale: {
                            x: 1,
                            y: 1
                        },
                        translateX: 0,
                        translateY: 0
                    };
                this._markersGroup.applySettings(settings)
            },
            _drawPoint: function(point, markersGroup, labelsGroup, animationEnabled, firstDrawing) {
                scatterSeries._drawPoint.call(this, point, markersGroup, labelsGroup, animationEnabled && !firstDrawing)
            },
            _getMainColor: function() {
                return this._options.mainSeriesColor
            },
            _createPointStyles: function(pointOptions) {
                var mainColor = pointOptions.color || this._getMainColor(),
                    specialMainColor = this._getSpecialColor(mainColor);
                return {
                        normal: this._parsePointStyle(pointOptions, mainColor, mainColor),
                        hover: this._parsePointStyle(pointOptions.hoverStyle || {}, specialMainColor, mainColor),
                        selection: this._parsePointStyle(pointOptions.selectionStyle || {}, specialMainColor, mainColor)
                    }
            },
            _preparePointOptions: function(customOptions) {
                return customOptions ? _extend(true, {}, this._options, customOptions) : this._options
            },
            _animate: function(firstDrawing) {
                var that = this,
                    labelAnimFunc = function() {
                        that._labelsGroup && that._labelsGroup.animate({opacity: 1}, {duration: that._defaultDuration})
                    },
                    lastPointIndex;
                that._markersGroup.animate({
                    scale: {
                        x: 1,
                        y: 1
                    },
                    translate: {
                        y: 0,
                        x: 0
                    }
                }, undefined, labelAnimFunc);
                if (!firstDrawing) {
                    lastPointIndex = that._drawedPoints.length - 1;
                    _each(this._drawedPoints || [], function(i, point) {
                        point.animate(i === lastPointIndex ? labelAnimFunc : undefined, {
                            x: point.x,
                            y: point.y,
                            height: point.height,
                            width: point.width
                        })
                    })
                }
            },
            _getPointSize: function() {
                return DEFAULT_BAR_POINT_SIZE
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file rangeSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            series = viz.core.series.mixins.chart,
            _extend = $.extend,
            _isDefined = DX.utils.isDefined,
            _map = $.map,
            rangeCalculator = viz.core.series.helpers.rangeDataCalculator(),
            areaSeries = series.area;
        var baseRangeSeries = {
                _checkData: function(data) {
                    return _isDefined(data.argument) && data.value !== undefined && data.minValue !== undefined
                },
                updateTeamplateFieldNames: function() {
                    var that = this,
                        options = that._options,
                        valueFields = that.getValueFields(),
                        name = that.name;
                    options.rangeValue1Field = valueFields[0] + name;
                    options.rangeValue2Field = valueFields[1] + name;
                    options.tagField = that.getTagField() + name
                },
                _processRange: function(point, prevPoint) {
                    rangeCalculator.processTwoValues(this, point, prevPoint, "value", "minValue")
                },
                _getRangeData: function(zoomArgs, calcIntervalFunction) {
                    rangeCalculator.calculateTwoValuesRangeData(this, zoomArgs, calcIntervalFunction, "value", "minValue");
                    rangeCalculator.addRangeSeriesLabelPaddings(this);
                    return this._rangeData
                },
                _getPointData: function(data, options) {
                    var argumentField = options.argumentField || "arg",
                        tagField = options.tagField || "tag",
                        rangeValue1Field = options.rangeValue1Field || "val1",
                        rangeValue2Field = options.rangeValue2Field || "val2";
                    return {
                            tag: data[tagField],
                            minValue: data[rangeValue1Field],
                            value: data[rangeValue2Field],
                            argument: data[argumentField]
                        }
                },
                _fusionPoints: function(fusionPoints, tick, index) {
                    var scatterSeries = series.scatter,
                        value = scatterSeries._calcMedianValue.call(this, fusionPoints, "value"),
                        minValue = scatterSeries._calcMedianValue.call(this, fusionPoints, "minValue"),
                        pointData;
                    if (value === null || minValue === null)
                        value = minValue = null;
                    pointData = {
                        minValue: minValue,
                        value: value,
                        argument: tick,
                        tag: null
                    };
                    return pointData
                },
                getValueFields: function() {
                    return [this._options.rangeValue1Field || "val1", this._options.rangeValue2Field || "val2"]
                }
            };
        series.rangebar = _extend({}, series.bar, baseRangeSeries);
        series.rangearea = _extend({}, areaSeries, {
            _drawPoint: function(point, markersGroup, labelsGroup, animationEnabled) {
                if (point.isInVisibleArea()) {
                    point.clearVisibility();
                    point.draw(this._renderer, markersGroup, labelsGroup, animationEnabled);
                    this._drawedPoints.push(point);
                    if (!point.visibleTopMarker)
                        point.hideMarker("top");
                    if (!point.visibleBottomMarker)
                        point.hideMarker("bottom")
                }
                else
                    point.setInvisibility()
            },
            _prepareSegment: function(points, rotated) {
                var processedPoints = this._processSinglePointsAreaSegment(points, rotated),
                    processedMinPointsCoords = $.map(processedPoints, function(pt) {
                        return pt.getCoords(true)
                    });
                return {
                        line: processedPoints,
                        bottomLine: processedMinPointsCoords,
                        area: $.map(processedPoints, function(pt) {
                            return pt.getCoords()
                        }).concat(processedMinPointsCoords.slice().reverse()),
                        singlePointSegment: processedPoints !== points
                    }
            },
            _getDefaultSegment: function(segment) {
                var defaultSegment = areaSeries._getDefaultSegment.call(this, segment);
                defaultSegment.bottomLine = defaultSegment.line;
                return defaultSegment
            },
            _removeElement: function(element) {
                areaSeries._removeElement.call(this, element);
                element.bottomLine && element.bottomLine.remove()
            },
            _drawElement: function(segment, group) {
                var drawnElement = areaSeries._drawElement.call(this, segment, group);
                drawnElement.bottomLine = this._bordersGroup && this._createBorderElement(segment.bottomLine, {strokeWidth: this._styles.normal.border.strokeWidth}).append(this._bordersGroup);
                return drawnElement
            },
            _applyStyle: function(style) {
                this._elementsGroup && this._elementsGroup.applySettings(style.elements);
                this._bordersGroup && this._bordersGroup.applySettings(style.border);
                $.each(this._graphics || [], function(_, graphic) {
                    graphic.line && graphic.line.applySettings({strokeWidth: style.border.strokeWidth});
                    graphic.bottomLine && graphic.bottomLine.applySettings({strokeWidth: style.border.strokeWidth})
                })
            },
            _updateElement: function(element, segment, animate, animateParams, complete) {
                areaSeries._updateElement.call(this, element, segment, animate, animateParams, complete);
                var bottomLineParams = {points: segment.bottomLine},
                    bottomBorderElement = element.bottomLine;
                if (bottomBorderElement)
                    animate ? bottomBorderElement.animate(bottomLineParams, animateParams) : bottomBorderElement.applySettings(bottomLineParams)
            }
        }, baseRangeSeries)
    })(jQuery, DevExpress);
    /*! Module viz-core, file bubbleSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            series = viz.core.series.mixins.chart,
            scatterSeries = series.scatter,
            barSeries = series.bar,
            _isDefined = DX.utils.isDefined,
            _extend = $.extend,
            _each = $.each;
        series.bubble = _extend({}, scatterSeries, {
            _applyTrackersClippings: barSeries._applyTrackersClippings,
            _getMainColor: barSeries._getMainColor,
            _createPointStyles: barSeries._createPointStyles,
            _createPattern: barSeries._createPattern,
            _preparePointOptions: barSeries._preparePointOptions,
            _getSpecialColor: barSeries._getSpecialColor,
            _applyMarkerClipRect: series.line._applyElementsClipRect,
            _parsePointStyle: function(style, defaultColor, defaultBorderColor) {
                var color = this._createPattern(style.color || defaultColor, style.hatching),
                    base = scatterSeries._parsePointStyle.call(this, style, color, defaultBorderColor);
                base.fill = color;
                base.opacity = style.opacity;
                delete base.r;
                return base
            },
            _createMarkerGroup: function() {
                var markersSettings = this._getPointOptions().styles.normal,
                    groupSettings;
                markersSettings["class"] = "dxc-markers";
                this._applyMarkerClipRect(markersSettings);
                groupSettings = _extend({}, markersSettings);
                delete groupSettings.opacity;
                this._createGroup("_markersGroup", this, this._group, groupSettings)
            },
            _getCreatingPointOptions: function() {
                if (!this._predefinedPointOptions) {
                    var styles,
                        defaultPointOptions = this._getPointOptions(),
                        strokeWidth = defaultPointOptions.styles && defaultPointOptions.styles.normal && defaultPointOptions.styles.normal.strokeWidth,
                        r = defaultPointOptions.styles && defaultPointOptions.styles.normal && defaultPointOptions.styles.normal.r,
                        opacity = defaultPointOptions.styles && defaultPointOptions.styles.normal && defaultPointOptions.styles.normal.opacity,
                        creatingPointOptions = _extend(true, {}, defaultPointOptions);
                    creatingPointOptions.styles = styles = creatingPointOptions.styles || {};
                    styles.normal = {
                        strokeWidth: strokeWidth,
                        r: r,
                        opacity: opacity
                    };
                    this._predefinedPointOptions = creatingPointOptions
                }
                return this._predefinedPointOptions
            },
            _checkData: function(data) {
                return _isDefined(data.argument) && _isDefined(data.size) && data.value !== undefined
            },
            _getPointData: function(data, options) {
                var pointData = scatterSeries._getPointData.call(this, data, options),
                    sizeField = options.sizeField || "size";
                pointData.size = data[sizeField];
                return pointData
            },
            _fusionPoints: function(fusionPoints, tick, index) {
                var medianValue = scatterSeries._calcMedianValue.call(this, fusionPoints, "value"),
                    medianSize = scatterSeries._calcMedianValue.call(this, fusionPoints, "size");
                return {
                        size: medianSize,
                        value: medianValue,
                        argument: tick,
                        tag: null
                    }
            },
            getValueFields: function() {
                return [this._options.valueField || "val", this._options.sizeField || "size"]
            },
            updateTeamplateFieldNames: function() {
                var that = this,
                    options = that._options,
                    valueFields = that.getValueFields(),
                    name = that.name;
                options.valueField = valueFields[0] + name;
                options.sizeField = valueFields[1] + name;
                options.tagField = that.getTagField() + name
            },
            _clearingAnimation: function(translators, drawComplete) {
                var that = this,
                    settings = {r: 0},
                    partitionDuration = 0.5,
                    lastPointIndex = that._drawedPoints.length - 1;
                that._labelsGroup && that._labelsGroup.animate({opacity: 0.001}, {
                    duration: that._defaultDuration,
                    partitionDuration: partitionDuration
                }, function() {
                    _each(that._drawedPoints || [], function(i, p) {
                        p.animate(i === lastPointIndex ? drawComplete : undefined, settings, partitionDuration)
                    })
                })
            },
            _animate: function(firstDrawing) {
                var that = this,
                    lastPointIndex = that._drawedPoints.length - 1,
                    labelAnimFunc = function() {
                        that._labelsGroup && that._labelsGroup.animate({opacity: 1}, {duration: that._defaultDuration})
                    };
                _each(that._drawedPoints || [], function(i, p) {
                    p.animate(i === lastPointIndex ? labelAnimFunc : undefined, {
                        r: p.bubbleSize,
                        translate: {
                            x: p.x,
                            y: p.y
                        }
                    })
                })
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file pieSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            mixins = viz.core.series.mixins,
            pieSeries = mixins.pieChart,
            utils = DX.utils,
            scatterSeries = mixins.chart.scatter,
            barSeries = mixins.chart.bar,
            _extend = $.extend,
            _each = $.each,
            _noop = $.noop,
            _map = $.map,
            _isFinite = isFinite,
            _max = Math.max;
        pieSeries.pie = _extend({}, barSeries, {
            _createLabelGroup: scatterSeries._createLabelGroup,
            _createGroups: scatterSeries._createGroups,
            _drawPoint: function(point) {
                scatterSeries._drawPoint.apply(this, arguments);
                !point.isVisible() && point.setInvisibility()
            },
            _applyTrackersClippings: _noop,
            _processRange: _noop,
            _applyElementsClipRect: _noop,
            _updateDataType: _noop,
            getColor: _noop,
            _prepareSeriesToDrawing: _noop,
            _endUpdateData: scatterSeries._prepareSeriesToDrawing,
            resetLabelEllipsis: function() {
                _each(this._points || [], function(_, point) {
                    point._label.setLabelEllipsis = false
                })
            },
            _adjustLabels: function(firstDrawing) {
                var that = this,
                    options = that._options,
                    canvas = that.canvas,
                    points = that._points || [],
                    labelsBBoxes = [],
                    labelsSpaces = [],
                    labelSpace = 0,
                    maxLabelLength,
                    paneSpaceHeight,
                    paneSpaceWidth,
                    min;
                if (options.label.position !== "inside") {
                    _each(points, function(_, point) {
                        if (point._label.hasText())
                            labelsBBoxes.push(point._label.getTextCoords().width)
                    });
                    if (labelsBBoxes.length) {
                        maxLabelLength = _max.apply(null, labelsBBoxes);
                        _each(points, function(_, point) {
                            if (point._label.hasText()) {
                                point._label.updatePosition(maxLabelLength);
                                point._label.setLabelEllipsis = true
                            }
                        });
                        that._firstDrawing = !that.redraw && firstDrawing;
                        that.redraw = true
                    }
                }
                else
                    _each(points, function(i, point) {
                        if (point._label.hasText()) {
                            point._label.setLabelEllipsis = true;
                            point._label.updatePosition()
                        }
                    })
            },
            _getCreatingPointOptions: function() {
                return this._getPointOptions()
            },
            _updateOptions: function(options) {
                this.labelSpace = 0;
                this.innerRadius = this.type === "pie" ? 0 : options.innerRadius;
                this.redraw = false
            },
            _checkData: function(data) {
                var base = barSeries._checkData(data);
                return this._options.paintNullPoints ? base : base && data.value !== null
            },
            _createMarkerGroup: function() {
                if (!this._markersGroup)
                    this._markersGroup = this._renderer.createGroup({"class": "dxc-markers"}).append(this._group)
            },
            _getMainColor: function() {
                return this._options.mainSeriesColor()
            },
            _getPointOptions: function() {
                return this._parsePointOptions(this._preparePointOptions(), this._options.label)
            },
            _getRangeData: function() {
                return this._rangeData
            },
            _getArrangeTotal: function(points) {
                var total = 0;
                _each(points, function(_, point) {
                    if (point.isVisible())
                        total += point.initialValue
                });
                return total
            },
            _createPointStyles: function(pointOptions) {
                var mainColor = pointOptions.color || this._getMainColor(),
                    specialMainColor = this._getSpecialColor(mainColor);
                return {
                        normal: this._parsePointStyle(pointOptions, mainColor, mainColor),
                        hover: this._parsePointStyle(pointOptions.hoverStyle, specialMainColor, mainColor),
                        selection: this._parsePointStyle(pointOptions.selectionStyle, specialMainColor, mainColor),
                        legendStyles: {
                            normal: this._createLegendState(pointOptions, mainColor),
                            hover: this._createLegendState(pointOptions.hoverStyle, specialMainColor),
                            selection: this._createLegendState(pointOptions.selectionStyle, specialMainColor)
                        }
                    }
            },
            _getArrangeMinShownValue: function(points, total) {
                var minSegmentSize = this._options.minSegmentSize,
                    totalMinSegmentSize = 0,
                    totalNotMinValues = 0;
                total = total || points.length;
                _each(points, function(_, point) {
                    if (point.isVisible())
                        if (point.initialValue < minSegmentSize * total / 360)
                            totalMinSegmentSize += minSegmentSize;
                        else
                            totalNotMinValues += point.initialValue
                });
                return totalMinSegmentSize < 360 ? minSegmentSize * totalNotMinValues / (360 - totalMinSegmentSize) : 0
            },
            _applyArrangeCorrection: function(points, minShownValue, total) {
                var options = this._options,
                    isClockWise = options.segmentsDirection !== "anticlockwise",
                    shiftedAngle = _isFinite(options.startAngle) ? utils.normalizeAngle(options.startAngle) : 0,
                    minSegmentSize = options.minSegmentSize,
                    percent,
                    correction = 0,
                    zeroTotalCorrection = 0;
                if (total === 0) {
                    total = points.length;
                    zeroTotalCorrection = 1
                }
                _each(isClockWise ? points : points.concat([]).reverse(), function(_, point) {
                    var val = point.isVisible() ? zeroTotalCorrection || point.initialValue : 0,
                        updatedZeroValue;
                    if (minSegmentSize && point.isVisible() && val < minShownValue)
                        updatedZeroValue = minShownValue;
                    percent = val / total;
                    point.correctValue(correction, percent, zeroTotalCorrection + (updatedZeroValue || 0));
                    point.shiftedAngle = shiftedAngle;
                    correction = correction + (updatedZeroValue || val)
                });
                this._rangeData = {val: {
                        min: 0,
                        max: correction
                    }}
            },
            arrangePoints: function() {
                var that = this,
                    minSegmentSize = that._options.minSegmentSize,
                    minShownValue,
                    pointIndex = 0,
                    total,
                    points = that._originalPoints = that._points = _map(that._originalPoints || [], function(point) {
                        if (point.value === null || point.value < 0 || point.value === 0 && !minSegmentSize) {
                            point.dispose();
                            return null
                        }
                        else {
                            point.index = pointIndex++;
                            return point
                        }
                    });
                total = that._getArrangeTotal(points);
                if (minSegmentSize)
                    minShownValue = this._getArrangeMinShownValue(points, total);
                that._applyArrangeCorrection(points, minShownValue, total)
            },
            correctPosition: function(correction) {
                var debug = DX.utils.debug;
                debug.assert(correction, "correction was not passed");
                debug.assertParam(correction.centerX, "correction.centerX was not passed");
                debug.assertParam(correction.centerY, "correction.centerY was not passed");
                debug.assertParam(correction.radiusInner, "correction.radiusInner was not passed");
                debug.assertParam(correction.radiusOuter, "correction.radiusOuter was not passed");
                _each(this._points, function(_, point) {
                    point.correctPosition(correction)
                })
            },
            _animate: function(firstDrawing) {
                var that = this,
                    index = 0,
                    timeThreshold = 0.2,
                    points = that._points,
                    pointsCount = points && points.length,
                    duration = 1 / (timeThreshold * (pointsCount - 1) + 1),
                    animateP = function() {
                        points[index] && points[index++].animate(index === pointsCount ? completeFunc : undefined, duration, stepFunc)
                    },
                    stepFunc = function(_, progress) {
                        if (progress >= timeThreshold) {
                            this.step = null;
                            animateP()
                        }
                    },
                    completeFunc = function() {
                        that._labelsGroup && that._labelsGroup.animate({opacity: 1}, {duration: 400})
                    };
                if (firstDrawing)
                    animateP();
                else
                    $.each(points, function(i, p) {
                        p.animate(i == pointsCount - 1 ? completeFunc : undefined)
                    })
            },
            getVisiblePoints: function() {
                return _map(this._points, function(p) {
                        return p.isVisible() ? p : null
                    })
            },
            _beginUpdateData: function() {
                this._deletePatterns();
                this._patterns = []
            }
        });
        pieSeries.doughnut = pieSeries.donut = pieSeries.pie
    })(jQuery, DevExpress);
    /*! Module viz-core, file financialSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            series = viz.core.series.mixins.chart,
            scatterSeries = series.scatter,
            barSeries = series.bar,
            rangeCalculator = viz.core.series.helpers.rangeDataCalculator(),
            _isDefined = DX.utils.isDefined,
            _extend = $.extend,
            _each = $.each,
            _noop = $.noop,
            DEFAULT_FINANCIAL_POINT_SIZE = 10;
        series.stock = _extend({}, scatterSeries, {
            _animate: _noop,
            _applyMarkerClipRect: series.line._applyElementsClipRect,
            _applyTrackersClippings: barSeries._applyTrackersClippings,
            _createPattern: barSeries._createPattern,
            _preparePointOptions: barSeries._preparePointOptions,
            _createMarkerGroup: function() {
                var that = this,
                    markersGroup,
                    styles = that._getPointOptions().styles,
                    defaultStyle = styles.normal,
                    defaultPositiveStyle = styles.positive.normal,
                    reductionStyle = styles.reduction.normal,
                    reductionPositiveStyle = styles.reductionPositive.normal,
                    markerSettings = {"class": "dxc-markers"};
                that._applyMarkerClipRect(markerSettings);
                defaultStyle["class"] = "default-markers";
                defaultPositiveStyle["class"] = "default-positive-markers";
                reductionStyle["class"] = "reduction-markers";
                reductionPositiveStyle["class"] = "reduction-positive-markers";
                that._createGroup("_markersGroup", that, that._group, markerSettings);
                markersGroup = that._markersGroup;
                that._createGroup("defaultMarkersGroup", markersGroup, markersGroup, defaultStyle);
                that._createGroup("reductionMarkersGroup", markersGroup, markersGroup, reductionStyle);
                that._createGroup("defaultPositiveMarkersGroup", markersGroup, markersGroup, defaultPositiveStyle);
                that._createGroup("reductionPositiveMarkersGroup", markersGroup, markersGroup, reductionPositiveStyle)
            },
            _createGroups: function() {
                scatterSeries._createGroups.call(this, false)
            },
            _clearingAnimation: function(translators, drawComplete) {
                drawComplete()
            },
            _getCreatingPointOptions: function() {
                if (!this._predefinedPointOptions) {
                    var styles,
                        defaultPointOptions = this._getPointOptions(),
                        strokeWidth = defaultPointOptions.styles && defaultPointOptions.styles.normal && defaultPointOptions.styles.normal.strokeWidth,
                        creatingPointOptions = _extend(true, {}, defaultPointOptions);
                    creatingPointOptions.styles = styles = creatingPointOptions.styles || {};
                    styles.normal = styles.positive.normal = styles.reduction.normal = styles.reductionPositive.normal = {strokeWidth: strokeWidth};
                    this._predefinedPointOptions = creatingPointOptions
                }
                return this._predefinedPointOptions
            },
            _checkData: function(data) {
                return _isDefined(data.argument) && data.highValue !== undefined && data.lowValue !== undefined && data.openValue !== undefined && data.closeValue !== undefined
            },
            _processRange: function(point, prevPoint) {
                rangeCalculator.processTwoValues(this, point, prevPoint, "highValue", "lowValue")
            },
            _getRangeData: function(zoomArgs, calcIntervalFunction) {
                rangeCalculator.calculateTwoValuesRangeData(this, zoomArgs, calcIntervalFunction, "highValue", "lowValue");
                rangeCalculator.addRangeSeriesLabelPaddings(this);
                return this._rangeData
            },
            _getPointData: function(data, options) {
                var that = this,
                    level,
                    argumentField = options.argumentField || "date",
                    tagField = options.tagField || "tag",
                    openValueField = options.openValueField || "open",
                    closeValueField = options.closeValueField || "close",
                    highValueField = options.highValueField || "high",
                    lowValueField = options.lowValueField || "low",
                    reductionValue;
                that.level = options.reduction.level;
                switch ((that.level || "").toLowerCase()) {
                    case"open":
                        level = openValueField;
                        break;
                    case"high":
                        level = highValueField;
                        break;
                    case"low":
                        level = lowValueField;
                        break;
                    default:
                        level = closeValueField;
                        that.level = "close";
                        break
                }
                reductionValue = data[level];
                return {
                        argument: data[argumentField],
                        highValue: data[highValueField],
                        lowValue: data[lowValueField],
                        closeValue: data[closeValueField],
                        openValue: data[openValueField],
                        reductionValue: reductionValue,
                        tag: data[tagField],
                        isReduction: this._checkReduction(reductionValue)
                    }
            },
            _parsePointStyle: function(style, defaultColor, innerColor) {
                return {
                        stroke: style.color || defaultColor,
                        strokeWidth: style.width,
                        fill: style.color || innerColor
                    }
            },
            updateTeamplateFieldNames: function() {
                var that = this,
                    options = that._options,
                    valueFields = that.getValueFields(),
                    name = that.name;
                options.openValueField = valueFields[0] + name;
                options.highValueField = valueFields[1] + name;
                options.lowValueField = valueFields[2] + name;
                options.closeValueField = valueFields[3] + name;
                options.tagField = that.getTagField() + name
            },
            _getDefaultStyle: function(options) {
                var mainPointColor = options.color || this._options.mainSeriesColor;
                return {
                        normal: this._parsePointStyle(options, mainPointColor, mainPointColor),
                        hover: this._parsePointStyle(options.hoverStyle, mainPointColor, mainPointColor),
                        selection: this._parsePointStyle(options.selectionStyle, mainPointColor, mainPointColor)
                    }
            },
            _getReductionStyle: function(options) {
                var reductionColor = options.reduction.color,
                    normalStyle = this._parsePointStyle({
                        color: reductionColor,
                        width: options.width,
                        hatching: options.hatching
                    }, reductionColor, reductionColor);
                return {
                        normal: normalStyle,
                        hover: this._parsePointStyle(options.hoverStyle, reductionColor, reductionColor),
                        selection: this._parsePointStyle(options.selectionStyle, reductionColor, reductionColor)
                    }
            },
            _createPointStyles: function(pointOptions) {
                var that = this,
                    innerColor = that._options.innerColor,
                    styles = that._getDefaultStyle(pointOptions),
                    positiveStyle,
                    reductionStyle,
                    reductionPositiveStyle;
                positiveStyle = _extend(true, {}, styles);
                reductionStyle = that._getReductionStyle(pointOptions);
                reductionPositiveStyle = _extend(true, {}, reductionStyle);
                positiveStyle.normal.fill = positiveStyle.hover.fill = positiveStyle.selection.fill = innerColor;
                reductionPositiveStyle.normal.fill = reductionPositiveStyle.hover.fill = reductionPositiveStyle.selection.fill = innerColor;
                styles.positive = positiveStyle;
                styles.reduction = reductionStyle;
                styles.reductionPositive = reductionPositiveStyle;
                return styles
            },
            _endUpdateData: function() {
                delete this.prevLevelValue;
                delete this._predefinedPointOptions
            },
            _checkReduction: function(value) {
                var result = false;
                if (value != null) {
                    if (_isDefined(this.prevLevelValue))
                        result = value < this.prevLevelValue;
                    this.prevLevelValue = value
                }
                return result
            },
            _fusionPoints: function(fusionPoints, tick, nowIndexTicks) {
                var fusedPointData = {},
                    reductionLevel,
                    highValue = -Infinity,
                    lowValue = +Infinity,
                    openValue,
                    closeValue;
                if (!fusionPoints.length)
                    return {};
                _each(fusionPoints, function(_, point) {
                    if (!point.hasValue())
                        return;
                    highValue = Math.max(highValue, point.highValue);
                    lowValue = Math.min(lowValue, point.lowValue);
                    openValue = openValue !== undefined ? openValue : point.openValue;
                    closeValue = point.closeValue !== undefined ? point.closeValue : closeValue
                });
                fusedPointData.argument = tick;
                fusedPointData.openValue = openValue;
                fusedPointData.closeValue = closeValue;
                fusedPointData.highValue = highValue;
                fusedPointData.lowValue = lowValue;
                fusedPointData.tag = null;
                switch ((this.level || "").toLowerCase()) {
                    case"open":
                        reductionLevel = openValue;
                        break;
                    case"high":
                        reductionLevel = highValue;
                        break;
                    case"low":
                        reductionLevel = lowValue;
                        break;
                    default:
                        reductionLevel = closeValue;
                        break
                }
                fusedPointData.reductionValue = reductionLevel;
                fusedPointData.isReduction = this._checkReduction(reductionLevel);
                return fusedPointData
            },
            _getPointSize: function() {
                return DEFAULT_FINANCIAL_POINT_SIZE
            },
            getValueFields: function() {
                var options = this._options;
                return [options.openValueField || "open", options.highValueField || "high", options.lowValueField || "low", options.closeValueField || "close"]
            },
            getArgumentField: function() {
                return this._options.argumentField || "date"
            }
        });
        series.candlestick = _extend({}, series.stock, {_parsePointStyle: function(style, defaultColor, innerColor) {
                var color = this._createPattern(style.color || innerColor, style.hatching),
                    base = series.stock._parsePointStyle.call(this, style, defaultColor, color);
                base.fill = color;
                return base
            }})
    })(jQuery, DevExpress);
    /*! Module viz-core, file stackedSeries.js */
    (function($, DX) {
        var viz = DX.viz,
            series = viz.core.series.mixins.chart,
            areaSeries = series.area,
            barSeries = series.bar,
            lineSeries = series.line,
            rangeCalculator = viz.core.series.helpers.rangeDataCalculator(),
            _extend = $.extend,
            _noop = $.noop,
            baseStackedSeries = {
                _processRange: _noop,
                _processStackedRange: function() {
                    var that = this,
                        prevPoint;
                    $.each(that.getAllPoints(), function(i, p) {
                        rangeCalculator.processRange(that, p, prevPoint);
                        prevPoint = p
                    })
                },
                _getRangeData: function() {
                    this._processStackedRange();
                    return areaSeries._getRangeData.apply(this, arguments)
                }
            },
            baseFullStackedSeries = _extend({}, baseStackedSeries, {
                _getRangeData: function(zoomArgs, calcIntervalFunction) {
                    this._processStackedRange();
                    rangeCalculator.calculateRangeData(this, zoomArgs, calcIntervalFunction);
                    rangeCalculator.addLabelPaddings(this);
                    rangeCalculator.processFullStackedRange(this);
                    rangeCalculator.calculateRangeMinValue(this, zoomArgs);
                    return this._rangeData
                },
                isFullStackedSeries: function() {
                    return true
                }
            });
        series.stackedline = _extend({}, lineSeries, baseStackedSeries, {_getRangeData: function() {
                this._processStackedRange();
                return lineSeries._getRangeData.apply(this, arguments)
            }});
        series.fullstackedline = _extend({}, lineSeries, baseFullStackedSeries, {_getRangeData: function(zoomArgs, calcIntervalFunction) {
                this._processStackedRange();
                var rangeCalculator = viz.core.series.helpers.rangeDataCalculator();
                rangeCalculator.calculateRangeData(this, zoomArgs, calcIntervalFunction);
                rangeCalculator.addLabelPaddings(this);
                rangeCalculator.processFullStackedRange(this);
                return this._rangeData
            }});
        series.stackedbar = _extend({}, barSeries, baseStackedSeries, {_getRangeData: function() {
                this._processStackedRange();
                return barSeries._getRangeData.apply(this, arguments)
            }});
        series.fullstackedbar = _extend({}, barSeries, baseFullStackedSeries, {_getRangeData: function(zoomArgs, calcIntervalFunction) {
                var rangeData = baseFullStackedSeries._getRangeData.apply(this, arguments);
                rangeData.arg.stick = false;
                return rangeData
            }});
        series.stackedarea = _extend({}, areaSeries, baseStackedSeries);
        series.fullstackedarea = _extend({}, areaSeries, baseFullStackedSeries)
    })(jQuery, DevExpress);
    /*! Module viz-core, file basePoint.js */
    (function($, DX) {
        var viz = DX.viz,
            statesConsts = viz.core.series.helpers.consts.states,
            _each = $.each,
            _extend = $.extend,
            _isDefined = DX.utils.isDefined,
            _noop = $.noop,
            pointTypes = {
                scatter: "symbolPoint",
                line: "symbolPoint",
                spline: "symbolPoint",
                stepline: "symbolPoint",
                stackedline: "symbolPoint",
                fullstackedline: "symbolPoint",
                area: "symbolPoint",
                splinearea: "symbolPoint",
                steparea: "symbolPoint",
                stackedarea: "symbolPoint",
                fullstackedarea: "symbolPoint",
                rangearea: "rangeSymbolPoint",
                bar: "barPoint",
                stackedbar: "barPoint",
                fullstackedbar: "barPoint",
                rangebar: "rangeBarPoint",
                bubble: "bubblePoint",
                pie: "piePoint",
                doughnut: "piePoint",
                donut: "piePoint",
                stock: "stockPoint",
                candlestick: "candlestickPoint"
            };
        viz.core.series.points = {};
        viz.core.series.points.Point = DX.Class.inherit({
            ctor: function(dataItem, options) {
                this.update(dataItem, options);
                this._emptySettings = {
                    fill: null,
                    stroke: null
                }
            },
            getColor: function() {
                return this._styles.normal.fill || this.series.getColor()
            },
            _getStyle: function() {
                var styles = this._styles,
                    style;
                if (this.isSelected())
                    style = styles.selection;
                else if (this.isHovered())
                    style = styles.hover;
                else {
                    this.fullState = statesConsts.normalMark;
                    style = styles.normal
                }
                return style
            },
            update: function(dataItem, options) {
                this.updateOptions(options);
                this.updateData(dataItem)
            },
            updateData: function(dataItem) {
                this._updateData(dataItem);
                if (!this.hasValue())
                    this.setInvisibility();
                else {
                    this._updateLabelData();
                    this._fillStyle()
                }
            },
            deleteMarker: function() {
                this.graphic && this.graphic.detach();
                this.graphic = null
            },
            deleteTrackerMarker: function() {
                this.trackerGraphic && this.trackerGraphic.remove();
                this.trackerGraphic = null
            },
            draw: function(renderer, markersGroup, labelsGroup, animationEnabled, firstDrawing) {
                if (this._needDeletingOnDraw) {
                    this.deleteMarker();
                    this.deleteTrackerMarker();
                    this._needDeletingOnDraw = false
                }
                if (this._needClearingOnDraw) {
                    this.clearMarker();
                    this._needClearingOnDraw = false
                }
                if (!this._hasGraphic())
                    this._options.visible && this._drawMarker(renderer, markersGroup, animationEnabled, firstDrawing);
                else
                    this._updateMarker(animationEnabled, undefined, markersGroup);
                this._drawLabel(renderer, labelsGroup)
            },
            applyStyle: function(style) {
                if (this.graphic) {
                    if (style === "normal")
                        this.clearMarker();
                    else
                        this.graphic.toForeground();
                    this._updateMarker(true, this._styles[style])
                }
            },
            setHoverState: function() {
                this.series.setPointHoverState(this)
            },
            releaseHoverState: function(callback) {
                this.series.releasePointHoverState(this, callback);
                if (this.graphic)
                    !this.isSelected() && this.graphic.toBackground()
            },
            setSelectedState: function() {
                this.series.setPointSelectedState(this)
            },
            releaseSelectedState: function() {
                this.series.releasePointSelectedState(this)
            },
            select: function() {
                this.series.selectPoint(this)
            },
            clearSelection: function() {
                this.series.deselectPoint(this)
            },
            showTooltip: function() {
                this.series.showPointTooltip(this)
            },
            hideTooltip: function() {
                this.series.hidePointTooltip(this)
            },
            _checkLabelsChanging: function(oldType, newType) {
                if (oldType) {
                    var isNewRange = ~newType.indexOf("range"),
                        isOldRange = ~oldType.indexOf("range");
                    return isOldRange && !isNewRange || !isOldRange && isNewRange
                }
                else
                    return false
            },
            updateOptions: function(newOptions) {
                if (!_isDefined(newOptions))
                    return;
                var that = this,
                    oldOptions = that._options,
                    oldType = oldOptions && oldOptions.type,
                    newType = newOptions.type;
                if (pointTypes[oldType] !== pointTypes[newType]) {
                    that._needDeletingOnDraw = true;
                    that._needClearingOnDraw = false;
                    that._checkLabelsChanging(oldType, newType) && that.deleteLabel();
                    that._resetType(oldType);
                    that._setType(newType)
                }
                else {
                    that._needDeletingOnDraw = that._checkSymbol(oldOptions, newOptions);
                    that._needClearingOnDraw = that._checkCustomize(oldOptions, newOptions)
                }
                that.series = newOptions.series;
                that._options = newOptions;
                that._fillStyle();
                that._updateLabelOptions(pointTypes[newType])
            },
            translate: function(translators) {
                this.translators = translators || this.translators;
                this.translators && this.hasValue() && this._translate(this.translators)
            },
            drawTracker: function(renderer, group) {
                if (!this.trackerGraphic)
                    this._drawTrackerMarker(renderer, group);
                else
                    this._updateTracker()
            },
            _checkCustomize: function(oldOptions, newOptions) {
                return oldOptions.styles.usePointCustomOptions && !newOptions.styles.usePointCustomOptions
            },
            _getCustomLabelVisibility: function() {
                if (this._styles.useLabelCustomOptions)
                    return this._options.label.visible ? "visible" : "hidden"
            },
            _getGraphicSettings: function() {
                return {
                        x: this.graphic.settings.x || 0,
                        y: this.graphic.settings.y || 0,
                        height: this.graphic.settings.height || 0,
                        width: this.graphic.settings.width || 0
                    }
            },
            _resetType: function(type) {
                var that = this;
                if (type)
                    _each(viz.core.series.points.mixins[pointTypes[type]], function(methodName) {
                        delete that[methodName]
                    })
            },
            _setType: function(type) {
                var that = this;
                _each(viz.core.series.points.mixins[pointTypes[type]], function(methodName, method) {
                    that[methodName] = method
                })
            },
            _prepareStatesOptions: function() {
                var that = this;
                if (that._options.states && that._options.states.normal)
                    that._populatePointShape(that._options.states.normal.r)
            },
            isInVisibleArea: function() {
                return this.inVisibleArea
            },
            isSelected: function() {
                return !!(this.fullState & statesConsts.selectedMark)
            },
            isHovered: function() {
                return !!(this.fullState & statesConsts.hoverMark)
            },
            getOptions: function() {
                return this._options
            },
            animate: function(complete, settings, partitionDuration) {
                if (!this.graphic) {
                    complete && complete();
                    return
                }
                this.graphic.animate(settings, {partitionDuration: partitionDuration}, complete)
            },
            getCoords: function(min) {
                if (!min)
                    return {
                            x: this.x,
                            y: this.y
                        };
                if (!this._options.rotated)
                    return {
                            x: this.x,
                            y: this.minY
                        };
                return {
                        x: this.minX,
                        y: this.y
                    }
            },
            getDefaultCoords: function() {
                return !this._options.rotated ? {
                        x: this.x,
                        y: this.defaultY
                    } : {
                        x: this.defaultX,
                        y: this.y
                    }
            },
            _calculateVisibility: function(x, y, width, height) {
                var that = this,
                    visibleAreaX,
                    visibleAreaY,
                    rotated = that._options.rotated;
                if (that.translators) {
                    visibleAreaX = that.translators.x.getCanvasVisibleArea();
                    visibleAreaY = that.translators.y.getCanvasVisibleArea();
                    if (visibleAreaX.min > x + (width || 0) || visibleAreaX.max < x || visibleAreaY.min > y + (height || 0) || visibleAreaY.max < y || rotated && _isDefined(width) && width !== 0 && (visibleAreaX.min === x + width || visibleAreaX.max === x) || !rotated && _isDefined(height) && height !== 0 && (visibleAreaY.min === y + height || visibleAreaY.max === y))
                        that.inVisibleArea = false;
                    else
                        that.inVisibleArea = true
                }
            },
            correctPosition: _noop,
            hasValue: function() {
                return this.value !== null && this.minValue !== null
            },
            _populatePointShape: _noop,
            _checkSymbol: _noop,
            hide: _noop,
            show: _noop,
            hideMarker: _noop,
            setInvisibility: _noop,
            clearVisibility: _noop,
            isVisible: _noop,
            resetCorrection: _noop,
            correctValue: _noop,
            setPercentValue: _noop,
            correctCoordinates: _noop,
            dispose: function() {
                this.deleteMarker();
                this.deleteTrackerMarker();
                this.deleteLabel();
                this._options = null;
                this._styles = null;
                this.series = null;
                this.translators = null
            },
            getTooltipFormatObject: function(tooltip) {
                var that = this,
                    tooltipFormatObject = that._getFormatObject(tooltip),
                    sharedTooltipValuesArray = [],
                    tooltipStackPointsFormatObject = [];
                if (that.stackPoints) {
                    _each(that.stackPoints, function(_, point) {
                        if (!point.isVisible())
                            return;
                        var formatObject = point._getFormatObject(tooltip);
                        tooltipStackPointsFormatObject.push(point._getFormatObject(tooltip));
                        sharedTooltipValuesArray.push(formatObject.seriesName + ": " + formatObject.valueText)
                    });
                    _extend(tooltipFormatObject, {
                        points: tooltipStackPointsFormatObject,
                        valueText: sharedTooltipValuesArray.join("\n"),
                        stackName: that.stackPoints.stackName
                    })
                }
                return tooltipFormatObject
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file label.js */
    (function($, DX) {
        var _isDefined = DX.utils.isDefined,
            _extend = $.extend,
            _math = Math,
            _round = _math.round,
            _floor = _math.floor,
            _isEmptyObject = $.isEmptyObject,
            _noop = $.noop,
            LABEL_BACKGROUND_PADDING_X = 8,
            LABEL_BACKGROUND_PADDING_Y = 4,
            LABEL_OFFSET = 10,
            setPositionFuncCollection = {
                symbolPoint: "_setPositionForSymbol",
                barPoint: "_setPositionForBar",
                bubblePoint: "_setPositionForBubble",
                rangeSymbolPoint: "_setPositionForSymbol",
                rangeBarPoint: "_setPositionForBar",
                stockPoint: "_setPositionForFinancial",
                candlestickPoint: "_setPositionForFinancial"
            },
            checkPositionFuncCollection = {
                symbolPoint: "_checkPositionForSymbol",
                barPoint: "_checkPositionForBar",
                bubblePoint: "_checkPositionForSymbol",
                rangeSymbolPoint: "_checkPositionForSymbol",
                rangeBarPoint: "_checkPositionForBar",
                stockPoint: "_checkPositionForBar",
                candlestickPoint: "_checkPositionForBar"
            };
        DX.viz.core.series.points.Label = DX.Class.inherit({
            ctor: function(data, options) {
                this._offset = LABEL_OFFSET;
                this.updateData(data);
                this.setOptions(options)
            },
            clearVisibility: function() {
                if (this._group && this._group.settings.visibility)
                    this._group.applySettings({visibility: null})
            },
            hide: function() {
                if (this._group && this._group.settings.visibility !== "hidden")
                    this._group.applySettings({visibility: "hidden"})
            },
            updateData: function(data) {
                if (_isDefined(data)) {
                    this._data = data.formatObject;
                    this._initialValue = data.initialValue
                }
            },
            updateOptions: function(options) {
                this.setOptions(_extend(true, {}, {options: this._options}, options))
            },
            setOptions: function(newOptions) {
                var that = this,
                    oldOptions = that._options,
                    newOptions = newOptions || {},
                    pointType = newOptions.type || "symbolPoint";
                that._options = newOptions.options;
                that._rotated = newOptions.rotated;
                that._isFullStacked = newOptions.isFullStacked;
                that._isRange = newOptions.isRange;
                that._setPosition = that[setPositionFuncCollection[pointType]];
                that._checkPosition = that[checkPositionFuncCollection[pointType]];
                if (oldOptions) {
                    that._isBackgroundChanged(oldOptions.background, that._options.background) && that._deleteBackground();
                    that._isConnectorChanged(oldOptions.connector, that._options.connector) && that._deleteConnector()
                }
            },
            setDataField: function(fieldName, fieldValue) {
                this._data = this._data || {};
                this._data[fieldName] = fieldValue
            },
            getData: function() {
                return this._data
            },
            setCoords: function(coords, graphicBbox, location, visibleArea) {
                this._coords = coords;
                this._graphicBbox = graphicBbox;
                this._visibleArea = visibleArea;
                this._location = location
            },
            hasText: function() {
                return !!this._text
            },
            getTextCoords: function() {
                return this._text && this._text.getBBox()
            },
            getCoords: function() {
                var coords = {},
                    insideGroup = this._insideGroup;
                if (insideGroup) {
                    coords = insideGroup.getBBox();
                    coords.x = insideGroup.settings.translateX || 0;
                    coords.y = insideGroup.settings.translateY || 0
                }
                return coords
            },
            updatePosition: function(x, y) {
                var settings = {},
                    insideGroup = this._insideGroup;
                insideGroup.applySettings({
                    translateX: x,
                    translateY: y
                });
                this._connector && this._drawConnector()
            },
            _deleteElements: function() {
                this._deleteConnector();
                this._deleteBackground();
                this._deleteText();
                this._deleteGroups()
            },
            dispose: function() {
                this._data = null;
                this._options = null;
                this._positioningFunction = null;
                this._graphicBbox = null;
                this._visibleArea = null;
                this._coords = null;
                this._deleteElements()
            },
            _deleteText: function() {
                this._text && this._text.detach();
                this._text = null
            },
            _deleteGroups: function() {
                this._insideGroup = null;
                this._group && this._group.detach();
                this._group = null
            },
            _drawGroups: function(renderer, group) {
                if (!this._group)
                    this._group = renderer.createGroup().append(group);
                if (!this._insideGroup)
                    this._insideGroup = renderer.createGroup().append(this._group)
            },
            _drawText: function(renderer, text) {
                if (!this._text)
                    this._text = renderer.createText(text, 0, 0, this._options.attributes).append(this._insideGroup);
                else
                    this._text.applySettings({text: text}, this._options.attributes)
            },
            _drawBackground: function(renderer) {
                var that = this,
                    options = that._options,
                    background = options.background || {},
                    settings;
                if (that._checkBackground(background)) {
                    settings = _extend(that._getBackgroundSettings(), background);
                    if (!that._background)
                        that._background = renderer.createRect(settings.x, settings.y, settings.width, settings.height, 0, background).append(that._insideGroup);
                    else
                        that._background.applySettings(settings);
                    that._background.toBackground()
                }
            },
            _drawConnector: function(renderer) {
                var that = this,
                    connector = that._options.connector || {},
                    points;
                if (that._checkConnector(connector)) {
                    points = that._getConnectorPoints() || [];
                    if (!that._connector)
                        that._connector = renderer.createPath(points, connector).append(that._group);
                    else
                        that._connector.applySettings(_extend({points: points}, connector));
                    that._connector.toBackground()
                }
            },
            _setVisibility: function(visibility) {
                this._group && this._group.applySettings({visibility: visibility})
            },
            draw: function(renderer, group, visibility) {
                var that = this,
                    options = that._options,
                    background = options.background,
                    text = that._format();
                if (_isDefined(text) && text !== "") {
                    that._drawGroups(renderer, group);
                    that._setVisibility(visibility);
                    that._drawText(renderer, text);
                    that._drawBackground(renderer);
                    that._rotateLabel();
                    that._setPosition();
                    that._drawConnector(renderer)
                }
                else
                    that._setVisibility("hidden")
            },
            _deleteBackground: function() {
                this._background && this._background.detach();
                this._background = null
            },
            _isBackgroundChanged: function(oldBackground, newBackground) {
                return this._checkBackground(oldBackground || {}) !== this._checkBackground(newBackground || {})
            },
            _checkBackground: function(background) {
                var hasColor = background.fill && background.fill !== "none",
                    hasBorder = background.strokeWidth && background.stroke && background.stroke !== "none";
                return hasColor || hasBorder
            },
            _getBackgroundSettings: function() {
                var bbox = this._text.getBBox();
                return {
                        x: bbox.x - LABEL_BACKGROUND_PADDING_X,
                        y: bbox.y - LABEL_BACKGROUND_PADDING_Y,
                        width: bbox.width + 2 * LABEL_BACKGROUND_PADDING_X,
                        height: bbox.height + 2 * LABEL_BACKGROUND_PADDING_Y
                    }
            },
            _deleteConnector: function() {
                this._connector && this._connector.detach();
                this._connector = null
            },
            _isConnectorChanged: function(oldConnector, newConnector) {
                return this._checkConnector(oldConnector || {}) !== this._checkConnector(newConnector || {})
            },
            _checkConnector: function(connector) {
                return connector && connector.strokeWidth
            },
            _getConnectorPoints: function() {
                var that = this,
                    rotated = that._rotated,
                    labelBbox = that._insideGroup.getBBox(),
                    graphicBbox = that._graphicBbox,
                    centerLabelY,
                    centerLabelX,
                    rightLabelCoord,
                    bottomLabelCoord,
                    x1,
                    x2,
                    y1,
                    y2;
                labelBbox.x += that._insideGroup.settings.translateX || 0;
                labelBbox.y += that._insideGroup.settings.translateY || 0;
                centerLabelY = that._background ? labelBbox.y + labelBbox.height / 2 : null;
                centerLabelX = that._background ? labelBbox.x + labelBbox.width / 2 : null,
                rightLabelCoord = labelBbox.x + labelBbox.width;
                bottomLabelCoord = labelBbox.y + labelBbox.height;
                x1 = _floor(labelBbox.x + labelBbox.width / 2);
                x2 = _floor(graphicBbox.x + graphicBbox.width / 2);
                if (bottomLabelCoord < graphicBbox.y) {
                    y1 = centerLabelY || bottomLabelCoord;
                    y2 = graphicBbox.y
                }
                else if (labelBbox.y > graphicBbox.y + graphicBbox.height) {
                    y1 = centerLabelY || labelBbox.y;
                    y2 = graphicBbox.y + graphicBbox.height
                }
                else {
                    if (labelBbox.x > graphicBbox.x + graphicBbox.width) {
                        x1 = centerLabelX || labelBbox.x;
                        x2 = graphicBbox.x + graphicBbox.width
                    }
                    else if (rightLabelCoord < graphicBbox.x) {
                        x1 = centerLabelX || rightLabelCoord;
                        x2 = graphicBbox.x
                    }
                    else
                        return;
                    y1 = _floor(labelBbox.y + labelBbox.height / 2);
                    y2 = _floor(graphicBbox.y + graphicBbox.height / 2)
                }
                return [{
                            x: x1,
                            y: y1
                        }, {
                            x: x2,
                            y: y2
                        }]
            },
            _rotateLabel: function() {
                var bbox = this._insideGroup.getBBox();
                this._insideGroup.rotate(this._options.rotationAngle)
            },
            _format: function() {
                var that = this,
                    data = that._data,
                    options = that._options,
                    formatHelper = DX.formatHelper;
                data.valueText = formatHelper.format(data.value, options.format, options.precision);
                data.argumentText = formatHelper.format(data.argument, options.argumentFormat, options.argumentPrecision);
                if (data.percent !== undefined)
                    data.percentText = formatHelper.format(data.percent, "percent", options.percentPrecision);
                if (data.total !== undefined)
                    data.totalText = formatHelper.format(data.total, options.format, options.precision);
                if (data.openValue !== undefined)
                    data.openValueText = formatHelper.format(data.openValue, options.format, options.precision);
                if (data.closeValue !== undefined)
                    data.closeValueText = formatHelper.format(data.closeValue, options.format, options.precision);
                if (data.lowValue !== undefined)
                    data.lowValueText = formatHelper.format(data.lowValue, options.format, options.precision);
                if (data.highValue !== undefined)
                    data.highValueText = formatHelper.format(data.highValue, options.format, options.precision);
                if (data.reductionValue !== undefined)
                    data.reductionValueText = formatHelper.format(data.reductionValue, options.format, options.precision);
                return options.customizeText ? options.customizeText.call(data, data) : data.valueText
            },
            _getOutsideLabelCoords: function(labelBbox) {
                var graphicBbox = this._graphicBbox,
                    x = 0,
                    y = 0,
                    isTop = this._location === "top";
                if (!this._rotated) {
                    x += graphicBbox.width / 2 + graphicBbox.x;
                    if (isTop)
                        y += graphicBbox.y - labelBbox.y - labelBbox.height - this._offset;
                    else
                        y += graphicBbox.y + graphicBbox.height - labelBbox.y + this._offset
                }
                else {
                    y += graphicBbox.y - labelBbox.y - labelBbox.height / 2 + graphicBbox.height / 2;
                    if (isTop)
                        x += graphicBbox.x + graphicBbox.width - labelBbox.x + this._offset;
                    else
                        x += graphicBbox.x - labelBbox.x - labelBbox.width - this._offset
                }
                return {
                        x: x,
                        y: y
                    }
            },
            _getInsideLabelCoords: function(labelBbox) {
                var graphicBbox = this._graphicBbox,
                    isTop = this._location === "top",
                    x = 0,
                    y = 0;
                if (!this._isRange)
                    if (!this._rotated) {
                        x += graphicBbox.width / 2 + graphicBbox.x;
                        y += graphicBbox.y - labelBbox.y - labelBbox.height / 2 + graphicBbox.height / 2
                    }
                    else {
                        y += graphicBbox.y - labelBbox.y - labelBbox.height / 2 + graphicBbox.height / 2;
                        x += graphicBbox.x - labelBbox.x - labelBbox.width / 2 + graphicBbox.width / 2
                    }
                else if (!this._rotated) {
                    x += graphicBbox.width / 2 + graphicBbox.x;
                    if (isTop)
                        y += graphicBbox.y - labelBbox.y - labelBbox.height + this._offset + labelBbox.height;
                    else
                        y += graphicBbox.y + graphicBbox.height - labelBbox.y - this._offset - labelBbox.height
                }
                else {
                    y += graphicBbox.y - labelBbox.y - labelBbox.height / 2 + graphicBbox.height / 2;
                    if (isTop)
                        x += graphicBbox.x + graphicBbox.width - labelBbox.x - labelBbox.width - this._offset;
                    else
                        x += graphicBbox.x - labelBbox.x + this._offset
                }
                return {
                        x: x,
                        y: y
                    }
            },
            _getFullstackedLabelCoords: function(labelBbox) {
                var x = 0,
                    y = 0,
                    graphicBbox = this._graphicBbox;
                if (!this._rotated) {
                    x += graphicBbox.width / 2 + graphicBbox.x;
                    y += this._coords.defaultY - labelBbox.y - labelBbox.height - this._offset
                }
                else {
                    y += graphicBbox.y - labelBbox.y - labelBbox.height / 2 + graphicBbox.height / 2;
                    x += this._coords.defaultX - labelBbox.x + this._offset
                }
                return {
                        x: x,
                        y: y
                    }
            },
            _setPositionForSymbol: function() {
                var that = this,
                    offset = that._offset,
                    labelBBox = that._insideGroup.getBBox(),
                    graphicBbox = that._graphicBbox,
                    isTop = that._location === "top",
                    correctionY = 0,
                    correctionX = 0,
                    x = 0,
                    y = 0;
                if (!that._rotated) {
                    correctionX = that._coords.x;
                    correctionY = isTop ? -labelBBox.y - labelBBox.height - offset : graphicBbox.height - labelBBox.y + offset;
                    correctionY += graphicBbox.y
                }
                else {
                    correctionY = graphicBbox.y - labelBBox.y - labelBBox.height / 2 + graphicBbox.height / 2;
                    correctionX = isTop ? graphicBbox.width - labelBBox.x + offset : -labelBBox.x - labelBBox.width - offset;
                    correctionX += graphicBbox.x
                }
                x += correctionX + that._options.horizontalOffset;
                y += correctionY + that._options.verticalOffset;
                that._checkPosition({
                    x: labelBBox.x + x,
                    y: labelBBox.y + y,
                    height: labelBBox.height,
                    width: labelBBox.width
                }, x, y)
            },
            _checkPositionForSymbol: function(labelBbox, x, y) {
                var that = this,
                    graphicBbox = that._graphicBbox,
                    visibleArea = that._visibleArea,
                    offset = that._offset;
                if (!that._rotated) {
                    if (visibleArea.minX <= graphicBbox.x + graphicBbox.width && visibleArea.maxX >= graphicBbox.x) {
                        if (visibleArea.minX > labelBbox.x && that.adjustSeriesLabels)
                            x += visibleArea.minX - labelBbox.x;
                        if (visibleArea.maxX < labelBbox.x + labelBbox.width && that.adjustSeriesLabels)
                            x -= labelBbox.x + labelBbox.width - visibleArea.maxX;
                        if (visibleArea.minY > labelBbox.y)
                            y += graphicBbox.y + graphicBbox.height - labelBbox.y + offset;
                        if (visibleArea.maxY < labelBbox.y + labelBbox.height)
                            y -= labelBbox.y + labelBbox.height - graphicBbox.y + offset
                    }
                }
                else if (visibleArea.minY <= graphicBbox.y + graphicBbox.height && visibleArea.maxY >= graphicBbox.y) {
                    if (visibleArea.minX > labelBbox.x)
                        x += graphicBbox.x + graphicBbox.width - labelBbox.x + offset;
                    if (visibleArea.maxX < labelBbox.x + labelBbox.width)
                        x -= labelBbox.x + labelBbox.width - graphicBbox.x + offset;
                    if (visibleArea.minY > graphicBbox.y && that.adjustSeriesLabels)
                        y += visibleArea.minY - labelBbox.y;
                    if (visibleArea.maxY < labelBbox.y + labelBbox.height && that.adjustSeriesLabels)
                        y -= labelBbox.y + labelBbox.height - visibleArea.maxY
                }
                that._insideGroup.applySettings({
                    translateX: _round(x),
                    translateY: _round(y)
                })
            },
            _setPositionForBar: function() {
                var that = this,
                    offset = that._offset,
                    labelPosition = that._options.position,
                    labelBbox = that._insideGroup.getBBox(),
                    coords;
                if (that._initialValue === 0 && that._isFullStacked)
                    coords = that._getFullstackedLabelCoords(labelBbox);
                else if (labelPosition === "inside")
                    coords = that._getInsideLabelCoords(labelBbox);
                else
                    coords = that._getOutsideLabelCoords(labelBbox);
                coords.x += that._options.horizontalOffset;
                coords.y += that._options.verticalOffset;
                that._checkPosition({
                    x: labelBbox.x + coords.x,
                    y: labelBbox.y + coords.y,
                    height: labelBbox.height,
                    width: labelBbox.width
                }, coords.x, coords.y)
            },
            _checkPositionForBar: function(labelBbox, x, y) {
                var that = this,
                    graphicBbox = that._graphicBbox,
                    visibleArea = that._visibleArea;
                if (visibleArea.minX <= graphicBbox.x + graphicBbox.width && visibleArea.maxX >= graphicBbox.x && visibleArea.minY <= graphicBbox.y + graphicBbox.height && visibleArea.maxY >= graphicBbox.y)
                    if (!that._rotated) {
                        if (visibleArea.minX > labelBbox.x && that.adjustSeriesLabels)
                            x += visibleArea.minX - labelBbox.x;
                        if (visibleArea.maxX < labelBbox.x + labelBbox.width && that.adjustSeriesLabels)
                            x -= labelBbox.x + labelBbox.width - visibleArea.maxX;
                        if (visibleArea.minY > labelBbox.y)
                            y += visibleArea.minY - labelBbox.y;
                        if (visibleArea.maxY < labelBbox.y + labelBbox.height)
                            y -= labelBbox.y + labelBbox.height - visibleArea.maxY
                    }
                    else {
                        if (visibleArea.minX > labelBbox.x)
                            x += visibleArea.minX - labelBbox.x;
                        if (visibleArea.maxX < labelBbox.x + labelBbox.width)
                            x -= labelBbox.x + labelBbox.width - visibleArea.maxX;
                        if (visibleArea.minY > labelBbox.y && that.adjustSeriesLabels)
                            y += visibleArea.minY - labelBbox.y;
                        if (visibleArea.maxY < labelBbox.y + labelBbox.height && that.adjustSeriesLabels)
                            y -= labelBbox.y + labelBbox.height - visibleArea.maxY
                    }
                if (that._options.resolveLabelsOverlapping && that._options.position === "inside")
                    if (that._rotated) {
                        if (labelBbox.width > graphicBbox.width || labelBbox.height > graphicBbox.height) {
                            that.hide();
                            return
                        }
                    }
                    else if (labelBbox.height > graphicBbox.height || labelBbox.width > graphicBbox.width) {
                        that.hide();
                        return
                    }
                that._insideGroup.applySettings({
                    translateX: _round(x),
                    translateY: _round(y)
                })
            },
            _setPositionForBubble: function() {
                var that = this,
                    labelBbox = that._insideGroup.getBBox(),
                    graphicBbox = that._graphicBbox,
                    x = 0,
                    y = 0;
                if (that._options.position === "inside") {
                    x = that._coords.x;
                    y += graphicBbox.y + graphicBbox.height / 2 - labelBbox.y - labelBbox.height / 2;
                    x += that._options.horizontalOffset;
                    y += that._options.verticalOffset;
                    that._checkPosition({
                        x: labelBbox.x + x,
                        y: labelBbox.y + y,
                        height: labelBbox.height,
                        width: labelBbox.width
                    }, x, y)
                }
                else
                    that._setPositionForSymbol()
            },
            _setPositionForFinancial: function() {
                var that = this,
                    offset = that._offset,
                    labelBbox = that._insideGroup.getBBox(),
                    coords;
                coords = that._getOutsideLabelCoords(labelBbox);
                coords.x += that._options.horizontalOffset;
                coords.y += that._options.verticalOffset;
                that._checkPosition({
                    x: labelBbox.x + coords.x,
                    y: labelBbox.y + coords.y,
                    height: labelBbox.height,
                    width: labelBbox.width
                }, coords.x, coords.y)
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file pieLabel.js */
    (function($, DX) {
        var getCosAndSin = DX.utils.getCosAndSin,
            _extend = $.extend,
            _math = Math,
            _round = _math.round,
            _max = _math.max,
            _inArray = $.inArray,
            _isDefined = DX.utils.isDefined,
            INDENT_FROM_PIE = 30,
            CONNECTOR_LENGTH = 20;
        DX.viz.core.series.points.PieLabel = DX.viz.core.series.points.Label.inherit({
            ctor: function(data, options) {
                this.setLabelEllipsis = false;
                this.indentFromPie = INDENT_FROM_PIE;
                this.updateData(data);
                this.setOptions(options)
            },
            updateData: function(data) {
                if (_isDefined(data))
                    this._data = data.formatObject
            },
            setOptions: function(newOptions) {
                var that = this,
                    oldOptions = that._options,
                    newOptions = newOptions || {};
                that._options = newOptions.options;
                that._borderWidth = newOptions.borderWidth;
                if (oldOptions) {
                    that._isBackgroundChanged(oldOptions.background, that._options.background) && that._deleteBackground();
                    that._isConnectorChanged(oldOptions.connector, that._options.connector) && that._deleteConnector()
                }
            },
            setCoords: function(coords, canvas) {
                this._middleAngle = coords.middleAngle;
                this._radiusOuter = coords.radiusOuter;
                this._centerX = coords.centerX;
                this._centerY = coords.centerY;
                this._canvas = canvas
            },
            updatePosition: function(maxLabelLength) {
                this._setPosition(maxLabelLength);
                this._checkEllipsis();
                this._drawBackground();
                this._rotateLabel();
                this._checkPosition();
                this._connector && this._drawConnector()
            },
            dispose: function() {
                this._data = null;
                this._options = null;
                this._canvas = null;
                this._deleteElements()
            },
            draw: function(renderer, group, visibility) {
                var that = this,
                    options = that._options,
                    background = options.background,
                    text = that._format();
                if (_isDefined(text) && text !== "") {
                    that._drawGroups(renderer, group);
                    that._setVisibility(visibility);
                    that._drawText(renderer, text);
                    that._setPosition();
                    that._checkEllipsis();
                    that._drawBackground(renderer);
                    that._rotateLabel();
                    that._checkPosition();
                    that._drawConnector(renderer)
                }
                else
                    that._setVisibility("hidden")
            },
            _getOutsideGroupLabelPosition: function() {
                this._deleteConnector();
                return this._group && this._group.getBBox()
            },
            _setPosition: function(maxLabelLength) {
                var that = this,
                    bbox = that._text.getBBox(),
                    options = that._options,
                    angleFunctions = getCosAndSin(that._middleAngle),
                    align = "center",
                    rad = that._radiusOuter + options.radialOffset,
                    canvas = that._canvas,
                    rightBorderX = canvas.width - canvas.right,
                    leftBorderX = canvas.left,
                    x,
                    y;
                if (options.position === 'inside') {
                    rad -= that.indentFromPie;
                    x = that._centerX + rad * angleFunctions.cos
                }
                else if (options.position === 'columns') {
                    rad += CONNECTOR_LENGTH;
                    if (angleFunctions.cos >= 0) {
                        align = "right";
                        x = maxLabelLength ? that._centerX + rad + maxLabelLength : rightBorderX;
                        x = x > rightBorderX ? rightBorderX : x
                    }
                    else if (angleFunctions.cos < 0) {
                        align = "left";
                        x = maxLabelLength ? that._centerX - rad - maxLabelLength : leftBorderX;
                        x = x < leftBorderX ? leftBorderX : x
                    }
                }
                else {
                    rad += that.indentFromPie;
                    if (angleFunctions.cos > 0.1)
                        align = "left";
                    else if (angleFunctions.cos < -0.1)
                        align = "right";
                    x = that._centerX + rad * angleFunctions.cos
                }
                y = _round(that._text.settings.y + that._centerY - rad * angleFunctions.sin - bbox.y - bbox.height / 2);
                that._text.applySettings({
                    x: x,
                    y: y,
                    align: align
                })
            },
            _getConnectorPoints: function() {
                var that = this,
                    options = that._options,
                    position = options.position,
                    angleFunctions,
                    rad = that._radiusOuter,
                    box,
                    x,
                    y,
                    points = [];
                if (position !== "inside") {
                    angleFunctions = getCosAndSin(_round(that._middleAngle));
                    points.push({
                        x: _round(that._centerX + (rad - that._borderWidth) * angleFunctions.cos),
                        y: _round(that._centerY - (rad - that._borderWidth) * angleFunctions.sin)
                    });
                    x = _round(that._centerX + (rad + options.radialOffset + CONNECTOR_LENGTH) * angleFunctions.cos);
                    if (position === "columns") {
                        box = that._insideGroup.getBBox();
                        box.x = box.x + (that._insideGroup.settings.translateX || 0);
                        box.y = box.y + (that._insideGroup.settings.translateY || 0);
                        y = box.y + box.height / 2;
                        points.push({
                            x: x,
                            y: y
                        });
                        if (that._background)
                            x = box.x + box.width / 2;
                        else if (angleFunctions.cos < 0)
                            x = box.x + box.width;
                        else if (angleFunctions.cos > 0)
                            x = box.x;
                        points.push({
                            x: x,
                            y: y
                        })
                    }
                    else {
                        y = _round(that._centerY - (rad + options.radialOffset + CONNECTOR_LENGTH) * angleFunctions.sin);
                        points.push({
                            x: x,
                            y: y
                        })
                    }
                }
                return points
            },
            _rotateLabel: function() {
                var that = this,
                    options = that._options,
                    shift = that._radiusOuter + options.radialOffset * 2 + CONNECTOR_LENGTH,
                    angleFunctions = getCosAndSin(that._middleAngle),
                    x,
                    y,
                    box = that._insideGroup.getBBox();
                if (options.position === "inside" || options.position === "columns") {
                    x = box.x + box.width / 2;
                    y = box.y + box.height / 2
                }
                else {
                    x = that._centerX + shift * angleFunctions.cos;
                    y = that._centerY - shift * angleFunctions.sin
                }
                that._insideGroup.applySettings({
                    x: x,
                    y: y,
                    rotate: options.rotationAngle
                })
            },
            _checkEllipsis: function() {
                var that = this,
                    i,
                    LABEL_OFFSET = 10,
                    labelBox,
                    text,
                    textLength = 0,
                    linesLength = [],
                    numLastSpan = [],
                    maxLength,
                    numSpan,
                    index,
                    x,
                    y,
                    width,
                    rotationAngleFunction = getCosAndSin(that._options.rotationAngle),
                    canvas = that._canvas,
                    labelOptions = that._options,
                    angleFunctions = getCosAndSin(that._middleAngle),
                    borderX = that._centerX + (that._radiusOuter + CONNECTOR_LENGTH) * angleFunctions.cos;
                if (!that._text.tspans || !that.setLabelEllipsis)
                    return;
                labelBox = that._text.getBBox();
                x = labelBox.x + labelBox.width < that._centerX ? labelBox.x + labelBox.width : labelBox.x;
                y = labelBox.y + labelBox.height / 2;
                width = labelBox.x + labelBox.width < that._centerX ? -labelBox.width : labelBox.width;
                if (y + width * rotationAngleFunction.sin > canvas.height - canvas.bottom + LABEL_OFFSET || y + width * rotationAngleFunction.sin < canvas.top - LABEL_OFFSET || x + width * rotationAngleFunction.cos < canvas.left - LABEL_OFFSET || x + width * rotationAngleFunction.cos > canvas.width - canvas.right + LABEL_OFFSET || labelOptions.position === "columns" && (angleFunctions.cos < 0 && borderX < x || angleFunctions.cos > 0 && borderX > x))
                    for (i = 0; i < that._text.tspans.length; i++) {
                        textLength += that._text.tspans[i].element.getNumberOfChars();
                        if (!that._text.tspans[i + 1] || that._text.tspans[i + 1].settings.dy > 0) {
                            linesLength.push(textLength);
                            numLastSpan.push(i);
                            textLength = 0
                        }
                    }
                while (y + width * rotationAngleFunction.sin > canvas.height - canvas.bottom + LABEL_OFFSET || y + width * rotationAngleFunction.sin < canvas.top - LABEL_OFFSET || x + width * rotationAngleFunction.cos < canvas.left - LABEL_OFFSET || x + width * rotationAngleFunction.cos > canvas.width - canvas.right + LABEL_OFFSET || labelOptions.position === "columns" && (angleFunctions.cos < 0 && borderX < x || angleFunctions.cos > 0 && borderX > x)) {
                    maxLength = _max.apply(null, linesLength);
                    if (maxLength === 0)
                        break;
                    index = _inArray(maxLength, linesLength);
                    numSpan = numLastSpan[index];
                    if (that._text.tspans[numSpan].element.textContent === "...") {
                        if (that._text.tspans[numSpan].settings.dy > 0 || !that._text.tspans[numSpan - 1])
                            linesLength[index] = 0;
                        else if (that._text.tspans[numSpan - 1]) {
                            that._text.tspans[numSpan].element.textContent = "";
                            numLastSpan[index] -= 1;
                            that._text.tspans[numSpan - 1].element.textContent += "..."
                        }
                    }
                    else {
                        text = that._text.tspans[numSpan].element.textContent;
                        text = text.substr(0, text.length - 1 - 3) + "...";
                        that._text.tspans[numSpan].element.textContent = text;
                        linesLength[index] -= 1
                    }
                    labelBox = that._text.getBBox();
                    x = labelBox.x + labelBox.width < that._centerX ? labelBox.x + labelBox.width : labelBox.x;
                    y = labelBox.y + labelBox.height / 2;
                    width = labelBox.x + labelBox.width < that._centerX ? -labelBox.width : labelBox.width
                }
            },
            _checkPosition: function() {
                var that = this,
                    group = that._insideGroup,
                    box = group.getBBox(),
                    canvas = that._canvas,
                    x = 0,
                    y = 0;
                if (box.y + box.height > canvas.height - canvas.bottom)
                    y = canvas.height - box.y - box.height - canvas.bottom;
                else if (box.y < canvas.top)
                    y = canvas.top - box.y;
                if (box.x + box.width > canvas.width - canvas.right)
                    x = canvas.width - canvas.right - box.x - box.width;
                else if (box.x < canvas.left)
                    x = canvas.left - box.x;
                group.applySettings({
                    translateX: x,
                    translateY: y
                })
            },
            setPosition: function(position) {
                this._options.position = position
            },
            getPosition: function() {
                return this._options.position
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file symbolPoint.js */
    (function($, DX) {
        var viz = DevExpress.viz,
            core = viz.core,
            series = core.series,
            _extend = $.extend,
            _each = $.each,
            _isNumber = DX.utils.isNumber,
            _isDefined = DX.utils.isDefined,
            _isEmptyObject = $.isEmptyObject,
            _math = Math,
            _round = _math.round,
            _floor = _math.floor,
            _ceil = _math.ceil,
            DEFAULT_IMAGE_WIDTH = 20,
            DEFAULT_IMAGE_HEIGHT = 20,
            CANVAS_POSITION_DEFAULT = "canvas_position_default";
        series.points.mixins = series.points.mixins || {};
        series.points.mixins.symbolPoint = {
            deleteLabel: function() {
                this._label.dispose();
                this._label = null
            },
            _hasGraphic: function() {
                return this.graphic
            },
            _clearTrackerVisibility: function() {
                if (this.trackerGraphic && this.trackerGraphic.settings.visibility)
                    this.trackerGraphic.applySettings({visibility: null})
            },
            clearVisibility: function() {
                if (this.graphic && this.graphic.settings.visibility)
                    this.graphic.applySettings({visibility: null});
                this._clearTrackerVisibility();
                this._label.clearVisibility()
            },
            isVisible: function() {
                return this.inVisibleArea && this.series.isVisible()
            },
            _setTrackerInvisibility: function() {
                if (this.trackerGraphic && this.trackerGraphic.settings.visibility !== "hidden")
                    this.trackerGraphic.applySettings({visibility: "hidden"})
            },
            setInvisibility: function() {
                if (this.graphic && this.graphic.settings.visibility !== "hidden")
                    this.graphic.applySettings({visibility: "hidden"});
                this._setTrackerInvisibility();
                this._label.hide()
            },
            clearMarker: function() {
                this.graphic && this.graphic.applySettings(this._emptySettings)
            },
            setAdjustSeriesLabels: function(adjustSeriesLabels) {
                this._label.adjustSeriesLabels = adjustSeriesLabels
            },
            _getLabelOptions: function(type) {
                var options = this._options;
                return {
                        options: options.label,
                        rotated: options.rotated,
                        type: type,
                        isFullStacked: options.series.isFullStackedSeries(),
                        isRange: options.type.indexOf("range") !== -1
                    }
            },
            _createLabel: function() {
                this._label = core.CoreFactory.createLabel(this._options.type)
            },
            _updateLabelData: function() {
                this._label.updateData({
                    formatObject: this._getLabelFormatObject(),
                    initialValue: this.initialValue
                })
            },
            _updateLabelOptions: function(type) {
                !this._label && this._createLabel();
                this._label.setOptions(this._getLabelOptions(type))
            },
            _checkImage: function(image) {
                return _isDefined(image) && (typeof image === "string" || _isDefined(image.url))
            },
            _fillStyle: function() {
                this._styles = this._options.styles
            },
            _checkSymbol: function(oldOptions, newOptions) {
                var oldSymbol = oldOptions.symbol,
                    newSymbol = newOptions.symbol,
                    symbolChanged = oldSymbol === "circle" && newSymbol !== "circle" || oldSymbol !== "circle" && newSymbol === "circle",
                    imageChanged = this._checkImage(oldOptions.image) !== this._checkImage(newOptions.image);
                if (symbolChanged || imageChanged)
                    return true;
                return false
            },
            _getSquareMarkerCoords: function(radius) {
                return [{
                            x: -radius,
                            y: -radius
                        }, {
                            x: radius,
                            y: -radius
                        }, {
                            x: radius,
                            y: radius
                        }, {
                            x: -radius,
                            y: radius
                        }, {
                            x: -radius,
                            y: -radius
                        }]
            },
            _getPolygonMarkerCoords: function(radius) {
                var r = _ceil(radius);
                return [{
                            x: -r,
                            y: 0
                        }, {
                            x: 0,
                            y: -r
                        }, {
                            x: r,
                            y: 0
                        }, {
                            x: 0,
                            y: r
                        }, {
                            x: -r,
                            y: 0
                        }]
            },
            _getTriangleMarkerCoords: function(radius) {
                return [{
                            x: -radius,
                            y: -radius
                        }, {
                            x: radius,
                            y: -radius
                        }, {
                            x: 0,
                            y: radius
                        }, {
                            x: -radius,
                            y: -radius
                        }]
            },
            _getCrossMarkerCoords: function(radius) {
                var r = _ceil(radius),
                    floorHalfRadius = _floor(r / 2),
                    ceilHalfRadius = _ceil(r / 2);
                return [{
                            x: -r,
                            y: -floorHalfRadius
                        }, {
                            x: -floorHalfRadius,
                            y: -r
                        }, {
                            x: 0,
                            y: -ceilHalfRadius
                        }, {
                            x: floorHalfRadius,
                            y: -r
                        }, {
                            x: r,
                            y: -floorHalfRadius
                        }, {
                            x: ceilHalfRadius,
                            y: 0
                        }, {
                            x: r,
                            y: floorHalfRadius
                        }, {
                            x: floorHalfRadius,
                            y: r
                        }, {
                            x: 0,
                            y: ceilHalfRadius
                        }, {
                            x: -floorHalfRadius,
                            y: r
                        }, {
                            x: -r,
                            y: floorHalfRadius
                        }, {
                            x: -ceilHalfRadius,
                            y: 0
                        }]
            },
            _populatePointShape: function(symbol, radius) {
                switch (symbol) {
                    case"square":
                        return this._getSquareMarkerCoords(radius);
                    case"polygon":
                        return this._getPolygonMarkerCoords(radius);
                    case"triangle":
                        return this._getTriangleMarkerCoords(radius);
                    case"cross":
                        return this._getCrossMarkerCoords(radius)
                }
            },
            correctValue: function(correction) {
                if (this.hasValue()) {
                    this.value = this.initialValue + correction;
                    this.minValue = correction;
                    this.translate()
                }
            },
            resetCorrection: function() {
                this.value = this.initialValue;
                this.minValue = CANVAS_POSITION_DEFAULT
            },
            _getTranslates: function(animationEnabled) {
                var translateX,
                    translateY;
                translateX = this.x;
                translateY = this.y;
                if (animationEnabled)
                    if (this._options.rotated)
                        translateX = this.defaultX;
                    else
                        translateY = this.defaultY;
                return {
                        x: translateX,
                        y: translateY
                    }
            },
            _createImageMarker: function(renderer, settings, options) {
                var url,
                    width,
                    height,
                    offsetY,
                    attr = {
                        location: "center",
                        translateX: settings.attr.translateX,
                        translateY: settings.attr.translateY,
                        visibility: settings.attr.visibility
                    };
                url = options.url ? options.url.toString() : options.toString();
                width = options.width || DEFAULT_IMAGE_WIDTH;
                height = options.height || DEFAULT_IMAGE_HEIGHT;
                return renderer.createImage(-_round(width * 0.5), -_round(height * 0.5), width, height, url, attr)
            },
            _createSymbolMarker: function(renderer, pointSettings, animationEnabled) {
                var marker,
                    options = this._options;
                switch (options.symbol) {
                    case"circle":
                        marker = renderer.createCircle(0, 0, pointSettings.r, pointSettings.attr);
                        break;
                    case"square":
                    case"polygon":
                    case"triangle":
                    case"cross":
                        marker = renderer.createArea(pointSettings.points, pointSettings.attr);
                        break
                }
                return marker
            },
            _createMarker: function(renderer, group, image, settings, animationEnabled) {
                var marker = this._checkImage(image) ? this._createImageMarker(renderer, settings, image) : this._createSymbolMarker(renderer, settings, animationEnabled);
                marker && marker.append(group);
                return marker
            },
            _getSymbolBbox: function(x, y, r) {
                var bbox = {};
                bbox.x = x - r;
                bbox.y = y - r;
                bbox.width = bbox.height = r * 2;
                return bbox
            },
            _getImageBbox: function(x, y) {
                var bbox = {},
                    image = this._options.image,
                    width = image.width || DEFAULT_IMAGE_WIDTH,
                    height = image.height || DEFAULT_IMAGE_HEIGHT;
                bbox.x = x - _round(width / 2);
                bbox.y = y - _round(height / 2);
                bbox.width = width;
                bbox.height = height;
                return bbox
            },
            _getGraphicBbox: function() {
                var options = this._options,
                    x = this.x,
                    y = this.y,
                    bbox;
                if (options.visible)
                    bbox = this._checkImage(options.image) ? this._getImageBbox(x, y) : this._getSymbolBbox(x, y, options.styles.normal.r);
                else
                    bbox = {
                        x: x,
                        y: y,
                        width: 0,
                        height: 0
                    };
                return bbox
            },
            _drawLabel: function(renderer, group) {
                var that = this,
                    customVisibility = that._getCustomLabelVisibility(),
                    visibleArea,
                    translators = that.translators;
                if ((that._options.series.getLabelVisibility() || customVisibility) && that.hasValue()) {
                    if (translators)
                        visibleArea = {
                            minX: translators.x.getCanvasVisibleArea().min,
                            maxX: translators.x.getCanvasVisibleArea().max,
                            minY: translators.y.getCanvasVisibleArea().min,
                            maxY: translators.y.getCanvasVisibleArea().max
                        };
                    that._label.setCoords({
                        x: that.x,
                        y: that.y
                    }, that._getGraphicBbox(), that._getLabelPosition(), visibleArea);
                    that._label.draw(renderer, group, customVisibility)
                }
                else
                    that._label.hide()
            },
            _drawMarker: function(renderer, group, animationEnabled) {
                var that = this,
                    options = that._options,
                    translates = that._getTranslates(animationEnabled),
                    marker,
                    style = that._getStyle(),
                    pointAttributes = _extend({
                        translateX: translates.x,
                        translateY: translates.y
                    }, style),
                    pointSettings = {
                        attr: pointAttributes,
                        points: that._populatePointShape(options.symbol, style.r),
                        r: style.r
                    };
                marker = that._createMarker(renderer, group, options.image, pointSettings, animationEnabled);
                that.graphic = marker
            },
            _drawTrackerMarker: function(renderer, group) {
                var radius = this._options.trackerR || this.storeTrackerR();
                this.trackerGraphic = renderer.createCircle(this.x, this.y, radius).append(group);
                this.trackerGraphic.data({point: this})
            },
            getTooltipCoords: function() {
                var coords;
                if (this.graphic)
                    coords = {
                        x: this.x,
                        y: this.y,
                        offset: this.graphic.getBBox().height / 2
                    };
                else
                    coords = {
                        x: this.x,
                        y: this.y,
                        offset: 0
                    };
                return coords
            },
            hasValue: function() {
                return this.value !== null && this.minValue !== null
            },
            setPercentValue: function(total) {
                var valuePercent = this.value / total || 0,
                    percent = valuePercent,
                    minValuePercent = this.minValue / total || 0;
                percent -= _isNumber(this.minValue) ? minValuePercent : 0;
                this._label.setDataField("percent", percent);
                this._label.setDataField("total", total);
                if (this._options.series.isFullStackedSeries() && this.hasValue()) {
                    this.value = valuePercent;
                    this.minValue = !minValuePercent ? this.minValue : minValuePercent;
                    this.translate()
                }
            },
            storeTrackerR: function() {
                var navigator = window.navigator,
                    r = this._options.styles.normal.r,
                    minTrackerSize;
                navigator = this.__debug_navigator || navigator;
                this.__debug_browserNavigator = navigator;
                minTrackerSize = "ontouchstart" in window || navigator.msPointerEnabled && navigator.msMaxTouchPoints || navigator.pointerEnabled && navigator.maxTouchPoints ? 20 : 6;
                this._options.trackerR = r < minTrackerSize ? minTrackerSize : r;
                return this._options.trackerR
            },
            _translate: function(translators) {
                var that = this,
                    mainAxis = that._options.rotated ? "x" : "y",
                    upperMainAxis = mainAxis.toUpperCase(),
                    mainTranslator = translators[mainAxis],
                    axis = that._options.rotated ? "y" : "x";
                that[mainAxis] = mainTranslator.translate(that.value);
                that[axis] = translators[axis].translate(that.argument);
                that["min" + upperMainAxis] = mainTranslator.translate(that.minValue);
                that["default" + upperMainAxis] = mainTranslator.translate(CANVAS_POSITION_DEFAULT);
                that._calculateVisibility(that.x, that.y);
                that._prepareStatesOptions()
            },
            _changeData: function(data) {
                this.value = this.initialValue = this.originalValue = data.value;
                this.argument = this.initialArgument = this.originalArgument = data.argument;
                this.minValue = this.initialMinValue = this.originalMinValue = _isDefined(data.minValue) ? data.minValue : CANVAS_POSITION_DEFAULT;
                this.tag = data.tag;
                this.index = data.index
            },
            _updateData: function(data) {
                if (this.argument !== data.argument || this.value !== data.value || this.tag !== data.tag)
                    this._changeData(data)
            },
            _getImageSettings: function(image) {
                return {
                        href: image.url || image.toString(),
                        width: image.width || DEFAULT_IMAGE_WIDTH,
                        height: image.height || DEFAULT_IMAGE_HEIGHT
                    }
            },
            _updateMarker: function(animationEnabled, style) {
                var that = this,
                    options = that._options,
                    style = style || this._getStyle(),
                    settings,
                    image = options.image;
                if (that._checkImage(image))
                    settings = _extend({}, {visibility: style.visibility}, that._getImageSettings(image));
                else
                    settings = _extend({}, style, {points: that._populatePointShape(options.symbol, style.r)});
                if (!animationEnabled) {
                    settings.translateX = that.x;
                    settings.translateY = that.y
                }
                that.graphic.applySettings(settings)
            },
            _updateTracker: function() {
                this.trackerGraphic.applySettings({
                    cx: this.x,
                    cy: this.y,
                    r: this.storeTrackerR()
                })
            },
            _getLabelFormatObject: function() {
                return {
                        argument: this.initialArgument,
                        value: this.initialValue,
                        originalArgument: this.originalArgument,
                        originalValue: this.originalValue,
                        seriesName: this._options.series.name,
                        point: this
                    }
            },
            _getLabelPosition: function() {
                if (this._options.series.isFullStackedSeries() || this.initialValue > 0)
                    return "top";
                else
                    return "bottom"
            },
            _getFormatObject: function(tooltip) {
                var labelFormatObject = this._label.getData(),
                    valueObject = {
                        argumentText: tooltip.formatValue(this.initialArgument, "argument"),
                        valueText: tooltip.formatValue(this.initialValue)
                    },
                    percentObject = _isDefined(labelFormatObject.percent) ? {percentText: tooltip.formatValue(labelFormatObject.percent, "percent")} : {},
                    totalObject = _isDefined(labelFormatObject.total) ? {totalText: tooltip.formatValue(labelFormatObject.total)} : {};
                return _extend({}, labelFormatObject, valueObject, percentObject, totalObject)
            }
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file barPoint.js */
    (function($, DX) {
        var viz = DevExpress.viz,
            points = viz.core.series.points.mixins,
            _extend = $.extend,
            _math = Math,
            _round = _math.round,
            _abs = _math.abs,
            _min = _math.min,
            CANVAS_POSITION_DEFAULT = "canvas_position_default",
            DEFAULT_BAR_TRACKER_SIZE = 9,
            CORRECTING_BAR_TRACKER_VALUE = 4;
        points.barPoint = _extend({}, points.symbolPoint, {
            correctCoordinates: function(correctOptions) {
                var correction = correctOptions.offset - _round(correctOptions.width / 2),
                    rotated = this._options.rotated,
                    valueSelector = rotated ? "height" : "width",
                    correctionSelector = (rotated ? "y" : "x") + "Correction";
                this[valueSelector] = correctOptions.width;
                this[correctionSelector] = correction
            },
            _getGraphicBbox: function() {
                var bbox = {};
                bbox.x = this.x;
                bbox.y = this.y;
                bbox.width = this.width;
                bbox.height = this.height;
                return bbox
            },
            _getLabelPosition: function() {
                var position,
                    invertX = this.translators.x.getBusinessRange().invert,
                    invertY = this.translators.y.getBusinessRange().invert,
                    isDiscreteValue = this.series.valueAxisType === "discrete",
                    isFullStacked = this.series.isFullStackedSeries(),
                    notVerticalInverted = !isDiscreteValue && (this.initialValue >= 0 && !invertY || this.initialValue < 0 && invertY) || isDiscreteValue && !invertY || isFullStacked,
                    notHorizontalInverted = !isDiscreteValue && (this.initialValue >= 0 && !invertX || this.initialValue < 0 && invertX) || isDiscreteValue && !invertX || isFullStacked;
                if (!this._options.rotated)
                    position = notVerticalInverted ? "top" : "bottom";
                else
                    position = notHorizontalInverted ? "top" : "bottom";
                return position
            },
            _drawLabel: function(renderer, group) {
                var that = this,
                    options = that._options,
                    coords,
                    commonVisibility = options.series.getLabelVisibility(),
                    customVisibility = that._getCustomLabelVisibility(),
                    visibleArea,
                    translators = that.translators;
                if (that.hasValue() && (options.label.showForZeroValues || that.initialValue) && (customVisibility || commonVisibility)) {
                    coords = {
                        x: that.x,
                        y: that.y,
                        defaultX: that.defaultX,
                        defaultY: that.defaultY
                    };
                    if (translators)
                        visibleArea = {
                            minX: translators.x.getCanvasVisibleArea().min,
                            maxX: translators.x.getCanvasVisibleArea().max,
                            minY: translators.y.getCanvasVisibleArea().min,
                            maxY: translators.y.getCanvasVisibleArea().max
                        };
                    that._label.setCoords(coords, that._getGraphicBbox(), that._getLabelPosition(), visibleArea);
                    that._label.draw(renderer, group, customVisibility)
                }
                else
                    that._label.hide()
            },
            _drawMarker: function(renderer, group, animationEnabled) {
                var style = this._getStyle(),
                    x = this.x,
                    y = this.y,
                    width = this.width,
                    height = this.height;
                if (animationEnabled)
                    if (this._options.rotated) {
                        width = 0;
                        x = this.defaultX
                    }
                    else {
                        height = 0;
                        y = this.defaultY
                    }
                this.graphic = renderer.createRect(x, y, width, height, this._options.cornerRadius, style).append(group)
            },
            _getSettingsForTracker: function() {
                var that = this,
                    y = that.y,
                    height = that.height,
                    x = that.x,
                    width = that.width;
                if (that._options.rotated) {
                    if (width === 1) {
                        width = DEFAULT_BAR_TRACKER_SIZE;
                        x -= CORRECTING_BAR_TRACKER_VALUE
                    }
                }
                else if (height === 1) {
                    height = DEFAULT_BAR_TRACKER_SIZE;
                    y -= CORRECTING_BAR_TRACKER_VALUE
                }
                return {
                        x: x,
                        y: y,
                        width: width,
                        height: height
                    }
            },
            _drawTrackerMarker: function(renderer, group) {
                var settings = this._getSettingsForTracker();
                this.trackerGraphic = renderer.createRect(settings.x, settings.y, settings.width, settings.height, this._options.cornerRadius).append(group);
                this.trackerGraphic.data({point: this})
            },
            getGraphicSettings: function() {
                return {
                        x: this.graphic.settings.x || 0,
                        y: this.graphic.settings.y || 0,
                        height: this.graphic.settings.height || 0,
                        width: this.graphic.settings.width || 0
                    }
            },
            getTooltipCoords: function() {
                var x = this.x + this.width / 2,
                    y = this.y + this.height / 2;
                return {
                        x: x,
                        y: y,
                        offset: 0
                    }
            },
            _truncateCoord: function(coord, minBounce, maxBounce) {
                if (coord < minBounce)
                    return minBounce;
                if (coord > maxBounce)
                    return maxBounce;
                return coord
            },
            _translate: function(translators) {
                var that = this,
                    rotated = that._options.rotated,
                    valAxis = rotated ? "x" : "y",
                    argAxis = rotated ? "y" : "x",
                    valIntervalName = rotated ? "width" : "height",
                    argIntervalName = rotated ? "height" : "width",
                    argTranslator = translators[argAxis],
                    valTranslator = translators[valAxis],
                    argVisibleArea = argTranslator.getCanvasVisibleArea(),
                    valVisibleArea = valTranslator.getCanvasVisibleArea(),
                    arg,
                    minArg,
                    val,
                    minVal;
                arg = minArg = argTranslator.translate(that.argument) + (that[argAxis + "Correction"] || 0);
                val = valTranslator.translate(that.value);
                minVal = valTranslator.translate(that.minValue);
                that[valIntervalName] = _abs(val - minVal);
                that._calculateVisibility(rotated ? _min(val, minVal) : _min(arg, minArg), rotated ? _min(arg, minArg) : _min(val, minVal), that.width, that.height);
                val = that._truncateCoord(val, valVisibleArea.min, valVisibleArea.max);
                minVal = that._truncateCoord(minVal, valVisibleArea.min, valVisibleArea.max);
                that[argAxis] = arg;
                that["min" + argAxis.toUpperCase()] = minArg;
                that[valIntervalName] = _abs(val - minVal);
                that[valAxis] = _min(val, minVal) + (that[valAxis + "Correction"] || 0);
                that["min" + valAxis.toUpperCase()] = minVal + (that[valAxis + "Correction"] || 0);
                that["default" + valAxis.toUpperCase()] = valTranslator.translate(CANVAS_POSITION_DEFAULT);
                if (that.inVisibleArea) {
                    if (that[argAxis] < argVisibleArea.min) {
                        that[argIntervalName] = that[argIntervalName] - (argVisibleArea.min - that[argAxis]);
                        that[argAxis] = argVisibleArea.min;
                        that["min" + argAxis.toUpperCase()] = argVisibleArea.min
                    }
                    if (that[argAxis] + that[argIntervalName] > argVisibleArea.max)
                        that[argIntervalName] = argVisibleArea.max - that[argAxis]
                }
            },
            _updateMarker: function(animationEnabled, style) {
                var style = style || this._getStyle(),
                    attributes = _extend({}, style);
                if (!animationEnabled) {
                    attributes.x = this.x;
                    attributes.y = this.y;
                    attributes.width = this.width;
                    attributes.height = this.height
                }
                else
                    attributes.sharpEdges = false;
                this.graphic.applySettings(attributes)
            },
            _updateTracker: function() {
                this.trackerGraphic.applySettings(this._getSettingsForTracker())
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file bubblePoint.js */
    (function($, DX) {
        var viz = DX.viz,
            points = viz.core.series.points.mixins,
            _extend = $.extend,
            MIN_BUBBLE_HEIGHT = 20;
        points.bubblePoint = _extend({}, points.symbolPoint, {
            correctCoordinates: function(diameter) {
                this.bubbleSize = diameter / 2
            },
            _drawMarker: function(renderer, group, animationEnabled) {
                var style = this._getStyle(),
                    attr = _extend({
                        translateX: this.x,
                        translateY: this.y
                    }, style),
                    marker = renderer.createCircle(0, 0, animationEnabled ? 0 : this.bubbleSize, attr).append(group);
                this.graphic = marker
            },
            _drawTrackerMarker: function(renderer, group) {
                this.trackerGraphic = renderer.createCircle(this.x, this.y, this.bubbleSize).append(group);
                this.trackerGraphic.data({point: this})
            },
            getTooltipCoords: function() {
                if (this.graphic) {
                    var height = this.graphic.getBBox().height;
                    return {
                            x: this.x,
                            y: this.y,
                            offset: height < MIN_BUBBLE_HEIGHT ? height / 2 : 0
                        }
                }
            },
            _getLabelFormatObject: function() {
                var symbolMethods = points.symbolPoint,
                    formatObject = symbolMethods._getLabelFormatObject.call(this);
                formatObject.size = this.initialSize;
                return formatObject
            },
            _updateData: function(data) {
                var symbolMethods = points.symbolPoint;
                if (this.argument !== data.argument || this.value !== data.value || this.size !== data.size || this.tag !== data.tag) {
                    symbolMethods._changeData.call(this, data);
                    this.size = this.initialSize = data.size
                }
            },
            _getGraphicBbox: function() {
                return this._getSymbolBbox(this.x, this.y, this.bubbleSize)
            },
            _updateMarker: function(animationEnabled, style) {
                var style = style || this._getStyle();
                if (!animationEnabled)
                    style = $.extend({
                        r: this.bubbleSize,
                        translateX: this.x,
                        translateY: this.y
                    }, style);
                this.graphic.applySettings(style)
            },
            _updateTracker: function() {
                this.trackerGraphic.applySettings({
                    cx: this.x,
                    cy: this.y,
                    r: this.bubbleSize
                })
            },
            _getFormatObject: function(tooltip) {
                var symbolMethods = points.symbolPoint,
                    formatObject = symbolMethods._getFormatObject.call(this, tooltip);
                formatObject.sizeText = tooltip.formatValue(this.initialSize);
                return formatObject
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file piePoint.js */
    (function($, DX) {
        var viz = DevExpress.viz,
            points = viz.core.series.points.mixins,
            _extend = $.extend,
            _round = Math.round,
            _getCosAndSin = DX.utils.getCosAndSin;
        points.piePoint = _extend({}, points.symbolPoint, {
            _populatePointShape: function(target, deltaRadius) {
                var angleFunctions = _getCosAndSin(point.middleAngle);
                target.x = point.centerX - ~~(deltaRadius * angleFunctions.cos);
                target.y = point.centerY + ~~(deltaRadius * angleFunctions.sin);
                target.outerRadius = this.radiusOuter + deltaRadius;
                target.innerRadius = this.radiusInner;
                target.startAngle = this.toAngle;
                target.endAngle = this.fromAngle
            },
            _changeData: function(data) {
                var that = this;
                that.value = that.initialValue = that.originalValue = data.value;
                that.argument = that.initialArgument = that.originalArgument = data.argument;
                that.minValue = that.initialMinValue = that.originalMinValue = DevExpress.utils.isDefined(data.minValue) ? data.minValue : 0;
                that.tag = data.tag;
                that._visible = true;
                that.index = data.index
            },
            animate: function(complete, duration, step) {
                this.graphic.animate({
                    x: this.centerX,
                    y: this.centerY,
                    outerRadius: this.radiusOuter,
                    innerRadius: this.radiusInner,
                    startAngle: this.toAngle,
                    endAngle: this.fromAngle
                }, {
                    partitionDuration: duration,
                    step: step
                }, complete)
            },
            correctPosition: function(correction) {
                this.radiusInner = correction.radiusInner;
                this.radiusOuter = correction.radiusOuter;
                this.centerX = correction.centerX;
                this.centerY = correction.centerY
            },
            correctValue: function(correction, percent, base) {
                this.value = (base || this.initialValue) + correction;
                this.minValue = correction;
                this.percent = percent;
                this._label.setDataField("percent", percent)
            },
            _getLabelOptions: function() {
                var options = this._options,
                    series = options.series,
                    seriesStyle = this._options.styles.normal,
                    borderWidth = series._options.containerBackgroundColor === seriesStyle.stroke ? _round(seriesStyle.strokeWidth / 2) : _round(-seriesStyle.strokeWidth / 2);
                return {
                        options: options.label,
                        borderWidth: borderWidth
                    }
            },
            _updateLabelData: function() {
                this._label.updateData({formatObject: this._getLabelFormatObject()})
            },
            _updateLabelOptions: function() {
                !this._label && this._createLabel();
                this._label.setOptions(this._getLabelOptions())
            },
            _drawLabel: function(renderer, group) {
                var commonVisibility = this._options.series.getLabelVisibility(),
                    customVisibility = this._getCustomLabelVisibility();
                if ((commonVisibility || customVisibility) && this.hasValue()) {
                    this._label.setCoords({
                        middleAngle: this.middleAngle,
                        radiusOuter: this.radiusOuter,
                        centerX: this.centerX,
                        centerY: this.centerY
                    }, this._options.series.canvas);
                    this._label.draw(renderer, group, customVisibility)
                }
                else
                    this._label.hide()
            },
            _drawMarker: function(renderer, group, animationEnabled, firstDrawing) {
                var styles = this._getStyle(),
                    radiusOuter = this.radiusOuter,
                    radiusInner = this.radiusInner,
                    fromAngle = this.fromAngle,
                    toAngle = this.toAngle;
                if (animationEnabled) {
                    radiusInner = radiusOuter = 0;
                    if (!firstDrawing)
                        fromAngle = toAngle = this.shiftedAngle
                }
                this.graphic = renderer.createArc(this.centerX, this.centerY, radiusOuter, radiusInner, toAngle, fromAngle, styles).append(group)
            },
            _drawTrackerMarker: function(renderer, group) {
                this.trackerGraphic = renderer.createArc(this.centerX, this.centerY, this.radiusOuter, this.radiusInner, this.toAngle, this.fromAngle).append(group);
                this.trackerGraphic.data({point: this})
            },
            getTooltipCoords: function() {
                var angleFunctions = _getCosAndSin(this.middleAngle);
                return {
                        x: this.centerX + (this.radiusInner + (this.radiusOuter - this.radiusInner) / 2) * angleFunctions.cos,
                        y: this.centerY - (this.radiusInner + (this.radiusOuter - this.radiusInner) / 2) * angleFunctions.sin,
                        offset: 0
                    }
            },
            _translate: function(translator) {
                var angle = this.shiftedAngle || 0;
                this.fromAngle = translator.translate(this.minValue) + angle;
                this.toAngle = translator.translate(this.value) + angle;
                this.middleAngle = translator.translate((this.value - this.minValue) / 2 + this.minValue) + angle;
                if (!this.isVisible())
                    this.middleAngle = this.toAngle = this.fromAngle = this.fromAngle || angle
            },
            _updateMarker: function(animationEnabled, style) {
                style = style || this._getStyle();
                if (!animationEnabled)
                    style = _extend({
                        x: this.centerX,
                        y: this.centerY,
                        outerRadius: this.radiusOuter,
                        innerRadius: this.radiusInner,
                        startAngle: this.toAngle,
                        endAngle: this.fromAngle
                    }, style);
                this.graphic.applySettings(style)
            },
            _updateTracker: function() {
                this.trackerGraphic.applySettings({
                    x: this.centerX,
                    y: this.centerY,
                    outerRadius: this.radiusOuter,
                    innerRadius: this.radiusInner,
                    startAngle: this.toAngle,
                    endAngle: this.fromAngle
                })
            },
            getLegendStyles: function() {
                return this._styles.legendStyles
            },
            isInVisibleArea: function() {
                return true
            },
            hide: function() {
                if (this._visible) {
                    this._visible = false;
                    this.hideTooltip();
                    this._options.visibilityChanged(this)
                }
            },
            show: function() {
                if (!this._visible) {
                    this._visible = true;
                    this._options.visibilityChanged(this)
                }
            },
            setInvisibility: function() {
                this._setTrackerInvisibility();
                this._label.hide()
            },
            isVisible: function() {
                return this._visible
            },
            _getFormatObject: function(tooltip) {
                var symbolMethods = points.symbolPoint,
                    formatObject = symbolMethods._getFormatObject.call(this, tooltip);
                formatObject.percent = this.percent;
                formatObject.percentText = tooltip.formatValue(this.percent, "percent");
                return formatObject
            },
            getColor: function() {
                return this._styles.normal.fill
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file rangeSymbolPoint.js */
    (function($, DX) {
        var viz = DevExpress.viz,
            points = viz.core.series.points.mixins,
            _extend = $.extend,
            _isDefined = DX.utils.isDefined,
            _math = Math,
            _abs = _math.abs,
            _min = _math.min,
            _max = _math.max,
            _round = _math.round,
            DEFAULT_IMAGE_WIDTH = 20,
            DEFAULT_IMAGE_HEIGHT = 20;
        points.rangeSymbolPoint = _extend({}, points.symbolPoint, {
            deleteLabel: function() {
                this._topLabel.dispose();
                this._topLabel = null;
                this._bottomLabel.dispose();
                this._bottomLabel = null
            },
            hideMarker: function(type) {
                var marker = this.graphic && this.graphic[type + "Marker"],
                    label = this["_" + type + "Label"];
                if (marker && marker.settings.visibility !== "hidden")
                    marker.applySettings({visibility: "hidden"});
                label.hide()
            },
            setInvisibility: function() {
                this.hideMarker("top");
                this.hideMarker("bottom");
                this._setTrackerInvisibility()
            },
            clearVisibility: function() {
                var graphic = this.graphic;
                if (graphic) {
                    if (graphic.topMarker && graphic.topMarker.settings.visibility)
                        graphic.topMarker.applySettings({visibility: null});
                    if (graphic.bottomMarker && graphic.bottomMarker.settings.visibility)
                        graphic.bottomMarker.applySettings({visibility: null})
                }
                this._clearTrackerVisibility();
                this._topLabel.clearVisibility();
                this._bottomLabel.clearVisibility()
            },
            clearMarker: function() {
                if (this.graphic) {
                    this.graphic.topMarker && this.graphic.topMarker.applySettings(this._emptySettings);
                    this.graphic.bottomMarker && this.graphic.bottomMarker.applySettings(this._emptySettings)
                }
            },
            _getLabelPosition: function(markerType) {
                var position,
                    rotated = this._options.rotated,
                    invertY = this.translators.y.getBusinessRange().invert,
                    invertX = this.translators.x.getBusinessRange().invert,
                    isDiscreteValue = this._options.series._options.valueAxisType === "discrete",
                    notInverted = isDiscreteValue && (!invertY && !rotated || invertX && rotated) || !isDiscreteValue && this.value > this.minValue && (!invertY && !rotated || !invertX && rotated);
                if (markerType === "top")
                    position = notInverted ? "top" : "bottom";
                else
                    position = notInverted ? "bottom" : "top";
                return position
            },
            _getLabelMinFormatObject: function() {
                return {
                        index: 0,
                        argument: this.initialArgument,
                        value: this.initialMinValue,
                        seriesName: this._options.series.name,
                        originalValue: this.originalMinValue,
                        originalArgument: this.originalArgument,
                        point: this
                    }
            },
            _updateLabelData: function() {
                var maxFormatObject = this._getLabelFormatObject();
                maxFormatObject.index = 1;
                this._topLabel.updateData({
                    formatObject: maxFormatObject,
                    initialValue: this.initialValue
                });
                this._bottomLabel.updateData({
                    formatObject: this._getLabelMinFormatObject(),
                    initialValue: this.initialMinValue
                })
            },
            _updateLabelOptions: function(type) {
                var options = this._getLabelOptions(type);
                (!this._topLabel || !this._bottomLabel) && this._createLabel();
                this._topLabel.setOptions(options);
                this._bottomLabel.setOptions(options)
            },
            setAdjustSeriesLabels: function(adjustSeriesLabels) {
                this._topLabel.adjustSeriesLabels = adjustSeriesLabels;
                this._bottomLabel.adjustSeriesLabels = adjustSeriesLabels
            },
            _createLabel: function() {
                this._topLabel = viz.core.CoreFactory.createLabel();
                this._bottomLabel = viz.core.CoreFactory.createLabel()
            },
            _getLabelCoords: function(location) {
                var coords = {},
                    isTop = location === "top";
                if (!this._options.rotated) {
                    coords.x = this.x;
                    coords.y = isTop ? _min(this.y, this.minY) : _max(this.y, this.minY)
                }
                else {
                    coords.x = isTop ? _max(this.x, this.minX) : _min(this.x, this.minX);
                    coords.y = this.y
                }
                return coords
            },
            _getGraphicBbox: function(location) {
                var options = this._options,
                    rotated = options.rotated,
                    isTop = location === "top",
                    images = this._getImage(options.image),
                    image = isTop ? this._checkImage(images.top) : this._checkImage(images.bottom),
                    bbox,
                    x,
                    y;
                if (!rotated) {
                    x = this.x;
                    y = isTop ? _min(this.y, this.minY) : _max(this.y, this.minY)
                }
                else {
                    x = isTop ? _max(this.x, this.minX) : _min(this.x, this.minX);
                    y = this.y
                }
                if (options.visible)
                    bbox = image ? this._getImageBbox(x, y) : this._getSymbolBbox(x, y, options.styles.normal.r);
                else
                    bbox = {
                        x: x,
                        y: y,
                        width: 0,
                        height: 0
                    };
                return bbox
            },
            _checkOverlay: function(bottomCoord, topCoord, topValue) {
                return bottomCoord < topCoord + topValue
            },
            _getOverlayCorrections: function(type, topCoords, bottomCoords) {
                var isVertical = type === "vertical",
                    coordSelector = isVertical ? "y" : "x",
                    valueSelector = isVertical ? "height" : "width",
                    visibleArea = this.translators[coordSelector].getCanvasVisibleArea(),
                    minBound = visibleArea.min,
                    maxBound = visibleArea.max,
                    delta = _round((topCoords[coordSelector] + topCoords[valueSelector] - bottomCoords[coordSelector]) / 2),
                    coord1 = topCoords[coordSelector] - delta,
                    coord2 = bottomCoords[coordSelector] + delta;
                if (coord1 < minBound) {
                    delta = minBound - topCoords[coordSelector];
                    coord1 += delta;
                    coord2 += delta
                }
                else if (coord2 + bottomCoords[valueSelector] > maxBound) {
                    delta = -(bottomCoords[coordSelector] + bottomCoords[valueSelector] - maxBound);
                    coord1 += delta;
                    coord2 += delta
                }
                return {
                        coord1: coord1,
                        coord2: coord2
                    }
            },
            _checkLabelsOverlay: function(topLocation) {
                var that = this,
                    topCoords = that._topLabel.getCoords(),
                    bottomCoords = that._bottomLabel.getCoords(),
                    corrections = {};
                if (!that._options.rotated) {
                    if (topLocation === "top") {
                        if (this._checkOverlay(bottomCoords.y, topCoords.y, topCoords.height)) {
                            corrections = this._getOverlayCorrections("vertical", topCoords, bottomCoords);
                            that._topLabel.updatePosition(undefined, corrections.coord1);
                            that._bottomLabel.updatePosition(undefined, corrections.coord2)
                        }
                    }
                    else if (this._checkOverlay(topCoords.y, bottomCoords.y, bottomCoords.height)) {
                        corrections = this._getOverlayCorrections("vertical", bottomCoords, topCoords);
                        that._topLabel.updatePosition(undefined, corrections.coord2);
                        that._bottomLabel.updatePosition(undefined, corrections.coord1)
                    }
                }
                else if (topLocation === "top") {
                    if (this._checkOverlay(topCoords.x, bottomCoords.x, bottomCoords.width)) {
                        corrections = this._getOverlayCorrections("horizontal", bottomCoords, topCoords);
                        that._topLabel.updatePosition(corrections.coord2);
                        that._bottomLabel.updatePosition(corrections.coord1)
                    }
                }
                else if (this._checkOverlay(bottomCoords.x, topCoords.x, topCoords.width)) {
                    corrections = this._getOverlayCorrections("horizontal", topCoords, bottomCoords);
                    that._topLabel.updatePosition(corrections.coord1);
                    that._bottomLabel.updatePosition(corrections.coord2)
                }
            },
            _drawLabel: function(renderer, group) {
                var topCoords,
                    bottomCoords,
                    rotated = this._options.rotated,
                    topLocation = this._getLabelPosition("top"),
                    bottomLocation = this._getLabelPosition("bottom"),
                    isInside = this._options.label.position === "inside",
                    topPosition = isInside ? bottomLocation : topLocation,
                    bottomPosition = isInside ? topLocation : bottomLocation,
                    translators = this.translators,
                    visibleArea,
                    customVisibility = this._getCustomLabelVisibility(),
                    commonVisibility = this._options.series.getLabelVisibility();
                if ((commonVisibility || customVisibility) && this.hasValue()) {
                    if (translators)
                        visibleArea = {
                            minX: translators.x.getCanvasVisibleArea().min,
                            maxX: translators.x.getCanvasVisibleArea().max,
                            minY: translators.y.getCanvasVisibleArea().min,
                            maxY: translators.y.getCanvasVisibleArea().max
                        };
                    this._topLabel.setCoords(this._getLabelCoords(topLocation), this._getGraphicBbox(topLocation), topPosition, visibleArea);
                    this._bottomLabel.setCoords(this._getLabelCoords(bottomLocation), this._getGraphicBbox(bottomLocation), bottomPosition, visibleArea);
                    this.visibleTopMarker && this._topLabel.draw(renderer, group, customVisibility);
                    this.visibleBottomMarker && this._bottomLabel.draw(renderer, group, customVisibility);
                    this._checkLabelsOverlay(topLocation)
                }
                else {
                    this._topLabel.hide();
                    this._bottomLabel.hide()
                }
            },
            _getImage: function(imageOption) {
                var image = {};
                if (_isDefined(imageOption))
                    if (typeof imageOption === "string")
                        image.top = image.bottom = imageOption;
                    else {
                        image.top = {
                            url: typeof imageOption.url === "string" ? imageOption.url : imageOption.url && imageOption.url.rangeMaxPoint,
                            width: typeof imageOption.width === "number" ? imageOption.width : imageOption.width && imageOption.width.rangeMaxPoint,
                            height: typeof imageOption.height === "number" ? imageOption.height : imageOption.height && imageOption.height.rangeMaxPoint
                        };
                        image.bottom = {
                            url: typeof imageOption.url === "string" ? imageOption.url : imageOption.url && imageOption.url.rangeMinPoint,
                            width: typeof imageOption.width === "number" ? imageOption.width : imageOption.width && imageOption.width.rangeMinPoint,
                            height: typeof imageOption.height === "number" ? imageOption.height : imageOption.height && imageOption.height.rangeMinPoint
                        }
                    }
                return image
            },
            _checkSymbol: function(oldOptions, newOptions) {
                var oldSymbol = oldOptions.symbol,
                    newSymbol = newOptions.symbol,
                    symbolChanged = oldSymbol === "circle" && newSymbol !== "circle" || oldSymbol !== "circle" && newSymbol === "circle",
                    oldImages = this._getImage(oldOptions.image),
                    newImages = this._getImage(newOptions.image),
                    topImageChanged = this._checkImage(oldImages.top) !== this._checkImage(newImages.top),
                    bottomImageChanged = this._checkImage(oldImages.bottom) !== this._checkImage(newImages.bottom);
                return symbolChanged || topImageChanged || bottomImageChanged
            },
            _getSettingsForTwoMarkers: function(style) {
                var that = this,
                    options = that._options,
                    settings = {},
                    x = options.rotated ? _min(that.x, that.minX) : that.x,
                    y = options.rotated ? that.y : _min(that.y, that.minY),
                    radius = style.r,
                    points = that._populatePointShape(options.symbol, radius);
                settings.top = {
                    r: radius,
                    points: points,
                    attr: _extend({
                        translateX: x + that.width,
                        translateY: y
                    }, style)
                };
                settings.bottom = {
                    r: radius,
                    points: points,
                    attr: _extend({
                        translateX: x,
                        translateY: y + that.height
                    }, style)
                };
                return settings
            },
            _hasGraphic: function() {
                return this.graphic && this.graphic.topMarker && this.graphic.bottomMarker
            },
            _drawOneMarker: function(renderer, markerType, imageSettings, settings) {
                if (this.graphic[markerType])
                    this._updateOneMarker(markerType, settings);
                else
                    this.graphic[markerType] = this._createMarker(renderer, this.graphic, imageSettings, settings)
            },
            _drawMarker: function(renderer, group, animationEnabled, style) {
                var that = this,
                    style = style || that._getStyle(),
                    settings = that._getSettingsForTwoMarkers(style),
                    image = that._getImage(that._options.image);
                if (that._checkImage(image.top))
                    settings.top = that._getImageSettings(settings.top, image.top);
                if (that._checkImage(image.bottom))
                    settings.bottom = that._getImageSettings(settings.bottom, image.bottom);
                that.graphic = that.graphic || renderer.createGroup().append(group);
                that.visibleTopMarker && that._drawOneMarker(renderer, 'topMarker', image.top, settings.top);
                that.visibleBottomMarker && that._drawOneMarker(renderer, 'bottomMarker', image.bottom, settings.bottom)
            },
            _getSettingsForTracker: function(radius) {
                var that = this,
                    options = that._options,
                    x = options.rotated ? _min(that.x, that.minX) - radius : that.x - radius,
                    y = options.rotated ? that.y - radius : _min(that.y, that.minY) - radius,
                    width = that.width + 2 * radius,
                    height = that.height + 2 * radius;
                return {
                        translateX: x,
                        translateY: y,
                        width: width,
                        height: height
                    }
            },
            _drawTrackerMarker: function(renderer, group) {
                var that = this,
                    options = that._options,
                    radius = options.trackerR || that.storeTrackerR(),
                    settings = that._getSettingsForTracker(radius),
                    attr = {
                        translateX: settings.translateX,
                        translateY: settings.translateY
                    };
                that.trackerGraphic = renderer.createRect(0, 0, settings.width, settings.height, 0, attr).append(group);
                that.trackerGraphic.data({point: that})
            },
            isInVisibleArea: function() {
                var that = this,
                    minArgument = _min(that.minX, that.x) || that.x,
                    maxArgument = _max(that.minX, that.x) || that.x,
                    maxValue = _max(that.minY, that.y) || that.y,
                    minValue = _min(that.minY, that.y) || that.y,
                    notVisibleBothMarkersRight,
                    notVisibleBothMarkersLeft,
                    notVisibleBothMarkersBottom,
                    notVisibleBothMarkersTop,
                    visibleTopMarker = true,
                    visibleBottomMarker = true,
                    visibleRangeArea = true,
                    visibleAreaX,
                    visibleAreaY;
                if (that.translators) {
                    visibleAreaX = that.translators.x.getCanvasVisibleArea();
                    visibleAreaY = that.translators.y.getCanvasVisibleArea();
                    notVisibleBothMarkersRight = visibleAreaX.max < minArgument && visibleAreaX.max < maxArgument;
                    notVisibleBothMarkersLeft = visibleAreaX.min > minArgument && visibleAreaX.min > maxArgument;
                    notVisibleBothMarkersTop = visibleAreaY.min > minValue && visibleAreaY.min > maxValue;
                    notVisibleBothMarkersBottom = visibleAreaY.max < minValue && visibleAreaY.max < maxValue;
                    if (notVisibleBothMarkersTop || notVisibleBothMarkersBottom || notVisibleBothMarkersRight || notVisibleBothMarkersLeft)
                        visibleTopMarker = visibleBottomMarker = visibleRangeArea = false;
                    else if (!that._options.rotated) {
                        visibleTopMarker = visibleAreaY.min < minValue && visibleAreaY.max > minValue;
                        visibleBottomMarker = visibleAreaY.min < maxValue && visibleAreaY.max > maxValue
                    }
                    else {
                        visibleBottomMarker = visibleAreaX.min < minArgument && visibleAreaX.max > minArgument;
                        visibleTopMarker = visibleAreaX.min < maxArgument && visibleAreaX.max > maxArgument
                    }
                }
                that.visibleTopMarker = visibleTopMarker;
                that.visibleBottomMarker = visibleBottomMarker;
                that.visibleRangeArea = visibleRangeArea;
                return visibleRangeArea
            },
            getTooltipCoords: function() {
                var that = this,
                    x,
                    y,
                    min,
                    max,
                    minValue,
                    visibleAreaX = that.translators.x.getCanvasVisibleArea(),
                    visibleAreaY = that.translators.y.getCanvasVisibleArea();
                if (!that._options.rotated) {
                    minValue = _min(that.y, that.minY);
                    x = that.x;
                    min = visibleAreaY.min > minValue ? visibleAreaY.min : minValue;
                    max = visibleAreaY.max < minValue + that.height ? visibleAreaY.max : minValue + that.height;
                    y = min + (max - min) / 2
                }
                else {
                    minValue = _min(that.x, that.minX);
                    y = that.y;
                    min = visibleAreaX.min > minValue ? visibleAreaX.min : minValue;
                    max = visibleAreaX.max < minValue + that.width ? visibleAreaX.max : minValue + that.width;
                    x = min + (max - min) / 2
                }
                return {
                        x: x,
                        y: y,
                        offset: 0
                    }
            },
            _translate: function(translators) {
                var symbolMethods = points.symbolPoint;
                this.minX = this.minY = translators.y.translate(this.minValue);
                symbolMethods._translate.call(this, translators);
                this.height = this._options.rotated ? 0 : _abs(this.minY - this.y);
                this.width = this._options.rotated ? _abs(this.x - this.minX) : 0
            },
            _updateData: function(data) {
                if (this.argument !== data.argument || this.value !== data.value || this.minValue !== data.minValue || this.tag !== data.tag) {
                    this._changeData(data);
                    this.minValue = this.initialMinValue = this.originalMinValue = data.minValue
                }
            },
            _getImageSettings: function(settings, image) {
                var x = settings.attr.translateX,
                    y = settings.attr.translateY;
                return {
                        href: image.url || image.toString(),
                        width: image.width || DEFAULT_IMAGE_WIDTH,
                        height: image.height || DEFAULT_IMAGE_HEIGHT,
                        attr: {
                            translateX: x,
                            translateY: y
                        }
                    }
            },
            _updateOneMarker: function(markerType, settings) {
                this.graphic && this.graphic[markerType] && this.graphic[markerType].applySettings(_extend({}, settings, settings.attr))
            },
            _updateMarker: function(animationEnabled, style) {
                this._drawMarker(undefined, undefined, undefined, style)
            },
            _updateTracker: function() {
                var radius = this.storeTrackerR(),
                    settings = this._getSettingsForTracker(radius);
                this.trackerGraphic.applySettings(settings)
            },
            _getFormatObject: function(tooltip) {
                var minValue = tooltip.formatValue(this.initialMinValue),
                    value = tooltip.formatValue(this.initialValue);
                return {
                        argument: this.initialArgument,
                        argumentText: tooltip.formatValue(this.initialArgument, "argument"),
                        valueText: minValue + " - " + value,
                        rangeValue1Text: minValue,
                        rangeValue2Text: value,
                        rangeValue1: this.initialMinValue,
                        rangeValue2: this.initialValue,
                        seriesName: this.series.name,
                        point: this,
                        originalMinValue: this.originalMinValue,
                        originalValue: this.originalValue,
                        originalArgument: this.originalArgument
                    }
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file rangeBarPoint.js */
    (function($, DX) {
        var viz = DevExpress.viz,
            points = viz.core.series.points.mixins,
            _isDefined = DX.utils.isDefined,
            rangeSymbolPointMethods = points.rangeSymbolPoint,
            _extend = $.extend;
        points.rangeBarPoint = _extend({}, points.barPoint, {
            deleteLabel: rangeSymbolPointMethods.deleteLabel,
            _getFormatObject: rangeSymbolPointMethods._getFormatObject,
            setAdjustSeriesLabels: rangeSymbolPointMethods.setAdjustSeriesLabels,
            clearVisibility: function() {
                if (this.graphic && this.graphic.settings.visibility)
                    this.graphic.applySettings({visibility: null});
                this._topLabel.clearVisibility();
                this._bottomLabel.clearVisibility()
            },
            setInvisibility: function() {
                if (this.graphic && this.graphic.settings.visibility !== "hidden")
                    this.graphic.applySettings({visibility: "hidden"});
                this._topLabel.hide();
                this._bottomLabel.hide()
            },
            _translate: function(translator) {
                var barMethods = points.barPoint;
                barMethods._translate.call(this, translator);
                if (this._options.rotated)
                    this.width = this.width || 1;
                else
                    this.height = this.height || 1
            },
            _updateData: rangeSymbolPointMethods._updateData,
            _getLabelPosition: rangeSymbolPointMethods._getLabelPosition,
            _getLabelMinFormatObject: rangeSymbolPointMethods._getLabelMinFormatObject,
            _updateLabelData: rangeSymbolPointMethods._updateLabelData,
            _updateLabelOptions: rangeSymbolPointMethods._updateLabelOptions,
            _createLabel: rangeSymbolPointMethods._createLabel,
            _checkOverlay: rangeSymbolPointMethods._checkOverlay,
            _getOverlayCorrections: rangeSymbolPointMethods._getOverlayCorrections,
            _drawLabel: function(renderer, group) {
                var topCoords,
                    bottomCoords,
                    rotated = this._options.rotated,
                    topLocation = this._getLabelPosition("top"),
                    bottomLocation = this._getLabelPosition("bottom"),
                    bbox = this._getGraphicBbox(),
                    coords = {
                        x: this.x,
                        y: this.y,
                        defaultX: this.defaultX,
                        defaultY: this.defaultY
                    },
                    translators = this.translators,
                    visibleArea,
                    customVisibility = this._getCustomLabelVisibility(),
                    commonVisibility = this._options.series.getLabelVisibility();
                if ((customVisibility || commonVisibility) && this.hasValue()) {
                    if (translators)
                        visibleArea = {
                            minX: translators.x.getCanvasVisibleArea().min,
                            maxX: translators.x.getCanvasVisibleArea().max,
                            minY: translators.y.getCanvasVisibleArea().min,
                            maxY: translators.y.getCanvasVisibleArea().max
                        };
                    this._topLabel.setCoords(coords, bbox, topLocation, visibleArea);
                    this._bottomLabel.setCoords(coords, bbox, bottomLocation, visibleArea);
                    this._topLabel.draw(renderer, group, customVisibility);
                    this._bottomLabel.draw(renderer, group, customVisibility);
                    rangeSymbolPointMethods._checkLabelsOverlay.call(this, topLocation)
                }
                else {
                    this._topLabel.hide();
                    this._bottomLabel.hide()
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file candlestickPoint.js */
    (function($, DX) {
        var viz = DevExpress.viz,
            points = viz.core.series.points.mixins,
            _isNumeric = $.isNumeric,
            _extend = $.extend,
            _math = Math,
            _abs = _math.abs,
            _min = _math.min,
            _max = _math.max,
            _round = _math.round,
            DEFAULT_FINANCIAL_TRACKER_MARGIN = 2;
        points.candlestickPoint = _extend({}, points.barPoint, {
            _getContinuousPoints: function(minValueName, maxValueName) {
                var that = this,
                    x = that.x,
                    createPoint = that._options.rotated ? function(x, y) {
                        return {
                                x: y,
                                y: x
                            }
                    } : function(x, y) {
                        return {
                                x: x,
                                y: y
                            }
                    },
                    width = that.width,
                    min = that[minValueName],
                    max = that[maxValueName],
                    points;
                if (min === max)
                    points = [createPoint(x, that.highY), createPoint(x, that.lowY), createPoint(x, that.closeY), createPoint(x - width / 2, that.closeY), createPoint(x + width / 2, that.closeY), createPoint(x, that.closeY)];
                else
                    points = [createPoint(x, that.highY), createPoint(x, max), createPoint(x + width / 2, max), createPoint(x + width / 2, min), createPoint(x, min), createPoint(x, that.lowY), createPoint(x, min), createPoint(x - width / 2, min), createPoint(x - width / 2, max), createPoint(x, max)];
                return points
            },
            _getCategoryPoints: function(y) {
                var that = this,
                    x = that.x,
                    createPoint = that._options.rotated ? function(x, y) {
                        return {
                                x: y,
                                y: x
                            }
                    } : function(x, y) {
                        return {
                                x: x,
                                y: y
                            }
                    };
                return [createPoint(x, that.highY), createPoint(x, that.lowY), createPoint(x, y), createPoint(x - that.width / 2, y), createPoint(x + that.width / 2, y), createPoint(x, y)]
            },
            _getPoints: function() {
                var that = this,
                    points,
                    minValueName,
                    maxValueName,
                    openValue = that.openValue,
                    closeValue = that.closeValue;
                if (_isNumeric(openValue) && _isNumeric(closeValue)) {
                    minValueName = openValue > closeValue ? "closeY" : "openY";
                    maxValueName = openValue > closeValue ? "openY" : "closeY";
                    points = that._getContinuousPoints(minValueName, maxValueName)
                }
                else if (openValue === closeValue)
                    points = [{
                            x: that.x,
                            y: that.highY
                        }, {
                            x: that.x,
                            y: that.lowY
                        }];
                else
                    points = that._getCategoryPoints(_isNumeric(openValue) ? that.openY : that.closeY);
                return points
            },
            getColor: function() {
                return this._isReduction ? this._options.reduction.color : this._styles.normal.stroke || this.series.getColor()
            },
            _drawMarkerInGroup: function(group, attributes, renderer) {
                this.graphic = renderer.createArea(this._getPoints(), attributes).append(group)
            },
            _fillStyle: function() {
                var styles = this._options.styles;
                if (this._isReduction && this._isPositive)
                    this._styles = styles.reductionPositive;
                else if (this._isReduction)
                    this._styles = styles.reduction;
                else if (this._isPositive)
                    this._styles = styles.positive;
                else
                    this._styles = styles
            },
            _getMinTrackerWidth: function() {
                return 1 + 2 * this._styles.normal.strokeWidth
            },
            correctCoordinates: function(correctOptions) {
                var minWidth = this._getMinTrackerWidth(),
                    maxWidth = 10;
                this.width = correctOptions.width < minWidth ? minWidth : correctOptions.width > maxWidth ? maxWidth : correctOptions.width;
                this.xCorrection = correctOptions.offset
            },
            _getMarkerGroup: function(group) {
                var markerGroup;
                if (this._isReduction && this._isPositive)
                    markerGroup = group.reductionPositiveMarkersGroup;
                else if (this._isReduction)
                    markerGroup = group.reductionMarkersGroup;
                else if (this._isPositive)
                    markerGroup = group.defaultPositiveMarkersGroup;
                else
                    markerGroup = group.defaultMarkersGroup;
                return markerGroup
            },
            _drawMarker: function(renderer, group) {
                var attributes = this._getStyle(),
                    rotated = this._options.rotated,
                    pointGroup = this._getMarkerGroup(group);
                this._drawMarkerInGroup(pointGroup, attributes, renderer)
            },
            _getSettingsForTracker: function() {
                var that = this,
                    highY = that.highY,
                    lowY = that.lowY,
                    rotated = that._options.rotated,
                    x,
                    y,
                    width,
                    height;
                if (highY === lowY) {
                    highY = rotated ? highY + DEFAULT_FINANCIAL_TRACKER_MARGIN : highY - DEFAULT_FINANCIAL_TRACKER_MARGIN;
                    lowY = rotated ? lowY - DEFAULT_FINANCIAL_TRACKER_MARGIN : lowY + DEFAULT_FINANCIAL_TRACKER_MARGIN
                }
                if (rotated) {
                    x = _min(lowY, highY);
                    y = that.x - that.width / 2;
                    width = _abs(lowY - highY);
                    height = that.width
                }
                else {
                    x = that.x - that.width / 2;
                    y = _min(lowY, highY);
                    width = that.width;
                    height = _abs(lowY - highY)
                }
                return {
                        x: x,
                        y: y,
                        width: width,
                        height: height
                    }
            },
            _drawTrackerMarker: function(renderer, group) {
                var settings = this._getSettingsForTracker();
                this.trackerGraphic = renderer.createRect(settings.x, settings.y, settings.width, settings.height, 0).append(group);
                this.trackerGraphic.data({point: this})
            },
            _getGraphicBbox: function() {
                var bbox = {},
                    rotated = this._options.rotated;
                bbox.x = !rotated ? this.x - _round(this.width / 2) : this.lowY;
                bbox.y = !rotated ? this.highY : this.x - _round(this.width / 2);
                bbox.width = !rotated ? this.width : this.highY - this.lowY;
                bbox.height = !rotated ? this.lowY - this.highY : this.width;
                return bbox
            },
            _drawLabel: function(renderer, group) {
                var coords,
                    commonVisibility = this._options.series.getLabelVisibility(),
                    customVisibility = this._getCustomLabelVisibility(),
                    visibleArea,
                    reductionColor = this._options.reduction.color,
                    translators = this.translators;
                if (this.hasValue() && (commonVisibility || customVisibility)) {
                    visibleArea = {
                        minX: translators.x.getCanvasVisibleArea().min,
                        maxX: translators.x.getCanvasVisibleArea().max,
                        minY: translators.y.getCanvasVisibleArea().min,
                        maxY: translators.y.getCanvasVisibleArea().max
                    };
                    if (this._isReduction)
                        this._label.updateOptions({options: {
                                background: {fill: reductionColor},
                                connector: {stroke: reductionColor}
                            }});
                    coords = this._options.rotated ? {
                        x: this.highY,
                        y: this.x
                    } : {
                        x: this.x,
                        y: this.highY
                    };
                    this._label.setCoords(coords, this._getGraphicBbox(), "top", visibleArea);
                    this._label.draw(renderer, group, customVisibility)
                }
            },
            getTooltipCoords: function() {
                var that = this;
                if (that.graphic) {
                    var x,
                        y,
                        min,
                        max,
                        minValue = _min(that.lowY, that.highY),
                        maxValue = _max(that.lowY, that.highY),
                        visibleAreaX = that.translators.x.getCanvasVisibleArea(),
                        visibleAreaY = that.translators.y.getCanvasVisibleArea();
                    if (!that._options.rotated) {
                        min = _max(visibleAreaY.min, minValue);
                        max = _min(visibleAreaY.max, maxValue);
                        x = that.x;
                        y = min + (max - min) / 2
                    }
                    else {
                        min = _max(visibleAreaX.min, minValue);
                        max = _min(visibleAreaX.max, maxValue);
                        y = that.x;
                        x = min + (max - min) / 2
                    }
                    return {
                            x: x,
                            y: y,
                            offset: 0
                        }
                }
            },
            hasValue: function() {
                return this.highValue !== null && this.lowValue !== null
            },
            _translate: function(translator) {
                var that = this,
                    rotated = that._options.rotated,
                    argTranslator = rotated ? that.translators.y : that.translators.x,
                    valTranslator = rotated ? that.translators.x : that.translators.y,
                    centerValue,
                    height;
                that.x = argTranslator.translate(that.argument) + (that.xCorrection || 0);
                that.openY = that.openValue !== null ? valTranslator.translate(that.openValue) : null;
                that.highY = valTranslator.translate(that.highValue);
                that.lowY = valTranslator.translate(that.lowValue);
                that.closeY = that.closeValue !== null ? valTranslator.translate(that.closeValue) : null;
                height = _abs(that.lowY - that.highY);
                centerValue = _min(that.lowY, that.highY) + _abs(that.lowY - that.highY) / 2;
                that._calculateVisibility(!rotated ? that.x : centerValue, !rotated ? centerValue : that.x)
            },
            _updateData: function(data) {
                var that = this;
                if (that.argument !== data.argument || that.reductionValue !== data.reductionValue || that.highValue !== data.highValue || that.lowValue !== data.lowValue || that.openValue !== data.openValue || that.closeValue !== data.closeValue || that.tag !== data.tag) {
                    that.value = that.initialValue = data.reductionValue;
                    that.originalValue = data.value;
                    that.argument = that.initialArgument = data.argument;
                    that.originalArgument = data.argument;
                    that.lowValue = data.lowValue;
                    that.originalLowValue = data.lowValue;
                    that.highValue = data.highValue;
                    that.originalHighValue = data.highValue;
                    that.openValue = data.openValue;
                    that.originalOpenValue = data.openValue;
                    that.closeValue = data.closeValue;
                    that.originalCloseValue = data.closeValue;
                    that.tag = data.tag;
                    that.pointClassName = data.pointClassName;
                    that._isPositive = data.openValue < data.closeValue;
                    that._isReduction = data.isReduction
                }
            },
            _updateMarker: function(animationEnabled, style, group) {
                var style = style || this._getStyle();
                this.graphic.applySettings(_extend({points: this._getPoints()}, style));
                group && this.graphic.append(this._getMarkerGroup(group))
            },
            _updateTracker: function() {
                this.trackerGraphic.applySettings(this._getSettingsForTracker())
            },
            _getLabelFormatObject: function() {
                return {
                        openValue: this.openValue,
                        highValue: this.highValue,
                        lowValue: this.lowValue,
                        closeValue: this.closeValue,
                        reductionValue: this.initialValue,
                        argument: this.initialArgument,
                        value: this.initialValue,
                        seriesName: this._options.series.name,
                        originalOpenValue: this.originalOpenValue,
                        originalCloseValue: this.originalCloseValue,
                        originalLowValue: this.originalLowValue,
                        originalHighValue: this.originalHighValue,
                        originalArgument: this.originalArgument,
                        point: this
                    }
            },
            _getFormatObject: function(tooltip) {
                var highValue = tooltip.formatValue(this.highValue),
                    openValue = tooltip.formatValue(this.openValue),
                    closeValue = tooltip.formatValue(this.closeValue),
                    lowValue = tooltip.formatValue(this.lowValue),
                    symbolMethods = points.symbolPoint,
                    formatObject = symbolMethods._getFormatObject.call(this, tooltip);
                return _extend({}, formatObject, {
                        valueText: "h: " + highValue + (openValue !== "" ? " o: " + openValue : "") + (closeValue !== "" ? " c: " + closeValue : "") + " l: " + lowValue,
                        highValueText: highValue,
                        openValueText: openValue,
                        closeValueText: closeValue,
                        lowValueText: lowValue
                    })
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file stockPoint.js */
    (function($, DX) {
        var viz = DevExpress.viz,
            points = viz.core.series.points.mixins,
            _extend = $.extend,
            _isNumeric = $.isNumeric;
        points.stockPoint = _extend({}, points.candlestickPoint, {
            _getPoints: function() {
                var that = this,
                    createPoint = that._options.rotated ? function(x, y) {
                        return {
                                x: y,
                                y: x
                            }
                    } : function(x, y) {
                        return {
                                x: x,
                                y: y
                            }
                    },
                    openYExist = _isNumeric(that.openY),
                    closeYExist = _isNumeric(that.closeY),
                    x = that.x,
                    width = that.width,
                    points = [createPoint(x, that.highY), openYExist && createPoint(x, that.openY), openYExist && createPoint(x - width / 2, that.openY), openYExist && createPoint(x, that.openY), closeYExist && createPoint(x, that.closeY), closeYExist && createPoint(x + width / 2, that.closeY), closeYExist && createPoint(x, that.closeY), createPoint(x, that.lowY)];
                return points
            },
            _drawMarkerInGroup: function(group, attributes, renderer) {
                this.graphic = renderer.createPath(this._getPoints(), attributes).append(group)
            },
            _getMinTrackerWidth: function() {
                return 2 + this._styles.normal.strokeWidth
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file default.js */
    (function($, DX, undefined) {
        DX.viz.themes = DX.viz.themes || [];
        var fontFamilyDefault = "'Segoe UI', 'Helvetica Neue', 'Trebuchet MS', Verdana",
            fontFamilyLight = "'Segoe UI Light', 'Helvetica Neue Light', 'Segoe UI', 'Helvetica Neue', 'Trebuchet MS', Verdana",
            baseChartTheme = {
                containerBackgroundColor: '#ffffff',
                animation: {
                    enabled: true,
                    duration: 1000,
                    easing: 'easeOutCubic',
                    maxPointCountSupported: 300
                },
                commonSeriesSettings: {
                    border: {
                        visible: false,
                        width: 2
                    },
                    showInLegend: true,
                    visible: true,
                    hoverMode: 'excludePoints',
                    selectionMode: 'includePoints',
                    hoverStyle: {
                        hatching: {
                            direction: 'right',
                            width: 2,
                            step: 6,
                            opacity: 0.75
                        },
                        border: {
                            visible: false,
                            width: 3
                        }
                    },
                    selectionStyle: {
                        hatching: {
                            direction: 'right',
                            width: 2,
                            step: 6,
                            opacity: 0.5
                        },
                        border: {
                            visible: false,
                            width: 3
                        }
                    },
                    label: {
                        visible: false,
                        alignment: 'center',
                        rotationAngle: 0,
                        horizontalOffset: 0,
                        verticalOffset: 0,
                        radialOffset: 0,
                        format: '',
                        argumentFormat: '',
                        precision: 0,
                        argumentPrecision: 0,
                        percentPrecision: 0,
                        showForZeroValues: true,
                        customizeText: undefined,
                        maxLabelCount: undefined,
                        position: 'outside',
                        font: {color: '#ffffff'},
                        border: {
                            visible: false,
                            width: 1,
                            color: '#d3d3d3',
                            dashStyle: 'solid'
                        },
                        connector: {
                            visible: false,
                            width: 1
                        }
                    }
                },
                redrawOnResize: true,
                margin: {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                },
                seriesSelectionMode: 'single',
                pointSelectionMode: 'single',
                legend: {
                    hoverMode: 'includePoints',
                    verticalAlignment: 'top',
                    horizontalAlignment: 'right',
                    position: 'outside',
                    visible: true,
                    customizeText: undefined,
                    itemTextPosition: undefined,
                    margin: 10,
                    equalColumnWidth: false,
                    markerSize: 12,
                    backgroundColor: undefined,
                    backgroundOpacity: undefined,
                    border: {
                        visible: false,
                        width: 1,
                        color: '#d3d3d3',
                        cornerRadius: 0,
                        dashStyle: 'solid'
                    },
                    paddingLeftRight: 20,
                    paddingTopBottom: 15,
                    columnCount: 0,
                    rowCount: 0,
                    columnItemSpacing: 20,
                    rowItemSpacing: 8
                },
                tooltip: {
                    enabled: false,
                    border: {
                        width: 1,
                        color: '#d3d3d3',
                        dashStyle: 'solid',
                        visible: true
                    },
                    font: {
                        family: fontFamilyDefault,
                        weight: 400,
                        size: 12,
                        color: '#232323'
                    },
                    color: '#ffffff',
                    arrowLength: 10,
                    paddingLeftRight: 18,
                    paddingTopBottom: 15,
                    shared: false,
                    format: '',
                    argumentFormat: '',
                    precision: 0,
                    argumentPrecision: 0,
                    percentPrecision: 0,
                    customizeText: undefined,
                    customizeTooltip: undefined,
                    shadow: {
                        opacity: 0.4,
                        offsetX: 0,
                        offsetY: 4,
                        blur: 2,
                        color: '#000000'
                    }
                },
                size: {
                    width: undefined,
                    height: undefined
                },
                loadingIndicator: {
                    font: {},
                    backgroundColor: '#ffffff',
                    text: 'Loading...'
                },
                dataPrepareSettings: {
                    checkTypeForAllData: false,
                    convertToAxisDataType: true,
                    sortingMethod: true
                },
                title: {
                    font: {
                        family: fontFamilyLight,
                        weight: 200,
                        color: '#232323',
                        size: 28
                    },
                    margin: 10
                },
                adaptiveLayout: {
                    width: 80,
                    height: 80,
                    keepLabels: true
                },
                _rtl: {legend: {itemTextPosition: 'left'}}
            },
            baseDarkChartTheme = {
                containerBackgroundColor: '#2b2b2b',
                commonSeriesSettings: {label: {border: {color: '#494949'}}},
                legend: {border: {color: '#494949'}},
                loadingIndicator: {backgroundColor: '#2b2b2b'},
                title: {font: {color: '#929292'}},
                tooltip: {
                    color: '#2b2b2b',
                    border: {color: '#494949'},
                    font: {color: '#929292'}
                }
            };
        DX.viz.themes.push({
            name: 'desktop',
            font: {
                color: '#767676',
                family: fontFamilyDefault,
                weight: 400,
                size: 12,
                cursor: 'default'
            },
            chart: $.extend(true, {}, baseChartTheme, {
                commonSeriesSettings: {
                    type: 'line',
                    stack: 'default',
                    point: {
                        visible: true,
                        symbol: 'circle',
                        size: 12,
                        border: {
                            visible: false,
                            width: 1
                        },
                        hoverMode: 'onlyPoint',
                        selectionMode: 'onlyPoint',
                        hoverStyle: {
                            border: {
                                visible: true,
                                width: 4
                            },
                            size: 12
                        },
                        selectionStyle: {
                            border: {
                                visible: true,
                                width: 4
                            },
                            size: 12
                        }
                    },
                    scatter: {},
                    line: {
                        width: 2,
                        dashStyle: 'solid',
                        hoverStyle: {
                            width: 3,
                            hatching: {direction: 'none'}
                        },
                        selectionStyle: {width: 3}
                    },
                    stackedline: {
                        width: 2,
                        dashStyle: 'solid',
                        hoverStyle: {
                            width: 3,
                            hatching: {direction: 'none'}
                        },
                        selectionStyle: {width: 3}
                    },
                    fullstackedline: {
                        width: 2,
                        dashStyle: 'solid',
                        hoverStyle: {
                            width: 3,
                            hatching: {direction: 'none'}
                        },
                        selectionStyle: {width: 3}
                    },
                    stepline: {
                        width: 2,
                        dashStyle: 'solid',
                        hoverStyle: {
                            width: 3,
                            hatching: {direction: 'none'}
                        },
                        selectionStyle: {width: 3}
                    },
                    area: {
                        point: {visible: false},
                        opacity: 0.5
                    },
                    stackedarea: {
                        point: {visible: false},
                        opacity: 0.5
                    },
                    fullstackedarea: {
                        point: {visible: false},
                        opacity: 0.5
                    },
                    steparea: {
                        border: {
                            visible: true,
                            width: 2
                        },
                        point: {visible: false},
                        hoverStyle: {border: {
                                visible: true,
                                width: 3
                            }},
                        selectionStyle: {border: {
                                visible: true,
                                width: 3
                            }},
                        opacity: 0.5
                    },
                    spline: {
                        width: 2,
                        hoverStyle: {
                            width: 3,
                            hatching: {direction: 'none'}
                        },
                        selectionStyle: {width: 3}
                    },
                    splinearea: {
                        point: {visible: false},
                        opacity: 0.5
                    },
                    bar: {
                        cornerRadius: 0,
                        point: {
                            hoverStyle: {border: {visible: false}},
                            selectionStyle: {border: {visible: false}}
                        }
                    },
                    stackedbar: {
                        cornerRadius: 0,
                        point: {
                            hoverStyle: {border: {visible: false}},
                            selectionStyle: {border: {visible: false}}
                        },
                        label: {position: "inside"}
                    },
                    fullstackedbar: {
                        cornerRadius: 0,
                        point: {
                            hoverStyle: {border: {visible: false}},
                            selectionStyle: {border: {visible: false}}
                        },
                        label: {position: "inside"}
                    },
                    rangebar: {
                        cornerRadius: 0,
                        point: {
                            hoverStyle: {border: {visible: false}},
                            selectionStyle: {border: {visible: false}}
                        }
                    },
                    rangearea: {
                        point: {visible: false},
                        opacity: 0.5
                    },
                    rangesplinearea: {
                        point: {visible: false},
                        opacity: 0.5
                    },
                    bubble: {
                        opacity: 0.5,
                        point: {
                            hoverStyle: {border: {visible: false}},
                            selectionStyle: {border: {visible: false}}
                        }
                    },
                    candlestick: {
                        width: 1,
                        innerColor: '#ffffff',
                        reduction: {color: '#ff0000'},
                        hoverStyle: {
                            width: 3,
                            hatching: {direction: 'none'}
                        },
                        selectionStyle: {width: 3},
                        point: {border: {visible: true}}
                    },
                    stock: {
                        width: 1,
                        reduction: {color: '#ff0000'},
                        hoverStyle: {
                            width: 3,
                            hatching: {direction: 'none'}
                        },
                        selectionStyle: {width: 3},
                        point: {border: {visible: true}}
                    }
                },
                crosshair: {
                    enabled: false,
                    color: '#c6c6c6',
                    width: 1,
                    dashStyle: 'solid',
                    verticalLine: {visible: true},
                    horizontalLine: {visible: true}
                },
                commonAxisSettings: {
                    tickInterval: undefined,
                    setTicksAtUnitBeginning: true,
                    valueMarginsEnabled: true,
                    placeholderSize: null,
                    logarithmBase: 10,
                    discreteAxisDivisionMode: 'betweenLabels',
                    visible: false,
                    color: '#d3d3d3',
                    width: 1,
                    multipleAxesSpacing: 5,
                    label: {
                        visible: true,
                        overlappingBehavior: {
                            mode: 'auto',
                            rotationAngle: 90,
                            staggeringSpacing: 5
                        },
                        precision: 0,
                        format: '',
                        customizeText: undefined,
                        indentFromAxis: 10
                    },
                    grid: {
                        visible: false,
                        color: '#d3d3d3',
                        width: 1
                    },
                    tick: {
                        visible: false,
                        color: '#d3d3d3'
                    },
                    title: {
                        font: {size: 16},
                        margin: 10
                    },
                    stripStyle: {
                        paddingLeftRight: 10,
                        paddingTopBottom: 5
                    },
                    constantLineStyle: {
                        paddingLeftRight: 10,
                        paddingTopBottom: 10,
                        width: 1,
                        color: '#000000',
                        dashStyle: 'solid',
                        label: {
                            visible: true,
                            position: 'inside'
                        }
                    }
                },
                horizontalAxis: {
                    isHorizontal: true,
                    position: 'bottom',
                    axisDivisionFactor: 50,
                    label: {alignment: "center"},
                    stripStyle: {label: {
                            horizontalAlignment: 'center',
                            verticalAlignment: 'top'
                        }},
                    constantLineStyle: {label: {
                            horizontalAlignment: 'right',
                            verticalAlignment: 'top'
                        }},
                    constantLines: {}
                },
                verticalAxis: {
                    isHorizontal: false,
                    position: 'left',
                    axisDivisionFactor: 30,
                    label: {
                        alignment: 'right',
                        overlappingBehavior: {mode: 'enlargeTickInterval'}
                    },
                    stripStyle: {label: {
                            horizontalAlignment: 'left',
                            verticalAlignment: 'center'
                        }},
                    constantLineStyle: {label: {
                            horizontalAlignment: 'left',
                            verticalAlignment: 'top'
                        }},
                    constantLines: {}
                },
                argumentAxis: {},
                valueAxis: {grid: {visible: true}},
                commonPaneSettings: {
                    backgroundColor: 'none',
                    border: {
                        color: '#d3d3d3',
                        width: 1,
                        visible: false,
                        top: true,
                        bottom: true,
                        left: true,
                        right: true,
                        dashStyle: 'solid'
                    }
                },
                useAggregation: false,
                adjustOnZoom: true,
                rotated: false,
                synchronizeMultiAxes: true,
                equalBarWidth: true,
                minBubbleSize: 12,
                maxBubbleSize: 0.2
            }),
            pie: $.extend(true, {}, baseChartTheme, {
                commonSeriesSettings: {
                    type: 'pie',
                    pie: {
                        border: {
                            visible: false,
                            width: 2,
                            color: '#ffffff'
                        },
                        hoverStyle: {
                            hatching: {
                                direction: 'right',
                                width: 4,
                                step: 10,
                                opacity: 0.75
                            },
                            border: {
                                visible: false,
                                width: 2
                            }
                        },
                        selectionStyle: {
                            hatching: {
                                direction: 'right',
                                width: 4,
                                step: 10,
                                opacity: 0.5
                            },
                            border: {
                                visible: false,
                                width: 2
                            }
                        }
                    },
                    doughnut: {
                        innerRadius: 0.5,
                        border: {
                            visible: false,
                            width: 2,
                            color: '#ffffff'
                        },
                        hoverStyle: {
                            hatching: {
                                direction: 'right',
                                width: 4,
                                step: 10,
                                opacity: 0.75
                            },
                            border: {
                                visible: false,
                                width: 2
                            }
                        },
                        selectionStyle: {
                            hatching: {
                                direction: 'right',
                                width: 4,
                                step: 10,
                                opacity: 0.5
                            },
                            border: {
                                visible: false,
                                width: 2
                            }
                        }
                    },
                    donut: {
                        innerRadius: 0.5,
                        border: {
                            visible: false,
                            width: 2,
                            color: '#ffffff'
                        },
                        hoverStyle: {
                            hatching: {
                                direction: 'right',
                                width: 4,
                                step: 10,
                                opacity: 0.75
                            },
                            border: {
                                visible: false,
                                width: 2
                            }
                        },
                        selectionStyle: {
                            hatching: {
                                direction: 'right',
                                width: 4,
                                step: 10,
                                opacity: 0.5
                            },
                            border: {
                                visible: false,
                                width: 2
                            }
                        }
                    }
                },
                legend: {hoverMode: 'markPoint'},
                adaptiveLayout: {keepLabels: false}
            }),
            pieIE8: {commonSeriesSettings: {
                    pie: {
                        hoverStyle: {border: {
                                visible: true,
                                color: '#ffffff'
                            }},
                        selectionStyle: {border: {
                                visible: true,
                                color: '#ffffff'
                            }}
                    },
                    donut: {
                        hoverStyle: {border: {
                                visible: true,
                                color: '#ffffff'
                            }},
                        selectionStyle: {border: {
                                visible: true,
                                color: '#ffffff'
                            }}
                    },
                    doughnut: {
                        hoverStyle: {border: {
                                visible: true,
                                color: '#ffffff'
                            }},
                        selectionStyle: {border: {
                                visible: true,
                                color: '#ffffff'
                            }}
                    }
                }},
            gauge: {
                containerBackgroundColor: '#ffffff',
                scale: {
                    majorTick: {
                        visible: true,
                        length: 5,
                        width: 2,
                        showCalculatedTicks: true,
                        useTicksAutoArrangement: true,
                        color: '#ffffff'
                    },
                    minorTick: {
                        visible: false,
                        length: 3,
                        width: 1,
                        showCalculatedTicks: true,
                        color: '#ffffff'
                    },
                    label: {
                        visible: true,
                        font: {}
                    }
                },
                rangeContainer: {
                    offset: 0,
                    width: 5,
                    backgroundColor: '#808080'
                },
                valueIndicator: {
                    _default: {color: '#c2c2c2'},
                    rangebar: {
                        space: 2,
                        size: 10,
                        color: '#cbc5cf',
                        backgroundColor: 'none',
                        text: {
                            indent: 0,
                            font: {
                                size: 14,
                                color: null
                            }
                        }
                    },
                    twocolorneedle: {secondColor: '#e18e92'},
                    twocolorrectangle: {secondColor: '#e18e92'}
                },
                subvalueIndicator: {
                    _default: {color: '#8798a5'},
                    trianglemarker: {
                        space: 2,
                        length: 14,
                        width: 13,
                        color: '#8798a5'
                    },
                    triangle: {
                        space: 2,
                        length: 14,
                        width: 13,
                        color: '#8798a5'
                    },
                    textcloud: {
                        arrowLength: 5,
                        horizontalOffset: 6,
                        verticalOffset: 3,
                        color: '#679ec5',
                        text: {font: {
                                color: '#ffffff',
                                size: 18
                            }}
                    }
                },
                valueIndicators: {
                    _default: {color: '#c2c2c2'},
                    rangebar: {
                        space: 2,
                        size: 10,
                        color: '#cbc5cf',
                        backgroundColor: 'none',
                        text: {
                            indent: 0,
                            font: {
                                size: 14,
                                color: null
                            }
                        }
                    },
                    twocolorneedle: {secondColor: '#e18e92'},
                    trianglemarker: {
                        space: 2,
                        length: 14,
                        width: 13,
                        color: '#8798a5'
                    },
                    textcloud: {
                        arrowLength: 5,
                        horizontalOffset: 6,
                        verticalOffset: 3,
                        color: '#679ec5',
                        text: {font: {
                                color: '#ffffff',
                                size: 18
                            }}
                    }
                },
                title: {
                    layout: {
                        horizontalAlignment: 'center',
                        verticalAlignment: 'top',
                        overlay: 0
                    },
                    font: {
                        size: 16,
                        color: '#232323',
                        family: fontFamilyDefault,
                        weight: 400
                    }
                },
                subtitle: {font: {
                        size: 14,
                        color: '#232323',
                        family: fontFamilyDefault,
                        weight: 400
                    }},
                indicator: {
                    hasPositiveMeaning: true,
                    layout: {
                        horizontalAlignment: 'center',
                        verticalAlignment: 'bottom',
                        overlay: 0
                    },
                    text: {font: {size: 18}}
                },
                tooltip: {
                    arrowLength: 10,
                    paddingLeftRight: 18,
                    paddingTopBottom: 15,
                    enabled: false,
                    border: {
                        width: 1,
                        color: '#d3d3d3',
                        dashStyle: 'solid',
                        visible: true
                    },
                    color: '#ffffff',
                    font: {
                        color: '#232323',
                        size: 12,
                        family: fontFamilyDefault,
                        weight: 400
                    },
                    shadow: {
                        opacity: 0.4,
                        offsetX: 0,
                        offsetY: 4,
                        blur: 2,
                        color: '#000000'
                    }
                },
                loadingIndicator: {
                    font: {},
                    backgroundColor: '#ffffff',
                    text: 'Loading...'
                },
                _circular: {
                    scale: {
                        orientation: 'outside',
                        label: {indentFromTick: 10}
                    },
                    rangeContainer: {orientation: 'outside'},
                    valueIndicator: {
                        type: 'rectangleneedle',
                        _default: {
                            offset: 20,
                            indentFromCenter: 0,
                            width: 2,
                            spindleSize: 14,
                            spindleGapSize: 10
                        },
                        triangleneedle: {width: 4},
                        triangle: {width: 4},
                        twocolorneedle: {
                            space: 2,
                            secondFraction: 0.4
                        },
                        twocolorrectangle: {
                            space: 2,
                            secondFraction: 0.4
                        },
                        rangebar: {offset: 30}
                    },
                    subvalueIndicator: {
                        type: 'trianglemarker',
                        trianglemarker: {offset: 6},
                        triangle: {offset: 6},
                        textcloud: {offset: -6}
                    },
                    valueIndicators: {
                        _type: 'rectangleneedle',
                        _default: {
                            offset: 20,
                            indentFromCenter: 0,
                            width: 2,
                            spindleSize: 14,
                            spindleGapSize: 10
                        },
                        triangleneedle: {width: 4},
                        twocolorneedle: {
                            space: 2,
                            secondFraction: 0.4
                        },
                        rangebar: {offset: 30},
                        trianglemarker: {offset: 6},
                        textcloud: {offset: -6}
                    }
                },
                _linear: {
                    scale: {
                        horizontalOrientation: 'right',
                        verticalOrientation: 'bottom',
                        label: {indentFromTick: -10}
                    },
                    rangeContainer: {
                        horizontalOrientation: 'right',
                        verticalOrientation: 'bottom'
                    },
                    valueIndicator: {
                        type: 'rangebar',
                        _default: {
                            offset: 2.5,
                            length: 15,
                            width: 15
                        },
                        rectangle: {width: 10},
                        rangebar: {
                            offset: 10,
                            horizontalOrientation: 'right',
                            verticalOrientation: 'bottom'
                        }
                    },
                    subvalueIndicator: {
                        type: 'trianglemarker',
                        _default: {
                            offset: -1,
                            horizontalOrientation: 'left',
                            verticalOrientation: 'top'
                        }
                    },
                    valueIndicators: {
                        _type: 'rectangle',
                        _default: {
                            offset: 2.5,
                            length: 15,
                            width: 15
                        },
                        rectangle: {width: 10},
                        rangebar: {
                            offset: 10,
                            horizontalOrientation: 'right',
                            verticalOrientation: 'bottom'
                        },
                        trianglemarker: {
                            offset: -1,
                            horizontalOrientation: 'left',
                            verticalOrientation: 'top'
                        },
                        textcloud: {
                            offset: -1,
                            horizontalOrientation: 'left',
                            verticalOrientation: 'top'
                        }
                    }
                }
            },
            barGauge: {
                backgroundColor: '#e0e0e0',
                relativeInnerRadius: 0.3,
                barSpacing: 4,
                label: {
                    indent: 20,
                    connectorWidth: 2,
                    font: {size: 16}
                },
                title: {
                    layout: {
                        horizontalAlignment: 'center',
                        verticalAlignment: 'top',
                        overlay: 0
                    },
                    font: {
                        size: 16,
                        color: '#232323',
                        family: fontFamilyDefault,
                        weight: 400
                    }
                },
                subtitle: {font: {
                        size: 14,
                        color: '#232323',
                        family: fontFamilyDefault,
                        weight: 400
                    }},
                indicator: {
                    hasPositiveMeaning: true,
                    layout: {
                        horizontalAlignment: 'center',
                        verticalAlignment: 'bottom',
                        overlay: 0
                    },
                    text: {font: {size: 18}}
                },
                tooltip: {
                    arrowLength: 10,
                    paddingLeftRight: 18,
                    paddingTopBottom: 15,
                    enabled: false,
                    border: {
                        width: 1,
                        color: '#d3d3d3',
                        dashStyle: 'solid',
                        visible: true
                    },
                    color: '#ffffff',
                    font: {
                        size: 12,
                        color: '#232323',
                        family: fontFamilyDefault,
                        weight: 400
                    },
                    shadow: {
                        opacity: 0.4,
                        offsetX: 0,
                        offsetY: 4,
                        blur: 2,
                        color: '#000000'
                    }
                },
                loadingIndicator: {
                    font: {},
                    backgroundColor: '#ffffff',
                    text: 'Loading...'
                }
            },
            rangeSelector: {
                containerBackgroundColor: '#ffffff',
                scale: {
                    label: {
                        topIndent: 7,
                        font: {size: 11}
                    },
                    tick: {
                        width: 1,
                        color: '#000000',
                        opacity: 0.1
                    },
                    marker: {
                        separatorHeight: 33,
                        topIndent: 10,
                        textLeftIndent: 7,
                        textTopIndent: 11
                    }
                },
                loadingIndicator: {
                    font: {},
                    backgroundColor: '#ffffff',
                    text: 'Loading...'
                },
                sliderMarker: {
                    padding: 7,
                    pointerSize: 6,
                    color: '#9b9b9b',
                    invalidRangeColor: '#ff0000',
                    font: {
                        color: '#ffffff',
                        size: 11
                    }
                },
                sliderHandle: {
                    width: 1,
                    color: '#000000',
                    opacity: 0.2
                },
                shutter: {
                    color: undefined,
                    opacity: 0.75
                },
                background: {color: "#c0bae1"},
                chart: {
                    containerBackgroundColor: undefined,
                    commonSeriesSettings: {
                        label: baseChartTheme.commonSeriesSettings.label,
                        border: {
                            visible: false,
                            width: 1
                        },
                        visible: true,
                        type: 'area',
                        hoverMode: 'none',
                        hoverStyle: {border: {}},
                        selectionStyle: {border: {}},
                        point: {
                            visible: false,
                            symbol: 'circle',
                            border: {
                                visible: false,
                                width: 1
                            },
                            size: 12,
                            hoverStyle: {border: {}},
                            selectionStyle: {border: {}}
                        },
                        line: {width: 2},
                        stepline: {width: 2},
                        scatter: {point: {visible: true}},
                        stackedline: {width: 2},
                        fullstackedline: {width: 2},
                        area: {opacity: 0.5},
                        stackedarea: {opacity: 0.5},
                        fullstackedarea: {opacity: 0.5},
                        spline: {width: 2},
                        splinearea: {opacity: 0.5},
                        steparea: {
                            border: {
                                visible: true,
                                width: 2
                            },
                            opacity: 0.5
                        },
                        bubble: {
                            opacity: 0.5,
                            point: {visible: true}
                        },
                        bar: {
                            cornerRadius: 0,
                            point: {visible: true}
                        },
                        stackedbar: {
                            cornerRadius: 0,
                            point: {visible: true}
                        },
                        fullstackedbar: {
                            cornerRadius: 0,
                            point: {visible: true}
                        },
                        rangebar: {
                            cornerRadius: 0,
                            point: {visible: true}
                        },
                        rangearea: {opacity: 0.5},
                        rangesplinearea: {opacity: 0.5},
                        candlestick: {
                            width: 1,
                            innerColor: '#ffffff',
                            reduction: {color: '#ff0000'}
                        },
                        stock: {
                            width: 1,
                            reduction: {color: '#ff0000'}
                        }
                    },
                    dataPrepareSettings: {
                        checkTypeForAllData: false,
                        convertToAxisDataType: true,
                        sortingMethod: true
                    },
                    useAggregation: false,
                    equalBarWidth: true,
                    minBubbleSize: 12,
                    maxBubbleSize: 0.2,
                    topIndent: 0.1,
                    bottomIndent: 0,
                    valueAxis: {
                        min: undefined,
                        max: undefined,
                        inverted: false,
                        logarithmBase: 10
                    }
                }
            },
            map: {
                background: {
                    borderWidth: 1,
                    borderColor: '#cacaca',
                    color: '#ffffff'
                },
                area: {
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    color: '#d2d2d2',
                    hoveredBorderColor: '#303030',
                    selectedBorderWidth: 2,
                    selectedBorderColor: '#303030'
                },
                marker: {
                    font: {
                        color: '#2b2b2b',
                        size: 12
                    },
                    _dot: {
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        color: '#ba4d51',
                        size: 8,
                        selectedStep: 2,
                        backStep: 18,
                        backColor: '#ffffff',
                        backOpacity: 0.32,
                        shadow: true
                    },
                    _bubble: {
                        minSize: 20,
                        maxSize: 50,
                        color: '#ba4d51',
                        hoveredBorderWidth: 1,
                        hoveredBorderColor: '#303030',
                        selectedBorderWidth: 2,
                        selectedBorderColor: '#303030'
                    },
                    _pie: {
                        size: 50,
                        hoveredBorderWidth: 1,
                        hoveredBorderColor: '#303030',
                        selectedBorderWidth: 2,
                        selectedBorderColor: '#303030'
                    },
                    _image: {size: 20}
                },
                controlBar: {
                    borderColor: '#5d5d5d',
                    borderWidth: 3,
                    color: '#ffffff'
                },
                tooltip: {
                    borderWidth: 1,
                    borderColor: '#d7d7d7',
                    arrowLength: 10,
                    paddingLeftRight: 18,
                    paddingTopBottom: 15,
                    border: {
                        width: 1,
                        color: '#d3d3d3',
                        dashStyle: 'solid',
                        visible: true
                    },
                    color: '#ffffff',
                    font: {
                        color: '#232323',
                        size: 12,
                        family: fontFamilyDefault,
                        weight: 400
                    },
                    shadow: {
                        opacity: 0.4,
                        offsetX: 0,
                        offsetY: 4,
                        blur: 2,
                        color: '#000000'
                    }
                },
                legend: {
                    verticalAlignment: 'bottom',
                    horizontalAlignment: 'right',
                    position: 'inside',
                    visible: true,
                    margin: 10,
                    equalColumnWidth: false,
                    markerSize: 12,
                    backgroundColor: '#ffffff',
                    backgroundOpacity: 0.65,
                    border: {
                        visible: true,
                        width: 1,
                        color: '#cacaca',
                        cornerRadius: 0,
                        dashStyle: 'solid'
                    },
                    paddingLeftRight: 16,
                    paddingTopBottom: 12,
                    columnItemSpacing: 20,
                    rowItemSpacing: 8,
                    font: {
                        color: '#2b2b2b',
                        size: 12
                    }
                },
                loadingIndicator: {
                    backgroundColor: '#ffffff',
                    font: {},
                    text: 'Loading...'
                },
                _rtl: {legend: {itemTextPosition: 'left'}}
            },
            sparkline: {
                lineColor: '#666666',
                lineWidth: 2,
                areaOpacity: 0.2,
                minColor: '#e8c267',
                maxColor: '#e55253',
                barPositiveColor: '#a9a9a9',
                barNegativeColor: '#d7d7d7',
                winColor: '#a9a9a9',
                lossColor: '#d7d7d7',
                firstLastColor: '#666666',
                pointSymbol: 'circle',
                pointColor: '#ffffff',
                pointSize: 4,
                tooltip: {
                    enabled: true,
                    allowContainerResizing: true,
                    verticalAlignment: 'top',
                    horizontalAlignment: 'center',
                    format: '',
                    paddingLeftRight: 18,
                    paddingTopBottom: 15,
                    arrowLength: 10,
                    precision: 0,
                    color: '#ffffff',
                    border: {
                        width: 1,
                        color: '#d3d3d3',
                        dashStyle: 'solid',
                        visible: true
                    },
                    font: {
                        color: '#232323',
                        family: fontFamilyDefault,
                        size: 12,
                        weight: 400
                    },
                    shadow: {
                        opacity: 0.4,
                        offsetX: 0,
                        offsetY: 4,
                        blur: 2,
                        color: '#000000'
                    }
                }
            },
            bullet: {
                color: '#e8c267',
                targetColor: '#666666',
                targetWidth: 4,
                showTarget: true,
                showZeroLevel: true,
                tooltip: {
                    enabled: true,
                    allowContainerResizing: true,
                    verticalAlignment: 'top',
                    horizontalAlignment: 'center',
                    format: '',
                    precision: 0,
                    paddingLeftRight: 18,
                    paddingTopBottom: 15,
                    arrowLength: 10,
                    color: '#ffffff',
                    border: {
                        width: 1,
                        color: '#d3d3d3',
                        dashStyle: 'solid',
                        visible: true
                    },
                    font: {
                        color: '#232323',
                        family: fontFamilyDefault,
                        size: 12,
                        weight: 400
                    },
                    shadow: {
                        opacity: 0.4,
                        offsetX: 0,
                        offsetY: 4,
                        blur: 2,
                        color: '#000000'
                    }
                }
            }
        });
        DX.viz.core.registerTheme({
            name: 'desktop-dark',
            font: {color: '#808080'},
            chart: $.extend(true, {}, baseDarkChartTheme, {
                commonSeriesSettings: {candlestick: {innerColor: '#2b2b2b'}},
                crosshair: {color: '#515151'},
                commonAxisSettings: {
                    color: '#494949',
                    grid: {color: '#494949'},
                    tick: {color: '#494949'},
                    constantLineStyle: {color: '#ffffff'}
                },
                commonPaneSettings: {border: {color: '#494949'}}
            }),
            pie: $.extend(true, {}, baseDarkChartTheme),
            pieIE8: {commonSeriesSettings: {
                    pie: {
                        hoverStyle: {border: {color: '#2b2b2b'}},
                        selectionStyle: {border: {color: '#2b2b2b'}}
                    },
                    donut: {
                        hoverStyle: {border: {color: '#2b2b2b'}},
                        selectionStyle: {border: {color: '#2b2b2b'}}
                    },
                    doughnut: {
                        hoverStyle: {border: {color: '#2b2b2b'}},
                        selectionStyle: {border: {color: '#2b2b2b'}}
                    }
                }},
            gauge: {
                containerBackgroundColor: '#2b2b2b',
                scale: {
                    majorTick: {color: '#303030'},
                    minorTick: {color: '#303030'}
                },
                rangeContainer: {backgroundColor: '#b5b5b5'},
                valueIndicator: {
                    _default: {color: '#b5b5b5'},
                    rangebar: {color: '#84788b'},
                    twocolorneedle: {secondColor: '#ba544d'},
                    twocolorrectangle: {secondColor: '#ba544d'}
                },
                subvalueIndicator: {_default: {color: '#b7918f'}},
                valueIndicators: {
                    _default: {color: '#b5b5b5'},
                    rangebar: {color: '#84788b'},
                    twocolorneedle: {secondColor: '#ba544d'},
                    trianglemarker: {color: '#b7918f'},
                    textcloud: {color: '#ba544d'}
                },
                title: {font: {color: '#929292'}},
                subtitle: {font: {color: '#929292'}},
                loadingIndicator: {backgroundColor: '#2b2b2b'},
                tooltip: {
                    color: '#2b2b2b',
                    border: {color: '#494949'},
                    font: {color: '#929292'}
                }
            },
            barGauge: {
                title: {font: {color: '#929292'}},
                subtitle: {font: {color: '#929292'}},
                tooltip: {
                    color: '#2b2b2b',
                    border: {color: '#494949'},
                    font: {color: '#929292'}
                },
                loadingIndicator: {backgroundColor: '#2b2b2b'}
            },
            rangeSelector: {
                containerBackgroundColor: '#2b2b2b',
                scale: {tick: {
                        color: '#ffffff',
                        opacity: 0.05
                    }},
                loadingIndicator: {backgroundColor: '#2b2b2b'},
                sliderMarker: {
                    color: '#b5b5b5',
                    font: {color: '#303030'}
                },
                sliderHandle: {
                    color: '#ffffff',
                    opacity: 0.35
                },
                shutter: {
                    color: '#2b2b2b',
                    opacity: 0.9
                }
            },
            map: {
                background: {
                    borderColor: '#3f3f3f',
                    color: '#303030'
                },
                area: {
                    borderColor: '#303030',
                    color: '#686868',
                    hoveredBorderColor: '#ffffff',
                    selectedBorderColor: '#ffffff'
                },
                marker: {
                    font: {color: '#ffffff'},
                    _bubble: {
                        hoveredBorderColor: '#ffffff',
                        selectedBorderColor: '#ffffff'
                    },
                    _pie: {
                        hoveredBorderColor: '#ffffff',
                        selectedBorderColor: '#ffffff'
                    }
                },
                controlBar: {
                    borderColor: '#c7c7c7',
                    color: '#303030'
                },
                legend: {
                    border: {color: '#3f3f3f'},
                    backgroundColor: '#303030',
                    font: {color: '#ffffff'}
                },
                tooltip: {
                    color: '#2b2b2b',
                    border: {color: '#494949'},
                    font: {color: '#929292'}
                },
                loadingIndicator: {backgroundColor: '#2b2b2b'}
            },
            sparkline: {
                lineColor: '#c7c7c7',
                firstLastColor: '#c7c7c7',
                barPositiveColor: '#b8b8b8',
                barNegativeColor: '#8e8e8e',
                winColor: '#b8b8b8',
                lossColor: '#8e8e8e',
                pointColor: '#303030',
                tooltip: {
                    color: '#2b2b2b',
                    border: {color: '#494949'},
                    font: {color: '#929292'}
                }
            },
            bullet: {
                targetColor: '#8e8e8e',
                tooltip: {
                    color: '#2b2b2b',
                    border: {color: '#494949'},
                    font: {color: '#929292'}
                }
            }
        }, 'desktop')
    })(jQuery, DevExpress);
    /*! Module viz-core, file android.js */
    (function($, DX, undefined) {
        var baseChartTheme = {
                containerBackgroundColor: '#050506',
                title: {font: {color: '#ffffff'}},
                commonSeriesSettings: {label: {border: {color: '#4c4c4c'}}},
                legend: {
                    font: {
                        color: '#ffffff',
                        size: 11
                    },
                    border: {color: '#4c4c4c'}
                },
                loadingIndicator: {backgroundColor: '#050506'},
                tooltip: {
                    color: '#050506',
                    border: {color: '#4c4c4c'},
                    font: {color: '#ffffff'}
                }
            },
            baseLightChartTheme = {
                containerBackgroundColor: '#e8e8e8',
                title: {font: {color: '#808080'}},
                legend: {font: {
                        color: '#000000',
                        size: 11
                    }},
                loadingIndicator: {backgroundColor: '#e8e8e8'},
                tooltip: {
                    color: '#e8e8e8',
                    font: {color: '#808080'}
                }
            };
        DX.viz.core.registerTheme({
            name: 'android',
            chart: $.extend(true, {}, baseChartTheme, {
                commonSeriesSettings: {candlestick: {innerColor: '#050506'}},
                commonAxisSettings: {
                    color: '#4c4c4c',
                    grid: {color: '#4c4c4c'},
                    tick: {color: '#4c4c4c'},
                    title: {font: {color: '#545455'}},
                    label: {font: {
                            color: '#ffffff',
                            size: 11
                        }}
                },
                commonPaneSettings: {border: {color: '#4c4c4c'}}
            }),
            pie: $.extend(true, {}, baseChartTheme),
            pieIE8: {commonSeriesSettings: {
                    pie: {
                        hoverStyle: {border: {color: '#050506'}},
                        selectionStyle: {border: {color: '#050506'}}
                    },
                    donut: {
                        hoverStyle: {border: {color: '#050506'}},
                        selectionStyle: {border: {color: '#050506'}}
                    },
                    doughnut: {
                        hoverStyle: {border: {color: '#050506'}},
                        selectionStyle: {border: {color: '#050506'}}
                    }
                }},
            gauge: {
                containerBackgroundColor: '#050506',
                title: {font: {color: '#ffffff'}},
                subtitle: {font: {color: '#ffffff'}},
                loadingIndicator: {backgroundColor: '#050506'},
                tooltip: {
                    color: '#050506',
                    border: {color: '#4c4c4c'},
                    font: {color: '#ffffff'}
                }
            },
            barGauge: {
                title: {font: {color: '#ffffff'}},
                subtitle: {font: {color: '#ffffff'}},
                tooltip: {
                    color: '#050506',
                    border: {color: '#4c4c4c'},
                    font: {color: '#ffffff'}
                },
                loadingIndicator: {backgroundColor: '#050506'}
            },
            rangeSelector: {
                containerBackgroundColor: '#050506',
                loadingIndicator: {backgroundColor: '#050506'}
            },
            map: {
                loadingIndicator: {backgroundColor: '#050506'},
                tooltip: {
                    color: '#050506',
                    border: {color: '#4c4c4c'},
                    font: {color: '#ffffff'}
                }
            },
            sparkline: {tooltip: {
                    color: '#050506',
                    border: {color: '#4c4c4c'},
                    font: {color: '#ffffff'}
                }},
            bullet: {tooltip: {
                    color: '#050506',
                    border: {color: '#4c4c4c'},
                    font: {color: '#ffffff'}
                }}
        }, 'desktop-dark');
        DX.viz.core.registerTheme({
            name: 'android-holo-light',
            chart: $.extend(true, {}, baseLightChartTheme, {
                commonSeriesSettings: {candlestick: {innerColor: '#e8e8e8'}},
                commonAxisSettings: {
                    title: {font: {color: '#939393'}},
                    label: {font: {
                            color: '#404040',
                            size: 11
                        }}
                }
            }),
            pie: $.extend(true, {}, baseLightChartTheme),
            pieIE8: {commonSeriesSettings: {
                    pie: {
                        hoverStyle: {border: {color: '#e8e8e8'}},
                        selectionStyle: {border: {color: '#e8e8e8'}}
                    },
                    donut: {
                        hoverStyle: {border: {color: '#e8e8e8'}},
                        selectionStyle: {border: {color: '#e8e8e8'}}
                    },
                    doughnut: {
                        hoverStyle: {border: {color: '#e8e8e8'}},
                        selectionStyle: {border: {color: '#e8e8e8'}}
                    }
                }},
            gauge: {
                containerBackgroundColor: '#e8e8e8',
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                loadingIndicator: {backgroundColor: '#e8e8e8'},
                tooltip: {
                    color: '#e8e8e8',
                    font: {color: '#808080'}
                }
            },
            barGauge: {
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                tooltip: {
                    color: '#e8e8e8',
                    font: {color: '#808080'}
                },
                loadingIndicator: {backgroundColor: '#e8e8e8'}
            },
            rangeSelector: {
                containerBackgroundColor: '#e8e8e8',
                loadingIndicator: {backgroundColor: '#e8e8e8'}
            },
            map: {
                loadingIndicator: {backgroundColor: '#e8e8e8'},
                tooltip: {
                    color: '#e8e8e8',
                    font: {color: '#808080'}
                }
            },
            sparkline: {tooltip: {
                    color: '#e8e8e8',
                    font: {color: '#808080'}
                }},
            bullet: {tooltip: {
                    color: '#e8e8e8',
                    font: {color: '#808080'}
                }}
        }, 'desktop')
    })(jQuery, DevExpress);
    /*! Module viz-core, file ios.js */
    (function($, DX, undefined) {
        var baseChartTheme = {
                containerBackgroundColor: '#cbd0da',
                title: {font: {color: '#808080'}},
                commonSeriesSettings: {label: {border: {color: '#b0b3ba'}}},
                legend: {
                    font: {
                        color: '#000000',
                        size: 11
                    },
                    border: {color: '#b0b3ba'}
                },
                loadingIndicator: {backgroundColor: '#cbd0da'},
                tooltip: {font: {color: '#808080'}}
            },
            baseIos7ChartTheme = {
                containerBackgroundColor: '#ffffff',
                title: {font: {color: '#808080'}},
                commonSeriesSettings: {label: {border: {color: '#d3d3d3'}}},
                legend: {
                    font: {
                        color: '#000000',
                        size: 11
                    },
                    border: {color: '#d3d3d3'}
                },
                loadingIndicator: {backgroundColor: '#ffffff'},
                tooltip: {font: {color: '#808080'}}
            };
        DX.viz.core.registerTheme({
            name: 'ios',
            chart: $.extend(true, {}, baseChartTheme, {
                commonSeriesSettings: {candlestick: {innerColor: '#cbd0da'}},
                commonAxisSettings: {
                    color: '#b0b3ba',
                    grid: {color: '#b0b3ba'},
                    tick: {color: '#b0b3ba'},
                    title: {font: {color: '#939393'}},
                    label: {font: {
                            color: '#000000',
                            size: 11
                        }}
                },
                commonPaneSettings: {border: {color: '#b0b3ba'}}
            }),
            pie: $.extend(true, {}, baseChartTheme),
            pieIE8: {commonSeriesSettings: {
                    pie: {
                        hoverStyle: {border: {color: '#cbd0da'}},
                        selectionStyle: {border: {color: '#cbd0da'}}
                    },
                    donut: {
                        hoverStyle: {border: {color: '#cbd0da'}},
                        selectionStyle: {border: {color: '#cbd0da'}}
                    },
                    doughnut: {
                        hoverStyle: {border: {color: '#cbd0da'}},
                        selectionStyle: {border: {color: '#cbd0da'}}
                    }
                }},
            gauge: {
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                tooltip: {font: {color: '#808080'}}
            },
            barGauge: {
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                tooltip: {font: {color: '#808080'}}
            },
            map: {tooltip: {font: {color: '#808080'}}},
            sparkline: {tooltip: {font: {color: '#808080'}}},
            bullet: {tooltip: {font: {color: '#808080'}}}
        }, 'desktop');
        DX.viz.core.registerTheme({
            name: 'ios:7',
            chart: $.extend(true, {}, baseIos7ChartTheme, {
                commonAxisSettings: {
                    color: '#d3d3d3',
                    grid: {color: '#d3d3d3'},
                    tick: {color: '#d3d3d3'},
                    title: {font: {color: '#939393'}},
                    label: {font: {
                            color: '#000000',
                            size: 11
                        }}
                },
                commonPaneSettings: {border: {color: '#d3d3d3'}}
            }),
            pie: $.extend(true, {}, baseIos7ChartTheme),
            gauge: {
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                tooltip: {font: {color: '#808080'}}
            },
            barGauge: {
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                tooltip: {font: {color: '#808080'}}
            },
            map: {tooltip: {font: {color: '#808080'}}},
            sparkline: {tooltip: {font: {color: '#808080'}}},
            bullet: {tooltip: {font: {color: '#808080'}}}
        }, 'desktop')
    })(jQuery, DevExpress);
    /*! Module viz-core, file win8.js */
    (function($, DX) {
        var baseChartTheme = {
                containerBackgroundColor: '#000000',
                title: {font: {color: '#ffffff'}},
                commonSeriesSettings: {label: {border: {color: '#454545'}}},
                legend: {
                    font: {
                        color: '#ffffff',
                        size: 11
                    },
                    border: {color: '#454545'}
                },
                loadingIndicator: {backgroundColor: '#000000'},
                tooltip: {
                    color: '#000000',
                    font: {color: '#ffffff'}
                }
            },
            baseWhiteChartTheme = {
                title: {font: {color: '#808080'}},
                legend: {font: {
                        color: '#000000',
                        size: 11
                    }},
                tooltip: {font: {color: '#808080'}}
            };
        DX.viz.core.registerTheme({
            name: 'win8',
            chart: $.extend(true, {}, baseChartTheme, {
                commonSeriesSettings: {candlestick: {innerColor: '#000000'}},
                commonAxisSettings: {
                    color: '#454545',
                    grid: {color: '#454545'},
                    tick: {color: '#454545'},
                    title: {font: {color: '#535353'}},
                    label: {font: {
                            color: '#ffffff',
                            size: 11
                        }}
                },
                commonPaneSettings: {border: {color: '#454545'}}
            }),
            pie: $.extend(true, {}, baseChartTheme),
            pieIE8: {commonSeriesSettings: {
                    pie: {
                        hoverStyle: {border: {color: '#000000'}},
                        selectionStyle: {border: {color: '#000000'}}
                    },
                    donut: {
                        hoverStyle: {border: {color: '#000000'}},
                        selectionStyle: {border: {color: '#000000'}}
                    },
                    doughnut: {
                        hoverStyle: {border: {color: '#000000'}},
                        selectionStyle: {border: {color: '#000000'}}
                    }
                }},
            gauge: {
                containerBackgroundColor: '#000000',
                title: {font: {color: '#ffffff'}},
                subtitle: {font: {color: '#ffffff'}},
                loadingIndicator: {backgroundColor: '#000000'},
                tooltip: {
                    color: '#000000',
                    font: {color: '#ffffff'}
                }
            },
            barGauge: {
                title: {font: {color: '#ffffff'}},
                subtitle: {font: {color: '#ffffff'}},
                tooltip: {
                    color: '#000000',
                    font: {color: '#ffffff'}
                },
                loadingIndicator: {backgroundColor: '#000000'}
            },
            rangeSelector: {
                containerBackgroundColor: '#000000',
                loadingIndicator: {backgroundColor: '#000000'}
            },
            map: {
                loadingIndicator: {backgroundColor: '#000000'},
                tooltip: {
                    color: '#000000',
                    font: {color: '#ffffff'}
                }
            },
            sparkline: {tooltip: {
                    color: '#000000',
                    font: {color: '#ffffff'}
                }},
            bullet: {tooltip: {
                    color: '#000000',
                    font: {color: '#ffffff'}
                }}
        }, 'desktop-dark');
        DX.viz.core.registerTheme({
            name: 'win8-white',
            chart: $.extend(true, {}, baseWhiteChartTheme, {commonAxisSettings: {
                    title: {font: {color: '#939393'}},
                    label: {font: {
                            color: '#404040',
                            size: 11
                        }}
                }}),
            pie: $.extend(true, {}, baseWhiteChartTheme),
            gauge: {
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                tooltip: {font: {color: '#808080'}}
            },
            barGauge: {
                title: {font: {color: '#808080'}},
                subtitle: {font: {color: '#808080'}},
                tooltip: {font: {color: '#808080'}}
            },
            map: {tooltip: {font: {color: '#808080'}}},
            sparkline: {tooltip: {font: {color: '#808080'}}},
            bullet: {tooltip: {font: {color: '#808080'}}}
        }, 'desktop')
    })(jQuery, DevExpress);
    /*! Module viz-core, file others.js */
    (function($, DX) {
        DX.viz.core.registerTheme({name: 'generic'}, 'desktop');
        DX.viz.core.registerTheme({name: 'generic-dark'}, 'desktop-dark');
        DX.viz.core.registerTheme({name: 'tizen'}, 'desktop');
        DX.viz.core.registerTheme({name: 'tizen-black'}, 'desktop-dark')
    })(jQuery, DevExpress);
    /*! Module viz-core, file namespaces.js */
    (function(DevExpress) {
        DevExpress.viz.renderers = {}
    })(DevExpress);
    /*! Module viz-core, file svgRenderer.js */
    (function($, DX) {
        var renderers = DX.viz.renderers,
            utils = DX.utils,
            Class = DX.Class,
            doc = document,
            MAX_PIXEL_COUNT = 10000000000;
        function createElement(name) {
            return doc.createElementNS('http://www.w3.org/2000/svg', name)
        }
        function getPatternUrl(id, pathModified) {
            return id !== null ? 'url(' + (pathModified ? window.location.href : '') + '#' + id + ')' : null
        }
        var BaseSvgElement = Class.inherit({
                ctor: function baseSvgElementCtor(renderer, name, params) {
                    this.renderer = renderer;
                    this.element = this.createElement(name);
                    this.$element = $(this.element);
                    this.applySettings($.extend({}, this.defaultSettings(), params));
                    this.__passedParams = params
                },
                defaultSettings: $.noop,
                createElement: function(nodeName) {
                    this._nodeName = nodeName;
                    return createElement(nodeName)
                },
                dispose: function() {
                    this.off();
                    this.remove();
                    this.renderer = null;
                    this.element = null;
                    this.settings = null;
                    this.$element = null;
                    this.transformation = null;
                    this.__passedParams = null;
                    this.__appliedSettings = null;
                    this.__appliedStyle = null
                },
                append: function(svgElement) {
                    var toElement = svgElement || this.renderer.getRoot();
                    toElement.element.appendChild(this.element);
                    return this
                },
                insertBefore: function(target) {
                    target.element.parentNode.insertBefore(this.element, target.element);
                    return this
                },
                toBackground: function() {
                    this.element.parentNode && this.element.parentNode.insertBefore(this.element, this.element.parentNode.firstChild);
                    return this
                },
                toForeground: function() {
                    this.element.parentNode && this.element.parentNode.appendChild(this.element);
                    return this
                },
                addClass: function(className) {
                    var classAttribute = this.$element.attr('class'),
                        classNameIndex,
                        classNames;
                    if (className) {
                        if (classAttribute) {
                            classNames = classAttribute.split(' ');
                            classNameIndex = $.inArray(className, classNames);
                            if (classNameIndex === -1)
                                classAttribute += ' ' + className
                        }
                        else
                            classAttribute = className;
                        this.$element.attr('class', classAttribute)
                    }
                    return this.$element
                },
                removeClass: function(className) {
                    var classAttribute = this.$element.attr('class'),
                        classNames,
                        indexDeleteElement,
                        resultClassNames = '',
                        i;
                    if (classAttribute && className) {
                        classNames = classAttribute.split(' ');
                        indexDeleteElement = $.inArray(className, classNames);
                        if (indexDeleteElement !== -1) {
                            for (i = 0; i < classNames.length; i++)
                                if (i !== indexDeleteElement)
                                    resultClassNames += classNames[i] + ' ';
                            this.$element.attr('class', resultClassNames.replace(/ $/, ''))
                        }
                    }
                    return this.$element
                },
                applySettings: function(settings) {
                    var normalized;
                    this.settings = $.extend(this.settings || {}, settings || {});
                    this.adjustSettings();
                    normalized = this._normalizeSettings(this.settings);
                    this.applyStyle(this._style);
                    this._applyAttributes(normalized);
                    return this
                },
                _applyAttributes: function(settings) {
                    this.$element.attr(settings);
                    this.__appliedSettings = settings
                },
                adjustSettings: function(){},
                applyStyle: function(style) {
                    this.$element.css(style || {});
                    this.__appliedStyle = style || {};
                    return this
                },
                trigger: function(event, data) {
                    this.$element.trigger(event, data)
                },
                on: function(events, data, handler) {
                    this.$element.on.apply(this.$element, arguments);
                    return this
                },
                data: function(key, value) {
                    this.$element.data(key, value);
                    return this
                },
                removeData: function() {
                    this.$element.removeData();
                    return this
                },
                off: function(events) {
                    this.$element.off(events);
                    return this
                },
                getBBox: function() {
                    var that = this,
                        bBox,
                        element = this.element,
                        transformation = that.transformation,
                        rotateAngle = transformation.rotateAngle || 0,
                        rotateX = transformation.rotateX || 0,
                        rotateY = transformation.rotateY || 0,
                        mabs = Math.abs,
                        mmin = Math.min;
                    function bBox(el) {
                        var ret = {};
                        try {
                            if (!$.isFunction(el.getBBox))
                                throw{};
                            else
                                ret = el.getBBox()
                        }
                        catch(e) {
                            ret = {
                                x: 0,
                                y: 0,
                                width: el.offsetWidth || 0,
                                height: el.offsetHeight || 0
                            }
                        }
                        return ret
                    }
                    bBox = $.extend({}, bBox(element));
                    if (rotateAngle) {
                        var cossin = utils.getCosAndSin(rotateAngle),
                            sin = cossin.sin.toFixed(3),
                            cos = cossin.cos.toFixed(3),
                            ltx = bBox.x - rotateX,
                            lty = bBox.y - rotateY,
                            rtx = bBox.x + bBox.width - rotateX,
                            rty = bBox.y - rotateY,
                            lbx = bBox.x - rotateX,
                            lby = bBox.y + bBox.height - rotateY,
                            rbx = bBox.x + bBox.width - rotateX,
                            rby = bBox.y + bBox.height - rotateY,
                            w,
                            h;
                        w = mabs(bBox.height * sin) + mabs(bBox.width * cos);
                        h = mabs(bBox.height * cos) + mabs(bBox.width * sin);
                        bBox.x = mmin(ltx * cos - lty * sin + rotateX, rtx * cos - rty * sin + rotateX, lbx * cos - lby * sin + rotateX, rbx * cos - rby * sin + rotateX);
                        bBox.y = mmin(ltx * sin + lty * cos + rotateY, rtx * sin + rty * cos + rotateY, lbx * sin + lby * cos + rotateY, rbx * sin + rby * cos + rotateY);
                        bBox.width = w;
                        bBox.height = h
                    }
                    return that._normalizeBBox(bBox)
                },
                _normalizeBBox: function(bBox) {
                    var ceil = Math.ceil,
                        floor = Math.floor,
                        $isNumeric = $.isNumeric,
                        rxl = floor(bBox.x),
                        ryt = floor(bBox.y),
                        rxr = ceil(bBox.width + bBox.x),
                        ryb = ceil(bBox.height + bBox.y),
                        width,
                        height;
                    bBox.x = $isNumeric(rxl) && rxl < MAX_PIXEL_COUNT && rxl > -MAX_PIXEL_COUNT ? rxl : 0;
                    bBox.y = $isNumeric(ryt) && ryt < MAX_PIXEL_COUNT && ryt > -MAX_PIXEL_COUNT ? ryt : 0;
                    width = rxr - rxl;
                    height = ryb - ryt;
                    bBox.width = $isNumeric(width) && width < MAX_PIXEL_COUNT && width > -MAX_PIXEL_COUNT ? width : 0;
                    bBox.height = $isNumeric(height) && height < MAX_PIXEL_COUNT && height > -MAX_PIXEL_COUNT ? height : 0;
                    bBox.isEmpty = !bBox.x && !bBox.y && !bBox.width && !bBox.height;
                    return bBox
                },
                clear: function(selector) {
                    selector ? this.$element.find(selector).remove() : this.$element.empty();
                    return this
                },
                detach: function() {
                    this.$element.detach();
                    return this
                },
                animate: function(params, options, complete) {
                    options = options || {};
                    var that = this,
                        animationParams = {};
                    if (complete)
                        $.extend(options, {complete: complete});
                    if (this.renderer.animOptions.enabled) {
                        $.each(params, function(name, to) {
                            switch (name) {
                                case'scale':
                                    animationParams['transform'] = animationParams['transform'] || {};
                                    var scale = that.transformation.scale || {};
                                    animationParams['transform'].scale = {
                                        x: {
                                            from: utils.isDefined(scale.x) ? scale.x : 1,
                                            to: utils.isDefined(to.x) ? to.x : 1
                                        },
                                        y: {
                                            from: utils.isDefined(scale.y) ? scale.y : 1,
                                            to: utils.isDefined(to.y) ? to.y : 1
                                        }
                                    };
                                    break;
                                case'rotate':
                                    animationParams['transform'] = animationParams['transform'] || {};
                                    animationParams['transform'].rotate = {
                                        angle: {
                                            from: that.transformation.rotateAngle || 0,
                                            to: to.angle
                                        },
                                        y: to.y || 0,
                                        x: to.x || 0
                                    };
                                    break;
                                case'translate':
                                    animationParams['transform'] = animationParams['transform'] || {};
                                    animationParams['transform'].translate = {
                                        x: {
                                            from: that.transformation.translateX || 0,
                                            to: to.x || 0
                                        },
                                        y: {
                                            from: that.transformation.translateY || 0,
                                            to: to.y || 0
                                        }
                                    };
                                    break;
                                case'arc':
                                case'points':
                                    animationParams[name] = to;
                                    break;
                                default:
                                    animationParams[name] = {
                                        from: that.settings[name] || 0,
                                        to: to
                                    }
                            }
                        });
                        that.renderer.animateElement(that, animationParams, $.extend({}, this.renderer.animOptions, options))
                    }
                    else {
                        if (params.translate) {
                            if ('x' in params.translate)
                                params.translateX = params.translate.x;
                            if ('y' in params.translate)
                                params.translateY = params.translate.y;
                            delete params.translate
                        }
                        if (options) {
                            options.step && options.step.call(that, 1, 1);
                            options.complete && options.complete.call(that)
                        }
                        this.applySettings(params)
                    }
                },
                stopAnimation: function(disableComplete) {
                    var that = this;
                    that.animation && that.animation.stop(true, disableComplete);
                    return that
                },
                move: function(x, y, animate, animOptions) {
                    x = x || 0,
                    y = y || 0;
                    animOptions = animOptions || {};
                    if (!animate)
                        this.applySettings({
                            translateX: x,
                            translateY: y
                        });
                    else
                        this.animate({translate: {
                                x: x,
                                y: y
                            }}, animOptions);
                    return this
                },
                rotate: function(angle, x, y, animate, animOptions) {
                    angle = angle || 0;
                    x = x || 0;
                    y = y || 0;
                    animOptions = animOptions || {};
                    if (!animate)
                        this.applySettings({rotate: [angle, x, y]});
                    else
                        this.animate({rotate: {
                                angle: angle,
                                x: x,
                                y: y
                            }}, animOptions)
                },
                remove: function() {
                    this.$element.remove()
                },
                _normalizeSettings: function(settings) {
                    var key,
                        style,
                        firstChar,
                        styleName,
                        prop,
                        value,
                        normalized = {},
                        fontSetting,
                        rtl = this.renderer.rtl;
                    for (key in settings) {
                        prop = key,
                        value = settings[prop];
                        if (prop === 'align') {
                            prop = 'text-anchor';
                            value = {
                                left: rtl ? 'end' : 'start',
                                center: 'middle',
                                right: rtl ? 'start' : 'end'
                            }[value]
                        }
                        else if (prop === 'font') {
                            style = this['_style'] = this['_style'] || {};
                            if (!$.isPlainObject(value))
                                continue;
                            $.each(value, function(fontSetting) {
                                switch (fontSetting) {
                                    case'color':
                                        styleName = 'fill';
                                        break;
                                    case'opacity':
                                        styleName = 'fillOpacity';
                                        break;
                                    case'cursor':
                                        styleName = fontSetting;
                                        break;
                                    default:
                                        firstChar = fontSetting.charAt(0);
                                        styleName = 'font' + fontSetting.replace(firstChar, firstChar.toUpperCase())
                                }
                                style[styleName] = value[fontSetting]
                            });
                            continue
                        }
                        else if (prop === 'dashStyle') {
                            prop = 'stroke-dasharray';
                            value = value.toLowerCase();
                            if (value === 'solid' || value === 'none')
                                value = null;
                            else {
                                value = value.replace(/longdash/g, '8,3,').replace(/dash/g, '4,3,').replace(/dot/g, '1,3,').replace(/,$/, '').split(',');
                                value = $.map(value, function(p) {
                                    return +p * (settings.strokeWidth || 1)
                                }).join(',')
                            }
                        }
                        else if (/^(linecap|linejoin)$/i.test(prop))
                            prop = 'stroke-' + prop;
                        else if (/^(translateX|translateY|rotate|scale)$/i.test(prop)) {
                            this['_' + prop] = value;
                            continue
                        }
                        else if (prop === 'clipId') {
                            prop = 'clip-path';
                            value = getPatternUrl(value, this.renderer.pathModified)
                        }
                        else if (prop === 'style') {
                            this['_style'] = this['_style'] || {};
                            $.extend(true, this['_style'], value);
                            continue
                        }
                        else if (prop === 'sharpEdges')
                            continue;
                        else if (prop === 'text')
                            continue;
                        else if (prop === 'segments')
                            continue;
                        else
                            prop = DX.inflector.dasherize(prop);
                        normalized[prop] = value
                    }
                    return this._applyTransformation(normalized)
                },
                _applyTransformation: function(settings) {
                    this.transformation = {
                        translateX: this._translateX,
                        translateY: this._translateY,
                        rotateAngle: 0,
                        rotateX: 0,
                        rotateY: 0
                    };
                    var tr = this.transformation,
                        rotate = this._rotate,
                        scale = this._scale,
                        transformations = [];
                    if (utils.isDefined(tr.translateX) || utils.isDefined(tr.translateY))
                        transformations.push('translate(' + (tr.translateX || 0) + ',' + (tr.translateY || 0) + ')');
                    if (utils.isDefined(rotate)) {
                        if (utils.isNumber(rotate)) {
                            tr.rotateAngle = rotate;
                            tr.rotateX = settings.x || 0;
                            tr.rotateY = settings.y || 0
                        }
                        else if ($.isArray(rotate)) {
                            tr.rotateAngle = rotate[0] || 0;
                            tr.rotateX = rotate[1] || 0;
                            tr.rotateY = rotate[2] || 0
                        }
                        else if (utils.isObject(rotate)) {
                            tr.rotateAngle = rotate.angle || 0;
                            tr.rotateX = rotate.x || 0;
                            tr.rotateY = rotate.y || 0
                        }
                        transformations.push('rotate(' + tr.rotateAngle + ',' + tr.rotateX + ',' + tr.rotateY + ')')
                    }
                    if (utils.isNumber(scale)) {
                        var value = utils.isDefined(scale) ? scale : 1;
                        transformations.push('scale(' + value + ',' + value + ')');
                        tr.scale = {
                            x: value,
                            y: value
                        }
                    }
                    else if (utils.isObject(scale)) {
                        var valueX = utils.isDefined(scale.x) ? scale.x : 1;
                        var valueY = utils.isDefined(scale.y) ? scale.y : 1;
                        transformations.push('scale(' + valueX + ',' + valueY + ')');
                        tr.scale = {
                            x: valueX,
                            y: valueY
                        }
                    }
                    if (transformations.length)
                        settings.transform = transformations.join(' ');
                    return settings
                }
            });
        var RootSvgElement = BaseSvgElement.inherit({
                defaultSettings: function() {
                    return {
                            width: 0,
                            height: 0,
                            style: {
                                '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
                                display: 'block',
                                overflow: 'hidden'
                            },
                            xmlns: 'http://www.w3.org/2000/svg',
                            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                            version: '1.1',
                            stroke: 'none',
                            strokeWidth: 0,
                            fill: 'none'
                        }
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'svg', params)
                }
            });
        var RectSvgBaseElement = {
                defaultSettings: function() {
                    return {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        }
                },
                adjustSettings: function() {
                    if (!utils.isDefined(this.settings.sharpEdges) || this.settings.sharpEdges) {
                        this.sharpEdges();
                        delete this.settings.sharpEdges
                    }
                },
                prepareSettings: function(settings) {
                    var prevStrokeWidth = this.settings ? Number(this.settings.strokeWidth) || 0 : 0,
                        newStrokeWidth,
                        maxStrokeWidth,
                        strokeWidthChanged = false;
                    if (utils.isDefined(settings.width))
                        this._realWidth = Number(settings.width);
                    if (utils.isDefined(settings.height))
                        this._realHeight = Number(settings.height);
                    if (utils.isDefined(settings.x))
                        this._realX = Number(settings.x);
                    if (utils.isDefined(settings.y))
                        this._realY = Number(settings.y);
                    if (utils.isDefined(settings.strokeWidth))
                        this._realStrokeWidth = Number(settings.strokeWidth);
                    this._realStrokeWidth = this._realStrokeWidth || this.defaultSettings().strokeWidth || 0;
                    maxStrokeWidth = ~~((this._realWidth < this._realHeight ? this._realWidth : this._realHeight) / 2);
                    newStrokeWidth = this._realStrokeWidth < maxStrokeWidth ? this._realStrokeWidth : maxStrokeWidth;
                    if (newStrokeWidth !== prevStrokeWidth) {
                        strokeWidthChanged = true;
                        settings.sharpEdges = true;
                        newStrokeWidth > 0 && (settings.strokeWidth = newStrokeWidth)
                    }
                    (utils.isDefined(settings.x) || strokeWidthChanged) && (settings.x = this._realX + newStrokeWidth / 2);
                    (utils.isDefined(settings.y) || strokeWidthChanged) && (settings.y = this._realY + newStrokeWidth / 2);
                    (utils.isDefined(settings.width) || strokeWidthChanged) && (settings.width = this._realWidth - newStrokeWidth);
                    (utils.isDefined(settings.height) || strokeWidthChanged) && (settings.height = this._realHeight - newStrokeWidth)
                },
                applySettings: function(settings) {
                    var settings = $.extend(true, {}, settings);
                    this.prepareSettings(settings);
                    return this.callBase(settings)
                },
                sharpEdges: function() {
                    var strokeWidth = Math.round(this.settings.strokeWidth || 0),
                        correction = strokeWidth % 2 / 2;
                    this.settings.x = Math.floor(this.settings.x - correction || 0) + correction;
                    this.settings.y = Math.floor(this.settings.y - correction || 0) + correction;
                    this.settings.width = Math.floor(this.settings.width || 0);
                    this.settings.height = Math.floor(this.settings.height || 0);
                    this.settings.strokeWidth > 0 && (this.settings.strokeWidth = strokeWidth)
                }
            };
        var ImageSvgElement = BaseSvgElement.inherit(RectSvgBaseElement).inherit({
                ctor: function(renderer, params, href, location) {
                    var locationToPreserveAspectRatioMap = {
                            full: 'none',
                            lefttop: 'xMinYMin',
                            leftcenter: 'xMinYMid',
                            leftbottom: 'xMinYMax',
                            centertop: 'xMidYMin',
                            center: 'xMidYMid',
                            centerbottom: 'xMidYMax',
                            righttop: 'xMaxYMin',
                            rightcenter: 'xMaxYMid',
                            rightbottom: 'xMaxYMax'
                        };
                    this.href = utils.isDefined(href) ? href : '';
                    this.preserveAspectRatio = locationToPreserveAspectRatioMap[(location || '').toLowerCase()];
                    this.preserveAspectRatio = this.preserveAspectRatio || 'none';
                    this.callBase(renderer, 'image', params)
                },
                adjustSettings: function() {
                    this.callBase();
                    this.element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.href);
                    if (this.preserveAspectRatio)
                        this.element.setAttribute('preserveAspectRatio', this.preserveAspectRatio)
                }
            });
        var RectSvgElement = BaseSvgElement.inherit(RectSvgBaseElement).inherit({
                defaultSettings: function() {
                    return {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            rx: 0,
                            ry: 0
                        }
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'rect', params)
                }
            });
        var PathSvgElement = BaseSvgElement.inherit({
                defaultSettings: function() {
                    return {points: {
                                x: 0,
                                y: 0
                            }}
                },
                getNodeName: function() {
                    return 'path'
                },
                getPathAttributeName: function() {
                    return 'd'
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, this.getNodeName(), params)
                },
                dispose: function() {
                    this.segments = null;
                    this.fromSegments = null;
                    this.callBase()
                },
                adjustSettings: function() {
                    this.prepareSegments(this.settings)
                },
                applySettings: function(settings) {
                    var settings = settings || {};
                    if (this.settings && settings.strokeWidth && this.settings.strokeWidth !== settings.strokeWidth)
                        settings.sharpEdges = true;
                    return this.callBase(settings)
                },
                prepareSegments: function(params) {
                    if ('points' in params) {
                        var points = params.points,
                            firstElem = points[0],
                            close = this.closePath || params.closePath,
                            segments = [],
                            i;
                        if (utils.isObject(firstElem))
                            segments = $.map(points, function(pt, i) {
                                if (!pt)
                                    return null;
                                if (!i)
                                    return [['M', pt.x, pt.y]];
                                return [['L', pt.x, pt.y]]
                            });
                        else if (utils.isNumber(firstElem))
                            for (i = 0; i < points.length; i += 2) {
                                if (!i) {
                                    segments = [['M', points[i] || 0, points[i + 1] || 0]];
                                    continue
                                }
                                segments.push(['L', points[i] || 0, points[i + 1] || 0])
                            }
                        else
                            segments = [['M', 0, 0]];
                        if (close)
                            segments.push(['Z']);
                        this.segments = segments;
                        delete params.points;
                        delete params.closePath;
                        params.sharpEdges = true
                    }
                    if (params.sharpEdges) {
                        this.sharpEdges();
                        this.combinePathParams(params);
                        delete params.sharpEdges
                    }
                },
                customizeSegments: function(segments) {
                    return segments
                },
                combinePathParams: function(params) {
                    var path;
                    this.segments = this.customizeSegments(this.segments);
                    if (this.segments) {
                        path = $.map(this.segments, function(seg, i) {
                            return seg.join(' ')
                        });
                        path = path.join(' ');
                        params[this.getPathAttributeName()] = path
                    }
                },
                _prepareDifferrentPath: function(from, to) {
                    var end = {},
                        constsSeg;
                    if (to.length > from.length)
                        this._makeEqualPath(from, to);
                    else {
                        this.combinePathParams(end);
                        this._makeEqualPath(to, from)
                    }
                    return end.d
                },
                _prepareConstSegment: function(seg) {
                    seg[0] = "L"
                },
                _makeEqualPath: function(short, long) {
                    var constSeg = short[short.length - 1].slice();
                    this._prepareConstSegment(constSeg);
                    for (var i = short.length; i < long.length; i++)
                        short[i] = constSeg
                },
                animate: function(params, options, complete) {
                    var that = this;
                    if (!('points' in params) || !that.renderer.animOptions.enabled)
                        return that.callBase(params, options, complete);
                    var fromPath = that.segments,
                        end;
                    that.prepareSegments(params);
                    delete params.d;
                    if (fromPath.length === that.segments.length)
                        params.points = {
                            from: fromPath,
                            to: that.segments
                        };
                    else
                        end = that._prepareDifferrentPath(fromPath, that.segments);
                    params.points = {
                        from: fromPath,
                        to: that.segments,
                        end: end
                    };
                    that.callBase(params, options, complete)
                },
                sharpEdges: function() {
                    var that = this,
                        segLength = that.segments.length,
                        i = 0,
                        curSeg,
                        nextSeg,
                        curX,
                        curY,
                        nextX,
                        nextY,
                        curXIdx,
                        curYIdx,
                        nextXIdx,
                        nextYIdx,
                        strokeWidth = Math.round(that.settings.strokeWidth || 0),
                        correction = strokeWidth % 2 / 2;
                    for (i; i < segLength - 1; i++) {
                        curSeg = that.segments[i];
                        nextSeg = that.segments[i + 1];
                        if (nextSeg[0] === 'Z' && i)
                            nextSeg = that.segments[0];
                        switch (curSeg[0]) {
                            case'M':
                            case'L':
                                curXIdx = 1;
                                curYIdx = 2;
                                break;
                            case'C':
                                curXIdx = 5;
                                curYIdx = 6;
                                break;
                            case'A':
                                curXIdx = 6;
                                curYIdx = 7;
                                break;
                            case'Z':
                                continue
                        }
                        switch (nextSeg[0]) {
                            case'M':
                            case'L':
                                nextXIdx = 1;
                                nextYIdx = 2;
                                break;
                            case'C':
                                nextXIdx = 5;
                                nextYIdx = 6;
                                break;
                            case'A':
                                nextXIdx = 6;
                                nextYIdx = 7;
                                break;
                            case'Z':
                                continue
                        }
                        curX = Math.floor(curSeg[curXIdx]);
                        curY = Math.floor(curSeg[curYIdx]);
                        nextX = nextSeg[nextXIdx] = Math.floor(nextSeg[nextXIdx]);
                        nextY = nextSeg[nextYIdx] = Math.floor(nextSeg[nextYIdx]);
                        curSeg[curXIdx] = i == 0 ? curX : curSeg[curXIdx];
                        curSeg[curYIdx] = i == 0 ? curY : curSeg[curYIdx];
                        if (curX == nextX) {
                            curSeg[curXIdx] = curX + correction;
                            nextSeg[nextXIdx] = nextX + correction
                        }
                        if (curY == nextY) {
                            curSeg[curYIdx] = curY + correction;
                            nextSeg[nextYIdx] = nextY + correction
                        }
                    }
                }
            });
        var SegmentRectSvgElement = PathSvgElement.inherit(RectSvgBaseElement).inherit({
                defaultSettings: function() {
                    return $.extend(true, {}, this.callBase(), {segments: {
                                top: true,
                                bottom: true,
                                left: true,
                                right: true
                            }})
                },
                prepareSegments: function() {
                    var that = this,
                        settings = that.settings,
                        left = settings.x,
                        right = left + settings.width,
                        top = settings.y,
                        bottom = top + settings.height,
                        segments = [],
                        segmentSequence,
                        visiblyOpt = 0,
                        prevSegmentVisibility = 0;
                    var allSegment = {
                            top: [['M', left, top], ['L', right, top]],
                            right: [['M', right, top], ['L', right, bottom]],
                            bottom: [['M', right, bottom], ['L', left, bottom]],
                            left: [['M', left, bottom], ['L', left, top]]
                        };
                    $.each(allSegment, function(seg, _) {
                        var visibility = !!that.settings.segments[seg];
                        visiblyOpt = visiblyOpt * 2 + ~~visibility
                    });
                    switch (visiblyOpt) {
                        case(13):
                        case(9):
                            segmentSequence = ['left', 'top', 'right', 'bottom'];
                            break;
                        case(11):
                            segmentSequence = ['bottom', 'left', 'top', 'right'];
                            break;
                        default:
                            segmentSequence = ['top', 'right', 'bottom', 'left']
                    }
                    $.each(segmentSequence, function(_, seg) {
                        var segmentVisibility = !!that.settings.segments[seg];
                        if (segmentVisibility)
                            $.each(allSegment[seg].slice(prevSegmentVisibility), function(_, segment) {
                                segments.push(segment)
                            });
                        prevSegmentVisibility = ~~segmentVisibility
                    });
                    visiblyOpt == 15 && segments.push(['Z']);
                    this.segments = segments.length ? segments : [['M', 0, 0], ['Z']];
                    this.combinePathParams(settings)
                },
                adjustSettings: function() {
                    this.callBase();
                    this.prepareSegments()
                },
                applySettings: function(settings) {
                    var segments = this.settings && this.settings.segments || this.defaultSettings().segments;
                    settings.segments = $.extend(true, {}, segments || {}, settings.segments);
                    return this.callBase(settings)
                }
            });
        var baseAreaElement = {
                defaultSettings: function() {
                    return {points: {
                                x: 0,
                                y: 0
                            }}
                },
                ctor: function(renderer, params) {
                    this.closePath = true;
                    this.callBase(renderer, params)
                },
                _tailIndex: 0,
                _makeEqualPath: function(short, long) {
                    var i,
                        tail,
                        head,
                        constsSeg1,
                        constsSeg2,
                        newTail = [];
                    if ((short.length - 1) % 2 == 0 && (long.length - 1) % 2 == 0) {
                        i = (short.length - 1) / 2 - 1;
                        tail = short.slice(i + 1);
                        head = short.slice(0, i + 1);
                        constsSeg1 = head[head.length - 1];
                        constsSeg2 = tail[this._tailIndex];
                        this._prepareConstSegment(constsSeg1);
                        for (var j = i; j < (long.length - 1) / 2 - 1; j++) {
                            head.push(constsSeg1);
                            newTail.push(constsSeg2)
                        }
                        head = this._concatAnimationSegment(head, newTail, tail);
                        for (i = 0; i < head.length; i++)
                            short[i] = head[i]
                    }
                },
                _concatAnimationSegment: function(head, newTail, tail) {
                    return head.concat(newTail, tail)
                }
            };
        var AreaSvgElement = PathSvgElement.inherit(baseAreaElement);
        var BezierSvgElement = PathSvgElement.inherit({
                defaultSettings: function() {
                    return {points: {
                                x: 0,
                                y: 0
                            }}
                },
                _prepareConstSegment: function(seg) {
                    var x = seg[seg.length - 2],
                        y = seg[seg.length - 1];
                    seg[0] = "C";
                    seg[5] = seg[3] = seg[1] = x;
                    seg[6] = seg[4] = seg[2] = y
                },
                prepareSegments: function(params) {
                    if (!('points' in params))
                        return;
                    var points = params.points,
                        firstElem = points[0],
                        close = this.closePath || params.closePath,
                        segments = [],
                        seg = [],
                        i,
                        x,
                        y;
                    var cnt = 0;
                    if (utils.isObject(firstElem)) {
                        for (i = 0; i < points.length; i++) {
                            x = points[i].x;
                            y = points[i].y;
                            if (!i) {
                                segments = [['M', x, y]];
                                continue
                            }
                            if ((i - 1) % 3 == 0) {
                                if (seg.length > 0)
                                    segments.push(seg);
                                seg = ['C', x, y];
                                continue
                            }
                            seg.push(x);
                            seg.push(y)
                        }
                        if (seg.length > 0)
                            segments.push(seg)
                    }
                    else if (utils.isNumber(firstElem)) {
                        for (i = 0; i < points.length; i += 2) {
                            x = points[i];
                            y = points[i + 1];
                            if (!i) {
                                segments = [['M', x, y || 0]];
                                continue
                            }
                            if ((i - 2) % 6 == 0) {
                                if (seg.length > 0)
                                    segments.push(seg);
                                seg = ['C', x, y || 0];
                                continue
                            }
                            seg.push(x);
                            seg.push(y || 0)
                        }
                        if (seg.length > 0)
                            segments.push(seg)
                    }
                    else
                        segments = [['M', 0, 0]];
                    if (close)
                        segments.push(['Z']);
                    this.segments = segments;
                    delete params.points;
                    delete params.closePath;
                    this.combinePathParams(params)
                }
            });
        var BezierAreaSvgElement = BezierSvgElement.inherit(baseAreaElement).inherit({
                _concatAnimationSegment: function(head, newTail, tail) {
                    var point = tail.splice(0, 1);
                    return head.concat(point.concat(newTail), tail)
                },
                _tailIndex: 1
            });
        var ArcSvgElement = PathSvgElement.inherit({
                defaultSettings: function() {
                    return {
                            x: 0,
                            y: 0,
                            linejoin: 'round'
                        }
                },
                createArcSegments: function(x, y, innerR, outerR, startAngle, endAngle, isCircle) {
                    var longFlag = Math.floor(Math.abs(endAngle - startAngle) / Math.PI) % 2 ? '1' : '0',
                        xOuterStart = x + outerR * Math.cos(startAngle),
                        yOuterStart = y - outerR * Math.sin(startAngle),
                        xOuterEnd = x + outerR * Math.cos(endAngle),
                        yOuterEnd = y - outerR * Math.sin(endAngle),
                        xInnerStart = x + innerR * Math.cos(endAngle),
                        yInnerStart = y - innerR * Math.sin(endAngle),
                        xInnerEnd = x + innerR * Math.cos(startAngle),
                        yInnerEnd = y - innerR * Math.sin(startAngle);
                    return [['M', xOuterStart, yOuterStart], ['A', outerR, outerR, 0, longFlag, 0, xOuterEnd, yOuterEnd], [isCircle ? 'M' : 'L', xInnerStart, yInnerStart], ['A', innerR, innerR, 0, longFlag, 1, xInnerEnd, yInnerEnd], ['Z']]
                },
                prepareSegments: function(params) {
                    if (!('x' in params) && !('y' in params) && !('outerRadius' in params) && !('innerRadius' in params) && !('startAngle' in params) && !('endAngle' in params))
                        return;
                    var x = utils.isNumber(params.x) ? Number(params.x) : 0,
                        y = utils.isNumber(params.y) ? Number(params.y) : 0,
                        outerR = utils.isNumber(params.outerRadius) ? Number(params.outerRadius) : 0,
                        innerR = utils.isNumber(params.innerRadius) ? Number(params.innerRadius) : 0,
                        startAngle = utils.isNumber(params.startAngle) ? Number(params.startAngle) : 0,
                        endAngle = utils.isNumber(params.endAngle) ? Number(params.endAngle) : 360,
                        isCircle;
                    this.segments = [['M', 0, 0], ['Z']];
                    if (outerR || innerR) {
                        var tmp = Math.min(outerR, innerR);
                        outerR = Math.max(outerR, innerR);
                        innerR = tmp;
                        if (Math.round(startAngle) != Math.round(endAngle)) {
                            if (Math.abs(endAngle - startAngle) % 360 == 0) {
                                startAngle = 0;
                                endAngle = 360;
                                isCircle = true;
                                endAngle -= 0.0001
                            }
                            if (startAngle > 360)
                                startAngle = startAngle % 360;
                            if (endAngle > 360)
                                endAngle = endAngle % 360;
                            if (startAngle > endAngle)
                                startAngle -= 360;
                            startAngle = startAngle * Math.PI / 180;
                            endAngle = endAngle * Math.PI / 180;
                            this.segments = this.createArcSegments(x, y, innerR, outerR, startAngle, endAngle, isCircle)
                        }
                    }
                    this.x = params.x;
                    this.y = params.y;
                    this.outerRadius = params.outerRadius;
                    this.innerRadius = params.innerRadius;
                    this.startAngle = params.startAngle;
                    this.endAngle = params.endAngle;
                    delete params.x;
                    delete params.y;
                    delete params.outerRadius;
                    delete params.innerRadius;
                    delete params.startAngle;
                    delete params.endAngle;
                    this.combinePathParams(params)
                },
                animate: function(params) {
                    var _this = this;
                    if ('x' in params && 'y' in params && 'outerRadius' in params && 'innerRadius' in params && 'startAngle' in params && 'endAngle' in params && this.renderer.animOptions.enabled) {
                        var settings = this.settings;
                        params.arc = {
                            from: {
                                x: this.x,
                                y: this.y,
                                outerRadius: this.outerRadius,
                                innerRadius: this.innerRadius,
                                startAngle: this.startAngle,
                                endAngle: this.endAngle
                            },
                            to: {
                                x: params.x,
                                y: params.y,
                                outerRadius: params.outerRadius,
                                innerRadius: params.innerRadius,
                                startAngle: params.startAngle,
                                endAngle: params.endAngle
                            }
                        };
                        delete params.d;
                        delete params.x;
                        delete params.y;
                        delete params.outerRadius;
                        delete params.innerRadius;
                        delete params.startAngle;
                        delete params.endAngle
                    }
                    this.callBase.apply(this, arguments)
                }
            });
        var CircleSvgElement = BaseSvgElement.inherit({
                defaultSettings: function() {
                    return {
                            cx: 0,
                            cy: 0,
                            r: 0
                        }
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'circle', params)
                }
            });
        var TextSvgElement = BaseSvgElement.inherit({
                defaultSettings: function() {
                    return {
                            x: 0,
                            y: 0
                        }
                },
                ctor: function(renderer, params) {
                    this.tspans = [];
                    this.callBase(renderer, 'text', params)
                },
                dispose: function() {
                    this.tspans = null;
                    this.callBase()
                },
                updateText: function(text) {
                    if (!utils.isDefined(text))
                        text = '';
                    this.applySettings({text: text})
                },
                adjustSettings: function() {
                    if (!('text' in this.settings)) {
                        this.changeX();
                        return
                    }
                    this._createElementWithText(this.settings.text)
                },
                changeX: function() {
                    for (var i = 0; i < this.tspans.length; i++)
                        if (this.tspans[i].settings.x != undefined)
                            this.tspans[i].applySettings({x: this.settings.x})
                },
                _createElementWithText: function(text) {
                    var div,
                        i;
                    this.clear();
                    text = text.toString().replace(/\r/g, "");
                    text = text.replace(/\n/g, "<br/>");
                    div = doc.createElement("div");
                    div.innerHTML = text;
                    div.params = {style: {}};
                    this._orderText(div)
                },
                clear: function() {
                    this.callBase();
                    this.tspans = []
                },
                _orderText: function(node) {
                    var textArray = [],
                        defaultFontSize = (this.settings.font ? this.settings.font.size : 12) || 12;
                    var order = function(strCount, node, textArray) {
                            var params = {style: {}},
                                textArray = textArray || [];
                            node.params = node.params || {};
                            if (node.parentNode && node.nodeName != "#text")
                                if (node.parentNode.params)
                                    for (var i in node.parentNode.params)
                                        node.params[i] = node.parentNode.params[i];
                            switch (node.tagName) {
                                case"B" || "STRONG":
                                    node.params.fontWeight = "bold";
                                    break;
                                case"I" || "EM":
                                    node.params.fontStyle = "italic";
                                    break;
                                case"U":
                                    node.params.textDecoration = "underline";
                                    break;
                                case"BR":
                                    strCount++;
                                    break
                            }
                            if (node.style) {
                                if (node.style.fontSize)
                                    node.params.fontSize = (parseInt(node.style.fontSize) || node.params.fontSize) + "px";
                                node.params.fill = node.style.color || node.params.fill;
                                node.params.fontStyle = node.style.fontStyle || node.params.fontStyle;
                                node.params.fontWeight = node.style.fontWeight || node.params.fontWeight;
                                node.params.textDecoration = node.style.textDecoration || node.params.textDecoration
                            }
                            var childnum = node.childNodes.length;
                            var count = 0;
                            while (count != childnum)
                                strCount = order(strCount, node.childNodes[count++], textArray);
                            if (node.wholeText != undefined) {
                                params.fill = node.parentNode.params.fill;
                                params.text = node.wholeText;
                                node.parentNode.params.fontSize && (params.style.fontSize = node.parentNode.params.fontSize);
                                node.parentNode.params.fontStyle && (params.style.fontStyle = node.parentNode.params.fontStyle);
                                node.parentNode.params.fontWeight && (params.style.fontWeight = node.parentNode.params.fontWeight);
                                node.parentNode.params.textDecoration && (params.style.textDecoration = node.parentNode.params.textDecoration);
                                textArray.push({
                                    params: params,
                                    line: strCount
                                })
                            }
                            return strCount
                        };
                    order(0, node, textArray);
                    for (var txt = 0; txt < textArray.length; txt++) {
                        if (txt != 0)
                            if (textArray[txt].line != textArray[txt - 1].line) {
                                textArray[txt].params.dy = textArray[txt].params.style.fontSize || defaultFontSize;
                                textArray[txt].params.x = this.settings.x
                            }
                            else {
                                textArray[txt].params.dy = 0;
                                textArray[txt].params.dx = 0
                            }
                        else {
                            textArray[txt].params.x = this.settings.x;
                            textArray[txt].params.dy = 0
                        }
                        var tspan = new TspanSvgElement(this.renderer, textArray[txt].params);
                        tspan.append(this);
                        this.tspans.push(tspan)
                    }
                }
            });
        var TspanSvgElement = BaseSvgElement.inherit({ctor: function(renderer, params) {
                    var text = params.text || '';
                    delete params.text;
                    this.callBase(renderer, 'tspan', params);
                    this.element.appendChild(doc.createTextNode(text))
                }});
        var GroupSvgElement = BaseSvgElement.inherit({
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'g', params)
                },
                update: $.noop
            });
        var PatternSvgElement = BaseSvgElement.inherit({
                ctor: function(renderer, params) {
                    this.__patternParams = $.extend({}, params);
                    var id = utils.getNextDefsSvgId(),
                        color = params.color,
                        hatching = params.hatching,
                        opacity = hatching.opacity,
                        width = hatching.width || 1,
                        step = hatching.step || 6,
                        direction = hatching.direction,
                        options = {
                            strokeWidth: width,
                            stroke: color
                        };
                    this.callBase(renderer, 'pattern', {
                        id: id,
                        width: step,
                        height: step
                    });
                    this.element.setAttribute('patternUnits', 'userSpaceOnUse');
                    this._rect = renderer.createRect(0, 0, step, step, 0, {
                        fill: color,
                        opacity: opacity
                    }).append(this);
                    this._path = renderer.createPath(0, options).append(this);
                    if (direction === 'right')
                        this._path.applySettings({d: "M " + step / 2 + " " + -step / 2 + " L " + -step / 2 + " " + step / 2 + "M 0 " + step + " L " + step + " 0 M " + step * 1.5 + " " + step / 2 + " L " + step / 2 + " " + step * 1.5});
                    else if (direction === 'left')
                        this._path.applySettings({d: "M 0 0 L " + step + ' ' + step + " M " + -step / 2 + " " + step / 2 + " L " + step / 2 + " " + step * 1.5 + " M " + step / 2 + -step / 2 + " L " + step * 1.5 + " " + step / 2});
                    this.id = getPatternUrl(id, renderer.pathModified)
                },
                append: function() {
                    return this.callBase(this.renderer.getDefsSvg())
                },
                clear: function() {
                    this.callBase();
                    this._path = null
                },
                dispose: function() {
                    this._path = null;
                    this.callBase()
                }
            });
        var ClipRectSvgElement = BaseSvgElement.inherit({
                ctor: function(renderer, params) {
                    this.__clipRectParams = $.extend({}, params);
                    var x = params.x,
                        y = params.y,
                        w = params.w,
                        h = params.h,
                        id = utils.getNextDefsSvgId();
                    delete params.x;
                    delete params.y;
                    delete params.w;
                    delete params.h;
                    this.callBase(renderer, 'clipPath', {id: id});
                    this.id = id;
                    this._rect = renderer.createRect(x, y, w, h, 0, params);
                    this._rect.append(this)
                },
                append: function() {
                    return this.callBase(this.renderer.getDefsSvg())
                },
                updateRectangle: function(settings) {
                    this._rect.applySettings(settings)
                },
                dispose: function() {
                    this._rect = null;
                    this.callBase()
                }
            });
        var BaseFilterSvgElement = BaseSvgElement.inherit({
                ctor: function(renderer) {
                    this.applySettings = $.noop;
                    this.callBase(renderer, 'filter');
                    delete this.applySettings;
                    this.ref = null;
                    this._create()
                },
                append: function() {
                    return this.callBase(this.renderer.getDefsSvg())
                },
                dispose: function() {
                    while (this.element.firstChild)
                        this.element.removeChild(this.element.firstChild);
                    this.callBase();
                    return this
                },
                applySettings: function(settings) {
                    settings = settings || {};
                    settings.id = utils.getNextDefsSvgId();
                    this.$element.attr({
                        id: settings.id,
                        x: settings.x || null,
                        y: settings.y || null,
                        width: settings.width || null,
                        height: settings.height || null
                    });
                    this.ref = settings.id ? getPatternUrl(settings.id, this.renderer.pathModified) : null;
                    this._update(settings);
                    return this
                }
            });
        function setAttributes(element, attr) {
            $.each(attr, function(name, value) {
                element.setAttribute(name, value)
            })
        }
        var ShadowFilterSvgElement = BaseFilterSvgElement.inherit({
                _create: function() {
                    var that = this,
                        gaussianBlur = that._gaussianBlur = createElement('feGaussianBlur'),
                        offset = that._offset = createElement('feOffset'),
                        flood = that._flood = createElement('feFlood'),
                        composite = that._composite = createElement('feComposite'),
                        finalComposite = createElement('feComposite');
                    setAttributes(gaussianBlur, {
                        'in': 'SourceGraphic',
                        result: 'gaussianBlurResult'
                    });
                    setAttributes(offset, {
                        'in': 'gaussianBlurResult',
                        result: 'offsetResult'
                    });
                    setAttributes(flood, {result: 'floodResult'});
                    setAttributes(composite, {
                        'in': 'floodResult',
                        in2: 'offsetResult',
                        operator: 'in',
                        result: 'compositeResult'
                    });
                    setAttributes(finalComposite, {
                        'in': 'SourceGraphic',
                        in2: 'compositeResult',
                        operator: 'over'
                    });
                    that.element.appendChild(gaussianBlur);
                    that.element.appendChild(offset);
                    that.element.appendChild(flood);
                    that.element.appendChild(composite);
                    that.element.appendChild(finalComposite)
                },
                _update: function(settings) {
                    setAttributes(this._gaussianBlur, {stdDeviation: settings.blur || 0});
                    setAttributes(this._offset, {
                        dx: settings.dx || 0,
                        dy: settings.dy || 0
                    });
                    setAttributes(this._flood, {
                        'flood-color': settings.color,
                        'flood-opacity': settings.opacity
                    })
                }
            });
        renderers.SvgRenderer = Class.inherit({
            ctor: function(options) {
                var that = this;
                options = options || {};
                that._setAnimationOptions(options.animation || {});
                that.animationController = new renderers.AnimationController;
                that.pathModified = options.pathModified;
                that.rtl = !!options.rtl;
                that.cssClass = options.cssClass || '';
                that.recreateCanvas(options.width, options.height)
            },
            dispose: function() {
                var that = this;
                that.detachContainer();
                that.svgRoot && (that.svgRoot.remove(), that.svgRoot = null);
                that.animationController.dispose();
                that.animOptions = null;
                that.animationController = null
            },
            _setAnimationOptions: function(options) {
                this.animOptions = {
                    enabled: true,
                    duration: 1000,
                    easing: 'easeOutCubic'
                };
                if ('enabled' in options)
                    this.animOptions.enabled = options.enabled;
                if ('duration' in options)
                    this.animOptions.duration = options.duration;
                if ('easing' in options)
                    this.animOptions.easing = options.easing
            },
            animationEnabled: function() {
                return !!this.animOptions.enabled
            },
            updateAnimationOptions: function(newOptions) {
                this._setAnimationOptions($.extend(this.animOptions || {}, newOptions))
            },
            stopAllAnimations: function(lock) {
                lock ? this.animationController.lock() : this.animationController.stop()
            },
            detachContainer: function() {
                var that = this;
                that.svgRoot && that.svgRoot.detach();
                that.defsSvg && (that.defsSvg.remove(), that.defsSvg = null);
                that.drawn = null
            },
            recreateCanvas: function(width, height, cssClass) {
                if (width >= 0 && height >= 0) {
                    if (!this.svgRoot) {
                        this.cssClass = cssClass || this.cssClass;
                        this.svgRoot = new RootSvgElement(this, {
                            width: width,
                            height: height,
                            'class': this.cssClass,
                            direction: this.rtl ? 'rtl' : 'ltr'
                        });
                        this.animationController.element = this.svgRoot.element
                    }
                    else
                        this.svgRoot.applySettings({
                            width: width,
                            height: height
                        });
                    this.defsSvg && this.defsSvg.clear("pattern")
                }
            },
            resize: function(width, height) {
                var root = this.getRoot();
                root && width > 0 && height > 0 && root.applySettings({
                    width: width,
                    height: height
                })
            },
            getRoot: function() {
                return this.svgRoot
            },
            isInitialized: function() {
                return !!this.svgRoot
            },
            draw: function(container) {
                if (!container || this.drawn)
                    return;
                container.appendChild(this.getRoot().element);
                this.drawn = true
            },
            updateParams: function(params, options) {
                if (options && options.strokeWidth)
                    params.strokeWidth = options.strokeWidth
            },
            animateElement: function(element, params, options) {
                this.animationController.animateElement(element, params, options)
            },
            createRect: function(x, y, w, h, r, options) {
                var params = {
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        rx: r,
                        ry: r
                    };
                if (options && !options.inh)
                    $.extend(params, options);
                this.updateParams(params, options);
                return new RectSvgElement(this, params)
            },
            createSegmentRect: function(x, y, w, h, r, segments, options) {
                var params = $.extend({}, options || {}, {
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        rx: r,
                        ry: r,
                        segments: segments
                    });
                return new SegmentRectSvgElement(this, params)
            },
            createClipRect: function(x, y, w, h) {
                var attr = {
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        fill: 'none',
                        stroke: 'none',
                        strokeWidth: 0
                    };
                return new ClipRectSvgElement(this, attr)
            },
            createPattern: function(color, hatching) {
                hatching = hatching || {};
                hatching.direction = (hatching.direction || '').toLowerCase();
                if (hatching.direction !== 'right' && hatching.direction !== 'left')
                    return {
                            id: color,
                            append: function() {
                                return this
                            },
                            clear: function(){},
                            dispose: function(){}
                        };
                return new PatternSvgElement(this, {
                        hatching: hatching,
                        color: color
                    })
            },
            createImage: function(x, y, w, h, href, options) {
                var params = $.extend({}, options || {}, {
                        x: x,
                        y: y,
                        width: w,
                        height: h
                    });
                return new ImageSvgElement(this, params, href, params.location)
            },
            createLine: function(x1, y1, x2, y2, options) {
                var params = {points: [x1, y1, x2, y2]};
                if (options && !options.inh)
                    $.extend(params, options);
                this.updateParams(params, options);
                return new PathSvgElement(this, params)
            },
            createPath: function(points, options) {
                var params = {points: points};
                if (options && !options.inh)
                    $.extend(params, options);
                this.updateParams(params, options);
                return new PathSvgElement(this, params)
            },
            createSimplePath: function(options) {
                return new BaseSvgElement(this, 'path', options)
            },
            createBezierPath: function(points, options) {
                var params = {points: points};
                if (options && !options.inh)
                    $.extend(params, options);
                this.updateParams(params, options);
                return new BezierSvgElement(this, params)
            },
            createArea: function(points, options) {
                var params = {points: points};
                if (options && !options.inh)
                    $.extend(params, options);
                this.updateParams(params, options);
                return new AreaSvgElement(this, params)
            },
            createBezierArea: function(points, options) {
                var params = {points: points};
                if (options && !options.inh)
                    $.extend(params, options);
                this.updateParams(params, options);
                return new BezierAreaSvgElement(this, params)
            },
            createCircle: function(x, y, r, options) {
                var params = {
                        cx: x,
                        cy: y,
                        r: r
                    };
                if (options && !options.inh)
                    $.extend(params, options);
                return new CircleSvgElement(this, params)
            },
            createArc: function(x, y, outerRadius, innerRadius, startAngle, endAngle, options) {
                var params = {
                        x: x,
                        y: y,
                        outerRadius: outerRadius,
                        innerRadius: innerRadius,
                        startAngle: startAngle,
                        endAngle: endAngle
                    };
                if (options && !options.inh)
                    $.extend(params, options);
                this.updateParams(params, options);
                return new ArcSvgElement(this, params)
            },
            createText: function(text, x, y, options) {
                var params = {
                        x: x,
                        y: y,
                        text: text
                    };
                if (options && !options.inh)
                    $.extend(params, options);
                return new TextSvgElement(this, params)
            },
            createGroup: function(options) {
                return new GroupSvgElement(this, options)
            },
            createFilter: function(type) {
                var filterType = type === 'shadow' ? ShadowFilterSvgElement : null;
                if (filterType)
                    return new filterType(this);
                return null
            },
            getDefsSvg: function() {
                this.defsSvg = this.defsSvg || new BaseSvgElement(this, 'defs').append();
                return this.defsSvg
            },
            svg: function() {
                return this.svgRoot.$element.parent().html()
            }
        });
        function buildPath(points) {
            var i = 0,
                ii = points.length,
                list = [];
            for (; i < ii; )
                list.push('L', points[i++].toFixed(2), points[i++].toFixed(2));
            if (ii) {
                list[0] = 'M';
                list.push('Z');
                list = list.join(' ')
            }
            else
                list = '';
            return list
        }
        function processCircleSettings(x, y, size, borderWidth) {
            var correct = size + ~~borderWidth & 1;
            return {
                    cx: correct ? x + 0.5 : x,
                    cy: correct ? y + 0.5 : y,
                    r: size / 2
                }
        }
        renderers._svgBuildPath = buildPath;
        renderers._svgProcessCircleSettings = processCircleSettings;
        renderers._svgRendererInternals = {
            BaseSvgElement: BaseSvgElement,
            RootSvgElement: RootSvgElement,
            RectSvgElement: RectSvgElement,
            ImageSvgElement: ImageSvgElement,
            PathSvgElement: PathSvgElement,
            AreaSvgElement: AreaSvgElement,
            BezierSvgElement: BezierSvgElement,
            BezierAreaSvgElement: BezierAreaSvgElement,
            CircleSvgElement: CircleSvgElement,
            TextSvgElement: TextSvgElement,
            TspanSvgElement: TspanSvgElement,
            GroupSvgElement: GroupSvgElement,
            ArcSvgElement: ArcSvgElement,
            RectSvgBaseElement: RectSvgBaseElement,
            SegmentRectSvgElement: SegmentRectSvgElement,
            ClipRectSvgElement: ClipRectSvgElement,
            PatternSvgElement: PatternSvgElement,
            ShadowFilterSvgElement: ShadowFilterSvgElement
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file vmlRenderer.js */
    (function($, DX) {
        var renderers = DX.viz.renderers,
            utils = DX.utils,
            doc = document,
            svgRendererInternals = renderers._svgRendererInternals,
            documentFragment = doc.createDocumentFragment();
        function createVmlElement(nodeName) {
            var element = doc.createElement(nodeName);
            return documentFragment.appendChild(element)
        }
        var appendTimerID;
        var vmlElementsToAppend = [];
        var CSS_PROPERTIES = ['position', 'display', 'visibility', 'filter', 'margin', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom', 'whiteSpace', 'clip', 'overflow'];
        var INHERITABLE_PROPERTIES = ['stroke', 'fill', 'opacity', 'strokeWidth', 'align', 'dashStyle'];
        var defaultVmlSettings = {
                x: 0,
                y: 0,
                width: 1,
                height: 1,
                position: 'absolute',
                behavior: 'url(#default#VML)',
                display: 'inline-block',
                xmlns: "urn:schemas-microsoft-com:vml"
            };
        var CLIP_RECT_CLASS = "dx-vml-clip-rect";
        var extendDefaultVmlOptions = function(customOptions, baseOptions) {
                return $.extend(true, baseOptions || {}, defaultVmlSettings, customOptions)
            };
        var parseRotateParameter = function(rotate, defaultX, defaultY) {
                var rotateObject;
                if (utils.isDefined(rotate))
                    if (utils.isNumber(rotate))
                        rotateObject = {
                            angle: rotate,
                            x: defaultX || 0,
                            y: defaultY || 0
                        };
                    else if ($.isArray(rotate))
                        rotateObject = {
                            angle: rotate[0] || 0,
                            x: rotate[1] || 0,
                            y: rotate[2] || 0
                        };
                    else if (utils.isObject(rotate))
                        rotateObject = {
                            angle: rotate.angle || 0,
                            x: rotate.x || 0,
                            y: rotate.y || 0
                        };
                return rotateObject
            };
        function adjustOpacity(value) {
            return value >= 0.002 ? value : value === null ? 1 : 0.002
        }
        var applySubElementAttribute = function(vmlElement, params, name) {
                var element = vmlElement.element,
                    subElement,
                    value = params[name];
                if (name === 'opacity' || name === 'fillOpacity')
                    if (element.fill)
                        element.fill.opacity = adjustOpacity(value);
                if (name === 'joinStyle')
                    if (element.stroke)
                        element.stroke.joinStyle = value;
                if (name === 'opacity' || name === 'strokeOpacity')
                    if (element.stroke)
                        element.stroke.opacity = value >= 0.002 ? value : value === null ? 1 : 0.002;
                if (name === 'dashstyle')
                    if (element.stroke)
                        element.stroke.dashstyle = value
            };
        var getBoundingClientRect = function(element) {
                var i,
                    resultRect,
                    rect,
                    tagName = element.tagName.toLowerCase(),
                    points,
                    value,
                    halfStrokeWidth;
                if (element.className && element.className.indexOf(CLIP_RECT_CLASS) !== -1)
                    return;
                if (tagName === 'div') {
                    if (element.childNodes.length > 0) {
                        resultRect = {};
                        for (i = 0; i < element.childNodes.length; i++) {
                            rect = getBoundingClientRect(element.childNodes[i]);
                            if (!rect)
                                continue;
                            resultRect.left = resultRect.left === undefined || rect.left < resultRect.left ? rect.left : resultRect.left;
                            resultRect.top = resultRect.top === undefined || rect.top < resultRect.top ? rect.top : resultRect.top;
                            resultRect.right = resultRect.right === undefined || rect.right > resultRect.right ? rect.right : resultRect.right;
                            resultRect.bottom = resultRect.bottom === undefined || rect.bottom > resultRect.bottom ? rect.bottom : resultRect.bottom
                        }
                    }
                }
                else if (tagName === 'shape' || tagName === 'vml:shape') {
                    points = (element.path.value || element.path).match(/[-0-9]+/g);
                    resultRect = {};
                    rect = element.getBoundingClientRect();
                    for (i = 0; i < points.length; i++) {
                        value = parseInt(points[i]);
                        if (i % 2) {
                            resultRect.top = resultRect.top === undefined || value < resultRect.top ? value : resultRect.top;
                            resultRect.bottom = resultRect.bottom === undefined || value > resultRect.bottom ? value : resultRect.bottom
                        }
                        else {
                            resultRect.left = resultRect.left === undefined || value < resultRect.left ? value : resultRect.left;
                            resultRect.right = resultRect.right === undefined || value > resultRect.right ? value : resultRect.right
                        }
                    }
                    resultRect.left = resultRect.left || 0;
                    resultRect.top = resultRect.top || 0;
                    resultRect.right = resultRect.right || 0;
                    resultRect.bottom = resultRect.bottom || 0;
                    if (rect.right - rect.left <= 1 && rect.top - rect.bottom <= 1) {
                        resultRect.right = resultRect.right + rect.left;
                        resultRect.bottom = resultRect.bottom + rect.top;
                        resultRect.left = resultRect.left + rect.left;
                        resultRect.top = resultRect.top + rect.top
                    }
                    else {
                        resultRect.right = resultRect.right - resultRect.left + rect.left;
                        resultRect.bottom = resultRect.bottom - resultRect.top + rect.top;
                        resultRect.left = rect.left;
                        resultRect.top = rect.top
                    }
                    halfStrokeWidth = Math.ceil(parseFloat(element.strokeweight) / 2);
                    if (halfStrokeWidth && halfStrokeWidth > 1) {
                        resultRect.left -= halfStrokeWidth;
                        resultRect.top -= halfStrokeWidth;
                        resultRect.right += halfStrokeWidth;
                        resultRect.bottom += halfStrokeWidth
                    }
                }
                else
                    resultRect = element.getBoundingClientRect();
                return resultRect
            };
        var BaseVmlElement = {
                isVml: function() {
                    return true
                },
                dispose: function() {
                    this.childElements = null;
                    this._style = null;
                    this._fullSettings = null;
                    this.callBase()
                },
                defaultSettings: function(customOptions) {
                    return extendDefaultVmlOptions(customOptions, this.callBase ? this.callBase() : {})
                },
                createElement: function(nodeName) {
                    this._nodeName = nodeName;
                    this.childElements = [];
                    this._fullSettings = {};
                    if (this.isVml()) {
                        var result = createVmlElement('vml:' + nodeName);
                        return result
                    }
                    else
                        return doc.createElement(nodeName)
                },
                append: function(element) {
                    var toElement = element || this.renderer.getRoot();
                    if (toElement) {
                        toElement.element.appendChild(this.element);
                        toElement.childElements.push(this);
                        if (this.parentElement)
                            this.parentElement.childElements.splice($.inArray(this, this.parentElement.childElements), 1);
                        this.parentElement = toElement
                    }
                    if (toElement === this.renderer.getRoot() || toElement._isAppended)
                        this.appendComplete();
                    return this
                },
                insertBefore: function(target) {
                    var parent = target.parentElement;
                    parent.element.insertBefore(this.element, target.element);
                    this.parentElement = parent;
                    parent.childElements.splice($.inArray(target, parent.childElements), 0, this);
                    parent._isAppended && this.appendComplete();
                    return this
                },
                remove: function() {
                    this.callBase.apply(this, arguments);
                    if (this.parentElement) {
                        this.parentElement.childElements.splice($.inArray(this, this.parentElement.childElements), 1);
                        this.parentElement = null
                    }
                    return this
                },
                detach: function() {
                    this.callBase.apply(this, arguments);
                    this._delayAttributes(['opacity']);
                    this._onDetach();
                    if (this.parentElement) {
                        this.parentElement.childElements.splice($.inArray(this, this.parentElement.childElements), 1);
                        this.parentElement = null
                    }
                    return this
                },
                clear: function() {
                    this.callBase.apply(this, arguments);
                    $.each(this.childElements, function(_, element) {
                        element._delayAttributes(['opacity']);
                        element._onDetach();
                        element.parentElement = null
                    });
                    this.childElements = [];
                    return this
                },
                applyStyle: function(style) {
                    this.callBase(style);
                    if (style.opacity)
                        this.element.style.opacity = style.opacity;
                    if (style.clip)
                        try {
                            this.element.style.clip = style.clip
                        }
                        catch(e) {}
                },
                _fillAttributesFromParentAndCurrentStyle: function(attributes) {
                    var element = this.element,
                        parent = this.parentElement,
                        i,
                        settingToStyleMap = {strokeWidth: 'stroke-width'},
                        propertyName,
                        styleName,
                        settingsToApply = {};
                    if (parent)
                        for (i = 0; i < INHERITABLE_PROPERTIES.length; i++) {
                            propertyName = INHERITABLE_PROPERTIES[i];
                            if (!this.settings[propertyName] && parent._fullSettings[propertyName])
                                settingsToApply[propertyName] = parent._fullSettings[propertyName]
                        }
                    if (element.style && element.currentStyle)
                        for (i = 0; i < INHERITABLE_PROPERTIES.length; i++) {
                            propertyName = INHERITABLE_PROPERTIES[i];
                            styleName = settingToStyleMap[propertyName] || propertyName;
                            if (element.currentStyle[styleName])
                                settingsToApply[propertyName] = element.currentStyle[styleName]
                        }
                    $.extend(this._fullSettings, this.settings, settingsToApply);
                    if (this.isVml())
                        $.extend(attributes, this._normalizeSettings(settingsToApply))
                },
                _applyAttributes: function(params) {
                    var name,
                        value;
                    if (params && params.arcsize !== undefined) {
                        try {
                            this.element.setAttribute('arcsize', params.arcsize)
                        }
                        catch(e) {}
                        this.__appliedSettings = {arcsize: params.arcsize};
                        delete params.arcsize
                    }
                    if (params && params['class']) {
                        this.element.className = params['class'];
                        delete params['class']
                    }
                    if (!this._isAppended)
                        this._delayedAttributes = params;
                    else {
                        params = params || this._delayedAttributes;
                        if (params) {
                            this._fillAttributesFromParentAndCurrentStyle(params);
                            if (this.isVml()) {
                                for (name in params) {
                                    value = params[name];
                                    if (name === 'opacity' || name === 'fillOpacity' || name === 'strokeOpacity' || name === 'dashstyle' || name === 'joinStyle')
                                        applySubElementAttribute(this, params, name);
                                    else
                                        this.element[name] = value
                                }
                                $.each(this.element.children, function(_, e) {
                                    e.style.behavior = 'url(#default#VML)';
                                    e.style.display = 'inline-block';
                                    e.xmlns = "urn:schemas-microsoft-com:vml"
                                })
                            }
                            this.__appliedSettings = this.isVml() ? params : {};
                            delete this._delayedAttributes
                        }
                    }
                },
                _onDetach: function() {
                    this._isAppended = false;
                    $.each(this.childElements, function(_, child) {
                        child._onDetach()
                    })
                },
                appendComplete: function() {
                    if (this.renderer.isElementAppendedToPage(this)) {
                        this._isAppended = true;
                        this._applyAttributes();
                        $.each(this.childElements, function(_, child) {
                            child.appendComplete()
                        });
                        if (this.parentElement instanceof GroupVmlElement && this.parentElement._clipRect && this.parentElement._clipRect !== this)
                            if (this.parentElement._clipRect._isAppended)
                                this.parentElement._clipRect.toForeground();
                            else
                                this.parentElement._clipRect.append(this.parentElement)
                    }
                    else {
                        vmlElementsToAppend.push(this);
                        $(this.element).data('vmlNeedAppendComplete', true);
                        if (appendTimerID === undefined)
                            appendTimerID = setTimeout(function() {
                                appendTimerID = undefined;
                                var vmlElements = vmlElementsToAppend;
                                vmlElementsToAppend = [];
                                $.each(vmlElements, function() {
                                    if ($(this.element).data('vmlNeedAppendComplete') && !this._isAppended)
                                        this.appendComplete()
                                })
                            }, 200)
                    }
                },
                _delayAttributes: function(attributes) {
                    var attr,
                        val,
                        i,
                        settings = this.settings || {};
                    attributes = attributes || [];
                    this._delayedAttributes = this._delayedAttributes || {};
                    for (i = 0; i < attributes.length; i++) {
                        attr = attributes[i];
                        val = settings[attr];
                        if (val)
                            this._delayedAttributes[attr] = val
                    }
                    $.each(this.childElements || [], function(_, child) {
                        child._delayAttributes(attributes)
                    })
                },
                _normalizeSettings: function(settings) {
                    var key,
                        style = {},
                        normalized = {},
                        clipRect,
                        pos,
                        prop,
                        value;
                    for (key in settings) {
                        prop = key;
                        value = settings[prop];
                        if (prop === 'x' || prop === 'translateX') {
                            pos = settings.x || 0;
                            if (settings.translateX)
                                pos += settings.translateX;
                            style.left = pos + 'px'
                        }
                        else if (prop === 'y' || prop === 'translateY') {
                            pos = settings.y || 0;
                            if (settings.translateY)
                                pos += settings.translateY;
                            style.top = pos + 'px'
                        }
                        else if (prop === 'width')
                            style.width = value + 'px';
                        else if (prop === "behavior")
                            style[prop] = value;
                        else if (prop === 'height')
                            style.height = value + 'px';
                        else if (prop === 'align')
                            continue;
                        else if (prop === 'scale')
                            continue;
                        else if ($.inArray(prop, CSS_PROPERTIES) != -1)
                            style[prop] = value !== null ? value : '';
                        else if (prop === 'font') {
                            if (!$.isPlainObject(value))
                                continue;
                            $.each(value, function(fontSetting) {
                                var styleName,
                                    firstChar;
                                switch (fontSetting) {
                                    case'color':
                                        styleName = "fill";
                                        break;
                                    case'opacity':
                                        styleName = "opacity";
                                        break;
                                    case'cursor':
                                        styleName = fontSetting;
                                        break;
                                    default:
                                        firstChar = fontSetting.charAt(0);
                                        styleName = 'font' + fontSetting.replace(firstChar, firstChar.toUpperCase())
                                }
                                if (styleName)
                                    style[styleName] = value[fontSetting]
                            })
                        }
                        else if (prop === 'style')
                            $.extend(true, style, value);
                        else if (prop === 'rotate')
                            this['_rotate'] = value;
                        else if (prop === 'clipId') {
                            clipRect = this.renderer.getClipRect(value, this);
                            if (clipRect) {
                                var width = clipRect.width,
                                    height = clipRect.height,
                                    x = clipRect.x,
                                    y = clipRect.y,
                                    clipWidth = width + x,
                                    clipHeight = height + y,
                                    canvasSize = this.renderer._getSize();
                                style.width = canvasSize.width;
                                style.height = canvasSize.height;
                                style.clip = "rect(" + y + "px, " + clipWidth + "px, " + clipHeight + "px, " + x + "px)"
                            }
                        }
                        else if (prop === 'segments')
                            continue;
                        else if (prop === 'fill') {
                            normalized.filled = value === 'none' ? 'f' : 't';
                            normalized.fillcolor = value === 'grey' ? '#808080' : value
                        }
                        else if (prop === 'opacity')
                            normalized.opacity = value < 0.002 ? value : value;
                        else if (prop === 'stroke') {
                            normalized.stroked = value === 'none' ? 'f' : 't';
                            normalized.strokecolor = value
                        }
                        else if (prop === 'strokeWidth')
                            normalized.strokeweight = value + 'px';
                        else if (prop === 'lineJoin')
                            normalized.joinStyle = value;
                        else if (prop === 'dashStyle') {
                            value = value.toLowerCase();
                            normalized.dashstyle = value
                        }
                        else
                            normalized[prop] = value
                    }
                    this['_style'] = style;
                    return normalized
                },
                _getBBox: function() {
                    var width,
                        height,
                        rect,
                        parentRect,
                        x = 0,
                        y = 0,
                        element = this.element,
                        parent;
                    try {
                        rect = getBoundingClientRect(element);
                        width = rect.right - rect.left;
                        height = rect.bottom - rect.top;
                        parent = this.element.parentNode || this.renderer.getRoot().element;
                        parentRect = parent.getBoundingClientRect();
                        x = rect.left - parentRect.left;
                        y = rect.top - parentRect.top;
                        if (element.tagName.toLowerCase() === 'div') {
                            x = x - (parseInt(element.style.left, 10) || 0);
                            y = y - (parseInt(element.style.top, 10) || 0)
                        }
                    }
                    catch(e) {
                        width = element.offsetWidth || 0;
                        height = element.offsetHeight || 0
                    }
                    return {
                            x: x,
                            y: y,
                            width: width,
                            height: height,
                            isEmpty: !x && !y && !width && !height
                        }
                },
                getBBox: function() {
                    return this._getBBox()
                },
                sharpEdges: function(){}
            };
        var convertSvgPathCommandToVml = function(command) {
                switch (command) {
                    case'M':
                        return 'm';
                    case'L':
                        return 'l';
                    case'Z':
                        return 'x e'
                }
                return command
            };
        var BasePathVmlElement = {
                defaultSettings: function() {
                    return $.extend(this.callBase(), {coordsize: '1,1'})
                },
                getNodeName: function() {
                    return 'shape'
                },
                getPathAttributeName: function() {
                    return 'path'
                },
                customizeSegments: function(segments) {
                    var result = segments;
                    if (segments)
                        result = $.map(segments, function(s, i) {
                            var pos,
                                segmentArray = [],
                                command = convertSvgPathCommandToVml(s[0]);
                            segmentArray.push(command);
                            for (pos = 1; pos < s.length; pos++)
                                segmentArray.push(Math.floor(s[pos]));
                            return [segmentArray]
                        });
                    return result
                }
            };
        var RootVmlElement = svgRendererInternals.BaseSvgElement.inherit(BaseVmlElement).inherit({
                isVml: function() {
                    return false
                },
                defaultSettings: function() {
                    return {
                            width: 0,
                            height: 0,
                            position: 'relative',
                            display: 'inline-block',
                            overflow: 'hidden',
                            stroke: 'none',
                            strokeWidth: 0,
                            fill: 'none'
                        }
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'div', params)
                }
            });
        var ImageVmlElement = svgRendererInternals.BaseSvgElement.inherit(svgRendererInternals.RectSvgBaseElement).inherit(BaseVmlElement).inherit({
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'image', params)
                },
                defaultSettings: function() {
                    return $.extend(this.callBase(), {
                            strokeWidth: 0,
                            fill: 'none',
                            stroke: 'none'
                        })
                },
                adjustSettings: function() {
                    var defaultSettings = this.defaultSettings();
                    this.callBase();
                    if (this.settings.href) {
                        this.settings.src = this.settings.href;
                        delete this.settings.href
                    }
                    this.settings.fill = defaultSettings.fill;
                    this.settings.stroke = defaultSettings.stroke;
                    this.settings.strokeWidth = defaultSettings.strokeWidth
                }
            });
        var RectVmlElement = svgRendererInternals.BaseSvgElement.inherit(svgRendererInternals.RectSvgBaseElement).inherit(BaseVmlElement).inherit({
                defaultSettings: function() {
                    return extendDefaultVmlOptions({
                            stroked: 'f',
                            strokeWidth: 0,
                            rx: 0,
                            ry: 0
                        })
                },
                recreateElement: function(name) {
                    this._nodeName = name;
                    var parent = this.$element.parent()[0];
                    if (parent) {
                        var $oldElement = this.$element;
                        this.element = this.createElement(name);
                        this.$element = $(this.element);
                        this.$element.insertBefore($oldElement);
                        $oldElement.remove()
                    }
                    else {
                        this.element = this.createElement(name);
                        this.$element = $(this.element)
                    }
                    this.applySettings()
                },
                _adjustArcSize: function() {
                    var settings = this.settings;
                    var rx = settings.rx || 0,
                        ry = settings.ry || 0,
                        width = settings.width,
                        height = settings.height,
                        r,
                        halfsize,
                        arcsize;
                    if (settings.rx !== undefined || settings.ry !== undefined) {
                        r = Math.max(rx, ry);
                        halfsize = Math.max(width, height) / 2;
                        arcsize = r / halfsize;
                        settings.arcsize = arcsize;
                        if ($.isNumeric(arcsize) && arcsize != 0)
                            this._nodeName !== 'roundrect' && this.recreateElement('roundrect');
                        else
                            this._nodeName === 'roundrect' && this.recreateElement('rect');
                        delete settings.rx;
                        delete settings.ry
                    }
                },
                _adjustRotation: function() {
                    var settings = this.settings;
                    var rotate = this.settings.rotate,
                        rotateAngle,
                        radianAngle,
                        cos,
                        sin,
                        rotateX,
                        rotateY,
                        marginTop,
                        marginLeft,
                        cx,
                        cy,
                        rotateObject;
                    rotateObject = parseRotateParameter(rotate, settings.x, settings.y);
                    if (rotateObject) {
                        rotateAngle = rotateObject.angle;
                        rotateX = rotateObject.x;
                        rotateY = rotateObject.y;
                        radianAngle = rotateAngle * Math.PI / 180.0;
                        cos = Math.cos(radianAngle);
                        sin = Math.sin(radianAngle);
                        cx = settings.x + (settings.translateX || 0) + settings.width / 2;
                        cy = settings.y + (settings.translateY || 0) + settings.height / 2;
                        marginLeft = (cx - rotateX) * cos - (cy - rotateY) * sin + rotateX - cx;
                        marginTop = (cx - rotateX) * sin + (cy - rotateY) * cos + rotateY - cy;
                        this.settings.marginLeft = Math.round(marginLeft) + 'px';
                        this.settings.marginTop = Math.round(marginTop) + 'px';
                        this.settings.rotation = rotateAngle
                    }
                },
                adjustSettings: function() {
                    this.callBase();
                    this._adjustArcSize();
                    this._adjustRotation()
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'rect', params)
                }
            });
        var PathVmlElement = svgRendererInternals.PathSvgElement.inherit(BaseVmlElement).inherit(BasePathVmlElement).inherit({prepareSegments: function(settings) {
                    var that = this,
                        rotate = settings.rotate,
                        rotateAngle,
                        rotateX,
                        rotateY,
                        oldSegments,
                        radianAngle,
                        cos,
                        sin,
                        x,
                        y,
                        rotatedX,
                        rotatedY,
                        rotateObject;
                    this.callBase(settings);
                    oldSegments = that.segments;
                    rotateObject = parseRotateParameter(rotate, settings.x, settings.y);
                    if (rotateObject) {
                        rotateAngle = rotateObject.angle;
                        rotateX = rotateObject.x;
                        rotateY = rotateObject.y;
                        if (that.segments) {
                            radianAngle = rotateAngle * Math.PI / 180.0;
                            cos = Math.cos(radianAngle);
                            sin = Math.sin(radianAngle);
                            that.segments = $.map(that.segments, function(s, i) {
                                if (s.length === 3) {
                                    x = s[1],
                                    y = s[2];
                                    rotatedX = (x - rotateX) * cos - (y - rotateY) * sin + rotateX;
                                    rotatedY = (x - rotateX) * sin + (y - rotateY) * cos + rotateY;
                                    return [[s[0], Math.floor(rotatedX), Math.floor(rotatedY)]]
                                }
                                else
                                    return [s]
                            });
                            that.combinePathParams(settings);
                            that.segments = oldSegments
                        }
                    }
                }});
        var SimplePathVmlElement = svgRendererInternals.BaseSvgElement.inherit(BaseVmlElement).inherit({
                ctor: function(renderer, options) {
                    this.callBase(renderer, 'shape', options)
                },
                defaultSettings: function() {
                    return extendDefaultVmlOptions({coordsize: '1,1'})
                },
                adjustSettings: function() {
                    var settings = this.settings;
                    if (settings.d !== undefined) {
                        settings.path = settings.d;
                        delete settings.d
                    }
                }
            });
        var AreaVmlElement = PathVmlElement.inherit({
                defaultSettings: function() {
                    var baseOptions = this.callBase();
                    return extendDefaultVmlOptions({points: {
                                x: 0,
                                y: 0
                            }}, baseOptions)
                },
                ctor: function(renderer, params) {
                    this.closePath = true;
                    this.callBase(renderer, params)
                }
            });
        var SegmentRectVmlElement = svgRendererInternals.SegmentRectSvgElement.inherit(BaseVmlElement).inherit(BasePathVmlElement).inherit({
                defaultSettings: function() {
                    var settings = this.callBase();
                    settings.lineJoin = 'miter';
                    delete settings.fill;
                    delete settings.stroke;
                    delete settings.strokecolor;
                    delete settings.stroked;
                    return settings
                },
                prepareSegments: function() {
                    this.callBase();
                    this.segments = this.customizeSegments(this.segments);
                    this.settings.x = 0;
                    this.settings.y = 0;
                    this.settings.width = 1;
                    this.settings.height = 1
                },
                applySettings: function(settings) {
                    var x = settings.x,
                        y = settings.y,
                        w = settings.width,
                        h = settings.height;
                    this.callBase(settings);
                    this.settings.x = x;
                    this.settings.y = y;
                    this.settings.width = w;
                    this.settings.height = h;
                    return this
                }
            });
        var BezierVmlElement = svgRendererInternals.BezierSvgElement.inherit(BaseVmlElement).inherit(BasePathVmlElement);
        var BezierAreaVmlElement = BezierVmlElement.inherit({
                defaultSettings: function() {
                    var baseOptions = this.callBase();
                    return extendDefaultVmlOptions({points: {
                                x: 0,
                                y: 0
                            }}, baseOptions)
                },
                ctor: function(renderer, params) {
                    this.closePath = true;
                    this.callBase(renderer, params)
                }
            });
        var ArcVmlElement = svgRendererInternals.ArcSvgElement.inherit(BaseVmlElement).inherit(BasePathVmlElement).inherit({createArcSegments: function(x, y, innerR, outerR, startAngle, endAngle, isCircle) {
                    var xOuterStart = x + outerR * Math.cos(startAngle),
                        yOuterStart = y - outerR * Math.sin(startAngle),
                        xOuterEnd = x + outerR * Math.cos(endAngle),
                        yOuterEnd = y - outerR * Math.sin(endAngle),
                        xInnerStart = x + innerR * Math.cos(endAngle),
                        yInnerStart = y - innerR * Math.sin(endAngle),
                        xInnerEnd = x + innerR * Math.cos(startAngle),
                        yInnerEnd = y - innerR * Math.sin(startAngle);
                    return [['wr', x - innerR, y - innerR, x + innerR, y + innerR, xInnerStart, yInnerStart, xInnerEnd, yInnerEnd], [isCircle ? 'wr' : 'at', x - outerR, y - outerR, x + outerR, y + outerR, xOuterStart, yOuterStart, xOuterEnd, yOuterEnd], ['x e']]
                }});
        var CircleVmlElement = svgRendererInternals.BaseSvgElement.inherit(BaseVmlElement).inherit({
                defaultSettings: function() {
                    return extendDefaultVmlOptions({
                            cx: 0,
                            cy: 0,
                            r: 0
                        })
                },
                applySettings: function(settings) {
                    settings.cx = settings.cx || settings.x;
                    settings.cy = settings.cy || settings.y;
                    return this.callBase(settings)
                },
                adjustSettings: function() {
                    var r,
                        cx,
                        cy;
                    if (this.settings.cx !== undefined || this.settings.cy !== undefined || this.settings.r !== undefined) {
                        r = 'r' in this.settings ? this.settings.r : this.settings.width / 2;
                        cx = 'cx' in this.settings ? this.settings.cx : this.settings.x + this.settings.width / 2;
                        cy = 'cy' in this.settings ? this.settings.cy : this.settings.y + this.settings.width / 2;
                        this.settings.x = cx - r;
                        this.settings.y = cy - r;
                        this.settings.width = this.settings.height = r * 2;
                        delete this.settings.cx;
                        delete this.settings.cy;
                        delete this.settings.r
                    }
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'oval', params)
                }
            });
        var TextVmlElement = svgRendererInternals.BaseSvgElement.inherit(BaseVmlElement).inherit({
                isVml: function() {
                    return false
                },
                defaultSettings: function() {
                    return {
                            x: 0,
                            y: 0,
                            position: 'absolute',
                            whiteSpace: 'nowrap'
                        }
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'span', params)
                },
                adjustSettings: function() {
                    var text,
                        settings = this.settings;
                    if (settings.font) {
                        settings.fill = settings.fill || settings.font.color;
                        settings.opacity = settings.opacity || settings.font.opacity
                    }
                    if ('text' in settings) {
                        text = utils.isDefined(settings.text) ? settings.text : '';
                        text = text.toString().replace(/\r/g, "");
                        text = text.replace(/\n/g, "<br/>");
                        $(this.element).html(text);
                        delete settings.text
                    }
                    if (this.renderer.rtl)
                        $(this.element).css('direction', 'rtl')
                },
                updateText: function(text) {
                    this.applySettings({text: utils.isDefined(text) ? text : ''})
                },
                _applyAttributes: function(settings) {
                    this.callBase(settings);
                    settings = this._fullSettings;
                    var rotate = settings.rotate,
                        rotateAngle = 0,
                        rotateX,
                        rotateY,
                        cos = 1,
                        sin = 0,
                        osin = 0,
                        ocos = 1,
                        angle,
                        otg,
                        rad,
                        y = settings.y + (settings.translateY || 0),
                        x = settings.x + (settings.translateX || 0),
                        align = settings.align,
                        bBox = this.getBBox(),
                        style = this._style || {},
                        marginLeft = 0,
                        marginTop = 0,
                        fontHeightOffset,
                        alignMultiplier,
                        rotateObject,
                        textWidth,
                        textHeight;
                    if (this._oldRotate && !bBox.isEmpty) {
                        rad = this._oldRotate.angle * Math.PI / 180.0;
                        osin = Math.sin(rad);
                        ocos = Math.cos(rad);
                        if ((this._oldRotate.angle | 0) % 90 !== 0)
                            if ((this._oldRotate.angle | 0) % 45 === 0)
                                textWidth = bBox.width,
                                textHeight = bBox.height;
                            else {
                                otg = Math.abs(Math.tan(rad));
                                var b = (bBox.width - bBox.height * otg) / (1 - otg * otg);
                                var a = bBox.width - b;
                                textHeight = Math.abs(a / osin);
                                textWidth = Math.abs(b / ocos)
                            }
                        else {
                            textHeight = Math.abs(bBox.height * ocos - bBox.width * osin);
                            textWidth = Math.abs(bBox.width * ocos - bBox.height * osin)
                        }
                    }
                    else
                        textWidth = bBox.width,
                        textHeight = bBox.height;
                    this.__textWidth = textWidth;
                    this.__textHeight = textHeight;
                    if (textHeight || textWidth) {
                        rotateObject = parseRotateParameter(rotate, x, y);
                        this._oldRotate = rotateObject;
                        if (rotateObject) {
                            rotateAngle = rotateObject.angle;
                            rotateX = rotateObject.x;
                            rotateY = rotateObject.y;
                            if (Math.abs(rotateAngle) > 360)
                                rotateAngle = rotateAngle % 360;
                            if (rotateAngle < 0)
                                rotateAngle = rotateAngle + 360;
                            if (rotateAngle) {
                                rad = rotateAngle * Math.PI / 180.0;
                                cos = Math.cos(rad);
                                sin = Math.sin(rad);
                                style.filter = 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + cos.toFixed(5) + ', M12 = ' + (-sin).toFixed(5) + ', M21 = ' + sin.toFixed(5) + ', M22 = ' + cos.toFixed(5) + ')'
                            }
                            else {
                                style.filter = '';
                                this._oldRotate = null
                            }
                            marginLeft = (x - rotateX) * (cos - 1) - (y - rotateY) * sin;
                            marginTop = (x - rotateX) * sin + (y - rotateY) * (cos - 1)
                        }
                        fontHeightOffset = textHeight * (0.55 + 0.45 / 2);
                        if (rotateAngle < 90) {
                            marginTop -= fontHeightOffset * cos;
                            marginLeft -= (textHeight - fontHeightOffset) * sin
                        }
                        else if (rotateAngle < 180) {
                            marginTop += (textHeight - fontHeightOffset) * cos;
                            marginLeft += textWidth * cos - (textHeight - fontHeightOffset) * sin
                        }
                        else if (rotateAngle < 270) {
                            marginTop += (textHeight - fontHeightOffset) * cos + textWidth * sin;
                            marginLeft += textWidth * cos + fontHeightOffset * sin
                        }
                        else {
                            marginTop += textWidth * sin - fontHeightOffset * cos;
                            marginLeft += fontHeightOffset * sin
                        }
                        if (rotateAngle && this.renderer.rtl)
                            marginLeft -= textWidth - (textHeight * Math.abs(sin) + textWidth * Math.abs(cos));
                        alignMultiplier = {
                            center: 0.5,
                            right: 1
                        }[align];
                        if (alignMultiplier) {
                            marginLeft -= textWidth * alignMultiplier * cos;
                            marginTop -= textWidth * alignMultiplier * sin
                        }
                        style.marginLeft = Math.round(marginLeft) + 'px';
                        style.marginTop = Math.round(marginTop) + 'px'
                    }
                    if (settings.fill && settings.fill !== 'none')
                        style.color = settings.fill;
                    if (settings.opacity)
                        this.element.style.filter = 'alpha(opacity=' + settings.opacity * 100 + ')';
                    this.applyStyle(style)
                }
            });
        var GroupVmlElement = svgRendererInternals.BaseSvgElement.inherit(BaseVmlElement).inherit({
                isVml: function() {
                    return false
                },
                defaultSettings: function() {
                    return {
                            x: 0,
                            y: 0,
                            position: 'absolute'
                        }
                },
                ctor: function(renderer, params) {
                    this.callBase(renderer, 'div', params)
                },
                adjustSettings: function() {
                    if (this.settings.clipId || this._clipRect) {
                        var rect = this.renderer.getClipRect(this.settings.clipId, this);
                        if (this._clipRect)
                            if (rect)
                                this._clipRect.applySettings({
                                    x: rect.x,
                                    y: rect.y,
                                    width: rect.width,
                                    height: rect.height
                                });
                            else {
                                this._clipRect.remove();
                                this._clipRect = null
                            }
                        else
                            this._clipRect = this.renderer.createRect(rect.x, rect.y, rect.width, rect.height, 0, {
                                fill: "none",
                                opacity: 0.002,
                                "class": CLIP_RECT_CLASS
                            });
                        if (this._clipRect)
                            this.childElements.length && this._clipRect.append(this)
                    }
                },
                applySettings: function(settings) {
                    var rotate;
                    settings = settings || {};
                    rotate = settings.rotate;
                    if (rotate) {
                        if (utils.isNumber(rotate))
                            rotate = [rotate, settings.x || 0, settings.y || 0];
                        $.each(this.childElements, function(_, child) {
                            child.applySettings({rotate: rotate})
                        })
                    }
                    delete settings.rotate;
                    delete settings.x;
                    delete settings.y;
                    this.callBase(settings);
                    $.each(this.childElements || [], function(_, c) {
                        c.applySettings({})
                    });
                    return this
                },
                getBBox: function() {
                    return this._getBBox()
                },
                update: function() {
                    if (this.settings.clipId) {
                        var bbox = this.getBBox();
                        this.applyStyle({
                            left: bbox.x + (this.settings.translateX || 0),
                            right: bbox.y + (this.settings.translateY || 0),
                            width: bbox.width,
                            height: bbox.height
                        })
                    }
                }
            });
        renderers.VmlRenderer = renderers.SvgRenderer.inherit({
            ctor: function(options) {
                options = options || {};
                options.animation = {enabled: false};
                if (doc.namespaces && !doc.namespaces.vml) {
                    doc.namespaces.add('vml', 'urn:schemas-microsoft-com:vml');
                    var cssText = 'vml\\:fill, vml\\:path, vml\\:shape, vml\\:stroke, vml\\:rect, vml\\:oval' + '{ behavior:url(#default#VML); display: inline-block; };';
                    try {
                        doc.createStyleSheet().cssText = cssText
                    }
                    catch(e) {
                        doc.styleSheets[0].cssText += cssText
                    }
                }
                this._clipRects = {};
                this.cssClass = options.cssClass || '';
                this.callBase(options)
            },
            dispose: function() {
                this.callBase();
                this._clipRects = null;
                this._size = null
            },
            updateAnimationOptions: $.noop,
            draw: function(container) {
                var root = this.getRoot();
                this.callBase(container);
                if (root)
                    root.appendComplete()
            },
            recreateCanvas: function(width, height, cssClass) {
                if (width >= 0 && height >= 0) {
                    this._size = {
                        width: width,
                        height: height
                    };
                    if (!this.svgRoot) {
                        this.cssClass = cssClass || this.cssClass;
                        this.svgRoot = new RootVmlElement(this, {
                            width: width,
                            height: height,
                            'class': this.cssClass
                        })
                    }
                    else
                        this.svgRoot.applySettings({
                            width: width,
                            height: height
                        });
                    this.defsSvg && this.defsSvg.clear()
                }
            },
            _getSize: function() {
                return this._size || {}
            },
            isElementAppendedToPage: function(element) {
                return $(element.element).closest(doc.documentElement).length
            },
            createRect: function(x, y, w, h, r, options) {
                var params = $.extend(true, {}, options || {}, {
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        rx: r,
                        ry: r
                    });
                return new RectVmlElement(this, params)
            },
            createSegmentRect: function(x, y, w, h, r, segments, options) {
                var params = $.extend({}, options || {}, {
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        rx: r,
                        ry: r,
                        segments: segments
                    });
                return new SegmentRectVmlElement(this, params)
            },
            createClipRect: function(x, y, width, height) {
                var clipId = utils.getNextDefsSvgId(),
                    elements = [],
                    clipRect = {
                        id: clipId,
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        addElement: function(element) {
                            var hasElement = false;
                            $.each(elements, function() {
                                if (this === element) {
                                    hasElement = true;
                                    return false
                                }
                            });
                            if (!hasElement)
                                elements.push(element)
                        },
                        append: function() {
                            return this
                        },
                        remove: function(){},
                        dispose: function(){},
                        updateRectangle: function(settings) {
                            if ('x' in settings)
                                this.x = settings.x;
                            if ('translateX' in settings)
                                this.x += settings.translateX;
                            if ('y' in settings)
                                this.y = settings.y;
                            if ('translateY' in settings)
                                this.y += settings.translateY;
                            if ('width' in settings)
                                this.width = settings.width;
                            if ('height' in settings)
                                this.height = settings.height;
                            $.each(elements, function() {
                                this.applySettings({clipId: clipId})
                            });
                            return this
                        }
                    };
                this._clipRects[clipId] = clipRect;
                return clipRect
            },
            getClipRect: function(clipId, element) {
                var clipRect = this._clipRects[clipId];
                if (clipRect && element)
                    clipRect.addElement(element);
                return this._clipRects[clipId]
            },
            createImage: function(x, y, w, h, href, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        href: href
                    });
                return new ImageVmlElement(this, params)
            },
            createLine: function(x1, y1, x2, y2, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {points: [x1, y1, x2, y2]});
                return new PathVmlElement(this, params)
            },
            createPath: function(points, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {points: points});
                return new PathVmlElement(this, params)
            },
            createSimplePath: function(options) {
                return new SimplePathVmlElement(this, options)
            },
            createBezierPath: function(points, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {points: points});
                return new BezierVmlElement(this, params)
            },
            createArea: function(points, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {points: points});
                return new AreaVmlElement(this, params)
            },
            createBezierArea: function(points, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {points: points});
                return new BezierAreaVmlElement(this, params)
            },
            createCircle: function(x, y, r, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {
                        cx: x,
                        cy: y,
                        r: r
                    });
                return new CircleVmlElement(this, params)
            },
            createArc: function(x, y, outerRadius, innerRadius, startAngle, endAngle, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {
                        x: x,
                        y: y,
                        outerRadius: outerRadius,
                        innerRadius: innerRadius,
                        startAngle: startAngle,
                        endAngle: endAngle
                    });
                return new ArcVmlElement(this, params)
            },
            createText: function(text, x, y, options) {
                var params = $.extend(true, {}, options && !options.inh ? options : {}, {
                        x: x,
                        y: y,
                        text: text
                    });
                return new TextVmlElement(this, params)
            },
            createGroup: function(options) {
                return new GroupVmlElement(this, options)
            },
            createPattern: function(color, hatching) {
                return {
                        id: color,
                        append: function() {
                            return this
                        },
                        clear: function(){},
                        dispose: function(){}
                    }
            },
            createFilter: function(type) {
                if (type === 'shadow')
                    return {
                            ref: null,
                            append: function() {
                                return this
                            },
                            dispose: function() {
                                return this
                            },
                            applySettings: function() {
                                return this
                            }
                        };
                return null
            },
            svg: function() {
                return ''
            }
        });
        function buildPath(points) {
            var i = 0,
                ii = points.length,
                list = [];
            for (; i < ii; )
                list.push('l', points[i++].toFixed(0), points[i++].toFixed(0));
            if (ii) {
                list[0] = 'm';
                list.push('x e');
                list = list.join(' ')
            }
            else
                list = '';
            return list
        }
        function processCircleSettings(x, y, size) {
            return {
                    cx: x,
                    cy: y,
                    r: size / 2
                }
        }
        renderers._vmlBuildPath = buildPath;
        renderers._vmlProcessCircleSettings = processCircleSettings;
        renderers.__vmlRendererInternals = {
            RootVmlElement: RootVmlElement,
            RectVmlElement: RectVmlElement,
            ImageVmlElement: ImageVmlElement,
            PathVmlElement: PathVmlElement,
            AreaVmlElement: AreaVmlElement,
            BezierVmlElement: BezierVmlElement,
            BezierAreaVmlElement: BezierAreaVmlElement,
            SimplePathVmlElement: SimplePathVmlElement,
            CircleVmlElement: CircleVmlElement,
            TextVmlElement: TextVmlElement,
            GroupVmlElement: GroupVmlElement,
            ArcVmlElement: ArcVmlElement,
            SegmentRectVmlElement: SegmentRectVmlElement
        }
    })(jQuery, DevExpress);
    /*! Module viz-core, file renderer.js */
    (function($, DX) {
        var renderers = DX.viz.renderers,
            browser = DX.browser;
        function isSvg() {
            return !(browser.msie && browser.version < 9) || !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect
        }
        if (!isSvg()) {
            renderers.Renderer = renderers.VmlRenderer;
            renderers.buildPath = renderers._vmlBuildPath;
            renderers.processCircleSettings = renderers._vmlProcessCircleSettings
        }
        else {
            renderers.Renderer = renderers.SvgRenderer;
            renderers.buildPath = renderers._svgBuildPath;
            renderers.processCircleSettings = renderers._svgProcessCircleSettings
        }
        renderers.isSvg = isSvg
    })(jQuery, DevExpress);
    /*! Module viz-core, file animation.js */
    (function(DX) {
        var renderers = DX.viz.renderers,
            Class = DX.Class,
            noop = function(){},
            easingFunctions = {
                easeOutCubic: function(pos, start, end) {
                    return pos === 1 ? end : (1 - Math.pow(1 - pos, 3)) * (end - start) + +start
                },
                linear: function(pos, start, end) {
                    return pos === 1 ? end : pos * (end - start) + +start
                }
            };
        renderers.easingFunctions = easingFunctions;
        renderers.animationSvgStep = {
            points: function(elem, params, progress, easing, currentParams) {
                var from = params.from,
                    to = params.to,
                    path = [],
                    i,
                    j,
                    seg,
                    d;
                for (i = 0; i < from.length; i++) {
                    seg = [from[i][0]];
                    if (from[i].length > 1)
                        for (j = 1; j < from[i].length; j++)
                            seg.push(easing(progress, from[i][j], to[i][j]));
                    path[i] = seg.join(' ')
                }
                d = path.join(' ');
                currentParams.d = params.end && progress === 1 ? params.end : d;
                elem.element.setAttribute('d', d)
            },
            arc: function(elem, params, progress, easing) {
                var from = params.from,
                    to = params.to,
                    current = {};
                for (var i in from)
                    current[i] = easing(progress, from[i], to[i]);
                elem.applySettings(current)
            },
            transform: function(elem, params, progress, easing, currentParams) {
                var translate = params.translate,
                    rotate = params.rotate,
                    scale = params.scale,
                    transformations = [],
                    elemSettings = elem.settings;
                if (translate) {
                    currentParams.translateX = easing(progress, translate.x.from, translate.x.to);
                    currentParams.translateY = easing(progress, translate.y.from, translate.y.to);
                    transformations.push('translate(' + currentParams.translateX + ',' + currentParams.translateY + ')')
                }
                else if (elemSettings.translateX || elemSettings.translateY)
                    transformations.push('translate(' + (elemSettings.translateX || 0) + ',' + (elemSettings.translateY || 0) + ')');
                if (rotate) {
                    currentParams.rotate = {
                        angle: easing(progress, rotate.angle.from, rotate.angle.to),
                        x: rotate.x,
                        y: rotate.y
                    };
                    transformations.push('rotate(' + currentParams.rotate.angle + ',' + rotate.x + ',' + rotate.y + ')')
                }
                else if (elemSettings.rotate)
                    transformations.push('rotate(' + elemSettings.rotate.angle + ',' + (elemSettings.rotate.x || 0) + ',' + (elemSettings.rotate.y || 0) + ')');
                if (scale) {
                    currentParams.scale = {
                        x: easing(progress, scale.x.from, scale.x.to),
                        y: easing(progress, scale.y.from, scale.y.to)
                    };
                    transformations.push('scale(' + currentParams.scale.x + ',' + currentParams.scale.y + ')')
                }
                else if (elemSettings.scale)
                    transformations.push('scale(' + elemSettings.scale.x + ',' + elemSettings.scale.y + ')');
                elem.element.setAttribute('transform', transformations.join())
            },
            base: function(elem, params, progress, easing, currentParams, attributeName) {
                currentParams[attributeName] = easing(progress, params.from, params.to);
                elem.element.setAttribute(attributeName, currentParams[attributeName])
            },
            _: noop,
            complete: function(element, currentSettings) {
                element.applySettings(currentSettings)
            }
        };
        var Animation = Class.inherit({
                ctor: function(element, params, options) {
                    var that = this;
                    that._progress = 0;
                    that.element = element;
                    that.params = params;
                    that.options = options;
                    that.duration = options.partitionDuration ? options.duration * options.partitionDuration : options.duration;
                    that._animateStep = options.animateStep || renderers.animationSvgStep;
                    that._easing = easingFunctions[options.easing] || easingFunctions['easeOutCubic'];
                    that._currentParams = {};
                    that.tick = that._start
                },
                _calcProgress: function(now) {
                    return Math.min(1, (now - this._startTime) / this.duration)
                },
                _step: function(now) {
                    var that = this,
                        animateStep = that._animateStep,
                        attrName;
                    that._progress = that._calcProgress(now);
                    for (attrName in that.params) {
                        if (!that.params.hasOwnProperty(attrName))
                            continue;
                        var anim = animateStep[attrName] || animateStep.base;
                        anim(that.element, that.params[attrName], that._progress, that._easing, that._currentParams, attrName)
                    }
                    that.options.step && that.options.step(that._easing(that._progress, 0, 1), that._progress);
                    if (that._progress === 1)
                        return that.stop();
                    return true
                },
                _start: function(now) {
                    this._startTime = now;
                    this.tick = this._step;
                    return true
                },
                _end: function(disableComplete) {
                    var that = this;
                    that.stop = noop;
                    that.tick = noop;
                    that._animateStep.complete && that._animateStep.complete(that.element, that._currentParams);
                    that.options.complete && !disableComplete && that.options.complete()
                },
                tick: function(now) {
                    return true
                },
                stop: function(breakAnimation, disableComplete) {
                    var options = this.options;
                    if (!breakAnimation && options.repeatCount && --options.repeatCount > 0) {
                        this.tick = this._start;
                        return true
                    }
                    else
                        this._end(disableComplete)
                }
            });
        renderers.AnimationController = Class.inherit(function() {
            var FPS = 1000 / 60,
                requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                    setTimeout(callback, FPS)
                };
            return {
                    ctor: function() {
                        var that = this;
                        that.requestAnimationFrame = requestAnimationFrame;
                        that._animationCount = 0;
                        that._timerId = null;
                        that._animations = {}
                    },
                    _loop: function() {
                        var that = this,
                            animations = that._animations,
                            activeAnimation = 0,
                            now = (new Date).getTime(),
                            an;
                        for (an in animations) {
                            if (!animations.hasOwnProperty(an))
                                continue;
                            if (!animations[an].tick(now))
                                delete animations[an];
                            activeAnimation++
                        }
                        if (activeAnimation === 0) {
                            that.stop();
                            return
                        }
                        that._timerId = that.requestAnimationFrame.call(null, function() {
                            that._loop()
                        }, that.element)
                    },
                    addAnimation: function(animation) {
                        var that = this;
                        that._animations[that._animationCount++] = animation;
                        if (!that._timerId) {
                            clearTimeout(that._startDelay);
                            that._startDelay = setTimeout(function() {
                                that._timerId = 1;
                                that._loop()
                            }, 0)
                        }
                    },
                    animateElement: function(elem, params, options) {
                        if (elem && params && options) {
                            elem.animation && elem.animation.stop(true);
                            this.addAnimation(elem.animation = new Animation(elem, params, options))
                        }
                    },
                    dispose: function() {
                        this.stop();
                        this.element = null
                    },
                    stop: function() {
                        this._animations = {};
                        this._animationCount = 0;
                        clearTimeout(this._startDelay);
                        this._timerId = null
                    },
                    lock: function() {
                        var animations = this._animations;
                        for (var an in animations)
                            animations.hasOwnProperty(an) && animations[an].stop(true, true);
                        this.stop()
                    }
                }
        }());
        renderers.Animation = Animation;
        renderers.noop = noop
    })(DevExpress);
    /*! Module viz-core, file namespaces.js */
    (function(DevExpress) {
        DevExpress.viz.charts = {series: {}}
    })(DevExpress);
    /*! Module viz-core, file chartsConsts.js */
    (function(DX) {
        DX.viz.charts.consts = {
            dataTypes: {
                STRING: 'string',
                NUMERIC: 'numeric',
                DATETIME: 'datetime'
            },
            axisTypes: {
                DISCRETE: 'discrete',
                CONTINUOUS: 'continuous',
                LOGARITHMIC: 'logarithmic'
            }
        }
    })(DevExpress);
    /*! Module viz-core, file dataValidator.js */
    (function($, DX) {
        var viz = DX.viz,
            parseUtils = new viz.core.ParseUtils,
            chartConst = viz.charts.consts,
            dataTypes = chartConst.dataTypes,
            axisTypes = chartConst.axisTypes,
            utils = DX.utils,
            _each = $.each,
            _isDefined = utils.isDefined;
        var mergeSort = function(data, field) {
                function merge_sort(array, low, high, field) {
                    if (low < high) {
                        var mid = Math.floor((low + high) / 2);
                        merge_sort(array, low, mid, field);
                        merge_sort(array, mid + 1, high, field);
                        merge(array, low, mid, high, field)
                    }
                }
                var n = data.length;
                merge_sort(data, 0, n - 1, field);
                return data
            };
        var merge = function(array, low, mid, high, field) {
                var newArray = new Array(high - low + 1),
                    countL = low,
                    countR = mid + 1,
                    k,
                    i = 0;
                while (countL <= mid && countR <= high) {
                    if (array[countL][field] <= array[countR][field] || !_isDefined(array[countR][field])) {
                        newArray[i] = array[countL];
                        countL++
                    }
                    else {
                        newArray[i] = array[countR];
                        countR++
                    }
                    i++
                }
                if (countL > mid)
                    for (k = countR; k <= high; k++, i++)
                        newArray[i] = array[k];
                else
                    for (k = countL; k <= mid; k++, i++)
                        newArray[i] = array[k];
                for (k = 0; k <= high - low; k++)
                    array[k + low] = newArray[k];
                return array
            };
        viz.charts.DataValidator = DX.Class.inherit({
            ctor: function(data, groups, incidentOccured, dataPrepareOptions) {
                var that = this;
                groups = groups || [[]];
                if (!data)
                    that._nullData = true;
                that.groups = groups;
                that.data = data || [];
                that._parsers = {};
                that._errorShowList = {};
                that._skipFields = {};
                that.options = dataPrepareOptions || {};
                that.incidentOccured = incidentOccured;
                that.userArgumentCategories = that.groups.length && that.groups[0].length && that.groups[0][0].getArgumentCategories();
                if (!incidentOccured)
                    that.incidentOccured = $.noop
            },
            validate: function validate() {
                var that = this;
                that._data = that.data;
                if (!utils.isArray(that.data) || that._nullData)
                    that._incorrectDataMessage();
                that.groups.argumentType = null;
                that.groups.argumentAxisType = null;
                $.each(that.groups, function(_, group) {
                    group.valueType = null;
                    group.valueAxisType = null;
                    $.each(group, function(_, series) {
                        series.updateDataType({})
                    })
                });
                that._checkType();
                that._checkAxisType();
                if (that.options.convertToAxisDataType) {
                    that._createParser();
                    that._parse()
                }
                that._groupData();
                that._sort();
                $.each(that._skipFields, function(field, fieldValue) {
                    if (fieldValue === that._data.length)
                        that.incidentOccured("W2002", [field])
                });
                return that._data
            },
            _checkType: function _checkType() {
                var that = this,
                    groupsWithUndefinedValueType = [],
                    groupsWithUndefinedArgumentType = [],
                    checkValueTypeOfGroup = function checkValueTypeOfGroup(group, cell) {
                        $.each(group, function(_, series) {
                            $.each(series.getValueFields(), function(_, field) {
                                group.valueType = that._getType(cell[field], group.valueType)
                            })
                        });
                        if (group.valueType)
                            return true
                    },
                    checkArgumentTypeOfGroup = function checkArgumentTypeOfGroup(group, cell) {
                        $.each(group, function(_, series) {
                            that.groups.argumentType = that._getType(cell[series.getArgumentField()], that.groups.argumentType)
                        });
                        if (that.groups.argumentType)
                            return true
                    };
                $.each(that.groups, function(_, group) {
                    if (!group.length)
                        return null;
                    var options = group[0].getOptions(),
                        valueTypeGroup = options.valueType,
                        argumentTypeGroup = options.argumentType;
                    group.valueType = valueTypeGroup;
                    that.groups.argumentType = argumentTypeGroup;
                    valueTypeGroup ? null : groupsWithUndefinedValueType.push(group);
                    argumentTypeGroup ? null : groupsWithUndefinedArgumentType.push(group)
                });
                if (groupsWithUndefinedValueType.length || groupsWithUndefinedArgumentType.length)
                    $.each(that.data, function(_, cell) {
                        var define = true;
                        if (!utils.isObject(cell))
                            return;
                        $.each(groupsWithUndefinedValueType, function(index, group) {
                            define = define && checkValueTypeOfGroup(group, cell)
                        });
                        $.each(groupsWithUndefinedArgumentType, function(index, group) {
                            define = define && checkArgumentTypeOfGroup(group, cell)
                        });
                        if (!that.options.checkTypeForAllData && define)
                            return false
                    })
            },
            _checkAxisType: function _checkAxisType() {
                var that = this;
                $.each(that.groups, function(_, group) {
                    $.each(group, function(_, series) {
                        var optionsSeries = {},
                            existingSeriesOptions = series.getOptions();
                        optionsSeries.argumentAxisType = that._correctAxisType(that.groups.argumentType, existingSeriesOptions.argumentAxisType, !!that.userArgumentCategories.length);
                        optionsSeries.valueAxisType = that._correctAxisType(group.valueType, existingSeriesOptions.valueAxisType, !!series.getValueCategories().length);
                        that.groups.argumentAxisType = that.groups.argumentAxisType || optionsSeries.argumentAxisType;
                        group.valueAxisType = group.valueAxisType || optionsSeries.valueAxisType;
                        optionsSeries.argumentType = that.groups.argumentType;
                        optionsSeries.valueType = group.valueType;
                        series.updateDataType(optionsSeries)
                    })
                })
            },
            _createParser: function _createParser() {
                var that = this;
                $.each(that.groups, function(index, group) {
                    $.each(group, function(_, series) {
                        that._parsers[series.getArgumentField()] = that._createParserUnit(that.groups.argumentType, that.groups.argumentAxisType === axisTypes.LOGARITHMIC ? that._filterForLogAxis : null);
                        $.each(series.getValueFields(), function(_, field) {
                            that._parsers[field] = that._createParserUnit(group.valueType, group.valueAxisType === axisTypes.LOGARITHMIC ? that._filterForLogAxis : null, series.getOptions().ignoreEmptyPoints)
                        });
                        if (series.getTagField())
                            that._parsers[series.getTagField()] = null
                    })
                })
            },
            _parse: function _parse() {
                var that = this,
                    parsedData = [];
                $.each(that.data, function(_, cell) {
                    var parserObject = {};
                    if (!utils.isObject(cell)) {
                        cell && that._incorrectDataMessage();
                        return
                    }
                    $.each(that._parsers, function(field, parser) {
                        parserObject[field] = parser ? parser(cell[field], field) : cell[field];
                        parserObject['original' + field] = cell[field]
                    });
                    parsedData.push(parserObject)
                });
                this._data = parsedData
            },
            _groupMinSlices: function(argumentField, valueField, smallValuesGrouping) {
                var that = this,
                    smallValuesGrouping = smallValuesGrouping || {},
                    mode = smallValuesGrouping.mode,
                    count = smallValuesGrouping.topCount,
                    threshold = smallValuesGrouping.threshold,
                    name = smallValuesGrouping.groupName || 'others',
                    others = {},
                    data = that._data.slice(),
                    index;
                var groupingValues = function(index) {
                        if (!_isDefined(index) || index < 0)
                            return;
                        _each(data.slice(index), function(_, cell) {
                            if (!_isDefined(cell[valueField]))
                                return;
                            others[valueField] += cell[valueField];
                            cell[valueField] = undefined;
                            cell['original' + valueField] = undefined
                        })
                    };
                if (!mode || mode === 'none')
                    return;
                others[argumentField] = name + '';
                others[valueField] = 0;
                data.sort(function(a, b) {
                    if (_isDefined(b[valueField]) && _isDefined(a[valueField]))
                        return b[valueField] - a[valueField];
                    else if (!_isDefined(b[valueField]) && a[valueField])
                        return -1;
                    else if (!_isDefined(a[valueField]) && b[valueField])
                        return 1
                });
                if (mode === 'smallValueThreshold') {
                    _each(data, function(i, cell) {
                        if (_isDefined(index) || !_isDefined(cell[valueField]))
                            return;
                        if (threshold > cell[valueField])
                            index = i
                    });
                    groupingValues(index)
                }
                else if (mode === 'topN')
                    groupingValues(count);
                others[valueField] && that._data.push(others)
            },
            _groupData: function() {
                var that = this,
                    groups = that.groups,
                    isPie = groups.length && groups[0].length && (groups[0][0].type === 'pie' || groups[0][0].type === 'doughnut' || groups[0][0].type === 'donut'),
                    argumentField,
                    valueFields;
                if (!isPie)
                    return;
                _each(groups, function(_, group) {
                    _each(group, function(_, series) {
                        argumentField = series.getArgumentField();
                        valueFields = series.getValueFields();
                        if (groups.argumentAxisType === axisTypes.DISCRETE)
                            that._groupSameArguments(argumentField, valueFields);
                        that._groupMinSlices(argumentField, valueFields[0], series.getOptions().smallValuesGrouping)
                    })
                })
            },
            _groupSameArguments: function(argumentField, valueFields) {
                var that = this,
                    argument,
                    dataOfArguments = {},
                    parsedData = that._data;
                _each(parsedData, function(i, cell) {
                    if (!_isDefined(cell[argumentField]) || !_isDefined(cell[valueFields[0]]))
                        return;
                    argument = cell[argumentField];
                    if (_isDefined(dataOfArguments[argument])) {
                        var data = parsedData[dataOfArguments[argument]];
                        _each(valueFields, function(_, field) {
                            data[field] += cell[field];
                            cell[field] = undefined;
                            cell['original' + field] = undefined
                        })
                    }
                    else
                        dataOfArguments[argument] = i
                })
            },
            _getType: function _getType(unit, type) {
                if (type === dataTypes.STRING || utils.isString(unit))
                    return dataTypes.STRING;
                if (type === dataTypes.DATETIME || utils.isDate(unit))
                    return dataTypes.DATETIME;
                if (utils.isNumber(unit))
                    return dataTypes.NUMERIC;
                return type
            },
            _correctAxisType: function _correctAxisType(type, axisType, hasCategories) {
                if (type === dataTypes.STRING && (axisType === axisTypes.CONTINUOUS || axisType === axisTypes.LOGARITHMIC))
                    this.incidentOccured("E2002");
                if (axisType === axisTypes.LOGARITHMIC)
                    return axisTypes.LOGARITHMIC;
                axisType = (hasCategories || axisType === axisTypes.DISCRETE || type === dataTypes.STRING) && axisTypes.DISCRETE;
                return axisType || axisTypes.CONTINUOUS
            },
            _filterForLogAxis: function(val, field) {
                if (val <= 0) {
                    this.incidentOccured("E2004", [field]);
                    return null
                }
                return val
            },
            _createParserUnit: function _createParserUnit(type, filter, ignoreEmptyPoints) {
                var that = this,
                    parser = type ? parseUtils.getParser(type, undefined, true) : function(unit) {
                        return unit
                    };
                return function(unit, field) {
                        var parseUnit = parser(unit);
                        if (filter)
                            parseUnit = filter.call(that, parseUnit, field);
                        parseUnit === null && ignoreEmptyPoints && (parseUnit = undefined);
                        if (parseUnit === undefined) {
                            that._addSkipFields(field);
                            that._validUnit(unit, field, type)
                        }
                        return parseUnit
                    }
            },
            _validUnit: function _validUnit(unit, field, type) {
                if (!unit)
                    return;
                if (!utils.isNumber(unit) && !utils.isDate(unit) && !utils.isString(unit)) {
                    this.incidentOccured("E2003", [field]);
                    return
                }
                this.incidentOccured("E2004", [field])
            },
            _sort: function _sort() {
                var that = this,
                    groups = that.groups,
                    hash = {},
                    argumentField = groups.length && groups[0].length && groups[0][0].getArgumentField();
                if (utils.isFunction(that.options.sortingMethod))
                    that._data.sort(that.options.sortingMethod);
                else if (that.userArgumentCategories.length) {
                    $.each(that.userArgumentCategories, function(index, value) {
                        hash[value] = index
                    });
                    that._data.sort(function sortCat(a, b) {
                        a = a[argumentField];
                        b = b[argumentField];
                        return hash[a] - hash[b]
                    })
                }
                else if (that.options.sortingMethod === true && groups.argumentType !== dataTypes.STRING)
                    mergeSort(that._data, argumentField)
            },
            _addSkipFields: function _addSkipFields(field) {
                this._skipFields[field] = (this._skipFields[field] || 0) + 1
            },
            _incorrectDataMessage: function() {
                if (this._erorrDataSource !== true) {
                    this._erorrDataSource = true;
                    this.incidentOccured("E2001")
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file themeManager.js */
    (function($, DX, undefined) {
        var viz = DX.viz,
            Palette = viz.core.Palette,
            utils = DX.utils;
        var HOVER_COLOR_HIGHLIGHTING = 20,
            HIGHLIGHTING_STEP = 50;
        viz.charts.ThemeManager = viz.core.BaseThemeManager.inherit(function() {
            var ctor = function(options, themeGroupName) {
                    var that = this;
                    options = options || {};
                    that._userOptions = options;
                    that._mergeAxisTitleOptions = [];
                    themeGroupName && (that._themeSection = themeGroupName);
                    that._IE8 = DX.browser.msie && DX.browser.version < 9;
                    that.setTheme(options.theme);
                    that.palette = new Palette(options.palette, {
                        stepHighlight: HIGHLIGHTING_STEP,
                        theme: that._themeName
                    })
                };
            var dispose = function() {
                    var that = this;
                    that.palette.dispose();
                    that.palette = that._userOptions = that._mergedSettings = null;
                    that.callBase()
                };
            var initDefaultSeriesTheme = function(that) {
                    var commonSeriesSettings = that._theme.commonSeriesSettings;
                    commonSeriesSettings.point = commonSeriesSettings.point || {};
                    commonSeriesSettings.label = commonSeriesSettings.label || {};
                    that._initializeFont(commonSeriesSettings.label.font)
                };
            var initAxisTheme = function(that) {
                    var axisTheme = that._theme.commonAxisSettings;
                    if (axisTheme) {
                        axisTheme.label = axisTheme.label || {};
                        axisTheme.grid = axisTheme.grid || {};
                        axisTheme.ticks = axisTheme.ticks || {};
                        axisTheme.line = axisTheme.line || {};
                        axisTheme.title = axisTheme.title || {};
                        axisTheme.label.font = axisTheme.label.font || {};
                        that._initializeFont(axisTheme.label.font);
                        axisTheme.title.font = axisTheme.title.font || {};
                        that._initializeFont(axisTheme.title.font)
                    }
                };
            var resetPalette = function() {
                    this.palette.reset()
                };
            var updatePalette = function(palette) {
                    this.palette = new Palette(palette || this._theme.defaultPalette, {
                        stepHighlight: HIGHLIGHTING_STEP,
                        theme: this.themeName
                    })
                };
            var processTitleOptions = function(options) {
                    return utils.isString(options) ? {text: options} : options
                };
            var processAxisOptions = function(axisOptions, name) {
                    if (!axisOptions)
                        return;
                    axisOptions = $.extend(true, {}, axisOptions);
                    axisOptions.title = processTitleOptions(axisOptions.title);
                    if (axisOptions.type === 'logarithmic' && axisOptions.logarithmBase <= 0 || axisOptions.logarithmBase && !$.isNumeric(axisOptions.logarithmBase)) {
                        axisOptions.logarithmBase = undefined;
                        axisOptions.logarithmBaseError = true
                    }
                    if (axisOptions.label) {
                        if (axisOptions.label.alignment)
                            axisOptions.label['userAlignment'] = true;
                        if (!axisOptions.label.overlappingBehavior) {
                            if (axisOptions.label.staggered)
                                axisOptions.label.overlappingBehavior = {
                                    mode: 'stagger',
                                    staggeringSpacing: axisOptions.label.staggeringSpacing
                                };
                            if (axisOptions.label.rotationAngle)
                                axisOptions.label.overlappingBehavior = {
                                    mode: 'rotate',
                                    rotationAngle: axisOptions.label.rotationAngle
                                }
                        }
                        if (utils.isString(axisOptions.label.overlappingBehavior))
                            axisOptions.label.overlappingBehavior = {mode: axisOptions.label.overlappingBehavior};
                        if (!axisOptions.label.overlappingBehavior || !axisOptions.label.overlappingBehavior.mode)
                            axisOptions.label.overlappingBehavior = axisOptions.label.overlappingBehavior || {}
                    }
                    return axisOptions
                };
            var applyParticularAxisOptions = function(name, userOptions, rotated) {
                    var theme = this._theme,
                        position = !(rotated ^ name === "valueAxis") ? "horizontalAxis" : "verticalAxis",
                        commonAxisSettings = processAxisOptions(this._userOptions["commonAxisSettings"], name);
                    return $.extend(true, {}, theme.commonAxisSettings, theme[position], theme[name], commonAxisSettings, processAxisOptions(userOptions, name))
                };
            var mergeOptions = function(name, userOptions) {
                    userOptions = userOptions || this._userOptions[name];
                    var theme = this._theme[name],
                        result = this._mergedSettings[name];
                    if (result)
                        return result;
                    if ($.isPlainObject(theme) && $.isPlainObject(userOptions))
                        result = $.extend(true, {}, theme, userOptions);
                    else
                        result = utils.isDefined(userOptions) ? userOptions : theme;
                    this._mergedSettings[name] = result;
                    return result
                };
            var applyParticularTheme = {
                    base: mergeOptions,
                    argumentAxis: applyParticularAxisOptions,
                    valueAxisRangeSelector: function() {
                        return mergeOptions.call(this, 'valueAxis')
                    },
                    valueAxis: applyParticularAxisOptions,
                    title: function(name) {
                        var userOptions = processTitleOptions(this._userOptions[name]);
                        return mergeOptions.call(this, name, userOptions)
                    },
                    series: function(name, userOptions, isPie) {
                        var theme = this._theme,
                            userCommonSettings = this._userOptions.commonSeriesSettings || {},
                            themeCommonSettings = theme.commonSeriesSettings,
                            type = ((userOptions.type || userCommonSettings.type || themeCommonSettings.type) + '').toLowerCase(),
                            settings,
                            palette = this.palette,
                            isBar = ~type.indexOf('bar'),
                            isBubble = ~type.indexOf('bubble'),
                            mainSeriesColor,
                            containerBackgroundColor = this.getOptions("containerBackgroundColor");
                        if (isBar || isBubble) {
                            userOptions = $.extend(true, {}, userCommonSettings, userCommonSettings[type], userOptions);
                            var seriesVisibility = userOptions.visible;
                            userCommonSettings = {type: {}};
                            $.extend(true, userOptions, userOptions.point);
                            userOptions.visible = seriesVisibility
                        }
                        settings = $.extend(true, {}, themeCommonSettings, themeCommonSettings[type], userCommonSettings, userCommonSettings[type], userOptions);
                        settings.type = type;
                        settings.containerBackgroundColor = containerBackgroundColor;
                        if (!isPie) {
                            settings.widgetType = 'chart';
                            mainSeriesColor = settings.color || palette.getNextColor()
                        }
                        else {
                            settings.widgetType = 'pieChart';
                            mainSeriesColor = function() {
                                return palette.getNextColor()
                            }
                        }
                        settings.mainSeriesColor = mainSeriesColor;
                        settings._IE8 = this._IE8;
                        return settings
                    },
                    pieSegment: function(name, seriesSettings, segmentSettings) {
                        var settings = $.extend(true, {}, seriesSettings, segmentSettings);
                        var mainColor = new DX.Color(settings.color || this.palette.getNextColor());
                        settings.color = mainColor.toHex();
                        settings.border.color = settings.border.color || mainColor.toHex();
                        settings.hoverStyle.color = settings.hoverStyle.color || this._IE8 && mainColor.highlight(HOVER_COLOR_HIGHLIGHTING) || mainColor.toHex();
                        settings.hoverStyle.border.color = settings.hoverStyle.border.color || mainColor.toHex();
                        settings.selectionStyle.color = settings.selectionStyle.color || this._IE8 && mainColor.highlight(HOVER_COLOR_HIGHLIGHTING) || mainColor.toHex();
                        settings.selectionStyle.border.color = settings.selectionStyle.border.color || mainColor.toHex();
                        return settings
                    },
                    animation: function(name) {
                        var userOptions = this._userOptions[name];
                        userOptions = $.isPlainObject(userOptions) ? userOptions : utils.isDefined(userOptions) ? {enabled: !!userOptions} : {};
                        return mergeOptions.call(this, name, userOptions)
                    }
                };
            return {
                    _themeSection: 'chart',
                    ctor: ctor,
                    dispose: dispose,
                    _initializeTheme: function() {
                        var that = this,
                            theme = this._theme;
                        theme.legend = theme.legend || {};
                        theme.legend.font = theme.legend.font || {};
                        that._initializeFont(theme.legend.font);
                        initDefaultSeriesTheme(that);
                        initAxisTheme(that);
                        theme.title = theme.title || {};
                        theme.title.font = theme.title.font || {};
                        that._initializeFont(theme.title.font);
                        theme.tooltip = theme.tooltip || {};
                        theme.tooltip.font = theme.tooltip.font || {};
                        that._initializeFont(theme.tooltip.font);
                        theme.loadingIndicator = theme.loadingIndicator || {};
                        theme.loadingIndicator.font = theme.loadingIndicator.font || {};
                        that._initializeFont(theme.loadingIndicator.font)
                    },
                    resetPalette: resetPalette,
                    getOptions: function(name) {
                        return (applyParticularTheme[name] || applyParticularTheme["base"]).apply(this, arguments)
                    },
                    setTheme: function(theme) {
                        var that = this;
                        that._mergedSettings = {};
                        that.callBase(theme);
                        that.getOptions('rtlEnabled') && $.extend(true, that._theme, that._theme._rtl)
                    },
                    resetOptions: function(name) {
                        this._mergedSettings[name] = null
                    },
                    update: function(options) {
                        this._userOptions = options
                    },
                    updatePalette: updatePalette
                }
        }())
    })(jQuery, DevExpress);
    /*! Module viz-core, file factory.js */
    (function($, DX) {
        var viz = DX.viz,
            charts = viz.charts,
            series = charts.series;
        charts.factory = function() {
            var createSeriesFamily = function(options) {
                    return new series.SeriesFamily(options)
                };
            var createAxis = function(renderer, options) {
                    return new charts.Axis(renderer, options)
                };
            var createThemeManager = function(options, groupName) {
                    return new charts.ThemeManager(options, groupName)
                };
            var createDataValidator = function(data, groups, incidentOccured, dataPrepareOptions) {
                    return new charts.DataValidator(data, groups, incidentOccured, dataPrepareOptions)
                };
            var createTracker = function(options) {
                    return new charts.Tracker(options)
                };
            var createTitle = function(renderer, canvas, options, group) {
                    return new charts.ChartTitle(renderer, canvas, options, group)
                };
            var createChartLayoutManager = function(options) {
                    return new charts.LayoutManager(options)
                };
            return {
                    createSeriesFamily: createSeriesFamily,
                    createAxis: createAxis,
                    createThemeManager: createThemeManager,
                    createDataValidator: createDataValidator,
                    createTracker: createTracker,
                    createChartLayoutManager: createChartLayoutManager,
                    createTitle: createTitle
                }
        }()
    })(jQuery, DevExpress);
    /*! Module viz-core, file baseWidget.js */
    (function($, DX, undefined) {
        var core = DX.viz.core,
            utils = DX.utils;
        DX.viz.core.BaseWidget = DX.DOMComponent.inherit({
            NAMESPACE: DX.ui,
            _init: function() {
                this._setRedrawOnResize(this._getOptionRedrawOnResize());
                this._incidentOccured = this._createIncidentOccured();
                this._renderVisiblityChange()
            },
            _optionChanged: function(name, value, prevValue) {
                var that = this;
                switch (name) {
                    case'redrawOnResize':
                        that._setRedrawOnResize(that._getOptionRedrawOnResize());
                        break;
                    case'loadingIndicator':
                        that._updateLoadIndicator(that._getLoadIndicatorOption());
                        break;
                    default:
                        that._invalidate()
                }
                that.callBase(name, value, prevValue)
            },
            _getOptionRedrawOnResize: function() {
                var redrawOnResize = this.option('redrawOnResize');
                redrawOnResize = redrawOnResize !== undefined ? !!redrawOnResize : true;
                return redrawOnResize
            },
            _getLoadIndicatorOption: function() {
                return this.option('loadingIndicator')
            },
            _dispose: function() {
                var that = this;
                if (that._resizeHandlerCallback)
                    that._removeResizeCallbacks();
                that._incidentOccured = null;
                that.callBase()
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this.render()
            },
            _setRedrawOnResize: function(redrawOnResize) {
                var that = this;
                if (redrawOnResize) {
                    if (!that._resizeHandlerCallback && utils.isFunction(that._resize)) {
                        that._resizeHandlerCallback = DX.utils.createResizeHandler(function() {
                            that._resize()
                        });
                        utils.windowResizeCallbacks.add(that._resizeHandlerCallback)
                    }
                }
                else
                    that._removeResizeCallbacks()
            },
            _removeResizeCallbacks: function() {
                var that = this;
                that._resizeHandlerCallback && that._resizeHandlerCallback.stop();
                utils.windowResizeCallbacks.remove(that._resizeHandlerCallback);
                delete that._resizeHandlerCallback
            },
            _showLoadIndicator: function(options, canvas) {
                var that = this;
                that._loadIndicator = this._loadIndicator || core.CoreFactory.createLoadIndicator(options, that._element());
                that._loadIndicator.show(canvas.width, canvas.height);
                that._initializing && that._loadIndicator.endLoading(undefined, true)
            },
            _updateLoadIndicator: function(options, width, height) {
                this._loadIndicator && this._loadIndicator.applyOptions(options, width, height)
            },
            _endLoading: function(complete) {
                if (this._loadIndicator)
                    this._loadIndicator.endLoading(complete);
                else
                    complete && complete()
            },
            _reappendLoadIndicator: function() {
                this._loadIndicator && this._loadIndicator.toForeground()
            },
            _disposeLoadIndicator: function() {
                this._loadIndicator && this._loadIndicator.dispose();
                this._loadIndicator = null
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({incidentOccured: function(options) {
                        var message = "" + options.id + " - " + options.text,
                            majorVerision = options.version.split(".").slice(0, 2).join("_"),
                            url = "http://js.devexpress.com/error/" + majorVerision + "/" + options.id;
                        utils.logger.warn(message + "\n" + url)
                    }})
            },
            _createIncidentOccured: function() {
                var that = this;
                return function(errorOrWarningId, options) {
                        var isError = errorOrWarningId[0] === 'E',
                            type = isError ? "error" : "warning",
                            formattingArray = options ? options.slice(0) : [],
                            text,
                            incidentOccuredFunc = that.option('incidentOccured');
                        formattingArray.unshift(core.errorsWarnings[errorOrWarningId]);
                        text = utils.stringFormat.apply(null, formattingArray);
                        if (utils.isFunction(incidentOccuredFunc))
                            setTimeout(function() {
                                incidentOccuredFunc({
                                    id: errorOrWarningId,
                                    type: type,
                                    args: options,
                                    text: text,
                                    widget: that.NAME,
                                    version: DevExpress.VERSION
                                })
                            })
                    }
            },
            _normalizeHtml: function(html) {
                var re = /xmlns="[\s\S]*?"/gi,
                    first = true;
                html = html.replace(re, function(match) {
                    if (!first)
                        return "";
                    first = false;
                    return match
                });
                return html.replace(/xmlns:NS1="[\s\S]*?"/gi, "").replace(/NS1:xmlns:xlink="([\s\S]*?)"/gi, 'xmlns:xlink="$1"')
            },
            _drawn: function() {
                var that = this,
                    drawnCallback = that.option('drawn');
                utils.isFunction(drawnCallback) && setTimeout(function() {
                    drawnCallback(that)
                })
            },
            showLoadingIndicator: function() {
                this._showLoadIndicator(this.option('loadingIndicator'), this.canvas || {})
            },
            hideLoadingIndicator: function() {
                this._loadIndicator && this._loadIndicator.hide()
            },
            endUpdate: function() {
                if (this._updateLockCount === 1 && !this._requireRefresh)
                    this.hideLoadingIndicator();
                this.callBase()
            },
            svg: function() {
                var renderer = this.renderer || this._renderer;
                return renderer ? this._normalizeHtml(renderer.svg()) : ''
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-core, file CoreFactory.js */
    (function(DX, undefined) {
        var renderers = DX.viz.renderers,
            core = DX.viz.core;
        DX.viz.core.CoreFactory = function() {
            return {
                    createSeries: function(renderer, options) {
                        return new core.series.Series(renderer, options)
                    },
                    createPoint: function(data, options) {
                        return new core.series.points.Point(data, options)
                    },
                    createLabel: function(type, data, options) {
                        if (type === "pie" || type === "doughnut" || type === "donut")
                            return new core.series.points.PieLabel(data, options);
                        else
                            return new core.series.points.Label(data, options)
                    },
                    createRenderer: function(options) {
                        return new renderers.Renderer(options)
                    },
                    createTranslator1D: function(fromValue, toValue, fromAngle, toAngle) {
                        return (new core.Translator1D).setDomain(fromValue, toValue).setCodomain(fromAngle, toAngle)
                    },
                    createTranslator2D: function(range, canvas, options) {
                        return new core.Translator2D(range, canvas, options)
                    },
                    getTickProvider: function() {
                        return core.tickProvider
                    },
                    createTooltip: function(options, group, renderer) {
                        return new core.Tooltip(options, group, renderer)
                    },
                    createLoadIndicator: function(options, group) {
                        return new core.LoadIndicator(options, group)
                    },
                    createLegend: function(data, options, renderer, group) {
                        return new core.Legend(data, options, renderer, group)
                    },
                    createSeriesFamily: function(options) {
                        return new core.series.helpers.SeriesFamily(options)
                    }
                }
        }()
    })(DevExpress);
    DevExpress.MOD_VIZ_CORE = true
}