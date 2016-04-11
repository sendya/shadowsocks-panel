/*! 
* DevExtreme (Charts)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_VIZ_CHARTS) {
    if (!DevExpress.MOD_VIZ_CORE)
        throw Error('Required module is not referenced: viz-core');
    /*! Module viz-charts, file chartTitle.js */
    (function($, DX, undefined) {
        var isDefined = DX.utils.isDefined,
            endsWith = function(value, pattern) {
                return value.substr(value.length - pattern.length) === pattern
            },
            startsWith = function(value, pattern) {
                return value.indexOf(pattern) === 0
            },
            decreaseGaps = DevExpress.viz.core.utils.decreaseGaps,
            DEFAULT_MARGIN = 10;
        DX.viz.charts.ChartTitle = DX.Class.inherit({
            ctor: function(renderer, options, width, group) {
                var that = this;
                that._init(options, width);
                that.renderer = renderer;
                that.titleGroup = group
            },
            dispose: function() {
                var that = this;
                that.renderer = null;
                that.clipRect = null;
                that.title = null;
                that.innerTitleGroup = null;
                that.titleGroup = null;
                that.options = null
            },
            update: function(options, width) {
                this._init(options, width)
            },
            _init: function(options, width) {
                var that = this;
                if (options) {
                    that._parseAlignments(options);
                    that.horizontalAlignment = options.horizontalAlignment;
                    that.verticalAlignment = options.verticalAlignment;
                    that._parseMargins(options);
                    that.margin = options.margin;
                    that.options = options
                }
                that.setSize({width: width})
            },
            _parseMargins: function(options) {
                options.margin = isDefined(options.margin) ? options.margin : {};
                if (typeof options.margin === 'number') {
                    options.margin = options.margin >= 0 ? options.margin : DEFAULT_MARGIN;
                    options.margin = {
                        top: options.margin,
                        bottom: options.margin,
                        left: options.margin,
                        right: options.margin
                    }
                }
                else {
                    options.margin.top = options.margin.top >= 0 ? options.margin.top : DEFAULT_MARGIN;
                    options.margin.bottom = options.margin.bottom >= 0 ? options.margin.bottom : DEFAULT_MARGIN;
                    options.margin.left = options.margin.left >= 0 ? options.margin.left : DEFAULT_MARGIN;
                    options.margin.right = options.margin.right >= 0 ? options.margin.right : DEFAULT_MARGIN
                }
            },
            _parseAlignments: function(options) {
                if (isDefined(options.position) && !(isDefined(options.verticalAlignment) && isDefined(options.horizontalAlignment))) {
                    options.position = options.position.toLowerCase();
                    options.verticalAlignment = endsWith(options.position, 'top') ? 'top' : 'bottom';
                    options.horizontalAlignment = startsWith(options.position, 'left') ? 'left' : startsWith(options.position, 'center') && 'center' || 'right';
                    return
                }
                options.verticalAlignment = (options.verticalAlignment || '').toLowerCase();
                options.horizontalAlignment = (options.horizontalAlignment || '').toLowerCase();
                if (options.verticalAlignment !== 'top' && options.verticalAlignment !== 'bottom')
                    options.verticalAlignment = 'top';
                if (options.horizontalAlignment !== 'left' && options.horizontalAlignment !== 'center' && options.horizontalAlignment !== 'right')
                    options.horizontalAlignment = 'center'
            },
            _setBoundingRect: function() {
                var that = this,
                    options = that.options,
                    margin = that.changedMargin || that.margin,
                    box;
                if (!that.innerTitleGroup)
                    return;
                box = that.innerTitleGroup.getBBox();
                box.height += margin.top + margin.bottom;
                box.width += margin.left + margin.right;
                box.x -= margin.left;
                box.y -= margin.top;
                if (isDefined(options.placeholderSize))
                    box.height = options.placeholderSize;
                that.boundingRect = box
            },
            draw: function() {
                var that = this,
                    titleOptions = that.options,
                    renderer = that.renderer,
                    attr;
                if (!titleOptions.text)
                    return;
                that.changedMargin = null;
                if (!that.innerTitleGroup) {
                    that.innerTitleGroup = renderer.createGroup();
                    that.clipRect = that.createClipRect();
                    that.titleGroup && that.clipRect && that.titleGroup.applySettings({clipId: that.clipRect.id})
                }
                else
                    that.innerTitleGroup.clear();
                that.innerTitleGroup.append(that.titleGroup);
                attr = {
                    font: titleOptions.font,
                    align: that.horizontalAlignment,
                    style: titleOptions.fontStyle
                };
                that.title = renderer.createText(titleOptions.text, 0, 0, attr).append(that.innerTitleGroup);
                that.title.text = titleOptions.text;
                that._correctTitleLength();
                that._setClipRectSettings()
            },
            _correctTitleLength: function() {
                var that = this,
                    text = that.title.text,
                    updateText,
                    lineLength,
                    box;
                that.title.updateText(text);
                that._setBoundingRect();
                box = that.getLayoutOptions();
                if (that._width > box.width || text.indexOf("<br/>") !== -1)
                    return;
                lineLength = text.length * that._width / box.width;
                updateText = text.substr(0, ~~lineLength - 1 - 3) + "...";
                that.title.updateText(updateText);
                that._setBoundingRect()
            },
            changeSize: function(size) {
                var that = this,
                    margin = $.extend(true, {}, that.margin);
                if (margin.top + margin.bottom < size.height) {
                    if (this.innerTitleGroup) {
                        that.options._incidentOccured("W2103");
                        this.innerTitleGroup.remove();
                        this.innerTitleGroup = null
                    }
                    if (that.clipRect) {
                        that.clipRect.remove();
                        that.clipRect = null
                    }
                }
                else if (size.height > 0) {
                    decreaseGaps(margin, ["top", "bottom"], size.height);
                    size.height && (that.changedMargin = margin)
                }
                that._correctTitleLength();
                that._setBoundingRect();
                that._setClipRectSettings()
            },
            getLayoutOptions: function() {
                var options = this.options,
                    boundingRect = this.innerTitleGroup ? this.boundingRect : {
                        width: 0,
                        height: 0,
                        x: 0,
                        y: 0
                    };
                boundingRect.verticalAlignment = options.verticalAlignment;
                boundingRect.horizontalAlignment = options.horizontalAlignment;
                boundingRect.cutLayoutSide = options.verticalAlignment;
                return boundingRect
            },
            setSize: function(size) {
                this._width = size.width || this._width
            },
            shift: function(x, y) {
                var that = this,
                    box = that.getLayoutOptions();
                x -= box.x;
                y -= box.y;
                that.innerTitleGroup && that.innerTitleGroup.move(x, y);
                that.clipRect && that.clipRect.updateRectangle({
                    translateX: x,
                    translateY: y
                })
            },
            createClipRect: function() {
                if (isDefined(this.options.placeholderSize))
                    return this.renderer.createClipRect(0, 0, 0, 0)
            },
            _setClipRectSettings: function() {
                var bbox = this.getLayoutOptions(),
                    clipRect = this.clipRect;
                if (clipRect) {
                    clipRect.append();
                    clipRect.updateRectangle({
                        x: bbox.x,
                        y: bbox.y,
                        width: bbox.width,
                        height: bbox.height
                    })
                }
            }
        });
        DX.viz.charts.ChartTitle.__DEFAULT_MARGIN = DEFAULT_MARGIN
    })(jQuery, DevExpress);
    /*! Module viz-charts, file axis.js */
    (function($, DX, undefined) {
        var utils = DX.utils,
            isDefinedUtils = utils.isDefined,
            isDateUtils = utils.isDate,
            mathAbs = Math.abs,
            core = DX.viz.core,
            AXIS_VALUE_MARGIN_PRIORITY = 100,
            DEFAULT_AXIS_LABEL_SPACING = 5,
            AXIS_STAGGER_OVERLAPPING_KOEF = 2,
            MAX_GRID_BORDER_ADHENSION = 4,
            CANVAS_POSITION_PREFIX = 'canvas_position_',
            CANVAS_POSITION_START = 'canvas_position_start',
            CANVAS_POSITION_END = 'canvas_position_end',
            TOP = 'top',
            BOTTOM = 'bottom',
            LEFT = 'left',
            RIGHT = 'right',
            CENTER = 'center';
        DX.viz.charts.AXIS_STAGGER_OVERLAPPING_KOEF = AXIS_STAGGER_OVERLAPPING_KOEF;
        var processCustomOptions = function(options) {
                var label = options.label,
                    position = options.position;
                if (options.isHorizontal) {
                    if (!(position === BOTTOM || position === TOP))
                        position = BOTTOM
                }
                else if (!(position === LEFT || position === RIGHT))
                    position = LEFT;
                options.position = position;
                if (position === RIGHT && !label.userAlignment)
                    label.alignment = LEFT
            };
        var formatLabel = function(value, options, axisMinMax) {
                var formatObject = {
                        value: value,
                        valueText: DX.formatHelper.format(value, options.format, options.precision) || ''
                    };
                if (axisMinMax) {
                    formatObject.min = axisMinMax.min;
                    formatObject.max = axisMinMax.max
                }
                return options.customizeText ? options.customizeText.call(formatObject, formatObject) : formatObject.valueText
            };
        var nextState = function(state) {
                switch (state) {
                    case'overlap':
                        return 'stagger';
                    case'stagger':
                        return 'rotate';
                    case'rotate':
                    default:
                        return 'end'
                }
            };
        DX.viz.charts.Axis = function(renderer, options) {
            var debug = DX.utils.debug;
            debug.assertParam(renderer, 'renderer was not passed');
            debug.assertParam(options.label, 'label was not passed');
            debug.assertParam(options.tick, 'tick was not passed');
            debug.assertParam(options.grid, 'grid was not passed');
            debug.assertParam(options.title, 'title was not passed');
            debug.assert(options.axisDivisionFactor, 'axisDivisionFactor was not passed');
            debug.assert(options.stripStyle, 'stripStyle was not passed');
            debug.assert(options.constantLineStyle, 'constantLineStyle was not passed');
            debug.assert(options.position, 'position was not passed');
            debug.assertParam(options.isHorizontal, 'isHorizontal was not passed');
            this.renderer = renderer;
            this._init(options)
        };
        $.extend(DX.viz.charts.Axis.prototype, {
            dispose: function() {
                var that = this;
                that._axisElementsGroup && that._axisElementsGroup.dispose();
                $.each(that.labels || [], function(_, label) {
                    label.removeData()
                });
                that.labels = null;
                that.title = null;
                that.stripLabels = null;
                that.stripRects = null;
                that.constantLineLabels = null;
                that.constantLines = null;
                that._axisStripGroup = null;
                that._axisConstantLineGroup = null;
                that._axisLableGroup = null;
                that._axisLineGroup = null;
                that._axisElementsGroup = null;
                that._axisGridGroup = null;
                that._axisGroup = null;
                that.axesContainerGroup = null;
                that.stripsGroup = null;
                that.constantLinesGroup = null;
                that._axisTitleGroup = null;
                that.renderer = null;
                that.translator = null;
                that.orthogonalTranslator = null;
                that.options = null;
                that.textOptions = null;
                that._tickValues = null;
                that._fullTickValues = null;
                that._fullTickPositions = null
            },
            _init: function(options) {
                var that = this,
                    categories = options.categories,
                    labelOptions = options.label;
                options.hoverMode = options.hoverMode ? options.hoverMode.toLowerCase() : 'none';
                that.hasLabelFormat = labelOptions.format !== '' && isDefinedUtils(labelOptions.format);
                that.options = options;
                that.staggered = labelOptions.staggered;
                labelOptions.minSpacing = isDefinedUtils(labelOptions.minSpacing) ? labelOptions.minSpacing : DEFAULT_AXIS_LABEL_SPACING;
                processCustomOptions(options);
                if (categories) {
                    that.labelsNumber = categories.length;
                    that.ticksNumber = that.labelsNumber
                }
                options.range = {
                    min: options.min,
                    max: options.max,
                    categories: options.categories && options.categories.slice(0)
                };
                that.pane = options.pane;
                that.textOptions = {
                    align: labelOptions.alignment,
                    font: labelOptions.font,
                    opacity: labelOptions.opacity,
                    style: labelOptions.style
                };
                if (options.type === 'logarithmic') {
                    if (options.logarithmBaseError) {
                        options.incidentOccured('E2104');
                        delete options.logarithmBaseError
                    }
                    that.calcInterval = function(value, prevValue) {
                        return utils.getLog(value / prevValue, options.logarithmBase)
                    }
                }
            },
            updateSize: function(clearAxis) {
                var that = this,
                    options = that.options,
                    direction = options.isHorizontal ? "horizontal" : "vertical";
                if (that.title && that._axisTitleGroup) {
                    options.incidentOccured('W2105', [direction]);
                    that._axisTitleGroup.remove();
                    that._axisTitleGroup = null
                }
                if (clearAxis && that._axisElementsGroup && that.labels) {
                    options.incidentOccured('W2106', [direction]);
                    that._axisElementsGroup.remove();
                    that._axisElementsGroup = null
                }
                that._setBoundingRect()
            },
            _updateTranslatorInterval: function() {
                var that = this,
                    i,
                    tickValues,
                    businessRange = that.translator.getBusinessRange();
                if (businessRange && businessRange.addRange && !that.options.categories) {
                    tickValues = that.getTickValues();
                    for (i = 0; i < tickValues.length - 1; i++)
                        businessRange.addRange({interval: mathAbs(tickValues[i] - tickValues[i + 1])})
                }
            },
            setTranslator: function(translator, orthogonalTranslator) {
                var that = this;
                var debug = DX.utils.debug;
                debug.assertParam(translator, 'translator was not passed');
                that.translator = translator;
                orthogonalTranslator && (that.orthogonalTranslator = orthogonalTranslator);
                that.resetTicks();
                that._updateTranslatorInterval()
            },
            resetTicks: function() {
                var that = this;
                that._tickValues = that._tickPositions = that._fullTickValues = that._fullTickPositions = null
            },
            setRange: function(range) {
                var debug = DX.utils.debug;
                debug.assertParam(range, 'range was not passed');
                var options = this.options;
                options.min = range.minVisible;
                options.max = range.maxVisible;
                options.categories = range.categories;
                options.stubData = range.stubData;
                this.resetTicks()
            },
            _drawAxis: function() {
                var that = this,
                    translator = that.translator,
                    options = that.options,
                    hasCategories = !!options.categories,
                    axisPosition = that.axisPosition,
                    p11,
                    p12,
                    p21,
                    p22;
                if (!options.visible)
                    return;
                p11 = translator.translateSpecialCase(CANVAS_POSITION_START);
                p21 = translator.translateSpecialCase(CANVAS_POSITION_END);
                if (options.isHorizontal)
                    p12 = p22 = axisPosition;
                else {
                    p12 = p11;
                    p22 = p21;
                    p11 = p21 = axisPosition
                }
                that.renderer.createLine(p11, p12, p21, p22, {
                    strokeWidth: options.width,
                    stroke: options.color,
                    strokeOpacity: options.opacity
                }).append(that._axisLineGroup)
            },
            _getOptimalRotationAngle: function(tick1, tick2, labelOptions) {
                var that = this,
                    translator = that.options.isHorizontal ? that.translator : that.orthogonalTranslator,
                    renderer = that.renderer,
                    outOfScreen = core.outOfScreen,
                    textOptions = that.textOptions,
                    svgElement1 = renderer.createText(formatLabel(tick1, labelOptions), outOfScreen.x + translator.translate(tick1), outOfScreen.y, textOptions).append(),
                    svgElement2 = renderer.createText(formatLabel(tick2, labelOptions), outOfScreen.x + translator.translate(tick2), outOfScreen.y, textOptions).append(),
                    bBox1 = svgElement1.getBBox(),
                    bBox2 = svgElement2.getBBox(),
                    angle = Math.asin((bBox1.height + labelOptions.minSpacing) / (bBox2.x - bBox1.x)) * 180 / Math.PI;
                svgElement1.remove();
                svgElement2.remove();
                return isNaN(angle) ? 90 : Math.ceil(angle)
            },
            _applyOptimalOverlappingBehavior: function(ticks, ticksOptions) {
                var that = this,
                    overlappingBehavior = that.overlappingBehavior,
                    isOverlapped = false,
                    rotationAngle = null,
                    mode = null,
                    options = $.extend({}, ticksOptions),
                    state = 'overlap';
                while (state !== 'end') {
                    isOverlapped = rotationAngle && rotationAngle !== 90 ? false : that.options.tickProvider.isOverlappedTicks(ticks, options);
                    state = nextState(isOverlapped ? state : null);
                    that.testAutoOverlappingState = state;
                    switch (state) {
                        case'stagger':
                            options.screenDelta *= AXIS_STAGGER_OVERLAPPING_KOEF;
                            mode = state;
                            break;
                        case'rotate':
                            rotationAngle = that._getOptimalRotationAngle(ticks[0], ticks[1], that.options.label);
                            that.testAutoOverlappingRotationAngle = rotationAngle;
                            options.screenDelta = ticksOptions.screenDelta;
                            options.textOptions.rotate = rotationAngle;
                            mode = state;
                            break
                    }
                }
                that.testAutoOverlappingOptions = options;
                overlappingBehavior.isOverlapped = isOverlapped;
                overlappingBehavior.mode = mode;
                overlappingBehavior.rotationAngle = rotationAngle
            },
            _getTicksOptions: function() {
                var that = this,
                    options = that.options,
                    translator = that.translator,
                    screenDelta = mathAbs(translator.translateSpecialCase(CANVAS_POSITION_START) - translator.translateSpecialCase(CANVAS_POSITION_END)),
                    min = options.min,
                    max = options.max,
                    digitPosition = utils.getSignificantDigitPosition(mathAbs(max - min) / screenDelta),
                    correctingValue,
                    getText = function() {
                        return ''
                    };
                if (utils.isNumber(min) && options.type !== 'logarithmic') {
                    min = utils.roundValue(options.min, digitPosition);
                    if (min < options.min) {
                        correctingValue = Math.pow(10, -digitPosition);
                        min = utils.applyPrecisionByMinDelta(min, correctingValue, min + correctingValue)
                    }
                    if (min > max)
                        min = options.min
                }
                if (!options.stubData)
                    getText = function(value) {
                        return formatLabel(value, options.label, {
                                min: min,
                                max: max
                            })
                    };
                return {
                        min: min,
                        max: max,
                        base: options.type === 'logarithmic' ? options.logarithmBase : undefined,
                        axisType: options.type,
                        dataType: options.dataType,
                        customTicks: $.isArray(options.categories) ? options.categories : that._tickValues,
                        useTicksAutoArrangement: false,
                        textOptions: that.textOptions,
                        getText: getText,
                        renderer: that.renderer,
                        textSpacing: options.label.minSpacing,
                        translator: translator,
                        tickInterval: options.stubData ? null : options.tickInterval,
                        screenDelta: screenDelta,
                        gridSpacingFactor: options.axisDivisionFactor,
                        isHorizontal: options.isHorizontal,
                        setTicksAtUnitBeginning: options.setTicksAtUnitBeginning,
                        incidentOccured: options.incidentOccured
                    }
            },
            getTickValues: function() {
                var that = this,
                    correctedScreenDelta,
                    options = that.options,
                    tickProvider = options.tickProvider,
                    labelOptions = options.label,
                    categories = options.categories,
                    ticksOptions = that._getTicksOptions();
                that._fullTickValues = that._tickValues = tickProvider.getTicks(ticksOptions);
                if ((isDateUtils(options.min) || isDateUtils(categories && categories[0])) && !that.hasLabelFormat && that._tickValues.length)
                    labelOptions.format = DX.formatHelper.getDateFormatByTicks(that._tickValues);
                that.overlappingBehavior = labelOptions.overlappingBehavior ? $.extend({}, labelOptions.overlappingBehavior) : null;
                if (that.overlappingBehavior) {
                    if (!options.isHorizontal && that.overlappingBehavior.mode !== 'ignore')
                        that.overlappingBehavior.mode = 'enlargeTickInterval';
                    ticksOptions.useTicksAutoArrangement = that.overlappingBehavior.mode !== 'ignore';
                    if (ticksOptions.useTicksAutoArrangement)
                        that._fullTickValues = that._tickValues = tickProvider.getCorrectedTicks(that._fullTickValues, ticksOptions);
                    if (that.overlappingBehavior.mode === 'auto') {
                        that.textOptions.rotate = 0;
                        that._applyOptimalOverlappingBehavior(that._fullTickValues, ticksOptions);
                        ticksOptions.useTicksAutoArrangement = that.overlappingBehavior.isOverlapped
                    }
                    if (that.overlappingBehavior.mode === 'rotate') {
                        that.textOptions.rotate = that.overlappingBehavior.rotationAngle;
                        if (!labelOptions.userAlignment)
                            that.textOptions.align = LEFT
                    }
                    else if (!labelOptions.userAlignment)
                        that.textOptions.align = labelOptions.alignment
                }
                if (ticksOptions.useTicksAutoArrangement) {
                    correctedScreenDelta = that._tickValues.length ? that.translator.translate(that._tickValues[that._tickValues.length - 1]) - that.translator.translate(that._tickValues[0]) : null;
                    if (correctedScreenDelta) {
                        ticksOptions.screenDelta = mathAbs(correctedScreenDelta);
                        ticksOptions.ticksCount = that._tickValues.length - 1
                    }
                    else
                        ticksOptions.ticksCount = that._tickValues.length;
                    if (that.overlappingBehavior && that.overlappingBehavior.mode === 'stagger')
                        ticksOptions.screenDelta *= AXIS_STAGGER_OVERLAPPING_KOEF;
                    ticksOptions.customTicks = that._tickValues;
                    that._tickValues = tickProvider.getTicks(ticksOptions)
                }
                that._testTKScreenDelta = ticksOptions.screenDelta;
                that._autoArrangementStep = that._tickValues.autoArrangementStep;
                that._useTicksAutoArrangement = ticksOptions.useTicksAutoArrangement;
                if (that.options.stubData) {
                    that._testSkippedFormattingAndOverlapping = true;
                    return that._tickValues
                }
                if (!$.isArray(categories))
                    that._fullTickValues = that._tickValues;
                return that._tickValues
            },
            setTickValues: function(tickValues) {
                this.resetTicks();
                this._fullTickValues = this._tickValues = tickValues
            },
            _prepareLabelsToDraw: function() {
                var that = this,
                    ticksValues = that.getTickValues(),
                    ticks = [],
                    i;
                if (ticksValues.hideLabels || that.options.stubData)
                    ticks.hideLabels = true;
                for (i = 0; i < ticksValues.length; i++)
                    ticks.push({
                        text: ticksValues[i],
                        pos: that.translator.translate(ticksValues[i])
                    });
                return ticks
            },
            _correctTicksPosition: function(ticks) {
                var that = this,
                    options = that.options,
                    tickDelta = that.translator.getInterval() / 2,
                    i;
                if (options.categories && (options.discreteAxisDivisionMode !== 'crossLabels' || !options.discreteAxisDivisionMode)) {
                    if (options.isHorizontal) {
                        if (!options.valueMarginsEnabled)
                            ticks = ticks.slice(0, ticks.length - 1)
                    }
                    else {
                        tickDelta = -tickDelta;
                        if (!options.valueMarginsEnabled)
                            ticks = ticks.slice(1, ticks.length)
                    }
                    for (i = 0; i < ticks.length; i++)
                        ticks[i].pos = ticks[i].pos + tickDelta
                }
                return ticks
            },
            _prepareFullTicksToDraw: function() {
                var that = this,
                    ticksValues = that._fullTickValues,
                    ticks = [],
                    i;
                if (!that._fullTickPositions) {
                    if (!ticksValues) {
                        that.getTickValues();
                        ticksValues = that._fullTickValues || []
                    }
                    for (i = 0; i < ticksValues.length; i++)
                        ticks.push({pos: that.translator.translate(ticksValues[i])});
                    that._fullTickPositions = that._correctTicksPosition(ticks)
                }
                return that._fullTickPositions
            },
            _drawTicks: function() {
                var that = this,
                    options = that.options,
                    ticksOptions = options.tick,
                    i,
                    axisPosition = that.axisPosition,
                    tickStart = axisPosition - 4,
                    tickEnd = axisPosition + 4,
                    tick,
                    ticksToDraw;
                if (!ticksOptions.visible)
                    return;
                var drawLine = function(p11, p12, p21, p22) {
                        that.renderer.createLine(p11, p12, p21, p22, {
                            strokeWidth: 1,
                            stroke: ticksOptions.color,
                            strokeOpacity: ticksOptions.opacity
                        }).append(that._axisLineGroup)
                    };
                ticksToDraw = that._prepareFullTicksToDraw();
                if (options.isHorizontal)
                    for (i = 0; i < ticksToDraw.length; i++) {
                        tick = ticksToDraw[i];
                        drawLine(tick.pos, tickStart, tick.pos, tickEnd)
                    }
                else
                    for (i = 0; i < ticksToDraw.length; i++) {
                        tick = ticksToDraw[i];
                        drawLine(tickStart, tick.pos, tickEnd, tick.pos)
                    }
            },
            setPercentLabelFormat: function() {
                var labelOptions = this.options.label;
                if (!this.hasLabelFormat)
                    labelOptions.format = 'percent'
            },
            resetAutoLabelFormat: function() {
                var labelOptions = this.options.label;
                if (!this.hasLabelFormat)
                    delete labelOptions.format
            },
            _drawLabels: function() {
                var that = this,
                    i,
                    options = that.options,
                    renderer = that.renderer,
                    axisPosition = that.axisPosition,
                    labelOptions = options.label,
                    labelOffset = labelOptions.indentFromAxis,
                    labelsToDraw,
                    labelPoint,
                    label,
                    labels = [],
                    createText = options.isHorizontal ? renderer.createText : function(text, y, x, textOptions) {
                        return this.createText(text, x, y, textOptions)
                    },
                    emptyStrRegExp = /^\s+$/,
                    currentLabelConst = options.position === TOP || options.position === LEFT ? axisPosition - labelOffset : axisPosition + labelOffset,
                    text;
                if (!labelOptions.visible || !that._axisElementsGroup)
                    return;
                labelsToDraw = that._prepareLabelsToDraw();
                if (labelsToDraw.length === 0 || labelsToDraw.hideLabels)
                    return true;
                for (i = 0; i < labelsToDraw.length; i++) {
                    labelPoint = labelsToDraw[i];
                    text = formatLabel(labelPoint.text, labelOptions, {
                        min: options.min,
                        max: options.max
                    });
                    if (isDefinedUtils(text) && text !== '' && !emptyStrRegExp.test(text)) {
                        label = createText.call(renderer, text, labelPoint.pos, currentLabelConst, that.textOptions);
                        labels.push(label);
                        label.append(that._axisElementsGroup);
                        label.data({argument: labelPoint.text})
                    }
                }
                that.labels = labels
            },
            getMultipleAxesSpacing: function() {
                return this.options.multipleAxesSpacing || 0
            },
            _drawTitle: function() {
                var that = this,
                    i,
                    options = that.options,
                    renderer = that.renderer,
                    axisPosition = that.axisPosition,
                    titleOptions = options.title,
                    title,
                    attr = {
                        font: titleOptions.font,
                        opacity: titleOptions.opacity,
                        align: CENTER,
                        'class': 'dx-chart-axis-title'
                    },
                    centerPosition = that.translator.translateSpecialCase(CANVAS_POSITION_PREFIX + CENTER),
                    x,
                    y;
                if (!titleOptions.text || !that._axisTitleGroup)
                    return;
                if (options.isHorizontal) {
                    x = centerPosition;
                    y = axisPosition
                }
                else {
                    if (options.position === LEFT)
                        attr.rotate = 270;
                    else
                        attr.rotate = 90;
                    x = axisPosition;
                    y = centerPosition
                }
                that.title = renderer.createText(titleOptions.text, x, y, attr).append(that._axisTitleGroup)
            },
            _drawGrid: function(borderOptions) {
                var that = this,
                    positionsToDraw,
                    options = that.options,
                    gridOptions = options.grid,
                    i;
                if (!gridOptions.visible)
                    return;
                borderOptions = borderOptions || {visible: false};
                var drawLine = function() {
                        var translator = that.translator,
                            orthogonalTranslator = that.orthogonalTranslator,
                            isHorizontal = options.isHorizontal,
                            canvasStart = isHorizontal ? LEFT : TOP,
                            canvasEnd = isHorizontal ? RIGHT : BOTTOM,
                            positionFrom = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_START),
                            positionTo = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_END),
                            firstBorderLinePosition = borderOptions.visible && borderOptions[canvasStart] ? translator.translateSpecialCase(CANVAS_POSITION_PREFIX + canvasStart) : undefined,
                            lastBorderLinePosition = borderOptions.visible && borderOptions[canvasEnd] ? translator.translateSpecialCase(CANVAS_POSITION_PREFIX + canvasEnd) : undefined;
                        return function(tick) {
                                if (mathAbs(tick.pos - firstBorderLinePosition) < MAX_GRID_BORDER_ADHENSION || mathAbs(tick.pos - lastBorderLinePosition) < MAX_GRID_BORDER_ADHENSION)
                                    return;
                                var p11 = tick.pos,
                                    p12 = positionFrom,
                                    p21 = tick.pos,
                                    p22 = positionTo;
                                if (!isHorizontal) {
                                    p11 = positionFrom;
                                    p12 = p22 = tick.pos;
                                    p21 = positionTo
                                }
                                that.renderer.createLine(p11, p12, p21, p22, {
                                    strokeWidth: gridOptions.width,
                                    stroke: gridOptions.color,
                                    strokeOpacity: gridOptions.opacity
                                }).append(that._axisGridGroup)
                            }
                    }();
                positionsToDraw = that._prepareFullTicksToDraw();
                for (i = 0; i < positionsToDraw.length; i++)
                    drawLine(positionsToDraw[i])
            },
            _drawConstantLine: function() {
                var that = this,
                    group = that._axisConstantLineGroup,
                    renderer = that.renderer,
                    options = that.options,
                    data = options.constantLines,
                    translator = that.translator,
                    orthogonalTranslator = that.orthogonalTranslator,
                    isHorizontal = options.isHorizontal,
                    i,
                    lines = [],
                    labels = [],
                    positionFrom = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_START),
                    positionTo = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_END),
                    canvasStart = translator.translateSpecialCase(CANVAS_POSITION_START),
                    canvasEnd = translator.translateSpecialCase(CANVAS_POSITION_END),
                    range = translator.getBusinessRange();
                var getPos = function(lineValue) {
                        var parsedValue = that.validateUnit(lineValue, "E2105", 'constantLine'),
                            value = translator.translate(parsedValue),
                            isContinous = !!(range.minVisible || range.maxVisible);
                        if (!isContinous && $.inArray(lineValue, range.categories || []) === -1 || !isDefinedUtils(value) || value < Math.min(canvasStart, canvasEnd) || value > Math.max(canvasStart, canvasEnd))
                            return {};
                        return {
                                value: value,
                                parsedValue: parsedValue
                            }
                    };
                var drawLinesAndLabels = function(lineOptions) {
                        if (lineOptions.value === undefined)
                            return;
                        var pos = getPos(lineOptions.value),
                            labelOptions = lineOptions.label || {},
                            value = pos.value,
                            line,
                            attr = {
                                stroke: lineOptions.color,
                                strokeWidth: lineOptions.width,
                                dashStyle: lineOptions.dashStyle
                            };
                        if (!isDefinedUtils(value)) {
                            lines.push(null);
                            if (labelOptions.visible)
                                labels.push(null);
                            return
                        }
                        line = isHorizontal ? renderer.createLine(value, positionTo, value, positionFrom, attr) : renderer.createLine(positionFrom, value, positionTo, value, attr);
                        lines.push(line.append(group));
                        if (labelOptions.visible)
                            labels.push(that._drawConstantLineLabels(pos.parsedValue, labelOptions, value, group));
                        else
                            labels.push(null)
                    };
                for (i = 0; i < data.length; i++)
                    drawLinesAndLabels(data[i]);
                that.constantLines = lines;
                that.constantLineLabels = labels
            },
            _checkAlignmentConstantLineLabels: function(labelOptions) {
                var options = this.options;
                labelOptions.verticalAlignment = (labelOptions.verticalAlignment || '').toLowerCase();
                labelOptions.horizontalAlignment = (labelOptions.horizontalAlignment || '').toLowerCase();
                if (options.isHorizontal && labelOptions.position === 'outside') {
                    labelOptions.verticalAlignment = labelOptions.verticalAlignment === BOTTOM ? BOTTOM : TOP;
                    labelOptions.horizontalAlignment = CENTER
                }
                if (options.isHorizontal && labelOptions.position === 'inside') {
                    labelOptions.verticalAlignment = labelOptions.verticalAlignment === CENTER ? CENTER : labelOptions.verticalAlignment === BOTTOM ? BOTTOM : TOP;
                    labelOptions.horizontalAlignment = labelOptions.horizontalAlignment === LEFT ? LEFT : RIGHT
                }
                if (!options.isHorizontal && labelOptions.position === 'outside') {
                    labelOptions.verticalAlignment = CENTER;
                    labelOptions.horizontalAlignment = labelOptions.horizontalAlignment === LEFT ? LEFT : RIGHT
                }
                if (!options.isHorizontal && labelOptions.position === 'inside') {
                    labelOptions.verticalAlignment = labelOptions.verticalAlignment === BOTTOM ? BOTTOM : TOP;
                    labelOptions.horizontalAlignment = labelOptions.horizontalAlignment === RIGHT ? RIGHT : labelOptions.horizontalAlignment === CENTER ? CENTER : LEFT
                }
            },
            _drawConstantLineLabels: function(parsedValue, lineLabelOptions, value, group) {
                var that = this,
                    text = lineLabelOptions.text,
                    orthogonalTranslator = that.orthogonalTranslator,
                    options = that.options,
                    labelOptions = options.label,
                    attr = {
                        align: CENTER,
                        font: $.extend({}, labelOptions.font, lineLabelOptions.font)
                    },
                    x,
                    y;
                that._checkAlignmentConstantLineLabels(lineLabelOptions);
                text = isDefinedUtils(text) ? text : formatLabel(parsedValue, labelOptions);
                if (options.isHorizontal) {
                    x = value;
                    switch (lineLabelOptions.horizontalAlignment) {
                        case LEFT:
                            attr.align = RIGHT;
                            break;
                        case RIGHT:
                            attr.align = LEFT;
                            break
                    }
                    y = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + lineLabelOptions.verticalAlignment)
                }
                else {
                    y = value;
                    x = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + lineLabelOptions.horizontalAlignment);
                    switch (lineLabelOptions.horizontalAlignment) {
                        case LEFT:
                            attr.align = lineLabelOptions.position === 'inside' ? LEFT : RIGHT;
                            break;
                        case CENTER:
                            attr.align = CENTER;
                            break;
                        case RIGHT:
                            attr.align = lineLabelOptions.position === 'inside' ? RIGHT : LEFT;
                            break
                    }
                }
                return that.renderer.createText(text, x, y, attr).append(group)
            },
            _adjustConstantLineLabels: function() {
                var that = this,
                    options = that.options,
                    isHorizontal = options.isHorizontal,
                    lines = that.constantLines,
                    labels = that.constantLineLabels,
                    label,
                    line,
                    lineBox,
                    linesOptions,
                    labelOptions,
                    box,
                    x,
                    y,
                    i,
                    padding = isHorizontal ? {
                        top: 0,
                        bottom: 0
                    } : {
                        left: 0,
                        right: 0
                    };
                if (labels === undefined && lines === undefined)
                    return;
                for (i = 0; i < labels.length; i++) {
                    x = y = 0;
                    linesOptions = options.constantLines[i];
                    labelOptions = linesOptions.label;
                    label = labels[i];
                    if (label !== null) {
                        line = lines[i];
                        box = label.getBBox();
                        lineBox = line.getBBox();
                        if (isHorizontal)
                            if (labelOptions.position === 'inside') {
                                switch (labelOptions.horizontalAlignment) {
                                    case LEFT:
                                        x -= linesOptions.paddingLeftRight;
                                        break;
                                    default:
                                        x += linesOptions.paddingLeftRight;
                                        break
                                }
                                switch (labelOptions.verticalAlignment) {
                                    case CENTER:
                                        y += lineBox.y + lineBox.height / 2 - box.y - box.height / 2;
                                        break;
                                    case BOTTOM:
                                        y -= linesOptions.paddingTopBottom;
                                        break;
                                    default:
                                        y += linesOptions.paddingTopBottom + box.height;
                                        break
                                }
                            }
                            else
                                switch (labelOptions.verticalAlignment) {
                                    case BOTTOM:
                                        y += box.height + linesOptions.paddingTopBottom - (box.y + box.height - that.orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + labelOptions.verticalAlignment));
                                        if (padding[BOTTOM] < box.height + linesOptions.paddingTopBottom)
                                            padding[BOTTOM] = box.height + linesOptions.paddingTopBottom;
                                        break;
                                    default:
                                        y -= linesOptions.paddingTopBottom;
                                        if (padding[TOP] < linesOptions.paddingTopBottom + box.height)
                                            padding[TOP] = linesOptions.paddingTopBottom + box.height;
                                        break
                                }
                        else if (labelOptions.position === 'inside') {
                            switch (labelOptions.horizontalAlignment) {
                                case CENTER:
                                    x += lineBox.x + lineBox.width / 2 - box.x - box.width / 2;
                                    break;
                                case RIGHT:
                                    x -= linesOptions.paddingLeftRight;
                                    break;
                                default:
                                    x += linesOptions.paddingLeftRight;
                                    break
                            }
                            switch (labelOptions.verticalAlignment) {
                                case BOTTOM:
                                    y += lineBox.y - box.y + linesOptions.paddingTopBottom;
                                    break;
                                default:
                                    y -= linesOptions.paddingTopBottom;
                                    break
                            }
                        }
                        else {
                            y += lineBox.y + lineBox.height / 2 - box.y - box.height / 2;
                            switch (labelOptions.horizontalAlignment) {
                                case RIGHT:
                                    x += linesOptions.paddingLeftRight;
                                    if (padding[RIGHT] < linesOptions.paddingLeftRight + box.width)
                                        padding[RIGHT] = linesOptions.paddingLeftRight + box.width;
                                    break;
                                default:
                                    x -= linesOptions.paddingLeftRight;
                                    if (padding[LEFT] < linesOptions.paddingLeftRight + box.width)
                                        padding[LEFT] = linesOptions.paddingLeftRight + box.width;
                                    break
                            }
                        }
                        label.move(x, y)
                    }
                }
                that.padding = padding
            },
            _drawStrip: function() {
                var that = this,
                    renderer = that.renderer,
                    options = that.options,
                    stripData = options.strips,
                    translator = that.translator,
                    orthogonalTranslator = that.orthogonalTranslator,
                    range = translator.getBusinessRange(),
                    i,
                    stripLabels = [],
                    stripRects = [],
                    rect,
                    isHorizontal = options.isHorizontal,
                    stripOptions,
                    positionFrom,
                    positionTo,
                    stripPos,
                    stripLabelOptions,
                    attr;
                if (options.stubData)
                    return;
                var getPos = function(startV, endV) {
                        var isContinous = !!(range.minVisible || range.maxVisible),
                            cateories = range.categories || [],
                            start = translator.translate(that.validateUnit(startV, "E2105", "strip")),
                            end = translator.translate(that.validateUnit(endV, "E2105", "strip")),
                            canvasStart = translator.translateSpecialCase(CANVAS_POSITION_START),
                            canvasEnd = translator.translateSpecialCase(CANVAS_POSITION_END),
                            min = range.minVisible;
                        if (!isContinous && ($.inArray(startV, cateories) === -1 || $.inArray(endV, cateories) === -1))
                            return {
                                    stripFrom: 0,
                                    stripTo: 0
                                };
                        if (!isDefinedUtils(start) && isContinous)
                            start = startV < min ? canvasStart : canvasEnd;
                        if (!isDefinedUtils(end) && isContinous)
                            end = endV < min ? canvasStart : canvasEnd;
                        return start < end ? {
                                stripFrom: start,
                                stripTo: end
                            } : {
                                stripFrom: end,
                                stripTo: start
                            }
                    };
                positionFrom = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_START);
                positionTo = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_END);
                for (i = 0; i < stripData.length; i++) {
                    stripOptions = stripData[i];
                    stripLabelOptions = stripOptions.label || {};
                    attr = {fill: stripOptions.color};
                    if (stripOptions.startValue !== undefined && stripOptions.endValue !== undefined && stripOptions.color !== undefined) {
                        stripPos = getPos(stripOptions.startValue, stripOptions.endValue);
                        if (stripPos.stripTo - stripPos.stripFrom === 0 || !stripPos.stripTo && stripPos.stripTo !== 0 || !stripPos.stripFrom && stripPos.stripFrom !== 0) {
                            stripRects.push(null);
                            if (stripLabelOptions.text)
                                stripLabels.push(null);
                            continue
                        }
                        rect = isHorizontal ? renderer.createRect(stripPos.stripFrom, Math.min(positionFrom, positionTo), stripPos.stripTo - stripPos.stripFrom, mathAbs(positionFrom - positionTo), 0, attr) : renderer.createRect(Math.min(positionFrom, positionTo), stripPos.stripFrom, mathAbs(positionFrom - positionTo), stripPos.stripTo - stripPos.stripFrom, 0, attr);
                        stripRects.push(rect.append(that._axisStripGroup));
                        if (stripLabelOptions.text)
                            stripLabels.push(that._drawStripLabel(stripLabelOptions, stripPos.stripFrom, stripPos.stripTo));
                        else
                            stripLabels.push(null)
                    }
                }
                that.stripLabels = stripLabels;
                that.stripRects = stripRects
            },
            _drawStripLabel: function(stripLabelOptions, stripFrom, stripTo) {
                var that = this,
                    orthogonalTranslator = that.orthogonalTranslator,
                    options = that.options,
                    isHorizontal = options.isHorizontal,
                    attr = {
                        align: isHorizontal ? CENTER : LEFT,
                        font: $.extend({}, options.label.font, stripLabelOptions.font)
                    },
                    x,
                    y;
                if (isHorizontal) {
                    if (stripLabelOptions.horizontalAlignment === CENTER) {
                        x = stripFrom + (stripTo - stripFrom) / 2;
                        attr.align = CENTER
                    }
                    else if (stripLabelOptions.horizontalAlignment === LEFT) {
                        x = stripFrom;
                        attr.align = LEFT
                    }
                    else if (stripLabelOptions.horizontalAlignment === RIGHT) {
                        x = stripTo;
                        attr.align = RIGHT
                    }
                    y = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + stripLabelOptions.verticalAlignment)
                }
                else {
                    x = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + stripLabelOptions.horizontalAlignment);
                    attr.align = stripLabelOptions.horizontalAlignment;
                    if (stripLabelOptions.verticalAlignment === TOP)
                        y = stripFrom;
                    else if (stripLabelOptions.verticalAlignment === CENTER)
                        y = stripTo + (stripFrom - stripTo) / 2;
                    else if (stripLabelOptions.verticalAlignment === BOTTOM)
                        y = stripTo
                }
                return that.renderer.createText(stripLabelOptions.text, x, y, attr).append(that._axisLableGroup)
            },
            _initAxisPositions: function() {
                var that = this,
                    position = that.options.position,
                    delta = 0;
                if (that.delta)
                    delta = that.delta[position] || 0;
                that.axisPosition = that.orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + position) + delta
            },
            _adjustLabels: function() {
                var that = this,
                    options = that.options,
                    isHorizontal = options.isHorizontal,
                    position = options.position,
                    labels = that.labels,
                    label,
                    labelHeight,
                    isNeedLabelAdjustment,
                    staggeringSpacing,
                    i,
                    xt,
                    shift = that.padding && that.padding[position] || 0,
                    boxAxis = that._axisElementsGroup && that._axisElementsGroup.getBBox() || {},
                    box;
                if (!options.label.visible || !labels || !labels.length)
                    return;
                for (i = 0; i < labels.length; i++) {
                    label = labels[i];
                    box = label.getBBox();
                    if (isHorizontal && position === BOTTOM)
                        label.applySettings({y: 2 * label.settings.y - box.y + shift});
                    else if (!isHorizontal) {
                        if (position === LEFT)
                            if (that.textOptions.align === RIGHT)
                                xt = box.x + box.width - shift;
                            else if (that.textOptions.align === CENTER)
                                xt = box.x + box.width / 2 - shift - (boxAxis.width / 2 || 0);
                            else
                                xt = box.x - shift - (boxAxis.width || 0);
                        else if (that.textOptions.align === CENTER)
                            xt = box.x + box.width / 2 + (boxAxis.width / 2 || 0) + shift;
                        else if (that.textOptions.align === RIGHT)
                            xt = box.x + box.width + (boxAxis.width || 0) + shift;
                        else
                            xt = box.x + shift;
                        label.applySettings({
                            x: xt,
                            y: label.settings.y + ~~(label.settings.y - box.y - box.height / 2)
                        })
                    }
                    else if (isHorizontal && position === TOP)
                        label.applySettings({y: 2 * label.settings.y - box.y - box.height - shift})
                }
                isNeedLabelAdjustment = isHorizontal && that.overlappingBehavior && that.overlappingBehavior.mode === 'stagger';
                that._testIsNeedLabelAdjustment = isNeedLabelAdjustment;
                if (isNeedLabelAdjustment) {
                    labelHeight = 0;
                    for (i = 0; i < labels.length; i = i + 2) {
                        label = labels[i];
                        box = label.getBBox();
                        if (box.height > labelHeight)
                            labelHeight = box.height
                    }
                    staggeringSpacing = that.overlappingBehavior.staggeringSpacing;
                    that._testStaggeringSpacing = staggeringSpacing;
                    labelHeight = Math.round(labelHeight) + staggeringSpacing;
                    for (i = 1; i < labels.length; i = i + 2) {
                        label = labels[i];
                        if (position === BOTTOM)
                            label.move(0, labelHeight);
                        else if (position === TOP)
                            label.move(0, -labelHeight)
                    }
                    for (i = 0; i < labels.length; i++)
                        labels[i].rotate(0)
                }
            },
            _adjustStripLabels: function() {
                var that = this,
                    labelOptions,
                    labels = that.stripLabels,
                    rects = that.stripRects,
                    label,
                    i,
                    box,
                    rectBox,
                    stripOptions,
                    x,
                    y;
                if (labels === undefined && rects === undefined)
                    return;
                for (i = 0; i < labels.length; i++) {
                    x = y = 0;
                    stripOptions = that.options.strips[i];
                    labelOptions = stripOptions.label;
                    label = labels[i];
                    if (label !== null) {
                        box = label.getBBox();
                        rectBox = rects[i].getBBox();
                        if (labelOptions.horizontalAlignment === LEFT)
                            x += stripOptions.paddingLeftRight;
                        else if (labelOptions.horizontalAlignment === RIGHT)
                            x -= stripOptions.paddingLeftRight;
                        if (labelOptions.verticalAlignment === TOP)
                            y += rectBox.y - box.y + stripOptions.paddingTopBottom;
                        else if (labelOptions.verticalAlignment === CENTER)
                            y += rectBox.y + rectBox.height / 2 - box.y - box.height / 2;
                        else if (labelOptions.verticalAlignment === BOTTOM)
                            y -= stripOptions.paddingTopBottom;
                        label.move(x, y)
                    }
                }
            },
            _adjustTitle: function() {
                var that = this,
                    options = that.options,
                    position = options.position,
                    title = that.title,
                    margin = options.title.margin,
                    boxGroup,
                    boxTitle;
                if (!title || !that._axisElementsGroup)
                    return;
                boxTitle = title.getBBox();
                boxGroup = that._axisElementsGroup.getBBox();
                if (options.isHorizontal)
                    if (position === BOTTOM)
                        title.applySettings({
                            y: boxGroup.isEmpty ? undefined : boxGroup.y + boxGroup.height,
                            translateY: margin + boxTitle.height
                        });
                    else
                        title.applySettings({
                            y: boxGroup.isEmpty ? undefined : boxGroup.y,
                            translateY: -margin
                        });
                else if (position === LEFT)
                    title.applySettings({
                        x: boxGroup.isEmpty ? undefined : boxGroup.x,
                        translateX: -margin
                    });
                else
                    title.applySettings({
                        x: boxGroup.isEmpty ? undefined : boxGroup.x + boxGroup.width,
                        translateX: margin
                    })
            },
            draw: function(externalOptions, adjustAxis) {
                var that = this,
                    options = that.options,
                    isHorizontal = options.isHorizontal,
                    cssClass = isHorizontal ? 'dxc-h-axis' : 'dxc-v-axis',
                    stripClass = isHorizontal ? 'dxc-h-strips' : 'dxc-v-strips',
                    constantLineClass = isHorizontal ? 'dxc-h-constant-lines' : 'dxc-v-constant-lines';
                externalOptions = externalOptions || {};
                var debug = DX.utils.debug;
                debug.assertParam(this.translator, 'translator was not set before Draw call');
                if (that._axisGroup) {
                    that._axisGroup.detach();
                    that._axisStripGroup.detach();
                    that._axisLableGroup.detach();
                    that._axisConstantLineGroup.detach();
                    that._axisTitleGroup ? that._axisTitleGroup.clear() : !adjustAxis && (that._axisTitleGroup = that.renderer.createGroup({'class': 'dxc-title'}).append(that._axisGroup));
                    that._axisGridGroup.clear();
                    that._axisElementsGroup ? that._axisElementsGroup.clear() : !adjustAxis && (that._axisElementsGroup = that.renderer.createGroup({'class': 'dxc-elements'}).append(that._axisGroup));
                    that._axisLineGroup.clear();
                    that._axisStripGroup.clear();
                    that._axisConstantLineGroup.clear();
                    that._axisLableGroup.clear()
                }
                else {
                    that._axisGroup = that.renderer.createGroup({
                        'class': cssClass,
                        clipId: that.clipRectID
                    });
                    that._axisStripGroup = that.renderer.createGroup({'class': stripClass});
                    that._axisGridGroup = that.renderer.createGroup({'class': 'dxc-grid'}).append(that._axisGroup);
                    that._axisElementsGroup = that.renderer.createGroup({'class': 'dxc-elements'}).append(that._axisGroup);
                    that._axisLineGroup = that.renderer.createGroup({'class': 'dxc-line'}).append(that._axisGroup);
                    that._axisTitleGroup = that.renderer.createGroup({'class': 'dxc-title'}).append(that._axisGroup);
                    that._axisConstantLineGroup = that.renderer.createGroup({'class': constantLineClass});
                    that._axisLableGroup = that.renderer.createGroup({'class': 'dxc-axis-labels'})
                }
                that._initAxisPositions();
                if (!that._virtual) {
                    that._drawAxis();
                    that._drawTicks();
                    that._drawLabels();
                    that._drawTitle()
                }
                if (options.strips)
                    that._drawStrip();
                if (options.constantLines)
                    that._drawConstantLine();
                that._drawGrid(externalOptions.borderOptions);
                that._axisStripGroup.append(that.stripsGroup);
                that._axisConstantLineGroup.append(that.constantLinesGroup);
                that._axisGroup.append(that.axesContainerGroup);
                that._axisLableGroup.append(that.labelAxesGroup);
                that._adjustConstantLineLabels();
                that._adjustLabels();
                that._adjustStripLabels();
                that._adjustTitle();
                that._setBoundingRect()
            },
            _setBoundingRect: function() {
                var that = this,
                    options = that.options,
                    axisBox = that._axisElementsGroup ? that._axisElementsGroup.getBBox() : {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        isEmpty: true
                    },
                    lineBox = that._axisLineGroup.getBBox(),
                    placeholderSize = options.placeholderSize,
                    start,
                    isHorizontal = options.isHorizontal,
                    coord = isHorizontal && 'y' || 'x',
                    side = isHorizontal && 'height' || 'width',
                    axisTitleBox = that.title && that._axisTitleGroup ? that._axisTitleGroup.getBBox() : axisBox;
                if (axisBox.isEmpty && axisTitleBox.isEmpty && !placeholderSize) {
                    that.boundingRect = axisBox;
                    return
                }
                start = lineBox[coord] || that.axisPosition;
                if (options.position === (isHorizontal && BOTTOM || RIGHT)) {
                    axisBox[side] = placeholderSize || axisTitleBox[coord] + axisTitleBox[side] - start;
                    axisBox[coord] = start
                }
                else {
                    axisBox[side] = placeholderSize || lineBox[side] + start - axisTitleBox[coord];
                    axisBox[coord] = axisTitleBox.isEmpty ? start : axisTitleBox[coord]
                }
                that.boundingRect = axisBox
            },
            getBoundingRect: function() {
                return this._axisElementsGroup ? this.boundingRect : {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    }
            },
            shift: function(x, y) {
                var settings = {};
                if (x)
                    settings.translateX = x;
                if (y)
                    settings.translateY = y;
                this._axisGroup.applySettings(settings)
            },
            applyClipRect: function(clipId) {
                this._axisStripGroup.applySettings({clipId: clipId})
            },
            validate: function(isArgumentAxis, incidentOccured) {
                var that = this,
                    options = that.options,
                    range = options.range,
                    parseUtils = new core.ParseUtils,
                    dataType = isArgumentAxis ? options.argumentType : options.valueType,
                    parser = dataType ? parseUtils.getParser(dataType, 'axis') : function(unit) {
                        return unit
                    };
                that.parser = parser;
                that.incidentOccured = incidentOccured;
                options.dataType = dataType;
                if (options.min)
                    options.min = that.validateUnit(options.min, "E2106");
                if (options.max)
                    options.max = that.validateUnit(options.max, "E2106");
                if (range.min)
                    range.min = that.validateUnit(range.min);
                if (range.max)
                    range.max = that.validateUnit(range.max)
            },
            validateUnit: function(unit, idError, parameters) {
                var that = this,
                    dataType = that.options.dataType;
                unit = that.parser(unit);
                if (unit === undefined && idError)
                    that.incidentOccured(idError, [parameters]);
                return unit
            },
            adjustZoomValues: function(min, max) {
                var that = this,
                    range = that.options.range;
                min = that.validateUnit(min);
                max = that.validateUnit(max);
                if (range && isDefinedUtils(range.min)) {
                    min = isDefinedUtils(min) ? range.min < min ? min : range.min : min;
                    max = isDefinedUtils(max) ? range.min < max ? max : range.min : max
                }
                if (range && isDefinedUtils(range.max)) {
                    max = isDefinedUtils(max) ? range.max > max ? max : range.max : max;
                    min = isDefinedUtils(min) ? range.max > min ? min : range.max : min
                }
                that.minRangeArg = min;
                that.maxRangeArg = max;
                return {
                        min: min,
                        max: max
                    }
            },
            getRangeData: function() {
                var that = this,
                    options = that.options,
                    optionsRange = options.range,
                    range = {},
                    min,
                    max;
                var addValueMarginToRange = function(prefix) {
                        if (options.valueMarginsEnabled) {
                            if (isDefinedUtils(options[prefix])) {
                                range[prefix] = options[prefix];
                                range[prefix + 'Priority'] = AXIS_VALUE_MARGIN_PRIORITY
                            }
                        }
                        else {
                            range[prefix] = 0;
                            range[prefix + 'Priority'] = AXIS_VALUE_MARGIN_PRIORITY
                        }
                    };
                if (isDefinedUtils(optionsRange.min) && isDefinedUtils(optionsRange.max)) {
                    min = optionsRange.min < optionsRange.max ? optionsRange.min : optionsRange.max;
                    max = optionsRange.max > optionsRange.min ? optionsRange.max : optionsRange.min
                }
                else {
                    min = optionsRange.min;
                    max = optionsRange.max
                }
                range.min = min;
                range.max = max;
                addValueMarginToRange('minValueMargin');
                addValueMarginToRange('maxValueMargin');
                range.stick = !options.valueMarginsEnabled;
                range.categories = optionsRange.categories;
                range.dataType = options.dataType;
                range.axisType = options.type;
                if (range.axisType === 'logarithmic')
                    range.base = options.logarithmBase;
                if (options.isHorizontal) {
                    range.minVisible = isDefinedUtils(that.minRangeArg) ? that.minRangeArg : optionsRange.min;
                    range.maxVisible = isDefinedUtils(that.maxRangeArg) ? that.maxRangeArg : optionsRange.max;
                    range.invert = options.inverted
                }
                else {
                    range.minVisible = optionsRange.min;
                    range.maxVisible = optionsRange.max;
                    range.invert = options.inverted || options.type === 'discrete' && options.oppositeDirectionYAxis
                }
                return range
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-charts, file baseChart.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            charts = DX.viz.charts,
            utils = DX.utils,
            TRACKER_RENDERING_DELAY = 1200,
            resizeRedrawOptions = {
                animate: false,
                isResize: true
            },
            ACTIONS_BY_PRIORITY = ['reinit', '_reinitDataSource', '_handleDataSourceChanged', 'force_render'],
            core = DX.viz.core,
            DEFAULT_ANIMATION_OPTIONS = {
                asyncSeriesRendering: true,
                asyncTrackersRendering: true,
                trackerRenderingDelay: TRACKER_RENDERING_DELAY
            };
        charts.BaseChart = core.BaseWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    done: $.noop,
                    drawn: $.noop,
                    seriesClick: null,
                    pointClick: null,
                    legendClick: null,
                    argumentAxisClick: null,
                    seriesHover: null,
                    pointHover: null,
                    seriesSelected: null,
                    pointSelected: null,
                    seriesSelectionChanged: null,
                    pointSelectionChanged: null,
                    seriesHoverChanged: null,
                    pointHoverChanged: null
                })
            },
            _createThemeManager: function() {
                return charts.factory.createThemeManager(this.option())
            },
            _init: function() {
                this.__TRACKER_RENDERING_DELAY = TRACKER_RENDERING_DELAY;
                var that = this;
                that.callBase();
                that.themeManager = this._createThemeManager();
                that._initRenderer();
                that.canvasClipRect = that.renderer.createClipRect();
                that._createHtmlStructure();
                that._needHandleRenderComplete = true;
                that.layoutManager = charts.factory.createChartLayoutManager(that.themeManager.getOptions("adaptiveLayout"));
                that._reinit();
                that._element().css({webkitUserSelect: 'none'}).on('contextmenu', function(event) {
                    that.eventType = 'contextmenu';
                    if (ui.events.isTouchEvent(event) || ui.events.isPointerEvent(event))
                        event.preventDefault()
                }).on('MSHoldVisual', function(event) {
                    that.eventType = 'MSHoldVisual';
                    event.preventDefault()
                })
            },
            _reinit: function() {
                var that = this;
                that.layoutManager.update(that);
                that._createTracker();
                that._reinitDataSource()
            },
            _createHtmlStructure: function() {
                var that = this,
                    renderer = that.renderer;
                that._panesBackgroundGroup = renderer.createGroup({'class': 'dxc-background'});
                that._titleGroup = renderer.createGroup({'class': 'dxc-title'});
                that._legendGroup = renderer.createGroup({
                    'class': 'dxc-legend',
                    clipId: that._getCanvasClipRectID()
                });
                that._stripsGroup = renderer.createGroup({'class': 'dxc-strips-group'});
                that._constantLinesGroup = renderer.createGroup({'class': 'dxc-constant-lines-group'});
                that._axesGroup = renderer.createGroup({'class': 'dxc-axes-group'});
                that._panesBorderGroup = renderer.createGroup({'class': 'dxc-border'});
                that._labelAxesGroup = renderer.createGroup({'class': 'dxc-strips-labels-group'});
                that._seriesGroup = renderer.createGroup({'class': 'dxc-series-group'});
                that._labelsGroup = renderer.createGroup({'class': 'dxc-labels-group'});
                that._tooltipGroup = renderer.createGroup({'class': 'dxc-tooltip'});
                that._trackerGroup = renderer.createGroup({
                    'class': 'dxc-trackers',
                    opacity: 0.0001,
                    stroke: "gray",
                    fill: "gray"
                });
                that._crosshairTrackerGroup = renderer.createGroup({
                    'class': 'dxc-crosshair-trackers',
                    stroke: 'none',
                    fill: 'grey'
                }).append(that._trackerGroup);
                that._seriesTrackerGroup = renderer.createGroup({'class': 'dxc-series-trackers'}).append(that._trackerGroup);
                that._markerTrackerGroup = renderer.createGroup({
                    'class': 'dxc-markers-trackers',
                    stroke: 'none',
                    fill: 'grey'
                }).append(that._trackerGroup);
                that._crossHairCursorGroup = renderer.createGroup({'class': 'dxc-crosshair-cursor'})
            },
            _cleanHtmlStructure: function() {
                var that = this;
                that._panesBackgroundGroup && that._panesBackgroundGroup.clear();
                that._titleGroup && that._titleGroup.clear();
                that._legendGroup && (that._legendGroup.detach(), that._legendGroup.clear());
                that._stripsGroup && (that._stripsGroup.detach(), that._stripsGroup.clear());
                that._constantLinesGroup && (that._constantLinesGroup.detach(), that._constantLinesGroup.clear());
                that._axesGroup && (that._axesGroup.detach(), that._axesGroup.clear());
                that._labelAxesGroup && (that._labelAxesGroup.detach(), that._labelAxesGroup.clear());
                that._seriesGroup && (that._seriesGroup.detach(), that._seriesGroup.clear());
                that._labelsGroup && (that._labelsGroup.detach(), that._labelsGroup.clear());
                that._trackerGroup && (that._trackerGroup.detach(), that._seriesTrackerGroup.clear(), that._markerTrackerGroup.clear(), that._crosshairTrackerGroup.clear());
                that._panesBorderGroup && that._panesBorderGroup.clear();
                that._tooltipGroup && that._tooltipGroup.clear();
                that._crossHairCursorGroup && (that._crossHairCursorGroup.clear(), that._crossHairCursorGroup.detach())
            },
            _disposeObjectsInArray: function(propName, fieldNames) {
                $.each(this[propName] || [], function(_, item) {
                    if (fieldNames && item)
                        $.each(fieldNames, function(_, field) {
                            item[field] && item[field].dispose()
                        });
                    else
                        item && item.dispose()
                });
                this[propName] = null
            },
            _dispose: function() {
                var that = this,
                    disposeObject = function(propName) {
                        that[propName] && that[propName].dispose(),
                        that[propName] = null
                    },
                    detachGroup = function(groupName) {
                        that[groupName] && that[groupName].detach()
                    },
                    disposeObjectsInArray = this._disposeObjectsInArray;
                clearTimeout(that.delayedRedraw);
                that.callBase();
                disposeObjectsInArray.call(that, "businessRanges", ["arg", "val"]);
                that.translators = null;
                disposeObjectsInArray.call(that, "series");
                disposeObject("layoutManager");
                disposeObject("themeManager");
                disposeObject("renderer");
                disposeObject("tracker");
                disposeObject("tooltip");
                disposeObject("chartTitle");
                that.paneAxis = null;
                that._userOptions = null;
                that.dirtyCanvas = null;
                that.canvas = null;
                detachGroup("_legendGroup");
                detachGroup("_stripsGroup");
                detachGroup("_constantLinesGroup");
                detachGroup("_axesGroup");
                detachGroup("_labelAxesGroup");
                detachGroup("_seriesGroup");
                detachGroup("_labelsGroup");
                detachGroup("_trackerGroup");
                detachGroup("_crossHairCursorGroup");
                disposeObject("canvasClipRect");
                disposeObject("_panesBackgroundGroup");
                disposeObject("_titleGroup");
                disposeObject("_legendGroup");
                disposeObject("_stripsGroup");
                disposeObject("_constantLinesGroup");
                disposeObject("_axesGroup");
                disposeObject("_labelAxesGroup");
                disposeObject("_panesBorderGroup");
                disposeObject("_seriesGroup");
                disposeObject("_labelsGroup");
                disposeObject("_tooltipGroup");
                disposeObject("_crossHairCursorGroup");
                disposeObject("_seriesTrackerGroup");
                disposeObject("_markerTrackerGroup");
                disposeObject("_crosshairTrackerGroup");
                disposeObject("_trackerGroup");
                that._disposeLoadIndicator()
            },
            _clean: function _clean(hideLoadIndicator) {
                this.renderer && this.renderer.stopAllAnimations();
                hideLoadIndicator && this.hideLoadingIndicator();
                this._cleanHtmlStructure();
                this.callBase();
                this._saveDirtyCanvas()
            },
            _getAnimationOptions: function() {
                return $.extend({}, DEFAULT_ANIMATION_OPTIONS, this.themeManager.getOptions("animation"))
            },
            _initRenderer: function _initRenderer() {
                if (this.renderer)
                    return;
                this.renderer = core.CoreFactory.createRenderer({
                    animation: this._getAnimationOptions(),
                    cssClass: 'dxc dxc-chart',
                    pathModified: this.option('pathModified'),
                    rtl: this.themeManager.getOptions('rtlEnabled')
                })
            },
            _initSeries: function() {
                this.series = this.series || this._populateSeries()
            },
            _reinitDataSource: function() {
                this._refreshDataSource()
            },
            _saveDirtyCanvas: function() {
                this.dirtyCanvas = $.extend({}, this.canvas)
            },
            _resize: function() {
                this._render(resizeRedrawOptions)
            },
            _calculateCanvas: function() {
                var canvas = this.themeManager.getOptions('size'),
                    result = {},
                    container = this._element();
                if (!utils.isDefined(canvas.width))
                    result.width = container.width() || 400;
                else
                    result.width = canvas.width < 0 ? 0 : canvas.width;
                if (!utils.isDefined(canvas.height))
                    result.height = container.height() || 400;
                else
                    result.height = canvas.height < 0 ? 0 : canvas.height;
                return $.extend({}, result, this.themeManager.getOptions('margin'))
            },
            _createTracker: function() {
                var that = this,
                    tooltipOptions = that.themeManager.getOptions('tooltip') || {};
                if (that.tracker)
                    that.tracker.dispose();
                that.tracker = charts.factory.createTracker({
                    series: that.series,
                    valueAxis: that._valueAxes,
                    argumentAxis: that._argumentAxes,
                    seriesSelectionMode: that.themeManager.getOptions('seriesSelectionMode'),
                    pointSelectionMode: that.themeManager.getOptions('pointSelectionMode'),
                    tooltipShown: that.option('tooltipShown'),
                    tooltipHidden: that.option('tooltipHidden'),
                    markerTrackerGroup: that._markerTrackerGroup,
                    crossHairOptions: that._crossHairOptions,
                    seriesTrackerGroup: that._seriesTrackerGroup,
                    seriesGroup: that._seriesGroup,
                    tooltipEnabled: tooltipOptions.enabled,
                    renderer: that.renderer,
                    events: {
                        seriesClick: that.option('seriesClick'),
                        pointClick: that.option('pointClick'),
                        argumentAxisClick: that.option('argumentAxisClick'),
                        seriesHover: that.option('seriesHover'),
                        seriesSelected: that.option('seriesSelected'),
                        pointHover: that.option('pointHover'),
                        pointSelected: that.option('pointSelected'),
                        legendClick: that.option('legendClick'),
                        seriesSelectionChanged: that.option('seriesSelectionChanged'),
                        pointSelectionChanged: that.option('pointSelectionChanged'),
                        seriesHoverChanged: that.option('seriesHoverChanged'),
                        pointHoverChanged: that.option('pointHoverChanged')
                    }
                })
            },
            _updateTracker: function() {
                var that = this;
                if (!that.tracker)
                    that._createTracker();
                else
                    that.tracker._reinit({
                        series: that.series,
                        valueAxis: that._valueAxes,
                        argumentAxis: that._argumentAxes,
                        legendGroup: that.legend.getTrackerGroup(),
                        legendCallback: $.proxy(that.legend.getActionCallback, that.legend)
                    })
            },
            _render: function(drawOptions) {
                this._optionsInitializing = false;
                var that = this,
                    renderer = that.renderer,
                    updatedCanvas = that.canvas,
                    container = this._element(),
                    currentDirtyCanvas = that._calculateCanvas(),
                    oldDirtyCanvas = that.dirtyCanvas;
                drawOptions = drawOptions || {recreateCanvas: true};
                drawOptions.recreateCanvas = drawOptions.recreateCanvas || !renderer.isInitialized();
                if (!drawOptions.force && oldDirtyCanvas && oldDirtyCanvas.width === currentDirtyCanvas.width && oldDirtyCanvas.height === currentDirtyCanvas.height && !that.hiddenContainer) {
                    that.stopRedraw = true;
                    return
                }
                clearTimeout(that.delayedRedraw);
                if (drawOptions.recreateCanvas)
                    that.canvas = updatedCanvas = that._calculateCanvas();
                if (updatedCanvas.width && updatedCanvas.height && container.is(':visible'))
                    that.hiddenContainer = false;
                else {
                    that._incidentOccured('W2001', [that.NAME]);
                    that.hiddenContainer = true;
                    that.stopRedraw = true;
                    renderer.detachContainer();
                    return
                }
                if (drawOptions.recreateCanvas) {
                    renderer.recreateCanvas(that.canvas.width, that.canvas.height);
                    renderer.draw(that._element()[0]);
                    that._reappendLoadIndicator();
                    that._updateLoadIndicator(undefined, updatedCanvas.width, updatedCanvas.height);
                    that._updateCanvasClipRect()
                }
                that.renderer.stopAllAnimations(true);
                that.layoutManager.update(that);
                that._cleanGroups(drawOptions);
                that._saveDirtyCanvas()
            },
            _cleanGroups: function(drawOptions) {
                var that = this;
                that._stripsGroup.detach();
                that._constantLinesGroup.detach();
                that._axesGroup.detach();
                that._labelAxesGroup.detach();
                that._labelsGroup.detach();
                that._tooltipGroup.detach();
                that._crossHairCursorGroup.detach();
                if (!drawOptions || drawOptions.drawLegend) {
                    that._legendGroup.detach();
                    that._legendGroup.clear()
                }
                if (!drawOptions || drawOptions.drawTitle) {
                    that._titleGroup.detach();
                    that._titleGroup.clear()
                }
                that._stripsGroup.clear();
                that._constantLinesGroup.clear();
                that._axesGroup.clear();
                that._labelAxesGroup.clear();
                that._labelsGroup.clear();
                that._tooltipGroup.clear();
                that._crossHairCursorGroup.clear();
                that._crosshairTrackerGroup.clear()
            },
            _drawTitle: function() {
                var that = this,
                    options = that.themeManager.getOptions("title"),
                    width = that.canvas.width - that.canvas.left - that.canvas.right;
                options._incidentOccured = that._incidentOccured;
                if (that.chartTitle)
                    that.chartTitle.update(options, width);
                else
                    that.chartTitle = charts.factory.createTitle(that.renderer, options, width, that._titleGroup)
            },
            _createTooltip: function() {
                var that = this,
                    tooltipOptions = $.extend(true, {
                        canvasWidth: that.canvas.width,
                        canvasHeight: that.canvas.height
                    }, that.themeManager.getOptions('tooltip') || {}),
                    tooltipCoords,
                    point = this.tracker.pointAtShownTooltip;
                if (!$.isFunction(tooltipOptions.customizeText) && utils.isDefined(tooltipOptions.customizeText)) {
                    that._incidentOccured("E2103", ['customizeText']);
                    tooltipOptions.customizeText = undefined
                }
                if (that.tooltip)
                    that.tooltip.update(tooltipOptions);
                else
                    that.tooltip = core.CoreFactory.createTooltip(tooltipOptions, that._tooltipGroup, that.renderer);
                that.tracker.setTooltip(that.tooltip);
                if (point) {
                    tooltipCoords = point.getTooltipCoords();
                    that.tooltip.move(~~tooltipCoords.x, ~~tooltipCoords.y, tooltipCoords.offset);
                    that.tooltip.show()
                }
            },
            _prepareDrawOptions: function(drawOptions) {
                var animationOptions = this._getAnimationOptions(),
                    options;
                options = $.extend({}, {
                    force: false,
                    adjustAxes: true,
                    drawLegend: true,
                    drawTitle: true,
                    adjustSeriesLabels: true,
                    animate: animationOptions.enabled,
                    animationPointsLimit: animationOptions.maxPointCountSupported,
                    asyncSeriesRendering: animationOptions.asyncSeriesRendering,
                    asyncTrackersRendering: animationOptions.asyncTrackersRendering,
                    trackerRenderingDelay: animationOptions.trackerRenderingDelay
                }, drawOptions);
                if (!utils.isDefined(options.recreateCanvas))
                    options.recreateCanvas = options.adjustAxes && options.drawLegend && options.drawTitle;
                return options
            },
            _processRefreshData: function(newRefreshAction) {
                var currentRefreshActionPosition = $.inArray(this._currentRefreshData, ACTIONS_BY_PRIORITY),
                    newRefreshActionPosition = $.inArray(newRefreshAction, ACTIONS_BY_PRIORITY);
                if (!this._currentRefreshData || currentRefreshActionPosition >= 0 && newRefreshActionPosition < currentRefreshActionPosition)
                    this._currentRefreshData = newRefreshAction
            },
            _disposeSeries: function() {
                var that = this;
                that.tracker._clean();
                $.each(that.series || [], function(_, series) {
                    series.dispose()
                });
                that.series = null;
                $.each(that.seriesFamilies || [], function(_, family) {
                    family.dispose()
                });
                that.seriesFamilies = null
            },
            _optionChanged: function(name) {
                var that = this,
                    themeManager = this.themeManager;
                themeManager.resetOptions(name);
                themeManager.update(that._options);
                if (name === 'animation') {
                    that.renderer.updateAnimationOptions(this._getAnimationOptions());
                    return
                }
                clearTimeout(that.delayedRedraw);
                switch (name) {
                    case'dataSource':
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('_reinitDataSource');
                        break;
                    case'palette':
                        that.themeManager.updatePalette(this.option(name));
                        that._disposeSeries();
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('_handleDataSourceChanged');
                        break;
                    case'series':
                    case'commonSeriesSettings':
                    case'containerBackgroundColor':
                    case'dataPrepareSettings':
                        that._disposeSeries();
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('_handleDataSourceChanged');
                        break;
                    case'legend':
                    case'seriesTemplate':
                        that._processRefreshData('_handleDataSourceChanged');
                        break;
                    case'title':
                        that._processRefreshData('force_render');
                        break;
                    case'valueAxis':
                    case'argumentAxis':
                    case'commonAxisSettings':
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('reinit');
                        that._disposeSeries();
                        that.paneAxis = {};
                        break;
                    case'panes':
                    case'defaultPane':
                        that._disposeSeries();
                        that.paneAxis = {};
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('reinit');
                        break;
                    case'size':
                        that._processRefreshData('force_render');
                        break;
                    case'rotated':
                    case'equalBarWidth':
                    case'customizePoint':
                    case'customizeLabel':
                        that._disposeSeries();
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('reinit');
                        break;
                    case'theme':
                        that._disposeSeries();
                        themeManager.setTheme(that.option(name));
                        that._processRefreshData('reinit');
                        break;
                    default:
                        that._processRefreshData('reinit')
                }
                that.callBase.apply(that, arguments)
            },
            _getLoadIndicatorOption: function() {
                return this.themeManager.getOptions("loadingIndicator")
            },
            _refresh: function() {
                var that = this;
                this.renderer.stopAllAnimations(true);
                if (that._currentRefreshData) {
                    switch (that._currentRefreshData) {
                        case'force_render':
                            that._render({force: true});
                            break;
                        case'reinit':
                            that._reinit(true);
                            break;
                        default:
                            that[that._currentRefreshData] && that[that._currentRefreshData]()
                    }
                    delete that._currentRefreshData
                }
                else
                    that._render({force: true})
            },
            _dataSourceOptions: function() {
                return {
                        paginate: false,
                        _preferSync: true
                    }
            },
            _updateCanvasClipRect: function(canvas) {
                var that = this,
                    width,
                    height;
                canvas = canvas || that.canvas;
                width = Math.max(canvas.width - canvas.left - canvas.right, 0);
                height = Math.max(canvas.height - canvas.top - canvas.bottom, 0);
                that.canvasClipRect.updateRectangle({
                    x: canvas.left,
                    y: canvas.top,
                    width: width,
                    height: height
                });
                that.canvasClipRect.append()
            },
            _getCanvasClipRectID: function() {
                return this.canvasClipRect.id
            },
            _handleDataSourceChanged: function() {
                clearTimeout(this.delayedRedraw);
                this._dataSpecificInit(true)
            },
            _groupSeries: function() {
                this._groupedSeries = [this.series]
            },
            _dataSpecificInit: function(needRedraw) {
                this._initSeries();
                this._repopulateSeries();
                this._handleSeriesPopulated(needRedraw)
            },
            _processSingleSeries: function(){},
            _repopulateSeries: function() {
                var that = this,
                    parsedData,
                    data = that._dataSource && that._dataSource.items(),
                    dataValidatorOptions = that.themeManager.getOptions('dataPrepareSettings'),
                    seriesTemplate = that.themeManager.getOptions('seriesTemplate');
                if (that._dataSource && seriesTemplate) {
                    that._templatedSeries = utils.processSeriesTemplate(seriesTemplate, that._dataSource.items());
                    that._populateSeries();
                    delete that._templatedSeries;
                    data = that.teamplateData || data
                }
                that._groupSeries();
                that._dataValidator = charts.factory.createDataValidator(data, that._groupedSeries, that._incidentOccured, dataValidatorOptions);
                parsedData = that._dataValidator.validate();
                that.themeManager.resetPalette();
                $.each(that.series, function(_, singleSeries) {
                    singleSeries.updateData(parsedData);
                    that._processSingleSeries(singleSeries)
                })
            },
            _handleRenderComplete: function() {
                var that = this,
                    userHandle = this.option('done'),
                    allSeriesInited = true;
                if (that._needHandleRenderComplete) {
                    $.each(that.series, function(_, s) {
                        allSeriesInited = allSeriesInited && s.canRenderCompleteHandle()
                    });
                    if (allSeriesInited) {
                        that._needHandleRenderComplete = false;
                        $.isFunction(userHandle) && userHandle.call(that)
                    }
                }
            },
            _renderTitleAndLegend: function(drawOptions, legendHasInsidePosition) {
                var that = this,
                    titleOptions = that.themeManager.getOptions("title"),
                    drawTitle = titleOptions.text && drawOptions.drawTitle,
                    drawLegend = drawOptions.drawLegend && that.legend && !legendHasInsidePosition,
                    drawElements = [];
                if (drawTitle) {
                    that._titleGroup.append();
                    that._drawTitle();
                    drawElements.push(that.chartTitle)
                }
                if (drawLegend) {
                    that._legendGroup.append();
                    drawElements.push(that.legend)
                }
                drawElements.length && that.layoutManager.drawElements(drawElements, that.canvas);
                if (drawTitle)
                    that.layoutManager.correctSizeElement(that.chartTitle, that.canvas)
            },
            getAllSeries: function getAllSeries() {
                return this.series.slice()
            },
            getSeriesByName: function getSeriesByName(name) {
                var found = null;
                $.each(this.series, function(i, singleSeries) {
                    if (singleSeries.name === name) {
                        found = singleSeries;
                        return false
                    }
                });
                return found
            },
            getSeriesByPos: function getSeriesByPos(pos) {
                return this.series[pos]
            },
            getSelectedSeries: function getSelectedSeries() {
                return null
            },
            clearSelection: function clearSelection() {
                this.tracker.clearSelection()
            },
            hideTooltip: function() {
                this.tracker._hideTooltip()
            },
            showLoadingIndicator: function() {
                this._showLoadIndicator(this.themeManager.getOptions("loadingIndicator"), this.canvas || {})
            },
            render: function(renderOptions) {
                this._render(renderOptions)
            },
            getSize: function() {
                var canvas = this.canvas || {};
                return {
                        width: canvas.width,
                        height: canvas.height
                    }
            }
        }).include(ui.DataHelperMixin)
    })(jQuery, DevExpress);
    /*! Module viz-charts, file chart.js */
    (function($, DX, undefined) {
        var core = DX.viz.core,
            charts = DX.viz.charts,
            utils = DX.utils,
            MAX_ADJUSTMENT_ATTEMPTS = 5,
            DEFAULT_PANE_NAME = 'default',
            DEFAULT_AXIS_NAME = 'defaultAxisName',
            DEFAULT_BUSINESS_RANGE_VALUE_MARGIN = 0.1,
            ASYNC_SERIES_RENDERING_DELAY = 25,
            _each = $.each;
        function prepareAxis(axisOptions) {
            return $.isArray(axisOptions) ? axisOptions.length === 0 ? [{}] : axisOptions : [axisOptions]
        }
        charts.Chart = charts.BaseChart.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    defaultPane: DEFAULT_PANE_NAME,
                    panes: [{
                            name: DEFAULT_PANE_NAME,
                            border: {}
                        }]
                })
            },
            _dispose: function() {
                var that = this,
                    disposeObjectsInArray = this._disposeObjectsInArray;
                that.callBase();
                that.panes = null;
                that.legend && (that.legend.dispose(), that.legend = null);
                disposeObjectsInArray.call(that, "panesBackground");
                disposeObjectsInArray.call(that, "panesClipRects");
                disposeObjectsInArray.call(that, "financialPanesClipRects");
                disposeObjectsInArray.call(that, "_argumentAxes");
                disposeObjectsInArray.call(that, "_valueAxes");
                disposeObjectsInArray.call(that, "seriesFamilies");
                _each(that._paneTrackerGroups || [], function(_, groups) {
                    groups.paneSeriesGroup.dispose();
                    groups.paneMarkerGroup.dispose()
                });
                that._paneTrackerGroups = null
            },
            _init: function() {
                this.__ASYNC_SERIES_RENDERING_DELAY = ASYNC_SERIES_RENDERING_DELAY;
                this.paneAxis = {};
                this._crossHairOptions = {};
                this.callBase()
            },
            _reinit: function(needRedraw) {
                var that = this;
                that.translators = {};
                that.panes = that._createPanes();
                that._populateAxes();
                that.callBase();
                delete that._seriesInitializing;
                if (!that.series)
                    that._dataSpecificInit();
                else
                    that._correctValueAxes();
                that._endLoading(function() {
                    needRedraw && that._render({force: true})
                })
            },
            _correctBusinessRange: function(range, tickInterval, setTicksAtUnitBeginning) {
                var min = 'min',
                    max = 'max';
                if (!tickInterval || !utils.isDefined(range[min]) || !utils.isDefined(range[max]))
                    return false;
                var tickIntervalRange = {},
                    originInterval = tickInterval;
                tickInterval = $.isNumeric(tickInterval) ? tickInterval : utils.convertDateTickIntervalToMilliseconds(tickInterval);
                if (tickInterval >= Math.abs(range[max] - range[min])) {
                    if (utils.isDate(range[min])) {
                        if (!$.isNumeric(originInterval)) {
                            tickIntervalRange[min] = utils.addInterval(range[min], originInterval, true);
                            tickIntervalRange[max] = utils.addInterval(range[max], originInterval, false)
                        }
                        else {
                            tickIntervalRange[min] = new Date(range[min].valueOf() - tickInterval);
                            tickIntervalRange[max] = new Date(range[max].valueOf() + tickInterval)
                        }
                        if (setTicksAtUnitBeginning) {
                            utils.correctDateWithUnitBeginning(tickIntervalRange[max], originInterval);
                            utils.correctDateWithUnitBeginning(tickIntervalRange[min], originInterval)
                        }
                    }
                    else {
                        tickIntervalRange[min] = range[min] - tickInterval;
                        tickIntervalRange[max] = range[max] + tickInterval
                    }
                    range.addRange(tickIntervalRange);
                    return true
                }
                return false
            },
            _seriesVisibilityChanged: function() {
                this._processSeriesFamilies();
                this._populateBusinessRange();
                this.renderer.stopAllAnimations(true);
                this._render({
                    force: true,
                    asyncSeriesRendering: false,
                    asyncTrackersRendering: false
                })
            },
            _populateBusinessRange: function(visibleArea) {
                var that = this,
                    businessRanges = [],
                    aggregationRange,
                    minBound,
                    maxBound,
                    i,
                    themeManager = that.themeManager,
                    rotated = themeManager.getOptions('rotated'),
                    singleSeriesRange,
                    valAxes = that._valueAxes,
                    valueAxes = {},
                    argAxes = that._argumentAxes,
                    useAggregation = themeManager.getOptions('useAggregation'),
                    argumentTickInterval,
                    setTicksAtUnitBeginning,
                    paneAxis = that.paneAxis,
                    groupedSeries = that._groupedSeries;
                that._disposeObjectsInArray("businessRanges", ["arg", "val"]);
                var argRange = new core.Range({
                        rotated: !!rotated,
                        minValueMargin: DEFAULT_BUSINESS_RANGE_VALUE_MARGIN,
                        maxValueMargin: DEFAULT_BUSINESS_RANGE_VALUE_MARGIN
                    });
                _each(valAxes, function(_, axis) {
                    valueAxes[axis.name] = axis
                });
                _each(paneAxis, function(paneName, pane) {
                    _each(pane, function(axisName, _) {
                        var seriesForRange = [],
                            firstSeriesForRange,
                            options,
                            valueAxesForRange,
                            valRange = new core.Range({
                                isValueRange: true,
                                rotated: !!rotated,
                                pane: paneName,
                                axis: axisName,
                                minValueMargin: DEFAULT_BUSINESS_RANGE_VALUE_MARGIN,
                                maxValueMargin: DEFAULT_BUSINESS_RANGE_VALUE_MARGIN
                            }),
                            valueType,
                            calcInterval;
                        _each(groupedSeries, function(_, particularSeriesGroup) {
                            if (particularSeriesGroup[0].pane === paneName && particularSeriesGroup[0].axis === axisName)
                                seriesForRange = particularSeriesGroup
                        });
                        _each(valAxes, function(_, axis) {
                            if (axis.pane === paneName && axis.name === axisName) {
                                valueAxesForRange = axis;
                                return false
                            }
                        });
                        firstSeriesForRange = seriesForRange && seriesForRange.length ? seriesForRange[0] : {};
                        _each(argAxes, function(_, axis) {
                            var options = axis.options;
                            options.type = firstSeriesForRange.argumentAxisType || options.type;
                            options.argumentType = firstSeriesForRange.argumentType || options.argumentType;
                            axis.validate(true, that._incidentOccured);
                            argRange = argRange.addRange(axis.getRangeData());
                            argumentTickInterval = options.tickInterval;
                            setTicksAtUnitBeginning = options.setTicksAtUnitBeginning;
                            calcInterval = axis.calcInterval
                        });
                        options = valueAxesForRange.options;
                        options.type = firstSeriesForRange.valueAxisType || options.type;
                        options.valueType = firstSeriesForRange.valueType || options.valueType;
                        valueAxesForRange.validate(false, that._incidentOccured);
                        var axisRange = new core.Range(valueAxesForRange.getRangeData());
                        valueType = valueType || options.valueType === 'datetime' ? 'datetime' : undefined;
                        valRange = valRange.addRange(axisRange);
                        minBound = valRange.min;
                        maxBound = valRange.max;
                        for (i = 0; i < seriesForRange.length; i++) {
                            if (visibleArea) {
                                visibleArea.minVal = minBound;
                                visibleArea.maxVal = maxBound;
                                if (useAggregation && !visibleArea.adjustOnZoom) {
                                    aggregationRange = seriesForRange[i]._originalBusinessRange;
                                    visibleArea.minVal = utils.isDefined(visibleArea.minVal) ? visibleArea.minVal : aggregationRange.val.min;
                                    visibleArea.maxVal = utils.isDefined(visibleArea.maxVal) ? visibleArea.maxVal : aggregationRange.val.max
                                }
                            }
                            singleSeriesRange = seriesForRange[i].getRangeData(visibleArea, calcInterval);
                            valRange = valRange.addRange(singleSeriesRange.val);
                            argRange = argRange.addRange(singleSeriesRange.arg)
                        }
                        if (!valRange.isDefined())
                            valRange.setStubData(valueType);
                        businessRanges.push({val: valRange})
                    })
                });
                if (!argRange.isDefined())
                    argRange.setStubData(argAxes[0].options.argumentType);
                var bussinesRangeCorrectedWithTickInterval = that._correctBusinessRange(argRange, argumentTickInterval, setTicksAtUnitBeginning);
                !bussinesRangeCorrectedWithTickInterval && argRange.applyValueMargins();
                _each(businessRanges, function(_, item) {
                    var range = item.val,
                        vAxis = valueAxes[range.axis];
                    range.applyValueMargins();
                    if (vAxis && vAxis.options.showZero)
                        range.correctValueZeroLevel();
                    item.arg = argRange
                });
                that.businessRanges = businessRanges
            },
            _groupSeries: function() {
                var that = this,
                    panes = that.panes,
                    valAxes = that._valueAxes,
                    paneList = $.map(panes, function(pane) {
                        return pane.name
                    }),
                    series = that.series,
                    paneAxis = that.paneAxis,
                    groupedSeries = that._groupedSeries = [];
                var getFirstAxisNameForPane = function(axes, paneName) {
                        var result;
                        for (var i = 0; i < axes.length; i++)
                            if (axes[i].pane === paneName) {
                                result = axes[i].name;
                                break
                            }
                        if (!result)
                            result = valAxes[0].name;
                        return result
                    };
                _each(series, function(i, particularSeries) {
                    particularSeries.axis = particularSeries.axis || getFirstAxisNameForPane(valAxes, particularSeries.pane);
                    if (particularSeries.axis) {
                        paneAxis[particularSeries.pane] = paneAxis[particularSeries.pane] || {};
                        paneAxis[particularSeries.pane][particularSeries.axis] = true
                    }
                });
                _each(valAxes, function(_, axis) {
                    if (axis.name && axis.pane && $.inArray(axis.pane, paneList) != -1) {
                        paneAxis[axis.pane] = paneAxis[axis.pane] || {};
                        paneAxis[axis.pane][axis.name] = true
                    }
                });
                that._correctValueAxes();
                var hideGridsOnNonFirstValueAxisForPane = function(paneName) {
                        var axesForPane = [],
                            firstShownAxis;
                        _each(valAxes, function(_, axis) {
                            if (axis.pane === paneName)
                                axesForPane.push(axis)
                        });
                        if (axesForPane.length > 1 && that.themeManager.getOptions('synchronizeMultiAxes'))
                            _each(axesForPane, function(_, axis) {
                                var gridOpt = axis.options.grid;
                                if (firstShownAxis && gridOpt && gridOpt.visible)
                                    gridOpt.visible = false;
                                else
                                    firstShownAxis = firstShownAxis ? firstShownAxis : gridOpt && gridOpt.visible
                            })
                    };
                _each(paneAxis, function(paneName, pane) {
                    hideGridsOnNonFirstValueAxisForPane(paneName);
                    _each(pane, function(axisName, _) {
                        var group = [];
                        _each(series, function(_, particularSeries) {
                            if (particularSeries.pane === paneName && particularSeries.axis === axisName)
                                group.push(particularSeries)
                        });
                        group.length && groupedSeries.push(group)
                    })
                })
            },
            _cleanPanesClipRects: function(clipArrayName) {
                var that = this,
                    clipArray = that[clipArrayName];
                _each(clipArray || [], function(_, clipRect) {
                    clipRect && clipRect.remove()
                });
                that[clipArrayName] = []
            },
            _createPanes: function() {
                var that = this,
                    panes = that.option('panes'),
                    panesNameCounter = 0,
                    bottomPaneName;
                if (panes && utils.isArray(panes) && !panes.length || $.isEmptyObject(panes))
                    panes = that.initialOption("panes");
                that._cleanPanesClipRects('panesClipRects');
                that._cleanPanesClipRects('financialPanesClipRects');
                that.defaultPane = that.option('defaultPane');
                panes = $.isArray(panes) ? panes : panes ? [panes] : [];
                _each(panes, function(_, pane) {
                    pane.name = !utils.isDefined(pane.name) ? DEFAULT_PANE_NAME + panesNameCounter++ : pane.name
                });
                if (!that._doesPaneExists(panes, that.defaultPane) && panes.length > 0) {
                    bottomPaneName = panes[panes.length - 1].name;
                    that._incidentOccured('W2101', [that.defaultPane, bottomPaneName]);
                    that.defaultPane = bottomPaneName
                }
                panes = that.themeManager.getOptions('rotated') ? panes.reverse() : panes;
                return panes
            },
            _doesPaneExists: function(panes, paneName) {
                var found = false;
                _each(panes, function(_, pane) {
                    if (pane.name === paneName) {
                        found = true;
                        return false
                    }
                });
                return found
            },
            _populateSeries: function() {
                var that = this,
                    themeManager = that.themeManager,
                    hasSeriesTemplate = !!themeManager.getOptions('seriesTemplate'),
                    series = hasSeriesTemplate ? that._templatedSeries : that.option('series'),
                    allSeriesOptions = $.isArray(series) ? series : series ? [series] : [],
                    argumentAxisOptions = that.option('argumentAxis'),
                    valueAxisOptions = that.option('valueAxis'),
                    data,
                    particularSeriesOptions,
                    particularSeries,
                    rotated = themeManager.getOptions('rotated'),
                    i,
                    paneList = $.map(that.panes, function(pane) {
                        return pane.name
                    }),
                    paneName,
                    paneIndex;
                that.teamplateData = [];
                _each(that._paneTrackerGroups || [], function(_, groups) {
                    groups.paneSeriesGroup.remove();
                    groups.paneMarkerGroup.remove()
                });
                that._paneTrackerGroups = [];
                _each(that.panes, function(_, pane) {
                    var paneSeriesTrackerGroup = that.renderer.createGroup({'class': 'dxc-pane-tracker'}),
                        paneMarkerTrackerGroup = that.renderer.createGroup({'class': 'dxc-pane-tracker'});
                    that._paneTrackerGroups.push({
                        paneSeriesGroup: paneSeriesTrackerGroup,
                        paneMarkerGroup: paneMarkerTrackerGroup
                    })
                });
                that._disposeSeries();
                that.series = [];
                themeManager.resetPalette();
                for (i = 0; i < allSeriesOptions.length; i++) {
                    particularSeriesOptions = $.extend(true, {}, allSeriesOptions[i]);
                    if (particularSeriesOptions.type && !utils.isString(particularSeriesOptions.type))
                        particularSeriesOptions.type = '';
                    data = particularSeriesOptions.data;
                    particularSeriesOptions.data = null;
                    particularSeriesOptions.rotated = rotated;
                    particularSeriesOptions.customizePoint = themeManager.getOptions("customizePoint");
                    particularSeriesOptions.customizeLabel = themeManager.getOptions("customizeLabel");
                    particularSeriesOptions.visibilityChanged = $.proxy(this._seriesVisibilityChanged, this);
                    particularSeriesOptions.resolveLabelsOverlapping = themeManager.getOptions("resolveLabelsOverlapping");
                    if (argumentAxisOptions) {
                        particularSeriesOptions.argumentCategories = argumentAxisOptions.categories;
                        particularSeriesOptions.argumentAxisType = argumentAxisOptions.type;
                        particularSeriesOptions.argumentType = argumentAxisOptions.argumentType
                    }
                    if (valueAxisOptions)
                        if (utils.isArray(valueAxisOptions))
                            _each(valueAxisOptions, function(iter, options) {
                                if (!particularSeriesOptions.axis && !iter || particularSeriesOptions.axis === options.name) {
                                    particularSeriesOptions.valueCategories = options.categories;
                                    particularSeriesOptions.valueAxisType = options.type;
                                    particularSeriesOptions.valueType = options.valueType;
                                    particularSeriesOptions.showZero = options.showZero
                                }
                            });
                        else {
                            particularSeriesOptions.valueCategories = valueAxisOptions.categories;
                            particularSeriesOptions.valueAxisType = valueAxisOptions.type;
                            particularSeriesOptions.valueType = valueAxisOptions.valueType;
                            particularSeriesOptions.showZero = valueAxisOptions.showZero
                        }
                    particularSeriesOptions.incidentOccured = that._incidentOccured;
                    if (!particularSeriesOptions.name)
                        particularSeriesOptions.name = 'Series ' + (i + 1).toString();
                    var seriesTheme = themeManager.getOptions("series", particularSeriesOptions);
                    seriesTheme.pane = seriesTheme.pane || that.defaultPane;
                    paneName = seriesTheme.pane;
                    paneIndex = that._getPaneIndex(paneName);
                    if ($.inArray(paneName, paneList) === -1)
                        continue;
                    seriesTheme.seriesGroup = that._seriesGroup;
                    seriesTheme.labelsGroup = that._labelsGroup;
                    seriesTheme.trackersGroup = that._paneTrackerGroups[paneIndex].paneSeriesGroup;
                    seriesTheme.markerTrackerGroup = that._paneTrackerGroups[paneIndex].paneMarkerGroup;
                    particularSeries = core.CoreFactory.createSeries(that.renderer, seriesTheme);
                    if (!particularSeries.isUpdated)
                        that._incidentOccured("E2101", [seriesTheme.type]);
                    else {
                        particularSeries.index = i;
                        that.series.push(particularSeries)
                    }
                    if (hasSeriesTemplate) {
                        _each(data, function(_, data) {
                            _each(particularSeries.getTeamplatedFields(), function(_, field) {
                                data[field.teamplateField] = data[field.originalField]
                            });
                            that.teamplateData.push(data)
                        });
                        particularSeries.updateTeamplateFieldNames()
                    }
                }
                return that.series
            },
            _createValueAxis: function(axisOptions, rotated, tickProvider) {
                var that = this,
                    axis;
                axisOptions = that.themeManager.getOptions("valueAxis", $.extend({
                    isHorizontal: rotated,
                    tickProvider: tickProvider,
                    incidentOccured: that._incidentOccured
                }, axisOptions), rotated);
                if (axisOptions.strips)
                    _each(axisOptions.strips, function(i, strips) {
                        axisOptions.strips[i] = $.extend(true, {}, axisOptions.stripStyle, axisOptions.strips[i])
                    });
                if (axisOptions.constantLines)
                    _each(axisOptions.constantLines, function(i, line) {
                        axisOptions.constantLines[i] = $.extend(true, {}, axisOptions.constantLineStyle, line)
                    });
                axis = charts.factory.createAxis(that.renderer, axisOptions);
                axis.name = axisOptions.name;
                axis.pane = axis.pane || axisOptions.pane;
                axis.priority = axisOptions.priority;
                return axis
            },
            _disposeAxes: function() {
                var that = this;
                _each(that._valueAxes || [], function(_, axis) {
                    axis.dispose()
                });
                _each(that._argumentAxes || [], function(_, axis) {
                    axis.dispose()
                });
                that._valueAxes = null;
                that._argumentAxes = null
            },
            _populateAxes: function() {
                var that = this,
                    valueAxes = [],
                    argumentAxes = [],
                    panes = that.panes,
                    themeManager = that.themeManager,
                    rotated = themeManager.getOptions('rotated'),
                    valueAxisOptions = that.option('valueAxis') || {},
                    argumentOption = that.option('argumentAxis') || {},
                    argumentAxesOptions = prepareAxis(argumentOption),
                    valueAxesOptions = prepareAxis(valueAxisOptions),
                    axis,
                    axisNames = [],
                    tickProvider = core.CoreFactory.getTickProvider(),
                    paneWithNonVirtualAxis;
                that._disposeAxes();
                var createArgumentAxis = function(axisOptions, virtual) {
                        axisOptions = that.themeManager.getOptions("argumentAxis", $.extend(true, {
                            isHorizontal: !rotated,
                            tickProvider: tickProvider,
                            pane: that.defaultPane,
                            incidentOccured: that._incidentOccured
                        }, axisOptions), rotated);
                        if (axisOptions.strips)
                            _each(axisOptions.strips, function(i, strips) {
                                axisOptions.strips[i] = $.extend(true, {}, axisOptions.stripStyle, axisOptions.strips[i])
                            });
                        if (axisOptions.constantLines)
                            _each(axisOptions.constantLines, function(i, line) {
                                axisOptions.constantLines[i] = $.extend(true, {}, axisOptions.constantLineStyle, line)
                            });
                        axis = charts.factory.createAxis(that.renderer, axisOptions);
                        axis._virtual = virtual;
                        argumentAxes.push(axis);
                        return axis
                    };
                if (rotated)
                    paneWithNonVirtualAxis = argumentAxesOptions[0].position === 'right' ? panes[panes.length - 1].name : panes[0].name;
                else
                    paneWithNonVirtualAxis = argumentAxesOptions[0].position === 'top' ? panes[0].name : panes[panes.length - 1].name;
                _each(panes, function(_, pane) {
                    var paneName = pane.name,
                        virtual = paneName != paneWithNonVirtualAxis;
                    var axisOptions = $.extend(true, {}, argumentAxesOptions[0], {pane: paneName});
                    createArgumentAxis(axisOptions, virtual)
                });
                var valueAxesCounter = 0;
                var getNextAxisName = function() {
                        return DEFAULT_AXIS_NAME + valueAxesCounter++
                    };
                var unique = function(array) {
                        var values = {},
                            i,
                            len = array.length;
                        for (i = 0; i < len; i++)
                            values[array[i]] = true;
                        return $.map(values, function(_, key) {
                                return key
                            })
                    };
                _each(valueAxesOptions, function(priority, axisOptions) {
                    var axisPanes = [],
                        name = axisOptions.name;
                    if (name && $.inArray(name, axisNames) != -1) {
                        that._incidentOccured("E2102");
                        return
                    }
                    name && axisNames.push(name);
                    if (axisOptions.pane)
                        axisPanes.push(axisOptions.pane);
                    if (axisOptions.panes && axisOptions.panes.length)
                        axisPanes = axisPanes.concat(axisOptions.panes.slice(0));
                    axisPanes = unique(axisPanes);
                    if (!axisPanes.length)
                        axisPanes.push(undefined);
                    _each(axisPanes, function(_, pane) {
                        valueAxes.push(that._createValueAxis($.extend(true, {}, axisOptions, {
                            name: name || getNextAxisName(),
                            pane: pane,
                            priority: priority
                        }), rotated, tickProvider))
                    })
                });
                that._valueAxes = valueAxes;
                that._argumentAxes = argumentAxes
            },
            _correctValueAxes: function() {
                var that = this,
                    rotated = that.themeManager.getOptions('rotated'),
                    valueAxisOptions = that.option('valueAxis') || {},
                    valueAxesOptions = $.isArray(valueAxisOptions) ? valueAxisOptions : [valueAxisOptions],
                    tickProvider = core.CoreFactory.getTickProvider(),
                    valueAxes = that._valueAxes || [],
                    defaultAxisName = valueAxes[0].name,
                    paneAxis = that.paneAxis || {},
                    panes = that.panes,
                    i,
                    neededAxis = {};
                var getPaneForAxis = function(axisNameWithoutPane) {
                        var result;
                        _each(that.paneAxis, function(paneName, pane) {
                            _each(pane, function(axisName, _) {
                                if (axisNameWithoutPane == axisName) {
                                    result = paneName;
                                    return false
                                }
                            })
                        });
                        return result
                    };
                var axesWithoutPanes = $.map(valueAxes, function(axis) {
                        if (axis.pane)
                            return null;
                        return axis
                    });
                _each(axesWithoutPanes, function(_, axis) {
                    axis.pane = getPaneForAxis(axis.name);
                    if (!axis.pane) {
                        axis.pane = that.defaultPane;
                        paneAxis[axis.pane] = paneAxis[axis.pane] || {};
                        paneAxis[axis.pane][axis.name] = true
                    }
                    axis.options.pane = axis.pane
                });
                for (i = 0; i < panes.length; i++)
                    if (!paneAxis[panes[i].name]) {
                        paneAxis[panes[i].name] = {};
                        paneAxis[panes[i].name][defaultAxisName] = true
                    }
                var findAxisOptions = function(axisName) {
                        var result,
                            axInd;
                        for (axInd = 0; axInd < valueAxesOptions.length; axInd++)
                            if (valueAxesOptions[axInd].name == axisName) {
                                result = valueAxesOptions[axInd];
                                result.priority = axInd;
                                break
                            }
                        if (!result)
                            for (axInd = 0; axInd < valueAxes.length; axInd++)
                                if (valueAxes[axInd].name == axisName) {
                                    result = valueAxes[axInd].options;
                                    result.priority = valueAxes[axInd].priority;
                                    break
                                }
                        if (!result) {
                            that._incidentOccured("W2102", [axisName]);
                            result = {
                                name: axisName,
                                priority: valueAxes.length
                            }
                        }
                        return result
                    };
                var findAxis = function(paneName, axisName) {
                        var axis;
                        for (i = 0; i < valueAxes.length; i++) {
                            axis = valueAxes[i];
                            if (axis.name === axisName && axis.pane === paneName)
                                return axis
                        }
                    };
                _each(that.paneAxis, function(paneName, axisNames) {
                    _each(axisNames, function(axisName, _) {
                        neededAxis[axisName + '-' + paneName] = true;
                        if (!findAxis(paneName, axisName)) {
                            var axisOptions = findAxisOptions(axisName);
                            if (axisOptions)
                                valueAxes.push(that._createValueAxis($.extend(true, {}, axisOptions, {
                                    pane: paneName,
                                    name: axisName
                                }), rotated, tickProvider))
                        }
                    })
                });
                valueAxes = $.grep(valueAxes, function(elem) {
                    return !!neededAxis[elem.name + '-' + elem.pane]
                });
                valueAxes.sort(function(a, b) {
                    return a.priority - b.priority
                });
                that._valueAxes = valueAxes
            },
            _processSeriesFamilies: function() {
                var that = this,
                    types = [],
                    families = [],
                    paneSeries,
                    themeManager = that.themeManager,
                    rotated = themeManager.getOptions('rotated');
                if (that.seriesFamilies && that.seriesFamilies.length) {
                    _each(that.seriesFamilies, function(_, family) {
                        family.adjustSeriesValues()
                    });
                    return
                }
                _each(that.series, function(_, item) {
                    if ($.inArray(item.type, types) === -1)
                        types.push(item.type)
                });
                _each(that.panes, function(_, pane) {
                    paneSeries = [];
                    _each(that.series, function(_, oneSeries) {
                        if (oneSeries.pane === pane.name)
                            paneSeries.push(oneSeries)
                    });
                    _each(types, function(_, type) {
                        var family = core.CoreFactory.createSeriesFamily({
                                type: type,
                                pane: pane.name,
                                rotated: rotated,
                                equalBarWidth: themeManager.getOptions('equalBarWidth'),
                                minBubbleSize: themeManager.getOptions('minBubbleSize'),
                                maxBubbleSize: themeManager.getOptions('maxBubbleSize')
                            });
                        family.add(paneSeries);
                        family.adjustSeriesValues();
                        families.push(family)
                    })
                });
                that.seriesFamilies = families
            },
            _createLegend: function() {
                var that = this,
                    legendData = [],
                    legendOptions = that.themeManager.getOptions('legend');
                legendData = $.map(that.series, function(seriesItem) {
                    if (seriesItem.getOptions().showInLegend)
                        return {
                                text: seriesItem.name,
                                color: seriesItem.getColor(),
                                id: seriesItem.index,
                                states: seriesItem.getLegendStyles()
                            }
                });
                legendOptions.containerBackgroundColor = that.themeManager.getOptions("containerBackgroundColor");
                legendOptions._incidentOccured = that._incidentOccured;
                if (that.legend)
                    that.legend.update(legendData, legendOptions);
                else
                    that.legend = core.CoreFactory.createLegend(legendData, legendOptions, that.renderer, that._legendGroup)
            },
            _createTranslator: function(range, canvas, options) {
                return core.CoreFactory.createTranslator2D(range, canvas, options)
            },
            _createPanesBorderOptions: function() {
                var commonBorderOptions = this.themeManager.getOptions('commonPaneSettings').border,
                    panesBorderOptions = {};
                _each(this.panes, function(_, pane) {
                    var borderOptions = $.extend(true, {}, commonBorderOptions, pane.border);
                    panesBorderOptions[pane.name] = borderOptions
                });
                return panesBorderOptions
            },
            _render: function(drawOptions) {
                var that = this,
                    themeManager = that.themeManager,
                    rotated = themeManager.getOptions('rotated'),
                    i,
                    layoutManager = that.layoutManager,
                    panesBorderOptions = that._createPanesBorderOptions(),
                    needHideLoadIndicator,
                    legendHasInsidePosition = that.legend && that.legend.getPosition() === "inside";
                var drawSeries = function drawSeries() {
                        var panes = that.panes,
                            hideLayoutLabels = that.layoutManager.needMoreSpaceForPanesCanvas(that.panes, rotated) && !that.themeManager.getOptions("adaptiveLayout").keepLabels,
                            stackPoints = {};
                        _each(that.seriesFamilies || [], function(_, seriesFamily) {
                            var tr = that._getTranslator(seriesFamily.pane) || {},
                                translators = {};
                            translators[rotated ? 'x' : 'y'] = tr.val;
                            translators[rotated ? 'y' : 'x'] = tr.arg;
                            seriesFamily.updateSeriesValues(translators);
                            seriesFamily.adjustSeriesDimensions(translators)
                        });
                        that._createCrossHairCursor();
                        function applyPaneClipRect(seriesOptions) {
                            var paneIndex = that._getPaneIndex(seriesOptions.pane);
                            seriesOptions.setClippingParams(seriesOptions.isFinancialSeries() ? that.financialPanesClipRects[paneIndex].id : that.panesClipRects[paneIndex].id, that._getPaneBorderVisibility(paneIndex))
                        }
                        function preparePointsForSharedTooltip(singleSeries, stackPoints) {
                            if (!themeManager.getOptions('tooltip').shared)
                                return;
                            var points = singleSeries.getPoints(),
                                stackName = singleSeries.getStackName();
                            _each(points, function(index, point) {
                                var argument = point.argument;
                                if (!stackPoints[argument]) {
                                    stackPoints[argument] = {};
                                    stackPoints[argument][null] = []
                                }
                                if (stackName && !DX.utils.isArray(stackPoints[argument][stackName])) {
                                    stackPoints[argument][stackName] = [];
                                    _each(stackPoints[argument][null], function(_, point) {
                                        if (!point.stackName)
                                            stackPoints[argument][stackName].push(point)
                                    })
                                }
                                if (stackName) {
                                    stackPoints[argument][stackName].push(point);
                                    stackPoints[argument][null].push(point)
                                }
                                else
                                    _each(stackPoints[argument], function(_, stack) {
                                        stack.push(point)
                                    });
                                point.stackPoints = stackPoints[argument][stackName];
                                point.stackName = stackName
                            })
                        }
                        _each(that.series, function(_, particularSeries) {
                            preparePointsForSharedTooltip(particularSeries, stackPoints);
                            applyPaneClipRect(particularSeries);
                            particularSeries.setAdjustSeriesLabels(drawOptions.adjustSeriesLabels);
                            var tr = that._getTranslator(particularSeries.pane, particularSeries.axis),
                                translators = {};
                            translators[rotated ? 'x' : 'y'] = tr.val;
                            translators[rotated ? 'y' : 'x'] = tr.arg;
                            particularSeries.draw(translators, drawOptions.animate && particularSeries.getPoints().length <= drawOptions.animationPointsLimit && that.renderer.animationEnabled(), hideLayoutLabels, that.legend && that.legend.getActionCallback(particularSeries))
                        });
                        that._trackerGroup.append();
                        if (drawOptions.drawLegend && that.legend && legendHasInsidePosition) {
                            var newCanvas = $.extend({}, panes[0].canvas),
                                layoutManager = charts.factory.createChartLayoutManager();
                            newCanvas.right = panes[panes.length - 1].canvas.right;
                            newCanvas.bottom = panes[panes.length - 1].canvas.bottom;
                            that._legendGroup.append();
                            that._tooltipGroup.append();
                            layoutManager.drawElements([that.legend], newCanvas);
                            layoutManager.placeDrawnElements(newCanvas)
                        }
                        needHideLoadIndicator && that.hideLoadingIndicator();
                        that._drawn();
                        var drawChartTrackers = function drawChartTrackers() {
                                var i;
                                for (i = 0; i < that.series.length; i++)
                                    that.series[i].drawTrackers();
                                if (that.legend) {
                                    that.legend.drawTrackers();
                                    legendHasInsidePosition && that._legendGroup.append();
                                    legendHasInsidePosition && that._tooltipGroup.append()
                                }
                                that.tracker._prepare();
                                _each(that._paneTrackerGroups, function(index, paneGroups) {
                                    paneGroups.paneSeriesGroup.append(that._seriesTrackerGroup);
                                    paneGroups.paneMarkerGroup.append(that._markerTrackerGroup)
                                });
                                that._handleRenderComplete()
                            };
                        that._createTooltip();
                        if (drawOptions.asyncTrackersRendering)
                            that.delayedRedraw = setTimeout(drawChartTrackers, drawOptions.trackerRenderingDelay);
                        else
                            drawChartTrackers()
                    };
                drawOptions = that._prepareDrawOptions(drawOptions);
                that.callBase(drawOptions);
                if (that.stopRedraw) {
                    that.stopRedraw = false;
                    return
                }
                that._createPanesBackground();
                that._stripsGroup.append();
                that._axesGroup.append();
                that._constantLinesGroup.append();
                that._labelAxesGroup.append();
                that._createTranslators(drawOptions);
                that._options.useAggregation && _each(that.series, function(_, series) {
                    series._originalBusinessRange = series._originalBusinessRange || series.getRangeData();
                    var tr = that._getTranslator(series.pane, series.axis),
                        translators = {};
                    translators[rotated ? 'x' : 'y'] = tr.val;
                    translators[rotated ? 'y' : 'x'] = tr.arg;
                    series.resamplePoints(translators, that._zoomMinArg, that._zoomMaxArg)
                });
                if (utils.isDefined(that._zoomMinArg) || utils.isDefined(that._zoomMaxArg))
                    that._populateBusinessRange({
                        adjustOnZoom: themeManager.getOptions('adjustOnZoom'),
                        minArg: that._zoomMinArg,
                        maxArg: that._zoomMaxArg
                    });
                if (that._options.useAggregation || utils.isDefined(that._zoomMinArg) || utils.isDefined(that._zoomMaxArg))
                    that._updateTranslators();
                that._renderTitleAndLegend(drawOptions, legendHasInsidePosition);
                if (drawOptions && drawOptions.recreateCanvas)
                    layoutManager.updatePanesCanvases(that.panes, that.canvas, rotated);
                that._drawAxes(panesBorderOptions, drawOptions);
                if (layoutManager.needMoreSpaceForPanesCanvas(that.panes, rotated)) {
                    layoutManager.updateDrawnElements(that._argumentAxes, that._valueAxes, that.canvas, that.dirtyCanvas, that.panes, rotated);
                    if (that.chartTitle)
                        that.layoutManager.correctSizeElement(that.chartTitle, that.canvas);
                    that._updateCanvasClipRect(that.dirtyCanvas);
                    layoutManager.updatePanesCanvases(that.panes, that.canvas, rotated);
                    that._drawAxes(panesBorderOptions, drawOptions, true)
                }
                layoutManager.placeDrawnElements(that.canvas);
                that._drawPanesBorders(panesBorderOptions);
                that._createClipRectsForPanes();
                for (i = 0; i < that._argumentAxes.length; i++)
                    that._argumentAxes[i].applyClipRect(that._getElementsClipRectID(that._argumentAxes[i].pane));
                for (i = 0; i < that._valueAxes.length; i++)
                    that._valueAxes[i].applyClipRect(that._getElementsClipRectID(that._valueAxes[i].pane));
                that._fillPanesBackground();
                that._seriesGroup.append();
                that._labelsGroup.append();
                that._crossHairCursorGroup.append();
                that._legendGroup.append();
                that._tooltipGroup.append();
                needHideLoadIndicator = that._loadIndicator && that._loadIndicator.isShown && that._dataSource && that._dataSource.isLoaded() && !drawOptions.isResize;
                if (drawOptions.asyncSeriesRendering)
                    that.delayedRedraw = setTimeout(drawSeries, ASYNC_SERIES_RENDERING_DELAY);
                else
                    drawSeries()
            },
            _createTranslators: function(drawOptions) {
                var that = this,
                    rotated = that.themeManager.getOptions("rotated"),
                    translators;
                if (!drawOptions.recreateCanvas)
                    return;
                that.translators = translators = {};
                that.layoutManager.updatePanesCanvases(that.panes, that.canvas, rotated);
                _each(that.paneAxis, function(paneName, pane) {
                    translators[paneName] = translators[paneName] || {};
                    _each(pane, function(axisName, _) {
                        var translator = that._createTranslator(new core.Range(that._getBusinessRange(paneName, axisName).val), that._getCanvasForPane(paneName), rotated ? {direction: 'horizontal'} : {});
                        translator.pane = paneName;
                        translator.axis = axisName;
                        translators[paneName][axisName] = {val: translator}
                    })
                });
                _each(that._argumentAxes, function(_, axis) {
                    var translator = that._createTranslator(new core.Range(that._getBusinessRange(axis.pane).arg), that._getCanvasForPane(axis.pane), !rotated ? {direction: 'horizontal'} : {});
                    _each(translators[axis.pane], function(valAxis, paneAsixTran) {
                        paneAsixTran.arg = translator
                    })
                })
            },
            _updateTranslators: function() {
                var that = this;
                _each(that.translators, function(pane, axisTrans) {
                    _each(axisTrans, function(axis, translator) {
                        translator.arg.updateBusinessRange(new core.Range(that._getBusinessRange(pane).arg));
                        delete translator.arg._originalBusinessRange;
                        translator.val.updateBusinessRange(new core.Range(that._getBusinessRange(pane, axis).val));
                        delete translator.val._originalBusinessRange
                    })
                })
            },
            _reinitTranslators: function() {
                var that = this;
                _each(that._argumentAxes, function(_, axis) {
                    var translator = that._getTranslator(axis.pane);
                    if (translator) {
                        translator.arg.reinit();
                        axis.setRange(translator.arg.getBusinessRange());
                        axis.setTranslator(translator.arg, translator.val)
                    }
                });
                _each(that._valueAxes, function(_, axis) {
                    var translator = that._getTranslator(axis.pane, axis.name);
                    if (translator) {
                        translator.val.reinit();
                        axis.setRange(translator.val.getBusinessRange());
                        axis.setTranslator(translator.val, translator.arg)
                    }
                })
            },
            _drawAxes: function(panesBorderOptions, drawOptions, adjustUnits) {
                var that = this,
                    i = 0,
                    layoutManager = that.layoutManager,
                    rotated = that.themeManager.getOptions("rotated"),
                    translators = that.translators,
                    adjustmentCounter = 0,
                    synchronizeMultiAxes = that.themeManager.getOptions('synchronizeMultiAxes');
                that._reinitTranslators();
                do {
                    for (i = 0; i < that._argumentAxes.length; i++)
                        that._argumentAxes[i].resetTicks();
                    for (i = 0; i < that._valueAxes.length; i++)
                        that._valueAxes[i].resetTicks();
                    if (synchronizeMultiAxes)
                        charts.multiAxesSynchronizer.synchronize(that._valueAxes);
                    drawAxes(rotated ? that._valueAxes : that._argumentAxes);
                    layoutManager.requireAxesRedraw = false;
                    if (drawOptions.adjustAxes) {
                        layoutManager.applyHorizontalAxesLayout(rotated ? that._valueAxes : that._argumentAxes);
                        !layoutManager.stopDrawAxes && _each(translators, function(pane, axisTrans) {
                            _each(axisTrans, function(axis, translator) {
                                translator.arg.reinit();
                                translator.val.reinit()
                            })
                        })
                    }
                    drawAxes(rotated ? that._argumentAxes : that._valueAxes);
                    if (drawOptions.adjustAxes && !layoutManager.stopDrawAxes) {
                        layoutManager.applyVerticalAxesLayout(rotated ? that._argumentAxes : that._valueAxes);
                        !layoutManager.stopDrawAxes && _each(translators, function(pane, axisTrans) {
                            _each(axisTrans, function(axis, translator) {
                                translator.arg.reinit();
                                translator.val.reinit()
                            })
                        })
                    }
                    adjustmentCounter = adjustmentCounter + 1
                } while (!layoutManager.stopDrawAxes && layoutManager.requireAxesRedraw && adjustmentCounter < MAX_ADJUSTMENT_ATTEMPTS);
                that.__axisAdjustmentsCount = adjustmentCounter;
                function drawAxes(axes) {
                    _each(axes, function(_, axis) {
                        axis.clipRectID = that._getCanvasClipRectID();
                        axis.stripsGroup = that._stripsGroup;
                        axis.labelAxesGroup = that._labelAxesGroup;
                        axis.constantLinesGroup = that._constantLinesGroup;
                        axis.axesContainerGroup = that._axesGroup;
                        axis.draw({borderOptions: panesBorderOptions[axis.pane]}, adjustUnits)
                    })
                }
            },
            _createCrossHairCursor: function() {
                var that = this,
                    renderer = that.renderer,
                    panes = that.panes,
                    commonCanvas,
                    canvas,
                    options = that.themeManager.getOptions('crosshair') || {},
                    hLine,
                    vLine,
                    attrHLine,
                    attrVLine,
                    i;
                if (!options || !options.enabled)
                    return;
                attrHLine = {
                    stroke: options.horizontalLine.color || options.color,
                    strokeWidth: options.horizontalLine.width || options.width,
                    dashStyle: options.horizontalLine.dashStyle || options.dashStyle,
                    visibility: 'hidden',
                    opacity: options.horizontalLine.opacity || options.opacity
                };
                attrVLine = {
                    stroke: options.verticalLine.color || options.color,
                    strokeWidth: options.verticalLine.width || options.width,
                    dashStyle: options.verticalLine.dashStyle || options.dashStyle,
                    visibility: 'hidden',
                    opacity: options.verticalLine.opacity || options.opacity
                };
                for (i = 0; i < panes.length; i++) {
                    canvas = panes[i].canvas;
                    if (!commonCanvas)
                        commonCanvas = $.extend({}, canvas);
                    else {
                        commonCanvas.right = canvas.right;
                        commonCanvas.bottom = canvas.bottom
                    }
                    renderer.createRect(canvas.left, canvas.top, canvas.width - canvas.right - canvas.left, canvas.height - canvas.bottom - canvas.top, 0).append(this._crosshairTrackerGroup)
                }
                if (options.horizontalLine && options.horizontalLine.visible)
                    hLine = renderer.createLine(commonCanvas.left, commonCanvas.top, commonCanvas.width - commonCanvas.right, commonCanvas.top, attrHLine).append(that._crossHairCursorGroup);
                if (options.verticalLine && options.verticalLine.visible)
                    vLine = renderer.createLine(commonCanvas.left, commonCanvas.top, commonCanvas.left, commonCanvas.height - commonCanvas.bottom, attrVLine).append(that._crossHairCursorGroup);
                that._crossHairOptions.horizontalLine = hLine;
                that._crossHairOptions.verticalLine = vLine;
                that._crossHairOptions.canvas = commonCanvas
            },
            _createPanesBackground: function() {
                var that = this,
                    defaultBackgroundColor = that.themeManager.getOptions('commonPaneSettings').backgroundColor,
                    backgroundColor,
                    renderer = that.renderer,
                    rect,
                    i,
                    rects = [];
                that._panesBackgroundGroup && that._panesBackgroundGroup.clear();
                for (i = 0; i < that.panes.length; i++) {
                    backgroundColor = that.panes[i].backgroundColor || defaultBackgroundColor;
                    if (!backgroundColor || backgroundColor === 'none') {
                        rects.push(null);
                        continue
                    }
                    rect = renderer.createRect(0, 0, 0, 0, 0, {
                        fill: backgroundColor,
                        strokeWidth: 0
                    }).append(that._panesBackgroundGroup);
                    rects.push(rect)
                }
                that.panesBackground = rects;
                that._panesBackgroundGroup.append()
            },
            _fillPanesBackground: function() {
                var that = this,
                    bc;
                _each(that.panes, function(i, pane) {
                    bc = pane.borderCoords;
                    if (that.panesBackground[i] != null)
                        that.panesBackground[i].applySettings({
                            x: bc.left,
                            y: bc.top,
                            width: bc.width,
                            height: bc.height
                        })
                })
            },
            _calcPaneBorderCoords: function(pane, rotated) {
                var canvas = pane.canvas,
                    bc = pane.borderCoords = pane.borderCoords || {};
                bc.left = canvas.left;
                bc.top = canvas.top;
                bc.right = canvas.width - canvas.right;
                bc.bottom = canvas.height - canvas.bottom;
                bc.width = Math.max(bc.right - bc.left, 0);
                bc.height = Math.max(bc.bottom - bc.top, 0)
            },
            _drawPanesBorders: function(panesBorderOptions) {
                var that = this,
                    rotated = that.themeManager.getOptions('rotated');
                that._panesBorderGroup && (that._panesBorderGroup.detach(), that._panesBorderGroup.clear());
                _each(that.panes, function(i, pane) {
                    var bc,
                        borderOptions = panesBorderOptions[pane.name],
                        attr = {
                            fill: 'none',
                            stroke: borderOptions.color,
                            strokeOpacity: borderOptions.opacity,
                            strokeWidth: borderOptions.width,
                            dashStyle: borderOptions.dashStyle
                        };
                    that._calcPaneBorderCoords(pane, rotated);
                    if (!borderOptions.visible)
                        return;
                    bc = pane.borderCoords;
                    that.renderer.createSegmentRect(bc.left, bc.top, bc.width, bc.height, 0, borderOptions, attr).append(that._panesBorderGroup)
                });
                that._panesBorderGroup.append()
            },
            _createClipRect: function(clipArray, index, left, top, width, height) {
                var that = this,
                    clipRect = clipArray[index];
                if (!clipRect) {
                    clipRect = that.renderer.createClipRect(left, top, width, height);
                    clipArray[index] = clipRect
                }
                else
                    clipRect.updateRectangle({
                        x: left,
                        y: top,
                        width: width,
                        height: height
                    });
                clipRect.append()
            },
            _createClipRectsForPanes: function() {
                var that = this,
                    canvas = that.canvas;
                _each(that.panes, function(i, pane) {
                    var hasFinancialSeries = false,
                        bc = pane.borderCoords,
                        left = bc.left,
                        top = bc.top,
                        width = bc.width,
                        height = bc.height;
                    that._createClipRect(that.panesClipRects, i, left, top, width, height);
                    _each(that.series, function(_, series) {
                        if (series.pane === pane.name && series.isFinancialSeries())
                            hasFinancialSeries = true
                    });
                    if (hasFinancialSeries) {
                        if (that.themeManager.getOptions('rotated')) {
                            top = 0;
                            height = canvas.height
                        }
                        else {
                            left = 0;
                            width = canvas.width
                        }
                        that._createClipRect(that.financialPanesClipRects, i, left, top, width, height)
                    }
                    else
                        that.financialPanesClipRects.push(null)
                })
            },
            _getPaneIndex: function(paneName) {
                var paneIndex;
                _each(this.panes, function(index, pane) {
                    if (pane.name === paneName) {
                        paneIndex = index;
                        return false
                    }
                });
                return paneIndex
            },
            _getPaneBorderVisibility: function(paneIndex) {
                var commonPaneBorderVisible = this.themeManager.getOptions('commonPaneSettings').border.visible,
                    pane = this.panes[paneIndex] || {},
                    paneBorder = pane.border || {};
                return 'visible' in paneBorder ? paneBorder.visible : commonPaneBorderVisible
            },
            _getElementsClipRectID: function(paneName) {
                return this.panesClipRects[this._getPaneIndex(paneName)].id
            },
            _getTranslator: function(paneName, axisName) {
                var paneTrans = this.translators[paneName],
                    foundTranslator = null;
                if (!paneTrans)
                    return foundTranslator;
                foundTranslator = paneTrans[axisName];
                if (!foundTranslator)
                    _each(paneTrans, function(axis, trans) {
                        foundTranslator = trans;
                        return false
                    });
                return foundTranslator
            },
            _getCanvasForPane: function(paneName) {
                var panes = this.panes,
                    panesNumber = panes.length,
                    i;
                for (i = 0; i < panesNumber; i++)
                    if (panes[i].name === paneName)
                        return panes[i].canvas
            },
            _getBusinessRange: function(paneName, axisName) {
                var ranges = this.businessRanges || [],
                    rangesNumber = ranges.length,
                    foundRange,
                    i;
                for (i = 0; i < rangesNumber; i++)
                    if (ranges[i].val.pane === paneName && ranges[i].val.axis === axisName) {
                        foundRange = ranges[i];
                        break
                    }
                if (!foundRange)
                    for (i = 0; i < rangesNumber; i++)
                        if (ranges[i].val.pane === paneName) {
                            foundRange = ranges[i];
                            break
                        }
                return foundRange
            },
            _handleSeriesPopulated: function(needRedraw) {
                var that = this;
                that._processSeriesFamilies();
                that._createLegend();
                that._populateBusinessRange();
                that._processValueAxisFormat();
                that._updateTracker();
                that._endLoading(function() {
                    needRedraw && that._render({force: true})
                })
            },
            _processValueAxisFormat: function() {
                var that = this,
                    valueAxes = that._valueAxes,
                    axesWithFullStackedFormat = [];
                _each(that.series, function() {
                    if (this.isFullStackedSeries() && $.inArray(this.axis, axesWithFullStackedFormat) === -1)
                        axesWithFullStackedFormat.push(this.axis)
                });
                _each(valueAxes, function() {
                    if ($.inArray(this.name, axesWithFullStackedFormat) !== -1)
                        this.setPercentLabelFormat();
                    else
                        this.resetAutoLabelFormat()
                })
            },
            zoomArgument: function(min, max) {
                var that = this,
                    zoomArg = that._argumentAxes[0].adjustZoomValues(min, max);
                that._zoomMinArg = zoomArg.min;
                that._zoomMaxArg = zoomArg.max;
                that._render({
                    force: true,
                    drawTitle: false,
                    drawLegend: false,
                    adjustAxes: false,
                    animate: false,
                    adjustSeriesLabels: false,
                    asyncSeriesRendering: false
                })
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-charts, file pieChart.js */
    (function($, DX, undefined) {
        var core = DX.viz.core,
            charts = DX.viz.charts,
            utils = DX.utils;
        charts.PieChart = charts.BaseChart.inherit({
            _createThemeManager: function() {
                return charts.factory.createThemeManager(this.option(), "pie")
            },
            _reinit: function(needRedraw) {
                var that = this;
                that.callBase();
                if (!that.series)
                    that._dataSpecificInit();
                that._endLoading(function() {
                    needRedraw && that._render({force: true})
                })
            },
            _populateBusinessRange: function() {
                var businessRanges = [],
                    series = this.series,
                    singleSeries = series[0],
                    range,
                    singleSeriesRange;
                this._disposeObjectsInArray("businessRanges");
                if (singleSeries) {
                    range = new core.Range({series: singleSeries});
                    singleSeriesRange = singleSeries.getRangeData();
                    range = range.addRange(singleSeriesRange.val);
                    if (!range.isDefined())
                        range.setStubData();
                    businessRanges.push(range)
                }
                this.businessRanges = businessRanges
            },
            _seriesVisibilytyChanged: function() {
                this.series[0].arrangePoints();
                this._populateBusinessRange();
                this._refresh()
            },
            _createTranslator: function(range) {
                return core.CoreFactory.createTranslator1D(range.min, range.max, 360, 0)
            },
            _populateSeries: function() {
                var that = this,
                    renderer = that.renderer,
                    themeManager = that.themeManager,
                    hasSeriesTemplate = !!themeManager.getOptions("seriesTemplate"),
                    seriesOptions = hasSeriesTemplate ? that._templatedSeries : that.option("series"),
                    allSeriesOptions = $.isArray(seriesOptions) ? seriesOptions : seriesOptions ? [seriesOptions] : [],
                    data,
                    particularSeriesOptions,
                    particularSeries,
                    seriesTheme;
                that._disposeSeries();
                that.series = [];
                themeManager.resetPalette();
                if (allSeriesOptions.length) {
                    particularSeriesOptions = $.extend(true, {}, allSeriesOptions[0]);
                    if (particularSeriesOptions.type && !utils.isString(particularSeriesOptions.type))
                        particularSeriesOptions.type = "";
                    data = particularSeriesOptions.data;
                    particularSeriesOptions.data = null;
                    particularSeriesOptions.incidentOccured = that._incidentOccured;
                    seriesTheme = themeManager.getOptions("series", particularSeriesOptions, true);
                    seriesTheme.seriesGroup = that._seriesGroup;
                    seriesTheme.trackerGroup = that._trackerGroup;
                    seriesTheme.seriesLabelsGroup = that._labelsGroup;
                    seriesTheme.seriesTrackerGroup = that._seriesTrackerGroup;
                    seriesTheme.markerTrackerGroup = that._markerTrackerGroup;
                    seriesTheme.visibilityChanged = $.proxy(this._seriesVisibilytyChanged, this);
                    seriesTheme.customizePoint = themeManager.getOptions("customizePoint");
                    seriesTheme.customizeLabel = themeManager.getOptions("customizeLabel");
                    particularSeries = core.CoreFactory.createSeries(renderer, seriesTheme);
                    if (!particularSeries.isUpdated)
                        that._incidentOccured("E2101", [seriesTheme.type]);
                    else {
                        that._processSingleSeries(particularSeries);
                        that.series.push(particularSeries)
                    }
                    particularSeriesOptions.data = data
                }
                return that.series
            },
            _processSingleSeries: function(singleSeries) {
                singleSeries.arrangePoints()
            },
            _handleSeriesPopulated: function(needRedraw) {
                var that = this;
                that._populateBusinessRange();
                that._createLegend();
                that._updateTracker();
                that._endLoading(function() {
                    needRedraw && that._render({
                        force: true,
                        recreateCanvas: true
                    })
                })
            },
            _createLegend: function() {
                var that = this,
                    legendOptions = that.themeManager.getOptions("legend"),
                    data = $.map(that.series[0] ? that.series[0].getPoints() : [], function(item) {
                        return {
                                text: item.argument,
                                color: item.getColor(),
                                id: item.index,
                                states: item.getLegendStyles()
                            }
                    });
                legendOptions._incidentOccured = that._incidentOccured;
                that.legend = core.CoreFactory.createLegend(data, legendOptions, that.renderer, that._legendGroup)
            },
            _render: function(drawOptions) {
                var that = this,
                    singleSeries = that.series && that.series[0],
                    layoutManager = that.layoutManager,
                    hideLayoutLabels;
                drawOptions = that._prepareDrawOptions(drawOptions);
                that.callBase(drawOptions);
                if (that.stopRedraw) {
                    that.stopRedraw = false;
                    return
                }
                that._renderTitleAndLegend(drawOptions);
                if (layoutManager.needMoreSpaceForPanesCanvas([that])) {
                    layoutManager.updateDrawnElements([], [], that.canvas, that.dirtyCanvas, [that]);
                    if (that.chartTitle)
                        that.layoutManager.correctSizeElement(that.chartTitle, that.canvas);
                    that._updateCanvasClipRect(that.dirtyCanvas)
                }
                layoutManager.placeDrawnElements(that.canvas);
                if (singleSeries) {
                    hideLayoutLabels = layoutManager.needMoreSpaceForPanesCanvas([that]) && !that.themeManager.getOptions("adaptiveLayout").keepLabels;
                    layoutManager.applyPieChartSeriesLayout(that.canvas, singleSeries, true);
                    that._seriesGroup.append();
                    that._labelsGroup.append();
                    singleSeries.canvas = that.canvas;
                    singleSeries.resetLabelEllipsis();
                    singleSeries.draw(that._createTranslator(that.businessRanges[0], that.canvas), drawOptions.animate && that.renderer.animationEnabled(), hideLayoutLabels);
                    if (singleSeries.redraw) {
                        that.renderer.stopAllAnimations(true);
                        layoutManager.applyPieChartSeriesLayout(that.canvas, singleSeries, hideLayoutLabels);
                        singleSeries.draw(that._createTranslator(that.businessRanges[0], that.canvas), drawOptions.animate && that.renderer.animationEnabled(), hideLayoutLabels)
                    }
                    that._tooltipGroup.append();
                    that._trackerGroup.append();
                    that._createTooltip();
                    singleSeries.drawTrackers();
                    that.tracker._prepare("pieChart")
                }
                that._dataSource && that._dataSource.isLoaded() && !drawOptions.isResize && that.hideLoadingIndicator();
                that._drawn();
                that._handleRenderComplete()
            },
            getSeries: function getSeries() {
                return this.series && this.series[0]
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-charts, file layoutManager.js */
    (function($, DX, undefined) {
        var isNumber = DX.utils.isNumber,
            math = Math,
            decreaseGaps = DevExpress.viz.core.utils.decreaseGaps,
            CONNECTOR_MARGIN = 10,
            round = math.round;
        DX.viz.charts.LayoutManager = DX.Class.inherit(function() {
            var ctor = function(options) {
                    this.verticalElements = [];
                    this.horizontalElements = [];
                    this._options = options
                };
            var update = function(chart) {
                    this.chart = chart;
                    setCanvasValues(chart && chart.canvas)
                };
            var dispose = function() {
                    this.chart = null
                };
            var setCanvasValues = function(canvas) {
                    if (canvas) {
                        canvas.originalTop = canvas.top;
                        canvas.originalBottom = canvas.bottom;
                        canvas.originalLeft = canvas.left;
                        canvas.originalRight = canvas.right
                    }
                };
            var placeElementAndCutCanvas = function(elements, canvas) {
                    $.each(elements, function(_, element) {
                        var shiftX,
                            shiftY,
                            options = element.getLayoutOptions(),
                            length = getLength(options.cutLayoutSide);
                        if (!options.width)
                            return;
                        switch (options.horizontalAlignment) {
                            case"left":
                                shiftX = canvas.left;
                                break;
                            case"center":
                                shiftX = (canvas.width - canvas.left - canvas.right - options.width) / 2 + canvas.left;
                                break;
                            case"right":
                                shiftX = canvas.width - canvas.right - options.width;
                                break
                        }
                        switch (options.verticalAlignment) {
                            case"top":
                                shiftY = canvas.top;
                                break;
                            case"bottom":
                                shiftY = canvas.height - canvas.bottom - options.height;
                                break
                        }
                        element.shift(round(shiftX), round(shiftY));
                        canvas[options.cutLayoutSide] += options[length];
                        setCanvasValues(canvas)
                    })
                };
            var drawElements = function(elements, canvas) {
                    var that = this,
                        verticalElements = that.verticalElements = [],
                        horizontalElements = that.horizontalElements = [];
                    $.each(elements, function(_, element) {
                        var freeHeight = canvas.height - canvas.top - canvas.bottom,
                            freeWidth = canvas.width - canvas.left - canvas.right,
                            options,
                            length,
                            arrayElements;
                        element.setSize({
                            height: freeHeight,
                            width: freeWidth
                        });
                        element.draw();
                        options = element.getLayoutOptions();
                        length = getLength(options.cutLayoutSide);
                        arrayElements = length === "width" ? horizontalElements : verticalElements;
                        arrayElements.push(element);
                        canvas[options.cutLayoutSide] += options[length];
                        setCanvasValues(canvas)
                    })
                };
            var getLength = function(side) {
                    var length = "height";
                    if (side === "left" || side === "right")
                        length = "width";
                    return length
                };
            var updatePanesCanvases = function(panes, canvas, rotated) {
                    var pane,
                        i,
                        paneSpaceHeight = canvas.height - canvas.top - canvas.bottom,
                        paneSpaceWidth = canvas.width - canvas.left - canvas.right,
                        weightSum = 0,
                        padding = panes.padding || 10;
                    for (i = 0; i < panes.length; i++) {
                        pane = panes[i];
                        pane.weight = pane.weight || 1;
                        weightSum = weightSum + pane.weight
                    }
                    rotated ? createPanes(panes, paneSpaceWidth, "left", "right") : createPanes(panes, paneSpaceHeight, "top", "bottom");
                    function createPanes(panes, paneSpace, startName, endName) {
                        var distributedSpace = 0,
                            oneWeight = (paneSpace - padding * (panes.length - 1)) / weightSum;
                        $.each(panes, function(_, pane) {
                            var calcLength = round(pane.weight * oneWeight);
                            pane.canvas = pane.canvas || {};
                            $.extend(pane.canvas, {
                                deltaLeft: 0,
                                deltaRight: 0,
                                deltaTop: 0,
                                deltaBottom: 0
                            }, canvas);
                            pane.canvas[startName] = canvas[startName] + distributedSpace;
                            pane.canvas[endName] = canvas[endName] + (paneSpace - calcLength - distributedSpace);
                            distributedSpace = distributedSpace + calcLength + padding;
                            setCanvasValues(pane.canvas)
                        })
                    }
                };
            var applyPieChartSeriesLayout = function(canvas, singleSeries, hideLayoutLabels) {
                    var paneSpaceHeight = canvas.height - canvas.top - canvas.bottom,
                        paneSpaceWidth = canvas.width - canvas.left - canvas.right,
                        paneCenterX = paneSpaceWidth / 2 + canvas.left,
                        paneCenterY = paneSpaceHeight / 2 + canvas.top,
                        accessibleRadius = Math.min(paneSpaceWidth, paneSpaceHeight) / 2,
                        minR = 0.7 * accessibleRadius,
                        innerRadius = getInnerRadius(singleSeries);
                    if (!hideLayoutLabels)
                        $.each(singleSeries.getPoints(), function(_, point) {
                            if (point._label.hasText() && point.isVisible()) {
                                var labelBBox = point._label._getOutsideGroupLabelPosition(),
                                    nearestX = getNearestCoord(labelBBox.x, labelBBox.x + labelBBox.width, paneCenterX),
                                    nearestY = getNearestCoord(labelBBox.y, labelBBox.y + labelBBox.height, paneCenterY),
                                    minRadiusWithLabels = Math.max(getLengthFromCenter(nearestX, nearestY) - CONNECTOR_MARGIN, minR);
                                accessibleRadius = Math.min(accessibleRadius, minRadiusWithLabels)
                            }
                            point._label.setPosition(point._label.originalPosition)
                        });
                    else
                        $.each(singleSeries.getPoints(), function(_, point) {
                            if (singleSeries.getOptions().label.position === "inside")
                                return false;
                            point._label.originalPosition = point._label.getPosition();
                            point._label.setPosition('outside')
                        });
                    singleSeries.correctPosition({
                        centerX: math.floor(paneCenterX),
                        centerY: math.floor(paneCenterY),
                        radiusInner: math.floor(accessibleRadius * innerRadius),
                        radiusOuter: math.floor(accessibleRadius)
                    });
                    function getNearestCoord(firstCoord, secondCoord, pointCenterCoord) {
                        var nearestCoord;
                        if (pointCenterCoord < firstCoord)
                            nearestCoord = firstCoord;
                        else if (secondCoord < pointCenterCoord)
                            nearestCoord = secondCoord;
                        else
                            nearestCoord = pointCenterCoord;
                        return nearestCoord
                    }
                    function getLengthFromCenter(x, y) {
                        return Math.sqrt(Math.pow(x - paneCenterX, 2) + Math.pow(y - paneCenterY, 2))
                    }
                    function getInnerRadius(series) {
                        var innerRadius;
                        if (singleSeries.type === 'pie')
                            innerRadius = 0;
                        else {
                            innerRadius = singleSeries.innerRadius;
                            if (!isNumber(innerRadius))
                                innerRadius = 0.5;
                            else {
                                innerRadius = Number(innerRadius);
                                if (innerRadius < 0.2)
                                    innerRadius = 0.2;
                                if (innerRadius > 0.8)
                                    innerRadius = 0.8
                            }
                        }
                        return innerRadius
                    }
                };
            var isValidBox = function isValidBox(box) {
                    return !!(box.x || box.y || box.width || box.height)
                };
            var correctDeltaMarginValue = function(panes, marginSides) {
                    var axisPanePosition,
                        canvasCell,
                        canvas,
                        deltaSide,
                        requireAxesRedraw;
                    $.each(panes, function(_, pane) {
                        canvas = pane.canvas;
                        $.each(marginSides, function(_, side) {
                            deltaSide = 'delta' + side;
                            canvas[deltaSide] = Math.max(canvas[deltaSide] - (canvas[side.toLowerCase()] - canvas['original' + side]), 0);
                            if (canvas[deltaSide] > 0)
                                requireAxesRedraw = true
                        })
                    });
                    return requireAxesRedraw
                };
            var getPane = function getPane(name, panes) {
                    var findPane = panes[0];
                    $.each(panes, function(_, pane) {
                        if (name === pane.name)
                            findPane = pane
                    });
                    return findPane
                };
            var applyAxesLayout = function(axes, panes, rotated) {
                    var that = this,
                        canvas,
                        axisPanePosition,
                        axisPosition,
                        canvasCell,
                        box,
                        delta,
                        axis,
                        axisLength,
                        direction,
                        directionMultiplier,
                        someDirection = [],
                        pane,
                        i;
                    $.each(panes, function(_, pane) {
                        $.extend(pane.canvas, {
                            deltaLeft: 0,
                            deltaRight: 0,
                            deltaTop: 0,
                            deltaBottom: 0
                        })
                    });
                    for (i = 0; i < axes.length; i++) {
                        axis = axes[i];
                        axisPosition = axis.options.position || 'left';
                        axis.delta = {};
                        box = axis.getBoundingRect();
                        pane = getPane(axis.pane, panes);
                        canvas = pane.canvas;
                        if (!isValidBox(box))
                            continue;
                        direction = "delta" + axisPosition.slice(0, 1).toUpperCase() + axisPosition.slice(1);
                        switch (axisPosition) {
                            case"right":
                                directionMultiplier = 1;
                                canvas.deltaLeft += axis.padding ? axis.padding.left : 0;
                                break;
                            case"left":
                                directionMultiplier = -1;
                                canvas.deltaRight += axis.padding ? axis.padding.right : 0;
                                break;
                            case"top":
                                directionMultiplier = -1;
                                canvas.deltaBottom += axis.padding ? axis.padding.bottom : 0;
                                break;
                            case"bottom":
                                directionMultiplier = 1;
                                canvas.deltaTop += axis.padding ? axis.padding.top : 0;
                                break
                        }
                        switch (axisPosition) {
                            case"right":
                            case"left":
                                if (!box.isEmpty) {
                                    delta = box.y + box.height - (canvas.height - canvas.originalBottom);
                                    if (delta > 0) {
                                        that.requireAxesRedraw = true;
                                        canvas.deltaBottom += delta
                                    }
                                    delta = canvas.originalTop - box.y;
                                    if (delta > 0) {
                                        that.requireAxesRedraw = true;
                                        canvas.deltaTop += delta
                                    }
                                }
                                axisLength = box.width;
                                someDirection = ['Left', 'Right'];
                                break;
                            case"top":
                            case"bottom":
                                if (!box.isEmpty) {
                                    delta = box.x + box.width - (canvas.width - canvas.originalRight);
                                    if (delta > 0) {
                                        that.requireAxesRedraw = true;
                                        canvas.deltaRight += delta
                                    }
                                    delta = canvas.originalLeft - box.x;
                                    if (delta > 0) {
                                        that.requireAxesRedraw = true;
                                        canvas.deltaLeft += delta
                                    }
                                }
                                someDirection = ['Bottom', 'Top'];
                                axisLength = box.height;
                                break
                        }
                        if (!axis.delta[axisPosition] && canvas[direction] > 0)
                            canvas[direction] += axis.getMultipleAxesSpacing();
                        axis.delta[axisPosition] = axis.delta[axisPosition] || 0;
                        axis.delta[axisPosition] += canvas[direction] * directionMultiplier;
                        canvas[direction] += axisLength
                    }
                    that.requireAxesRedraw = correctDeltaMarginValue(panes, someDirection) || that.requireAxesRedraw;
                    this.stopDrawAxes = applyFoundExceedings(panes, rotated)
                };
            var applyVerticalAxesLayout = function(axes) {
                    var chart = this.chart;
                    this.applyAxesLayout(axes, chart.panes, chart.option('rotated'))
                };
            var applyHorizontalAxesLayout = function(axes) {
                    var chart = this.chart;
                    axes.reverse();
                    this.applyAxesLayout(axes, chart.panes, chart.option('rotated'));
                    axes.reverse()
                };
            var placeDrawnElements = function(canvas) {
                    var that = this,
                        horizontalElements = that.horizontalElements,
                        verticalElements = that.verticalElements;
                    correctElementsPosition(horizontalElements, 'width');
                    placeElementAndCutCanvas(horizontalElements, canvas);
                    correctElementsPosition(verticalElements, 'height');
                    placeElementAndCutCanvas(verticalElements, canvas);
                    function correctElementsPosition(elements, direction) {
                        $.each(elements, function(_, element) {
                            var options = element.getLayoutOptions(),
                                side = options.cutLayoutSide;
                            canvas[side] -= options[direction]
                        })
                    }
                };
            var needMoreSpaceForPanesCanvas = function(panes, rotated) {
                    var that = this,
                        needHorizontalSpace = 0,
                        needVerticalSpace = 0;
                    $.each(panes, function(_, pane) {
                        var paneCanvas = pane.canvas,
                            needPaneHorizonralSpace = that._options.width - (paneCanvas.width - paneCanvas.left - paneCanvas.right),
                            needPaneVerticalSpace = that._options.height - (paneCanvas.height - paneCanvas.top - paneCanvas.bottom);
                        if (rotated) {
                            needHorizontalSpace += needPaneHorizonralSpace > 0 ? needPaneHorizonralSpace : 0;
                            needVerticalSpace = Math.max(needPaneVerticalSpace > 0 ? needPaneVerticalSpace : 0, needVerticalSpace)
                        }
                        else {
                            needHorizontalSpace = Math.max(needPaneHorizonralSpace > 0 ? needPaneHorizonralSpace : 0, needHorizontalSpace);
                            needVerticalSpace += needPaneVerticalSpace > 0 ? needPaneVerticalSpace : 0
                        }
                    });
                    return needHorizontalSpace > 0 || needVerticalSpace > 0 ? {
                            width: needHorizontalSpace,
                            height: needVerticalSpace
                        } : false
                };
            var updateDrawnElements = function(argumentAxis, valueAxis, canvas, dirtyCanvas, panes, rotated) {
                    var that = this,
                        needRemoveSpace,
                        saveDirtyCanvas = $.extend({}, dirtyCanvas),
                        verticalAxes = rotated ? argumentAxis : valueAxis,
                        horizontalAxes = rotated ? valueAxis : argumentAxis;
                    needRemoveSpace = this.needMoreSpaceForPanesCanvas(panes, rotated);
                    if (!needRemoveSpace)
                        return;
                    needRemoveSpace.height = decreaseGaps(dirtyCanvas, ["top", "bottom"], needRemoveSpace.height);
                    needRemoveSpace.width = decreaseGaps(dirtyCanvas, ["left", "right"], needRemoveSpace.width);
                    canvas.top -= saveDirtyCanvas.top - dirtyCanvas.top;
                    canvas.bottom -= saveDirtyCanvas.bottom - dirtyCanvas.bottom;
                    canvas.left -= saveDirtyCanvas.left - dirtyCanvas.left;
                    canvas.right -= saveDirtyCanvas.right - dirtyCanvas.right;
                    updateElements(that.horizontalElements, "width", "height");
                    updateElements(that.verticalElements, "height", "width");
                    updateAxis(verticalAxes, "width");
                    updateAxis(horizontalAxes, "height");
                    function updateAxis(axes, side) {
                        if (axes && needRemoveSpace[side] > 0) {
                            $.each(axes, function(i, axis) {
                                var bbox = axis.getBoundingRect();
                                axis.updateSize();
                                needRemoveSpace[side] -= bbox[side] - axis.getBoundingRect()[side]
                            });
                            if (needRemoveSpace[side] > 0)
                                $.each(axes, function(_, axis) {
                                    axis.updateSize(true)
                                })
                        }
                    }
                    function updateElements(elements, length, otherLength) {
                        $.each(elements, function(_, element) {
                            var options = element.getLayoutOptions(),
                                side = options.cutLayoutSide,
                                freeSpaceWidth = dirtyCanvas.width - dirtyCanvas.left - dirtyCanvas.right,
                                freeSpaceHeight = dirtyCanvas.height - dirtyCanvas.top - dirtyCanvas.bottom,
                                updateObject = {};
                            element.setSize({
                                width: freeSpaceWidth,
                                height: freeSpaceHeight
                            });
                            updateObject[otherLength] = 0;
                            updateObject[length] = needRemoveSpace[length];
                            element.changeSize(updateObject);
                            canvas[side] -= options[length] - element.getLayoutOptions()[length];
                            needRemoveSpace[length] -= options[length] - element.getLayoutOptions()[length]
                        })
                    }
                };
            var correctSizeElement = function(element, canvas) {
                    element.setSize({
                        width: canvas.width - canvas.right - canvas.left,
                        height: canvas.width - canvas.right - canvas.left
                    });
                    element.changeSize({
                        width: 0,
                        height: 0
                    })
                };
            var applyFoundExceedings = function applyFoundExceedings(panes, rotated) {
                    var col,
                        row,
                        stopDrawAxes,
                        maxLeft = 0,
                        maxRight = 0,
                        maxTop = 0,
                        maxBottom = 0,
                        maxColNumber = 0;
                    $.each(panes, function(_, pane) {
                        maxLeft = Math.max(maxLeft, pane.canvas.deltaLeft);
                        maxRight = Math.max(maxRight, pane.canvas.deltaRight);
                        maxTop = Math.max(maxTop, pane.canvas.deltaTop);
                        maxBottom = Math.max(maxBottom, pane.canvas.deltaBottom)
                    });
                    if (rotated)
                        $.each(panes, function(_, pane) {
                            pane.canvas.top += maxTop;
                            pane.canvas.bottom += maxBottom;
                            pane.canvas.right += pane.canvas.deltaRight;
                            pane.canvas.left += pane.canvas.deltaLeft
                        });
                    else
                        $.each(panes, function(_, pane) {
                            pane.canvas.top += pane.canvas.deltaTop;
                            pane.canvas.bottom += pane.canvas.deltaBottom;
                            pane.canvas.right += maxRight;
                            pane.canvas.left += maxLeft
                        });
                    $.each(panes, function(_, pane) {
                        if (pane.canvas.top + pane.canvas.bottom > pane.canvas.height)
                            stopDrawAxes = true;
                        if (pane.canvas.left + pane.canvas.right > pane.canvas.width)
                            stopDrawAxes = true
                    });
                    return stopDrawAxes
                };
            return {
                    ctor: ctor,
                    update: update,
                    drawElements: drawElements,
                    updatePanesCanvases: updatePanesCanvases,
                    applyVerticalAxesLayout: applyVerticalAxesLayout,
                    applyHorizontalAxesLayout: applyHorizontalAxesLayout,
                    applyAxesLayout: applyAxesLayout,
                    applyPieChartSeriesLayout: applyPieChartSeriesLayout,
                    dispose: dispose,
                    updateDrawnElements: updateDrawnElements,
                    placeDrawnElements: placeDrawnElements,
                    needMoreSpaceForPanesCanvas: needMoreSpaceForPanesCanvas,
                    correctSizeElement: correctSizeElement
                }
        }())
    })(jQuery, DevExpress);
    /*! Module viz-charts, file multiAxesSynchronizer.js */
    (function($, DX, undefined) {
        var Range = DX.viz.core.Range,
            utils = DX.utils,
            adjustValueUtils = utils.adjustValue,
            applyPrecisionByMinDeltaUtils = utils.applyPrecisionByMinDelta,
            isDefinedUtils = utils.isDefined,
            math = Math,
            mathFloor = math.floor,
            mathMax = math.max,
            MIN_RANGE_FOR_ADJUST_BOUNDS = 0.1;
        var getValueAxesPerPanes = function(valueAxes) {
                var result = {};
                $.each(valueAxes, function(_, axis) {
                    var pane = axis.pane;
                    if (!result[pane])
                        result[pane] = [];
                    result[pane].push(axis)
                });
                return result
            };
        var restoreOriginalBusinessRange = function(axis) {
                var businessRange;
                if (!axis.translator._originalBusinessRange)
                    axis.translator._originalBusinessRange = new Range(axis.translator.getBusinessRange());
                else {
                    businessRange = new Range(axis.translator._originalBusinessRange);
                    axis.translator.updateBusinessRange(businessRange);
                    axis.setRange(businessRange)
                }
            };
        var linearConvertor = {
                transform: function(v, b) {
                    return utils.getLog(v, b)
                },
                addInterval: function(v, i) {
                    return v + i
                },
                getInterval: function(base, tickInterval) {
                    return tickInterval
                },
                adjustValue: mathFloor
            };
        var logConvertor = {
                transform: function(v, b) {
                    return utils.raiseTo(v, b)
                },
                addInterval: function(v, i) {
                    return v * i
                },
                getInterval: function(base, tickInterval) {
                    return math.pow(base, tickInterval)
                },
                adjustValue: adjustValueUtils
            };
        var convertAxisInfo = function(axisInfo, convertor) {
                if (!axisInfo.isLogarithmic)
                    return;
                var base = axisInfo.logarithmicBase,
                    tickValues = axisInfo.tickValues,
                    tick,
                    ticks = [],
                    interval;
                axisInfo.minValue = convertor.transform(axisInfo.minValue, base);
                axisInfo.oldMinValue = convertor.transform(axisInfo.oldMinValue, base);
                axisInfo.maxValue = convertor.transform(axisInfo.maxValue, base);
                axisInfo.oldMaxValue = convertor.transform(axisInfo.oldMaxValue, base);
                axisInfo.tickInterval = math.round(axisInfo.tickInterval);
                if (axisInfo.tickInterval < 1)
                    axisInfo.tickInterval = 1;
                interval = convertor.getInterval(base, axisInfo.tickInterval);
                for (tick = convertor.adjustValue(convertor.transform(tickValues[0], base)); ticks.length < tickValues.length; tick = convertor.addInterval(tick, interval))
                    ticks.push(tick);
                ticks.tickInterval = axisInfo.tickInterval;
                axisInfo.tickValues = ticks
            };
        var populateAxesInfo = function(axes) {
                return $.map(axes, function(axis) {
                        restoreOriginalBusinessRange(axis);
                        var tickValues = axis.getTickValues(),
                            options = axis.options,
                            minValue,
                            maxValue,
                            axisInfo = null,
                            businessRange;
                        if (tickValues && tickValues.length > 0 && utils.isNumber(tickValues[0]) && options.type !== 'discrete') {
                            businessRange = axis.translator.getBusinessRange();
                            minValue = businessRange.minVisible;
                            maxValue = businessRange.maxVisible;
                            axisInfo = {
                                axis: axis,
                                isLogarithmic: options.type === 'logarithmic',
                                logarithmicBase: businessRange.base,
                                tickValues: tickValues,
                                minValue: minValue,
                                oldMinValue: minValue,
                                maxValue: maxValue,
                                oldMaxValue: maxValue,
                                inverted: businessRange.invert,
                                tickInterval: tickValues.tickInterval,
                                synchronizedValue: options.synchronizedValue
                            };
                            if (businessRange.stubData) {
                                axisInfo.stubData = true;
                                axisInfo.tickInterval = axisInfo.tickInterval || options.tickInterval;
                                axisInfo.isLogarithmic = false
                            }
                            convertAxisInfo(axisInfo, linearConvertor);
                            DX.utils.debug.assert(axisInfo.tickInterval !== undefined && axisInfo.tickInterval !== null, 'tickInterval was not provided')
                        }
                        return axisInfo
                    })
            };
        var updateTickValues = function(axesInfo) {
                var maxTicksCount = 0;
                $.each(axesInfo, function(_, axisInfo) {
                    maxTicksCount = mathMax(maxTicksCount, axisInfo.tickValues.length)
                });
                $.each(axesInfo, function(_, axisInfo) {
                    var ticksMultiplier,
                        ticksCount,
                        additionalStartTicksCount = 0,
                        synchronizedValue = axisInfo.synchronizedValue,
                        tickValues = axisInfo.tickValues,
                        tickInterval = axisInfo.tickInterval;
                    if (isDefinedUtils(synchronizedValue)) {
                        axisInfo.baseTickValue = synchronizedValue;
                        axisInfo.invertedBaseTickValue = synchronizedValue;
                        axisInfo.tickValues = [axisInfo.baseTickValue]
                    }
                    else {
                        if (tickValues.length > 1 && tickInterval) {
                            ticksMultiplier = mathFloor((maxTicksCount + 1) / tickValues.length);
                            ticksCount = ticksMultiplier > 1 ? mathFloor((maxTicksCount + 1) / ticksMultiplier) : maxTicksCount;
                            additionalStartTicksCount = mathFloor((ticksCount - tickValues.length) / 2);
                            while (additionalStartTicksCount > 0 && tickValues[0] !== 0) {
                                tickValues.unshift(applyPrecisionByMinDeltaUtils(tickValues[0], tickInterval, tickValues[0] - tickInterval));
                                additionalStartTicksCount--
                            }
                            while (tickValues.length < ticksCount)
                                tickValues.push(applyPrecisionByMinDeltaUtils(tickValues[0], tickInterval, tickValues[tickValues.length - 1] + tickInterval));
                            axisInfo.tickInterval = tickInterval / ticksMultiplier
                        }
                        axisInfo.baseTickValue = tickValues[0];
                        axisInfo.invertedBaseTickValue = tickValues[tickValues.length - 1]
                    }
                })
            };
        var getAxisRange = function(axisInfo) {
                return axisInfo.maxValue - axisInfo.minValue
            };
        var getMainAxisInfo = function(axesInfo) {
                for (var i = 0; i < axesInfo.length; i++)
                    if (!axesInfo[i].stubData)
                        return axesInfo[i];
                return null
            };
        var correctMinMaxValues = function(axesInfo) {
                var mainAxisInfo = getMainAxisInfo(axesInfo);
                $.each(axesInfo, function(_, axisInfo) {
                    var scale,
                        move,
                        mainAxisBaseValueOffset;
                    if (axisInfo !== mainAxisInfo) {
                        if (mainAxisInfo.tickInterval && axisInfo.tickInterval) {
                            if (axisInfo.stubData && isDefinedUtils(axisInfo.synchronizedValue)) {
                                axisInfo.oldMinValue = axisInfo.minValue = axisInfo.baseTickValue - (mainAxisInfo.baseTickValue - mainAxisInfo.minValue) / mainAxisInfo.tickInterval * axisInfo.tickInterval;
                                axisInfo.oldMaxValue = axisInfo.maxValue = axisInfo.baseTickValue - (mainAxisInfo.baseTickValue - mainAxisInfo.maxValue) / mainAxisInfo.tickInterval * axisInfo.tickInterval
                            }
                            scale = mainAxisInfo.tickInterval / getAxisRange(mainAxisInfo) / axisInfo.tickInterval * getAxisRange(axisInfo);
                            axisInfo.maxValue = axisInfo.minValue + getAxisRange(axisInfo) / scale
                        }
                        if (mainAxisInfo.inverted && !axisInfo.inverted || !mainAxisInfo.inverted && axisInfo.inverted)
                            mainAxisBaseValueOffset = mainAxisInfo.maxValue - mainAxisInfo.invertedBaseTickValue;
                        else
                            mainAxisBaseValueOffset = mainAxisInfo.baseTickValue - mainAxisInfo.minValue;
                        move = (mainAxisBaseValueOffset / getAxisRange(mainAxisInfo) - (axisInfo.baseTickValue - axisInfo.minValue) / getAxisRange(axisInfo)) * getAxisRange(axisInfo);
                        axisInfo.minValue -= move;
                        axisInfo.maxValue -= move
                    }
                })
            };
        var calculatePaddings = function(axesInfo) {
                var minPadding,
                    maxPadding,
                    startPadding = 0,
                    endPadding = 0;
                $.each(axesInfo, function(_, axisInfo) {
                    var inverted = axisInfo.inverted;
                    minPadding = axisInfo.minValue > axisInfo.oldMinValue ? (axisInfo.minValue - axisInfo.oldMinValue) / getAxisRange(axisInfo) : 0;
                    maxPadding = axisInfo.maxValue < axisInfo.oldMaxValue ? (axisInfo.oldMaxValue - axisInfo.maxValue) / getAxisRange(axisInfo) : 0;
                    startPadding = mathMax(startPadding, inverted ? maxPadding : minPadding);
                    endPadding = mathMax(endPadding, inverted ? minPadding : maxPadding)
                });
                return {
                        start: startPadding,
                        end: endPadding
                    }
            };
        var correctMinMaxValuesByPaddings = function(axesInfo, paddings) {
                $.each(axesInfo, function(_, info) {
                    var range = getAxisRange(info),
                        inverted = info.inverted;
                    info.minValue -= paddings[inverted ? 'end' : 'start'] * range;
                    info.maxValue += paddings[inverted ? 'start' : 'end'] * range;
                    if (range > MIN_RANGE_FOR_ADJUST_BOUNDS) {
                        info.minValue = math.min(info.minValue, adjustValueUtils(info.minValue));
                        info.maxValue = mathMax(info.maxValue, adjustValueUtils(info.maxValue))
                    }
                })
            };
        var updateTickValuesIfSyncronizedValueUsed = function(axesInfo) {
                var hasSyncronizedValue = false;
                $.each(axesInfo, function(_, info) {
                    hasSyncronizedValue = hasSyncronizedValue || isDefinedUtils(info.synchronizedValue)
                });
                $.each(axesInfo, function(_, info) {
                    var lastTickValue,
                        tickInterval = info.tickInterval,
                        tickValues = info.tickValues,
                        maxValue = info.maxValue,
                        minValue = info.minValue;
                    if (hasSyncronizedValue && tickInterval) {
                        while (tickValues[0] - tickInterval >= minValue)
                            tickValues.unshift(adjustValueUtils(tickValues[0] - tickInterval));
                        lastTickValue = tickValues[tickValues.length - 1];
                        while ((lastTickValue = lastTickValue + tickInterval) <= maxValue)
                            tickValues.push(utils.isExponential(lastTickValue) ? adjustValueUtils(lastTickValue) : utils.applyPrecisionByMinDelta(minValue, tickInterval, lastTickValue))
                    }
                    while (tickValues[0] < minValue)
                        tickValues.shift();
                    while (tickValues[tickValues.length - 1] > maxValue)
                        tickValues.pop()
                })
            };
        var applyMinMaxValues = function(axesInfo) {
                $.each(axesInfo, function(_, info) {
                    var axis = info.axis,
                        range = axis.translator.getBusinessRange();
                    if (range.min === range.minVisible)
                        range.min = info.minValue;
                    if (range.max === range.maxVisible)
                        range.max = info.maxValue;
                    range.minVisible = info.minValue;
                    range.maxVisible = info.maxValue;
                    if (isDefinedUtils(info.stubData))
                        range.stubData = info.stubData;
                    if (range.min > range.minVisible)
                        range.min = range.minVisible;
                    if (range.max < range.maxVisible)
                        range.max = range.maxVisible;
                    axis.translator.updateBusinessRange(range);
                    axis.setRange(range);
                    axis.setTickValues(info.tickValues)
                })
            };
        DX.viz.charts.multiAxesSynchronizer = {synchronize: function(valueAxes) {
                $.each(getValueAxesPerPanes(valueAxes), function(_, axes) {
                    var axesInfo,
                        paddings;
                    if (axes.length > 1) {
                        axesInfo = populateAxesInfo(axes);
                        if (axesInfo.length === 0 || !getMainAxisInfo(axesInfo))
                            return;
                        updateTickValues(axesInfo);
                        correctMinMaxValues(axesInfo);
                        paddings = calculatePaddings(axesInfo);
                        correctMinMaxValuesByPaddings(axesInfo, paddings);
                        updateTickValuesIfSyncronizedValueUsed(axesInfo);
                        $.each(axesInfo, function() {
                            convertAxisInfo(this, logConvertor)
                        });
                        applyMinMaxValues(axesInfo)
                    }
                })
            }}
    })(jQuery, DevExpress);
    /*! Module viz-charts, file tracker.js */
    (function($, DX) {
        var charts = DX.viz.charts,
            eventsConsts = DX.viz.core.series.helpers.consts.events,
            utils = DX.utils,
            isFunction = utils.isFunction,
            isDefined = utils.isDefined,
            MULTIPLE_MODE = 'multiple',
            SINGLE_MODE = 'single',
            ALL_ARGUMENTS_POINTS_MODE = 'allargumentpoints',
            ALL_SERIES_POINTS_MODE = 'allseriespoints',
            msPointerEnabled = window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints || window.navigator.pointerEnabled && window.navigator.maxTouchPoints || null,
            MOUSE_EVENT_LOCK_TIMEOUT = 1000,
            CLICK_EVENT_LOCK_TIMEOUT = 600,
            HOVER_START_DELAY = 100,
            HOVER_HOLD_DELAY = 200,
            TOOLTIP_HOLD_TIMEOUT = 400,
            NONE_MODE = 'none';
        var processMode = function(mode) {
                return (mode + "").toLowerCase()
            };
        charts.Tracker = DX.Class.inherit({
            ctor: function(options) {
                this.__HOVER_HOLD_DELAY = HOVER_HOLD_DELAY;
                this.__TOOLTIP_HOLD_TIMEOUT = TOOLTIP_HOLD_TIMEOUT;
                this.__HOVER_START_DELAY = HOVER_START_DELAY;
                var that = this,
                    events = options.events = options.events || {},
                    getEventHandler = function(func) {
                        return func && func.call ? function() {
                                var eventContext = this,
                                    eventArgs = arguments;
                                setTimeout(function() {
                                    func.apply(eventContext, eventArgs)
                                })
                            } : null
                    };
                that._reinit(options);
                that.pointSelectionMode = that._prepareMode(options.pointSelectionMode);
                that.seriesSelectionMode = that._prepareMode(options.seriesSelectionMode);
                that.hoverStartDelay = 0;
                that.sensitivity = 7;
                if (that.pointSelectionMode === MULTIPLE_MODE) {
                    that._releaseSelectedPoint = that._releaseSelectedPointMultiMode;
                    that.selectedPoint = []
                }
                else
                    that._releaseSelectedPoint = that._releaseSelectedPointSingleMode;
                if (that.seriesSelectionMode === MULTIPLE_MODE) {
                    that._releaseSelectedSeries = that._releaseSelectedSeriesMultiMode;
                    that.selectedSeries = []
                }
                else
                    that._releaseSelectedSeries = that._releaseSelectedSeriesSingleMode;
                that.tooltipEnabled = options.tooltipEnabled;
                that.tooltipShown = options.tooltipShown;
                that.tooltipHidden = options.tooltipHidden;
                that.seriesClick = getEventHandler(events.seriesClick);
                that.pointClick = getEventHandler(events.pointClick);
                that.legendClick = getEventHandler(events.legendClick);
                that.argumentAxisClick = getEventHandler(events.argumentAxisClick);
                that.seriesHover = getEventHandler(events.seriesHover);
                that.seriesSelected = getEventHandler(events.seriesSelected);
                that.pointHover = getEventHandler(events.pointHover);
                that.seriesSelectionChanged = getEventHandler(events.seriesSelectionChanged);
                that.pointSelectionChanged = getEventHandler(events.pointSelectionChanged);
                that.seriesHoverChanged = getEventHandler(events.seriesHoverChanged);
                that.pointHoverChanged = getEventHandler(events.pointHoverChanged);
                that.pointSelected = getEventHandler(events.pointSelected);
                that.renderer = options.renderer;
                that.seriesTrackerGroup = options.seriesTrackerGroup;
                that.markerTrackerGroup = options.markerTrackerGroup;
                that.seriesGroup = options.seriesGroup;
                that.seriesGroup.on(eventsConsts.selectSeries, {tracker: that}, that._selectSeries);
                that.seriesGroup.on(eventsConsts.deselectSeries, {tracker: that}, that._deselectSeries);
                that.seriesGroup.on(eventsConsts.selectPoint, {tracker: that}, that._selectPoint);
                that.seriesGroup.on(eventsConsts.deselectPoint, {tracker: that}, that._deselectPoint);
                that.seriesGroup.on(eventsConsts.showPointTooltip, {tracker: that}, that._showPointTooltip);
                that.seriesGroup.on(eventsConsts.hidePointTooltip, {tracker: that}, that._hidePointTooltip);
                that.crossHairOptions = options.crossHairOptions
            },
            _clean: function() {
                var that = this;
                that.selectedPoint = that.pointSelectionMode === MULTIPLE_MODE ? [] : null;
                that.selectedSeries = that.seriesSelectionMode === MULTIPLE_MODE ? [] : null;
                that.hoveredPoint = null;
                that.hoveredSeries = null;
                that._hideTooltip(that.pointAtShownTooltip);
                that._clearTimeouts()
            },
            _reinit: function(options) {
                var that = this;
                options = options || {};
                if (that.storedSeries !== options.series) {
                    that.storedSeries = options.series || [];
                    that._clean()
                }
                else if (isDefined(that.storedSeries)) {
                    that._clearPointSelection();
                    that._clearHover(that);
                    that._clearTimeouts()
                }
                that.argumentAxis = options.argumentAxis || [];
                that.legendGroup = options.legendGroup;
                that.legendCallback = options.legendCallback || $.noop
            },
            _clearTimeouts: function() {
                var that = this,
                    _clearTimeout = clearTimeout;
                _clearTimeout(that.tooltipHoldTimeout);
                _clearTimeout(that.cmpCoordTimeout);
                _clearTimeout(that.hoverStartTimeOut);
                _clearTimeout(that.hoverHoldTimeOut)
            },
            dispose: function() {
                var that = this;
                that._clearTimeouts();
                clearTimeout(that.unlockMouseTimer);
                clearTimeout(that.lockClickTimer);
                $.each(that.argumentAxis, function(_, axis) {
                    axis._axisElementsGroup && axis._axisElementsGroup.off()
                });
                that.seriesTrackerGroup.off();
                that.markerTrackerGroup.off();
                that.legendGroup && that.legendGroup.off();
                that.seriesGroup.off();
                that.rootTracker && that.rootTracker.off();
                that.argumentAxis = null;
                that.seriesTrackerGroup = null;
                that.markerTrackerGroup = null;
                that.legendGroup = null;
                that.legendCallback = null;
                that.seriesGroup = null;
                that.crossHairOptions = null;
                that.selectedPoint = null;
                that.selectedSeries = null;
                that.hoveredSeries = null;
                that.hoveredPoint = null;
                that.storedSeries = null;
                that.argumentAxis = null;
                that.hoveredObject = null;
                that.pointAtShownTooltip = null
            },
            _prepareMode: function(mode) {
                mode = (mode || '').toLowerCase();
                return mode = mode !== SINGLE_MODE && mode !== MULTIPLE_MODE ? SINGLE_MODE : mode
            },
            _prepare: function(typeChart) {
                var that = this;
                that.rootTracker = that.renderer.getRoot();
                $.each(that.argumentAxis, function(_, axis) {
                    axis._axisElementsGroup && that._eventHandler(axis._axisElementsGroup, {
                        parser: that._getOptionsAxis,
                        condition: that._axisCondition,
                        execute: that._axisEvent
                    }, {
                        tracker: that,
                        axis: axis
                    })
                });
                that._eventHandler(that.seriesTrackerGroup, {
                    parser: that._getOptionsPointSeries,
                    condition: that._seriesCondition,
                    execute: that._seriesEvent
                }, {tracker: that});
                that._eventHandler(that.markerTrackerGroup, {
                    parser: that._getOptionsPointSeries,
                    condition: that._pointCondition,
                    execute: that._pointEvent
                }, {tracker: that});
                that.legendGroup && that._eventHandler(that.legendGroup, {
                    parser: that._getLegendData(typeChart),
                    condition: that._seriesCondition,
                    execute: that._getLegendEvent(typeChart)
                }, {tracker: that});
                that._eventHandler(that.rootTracker, {
                    parser: that._getOptionsCrossHair,
                    execute: that._crossHairEvent
                }, {tracker: that})
            },
            _getLegendData: function(typeChart) {
                return function(event) {
                        var target = $(event.target),
                            itemIndex = target.data('itemIndex'),
                            that = event.data.tracker,
                            mode = utils.isNumber(itemIndex) && target.data('mode');
                        if (event.type === 'mousemove')
                            return [that, event.pageX, event.pageY, event.offsetX, event.offsetY];
                        if (!utils.isNumber(itemIndex))
                            return null;
                        if (typeChart === 'pieChart')
                            return [that, that.storedSeries[0].getPoints()[itemIndex], mode, event];
                        else
                            return [that, that.storedSeries[itemIndex], mode, event]
                    }
            },
            _getLegendEvent: function(typeChart) {
                var that = this,
                    legendEvent;
                if (typeChart === 'pieChart')
                    legendEvent = $.extend({}, this._pointEvent, {
                        touchend: function(that, point, mode, event) {
                            if (!that.showHoldTooltip)
                                that._legendClick(that, point, true, event) || that._pointClick(that, point, true, event);
                            clearTimeout(that.tooltipHoldTimeout);
                            that._clickLock(that);
                            that._clearHover(that)
                        },
                        click: function(that, point, mode, event) {
                            that._legendClick(that, point, false, event) || that._pointClick(that, point, false, event)
                        }
                    });
                else
                    legendEvent = $.extend({}, this._seriesEvent, {
                        click: function(that, series, mode, event) {
                            that._legendClick(that, series, false, event) || that._seriesClick(that, series, false, event)
                        },
                        touchend: function(that, series, mode, event) {
                            that._legendClick(that, series, true, event) || that._seriesClick(that, series, true, event);
                            that._clickLock(that)
                        }
                    });
                this.__legendEvent = legendEvent;
                return legendEvent
            },
            _eventHandler: function(group, handlers, data) {
                var prepareHandlers = this._designerHandlers(handlers);
                group.off(".dxc-tracker");
                group.on(prepareHandlers, data)
            },
            _designerHandlers: function(handler) {
                var handlers = {},
                    parser = handler.parser,
                    condition = handler.condition,
                    execute = handler.execute,
                    designerHandle = function(eventType, func) {
                        if (condition && condition[eventType] === null)
                            return;
                        handlers[eventType + ".dxc-tracker"] = function(event) {
                            var options = parser ? parser(event) : event;
                            if (!options)
                                return;
                            if (condition && condition[eventType] && condition[eventType].call)
                                condition[eventType].apply(null, options.concat([func]));
                            else
                                func.apply(null, options)
                        }
                    };
                $.each(execute, designerHandle);
                return handlers
            },
            _getOptionsCrossHair: function(event) {
                var that = event.data.tracker;
                var rootOffset = utils.getRootOffset(that.renderer);
                var xe = event.pageX - rootOffset.left;
                var ye = event.pageY - rootOffset.top;
                return [that, xe, ye]
            },
            _getOptionsPointSeries: function(event) {
                var object = $(event.target).data('point') || $(event.target).data('series'),
                    that = event.data.tracker,
                    mode = object && processMode($(event.target).data('mode') || object.getOptions().hoverMode);
                if (event.type === 'mousemove')
                    return [that, event.pageX, event.pageY, event.offsetX, event.offsetY];
                if (!object)
                    return null;
                return [that, object, mode, event]
            },
            _getOptionsAxis: function(event) {
                var that = event.data.tracker,
                    axis = event.data.axis,
                    mode = axis.options.hoverMode,
                    argument;
                if (event.target.tagName === "tspan")
                    argument = $(event.target).parent().data('argument');
                else
                    argument = $(event.target).data('argument');
                if (event.type === 'mousemove')
                    return [that, event.pageX, event.pageY];
                if (!axis)
                    return null;
                return [that, axis, mode, argument, event]
            },
            _pointEvent: {
                mouseover: function(that, point, mode) {
                    if (that.mouseLocked)
                        return;
                    that._setHoveredPoint(point, mode);
                    if (that.tooltipEnabled && point && point.getOptions())
                        that._compareCoords(that, function() {
                            that._showTooltip(that.tooltip, point)
                        })
                },
                mouseout: function(that, point, mode) {
                    if (that.mouseLocked)
                        return;
                    that._clearHover(that)
                },
                touchmove: function(that, point, mode) {
                    clearTimeout(that.tooltipHoldTimeout);
                    that.tooltipHoldTimeout = null;
                    that.showHoldTooltip = true
                },
                mousemove: function(that, pageX, pageY, offsetX, offsetY) {
                    that._setCurCoords(that, pageX, pageY)
                },
                touchstart: function(that, point, mode) {
                    that.showHoldTooltip = false;
                    that._mouseLock(that);
                    if (that.tooltipEnabled)
                        that.tooltipHoldTimeout = setTimeout(function() {
                            that.showHoldTooltip = true;
                            that._showTooltip(that.tooltip, point)
                        }, TOOLTIP_HOLD_TIMEOUT)
                },
                touchend: function(that, point, mode, event) {
                    if (!that.showHoldTooltip)
                        that._pointClick(that, point, true, event);
                    clearTimeout(that.tooltipHoldTimeout);
                    that._clickLock(that);
                    that._clearHover(that)
                },
                click: function(that, point, mode, event) {
                    that._pointClick(that, point, false, event)
                },
                mousedown: function(that, point, mode) {
                    that._pointEvent.touchstart(that, point, mode)
                },
                mouseup: function(that, point, mode, event) {
                    that._pointEvent.touchend(that, point, mode, event)
                }
            },
            _pointCondition: {
                mouseover: function(that, point, mode, event, func) {
                    if (mode === ALL_ARGUMENTS_POINTS_MODE && that.hoveredPoint && that.hoveredPoint.argument === point.argument) {
                        that.hoverHoldTimeOut = clearTimeout(that.hoverHoldTimeOut);
                        that.hoveredObject = point;
                        func(that, point, mode);
                        return
                    }
                    that._setHover(that, point, mode, func)
                },
                mouseout: function(that, point, mode, event, func) {
                    that._releaseHover(that, point, mode, func)
                },
                touchstart: !msPointerEnabled,
                touchend: !msPointerEnabled,
                mousedown: msPointerEnabled,
                mouseup: msPointerEnabled
            },
            _seriesEvent: {
                mouseover: function(that, series, mode) {
                    if (that.mouseLocked)
                        return;
                    that._setHoveredSeries(series, mode)
                },
                mouseout: function(that, series, mode) {
                    that._clearHover(that)
                },
                mousemove: function(that, pageX, pageY, offsetX, offsetY) {
                    that._setCurCoords(that, pageX, pageY)
                },
                touchstart: function(that) {
                    that._mouseLock(that)
                },
                touchend: function(that, series, _, event) {
                    that._seriesClick(that, series, true, event);
                    that._clickLock(that)
                },
                click: function(that, series, mode, event) {
                    that._seriesClick(that, series, false, event)
                },
                mousedown: function(that, point, mode) {
                    that._seriesEvent.touchstart(that, point, mode)
                },
                mouseup: function(that, point, mode) {
                    that._seriesEvent.touchend(that, point, mode)
                }
            },
            _crossHairEvent: {
                mousemove: function(that, x, y) {
                    if (!that.eventType) {
                        that.eventType = 'mouse';
                        return
                    }
                    else if (that.eventType === 'touch')
                        return;
                    else if (that.eventType === 'mouse') {
                        that._moveCrossHair(that, x, y);
                        that.eventType = null
                    }
                },
                mouseout: function(that) {
                    that._hideCrossHair(that);
                    that.eventType = null
                },
                touchstart: function(that, x, y) {
                    that.eventType = 'touch'
                },
                touchend: function(that, x, y) {
                    that.eventType = null
                },
                mousedown: function(that, x, y) {
                    that._crossHairEvent.touchstart(that, x, y)
                },
                mouseup: function(that, x, y) {
                    that._crossHairEvent.touchend(that, x, y)
                }
            },
            _hideCrossHair: function(that) {
                if (!that.crossHairOptions)
                    return;
                var horizontalLine = that.crossHairOptions.horizontalLine,
                    verticalLine = that.crossHairOptions.verticalLine;
                horizontalLine && horizontalLine.applySettings({visibility: 'hidden'});
                verticalLine && verticalLine.applySettings({visibility: 'hidden'})
            },
            _moveCrossHair: function(that, x, y) {
                if (!that.crossHairOptions)
                    return;
                var horizontalLine = that.crossHairOptions.horizontalLine,
                    verticalLine = that.crossHairOptions.verticalLine,
                    canvas = that.crossHairOptions.canvas || {};
                if (x > canvas.left && x < canvas.width - canvas.right && y > canvas.top && y < canvas.height - canvas.bottom) {
                    horizontalLine && horizontalLine.applySettings({visibility: 'visible'});
                    verticalLine && verticalLine.applySettings({visibility: 'visible'});
                    horizontalLine && horizontalLine.applySettings({translateY: y - canvas.top});
                    verticalLine && verticalLine.applySettings({translateX: x - canvas.left})
                }
                else {
                    horizontalLine && horizontalLine.applySettings({visibility: 'hidden'});
                    verticalLine && verticalLine.applySettings({visibility: 'hidden'})
                }
            },
            _seriesCondition: {
                mouseover: function(that, series, mode, event, func) {
                    that.hoverStartDelay = 0;
                    that._setHover(that, series, mode, func)
                },
                mouseout: function(that, series, mode, event, func) {
                    that.hoverStartDelay = HOVER_START_DELAY;
                    that._releaseHover(that, series, mode, func)
                },
                touchstart: !msPointerEnabled,
                touchend: !msPointerEnabled,
                mousedown: msPointerEnabled,
                mouseup: msPointerEnabled
            },
            _axisEvent: {
                mouseover: function(that, axis, argument) {
                    if (that.mouseLocked || isDefined(that.hoveredArgument) && that.hoveredArgument === argument)
                        return;
                    that._clearHover(that);
                    if (isDefined(that.hoveredArgument))
                        that._toAllArgumentPoints(that.hoveredArgument, 'releasePointHoverState');
                    that._toAllArgumentPoints(argument, 'setPointHoverState');
                    that.hoveredArgument = argument
                },
                mouseout: function(that, axis) {
                    if (that.mouseLocked || !isDefined(that.hoveredArgument))
                        return;
                    that._toAllArgumentPoints(that.hoveredArgument, 'releasePointHoverState');
                    that.hoveredArgument = null
                },
                mousemove: function(that, pageX, pageY) {
                    that._setCurCoords(that, pageX, pageY)
                },
                touchstart: function(that) {
                    that._mouseLock(that)
                },
                touchend: function(that, axis, mode, argument, event) {
                    that._argumentAxisClick(that, axis, argument, true, event);
                    that._clearHover(that);
                    that._clickLock(that)
                },
                click: function(that, axis, mode, argument, event) {
                    that._clearHover(that);
                    that._argumentAxisClick(that, axis, argument, false, event)
                },
                mousedown: function(that) {
                    that._axisEvent.touchstart(that)
                },
                mouseup: function(that, axis, mode, argument, event) {
                    that._axisEvent.touchend(that, axis, mode, argument, event)
                }
            },
            _axisCondition: {
                mouseover: function(that, axis, mode, argument, event, func) {
                    that._hideCrossHair(that);
                    if (mode === ALL_ARGUMENTS_POINTS_MODE)
                        that._setHover(that, axis, argument, func)
                },
                mouseout: function(that, axis, mode, argument, event, func) {
                    that._releaseHover(that, axis, argument, func)
                },
                touchstart: !msPointerEnabled,
                touchend: !msPointerEnabled,
                mousedown: msPointerEnabled,
                mouseup: msPointerEnabled
            },
            _setHover: function(that, object, mode, func) {
                if (object === that.hoveredObject) {
                    that.hoverHoldTimeOut = clearTimeout(that.hoverHoldTimeOut);
                    if (mode === object.lastHoverMode)
                        return
                }
                if (that.mouseLocked)
                    return;
                clearTimeout(that.cmpCoordTimeout);
                clearTimeout(that.hoverStartTimeOut);
                that.hoverStartTimeOut = setTimeout(function() {
                    clearTimeout(that.hoverHoldTimeOut);
                    that.hoveredObject = object;
                    func(that, object, mode)
                }, that.hoverStartDelay)
            },
            _releaseHover: function(that, object, mode, func) {
                if (that.mouseLocked)
                    return;
                clearTimeout(that.cmpCoordTimeout);
                clearTimeout(that.hoverStartTimeOut);
                if (object === that.hoveredObject)
                    that.hoverHoldTimeOut = setTimeout(function() {
                        that.hoveredObject = null;
                        func(that, object, mode);
                        that.hoverStartDelay = 0
                    }, HOVER_HOLD_DELAY)
            },
            _compareCoords: function(that, func) {
                clearTimeout(that.cmpCoordTimeout);
                if (Math.abs(that.pX - that.cX) + Math.abs(that.pY - that.cY) < that.sensitivity) {
                    if (that.mouseLocked)
                        return;
                    func()
                }
                else {
                    that.pX = that.cX;
                    that.pY = that.cY;
                    that.cmpCoordTimeout = setTimeout(function() {
                        that._compareCoords(that, func)
                    }, that.hoverStartDelay === 0 ? HOVER_START_DELAY : 0)
                }
            },
            _seriesClick: function(that, series, touchEvent, event) {
                if (that.lockClick && !touchEvent)
                    return;
                that.seriesClick && that.seriesClick.call(series, series, event)
            },
            _legendClick: function(that, series, touchEvent, event) {
                var legendClick = that.legendClick;
                if (that.lockClick && !touchEvent)
                    return true;
                if (legendClick) {
                    legendClick.call(series, series, event);
                    return true
                }
                return false
            },
            _pointClick: function(that, point, touchEvent, event) {
                var series = point.series;
                if (that.lockClick && !touchEvent)
                    return;
                if (that.pointClick) {
                    that.pointClick.call(point, point, event);
                    return
                }
                that.seriesClick && that.seriesClick.call(series, series, event);
                return
            },
            _argumentAxisClick: function(that, axis, argument, touchEvent, event) {
                if (that.lockClick && !touchEvent)
                    return;
                that.argumentAxisClick && that.argumentAxisClick.call(axis, axis, argument, event)
            },
            _selectSeries: function(event, mode) {
                event.data.tracker._setSelectedSeries(event.target, mode)
            },
            _deselectSeries: function(event, mode) {
                event.data.tracker._releaseSelectedSeries(event.target, mode)
            },
            _selectPoint: function(event, point) {
                event.data.tracker._setSelectedPoint(point)
            },
            _deselectPoint: function(event, point) {
                event.data.tracker._releaseSelectedPoint(point)
            },
            _showPointTooltip: function(event, point) {
                var that = event.data.tracker;
                that._showTooltip(that.tooltip, point)
            },
            _hidePointTooltip: function(event, point) {
                event.data.tracker._hideTooltip(point)
            },
            _hideTooltip: function(point) {
                var tooltip = this && this.tooltip;
                if (!tooltip || point && this.pointAtShownTooltip !== point)
                    return;
                point = point || this.pointAtShownTooltip;
                tooltip.hide();
                if (this.pointAtShownTooltip) {
                    this.pointAtShownTooltip = null;
                    isFunction(this.tooltipHidden) && this.tooltipHidden.call(point, point)
                }
            },
            _showTooltip: function(tooltip, point) {
                var tooltipFormatObject = point.getTooltipFormatObject(tooltip);
                if (!isDefined(tooltipFormatObject.valueText) && !tooltipFormatObject.points || !point.isVisible())
                    return;
                this.pointAtShownTooltip && this._hideTooltip(this.pointAtShownTooltip);
                if (point && point.getOptions()) {
                    var tooltipCoords = point.getTooltipCoords();
                    if (!tooltip.prepare(tooltipFormatObject, {
                        x: tooltipCoords.x,
                        y: tooltipCoords.y,
                        offset: tooltipCoords.offset
                    }))
                        return;
                    tooltip.show();
                    !this.pointAtShownTooltip && isFunction(this.tooltipShown) && this.tooltipShown.call(point, point);
                    this.pointAtShownTooltip = point
                }
            },
            _setHoveredSeries: function(series, mode) {
                var that = this;
                if (mode !== NONE_MODE && that.hoveredSeries !== series || series.lastHoverMode !== mode) {
                    that._clearHover(that);
                    that.hoveredSeries = series;
                    series.setHoverState(mode, that.legendCallback(series));
                    that.seriesHover && that.seriesHover.call(series, series);
                    that.seriesHoverChanged && that.seriesHoverChanged.call(series, series)
                }
                if (mode === NONE_MODE)
                    $(series).trigger('NoneMode')
            },
            _setSelectedSeries: function(series, mode) {
                var that = this,
                    seriesContain = false;
                if (this.seriesSelectionMode === MULTIPLE_MODE)
                    $.each(that.selectedSeries, function(_, sr) {
                        if (sr == series) {
                            seriesContain = true;
                            return false
                        }
                    });
                else if (that.selectedSeries == series)
                    seriesContain = true;
                if (!seriesContain || series.lastSelectionMode !== mode) {
                    if (that.seriesSelectionMode === SINGLE_MODE) {
                        this._releaseSelectedSeries();
                        that.selectedSeries = series
                    }
                    else
                        that.selectedSeries.push(series);
                    series.setSelectedState(mode, that.legendCallback(series));
                    that.seriesSelected && that.seriesSelected.call(series, series);
                    that.seriesSelectionChanged && that.seriesSelectionChanged.call(series, series)
                }
            },
            _setHoveredPoint: function(point, mode) {
                var that = this;
                var debug = DX.utils.debug;
                debug.assert(point.series, 'series was not assigned to point or empty');
                if (that.hoveredPoint === point && !point.series)
                    return;
                that._clearHover(that);
                that.hoveredPoint = point;
                if (point && point.getOptions())
                    that._setHoverStylePointWithMode(point, 'setPointHoverState', mode || processMode(point.getOptions().hoverMode), that.pointHoverChanged, that.legendCallback(point));
                that.pointHover && that.pointHover.call(point, point)
            },
            _toAllArgumentPoints: function(argument, func, callBack) {
                var that = this;
                $.each(that.storedSeries, function(_, series) {
                    var neighborPoint = series.getPointByArg(argument);
                    if (neighborPoint) {
                        series[func](neighborPoint);
                        callBack && callBack.call(neighborPoint, neighborPoint)
                    }
                })
            },
            _setHoverStylePointWithMode: function(point, func, mode, callBack, legendCallback) {
                var that = this;
                switch (mode) {
                    case ALL_ARGUMENTS_POINTS_MODE:
                        this._toAllArgumentPoints(point.argument, func, callBack);
                        break;
                    case ALL_SERIES_POINTS_MODE:
                        $.each(point.series.getPoints(), function(_, point) {
                            point.series[func](point);
                            callBack && callBack.call(point, point)
                        });
                        break;
                    case NONE_MODE:
                        break;
                    default:
                        point.series[func](point, legendCallback);
                        callBack && callBack.call(point, point)
                }
            },
            _setSelectedPoint: function(point) {
                var that = this,
                    pointContain = false;
                if (this.pointSelectionMode === MULTIPLE_MODE) {
                    $.each(that.selectedPoint, function(_, pt) {
                        if (pt == point) {
                            pointContain = true;
                            return false
                        }
                    });
                    !pointContain && that.selectedPoint.push(point)
                }
                else if (that.selectedPoint !== point) {
                    this._releaseSelectedPoint();
                    that.selectedPoint = point
                }
                else
                    pointContain = true;
                if (!pointContain) {
                    that._setHoverStylePointWithMode(point, 'setPointSelectedState', processMode(point.getOptions().selectionMode), that.pointSelectionChanged, that.legendCallback(point));
                    that.pointSelected && that.pointSelected.call(point, point)
                }
            },
            _releaseHoveredSeries: function() {
                var that = this;
                if (!that.hoveredSeries)
                    return;
                that.hoveredSeries.releaseHoverState(undefined, that.legendCallback(that.hoveredSeries));
                that.seriesHoverChanged && that.seriesHoverChanged.call(that.hoveredSeries, that.hoveredSeries);
                that.hoveredSeries = null
            },
            _releaseSelectedSeriesMultiMode: function(series) {
                var that = this;
                if (!that.selectedSeries)
                    return;
                series.releaseSelectedState(undefined, that.legendCallback(series));
                that.seriesSelectionChanged && that.seriesSelectionChanged.call(series, series);
                that.selectedSeries = $.map(that.selectedSeries, function(sr) {
                    if (sr !== series)
                        return sr
                })
            },
            _releaseSelectedSeriesSingleMode: function() {
                var that = this,
                    series = this.selectedSeries;
                if (!series)
                    return;
                series.releaseSelectedState(undefined, that.legendCallback(series));
                that.seriesSelectionChanged && that.seriesSelectionChanged.call(series, series);
                that.selectedSeries = null
            },
            _releaseHoveredPoint: function() {
                var that = this,
                    point = that.hoveredPoint,
                    mode;
                if (!point || !point.getOptions())
                    return;
                mode = processMode(point.getOptions().hoverMode);
                if (mode === ALL_SERIES_POINTS_MODE)
                    $.each(point.series.getPoints(), function(_, point) {
                        point.series.releasePointHoverState(point);
                        that.pointHoverChanged && that.pointHoverChanged.call(point, point)
                    });
                else if (mode === ALL_ARGUMENTS_POINTS_MODE)
                    that._toAllArgumentPoints(point.argument, 'releasePointHoverState', that.pointHoverChanged);
                else {
                    point.releaseHoverState(that.legendCallback(point));
                    that.pointHoverChanged && that.pointHoverChanged.call(point, point)
                }
                if (that.tooltipEnabled && !that.showHoldTooltip)
                    that._hideTooltip(point);
                that.hoveredPoint = null
            },
            _releaseSelectedPointMultiMode: function(point) {
                var that = this,
                    points = that.selectedPoint;
                if (!points)
                    return;
                that._setHoverStylePointWithMode(point, 'releasePointSelectedState', processMode(point.getOptions().selectionMode), that.pointSelectionChanged, that.legendCallback(point));
                this.selectedPoint = $.map(this.selectedPoint, function(pt) {
                    if (pt !== point)
                        return pt
                })
            },
            _releaseSelectedPointSingleMode: function() {
                var that = this,
                    point = that.selectedPoint;
                if (!point)
                    return;
                that._setHoverStylePointWithMode(point, 'releasePointSelectedState', processMode(point.getOptions().selectionMode), that.pointSelectionChanged, that.legendCallback(point));
                this.selectedPoint = null
            },
            _clearPointSelection: function() {
                var that = this;
                if (that.pointSelectionMode === SINGLE_MODE)
                    that._releaseSelectedPoint();
                else
                    $.each(that.selectedPoint || [], function(_, point) {
                        that._releaseSelectedPoint(point)
                    })
            },
            clearSelection: function() {
                var that = this;
                that._clearPointSelection();
                if (that.seriesSelectionMode === SINGLE_MODE)
                    that._releaseSelectedSeries();
                else
                    $.each(that.selectedSeries, function(_, series) {
                        that._releaseSelectedSeries(series)
                    })
            },
            setTooltip: function(tooltip) {
                this.tooltip = tooltip
            },
            _mouseLock: function(tracker) {
                if (tracker.unlockMouseTimer)
                    clearTimeout(tracker.unlockMouseTimer);
                tracker.mouseLocked = true;
                tracker.unlockMouseTimer = setTimeout(function() {
                    tracker.mouseLocked = false
                }, MOUSE_EVENT_LOCK_TIMEOUT)
            },
            _clickLock: function(tracker) {
                tracker.lockClick = true;
                if (tracker.lockClickTimer)
                    clearTimeout(tracker.lockClickTimer);
                tracker.lockClickTimer = setTimeout(function() {
                    tracker.lockClick = false
                }, CLICK_EVENT_LOCK_TIMEOUT)
            },
            _setCurCoords: function(that, pageX, pageY) {
                that.cX = pageX;
                that.cY = pageY
            },
            _clearHover: function(that) {
                that._releaseHoveredSeries();
                that._releaseHoveredPoint()
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-charts, file dxChart.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            viz = DX.viz;
        DX.registerComponent("dxChart", viz.charts.Chart)
    })(jQuery, DevExpress);
    /*! Module viz-charts, file dxPieChart.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            viz = DX.viz;
        DX.registerComponent("dxPieChart", viz.charts.PieChart)
    })(jQuery, DevExpress);
    DevExpress.MOD_VIZ_CHARTS = true
}