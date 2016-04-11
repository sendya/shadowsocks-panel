/*! 
* DevExtreme (Range Selector)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_VIZ_RANGESELECTOR) {
    if (!DevExpress.MOD_VIZ_CORE)
        throw Error('Required module is not referenced: viz-core');
    /*! Module viz-rangeselector, file namespaces.js */
    (function(DevExpress) {
        DevExpress.viz.rangeSelector = {utils: {}}
    })(DevExpress);
    /*! Module viz-rangeselector, file utils.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            utils = rangeSelector.utils,
            dxUtils = DX.utils;
        var INVISIBLE_POS = -1000;
        var findLessOrEqualValueIndex = function(values, value) {
                if (!values || values.length === 0)
                    return -1;
                var minIndex = 0,
                    maxIndex = values.length - 1,
                    index = 0;
                while (maxIndex - minIndex > 1) {
                    var index = minIndex + maxIndex >> 1;
                    if (values[index] > value)
                        maxIndex = index;
                    else
                        minIndex = index
                }
                return values[maxIndex] <= value ? maxIndex : minIndex
            };
        var findLessOrEqualValue = function(values, value) {
                var index = findLessOrEqualValueIndex(values, value);
                if (values && index >= 0 && index < values.length)
                    return values[index];
                return value
            };
        var findNearValue = function(values, value) {
                var index = findLessOrEqualValueIndex(values, value);
                if (values && index >= 0 && index < values.length) {
                    if (index + 1 < values.length)
                        if (dxUtils.isDate(value)) {
                            if (values[index + 1].getTime() - value.getTime() < value.getTime() - values[index].getTime())
                                index++
                        }
                        else if (values[index + 1] - value < value - values[index])
                            index++;
                    return values[index]
                }
                return value
            };
        var findGreaterOrEqualValue = function(values, value) {
                var index = findLessOrEqualValueIndex(values, value);
                if (values && index >= 0 && index < values.length) {
                    if (values[index] < value && index + 1 < values.length)
                        index++;
                    return values[index]
                }
                return value
            };
        var getInterval = function(valueMin, valueMax, delta) {
                var result,
                    minDateDaysCount,
                    maxDateDaysCount,
                    daysCount,
                    prevMaxDaysCount;
                if (dxUtils.isDate(valueMin)) {
                    if (delta === 'year' || delta === 'quarter' || delta === 'month')
                        return {months: valueMax.getFullYear() * 12 + valueMax.getMonth() - valueMin.getFullYear() * 12 - valueMin.getMonth()};
                    else
                        return {milliseconds: valueMax.valueOf() - valueMin.valueOf()};
                    return result
                }
                else
                    return valueMax - valueMin
            };
        var getRootOffsetLeft = function(renderer) {
                return dxUtils.getRootOffset(renderer).left || 0
            };
        var getEventPageX = function(eventArgs) {
                var result = 0;
                if (eventArgs.pageX)
                    result = eventArgs.pageX;
                else if (eventArgs.originalEvent && eventArgs.originalEvent.pageX)
                    result = eventArgs.originalEvent.pageX;
                if (eventArgs.originalEvent && eventArgs.originalEvent.touches)
                    if (eventArgs.originalEvent.touches.length > 0)
                        result = eventArgs.originalEvent.touches[0].pageX;
                    else if (eventArgs.originalEvent.changedTouches.length > 0)
                        result = eventArgs.originalEvent.changedTouches[0].pageX;
                return result
            };
        var getTextBBox = function(renderer, text, fontOptions) {
                var textElement = renderer.createText(text, INVISIBLE_POS, INVISIBLE_POS, {font: fontOptions}).append();
                var textBBox = textElement.getBBox();
                textElement.remove();
                return textBBox
            };
        utils.findLessOrEqualValue = findLessOrEqualValue;
        utils.findNearValue = findNearValue;
        utils.findGreaterOrEqualValue = findGreaterOrEqualValue;
        utils.getInterval = getInterval;
        utils.getRootOffsetLeft = getRootOffsetLeft;
        utils.getEventPageX = getEventPageX;
        utils.getTextBBox = getTextBBox
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file baseVisualElement.js */
    (function(DX) {
        DevExpress.viz.rangeSelector.BaseVisualElement = DX.Class.inherit({
            ctor: function(renderer) {
                this._renderer = renderer;
                this._isDrawn = false
            },
            applyOptions: function(options) {
                this._options = options || {};
                this._applyOptions(this._options)
            },
            _applyOptions: function(options){},
            redraw: function(group) {
                var that = this;
                if (!that._isDrawn) {
                    that._isDrawn = !(that._draw(group || that._group) === false);
                    if (group)
                        that._group = group
                }
                else
                    that._update(group || that._group)
            },
            isDrawn: function() {
                return !!this._isDrawn
            },
            isInitialized: function() {
                return !!this._options
            },
            _draw: function(group){},
            _update: function(group) {
                group.clear();
                this._draw(group)
            }
        })
    })(DevExpress);
    /*! Module viz-rangeselector, file rangeSelector.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            utils = DX.utils,
            dataUtils = DX.data.utils,
            rangeSelectorUtils = rangeSelector.utils,
            ParseUtils = DX.viz.core.ParseUtils,
            formatHelper = DX.formatHelper,
            core = DX.viz.core;
        rangeSelector.consts = {
            fontHeightRatio: 0.55,
            emptySliderMarkerText: '. . .'
        };
        rangeSelector.formatValue = function(value, formatOptions) {
            var formatObject = {
                    value: value,
                    valueText: formatHelper.format(value, formatOptions.format, formatOptions.precision)
                };
            return String(utils.isFunction(formatOptions.customizeText) ? formatOptions.customizeText.call(formatObject, formatObject) : formatObject.valueText)
        };
        rangeSelector.RangeSelector = core.BaseWidget.inherit(function() {
            var SCALE_TEXT_SPACING = 5;
            var defaultRangeSelectorOptions = {
                    size: undefined,
                    margin: {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0
                    },
                    scale: {
                        showCustomBoundaryTicks: true,
                        showMinorTicks: true,
                        startValue: undefined,
                        endValue: undefined,
                        minorTickCount: undefined,
                        minorTickInterval: undefined,
                        majorTickInterval: undefined,
                        useTicksAutoArrangement: true,
                        setTicksAtUnitBeginning: true,
                        minRange: undefined,
                        maxRange: undefined,
                        placeholderHeight: undefined,
                        valueType: undefined,
                        label: {
                            visible: true,
                            format: undefined,
                            precision: undefined,
                            customizeText: undefined
                        },
                        marker: {
                            visible: true,
                            label: {
                                format: undefined,
                                precision: undefined,
                                customizeText: undefined
                            }
                        },
                        logarithmBase: 10
                    },
                    selectedRange: undefined,
                    sliderMarker: {
                        visible: true,
                        format: undefined,
                        precision: undefined,
                        customizeText: undefined,
                        placeholderSize: undefined
                    },
                    behavior: {
                        snapToTicks: true,
                        animationEnabled: true,
                        moveSelectedRangeByClick: true,
                        manualRangeSelectionEnabled: true,
                        allowSlidersSwap: true,
                        callSelectedRangeChanged: "onMovingComplete"
                    },
                    background: {
                        color: "#C0BAE1",
                        visible: true,
                        image: {
                            url: undefined,
                            location: 'full'
                        }
                    },
                    dataSource: undefined,
                    dataSourceField: 'arg',
                    redrawOnResize: true,
                    theme: undefined,
                    selectedRangeChanged: null
                };
            var calculateMarkerSize = function(renderer, value, sliderMarkerOptions) {
                    var formattedText = value === undefined ? rangeSelector.consts.emptySliderMarkerText : rangeSelector.formatValue(value, sliderMarkerOptions),
                        textBBox = rangeSelectorUtils.getTextBBox(renderer, formattedText, sliderMarkerOptions.font);
                    return {
                            width: Math.ceil(textBBox.width) + 2 * sliderMarkerOptions.padding,
                            height: Math.ceil(textBBox.height * rangeSelector.consts.fontHeightRatio) + 2 * sliderMarkerOptions.padding + sliderMarkerOptions.pointerSize
                        }
                };
            var calculateScaleLabelHalfWidth = function(renderer, value, scaleOptions) {
                    var formattedText = rangeSelector.formatValue(value, scaleOptions.label),
                        textBBox = rangeSelectorUtils.getTextBBox(renderer, formattedText, scaleOptions.label.font);
                    return Math.ceil(textBBox.width / 2)
                };
            var calculateRangeContainerCanvas = function(size, margin, sliderMarkerSpacing) {
                    var canvas = {
                            left: margin.left + sliderMarkerSpacing.left,
                            top: margin.top + sliderMarkerSpacing.top,
                            width: size.width - margin.left - margin.right - sliderMarkerSpacing.left - sliderMarkerSpacing.right,
                            height: size.height - margin.top - margin.bottom - sliderMarkerSpacing.top - sliderMarkerSpacing.bottom
                        };
                    if (canvas.width <= 0)
                        canvas.width = 1;
                    return canvas
                };
            var parseSliderMarkersPlaceholderSize = function(placeholderSize) {
                    var placeholderWidthLeft,
                        placeholderWidthRight,
                        placeholderHeight;
                    if (utils.isNumber(placeholderSize))
                        placeholderWidthLeft = placeholderWidthRight = placeholderHeight = placeholderSize;
                    else if (placeholderSize) {
                        if (utils.isNumber(placeholderSize.height))
                            placeholderHeight = placeholderSize.height;
                        if (utils.isNumber(placeholderSize.width))
                            placeholderWidthLeft = placeholderWidthRight = placeholderSize.width;
                        else if (placeholderSize.width) {
                            if (utils.isNumber(placeholderSize.width.left))
                                placeholderWidthLeft = placeholderSize.width.left;
                            if (utils.isNumber(placeholderSize.width.right))
                                placeholderWidthRight = placeholderSize.width.right
                        }
                    }
                    return {
                            widthLeft: placeholderWidthLeft,
                            widthRight: placeholderWidthRight,
                            height: placeholderHeight
                        }
                };
            var calculateSliderMarkersSpacing = function(renderer, size, scale, sliderMarkerOptions) {
                    var leftMarkerSize,
                        leftScaleLabelWidth = 0,
                        rightScaleLabelWidth = 0,
                        rightMarkerSize,
                        placeholderWidthLeft = 0,
                        placeholderWidthRight = 0,
                        placeholderHeight = 0,
                        parsedPlaceholderSize;
                    parsedPlaceholderSize = parseSliderMarkersPlaceholderSize(sliderMarkerOptions.placeholderSize);
                    placeholderWidthLeft = parsedPlaceholderSize.widthLeft || 0;
                    placeholderWidthRight = parsedPlaceholderSize.widthRight || 0;
                    placeholderHeight = parsedPlaceholderSize.height || 0;
                    if (sliderMarkerOptions.visible) {
                        leftMarkerSize = calculateMarkerSize(renderer, scale.startValue, sliderMarkerOptions);
                        if (!placeholderWidthLeft)
                            placeholderWidthLeft = leftMarkerSize.width;
                        rightMarkerSize = calculateMarkerSize(renderer, scale.endValue, sliderMarkerOptions);
                        if (!placeholderWidthRight)
                            placeholderWidthRight = rightMarkerSize.width;
                        if (!placeholderHeight)
                            placeholderHeight = Math.max(leftMarkerSize.height, rightMarkerSize.height)
                    }
                    if (scale.label.visible) {
                        leftScaleLabelWidth = calculateScaleLabelHalfWidth(renderer, scale.startValue, scale);
                        rightScaleLabelWidth = calculateScaleLabelHalfWidth(renderer, scale.endValue, scale)
                    }
                    placeholderWidthLeft = Math.max(placeholderWidthLeft, leftScaleLabelWidth);
                    placeholderWidthRight = Math.max(placeholderWidthRight, rightScaleLabelWidth);
                    return {
                            left: placeholderWidthLeft,
                            right: placeholderWidthRight,
                            top: placeholderHeight,
                            bottom: 0
                        }
                };
            var clearContainer = function(container) {
                    if (container)
                        container.empty()
                };
            var getContainer = function(that) {
                    return that._element()
                };
            var createRangeContainer = function(rangeContainerOptions) {
                    return rangeSelector.rangeSelectorFactory.createRangeContainer(rangeContainerOptions)
                };
            var createTranslator = function(range, canvas) {
                    return {
                            x: core.CoreFactory.createTranslator2D(range.arg, canvas, {direction: "horizontal"}),
                            y: core.CoreFactory.createTranslator2D(range.val, canvas)
                        }
                };
            var createTranslatorCanvas = function(sizeOptions, rangeContainerCanvas, scaleLabelsAreaHeight) {
                    return {
                            left: rangeContainerCanvas.left,
                            top: rangeContainerCanvas.top,
                            right: sizeOptions.width - rangeContainerCanvas.width - rangeContainerCanvas.left,
                            bottom: sizeOptions.height - rangeContainerCanvas.height - rangeContainerCanvas.top + scaleLabelsAreaHeight,
                            width: sizeOptions.width,
                            height: sizeOptions.height
                        }
                };
            var createRenderer = function(that) {
                    var renderer = that.option('renderer');
                    if (renderer)
                        return renderer;
                    return core.CoreFactory.createRenderer({
                            pathModified: that.option('pathModified'),
                            rtl: that.option('rtlEnabled')
                        })
                };
            var createThemeManager = function(theme) {
                    return rangeSelector.rangeSelectorFactory.createThemeManager(theme)
                };
            var calculateValueType = function(firstValue, secondValue) {
                    var types = [$.type(firstValue), $.type(secondValue)];
                    $.inArray();
                    return $.inArray('date', types) != -1 ? 'datetime' : $.inArray('number', types) != -1 ? 'numeric' : ''
                };
            var createSeriesDataSource = function(that) {
                    var seriesDataSource,
                        dataSource = that._dataSource && that._dataSource.items(),
                        scaleOptions = that.option('scale'),
                        chartOptions = that.option('chart') || {},
                        valueType = scaleOptions.valueType;
                    if (!valueType)
                        valueType = calculateValueType(scaleOptions.startValue, scaleOptions.endValue);
                    if (dataSource || chartOptions.series) {
                        seriesDataSource = new rangeSelector.SeriesDataSource({
                            renderer: that.renderer,
                            dataSource: dataSource,
                            valueType: (valueType || '').toLowerCase(),
                            axisType: scaleOptions.type,
                            chart: chartOptions,
                            dataSourceField: that.option('dataSourceField'),
                            backgroundColor: that._userBackgroundColor,
                            incidentOccured: that._incidentOccured
                        });
                        checkLogarithmicOptions(chartOptions.valueAxis, seriesDataSource.themeManager.theme().valueAxis.logarithmBase, that._incidentOccured)
                    }
                    return seriesDataSource
                };
            var calculateTranslatorRange = function(that, seriesDataSource, scaleOptions) {
                    var translatorRange,
                        minValue,
                        maxValue,
                        inverted = false,
                        isEqualDates;
                    if (utils.isDefined(scaleOptions.startValue) && utils.isDefined(scaleOptions.endValue)) {
                        inverted = scaleOptions.inverted = scaleOptions.startValue > scaleOptions.endValue;
                        minValue = inverted ? scaleOptions.endValue : scaleOptions.startValue;
                        maxValue = inverted ? scaleOptions.startValue : scaleOptions.endValue
                    }
                    else if (utils.isDefined(scaleOptions.startValue) || utils.isDefined(scaleOptions.endValue)) {
                        minValue = scaleOptions.startValue;
                        maxValue = scaleOptions.endValue
                    }
                    translatorRange = seriesDataSource ? seriesDataSource.getBoundRange() : {
                        arg: new core.Range,
                        val: new core.Range({isValueRange: true})
                    };
                    isEqualDates = utils.isDate(minValue) && utils.isDate(maxValue) && minValue.getTime() === maxValue.getTime();
                    if (minValue !== maxValue && !isEqualDates)
                        translatorRange.arg.addRange({
                            invert: inverted,
                            min: minValue,
                            max: maxValue,
                            minVisible: minValue,
                            maxVisible: maxValue,
                            dataType: scaleOptions.valueType
                        });
                    translatorRange.arg.addRange({
                        base: scaleOptions.logarithmBase,
                        axisType: scaleOptions.type
                    });
                    if (!translatorRange.arg.isDefined()) {
                        if (isEqualDates)
                            scaleOptions.valueType = 'numeric';
                        translatorRange.arg.setStubData(scaleOptions.valueType)
                    }
                    return translatorRange
                };
            var calculateScaleAreaHeight = function(renderer, scaleOptions, visibleMarkers) {
                    var textBBox,
                        visibleLabels = scaleOptions.label.visible;
                    if (scaleOptions.placeholderHeight)
                        return scaleOptions.placeholderHeight;
                    else {
                        textBBox = rangeSelectorUtils.getTextBBox(renderer, '0', scaleOptions.label.font);
                        return (visibleLabels ? scaleOptions.label.topIndent + textBBox.height : 0) + (visibleMarkers ? scaleOptions.marker.topIndent + scaleOptions.marker.separatorHeight : 0)
                    }
                };
            var getTicksInfo = function(that, scaleOptions, translators, screenDelta) {
                    var isEmpty = scaleOptions.isEmpty,
                        tickProvider = core.CoreFactory.getTickProvider(),
                        minorTicksOptions,
                        majorTicksOptions,
                        startValue,
                        endValue,
                        businessRange = translators.x.getBusinessRange();
                    minorTicksOptions = {
                        tickInterval: isEmpty ? 0 : that.option('scale').minorTickInterval,
                        showCustomBoundaryTicks: scaleOptions.showCustomBoundaryTicks,
                        minorTickCount: scaleOptions.minorTickCount
                    };
                    majorTicksOptions = {
                        textOptions: {
                            align: 'center',
                            font: scaleOptions.label.font
                        },
                        renderer: that.renderer,
                        getText: function(value) {
                            return rangeSelector.formatValue(value, scaleOptions.label)
                        },
                        translator: translators.x,
                        isStartTickGenerated: !utils.isDefined(that.option('scale').majorTickInterval),
                        tickInterval: scaleOptions.majorTickInterval,
                        textSpacing: SCALE_TEXT_SPACING,
                        setTicksAtUnitBeginning: scaleOptions.setTicksAtUnitBeginning,
                        useTicksAutoArrangement: scaleOptions.useTicksAutoArrangement,
                        hideLabels: isEmpty
                    };
                    startValue = isEmpty ? businessRange.min : scaleOptions.startValue;
                    endValue = isEmpty ? businessRange.max : scaleOptions.endValue;
                    return tickProvider.getFullTicks(startValue, endValue, screenDelta, majorTicksOptions, minorTicksOptions, {
                            axisType: scaleOptions.type,
                            dataType: scaleOptions.valueType,
                            base: scaleOptions.logarithmBase
                        })
                };
            var updateTickIntervals = function(scaleOptions, screenDelta, incidentOccured) {
                    var tickProvider = core.CoreFactory.getTickProvider(),
                        tickIntervals = tickProvider.getTickIntervals(scaleOptions.startValue, scaleOptions.endValue, screenDelta, {
                            tickInterval: scaleOptions.majorTickInterval,
                            incidentOccured: incidentOccured
                        }, {
                            tickInterval: scaleOptions.minorTickInterval,
                            incidentOccured: incidentOccured
                        }, {
                            axisType: scaleOptions.type,
                            dataType: scaleOptions.valueType,
                            base: scaleOptions.logarithmBase
                        });
                    scaleOptions.minorTickInterval = tickIntervals.minorTickInterval;
                    scaleOptions.majorTickInterval = tickIntervals.majorTickInterval
                };
            var updateScaleOptions = function(that, seriesDataSource, translatorRange, screenDelta, scaleOptions) {
                    var minVisibleX = utils.isDefined(translatorRange.arg.minVisible) ? translatorRange.arg.minVisible : translatorRange.arg.min,
                        maxVisibleX = utils.isDefined(translatorRange.arg.maxVisible) ? translatorRange.arg.maxVisible : translatorRange.arg.max,
                        isEmptyInterval;
                    if (seriesDataSource && !seriesDataSource.isEmpty()) {
                        scaleOptions.startValue = scaleOptions.inverted ? maxVisibleX : minVisibleX;
                        scaleOptions.endValue = scaleOptions.inverted ? minVisibleX : maxVisibleX
                    }
                    isEmptyInterval = utils.isDate(scaleOptions.startValue) && utils.isDate(scaleOptions.endValue) && scaleOptions.startValue.getTime() === scaleOptions.endValue.getTime() || scaleOptions.startValue === scaleOptions.endValue;
                    scaleOptions.isEmpty = !utils.isDefined(scaleOptions.startValue) || !utils.isDefined(scaleOptions.endValue) || isEmptyInterval || scaleOptions.valueType === 'string';
                    if (scaleOptions.isEmpty)
                        scaleOptions.startValue = scaleOptions.endValue = undefined;
                    else {
                        updateTickIntervals(scaleOptions, screenDelta, that._incidentOccured);
                        if (scaleOptions.valueType === 'datetime' && !utils.isDefined(scaleOptions.label.format))
                            if (!scaleOptions.marker.visible)
                                scaleOptions.label.format = formatHelper.getDateFormatByTickInterval(scaleOptions.startValue, scaleOptions.endValue, scaleOptions.majorTickInterval);
                            else
                                scaleOptions.label.format = utils.getDateUnitInterval(scaleOptions.majorTickInterval)
                    }
                };
            var prepareSliderMarkersOptions = function(that, scaleOptions, screenDelta) {
                    var sliderMarkerOptions = $.extend(true, {}, that.option('sliderMarker')),
                        businessInterval;
                    if (!sliderMarkerOptions.format) {
                        if (!that.option('behavior').snapToTicks && utils.isNumber(scaleOptions.startValue)) {
                            businessInterval = Math.abs(scaleOptions.endValue - scaleOptions.startValue);
                            sliderMarkerOptions.format = 'fixedPoint';
                            sliderMarkerOptions.precision = utils.getSignificantDigitPosition(businessInterval / screenDelta)
                        }
                        if (scaleOptions.valueType === 'datetime')
                            if (!scaleOptions.marker.visible) {
                                if (utils.isDefined(scaleOptions.startValue) && utils.isDefined(scaleOptions.endValue))
                                    sliderMarkerOptions.format = formatHelper.getDateFormatByTickInterval(scaleOptions.startValue, scaleOptions.endValue, scaleOptions.minorTickInterval !== 0 ? scaleOptions.minorTickInterval : scaleOptions.majorTickInterval)
                            }
                            else
                                sliderMarkerOptions.format = utils.getDateUnitInterval(utils.isDefined(scaleOptions.minorTickInterval) && scaleOptions.minorTickInterval !== 0 ? scaleOptions.minorTickInterval : scaleOptions.majorTickInterval)
                    }
                    return sliderMarkerOptions
                };
            var showScaleMarkers = function(scaleOptions) {
                    return scaleOptions.valueType == 'datetime' && scaleOptions.marker.visible
                };
            var updateTranslatorRangeInterval = function(translatorRange, scaleOptions) {
                    var intervalX = scaleOptions.minorTickInterval || scaleOptions.majorTickInterval;
                    translatorRange = translatorRange.arg.addRange({interval: intervalX})
                };
            var checkLogarithmicOptions = function(options, logarithmBase, incidentOccured) {
                    if (!options)
                        return;
                    if (options.type === 'logarithmic' && options.logarithmBase <= 0 || options.logarithmBase && !$.isNumeric(options.logarithmBase)) {
                        options.logarithmBase = logarithmBase;
                        incidentOccured('E2104')
                    }
                    else if (options.type !== 'logarithmic')
                        options.logarithmBase = undefined
                };
            var prepareScaleOptions = function(that, seriesDataSource) {
                    var scaleOptions = $.extend(true, {}, that.option('scale')),
                        incidentOccured = that._incidentOccured,
                        parsedValue = 0,
                        parseUtils = new ParseUtils({incidentOccured: incidentOccured}),
                        valueType = parseUtils.correctValueType((scaleOptions.valueType || '').toLowerCase());
                    if (seriesDataSource)
                        valueType = seriesDataSource.getCalculatedValueType() || valueType;
                    if (!valueType)
                        valueType = calculateValueType(scaleOptions.startValue, scaleOptions.endValue) || 'numeric';
                    scaleOptions.valueType = valueType;
                    if (scaleOptions.valueType === 'string') {
                        that._incidentOccured("E2201");
                        return scaleOptions
                    }
                    var parser = parseUtils.getParser(valueType, 'scale');
                    if (utils.isDefined(scaleOptions.startValue)) {
                        parsedValue = parser(scaleOptions.startValue);
                        if (utils.isDefined(parsedValue))
                            scaleOptions.startValue = parsedValue;
                        else {
                            scaleOptions.startValue = undefined;
                            that._incidentOccured("E2202", ["start"])
                        }
                    }
                    if (utils.isDefined(scaleOptions.endValue)) {
                        parsedValue = parser(scaleOptions.endValue);
                        if (utils.isDefined(parsedValue))
                            scaleOptions.endValue = parsedValue;
                        else {
                            scaleOptions.endValue = undefined;
                            that._incidentOccured("E2202", ["end"])
                        }
                    }
                    checkLogarithmicOptions(scaleOptions, defaultRangeSelectorOptions.scale.logarithmBase, that._incidentOccured);
                    if (!scaleOptions.type)
                        scaleOptions.type = 'continuous';
                    scaleOptions.parser = parser;
                    return scaleOptions
                };
            var correctSizeOptions = function(that, sizeOptions, scaleOptions) {
                    var size = that.option('size') || {};
                    if (!sizeOptions.height && size.height !== 0)
                        if (scaleOptions.valueType === 'datetime' && scaleOptions.marker.visible !== false)
                            sizeOptions.height = 160;
                        else
                            sizeOptions.height = 120;
                    if (!sizeOptions.width && size.width !== 0)
                        sizeOptions.width = 400
                };
            var applyOptions = function(that) {
                    var rangeContainerCanvas,
                        seriesDataSource,
                        translatorRange,
                        scaleLabelsAreaHeight,
                        sizeOptions,
                        sliderMarkerSpacing,
                        sliderMarkerOptions,
                        selectedRange,
                        $container = that.container;
                    that._isUpdating = true;
                    sizeOptions = calculateSize(that);
                    that._actualSize = sizeOptions;
                    seriesDataSource = createSeriesDataSource(that);
                    that._scaleOptions = prepareScaleOptions(that, seriesDataSource);
                    correctSizeOptions(that, sizeOptions, that._scaleOptions);
                    if (!sizeOptions.width || !sizeOptions.height || !$container.is(':visible')) {
                        that.stopRedraw = true;
                        that._incidentOccured("W2001", [that.NAME]);
                        return
                    }
                    else
                        that.stopRedraw = false;
                    updateRendererSize(that, sizeOptions);
                    that._updateLoadIndicator(undefined, that.canvas.width, that.canvas.height);
                    translatorRange = calculateTranslatorRange(that, seriesDataSource, that._scaleOptions);
                    updateScaleOptions(that, seriesDataSource, translatorRange, sizeOptions.width, that._scaleOptions);
                    updateTranslatorRangeInterval(translatorRange, that._scaleOptions);
                    sliderMarkerOptions = prepareSliderMarkersOptions(that, that._scaleOptions, sizeOptions.width);
                    selectedRange = initSelection(that, that._scaleOptions);
                    sliderMarkerSpacing = calculateSliderMarkersSpacing(that.renderer, sizeOptions, that._scaleOptions, sliderMarkerOptions);
                    rangeContainerCanvas = calculateRangeContainerCanvas(sizeOptions, that.option('margin'), sliderMarkerSpacing);
                    scaleLabelsAreaHeight = calculateScaleAreaHeight(that.renderer, that._scaleOptions, showScaleMarkers(that._scaleOptions));
                    that.translators = createTranslator(translatorRange, createTranslatorCanvas(sizeOptions, rangeContainerCanvas, scaleLabelsAreaHeight));
                    that._scaleOptions.ticksInfo = getTicksInfo(that, that._scaleOptions, that.translators, rangeContainerCanvas.width);
                    that._testTicksInfo = that._scaleOptions.ticksInfo;
                    that._selectedRange = selectedRange;
                    if (seriesDataSource)
                        seriesDataSource.adjustSeriesDimensions(that.translators);
                    that.rangeContainer.applyOptions({
                        canvas: rangeContainerCanvas,
                        scaleLabelsAreaHeight: scaleLabelsAreaHeight,
                        sliderMarkerSpacing: sliderMarkerSpacing,
                        translators: that.translators,
                        selectedRange: selectedRange,
                        scale: that._scaleOptions,
                        behavior: that.option('behavior'),
                        background: that.option('background'),
                        chart: that.option('chart'),
                        seriesDataSource: seriesDataSource,
                        sliderMarker: sliderMarkerOptions,
                        sliderHandle: that.option('sliderHandle'),
                        shutter: that.option('shutter'),
                        selectedRangeChanged: createSelectedRangeChangedFunction(that),
                        setSelectedRange: function(selectedRange) {
                            that.setSelectedRange(selectedRange)
                        }
                    });
                    that._isUpdating = false
                };
            var createSelectedRangeChangedFunction = function(that) {
                    return function(selectedRange, blockSelectedRangeChanged) {
                            var selectedRangeChanged = that.option('selectedRangeChanged');
                            that.option('selectedRange', selectedRange);
                            if (selectedRangeChanged && !blockSelectedRangeChanged)
                                setTimeout(function() {
                                    selectedRangeChanged.call(null, selectedRange)
                                })
                        }
                };
            var calculateSize = function(that) {
                    var $container = that.container,
                        size = that.option('size') || {},
                        result = {
                            width: size.width,
                            height: size.height
                        };
                    if ($container) {
                        if (!result.width)
                            result.width = $container.width();
                        if (!result.height)
                            result.height = $container.height()
                    }
                    that.canvas = result;
                    return result
                };
            var updateRendererSize = function(that, size) {
                    var renderer = that.renderer;
                    if (renderer.isInitialized())
                        renderer.getRoot().applySettings({
                            width: size.width,
                            height: size.height
                        });
                    else {
                        renderer.recreateCanvas(size.width, size.height);
                        renderer.draw(that.container[0])
                    }
                };
            var prepareChartThemeOptions = function(that, options) {
                    var chartTheme,
                        chartOption = that.option('chart') || {};
                    if (!chartOption.theme && options && options.theme) {
                        chartTheme = options.theme;
                        if (chartTheme) {
                            if (typeof chartTheme === 'object') {
                                chartTheme = chartTheme.chart || {};
                                chartTheme.name = options.theme.name
                            }
                            chartOption.theme = chartTheme
                        }
                    }
                };
            var initSelection = function(that, scaleOptions) {
                    var selectedRangeOptions = that.option('selectedRange'),
                        startValue,
                        endValue,
                        parser = scaleOptions.parser || function() {
                            return null
                        },
                        parseValue = function(value, entity) {
                            var parsedValue,
                                result = scaleOptions[entity];
                            if (utils.isDefined(value))
                                parsedValue = parser(value);
                            if (!utils.isDefined(parsedValue))
                                that._incidentOccured("E2203", [entity]);
                            else
                                result = parsedValue;
                            return result
                        };
                    if (!selectedRangeOptions)
                        return {
                                startValue: scaleOptions.startValue,
                                endValue: scaleOptions.endValue
                            };
                    else {
                        startValue = parseValue(selectedRangeOptions.startValue, 'startValue');
                        startValue = that.rangeContainer.slidersContainer.truncateSelectedRange(startValue, scaleOptions);
                        endValue = parseValue(selectedRangeOptions.endValue, 'endValue');
                        endValue = that.rangeContainer.slidersContainer.truncateSelectedRange(endValue, scaleOptions);
                        return {
                                startValue: startValue,
                                endValue: endValue
                            }
                    }
                };
            var _isSizeChanged = function(that) {
                    var actualSize = that._actualSize,
                        newSize = calculateSize(that);
                    return actualSize && (actualSize.width !== newSize.width || actualSize.height !== newSize.height)
                };
            return {
                    isSizeChanged: function() {
                        return _isSizeChanged(this)
                    },
                    _setDefaultOptions: function() {
                        this.callBase();
                        this.option(defaultRangeSelectorOptions)
                    },
                    _dataSourceOptions: function() {
                        return {
                                paginate: false,
                                _preferSync: true
                            }
                    },
                    _init: function() {
                        var that = this;
                        that.container = getContainer(that);
                        clearContainer(that.container);
                        that.renderer = createRenderer(that);
                        that.rangeContainer = createRangeContainer(that.renderer);
                        that.callBase();
                        that._reinitDataSource()
                    },
                    _reinitDataSource: function() {
                        this._refreshDataSource()
                    },
                    _dispose: function() {
                        var that = this,
                            disposeObject = function(propName) {
                                that[propName] && that[propName].dispose(),
                                that[propName] = null
                            };
                        that.callBase();
                        disposeObject("renderer");
                        that.translators = null;
                        disposeObject("rangeContainer")
                    },
                    _initOptions: function(options) {
                        var that = this,
                            themeManager;
                        that._optionsInitializing = true;
                        options = options || {};
                        that._userOptions = $.extend(true, {}, options);
                        themeManager = createThemeManager(options.theme);
                        themeManager.setBackgroundColor(options.containerBackgroundColor);
                        that.option(themeManager.applyRangeSelectorTheme(options));
                        prepareChartThemeOptions(that, options);
                        if (options.background)
                            that._userBackgroundColor = options.background.color
                    },
                    _refresh: function() {
                        var that = this,
                            callBase = that.callBase;
                        that._endLoading(function() {
                            callBase.call(that)
                        })
                    },
                    _render: function(isResizing) {
                        var that = this,
                            currentAnimationEnabled,
                            behaviorOptions;
                        that._optionsInitializing = false;
                        applyOptions(that);
                        if (!that.stopRedraw) {
                            if (isResizing) {
                                behaviorOptions = that.option('behavior');
                                currentAnimationEnabled = behaviorOptions.animationEnabled;
                                behaviorOptions.animationEnabled = false;
                                that.rangeContainer.redraw();
                                behaviorOptions.animationEnabled = currentAnimationEnabled
                            }
                            else
                                that.rangeContainer.redraw();
                            !isResizing && (!that._dataSource || that._dataSource && that._dataSource.isLoaded()) && that.hideLoadingIndicator()
                        }
                        that._drawn();
                        that.__rendered && that.__rendered()
                    },
                    _optionChanged: function(name, value, prevValue) {
                        var that = this;
                        if (!that._optionsInitializing)
                            dataUtils.compileSetter(name)(that._userOptions, value, {
                                functionsAsIs: true,
                                merge: true
                            });
                        if (name === "dataSource") {
                            that._reinitDataSource();
                            that._invalidate()
                        }
                        else if (name === "selectedRange")
                            that.setSelectedRange(that.option('selectedRange'));
                        else if (name === "selectedRangeChanged")
                            that.rangeContainer.slidersContainer.selectedRangeChanged = createSelectedRangeChangedFunction(that);
                        else if (name === 'containerBackgroundColor' || name === 'theme') {
                            that._initOptions(that._userOptions);
                            that._invalidate()
                        }
                        else
                            that.callBase(name, value, prevValue)
                    },
                    _resize: function() {
                        if (_isSizeChanged(this))
                            this._render(true)
                    },
                    _handleDataSourceChanged: function() {
                        var that = this;
                        that._endLoading(function() {
                            if (that.renderer.isInitialized())
                                that._render()
                        })
                    },
                    getSelectedRange: function() {
                        var that = this;
                        var selectedRange = that.rangeContainer.slidersContainer.getSelectedRange();
                        return {
                                startValue: selectedRange.startValue,
                                endValue: selectedRange.endValue
                            }
                    },
                    setSelectedRange: function(selectedRange) {
                        var that = this;
                        if (that._isUpdating || !selectedRange)
                            return;
                        var oldSelectedRange = that.rangeContainer.slidersContainer.getSelectedRange();
                        if (oldSelectedRange && oldSelectedRange.startValue === selectedRange.startValue && oldSelectedRange.endValue === selectedRange.endValue)
                            return;
                        that.rangeContainer.slidersContainer.setSelectedRange(selectedRange)
                    },
                    resetSelectedRange: function(blockSelectedRangeChanged) {
                        var that = this;
                        that.setSelectedRange({
                            startValue: that._scaleOptions.startValue,
                            endValue: that._scaleOptions.endValue,
                            blockSelectedRangeChanged: blockSelectedRangeChanged
                        })
                    },
                    render: function(isResizing) {
                        this._render(isResizing);
                        return this
                    }
                }
        }()).include(DX.ui.DataHelperMixin)
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file rangeContainer.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector;
        rangeSelector.RangeContainer = rangeSelector.BaseVisualElement.inherit(function() {
            var ctor = function(renderer) {
                    this.callBase(renderer);
                    this.slidersContainer = createSlidersContainer(renderer);
                    this.rangeView = createRangeView(renderer);
                    this.scale = createScale(renderer)
                };
            var _applyOptions = function(options) {
                    var that = this,
                        isEmpty = options.scale.isEmpty,
                        viewCanvas = {
                            left: options.canvas.left,
                            top: options.canvas.top,
                            width: options.canvas.width,
                            height: options.canvas.height >= options.scaleLabelsAreaHeight ? options.canvas.height - options.scaleLabelsAreaHeight : 0
                        };
                    that._viewCanvas = viewCanvas;
                    that.slidersContainer.applyOptions({
                        canvas: viewCanvas,
                        translator: options.translators.x,
                        scale: options.scale,
                        selectedRange: options.selectedRange,
                        sliderMarker: options.sliderMarker,
                        sliderHandle: options.sliderHandle,
                        shutter: options.shutter,
                        behavior: options.behavior,
                        selectedRangeChanged: options.selectedRangeChanged,
                        isEmpty: isEmpty
                    });
                    that.rangeView.applyOptions({
                        canvas: viewCanvas,
                        translators: options.translators,
                        background: options.background,
                        chart: options.chart,
                        seriesDataSource: options.seriesDataSource,
                        behavior: options.behavior,
                        isEmpty: isEmpty
                    });
                    that.scale.applyOptions({
                        canvas: options.canvas,
                        translator: options.translators.x,
                        scale: options.scale,
                        hideLabels: isEmpty,
                        scaleLabelsAreaHeight: options.scaleLabelsAreaHeight,
                        setSelectedRange: options.setSelectedRange
                    })
                };
            var createSlidersContainer = function(options) {
                    return rangeSelector.rangeSelectorFactory.createSlidersContainer(options)
                };
            var createScale = function(options) {
                    return rangeSelector.rangeSelectorFactory.createScale(options)
                };
            var createRangeView = function(options) {
                    return rangeSelector.rangeSelectorFactory.createRangeView(options)
                };
            var _createClipRectCanvas = function(canvas, sliderMarkerSpacing) {
                    return {
                            left: canvas.left - sliderMarkerSpacing.left,
                            top: canvas.top - sliderMarkerSpacing.top,
                            width: canvas.width + sliderMarkerSpacing.right + sliderMarkerSpacing.left,
                            height: canvas.height + sliderMarkerSpacing.bottom + sliderMarkerSpacing.top
                        }
                };
            var _draw = function() {
                    var that = this,
                        containerGroup,
                        rangeViewGroup,
                        slidersContainerGroup,
                        scaleGroup,
                        trackersGroup,
                        clipRectCanvas = _createClipRectCanvas(that._options.canvas, that._options.sliderMarkerSpacing),
                        viewCanvas = that._viewCanvas;
                    that._clipRect = that._renderer.createClipRect(clipRectCanvas.left, clipRectCanvas.top, clipRectCanvas.width, clipRectCanvas.height).append();
                    containerGroup = that._renderer.createGroup({
                        'class': 'rangeContainer',
                        clipId: that._clipRect.id
                    }).append();
                    that._viewClipRect = that._renderer.createClipRect(viewCanvas.left, viewCanvas.top, viewCanvas.width, viewCanvas.height).append();
                    rangeViewGroup = that._renderer.createGroup({
                        'class': 'view',
                        clipId: that._viewClipRect.id
                    });
                    rangeViewGroup.append(containerGroup);
                    that.rangeView.redraw(rangeViewGroup);
                    slidersContainerGroup = that._renderer.createGroup({'class': 'slidersContainer'});
                    slidersContainerGroup.append(containerGroup);
                    that.slidersContainer.redraw(slidersContainerGroup);
                    scaleGroup = that._renderer.createGroup({'class': 'scale'});
                    scaleGroup.append(containerGroup);
                    that.scale.redraw(scaleGroup);
                    trackersGroup = that._renderer.createGroup({'class': 'trackers'});
                    trackersGroup.append(containerGroup);
                    that._trackersGroup = trackersGroup;
                    that.slidersContainer.appendTrackers(trackersGroup)
                };
            var _update = function() {
                    var that = this,
                        clipRectCanvas = _createClipRectCanvas(that._options.canvas, that._options.sliderMarkerSpacing),
                        viewCanvas = that._viewCanvas;
                    that._clipRect.updateRectangle({
                        x: clipRectCanvas.left,
                        y: clipRectCanvas.top,
                        width: clipRectCanvas.width,
                        height: clipRectCanvas.height
                    });
                    that._viewClipRect.updateRectangle({
                        x: viewCanvas.left,
                        y: viewCanvas.top,
                        width: viewCanvas.width,
                        height: viewCanvas.height
                    });
                    that.rangeView.redraw();
                    that.slidersContainer.redraw();
                    that.slidersContainer.appendTrackers(that._trackersGroup);
                    that.scale.redraw()
                };
            var dispose = function() {
                    this.slidersContainer.dispose();
                    this.slidersContainer = null
                };
            var prototypeObject = {
                    createSlidersContainer: createSlidersContainer,
                    createScale: createScale,
                    ctor: ctor,
                    dispose: dispose,
                    _applyOptions: _applyOptions,
                    _draw: _draw,
                    _update: _update
                };
            return prototypeObject
        }())
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file scale.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            formatHelper = DX.formatHelper,
            utils = DX.utils;
        var SCALE_TEXT_SPACING = 5;
        rangeSelector.Scale = rangeSelector.BaseVisualElement.inherit({
            _setupDateUnitInterval: function(scaleOptions) {
                var key,
                    hasObjectSingleField = function(object) {
                        var fieldsCounter = 0;
                        $.each(object, function() {
                            return ++fieldsCounter < 2
                        });
                        return fieldsCounter === 1
                    },
                    millisecTickInterval,
                    majorTickInterval = scaleOptions.ticksInfo.majorTickInterval,
                    majorTicks = scaleOptions.ticksInfo.majorTicks;
                if (scaleOptions.valueType === 'datetime') {
                    if (utils.isObject(majorTickInterval) && !hasObjectSingleField(majorTickInterval))
                        utils.logger.warn('More than one field is specified within the object assigned to the "tickInterval" option. Assign an object with a single field specified (days, hours or a similar one).');
                    if (majorTicks && majorTicks.autoArrangementStep > 1) {
                        if (utils.isString(majorTickInterval))
                            majorTickInterval = utils.getDateIntervalByString(majorTickInterval);
                        for (key in majorTickInterval)
                            if (majorTickInterval.hasOwnProperty(key)) {
                                majorTickInterval[key] *= majorTicks.autoArrangementStep;
                                millisecTickInterval = utils.convertDateTickIntervalToMilliseconds(majorTickInterval)
                            }
                        majorTickInterval = utils.convertMillisecondsToDateUnits(millisecTickInterval)
                    }
                    this.dateUnitInterval = utils.getDateUnitInterval(majorTickInterval)
                }
            },
            _prepareDatesDifferences: function(datesDifferences, tickInterval) {
                var deleteDifferent = tickInterval,
                    dateUnitInterval,
                    i;
                if (deleteDifferent === 'week')
                    deleteDifferent = 'day';
                if (deleteDifferent === 'quarter')
                    deleteDifferent = 'month';
                if (datesDifferences[deleteDifferent])
                    for (i = 0; i < utils.dateUnitIntervals.length; i++) {
                        dateUnitInterval = utils.dateUnitIntervals[i];
                        if (datesDifferences[dateUnitInterval]) {
                            datesDifferences[dateUnitInterval] = false;
                            datesDifferences.count--
                        }
                        if (dateUnitInterval === deleteDifferent)
                            break
                    }
            },
            _getMarkerDate: function(date, tickInterval) {
                var markerDate = new Date(date.getTime()),
                    month = 0;
                switch (tickInterval) {
                    case'quarter':
                        month = formatHelper.getFirstQuarterMonth(date.getMonth());
                    case'month':
                        markerDate.setMonth(month);
                    case'week':
                    case'day':
                        markerDate.setDate(1);
                    case'hour':
                        markerDate.setHours(0, 0, 0, 0);
                        break;
                    case'millisecond':
                        markerDate.setMilliseconds(0);
                        break;
                    case'second':
                        markerDate.setSeconds(0, 0);
                        break;
                    case'minute':
                        markerDate.setMinutes(0, 0, 0);
                        break
                }
                return markerDate
            },
            _drawDateMarker: function(date, options) {
                var labelPosX,
                    labelPosY,
                    dateFormated,
                    scaleOptions,
                    textElement;
                if (options.x === null)
                    return;
                scaleOptions = this._options.scale;
                this.lineOptions['class'] = 'dx-range-selector-date-marker';
                this._renderer.createLine(options.x, options.y, options.x, options.y + scaleOptions.marker.separatorHeight, this.lineOptions).append(options.group);
                dateFormated = this._getLabel(date, options.label);
                labelPosX = options.x + scaleOptions.tick.width + scaleOptions.marker.textLeftIndent;
                labelPosY = options.y + scaleOptions.marker.textTopIndent + scaleOptions.label.font.size;
                this.textOptions.align = 'left';
                textElement = this._renderer.createText(dateFormated, labelPosX, labelPosY, this.textOptions).append(options.group);
                return labelPosX + textElement.getBBox().width
            },
            _drawDateMarkers: function(dates, group) {
                var dateMarker,
                    i,
                    datesDifferences,
                    markerDate,
                    posX,
                    prevMarkerRightX = -1;
                if (this._options.scale.valueType !== 'datetime' || !this.visibleMarkers)
                    return;
                var markerDatePositions = [];
                if (dates.length > 1) {
                    for (i = 1; i < dates.length; i++) {
                        datesDifferences = utils.getDatesDifferences(dates[i - 1], dates[i]);
                        this._prepareDatesDifferences(datesDifferences, this.dateUnitInterval);
                        if (datesDifferences.count > 0) {
                            markerDate = this._getMarkerDate(dates[i], this.dateUnitInterval);
                            this.markerDates = this.markerDates || [];
                            this.markerDates.push(markerDate);
                            posX = this.translator.translate(markerDate);
                            if (posX > prevMarkerRightX) {
                                posX !== null && markerDatePositions.push({
                                    date: markerDate,
                                    posX: posX
                                });
                                prevMarkerRightX = this._drawDateMarker(markerDate, {
                                    group: group,
                                    y: this._options.canvas.top + this._options.canvas.height - this.markersAreaHeight + this._options.scale.marker.topIndent,
                                    x: posX,
                                    label: this._getLabelFormatOptions(formatHelper.getDateFormatByDifferences(datesDifferences))
                                })
                            }
                        }
                    }
                    this._initializeMarkersEvents(markerDatePositions, group)
                }
            },
            _getLabelFormatOptions: function(formatString) {
                if (!utils.isDefined(this._options.scale.marker.label.format))
                    return $.extend({}, this._options.scale.marker.label, {format: formatString});
                return this._options.scale.marker.label
            },
            _calculateRangeByMarkerPosition: function(posX, markerDatePositions, scaleOptions) {
                var selectedRange = {},
                    i,
                    position;
                for (i = 0; i < markerDatePositions.length; i++) {
                    position = markerDatePositions[i];
                    if (!scaleOptions.inverted) {
                        if (posX >= position.posX)
                            selectedRange.startValue = position.date;
                        else if (!selectedRange.endValue)
                            selectedRange.endValue = position.date
                    }
                    else if (posX < position.posX)
                        selectedRange.endValue = position.date;
                    else if (!selectedRange.startValue)
                        selectedRange.startValue = position.date
                }
                selectedRange.startValue = selectedRange.startValue || scaleOptions.startValue;
                selectedRange.endValue = selectedRange.endValue || scaleOptions.endValue;
                return selectedRange
            },
            _initializeMarkersEvents: function(markerDatePositions, group) {
                var that = this,
                    markersAreaTop = this._options.canvas.top + this._options.canvas.height - this.markersAreaHeight + this._options.scale.marker.topIndent,
                    markersTracker,
                    svgOffsetLeft,
                    index,
                    posX,
                    selectedRange;
                if (markerDatePositions.length > 0) {
                    markersTracker = that._renderer.createRect(that._options.canvas.left, markersAreaTop, that._options.canvas.width, that._options.scale.marker.separatorHeight, 0, {
                        fill: 'grey',
                        stroke: 'grey',
                        opacity: 0.0001
                    });
                    markersTracker.append(group);
                    markersTracker.on(rangeSelector.events.start, function(e) {
                        svgOffsetLeft = rangeSelector.utils.getRootOffsetLeft(that._renderer);
                        posX = rangeSelector.utils.getEventPageX(e) - svgOffsetLeft;
                        selectedRange = that._calculateRangeByMarkerPosition(posX, markerDatePositions, that._options.scale);
                        that._options.setSelectedRange(selectedRange)
                    });
                    that._markersTracker = markersTracker
                }
            },
            _getLabel: function(value, options) {
                var formatObject = {
                        value: value,
                        valueText: formatHelper.format(value, options.format, options.precision)
                    };
                return String(utils.isFunction(options.customizeText) ? options.customizeText.call(formatObject, formatObject) : formatObject.valueText)
            },
            _drawLabel: function(value, group) {
                var textY = this._options.canvas.top + this._options.canvas.height - this.markersAreaHeight,
                    textElement = this._renderer.createText(this._getLabel(value, this._options.scale.label), this.translator.translate(value), textY, this.textOptions);
                textElement.append(group);
                this.textElements = this.textElements || [];
                this.textElements.push(textElement)
            },
            _drawTick: function(value, group) {
                this.lineOptions['class'] = 'dx-range-selector-tick';
                var secondY = this._options.canvas.top + this._options.canvas.height - this.scaleLabelsAreaHeight,
                    posX = this.translator.translate(value),
                    tickElement = this._renderer.createLine(posX, this._options.canvas.top, posX, secondY, this.lineOptions).append(group);
                this.tickElements = this.tickElements || [];
                this.tickElements.push(tickElement)
            },
            _redraw: function(group, isOptimize) {
                var that = this,
                    scaleOptions = that._options.scale,
                    ticksGroup = that._renderer.createGroup(),
                    labelsGroup = that._renderer.createGroup().append(group),
                    majorTicks = scaleOptions.ticksInfo.majorTicks,
                    minorTicks = scaleOptions.ticksInfo.minorTicks,
                    customBoundaryTicks = scaleOptions.ticksInfo.customBoundaryTicks,
                    hideLabels = that._options.hideLabels || majorTicks.hideLabels || !scaleOptions.label.visible,
                    i;
                for (i = 0; i < majorTicks.length; i++) {
                    if (!hideLabels)
                        that._drawLabel(majorTicks[i], labelsGroup);
                    that._drawTick(majorTicks[i], ticksGroup)
                }
                if (scaleOptions.showMinorTicks)
                    for (i = 0; i < minorTicks.length; i++)
                        that._drawTick(minorTicks[i], ticksGroup);
                for (i = 0; i < customBoundaryTicks.length; i++)
                    that._drawTick(customBoundaryTicks[i], ticksGroup);
                ticksGroup.append(group);
                that._drawDateMarkers(majorTicks, labelsGroup)
            },
            _applyOptions: function(options) {
                var scaleOptions = options.scale,
                    labelsAreaHeight;
                this.textOptions = {
                    align: 'center',
                    'class': 'dx-range-selector-scale',
                    font: scaleOptions.label.font,
                    style: {'-webkit-user-select': 'none'}
                };
                this.lineOptions = {
                    strokeWidth: scaleOptions.tick.width,
                    stroke: scaleOptions.tick.color,
                    strokeOpacity: scaleOptions.tick.opacity
                };
                this._setupDateUnitInterval(scaleOptions);
                this.visibleMarkers = scaleOptions.marker.visible === undefined ? true : scaleOptions.marker.visible;
                labelsAreaHeight = scaleOptions.label.visible ? scaleOptions.label.topIndent + scaleOptions.label.font.size : 0;
                this.scaleLabelsAreaHeight = options.scaleLabelsAreaHeight;
                this.markersAreaHeight = this.scaleLabelsAreaHeight - labelsAreaHeight;
                this.translator = options.translator
            },
            _draw: function(group) {
                this._redraw(group, false)
            },
            _update: function(group) {
                var callBase = this.callBase;
                if (this._markersTracker)
                    this._markersTracker.off(rangeSelector.events.start, '**');
                this.callBase = callBase;
                this.callBase(group)
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file rangeFactory.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            renderers = DX.viz.renderers;
        rangeSelector.rangeSelectorFactory = function() {
            return {
                    createRangeContainer: function(rangeContainerOptions) {
                        return new rangeSelector.RangeContainer(rangeContainerOptions)
                    },
                    createSlidersContainer: function(options) {
                        return new rangeSelector.SlidersContainer(options)
                    },
                    createScale: function(options) {
                        return new rangeSelector.Scale(options)
                    },
                    createSliderMarker: function(options) {
                        return new rangeSelector.SliderMarker(options)
                    },
                    createRangeView: function(options) {
                        return new rangeSelector.RangeView(options)
                    },
                    createThemeManager: function(options) {
                        return new rangeSelector.ThemeManager(options)
                    },
                    createSlider: function(renderer, sliderIndex) {
                        return new rangeSelector.Slider(renderer, sliderIndex)
                    },
                    createSlidersEventsManager: function(renderer, slidersController, processSelectionChanged) {
                        return new rangeSelector.SlidersEventsManager(renderer, slidersController, processSelectionChanged)
                    },
                    createSlidersController: function(sliders) {
                        return new rangeSelector.SlidersController(sliders)
                    }
                }
        }()
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file slidersContainer.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            utils = DX.utils;
        var msPointerEnabled = window.navigator.msPointerEnabled || window.navigator.pointerEnabled;
        var isNumber = DX.utils.isNumber;
        var isDate = DX.utils.isDate;
        var START_VALUE_INDEX = 0,
            END_VALUE_INDEX = 1;
        rangeSelector.SlidersContainer = rangeSelector.BaseVisualElement.inherit(function() {
            var prototypeObject = {
                    getController: function() {
                        return this._controller
                    },
                    _drawAreaTracker: function(group) {
                        var that = this,
                            areaTracker,
                            selectedAreaTracker;
                        areaTracker = that._renderer.createRect(that._options.canvas.left, that._options.canvas.top, that._options.canvas.width, that._options.canvas.height, 0, {
                            fill: 'grey',
                            stroke: 'grey',
                            opacity: 0.0001
                        });
                        areaTracker.append(group);
                        selectedAreaTracker = that._renderer.createRect(that._options.canvas.left, that._options.canvas.top, that._options.canvas.width, that._options.canvas.height, 0, {
                            fill: 'grey',
                            stroke: 'grey',
                            opacity: 0.0001,
                            style: {cursor: 'pointer'}
                        });
                        selectedAreaTracker.append(group);
                        that._controller.setAreaTrackers(areaTracker, selectedAreaTracker)
                    },
                    dispose: function() {
                        this._eventsManager.dispose();
                        this._eventManager = null
                    },
                    _processSelectionChanged: function(moving, blockSelectedRangeChanged) {
                        var that = this,
                            equalLastSelectedRange = function(selectedRange) {
                                return selectedRange && that._lastSelectedRange.startValue === selectedRange.startValue && that._lastSelectedRange.endValue === selectedRange.endValue
                            },
                            selectedRange = that.getSelectedRange();
                        if ((!moving || (that._options.behavior.callSelectedRangeChanged || '').toLowerCase() === "onmoving") && that._options.selectedRangeChanged && !equalLastSelectedRange(selectedRange)) {
                            that._updateLastSelectedRange(selectedRange);
                            if (typeof that._options.selectedRangeChanged === 'function')
                                that._options.selectedRangeChanged.call(null, selectedRange, blockSelectedRangeChanged);
                            if (!moving && !equalLastSelectedRange(selectedRange))
                                that.setSelectedRange(selectedRange)
                        }
                    },
                    _updateLastSelectedRange: function(selectedRange) {
                        selectedRange = selectedRange || this._options.selectedRange;
                        this._lastSelectedRange = {
                            startValue: selectedRange.startValue,
                            endValue: selectedRange.endValue
                        }
                    },
                    _createSlider: function(sliderIndex) {
                        return rangeSelector.rangeSelectorFactory.createSlider(this._renderer, sliderIndex)
                    },
                    _createSlidersController: function(sliders) {
                        return rangeSelector.rangeSelectorFactory.createSlidersController(sliders)
                    },
                    _createSlidersEventsManager: function(controller) {
                        var that = this;
                        return rangeSelector.rangeSelectorFactory.createSlidersEventsManager(that._renderer, controller, function(moving) {
                                that._processSelectionChanged(moving)
                            })
                    },
                    ctor: function(renderer) {
                        var that = this,
                            sliders;
                        that.callBase(renderer);
                        sliders = [that._createSlider(START_VALUE_INDEX), that._createSlider(END_VALUE_INDEX)];
                        that._controller = that._createSlidersController(sliders);
                        that._eventsManager = that._createSlidersEventsManager(that._controller);
                        that._lastSelectedRange = {}
                    },
                    getSelectedRange: function() {
                        return this._controller.getSelectedRange()
                    },
                    truncateSelectedRange: function(value, scaleOptions) {
                        var min = scaleOptions.startValue > scaleOptions.endValue ? scaleOptions.endValue : scaleOptions.startValue,
                            max = scaleOptions.startValue > scaleOptions.endValue ? scaleOptions.startValue : scaleOptions.endValue;
                        if (value < min)
                            value = min;
                        if (value > max)
                            value = max;
                        return value
                    },
                    setSelectedRange: function(selectedRange) {
                        var that = this,
                            scale = that._options.scale,
                            startValue,
                            endValue,
                            currentSelectedRange = that._options.selectedRange;
                        if (selectedRange) {
                            startValue = selectedRange.startValue;
                            endValue = selectedRange.endValue
                        }
                        if (isNumber(scale.startValue) && isNumber(startValue) || isDate(scale.startValue) && isDate(startValue))
                            currentSelectedRange.startValue = startValue;
                        if (isNumber(scale.endValue) && isNumber(endValue) || isDate(scale.endValue) && isDate(endValue))
                            currentSelectedRange.endValue = endValue;
                        currentSelectedRange.startValue = that.truncateSelectedRange(currentSelectedRange.startValue, scale);
                        currentSelectedRange.endValue = that.truncateSelectedRange(currentSelectedRange.endValue, scale);
                        that._controller.applySelectedRange(currentSelectedRange);
                        that._controller.applyPosition();
                        that._processSelectionChanged(false, selectedRange && selectedRange.blockSelectedRangeChanged)
                    },
                    appendTrackers: function(group) {
                        this._controller.appendTrackers(group)
                    },
                    _applyOptions: function(options) {
                        var that = this;
                        that._controller.applyOptions({
                            translator: options.translator,
                            canvas: options.canvas,
                            sliderMarker: options.sliderMarker,
                            sliderHandle: options.sliderHandle,
                            shutter: options.shutter,
                            scale: options.scale,
                            behavior: options.behavior
                        });
                        that._eventsManager.applyOptions({behavior: options.behavior})
                    },
                    _draw: function(group) {
                        var that = this,
                            rootElement;
                        if (msPointerEnabled) {
                            rootElement = that._renderer.getRoot();
                            rootElement && (rootElement.element.style.msTouchAction = "pinch-zoom")
                        }
                        that._controller.redraw(group);
                        that._drawAreaTracker(group);
                        that._eventsManager.initialize();
                        that._update()
                    },
                    _update: function() {
                        var that = this,
                            isEmpty = that._options.isEmpty;
                        that._eventsManager.setEnabled(!isEmpty);
                        that._controller.applySelectedRange(isEmpty ? {} : that._options.selectedRange);
                        that._controller.applyPosition(that.isDrawn());
                        that._updateLastSelectedRange();
                        that._controller.redraw()
                    }
                };
            return prototypeObject
        }())
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file slidersController.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            utils = DX.utils;
        var START_VALUE_INDEX = 0,
            END_VALUE_INDEX = 1;
        rangeSelector.SlidersController = DX.Class.inherit(function() {
            return {
                    ctor: function(sliders) {
                        this._sliders = sliders;
                        sliders[START_VALUE_INDEX].setAnotherSlider(sliders[END_VALUE_INDEX]);
                        sliders[END_VALUE_INDEX].setAnotherSlider(sliders[START_VALUE_INDEX])
                    },
                    setAreaTrackers: function(areaTracker, selectedAreaTracker) {
                        this._areaTracker = areaTracker;
                        this._selectedAreaTracker = selectedAreaTracker
                    },
                    applyOptions: function(options) {
                        var that = this,
                            values = null;
                        that._options = options;
                        that.getSlider(START_VALUE_INDEX).applyOptions(options);
                        that.getSlider(END_VALUE_INDEX).applyOptions(options);
                        if (options.behavior.snapToTicks) {
                            values = options.scale.ticksInfo.fullTicks;
                            if (values.length > 1 && values[0] > values[values.length - 1])
                                values = values.reverse()
                        }
                        that.getSlider(START_VALUE_INDEX).setAvailableValues(values);
                        that.getSlider(END_VALUE_INDEX).setAvailableValues(values)
                    },
                    processDocking: function(sliderIndex) {
                        var that = this;
                        if (sliderIndex !== undefined)
                            that.getSlider(sliderIndex).processDocking();
                        else {
                            that.getSlider(START_VALUE_INDEX).processDocking();
                            that.getSlider(END_VALUE_INDEX).processDocking()
                        }
                        that.setTrackersCursorStyle('default');
                        that.applyAreaTrackersPosition()
                    },
                    getSelectedRangeInterval: function() {
                        var that = this,
                            type = that._options.scale.type,
                            base = that._options.scale.logarithmBase,
                            startValue = that.getSlider(START_VALUE_INDEX).getValue(),
                            endValue = that.getSlider(END_VALUE_INDEX).getValue();
                        if (type === 'logarithmic')
                            return rangeSelector.utils.getInterval(utils.getLog(startValue, base), utils.getLog(endValue, base));
                        else
                            return rangeSelector.utils.getInterval(startValue, endValue)
                    },
                    moveSliders: function(postitionDelta, selectedRangeInterval) {
                        var that = this;
                        that.getSlider(START_VALUE_INDEX).setPosition(that.getSlider(START_VALUE_INDEX).getPosition() + postitionDelta, false, selectedRangeInterval);
                        that.applyPosition(true)
                    },
                    moveSlider: function(sliderIndex, fastSwap, position, offsetPosition, startOffsetPosition, startOffsetPositionChangedCallback) {
                        var that = this,
                            slider = that.getSlider(sliderIndex),
                            anotherSlider = slider.getAnotherSlider(),
                            anotherSliderIndex = anotherSlider.getIndex(),
                            doSwap;
                        if (slider.canSwap())
                            if (sliderIndex === START_VALUE_INDEX ? position > anotherSlider.getPosition() : position < anotherSlider.getPosition()) {
                                doSwap = fastSwap;
                                if (!fastSwap)
                                    if (Math.abs(offsetPosition) >= Math.abs(startOffsetPosition) && offsetPosition * startOffsetPosition < 0) {
                                        doSwap = true;
                                        position += 2 * startOffsetPosition;
                                        startOffsetPositionChangedCallback(-startOffsetPosition)
                                    }
                                if (doSwap) {
                                    that.swapSliders();
                                    anotherSlider.applyPosition(true)
                                }
                            }
                        slider.setPosition(position, true);
                        slider.applyPosition(true);
                        that.applyAreaTrackersPosition();
                        that.setTrackersCursorStyle('w-resize')
                    },
                    applySelectedAreaCenterPosition: function(pos) {
                        var that = this,
                            slidersContainerHalfWidth = (that.getSlider(END_VALUE_INDEX).getPosition() - that.getSlider(START_VALUE_INDEX).getPosition()) / 2,
                            selectedRangeInterval = that.getSelectedRangeInterval();
                        that.getSlider(START_VALUE_INDEX).setPosition(pos - slidersContainerHalfWidth, false, selectedRangeInterval);
                        that.applyPosition();
                        that.processDocking()
                    },
                    processManualSelection: function(startPosition, endPosition, eventArgs) {
                        var that = this,
                            animateSliderIndex,
                            movingSliderIndex,
                            positionRange = [Math.min(startPosition, endPosition), Math.max(startPosition, endPosition)];
                        animateSliderIndex = startPosition < endPosition ? START_VALUE_INDEX : END_VALUE_INDEX;
                        movingSliderIndex = startPosition < endPosition ? END_VALUE_INDEX : START_VALUE_INDEX;
                        that.getSlider(movingSliderIndex).setPosition(positionRange[movingSliderIndex]);
                        that.getSlider(animateSliderIndex).setPosition(positionRange[animateSliderIndex]);
                        that.getSlider(movingSliderIndex).setPosition(positionRange[movingSliderIndex], true);
                        that.getSlider(movingSliderIndex).startEventHandler(eventArgs);
                        that.getSlider(animateSliderIndex).processDocking();
                        that.getSlider(movingSliderIndex).applyPosition(true)
                    },
                    applySelectedRange: function(selectedRange) {
                        var that = this,
                            inverted = that._options.scale.inverted;
                        utils.debug.assertParam(selectedRange, 'selectedRange not passed');
                        if (!inverted && selectedRange.startValue > selectedRange.endValue || inverted && selectedRange.startValue < selectedRange.endValue) {
                            that.getSlider(START_VALUE_INDEX).setValue(selectedRange.endValue);
                            that.getSlider(END_VALUE_INDEX).setValue(selectedRange.startValue)
                        }
                        else {
                            that.getSlider(START_VALUE_INDEX).setValue(selectedRange.startValue);
                            that.getSlider(END_VALUE_INDEX).setValue(selectedRange.endValue)
                        }
                    },
                    getSelectedRange: function() {
                        var that = this;
                        return {
                                startValue: that.getSlider(START_VALUE_INDEX).getValue(),
                                endValue: that.getSlider(END_VALUE_INDEX).getValue()
                            }
                    },
                    swapSliders: function() {
                        var that = this;
                        that._sliders.reverse();
                        that.getSlider(START_VALUE_INDEX).changeLocation();
                        that.getSlider(END_VALUE_INDEX).changeLocation()
                    },
                    applyAreaTrackersPosition: function() {
                        var that = this,
                            selectedRange = that.getSelectedRange(),
                            scaleOptions = that._options.scale,
                            width = that.getSlider(END_VALUE_INDEX).getPosition() - that.getSlider(START_VALUE_INDEX).getPosition(),
                            options = {
                                x: that.getSlider(START_VALUE_INDEX).getPosition(),
                                width: width < 0 ? 0 : width,
                                y: that._options.canvas.top,
                                height: that._options.canvas.height,
                                style: {cursor: scaleOptions.endValue - scaleOptions.startValue === selectedRange.endValue - selectedRange.startValue ? 'default' : 'pointer'}
                            };
                        that._selectedAreaTracker.applySettings(options);
                        that._areaTracker.applySettings({
                            x: that._options.canvas.left,
                            width: that._options.canvas.width,
                            y: that._options.canvas.top,
                            height: that._options.canvas.height
                        })
                    },
                    applyPosition: function(disableAnimation) {
                        var that = this;
                        that.getSlider(START_VALUE_INDEX).applyPosition(disableAnimation);
                        that.getSlider(END_VALUE_INDEX).applyPosition(disableAnimation);
                        that.applyAreaTrackersPosition()
                    },
                    redraw: function(group) {
                        var that = this;
                        that.getSlider(START_VALUE_INDEX).redraw(group);
                        that.getSlider(END_VALUE_INDEX).redraw(group)
                    },
                    appendTrackers: function(group) {
                        var that = this;
                        if (that._areaTracker && that._selectedAreaTracker) {
                            that._areaTracker.append(group);
                            that._selectedAreaTracker.append(group)
                        }
                        that.getSlider(START_VALUE_INDEX).appendTrackers(group);
                        that.getSlider(END_VALUE_INDEX).appendTrackers(group)
                    },
                    getSlider: function(sliderIndex) {
                        return this._sliders[sliderIndex]
                    },
                    getAreaTracker: function() {
                        return this._areaTracker
                    },
                    getSelectedAreaTracker: function() {
                        return this._selectedAreaTracker
                    },
                    setTrackersCursorStyle: function(style) {
                        var that = this;
                        that._selectedAreaTracker.applySettings({style: {cursor: style}});
                        that._areaTracker.applySettings({style: {cursor: style}})
                    }
                }
        }())
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file slidersEventsManager.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            utils = DX.utils,
            MIN_MANUAL_SELECTING_WIDTH = 10,
            START_VALUE_INDEX = 0,
            END_VALUE_INDEX = 1,
            addNamespace = DX.ui.events.addNamespace,
            setEvents = function() {
                var win = window;
                win = DX.viz.rangeSelector.mockWindow || window;
                var touchSupport = "ontouchstart" in win,
                    msPointerEnabled = win.navigator.msPointerEnabled,
                    pointerEnabled = win.navigator.pointerEnabled;
                rangeSelector.events = {
                    start: pointerEnabled ? "pointerdown" : msPointerEnabled ? "MSPointerDown" : touchSupport ? "touchstart mousedown" : "mousedown",
                    move: pointerEnabled ? "pointermove" : msPointerEnabled ? "MSPointerMove" : touchSupport ? "touchmove mousemove" : "mousemove",
                    end: pointerEnabled ? "pointerup pointercancel" : msPointerEnabled ? "MSPointerUp MSPointerCancel" : touchSupport ? "touchend mouseup" : "mouseup"
                }
            },
            _SlidersEventManager,
            getEventPageX = rangeSelector.utils.getEventPageX,
            rangeSelectorCount = 0;
        setEvents();
        var isLeftButtonPressed = function(event) {
                var e = event || window.event,
                    originalEvent = e.originalEvent,
                    touches = e.touches,
                    pointerType = originalEvent ? originalEvent.pointerType : false,
                    eventTouches = originalEvent ? originalEvent.touches : false,
                    isIE8LeftClick = e.which === undefined && e.button === 1,
                    isMSPointerLeftClick = originalEvent && pointerType !== undefined && (pointerType === (originalEvent.MSPOINTER_TYPE_TOUCH || 'touch') || pointerType === (originalEvent.MSPOINTER_TYPE_MOUSE || 'mouse') && originalEvent.buttons === 1),
                    isLeftClick = isIE8LeftClick || e.which === 1,
                    isTouches = touches && touches.length > 0 || eventTouches && eventTouches.length > 0;
                return isLeftClick || isMSPointerLeftClick || isTouches
            };
        var isMultiTouches = function(event) {
                var originalEvent = event.originalEvent,
                    touches = event.touches,
                    eventTouches = originalEvent ? originalEvent.touches : false;
                return touches && touches.length > 1 || eventTouches && eventTouches.length > 1 || null
            };
        var isTouchEventArgs = function(e) {
                return e && e.type && e.type.indexOf('touch') === 0
            };
        _SlidersEventManager = rangeSelector.SlidersEventsManager = function(renderer, slidersController, processSelectionChanged) {
            var that = this,
                uniqueNS = that._uniqueNS = 'dx-range-selector_' + rangeSelectorCount++,
                rangeSelectorEvents = rangeSelector.events;
            that._renderer = renderer;
            that._slidersController = slidersController;
            that._processSelectionChanged = processSelectionChanged;
            that._enabled = true;
            that._eventsNames = {
                start: addNamespace(rangeSelectorEvents.start, uniqueNS),
                move: addNamespace(rangeSelectorEvents.move, uniqueNS),
                end: addNamespace(rangeSelectorEvents.end, uniqueNS)
            }
        };
        _SlidersEventManager.prototype = {
            constructor: _SlidersEventManager,
            _getRootOffsetLeft: function() {
                return rangeSelector.utils.getRootOffsetLeft(this._renderer)
            },
            _initializeSliderEvents: function(sliderIndex) {
                var that = this,
                    renderer = that._renderer,
                    isTouchEvent,
                    slidersController = that._slidersController,
                    processSelectionChanged = that._processSelectionChanged,
                    slider = slidersController.getSlider(sliderIndex),
                    anotherSlider = slider.getAnotherSlider(),
                    fastSwap,
                    startOffsetPosition,
                    splitterMoving,
                    sliderEndHandler = function(e) {
                        if (splitterMoving) {
                            splitterMoving = false;
                            slidersController.processDocking();
                            processSelectionChanged(false)
                        }
                    },
                    sliderMoveHandler = function(e) {
                        var doSwap,
                            pageX,
                            offsetPosition,
                            svgOffsetLeft = that._getRootOffsetLeft(),
                            position,
                            sliderIndex = slider.getIndex();
                        if (isTouchEvent !== isTouchEventArgs(e))
                            return;
                        if (!isLeftButtonPressed(e, true) && splitterMoving) {
                            splitterMoving = false;
                            slidersController.processDocking();
                            processSelectionChanged(false)
                        }
                        else if (splitterMoving) {
                            if (!isMultiTouches(e)) {
                                this.preventedDefault = true;
                                e.preventDefault()
                            }
                            pageX = getEventPageX(e);
                            position = pageX - startOffsetPosition - svgOffsetLeft;
                            offsetPosition = pageX - slider.getPosition() - svgOffsetLeft;
                            slidersController.moveSlider(sliderIndex, fastSwap, position, offsetPosition, startOffsetPosition, function(newStartOffsetPosition) {
                                startOffsetPosition = newStartOffsetPosition
                            });
                            processSelectionChanged(true)
                        }
                    },
                    eventsNames = that._eventsNames;
                slider.startEventHandler = function(e) {
                    if (!that._enabled || !isLeftButtonPressed(e) || splitterMoving)
                        return;
                    fastSwap = this === slider.getSliderTracker().element;
                    splitterMoving = true;
                    isTouchEvent = isTouchEventArgs(e);
                    startOffsetPosition = getEventPageX(e) - slider.getPosition() - that._getRootOffsetLeft();
                    if (!isMultiTouches(e)) {
                        this.preventedDefault = true;
                        e.stopPropagation();
                        e.preventDefault()
                    }
                };
                slider.on(eventsNames.start, slider.startEventHandler);
                $(document).on(eventsNames.end, sliderEndHandler).on(eventsNames.move, sliderMoveHandler);
                slider.__moveEventHandler = sliderMoveHandler
            },
            _initializeAreaEvents: function() {
                var that = this,
                    renderer = that._renderer,
                    isTouchEvent,
                    slidersController = that._slidersController,
                    processSelectionChanged = that._processSelectionChanged,
                    areaTracker = slidersController.getAreaTracker(),
                    unselectedAreaProcessing = false,
                    splitterMoving = false,
                    startPageX,
                    areaEndHandler = function(e) {
                        var pageX;
                        if (unselectedAreaProcessing) {
                            pageX = getEventPageX(e);
                            if (that._options.behavior.moveSelectedRangeByClick && Math.abs(startPageX - pageX) < MIN_MANUAL_SELECTING_WIDTH)
                                slidersController.applySelectedAreaCenterPosition(pageX - that._getRootOffsetLeft());
                            unselectedAreaProcessing = false;
                            processSelectionChanged(false)
                        }
                    },
                    areaMoveHandler = function(e) {
                        var pageX,
                            startPosition,
                            endPosition,
                            svgOffsetLeft = that._getRootOffsetLeft();
                        if (isTouchEvent !== isTouchEventArgs(e))
                            return;
                        if (unselectedAreaProcessing && !isLeftButtonPressed(e)) {
                            unselectedAreaProcessing = false;
                            processSelectionChanged(false)
                        }
                        if (unselectedAreaProcessing) {
                            pageX = getEventPageX(e);
                            if (that._options.behavior.manualRangeSelectionEnabled && Math.abs(startPageX - pageX) >= MIN_MANUAL_SELECTING_WIDTH) {
                                startPosition = startPageX - svgOffsetLeft;
                                endPosition = pageX - svgOffsetLeft;
                                slidersController.processManualSelection(startPosition, endPosition, e);
                                unselectedAreaProcessing = false;
                                processSelectionChanged(true)
                            }
                        }
                    },
                    eventsNames = that._eventsNames;
                areaTracker.on(eventsNames.start, function(e) {
                    if (!that._enabled || !isLeftButtonPressed(e) || unselectedAreaProcessing)
                        return;
                    unselectedAreaProcessing = true;
                    isTouchEvent = isTouchEventArgs(e);
                    startPageX = getEventPageX(e)
                });
                $(document).on(eventsNames.end, areaEndHandler).on(eventsNames.move, areaMoveHandler);
                that.__areaMoveEventHandler = areaMoveHandler
            },
            _initializeSelectedAreaEvents: function() {
                var that = this,
                    renderer = that._renderer,
                    isTouchEvent,
                    slidersController = that._slidersController,
                    processSelectionChanged = that._processSelectionChanged,
                    selectedAreaTracker = slidersController.getSelectedAreaTracker(),
                    selectedAreaMoving = false,
                    offsetStartPosition,
                    selectedRangeInterval,
                    selectedAreaEndHandler = function(e) {
                        if (selectedAreaMoving) {
                            selectedAreaMoving = false;
                            slidersController.processDocking();
                            processSelectionChanged(false)
                        }
                    },
                    selectedAreaMoveHandler = function(e) {
                        var positionDelta,
                            pageX;
                        if (isTouchEvent !== isTouchEventArgs(e))
                            return;
                        if (selectedAreaMoving && !isLeftButtonPressed(e)) {
                            selectedAreaMoving = false;
                            slidersController.processDocking();
                            processSelectionChanged(false)
                        }
                        if (selectedAreaMoving) {
                            if (!isMultiTouches(e)) {
                                this.preventedDefault = true;
                                e.preventDefault()
                            }
                            pageX = getEventPageX(e);
                            positionDelta = pageX - slidersController.getSlider(START_VALUE_INDEX).getPosition() - offsetStartPosition;
                            slidersController.moveSliders(positionDelta, selectedRangeInterval);
                            processSelectionChanged(true)
                        }
                    },
                    eventsNames = that._eventsNames;
                selectedAreaTracker.on(eventsNames.start, function(e) {
                    if (!that._enabled || !isLeftButtonPressed(e) || selectedAreaMoving)
                        return;
                    selectedAreaMoving = true;
                    isTouchEvent = isTouchEventArgs(e);
                    offsetStartPosition = getEventPageX(e) - slidersController.getSlider(START_VALUE_INDEX).getPosition();
                    selectedRangeInterval = slidersController.getSelectedRangeInterval();
                    if (!isMultiTouches(e)) {
                        this.preventedDefault = true;
                        e.stopPropagation();
                        e.preventDefault()
                    }
                });
                $(document).on(eventsNames.end, selectedAreaEndHandler).on(eventsNames.move, selectedAreaMoveHandler);
                that.__selectedAreaMoveEventHandler = selectedAreaMoveHandler
            },
            applyOptions: function(options) {
                this._options = options
            },
            dispose: function() {
                $(document).off('.' + this._uniqueNS)
            },
            initialize: function() {
                var that = this;
                if (!that._renderer.isInitialized())
                    return;
                that._initializeSelectedAreaEvents(that);
                that._initializeAreaEvents();
                that._initializeSliderEvents(START_VALUE_INDEX);
                that._initializeSliderEvents(END_VALUE_INDEX)
            },
            setEnabled: function(enabled) {
                this._enabled = enabled
            }
        };
        rangeSelector.__setEvents = setEvents
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file slider.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            utils = DX.utils;
        var touchSupport = "ontouchstart" in window;
        var msPointerEnabled = window.navigator.msPointerEnabled || window.navigator.pointerEnabled;
        var animationOptions = {duration: 250};
        var SPLITTER_WIDTH = 8,
            TOUCH_SPLITTER_WIDTH = 20,
            START_VALUE_INDEX = 0,
            END_VALUE_INDEX = 1;
        rangeSelector.Slider = rangeSelector.BaseVisualElement.inherit(function() {
            return {
                    getText: function() {
                        if (this._marker)
                            return this._marker.getText()
                    },
                    getAvailableValues: function() {
                        return this._values
                    },
                    getShutter: function() {
                        return this._shutter
                    },
                    getMarker: function() {
                        return this._marker
                    },
                    _createSlider: function() {
                        var that = this,
                            sliderHandle,
                            sliderGroup,
                            sliderHandleOptions = that._options.sliderHandle;
                        sliderGroup = that._renderer.createGroup({'class': 'slider'});
                        sliderGroup.applySettings({
                            translateX: that._options.canvas.left,
                            translateY: that._options.canvas.top
                        });
                        sliderHandle = that._renderer.createLine(0, 0, 0, that._options.canvas.height, {
                            'class': 'dx-range-selector-slider',
                            strokeWidth: sliderHandleOptions.width,
                            stroke: sliderHandleOptions.color,
                            strokeOpacity: sliderHandleOptions.opacity
                        });
                        sliderHandle.append(sliderGroup);
                        sliderGroup.setValid = function(correct) {
                            sliderHandle.applySettings({stroke: correct ? that._options.sliderHandle.color : that._options.sliderMarker.invalidRangeColor})
                        };
                        sliderGroup.updateHeight = function() {
                            sliderHandle.applySettings({points: [0, 0, 0, that._options.canvas.height]})
                        };
                        sliderGroup.applyOptions = function(options) {
                            sliderHandle.applySettings(options)
                        };
                        sliderGroup.__line = sliderHandle;
                        return sliderGroup
                    },
                    _createSliderTracker: function() {
                        var that = this,
                            sliderHandleWidth = that._options.sliderHandle.width,
                            splitterWidth = SPLITTER_WIDTH < sliderHandleWidth ? sliderHandleWidth : SPLITTER_WIDTH,
                            sliderWidth = touchSupport || msPointerEnabled ? TOUCH_SPLITTER_WIDTH : splitterWidth,
                            sliderTracker,
                            sliderTrackerGroup;
                        sliderTracker = that._renderer.createRect(-sliderWidth / 2, 0, sliderWidth, that._options.canvas.height, 0, {
                            fill: 'grey',
                            stroke: 'grey',
                            opacity: 0.0001,
                            style: {cursor: 'w-resize'}
                        });
                        sliderTrackerGroup = that._renderer.createGroup({'class': 'sliderTracker'});
                        sliderTrackerGroup.applySettings({
                            translateX: 0,
                            translateY: that._options.canvas.top
                        });
                        sliderTracker.append(sliderTrackerGroup);
                        sliderTrackerGroup.updateHeight = function() {
                            sliderTracker.applySettings({height: that._options.canvas.height})
                        };
                        sliderTrackerGroup.__rect = sliderTracker;
                        return sliderTrackerGroup
                    },
                    _drawSliderTracker: function(group) {
                        var that = this,
                            sliderTracker = that._createSliderTracker();
                        if (sliderTracker) {
                            sliderTracker.append(group);
                            that._sliderTracker = sliderTracker
                        }
                    },
                    _createSliderMarker: function(options) {
                        return rangeSelector.rangeSelectorFactory.createSliderMarker(options)
                    },
                    _setPosition: function(position, correctByMinMaxRange) {
                        var that = this,
                            correctedPosition = that._correctPosition(position),
                            value = that._options.translator.untranslate(correctedPosition);
                        that.setValue(value, correctByMinMaxRange, false);
                        that._position = correctedPosition
                    },
                    _setPositionForBothSliders: function(startPosition, interval) {
                        var that = this,
                            anotherSlider,
                            startValue,
                            endValue,
                            endPosition,
                            type = that._options.scale.type,
                            base = that._options.scale.logarithmBase,
                            inverted = that._options.scale.inverted;
                        var getNextValue = function(value, isNegative) {
                                var lgPower;
                                if (type === 'logarithmic') {
                                    lgPower = utils.addInterval(utils.adjustValue(utils.getLog(value, base)), interval, isNegative);
                                    return utils.raiseTo(lgPower, base)
                                }
                                else
                                    return utils.addInterval(value, interval, isNegative)
                            };
                        anotherSlider = that.getAnotherSlider();
                        startPosition = that._correctBounds(startPosition);
                        startValue = that._options.translator.untranslate(startPosition);
                        endValue = getNextValue(startValue);
                        if (!inverted && endValue > that._options.scale.endValue || inverted && endValue < that._options.scale.endValue) {
                            endValue = that._options.scale.endValue;
                            endPosition = that._options.canvas.left + that._options.canvas.width;
                            startValue = getNextValue(endValue, true);
                            startPosition = that._options.translator.translate(startValue)
                        }
                        else
                            endPosition = that._options.translator.translate(endValue);
                        if (that._values)
                            if (!inverted ? startValue < that._values[0] : startValue > that._values[that._values.length - 1]) {
                                startValue = that._correctBusinessValueByAvailableValues(startValue, false);
                                endValue = getNextValue(startValue)
                            }
                            else {
                                endValue = that._correctBusinessValueByAvailableValues(endValue, false);
                                startValue = getNextValue(endValue, true)
                            }
                        anotherSlider.setValue(endValue, undefined, false);
                        that.setValue(startValue, undefined, false);
                        that._position = startPosition;
                        anotherSlider._position = endPosition
                    },
                    _correctPosition: function(position) {
                        var that = this,
                            correctedPosition = that._correctInversion(position);
                        correctedPosition = that._correctBounds(correctedPosition);
                        return correctedPosition
                    },
                    _correctInversion: function(position) {
                        var that = this,
                            correctedPosition = position,
                            anotherSliderPosition = that.getAnotherSlider().getPosition(),
                            slidersInverted = that.getIndex() === START_VALUE_INDEX ? position > anotherSliderPosition : position < anotherSliderPosition;
                        if (slidersInverted)
                            correctedPosition = anotherSliderPosition;
                        return correctedPosition
                    },
                    _correctBounds: function(position) {
                        var that = this,
                            correctedPosition = position,
                            canvas = that._options.canvas;
                        if (position < canvas.left)
                            correctedPosition = canvas.left;
                        if (position > canvas.left + canvas.width)
                            correctedPosition = canvas.left + canvas.width;
                        return correctedPosition
                    },
                    _correctBusinessValue: function(businessValue, correctByMinMaxRange, skipCorrection) {
                        var that = this,
                            result = that._correctBusinessValueByAvailableValues(businessValue, skipCorrection);
                        if (correctByMinMaxRange)
                            result = that._correctBusinessValueByMinMaxRangeFromAnotherSlider(result);
                        result = that._correctBusinessValueByMinRangeFromStartEndValues(result);
                        return result
                    },
                    _correctBusinessValueByAvailableValues: function(businessValue, skipCorrection) {
                        var values = this._values;
                        if (!skipCorrection && values)
                            return rangeSelector.utils.findNearValue(values, businessValue);
                        return businessValue
                    },
                    _correctBusinessValueByMinMaxRangeFromAnotherSlider: function(businessValue) {
                        var that = this,
                            result = businessValue,
                            scale = that._options.scale,
                            values = that._values,
                            sliderIndex = that.getIndex(),
                            anotherBusinessValue = that.getAnotherSlider().getValue(),
                            isValid = true,
                            minValue,
                            maxValue;
                        if (!scale.inverted && sliderIndex === START_VALUE_INDEX || scale.inverted && sliderIndex === END_VALUE_INDEX) {
                            if (scale.maxRange)
                                minValue = that._addInterval(anotherBusinessValue, scale.maxRange, true);
                            if (scale.minRange)
                                maxValue = that._addInterval(anotherBusinessValue, scale.minRange, true)
                        }
                        else {
                            if (scale.maxRange)
                                maxValue = that._addInterval(anotherBusinessValue, scale.maxRange);
                            if (scale.minRange)
                                minValue = that._addInterval(anotherBusinessValue, scale.minRange)
                        }
                        if (maxValue !== undefined && result > maxValue) {
                            result = values ? rangeSelector.utils.findLessOrEqualValue(values, maxValue) : maxValue;
                            isValid = false
                        }
                        else if (minValue !== undefined && result < minValue) {
                            result = values ? rangeSelector.utils.findGreaterOrEqualValue(values, minValue) : minValue;
                            isValid = false
                        }
                        that._setValid(isValid);
                        return result
                    },
                    _addInterval: function(value, interval, isNegative) {
                        var result,
                            type = this._options.scale.type,
                            base = type === "logarithmic" && this._options.scale.logarithmBase;
                        if (base) {
                            var power = utils.addInterval(utils.getLog(value, base), interval, isNegative);
                            result = Math.pow(base, power)
                        }
                        else
                            result = utils.addInterval(value, interval, isNegative);
                        return result
                    },
                    _correctBusinessValueByMinRangeFromStartEndValues: function(businessValue) {
                        var that = this,
                            values = that._values,
                            startValue,
                            endValue,
                            isValid = true,
                            scale = that._options.scale,
                            result = businessValue;
                        if (scale.minRange)
                            if (that.getIndex() === END_VALUE_INDEX) {
                                startValue = that._addInterval(scale.startValue, scale.minRange, scale.inverted);
                                if (!scale.inverted && result < startValue || scale.inverted && result > startValue)
                                    result = startValue
                            }
                            else if (that.getIndex() === START_VALUE_INDEX) {
                                endValue = that._addInterval(scale.endValue, scale.minRange, !scale.inverted);
                                if (!scale.inverted && result > endValue || scale.inverted && result < endValue)
                                    result = endValue
                            }
                        return result
                    },
                    _applySliderPosition: function(position, disableAnimation) {
                        var that = this,
                            isAnimation = that._options.behavior.animationEnabled && !disableAnimation,
                            top = that._options.canvas.top,
                            slider = that._slider;
                        if (isAnimation || slider.inAnimation) {
                            slider.inAnimation = true;
                            slider.animate({translate: {
                                    x: position,
                                    y: top
                                }}, isAnimation ? animationOptions : {duration: 0}, function() {
                                slider.inAnimation = false
                            });
                            that._sliderTracker.animate({translate: {
                                    x: position,
                                    y: top
                                }}, isAnimation ? animationOptions : {duration: 0})
                        }
                        else {
                            that._slider.applySettings({
                                translateX: position,
                                translateY: top
                            });
                            that._sliderTracker.applySettings({
                                translateX: position,
                                translateY: top
                            })
                        }
                        that._sliderTracker.updateHeight();
                        that._slider.updateHeight()
                    },
                    _applyShutterPosition: function(position, disableAnimation) {
                        var that = this,
                            shutterSettings,
                            shutter = that._shutter,
                            isAnimation = that._options.behavior.animationEnabled && !disableAnimation,
                            sliderIndex = that.getIndex();
                        if (sliderIndex == START_VALUE_INDEX)
                            shutterSettings = {
                                x: that._options.canvas.left,
                                y: that._options.canvas.top,
                                width: position - that._options.canvas.left,
                                height: that._options.canvas.height
                            };
                        else if (sliderIndex == END_VALUE_INDEX)
                            shutterSettings = {
                                x: position + 1,
                                y: that._options.canvas.top,
                                width: that._options.canvas.left + that._options.canvas.width - position,
                                height: that._options.canvas.height
                            };
                        if (shutterSettings)
                            if (isAnimation || shutter.inAnimation) {
                                shutter.inAnimation = true;
                                shutter.animate(shutterSettings, isAnimation ? animationOptions : {duration: 0}, function() {
                                    shutter.inAnimation = false
                                })
                            }
                            else
                                shutter.applySettings(shutterSettings)
                    },
                    _setValid: function(isValid) {
                        var that = this;
                        if (that._marker)
                            that._marker.setValid(isValid);
                        that._slider.setValid(isValid)
                    },
                    _setText: function(text) {
                        var that = this;
                        if (that._marker)
                            that._marker.setText(text)
                    },
                    ctor: function(renderer, index) {
                        var that = this;
                        that.callBase(renderer);
                        that._index = index
                    },
                    getIndex: function() {
                        return this._index
                    },
                    setAvailableValues: function(values) {
                        this._values = values
                    },
                    setAnotherSlider: function(slider) {
                        this._anotherSlider = slider
                    },
                    getAnotherSlider: function(slider) {
                        return this._anotherSlider
                    },
                    appendTrackers: function(group) {
                        var that = this;
                        if (that._sliderTracker)
                            that._sliderTracker.append(group)
                    },
                    getSliderTracker: function() {
                        return this._sliderTracker
                    },
                    changeLocation: function() {
                        var that = this;
                        if (that._marker)
                            that._marker.changeLocation();
                        that._index = this._index === START_VALUE_INDEX ? END_VALUE_INDEX : START_VALUE_INDEX;
                        that._lastPosition = null
                    },
                    setPosition: function(position, correctByMinMaxRange, selectedRangeInterval) {
                        var that = this,
                            slider;
                        if (selectedRangeInterval !== undefined) {
                            slider = that.getIndex() === START_VALUE_INDEX ? that : that.getAnotherSlider();
                            slider._setPositionForBothSliders(position, selectedRangeInterval)
                        }
                        else
                            that._setPosition(position, correctByMinMaxRange)
                    },
                    getPosition: function() {
                        return this._position
                    },
                    _applyOptions: function(options) {
                        this._lastPosition = null
                    },
                    setValue: function(value, correctByMinMaxRange, skipCorrection) {
                        var that = this;
                        if (value === undefined) {
                            that._value = undefined;
                            that._valuePosition = that._position = that.getIndex() === START_VALUE_INDEX ? that._options.canvas.left : that._options.canvas.left + that._options.canvas.width;
                            that._setText(rangeSelector.consts.emptySliderMarkerText)
                        }
                        else {
                            that._value = that._correctBusinessValue(value, correctByMinMaxRange, utils.isDefined(skipCorrection) ? !!skipCorrection : true);
                            that._valuePosition = that._position = that._options.translator.translate(that._value);
                            that._setText(rangeSelector.formatValue(that._value, that._options.sliderMarker))
                        }
                    },
                    getValue: function() {
                        return this._value
                    },
                    canSwap: function() {
                        var that = this,
                            scale = that._options.scale,
                            startValue,
                            endValue,
                            anotherSliderValue;
                        if (that._options.behavior.allowSlidersSwap) {
                            if (scale.minRange) {
                                anotherSliderValue = that.getAnotherSlider().getValue();
                                if (that.getIndex() === START_VALUE_INDEX) {
                                    endValue = utils.addInterval(scale.endValue, scale.minRange, !scale.inverted);
                                    if (!scale.inverted && anotherSliderValue > endValue || scale.inverted && anotherSliderValue < endValue)
                                        return false
                                }
                                else {
                                    startValue = utils.addInterval(scale.startValue, scale.minRange, scale.inverted);
                                    if (!scale.inverted && anotherSliderValue < startValue || scale.inverted && anotherSliderValue > startValue)
                                        return false
                                }
                            }
                            return true
                        }
                        return false
                    },
                    processDocking: function() {
                        var that = this;
                        that._position = that._valuePosition;
                        that.applyPosition(false);
                        that._setValid(true)
                    },
                    applyPosition: function(disableAnimation) {
                        var that = this,
                            position = that.getPosition();
                        if (that._lastPosition !== position) {
                            that._applySliderPosition(position, disableAnimation);
                            that._applyShutterPosition(position, disableAnimation);
                            that._lastPosition = position
                        }
                    },
                    on: function(event, handler) {
                        var that = this;
                        that._sliderTracker.on(event, handler);
                        if (that._marker)
                            that._marker.getTracker().on(event, handler)
                    },
                    _update: function() {
                        var that = this;
                        that._marker && that._marker.applyOptions(that._options.sliderMarker);
                        that._shutter && that._shutter.applySettings({
                            fill: that._options.shutter.color,
                            fillOpacity: that._options.shutter.opacity
                        });
                        that._slider && that._slider.applyOptions({
                            strokeWidth: that._options.sliderHandle.width,
                            stroke: that._options.sliderHandle.color,
                            strokeOpacity: that._options.sliderHandle.opacity
                        })
                    },
                    _draw: function(group) {
                        var that = this,
                            slider,
                            marker,
                            sliderAreaGroup,
                            shutter,
                            startPos,
                            startWidth,
                            index = that.getIndex();
                        sliderAreaGroup = that._renderer.createGroup({'class': 'sliderArea'});
                        sliderAreaGroup.append(group);
                        if (index === START_VALUE_INDEX)
                            shutter = that._renderer.createRect(that._options.canvas.left, that._options.canvas.top, 0, that._options.canvas.height, 0);
                        else if (index === END_VALUE_INDEX)
                            shutter = that._renderer.createRect(that._options.canvas.left, that._options.canvas.top, that._options.canvas.width, that._options.canvas.height, 0);
                        if (shutter) {
                            shutter.append(sliderAreaGroup);
                            slider = that._createSlider();
                            if (slider)
                                slider.append(sliderAreaGroup);
                            if (that._options.sliderMarker.visible) {
                                marker = that._createSliderMarker({
                                    renderer: that._renderer,
                                    isLeftPointer: index === END_VALUE_INDEX,
                                    sliderMarkerOptions: that._options.sliderMarker
                                });
                                marker.draw(slider)
                            }
                            that._shutter = shutter;
                            that._slider = slider;
                            that._marker = marker
                        }
                        that._drawSliderTracker(group)
                    }
                }
        }())
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file sliderMarker.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector;
        rangeSelector.SliderMarker = DX.Class.inherit(function() {
            var ctor = function(options) {
                    this._renderer = options.renderer;
                    this._text = options.text;
                    this._isLeftPointer = options.isLeftPointer;
                    this._options = options.sliderMarkerOptions;
                    this._isValid = true;
                    initializeAreaPoints(this, {
                        width: 10,
                        height: 10
                    })
                };
            var applyOptions = function(options) {
                    this._options = options;
                    this.update()
                };
            var getRectSize = function(that, textSize) {
                    return {
                            width: Math.round(2 * that._options.padding + textSize.width),
                            height: Math.round(2 * that._options.padding + textSize.height * rangeSelector.consts.fontHeightRatio)
                        }
                };
            var initializeAreaPoints = function(that, textSize) {
                    var rectSize = getRectSize(that, textSize);
                    that._points = [];
                    if (that._isLeftPointer) {
                        that._points.push({
                            x: 0,
                            y: 0
                        });
                        that._points.push({
                            x: rectSize.width,
                            y: 0
                        });
                        that._points.push({
                            x: rectSize.width,
                            y: rectSize.height
                        });
                        that._points.push({
                            x: that._options.pointerSize,
                            y: rectSize.height
                        });
                        that._points.push({
                            x: 0,
                            y: rectSize.height + that._options.pointerSize
                        })
                    }
                    else {
                        that._points.push({
                            x: 0,
                            y: 0
                        });
                        that._points.push({
                            x: rectSize.width,
                            y: 0
                        });
                        that._points.push({
                            x: rectSize.width,
                            y: rectSize.height + that._options.pointerSize
                        });
                        that._points.push({
                            x: rectSize.width - that._options.pointerSize,
                            y: rectSize.height
                        });
                        that._points.push({
                            x: 0,
                            y: rectSize.height
                        })
                    }
                };
            var getPointerPosition = function(that, textSize) {
                    var rectSize = getRectSize(that, textSize);
                    if (that._isLeftPointer)
                        return {
                                x: 0,
                                y: rectSize.height + that._options.pointerSize
                            };
                    else
                        return {
                                x: rectSize.width - 1,
                                y: rectSize.height + that._options.pointerSize
                            }
                };
            var draw = function(group) {
                    var that = this;
                    var padding = that._options.padding;
                    that._sliderMarkerGroup = that._renderer.createGroup({'class': 'sliderMarker'});
                    that._sliderMarkerGroup.append(group);
                    that._area = that._renderer.createArea(that.points, {fill: that._options.color});
                    that._area.append(that._sliderMarkerGroup);
                    that._label = that._renderer.createText(that._text, padding, padding, {
                        font: that._options.font,
                        align: 'left',
                        style: {'-webkit-user-select': 'none'}
                    });
                    that._label.append(that._sliderMarkerGroup);
                    that._tracker = that._renderer.createRect(0, 0, 2 * padding, 2 * padding + that._options.pointerSize, 0, {
                        fill: 'grey',
                        stroke: 'grey',
                        opacity: 0.0001,
                        style: {cursor: 'pointer'}
                    });
                    that._tracker.append(that._sliderMarkerGroup);
                    that._drawn = true;
                    that.update()
                };
            var getTextSize = function(that) {
                    var textSize = that._label.getBBox();
                    if (!that._textHeight && isFinite(textSize.height))
                        that._textHeight = textSize.height;
                    return {
                            width: textSize.width,
                            height: that._textHeight
                        }
                };
            var update = function(stop) {
                    var that = this,
                        textSize,
                        rectSize,
                        pointerPosition;
                    that._interval && clearInterval(that._interval);
                    delete that._interval;
                    if (!that._drawn)
                        return;
                    that._label.updateText(that._text);
                    textSize = getTextSize(that);
                    if (!stop) {
                        that._textSize = that._textSize || textSize;
                        that._textSize = textSize.width > that._textSize.width || textSize.height > that._textSize.height ? textSize : that._textSize;
                        textSize = that._textSize;
                        that._interval = setInterval(function() {
                            update.call(that, [true])
                        }, 75)
                    }
                    else {
                        delete that._textSize;
                        that._textSize = textSize
                    }
                    rectSize = getRectSize(that, textSize);
                    pointerPosition = getPointerPosition(that, textSize);
                    that._sliderMarkerGroup.applySettings({
                        translateX: -pointerPosition.x,
                        translateY: -pointerPosition.y
                    });
                    initializeAreaPoints(that, textSize);
                    that._area.applySettings({
                        points: that._points,
                        fill: that._isValid ? that._options.color : that._options.invalidRangeColor
                    });
                    that._tracker.applySettings({
                        width: rectSize.width,
                        height: rectSize.height + that._options.pointerSize
                    });
                    that._label.applySettings({
                        x: that._options.padding,
                        y: rectSize.height - that._options.padding
                    })
                };
            var getText = function() {
                    var that = this;
                    return that._text
                };
            var setText = function(value) {
                    var that = this;
                    if (that._text !== value) {
                        that._text = value;
                        that.update()
                    }
                };
            var setValid = function(isValid) {
                    var that = this;
                    that._isValid = isValid;
                    that.update()
                };
            var changeLocation = function() {
                    var that = this;
                    that._isLeftPointer = !that._isLeftPointer;
                    that.update()
                };
            var getTracker = function() {
                    var that = this;
                    return that._tracker
                };
            return {
                    ctor: ctor,
                    draw: draw,
                    update: update,
                    getText: getText,
                    setText: setText,
                    changeLocation: changeLocation,
                    applyOptions: applyOptions,
                    getTracker: getTracker,
                    setValid: setValid
                }
        }())
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file rangeView.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector;
        rangeSelector.RangeView = rangeSelector.BaseVisualElement.inherit(function() {
            return {_draw: function(group) {
                        var that = this,
                            viewRect,
                            viewImage,
                            backgroundColor,
                            series,
                            i,
                            showChart,
                            canvas,
                            options = that._options,
                            seriesOptions,
                            isEmpty = options.isEmpty;
                        showChart = options.seriesDataSource && options.seriesDataSource.isShowChart() && !isEmpty;
                        canvas = options.canvas;
                        if (showChart)
                            backgroundColor = options.seriesDataSource.getBackgroundColor();
                        else if (!isEmpty && options.background.visible)
                            backgroundColor = options.background.color;
                        if (options.background.visible && backgroundColor) {
                            viewRect = that._renderer.createRect(canvas.left, canvas.top, canvas.width + 1, canvas.height, 0, {
                                fill: backgroundColor,
                                'class': 'dx-range-selector-background'
                            });
                            viewRect.append(group)
                        }
                        if (options.background.visible && options.background.image && options.background.image.url) {
                            viewImage = that._renderer.createImage(canvas.left, canvas.top, canvas.width + 1, canvas.height, options.background.image.url, {location: options.background.image.location});
                            viewImage.append(group)
                        }
                        if (showChart) {
                            series = options.seriesDataSource.getSeries();
                            options.seriesDataSource.adjustSeriesDimensions(options.translators, options.chart.useAggregation);
                            for (i = 0; i < series.length; i++) {
                                seriesOptions = series[i].getOptions();
                                seriesOptions.seriesGroup = group;
                                seriesOptions.labelsGroup = group;
                                series[i].draw(options.translators, options.behavior && options.behavior.animationEnabled && that._renderer.animationEnabled())
                            }
                        }
                    }}
        }())
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file seriesDataSource.js */
    (function($, DX, undefined) {
        var rangeSelector = DX.viz.rangeSelector,
            charts = DX.viz.charts,
            core = DX.viz.core,
            coreFactory = core.CoreFactory,
            utils = DX.utils;
        rangeSelector.SeriesDataSource = DX.Class.inherit(function() {
            var createThemeManager = function(chartOptions) {
                    return charts.factory.createThemeManager(chartOptions, 'rangeSelector.chart')
                };
            var isArrayOfSimpleTypes = function(data) {
                    return $.isArray(data) && data.length > 0 && (utils.isNumber(data[0]) || utils.isDate(data[0]))
                };
            var convertToArrayOfObjects = function(data) {
                    return $.map(data, function(item, i) {
                            return {
                                    arg: item,
                                    val: i
                                }
                        })
                };
            var calculateSeries = function(that, options, templatedSeries) {
                    var series = [],
                        particularSeriesOptions,
                        seriesTheme,
                        data,
                        parsedData,
                        chartThemeManager = that.themeManager,
                        hasSeriesTemplate = !!chartThemeManager.getOptions('seriesTemplate'),
                        allSeriesOptions = hasSeriesTemplate ? templatedSeries : options.chart.series,
                        seriesValueType = options.chart.valueAxis && options.chart.valueAxis.valueType,
                        dataSourceField,
                        i;
                    that.teamplateData = [];
                    if (options.dataSource && !allSeriesOptions) {
                        if (isArrayOfSimpleTypes(options.dataSource))
                            options.dataSource = convertToArrayOfObjects(options.dataSource);
                        dataSourceField = options.dataSourceField || 'arg';
                        allSeriesOptions = {
                            argumentField: dataSourceField,
                            valueField: dataSourceField
                        };
                        that._hideChart = true
                    }
                    allSeriesOptions = $.isArray(allSeriesOptions) ? allSeriesOptions : allSeriesOptions ? [allSeriesOptions] : [];
                    that._backgroundColor = options.backgroundColor !== undefined ? options.backgroundColor : chartThemeManager.getOptions("backgroundColor");
                    for (i = 0; i < allSeriesOptions.length; i++) {
                        particularSeriesOptions = $.extend(true, {
                            argumentType: options.valueType,
                            argumentAxisType: options.axisType,
                            valueType: dataSourceField ? options.valueType : seriesValueType,
                            incidentOccured: options.incidentOccured
                        }, allSeriesOptions[i]);
                        particularSeriesOptions.rotated = false;
                        data = particularSeriesOptions.data || options.dataSource;
                        seriesTheme = chartThemeManager.getOptions("series", particularSeriesOptions);
                        seriesTheme.argumentField = seriesTheme.argumentField || options.dataSourceField;
                        if (data && data.length > 0) {
                            var newSeries = coreFactory.createSeries(options.renderer, seriesTheme);
                            series.push(newSeries)
                        }
                        if (hasSeriesTemplate) {
                            $.each(data, function(_, data) {
                                $.each(newSeries.getTeamplatedFields(), function(_, field) {
                                    data[field.teamplateField] = data[field.originalField]
                                });
                                that.teamplateData.push(data)
                            });
                            newSeries.updateTeamplateFieldNames()
                        }
                    }
                    data = hasSeriesTemplate ? that.teamplateData : data;
                    that._dataValidator = charts.factory.createDataValidator(data, [series], options.incidentOccured, chartThemeManager.getOptions("dataPrepareSettings"));
                    parsedData = that._dataValidator.validate();
                    for (i = 0; i < series.length; i++) {
                        var particularSeries = series[i];
                        particularSeries.updateData(parsedData)
                    }
                    return series
                };
            var processSeriesFamilies = function(series, equalBarWidth, minBubbleSize, maxBubbleSize) {
                    var families = [],
                        types = [];
                    $.each(series, function(i, item) {
                        if ($.inArray(item.type, types) === -1)
                            types.push(item.type)
                    });
                    $.each(types, function(_, type) {
                        var family = new coreFactory.createSeriesFamily({
                                type: type,
                                equalBarWidth: equalBarWidth,
                                minBubbleSize: minBubbleSize,
                                maxBubbleSize: maxBubbleSize
                            });
                        family.add(series);
                        family.adjustSeriesValues();
                        families.push(family)
                    });
                    return families
                };
            var prototypeObject = {
                    ctor: function(options) {
                        var that = this,
                            templatedSeries,
                            seriesTemplate,
                            themeManager = that.themeManager = createThemeManager(options.chart),
                            topIndent = themeManager.getOptions('topIndent'),
                            bottomIndent = themeManager.getOptions('bottomIndent');
                        that._indent = {
                            top: topIndent >= 0 && topIndent < 1 ? topIndent : 0,
                            bottom: bottomIndent >= 0 && bottomIndent < 1 ? bottomIndent : 0
                        };
                        that._valueAxis = themeManager.getOptions('valueAxisRangeSelector') || {};
                        that._hideChart = false;
                        seriesTemplate = themeManager.getOptions('seriesTemplate');
                        if (options.dataSource && seriesTemplate)
                            templatedSeries = utils.processSeriesTemplate(seriesTemplate, options.dataSource);
                        that._series = calculateSeries(that, options, templatedSeries);
                        that._seriesFamilies = processSeriesFamilies(that._series, themeManager.getOptions('equalBarWidth'), themeManager.getOptions('minBubbleSize'), themeManager.getOptions('maxBubbleSize'))
                    },
                    adjustSeriesDimensions: function(translators, useAggregation) {
                        var that = this;
                        if (useAggregation)
                            $.each(that._series || [], function(_, s) {
                                s.resamplePoints(translators)
                            });
                        $.each(that._seriesFamilies, function() {
                            this.adjustSeriesDimensions(translators)
                        })
                    },
                    getBoundRange: function() {
                        var that = this,
                            rangeData,
                            valueAxisMin = that._valueAxis.min,
                            valueAxisMax = that._valueAxis.max,
                            valRange = new core.Range({
                                isValueRange: true,
                                min: valueAxisMin,
                                minVisible: valueAxisMin,
                                max: valueAxisMax,
                                maxVisible: valueAxisMax,
                                axisType: that._valueAxis.type,
                                base: that._valueAxis.logarithmBase
                            }),
                            argRange = new core.Range({}),
                            rangeYSize,
                            rangeVisibleSizeY,
                            i,
                            minIndent,
                            maxIndent;
                        for (i = 0; i < that._series.length; i++) {
                            rangeData = that._series[i].getRangeData();
                            valRange.addRange(rangeData.val);
                            argRange.addRange(rangeData.arg)
                        }
                        if (valRange.isDefined() && argRange.isDefined()) {
                            minIndent = that._valueAxis.inverted ? that._indent.top : that._indent.bottom;
                            maxIndent = that._valueAxis.inverted ? that._indent.bottom : that._indent.top;
                            rangeYSize = valRange.max - valRange.min;
                            rangeVisibleSizeY = ($.isNumeric(valRange.maxVisible) ? valRange.maxVisible : valRange.max) - ($.isNumeric(valRange.minVisible) ? valRange.minVisible : valRange.min);
                            if (utils.isDate(valRange.min))
                                valRange.min = new Date(valRange.min.valueOf() - rangeYSize * minIndent);
                            else
                                valRange.min -= rangeYSize * minIndent;
                            if (utils.isDate(valRange.max))
                                valRange.max = new Date(valRange.max.valueOf() + rangeYSize * maxIndent);
                            else
                                valRange.max += rangeYSize * maxIndent;
                            if ($.isNumeric(rangeVisibleSizeY)) {
                                valRange.maxVisible = valRange.maxVisible ? valRange.maxVisible + rangeVisibleSizeY * maxIndent : undefined;
                                valRange.minVisible = valRange.minVisible ? valRange.minVisible - rangeVisibleSizeY * minIndent : undefined
                            }
                            valRange.invert = that._valueAxis.inverted
                        }
                        return {
                                arg: argRange,
                                val: valRange
                            }
                    },
                    getSeries: function() {
                        var that = this;
                        return that._series
                    },
                    getBackgroundColor: function() {
                        var that = this;
                        return that._backgroundColor
                    },
                    isEmpty: function() {
                        var that = this;
                        return that.getSeries().length === 0
                    },
                    isShowChart: function() {
                        var that = this;
                        return !that.isEmpty() && !that._hideChart
                    },
                    getCalculatedValueType: function() {
                        var that = this,
                            result;
                        if (that._series.length)
                            result = that._series[0].argumentType;
                        return result
                    }
                };
            return prototypeObject
        }())
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file themeManager.js */
    (function($, DX, undefined) {
        DX.viz.rangeSelector = DX.viz.rangeSelector;
        DX.viz.rangeSelector.ThemeManager = DX.viz.core.BaseThemeManager.inherit({
            _themeSection: 'rangeSelector',
            ctor: function(userTheme) {
                this.setTheme(userTheme)
            },
            _initializeTheme: function() {
                this._initializeFont(this._theme.scale.label.font);
                this._initializeFont(this._theme.sliderMarker.font);
                this._initializeFont(this._theme.loadingIndicator.font)
            },
            applyRangeSelectorTheme: function(userOptions) {
                var that = this,
                    chart = userOptions.chart,
                    dataSource = userOptions.dataSource,
                    result;
                delete userOptions.dataSource;
                delete userOptions.chart;
                result = $.extend(true, {}, that._theme, userOptions);
                result.dataSource = dataSource;
                if (chart)
                    result.chart = chart;
                return result
            },
            setBackgroundColor: function(containerBackgroundColor) {
                var theme = this._theme;
                if (containerBackgroundColor)
                    theme.containerBackgroundColor = containerBackgroundColor;
                theme.shutter.color = theme.shutter.color || theme.containerBackgroundColor
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-rangeselector, file dxRangeSelector.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            viz = DX.viz;
        DX.registerComponent("dxRangeSelector", viz.rangeSelector.RangeSelector)
    })(jQuery, DevExpress);
    DevExpress.MOD_VIZ_RANGESELECTOR = true
}