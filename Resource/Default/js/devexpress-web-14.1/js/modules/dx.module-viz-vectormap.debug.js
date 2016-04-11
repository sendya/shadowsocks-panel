/*! 
* DevExtreme (Vector Map)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_VIZ_VECTORMAP) {
    if (!DevExpress.MOD_VIZ_CORE)
        throw Error('Required module is not referenced: viz-core');
    /*! Module viz-vectormap, file map.js */
    (function(DX, $, undefined) {
        DX.viz.map = {};
        var _Number = window.Number,
            _isFunction = DX.utils.isFunction,
            _getRootOffset = DX.utils.getRootOffset;
        var DEFAULT_WIDTH = 800,
            DEFAULT_HEIGHT = 400;
        var DATA_KEY = DX.viz.map.__DATA_KEY = 'vectormap-data';
        DX.viz.map.Map = DX.viz.core.BaseWidget.inherit({
            _init: function() {
                var that = this;
                that.callBase.apply(that, arguments);
                that.renderer = that._renderer = that._factory.createRenderer({
                    width: 1,
                    height: 1,
                    pathModified: that.option('pathModified'),
                    rtl: that.option('rtlEnabled')
                });
                that.renderer.draw(that._element().get(0));
                that._root = that._renderer.getRoot();
                that._root.applySettings({
                    'class': 'dxm',
                    stroke: 'none',
                    strokeWidth: 0,
                    fill: 'none',
                    align: 'center',
                    cursor: 'default',
                    style: {overflow: 'hidden'}
                });
                that._themeManager = that._factory.createThemeManager();
                that._projection = that._factory.createProjection();
                that._tracker = that._factory.createTracker({root: that._root});
                that._background = that._renderer.createRect(0, 0, 0, 0, 0, {'class': 'dxm-background'}).data(DATA_KEY, {type: 'background'});
                that._areasManager = that._factory.createAreasManager({
                    container: that._root,
                    renderer: that._renderer,
                    projection: that._projection,
                    themeManager: that._themeManager,
                    tracker: that._tracker,
                    ready: function() {
                        that.hideLoadingIndicator()
                    }
                });
                that._areasManager.setData(that.option('mapData'));
                that._markersManager = that._factory.createMarkersManager({
                    container: that._root,
                    renderer: that._renderer,
                    projection: that._projection,
                    themeManager: that._themeManager,
                    tracker: that._tracker
                });
                that._markersManager.setData(that.option('markers'));
                that._controlBar = that._factory.createControlBar({
                    container: that._root,
                    renderer: that._renderer,
                    context: that,
                    resetCallback: controlResetCallback,
                    beginMoveCallback: controlBeginMoveCallback,
                    endMoveCallback: controlEndMoveCallback,
                    moveCallback: controlMoveCallback,
                    zoomCallback: controlZoomCallback
                });
                that._legend = that._factory.createLegend({
                    container: that._root,
                    renderer: that._renderer,
                    themeManager: that._themeManager
                });
                that._tooltip = that._factory.createTooltip({
                    container: that._root,
                    renderer: that._renderer,
                    tracker: that._tracker
                });
                that._projection.setBounds(that.option('bounds')).setMaxZoom(that.option('maxZoomFactor')).setZoom(that.option('zoomFactor')).setCenter(that.option('center'));
                that._themeManager.setTheme(that.option('theme'));
                that._themeManager.patchRtlSettings(that.option('rtlEnabled'));
                that._setClickCallback(that.option('click'));
                that._setCenterChangedCallback(that.option('centerChanged'));
                that._setZoomFactorChangedCallback(that.option('zoomFactorChanged'));
                that._setTrackerCallbacks()
            },
            _dispose: function() {
                var that = this;
                that.callBase.apply(that, arguments);
                that._resetTrackerCallbacks();
                that._themeManager.dispose();
                that._tracker.dispose();
                that._areasManager.dispose();
                that._markersManager.dispose();
                that._controlBar.dispose();
                that._legend.dispose();
                that._tooltip.dispose();
                that._renderer.dispose();
                that._disposeLoadIndicator();
                that._renderer = that._themeManager = that._projection = that._tracker = that._root = that._background = that._areasManager = that._markersManager = that._controlBar = that._legend = that._tooltip = that._centerChangedCallback = that._zoomFactorChangedCallback = null
            },
            _setTrackerCallbacks: function() {
                var that = this,
                    renderer = that._renderer,
                    managers = {
                        area: that._areasManager,
                        marker: that._markersManager
                    },
                    projection = that._projection,
                    controlBar = that._controlBar,
                    tooltip = that._tooltip,
                    xdrag,
                    ydrag,
                    isControlDrag = false;
                that._tracker.setCallbacks({
                    click: function(arg) {
                        var offset = _getRootOffset(renderer);
                        arg.$event.x = arg.x - offset.left;
                        arg.$event.y = arg.y - offset.top;
                        var manager = managers[arg.data.type];
                        if (manager)
                            manager.raiseClick(arg.data.index, arg.$event);
                        if (manager || arg.data.type === 'background')
                            that._raiseClick(arg.$event)
                    },
                    start: function(arg) {
                        isControlDrag = arg.data.type === 'control-bar';
                        if (isControlDrag) {
                            arg.data = arg.data.index;
                            controlBar.processStart(arg)
                        }
                        else {
                            xdrag = arg.x;
                            ydrag = arg.y;
                            projection.snapCenter()
                        }
                    },
                    move: function(arg) {
                        if (isControlDrag) {
                            arg.data = arg.data.index;
                            controlBar.processMove(arg)
                        }
                        else {
                            projection.moveCenter(xdrag - arg.x, ydrag - arg.y);
                            xdrag = arg.x;
                            ydrag = arg.y;
                            that._applyTranslate()
                        }
                    },
                    end: function(arg) {
                        if (isControlDrag) {
                            arg.data = arg.data.index;
                            controlBar.processEnd(arg)
                        }
                        else
                            projection.isCenterChanged() && that._raiseCenterChanged();
                        isControlDrag = false
                    },
                    zoom: function(arg) {
                        controlBar.processZoom(arg)
                    },
                    'hover-on': function(arg) {
                        var manager = managers[arg.data.type];
                        if (manager)
                            manager.hoverItem(arg.data.index, true)
                    },
                    'hover-off': function(arg) {
                        var manager = managers[arg.data.type];
                        if (manager)
                            manager.hoverItem(arg.data.index, false)
                    },
                    'focus-on': function(arg, done) {
                        var result = false;
                        if (tooltip.enabled()) {
                            var proxy = managers[arg.data.type] ? managers[arg.data.type].getProxyItem(arg.data.index) : null;
                            if (!!proxy && tooltip.prepare(proxy, {offset: 12})) {
                                var offset = _getRootOffset(renderer);
                                tooltip.show().move(arg.x - offset.left, arg.y - offset.top);
                                result = true
                            }
                        }
                        done(result)
                    },
                    'focus-move': function(arg) {
                        var offset = _getRootOffset(renderer);
                        tooltip.move(arg.x - offset.left, arg.y - offset.top)
                    },
                    'focus-off': function(arg) {
                        tooltip.hide()
                    }
                });
                that._resetTrackerCallbacks = function() {
                    that._resetTrackerCallbacks = that = renderer = managers = projection = controlBar = tooltip = null
                }
            },
            _adjustSize: function(force) {
                var that = this,
                    size = that.option('size') || {},
                    width = size.width >= 0 ? _Number(size.width) : that._element().width(),
                    height = size.height >= 0 ? _Number(size.height) : that._element().height(),
                    hidden = false;
                if (width === 0)
                    if (_Number(size.width) === 0)
                        hidden = true;
                    else
                        width = DEFAULT_WIDTH;
                if (height === 0)
                    if (_Number(size.height) === 0)
                        hidden = true;
                    else
                        height = DEFAULT_HEIGHT;
                if (hidden || !that._element().is(':visible')) {
                    that._incidentOccured("W2001", [that.NAME]);
                    that._width = that._height = 0;
                    return false
                }
                var needResize = that._width !== width || that._height !== height || force;
                if (needResize) {
                    that._width = width;
                    that._height = height;
                    that._renderer.resize(width, height);
                    that._projection.setSize(width, height);
                    that._legend.applyLayout(width, height);
                    that._tooltip.setSize(width, height);
                    that._background.applySettings({
                        x: 0,
                        y: 0,
                        width: width,
                        height: height
                    });
                    that._applyTranslate();
                    that._updateLoadIndicator(undefined, width, height)
                }
                return needResize
            },
            _clean: function() {
                var that = this;
                that._tracker.clean();
                that._background.detach();
                that._areasManager.clean();
                that._markersManager.clean();
                that._controlBar.clean();
                that._legend.clean();
                that._tooltip.clean()
            },
            _render: function() {
                var that = this;
                if (!that._adjustSize(true))
                    return;
                that._tooltip.update(that._themeManager.getTooltipSettings(that.option('tooltip')));
                that._tracker.setOptions(that.option('interaction') || {});
                that._controlBar.setZoomPartition(that._projection.getZoomScalePartition()).setZoom(that._projection.getScaledZoom()).setOptions(that._themeManager.getControlBarSettings(that.option('controlBar')), that.option('interaction'));
                that._background.applySettings(that._themeManager.getBackgroundSettings(that.option('background')));
                that._background.append(that._root);
                that._areasManager.render(that.option('areaSettings'));
                that._markersManager.render(that.option('markerSettings'));
                that._controlBar.render();
                that._legend.render(that._themeManager.getLegendSettings(that.option('legend')));
                that._tooltip.render();
                that._tracker.render();
                that._drawn()
            },
            _optionChanged: function(name, value) {
                var that = this;
                switch (name) {
                    case'theme':
                        that._themeManager.setTheme(value);
                        that._themeManager.patchRtlSettings(that.option('rtlEnabled'));
                        that._invalidate();
                        break;
                    case'click':
                        that._setClickCallback(value);
                        break;
                    case'centerChanged':
                        that._setCenterChangedCallback(value);
                        break;
                    case'zoomFactorChanged':
                        that._setZoomFactorChangedCallback(value);
                        break;
                    case'mapData':
                        that._areasManager.setData(value);
                        break;
                    case'markers':
                        that._markersManager.setData(value);
                        break;
                    case'bounds':
                        that._projection.setBounds(value);
                        that._invalidate();
                        break;
                    case'maxZoomFactor':
                        that._projection.setMaxZoom(value);
                        that._invalidate();
                        break;
                    case'zoomFactor':
                        that._updateZoomFactor(value);
                        break;
                    case'center':
                        that._updateCenter(value);
                        break;
                    default:
                        that.callBase.apply(that, arguments);
                        break
                }
            },
            _getLoadIndicatorOption: function() {
                return this._themeManager.getLoadIndicatorSettings(this.option('loadingIndicator'))
            },
            _setClickCallback: function(callback) {
                this._clickCallback = _isFunction(callback) ? callback : null
            },
            _setCenterChangedCallback: function(callback) {
                var that = this;
                that._centerChangedCallback = _isFunction(callback) ? function() {
                    that._centerChangedCallback && callback.call(that, that._projection.getCenter())
                } : null
            },
            _setZoomFactorChangedCallback: function(callback) {
                var that = this;
                that._zoomFactorChangedCallback = _isFunction(callback) ? function() {
                    that._zoomFactorChangedCallback && callback.call(that, that._projection.getZoom())
                } : null
            },
            _raiseClick: function(arg) {
                var that = this;
                that._clickCallback && setTimeout(function() {
                    that._clickCallback && that._clickCallback.call(that, arg)
                }, 0)
            },
            _raiseCenterChanged: function() {
                this._centerChangedCallback && setTimeout(this._centerChangedCallback, 0)
            },
            _raiseZoomFactorChanged: function() {
                this._zoomFactorChangedCallback && setTimeout(this._zoomFactorChangedCallback, 0)
            },
            _updateCenter: function(center, _noEvent) {
                this._projection.snapCenter().setCenter(center);
                if (this._projection.isCenterChanged()) {
                    this._applyTransform();
                    _noEvent || this._raiseCenterChanged()
                }
            },
            _updateZoomFactor: function(zoomFactor, _noEvent) {
                var that = this;
                that._projection.snapZoom().setZoom(zoomFactor);
                if (that._projection.isZoomChanged()) {
                    that._controlBar.setZoom(that._projection.getScaledZoom());
                    that._applyTransform(true);
                    _noEvent || that._raiseZoomFactorChanged()
                }
            },
            _updateViewport: function(viewport, _noEvent) {
                var that = this;
                that._projection.snapCenter().snapZoom().setViewport(viewport);
                that._applyTransform(that._projection.isZoomChanged());
                if (that._projection.isCenterChanged())
                    _noEvent || that._raiseCenterChanged();
                if (that._projection.isZoomChanged()) {
                    that._controlBar.setZoom(that._projection.getScaledZoom());
                    _noEvent || that._raiseZoomFactorChanged()
                }
            },
            _resize: function() {
                if (this._adjustSize())
                    this._applyTransform(true)
            },
            _applyTranslate: function() {
                var transform = this._projection.getTransform();
                this._areasManager.transform(transform);
                this._markersManager.transform(transform)
            },
            _applyTransform: function(redraw, _noTrackerReset) {
                _noTrackerReset || this._tracker.reset();
                this._applyTranslate();
                if (redraw) {
                    this._areasManager.redraw();
                    this._markersManager.redraw()
                }
            },
            _refresh: function() {
                var that = this,
                    callBase = that.callBase;
                that._endLoading(function() {
                    callBase.call(that)
                })
            },
            render: function() {
                var that = this;
                if (that._width === 0 && that._height === 0)
                    that._refresh();
                else
                    that._resize();
                return that
            },
            getAreas: function() {
                return this._areasManager.getProxyItems()
            },
            getMarkers: function() {
                return this._markersManager.getProxyItems()
            },
            clearAreaSelection: function(_noEvent) {
                this._areasManager.clearSelection(_noEvent);
                return this
            },
            clearMarkerSelection: function(_noEvent) {
                this._markersManager.clearSelection(_noEvent);
                return this
            },
            clearSelection: function(_noEvent) {
                return this.clearAreaSelection(_noEvent).clearMarkerSelection(_noEvent)
            },
            center: function(value, _noEvent) {
                if (value === undefined)
                    return this._projection.getCenter();
                else {
                    this._updateCenter(value, _noEvent);
                    return this
                }
            },
            zoomFactor: function(value, _noEvent) {
                if (value === undefined)
                    return this._projection.getZoom();
                else {
                    this._updateZoomFactor(value, _noEvent);
                    return this
                }
            },
            viewport: function(value, _noEvent) {
                if (value === undefined)
                    return this._projection.getViewport();
                else {
                    this._updateViewport(value, _noEvent);
                    return this
                }
            },
            convertCoordinates: function(x, y) {
                return this._projection.fromScreenPointStrict(x, y)
            },
            showLoadingIndicator: function() {
                this._showLoadIndicator(this._themeManager.getLoadIndicatorSettings(this.option('loadingIndicator')), {
                    width: this._width,
                    height: this._height
                })
            },
            _factory: {
                createRenderer: function(options) {
                    return new DX.viz.renderers.Renderer(options)
                },
                createTooltip: function(parameters) {
                    return new Tooltip(parameters)
                },
                createLegend: function(parameters) {
                    return new Legend(parameters)
                }
            }
        });
        var Tooltip = DX.viz.core.Tooltip.inherit({
                ctor: function(parameters) {
                    var that = this;
                    that._container = parameters.container;
                    that._root = parameters.renderer.createGroup({'class': 'dxm-tooltip'});
                    that.callBase(null, that._root, parameters.renderer);
                    that._tracker = parameters.tracker;
                    that._enabled = false
                },
                dispose: function() {
                    var that = this;
                    that._container = that._root = that._tracker = null;
                    return that.callBase.apply(that, arguments)
                },
                clean: function() {
                    this._root.detach();
                    return this
                },
                render: function() {
                    this._root.append(this._container);
                    return this
                }
            });
        var Legend = DX.viz.core.Legend.inherit({
                ctor: function(parameters) {
                    var that = this;
                    that._container = parameters.container;
                    that._root = parameters.renderer.createGroup({'class': 'dxm-legend'});
                    that._themeManager = parameters.themeManager;
                    that.callBase(null, null, parameters.renderer, that._root)
                },
                dispose: function() {
                    var that = this;
                    that._container = that._root = that._themeManager = null;
                    return that.callBase.apply(that, arguments)
                },
                clean: function() {
                    this._root.detach();
                    return this
                },
                render: function(options) {
                    var that = this,
                        items = [],
                        i = 0,
                        ii = options.items ? options.items.length : 0;
                    for (; i < ii; ++i)
                        items.push(that._themeManager.getLegendItemSettings(options.items[i] || {}));
                    that.update(items, options);
                    that._root.append(that._container);
                    return that.applyLayout(that._size.width, that._size.height)
                },
                applyLayout: function(width, height) {
                    var that = this,
                        layoutOptions;
                    that.setSize({
                        width: width,
                        height: height
                    });
                    that.draw();
                    layoutOptions = that.getLayoutOptions();
                    if (layoutOptions) {
                        var left,
                            top;
                        if (layoutOptions.horizontalAlignment === 'left')
                            left = 0;
                        else if (layoutOptions.horizontalAlignment === 'center')
                            left = width / 2 - layoutOptions.width / 2;
                        else
                            left = width - layoutOptions.width;
                        if (layoutOptions.verticalAlignment === 'top')
                            top = 0;
                        else
                            top = height - layoutOptions.height;
                        that.shift(left, top)
                    }
                    return that
                }
            });
        function projectAreaDefault(dataItem) {
            return this._projection.projectArea(dataItem.coordinates)
        }
        function projectAreaGeoJson(dataItem) {
            if (dataItem.geometry) {
                var type = dataItem.geometry.type,
                    coordinates = dataItem.geometry.coordinates;
                if (coordinates && (type === 'Polygon' || type === 'MultiPolygon')) {
                    type === 'MultiPolygon' && (coordinates = [].concat.apply([], coordinates));
                    return this._projection.projectArea(coordinates)
                }
            }
            return []
        }
        function controlResetCallback() {
            var projection = this._projection,
                isCenterChanged,
                isZoomChanged;
            projection.snapCenter().snapZoom().setCenter(null).setZoom(null);
            isCenterChanged = projection.isCenterChanged();
            isZoomChanged = projection.isZoomChanged();
            if (isCenterChanged || isZoomChanged)
                this._applyTransform(isZoomChanged, true);
            isCenterChanged && this._raiseCenterChanged();
            isZoomChanged && this._raiseZoomFactorChanged()
        }
        function controlBeginMoveCallback() {
            this._projection.snapCenter()
        }
        function controlEndMoveCallback() {
            this._projection.isCenterChanged() && this._raiseCenterChanged()
        }
        function controlMoveCallback(dx, dy) {
            this._projection.moveCenter(dx, dy);
            this._applyTranslate()
        }
        function controlZoomCallback(zoom, x, y) {
            var that = this,
                keepPosition = x !== undefined && y !== undefined,
                coords,
                screenPosition;
            if (keepPosition) {
                screenPosition = _getRootOffset(that._renderer);
                screenPosition = [x - screenPosition.left, y - screenPosition.top];
                coords = that._projection.fromScreenPoint(screenPosition[0], screenPosition[1])
            }
            that._projection.snapZoom().setScaledZoom(zoom);
            if (that._projection.isZoomChanged()) {
                keepPosition && that._projection.snapCenter().setCenterByPoint(coords, screenPosition);
                that._applyTransform(true, true);
                that._raiseZoomFactorChanged();
                keepPosition && that._projection.isCenterChanged() && that._raiseCenterChanged()
            }
        }
        DX.registerComponent('dxVectorMap', DX.viz.map.Map);
        DX.viz.map._internal = {};
        DX.viz.map.sources = {};
        DX.viz.map._tests = {};
        DX.viz.map._tests.Legend = Legend;
        DX.viz.map._tests.Tooltip = Tooltip
    })(DevExpress, jQuery);
    /*! Module viz-vectormap, file projection.js */
    (function(DX, $, undefined) {
        var _Number = Number,
            _isFinite = isFinite,
            _min = Math.min,
            _max = Math.max,
            _abs = Math.abs,
            _tan = Math.tan,
            _atan = Math.atan,
            _exp = Math.exp,
            _round = Math.round,
            _ln = Math.log,
            _pow = Math.pow,
            _isArray = DX.utils.isArray,
            _buildPath = DX.viz.renderers.buildPath;
        var PI = Math.PI,
            QUARTER_PI = PI / 4,
            PI_TO_360 = PI / 360,
            TWO_TO_LN2 = 2 / Math.LN2;
        var DEFAULT_MIN_ZOOM = 1,
            DEFAULT_MAX_ZOOM = 1 << 8;
        var MERCATOR_MIN_LON = -180,
            MERCATOR_MAX_LON = 180,
            MERCATOR_MIN_LAT = -85.0511,
            MERCATOR_MAX_LAT = 85.0511;
        var mercator = {
                aspectRatio: 1,
                project: function(coordinates) {
                    var lon = coordinates[0],
                        lat = coordinates[1];
                    return [lon <= MERCATOR_MIN_LON ? -1 : lon >= MERCATOR_MAX_LON ? +1 : lon / 180, lat <= MERCATOR_MIN_LAT ? +1 : lat >= MERCATOR_MAX_LAT ? -1 : -_ln(_tan(QUARTER_PI + lat * PI_TO_360)) / PI]
                },
                unproject: function(coordinates) {
                    var x = coordinates[0],
                        y = coordinates[1];
                    return [x <= -1 ? MERCATOR_MIN_LON : x >= +1 ? MERCATOR_MAX_LON : 180 * x, y <= -1 ? MERCATOR_MAX_LAT : y >= +1 ? MERCATOR_MIN_LAT : (_atan(_exp(-PI * coordinates[1])) - QUARTER_PI) / PI_TO_360]
                }
            };
        function createProjectUnprojectMethods(p1, p2, delta) {
            var x0 = (p1[0] + p2[0]) / 2 - delta / 2,
                y0 = (p1[1] + p2[1]) / 2 - delta / 2,
                k = 2 / delta;
            return {
                    project: function(coordinates) {
                        var p = mercator.project(coordinates);
                        return [-1 + (p[0] - x0) * k, -1 + (p[1] - y0) * k]
                    },
                    unproject: function(coordinates) {
                        var p = [x0 + (coordinates[0] + 1) / k, y0 + (coordinates[1] + 1) / k];
                        return mercator.unproject(p)
                    }
                }
        }
        function floatsEqual(f1, f2) {
            return _abs(f1 - f2) < 1E-8
        }
        function truncate(value, min, max, fallback) {
            var _value = _Number(value);
            if (_value < min)
                _value = min;
            else if (_value > max)
                _value = max;
            else if (!(min <= _value && _value <= max))
                _value = fallback;
            return _value
        }
        function truncateQuad(quad, min, max) {
            return {
                    lt: [truncate(quad[0], min[0], max[0], min[0]), truncate(quad[1], min[1], max[1], min[1])],
                    rb: [truncate(quad[2], min[0], max[0], max[0]), truncate(quad[3], min[1], max[1], max[1])]
                }
        }
        function parseBounds(bounds) {
            var p1 = mercator.unproject([-1, -1]),
                p2 = mercator.unproject([+1, +1]),
                min = [_min(p1[0], p2[0]), _min(p1[1], p2[1])],
                max = [_max(p1[0], p2[0]), _max(p1[1], p2[1])],
                quad = bounds;
            if (quad && quad.minLon)
                quad = [quad.minLon, quad.minLat, quad.maxLon, quad.maxLat];
            if (quad)
                quad = truncateQuad(quad, min, max);
            return {
                    minBase: min,
                    maxBase: max,
                    min: quad ? [_min(quad.lt[0], quad.rb[0]), _min(quad.lt[1], quad.rb[1])] : min,
                    max: quad ? [_max(quad.lt[0], quad.rb[0]), _max(quad.lt[1], quad.rb[1])] : max
                }
        }
        function selectCenterValue(value1, value2, center1, center2) {
            var result;
            if (value1 > -1 && value2 >= +1)
                result = center1;
            else if (value1 <= -1 && value2 < +1)
                result = center2;
            else
                result = (center1 + center2) / 2;
            return result
        }
        function Projection() {
            this.setBounds(null)
        }
        Projection.prototype = {
            constructor: Projection,
            _minZoom: DEFAULT_MIN_ZOOM,
            _maxZoom: DEFAULT_MAX_ZOOM,
            _zoom: DEFAULT_MIN_ZOOM,
            setSize: function(width, height) {
                var that = this;
                that._x0 = width / 2;
                that._y0 = height / 2;
                if (width / height <= mercator.aspectRatio) {
                    that._xradius = width / 2;
                    that._yradius = width / 2 / mercator.aspectRatio
                }
                else {
                    that._xradius = height / 2 * mercator.aspectRatio;
                    that._yradius = height / 2
                }
                return that
            },
            setBounds: function(bounds) {
                var that = this,
                    _bounds = parseBounds(bounds);
                that._minBase = _bounds.minBase;
                that._maxBase = _bounds.maxBase;
                that._minBound = _bounds.min;
                that._maxBound = _bounds.max;
                var p1 = mercator.project(_bounds.min),
                    p2 = mercator.project(_bounds.max),
                    delta = _min(truncate(_abs(p2[0] - p1[0]), 0.1, 2, 2), truncate(_abs(p2[1] - p1[1]), 0.1, 2, 2)),
                    methods = delta < 2 ? createProjectUnprojectMethods(p1, p2, delta) : mercator;
                that._project = methods.project;
                that._unproject = methods.unproject;
                var minv = that._project(_bounds.minBase),
                    maxv = that._project(_bounds.maxBase);
                that._minv = [_min(minv[0], maxv[0]), _min(minv[1], maxv[1])];
                that._maxv = [_max(minv[0], maxv[0]), _max(minv[1], maxv[1])];
                that._defaultCenter = that._unproject([0, 0]);
                return that.setCenter(that._defaultCenter)
            },
            _toScreen: function(coordinates) {
                return [this._x0 + this._xradius * coordinates[0], this._y0 + this._yradius * coordinates[1]]
            },
            _fromScreen: function(coordinates) {
                return [(coordinates[0] - this._x0) / this._xradius, (coordinates[1] - this._y0) / this._yradius]
            },
            _toTransformed: function(coordinates) {
                return [coordinates[0] * this._zoom + this._dxcenter, coordinates[1] * this._zoom + this._dycenter, ]
            },
            _toTransformedFast: function(coordinates) {
                return [coordinates[0] * this._zoom, coordinates[1] * this._zoom]
            },
            _fromTransformed: function(coordinates) {
                return [(coordinates[0] - this._dxcenter) / this._zoom, (coordinates[1] - this._dycenter) / this._zoom]
            },
            _adjustCenter: function() {
                var that = this,
                    center = that._project(that._center);
                that._dxcenter = -center[0] * that._zoom;
                that._dycenter = -center[1] * that._zoom
            },
            projectArea: function(coordinates) {
                var i = 0,
                    ii = _isArray(coordinates) ? coordinates.length : 0,
                    subcoords,
                    j,
                    jj,
                    subresult,
                    result = [];
                for (; i < ii; ++i) {
                    subcoords = coordinates[i];
                    subresult = [];
                    for (j = 0, jj = _isArray(subcoords) ? subcoords.length : 0; j < jj; ++j)
                        subresult.push(this._project(subcoords[j]));
                    result.push(subresult)
                }
                return result
            },
            projectPoint: function(coordinates) {
                return coordinates ? this._project(coordinates) : []
            },
            getAreaCoordinates: function(data) {
                var k = 0,
                    kk = data.length,
                    partialData,
                    i,
                    ii,
                    list = [],
                    partialPath,
                    point;
                for (; k < kk; ++k) {
                    partialData = data[k];
                    partialPath = [];
                    for (i = 0, ii = partialData.length; i < ii; ++i) {
                        point = this._toScreen(this._toTransformedFast(partialData[i]));
                        partialPath.push(point[0], point[1])
                    }
                    list.push(_buildPath(partialPath))
                }
                return list.join(' ')
            },
            getPointCoordinates: function(data) {
                var point = this._toScreen(this._toTransformedFast(data));
                return {
                        x: _round(point[0]),
                        y: _round(point[1])
                    }
            },
            getZoom: function() {
                return this._zoom
            },
            setZoom: function(zoom) {
                var that = this;
                that._zoom = truncate(zoom, that._minZoom, that._maxZoom, that._minZoom);
                that._adjustCenter();
                return that
            },
            getScaledZoom: function() {
                return _round((this._scale.length - 1) * _ln(this._zoom) / _ln(this._maxZoom))
            },
            setScaledZoom: function(scaledZoom) {
                return this.setZoom(this._scale[_round(scaledZoom)])
            },
            getZoomScalePartition: function() {
                return this._scale.length - 1
            },
            _setupScaling: function() {
                var that = this,
                    k = _round(TWO_TO_LN2 * _ln(that._maxZoom));
                k = k > 4 ? k : 4;
                var step = _pow(that._maxZoom, 1 / k),
                    zoom = that._minZoom,
                    i = 1;
                that._scale = [zoom];
                for (; i <= k; ++i)
                    that._scale.push(zoom *= step)
            },
            setMaxZoom: function(maxZoom) {
                var that = this;
                that._minZoom = DEFAULT_MIN_ZOOM;
                that._maxZoom = truncate(maxZoom, that._minZoom, _Number.MAX_VALUE, DEFAULT_MAX_ZOOM);
                that._setupScaling();
                if (that._zoom > that._maxZoom)
                    that.setZoom(that._maxZoom);
                return that
            },
            getMinZoom: function() {
                return this._minZoom
            },
            getMaxZoom: function() {
                return this._maxZoom
            },
            getCenter: function() {
                return [this._center[0], this._center[1]]
            },
            setCenter: function(center) {
                var _center = _isArray(center) ? center : null;
                _center = _center || center && (center.lon || center.lat) && [center.lon, center.lat] || [];
                var that = this;
                that._center = [truncate(_center[0], that._minBound[0], that._maxBound[0], that._defaultCenter[0]), truncate(_center[1], that._minBound[1], that._maxBound[1], that._defaultCenter[1])];
                that._adjustCenter();
                return that
            },
            setCenterByPoint: function(coordinates, screenPosition) {
                var that = this,
                    p = that._project(coordinates),
                    q = that._fromScreen(screenPosition);
                return that.setCenter(that._unproject([-q[0] / that._zoom + p[0], -q[1] / that._zoom + p[1]]))
            },
            moveCenter: function(screenDx, screenDy) {
                var that = this,
                    current = that._toScreen(that._toTransformed(that._project(that._center))),
                    center = that._unproject(that._fromTransformed(that._fromScreen([current[0] + screenDx, current[1] + screenDy])));
                return that.setCenter(center)
            },
            getViewport: function() {
                var p1 = this._unproject(this._fromTransformed([-1, -1])),
                    p2 = this._unproject(this._fromTransformed([+1, +1]));
                return [p1[0], p1[1], p2[0], p2[1]]
            },
            setViewport: function(viewport) {
                var that = this;
                if (!_isArray(viewport))
                    return that.setZoom(that._minZoom).setCenter(that._defaultCenter);
                var _viewport = truncateQuad(viewport, that._minBase, that._maxBase),
                    lt = that._project(_viewport.lt),
                    rb = that._project(_viewport.rb),
                    l = _min(lt[0], rb[0]),
                    t = _min(lt[1], rb[1]),
                    r = _max(lt[0], rb[0]),
                    b = _max(lt[1], rb[1]),
                    zoom = 2 / _max(r - l, b - t),
                    xc = selectCenterValue(l, r, -1 - zoom * l, +1 - zoom * r),
                    yc = selectCenterValue(t, b, -1 - zoom * t, +1 - zoom * b);
                return that.setZoom(zoom).setCenter(that._unproject([-xc / zoom, -yc / zoom]))
            },
            getTransform: function() {
                return {
                        translateX: this._dxcenter * this._xradius,
                        translateY: this._dycenter * this._yradius
                    }
            },
            fromScreenPoint: function(x, y) {
                return this._unproject(this._fromTransformed(this._fromScreen([x, y])))
            },
            fromScreenPointStrict: function(x, y) {
                var that = this,
                    p = that._fromTransformed(that._fromScreen([x, y])),
                    q = that._unproject(p);
                return [p[0] >= that._minv[0] && p[0] <= that._maxv[0] ? q[0] : NaN, p[1] >= that._minv[1] && p[1] <= that._maxv[1] ? q[1] : NaN]
            },
            snapCenter: function() {
                this._snappedCenter = this.getCenter();
                return this
            },
            isCenterChanged: function() {
                var center = this.getCenter();
                return !floatsEqual(this._snappedCenter[0], center[0]) || !floatsEqual(this._snappedCenter[1], center[1])
            },
            snapZoom: function() {
                this._snappedZoom = this.getZoom();
                return this
            },
            isZoomChanged: function() {
                return !floatsEqual(this._snappedZoom, this.getZoom())
            }
        };
        DX.viz.map._tests.Projection = Projection;
        DX.viz.map._tests.mercator = mercator;
        DX.viz.map._tests._DEBUG_stubMercator = function(stub) {
            mercator = stub
        };
        DX.viz.map._tests._DEBUG_restoreMercator = function() {
            mercator = DX.viz.map._tests.mercator
        };
        DX.viz.map.Map.prototype._factory.createProjection = function() {
            return new Projection
        }
    })(DevExpress, jQuery);
    /*! Module viz-vectormap, file controlBar.js */
    (function(DX, undefined) {
        var _buildPath = DX.viz.renderers.buildPath,
            _setTimeout = setTimeout,
            _clearTimeout = clearTimeout,
            _round = Math.round,
            _pow = Math.pow,
            _ln = Math.log;
        var _LN2 = Math.LN2;
        var COMMAND_RESET = 'command-reset',
            COMMAND_MOVE_UP = 'command-move-up',
            COMMAND_MOVE_RIGHT = 'command-move-right',
            COMMAND_MOVE_DOWN = 'command-move-down',
            COMMAND_MOVE_LEFT = 'command-move-left',
            COMMAND_ZOOM_IN = 'command-zoom-in',
            COMMAND_ZOOM_OUT = 'command-zoom-out',
            COMMAND_ZOOM_DRAG = 'command-zoom-drag';
        var _DATA_KEY = DX.viz.map.__DATA_KEY,
            EVENT_TARGET_TYPE = 'control-bar';
        var COMMAND_TO_TYPE_MAP = {};
        COMMAND_TO_TYPE_MAP[COMMAND_RESET] = ResetCommand;
        COMMAND_TO_TYPE_MAP[COMMAND_MOVE_UP] = COMMAND_TO_TYPE_MAP[COMMAND_MOVE_RIGHT] = COMMAND_TO_TYPE_MAP[COMMAND_MOVE_DOWN] = COMMAND_TO_TYPE_MAP[COMMAND_MOVE_LEFT] = MoveCommand;
        COMMAND_TO_TYPE_MAP[COMMAND_ZOOM_IN] = COMMAND_TO_TYPE_MAP[COMMAND_ZOOM_OUT] = ZoomCommand;
        COMMAND_TO_TYPE_MAP[COMMAND_ZOOM_DRAG] = ZoomDragCommand;
        var ControlBar = DX.Class.inherit({
                ctor: function(parameters) {
                    var that = this;
                    that._container = parameters.container;
                    that._createElements(parameters.renderer);
                    var context = parameters.context,
                        resetCallback = parameters.resetCallback,
                        beginMoveCallback = parameters.beginMoveCallback,
                        endMoveCallback = parameters.endMoveCallback,
                        moveCallback = parameters.moveCallback,
                        zoomCallback = parameters.zoomCallback;
                    parameters = null;
                    that._reset = function() {
                        resetCallback.call(context)
                    };
                    that._beginMove = function() {
                        beginMoveCallback.call(context)
                    };
                    that._endMove = function() {
                        endMoveCallback.call(context)
                    };
                    that._move = function(dx, dy) {
                        moveCallback.call(context, dx, dy)
                    };
                    that._zoom = function(zoom, x, y) {
                        zoomCallback.call(context, zoom, x, y)
                    };
                    that._dispose = function() {
                        this._reset = this._move = this._zoom = this._dispose = context = resetCallback = moveCallback = zoomCallback = null
                    }
                },
                _createElements: function(renderer) {
                    var that = this;
                    that._root = renderer.createGroup({'class': 'dxm-control-bar'});
                    that._buttonsGroup = renderer.createGroup({'class': 'dxm-control-buttons'}).append(that._root);
                    that._trackersGroup = renderer.createGroup({
                        stroke: 'none',
                        strokeWidth: 0,
                        fill: '#000000',
                        opacity: 0.0001,
                        cursor: 'pointer'
                    }).append(that._root);
                    var options = {
                            bigCircleSize: 58,
                            smallCircleSize: 28,
                            buttonSize: 10,
                            arrowButtonOffset: 20,
                            incdecButtonSize: 11,
                            incButtonOffset: 66,
                            decButtonOffset: 227,
                            sliderLineStartOffset: 88.5,
                            sliderLineEndOffset: 205.5,
                            sliderLength: 20,
                            sliderWidth: 8,
                            trackerGap: 4
                        };
                    that._createButtons(renderer, options);
                    that._createTrackers(renderer, options);
                    that._root.applySettings({
                        translateX: 50.5,
                        translateY: 50.5
                    })
                },
                _createButtons: function(renderer, options) {
                    var group = this._buttonsGroup,
                        size = options.buttonSize / 2,
                        offset1 = options.arrowButtonOffset - size,
                        offset2 = options.arrowButtonOffset,
                        incdecButtonSize = options.incdecButtonSize / 2;
                    renderer.createCircle(0, 0, options.bigCircleSize / 2).append(group);
                    renderer.createCircle(0, 0, size).append(group);
                    renderer.createPath([-size, -offset1, 0, -offset2, size, -offset1]).append(group);
                    renderer.createPath([offset1, -size, offset2, 0, offset1, size]).append(group);
                    renderer.createPath([size, offset1, 0, offset2, -size, offset1]).append(group);
                    renderer.createPath([-offset1, size, -offset2, 0, -offset1, -size]).append(group);
                    renderer.createCircle(0, options.incButtonOffset, options.smallCircleSize / 2).append(group);
                    renderer.createSimplePath({d: _buildPath([-incdecButtonSize, options.incButtonOffset, incdecButtonSize, options.incButtonOffset]) + ' ' + _buildPath([0, options.incButtonOffset - incdecButtonSize, 0, options.incButtonOffset + incdecButtonSize])}).append(group);
                    renderer.createCircle(0, options.decButtonOffset, options.smallCircleSize / 2).append(group);
                    renderer.createSimplePath({d: _buildPath([-incdecButtonSize, options.decButtonOffset, incdecButtonSize, options.decButtonOffset])}).append(group);
                    renderer.createSimplePath({d: _buildPath([0, options.sliderLineStartOffset, 0, options.sliderLineEndOffset])}).append(group);
                    this._zoomDrag = renderer.createRect(-options.sliderLength / 2, options.sliderLineEndOffset - options.sliderWidth / 2, options.sliderLength, options.sliderWidth).append(group);
                    this._sliderLineLength = options.sliderLineEndOffset - options.sliderLineStartOffset
                },
                _createTrackers: function(renderer, options) {
                    var group = this._trackersGroup,
                        size = _round((options.arrowButtonOffset - options.trackerGap) / 2),
                        offset1 = options.arrowButtonOffset - size,
                        offset2 = _round(_pow(options.bigCircleSize * options.bigCircleSize / 4 - size * size, 0.5)),
                        size2 = offset2 - offset1,
                        element;
                    renderer.createRect(-size, -size, size * 2, size * 2).append(group).data(_DATA_KEY, {
                        index: COMMAND_RESET,
                        type: EVENT_TARGET_TYPE
                    });
                    renderer.createRect(-size, -offset2, size * 2, size2).append(group).data(_DATA_KEY, {
                        index: COMMAND_MOVE_UP,
                        type: EVENT_TARGET_TYPE
                    });
                    renderer.createRect(offset1, -size, size2, size * 2).append(group).data(_DATA_KEY, {
                        index: COMMAND_MOVE_RIGHT,
                        type: EVENT_TARGET_TYPE
                    });
                    renderer.createRect(-size, offset1, size * 2, size2).append(group).data(_DATA_KEY, {
                        index: COMMAND_MOVE_DOWN,
                        type: EVENT_TARGET_TYPE
                    });
                    renderer.createRect(-offset2, -size, size2, size * 2).append(group).data(_DATA_KEY, {
                        index: COMMAND_MOVE_LEFT,
                        type: EVENT_TARGET_TYPE
                    });
                    renderer.createCircle(0, options.incButtonOffset, options.smallCircleSize / 2).append(group).data(_DATA_KEY, {
                        index: COMMAND_ZOOM_IN,
                        type: EVENT_TARGET_TYPE
                    });
                    renderer.createCircle(0, options.decButtonOffset, options.smallCircleSize / 2).append(group).data(_DATA_KEY, {
                        index: COMMAND_ZOOM_OUT,
                        type: EVENT_TARGET_TYPE
                    });
                    this._zoomDragCover = renderer.createRect(-options.sliderLength / 2, options.sliderLineEndOffset - options.sliderWidth / 2, options.sliderLength, options.sliderWidth).append(group).data(_DATA_KEY, {
                        index: COMMAND_ZOOM_DRAG,
                        type: EVENT_TARGET_TYPE
                    })
                },
                dispose: function() {
                    var that = this;
                    delete that._container;
                    that._dispose();
                    that._root.clear();
                    delete that._root;
                    delete that._buttonsGroup;
                    delete that._zoomDrag;
                    delete that._zoomDragCover;
                    return that
                },
                setZoomPartition: function(partition) {
                    this._zoomPartition = partition;
                    this._sliderUnitLength = this._sliderLineLength / partition;
                    return this
                },
                setZoom: function(zoom) {
                    this._adjustZoom(zoom);
                    return this
                },
                setOptions: function(options, interactionOptions) {
                    options = options || {};
                    interactionOptions = interactionOptions || {};
                    this._dragAndZoomEnabled = interactionOptions.dragAndZoomEnabled !== undefined ? !!interactionOptions.dragAndZoomEnabled : true;
                    this._enabled = this._dragAndZoomEnabled && (options.enabled !== undefined ? !!options.enabled : true);
                    this._buttonsGroup.applySettings(options.shape);
                    return this
                },
                clean: function() {
                    this._enabled && this._root.detach();
                    return this
                },
                render: function() {
                    this._enabled && this._root.append(this._container);
                    return this
                },
                _adjustZoom: function(zoom) {
                    var that = this;
                    that._zoomFactor = _round(zoom);
                    that._zoomFactor >= 0 || (that._zoomFactor = 0);
                    that._zoomFactor <= that._zoomPartition || (that._zoomFactor = that._zoomPartition);
                    var transform = {translateY: -that._zoomFactor * that._sliderUnitLength};
                    that._zoomDrag.applySettings(transform);
                    that._zoomDragCover.applySettings(transform)
                },
                _applyZoom: function(x, y) {
                    this._zoom(this._zoomFactor, x, y)
                },
                processStart: function(arg) {
                    if (this._dragAndZoomEnabled) {
                        var commandType = COMMAND_TO_TYPE_MAP[arg.data];
                        this._command = new commandType(this, arg)
                    }
                    return this
                },
                processMove: function(arg) {
                    if (this._dragAndZoomEnabled)
                        this._command.update(arg);
                    return this
                },
                processEnd: function(arg) {
                    if (this._dragAndZoomEnabled)
                        this._command.finish(arg);
                    return this
                },
                processZoom: function(arg) {
                    var that = this,
                        zoomFactor;
                    if (that._dragAndZoomEnabled) {
                        if (arg.delta)
                            zoomFactor = arg.delta;
                        else if (arg.ratio)
                            zoomFactor = _ln(arg.ratio) / _LN2;
                        that._adjustZoom(that._zoomFactor + zoomFactor);
                        that._applyZoom(arg.x, arg.y)
                    }
                    return that
                }
            });
        function disposeCommand(command) {
            delete command._owner;
            command.update = function(){};
            command.finish = function(){}
        }
        function ResetCommand(owner, arg) {
            this._owner = owner;
            this._command = arg.data
        }
        ResetCommand.prototype.update = function(arg) {
            arg.data !== this._command && disposeCommand(this)
        };
        ResetCommand.prototype.finish = function() {
            this._owner._reset();
            this._owner._adjustZoom(0);
            disposeCommand(this)
        };
        function MoveCommand(owner, arg) {
            this._command = arg.data;
            var timeout = null,
                interval = 100,
                dx = 0,
                dy = 0;
            switch (this._command) {
                case COMMAND_MOVE_UP:
                    dy = -10;
                    break;
                case COMMAND_MOVE_RIGHT:
                    dx = 10;
                    break;
                case COMMAND_MOVE_DOWN:
                    dy = 10;
                    break;
                case COMMAND_MOVE_LEFT:
                    dx = -10;
                    break
            }
            function callback() {
                owner._move(dx, dy);
                timeout = _setTimeout(callback, interval)
            }
            this._stop = function() {
                _clearTimeout(timeout);
                owner._endMove();
                this._stop = owner = callback = null;
                return this
            };
            arg = null;
            owner._beginMove();
            callback()
        }
        MoveCommand.prototype.update = function(arg) {
            this._command !== arg.data && this.finish()
        };
        MoveCommand.prototype.finish = function() {
            disposeCommand(this._stop())
        };
        function ZoomCommand(owner, arg) {
            this._owner = owner;
            this._command = arg.data;
            var timeout = null,
                interval = 150,
                dzoom = this._command === COMMAND_ZOOM_IN ? 1 : -1;
            function callback() {
                owner._adjustZoom(owner._zoomFactor + dzoom);
                timeout = _setTimeout(callback, interval)
            }
            this._stop = function() {
                _clearTimeout(timeout);
                this._stop = owner = callback = null;
                return this
            };
            arg = null;
            callback()
        }
        ZoomCommand.prototype.update = function(arg) {
            this._command !== arg.data && this.finish()
        };
        ZoomCommand.prototype.finish = function() {
            this._owner._applyZoom();
            disposeCommand(this._stop())
        };
        function ZoomDragCommand(owner, arg) {
            this._owner = owner;
            this._zoomFactor = owner._zoomFactor;
            this._pos = arg.y
        }
        ZoomDragCommand.prototype.update = function(arg) {
            var owner = this._owner;
            owner._adjustZoom(this._zoomFactor + owner._zoomPartition * (this._pos - arg.y) / owner._sliderLineLength)
        };
        ZoomDragCommand.prototype.finish = function() {
            this._owner._applyZoom();
            disposeCommand(this)
        };
        DX.viz.map._tests.ControlBar = ControlBar;
        DX.viz.map.Map.prototype._factory.createControlBar = function(parameters) {
            return new ControlBar(parameters)
        }
    })(DevExpress);
    /*! Module viz-vectormap, file tracker.js */
    (function(DX, $, undefined) {
        var _addNamespace = DX.ui.events.addNamespace,
            _abs = Math.abs,
            _sqrt = Math.sqrt,
            _round = Math.round,
            _max = Math.max,
            _min = Math.min,
            _now = $.now,
            _extend = $.extend;
        var _NAME = DX.viz.map.Map.prototype.NAME,
            _DATA_KEY = DX.viz.map.__DATA_KEY;
        var $doc = $(document);
        var EVENTS = {};
        setupEvents();
        var EVENT_START = 'start',
            EVENT_MOVE = 'move',
            EVENT_END = 'end',
            EVENT_ZOOM = 'zoom',
            EVENT_HOVER_ON = 'hover-on',
            EVENT_HOVER_OFF = 'hover-off',
            EVENT_CLICK = 'click',
            EVENT_FOCUS_ON = 'focus-on',
            EVENT_FOCUS_MOVE = 'focus-move',
            EVENT_FOCUS_OFF = 'focus-off';
        var CLICK_TIME_THRESHOLD = 500,
            CLICK_COORD_THRESHOLD = 5,
            DRAG_COORD_THRESHOLD_MOUSE = 5,
            DRAG_COORD_THRESHOLD_TOUCH = 10,
            FOCUS_ON_DELAY_MOUSE = 300,
            FOCUS_OFF_DELAY_MOUSE = 300,
            FOCUS_ON_DELAY_TOUCH = 300,
            FOCUS_OFF_DELAY_TOUCH = 400,
            FOCUS_COORD_THRESHOLD_MOUSE = 5;
        function Tracker(parameters) {
            this._root = parameters.root;
            this._callbacks = {};
            this._createEventHandlers();
            this._focus = new Focus(this._callbacks)
        }
        _extend(Tracker.prototype, {
            dispose: function() {
                var that = this;
                that._focus.dispose();
                that._root = that._callbacks = that._focus = that._rootClickEvents = that._$docClickEvents = that._rootZoomEvents = that._$docZoomEvents = that._rootHoverEvents = that._$docHoverEvents = that._rootFocusEvents = that._$docFocusEvents = null;
                return that
            },
            _createEventHandlers: function() {
                var that = this;
                that._rootClickEvents = {};
                that._rootClickEvents[EVENTS.start] = function(event) {
                    var isTouch = isTouchEvent(event);
                    if (isTouch && !that._isTouchEnabled)
                        return;
                    event.preventDefault();
                    var coords = getEventCoords(event);
                    that._clickState = {
                        x: coords.x,
                        y: coords.y,
                        time: _now()
                    }
                };
                that._$docClickEvents = {};
                that._$docClickEvents[EVENTS.end] = function(event) {
                    var state = that._clickState;
                    if (!state)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (isTouch && !that._isTouchEnabled)
                        return;
                    if (_now() - state.time <= CLICK_TIME_THRESHOLD) {
                        var coords = getEventCoords(event);
                        if (_abs(coords.x - state.x) <= CLICK_COORD_THRESHOLD && _abs(coords.y - state.y) <= CLICK_COORD_THRESHOLD)
                            that._callbacks[EVENT_CLICK]({
                                data: $(event.target).data(_DATA_KEY) || {},
                                x: coords.x,
                                y: coords.y,
                                $event: event
                            })
                    }
                    that._clickState = null
                };
                that._rootDragEvents = {};
                that._rootDragEvents[EVENTS.start] = function(event) {
                    var isTouch = isTouchEvent(event);
                    if (isTouch && !that._isTouchEnabled)
                        return;
                    var coords = getEventCoords(event);
                    that._dragState = {
                        x: coords.x,
                        y: coords.y,
                        data: $(event.target).data(_DATA_KEY) || {}
                    };
                    if (that._isDragEnabled)
                        that._callbacks[EVENT_START]({
                            data: that._dragState.data,
                            x: coords.x,
                            y: coords.y
                        })
                };
                that._$docDragEvents = {};
                that._$docDragEvents[EVENTS.move] = function(event) {
                    var state = that._dragState;
                    if (!state)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (isTouch && !that._isTouchEnabled)
                        return;
                    var coords = getEventCoords(event),
                        threshold = isTouch ? DRAG_COORD_THRESHOLD_TOUCH : DRAG_COORD_THRESHOLD_MOUSE;
                    if (state.active || _abs(coords.x - state.x) > threshold || _abs(coords.y - state.y) > threshold) {
                        state.x = coords.x;
                        state.y = coords.y;
                        state.active = true;
                        state.data = $(event.target).data(_DATA_KEY) || {};
                        if (that._isDragEnabled)
                            that._callbacks[EVENT_MOVE]({
                                data: state.data,
                                x: coords.x,
                                y: coords.y
                            })
                    }
                };
                that._$docDragEvents[EVENTS.end] = function(event) {
                    var state = that._dragState;
                    if (!state)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (isTouch && !that._isTouchEnabled)
                        return;
                    that._endDragging()
                };
                that._rootZoomEvents = {};
                that._rootZoomEvents[EVENTS.wheel] = function(event) {
                    if (!that._isWheelEnabled)
                        return;
                    event.preventDefault();
                    if (that._zoomState)
                        return;
                    var delta = event.originalEvent.wheelDelta / 120 || event.originalEvent.detail / -3 || 0;
                    if (delta === 0)
                        return;
                    delta = delta > 0 ? _min(_round(delta) || +1, +4) : _max(_round(delta) || -1, -4);
                    var coords = getEventCoords(event);
                    if (that._isZoomEnabled)
                        that._callbacks[EVENT_ZOOM]({
                            delta: delta,
                            x: coords.x,
                            y: coords.y
                        });
                    that._zoomState = setTimeout(function() {
                        that._zoomState = null
                    }, 50)
                };
                that._rootZoomEvents[EVENTS.start] = function(event) {
                    var isTouch = isTouchEvent(event);
                    if (!isTouch || !that._isTouchEnabled)
                        return;
                    var state = that._zoomState = that._zoomState || {};
                    if (state.pointer1 && state.pointer2)
                        return;
                    var coords;
                    if (state.pointer1 === undefined) {
                        state.pointer1 = getPointerId(event) || 0;
                        coords = getMultitouchEventCoords(event, state.pointer1);
                        state.x1 = state.x1_0 = coords.x;
                        state.y1 = state.y1_0 = coords.y
                    }
                    if (state.pointer2 === undefined) {
                        var pointer2 = getPointerId(event) || 1;
                        if (pointer2 !== state.pointer1) {
                            coords = getMultitouchEventCoords(event, pointer2);
                            if (coords) {
                                state.x2 = state.x2_0 = coords.x;
                                state.y2 = state.y2_0 = coords.y;
                                state.pointer2 = pointer2;
                                state.ready = true;
                                that._endDragging()
                            }
                        }
                    }
                };
                that._$docZoomEvents = {};
                that._$docZoomEvents[EVENTS.move] = function(event) {
                    var state = that._zoomState;
                    if (!state)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (!isTouch || !that._isTouchEnabled)
                        return;
                    var coords;
                    if (state.pointer1 !== undefined) {
                        coords = getMultitouchEventCoords(event, state.pointer1);
                        if (coords) {
                            state.x1 = coords.x;
                            state.y1 = coords.y
                        }
                    }
                    if (state.pointer2 !== undefined) {
                        coords = getMultitouchEventCoords(event, state.pointer2);
                        if (coords) {
                            state.x2 = coords.x;
                            state.y2 = coords.y
                        }
                    }
                };
                that._$docZoomEvents[EVENTS.end] = function(event) {
                    var state = that._zoomState;
                    if (!state)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (!isTouch || !that._isTouchEnabled)
                        return;
                    if (state.ready) {
                        var startDistance = getDistance(state.x1_0, state.y1_0, state.x2_0, state.y2_0),
                            currentDistance = getDistance(state.x1, state.y1, state.x2, state.y2);
                        if (that._isZoomEnabled)
                            that._callbacks[EVENT_ZOOM]({
                                ratio: currentDistance / startDistance,
                                x: (state.x1_0 + state.x2_0) / 2,
                                y: (state.y1_0 + state.y2_0) / 2
                            })
                    }
                    that._zoomState = null
                };
                that._rootHoverEvents = {};
                that._rootHoverEvents[EVENTS.over] = function(event) {
                    if (that._hoverTarget === event.target)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (isTouch)
                        return;
                    var data = $(event.target).data(_DATA_KEY);
                    if (!data)
                        return;
                    that._hoverTarget && that._endHovering();
                    that._hoverTarget = event.target;
                    that._hoverState = {data: data};
                    that._callbacks[EVENT_HOVER_ON]({data: data})
                };
                that._$docHoverEvents = {};
                that._$docHoverEvents[EVENTS.out] = function(event) {
                    var state = that._hoverState;
                    if (!state)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (isTouch)
                        return;
                    var data = $(event.target).data(_DATA_KEY);
                    if (!data)
                        return;
                    that._endHovering()
                };
                that._rootFocusEvents = {};
                that._rootFocusEvents[EVENTS.start] = function(event) {
                    var isTouch = isTouchEvent(event);
                    if (!isTouch || !that._isTouchEnabled)
                        return;
                    var data = $(event.target).data(_DATA_KEY);
                    if (!data)
                        return;
                    that._focus.turnOff(FOCUS_OFF_DELAY_TOUCH);
                    that._focus.turnOn(event.target, data, getEventCoords(event), FOCUS_ON_DELAY_TOUCH);
                    that._skip$docEvent = true
                };
                that._rootFocusEvents[EVENTS.over] = function(event) {
                    if (that._focusTarget === event.target)
                        return;
                    that._focusTarget = event.target;
                    var isTouch = isTouchEvent(event);
                    if (isTouch)
                        return;
                    var data = $(event.target).data(_DATA_KEY);
                    if (!data)
                        return;
                    if (that._focusTarget)
                        that._focus.turnOff(FOCUS_OFF_DELAY_MOUSE);
                    var coords = getEventCoords(event);
                    if (that._focus.active)
                        that._focus.move(event.target, data, coords);
                    else
                        that._focus.turnOn(event.target, data, coords, FOCUS_ON_DELAY_MOUSE)
                };
                that._$docFocusEvents = {};
                that._$docFocusEvents[EVENTS.start] = function(event) {
                    that._focusTarget = event.target;
                    var isTouch = isTouchEvent(event);
                    if (!isTouch || !that._isTouchEnabled)
                        return;
                    if (!that._skip$docEvent)
                        that._focus.turnOff(FOCUS_OFF_DELAY_TOUCH);
                    that._skip$docEvent = null
                };
                that._$docFocusEvents[EVENTS.move] = function(event) {
                    if (that._focus.disabled)
                        return;
                    if (that._focusTarget !== event.target)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (isTouch && !that._isTouchEnabled)
                        return;
                    var data = $(event.target).data(_DATA_KEY);
                    if (!data)
                        return;
                    var coords = getEventCoords(event);
                    if (isTouch) {
                        if (that._dragState && that._dragState.active || that._zoomState && that._zoomState.ready)
                            that._focus.cancel()
                    }
                    else if (that._focus.active)
                        if (that._dragState && that._dragState.active) {
                            that._focus.cancel();
                            that._focus.turnOn(event.target, data, coords, FOCUS_ON_DELAY_MOUSE * 4)
                        }
                        else
                            that._focus.move(event.target, data, coords);
                    else if (_abs(coords.x - that._focus.x) > FOCUS_COORD_THRESHOLD_MOUSE || _abs(coords.y - that._focus.y) > FOCUS_COORD_THRESHOLD_MOUSE)
                        that._focus.turnOn(event.target, data, coords, FOCUS_ON_DELAY_MOUSE)
                };
                that._$docFocusEvents[EVENTS.end] = function(event) {
                    if (that._focus.disabled)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (!isTouch || !that._isTouchEnabled)
                        return;
                    that._focusTarget = null;
                    if (!that._focus.active)
                        that._focus.turnOff(FOCUS_OFF_DELAY_TOUCH);
                    else if (that._focus.changing)
                        that._focus.cancel()
                };
                that._$docFocusEvents[EVENTS.out] = function(event) {
                    if (that._focus.disabled)
                        return;
                    var isTouch = isTouchEvent(event);
                    if (isTouch)
                        return;
                    that._focusTarget = null;
                    var data = $(event.target).data(_DATA_KEY);
                    if (!data)
                        return;
                    that._focus.turnOff(FOCUS_OFF_DELAY_MOUSE)
                }
            },
            _endDragging: function() {
                var that = this,
                    state = that._dragState;
                that._dragState = null;
                if (state && that._isDragEnabled)
                    that._callbacks[EVENT_END]({
                        data: state.data,
                        x: state.x,
                        y: state.y
                    })
            },
            _endHovering: function() {
                var that = this,
                    state = that._hoverState;
                that._hoverState = that._hoverTarget = null;
                if (state)
                    that._callbacks[EVENT_HOVER_OFF]({data: state.data})
            },
            reset: function() {
                var that = this;
                that._clickState = null;
                that._endDragging();
                that._endHovering();
                that._focus.cancel();
                that._focusTarget = null;
                return that
            },
            setCallbacks: function(callbacks) {
                _extend(this._callbacks, callbacks);
                return this
            },
            setOptions: function(options) {
                this._isTouchEnabled = options.touchEnabled === undefined || !!options.touchEnabled;
                this._isWheelEnabled = options.wheelEnabled === undefined || !!options.wheelEnabled;
                this._isDragEnabled = options.dragAndZoomEnabled === undefined || !!options.dragAndZoomEnabled;
                this._isZoomEnabled = options.dragAndZoomEnabled === undefined || !!options.dragAndZoomEnabled;
                return this
            },
            clean: function() {
                var that = this;
                if (that._isTouchEnabled) {
                    that._root.applySettings({style: {
                            'touch-action': '',
                            '-ms-touch-action': '',
                            '-webkit-user-select': ''
                        }});
                    that._root.off(_addNamespace('MSHoldVisual', _NAME)).off(_addNamespace('contextmenu', _NAME))
                }
                that._detachEventHandlers();
                that.reset();
                return that
            },
            render: function() {
                var that = this;
                if (that._isTouchEnabled) {
                    that._root.applySettings({style: {
                            'touch-action': 'none',
                            '-ms-touch-action': 'none',
                            '-webkit-user-select': 'none'
                        }});
                    that._root.on(_addNamespace('MSHoldVisual', _NAME), function(event) {
                        event.preventDefault()
                    }).on(_addNamespace('contextmenu', _NAME), function(event) {
                        isTouchEvent(event) && event.preventDefault()
                    })
                }
                that._attachEventHandlers();
                return that
            },
            _attachEventHandlers: function() {
                var that = this;
                that._root.on(that._rootClickEvents).on(that._rootDragEvents).on(that._rootZoomEvents).on(that._rootHoverEvents).on(that._rootFocusEvents);
                $doc.on(that._$docClickEvents).on(that._$docDragEvents).on(that._$docZoomEvents).on(that._$docHoverEvents).on(that._$docFocusEvents)
            },
            _detachEventHandlers: function() {
                var that = this;
                that._root.off(that._rootClickEvents).off(that._rootDragEvents).off(that._rootZoomEvents).off(that._rootHoverEvents).off(that._rootFocusEvents);
                $doc.off(that._$docClickEvents).off(that._$docDragEvents).off(that._$docZoomEvents).off(that._$docHoverEvents).off(that._$docFocusEvents)
            }
        });
        function Focus(callbacks) {
            this._callbacks = callbacks;
            this.disabled = true
        }
        _extend(Focus.prototype, {
            dispose: function() {
                var that = this;
                clearTimeout(that._onTimer);
                clearTimeout(that._offTimer);
                that._callbacks = that._onTimer = that._offTimer = that.active = that._data = null
            },
            _createCallback: function(target, data, coords) {
                var that = this;
                return function() {
                        if (that.active === target) {
                            that._callbacks[EVENT_FOCUS_MOVE]({
                                data: that._data,
                                x: coords.x,
                                y: coords.y
                            });
                            onCheck(true)
                        }
                        else
                            that._callbacks[EVENT_FOCUS_ON]({
                                data: data,
                                x: coords.x,
                                y: coords.y
                            }, onCheck)
                    };
                function onCheck(result) {
                    that.changing = null;
                    that.disabled = !result;
                    if (result) {
                        that._data = data;
                        that.active = target;
                        clearTimeout(that._offTimer);
                        that._offTimer = null
                    }
                }
            },
            turnOn: function(target, data, coords, timeout) {
                var that = this;
                that.disabled = false;
                that.x = coords.x;
                that.y = coords.y;
                clearTimeout(that._onTimer);
                that.changing = true;
                that._onTimer = setTimeout(that._createCallback(target, data, coords), timeout)
            },
            move: function(target, data, coords) {
                this.x = coords.x;
                this.y = coords.y;
                this._createCallback(target, data, coords)()
            },
            turnOff: function(timeout) {
                var that = this;
                if (that.active)
                    that._offTimer = that._offTimer || setTimeout(function() {
                        that._offTimer = null;
                        that._callbacks[EVENT_FOCUS_OFF]({data: that._data});
                        that._data = that.active = null;
                        that.disabled = true
                    }, timeout);
                else {
                    clearTimeout(that._onTimer);
                    that._onTimer = null;
                    that.disabled = true
                }
            },
            cancel: function() {
                var that = this;
                if (that.active)
                    that._callbacks[EVENT_FOCUS_OFF]({data: that._data});
                clearTimeout(that._onTimer);
                clearTimeout(that._offTimer);
                that._data = that.active = that._onTimer = that._offTimer = null;
                that.disabled = true
            }
        });
        DX.viz.map._tests.Tracker = Tracker;
        DX.viz.map._tests._DEBUG_forceEventMode = function(mode) {
            setupEvents(mode)
        };
        DX.viz.map._tests.Focus = Focus;
        DX.viz.map._tests._DEBUG_stubFocusType = function(focusType) {
            Focus = focusType
        };
        DX.viz.map._tests._DEBUG_restoreFocusType = function() {
            Focus = DX.viz.map._tests.Focus
        };
        DX.viz.map.Map.prototype._factory.createTracker = function(parameters) {
            return new Tracker(parameters)
        };
        function getDistance(x1, y1, x2, y2) {
            return _sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
        }
        function isTouchEvent(event) {
            var type = event.originalEvent.type,
                pointerType = event.originalEvent.pointerType;
            return /^touch/.test(type) || /^MSPointer/.test(type) && pointerType !== 4 || /^pointer/.test(type) && pointerType !== 'mouse'
        }
        function selectItem(flags, items) {
            var i = 0,
                ii = flags.length,
                item;
            for (; i < ii; ++i)
                if (flags[i]) {
                    item = items[i];
                    break
                }
            return _addNamespace(item || items[i], _NAME)
        }
        function setupEvents() {
            var flags = [navigator.pointerEnabled, navigator.msPointerEnabled, 'ontouchstart' in window];
            if (arguments.length)
                flags = [arguments[0] === 'pointer', arguments[0] === 'MSPointer', arguments[0] === 'touch'];
            EVENTS = {
                start: selectItem(flags, ['pointerdown', 'MSPointerDown', 'touchstart mousedown', 'mousedown']),
                move: selectItem(flags, ['pointermove', 'MSPointerMove', 'touchmove mousemove', 'mousemove']),
                end: selectItem(flags, ['pointerup', 'MSPointerUp', 'touchend mouseup', 'mouseup']),
                over: selectItem(flags, ['pointerover', 'MSPointerOver', 'mouseover', 'mouseover']),
                out: selectItem(flags, ['pointerout', 'MSPointerOut', 'mouseout', 'mouseout']),
                wheel: selectItem([], ['mousewheel DOMMouseScroll'])
            }
        }
        function getEventCoords(event) {
            var originalEvent = event.originalEvent,
                touch = originalEvent.touches && originalEvent.touches[0] || {};
            return {
                    x: touch.pageX || originalEvent.pageX || event.pageX,
                    y: touch.pageY || originalEvent.pageY || event.pageY
                }
        }
        function getPointerId(event) {
            return event.originalEvent.pointerId
        }
        function getMultitouchEventCoords(event, pointerId) {
            var originalEvent = event.originalEvent;
            if (originalEvent.pointerId !== undefined)
                originalEvent = originalEvent.pointerId === pointerId ? originalEvent : null;
            else
                originalEvent = originalEvent.touches[pointerId];
            return originalEvent ? {
                    x: originalEvent.pageX || event.pageX,
                    y: originalEvent.pageY || event.pageY
                } : null
        }
    })(DevExpress, jQuery);
    /*! Module viz-vectormap, file themeManager.js */
    (function(DX, $, undefined) {
        var _Number = Number,
            _extend = $.extend,
            _each = $.each;
        var ThemeManager = DX.viz.core.BaseThemeManager.inherit({
                _themeSection: 'map',
                _initializeTheme: function() {
                    var that = this;
                    that._initializeFont(that._theme.marker.font);
                    that._initializeFont(that._theme.tooltip.font);
                    that._initializeFont(that._theme.legend.font);
                    that._initializeFont(that._theme.loadingIndicator.font)
                },
                dispose: function() {
                    var that = this;
                    that.callBase.apply(that, arguments);
                    that._areasPalette = that._markersPalette = null;
                    return that
                },
                getBackgroundSettings: function(options) {
                    var theme = this._theme.background,
                        merged = _extend({}, theme, options);
                    return {
                            strokeWidth: merged.borderWidth,
                            stroke: merged.borderColor,
                            fill: merged.color
                        }
                },
                getCommonAreaSettings: function(options) {
                    var settings = _extend({}, this._theme.area, options);
                    this._areasPalette = new DX.viz.core.GradientPalette(settings.palette, settings.paletteSize);
                    this._DEBUG_areasPalette = this._areasPalette;
                    return settings
                },
                getAreaSettings: function(commonSettings, options) {
                    options = options || {};
                    var settings = _extend({}, commonSettings, options);
                    settings.borderWidth = _Number(settings.borderWidth) || 0;
                    settings.borderColor = settings.borderColor || null;
                    if (options.color === undefined && options.paletteIndex >= 0)
                        settings.color = this._areasPalette.getColor(options.paletteIndex);
                    settings.color = settings.color || null;
                    settings.hoveredBorderWidth = _Number(settings.hoveredBorderWidth) || settings.borderWidth;
                    settings.hoveredBorderColor = settings.hoveredBorderColor || settings.borderColor;
                    settings.hoveredColor = settings.hoveredColor || settings.color;
                    settings.selectedBorderWidth = _Number(settings.selectedBorderWidth) || settings.borderWidth;
                    settings.selectedBorderColor = settings.selectedBorderColor || settings.borderColor;
                    settings.selectedColor = settings.selectedColor || settings.color;
                    return settings
                },
                getCommonMarkerSettings: function(options) {
                    options = options || {};
                    var theme = this._theme.marker,
                        allSettings = {};
                    _each(theme, function(name) {
                        if (name[0] === '_') {
                            var partialTheme = theme[name] || {},
                                partialOptions = options[name] || {},
                                settings = _extend({}, theme, partialTheme, options, partialOptions);
                            settings.font = _extend({}, theme.font, partialTheme.font, options.font, partialOptions.font);
                            allSettings[name.substr(1)] = settings
                        }
                    });
                    this._markersPalette = new DX.viz.core.Palette(options.palette || theme.palette, {
                        stepHighlight: 50,
                        theme: this.themeName()
                    });
                    this._DEBUG_markersPalette = this._markersPalette;
                    return allSettings
                },
                getMarkerSettings: function(commonSettings, options, type) {
                    options = options || {};
                    var common = commonSettings[type],
                        settings = _extend({}, common, options);
                    settings.font = _extend({}, common.font, options.font);
                    settings.borderWidth = _Number(settings.borderWidth) || 0;
                    settings.borderColor = settings.borderColor || null;
                    settings.color = settings.color || null;
                    settings.opacity = settings.opacity || null;
                    settings.hoveredBorderWidth = _Number(settings.hoveredBorderWidth) || settings.borderWidth;
                    settings.hoveredBorderColor = settings.hoveredBorderColor || settings.borderColor;
                    settings.hoveredColor = settings.hoveredColor || settings.color;
                    settings.hoveredOpacity = settings.hoveredOpacity || settings.opacity;
                    settings.selectedBorderWidth = _Number(settings.selectedBorderWidth) || settings.borderWidth;
                    settings.selectedBorderColor = settings.selectedBorderColor || settings.borderColor;
                    settings.selectedColor = settings.selectedColor || settings.color;
                    settings.selectedOpacity = settings.selectedOpacity || settings.opacity;
                    return settings
                },
                getMarkerColors: function(count) {
                    var i = 0,
                        colors = [];
                    for (; i < count; ++i)
                        colors.push(this._markersPalette.getNextColor());
                    this._markersPalette.reset();
                    return colors
                },
                getControlBarSettings: function(options) {
                    var theme = this._theme.controlBar,
                        merged = _extend({}, theme, options);
                    return _extend({}, options, {shape: {
                                strokeWidth: merged.borderWidth,
                                stroke: merged.borderColor,
                                fill: merged.color
                            }})
                },
                getLoadIndicatorSettings: function(options) {
                    var theme = this._theme.loadingIndicator;
                    return _extend(true, {}, theme, options)
                },
                getTooltipSettings: function(options) {
                    var theme = this._theme.tooltip,
                        merged = _extend({}, theme, options),
                        borderOptions = _extend({}, theme.border, options && options.border, options && !options.border && {color: options.borderColor});
                    return _extend({}, options, {
                            color: merged.color,
                            border: borderOptions,
                            text: {
                                strokeWidth: 0,
                                stroke: 'none',
                                fill: 'none',
                                font: _extend({}, theme.font, merged.font),
                                'class': 'dxm-tooltip-text'
                            },
                            arrowLength: merged.arrowLength,
                            paddingLeftRight: merged.paddingLeftRight,
                            paddingTopBottom: merged.paddingTopBottom,
                            opacity: merged.opacity,
                            shadow: _extend({}, theme.shadow, merged.shadow)
                        })
                },
                getLegendSettings: function(options) {
                    return _extend(true, {}, this._theme.legend, options)
                },
                getLegendItemSettings: function(item) {
                    var color = item.color;
                    if (color === undefined && item.paletteIndex >= 0)
                        color = this._areasPalette.getColor(item.paletteIndex);
                    return {
                            text: item.text,
                            color: color
                        }
                },
                patchRtlSettings: function(rtlEnabledOption) {
                    var theme = this._theme;
                    if (rtlEnabledOption || theme.rtlEnabled && rtlEnabledOption !== false)
                        $.extend(true, theme, theme._rtl)
                }
            });
        DX.viz.map._tests.ThemeManager = ThemeManager;
        DX.viz.map.Map.prototype._factory.createThemeManager = function() {
            return new ThemeManager
        }
    })(DevExpress, jQuery);
    /*! Module viz-vectormap, file mapItemsManager.js */
    (function(DX, $, undefined) {
        var _String = String,
            _isString = DX.utils.isString,
            _isArray = DX.utils.isArray,
            _isFunction = DX.utils.isFunction,
            _extend = $.extend,
            _each = $.each,
            _map = $.map;
        var SELECTION_MODE_NONE = 'none',
            SELECTION_MODE_SINGLE = 'single',
            SELECTION_MODE_MULTIPLE = 'multiple';
        var MapItemsManager = DX.Class.inherit({
                _rootClass: null,
                ctor: function(parameters) {
                    var that = this;
                    that._container = parameters.container;
                    that._renderer = parameters.renderer;
                    that._projection = parameters.projection;
                    that._themeManager = parameters.themeManager;
                    that._tracker = parameters.tracker;
                    that._ready = parameters.ready;
                    that._root = that._renderer.createGroup({'class': that._rootClass});
                    that._items = [];
                    that._context = {
                        renderer: that._renderer,
                        root: that._root,
                        projection: that._projection,
                        selectItem: function(index, state, noCallback) {
                            that.selectItem(index, state, noCallback)
                        }
                    }
                },
                dispose: function() {
                    var that = this;
                    that._container = that._renderer = that._projection = that._themeManager = that._tracker = that._ready = that._root = that._source = that._context = null;
                    return that
                },
                clean: function() {
                    var that = this;
                    that._rendered = false;
                    that._root.detach();
                    that._customizeCallback = that._clickCallback = that._selectionChangedCallback = null;
                    that._destroyItems();
                    return that
                },
                render: function(options) {
                    options = options || {};
                    var that = this;
                    that._rendered = true;
                    that._customizeCallback = _isFunction(options.customize) ? options.customize : null;
                    that._clickCallback = _isFunction(options.click) ? options.click : null;
                    that._selectionChangedCallback = _isFunction(options.selectionChanged) ? options.selectionChanged : null;
                    that._hoverEnabled = 'hoverEnabled' in options ? !!options.hoverEnabled : true;
                    var selectionMode = _String(options.selectionMode).toLowerCase();
                    that._selectionMode = selectionMode === SELECTION_MODE_NONE || selectionMode === SELECTION_MODE_SINGLE || selectionMode === SELECTION_MODE_MULTIPLE ? selectionMode : SELECTION_MODE_SINGLE;
                    that._root.append(that._container);
                    if (that._source !== null)
                        that._createItems();
                    return that
                },
                _destroyItems: function() {
                    var that = this;
                    that._root.clear();
                    _each(that._items, function(_, item) {
                        item.clean().dispose()
                    });
                    that._items = [];
                    that._selectedItems = null
                },
                _getItemSettings: null,
                _createItem: null,
                _isItemSelected: null,
                _arrangeItems: null,
                _createItems: function() {
                    var that = this;
                    that._selectedItems = that._selectionMode === SELECTION_MODE_MULTIPLE ? {} : null;
                    var selectedList = [];
                    _each(_isArray(that._source) ? that._source : [], function(i, dataItem) {
                        dataItem = dataItem || {};
                        var settings = that._customizeCallback && that._customizeCallback.call(dataItem, dataItem) || {};
                        var source = {
                                item: dataItem,
                                coords: that._getItemCoordinates(dataItem),
                                attrs: that._getItemAttributes(dataItem)
                            };
                        settings = that._getItemSettings(source, settings);
                        var item = that._createItem(settings);
                        item.init(that._context, source, i).render(settings).locate();
                        that._items.push(item);
                        if (that._isItemSelected(source, settings))
                            selectedList.push(i)
                    });
                    if (that._selectionMode !== SELECTION_MODE_NONE && selectedList.length > 0) {
                        if (that._selectionMode === SELECTION_MODE_SINGLE)
                            selectedList = [selectedList[selectedList.length - 1]];
                        _each(selectedList, function(_, index) {
                            that.selectItem(index, true, true)
                        })
                    }
                    that._arrangeItems();
                    that._ready && that._ready()
                },
                _processSource: null,
                setData: function(data) {
                    var that = this;
                    that._source = null;
                    if (_isString(data))
                        $.getJSON(data).done(updateSource).fail(function(_0, _1, error) {
                            updateSource(null)
                        });
                    else
                        updateSource(data);
                    return that;
                    function updateSource(source) {
                        that._source = that._processSource(source) || 0;
                        if (that._rendered) {
                            that._tracker.reset();
                            that._destroyItems();
                            that._createItems()
                        }
                    }
                },
                transform: function(transform) {
                    this._root.applySettings(transform);
                    return this
                },
                redraw: function() {
                    _each(this._items, function(_, item) {
                        item.locate()
                    });
                    return this
                },
                hoverItem: function(index, state) {
                    if (this._hoverEnabled)
                        this._items[index].setHovered(!!state);
                    return this
                },
                _raiseSelectionChanged: function(item) {
                    var that = this;
                    if (that._selectionChangedCallback)
                        setTimeout(function() {
                            that._selectionChangedCallback && that._selectionChangedCallback.call(item.proxy, item.proxy)
                        }, 0)
                },
                selectItem: function(index, state, noCallback) {
                    var that = this;
                    if (that._selectionMode === SELECTION_MODE_NONE)
                        return that;
                    var item = that._items[index],
                        previous = item.selected;
                    item.setSelected(!!state);
                    if (item.selected === previous)
                        return that;
                    if (!noCallback)
                        that._raiseSelectionChanged(item);
                    if (item.selected && that._selectionMode === SELECTION_MODE_SINGLE && that._selectedItems) {
                        that._selectedItems.setSelected(false);
                        if (!noCallback)
                            that._raiseSelectionChanged(that._selectedItems);
                        that._selectedItems = null
                    }
                    if (that._selectionMode === SELECTION_MODE_SINGLE)
                        that._selectedItems = item.selected ? item : null;
                    else if (item.selected)
                        that._selectedItems[index] = item;
                    else
                        delete that._selectedItems[index];
                    return that
                },
                clearSelection: function() {
                    var that = this;
                    if (that._selectionMode === SELECTION_MODE_NONE)
                        return that;
                    if (that._selectionMode === SELECTION_MODE_SINGLE) {
                        if (that._selectedItems) {
                            that._selectedItems.setSelected(false);
                            that._raiseSelectionChanged(that._selectedItems);
                            that._selectedItems = null
                        }
                    }
                    else
                        _each(that._selectedItems, function(i, item) {
                            item.setSelected(false);
                            that._raiseSelectionChanged(item);
                            delete that._selectedItems[i]
                        });
                    return that
                },
                raiseClick: function(index, $event) {
                    var that = this,
                        item = that._items[index];
                    if (that._clickCallback)
                        setTimeout(function() {
                            that._clickCallback && that._clickCallback.call(item.proxy, item.proxy, $event)
                        }, 0);
                    return that
                },
                getProxyItems: function() {
                    return _map(this._items, function(item) {
                            return item.proxy
                        })
                },
                getProxyItem: function(index) {
                    return this._items[index].proxy
                }
            });
        DX.viz.map._internal.mapItemBehavior = {
            init: function(ctx, src, index) {
                var that = this;
                that._ctx = ctx;
                that._src = src;
                that._coords = that._project(ctx.projection, src.coords);
                that._data = {
                    index: index,
                    type: that._type
                };
                that.hovered = that.selected = false;
                that.proxy = createProxy(that, src.attrs, ctx.selectItem);
                that.proxy.type = that._type;
                that._init();
                return that
            },
            dispose: function() {
                disposeItem(this.proxy);
                disposeItem(this);
                return this
            },
            locate: function() {
                var that = this;
                that._locate(that._transform(that._ctx.projection, that._coords));
                return that
            },
            clean: function() {
                this._root.detach();
                return this
            },
            render: function(settings) {
                var that = this;
                that._root = that._createRoot().append(that._ctx.root);
                that._render(settings);
                return that
            },
            setHovered: function(state) {
                var that = this;
                that.hovered = !!state;
                that._onHover();
                if (!that.selected)
                    if (that.hovered)
                        that._setHoveredState();
                    else
                        that._setDefaultState();
                return that
            },
            setSelected: function(state) {
                var that = this;
                that.selected = !!state;
                if (that.selected)
                    that._setSelectedState();
                else
                    that.setHovered(that.hovered);
                return that
            }
        };
        function createProxy(item, attributes, selectItem) {
            attributes = attributes || {};
            return {
                    attribute: function(name) {
                        return name !== undefined ? attributes[name] : _extend({}, attributes)
                    },
                    selected: function(state, _noEvent) {
                        if (state !== undefined) {
                            if (item.selected !== !!state)
                                selectItem(item._data.index, !!state, _noEvent);
                            return this
                        }
                        else
                            return item.selected
                    }
                }
        }
        function disposeItem(item) {
            _each(item, function(name) {
                item[name] = null
            })
        }
        DX.viz.map._tests.MapItemsManager = MapItemsManager;
        DX.viz.map.Map.prototype._factory.MapItemsManager = MapItemsManager
    })(DevExpress, jQuery);
    /*! Module viz-vectormap, file areasManager.js */
    (function(DX, $, undefined) {
        var _DATA_KEY = DX.viz.map.__DATA_KEY;
        var AreasManager = DX.viz.map.Map.prototype._factory.MapItemsManager.inherit({
                _rootClass: 'dxm-areas',
                _processSource: function(source) {
                    var isGeoJson = source && source.type === 'FeatureCollection';
                    this._getItemCoordinates = isGeoJson ? getCoordinatesGeoJson : getCoordinatesDefault;
                    this._getItemAttributes = isGeoJson ? getAttributesGeoJson : getAttributesDefault;
                    return isGeoJson ? source.features : source
                },
                clean: function() {
                    this._commonSettings = null;
                    return this.callBase.apply(this, arguments)
                },
                render: function(options) {
                    this._commonSettings = this._themeManager.getCommonAreaSettings(options || {});
                    return this.callBase.apply(this, arguments)
                },
                _getItemSettings: function(_, options) {
                    return this._themeManager.getAreaSettings(this._commonSettings, options)
                },
                _createItem: function() {
                    return new Area
                },
                _isItemSelected: function(source, settings) {
                    return source.attrs.isSelected || settings.isSelected
                },
                _arrangeItems: $.noop
            });
        function getCoordinatesDefault(dataItem) {
            return dataItem.coordinates
        }
        function getCoordinatesGeoJson(dataItem) {
            var coordinates;
            if (dataItem.geometry) {
                var type = dataItem.geometry.type;
                coordinates = dataItem.geometry.coordinates;
                if (coordinates && (type === 'Polygon' || type === 'MultiPolygon'))
                    type === 'MultiPolygon' && (coordinates = [].concat.apply([], coordinates));
                else
                    coordinates = undefined
            }
            return coordinates
        }
        function getAttributesDefault(dataItem) {
            return dataItem.attributes
        }
        function getAttributesGeoJson(dataItem) {
            return dataItem.properties
        }
        function Area(){}
        $.extend(Area.prototype, DX.viz.map._internal.mapItemBehavior, {
            _type: 'area',
            _project: function(projection, coords) {
                return projection.projectArea(coords)
            },
            _init: $.noop,
            _createRoot: function() {
                return this._ctx.renderer.createSimplePath()
            },
            _render: function(settings) {
                var that = this;
                that._styles = {
                    normal: {
                        'class': 'dxm-area',
                        stroke: settings.borderColor,
                        strokeWidth: settings.borderWidth,
                        fill: settings.color
                    },
                    hovered: {
                        'class': 'dxm-area dxm-area-hovered',
                        stroke: settings.hoveredBorderColor,
                        strokeWidth: settings.hoveredBorderWidth,
                        fill: settings.hoveredColor
                    },
                    selected: {
                        'class': 'dxm-area dxm-area-selected',
                        stroke: settings.selectedBorderColor,
                        strokeWidth: settings.selectedBorderWidth,
                        fill: settings.selectedColor
                    }
                };
                that._root.applySettings(that._styles.normal).data(_DATA_KEY, that._data);
                return that
            },
            _transform: function(projection, coords) {
                return projection.getAreaCoordinates(coords)
            },
            _locate: function(coords) {
                this._root.applySettings({d: coords})
            },
            _onHover: $.noop,
            _setDefaultState: function() {
                this._root.applySettings(this._styles.normal).toBackground()
            },
            _setHoveredState: function() {
                this._root.applySettings(this._styles.hovered).toForeground()
            },
            _setSelectedState: function() {
                this._root.applySettings(this._styles.selected).toForeground()
            }
        });
        DX.viz.map._tests.AreasManager = AreasManager;
        DX.viz.map._tests.Area = Area;
        DX.viz.map.Map.prototype._factory.createAreasManager = function(parameters) {
            return new AreasManager(parameters)
        }
    })(DevExpress, jQuery);
    /*! Module viz-vectormap, file markersManager.js */
    (function(DX, $, undefined) {
        var _Number = Number,
            _String = String,
            _isFinite = isFinite,
            _round = Math.round,
            _max = Math.max,
            _min = Math.min,
            _extend = $.extend,
            _isArray = DX.utils.isArray,
            _processCircleSettings = DX.viz.renderers.processCircleSettings;
        var CLASS_DEFAULT = 'dxm-marker',
            CLASS_HOVERED = 'dxm-marker dxm-marker-hovered',
            CLASS_SELECTED = 'dxm-marker dxm-marker-selected',
            TRACKER_SETTINGS = {
                stroke: 'none',
                strokeWidth: 0,
                fill: '#000000',
                opacity: 0.0001
            };
        var _DATA_KEY = DX.viz.map.__DATA_KEY;
        var DEFAULT_MARKER_TYPE = 'dot',
            MARKER_TYPES = {};
        var MarkersManager = DX.viz.map.Map.prototype._factory.MapItemsManager.inherit({
                _rootClass: 'dxm-markers',
                ctor: function() {
                    var that = this;
                    that.callBase.apply(that, arguments);
                    that._context.getColors = function(count) {
                        return that._themeManager.getMarkerColors(count)
                    };
                    that._filter = that._renderer.createFilter('shadow').applySettings({
                        x: '-40%',
                        y: '-40%',
                        width: '180%',
                        height: '200%',
                        color: '#000000',
                        opacity: 0.2,
                        dx: 0,
                        dy: 1,
                        blur: 1
                    }).append()
                },
                dispose: function() {
                    this._filter.dispose();
                    this._filter = null;
                    return this.callBase.apply(this, arguments)
                },
                _getItemCoordinates: function(dataItem) {
                    return dataItem.coordinates
                },
                _getItemAttributes: function(dataItem) {
                    return dataItem.attributes
                },
                _processSource: function(source) {
                    return source
                },
                clean: function() {
                    var that = this;
                    that._commonSettings = null;
                    return that.callBase.apply(that, arguments)
                },
                render: function(options) {
                    var that = this;
                    that._commonSettings = that._themeManager.getCommonMarkerSettings(options);
                    that._commonSettings._filter = that._filter.ref;
                    that._commonType = parseMarkerType(options && options.type);
                    return that.callBase.apply(that, arguments)
                },
                _arrangeBubbles: function() {
                    var markers = this._items,
                        bubbles = [],
                        i,
                        ii = markers.length,
                        marker,
                        values = [];
                    for (i = 0; i < ii; ++i) {
                        marker = markers[i];
                        if (marker.type === 'bubble') {
                            bubbles.push(marker);
                            if (marker.value !== null)
                                values.push(marker.value)
                        }
                    }
                    var minValue = _min.apply(null, values),
                        maxValue = _max.apply(null, values),
                        deltaValue = maxValue - minValue || 1;
                    for (i = 0, ii = bubbles.length; i < ii; ++i) {
                        marker = bubbles[i];
                        marker.setSize(marker.value !== null ? (marker.value - minValue) / deltaValue : 0)
                    }
                },
                _getItemSettings: function(source, options) {
                    var type = parseMarkerType(source.item.type, this._commonType),
                        style = _extend(source.item.style, options);
                    style = this._themeManager.getMarkerSettings(this._commonSettings, style, type);
                    _extend(source.item, {text: source.item.text || style.text});
                    style._type = type;
                    return style
                },
                _createItem: function(settings) {
                    return new MARKER_TYPES[settings._type]
                },
                _isItemSelected: function(source, settings) {
                    return source.item.isSelected || settings.isSelected
                },
                _arrangeItems: function() {
                    this._arrangeBubbles()
                },
                addMarker: function(dataItem) {
                    var that = this,
                        index = that._items.length,
                        marker = that._createItem(dataItem, index);
                    that._items.push(marker);
                    if (marker._selected)
                        that.selectItem(index, true, true);
                    that._arrangeItems();
                    return that
                }
            });
        var baseMarkerBehavior = _extend({}, DX.viz.map._internal.mapItemBehavior, {
                _type: 'marker',
                _project: function(projection, coords) {
                    return projection.projectPoint(coords)
                },
                _init: function() {
                    this.proxy.coordinates = createCoordinatesGetter(this._src.coords);
                    this.proxy.text = this._src.item.text
                },
                _createRoot: function() {
                    return this._ctx.renderer.createGroup()
                },
                _render: function(settings) {
                    var that = this;
                    that._root.applySettings({'class': CLASS_DEFAULT});
                    that._create(settings, that._ctx.renderer, that._root);
                    that._createText(settings, that._ctx.renderer, that._root);
                    return that
                },
                _createText: function(settings, renderer, root) {
                    var that = this;
                    if (!that._src.item.text)
                        return;
                    var rootbox = that._root.getBBox(),
                        text = renderer.createText(that._src.item.text, 0, 0, {
                            align: 'center',
                            font: settings.font
                        }).append(root),
                        textBox = text.getBBox(),
                        x = _round(-textBox.x + rootbox.width / 2) + 2,
                        y = _round(-textBox.y - textBox.height / 2) - 1;
                    text.applySettings({
                        x: x,
                        y: y
                    });
                    renderer.createRect(x + textBox.x - 1, y + textBox.y - 1, textBox.width + 2, textBox.height + 2, 0, TRACKER_SETTINGS).data(_DATA_KEY, that._data).append(root)
                },
                _transform: function(projection, coords) {
                    return projection.getPointCoordinates(coords)
                },
                _locate: function(coords) {
                    this._root.applySettings({
                        translateX: coords.x,
                        translateY: coords.y
                    })
                },
                _onHover: function() {
                    this.hovered && this._root.toForeground()
                },
                _setDefaultState: function() {
                    this._root.applySettings({'class': CLASS_DEFAULT}).toBackground();
                    this._applyDefault()
                },
                _setHoveredState: function() {
                    this._root.applySettings({'class': CLASS_HOVERED});
                    this._applyHovered()
                },
                _setSelectedState: function() {
                    this._root.applySettings({'class': CLASS_SELECTED}).toForeground();
                    this._applySelected()
                }
            });
        function createCoordinatesGetter(coordinates) {
            return function() {
                    return [_Number(coordinates[0]), _Number(coordinates[1])]
                }
        }
        function DotMarker(){}
        _extend(DotMarker.prototype, baseMarkerBehavior, {
            type: 'dot',
            _create: function(style, renderer, root) {
                var that = this,
                    size = style.size > 0 ? _Number(style.size) : 0,
                    hoveredSize = size,
                    selectedSize = size + (style.selectedStep > 0 ? _Number(style.selectedStep) : 0),
                    hoveredBackSize = hoveredSize + (style.backStep > 0 ? _Number(style.backStep) : 0),
                    selectedBackSize = selectedSize + (style.backStep > 0 ? _Number(style.backStep) : 0),
                    settings = _processCircleSettings(0, 0, size, style.borderWidth);
                that._dotDefault = {
                    cx: settings.cx,
                    cy: settings.cy,
                    r: settings.r,
                    stroke: style.borderColor,
                    strokeWidth: style.borderWidth,
                    fill: style.color,
                    filter: style.shadow ? style._filter : null
                };
                that._dotHovered = {
                    cx: settings.cx,
                    cy: settings.cy,
                    r: hoveredSize / 2,
                    stroke: style.hoveredBorderColor,
                    strokeWidth: style.hoveredBorderWidth,
                    fill: style.hoveredColor
                };
                that._dotSelected = {
                    cx: settings.cx,
                    cy: settings.cy,
                    r: selectedSize / 2,
                    stroke: style.selectedBorderColor,
                    strokeWidth: style.selectedBorderWidth,
                    fill: style.selectedColor
                };
                that._backDefault = {
                    cx: settings.cx,
                    cy: settings.cy,
                    r: settings.r,
                    stroke: 'none',
                    strokeWidth: 0,
                    fill: style.backColor,
                    opacity: style.backOpacity
                };
                that._backHovered = {
                    cx: settings.cx,
                    cy: settings.cy,
                    r: hoveredBackSize / 2,
                    stroke: 'none',
                    strokeWidth: 0,
                    fill: style.backColor,
                    opacity: style.backOpacity
                };
                that._backSelected = {
                    cx: settings.cx,
                    cy: settings.cy,
                    r: selectedBackSize / 2,
                    stroke: 'none',
                    strokeWidth: 0,
                    fill: style.backColor,
                    opacity: style.backOpacity
                };
                that._back = renderer.createCircle().applySettings(that._backDefault).data(_DATA_KEY, that._data).append(root);
                that._dot = renderer.createCircle().applySettings(that._dotDefault).data(_DATA_KEY, that._data).append(root)
            },
            _destroy: function() {
                this._back = this._dot = null
            },
            _applyDefault: function() {
                this._back.applySettings(this._backDefault);
                this._dot.applySettings(this._dotDefault)
            },
            _applyHovered: function() {
                this._back.applySettings(this._backHovered);
                this._dot.applySettings(this._dotHovered)
            },
            _applySelected: function() {
                this._back.applySettings(this._backSelected);
                this._dot.applySettings(this._dotSelected)
            }
        });
        function BubbleMarker(){}
        _extend(BubbleMarker.prototype, baseMarkerBehavior, {
            type: 'bubble',
            _create: function(style, renderer, root) {
                var that = this;
                that._minSize = style.minSize > 0 ? _Number(style.minSize) : 0;
                that._maxSize = style.maxSize > that._minSize ? _Number(style.maxSize) : that._minSize;
                that.value = _isFinite(that._src.item.value) ? _Number(that._src.item.value) : null;
                that._default = {
                    stroke: style.borderColor,
                    strokeWidth: style.borderWidth,
                    fill: style.color,
                    opacity: style.opacity
                };
                that._hovered = {
                    stroke: style.hoveredBorderColor,
                    strokeWidth: style.hoveredBorderWidth,
                    fill: style.hoveredColor,
                    opacity: style.hoveredOpacity
                };
                that._selected = {
                    stroke: style.selectedBorderColor,
                    strokeWidth: style.selectedBorderWidth,
                    fill: style.selectedColor,
                    opacity: style.selectedOpacity
                };
                that._bubble = renderer.createCircle(0, 0, style.maxSize / 2).applySettings(that._default).data(_DATA_KEY, that._data).append(root)
            },
            _destroy: function() {
                this._bubble = null
            },
            _applyDefault: function() {
                this._bubble.applySettings(this._default)
            },
            _applyHovered: function() {
                this._bubble.applySettings(this._hovered)
            },
            _applySelected: function() {
                this._bubble.applySettings(this._selected)
            },
            setSize: function(ratio) {
                var that = this,
                    settings = _processCircleSettings(0, 0, that._minSize + ratio * (that._maxSize - that._minSize), that._default.strokeWidth);
                that._default.cx = that._hovered.cx = that._selected.cx = settings.cx;
                that._default.cy = that._hovered.cy = that._selected.cy = settings.cy;
                that._default.r = that._hovered.r = that._selected.r = settings.r;
                that._bubble.applySettings(settings);
                return that
            }
        });
        function PieMarker(){}
        _extend(PieMarker.prototype, baseMarkerBehavior, {
            type: 'pie',
            _create: function(style, renderer, root) {
                var that = this,
                    settings = _processCircleSettings(0, 0, style.size > 0 ? _Number(style.size) : 0, style.borderWidth);
                that._pieDefault = {opacity: style.opacity};
                that._pieHovered = {opacity: style.hoveredOpacity};
                that._pieSelected = {opacity: style.selectedOpacity};
                that._borderDefault = {
                    stroke: style.borderColor,
                    strokeWidth: style.borderWidth
                };
                that._borderHovered = {
                    stroke: style.hoveredBorderColor,
                    strokeWidth: style.hoveredBorderWidth
                };
                that._borderSelected = {
                    stroke: style.selectedBorderColor,
                    strokeWidth: style.selectedBorderWidth
                };
                var srcValues = that._src.item.values,
                    i = 0,
                    ii = _isArray(srcValues) ? srcValues.length : 0,
                    values = [],
                    value,
                    sum = 0;
                for (; i < ii; ++i) {
                    value = _Number(srcValues[i]);
                    if (_isFinite(value)) {
                        values.push(value);
                        sum += value
                    }
                }
                that._pie = renderer.createGroup(that._pieDefault);
                var translator = new DX.viz.core.Translator1D(0, sum, 90, 450),
                    startAngle = translator.translate(0),
                    endAngle,
                    colors = that._ctx.getColors(values.length);
                for (value = 0, i = 0, ii = values.length; i < ii; ++i) {
                    value += values[i];
                    endAngle = translator.translate(value);
                    renderer.createArc(settings.cx, settings.cy, settings.r, 0, startAngle, endAngle, {fill: colors[i]}).data(_DATA_KEY, that._data).append(that._pie);
                    startAngle = endAngle
                }
                that._pie.append(root);
                that._border = renderer.createCircle(settings.cx, settings.cy, settings.r, that._borderDefault).data(_DATA_KEY, that._data).append(root)
            },
            _destroy: function() {
                this._pie = this._border = null
            },
            _applyDefault: function() {
                this._pie.applySettings(this._pieDefault);
                this._border.applySettings(this._borderDefault)
            },
            _applyHovered: function() {
                this._pie.applySettings(this._pieHovered);
                this._border.applySettings(this._borderHovered)
            },
            _applySelected: function() {
                this._pie.applySettings(this._pieSelected);
                this._border.applySettings(this._borderSelected)
            }
        });
        function ImageMarker(){}
        _extend(ImageMarker.prototype, baseMarkerBehavior, {
            type: 'image',
            _create: function(style, renderer, root) {
                var that = this,
                    size = style.size > 0 ? _Number(style.size) : 0,
                    hoveredSize = size + (style.hoveredStep > 0 ? _Number(style.hoveredStep) : 0),
                    selectedSize = size + (style.selectedStep > 0 ? _Number(style.selectedStep) : 0);
                that._default = {
                    x: -size / 2,
                    y: -size / 2,
                    width: size,
                    height: size
                };
                that._hovered = {
                    x: -hoveredSize / 2,
                    y: -hoveredSize / 2,
                    width: hoveredSize,
                    height: hoveredSize
                };
                that._selected = {
                    x: -selectedSize / 2,
                    y: -selectedSize / 2,
                    width: selectedSize,
                    height: selectedSize
                };
                that._image = renderer.createImage().applySettings(that._default).applySettings({
                    href: that._src.item.url,
                    location: 'center'
                }).append(root);
                that._tracker = renderer.createRect().applySettings(that._default).applySettings(TRACKER_SETTINGS).data(_DATA_KEY, that._data).append(root)
            },
            _destroy: function() {
                this._image = this._tracker = null
            },
            _applyDefault: function() {
                this._image.applySettings(this._default);
                this._tracker.applySettings(this._default)
            },
            _applyHovered: function() {
                this._image.applySettings(this._hovered);
                this._tracker.applySettings(this._hovered)
            },
            _applySelected: function() {
                this._image.applySettings(this._selected);
                this._tracker.applySettings(this._selected)
            }
        });
        MARKER_TYPES['dot'] = DotMarker;
        MARKER_TYPES['bubble'] = BubbleMarker;
        MARKER_TYPES['pie'] = PieMarker;
        MARKER_TYPES['image'] = ImageMarker;
        function parseMarkerType(type, defaultType) {
            return MARKER_TYPES[type] && type || defaultType || DEFAULT_MARKER_TYPE
        }
        var __originalDefaultMarkerType = DEFAULT_MARKER_TYPE,
            __originalMarkerTypes = $.extend({}, MARKER_TYPES);
        DX.viz.map._tests.stubMarkerTypes = function(markerTypes, defaultMarkerType) {
            DEFAULT_MARKER_TYPE = defaultMarkerType;
            MARKER_TYPES = markerTypes
        };
        DX.viz.map._tests.restoreMarkerTypes = function() {
            DEFAULT_MARKER_TYPE = __originalDefaultMarkerType;
            MARKER_TYPES = __originalMarkerTypes
        };
        DX.viz.map._tests.baseMarkerBehavior = baseMarkerBehavior;
        DX.viz.map._tests.MarkersManager = MarkersManager;
        DX.viz.map._tests.DotMarker = DotMarker;
        DX.viz.map._tests.BubbleMarker = BubbleMarker;
        DX.viz.map._tests.PieMarker = PieMarker;
        DX.viz.map._tests.ImageMarker = ImageMarker;
        DX.viz.map.Map.prototype._factory.createMarkersManager = function(parameters) {
            return new MarkersManager(parameters)
        }
    })(DevExpress, jQuery);
    DevExpress.MOD_VIZ_VECTORMAP = true
}