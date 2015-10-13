/*! 
* DevExtreme (Sparklines)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_VIZ_SPARKLINES) {
    if (!DevExpress.MOD_VIZ_CORE)
        throw Error('Required module is not referenced: viz-core');
    /*! Module viz-sparklines, file baseSparkline.js */
    (function($, DX) {
        var TOOLTIP_MARGIN = 100,
            TOOLTIP_ARROW_MARGIN = 10,
            DEFAULT_LINE_SPACING = 6,
            DEFAULT_EVENTS_DELAY = 200,
            TOUCH_EVENTS_DELAY = 1000,
            _extend = $.extend,
            _abs = Math.abs,
            _Number = Number,
            _round = Math.round,
            core = DX.viz.core,
            CoreFactory = core.CoreFactory;
        function DEFAULT_CUSTOMIZE_TOOLTIP(customizeObject) {
            return {text: customizeObject.valueText.join('<br/>')}
        }
        DX.viz.sparklines = {};
        DX.viz.sparklines.DEFAULT_CUSTOMIZE_TOOLTIP = DEFAULT_CUSTOMIZE_TOOLTIP;
        DX.viz.sparklines.BaseSparkline = core.BaseWidget.inherit({
            render: function() {
                this._refresh();
                return this
            },
            _rendererType: DX.viz.renderers.Renderer,
            _clean: function() {
                if (this._tooltipShown) {
                    this._tooltip.dispose();
                    this._tooltip = null;
                    this._tooltipShown = null;
                    this._tooltipGroup.clear()
                }
                this._tooltipContainer.detach();
                this._cleanWidgetElements()
            },
            _optionChanged: function(optionName, value) {
                if (optionName === 'size' && this._allOptions) {
                    this._clean();
                    this._canvas = this._calculateCanvas();
                    this._renderer.resize(this._canvas.width, this._canvas.height);
                    if (!this._isContainerVisible())
                        return;
                    this._allOptions.size = value;
                    this._redrawWidgetElements();
                    this._prepareTooltipContainer()
                }
                else if (optionName === 'dataSource' && this._allOptions)
                    this._refreshDataSource();
                else
                    this.callBase.apply(this, arguments)
            },
            _init: function() {
                this.callBase();
                this._canvas = this._calculateCanvas();
                this._renderer = new this._rendererType({
                    cssClass: this._widgetClass + ' ' + this._widgetClass + '-' + this._widgetType,
                    pathModified: this.option('pathModified'),
                    rtl: this.option('rtlEnabled')
                });
                this._renderer.recreateCanvas(this._canvas.width, this._canvas.height);
                this._createHtmlElements();
                this._createTooltipGroups();
                this._initTooltipEvents();
                this._drawContainer()
            },
            _dispose: function() {
                var that = this;
                that.callBase();
                that._disposeWidgetElements();
                that._disposeTooltipEvents();
                that._renderer.dispose();
                that._tooltipRenderer.dispose();
                that._translatorX = null;
                that._translatorY = null;
                delete that._renderer;
                delete that._tooltipRenderer;
                delete that._tooltipTrackerGroup;
                delete that._tooltipGroup;
                delete that._tooltipContainer
            },
            _render: function() {
                var that = this;
                that._canvas = that._calculateCanvas();
                that._renderer.resize(that._canvas.width, that._canvas.height);
                if (!that._isContainerVisible()) {
                    that._incidentOccured('W2001', [that.NAME]);
                    return
                }
                that._prepareOptions();
                that._createWidgetElements();
                that._drawWidgetElements();
                that._drawn()
            },
            _isContainerVisible: function() {
                var that = this,
                    canvas = that._canvas,
                    enoughWidth = canvas.width - canvas.left - canvas.right > 0,
                    enoughHeight = canvas.height - canvas.top - canvas.bottom > 0;
                return canvas.height && canvas.width && enoughHeight && enoughWidth
            },
            _createWidgetElements: function() {
                this._createRange();
                this._createTranslator()
            },
            _prepareOptions: function(defaultOptions) {
                var that = this,
                    userOptions = that.option() || {},
                    options,
                    defaultTheme,
                    theme;
                defaultTheme = core.findTheme('default');
                defaultTheme = defaultTheme[this._widgetType];
                options = _extend(true, {}, defaultOptions, userOptions);
                if (typeof options.theme === 'string') {
                    theme = core.findTheme(options.theme);
                    theme = theme[this._widgetType]
                }
                else
                    theme = options.theme;
                return _extend(true, {}, defaultTheme, theme, options)
            },
            _calculateCanvas: function() {
                var that = this,
                    canvas = {},
                    sizeOptions = that.option('size') || {},
                    marginOptions = that.option('margin') || {},
                    defaultSize = that._defaultSize,
                    container = that._element(),
                    width = sizeOptions.width >= 0 ? _Number(sizeOptions.width) : container.width(),
                    height = sizeOptions.height >= 0 ? _Number(sizeOptions.height) : container.height();
                if (!width && _Number(sizeOptions.width) !== 0)
                    width = defaultSize.width;
                if (!height && _Number(sizeOptions.height) !== 0)
                    height = defaultSize.height;
                return {
                        width: width,
                        height: height,
                        top: _Number(marginOptions.top) || defaultSize.top,
                        bottom: _Number(marginOptions.bottom) || defaultSize.bottom,
                        left: _Number(marginOptions.left) || defaultSize.left,
                        right: _Number(marginOptions.right) || defaultSize.right
                    }
            },
            _createTooltipGroups: function() {
                var that = this,
                    renderer,
                    root,
                    widgetClass = that._widgetClass;
                that._tooltipRenderer = renderer = new that._rendererType({
                    cssClass: widgetClass + ' ' + widgetClass + '-tooltip',
                    pathModified: this.option('pathModified'),
                    rtl: this.option('rtlEnabled')
                });
                renderer.recreateCanvas(1, 1);
                that._tooltipContainer = $('<div style="position: relative">');
                renderer.draw(that._tooltipContainer[0]);
                root = renderer.getRoot();
                that._tooltipGroup = renderer.createGroup({
                    'class': widgetClass + '-tooltip-group',
                    style: {'z-index': '1'}
                }).append(root);
                that._tooltipTrackerGroup = renderer.createGroup({'class': widgetClass + '-tooltip-tracker-group'}).append(root);
                that._tooltipTracker = that._createTooltipTracker().append(that._tooltipTrackerGroup)
            },
            _createTooltipTracker: function() {
                return this._tooltipRenderer.createRect(0, 0, 0, 0, 0, {
                        fill: 'grey',
                        opacity: 0
                    })
            },
            _initTooltipEvents: function() {
                var that = this,
                    data = {
                        widget: that,
                        container: that._tooltipTracker
                    };
                that._showTooltipCallback = function() {
                    that._showTooltipTimeout = null;
                    if (!that._tooltipShown) {
                        that._tooltipShown = true;
                        that._showTooltip()
                    }
                    that._DEBUG_showCallback && that._DEBUG_showCallback()
                };
                that._hideTooltipCallback = function() {
                    that._hideTooltipTimeout = null;
                    if (that._tooltipShown) {
                        that._tooltipShown = false;
                        that._hideTooltip()
                    }
                    that._DEBUG_hideCallback && that._DEBUG_hideCallback()
                };
                that._disposeCallbacks = function() {
                    that = that._showTooltipCallback = that._hideTooltipCallback = that._disposeCallbacks = null
                };
                that._tooltipTracker.on(mouseEvents, data).on(touchEvents, data);
                that._tooltipTracker.on(menuEvents)
            },
            _disposeTooltipEvents: function() {
                clearTimeout(this._showTooltipTimeout);
                clearTimeout(this._hideTooltipTimeout);
                this._showTooltipTimeout = this._showTooltipTimeout = null;
                this._tooltipTracker.off();
                this._disposeCallbacks()
            },
            _drawContainer: function() {
                this._renderer.draw(this._element()[0])
            },
            _createTranslator: function() {
                this._translatorX = CoreFactory.createTranslator2D(this._ranges.arg, this._canvas, {direction: "horizontal"});
                this._translatorY = CoreFactory.createTranslator2D(this._ranges.val, this._canvas)
            },
            _prepareTooltipOptions: function() {
                var that = this,
                    canvas = that._canvas,
                    tooltipOpt = that._allOptions.tooltip,
                    size = that._getTooltipSize(true),
                    defaultOptions = {
                        canvasWidth: size.width,
                        canvasHeight: size.height,
                        paddingLeftRight: tooltipOpt.paddingLeftRight,
                        paddingTopBottom: tooltipOpt.paddingTopBottom,
                        arrowLength: tooltipOpt.arrowLength,
                        cloudHorizontalPosition: tooltipOpt.horizontalAlignment,
                        cloudVerticalPosition: tooltipOpt.verticalAlignment,
                        lineSpacing: tooltipOpt.font.lineSpacing !== undefined && tooltipOpt.font.lineSpacing !== null ? tooltipOpt.font.lineSpacing : DEFAULT_LINE_SPACING
                    },
                    autoJustify = !$.isFunction(that._allOptions.tooltip.customizeText) && !$.isFunction(that._allOptions.tooltip.customizeTooltip),
                    options = $.extend(defaultOptions, that._allOptions.tooltip, {
                        customizeTooltip: autoJustify ? DEFAULT_CUSTOMIZE_TOOLTIP : that._allOptions.tooltip.customizeTooltip,
                        _justify: that._allOptions.tooltip._justify || autoJustify,
                        _rtl: that.option('rtlEnabled')
                    });
                that._tooltipOptions = {
                    size: size,
                    options: options
                };
                return options
            },
            _prepareTooltipContainer: function() {
                var that = this,
                    canvas = that._canvas,
                    width = canvas.width,
                    height = canvas.height,
                    renderer = that._tooltipRenderer;
                that._updateTooltipSizeToNormal();
                that._tooltipTracker.applySettings({
                    width: width,
                    height: height
                });
                that._tooltipContainer.appendTo(that._element());
                that._tooltipInitializated = false;
                that._canShowTooltip = that._allOptions.tooltip.enabled
            },
            _isTooltipVisible: function() {
                return this._tooltip.enabled() && this._tooltip.prepare(this._getTooltipData(), {offset: 0})
            },
            _createTooltip: function() {
                var that = this;
                that._tooltip = CoreFactory.createTooltip(that._prepareTooltipOptions(), that._tooltipGroup, that._tooltipRenderer);
                if (that._isTooltipVisible()) {
                    that._tooltip.show();
                    that._updateTooltipSizeToWide();
                    that._checkTooltipSize();
                    that._updateTooltipSizeToNormal()
                }
                else
                    that._canShowTooltip = false
            },
            _doShowTooltip: function(delay) {
                var that = this;
                if (!that._canShowTooltip)
                    return;
                ++that._DEBUG_clearHideTooltipTimeout;
                clearTimeout(that._hideTooltipTimeout);
                that._hideTooltipTimeout = null;
                clearTimeout(that._showTooltipTimeout);
                ++that._DEBUG_showTooltipTimeoutSet;
                that._showTooltipTimeout = setTimeout(that._showTooltipCallback, delay)
            },
            _doHideTooltip: function(delay) {
                var that = this;
                if (!that._canShowTooltip)
                    return;
                ++that._DEBUG_clearShowTooltipTimeout;
                clearTimeout(that._showTooltipTimeout);
                that._showTooltipTimeout = null;
                clearTimeout(that._hideTooltipTimeout);
                ++that._DEBUG_hideTooltipTimeoutSet;
                that._hideTooltipTimeout = setTimeout(that._hideTooltipCallback, delay)
            },
            _getNormalTooltipSize: function() {
                var size = {};
                size.width = this._canvas.width;
                size.left = 0;
                size.tooltipLeft = _round(size.width / 2);
                return size
            },
            _getWideTooltipSize: function(leftWidthDelta, rightWidthDelta) {
                var that = this,
                    canvas = that._canvas,
                    horizontalPos = that._allOptions.tooltip.horizontalAlignment,
                    widthDelta = leftWidthDelta + rightWidthDelta,
                    size = {};
                size.width = canvas.width + widthDelta;
                size.left = -leftWidthDelta;
                if (horizontalPos === 'right')
                    size.tooltipLeft = _round(canvas.width / 2);
                else if (horizontalPos === 'left')
                    size.tooltipLeft = _round(canvas.width / 2) + widthDelta;
                else
                    size.tooltipLeft = _round(size.width / 2);
                return size
            },
            _getTooltipSize: function(isNormal, leftWidthDelta, rightWidthDelta, heightDelta) {
                var that = this,
                    canvas = that._canvas,
                    isVerticalPosTop = !(that._allOptions.tooltip.verticalAlignment === 'bottom'),
                    size = !isNormal && (leftWidthDelta || rightWidthDelta) ? that._getWideTooltipSize(leftWidthDelta, rightWidthDelta) : that._getNormalTooltipSize(),
                    yDelta = heightDelta > 0 ? heightDelta + TOOLTIP_MARGIN : TOOLTIP_MARGIN;
                size.height = canvas.height + yDelta;
                size.top = isVerticalPosTop ? -size.height : -canvas.height;
                size.trackerY = isVerticalPosTop ? yDelta : 0;
                size.tooltipY = isVerticalPosTop ? _round(canvas.height / 2) + yDelta - TOOLTIP_ARROW_MARGIN : _round(canvas.height / 2);
                return size
            },
            _checkTooltipSize: function() {
                var that = this,
                    tooltip = that._tooltip,
                    options = that._tooltipOptions.options,
                    tooltipBBox = tooltip.getBBox(),
                    getWide = that._allOptions.tooltip.allowContainerResizing,
                    leftDelta = -tooltipBBox.x,
                    rightDelta = tooltipBBox.x + tooltipBBox.width - that._canvas.width,
                    topDelta = tooltipBBox.height - TOOLTIP_MARGIN,
                    size;
                if (leftDelta > 0 || rightDelta > 0 || topDelta > 0)
                    if (getWide) {
                        that._tooltipOptions.size = size = that._getTooltipSize(false, leftDelta > 0 ? leftDelta : 0, rightDelta > 0 ? rightDelta : 0, topDelta > 0 ? topDelta : 0);
                        tooltip.setSize(size.width, size.height);
                        that._updateTooltipSizeToWide()
                    }
                    else {
                        that._canShowTooltip = false;
                        tooltip.hide()
                    }
            },
            _updateTooltipSizeToWide: function() {
                var that = this,
                    size = that._tooltipOptions.size,
                    renderer = that._tooltipRenderer;
                renderer.resize(size.width, size.height);
                renderer.getRoot().applySettings({style: {
                        left: size.left,
                        top: size.top,
                        position: 'absolute',
                        overflow: 'hidden'
                    }});
                that._tooltipTracker.applySettings({
                    y: size.trackerY,
                    x: -size.left
                });
                that._tooltip.move(size.tooltipLeft, size.tooltipY)
            },
            _updateTooltipSizeToNormal: function() {
                var that = this,
                    renderer = that._tooltipRenderer,
                    canvas = that._canvas;
                renderer.resize(canvas.width, canvas.height);
                renderer.getRoot().applySettings({style: {
                        left: 0,
                        top: -canvas.height,
                        position: 'absolute'
                    }});
                that._tooltipTracker.applySettings({
                    y: 0,
                    x: 0
                })
            },
            _showTooltip: function() {
                if (!this._tooltipInitializated) {
                    this._createTooltip();
                    this._tooltipInitializated = true;
                    if (!this._canShowTooltip)
                        return
                }
                this._updateTooltipSizeToWide();
                this._tooltip.show()
            },
            _hideTooltip: function() {
                this._updateTooltipSizeToNormal();
                this._tooltip.hide()
            },
            showLoadingIndicator: $.noop
        });
        var menuEvents = {
                'contextmenu.sparkline-tooltip': function(event) {
                    if (DX.ui.events.isTouchEvent(event) || DX.ui.events.isPointerEvent(event))
                        event.preventDefault()
                },
                'MSHoldVisual.sparkline-tooltip': function(event) {
                    event.preventDefault()
                }
            };
        var mouseEvents = {
                'mouseover.sparkline-tooltip': function(event) {
                    isPointerDownCalled = false;
                    var widget = event.data.widget;
                    widget._x = event.pageX;
                    widget._y = event.pageY;
                    widget._tooltipTracker.off(mouseMoveEvents).on(mouseMoveEvents, event.data);
                    widget._doShowTooltip(DEFAULT_EVENTS_DELAY)
                },
                'mouseout.sparkline-tooltip': function(event) {
                    if (isPointerDownCalled)
                        return;
                    var widget = event.data.widget;
                    widget._tooltipTracker.off(mouseMoveEvents);
                    widget._doHideTooltip(DEFAULT_EVENTS_DELAY)
                }
            };
        var mouseMoveEvents = {'mousemove.sparkline-tooltip': function(event) {
                    var widget = event.data.widget;
                    if (widget._showTooltipTimeout && (_abs(widget._x - event.pageX) > 3 || _abs(widget._y - event.pageY) > 3)) {
                        widget._x = event.pageX;
                        widget._y = event.pageY;
                        widget._doShowTooltip(DEFAULT_EVENTS_DELAY)
                    }
                }};
        var active_touch_tooltip_widget = null,
            touchstartTooltipProcessing = function(event) {
                event.preventDefault();
                var widget = active_touch_tooltip_widget;
                if (widget && widget !== event.data.widget)
                    widget._doHideTooltip(DEFAULT_EVENTS_DELAY);
                widget = active_touch_tooltip_widget = event.data.widget;
                widget._doShowTooltip(TOUCH_EVENTS_DELAY);
                widget._touch = true
            },
            touchstartDocumentProcessing = function() {
                var widget = active_touch_tooltip_widget;
                if (widget) {
                    if (!widget._touch) {
                        widget._doHideTooltip(DEFAULT_EVENTS_DELAY);
                        active_touch_tooltip_widget = null
                    }
                    widget._touch = null
                }
            },
            touchendDocumentProcessing = function() {
                var widget = active_touch_tooltip_widget;
                if (widget)
                    if (widget._showTooltipTimeout) {
                        widget._doHideTooltip(DEFAULT_EVENTS_DELAY);
                        active_touch_tooltip_widget = null
                    }
            },
            isPointerDownCalled = false;
        var touchEvents = {
                'pointerdown.sparkline-tooltip': function(event) {
                    touchstartTooltipProcessing(event)
                },
                'touchstart.sparkline-tooltip': function(event) {
                    touchstartTooltipProcessing(event)
                }
            };
        $(document).on({
            'pointerdown.sparkline-tooltip': function() {
                isPointerDownCalled = true;
                touchstartDocumentProcessing()
            },
            'touchstart.sparkline-tooltip': function() {
                touchstartDocumentProcessing()
            },
            'pointerup.sparkline-tooltip': function() {
                touchendDocumentProcessing()
            },
            'touchend.sparkline-tooltip': function() {
                touchendDocumentProcessing()
            }
        });
        DX.viz.sparklines.BaseSparkline._DEBUG_reset = function() {
            active_touch_tooltip_widget = null
        }
    })(jQuery, DevExpress);
    /*! Module viz-sparklines, file sparkline.js */
    (function($, DX) {
        var viz = DX.viz,
            charts = viz.charts,
            core = viz.core,
            MIN_BAR_WIDTH = 1,
            MAX_BAR_WIDTH = 50,
            DEFAULT_BAR_INTERVAL = 4,
            DEFAULT_CANVAS_WIDTH = 250,
            DEFAULT_CANVAS_HEIGHT = 30,
            DEFAULT_HORIZONTAL_MARGIN = 5,
            DEFAULT_VERTICAL_MARGIN = 3,
            DEFAULT_OPTIONS = {
                disabled: false,
                theme: 'default',
                dataSource: [],
                size: {},
                margin: {},
                type: 'line',
                argumentField: 'arg',
                valueField: 'val',
                winlossThreshold: 0,
                showFirstLast: true,
                showMinMax: false,
                redrawOnResize: false
            },
            ALLOWED_TYPES = {
                line: true,
                spline: true,
                stepline: true,
                area: true,
                steparea: true,
                splinearea: true,
                bar: true,
                winloss: true
            },
            _map = $.map,
            _extend = $.extend,
            _abs = Math.abs,
            _round = Math.round,
            _isFinite = isFinite,
            _Number = Number,
            _String = String;
        viz.sparklines.Sparkline = viz.sparklines.BaseSparkline.inherit({
            _widgetType: 'sparkline',
            _widgetClass: 'dxsl',
            _defaultSize: {
                width: DEFAULT_CANVAS_WIDTH,
                height: DEFAULT_CANVAS_HEIGHT,
                left: DEFAULT_HORIZONTAL_MARGIN,
                right: DEFAULT_HORIZONTAL_MARGIN,
                top: DEFAULT_VERTICAL_MARGIN,
                bottom: DEFAULT_VERTICAL_MARGIN
            },
            _init: function() {
                this.callBase();
                this._refreshDataSource()
            },
            _handleDataSourceChanged: function() {
                if (this._initialized) {
                    this._clean();
                    this._createWidgetElements();
                    this._drawWidgetElements()
                }
            },
            _dataSourceOptions: function() {
                return {
                        paginate: false,
                        _preferSync: true
                    }
            },
            _redrawWidgetElements: function() {
                this._createTranslator();
                this._correctPoints();
                this._series.draw({
                    x: this._translatorX,
                    y: this._translatorY
                });
                this._seriesGroup.append(this._renderer.getRoot())
            },
            _disposeWidgetElements: function() {
                delete this._seriesGroup;
                delete this._seriesLabelGroup
            },
            _cleanWidgetElements: function() {
                this._seriesGroup.detach();
                this._seriesLabelGroup.detach();
                this._seriesGroup.clear();
                this._seriesLabelGroup.clear()
            },
            _createWidgetElements: function() {
                this._createSeries();
                this.callBase()
            },
            _drawWidgetElements: function() {
                if (this._dataSource && this._dataSource.isLoaded())
                    this._drawSeries()
            },
            _prepareOptions: function() {
                this._allOptions = this.callBase(DEFAULT_OPTIONS);
                this._allOptions.type = _String(this._allOptions.type).toLowerCase();
                if (!ALLOWED_TYPES[this._allOptions.type])
                    this._allOptions.type = 'line'
            },
            _createHtmlElements: function() {
                this._seriesGroup = this._renderer.createGroup({'class': 'dxsl-series'});
                this._seriesLabelGroup = this._renderer.createGroup({'class': 'dxsl-series-labels'})
            },
            _createSeries: function() {
                var that = this,
                    renderer = that._renderer,
                    dataValidator;
                that._prepareDataSource();
                that._prepareSeriesOptions();
                that._series = core.CoreFactory.createSeries(renderer, that._seriesOptions);
                dataValidator = charts.factory.createDataValidator(that._simpleDataSource, [[that._series]], that._incidentOccured, {
                    checkTypeForAllData: false,
                    convertToAxisDataType: true,
                    sortingMethod: true
                });
                that._simpleDataSource = dataValidator.validate();
                that._series._options.customizePoint = that._getCustomizeFunction();
                that._series.updateData(that._simpleDataSource)
            },
            _parseNumericDataSource: function(data, argField, valField) {
                var ignoreEmptyPoints = this.option('ignoreEmptyPoints');
                return _map(data, function(dataItem, index) {
                        var item = null,
                            isDataNumber,
                            value;
                        if (dataItem !== undefined) {
                            item = {};
                            isDataNumber = _isFinite(dataItem);
                            item[argField] = isDataNumber ? _String(index) : dataItem[argField];
                            value = isDataNumber ? dataItem : dataItem[valField];
                            item[valField] = value === null ? ignoreEmptyPoints ? undefined : value : _Number(value);
                            item = item[argField] !== undefined && item[valField] !== undefined ? item : null
                        }
                        return item
                    })
            },
            _parseWinlossDataSource: function(data, argField, valField) {
                var lowBarValue = -1,
                    zeroBarValue = 0,
                    highBarValue = 1,
                    delta = 0.0001,
                    target = this._allOptions.winlossThreshold;
                return _map(data, function(dataItem) {
                        var item = {};
                        item[argField] = dataItem[argField];
                        if (_abs(dataItem[valField] - target) < delta)
                            item[valField] = zeroBarValue;
                        else if (dataItem[valField] > target)
                            item[valField] = highBarValue;
                        else
                            item[valField] = lowBarValue;
                        return item
                    })
            },
            _prepareDataSource: function() {
                var that = this,
                    options = that._allOptions,
                    argField = options.argumentField,
                    valField = options.valueField,
                    dataSource = that._dataSource ? that._dataSource.items() : [],
                    data = that._parseNumericDataSource(dataSource, argField, valField);
                if (options.type === 'winloss') {
                    that._winlossDataSource = data;
                    that._simpleDataSource = that._parseWinlossDataSource(data, argField, valField)
                }
                else
                    that._simpleDataSource = data
            },
            _prepareSeriesOptions: function() {
                var that = this,
                    options = that._allOptions,
                    defaultPointOptions = {
                        border: {},
                        hoverStyle: {border: {}},
                        selectionStyle: {border: {}}
                    },
                    customPointOptions = {
                        size: options.pointSize,
                        symbol: options.pointSymbol,
                        border: {
                            visible: true,
                            width: 2
                        },
                        color: options.pointColor
                    };
                that._seriesOptions = {
                    visible: true,
                    argumentField: options.argumentField,
                    valueField: options.valueField,
                    color: options.lineColor,
                    width: options.lineWidth,
                    widgetType: "chart"
                };
                that._seriesOptions.border = {
                    color: that._seriesOptions.color,
                    width: that._seriesOptions.width,
                    visible: true
                };
                that._seriesOptions.type = options.type === 'winloss' ? 'bar' : options.type;
                if (options.type === 'winloss' || options.type === 'bar') {
                    that._seriesOptions.argumentAxisType = 'discrete';
                    that._seriesOptions.border.visible = false
                }
                if (~~options.type.indexOf('area') !== -1)
                    that._seriesOptions.opacity = that._allOptions.areaOpacity;
                that._seriesOptions.seriesGroup = that._seriesGroup;
                that._seriesOptions.seriesLabelsGroup = that._seriesLabelGroup;
                that._seriesOptions.point = _extend(defaultPointOptions, customPointOptions);
                that._seriesOptions.point.visible = false
            },
            _createBarCustomizeFunction: function(pointIndexes) {
                var that = this,
                    options = that._allOptions,
                    winlossData = that._winlossDataSource;
                return function() {
                        var index = this.index,
                            isWinloss = options.type === 'winloss',
                            target = isWinloss ? options.winlossThreshold : 0,
                            value = isWinloss ? winlossData[index][options.valueField] : this.value,
                            positiveColor = isWinloss ? options.winColor : options.barPositiveColor,
                            negativeColor = isWinloss ? options.lossColor : options.barNegativeColor,
                            color;
                        if (value >= target)
                            color = positiveColor;
                        else
                            color = negativeColor;
                        if (index === pointIndexes.first || index === pointIndexes.last)
                            color = options.firstLastColor;
                        if (index === pointIndexes.min)
                            color = options.minColor;
                        if (index === pointIndexes.max)
                            color = options.maxColor;
                        return {color: color}
                    }
            },
            _createLineCustomizeFunction: function(pointIndexes) {
                var that = this,
                    options = that._allOptions;
                return function() {
                        var color,
                            index = this.index;
                        if (index === pointIndexes.first || index === pointIndexes.last)
                            color = options.firstLastColor;
                        if (index === pointIndexes.min)
                            color = options.minColor;
                        if (index === pointIndexes.max)
                            color = options.maxColor;
                        return color ? {
                                visible: true,
                                border: {color: color}
                            } : {}
                    }
            },
            _getCustomizeFunction: function() {
                var that = this,
                    options = that._allOptions,
                    dataSource = that._winlossDataSource || that._simpleDataSource,
                    drawnPointIndexes = that._getExtremumPointsIndexes(dataSource),
                    customizeFunction;
                if (options.type === 'winloss' || options.type === 'bar')
                    customizeFunction = that._createBarCustomizeFunction(drawnPointIndexes);
                else
                    customizeFunction = that._createLineCustomizeFunction(drawnPointIndexes);
                return customizeFunction
            },
            _getExtremumPointsIndexes: function(data) {
                var that = this,
                    options = that._allOptions,
                    lastIndex = data.length - 1,
                    indexes = {};
                that._minMaxIndexes = that._findMinMax(data);
                if (options.showFirstLast) {
                    indexes.first = 0;
                    indexes.last = lastIndex
                }
                if (options.showMinMax) {
                    indexes.min = that._minMaxIndexes.minIndex;
                    indexes.max = that._minMaxIndexes.maxIndex
                }
                return indexes
            },
            _findMinMax: function(data) {
                var that = this,
                    valField = that._allOptions.valueField,
                    firstItem = data[0] || {},
                    firstValue = firstItem[valField] || 0,
                    min = firstValue,
                    max = firstValue,
                    minIndex = 0,
                    maxIndex = 0,
                    dataLength = data.length,
                    value,
                    i;
                for (i = 1; i < dataLength; i++) {
                    value = data[i][valField];
                    if (value < min) {
                        min = value;
                        minIndex = i
                    }
                    if (value > max) {
                        max = value;
                        maxIndex = i
                    }
                }
                return {
                        minIndex: minIndex,
                        maxIndex: maxIndex
                    }
            },
            _createRange: function() {
                var that = this,
                    series = that._series,
                    isBarType = series.type === 'bar',
                    DEFAULT_VALUE_RANGE_MARGIN = 0.15,
                    DEFAULT_ARGUMENT_RANGE_MARGIN = isBarType ? 0.1 : 0,
                    rangeData = series.getRangeData();
                that._ranges = {
                    arg: new core.Range({
                        stick: !isBarType && series.getPoints().length > 1,
                        minValueMargin: DEFAULT_ARGUMENT_RANGE_MARGIN,
                        maxValueMargin: DEFAULT_ARGUMENT_RANGE_MARGIN
                    }),
                    val: new core.Range({
                        isValueRange: true,
                        keepValueMargins: true,
                        minValueMargin: DEFAULT_VALUE_RANGE_MARGIN,
                        maxValueMargin: DEFAULT_VALUE_RANGE_MARGIN
                    })
                };
                that._ranges.arg.addRange(rangeData.arg);
                that._ranges.val.addRange(rangeData.val);
                that._ranges.arg.applyValueMargins();
                that._ranges.val.applyValueMargins()
            },
            _getBarWidth: function(pointsCount) {
                var that = this,
                    canvas = that._canvas,
                    intervalWidth = pointsCount * DEFAULT_BAR_INTERVAL,
                    rangeWidth = canvas.width - canvas.left - canvas.right - intervalWidth,
                    width = _round(rangeWidth / pointsCount);
                if (width < MIN_BAR_WIDTH)
                    width = MIN_BAR_WIDTH;
                if (width > MAX_BAR_WIDTH)
                    width = MAX_BAR_WIDTH;
                return width
            },
            _correctPoints: function() {
                var that = this,
                    seriesType = that._allOptions.type,
                    seriesPoints = that._series.getPoints(),
                    pointsLength = seriesPoints.length,
                    barWidth,
                    i;
                if (seriesType === 'bar' || seriesType === 'winloss') {
                    barWidth = that._getBarWidth(pointsLength);
                    for (i = 0; i < pointsLength; i++)
                        seriesPoints[i].correctCoordinates({
                            width: barWidth,
                            offset: 0
                        })
                }
            },
            _drawSeries: function() {
                var that = this;
                if (that._simpleDataSource.length !== 0) {
                    that._correctPoints();
                    that._series.draw({
                        x: that._translatorX,
                        y: that._translatorY
                    });
                    that._seriesGroup.append(that._renderer.getRoot());
                    that._prepareTooltipContainer()
                }
            },
            _isTooltipVisible: function() {
                return this.callBase() && this._dataSource.length !== 0
            },
            _getTooltipData: function() {
                var that = this,
                    options = that._allOptions,
                    dataSource = that._winlossDataSource || that._simpleDataSource,
                    tooltip = that._tooltip;
                if (dataSource.length === 0)
                    return {};
                var minMax = that._minMaxIndexes,
                    valueField = options.valueField,
                    first = dataSource[0][valueField],
                    last = dataSource[dataSource.length - 1][valueField],
                    min = dataSource[minMax.minIndex][valueField],
                    max = dataSource[minMax.maxIndex][valueField],
                    formattedFirst = tooltip.formatValue(first),
                    formattedLast = tooltip.formatValue(last),
                    formattedMin = tooltip.formatValue(min),
                    formattedMax = tooltip.formatValue(max),
                    customizeObject = {
                        firstValue: formattedFirst,
                        lastValue: formattedLast,
                        minValue: formattedMin,
                        maxValue: formattedMax,
                        originalFirstValue: first,
                        originalLastValue: last,
                        originalMinValue: min,
                        originalMaxValue: max,
                        valueText: ['Start:', formattedFirst, 'End:', formattedLast, 'Min:', formattedMin, 'Max:', formattedMax]
                    };
                if (options.type === 'winloss') {
                    customizeObject.originalThresholdValue = options.winlossThreshold;
                    customizeObject.thresholdValue = tooltip.formatValue(options.winlossThreshold)
                }
                return customizeObject
            }
        }).include(DX.ui.DataHelperMixin)
    })(jQuery, DevExpress);
    /*! Module viz-sparklines, file bullet.js */
    (function($, DX) {
        var charts = DX.viz.charts,
            TARGET_MIN_Y = 0.02,
            TARGET_MAX_Y = 0.98,
            BAR_VALUE_MIN_Y = 0.1,
            BAR_VALUE_MAX_Y = 0.9,
            DEFAULT_CANVAS_WIDTH = 300,
            DEFAULT_CANVAS_HEIGHT = 30,
            DEFAULT_HORIZONTAL_MARGIN = 1,
            DEFAULT_VERTICAL_MARGIN = 2,
            DEFAULT_OPTIONS = {
                disabled: false,
                theme: 'default',
                size: {},
                margin: {}
            },
            _String = String,
            _Number = Number,
            _round = Math.round,
            _isFinite = isFinite;
        DX.viz.sparklines.Bullet = DX.viz.sparklines.BaseSparkline.inherit({
            _widgetType: 'bullet',
            _widgetClass: 'dxb',
            _defaultSize: {
                width: DEFAULT_CANVAS_WIDTH,
                height: DEFAULT_CANVAS_HEIGHT,
                left: DEFAULT_HORIZONTAL_MARGIN,
                right: DEFAULT_HORIZONTAL_MARGIN,
                top: DEFAULT_VERTICAL_MARGIN,
                bottom: DEFAULT_VERTICAL_MARGIN
            },
            _disposeWidgetElements: function() {
                delete this._zeroLevelPath;
                delete this._targetPath;
                delete this._barValuePath
            },
            _redrawWidgetElements: function() {
                this._createTranslator();
                this._drawBarValue();
                this._drawTarget();
                this._drawZeroLevel()
            },
            _cleanWidgetElements: function() {
                this._zeroLevelPath.detach();
                this._targetPath.detach();
                this._barValuePath.detach()
            },
            _drawWidgetElements: function() {
                this._drawBullet()
            },
            _createHtmlElements: function() {
                var renderer = this._renderer;
                this._zeroLevelPath = renderer.createPath(undefined, {'class': 'dxb-zero-level'});
                this._targetPath = renderer.createPath(undefined, {'class': 'dxb-target'});
                this._barValuePath = renderer.createPath(undefined, {'class': 'dxb-bar-value'})
            },
            _prepareOptions: function() {
                var that = this,
                    options,
                    startScaleValue,
                    endScaleValue,
                    level,
                    value,
                    target;
                that._allOptions = options = that.callBase(DEFAULT_OPTIONS);
                if (that._allOptions.value === undefined)
                    that._allOptions.value = 0;
                if (that._allOptions.target === undefined)
                    that._allOptions.target = 0;
                options.value = value = _Number(options.value);
                options.target = target = _Number(options.target);
                if (that._allOptions.startScaleValue === undefined) {
                    that._allOptions.startScaleValue = target < value ? target : value;
                    that._allOptions.startScaleValue = that._allOptions.startScaleValue < 0 ? that._allOptions.startScaleValue : 0
                }
                if (that._allOptions.endScaleValue === undefined)
                    that._allOptions.endScaleValue = target > value ? target : value;
                options.startScaleValue = startScaleValue = _Number(options.startScaleValue);
                options.endScaleValue = endScaleValue = _Number(options.endScaleValue);
                if (endScaleValue < startScaleValue) {
                    level = endScaleValue;
                    that._allOptions.endScaleValue = startScaleValue;
                    that._allOptions.startScaleValue = level;
                    that._allOptions.inverted = true
                }
            },
            _createRange: function() {
                var that = this,
                    options = that._allOptions;
                that._ranges = {
                    arg: {
                        invert: options.inverted,
                        min: options.startScaleValue,
                        max: options.endScaleValue,
                        axisType: "continuous",
                        dataType: "numeric"
                    },
                    val: {
                        min: 0,
                        max: 1,
                        axisType: "continuous",
                        dataType: "numeric"
                    }
                }
            },
            _drawBullet: function() {
                var that = this,
                    options = that._allOptions,
                    isValidBounds = options.startScaleValue !== options.endScaleValue,
                    isValidMin = _isFinite(options.startScaleValue),
                    isValidMax = _isFinite(options.endScaleValue),
                    isValidValue = _isFinite(options.value),
                    isValidTarget = _isFinite(options.target);
                if (isValidBounds && isValidMax && isValidMin && isValidTarget && isValidValue) {
                    this._drawBarValue();
                    this._drawTarget();
                    this._drawZeroLevel();
                    this._prepareTooltipContainer()
                }
            },
            _getTargetParams: function() {
                var that = this,
                    options = that._allOptions,
                    translatorX = that._translatorX,
                    translatorY = that._translatorY,
                    minY = translatorY.translate(TARGET_MIN_Y),
                    maxY = translatorY.translate(TARGET_MAX_Y),
                    x = translatorX.translate(options.target),
                    points = [{
                            x: x,
                            y: minY
                        }, {
                            x: x,
                            y: maxY
                        }];
                return {
                        points: points,
                        stroke: options.targetColor,
                        strokeWidth: options.targetWidth
                    }
            },
            _getBarValueParams: function() {
                var that = this,
                    options = that._allOptions,
                    translatorX = that._translatorX,
                    translatorY = that._translatorY,
                    startLevel = options.startScaleValue,
                    endLevel = options.endScaleValue,
                    value = options.value,
                    y2 = translatorY.translate(BAR_VALUE_MIN_Y),
                    y1 = translatorY.translate(BAR_VALUE_MAX_Y),
                    x1,
                    x2;
                if (value > 0) {
                    x1 = startLevel <= 0 ? 0 : startLevel;
                    x2 = value >= endLevel ? endLevel : value
                }
                else {
                    x1 = endLevel >= 0 ? 0 : endLevel;
                    x2 = value >= startLevel ? value : startLevel
                }
                x1 = translatorX.translate(x1);
                x2 = translatorX.translate(x2);
                return {
                        points: [{
                                x: x1,
                                y: y1
                            }, {
                                x: x2,
                                y: y1
                            }, {
                                x: x2,
                                y: y2
                            }, {
                                x: x1,
                                y: y2
                            }],
                        fill: options.color
                    }
            },
            _getZeroLevelParams: function() {
                var that = this,
                    options = that._allOptions,
                    translatorX = that._translatorX,
                    translatorY = that._translatorY,
                    minY = translatorY.translate(TARGET_MIN_Y),
                    maxY = translatorY.translate(TARGET_MAX_Y),
                    x = translatorX.translate(0);
                return {
                        points: [{
                                x: x,
                                y: minY
                            }, {
                                x: x,
                                y: maxY
                            }],
                        stroke: options.targetColor,
                        strokeWidth: 1
                    }
            },
            _drawZeroLevel: function() {
                var that = this,
                    options = that._allOptions,
                    params;
                if (0 > options.endScaleValue || 0 < options.startScaleValue || !options.showZeroLevel)
                    return;
                params = that._getZeroLevelParams();
                that._zeroLevelPath.applySettings(params);
                that._zeroLevelPath.append(that._renderer.getRoot())
            },
            _drawTarget: function() {
                var that = this,
                    options = that._allOptions,
                    target = options.target,
                    startLevel = options.startScaleValue,
                    endLevel = options.endScaleValue,
                    params;
                if (target > endLevel || target < startLevel || !options.showTarget)
                    return;
                params = that._getTargetParams();
                that._targetPath.applySettings(params);
                that._targetPath.append(that._renderer.getRoot())
            },
            _drawBarValue: function() {
                var that = this,
                    params = that._getBarValueParams();
                that._barValuePath.applySettings(params);
                that._barValuePath.append(that._renderer.getRoot())
            },
            _getTooltipData: function() {
                var that = this,
                    tooltip = that._tooltip,
                    options = that._allOptions,
                    value = options.value,
                    target = options.target;
                return {
                        originalValue: value,
                        originalTarget: target,
                        value: tooltip.formatValue(value),
                        target: tooltip.formatValue(target),
                        valueText: ['Actual Value:', value, 'Target Value:', target]
                    }
            },
            _getNormalTooltipSize: function() {
                var size = {},
                    bbox = this._barValuePath.getBBox();
                size.width = this._canvas.width;
                size.left = 0;
                size.tooltipLeft = bbox.x + _round(bbox.width / 2);
                return size
            },
            _getWideTooltipSize: function(leftWidthDelta, rightWidthDelta) {
                var that = this,
                    bbox = that._barValuePath.getBBox(),
                    horizontalPos = that._allOptions.tooltip.horizontalAlignment,
                    size = {};
                size.width = leftWidthDelta + rightWidthDelta + that._canvas.width;
                size.left = -leftWidthDelta;
                if (horizontalPos === 'right')
                    size.tooltipLeft = bbox.x + _round(bbox.width / 2);
                else if (horizontalPos === 'left')
                    size.tooltipLeft = _round(bbox.width / 2) + leftWidthDelta + rightWidthDelta + bbox.x;
                else
                    size.tooltipLeft = _round(bbox.width / 2) + bbox.x + leftWidthDelta;
                return size
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-sparklines, file dxSparkline.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            viz = DX.viz;
        DX.registerComponent("dxSparkline", viz.sparklines.Sparkline)
    })(jQuery, DevExpress);
    /*! Module viz-sparklines, file dxBullet.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            viz = DX.viz;
        DX.registerComponent("dxBullet", viz.sparklines.Bullet)
    })(jQuery, DevExpress);
    DevExpress.MOD_VIZ_SPARKLINES = true
}