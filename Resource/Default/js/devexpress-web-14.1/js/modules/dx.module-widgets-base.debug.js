/*! 
* DevExtreme (Common Widgets)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_WIDGETS_BASE) {
    if (!window.DevExpress)
        throw Error('Required module is not referenced: core');
    /*! Module widgets-base, file ui.scrollable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SCROLLABLE = "dxScrollable",
            SCROLLABLE_STRATEGY = "dxScrollableStrategy",
            SCROLLABLE_CLASS = "dx-scrollable",
            SCROLLABLE_DISABLED_CLASS = "dx-scrollable-disabled",
            SCROLLABLE_CONTAINER_CLASS = "dx-scrollable-container",
            SCROLLABLE_CONTENT_CLASS = "dx-scrollable-content",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            BOTH = "both";
        DX.registerComponent(SCROLLABLE, DX.DOMComponent.inherit({
            NAMESPACE: ui,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    disabled: false,
                    scrollAction: null,
                    direction: VERTICAL,
                    showScrollbar: true,
                    useNative: true,
                    updateAction: null,
                    useSimulatedScrollbar: false,
                    useKeyboard: true,
                    inertiaEnabled: true,
                    bounceEnabled: true,
                    scrollByContent: true,
                    scrollByThumb: false,
                    startAction: null,
                    endAction: null,
                    bounceAction: null,
                    stopAction: null
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function(device) {
                                return !DX.support.nativeScrolling
                            },
                            options: {
                                useNative: false,
                                useSimulatedScrollbar: true
                            }
                        }, {
                            device: function(device) {
                                return !DX.support.nativeScrolling && !DX.devices.isSimulator() && DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {
                                scrollByThumb: true,
                                scrollByContent: false,
                                showScrollbar: "onHover",
                                bounceEnabled: false
                            }
                        }, {
                            device: function(device) {
                                return DX.support.nativeScrolling && DX.devices.real().platform === "android"
                            },
                            options: {useSimulatedScrollbar: true}
                        }])
            },
            _init: function() {
                this.callBase();
                this._initMarkup();
                this._attachNativeScrollbarsCustomizationCss();
                this._locked = false
            },
            _visibilityChanged: function(visible) {
                if (visible) {
                    this.update();
                    this._savedScrollOffset && this.scrollTo(this._savedScrollOffset)
                }
                else
                    this._savedScrollOffset = this.scrollOffset()
            },
            _initMarkup: function() {
                var $element = this._element().addClass(SCROLLABLE_CLASS),
                    $container = this._$container = $("<div>").addClass(SCROLLABLE_CONTAINER_CLASS),
                    $content = this._$content = $("<div>").addClass(SCROLLABLE_CONTENT_CLASS);
                $content.append($element.contents()).appendTo($container);
                $container.appendTo($element)
            },
            _dimensionChanged: function() {
                this.update()
            },
            _attachNativeScrollbarsCustomizationCss: function() {
                if (!(navigator.platform.indexOf('Mac') > -1 && DevExpress.browser['webkit']))
                    this._element().addClass("dx-scrollable-customizable-scrollbars")
            },
            _render: function() {
                this._renderDirection();
                this._renderStrategy();
                this._attachEventHandlers();
                this._renderDisabledState();
                this._createActions();
                this.update();
                this.callBase()
            },
            _toggleRTLDirection: function(rtl) {
                this.callBase(rtl);
                if (rtl)
                    this.scrollTo({left: this.scrollWidth() - this.clientWidth()})
            },
            _attachEventHandlers: function() {
                var strategy = this._strategy;
                var initEventData = {
                        getDirection: $.proxy(strategy.getDirection, strategy),
                        validate: $.proxy(this._validate, this)
                    };
                this._$container.off("." + SCROLLABLE).on(events.addNamespace("scroll", SCROLLABLE), $.proxy(strategy.handleScroll, strategy)).on(events.addNamespace("dxscrollinit", SCROLLABLE), initEventData, $.proxy(this._handleInit, this)).on(events.addNamespace("dxscrollstart", SCROLLABLE), $.proxy(strategy.handleStart, strategy)).on(events.addNamespace("dxscroll", SCROLLABLE), $.proxy(strategy.handleMove, strategy)).on(events.addNamespace("dxscrollend", SCROLLABLE), $.proxy(strategy.handleEnd, strategy)).on(events.addNamespace("dxscrollcancel", SCROLLABLE), $.proxy(strategy.handleCancel, strategy)).on(events.addNamespace("dxscrollstop", SCROLLABLE), $.proxy(strategy.handleStop, strategy))
            },
            _validate: function(e) {
                this.update();
                return this._strategy.validate(e)
            },
            _handleInit: function() {
                var strategy = this._strategy;
                strategy.handleInit.apply(strategy, arguments)
            },
            _renderDisabledState: function() {
                this._element().toggleClass(SCROLLABLE_DISABLED_CLASS, this.option("disabled"));
                if (this.option("disabled"))
                    this._lock();
                else
                    this._unlock()
            },
            _renderDirection: function() {
                this._element().removeClass("dx-scrollable-" + HORIZONTAL).removeClass("dx-scrollable-" + VERTICAL).removeClass("dx-scrollable-" + BOTH).addClass("dx-scrollable-" + this.option("direction"))
            },
            _renderStrategy: function() {
                this._createStrategy();
                this._strategy.render();
                this._element().data(SCROLLABLE_STRATEGY, this._strategy)
            },
            _createStrategy: function() {
                this._strategy = this.option("useNative") ? new ui.NativeScrollableStrategy(this) : new ui.SimulatedScrollableStrategy(this)
            },
            _createActions: function() {
                this._strategy.createActions()
            },
            _clean: function() {
                this._strategy.dispose()
            },
            _optionChanged: function(optionName, optionValue) {
                switch (optionName) {
                    case"startAction":
                    case"endAction":
                    case"stopAction":
                    case"updateAction":
                    case"scrollAction":
                    case"bounceAction":
                        this._createActions();
                        break;
                    case"direction":
                        this._resetInactiveDirection();
                        this._invalidate();
                        break;
                    case"inertiaEnabled":
                    case"bounceEnabled":
                    case"scrollByContent":
                    case"scrollByThumb":
                    case"bounceEnabled":
                    case"useNative":
                    case"useKeyboard":
                    case"showScrollbar":
                    case"useSimulatedScrollbar":
                        this._invalidate();
                        break;
                    case"disabled":
                        this._renderDisabledState();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _resetInactiveDirection: function() {
                var inactiveProp = this._getInactiveProp();
                if (!inactiveProp)
                    return;
                var scrollOffset = this.scrollOffset();
                scrollOffset[inactiveProp] = 0;
                this.scrollTo(scrollOffset)
            },
            _getInactiveProp: function() {
                var direction = this.option("direction");
                if (direction === VERTICAL)
                    return "left";
                if (direction === HORIZONTAL)
                    return "top"
            },
            _location: function() {
                return this._strategy.location()
            },
            _normalizeLocation: function(location) {
                var direction = this.option("direction");
                return {
                        left: $.isPlainObject(location) ? -(location.left || location.x || 0) : direction !== VERTICAL ? -location : 0,
                        top: $.isPlainObject(location) ? -(location.top || location.y || 0) : direction !== HORIZONTAL ? -location : 0
                    }
            },
            _isLocked: function() {
                return this._locked
            },
            _lock: function() {
                this._locked = true
            },
            _unlock: function() {
                this._locked = false
            },
            _isDirection: function(direction) {
                var current = this.option("direction");
                if (direction === VERTICAL)
                    return current !== HORIZONTAL;
                if (direction === HORIZONTAL)
                    return current !== VERTICAL;
                return current === direction
            },
            _updateAllowedDirection: function() {
                var allowedDirections = this._strategy._allowedDirections();
                if (this._isDirection(BOTH) && allowedDirections.vertical && allowedDirections.horizontal)
                    this._allowedDirectionValue = BOTH;
                else if (this._isDirection(HORIZONTAL) && allowedDirections.horizontal)
                    this._allowedDirectionValue = HORIZONTAL;
                else if (this._isDirection(VERTICAL) && allowedDirections.vertical)
                    this._allowedDirectionValue = VERTICAL;
                else
                    this._allowedDirectionValue = null
            },
            _allowedDirection: function() {
                return this._allowedDirectionValue
            },
            content: function() {
                return this._$content
            },
            scrollOffset: function() {
                var location = this._location();
                return {
                        top: -location.top,
                        left: -location.left
                    }
            },
            scrollTop: function() {
                return this.scrollOffset().top
            },
            scrollLeft: function() {
                return this.scrollOffset().left
            },
            clientHeight: function() {
                return this._$container.height()
            },
            scrollHeight: function() {
                return this.content().height()
            },
            clientWidth: function() {
                return this._$container.width()
            },
            scrollWidth: function() {
                return this.content().width()
            },
            update: function() {
                this._strategy.update();
                this._updateAllowedDirection();
                return $.Deferred().resolve().promise()
            },
            scrollBy: function(distance) {
                distance = this._normalizeLocation(distance);
                this._strategy.scrollBy(distance)
            },
            scrollTo: function(targetLocation) {
                targetLocation = this._normalizeLocation(targetLocation);
                var location = this._location();
                this.scrollBy({
                    left: location.left - targetLocation.left,
                    top: location.top - targetLocation.top
                })
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollbar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SCROLLBAR = "dxScrollbar",
            SCROLLABLE_SCROLLBAR_CLASS = "dx-scrollable-scrollbar",
            SCROLLABLE_SCROLLBAR_ACTIVE_CLASS = SCROLLABLE_SCROLLBAR_CLASS + "-active",
            SCROLLABLE_SCROLL_CLASS = "dx-scrollable-scroll",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            HOVER_ENABLED_STATE = "dx-scrollbar-hoverable",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            THUMB_MIN_SIZE = 15;
        var SCROLLBAR_VISIBLE = {
                onScroll: "onScroll",
                onHover: "onHover",
                always: "always",
                never: "never"
            };
        DX.registerComponent(SCROLLBAR, ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    direction: null,
                    visible: false,
                    activeStateEnabled: false,
                    visibilityMode: SCROLLBAR_VISIBLE.onScroll,
                    containerSize: 0,
                    contentSize: 0
                })
            },
            _init: function() {
                this.callBase();
                this._isHovered = false
            },
            _render: function() {
                this._renderThumb();
                this.callBase();
                this._renderDirection();
                this._update();
                this._attachPointerDownHandler();
                this.option("hoverStateEnabled", this._isHoverMode());
                this._element().toggleClass(HOVER_ENABLED_STATE, this.option("hoverStateEnabled"))
            },
            _renderThumb: function() {
                this._$thumb = $("<div>").addClass(SCROLLABLE_SCROLL_CLASS);
                this._element().addClass(SCROLLABLE_SCROLLBAR_CLASS).append(this._$thumb)
            },
            isThumb: function($element) {
                return !!this._element().find($element).length
            },
            _isHoverMode: function() {
                return this.option("visibilityMode") === SCROLLBAR_VISIBLE.onHover
            },
            _renderDirection: function() {
                var direction = this.option("direction");
                this._element().addClass("dx-scrollbar-" + direction);
                this._dimension = direction === HORIZONTAL ? "width" : "height";
                this._prop = direction === HORIZONTAL ? "left" : "top"
            },
            _attachPointerDownHandler: function() {
                this._$thumb.on(events.addNamespace("dxpointerdown", SCROLLBAR), $.proxy(this.feedbackOn, this))
            },
            feedbackOn: function() {
                this._element().addClass(SCROLLABLE_SCROLLBAR_ACTIVE_CLASS);
                activeScrollbar = this
            },
            feedbackOff: function() {
                this._element().removeClass(SCROLLABLE_SCROLLBAR_ACTIVE_CLASS);
                activeScrollbar = null
            },
            cursorEnter: function() {
                this._isHovered = true;
                this.option("visible", true)
            },
            cursorLeave: function() {
                this._isHovered = false;
                this.option("visible", false)
            },
            _renderDimensions: function() {
                this._$thumb.height(this.option("height"));
                this._$thumb.width(this.option("width"))
            },
            _toggleVisibility: function(visible) {
                visible = this._adjustVisibility(visible);
                this.option().visible = visible;
                this._$thumb.toggleClass("dx-state-invisible", !visible)
            },
            _adjustVisibility: function(visible) {
                if (this.containerToContentRatio() && !this._needScrollbar())
                    return false;
                switch (this.option("visibilityMode")) {
                    case SCROLLBAR_VISIBLE.onScroll:
                        break;
                    case SCROLLBAR_VISIBLE.onHover:
                        visible = visible || !!this._isHovered;
                        break;
                    case SCROLLBAR_VISIBLE.never:
                        visible = false;
                        break;
                    case SCROLLBAR_VISIBLE.always:
                        visible = true;
                        break
                }
                return visible
            },
            moveTo: function(location) {
                if (this._isHidden())
                    return;
                if ($.isPlainObject(location))
                    location = location[this._prop] || 0;
                var scrollBarLocation = {};
                scrollBarLocation[this._prop] = this._calculateScrollBarPosition(location);
                DX.translator.move(this._$thumb, scrollBarLocation)
            },
            _calculateScrollBarPosition: function(location) {
                return -location * this._thumbRatio
            },
            _update: function() {
                var containerSize = this.option("containerSize"),
                    contentSize = this.option("contentSize");
                this._containerToContentRatio = containerSize / contentSize;
                var thumbSize = Math.round(Math.max(Math.round(containerSize * this._containerToContentRatio), THUMB_MIN_SIZE));
                this._thumbRatio = (containerSize - thumbSize) / (contentSize - containerSize);
                this.option(this._dimension, thumbSize);
                this._element().toggle(this._needScrollbar())
            },
            _isHidden: function() {
                return this.option("visibilityMode") === SCROLLBAR_VISIBLE.never
            },
            _needScrollbar: function() {
                return !this._isHidden() && this._containerToContentRatio < 1
            },
            containerToContentRatio: function() {
                return this._containerToContentRatio
            },
            _normalizeSize: function(size) {
                return $.isPlainObject(size) ? size[this._dimension] || 0 : size
            },
            _clean: function() {
                this.callBase();
                if (this === activeScrollbar)
                    activeScrollbar = null;
                this._$thumb.off("." + SCROLLBAR)
            },
            _optionChanged: function(name, value) {
                if (this._isHidden())
                    return;
                switch (name) {
                    case"containerSize":
                    case"contentSize":
                        this.option()[name] = this._normalizeSize(value);
                        this._update();
                        break;
                    case"visibilityMode":
                    case"direction":
                        this._invalidate();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        var activeScrollbar = null;
        $(document).on(events.addNamespace("dxpointerup", SCROLLBAR), function() {
            if (activeScrollbar)
                activeScrollbar.feedbackOff()
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollable.native.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            devices = DX.devices,
            abs = Math.abs;
        var SCROLLABLE_NATIVE = "dxNativeScrollable",
            SCROLLABLE_NATIVE_CLASS = "dx-scrollable-native",
            SCROLLABLE_SCROLLBAR_SIMULATED = "dx-scrollable-scrollbar-simulated",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            GESTURE_LOCK_KEY = "dxGestureLock",
            GESTURE_LOCK_TIMEOUT = 400,
            HIDE_SCROLLBAR_TIMOUT = 500;
        ui.NativeScrollableStrategy = DX.Class.inherit({
            ctor: function(scrollable) {
                this._init(scrollable)
            },
            _init: function(scrollable) {
                this._component = scrollable;
                this._$element = scrollable._element();
                this._$container = scrollable._$container;
                this._$content = scrollable._$content;
                this._direction = scrollable.option("direction");
                this._useSimulatedScrollbar = scrollable.option("useSimulatedScrollbar");
                this._showScrollbar = scrollable.option("showScrollbar");
                this.option = $.proxy(scrollable.option, scrollable);
                this._createActionByOption = $.proxy(scrollable._createActionByOption, scrollable);
                this._isLocked = $.proxy(scrollable._isLocked, scrollable);
                this._isDirection = $.proxy(scrollable._isDirection, scrollable);
                this._allowedDirection = $.proxy(scrollable._allowedDirection, scrollable)
            },
            render: function() {
                this._$element.addClass(SCROLLABLE_NATIVE_CLASS).addClass(SCROLLABLE_NATIVE_CLASS + "-" + devices.real().platform).toggleClass(SCROLLABLE_SCROLLBARS_HIDDEN, !this._showScrollbar);
                if (this._showScrollbar && this._useSimulatedScrollbar)
                    this._renderScrollbars()
            },
            _renderScrollbars: function() {
                this._scrollbars = {};
                this._hideScrollbarTimeout = 0;
                this._$element.addClass(SCROLLABLE_SCROLLBAR_SIMULATED);
                this._renderScrollbar(VERTICAL);
                this._renderScrollbar(HORIZONTAL)
            },
            _renderScrollbar: function(direction) {
                if (!this._isDirection(direction))
                    return;
                var $scrollbar = $("<div>").dxScrollbar({direction: direction}).appendTo(this._$element);
                this._scrollbars[direction] = $scrollbar.dxScrollbar("instance")
            },
            handleInit: $.noop,
            handleStart: $.noop,
            handleMove: function(e) {
                if (this._isLocked()) {
                    e.cancel = true;
                    return
                }
                if (this._allowedDirection())
                    e.originalEvent.originalEvent.isScrollingEvent = true
            },
            handleEnd: $.noop,
            handleStop: $.noop,
            _eachScrollbar: function(callback) {
                callback = $.proxy(callback, this);
                $.each(this._scrollbars || {}, function(direction, scrollbar) {
                    callback(scrollbar, direction)
                })
            },
            createActions: function() {
                var actionConfig = {excludeValidators: ["gesture"]};
                this._scrollAction = this._createActionByOption("scrollAction", actionConfig);
                this._updateAction = this._createActionByOption("updateAction", actionConfig)
            },
            _createActionArgs: function() {
                var location = this.location();
                return {
                        jQueryEvent: this._eventForUserAction,
                        scrollOffset: {
                            top: -location.top,
                            left: -location.left
                        },
                        reachedLeft: this._isDirection(HORIZONTAL) ? location.left >= 0 : undefined,
                        reachedRight: this._isDirection(HORIZONTAL) ? location.left <= this._containerSize.width - this._componentContentSize.width : undefined,
                        reachedTop: this._isDirection(VERTICAL) ? location.top >= 0 : undefined,
                        reachedBottom: this._isDirection(VERTICAL) ? location.top <= this._containerSize.height - this._componentContentSize.height : undefined
                    }
            },
            handleScroll: function(e) {
                if (!this._isScrollLocationChanged()) {
                    e.stopImmediatePropagation();
                    return
                }
                this._eventForUserAction = e;
                this._moveScrollbars();
                this._scrollAction(this._createActionArgs());
                this._treatNativeGesture();
                this._lastLocation = this.location()
            },
            _isScrollLocationChanged: function() {
                var currentLocation = this.location(),
                    lastLocation = this._lastLocation || {},
                    isTopChanged = lastLocation.top !== currentLocation.top,
                    isLeftChanged = lastLocation.left !== currentLocation.left;
                return isTopChanged || isLeftChanged
            },
            _moveScrollbars: function() {
                this._eachScrollbar(function(scrollbar) {
                    scrollbar.moveTo(this.location());
                    scrollbar.option("visible", true)
                });
                this._hideScrollbars()
            },
            _hideScrollbars: function() {
                clearTimeout(this._hideScrollbarTimeout);
                this._hideScrollbarTimeout = setTimeout($.proxy(function() {
                    this._eachScrollbar(function(scrollbar) {
                        scrollbar.option("visible", false)
                    })
                }, this), HIDE_SCROLLBAR_TIMOUT)
            },
            _treatNativeGesture: function() {
                this._prepareGesture();
                this._forgetGesture()
            },
            _prepareGesture: function() {
                if (this._gestureEndTimer) {
                    clearTimeout(this._gestureEndTimer);
                    this._gestureEndTimer = null
                }
                else
                    this._$element.data(GESTURE_LOCK_KEY, true)
            },
            _forgetGesture: function() {
                this._gestureEndTimer = setTimeout($.proxy(function() {
                    this._$element.data(GESTURE_LOCK_KEY, false);
                    this._gestureEndTimer = null
                }, this), GESTURE_LOCK_TIMEOUT)
            },
            location: function() {
                return {
                        left: -this._$container.scrollLeft(),
                        top: -this._$container.scrollTop()
                    }
            },
            disabledChanged: $.noop,
            update: function() {
                this._update();
                this._updateAction(this._createActionArgs())
            },
            _update: function() {
                this._updateDimensions();
                this._updateScrollbars()
            },
            _updateDimensions: function() {
                this._containerSize = {
                    height: this._$container.height(),
                    width: this._$container.width()
                };
                this._componentContentSize = {
                    height: this._component.content().height(),
                    width: this._component.content().width()
                };
                this._contentSize = {
                    height: this._$content.height(),
                    width: this._$content.width()
                }
            },
            _updateScrollbars: function() {
                this._eachScrollbar(function(scrollbar, direction) {
                    var dimension = direction === VERTICAL ? "height" : "width";
                    scrollbar.option({
                        containerSize: this._containerSize[dimension],
                        contentSize: this._componentContentSize[dimension]
                    })
                })
            },
            _allowedDirections: function() {
                return {
                        vertical: this._isDirection(VERTICAL) && this._contentSize.height > this._containerSize.height,
                        horizontal: this._isDirection(HORIZONTAL) && this._contentSize.width > this._containerSize.width
                    }
            },
            dispose: function() {
                this._$element.removeClass(function(index, className) {
                    var scrollableNativeRegexp = new RegExp(SCROLLABLE_NATIVE_CLASS + "\\S*", "g");
                    if (scrollableNativeRegexp.test(className))
                        return className.match(scrollableNativeRegexp).join(" ")
                });
                this._$element.off("." + SCROLLABLE_NATIVE);
                this._$container.off("." + SCROLLABLE_NATIVE);
                this._removeScrollbars();
                clearTimeout(this._gestureEndTimer)
            },
            _removeScrollbars: function() {
                this._eachScrollbar(function(scrollbar) {
                    scrollbar._element().remove()
                })
            },
            scrollBy: function(distance) {
                var location = this.location();
                this._$container.scrollTop(-location.top - distance.top);
                this._$container.scrollLeft(-location.left - distance.left)
            },
            validate: function() {
                return !this.option("disabled") && this._allowedDirection()
            },
            getDirection: function() {
                return this._allowedDirection()
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollable.simulated.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            math = Math;
        var realDevice = DX.devices.real;
        var isSluggishPlatform = realDevice.platform === "win8" || realDevice.platform === "android";
        var SCROLLABLE_SIMULATED = "dxSimulatedScrollable",
            SCROLLABLE_STRATEGY = "dxScrollableStrategy",
            SCROLLABLE_SIMULATED_CURSOR = SCROLLABLE_SIMULATED + "Cursor",
            SCROLLABLE_SIMULATED_KEYBOARD = SCROLLABLE_SIMULATED + "Keyboard",
            SCROLLABLE_SIMULATED_CLASS = "dx-scrollable-simulated",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            ACCELERATION = isSluggishPlatform ? 0.95 : 0.92,
            OUT_BOUNDS_ACCELERATION = 0.5,
            MIN_VELOCITY_LIMIT = 1,
            FRAME_DURATION = math.round(1000 / 60),
            SCROLL_LINE_HEIGHT = 20,
            BOUNCE_MIN_VELOCITY_LIMIT = MIN_VELOCITY_LIMIT / 5,
            BOUNCE_DURATION = isSluggishPlatform ? 300 : 400,
            BOUNCE_FRAMES = BOUNCE_DURATION / FRAME_DURATION,
            BOUNCE_ACCELERATION_SUM = (1 - math.pow(ACCELERATION, BOUNCE_FRAMES)) / (1 - ACCELERATION);
        var KEY_CODES = {
                PAGE_UP: 33,
                PAGE_DOWN: 34,
                END: 35,
                HOME: 36,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40
            };
        var InertiaAnimator = DX.Animator.inherit({
                ctor: function(scroller) {
                    this.callBase();
                    this.scroller = scroller
                },
                VELOCITY_LIMIT: MIN_VELOCITY_LIMIT,
                _isFinished: function() {
                    return math.abs(this.scroller._velocity) <= this.VELOCITY_LIMIT
                },
                _step: function() {
                    this.scroller._scrollStep(this.scroller._velocity);
                    this.scroller._velocity *= this._acceleration()
                },
                _acceleration: function() {
                    return this.scroller._inBounds() ? ACCELERATION : OUT_BOUNDS_ACCELERATION
                },
                _complete: function() {
                    this.scroller._scrollComplete()
                },
                _stop: function() {
                    this.scroller._stopComplete()
                }
            });
        var BounceAnimator = InertiaAnimator.inherit({
                VELOCITY_LIMIT: BOUNCE_MIN_VELOCITY_LIMIT,
                _isFinished: function() {
                    return this.scroller._crossBoundOnNextStep() || this.callBase()
                },
                _acceleration: function() {
                    return ACCELERATION
                },
                _complete: function() {
                    this.scroller._move(this.scroller._bounceLocation);
                    this.callBase()
                }
            });
        var isWheelEvent = function(e) {
                return e.type === "dxmousewheel"
            };
        var Scroller = ui.Scroller = DX.Class.inherit({
                ctor: function(options) {
                    this._initOptions(options);
                    this._initAnimators();
                    this._initScrollbar()
                },
                _initOptions: function(options) {
                    this._location = 0;
                    this._topReached = false;
                    this._bottomReached = false;
                    this._axis = options.direction === HORIZONTAL ? "x" : "y";
                    this._prop = options.direction === HORIZONTAL ? "left" : "top";
                    this._dimension = options.direction === HORIZONTAL ? "width" : "height";
                    this._scrollProp = options.direction === HORIZONTAL ? "scrollLeft" : "scrollTop";
                    $.each(options, $.proxy(function(optionName, optionValue) {
                        this["_" + optionName] = optionValue
                    }, this))
                },
                _initAnimators: function() {
                    this._inertiaAnimator = new InertiaAnimator(this);
                    this._bounceAnimator = new BounceAnimator(this)
                },
                _initScrollbar: function() {
                    this._$scrollbar = $("<div>").dxScrollbar({
                        direction: this._direction,
                        visible: this._scrollByThumb,
                        visibilityMode: this._visibilityModeNormalize(this._scrollbarVisible),
                        containerSize: this._containerSize(),
                        contentSize: this._contentSize()
                    }).appendTo(this._$container);
                    this._scrollbar = this._$scrollbar.dxScrollbar("instance")
                },
                _visibilityModeNormalize: function(mode) {
                    return mode === true ? "onScroll" : mode === false ? "never" : mode
                },
                _scrollStep: function(delta) {
                    var prevLocation = this._location;
                    this._location += delta;
                    this._suppressBounce();
                    this._move();
                    if (prevLocation !== this._location) {
                        this._scrollAction();
                        this._$element.triggerHandler("scroll")
                    }
                },
                _suppressBounce: function() {
                    if (this._bounceEnabled || this._inBounds(this._location))
                        return;
                    this._velocity = 0;
                    this._location = this._boundLocation()
                },
                _boundLocation: function() {
                    var location = math.min(this._location, this._maxOffset);
                    return math.max(location, this._minOffset)
                },
                _move: function(location) {
                    this._location = location !== undefined ? location : this._location;
                    this._moveContent();
                    this._moveScrollbar()
                },
                _moveContent: function() {
                    var targetLocation = {};
                    targetLocation[this._prop] = this._location;
                    DX.translator.move(this._$content, targetLocation)
                },
                _moveScrollbar: function() {
                    this._scrollbar.moveTo(this._location)
                },
                _scrollComplete: function() {
                    if (this._inBounds()) {
                        this._hideScrollbar();
                        this._correctLocation();
                        if (this._completeDeferred)
                            this._completeDeferred.resolve()
                    }
                    this._scrollToBounds()
                },
                _correctLocation: function() {
                    this._location = math.round(this._location);
                    this._move()
                },
                _scrollToBounds: function() {
                    if (this._inBounds())
                        return;
                    this._bounceAction();
                    this._setupBounce();
                    this._bounceAnimator.start()
                },
                _setupBounce: function() {
                    var boundLocation = this._bounceLocation = this._boundLocation(),
                        bounceDistance = boundLocation - this._location;
                    this._velocity = bounceDistance / BOUNCE_ACCELERATION_SUM
                },
                _inBounds: function(location) {
                    location = location !== undefined ? location : this._location;
                    return location >= this._minOffset && location <= this._maxOffset
                },
                _crossBoundOnNextStep: function() {
                    var location = this._location,
                        nextLocation = location + this._velocity;
                    return location < this._minOffset && nextLocation >= this._minOffset || location > this._maxOffset && nextLocation <= this._maxOffset
                },
                _handleInit: function(e) {
                    this._stopDeferred = $.Deferred();
                    this._stopScrolling();
                    this._prepareThumbScrolling(e);
                    return this._stopDeferred.promise()
                },
                _stopScrolling: function() {
                    this._hideScrollbar();
                    this._inertiaAnimator.stop();
                    this._bounceAnimator.stop()
                },
                _prepareThumbScrolling: function(e) {
                    if (isWheelEvent(e.originalEvent))
                        return;
                    var $target = $(e.originalEvent.target);
                    var scrollbarClicked = this._isScrollbar($target);
                    if (scrollbarClicked)
                        this._moveToMouseLocation(e);
                    this._thumbScrolling = scrollbarClicked || this._isThumb($target);
                    if (this._thumbScrolling)
                        this._scrollbar.feedbackOn()
                },
                _moveToMouseLocation: function(e) {
                    var mouseLocation = e["page" + this._axis.toUpperCase()] - this._$element.offset()[this._prop];
                    var location = this._location + mouseLocation / this._containerToContentRatio() - this._$container.height() / 2;
                    this._scrollStep(-location)
                },
                _stopComplete: function() {
                    if (this._stopDeferred)
                        this._stopDeferred.resolve()
                },
                _handleStart: function() {
                    this._showScrollbar()
                },
                _handleMove: function(delta) {
                    delta = delta[this._axis];
                    if (this._thumbScrolling)
                        delta = -delta / this._containerToContentRatio();
                    if (!this._inBounds())
                        delta *= OUT_BOUNDS_ACCELERATION;
                    this._scrollStep(delta)
                },
                _containerToContentRatio: function() {
                    return this._scrollbar.containerToContentRatio()
                },
                _handleEnd: function(velocity) {
                    this._completeDeferred = $.Deferred();
                    this._velocity = velocity[this._axis];
                    this._handleInertia();
                    this._resetThumbScrolling();
                    return this._completeDeferred.promise()
                },
                _handleInertia: function() {
                    this._suppressIntertia();
                    this._inertiaAnimator.start()
                },
                _suppressIntertia: function() {
                    if (!this._inertiaEnabled || this._thumbScrolling)
                        this._velocity = 0
                },
                _resetThumbScrolling: function() {
                    this._thumbScrolling = false
                },
                _handleStop: function() {
                    this._resetThumbScrolling();
                    this._scrollToBounds()
                },
                _handleDispose: function() {
                    this._stopScrolling();
                    this._$scrollbar.remove()
                },
                _handleUpdate: function() {
                    this._update();
                    this._moveToBounds()
                },
                _update: function() {
                    this._stopScrolling();
                    this._updateLocation();
                    this._updateBounds();
                    this._updateScrollbar();
                    this._moveScrollbar();
                    this._updateScrollbarVisibility()
                },
                _updateLocation: function() {
                    this._location = DX.translator.locate(this._$content)[this._prop]
                },
                _updateBounds: function() {
                    this._maxOffset = 0;
                    this._minOffset = math.min(this._containerSize() - this._contentSize(), 0)
                },
                _updateScrollbar: function() {
                    this._scrollbar.option({
                        containerSize: this._containerSize(),
                        contentSize: this._contentSize()
                    })
                },
                _updateScrollbarVisibility: function() {
                    this._showScrollbar();
                    this._hideScrollbar()
                },
                _moveToBounds: function() {
                    this._location = this._boundLocation();
                    this._move()
                },
                _handleCreateActions: function(actions) {
                    this._scrollAction = actions.scrollAction;
                    this._bounceAction = actions.bounceAction
                },
                _showScrollbar: function() {
                    this._scrollbar.option("visible", true)
                },
                _hideScrollbar: function() {
                    this._scrollbar.option("visible", false)
                },
                _containerSize: function() {
                    return this._$container[this._dimension]()
                },
                _contentSize: function() {
                    return this._$content[this._dimension]()
                },
                _validateEvent: function(e) {
                    var $target = $(e.originalEvent.target);
                    if (this._isThumb($target) || this._isScrollbar($target)) {
                        e.preventDefault();
                        return true
                    }
                    return this._isContent($target)
                },
                _isThumb: function($element) {
                    return this._scrollByThumb && this._scrollbar.isThumb($element)
                },
                _isScrollbar: function($element) {
                    return this._scrollByThumb && $element && $element.is(this._$scrollbar)
                },
                _isContent: function($element) {
                    return this._scrollByContent && !!$element.closest(this._$element).length
                },
                _reachedMin: function() {
                    return this._location <= this._minOffset
                },
                _reachedMax: function() {
                    return this._location >= this._maxOffset
                },
                _handleCursorEnter: function() {
                    this._scrollbar.cursorEnter()
                },
                _handleCursorLeave: function() {
                    this._scrollbar.cursorLeave()
                }
            });
        var hoveredScrollable,
            activeScrollable;
        ui.SimulatedScrollableStrategy = DX.Class.inherit({
            ctor: function(scrollable) {
                this._init(scrollable)
            },
            _init: function(scrollable) {
                this._component = scrollable;
                this._$element = scrollable._element();
                this._$container = scrollable._$container.prop("tabindex", 0);
                this._$content = scrollable._$content;
                this.option = $.proxy(scrollable.option, scrollable);
                this._createActionByOption = $.proxy(scrollable._createActionByOption, scrollable);
                this._isLocked = $.proxy(scrollable._isLocked, scrollable);
                this._isDirection = $.proxy(scrollable._isDirection, scrollable);
                this._allowedDirection = $.proxy(scrollable._allowedDirection, scrollable)
            },
            render: function() {
                this._$element.addClass(SCROLLABLE_SIMULATED_CLASS);
                this._createScrollers();
                this._attachKeyboardHandler();
                this._attachCursorHandlers()
            },
            _createScrollers: function() {
                this._scrollers = {};
                if (this._isDirection(HORIZONTAL))
                    this._createScroller(HORIZONTAL);
                if (this._isDirection(VERTICAL))
                    this._createScroller(VERTICAL);
                this._$element.toggleClass(SCROLLABLE_SCROLLBARS_HIDDEN, !this.option("showScrollbar"))
            },
            _createScroller: function(direction) {
                this._scrollers[direction] = new Scroller(this._scrollerOptions(direction))
            },
            _scrollerOptions: function(direction) {
                return {
                        direction: direction,
                        $content: this._$content,
                        $container: this._$container,
                        $element: this._$element,
                        scrollByContent: this.option("scrollByContent"),
                        scrollByThumb: this.option("scrollByThumb"),
                        scrollbarVisible: this.option("showScrollbar"),
                        bounceEnabled: this.option("bounceEnabled"),
                        inertiaEnabled: this.option("inertiaEnabled")
                    }
            },
            handleInit: function(e) {
                this._supressDirections(e);
                this._eventForUserAction = e;
                this._handleEvent("Init", e).done(this._stopAction)
            },
            _supressDirections: function(e) {
                if (isWheelEvent(e.originalEvent)) {
                    this._prepareDirections(true);
                    return
                }
                this._prepareDirections();
                this._eachScroller(function(scroller, direction) {
                    var isValid = scroller._validateEvent(e);
                    this._validDirections[direction] = isValid
                })
            },
            _prepareDirections: function(value) {
                value = value || false;
                this._validDirections = {};
                this._validDirections[HORIZONTAL] = value;
                this._validDirections[VERTICAL] = value
            },
            _eachScroller: function(callback) {
                callback = $.proxy(callback, this);
                $.each(this._scrollers, function(direction, scroller) {
                    callback(scroller, direction)
                })
            },
            handleStart: function(e) {
                this._saveActive();
                this._handleEvent("Start").done(this._startAction)
            },
            _saveActive: function() {
                activeScrollable = this
            },
            _resetActive: function() {
                activeScrollable = null
            },
            _validateDirection: function(delta) {
                var result = false;
                this._eachScroller(function(scroller) {
                    result = result || scroller._validateDirection(delta)
                });
                return result
            },
            handleMove: function(e) {
                if (this._isLocked()) {
                    e.cancel = true;
                    this._resetActive();
                    return
                }
                e.preventDefault && e.preventDefault();
                this._adjustDistance(e.delta);
                this._eventForUserAction = e;
                this._handleEvent("Move", e.delta)
            },
            _adjustDistance: function(distance) {
                distance.x *= this._validDirections[HORIZONTAL];
                distance.y *= this._validDirections[VERTICAL]
            },
            handleEnd: function(e) {
                this._resetActive();
                this._refreshCursorState(e.originalEvent && e.originalEvent.target);
                this._adjustDistance(e.velocity);
                this._eventForUserAction = e;
                return this._handleEvent("End", e.velocity).done(this._endAction)
            },
            handleCancel: function(e) {
                this._resetActive();
                this._eventForUserAction = e;
                return this._handleEvent("End", {
                        x: 0,
                        y: 0
                    })
            },
            handleStop: function() {
                this._resetActive();
                this._handleEvent("Stop")
            },
            handleScroll: function() {
                var distance = {
                        left: this._$container.scrollLeft(),
                        top: this._$container.scrollTop()
                    };
                this._$container.scrollLeft(-distance.left);
                this._$container.scrollTop(-distance.top);
                this.scrollBy(distance)
            },
            _attachKeyboardHandler: function() {
                this._$element.off("." + SCROLLABLE_SIMULATED_KEYBOARD);
                if (!this.option("disabled") && this.option("useKeyboard"))
                    this._$element.on(events.addNamespace("keydown", SCROLLABLE_SIMULATED_KEYBOARD), $.proxy(this._handleKeyDown, this))
            },
            _handleKeyDown: function(e) {
                if (!this._$container.is(document.activeElement))
                    return;
                var handled = true;
                switch (e.keyCode) {
                    case KEY_CODES.DOWN:
                        this._scrollByLine({y: 1});
                        break;
                    case KEY_CODES.UP:
                        this._scrollByLine({y: -1});
                        break;
                    case KEY_CODES.RIGHT:
                        this._scrollByLine({x: 1});
                        break;
                    case KEY_CODES.LEFT:
                        this._scrollByLine({x: -1});
                        break;
                    case KEY_CODES.PAGE_DOWN:
                        this._scrollByPage(1);
                        break;
                    case KEY_CODES.PAGE_UP:
                        this._scrollByPage(-1);
                        break;
                    case KEY_CODES.HOME:
                        this._scrollToHome();
                        break;
                    case KEY_CODES.END:
                        this._scrollToEnd();
                        break;
                    default:
                        handled = false;
                        break
                }
                if (handled) {
                    e.stopPropagation();
                    e.preventDefault()
                }
            },
            _scrollByLine: function(lines) {
                this.scrollBy({
                    top: (lines.y || 0) * -SCROLL_LINE_HEIGHT,
                    left: (lines.x || 0) * -SCROLL_LINE_HEIGHT
                })
            },
            _scrollByPage: function(page) {
                var prop = this._wheelProp(),
                    dimension = this._dimensionByProp(prop);
                var distance = {};
                distance[prop] = page * -this._$container[dimension]();
                this.scrollBy(distance)
            },
            _dimensionByProp: function(prop) {
                return prop === "left" ? "width" : "height"
            },
            _scrollToHome: function() {
                var prop = this._wheelProp();
                var distance = {};
                distance[prop] = 0;
                this._component.scrollTo(distance)
            },
            _scrollToEnd: function() {
                var prop = this._wheelProp(),
                    dimension = this._dimensionByProp(prop);
                var distance = {};
                distance[prop] = this._$content[dimension]() - this._$container[dimension]();
                this._component.scrollTo(distance)
            },
            createActions: function() {
                this._startAction = this._createActionHandler("startAction");
                this._stopAction = this._createActionHandler("stopAction");
                this._endAction = this._createActionHandler("endAction");
                this._updateAction = this._createActionHandler("updateAction");
                this._createScrollerActions()
            },
            _createScrollerActions: function() {
                this._handleEvent("CreateActions", {
                    scrollAction: this._createActionHandler("scrollAction"),
                    bounceAction: this._createActionHandler("bounceAction")
                })
            },
            _createActionHandler: function(optionName) {
                var that = this,
                    actionHandler = that._createActionByOption(optionName, {excludeValidators: ["gesture"]});
                return function() {
                        actionHandler($.extend(that._createActionArgs(), arguments))
                    }
            },
            _createActionArgs: function() {
                var scrollerX = this._scrollers[HORIZONTAL],
                    scrollerY = this._scrollers[VERTICAL];
                return {
                        jQueryEvent: this._eventForUserAction,
                        scrollOffset: {
                            top: scrollerY && -scrollerY._location,
                            left: scrollerX && -scrollerX._location
                        },
                        reachedLeft: scrollerX && scrollerX._reachedMax(),
                        reachedRight: scrollerX && scrollerX._reachedMin(),
                        reachedTop: scrollerY && scrollerY._reachedMax(),
                        reachedBottom: scrollerY && scrollerY._reachedMin()
                    }
            },
            _handleEvent: function(eventName) {
                var args = $.makeArray(arguments).slice(1),
                    deferreds = $.map(this._scrollers, function(scroller) {
                        return scroller["_handle" + eventName].apply(scroller, args)
                    });
                return $.when.apply($, deferreds).promise()
            },
            location: function() {
                return DX.translator.locate(this._$content)
            },
            disabledChanged: function() {
                this._attachCursorHandlers()
            },
            _attachCursorHandlers: function() {
                this._$element.off("." + SCROLLABLE_SIMULATED_CURSOR);
                if (!this.option("disabled") && this._isHoverMode())
                    this._$element.on(events.addNamespace("mouseenter", SCROLLABLE_SIMULATED_CURSOR), $.proxy(this._handleCursorEnter, this)).on(events.addNamespace("mouseleave", SCROLLABLE_SIMULATED_CURSOR), $.proxy(this._handleCursorLeave, this))
            },
            _isHoverMode: function() {
                return this.option("showScrollbar") === "onHover"
            },
            _handleCursorEnter: function(e) {
                e = e || {};
                e.originalEvent = e.originalEvent || {};
                if (activeScrollable || e.originalEvent._hoverHandled)
                    return;
                if (hoveredScrollable)
                    hoveredScrollable._handleCursorLeave();
                hoveredScrollable = this;
                this._handleEvent("CursorEnter");
                e.originalEvent._hoverHandled = true
            },
            _handleCursorLeave: function(e) {
                if (hoveredScrollable !== this || activeScrollable === hoveredScrollable)
                    return;
                this._handleEvent("CursorLeave");
                hoveredScrollable = null;
                this._refreshCursorState(e && e.relatedTarget)
            },
            _refreshCursorState: function(target) {
                if (!this._isHoverMode() && (!target || activeScrollable))
                    return;
                var $target = $(target);
                var $scrollable = $target.closest("." + SCROLLABLE_SIMULATED_CLASS + ":not(.dx-state-disabled)");
                var targetScrollable = $scrollable.length && $scrollable.data(SCROLLABLE_STRATEGY);
                if (hoveredScrollable && hoveredScrollable !== targetScrollable)
                    hoveredScrollable._handleCursorLeave();
                if (targetScrollable)
                    targetScrollable._handleCursorEnter()
            },
            update: function() {
                return this._handleEvent("Update").done(this._updateAction)
            },
            _allowedDirections: function() {
                var bounceEnabled = this.option("bounceEnabled");
                return {
                        vertical: this._isDirection(VERTICAL) && (this._scrollers[VERTICAL]._minOffset < 0 || bounceEnabled),
                        horizontal: this._isDirection(HORIZONTAL) && (this._scrollers[HORIZONTAL]._minOffset < 0 || bounceEnabled)
                    }
            },
            scrollBy: function(distance) {
                this._prepareDirections(true);
                this._handleEvent("Start").done(this._startAction);
                this._handleEvent("Move", {
                    x: distance.left,
                    y: distance.top
                });
                this._handleEvent("End", {
                    x: 0,
                    y: 0
                }).done(this._endAction)
            },
            validate: function(e) {
                if (this.option("disabled"))
                    return false;
                if (this.option("bounceEnabled"))
                    return true;
                return isWheelEvent(e) ? this._validateWheel(e) : this._validateMove()
            },
            _validateWheel: function(e) {
                var scroller = this._scrollers[this._wheelDirection()];
                var reachedMin = scroller._reachedMin();
                var reachedMax = scroller._reachedMax();
                var contentGreaterThanContainer = !reachedMin || !reachedMax;
                var locatedNotAtBound = !reachedMin && !reachedMax;
                var scrollFromMin = reachedMin && e.delta > 0;
                var scrollFromMax = reachedMax && e.delta < 0;
                return contentGreaterThanContainer && (locatedNotAtBound || scrollFromMin || scrollFromMax)
            },
            _validateMove: function() {
                return this._allowedDirection()
            },
            getDirection: function(e) {
                return isWheelEvent(e) ? this._wheelDirection() : this._allowedDirection()
            },
            _wheelProp: function() {
                return this._wheelDirection() === HORIZONTAL ? "left" : "top"
            },
            _wheelDirection: function() {
                switch (this.option("direction")) {
                    case HORIZONTAL:
                        return HORIZONTAL;
                    case VERTICAL:
                        return VERTICAL;
                    default:
                        return this._scrollers[VERTICAL]._containerToContentRatio() >= 1 ? HORIZONTAL : VERTICAL
                }
            },
            dispose: function() {
                if (activeScrollable === this)
                    activeScrollable = null;
                if (hoveredScrollable === this)
                    hoveredScrollable = null;
                this._handleEvent("Dispose");
                this._detachEventHandlers();
                this._$element.removeClass(SCROLLABLE_SIMULATED_CLASS);
                this._eventForUserAction = null;
                clearTimeout(this._gestureEndTimer)
            },
            _detachEventHandlers: function() {
                this._$element.off("." + SCROLLABLE_SIMULATED_CURSOR);
                this._$container.off("." + SCROLLABLE_SIMULATED_KEYBOARD)
            }
        });
        ui.dxScrollable.__internals = $.extend(ui.dxScrollable.__internals || {}, {
            ACCELERATION: ACCELERATION,
            MIN_VELOCITY_LIMIT: MIN_VELOCITY_LIMIT,
            FRAME_DURATION: FRAME_DURATION,
            SCROLL_LINE_HEIGHT: SCROLL_LINE_HEIGHT
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var SCROLLVIEW_CLASS = "dx-scrollview",
            SCROLLVIEW_CONTENT_CLASS = SCROLLVIEW_CLASS + "-content",
            SCROLLVIEW_TOP_POCKET_CLASS = SCROLLVIEW_CLASS + "-top-pocket",
            SCROLLVIEW_BOTTOM_POCKET_CLASS = SCROLLVIEW_CLASS + "-bottom-pocket",
            SCROLLVIEW_PULLDOWN_CLASS = SCROLLVIEW_CLASS + "-pull-down",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-text",
            SCROLLVIEW_REACHBOTTOM_CLASS = SCROLLVIEW_CLASS + "-scrollbottom",
            SCROLLVIEW_REACHBOTTOM_INDICATOR_CLASS = SCROLLVIEW_REACHBOTTOM_CLASS + "-indicator",
            SCROLLVIEW_REACHBOTTOM_TEXT_CLASS = SCROLLVIEW_REACHBOTTOM_CLASS + "-text",
            SCROLLVIEW_LOADPANEL = SCROLLVIEW_CLASS + "-loadpanel";
        DX.registerComponent("dxScrollView", ui.dxScrollable.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    pullingDownText: Globalize.localize("dxScrollView-pullingDownText"),
                    pulledDownText: Globalize.localize("dxScrollView-pulledDownText"),
                    refreshingText: Globalize.localize("dxScrollView-refreshingText"),
                    reachBottomText: Globalize.localize("dxScrollView-reachBottomText"),
                    pullDownAction: null,
                    reachBottomAction: null,
                    refreshStrategy: "pullDown"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function(device) {
                                return DevExpress.devices.real().platform === "android"
                            },
                            options: {refreshStrategy: "swipeDown"}
                        }, {
                            device: function(device) {
                                return DevExpress.devices.real().platform === "win8"
                            },
                            options: {refreshStrategy: "slideDown"}
                        }])
            },
            _init: function() {
                this.callBase();
                this._loadingIndicatorEnabled = true
            },
            _initMarkup: function() {
                this.callBase();
                this._element().addClass(SCROLLVIEW_CLASS);
                this._initContent();
                this._initTopPocket();
                this._initBottomPocket();
                this._initLoadPanel()
            },
            _initContent: function() {
                var $content = $("<div>").addClass(SCROLLVIEW_CONTENT_CLASS);
                this._$content.wrapInner($content)
            },
            _initTopPocket: function() {
                var $topPocket = this._$topPocket = $("<div>").addClass(SCROLLVIEW_TOP_POCKET_CLASS),
                    $pullDown = this._$pullDown = $("<div>").addClass(SCROLLVIEW_PULLDOWN_CLASS);
                $topPocket.append($pullDown);
                this._$content.prepend($topPocket)
            },
            _initBottomPocket: function() {
                var $bottomPocket = this._$bottomPocket = $("<div>").addClass(SCROLLVIEW_BOTTOM_POCKET_CLASS),
                    $reachBottom = this._$reachBottom = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_CLASS),
                    $loadContainer = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_INDICATOR_CLASS),
                    $loadIndicator = $("<div>").dxLoadIndicator(),
                    $text = this._$reachBottomText = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_TEXT_CLASS);
                this._updateReachBottomText();
                $reachBottom.append($loadContainer.append($loadIndicator)).append($text);
                $bottomPocket.append($reachBottom);
                this._$content.append($bottomPocket)
            },
            _initLoadPanel: function() {
                this._loadPanel = $("<div>").addClass(SCROLLVIEW_LOADPANEL).appendTo(this._element()).dxLoadPanel({
                    shading: false,
                    delay: 400,
                    position: {of: this._element()}
                }).dxLoadPanel("instance")
            },
            _updateReachBottomText: function() {
                this._$reachBottomText.text(this.option("reachBottomText"))
            },
            _createStrategy: function() {
                var strategyName = this.option("useNative") ? this.option("refreshStrategy") : "simulated";
                var strategyClass = ui.scrollViewRefreshStrategies[strategyName];
                if (!strategyClass)
                    throw Error("Unknown dxScrollView refresh strategy " + this.option("refreshStrategy"));
                this._strategy = new strategyClass(this);
                this._strategy.pullDownCallbacks.add($.proxy(this._handlePullDown, this));
                this._strategy.releaseCallbacks.add($.proxy(this._handleRelease, this));
                this._strategy.reachBottomCallbacks.add($.proxy(this._handleReachBottom, this))
            },
            _createActions: function() {
                this.callBase();
                this._pullDownAction = this._createActionByOption("pullDownAction", {excludeValidators: ["gesture"]});
                this._reachBottomAction = this._createActionByOption("reachBottomAction", {excludeValidators: ["gesture"]});
                this._pullDownEnable(!!this.option("pullDownAction") && !DX.designMode);
                this._reachBottomEnable(!!this.option("reachBottomAction") && !DX.designMode)
            },
            _pullDownEnable: function(enabled) {
                this._$pullDown.toggle(enabled);
                this._strategy.pullDownEnable(enabled)
            },
            _reachBottomEnable: function(enabled) {
                this._$reachBottom.toggle(enabled);
                this._strategy.reachBottomEnable(enabled)
            },
            _handlePullDown: function() {
                this._loadingIndicator(false);
                this._pullDownLoading()
            },
            _loadingIndicator: function(value) {
                if (arguments.length < 1)
                    return this._loadingIndicatorEnabled;
                this._loadingIndicatorEnabled = value
            },
            _pullDownLoading: function() {
                this.startLoading();
                this._pullDownAction()
            },
            _handleReachBottom: function() {
                this._loadingIndicator(false);
                this._reachBottomLoading()
            },
            _reachBottomLoading: function() {
                this.startLoading();
                this._reachBottomAction()
            },
            _handleRelease: function() {
                this.finishLoading();
                this._loadingIndicator(true)
            },
            _optionChanged: function(optionName, optionValue) {
                switch (optionName) {
                    case"pullDownAction":
                    case"reachBottomAction":
                        this._createActions();
                        break;
                    case"pullingDownText":
                    case"pulledDownText":
                    case"refreshingText":
                    case"refreshStrategy":
                        this._invalidate();
                        break;
                    case"reachBottomText":
                        this._updateReachBottomText();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            content: function() {
                return this._$content.children().eq(1)
            },
            release: function(preventReachBottom) {
                if (preventReachBottom !== undefined)
                    this.toggleLoading(!preventReachBottom);
                return this._strategy.release()
            },
            toggleLoading: function(showOrHide) {
                this._reachBottomEnable(showOrHide)
            },
            isFull: function() {
                return this.content().height() >= this._$container.height()
            },
            refresh: function() {
                if (!this.option("pullDownAction"))
                    return;
                this._strategy.pendingRelease();
                this._pullDownLoading()
            },
            startLoading: function() {
                if (this._loadingIndicator() && this._element().is(":visible"))
                    this._loadPanel.show();
                this._lock()
            },
            finishLoading: function() {
                if (this._loadingIndicator())
                    this._loadPanel.hide();
                this._unlock()
            },
            _dispose: function() {
                this.callBase();
                if (this._loadPanel)
                    this._loadPanel._element().remove()
            }
        }));
        ui.scrollViewRefreshStrategies = {}
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.native.pullDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_PULLDOWN_READY_CLASS = "dx-scrollview-pull-down-ready",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = "dx-scrollview-pull-down-text",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3;
        var PullDownNativeScrollViewStrategy = ui.NativeScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$pullDown = scrollView._$pullDown;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._$refreshingText = scrollView._$refreshingText;
                    this._$scrollViewContent = scrollView.content();
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown();
                    this._releaseState()
                },
                _renderPullDown: function() {
                    var $image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS),
                        $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<div>").dxLoadIndicator(),
                        $text = this._$pullDownText = $("<div>").addClass(SCROLLVIEW_PULLDOWN_TEXT_CLASS);
                    this._$pullingDownText = $("<div>").text(this.option("pullingDownText")).appendTo($text);
                    this._$pulledDownText = $("<div>").text(this.option("pulledDownText")).appendTo($text);
                    this._$refreshingText = $("<div>").text(this.option("refreshingText")).appendTo($text);
                    this._$pullDown.empty().append($image).append($loadContainer.append($loadIndicator)).append($text)
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._refreshPullDownText()
                },
                _refreshPullDownText: function() {
                    this._$pullingDownText.css("opacity", this._state === STATE_RELEASED ? 1 : 0);
                    this._$pulledDownText.css("opacity", this._state === STATE_READY ? 1 : 0);
                    this._$refreshingText.css("opacity", this._state === STATE_REFRESHING ? 1 : 0)
                },
                update: function() {
                    this.callBase();
                    this._setTopPocketOffset()
                },
                _updateDimensions: function() {
                    this.callBase();
                    this._topPocketSize = this._$topPocket.height();
                    this._bottomPocketSize = this._$bottomPocket.height();
                    this._scrollOffset = this._$container.height() - this._$content.height()
                },
                _allowedDirections: function() {
                    var allowedDirections = this.callBase();
                    allowedDirections.vertical = allowedDirections.vertical || this._pullDownEnabled;
                    return allowedDirections
                },
                _setTopPocketOffset: function() {
                    this._$topPocket.css({top: -this._topPocketSize})
                },
                handleEnd: function() {
                    this._complete()
                },
                handleStop: function() {
                    this._complete()
                },
                _complete: function() {
                    if (this._state === STATE_READY) {
                        this._setPullDownOffset(this._topPocketSize);
                        clearTimeout(this._pullDownRefreshTimeout);
                        this._pullDownRefreshTimeout = setTimeout($.proxy(function() {
                            this._pullDownRefreshing()
                        }, this), 400)
                    }
                },
                _setPullDownOffset: function(offset) {
                    DX.translator.move(this._$topPocket, {top: offset});
                    DX.translator.move(this._$scrollViewContent, {top: offset})
                },
                handleScroll: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._location = this.location().top;
                    if (this._isPullDown())
                        this._pullDownReady();
                    else if (this._isReachBottom())
                        this._reachBottom();
                    else
                        this._stateReleased()
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._location >= this._topPocketSize
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._scrollOffset + this._bottomPocketSize
                },
                _reachBottom: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this.reachBottomCallbacks.fire()
                },
                _pullDownReady: function() {
                    if (this._state === STATE_READY)
                        return;
                    this._state = STATE_READY;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._releaseState()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText();
                    this.pullDownCallbacks.fire()
                },
                pullDownEnable: function(enabled) {
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled
                },
                pendingRelease: function() {
                    this._state = STATE_READY
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._updateDimensions();
                    clearTimeout(this._releaseTimeout);
                    this._releaseTimeout = setTimeout($.proxy(function() {
                        this._setPullDownOffset(0);
                        this._stateReleased();
                        this.releaseCallbacks.fire();
                        this._updateAction();
                        deferred.resolve()
                    }, this), 400);
                    return deferred.promise()
                },
                dispose: function() {
                    clearTimeout(this._pullDownRefreshTimeout);
                    clearTimeout(this._releaseTimeout);
                    this.callBase()
                }
            });
        ui.scrollViewRefreshStrategies.pullDown = PullDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.native.swipeDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_OBSOLETE_ANDROID_CLASS = "dx-scrollview-obsolete-android-browser",
            PULLDOWN_HEIGHT = 160,
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3,
            STATE_TOUCHED = 4,
            STATE_PULLED = 5;
        var SwipeDownNativeScrollViewStrategy = ui.NativeScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._$pullDown = scrollView._$pullDown;
                    this._$scrollViewContent = scrollView.content();
                    this._initCallbacks();
                    this._releaseState();
                    this._location = 0
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown()
                },
                _renderPullDown: function() {
                    this._$pullDown.empty().append($("<div class='dx-scrollview-pulldown-pointer1'>")).append($("<div class='dx-scrollview-pulldown-pointer2'>")).append($("<div class='dx-scrollview-pulldown-pointer3'>")).append($("<div class='dx-scrollview-pulldown-pointer4'>"))
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._$pullDown.css({
                        width: "0%",
                        opacity: 0
                    });
                    this._updateDimensions()
                },
                _updateDimensions: function() {
                    this.callBase();
                    this._topPocketSize = this._$topPocket.height();
                    this._bottomPocketSize = this._$bottomPocket.height();
                    this._scrollOffset = this._$container.height() - this._$content.height()
                },
                _allowedDirections: function() {
                    var allowedDirections = this.callBase();
                    allowedDirections.vertical = allowedDirections.vertical || this._pullDownEnabled;
                    return allowedDirections
                },
                handleInit: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_RELEASED && this._location === 0) {
                        this._startClientY = events.eventData(e.originalEvent).y;
                        this._state = STATE_TOUCHED
                    }
                },
                handleMove: function(e) {
                    this.callBase(e);
                    this._deltaY = events.eventData(e.originalEvent).y - this._startClientY;
                    if (this._state === STATE_TOUCHED)
                        if (this._pullDownEnabled && this._deltaY > 0) {
                            e.preventDefault();
                            this._state = STATE_PULLED
                        }
                        else
                            this._complete();
                    if (this._state === STATE_PULLED) {
                        if (this._deltaY < 0) {
                            this._complete();
                            return
                        }
                        this._$pullDown.css({
                            opacity: 1,
                            width: math.min(math.abs(this._deltaY * 100 / PULLDOWN_HEIGHT), 100) + "%"
                        });
                        if (this._isPullDown())
                            this._pullDownRefreshing()
                    }
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._deltaY >= PULLDOWN_HEIGHT
                },
                handleEnd: function() {
                    this._complete()
                },
                handleStop: function() {
                    this._complete()
                },
                _complete: function() {
                    if (this._state === STATE_TOUCHED || this._state === STATE_PULLED)
                        this._releaseState()
                },
                handleScroll: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_REFRESHING)
                        return;
                    var currentLocation = this.location().top,
                        scrollDelta = this._location - currentLocation;
                    this._location = currentLocation;
                    if (scrollDelta > 0 && this._isReachBottom())
                        this._reachBottom();
                    else
                        this._stateReleased()
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._scrollOffset + this._bottomPocketSize
                },
                _reachBottom: function() {
                    this.reachBottomCallbacks.fire()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS);
                    this._releaseState()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    clearTimeout(this._pullDownRefreshTimeout);
                    this._pullDownRefreshTimeout = setTimeout($.proxy(function() {
                        this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS);
                        this.pullDownCallbacks.fire()
                    }, this), 400)
                },
                pullDownEnable: function(enabled) {
                    this._$topPocket.toggle(enabled);
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled
                },
                pendingRelease: function() {
                    this._state = STATE_READY
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._updateDimensions();
                    clearTimeout(this._releaseTimeout);
                    this._releaseTimeout = setTimeout($.proxy(function() {
                        this._stateReleased();
                        this.releaseCallbacks.fire();
                        this._updateAction();
                        deferred.resolve()
                    }, this), 800);
                    return deferred.promise()
                },
                dispose: function() {
                    clearTimeout(this._pullDownRefreshTimeout);
                    clearTimeout(this._releaseTimeout);
                    this.callBase()
                }
            });
        ui.scrollViewRefreshStrategies.swipeDown = SwipeDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.native.slideDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var DX_SLIDE_DOWN_NATIVE_SCROLLVIEW_STRATEGY = "dxSlideDownNativeScrollViewStrategy",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_LOADING = 2,
            LOADING_HEIGHT = 80;
        var SlideDownNativeScrollViewStrategy = ui.NativeScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown();
                    this._renderBottom();
                    this._releaseState();
                    this._updateDimensions()
                },
                _renderPullDown: function() {
                    this._$topPocket.empty()
                },
                _renderBottom: function() {
                    this._$bottomPocket.empty().append("<progress>")
                },
                _releaseState: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._state = STATE_RELEASED
                },
                _updateDimensions: function() {
                    this._scrollOffset = this._$container.prop("scrollHeight") - this._$container.prop("clientHeight");
                    this._containerSize = {
                        height: this._$container.prop("clientHeight"),
                        width: this._$container.prop("clientWidth")
                    };
                    this._contentSize = this._componentContentSize = {
                        height: this._$container.prop("scrollHeight"),
                        width: this._$container.prop("scrollWidth")
                    }
                },
                handleScroll: function(e) {
                    this.callBase(e);
                    if (this._isReachBottom(this._lastLocation.top))
                        this._reachBottom()
                },
                _isReachBottom: function(location) {
                    this._scrollContent = this._$container.prop("scrollHeight") - this._$container.prop("clientHeight");
                    return this._reachBottomEnabled && location < -this._scrollContent + LOADING_HEIGHT
                },
                _reachBottom: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this.reachBottomCallbacks.fire()
                },
                pullDownEnable: function(enabled) {
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled;
                    this._$bottomPocket.toggle(enabled)
                },
                pendingRelease: function() {
                    this._state = STATE_READY
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._state = STATE_RELEASED;
                    this.releaseCallbacks.fire();
                    this.update();
                    return deferred.resolve().promise()
                }
            });
        ui.scrollViewRefreshStrategies.slideDown = SlideDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.simulated.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_PULLDOWN_READY_CLASS = "dx-scrollview-pull-down-ready",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = "dx-scrollview-pull-down-text",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3;
        var ScrollViewScroller = ui.ScrollViewScroller = ui.Scroller.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    this._initCallbacks();
                    this._releaseState()
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._refreshPullDownText()
                },
                _refreshPullDownText: function() {
                    this._$pullingDownText.css("opacity", this._state === STATE_RELEASED ? 1 : 0);
                    this._$pulledDownText.css("opacity", this._state === STATE_READY ? 1 : 0);
                    this._$refreshingText.css("opacity", this._state === STATE_REFRESHING ? 1 : 0)
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                _updateBounds: function() {
                    var considerPockets = this._direction !== "horizontal";
                    this._topPocketSize = considerPockets ? this._$topPocket[this._dimension]() : 0;
                    this._bottomPocketSize = considerPockets ? this._$bottomPocket[this._dimension]() : 0;
                    this._updateOffsets()
                },
                _updateOffsets: function() {
                    this._minOffset = math.min(this._containerSize() - this._contentSize() + this._bottomPocketSize, -this._topPocketSize);
                    this._maxOffset = -this._topPocketSize;
                    this._bottomBound = this._minOffset - this._bottomPocketSize
                },
                _updateScrollbar: function() {
                    this._scrollbar.option({
                        containerSize: this._containerSize(),
                        contentSize: this._contentSize() - this._topPocketSize - this._bottomPocketSize
                    })
                },
                _moveContent: function() {
                    this.callBase();
                    if (this._isPullDown())
                        this._pullDownReady();
                    else if (this._isReachBottom())
                        this._reachBottomReady();
                    else if (this._state !== STATE_RELEASED)
                        this._stateReleased()
                },
                _moveScrollbar: function() {
                    this._scrollbar.moveTo(this._topPocketSize + this._location)
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._location >= 0
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._bottomBound
                },
                _scrollComplete: function() {
                    if (this._inBounds() && this._state === STATE_READY)
                        this._pullDownRefreshing();
                    else if (this._inBounds() && this._state === STATE_LOADING)
                        this._reachBottomLoading();
                    else
                        this.callBase()
                },
                _reachBottomReady: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this._minOffset = math.min(this._containerSize() - this._contentSize(), 0)
                },
                _reachBottomLoading: function() {
                    this.reachBottomCallbacks.fire()
                },
                _pullDownReady: function() {
                    if (this._state === STATE_READY)
                        return;
                    this._state = STATE_READY;
                    this._maxOffset = 0;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._releaseState();
                    this._updateOffsets();
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this.releaseCallbacks.fire()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText();
                    this.pullDownCallbacks.fire()
                },
                _handleRelease: function() {
                    if (this._state === STATE_RELEASED)
                        this._moveToBounds();
                    this._update();
                    return DX.utils.executeAsync($.proxy(this._release, this))
                },
                _release: function() {
                    this._stateReleased();
                    this._scrollComplete()
                },
                _handleReachBottomEnabling: function(enabled) {
                    if (this._reachBottomEnabled === enabled)
                        return;
                    this._reachBottomEnabled = enabled;
                    this._updateBounds()
                },
                _handlePullDownEnabling: function(enabled) {
                    if (this._pullDownEnabled === enabled)
                        return;
                    this._pullDownEnabled = enabled;
                    this._considerTopPocketChange();
                    this._handleUpdate()
                },
                _considerTopPocketChange: function() {
                    this._location -= this._$topPocket.height() || -this._topPocketSize;
                    this._move()
                },
                _handlePendingRelease: function() {
                    this._state = STATE_READY
                }
            });
        var SimulatedScrollViewStrategy = ui.SimulatedScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$pullDown = scrollView._$pullDown;
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this._renderPullDown();
                    this.callBase()
                },
                _renderPullDown: function() {
                    var $image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS),
                        $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<div>").dxLoadIndicator(),
                        $text = this._$pullDownText = $("<div>").addClass(SCROLLVIEW_PULLDOWN_TEXT_CLASS);
                    this._$pullingDownText = $("<div>").text(this.option("pullingDownText")).appendTo($text);
                    this._$pulledDownText = $("<div>").text(this.option("pulledDownText")).appendTo($text);
                    this._$refreshingText = $("<div>").text(this.option("refreshingText")).appendTo($text);
                    this._$pullDown.empty().append($image).append($loadContainer.append($loadIndicator)).append($text)
                },
                pullDownEnable: function(enabled) {
                    this._handleEvent("PullDownEnabling", enabled)
                },
                reachBottomEnable: function(enabled) {
                    this._handleEvent("ReachBottomEnabling", enabled)
                },
                _createScroller: function(direction) {
                    var that = this;
                    var scroller = that._scrollers[direction] = new ScrollViewScroller(that._scrollerOptions(direction));
                    scroller.pullDownCallbacks.add(function() {
                        that.pullDownCallbacks.fire()
                    });
                    scroller.releaseCallbacks.add(function() {
                        that.releaseCallbacks.fire()
                    });
                    scroller.reachBottomCallbacks.add(function() {
                        that.reachBottomCallbacks.fire()
                    })
                },
                _scrollerOptions: function(direction) {
                    return $.extend(this.callBase(direction), {
                            $topPocket: this._$topPocket,
                            $bottomPocket: this._$bottomPocket,
                            $pullDown: this._$pullDown,
                            $pullDownText: this._$pullDownText,
                            $pullingDownText: this._$pullingDownText,
                            $pulledDownText: this._$pulledDownText,
                            $refreshingText: this._$refreshingText
                        })
                },
                pendingRelease: function() {
                    this._handleEvent("PendingRelease")
                },
                release: function() {
                    return this._handleEvent("Release").done(this._updateAction)
                }
            });
        ui.scrollViewRefreshStrategies.simulated = SimulatedScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            winJS = DX.support.winJS,
            wrapToArray = utils.wrapToArray,
            removeDublicates = utils.removeDublicates,
            titleize = DX.inflector.titleize;
        ui.MapProvider = DX.Class.inherit({
            _defaultRouteWeight: function() {
                return 5
            },
            _defaultRouteOpacity: function() {
                return .5
            },
            _defaultRouteColor: function() {
                return "#0000FF"
            },
            ctor: function(map, $container) {
                this._mapWidget = map;
                this._$container = $container
            },
            load: $.noop,
            render: function() {
                var deferred = $.Deferred(),
                    that = this;
                this._renderImpl().done(function() {
                    var markersPromise = that.addMarkers(that._option("markers"));
                    var routesPromise = that.addRoutes(that._option("routes"));
                    $.when(markersPromise, routesPromise).done(function() {
                        deferred.resolve(true)
                    })
                });
                return deferred.promise()
            },
            _renderImpl: DX.abstract,
            updateDimensions: DX.abstract,
            updateMapType: DX.abstract,
            updateCenter: DX.abstract,
            updateZoom: DX.abstract,
            updateControls: DX.abstract,
            updateMarkers: function(markerOptionsToRemove, markerOptionsToAdd) {
                var deferred = $.Deferred(),
                    that = this;
                this.removeMarkers(markerOptionsToRemove).done(function() {
                    that.addMarkers(markerOptionsToAdd).done(function() {
                        deferred.resolve.apply(deferred, arguments)
                    })
                });
                return deferred.promise()
            },
            addMarkers: DX.abstract,
            removeMarkers: DX.abstract,
            adjustViewport: DX.abstract,
            updateRoutes: function(routeOptionsToRemove, routeOptionsToAdd) {
                var deferred = $.Deferred(),
                    that = this;
                this.removeRoutes(routeOptionsToRemove).done(function() {
                    that.addRoutes(routeOptionsToAdd).done(function() {
                        deferred.resolve.apply(deferred, arguments)
                    })
                });
                return deferred.promise()
            },
            addRoutes: DX.abstract,
            removeRoutes: DX.abstract,
            clean: DX.abstract,
            cancelEvents: false,
            map: function() {
                return this._map
            },
            mapRendered: function() {
                return !!this._map
            },
            _option: function(name, value) {
                if (value === undefined)
                    return this._mapWidget.option(name);
                this._mapWidget.setOptionSilent(name, value)
            },
            _keyOption: function(providerName) {
                var key = this._option("key");
                return key[providerName] === undefined ? key : key[providerName]
            },
            _parseTooltipOptions: function(option) {
                return {
                        text: option.text || option,
                        visible: option.isShown || false
                    }
            },
            _addEventNamespace: function(name) {
                return events.addNamespace(name, this._mapWidget.NAME)
            },
            _createAction: function() {
                var mapWidget = this._mapWidget;
                return mapWidget._createAction.apply(mapWidget, arguments)
            },
            _fireAction: function(name, actionArguments) {
                var option = this._option(name);
                if (option)
                    this._createAction(option)(actionArguments)
            },
            _fireClickAction: function(actionArguments) {
                this._fireAction("clickAction", actionArguments)
            },
            _fireMarkerAddedAction: function(actionArguments) {
                this._fireAction("markerAddedAction", actionArguments)
            },
            _fireMarkerRemovedAction: function(actionArguments) {
                this._fireAction("markerRemovedAction", actionArguments)
            },
            _fireRouteAddedAction: function(actionArguments) {
                this._fireAction("routeAddedAction", actionArguments)
            },
            _fireRouteRemovedAction: function(actionArguments) {
                this._fireAction("routeRemovedAction", actionArguments)
            }
        });
        var providers = {};
        ui.registerMapProvider = function(name, provider) {
            providers[name] = provider
        };
        var MAP_CLASS = "dx-map",
            MAP_CONTAINER_CLASS = "dx-map-container",
            MAP_SHIELD_CLASS = "dx-map-shield";
        DX.registerComponent("dxMap", ui.Widget.inherit({
            ctor: function() {
                this.callBase.apply(this, arguments);
                this.addMarker = $.proxy(this._addFunction, this, "markers");
                this.removeMarker = $.proxy(this._removeFunction, this, "markers");
                this.addRoute = $.proxy(this._addFunction, this, "routes");
                this.removeRoute = $.proxy(this._removeFunction, this, "routes")
            },
            _addFunction: function(optionName, addingValue) {
                var deferred = $.Deferred(),
                    that = this,
                    providerDeffered = $.Deferred(),
                    optionValue = this.option(optionName),
                    addingValues = wrapToArray(addingValue);
                optionValue.push.apply(optionValue, addingValues);
                this._notificationDeffered = providerDeffered;
                this.option(optionName, optionValue);
                providerDeffered.done(function(instance) {
                    deferred.resolveWith(that, instance && instance.length > 1 ? [instance] : instance)
                });
                return deferred.promise()
            },
            _removeFunction: function(optionName, removingValue) {
                var deferred = $.Deferred(),
                    that = this,
                    providerDeffered = $.Deferred(),
                    optionValue = this.option(optionName),
                    removingValues = wrapToArray(removingValue);
                $.each(removingValues, function(_, removingValue) {
                    var index = $.isNumeric(removingValue) ? removingValue : $.inArray(removingValue, optionValue);
                    if (index !== -1)
                        optionValue.splice(index, 1);
                    else
                        throw new Error(titleize(optionName.substring(0, optionName.length - 1)) + " '" + removingValue + "' you are trying to remove does not exist");
                });
                this._notificationDeffered = providerDeffered;
                this.option(optionName, optionValue);
                providerDeffered.done(function() {
                    deferred.resolveWith(that)
                });
                return deferred.promise()
            },
            _deprecatedOptions: {location: {
                    since: "14.1",
                    message: "Use the 'center' option instead."
                }},
            _optionAliases: {center: "location"},
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    center: {
                        lat: 0,
                        lng: 0
                    },
                    location: {
                        lat: 0,
                        lng: 0
                    },
                    width: 300,
                    height: 300,
                    zoom: 1,
                    type: "roadmap",
                    provider: "google",
                    autoAdjust: true,
                    markers: [],
                    markerIconSrc: null,
                    markerAddedAction: null,
                    markerRemovedAction: null,
                    routes: [],
                    routeAddedAction: null,
                    routeRemovedAction: null,
                    key: {
                        bing: "",
                        google: "",
                        googleStatic: ""
                    },
                    controls: false,
                    readyAction: null,
                    updateAction: null,
                    clickAction: null
                })
            },
            _init: function() {
                this._checkMarkersOption(this.option("markers"));
                this._checkRoutesOption(this.option("routes"));
                this.callBase();
                this._initContainer();
                this._grabEvents();
                this._initProvider();
                this._cleanRenderedMarkers();
                this._cleanRenderedRoutes()
            },
            _cleanRenderedMarkers: function() {
                this._renderedMarkers = []
            },
            _cleanRenderedRoutes: function(routes) {
                this._renderedRoutes = []
            },
            _checkMarkersOption: function(markers) {
                if (!$.isArray(markers))
                    throw new Error("Markers option should be an array");
            },
            _checkRoutesOption: function(routes) {
                if (!$.isArray(routes))
                    throw new Error("Routes option should be an array");
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _dimensionChanged: function() {
                this._execAsyncProviderAction("updateDimensions")
            },
            _initContainer: function() {
                this._$container = $("<div />").addClass(MAP_CONTAINER_CLASS);
                this._element().append(this._$container)
            },
            _grabEvents: function() {
                var eventName = events.addNamespace("dxpointerdown", this.NAME);
                this._element().on(eventName, $.proxy(this._cancelEvent, this))
            },
            _cancelEvent: function(e) {
                var cancelByProvider = this._provider.cancelEvents && !this.option("disabled");
                if (!DX.designMode && cancelByProvider)
                    e.stopPropagation()
            },
            _initProvider: function() {
                var provider = this.option("provider");
                if (winJS && this.option("provider") === "google")
                    throw new Error("Google provider cannot be used in winJS application");
                this._cleanProvider();
                this._provider = new providers[provider](this, this._$container);
                this._mapLoader = this._provider.load()
            },
            _render: function() {
                this.callBase();
                this._element().addClass(MAP_CLASS);
                this._renderShield();
                this._execAsyncProviderAction("render").done($.proxy(function() {
                    this._saveRenderedMarkers();
                    this._saveRenderedRoutes()
                }, this))
            },
            _saveRenderedMarkers: function(markers) {
                markers = markers || this.option("markers");
                this._renderedMarkers = markers.slice()
            },
            _saveRenderedRoutes: function(routes) {
                routes = routes || this.option("routes");
                this._renderedRoutes = routes.slice()
            },
            _renderShield: function() {
                if (DX.designMode || this.option("disabled")) {
                    var $shield = $("<div/>").addClass(MAP_SHIELD_CLASS);
                    this._element().append($shield)
                }
                else {
                    var $shield = this._element().find("." + MAP_SHIELD_CLASS);
                    $shield.remove()
                }
            },
            _clean: function() {
                this._cleanProvider();
                this._cleanRenderedMarkers();
                this._cleanRenderedRoutes()
            },
            _cleanProvider: function() {
                if (this._provider)
                    this._provider.clean()
            },
            _optionChanged: function(name, value, prevValue) {
                if (this._cancelOptionChange)
                    return;
                var notificationDeffered = this._notificationDeffered;
                delete this._notificationDeffered;
                switch (name) {
                    case"disabled":
                        this._renderShield();
                        this.callBase.apply(this, arguments);
                        break;
                    case"width":
                    case"height":
                        this.callBase.apply(this, arguments);
                        this._dimensionChanged();
                        break;
                    case"type":
                        this._execAsyncProviderAction("updateMapType");
                        break;
                    case"center":
                        this._execAsyncProviderAction("updateCenter");
                        break;
                    case"zoom":
                        this._execAsyncProviderAction("updateZoom");
                        break;
                    case"controls":
                        this._execAsyncProviderAction("updateControls");
                        break;
                    case"markers":
                        this._checkMarkersOption(value);
                        this._execAsyncProviderAction("updateMarkers", $.proxy(function() {
                            return notificationDeffered ? removeDublicates(this._renderedMarkers, value) : this._renderedMarkers
                        }, this), $.proxy(function() {
                            return notificationDeffered ? removeDublicates(value, this._renderedMarkers) : value
                        }, this)).done($.proxy(function() {
                            this._saveRenderedMarkers(value);
                            if (notificationDeffered)
                                notificationDeffered.resolve.apply(notificationDeffered, arguments)
                        }, this));
                        break;
                    case"markerIconSrc":
                        this._execAsyncProviderAction("updateMarkers", prevValue, value);
                        break;
                    case"autoAdjust":
                        this._execAsyncProviderAction("adjustViewport");
                        break;
                    case"routes":
                        this._checkRoutesOption(value);
                        this._execAsyncProviderAction("updateRoutes", $.proxy(function() {
                            return notificationDeffered ? removeDublicates(this._renderedRoutes, value) : this._renderedRoutes
                        }, this), $.proxy(function() {
                            return notificationDeffered ? removeDublicates(value, this._renderedRoutes) : value
                        }, this)).done($.proxy(function() {
                            this._saveRenderedRoutes(value);
                            if (notificationDeffered)
                                notificationDeffered.resolve.apply(notificationDeffered, arguments)
                        }, this));
                        break;
                    case"key":
                        utils.logger.warn("Key option can not be modified after initialization");
                    case"provider":
                        this._initProvider();
                        this._invalidate();
                        break;
                    case"readyAction":
                    case"updateAction":
                    case"markerAddedAction":
                    case"markerRemovedAction":
                    case"routeAddedAction":
                    case"routeRemovedAction":
                    case"clickAction":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _execAsyncProviderAction: function(name) {
                if (!this._provider.mapRendered() && !(name === "render"))
                    return $.when(undefined).promise();
                var deferred = $.Deferred(),
                    that = this,
                    options = $.makeArray(arguments).slice(1);
                $.when(this._mapLoader).done(function() {
                    var provider = that._provider;
                    $.each(options, function(index, option) {
                        if ($.isFunction(option))
                            options[index] = option()
                    });
                    provider[name].apply(provider, options).done(function(mapRefreshed) {
                        deferred.resolve.apply(deferred, $.makeArray(arguments).slice(1));
                        if (mapRefreshed)
                            that._triggerReadyAction();
                        else
                            that._triggerUpdateAction()
                    })
                });
                return deferred.promise()
            },
            _triggerReadyAction: function() {
                this._createActionByOption("readyAction")({originalMap: this._provider.map()})
            },
            _triggerUpdateAction: function() {
                this._createActionByOption("updateAction")()
            },
            setOptionSilent: function(name, value) {
                this._cancelOptionChange = true;
                this.option(name, value);
                this._cancelOptionChange = false
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.bing.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            winJS = DX.support.winJS;
        var BING_MAP_READY = "_bingScriptReady",
            BING_URL = "https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&s=1&onScriptLoad=" + BING_MAP_READY,
            BING_LOCAL_FILES1 = "ms-appx:///Bing.Maps.JavaScript/js/veapicore.js",
            BING_LOCAL_FILES2 = "ms-appx:///Bing.Maps.JavaScript/js/veapiModules.js",
            BING_CREDENTIALS = "AhuxC0dQ1DBTNo8L-H9ToVMQStmizZzBJdraTSgCzDSWPsA1Qd8uIvFSflzxdaLH",
            MIN_LOCATION_RECT_LENGTH = 0.0000000000000001;
        var msMapsLoader;
        ui.registerMapProvider("bing", ui.MapProvider.inherit({
            _mapType: function(type) {
                var mapTypes = {
                        roadmap: Microsoft.Maps.MapTypeId.road,
                        hybrid: Microsoft.Maps.MapTypeId.aerial
                    };
                return mapTypes[type] || mapTypes.roadmap
            },
            _movementMode: function(type) {
                var movementTypes = {
                        driving: Microsoft.Maps.Directions.RouteMode.driving,
                        walking: Microsoft.Maps.Directions.RouteMode.walking
                    };
                return movementTypes[type] || movementTypes.driving
            },
            _resolveLocation: function(location) {
                var d = $.Deferred();
                if (typeof location === "string") {
                    var searchManager = new Microsoft.Maps.Search.SearchManager(this._map);
                    var searchRequest = {
                            where: location,
                            count: 1,
                            callback: function(searchResponse) {
                                var boundsBox = searchResponse.results[0].location;
                                d.resolve(new Microsoft.Maps.Location(boundsBox.latitude, boundsBox.longitude))
                            }
                        };
                    searchManager.geocode(searchRequest)
                }
                else if ($.isPlainObject(location) && $.isNumeric(location.lat) && $.isNumeric(location.lng))
                    d.resolve(new Microsoft.Maps.Location(location.lat, location.lng));
                else if ($.isArray(location))
                    d.resolve(new Microsoft.Maps.Location(location[0], location[1]));
                return d.promise()
            },
            _normalizeLocation: function(location) {
                return {
                        lat: location.latitude,
                        lng: location.longitude
                    }
            },
            load: function() {
                if (!msMapsLoader) {
                    msMapsLoader = $.Deferred();
                    window[BING_MAP_READY] = $.proxy(this._mapReady, this);
                    if (winJS)
                        $.when($.getScript(BING_LOCAL_FILES1), $.getScript(BING_LOCAL_FILES2)).done(function() {
                            Microsoft.Maps.loadModule("Microsoft.Maps.Map", {callback: window[BING_MAP_READY]})
                        });
                    else
                        $.getScript(BING_URL)
                }
                this._markers = [];
                this._routes = [];
                return msMapsLoader
            },
            _mapReady: function() {
                try {
                    delete window[BING_MAP_READY]
                }
                catch(e) {
                    window[BING_MAP_READY] = undefined
                }
                var searchModulePromise = $.Deferred();
                var directionsModulePromise = $.Deferred();
                Microsoft.Maps.loadModule('Microsoft.Maps.Search', {callback: $.proxy(searchModulePromise.resolve, searchModulePromise)});
                Microsoft.Maps.loadModule('Microsoft.Maps.Directions', {callback: $.proxy(directionsModulePromise.resolve, directionsModulePromise)});
                $.when(searchModulePromise, directionsModulePromise).done(function() {
                    msMapsLoader.resolve()
                })
            },
            _renderImpl: function() {
                var deferred = $.Deferred(),
                    initPromise = $.Deferred(),
                    controls = this._option("controls");
                var options = {
                        credentials: this._keyOption("bing") || BING_CREDENTIALS,
                        mapTypeId: this._mapType(this._option("type")),
                        zoom: this._option("zoom"),
                        showDashboard: controls,
                        showMapTypeSelector: controls,
                        showScalebar: controls
                    };
                this._map = new Microsoft.Maps.Map(this._$container[0], options);
                var handler = Microsoft.Maps.Events.addHandler(this._map, 'tiledownloadcomplete', $.proxy(initPromise.resolve, initPromise));
                this._viewChangeHandler = Microsoft.Maps.Events.addHandler(this._map, 'viewchange', $.proxy(this._handleViewChange, this));
                this._clickHandler = Microsoft.Maps.Events.addHandler(this._map, 'click', $.proxy(this._handleClickAction, this));
                var locationPromise = this._renderCenter();
                $.when(initPromise, locationPromise).done(function() {
                    Microsoft.Maps.Events.removeHandler(handler);
                    deferred.resolve()
                });
                return deferred.promise()
            },
            _handleViewChange: function() {
                var center = this._map.getCenter();
                this._option("center", this._normalizeLocation(center));
                if (!this._preventZoomChangeEvent)
                    this._option("zoom", this._map.getZoom())
            },
            updateDimensions: function() {
                this._map.setOptions({
                    width: this._$container.width(),
                    height: this._$container.height()
                });
                return $.Deferred().resolve().promise()
            },
            updateMapType: function() {
                this._map.setView({mapTypeId: this._mapType(this._option("type"))});
                return $.Deferred().resolve().promise()
            },
            updateCenter: function() {
                return this._renderCenter()
            },
            _renderCenter: function() {
                var deferred = $.Deferred(),
                    that = this;
                this._resolveLocation(this._option("center")).done(function(location) {
                    that._map.setView({
                        animate: false,
                        center: location
                    });
                    deferred.resolve()
                });
                return deferred.promise()
            },
            updateZoom: function() {
                this._map.setView({
                    animate: false,
                    zoom: this._option("zoom")
                });
                return $.Deferred().resolve().promise()
            },
            updateControls: function() {
                this.clean();
                return this.render()
            },
            addMarkers: function(options) {
                var deferred = $.Deferred(),
                    that = this;
                var markerPromises = $.map(options, function(options) {
                        return that._addMarker(options)
                    });
                $.when.apply($, markerPromises).done(function() {
                    var instances = $.map($.makeArray(arguments), function(markerObject) {
                            return markerObject.pushpin
                        });
                    deferred.resolve(false, instances)
                });
                return deferred.promise()
            },
            _addMarker: function(options) {
                var that = this;
                return this._renderMarker(options).done(function(markerObject) {
                        that._markers.push($.extend({options: options}, markerObject));
                        that._updateMarkersBounds();
                        that._fitBounds();
                        that._fireMarkerAddedAction({
                            options: options,
                            originalMarker: markerObject.pushpin
                        })
                    })
            },
            _renderMarker: function(options) {
                var d = $.Deferred(),
                    that = this;
                this._resolveLocation(options.location).done(function(location) {
                    var pushpin = new Microsoft.Maps.Pushpin(location, {icon: options.iconSrc || that._option("markerIconSrc")});
                    that._map.entities.push(pushpin);
                    var infobox = that._renderTooltip(location, options.tooltip);
                    var handler;
                    if (options.clickAction || options.tooltip) {
                        var markerClickAction = that._createAction(options.clickAction || $.noop),
                            markerNormalizedLocation = that._normalizeLocation(location);
                        handler = Microsoft.Maps.Events.addHandler(pushpin, "click", function() {
                            markerClickAction({location: markerNormalizedLocation});
                            if (infobox)
                                infobox.setOptions({visible: true})
                        })
                    }
                    d.resolve({
                        location: location,
                        pushpin: pushpin,
                        infobox: infobox,
                        handler: handler
                    })
                });
                return d.promise()
            },
            _renderTooltip: function(location, options) {
                if (!options)
                    return;
                options = this._parseTooltipOptions(options);
                var infobox = new Microsoft.Maps.Infobox(location, {
                        description: options.text,
                        offset: new Microsoft.Maps.Point(0, 33),
                        visible: options.visible
                    });
                this._map.entities.push(infobox, null);
                return infobox
            },
            removeMarkers: function(options) {
                var that = this;
                $.each(options, function(_, options) {
                    that._removeMarker(options)
                });
                return $.Deferred().resolve().promise()
            },
            _removeMarker: function(options) {
                var that = this;
                $.each(this._markers, function(markerIndex, markerObject) {
                    if (markerObject.options !== options)
                        return true;
                    var marker = that._markers[markerIndex];
                    that._map.entities.remove(marker.pushpin);
                    if (marker.infobox)
                        that._map.entities.remove(marker.infobox);
                    if (marker.handler)
                        Microsoft.Maps.Events.removeHandler(marker.handler);
                    that._markers.splice(markerIndex, 1);
                    that._updateMarkersBounds();
                    that._fitBounds();
                    that._fireMarkerRemovedAction({options: options});
                    return false
                })
            },
            _updateMarkersBounds: function() {
                var that = this;
                this._clearBounds();
                $.each(this._markers, function(_, markerObject) {
                    that._extendBounds(markerObject.location)
                })
            },
            _clearMarkers: function() {
                for (var i = 0; this._markers.length > 0; )
                    this._removeMarker(this._markers[0].options)
            },
            adjustViewport: function() {
                return this._fitBounds()
            },
            _clearBounds: function() {
                this._bounds = null
            },
            _extendBounds: function(location) {
                if (this._bounds)
                    this._bounds = new Microsoft.Maps.LocationRect.fromLocations(this._bounds.getNorthwest(), this._bounds.getSoutheast(), location);
                else
                    this._bounds = new Microsoft.Maps.LocationRect(location, MIN_LOCATION_RECT_LENGTH, MIN_LOCATION_RECT_LENGTH)
            },
            _fitBounds: function() {
                var autoAdjust = this._option("autoAdjust");
                if (this._bounds && autoAdjust) {
                    var zoomBeforeFitting = this._map.getZoom();
                    this._preventZoomChangeEvent = true;
                    var bounds = this._bounds.clone();
                    bounds.height = bounds.height * 1.1;
                    bounds.width = bounds.width * 1.1;
                    this._map.setView({
                        animate: false,
                        bounds: bounds
                    });
                    var zoomAfterFitting = this._map.getZoom();
                    if (zoomBeforeFitting < zoomAfterFitting)
                        this._map.setView({
                            animate: false,
                            zoom: zoomBeforeFitting
                        });
                    else
                        this._option("zoom", zoomAfterFitting);
                    delete this._preventZoomChangeEvent
                }
                return $.Deferred().resolve().promise()
            },
            addRoutes: function(options) {
                var deferred = $.Deferred(),
                    that = this;
                var routePromises = $.map(options, function(options) {
                        return that._addRoute(options)
                    });
                $.when.apply($, routePromises).done(function() {
                    deferred.resolve(false, $.makeArray(arguments))
                });
                return deferred.promise()
            },
            _addRoute: function(options) {
                var that = this;
                return this._renderRoute(options).done(function(instance) {
                        that._routes.push({
                            options: options,
                            instance: instance
                        });
                        that._fireRouteAddedAction({
                            options: options,
                            originalRoute: instance
                        })
                    })
            },
            _renderRoute: function(options) {
                var d = $.Deferred(),
                    that = this;
                var points = $.map(options.locations, function(point) {
                        return that._resolveLocation(point)
                    });
                $.when.apply($, points).done(function() {
                    var locations = $.makeArray(arguments),
                        direction = new Microsoft.Maps.Directions.DirectionsManager(that._map),
                        color = new DX.Color(options.color || that._defaultRouteColor()).toHex(),
                        routeColor = new Microsoft.Maps.Color.fromHex(color);
                    routeColor.a = (options.opacity || that._defaultRouteOpacity()) * 255;
                    direction.setRenderOptions({
                        autoUpdateMapView: false,
                        displayRouteSelector: false,
                        waypointPushpinOptions: {visible: false},
                        drivingPolylineOptions: {
                            strokeColor: routeColor,
                            strokeThickness: options.weight || that._defaultRouteWeight()
                        },
                        walkingPolylineOptions: {
                            strokeColor: routeColor,
                            strokeThickness: options.weight || that._defaultRouteWeight()
                        }
                    });
                    direction.setRequestOptions({
                        routeMode: that._movementMode(options.mode),
                        routeDraggable: false
                    });
                    $.each(locations, function(_, location) {
                        var waypoint = new Microsoft.Maps.Directions.Waypoint({location: location});
                        direction.addWaypoint(waypoint)
                    });
                    var handler = Microsoft.Maps.Events.addHandler(direction, 'directionsUpdated', function() {
                            Microsoft.Maps.Events.removeHandler(handler);
                            d.resolve(direction)
                        });
                    direction.calculateDirections()
                });
                return d.promise()
            },
            removeRoutes: function(options) {
                var that = this;
                $.each(options, function(routeIndex, options) {
                    that._removeRoute(options)
                });
                return $.Deferred().resolve().promise()
            },
            _removeRoute: function(options) {
                var that = this;
                $.each(this._routes, function(routeIndex, routeObject) {
                    if (routeObject.options !== options)
                        return true;
                    that._routes[routeIndex].instance.dispose();
                    that._routes.splice(routeIndex, 1);
                    that._fireRouteRemovedAction({options: options});
                    return false
                })
            },
            _clearRoutes: function() {
                for (var i = 0; this._routes.length > 0; )
                    this._removeRoute(this._routes[0].options)
            },
            _handleClickAction: function(e) {
                if (e.targetType == "map") {
                    var point = new Microsoft.Maps.Point(e.getX(), e.getY()),
                        location = e.target.tryPixelToLocation(point);
                    this._fireClickAction({location: this._normalizeLocation(location)})
                }
            },
            clean: function() {
                if (this._map) {
                    Microsoft.Maps.Events.removeHandler(this._viewChangeHandler);
                    Microsoft.Maps.Events.removeHandler(this._clickHandler);
                    this._clearMarkers();
                    this._clearRoutes();
                    this._map.dispose()
                }
            },
            cancelEvents: true
        }));
        if (!ui.dxMap.__internals)
            ui.dxMap.__internals = {};
        $.extend(ui.dxMap.__internals, {remapBingConstant: function(newValue) {
                BING_URL = newValue
            }})
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.google.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var GOOGLE_MAP_READY = "_googleScriptReady",
            GOOGLE_URL = "https://maps.google.com/maps/api/js?v=3.9&sensor=false&callback=" + GOOGLE_MAP_READY;
        var googleMapsLoader;
        ui.registerMapProvider("google", ui.MapProvider.inherit({
            _mapType: function(type) {
                var mapTypes = {
                        hybrid: google.maps.MapTypeId.HYBRID,
                        roadmap: google.maps.MapTypeId.ROADMAP
                    };
                return mapTypes[type] || mapTypes.hybrid
            },
            _movementMode: function(type) {
                var movementTypes = {
                        driving: google.maps.TravelMode.DRIVING,
                        walking: google.maps.TravelMode.WALKING
                    };
                return movementTypes[type] || movementTypes.driving
            },
            _resolveLocation: function(location) {
                var d = $.Deferred();
                if (typeof location === "string") {
                    var geocoder = new google.maps.Geocoder;
                    geocoder.geocode({address: location}, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK)
                            d.resolve(results[0].geometry.location)
                    })
                }
                else if ($.isArray(location))
                    d.resolve(new google.maps.LatLng(location[0], location[1]));
                else if ($.isPlainObject(location) && $.isNumeric(location.lat) && $.isNumeric(location.lng))
                    d.resolve(new google.maps.LatLng(location.lat, location.lng));
                return d.promise()
            },
            _normalizeLocation: function(location) {
                return {
                        lat: location.lat(),
                        lng: location.lng()
                    }
            },
            load: function() {
                if (!googleMapsLoader) {
                    googleMapsLoader = $.Deferred();
                    var key = this._keyOption("google");
                    window[GOOGLE_MAP_READY] = $.proxy(this._mapReady, this);
                    $.getScript(GOOGLE_URL + (key ? "&key=" + key : ""))
                }
                this._markers = [];
                this._routes = [];
                return googleMapsLoader.promise()
            },
            _mapReady: function() {
                try {
                    delete window[GOOGLE_MAP_READY]
                }
                catch(e) {
                    window[GOOGLE_MAP_READY] = undefined
                }
                googleMapsLoader.resolve()
            },
            _renderImpl: function() {
                var deferred = $.Deferred(),
                    initPromise = $.Deferred(),
                    controls = this._option("controls");
                var options = {
                        zoom: this._option("zoom"),
                        center: new google.maps.LatLng(0, 0),
                        mapTypeId: this._mapType(this._option("type")),
                        panControl: controls,
                        zoomControl: controls,
                        mapTypeControl: controls,
                        streetViewControl: controls
                    };
                this._map = new google.maps.Map(this._$container[0], options);
                var listner = google.maps.event.addListener(this._map, 'idle', $.proxy(initPromise.resolve, initPromise));
                this._zoomChangeListener = google.maps.event.addListener(this._map, 'zoom_changed', $.proxy(this._handleZoomChange, this));
                this._centerChangeListener = google.maps.event.addListener(this._map, 'center_changed', $.proxy(this._handleCenterChange, this));
                this._clickListener = google.maps.event.addListener(this._map, 'click', $.proxy(this._handleClickAction, this));
                var locationPromise = this._renderCenter();
                $.when(initPromise, locationPromise).done(function() {
                    google.maps.event.removeListener(listner);
                    deferred.resolve()
                });
                return deferred.promise()
            },
            updateDimensions: function() {
                google.maps.event.trigger(this._map, 'resize');
                return $.Deferred().resolve().promise()
            },
            updateMapType: function() {
                this._map.setMapTypeId(this._mapType(this._option("type")));
                return $.Deferred().resolve().promise()
            },
            updateCenter: function() {
                return this._renderCenter()
            },
            _handleCenterChange: function() {
                var center = this._map.getCenter();
                this._option("center", this._normalizeLocation(center))
            },
            _renderCenter: function() {
                var deferred = $.Deferred(),
                    that = this;
                this._resolveLocation(this._option("center")).done(function(location) {
                    that._map.setCenter(location);
                    deferred.resolve()
                });
                return deferred.promise()
            },
            _handleZoomChange: function() {
                if (!this._preventZoomChangeEvent)
                    this._option("zoom", this._map.getZoom())
            },
            updateZoom: function() {
                this._map.setZoom(this._option("zoom"));
                return $.Deferred().resolve().promise()
            },
            updateControls: function() {
                var controls = this._option("controls");
                this._map.setOptions({
                    panControl: controls,
                    zoomControl: controls,
                    mapTypeControl: controls,
                    streetViewControl: controls
                });
                return $.Deferred().resolve().promise()
            },
            addMarkers: function(options) {
                var deferred = $.Deferred(),
                    that = this;
                var markerPromises = $.map(options, function(options) {
                        return that._addMarker(options)
                    });
                $.when.apply($, markerPromises).done(function() {
                    var instances = $.map($.makeArray(arguments), function(markerObject) {
                            return markerObject.marker
                        });
                    deferred.resolve(false, instances)
                });
                return deferred.promise()
            },
            _addMarker: function(options) {
                var that = this;
                return this._renderMarker(options).done(function(markerObject) {
                        that._markers.push($.extend({options: options}, markerObject));
                        that._updateMarkersBounds();
                        that._fitBounds();
                        that._fireMarkerAddedAction({
                            options: options,
                            originalMarker: markerObject.marker
                        })
                    })
            },
            _renderMarker: function(options) {
                var d = $.Deferred(),
                    that = this;
                this._resolveLocation(options.location).done(function(location) {
                    var marker = new google.maps.Marker({
                            position: location,
                            map: that._map,
                            icon: options.iconSrc || that._option("markerIconSrc")
                        }),
                        listner;
                    var infoWindow = that._renderTooltip(marker, options.tooltip);
                    if (options.clickAction || options.tooltip) {
                        var markerClickAction = that._createAction(options.clickAction || $.noop),
                            markerNormalizedLocation = that._normalizeLocation(location);
                        listner = google.maps.event.addListener(marker, "click", function() {
                            markerClickAction({location: markerNormalizedLocation});
                            if (infoWindow)
                                infoWindow.open(that._map, marker)
                        })
                    }
                    d.resolve({
                        location: location,
                        marker: marker,
                        listner: listner
                    })
                });
                return d.promise()
            },
            _renderTooltip: function(marker, options) {
                if (!options)
                    return;
                options = this._parseTooltipOptions(options);
                var infoWindow = new google.maps.InfoWindow({content: options.text});
                if (options.visible)
                    infoWindow.open(this._map, marker);
                return infoWindow
            },
            removeMarkers: function(markersOptionsToRemove) {
                var that = this;
                $.each(markersOptionsToRemove, function(_, markerOptionToRemove) {
                    that._removeMarker(markerOptionToRemove)
                });
                return $.Deferred().resolve().promise()
            },
            _removeMarker: function(markersOptionToRemove) {
                var that = this;
                $.each(this._markers, function(markerIndex, markerObject) {
                    if (markerObject.options !== markersOptionToRemove)
                        return true;
                    var marker = that._markers[markerIndex];
                    marker.marker.setMap(null);
                    if (marker.listner)
                        google.maps.event.removeListener(marker.listner);
                    that._markers.splice(markerIndex, 1);
                    that._updateMarkersBounds();
                    that._fitBounds();
                    that._fireMarkerRemovedAction({options: markerObject.options});
                    return false
                })
            },
            _updateMarkersBounds: function() {
                var that = this;
                this._clearBounds();
                $.each(this._markers, function(_, markerObject) {
                    that._extendBounds(markerObject.location)
                })
            },
            _clearMarkers: function() {
                for (var i = 0; this._markers.length > 0; )
                    this._removeMarker(this._markers[0].options)
            },
            adjustViewport: function() {
                return this._fitBounds()
            },
            _extendBounds: function(location) {
                if (this._bounds)
                    this._bounds.extend(location);
                else {
                    this._bounds = new google.maps.LatLngBounds;
                    this._bounds.extend(location)
                }
            },
            _fitBounds: function() {
                var autoAdjust = this._option("autoAdjust");
                if (this._bounds && autoAdjust) {
                    var zoomBeforeFitting = this._map.getZoom();
                    this._preventZoomChangeEvent = true;
                    this._map.fitBounds(this._bounds);
                    var zoomAfterFitting = this._map.getZoom();
                    if (zoomBeforeFitting < zoomAfterFitting)
                        this._map.setZoom(zoomBeforeFitting);
                    else
                        this._option("zoom", zoomAfterFitting);
                    delete this._preventZoomChangeEvent
                }
                return $.Deferred().resolve().promise()
            },
            _clearBounds: function() {
                this._bounds = null
            },
            addRoutes: function(options) {
                var deferred = $.Deferred(),
                    that = this;
                var routePromises = $.map(options, function(options) {
                        return that._addRoute(options)
                    });
                $.when.apply($, routePromises).done(function() {
                    deferred.resolve(false, $.makeArray(arguments))
                });
                return deferred.promise()
            },
            _addRoute: function(options) {
                var that = this;
                return this._renderRoute(options).done(function(instance) {
                        that._routes.push({
                            options: options,
                            instance: instance
                        });
                        that._fireRouteAddedAction({
                            options: options,
                            originalRoute: instance
                        })
                    })
            },
            _renderRoute: function(options) {
                var d = $.Deferred(),
                    that = this,
                    directionsService = new google.maps.DirectionsService;
                var points = $.map(options.locations, function(point) {
                        return that._resolveLocation(point)
                    });
                $.when.apply($, points).done(function() {
                    var locations = $.makeArray(arguments),
                        origin = locations.shift(),
                        destination = locations.pop(),
                        waypoints = $.map(locations, function(location) {
                            return {
                                    location: location,
                                    stopover: true
                                }
                        });
                    var request = {
                            origin: origin,
                            destination: destination,
                            waypoints: waypoints,
                            optimizeWaypoints: true,
                            travelMode: that._movementMode(options.mode)
                        };
                    directionsService.route(request, function(response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            var color = new DX.Color(options.color || that._defaultRouteColor()).toHex(),
                                directionOptions = {
                                    directions: response,
                                    map: that._map,
                                    suppressMarkers: true,
                                    preserveViewport: true,
                                    polylineOptions: {
                                        strokeWeight: options.weight || that._defaultRouteWeight(),
                                        strokeOpacity: options.opacity || that._defaultRouteOpacity(),
                                        strokeColor: color
                                    }
                                };
                            var route = new google.maps.DirectionsRenderer(directionOptions);
                            d.resolve(route)
                        }
                    })
                });
                return d.promise()
            },
            removeRoutes: function(options) {
                var that = this;
                $.each(options, function(routeIndex, options) {
                    that._removeRoute(options)
                });
                return $.Deferred().resolve().promise()
            },
            _removeRoute: function(options) {
                var that = this;
                $.each(this._routes, function(routeIndex, routeObject) {
                    if (routeObject.options !== options)
                        return true;
                    that._routes[routeIndex].instance.setMap(null);
                    that._routes.splice(routeIndex, 1);
                    that._fireRouteRemovedAction({options: options});
                    return false
                })
            },
            _clearRoutes: function() {
                for (var i = 0; this._routes.length > 0; )
                    this._removeRoute(this._routes[0].options)
            },
            _handleClickAction: function(e) {
                this._fireClickAction({location: this._normalizeLocation(e.latLng)})
            },
            clean: function() {
                if (this._map) {
                    google.maps.event.removeListener(this._zoomChangeListener);
                    google.maps.event.removeListener(this._centerChangeListener);
                    google.maps.event.removeListener(this._clickListener);
                    this._clearMarkers();
                    this._clearRoutes();
                    delete this._map;
                    this._$container.empty()
                }
            },
            cancelEvents: true
        }));
        if (!ui.dxMap.__internals)
            ui.dxMap.__internals = {};
        $.extend(ui.dxMap.__internals, {remapGoogleConstant: function(newValue) {
                GOOGLE_URL = newValue
            }})
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.googleStatic.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var GOOGLE_STATIC_URL = "https://maps.google.com/maps/api/staticmap?";
        ui.registerMapProvider("googleStatic", ui.MapProvider.inherit({
            _locationToString: function(location) {
                return !$.isPlainObject(location) ? location.toString().replace(/ /g, "+") : location.lat + "," + location.lng
            },
            _renderImpl: function() {
                return this._updateMap()
            },
            updateDimensions: function() {
                return this._updateMap()
            },
            updateMapType: function() {
                return this._updateMap()
            },
            updateCenter: function() {
                return this._updateMap()
            },
            updateZoom: function() {
                return this._updateMap()
            },
            updateControls: function() {
                return $.Deferred().resolve().promise()
            },
            addMarkers: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireMarkerAddedAction({options: options})
                        })
                    })
            },
            removeMarkers: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireMarkerRemovedAction({options: options})
                        })
                    })
            },
            adjustViewport: function() {
                return $.Deferred().resolve().promise()
            },
            addRoutes: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireRouteAddedAction({options: options})
                        })
                    })
            },
            removeRoutes: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireRouteRemovedAction({options: options})
                        })
                    })
            },
            clean: function() {
                this._$container.css("background-image", "none");
                this._$container.off(this._addEventNamespace("dxclick"))
            },
            mapRendered: function() {
                return true
            },
            _updateMap: function() {
                var key = this._keyOption("googleStatic");
                var requestOptions = ["sensor=false", "size=" + this._option("width") + "x" + this._option("height"), "maptype=" + this._option("type"), "center=" + this._locationToString(this._option("center")), "zoom=" + this._option("zoom"), this._markersSubstring()];
                requestOptions.push.apply(requestOptions, this._routeSubstrings());
                if (key)
                    requestOptions.push("key=" + key);
                var request = GOOGLE_STATIC_URL + requestOptions.join("&");
                this._$container.css("background", "url(\"" + request + "\") no-repeat 0 0");
                this._attachClickEvent();
                return $.Deferred().resolve(true).promise()
            },
            _markersSubstring: function() {
                var that = this,
                    markers = [],
                    markerIcon = this._option("markerIconSrc");
                if (markerIcon)
                    markers.push("icon:" + markerIcon);
                $.each(this._option("markers"), function(_, marker) {
                    markers.push(that._locationToString(marker.location))
                });
                return "markers=" + markers.join("|")
            },
            _routeSubstrings: function() {
                var that = this,
                    routes = [];
                $.each(this._option("routes"), function(_, route) {
                    var color = new DX.Color(route.color || that._defaultRouteColor()).toHex().replace('#', '0x'),
                        opacity = Math.round((route.opacity || that._defaultRouteOpacity()) * 255).toString(16),
                        width = route.weight || that._defaultRouteWeight(),
                        locations = [];
                    $.each(route.locations, function(_, routePoint) {
                        locations.push(that._locationToString(routePoint))
                    });
                    routes.push("path=color:" + color + opacity + "|weight:" + width + "|" + locations.join("|"))
                });
                return routes
            },
            _attachClickEvent: function() {
                var that = this,
                    eventName = this._addEventNamespace("dxclick");
                this._$container.off(eventName).on(eventName, function(e) {
                    that._fireClickAction({jQueryEvent: e})
                })
            }
        }));
        if (!ui.dxMap.__internals)
            ui.dxMap.__internals = {};
        $.extend(ui.dxMap.__internals, {remapGoogleStaticConstant: function(newValue) {
                GOOGLE_STATIC_URL = newValue
            }})
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.swipeable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            DX_SWIPEABLE = "dxSwipeable",
            SWIPEABLE_CLASS = "dx-swipeable",
            ACTION_TO_EVENT_MAP = {
                startAction: "dxswipestart",
                updateAction: "dxswipe",
                endAction: "dxswipeend",
                cancelAction: "dxswipecancel"
            };
        DX.registerComponent(DX_SWIPEABLE, DX.DOMComponent.inherit({
            NAMESPACE: ui,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    elastic: true,
                    direction: "horizontal",
                    itemSizeFunc: null,
                    startAction: null,
                    updateAction: null,
                    endAction: null,
                    cancelAction: null
                })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(SWIPEABLE_CLASS);
                this._attachEventHandlers()
            },
            _attachEventHandlers: function() {
                this._detachEventHanlers();
                if (this.option("disabled"))
                    return;
                var NAME = this.NAME;
                this._createEventData();
                $.each(ACTION_TO_EVENT_MAP, $.proxy(function(actionName, eventName) {
                    var action = this._createActionByOption(actionName, {
                            context: this,
                            excludeValidators: ["gesture"]
                        });
                    eventName = events.addNamespace(eventName, NAME);
                    this._element().on(eventName, this._eventData, function(e) {
                        return action({jQueryEvent: e})
                    })
                }, this))
            },
            _createEventData: function() {
                this._eventData = {
                    elastic: this.option("elastic"),
                    itemSizeFunc: this.option("itemSizeFunc"),
                    direction: this.option("direction")
                }
            },
            _detachEventHanlers: function() {
                this._element().off("." + DX_SWIPEABLE)
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"disabled":
                    case"startAction":
                    case"updateAction":
                    case"endAction":
                    case"cancelAction":
                    case"elastic":
                    case"itemSizeFunc":
                    case"direction":
                        this._detachEventHanlers();
                        this._attachEventHandlers();
                        break;
                    case"rtlEnabled":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.button.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var BUTTON_CLASS = "dx-button",
            BUTTON_CONTENT_CLASS = "dx-button-content",
            BUTTON_CONTENT_SELECTOR = ".dx-button-content",
            BUTTON_TEXT_CLASS = "dx-button-text",
            BUTTON_HAS_TEXT_CLASS = "dx-button-has-text",
            BUTTON_HAS_ICON_CLASS = "dx-button-has-icon",
            BUTTON_TEXT_SELECTOR = ".dx-button-text",
            BUTTON_BACK_ARROW_CLASS = "dx-button-back-arrow",
            ICON_CLASS = "dx-icon",
            ICON_SELECTOR = ".dx-icon",
            BUTTON_FEEDBACK_HIDE_TIMEOUT = 100;
        DX.registerComponent("dxButton", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    clickAction: null,
                    type: "normal",
                    text: "",
                    icon: "",
                    iconSrc: "",
                    hoverStateEnabled: true
                })
            },
            _init: function() {
                this.callBase();
                this._feedbackHideTimeout = BUTTON_FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.callBase();
                this._element().addClass(BUTTON_CLASS).append($("<div />").addClass(BUTTON_CONTENT_CLASS));
                this._renderClick();
                this._renderIcon();
                this._renderType();
                this._renderText()
            },
            _renderClick: function() {
                var that = this,
                    eventName = events.addNamespace("dxclick", this.NAME);
                this._clickAction = this._createActionByOption("clickAction");
                this._element().off(eventName).on(eventName, function(e) {
                    that._clickAction({jQueryEvent: e})
                })
            },
            _removeTypesCss: function() {
                var css = this._element().attr("class");
                css = css.replace(/\bdx-button-[-a-z0-9]+\b/gi, "");
                this._element().attr("class", css)
            },
            _renderIcon: function() {
                var contentElement = this._element().find(BUTTON_CONTENT_SELECTOR),
                    iconElement = contentElement.find(ICON_SELECTOR),
                    icon = this.option("icon"),
                    iconSrc = this.option("iconSrc");
                iconElement.remove();
                if (this.option("type") === "back" && !icon)
                    icon = "back";
                if (!icon && !iconSrc)
                    return;
                if (icon)
                    iconElement = $("<span />").addClass("dx-icon-" + icon);
                else if (iconSrc)
                    iconElement = $("<img />").attr("src", iconSrc);
                contentElement.prepend(iconElement.addClass(ICON_CLASS));
                this._element().addClass(BUTTON_HAS_ICON_CLASS)
            },
            _renderType: function() {
                var type = this.option("type");
                if (type)
                    this._element().addClass("dx-button-" + type);
                if (type === "back")
                    this._element().prepend($("<span />").addClass(BUTTON_BACK_ARROW_CLASS))
            },
            _renderText: function() {
                var text = this.option("text"),
                    contentElement = this._element().find(BUTTON_CONTENT_SELECTOR),
                    back = this.option("type") === "back";
                var textElement = contentElement.find(BUTTON_TEXT_SELECTOR);
                if (!text && !back) {
                    textElement.remove();
                    return
                }
                if (!textElement.length)
                    textElement = $('<span />').addClass(BUTTON_TEXT_CLASS).appendTo(contentElement);
                textElement.text(text || DX.localization.localizeString("@Back"));
                this._element().addClass(BUTTON_HAS_TEXT_CLASS)
            },
            _clean: function() {
                this.callBase();
                this._removeTypesCss()
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"clickAction":
                        this._renderClick();
                        break;
                    case"icon":
                    case"iconSrc":
                        this._renderIcon();
                        break;
                    case"text":
                        this._renderText();
                        break;
                    case"type":
                        this._invalidate();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.checkBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var CHECKBOX_CLASS = "dx-checkbox",
            CHECKBOX_ICON_CLASS = "dx-checkbox-icon",
            CHECKBOX_CHECKED_CLASS = "dx-checkbox-checked",
            CHECKBOX_INDETERMINATE_CLASS = "dx-checkbox-indeterminate",
            CHECKBOX_FEEDBACK_HIDE_TIMEOUT = 100,
            CHECKBOX_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", "dxCheckBox");
        DX.registerComponent("dxCheckBox", ui.dxEditor.inherit({
            _deprecatedOptions: {checked: {
                    since: "14.1",
                    message: "Use the 'value' option instead."
                }},
            _optionAliases: {checked: "value"},
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: undefined,
                    valueChangeAction: null,
                    hoverStateEnabled: true
                })
            },
            _init: function() {
                this.callBase();
                this._feedbackHideTimeout = CHECKBOX_FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.callBase();
                this._element().addClass(CHECKBOX_CLASS);
                this._$iconContainer = $("<span />");
                this._$iconContainer.addClass(CHECKBOX_ICON_CLASS).appendTo(this._element());
                this._renderValue();
                this._renderClick();
                this._updateContentSize()
            },
            _renderDimensions: function() {
                this.callBase();
                this._updateContentSize()
            },
            _updateContentSize: function() {
                var $element = this._element(),
                    width = this.option("width"),
                    height = this.option("height");
                if (this._$iconContainer && (width || height)) {
                    width = this._element().width();
                    height = this._element().height();
                    var minDimention = Math.min(height, width);
                    this._$iconContainer.css({
                        height: minDimention,
                        width: minDimention,
                        "margin-top": (height - minDimention) / 2,
                        "margin-left": (width - minDimention) / 2
                    })
                }
            },
            _renderClick: function() {
                var clickAction = this._createAction(this._handleClick);
                this._element().off(CHECKBOX_DXCLICK_EVENT_NAME).on(CHECKBOX_DXCLICK_EVENT_NAME, function(e) {
                    clickAction({jQueryEvent: e})
                })
            },
            _handleClick: function(args) {
                var that = args.component;
                that._valueChangeEventInstance = args.jQueryEvent;
                that.option("value", !that.option("value"))
            },
            _renderValue: function() {
                var $element = this._element(),
                    checked = this.option("value"),
                    indeterminate = checked === undefined;
                $element.toggleClass(CHECKBOX_CHECKED_CLASS, Boolean(checked));
                $element.toggleClass(CHECKBOX_INDETERMINATE_CLASS, indeterminate)
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"value":
                        this._renderValue();
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textEditor.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var TEXTEDITOR_CLASS = "dx-texteditor",
            TEXTEDITOR_INPUT_CLASS = "dx-texteditor-input",
            TEXTEDITOR_INPUT_SELECTOR = "." + TEXTEDITOR_INPUT_CLASS,
            TEXTEDITOR_BORDER_CLASS = "dx-texteditor-border",
            TEXTEDITOR_PLACEHOLDER_CLASS = "dx-placeholder",
            TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS = "dx-show-clear-button",
            TEXTEDITOR_CLEAR_ICON_CLASS = "dx-icon-clear",
            TEXTEDITOR_CLEAR_BUTTON_CLASS = "dx-clear-button-area",
            TEXTEDITOR_EMPTY_INPUT_CLASS = "dx-texteditor-empty",
            TEXTEDITOR_STATE_FOCUSED_CLASS = "dx-state-focused",
            EVENTS_LIST = ["focusIn", "focusOut", "keyDown", "keyPress", "keyUp", "change", "cut", "copy", "paste", "input"];
        var nativeClearButtonCancelSupport = function() {
                return DX.browser["msie"] && DX.browser.version > 9 || !DX.browser["msie"]
            }();
        DX.registerComponent("dxTextEditor", ui.dxEditor.inherit({
            _deprecatedOptions: {
                valueUpdateEvent: {
                    since: "14.1",
                    message: "Use the 'valueChangeEvent' option instead."
                },
                valueUpdateAction: {
                    since: "14.1",
                    message: "Use the 'valueChangeAction' option instead."
                }
            },
            _optionAliases: {valueUpdateEvent: "valueChangeEvent"},
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: "",
                    showClearButton: false,
                    valueChangeEvent: "change",
                    valueUpdateAction: null,
                    placeholder: "",
                    readOnly: false,
                    focusInAction: null,
                    focusOutAction: null,
                    keyDownAction: null,
                    keyPressAction: null,
                    keyUpAction: null,
                    changeAction: null,
                    inputAction: null,
                    cutAction: null,
                    copyAction: null,
                    pasteAction: null,
                    enterKeyAction: null,
                    mode: "text",
                    activeStateEnabled: false,
                    hoverStateEnabled: true
                })
            },
            _input: function() {
                return this._element().find(TEXTEDITOR_INPUT_SELECTOR)
            },
            _render: function() {
                this._element().addClass(TEXTEDITOR_CLASS);
                this._renderInput();
                this._renderInputType();
                this._renderValue();
                this._renderProps();
                this._renderPlaceholder();
                this._renderEvents();
                this._toggleClearButton();
                this._renderEnterKeyAction();
                this._renderEmptinessEvent();
                this._renderFocusEvent();
                this.callBase()
            },
            _renderInput: function(inputContainer) {
                (inputContainer || this._element()).append($("<div>").addClass(TEXTEDITOR_BORDER_CLASS).append($("<input>").addClass(TEXTEDITOR_INPUT_CLASS)))
            },
            _renderValue: function(formattedValue) {
                var text = formattedValue || this.option("value");
                if (this._input().val() !== text) {
                    this._input().val(text);
                    this._toggleEmptinessEventHandler()
                }
            },
            _isValueValid: function() {
                var validity = this._input().get(0).validity;
                if (validity)
                    return validity.valid;
                return true
            },
            _toggleEmptiness: function(visibility) {
                this._element().toggleClass(TEXTEDITOR_EMPTY_INPUT_CLASS, visibility)
            },
            _togglePlaceholderVisibility: function(visibility) {
                if (!this._$placeholder)
                    return;
                if (DX.browser["msie"])
                    this._$placeholder.toggle(!this._input().is(":focus") && visibility);
                else
                    this._$placeholder.toggle(visibility)
            },
            _renderProps: function() {
                this._input().prop({
                    readOnly: this._readOnlyPropValue(),
                    disabled: this.option("disabled")
                })
            },
            _readOnlyPropValue: function() {
                return this.option("readOnly")
            },
            _renderPlaceholder: function() {
                var that = this,
                    $input = that._input(),
                    placeholderText = that.option("placeholder"),
                    $placeholder = this._$placeholder = $('<div>').attr("data-dx_placeholder", placeholderText),
                    startEvent = events.addNamespace("dxclick", this.NAME);
                $placeholder.on(startEvent, function() {
                    $input.focus()
                });
                $placeholder.appendTo($input.parent());
                $placeholder.addClass(TEXTEDITOR_PLACEHOLDER_CLASS)
            },
            _toggleClearButton: function() {
                if (!nativeClearButtonCancelSupport)
                    return;
                var $element = this._element(),
                    showing = this.option("showClearButton") && !this.option("readOnly");
                $element.toggleClass(TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS, showing);
                if (showing)
                    this._renderClearButton();
                else
                    this._$clearButton && this._$clearButton.remove()
            },
            _renderClearButton: function() {
                var $clearButton = $("<span>").addClass(TEXTEDITOR_CLEAR_BUTTON_CLASS).append($("<span>").addClass(TEXTEDITOR_CLEAR_ICON_CLASS)).on(events.addNamespace("dxpointerdown", this.NAME), function() {
                        return false
                    }).on(events.addNamespace("dxpointerup", this.NAME), $.proxy(this._handleClearValue, this));
                this._element().append($clearButton);
                this._$clearButton = $clearButton
            },
            _handleClearValue: function() {
                var $input = this._input();
                this.option("value", "");
                if ($input.is(":focus")) {
                    $input.val("");
                    this._toggleEmptinessEventHandler()
                }
                else
                    $input.trigger("focus")
            },
            _renderEvents: function() {
                var that = this,
                    $input = that._input();
                that._renderValueUpdateEvent();
                $.each(EVENTS_LIST, function(_, event) {
                    var eventName = events.addNamespace(event.toLowerCase(), that.NAME),
                        action = that._createActionByOption(event + "Action");
                    $input.off(eventName).on(eventName, function(e) {
                        action({jQueryEvent: e})
                    })
                })
            },
            _renderValueUpdateEvent: function() {
                var eventNamespace = this.NAME + "ValueUpdate";
                var valueChangeEvent = events.addNamespace(this.option("valueChangeEvent"), eventNamespace);
                this._input().off("." + eventNamespace).on(valueChangeEvent, $.proxy(this._handleValueChangeEvent, this));
                this._valueUpdateAction = this._createActionByOption("valueUpdateAction")
            },
            _renderFocusEvent: function() {
                var $element = this._element();
                $element.find("." + TEXTEDITOR_INPUT_CLASS).focusin(function() {
                    $element.addClass(TEXTEDITOR_STATE_FOCUSED_CLASS)
                }).focusout(function() {
                    $element.removeClass(TEXTEDITOR_STATE_FOCUSED_CLASS)
                }).filter(":focus").addClass(TEXTEDITOR_STATE_FOCUSED_CLASS);
                if (DX.browser["msie"])
                    this._input().on('focus', $.proxy(function() {
                        this._togglePlaceholderVisibility(false)
                    }, this))
            },
            _renderEmptinessEvent: function() {
                var $input = this._input();
                $input.on("input blur", $.proxy(this._toggleEmptinessEventHandler, this));
                this._toggleEmptinessEventHandler()
            },
            _toggleEmptinessEventHandler: function(value) {
                var value = this._input().val(),
                    visibility = (value === "" || value === null) && this._isValueValid();
                this._toggleEmptiness(visibility);
                this._togglePlaceholderVisibility(visibility)
            },
            _handleValueChangeEvent: function(e, formattedValue) {
                this._valueChangeEventInstance = e;
                this._suppressValueUpdateAction = true;
                this.option("value", arguments.length > 1 ? formattedValue : this._input().val());
                this._suppressValueUpdateAction = false;
                this._valueUpdateAction({
                    value: this.option("value"),
                    jQueryEvent: e
                })
            },
            _renderEnterKeyAction: function() {
                if (this.option("enterKeyAction")) {
                    this._enterKeyAction = this._createActionByOption("enterKeyAction");
                    this._input().on("keyup.enterKey.dxTextEditor", $.proxy(this._handleEnterKeyUp, this))
                }
                else {
                    this._input().off("keyup.enterKey.dxTextEditor");
                    this._enterKeyAction = undefined
                }
            },
            _handleEnterKeyUp: function(e) {
                if (e.which === 13)
                    this._enterKeyAction({jQueryEvent: e})
            },
            _toggleDisabledState: function() {
                this.callBase.apply(this, arguments);
                this._renderProps()
            },
            _updateValue: function() {
                this._renderValue();
                if (!this._suppressValueUpdateAction)
                    this._valueUpdateAction({value: this.option("value")})
            },
            _suppressUpdateValue: function() {
                this._valueUpdateSuppressed = true
            },
            _resumeUpdateValue: function() {
                this._valueUpdateSuppressed = false
            },
            _optionChanged: function(optionName) {
                if ($.inArray(optionName.replace("Action", ""), EVENTS_LIST) > -1) {
                    this._renderEvents();
                    return
                }
                switch (optionName) {
                    case"valueChangeEvent":
                    case"valueUpdateAction":
                        this._renderValueUpdateEvent();
                        break;
                    case"readOnly":
                        this._renderProps();
                        this._toggleClearButton();
                        break;
                    case"mode":
                        this._renderInputType();
                        break;
                    case"enterKeyAction":
                        this._renderEnterKeyAction();
                        break;
                    case"placeholder":
                        this._invalidate();
                        break;
                    case"showClearButton":
                        this._toggleClearButton();
                        break;
                    case"value":
                        if (!this._valueUpdateSuppressed)
                            this._updateValue();
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _renderInputType: function() {
                this._setInputType(this.option("mode"))
            },
            _setInputType: function(type) {
                var input = this._input();
                if (type === "search")
                    type = "text";
                try {
                    input.prop("type", type)
                }
                catch(e) {
                    input.prop("type", "text")
                }
            },
            focus: function() {
                this._input().focus()
            },
            blur: function() {
                if (this._input().is(document.activeElement))
                    DX.utils.resetActiveElement()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            devices = DX.devices,
            ua = window.navigator.userAgent,
            ignoreCode = [8, 9, 13, 33, 34, 35, 36, 37, 38, 39, 40, 46],
            TEXTBOX_CLASS = "dx-textbox",
            SEARCHBOX_CLASS = "dx-searchbox",
            SEARCH_ICON_CLASS = "dx-icon-search";
        DX.registerComponent("dxTextBox", ui.dxTextEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    mode: "text",
                    maxLength: null
                })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TEXTBOX_CLASS);
                this._renderMaxLengthHandlers();
                this._renderSearchMode()
            },
            _renderMaxLengthHandlers: function() {
                if (this._isAndroid())
                    this._input().on(events.addNamespace("keydown", this.NAME), $.proxy(this._onKeyDownAndroidHandler, this)).on(events.addNamespace("change", this.NAME), $.proxy(this._onChangeAndroidHandler, this))
            },
            _renderProps: function() {
                this.callBase();
                if (this._isAndroid())
                    return;
                var maxLength = this.option("maxLength");
                if (maxLength > 0)
                    this._input().prop("maxLength", maxLength)
            },
            _renderSearchMode: function() {
                var $element = this._$element;
                if (this.option("mode") === "search") {
                    this._renderSearchIcon();
                    $element.addClass(SEARCHBOX_CLASS);
                    this._showClearButton = this.option("showClearButton");
                    this.option("showClearButton", true)
                }
                if (this.option("mode") !== "search") {
                    $element.removeClass(SEARCHBOX_CLASS);
                    this._$searchIcon && this._$searchIcon.remove();
                    this.option("showClearButton", this._showClearButton === undefined ? this.option("showClearButton") : this._showClearButton)
                }
            },
            _renderSearchIcon: function() {
                var $searchIcon = $("<div>").addClass(SEARCH_ICON_CLASS);
                $searchIcon.prependTo(this._input().parent());
                this._$searchIcon = $searchIcon
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"maxLength":
                        this._renderProps();
                        this._renderMaxLengthHandlers();
                        break;
                    case"mode":
                        this._renderSearchMode();
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _onKeyDownAndroidHandler: function(e) {
                var maxLength = this.option("maxLength");
                if (maxLength) {
                    var $input = $(e.target),
                        code = e.keyCode;
                    this._cutOffExtraChar($input);
                    return $input.val().length < maxLength || $.inArray(code, ignoreCode) !== -1 || window.getSelection().toString() !== ""
                }
                else
                    return true
            },
            _onChangeAndroidHandler: function(e) {
                var $input = $(e.target);
                if (this.option("maxLength"))
                    this._cutOffExtraChar($input)
            },
            _cutOffExtraChar: function($input) {
                var maxLength = this.option("maxLength"),
                    textInput = $input.val();
                if (textInput.length > maxLength)
                    $input.val(textInput.substr(0, maxLength))
            },
            _isAndroid: function() {
                var realDevice = devices.real();
                var version = realDevice.version.join(".");
                return realDevice.platform === "android" && version && /^(2\.|4\.1)/.test(version) && !/chrome/i.test(ua)
            }
        }));
        ui.dxTextBox.__internals = {
            uaAccessor: function(value) {
                if (!arguments.length)
                    return ui;
                ua = value
            },
            SEARCHBOX_CLASS: SEARCHBOX_CLASS,
            SEARCH_ICON_CLASS: SEARCH_ICON_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dropDownEditor.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            DROP_DOWN_EDITOR_CLASS = "dx-dropdowneditor",
            DROP_DOWN_EDITOR_READONLY_CLASS = "dx-dropdowneditor-readonly",
            DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS = "dx-dropdowneditor-input-wrapper",
            DROP_DOWN_EDITOR_BUTTON_CLASS = "dx-dropdowneditor-button",
            DROP_DOWN_EDITOR_BUTTON_ICON = "dx-dropdowneditor-icon",
            DROP_DOWN_EDITOR_OVERLAY = "dx-dropdowneditor-overlay",
            DROP_DOWN_EDITOR_ACTIVE = "dx-dropdowneditor-active",
            DROP_DOWN_EDITOR_BUTTON_VISIBLE = "dx-dropdowneditor-button-visible",
            DROP_DOWN_EDITOR_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", "dxDropDownEditor"),
            DROP_DOWN_EDITOR_MOUSE_DOWN_EVENT_NAME = events.addNamespace("mousedown", "dxDropDownEditor"),
            keyboardKeys = {
                upArrow: 38,
                downArrow: 40
            };
        DX.registerComponent("dxDropDownEditor", ui.dxTextBox.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    openAction: null,
                    closeAction: null
                })
            },
            open: function() {
                this._showDropDown()
            },
            close: function() {
                this._hideDropDown()
            },
            _clean: function() {
                this.callBase();
                if (this._dropDownContainer) {
                    this._dropDownContainer.remove();
                    this._dropDown = undefined
                }
            },
            _render: function() {
                this._dropDownContainerRendered = false;
                this._element().addClass(DROP_DOWN_EDITOR_CLASS);
                this._renderButton();
                this.callBase();
                this._renderKeyboardEvents();
                var that = this;
                this._input().on("blur", function(e) {
                    if (that._hideOnBlur() && !that._needToPreventBlur)
                        that._hideDropDown();
                    that._needToPreventBlur = false
                })
            },
            _renderInput: function(inputContainer) {
                this._inputWrapper = inputContainer || $("<div>");
                this._inputWrapper.addClass(DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS);
                this._element().prepend(this._inputWrapper);
                this.callBase(this._inputWrapper)
            },
            _renderButton: function(hideButton) {
                this._button = $("<div>").addClass(DROP_DOWN_EDITOR_BUTTON_CLASS);
                this._attachButtonEvents();
                this._updateButtonReadonlyState();
                this._buttonIcon = $("<div>").addClass(DROP_DOWN_EDITOR_BUTTON_ICON).appendTo(this._button);
                this._button.appendTo(this._element());
                if (hideButton) {
                    this._element().removeClass(DROP_DOWN_EDITOR_BUTTON_VISIBLE);
                    this._button.hide()
                }
                else
                    this._element().addClass(DROP_DOWN_EDITOR_BUTTON_VISIBLE)
            },
            _attachButtonEvents: function() {
                var that = this,
                    dxClickAction,
                    mouseDownAction;
                this._button.off(DROP_DOWN_EDITOR_DXCLICK_EVENT_NAME).off(DROP_DOWN_EDITOR_MOUSE_DOWN_EVENT_NAME);
                if (!this.option("readOnly")) {
                    dxClickAction = this._createAction(function() {
                        that._toggleDropDown();
                        that._dropDownClickHandler()
                    });
                    mouseDownAction = this._createAction(function(args) {
                        that._mouseDownFocusKeeper(args.jQueryEvent)
                    });
                    this._button.on(DROP_DOWN_EDITOR_DXCLICK_EVENT_NAME, function() {
                        dxClickAction()
                    }).on(DROP_DOWN_EDITOR_MOUSE_DOWN_EVENT_NAME, function(e) {
                        mouseDownAction({jQueryEvent: e})
                    })
                }
            },
            _updateButtonReadonlyState: function() {
                this._button.removeClass(DROP_DOWN_EDITOR_READONLY_CLASS);
                if (this.option("readOnly"))
                    this._button.addClass(DROP_DOWN_EDITOR_READONLY_CLASS)
            },
            _renderKeyboardEvents: function() {
                this._input().off(events.addNamespace("keydown", "dxDropDownEditor")).on(events.addNamespace("keydown", "dxDropDownEditor"), $.proxy(this._onKeyDownHandler, this))
            },
            _dropDownClickHandler: function() {
                if (!this._deviceHasTouchScreen() && !this._input().is(":focus"))
                    this.focus();
                this._needToPreventBlur = false
            },
            _mouseDownFocusKeeper: function(e) {
                this._needToPreventBlur = true;
                if (e && e.preventDefault)
                    e.preventDefault()
            },
            _deviceHasTouchScreen: function() {
                var device = DevExpress.devices.real();
                return device.phone || device.tablet
            },
            _hideOnBlur: function() {
                return true
            },
            _renderDropDownContent: function() {
                return []
            },
            _dropDownVisible: function() {
                return this._dropDown && this._dropDown.option("visible")
            },
            _toggleDropDown: function() {
                this._dropDownVisible() ? this._hideDropDown() : this._showDropDown()
            },
            _showDropDown: function() {
                if (!this._dropDownVisible()) {
                    this._renderDropDownContainer();
                    this._dropDown.show();
                    this._element().addClass(DROP_DOWN_EDITOR_ACTIVE)
                }
            },
            _hideDropDown: function() {
                if (this._dropDownVisible()) {
                    this._element().removeClass(DROP_DOWN_EDITOR_ACTIVE);
                    this._dropDown.hide()
                }
            },
            _renderDropDownContainer: function() {
                var that = this,
                    dropDownContent;
                if (!this._dropDownContainerRendered) {
                    this._dropDownContainer = $("<div>").addClass(DROP_DOWN_EDITOR_OVERLAY).addClass(that.option("customOverlayCssClass"));
                    this._element().append(this._dropDownContainer);
                    this._createDropDown();
                    dropDownContent = this._renderDropDownContent();
                    if (!$.isArray(dropDownContent))
                        dropDownContent = [dropDownContent];
                    $.each(dropDownContent, function(index, contentElement) {
                        contentElement.off(DROP_DOWN_EDITOR_MOUSE_DOWN_EVENT_NAME).on(DROP_DOWN_EDITOR_MOUSE_DOWN_EVENT_NAME, function(e) {
                            that._mouseDownFocusKeeper(e)
                        }).off(DROP_DOWN_EDITOR_DXCLICK_EVENT_NAME).on(DROP_DOWN_EDITOR_DXCLICK_EVENT_NAME, function() {
                            that._dropDownClickHandler()
                        });
                        that._dropDownContainer.append(contentElement)
                    });
                    this._dropDownContainerRendered = true
                }
            },
            _createDropDown: function(options) {
                this._dropDown = this._dropDownContainer.dxOverlay($.extend(true, {
                    position: {
                        offset: "0 -1",
                        my: "left top",
                        at: "left bottom",
                        of: this._element(),
                        collision: "flip flip"
                    },
                    showTitle: false,
                    width: "auto",
                    height: "auto",
                    shading: false,
                    rtlEnabled: this.option("rtlEnabled"),
                    closeOnTargetScroll: $.proxy(this._closeOnScrollHandler, this),
                    closeOnOutsideClick: $.proxy(this._closeOutsideDropDownHandler, this),
                    animation: {
                        show: false,
                        hide: false
                    },
                    shownAction: this.option("openAction"),
                    hiddenAction: this.option("closeAction")
                }, options)).dxOverlay("instance")
            },
            _closeOnScrollHandler: function(e) {
                this._hideDropDown();
                return true
            },
            _closeOutsideDropDownHandler: function(e, ignoreContainerClicks) {
                if (e.target !== this._input()[0] && e.target !== this._button[0] && !this._button.find($(e.target)).length && (!ignoreContainerClicks || !this._dropDown._container().find($(e.target)).length))
                    this._hideDropDown();
                return false
            },
            _onKeyDownHandler: function(e) {
                if (e.altKey) {
                    if (e.which === keyboardKeys.downArrow)
                        this._showDropDown();
                    if (e.which === keyboardKeys.upArrow)
                        this._hideDropDown()
                }
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"rtlEnabled":
                        this.callBase.apply(this, arguments);
                        if (this._dropDownContainerRendered)
                            this._dropDown.option(name, value);
                        break;
                    case"openAction":
                        if (this._dropDownContainerRendered)
                            this._dropDown.option("shownAction", value);
                        break;
                    case"closeAction":
                        if (this._dropDownContainerRendered)
                            this._dropDown.option("hiddenAction", value);
                        break;
                    case"readOnly":
                        this._attachButtonEvents();
                        this._updateButtonReadonlyState();
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxDropDownEditor.__internals = {
            DROP_DOWN_EDITOR_CLASS: DROP_DOWN_EDITOR_CLASS,
            DROP_DOWN_EDITOR_READONLY_CLASS: DROP_DOWN_EDITOR_READONLY_CLASS,
            DROP_DOWN_EDITOR_BUTTON_ICON: DROP_DOWN_EDITOR_BUTTON_ICON,
            DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS: DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS,
            DROP_DOWN_EDITOR_BUTTON_CLASS: DROP_DOWN_EDITOR_BUTTON_CLASS,
            DROP_DOWN_EDITOR_OVERLAY: DROP_DOWN_EDITOR_OVERLAY,
            DROP_DOWN_EDITOR_ACTIVE: DROP_DOWN_EDITOR_ACTIVE,
            DROP_DOWN_EDITOR_BUTTON_VISIBLE: DROP_DOWN_EDITOR_BUTTON_VISIBLE
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textArea.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var TEXTAREA_CLASS = "dx-textarea",
            TEXTEDITOR_INPUT_CLASS = "dx-texteditor-input",
            TEXTEDITOR_BORDER_CLASS = "dx-texteditor-border";
        DX.registerComponent("dxTextArea", ui.dxTextBox.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({})
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TEXTAREA_CLASS)
            },
            _renderInput: function() {
                this._element().append($("<div />").addClass(TEXTEDITOR_BORDER_CLASS).append($("<textarea />").addClass(TEXTEDITOR_INPUT_CLASS)));
                this._renderScrollHandler()
            },
            _renderScrollHandler: function() {
                var $input = this._input(),
                    eventY = 0;
                $input.on(events.addNamespace("dxpointerdown", this.NAME), function(e) {
                    eventY = events.eventData(e).y
                });
                $input.on(events.addNamespace("dxpointermove", this.NAME), function(e) {
                    var scrollTopPos = $input.scrollTop(),
                        scrollBottomPos = $input.prop("scrollHeight") - $input.prop("clientHeight") - scrollTopPos;
                    if (scrollTopPos === 0 && scrollBottomPos === 0)
                        return;
                    var currentEventY = events.eventData(e).y;
                    var isScrollFromTop = scrollTopPos === 0 && eventY >= currentEventY,
                        isScrollFromBottom = scrollBottomPos === 0 && eventY <= currentEventY,
                        isScrollFromMiddle = scrollTopPos > 0 && scrollBottomPos > 0;
                    if (isScrollFromTop || isScrollFromBottom || isScrollFromMiddle)
                        e.originalEvent.isScrollingEvent = true;
                    eventY = currentEventY
                })
            },
            _renderInputType: $.noop
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.numberBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math,
            events = ui.events,
            WIDGET_CLASS = "dx-numberbox",
            SPIN_CLASS = WIDGET_CLASS + "-spin",
            SPIN_CONTAINER_CLASS = SPIN_CLASS + "-container",
            SPIN_UP_CLASS = SPIN_CLASS + "-up",
            SPIN_DOWN_CLASS = SPIN_CLASS + "-down",
            SPIN_BUTTON_CLASS = SPIN_CLASS + "-button",
            SPIN_UP_SELECTOR = "." + SPIN_UP_CLASS,
            SPIN_DOWN_SELECTOR = "." + SPIN_DOWN_CLASS,
            SPIN_HOLD_DELAY = 150,
            CONTROL_KEYS = ["Del", "Backspace", "Left", "Right", "Home", "End"];
        DX.registerComponent("dxSpinButton", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    direction: "up",
                    changeAction: null
                })
            },
            _render: function() {
                this.callBase();
                var that = this,
                    $element = this._element(),
                    pointerDownEvent = events.addNamespace("dxpointerdown", this.NAME),
                    direction = SPIN_CLASS + "-" + this.option("direction");
                $element.addClass(SPIN_BUTTON_CLASS).addClass(direction).off(pointerDownEvent).on(pointerDownEvent, $.proxy(this._handleSpinHold, this));
                this._spinIcon = $("<div>").addClass(direction + "-icon").appendTo(this._element());
                this._handleSpinChange = this._createActionByOption("changeAction")
            },
            _handleSpinHold: function(e) {
                e.preventDefault();
                var pointerUpEvent = events.addNamespace("dxpointerup", this.NAME),
                    pointerCancelEvent = events.addNamespace("dxpointercancel", this.NAME);
                this._clearTimer();
                $(document).off(pointerUpEvent).off(pointerCancelEvent).on(pointerUpEvent, $.proxy(this._clearTimer, this)).on(pointerCancelEvent, $.proxy(this._clearTimer, this));
                this._handleSpinChange({jQueryEvent: e});
                this._holdTimer = setInterval(this._handleSpinChange, SPIN_HOLD_DELAY, {jQueryEvent: e})
            },
            _dispose: function() {
                this._clearTimer();
                this.callBase()
            },
            _clearTimer: function(e) {
                if (this._holdTimer)
                    clearInterval(this._holdTimer)
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"changeAction":
                    case"direction":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            }
        }));
        DX.registerComponent("dxNumberBox", ui.dxTextEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: 0,
                    min: undefined,
                    max: undefined,
                    mode: "number",
                    showSpinButtons: false,
                    step: 1
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function(device) {
                                var realDevice = DX.devices.real(),
                                    realPlatform = realDevice.platform,
                                    realVersion = realDevice.version;
                                var isDesktop = realDevice.deviceType === "desktop",
                                    isNewIE = DX.browser["msie"] && DX.browser.version.split(".")[0] > 9 && isDesktop,
                                    isChrome = DX.browser["webkit"] && isDesktop,
                                    isMozilla = DX.browser["mozilla"] && isDesktop,
                                    isAndroid44 = realPlatform === "android" && realVersion[0] >= 4 && realVersion[1] >= 4,
                                    isIos7 = realPlatform === "ios" && realVersion[0] > 6;
                                return isNewIE || isChrome || isIos7 || isAndroid44 || isMozilla
                            },
                            options: {mode: "number"}
                        }])
            },
            _init: function() {
                this.callBase();
                this._initSpinButtons()
            },
            _initSpinButtons: function() {
                var eventName = events.addNamespace("dxpointerdown", this.NAME);
                this._$spinContainer = $("<div>").addClass(SPIN_CONTAINER_CLASS).off(eventName).on(eventName, $.proxy(this._handleSpinButtonsClick, this));
                this._$spinUp = $("<div>").dxSpinButton({
                    direction: "up",
                    changeAction: $.proxy(this._handleSpinUpChange, this)
                }).appendTo(this._$spinContainer);
                this._$spinDown = $("<div>").dxSpinButton({
                    direction: "down",
                    changeAction: $.proxy(this._handleSpinDownChange, this)
                }).appendTo(this._$spinContainer)
            },
            _handleSpinButtonsClick: function() {
                var $input = this._input();
                if (document.activeElement !== $input[0])
                    $input.trigger("focus")
            },
            _render: function() {
                this.callBase();
                this._element().addClass(WIDGET_CLASS);
                this._renderSpinButtons();
                this._handleKeyPressEvent()
            },
            _handleKeyPressEvent: function() {
                var that = this;
                this._input().keypress(function(e) {
                    var ch = String.fromCharCode(e.which),
                        validCharRegExp = /[\d.,eE\-+]/,
                        isInputCharValid = validCharRegExp.test(ch);
                    if (!isInputCharValid)
                        if (!(e.key && $.inArray(e.key, CONTROL_KEYS) >= 0)) {
                            e.preventDefault();
                            return false
                        }
                    that._isIncompleteValue = false;
                    if (that._isValueIncomplete(that._input().val() + ch))
                        that._isIncompleteValue = true
                })
            },
            _isValueIncomplete: function(value) {
                var expRegex = /\d+e$/,
                    negRegex = /^-/;
                return expRegex.test(value) || negRegex.test(value)
            },
            _renderSpinButtons: function() {
                this._element().toggleClass(SPIN_CLASS, this.option("showSpinButtons"));
                if (this.option("showSpinButtons"))
                    this._$spinContainer.appendTo(this._element());
                else
                    this._$spinContainer.detach()
            },
            _handleSpinUpChange: function() {
                var value = parseFloat(this.option().value),
                    step = parseFloat(this.option().step);
                this.option("value", value + step)
            },
            _handleSpinDownChange: function() {
                var value = parseFloat(this.option().value),
                    step = parseFloat(this.option().step);
                this.option("value", value - step)
            },
            _renderValue: function() {
                var value = this.option("value") ? this.option("value").toString() : this.option("value");
                if (this._input().val() !== value) {
                    var inputType = this._input().attr("type");
                    this._setInputType("text");
                    this._input().val(this.option("value"));
                    this._setInputType(inputType);
                    this._toggleEmptinessEventHandler()
                }
            },
            _renderProps: function() {
                this.callBase();
                this._input().prop({
                    min: this.option("min"),
                    max: this.option("max"),
                    step: this.option("step")
                })
            },
            _trimInputValue: function() {
                var $input = this._input(),
                    value = $.trim($input.val());
                if (value[value.length - 1] === ".")
                    value = value.slice(0, -1);
                this._forceRefreshInputValue(value)
            },
            _inputInvalidHandler: function() {
                var $input = this._input(),
                    value = $input.val();
                if (this._oldValue) {
                    this.option("value", this._oldValue);
                    $input.val(this._oldValue);
                    this._oldValue = null
                }
                else {
                    this.option("value", "");
                    $input.val("")
                }
            },
            _forceRefreshInputValue: function(value) {
                var $input = this._input();
                $input.val("").val(value)
            },
            _renderValueUpdateEvent: function() {
                this.callBase();
                this._input().focusout($.proxy(this._trimInputValue, this))
            },
            _handleValueChangeEvent: function(e) {
                var $input = this._input(),
                    value = $.trim($input.val()),
                    input = $input.get(0);
                value = value.replace(",", ".");
                this._valueChangeEventInstance = e;
                if (!this._isIncompleteValue)
                    if (!this._validateValue(value)) {
                        this._inputInvalidHandler();
                        return
                    }
                if (value !== "") {
                    if (this._isIncompleteValue)
                        return;
                    value = this._parseValue(value);
                    if (!value && value !== 0)
                        return;
                    this.callBase(e, value);
                    if ($input.val() != value)
                        $input.val(value)
                }
                else
                    this.option("value", "")
            },
            _validateValue: function(value) {
                var isValueValid = this._isValueValid();
                if (!value && isValueValid) {
                    this.option("value", "");
                    return true
                }
                var isNumber = /^-?\d+\.?\d*$/.test(value),
                    isExponent = /^-?\d+e[-+]?\d+$/.test(value);
                this._oldValue = this.option("value");
                if (!isNumber && !isExponent && !isValueValid)
                    return false;
                return true
            },
            _parseValue: function(value) {
                var number = parseFloat(value);
                if (this.option("min") !== undefined)
                    number = math.max(number, this.option("min"));
                if (this.option("max") !== undefined)
                    number = math.min(number, this.option("max"));
                return number
            },
            _setValue: function(value, prevValue) {
                if (value === prevValue)
                    return;
                if (!value && value !== 0) {
                    this.option("value", "");
                    return
                }
                if ($.type(value) === "string")
                    value = value.replace(",", ".");
                value = this._parseValue(value);
                if (!value && value !== 0) {
                    this.option("value", prevValue);
                    return
                }
                this.option("value", value)
            },
            _invalidate: function() {
                this._$spinContainer.detach();
                this.callBase()
            },
            _dispose: function() {
                this._$spinContainer.remove();
                this.callBase()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"value":
                        this._setValue(value, prevValue);
                        this.callBase.apply(this, arguments);
                        break;
                    case"step":
                    case"min":
                    case"max":
                        this._renderProps();
                        break;
                    case"showSpinButtons":
                        this._renderSpinButtons();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxNumberBox.__internals = {
            WIDGET_CLASS: WIDGET_CLASS,
            SPIN_CLASS: SPIN_CLASS,
            SPIN_CONTAINER_CLASS: SPIN_CONTAINER_CLASS,
            SPIN_UP_CLASS: SPIN_UP_CLASS,
            SPIN_DOWN_CLASS: SPIN_DOWN_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.radioButton.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var RADIO_BUTTON = "dxRadioButton",
            RADIO_BUTTON_CLASS = "dx-radio-button",
            RADIO_BUTTON_ICON_CLASS = "dx-radio-button-icon",
            RADIO_BUTTON_CHECKED_CLASS = "dx-radio-button-checked",
            RADIO_BUTTON_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", RADIO_BUTTON);
        DX.registerComponent(RADIO_BUTTON, ui.dxEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: false,
                    hoverStateEnabled: true
                })
            },
            _init: function() {
                this.callBase();
                this._element().addClass(RADIO_BUTTON_CLASS)
            },
            _render: function() {
                this.callBase();
                this._renderIcon();
                this._renderCheckedState(this.option("value"));
                this._renderClick()
            },
            _renderIcon: function() {
                var $icon = $("<div />").addClass(RADIO_BUTTON_ICON_CLASS);
                this._element().append($icon)
            },
            _renderCheckedState: function(checked) {
                this._element().toggleClass(RADIO_BUTTON_CHECKED_CLASS, checked)
            },
            _renderClick: function() {
                var clickAction = this._createAction($.proxy(function(args) {
                        this._handleClick(args.jQueryEvent)
                    }, this));
                this._element().off(RADIO_BUTTON_DXCLICK_EVENT_NAME).on(RADIO_BUTTON_DXCLICK_EVENT_NAME, function(e) {
                    clickAction({jQueryEvent: e})
                })
            },
            _handleClick: function(e) {
                this._valueChangeEventInstance = e;
                this.option("value", true)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"value":
                        this._renderCheckedState(value);
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.radioGroup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var RADIO_GROUP_CLASS = "dx-radio-group",
            RADIO_GROUP_VERTICAL_CLASS = "dx-radio-group-vertical",
            RADIO_GROUP_HORIZONTAL_CLASS = "dx-radio-group-horizontal",
            RADIO_BUTTON_CLASS = "dx-radio-button",
            RADIO_BUTTON_ICON_CLASS = "dx-radio-button-icon",
            RADIO_VALUE_CONTAINER_CLASS = "dx-radio-value-container",
            RADIO_BUTTON_CHECKED_CLASS = "dx-radio-button-checked",
            RADIO_BUTTON_DATA_KEY = "dxRadioButtonData",
            RADIO_FEEDBACK_HIDE_TIMEOUT = 100;
        DX.registerComponent("dxRadioGroup", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: "." + RADIO_BUTTON_CLASS,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    layout: "vertical",
                    value: undefined,
                    valueExpr: null,
                    hoverStateEnabled: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: {tablet: true},
                            options: {layout: "horizontal"}
                        }])
            },
            _optionsByReference: function() {
                return $.extend(this.callBase(), {value: true})
            },
            _itemClass: function() {
                return RADIO_BUTTON_CLASS
            },
            _itemDataKey: function() {
                return RADIO_BUTTON_DATA_KEY
            },
            _itemContainer: function() {
                return this._element()
            },
            _init: function() {
                this.callBase();
                if (!this._dataSource)
                    this._itemsToDataSource();
                this._feedbackHideTimeout = RADIO_FEEDBACK_HIDE_TIMEOUT
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"))
            },
            _render: function() {
                this._element().addClass(RADIO_GROUP_CLASS);
                this._compileValueGetter();
                this.callBase();
                this._renderLayout();
                this._renderValue();
                this._updateContentSize()
            },
            _renderDimensions: function() {
                this.callBase();
                this._updateContentSize()
            },
            _updateContentSize: function() {
                if (this.option("layout") === "horizontal")
                    this._itemElements().css("height", "auto");
                else {
                    var itemsCount = this.option("items").length;
                    this._itemElements().css("height", 100 / itemsCount + "%")
                }
            },
            _compileValueGetter: function() {
                this._valueGetter = DX.data.utils.compileGetter(this._valueGetterExpr())
            },
            _valueGetterExpr: function() {
                return this.option("valueExpr") || this._dataSource && this._dataSource._store._key || "this"
            },
            _renderLayout: function() {
                var layout = this.option("layout");
                this._element().toggleClass(RADIO_GROUP_VERTICAL_CLASS, layout === "vertical");
                this._element().toggleClass(RADIO_GROUP_HORIZONTAL_CLASS, layout === "horizontal")
            },
            _renderValue: function() {
                var value = this.option("value");
                value != null && value !== undefined ? this._setIndexByValue() : this._setValueByIndex()
            },
            _setIndexByValue: function(value) {
                var that = this;
                value = value === undefined ? that.option("value") : value;
                that._searchValue(value).done(function(item) {
                    if (that._dataSource.isLoaded())
                        that._setIndexByItem(item);
                    else
                        that._dataSource.load().done(function() {
                            that._setIndexByItem(item)
                        })
                })
            },
            _setIndexByItem: function(item) {
                var selectedIndex = -1;
                $.each(this._dataSource.items(), $.proxy(function(index, dataSourceItem) {
                    if (this._valuesEqual(item, dataSourceItem)) {
                        selectedIndex = index;
                        return false
                    }
                }, this));
                this.option("selectedIndex", selectedIndex)
            },
            _valuesEqual: function(item1, item2) {
                var dataSourceKey = this._dataSource && this._dataSource.key();
                var result = item1 === item2;
                if (dataSourceKey && !result) {
                    var item1Key = DX.utils.unwrapObservable(item1[dataSourceKey]);
                    var item2Key = DX.utils.unwrapObservable(item2[dataSourceKey]);
                    result = item1Key === item2Key
                }
                return result
            },
            _searchValue: function(value) {
                var that = this,
                    store = that._dataSource.store(),
                    valueExpr = that._valueGetterExpr();
                var deffered = $.Deferred();
                if (valueExpr === store.key() || store instanceof DX.data.CustomStore)
                    store.byKey(value).done(function(result) {
                        deffered.resolveWith(that, [result])
                    });
                else
                    store.load({filter: [valueExpr, value]}).done(function(result) {
                        deffered.resolveWith(that, result)
                    });
                return deffered.promise()
            },
            _setValueByIndex: function() {
                var index = this.option("selectedIndex"),
                    $items = this._itemElements();
                if (index < 0 || index >= $items.length) {
                    this.option("value", null);
                    return
                }
                var itemElement = this._selectedItemElement(index),
                    itemData = this._getItemData(itemElement);
                this.option("value", this._getItemValue(itemData))
            },
            _getItemValue: function(item) {
                return !!this._valueGetter ? this._valueGetter(item) : item.text
            },
            _renderSelectedIndex: function(index) {
                var $radioButtons = this._itemElements();
                $radioButtons.removeClass(RADIO_BUTTON_CHECKED_CLASS);
                if (index >= 0 && index < $radioButtons.length)
                    $radioButtons.eq(index).addClass(RADIO_BUTTON_CHECKED_CLASS)
            },
            _createItemByRenderer: function(itemRenderer, renderArgs) {
                var $itemElement = this.callBase.apply(this, arguments);
                this._renderInput($itemElement, renderArgs.item);
                return $itemElement
            },
            _createItemByTemplate: function(itemTemplate, renderArgs) {
                var $itemElement = this.callBase.apply(this, arguments);
                this._renderInput($itemElement, renderArgs.item);
                return $itemElement
            },
            _renderInput: function($element, item) {
                if (item.html)
                    return;
                var $radio = $("<div>").addClass(RADIO_BUTTON_ICON_CLASS),
                    $radioContainer = $("<div>").append($radio).addClass(RADIO_VALUE_CONTAINER_CLASS);
                $element.prepend($radioContainer)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"value":
                        this._setIndexByValue(value);
                        break;
                    case"selectedIndex":
                        this.callBase.apply(this, arguments);
                        this._setValueByIndex();
                        break;
                    case"layout":
                        this._renderLayout();
                        this._updateContentSize();
                        break;
                    case"valueExpr":
                        this._compileValueGetter();
                        this._setValueByIndex();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.tabs.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            TABS_CLASS = "dx-tabs",
            TABS_WRAPPER_CLASS = "dx-indent-wrapper",
            TABS_ITEM_CLASS = "dx-tab",
            TABS_ITEM_SELECTOR = ".dx-tab",
            TABS_ITEM_SELECTED_CLASS = "dx-tab-selected",
            TABS_ITEM_TEXT_CLASS = "dx-tab-text",
            ICON_CLASS = "dx-icon",
            TABS_ITEM_DATA_KEY = "dxTabData",
            FEEDBACK_HIDE_TIMEOUT = 100,
            ACTIVE_STATE_CLASS = "dx-state-active";
        DX.registerComponent("dxTabs", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: TABS_ITEM_SELECTOR,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({hoverStateEnabled: true})
            },
            _init: function() {
                this.callBase();
                this._feedbackHideTimeout = FEEDBACK_HIDE_TIMEOUT
            },
            _itemClass: function() {
                return TABS_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TABS_ITEM_DATA_KEY
            },
            _itemRenderDefault: function(item, index, itemElement) {
                this.callBase(item, index, itemElement);
                if (item.html)
                    return;
                var text = item.text,
                    icon = item.icon,
                    iconSrc = item.iconSrc,
                    iconElement;
                if (text)
                    itemElement.wrapInner($("<span />").addClass(TABS_ITEM_TEXT_CLASS));
                if (icon)
                    iconElement = $("<span />").addClass(ICON_CLASS + "-" + icon);
                else if (iconSrc)
                    iconElement = $("<img />").attr("src", iconSrc);
                if (iconElement)
                    iconElement.addClass(ICON_CLASS).prependTo(itemElement)
            },
            _render: function() {
                this.callBase();
                var $element = this._element();
                $element.addClass(TABS_CLASS);
                this._renderWrapper();
                $element.addClass(ACTIVE_STATE_CLASS).removeClass(ACTIVE_STATE_CLASS)
            },
            _renderWrapper: function() {
                this._element().wrapInner($("<div />").addClass(TABS_WRAPPER_CLASS))
            },
            _renderSelectedIndex: function(current, previous) {
                var $tabs = this._itemElements();
                if (previous >= 0)
                    $tabs.eq(previous).removeClass(TABS_ITEM_SELECTED_CLASS);
                if (current >= 0)
                    $tabs.eq(current).addClass(TABS_ITEM_SELECTED_CLASS)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.navBar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            NAVBAR_CLASS = "dx-navbar",
            NABAR_ITEM_CLASS = "dx-nav-item",
            NAVBAR_ITEM_CONTENT_CLASS = "dx-nav-item-content",
            NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge";
        DX.registerComponent("dxNavBar", ui.dxTabs.inherit({
            _render: function() {
                this.callBase();
                this._element().addClass(NAVBAR_CLASS)
            },
            _postprocessRenderItem: function(args) {
                var $itemElement = args.itemElement,
                    itemData = args.itemData,
                    badge = itemData.badge;
                if (badge)
                    $("<div>").addClass(NAVBAR_ITEM_BADGE_CLASS).text(badge).appendTo($itemElement);
                $itemElement.addClass(NABAR_ITEM_CLASS);
                $itemElement.wrapInner($("<div>").addClass(NAVBAR_ITEM_CONTENT_CLASS));
                if (!itemData.icon && !itemData.iconSrc)
                    $itemElement.addClass("dx-navbar-text-item")
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.toolbar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator;
        var TOOLBAR_CLASS = "dx-toolbar",
            TOOLBAR_BOTTOM_CLASS = "dx-toolbar-bottom",
            TOOLBAR_MINI_CLASS = "dx-toolbar-mini",
            TOOLBAR_ITEM_CLASS = "dx-toolbar-item",
            TOOLBAR_LABEL_CLASS = "dx-toolbar-label",
            TOOLBAR_BUTTON_CLASS = "dx-toolbar-button",
            TOOLBAR_MENU_CONTAINER_CLASS = "dx-toolbar-menu-container",
            TOOLBAR_MENU_BUTTON_CLASS = "dx-toolbar-menu-button",
            TOOLBAR_ITEMS_CONTAINER_CLASS = "dx-toolbar-items-container",
            TOOLBAR_LABEL_SELECTOR = "." + TOOLBAR_LABEL_CLASS,
            TOOLBAR_ITEM_DATA_KEY = "dxToolbarItemDataKey",
            SUBMENU_SWIPE_EASING = "easeOutCubic",
            SUBMENU_HIDE_DURATION = 200,
            SUBMENU_SHOW_DURATION = 400;
        var slideSubmenu = function($element, position, isShowAnimation) {
                var duration = isShowAnimation ? SUBMENU_SHOW_DURATION : SUBMENU_HIDE_DURATION;
                fx.animate($element, {
                    type: "slide",
                    to: {top: position},
                    easing: SUBMENU_SWIPE_EASING,
                    duration: duration
                })
            };
        DX.registerComponent("dxToolbar", ui.CollectionContainerWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    menuItemRender: null,
                    menuItemTemplate: "item",
                    submenuType: "dxDropDownMenu",
                    renderAs: "topToolbar"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: [{platform: "ios"}, {platform: "ios7"}],
                            options: {submenuType: "dxActionSheet"}
                        }, {
                            device: {platform: "android"},
                            options: {submenuType: "dxDropDownMenu"}
                        }, {
                            device: {platform: "win8"},
                            options: {submenuType: "dxList"}
                        }])
            },
            _itemContainer: function() {
                return this._$toolbarItemsContainer.find([".dx-toolbar-before", ".dx-toolbar-center", ".dx-toolbar-after"].join(","))
            },
            _itemClass: function() {
                return TOOLBAR_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TOOLBAR_ITEM_DATA_KEY
            },
            _itemRenderDefault: function(item, index, itemElement) {
                this.callBase(item, index, itemElement);
                var widget = item.widget;
                if (widget) {
                    var widgetElement = $("<div>").appendTo(itemElement),
                        widgetName = DX.inflector.camelize("dx-" + widget),
                        options = item.options || {};
                    widgetElement[widgetName](options)
                }
                else if (item.text)
                    itemElement.wrapInner("<div>")
            },
            _dimensionChanged: function() {
                if (this._menu)
                    this._toggleMenuVisibility(false, true);
                this._arrangeTitle()
            },
            _render: function() {
                this._renderToolbar();
                this._renderSections();
                this.callBase();
                this._renderMenu();
                this._arrangeTitle()
            },
            _renderToolbar: function() {
                this._element().addClass(TOOLBAR_CLASS).toggleClass(TOOLBAR_BOTTOM_CLASS, this.option("renderAs") === "bottomToolbar");
                this._$toolbarItemsContainer = $("<div>").appendTo(this._element());
                this._$toolbarItemsContainer.addClass(TOOLBAR_ITEMS_CONTAINER_CLASS)
            },
            _renderSections: function() {
                var $container = this._$toolbarItemsContainer,
                    that = this;
                $.each(["before", "center", "after"], function() {
                    var sectionClass = "dx-toolbar-" + this,
                        $section = $container.find("." + sectionClass);
                    if (!$section.length)
                        that["_$" + this + "Section"] = $section = $("<div>").addClass(sectionClass).appendTo($container)
                })
            },
            _arrangeTitle: function() {
                if (this._$element.is(":hidden")) {
                    this._titleUpdateIsNeeded = true;
                    return
                }
                this._titleUpdateIsNeeded = false;
                var $container = this._$toolbarItemsContainer,
                    $centerSection = this._$centerSection,
                    $label = $centerSection.children(TOOLBAR_LABEL_SELECTOR).eq(0);
                if ($label.length === 0)
                    return;
                var containerWidth = $container.width(),
                    beforeWidth = this._$beforeSection.outerWidth(),
                    afterWidth = this._$afterSection.outerWidth();
                var elemsAtCenterWidth = 10;
                $centerSection.children().not(TOOLBAR_LABEL_SELECTOR).each(function() {
                    elemsAtCenterWidth += $(this).outerWidth()
                });
                var maxLabelWidth = containerWidth - beforeWidth - afterWidth - elemsAtCenterWidth;
                var labelLongerThanMax = $label.width() > maxLabelWidth;
                $centerSection.css({
                    marginLeft: labelLongerThanMax ? beforeWidth : "",
                    marginRight: labelLongerThanMax ? afterWidth : ""
                });
                $label.css("max-width", maxLabelWidth)
            },
            _renderItem: function(index, item) {
                if (item.align)
                    utils.logger.warn("dxToolbar.items.align is deprecated. Please use dxToolbar.items.location instead.");
                var align = item.location || item.align || "center";
                if (align === "left") {
                    align = "before";
                    utils.logger.warn("dxToolbar.items.location: value 'left' is deprecated. Please use 'before' instead.")
                }
                else if (align === "right") {
                    align = "after";
                    utils.logger.warn("dxToolbar.items.location: value 'right' is deprecated. Please use 'after' instead.")
                }
                var container = this._$toolbarItemsContainer.find(".dx-toolbar-" + align);
                var itemElement = this.callBase(index, item, container);
                itemElement.addClass(TOOLBAR_BUTTON_CLASS);
                if (item.text)
                    itemElement.addClass(TOOLBAR_LABEL_CLASS).removeClass(TOOLBAR_BUTTON_CLASS);
                return itemElement
            },
            _hasVisibleMenuItems: function() {
                var menuItems = this._getMenuItems(),
                    result = false;
                var optionGetter = DevExpress.data.utils.compileGetter("visible");
                $.each(menuItems, function(index, item) {
                    var itemVisible = optionGetter(item, {functionsAsIs: true});
                    if (itemVisible !== false)
                        result = true
                });
                return result
            },
            _getToolbarItems: function() {
                return $.grep(this.option("items") || [], function(item) {
                        return item.location !== "menu"
                    })
            },
            _getMenuItems: function() {
                return $.grep(this.option("items") || [], function(item) {
                        return item.location === "menu"
                    })
            },
            _renderContentImpl: function() {
                var items = this._getToolbarItems();
                this._element().toggleClass(TOOLBAR_MINI_CLASS, items.length === 0);
                if (this._renderedItemsCount)
                    this._renderItems(items.slice(this._renderedItemsCount));
                else
                    this._renderItems(items)
            },
            _renderMenu: function() {
                var that = this,
                    itemClickAction = this._createActionByOption("itemClickAction");
                var options = {
                        itemRender: this.option("menuItemRender"),
                        itemTemplate: this.option("menuItemTemplate"),
                        itemClickAction: function(e) {
                            that._toggleMenuVisibility(false, true);
                            itemClickAction(e)
                        },
                        rtlEnabled: this.option("rtlEnabled")
                    };
                this._menuType = this.option("submenuType");
                if (this._menuType === "dxList" && this.option("renderAs") === "topToolbar")
                    this._menuType = "dxDropDownMenu";
                switch (this._menuType) {
                    case"dxActionSheet":
                        this._renderActionSheet(options);
                        break;
                    case"dxDropDownMenu":
                        this._renderDropDown(options);
                        break;
                    case"dxList":
                        this._renderList(options);
                        break
                }
            },
            _renderMenuButton: function(options) {
                var buttonOptions = $.extend({clickAction: $.proxy(this._handleMenuButtonClick, this)}, options);
                this._renderMenuButtonContainer();
                this._$button = $("<div>").appendTo(this._$menuButtonContainer).addClass(TOOLBAR_MENU_BUTTON_CLASS).dxButton(buttonOptions)
            },
            _renderMenuButtonContainer: function() {
                var $afterSection = this._$afterSection;
                this._$menuButtonContainer = $("<div>").appendTo($afterSection).addClass(TOOLBAR_BUTTON_CLASS).addClass(TOOLBAR_MENU_CONTAINER_CLASS)
            },
            _renderDropDown: function(options) {
                if (!this._hasVisibleMenuItems())
                    return;
                this._renderMenuButtonContainer();
                this._menu = $("<div>").appendTo(this._$menuButtonContainer).dxDropDownMenu(options).dxDropDownMenu("instance");
                this._renderMenuItems()
            },
            _renderActionSheet: function(options) {
                if (!this._hasVisibleMenuItems())
                    return;
                this._renderMenuButton({icon: "overflow"});
                var actionSheetOptions = $.extend({
                        target: this._$button,
                        showTitle: false
                    }, options);
                this._menu = $("<div>").appendTo(this._element()).dxActionSheet(actionSheetOptions).dxActionSheet("instance");
                this._renderMenuItems()
            },
            _renderList: function(options) {
                this._renderMenuButton({
                    activeStateEnabled: false,
                    text: "..."
                });
                var listOptions = $.extend({
                        width: "100%",
                        indicateLoading: false
                    }, options);
                this._renderListOverlay();
                this._renderContainerSwipe();
                if (this._hasVisibleMenuItems()) {
                    this._menu = $("<div>").appendTo(this._listOverlay.content()).dxList(listOptions).dxList("instance");
                    this._renderMenuItems()
                }
                this._changeListVisible(this.option("visible"))
            },
            _renderMenuItems: function() {
                this._menu.option("items", this._getMenuItems())
            },
            _getListHeight: function() {
                var listHeight = this._listOverlay.content().find(".dx-list").height(),
                    semiHiddenHeight = this._$toolbarItemsContainer.height() - this._element().height();
                return listHeight + semiHiddenHeight
            },
            _renderListOverlay: function() {
                var element = this._element();
                this._listOverlay = $("<div>").appendTo(element).dxOverlay({
                    targetContainer: false,
                    deferRendering: false,
                    shading: false,
                    height: "auto",
                    width: "100%",
                    showTitle: false,
                    closeOnOutsideClick: $.proxy(this._handleListOutsideClick, this),
                    position: null,
                    animation: null,
                    hideTopOverlayHandler: null
                }).dxOverlay("instance")
            },
            _hideTopOverlayHandler: function() {
                this._toggleMenuVisibility(false, true)
            },
            _toggleHideTopOverlayCallback: function() {
                if (this._closeCallback)
                    DX.hideTopOverlayCallback.remove(this._closeCallback);
                if (this._menuShown) {
                    this._closeCallback = $.proxy(this._hideTopOverlayHandler, this);
                    DX.hideTopOverlayCallback.add(this._closeCallback)
                }
            },
            _renderContainerSwipe: function() {
                this._$toolbarItemsContainer.appendTo(this._listOverlay.content()).dxSwipeable({
                    elastic: false,
                    startAction: $.proxy(this._handleSwipeStart, this),
                    updateAction: $.proxy(this._handleSwipeUpdate, this),
                    endAction: $.proxy(this._handleSwipeEnd, this),
                    itemSizeFunc: $.proxy(this._getListHeight, this),
                    direction: "vertical"
                })
            },
            _handleListOutsideClick: function(e) {
                if (!$(e.target).closest(this._listOverlay.content()).length)
                    this._toggleMenuVisibility(false, true)
            },
            _calculatePixelOffset: function(offset) {
                offset = (offset || 0) - 1;
                var maxOffset = this._getListHeight();
                return offset * maxOffset
            },
            _handleSwipeStart: function(e) {
                e.jQueryEvent.maxTopOffset = this._menuShown ? 0 : 1;
                e.jQueryEvent.maxBottomOffset = this._menuShown ? 1 : 0
            },
            _handleSwipeUpdate: function(e) {
                var offset = this._menuShown ? e.jQueryEvent.offset : 1 + e.jQueryEvent.offset;
                this._renderMenuPosition(offset, false)
            },
            _handleSwipeEnd: function(e) {
                var targetOffset = e.jQueryEvent.targetOffset;
                targetOffset -= this._menuShown - 1;
                this._toggleMenuVisibility(targetOffset === 0, true)
            },
            _renderMenuPosition: function(offset, animate) {
                var pos = this._calculatePixelOffset(offset),
                    element = this._listOverlay.content();
                if (animate)
                    slideSubmenu(element, pos, this._menuShown);
                else
                    translator.move(element, {top: pos})
            },
            _handleMenuButtonClick: function() {
                this._toggleMenuVisibility(!this._menuShown, true)
            },
            _toggleMenuVisibility: function(visible, animate) {
                this._menuShown = visible;
                switch (this._menuType) {
                    case"dxList":
                        this._toggleHideTopOverlayCallback();
                        this._renderMenuPosition(this._menuShown ? 0 : 1, animate);
                        break;
                    case"dxActionSheet":
                        this._menu.toggle(this._menuShown);
                        this._menuShown = false;
                        break
                }
            },
            _renderEmptyMessage: $.noop,
            _clean: function() {
                this._$toolbarItemsContainer.children().empty();
                this._element().empty()
            },
            _changeMenuOption: function(name, value) {
                if (this._menu)
                    this._menu.option(name, value)
            },
            _changeListVisible: function(value) {
                if (this._listOverlay) {
                    this._listOverlay.option("visible", value);
                    this._toggleMenuVisibility(false, false)
                }
            },
            _visibilityChanged: function(visible) {
                if (visible && this._titleUpdateIsNeeded)
                    this._arrangeTitle()
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"renderAs":
                    case"submenuType":
                        this._invalidate();
                        break;
                    case"visible":
                        this._changeListVisible(value);
                        this.callBase.apply(this, arguments);
                        break;
                    case"menuItemRender":
                        this._changeMenuOption("itemRender", value);
                        break;
                    case"menuItemTemplate":
                        this._changeMenuOption("itemTemplate", value);
                        break;
                    case"itemClickAction":
                        this._changeMenuOption(name, value);
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var LIST_CLASS = "dx-list",
            LIST_ITEM_CLASS = "dx-list-item",
            LIST_ITEM_SELECTOR = "." + LIST_ITEM_CLASS,
            LIST_GROUP_CLASS = "dx-list-group",
            LIST_GROUP_HEADER_CLASS = "dx-list-group-header",
            LIST_HAS_NEXT_CLASS = "dx-has-next",
            LIST_NEXT_BUTTON_CLASS = "dx-list-next-button",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            LIST_FEEDBACK_SHOW_TIMEOUT = 70;
        DX.registerComponent("dxList", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: LIST_ITEM_SELECTOR,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    pullRefreshEnabled: false,
                    autoPagingEnabled: true,
                    scrollingEnabled: true,
                    showScrollbar: true,
                    useNativeScrolling: true,
                    pullingDownText: Globalize.localize("dxList-pullingDownText"),
                    pulledDownText: Globalize.localize("dxList-pulledDownText"),
                    refreshingText: Globalize.localize("dxList-refreshingText"),
                    pageLoadingText: Globalize.localize("dxList-pageLoadingText"),
                    scrollAction: null,
                    pullRefreshAction: null,
                    pageLoadingAction: null,
                    showNextButton: false,
                    nextButtonText: Globalize.localize("dxList-nextButtonText"),
                    itemSwipeAction: null,
                    grouped: false,
                    groupTemplate: "group",
                    groupRender: null,
                    indicateLoading: true,
                    hoverStateEnabled: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function(device) {
                                return !DX.support.nativeScrolling
                            },
                            options: {useNativeScrolling: false}
                        }, {
                            device: function(device) {
                                return !DX.support.nativeScrolling && !DX.devices.isSimulator() && DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {
                                showScrollbar: "onHover",
                                showNextButton: true,
                                autoPagingEnabled: false
                            }
                        }])
            },
            _itemClass: function() {
                return LIST_ITEM_CLASS
            },
            _itemDataKey: function() {
                return LIST_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$container
            },
            _allowDinamicItemsAppend: function() {
                return true
            },
            _init: function() {
                this.callBase();
                this._$container = this._element();
                this._initScrollView();
                this._feedbackShowTimeout = LIST_FEEDBACK_SHOW_TIMEOUT
            },
            _dataSourceOptions: function() {
                return $.extend(this.callBase(), {paginate: true})
            },
            _initScrollView: function() {
                var scrollingEnabled = this.option("scrollingEnabled"),
                    pullRefreshEnabled = scrollingEnabled && this.option("pullRefreshEnabled"),
                    autoPagingEnabled = scrollingEnabled && this.option("autoPagingEnabled") && !!this._dataSource;
                var $scrollView = this._element().dxScrollView({
                        rtlEnabled: this.option("rtlEnabled"),
                        disabled: this.option("disabled") || !scrollingEnabled,
                        scrollAction: $.proxy(this._handleScroll, this),
                        pullDownAction: pullRefreshEnabled ? $.proxy(this._handlePullDown, this) : null,
                        reachBottomAction: autoPagingEnabled ? $.proxy(this._handleScrollBottom, this) : null,
                        showScrollbar: this.option("showScrollbar"),
                        useNative: this.option("useNativeScrolling"),
                        pullingDownText: this.option("pullingDownText"),
                        pulledDownText: this.option("pulledDownText"),
                        refreshingText: this.option("refreshingText"),
                        reachBottomText: this.option("pageLoadingText")
                    });
                this._scrollView = $scrollView.dxScrollView("instance");
                this._scrollView.toggleLoading(autoPagingEnabled);
                this._$container = this._scrollView.content();
                this._createScrollViewActions();
                this._afterItemsRendered()
            },
            _createScrollViewActions: function() {
                this._scrollAction = this._createActionByOption("scrollAction", {excludeValidators: ["gesture"]});
                this._pullRefreshAction = this._createActionByOption("pullRefreshAction", {excludeValidators: ["gesture"]});
                this._pageLoadingAction = this._createActionByOption("pageLoadingAction", {excludeValidators: ["gesture"]})
            },
            _handleScroll: function(e) {
                this._scrollAction(e)
            },
            _afterItemsRendered: function(tryLoadMore) {
                var isLastPage = this._isLastPage(),
                    allDataLoaded = !tryLoadMore || isLastPage,
                    autoPagingEnabled = this.option("autoPagingEnabled"),
                    stopLoading = !autoPagingEnabled || allDataLoaded,
                    scrollViewIsFull = this._scrollViewIsFull();
                if (stopLoading || scrollViewIsFull) {
                    this._scrollView.release(stopLoading);
                    this._loadIndicationSuppressed = false;
                    if (this._shouldRenderNextButton() && this._dataSource.isLoaded())
                        this._toggleNextButton(!allDataLoaded)
                }
                else
                    this._infiniteDataLoading()
            },
            _shouldRenderNextButton: function() {
                return this.option("showNextButton") && this._dataSource
            },
            _handleDataSourceLoadingChanged: function(isLoading) {
                if (this._loadIndicationSuppressed)
                    return;
                if (isLoading && this.option("indicateLoading"))
                    this._showLoadingIndicatorTimer = setTimeout($.proxy(function() {
                        this._scrollView && this._scrollView.startLoading()
                    }, this));
                else {
                    clearTimeout(this._showLoadingIndicatorTimer);
                    this._scrollView && this._scrollView.finishLoading()
                }
            },
            _hideLoadingIfLoadIndicationOff: function() {
                if (!this.option("indicateLoading"))
                    this._handleDataSourceLoadingChanged(false)
            },
            _suppressLoadingIndication: function() {
                this._loadIndicationSuppressed = true
            },
            _isLastPage: function() {
                return !this._dataSource || this._dataSource.isLastPage()
            },
            _scrollViewIsFull: function() {
                return !this._scrollView || this._scrollView.isFull()
            },
            _handlePullDown: function(e) {
                this._pullRefreshAction(e);
                if (this._dataSource && !this._dataSource.isLoading()) {
                    this._dataSource.pageIndex(0);
                    this._dataSource.load()
                }
                else
                    this._afterItemsRendered()
            },
            _infiniteDataLoading: function() {
                var dataSource = this._dataSource;
                if (!this._scrollViewIsFull() && dataSource && !dataSource.isLoading() && !this._isLastPage())
                    this._loadNextPageTimer = setTimeout($.proxy(this._loadNextPage, this))
            },
            _handleScrollBottom: function(e) {
                this._pageLoadingAction(e);
                var dataSource = this._dataSource;
                if (dataSource && !dataSource.isLoading())
                    this._loadNextPage();
                else
                    this._afterItemsRendered()
            },
            _loadNextPage: function() {
                var dataSource = this._dataSource;
                this._expectNextPageLoading();
                dataSource.pageIndex(1 + dataSource.pageIndex());
                return dataSource.load()
            },
            _renderItems: function(items) {
                if (this.option("grouped")) {
                    $.each(items, $.proxy(this._renderGroup, this));
                    this._renderEmptyMessage()
                }
                else
                    this.callBase.apply(this, arguments);
                this._afterItemsRendered(true)
            },
            _handleDataSourceLoadError: function() {
                this.callBase.apply(this, arguments);
                if (this._initialized)
                    this._afterItemsRendered()
            },
            _render: function() {
                this._element().addClass(LIST_CLASS);
                this.callBase()
            },
            _postprocessRenderItem: function(args) {
                if (this.option("itemSwipeAction"))
                    this._attachSwipeEvent($(args.itemElement))
            },
            _attachSwipeEvent: function($itemElement) {
                var endEventName = events.addNamespace("dxswipeend", this.NAME);
                $itemElement.on(endEventName, $.proxy(this._handleItemSwipeEnd, this))
            },
            _handleItemSwipeEnd: function(e) {
                this._handleItemJQueryEvent(e, "itemSwipeAction", {direction: e.offset < 0 ? "left" : "right"}, {excludeValidators: ["gesture"]})
            },
            _handleNextButton: function() {
                var source = this._dataSource;
                if (source && !source.isLoading()) {
                    this._scrollView.toggleLoading(true);
                    this._$nextButton.detach();
                    this._suppressLoadingIndication();
                    this._loadNextPage()
                }
            },
            _groupRenderDefault: function(group) {
                return String(group.key || group)
            },
            _renderGroup: function(index, group) {
                var that = this;
                var groupElement = $("<div>").addClass(LIST_GROUP_CLASS).appendTo(that._itemContainer());
                var groupRenderer = that.option("groupRender"),
                    groupTemplateName = that.option("groupTemplate"),
                    groupTemplate = that._getTemplate(group.template || groupTemplateName, index, group),
                    groupHeaderElement,
                    renderArgs = {
                        index: index,
                        group: group,
                        container: groupElement
                    };
                if (groupRenderer)
                    groupHeaderElement = that._createGroupByRenderer(groupRenderer, renderArgs);
                else if (groupTemplate)
                    groupHeaderElement = that._createGroupByTemplate(groupTemplate, renderArgs);
                else
                    groupHeaderElement = that._createGroupByRenderer(that._groupRenderDefault, renderArgs);
                groupHeaderElement.addClass(LIST_GROUP_HEADER_CLASS);
                this._renderingGroupIndex = index;
                $.each(group.items || [], function(index, item) {
                    that._renderItem(index, item, groupElement)
                })
            },
            _createGroupByRenderer: function(groupRenderer, renderArgs) {
                var groupElement = $("<div>").appendTo(renderArgs.container);
                var rendererResult = groupRenderer(renderArgs.group, renderArgs.index, groupElement);
                if (rendererResult && groupElement[0] !== rendererResult[0])
                    groupElement.append(rendererResult);
                return groupElement
            },
            _createGroupByTemplate: function(groupTemplate, renderArgs) {
                return groupTemplate.render(renderArgs.container, renderArgs.group)
            },
            _clean: function() {
                if (this._$nextButton) {
                    this._$nextButton.remove();
                    this._$nextButton = null
                }
                this.callBase.apply(this, arguments)
            },
            _dispose: function() {
                clearTimeout(this._holdTimer);
                clearTimeout(this._loadNextPageTimer);
                clearTimeout(this._showLoadingIndicatorTimer);
                this.callBase()
            },
            _toggleDisabledState: function(value) {
                this.callBase(value);
                this._scrollView.option("disabled", value || !this.option("scrollingEnabled"))
            },
            _toggleNextButton: function(value) {
                var dataSource = this._dataSource,
                    $nextButton = this._getNextButton();
                this._element().toggleClass(LIST_HAS_NEXT_CLASS, value);
                if (value && dataSource && dataSource.isLoaded())
                    $nextButton.appendTo(this._itemContainer());
                if (!value)
                    $nextButton.detach()
            },
            _getNextButton: function() {
                if (!this._$nextButton)
                    this._$nextButton = this._createNextButton();
                return this._$nextButton
            },
            _createNextButton: function() {
                var $result = $("<div>").addClass(LIST_NEXT_BUTTON_CLASS);
                $result.append($("<div>").dxButton({
                    text: this.option("nextButtonText"),
                    clickAction: $.proxy(this._handleNextButton, this)
                }));
                return $result
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"showNextButton":
                        this._toggleNextButton(value);
                        break;
                    case"dataSource":
                        this.callBase.apply(this, arguments);
                        this._initScrollView();
                        break;
                    case"pullingDownText":
                    case"pulledDownText":
                    case"refreshingText":
                    case"pageLoadingText":
                    case"useNativeScrolling":
                    case"showScrollbar":
                    case"scrollingEnabled":
                    case"pullRefreshEnabled":
                    case"autoPagingEnabled":
                        this._initScrollView();
                        break;
                    case"nextButtonText":
                    case"itemSwipeAction":
                        this._invalidate();
                        break;
                    case"scrollAction":
                    case"pullRefreshAction":
                    case"pageLoadingAction":
                        this._createScrollViewActions();
                        this._invalidate();
                        break;
                    case"grouped":
                    case"groupTemplate":
                    case"groupRender":
                        this._invalidate();
                        break;
                    case"items":
                        this._invalidate();
                        break;
                    case"width":
                    case"height":
                        this.callBase.apply(this, arguments);
                        this._scrollView.update();
                        break;
                    case"indicateLoading":
                        this._hideLoadingIfLoadIndicationOff();
                        break;
                    case"visible":
                        this.callBase.apply(this, arguments);
                        this._scrollView.update();
                        break;
                    case"rtlEnabled":
                        this._initScrollView();
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            update: function() {
                utils.logger.warn("'update' method is deprecated since 14.1. Use the 'updateDimensions' method instead.");
                return this.updateDimensions.apply(this, arguments)
            },
            updateDimensions: function() {
                var that = this,
                    deferred = $.Deferred();
                if (that._scrollView)
                    that._scrollView.update().done(function() {
                        deferred.resolveWith(that)
                    });
                else
                    deferred.resolveWith(that);
                return deferred.promise()
            },
            refresh: function() {
                utils.logger.warn("'refresh' method is deprecated since 14.1. Use the 'reload' method instead.");
                return this.reload.apply(this, arguments)
            },
            reload: function() {
                this._scrollView.refresh()
            },
            scrollTop: function() {
                return this._scrollView.scrollOffset().top
            },
            clientHeight: function() {
                return this._scrollView.clientHeight()
            },
            scrollHeight: function() {
                return this._scrollView.scrollHeight()
            },
            scrollBy: function(distance) {
                this._scrollView.scrollBy(distance)
            },
            scrollTo: function(location) {
                this._scrollView.scrollTo(location)
            },
            scrollToItem: function(itemElement) {
                var $itemElement = $(itemElement);
                if (!$itemElement.length)
                    return;
                var itemPosition = $itemElement.position().top,
                    itemHeight = $itemElement.outerHeight(),
                    itemBottom = itemPosition + itemHeight,
                    scrollTop = this.scrollTop(),
                    clientHeight = this.clientHeight();
                if (scrollTop <= itemPosition && itemBottom <= scrollTop + clientHeight)
                    return;
                if (scrollTop > itemPosition)
                    this.scrollTo(itemPosition);
                else
                    this.scrollTo(itemPosition + itemHeight - clientHeight)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.strategies.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var ListEditStrategy = DX.Class.inherit({
                ctor: function(list) {
                    this._list = list
                },
                getNormalizedIndex: function(value) {
                    if (this._isNormalisedItemIndex(value))
                        return value;
                    if (this._isItemIndex(value))
                        return this._normalizeItemIndex(value);
                    return this._getNormalizedItemIndex(value)
                },
                getIndex: function(value) {
                    if (this._isNormalisedItemIndex(value))
                        return this._denormalizeItemIndex(value);
                    if (this._isItemIndex(value))
                        return value;
                    return this._denormalizeItemIndex(this._getNormalizedItemIndex(value))
                },
                getItemElement: function(value) {
                    if (this._isNormalisedItemIndex(value))
                        return this._getItemByNormalizedIndex(value);
                    if (this._isItemIndex(value))
                        return this._getItemByNormalizedIndex(this._normalizeItemIndex(value));
                    return $(value)
                },
                deleteItemAtIndex: DX.abstract,
                updateSelectionAfterDelete: DX.abstract,
                fetchSelectedItems: DX.abstract,
                selectedItemIndecies: DX.abstract,
                itemPlacementFunc: function(movingIndex, destinationIndex) {
                    return this._itemsFromSameParent(movingIndex, destinationIndex) && movingIndex < destinationIndex ? "after" : "before"
                },
                moveItemAtIndexToIndex: DX.abstract,
                getSelectedItemsAfterReorderItem: function() {
                    return this._list.option("selectedItems")
                },
                _isNormalisedItemIndex: function(index) {
                    return $.isNumeric(index)
                },
                _isItemIndex: DX.abstract,
                _getNormalizedItemIndex: DX.abstract,
                _normalizeItemIndex: DX.abstract,
                _denormalizeItemIndex: DX.abstract,
                _getItemByNormalizedIndex: DX.abstract,
                _itemsFromSameParent: DX.abstract
            });
        ui.PlainListEditStrategy = ListEditStrategy.inherit({
            deleteItemAtIndex: function(index) {
                this._list.option("items").splice(index, 1)
            },
            updateSelectionAfterDelete: function(fromIndex) {
                var selectedItemIndices = this._list._selectedItemIndices;
                $.each(selectedItemIndices, function(i, index) {
                    if (index > fromIndex)
                        selectedItemIndices[i] -= 1
                })
            },
            fetchSelectedItems: function(indecies) {
                indecies = indecies || this._list._selectedItemIndices;
                var items = this._list.option("items"),
                    selectedItems = [];
                $.each(indecies, function(_, index) {
                    selectedItems.push(items[index])
                });
                return selectedItems
            },
            selectedItemIndecies: function() {
                var selectedIndices = [],
                    items = this._list.option("items"),
                    selected = this._list.option("selectedItems");
                $.each(selected, function(_, selectedItem) {
                    var index = $.inArray(selectedItem, items);
                    if (index !== -1)
                        selectedIndices.push(index);
                    else
                        throw new Error("Item '" + selectedItem + "' you are trying to select does not exist");
                });
                return selectedIndices
            },
            moveItemAtIndexToIndex: function(movingIndex, destinationIndex) {
                var items = this._list.option("items"),
                    movedItemData = items[movingIndex];
                items.splice(movingIndex, 1);
                items.splice(destinationIndex, 0, movedItemData)
            },
            _isItemIndex: function(index) {
                return $.isNumeric(index)
            },
            _getNormalizedItemIndex: function(itemElement) {
                return this._list._itemElements().index(itemElement)
            },
            _normalizeItemIndex: function(index) {
                return index
            },
            _denormalizeItemIndex: function(index) {
                return index
            },
            _getItemByNormalizedIndex: function(index) {
                return this._list._itemElements().eq(index)
            },
            _itemsFromSameParent: function() {
                return true
            }
        });
        var LIST_ITEM_CLASS = "dx-list-item",
            LIST_GROUP_CLASS = "dx-list-group";
        var SELECTION_SHIFT = 20,
            SELECTION_MASK = 0x8FF;
        var combineIndex = function(indices) {
                return (indices.group << SELECTION_SHIFT) + indices.item
            };
        var splitIndex = function(combinedIndex) {
                return {
                        group: combinedIndex >> SELECTION_SHIFT,
                        item: combinedIndex & SELECTION_MASK
                    }
            };
        var createGroupSelection = function(group, selectedItems) {
                var groupItems = group.items,
                    groupSelection = {
                        key: group.key,
                        items: []
                    };
                $.each(selectedItems, function(_, itemIndex) {
                    groupSelection.items.push(groupItems[itemIndex])
                });
                return groupSelection
            };
        var groupByKey = function(groups, key) {
                var length = groups.length;
                for (var i = 0; i < length; i++)
                    if (groups[i].key === key)
                        return groups[i]
            };
        ui.GroupedListEditStrategy = ListEditStrategy.inherit({
            _groupElements: function() {
                return this._list._itemContainer().find("." + LIST_GROUP_CLASS)
            },
            _groupItemElements: function($group) {
                return $group.find("." + LIST_ITEM_CLASS)
            },
            deleteItemAtIndex: function(index) {
                var indices = splitIndex(index),
                    itemGroup = this._list.option("items")[indices.group].items;
                itemGroup.splice(indices.item, 1)
            },
            updateSelectionAfterDelete: function(fromIndex) {
                var deletedIndices = splitIndex(fromIndex),
                    selectedItemIndices = this._list._selectedItemIndices;
                $.each(selectedItemIndices, function(i, index) {
                    var indices = splitIndex(index);
                    if (indices.group === deletedIndices.group && indices.item > deletedIndices.item)
                        selectedItemIndices[i] -= 1
                })
            },
            fetchSelectedItems: function(indecies) {
                indecies = indecies || this._list._selectedItemIndices;
                var items = this._list.option("items"),
                    selectedItems = [];
                indecies.sort(function(a, b) {
                    return a - b
                });
                var currentGroupIndex = 0,
                    groupSelectedIndices = [];
                $.each(indecies, function(_, combinedIndex) {
                    var index = splitIndex(combinedIndex);
                    if (index.group !== currentGroupIndex && groupSelectedIndices.length) {
                        selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices));
                        groupSelectedIndices.length = 0
                    }
                    currentGroupIndex = index.group;
                    groupSelectedIndices.push(index.item)
                });
                if (groupSelectedIndices.length)
                    selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices));
                return selectedItems
            },
            selectedItemIndecies: function() {
                var selectedIndices = [],
                    items = this._list.option("items"),
                    selected = this._list.option("selectedItems");
                $.each(selected, function(_, selectionInGroup) {
                    var group = groupByKey(items, selectionInGroup.key),
                        groupIndex = $.inArray(group, items);
                    if (!group)
                        throw new Error("Group with key '" + selectionInGroup.key + "' in which you are trying to select items does not exist.");
                    $.each(selectionInGroup.items, function(_, selectedGroupItem) {
                        var itemIndex = $.inArray(selectedGroupItem, group.items);
                        if (itemIndex !== -1)
                            selectedIndices.push(combineIndex({
                                group: groupIndex,
                                item: itemIndex
                            }));
                        else
                            throw new Error("Item '" + selectedGroupItem + "' you are trying to select in group '" + selectionInGroup.key + "' does not exist");
                    })
                });
                return selectedIndices
            },
            moveItemAtIndexToIndex: function(movingIndex, destinationIndex) {
                var items = this._list.option("items"),
                    movingIndices = splitIndex(movingIndex),
                    destinationIndices = splitIndex(destinationIndex),
                    movingItemGroup = items[movingIndices.group].items,
                    destinationItemGroup = items[destinationIndices.group].items,
                    movedItemData = movingItemGroup[movingIndices.item];
                movingItemGroup.splice(movingIndices.item, 1);
                destinationItemGroup.splice(destinationIndices.item, 0, movedItemData)
            },
            getSelectedItemsAfterReorderItem: function(movingIndex, destinationIndex) {
                if (this._itemsFromSameParent(movingIndex, destinationIndex) || $.inArray(movingIndex, this._list._selectedItemIndices))
                    return this.callBase();
                var items = this._list.option("items"),
                    selectedItems = this._list.option("selectedItems"),
                    movingIndices = splitIndex(movingIndex),
                    destinationIndices = splitIndex(destinationIndex),
                    movingSelectedItemGroup = selectedItems[movingIndices.group].items,
                    destinationSelectedItemGroup = selectedItems[destinationIndices.group].items,
                    movedItemData = items[movingIndices.group].items[movingIndices.item],
                    movedItemSelectedIndex = $.inArray(movedItemData, movingSelectedItemGroup);
                movingSelectedItemGroup.splice(movedItemSelectedIndex, 1);
                destinationSelectedItemGroup.push(movedItemData);
                return selectedItems
            },
            _isItemIndex: function(index) {
                return $.isNumeric(index.group) && $.isNumeric(index.item)
            },
            _getNormalizedItemIndex: function(itemElement) {
                var $item = $(itemElement),
                    $group = $item.closest("." + LIST_GROUP_CLASS);
                return combineIndex({
                        group: this._groupElements().index($group),
                        item: this._groupItemElements($group).index($item)
                    })
            },
            _normalizeItemIndex: function(index) {
                return combineIndex(index)
            },
            _denormalizeItemIndex: function(index) {
                return splitIndex(index)
            },
            _getItemByNormalizedIndex: function(index) {
                var indices = splitIndex(index),
                    $group = this._groupElements().eq(indices.group);
                return this._groupItemElements($group).eq(indices.item)
            },
            _itemsFromSameParent: function(firstIndex, secondIndex) {
                return splitIndex(firstIndex).group === splitIndex(secondIndex).group
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorators.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            translator = DX.translator,
            fx = DX.fx,
            support = DX.support,
            utils = DX.utils;
        ui.ListEditDecoratorsRegistry = {};
        var registerDecorator = function(option, type, decoratorClass) {
                var decoratorsRegistry = ui.ListEditDecoratorsRegistry;
                var decoratorConfig = {};
                decoratorConfig[option] = decoratorsRegistry[option] ? decoratorsRegistry[option] : {};
                decoratorConfig[option][type] = decoratorClass;
                decoratorsRegistry = $.extend(decoratorsRegistry, decoratorConfig)
            };
        var LIST_ITEM_CONTENT_CLASS = "dx-list-item-content",
            LIST_ITEM_BAG_CONTAINER_CLASS = "dx-list-item-bag-container";
        var LIST_EDIT_DECORATOR = "dxListEditDecorator",
            SWIPE_START_EVENT_NAME = events.addNamespace("dxswipestart", LIST_EDIT_DECORATOR),
            SWIPE_UPDATE_EVENT_NAME = events.addNamespace("dxswipe", LIST_EDIT_DECORATOR),
            SWIPE_END_EVENT_NAME = events.addNamespace("dxswipeend", LIST_EDIT_DECORATOR),
            DRAG_START_EVENT_NAME = events.addNamespace("dxdragstart", LIST_EDIT_DECORATOR),
            DRAG_UPDATE_EVENT_NAME = events.addNamespace("dxdrag", LIST_EDIT_DECORATOR),
            DRAG_END_EVENT_NAME = events.addNamespace("dxdragend", LIST_EDIT_DECORATOR),
            POINTER_DOWN_EVENT_NAME = events.addNamespace("dxpointerdown", LIST_EDIT_DECORATOR),
            CLICK_EVENT_NAME = events.addNamespace("dxclick", LIST_EDIT_DECORATOR);
        var ListEditDecorator = DX.Class.inherit({
                ctor: function(list) {
                    this._list = list;
                    this._init()
                },
                _init: $.noop,
                _shouldHandleSwipe: false,
                _attachSwipeEvent: function(config) {
                    var swipeConfig = {itemSizeFunc: $.proxy(function() {
                                if (this._clearSwipeCache) {
                                    this._itemWidthCache = this._list._element().width();
                                    this._clearSwipeCache = false
                                }
                                return this._itemWidthCache
                            }, this)};
                    config.$itemElement.on(SWIPE_START_EVENT_NAME, swipeConfig, $.proxy(this._handleItemSwipeStart, this)).on(SWIPE_UPDATE_EVENT_NAME, $.proxy(this._handleItemSwipeUpdate, this)).on(SWIPE_END_EVENT_NAME, $.proxy(this._handleItemSwipeEnd, this))
                },
                _handleItemSwipeStart: function(e) {
                    var $itemElement = $(e.currentTarget);
                    if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *")) {
                        e.cancel = true;
                        return
                    }
                    this._handleSwipeStart($itemElement, e)
                },
                _handleItemSwipeUpdate: function(e) {
                    var $itemElement = $(e.currentTarget);
                    this._handleSwipeUpdate($itemElement, e)
                },
                _handleItemSwipeEnd: function(e) {
                    var $itemElement = $(e.currentTarget);
                    this._handleSwipeEnd($itemElement, e);
                    this._clearSwipeCache = true
                },
                beforeBag: $.noop,
                afterBag: $.noop,
                modifyElement: function(config) {
                    if (this._shouldHandleSwipe) {
                        this._attachSwipeEvent(config);
                        this._clearSwipeCache = true
                    }
                },
                handleClick: $.noop,
                handleHold: $.noop,
                _handleSwipeStart: $.noop,
                _handleSwipeUpdate: $.noop,
                _handleSwipeEnd: $.noop,
                dispose: $.noop
            });
        var MENU_POSITIONING_CLASS = "dx-list-menu-positioning";
        var MenuDecorator = ListEditDecorator.inherit({
                _menuEnabled: function() {
                    return !!this._menuItems().length
                },
                _menuItems: function() {
                    return this._list.option("editConfig.menuItems")
                },
                _deleteEnabled: function() {
                    return this._list.option("editConfig.deleteEnabled")
                },
                _fireMenuAction: function($itemElement, action) {
                    this._list._handleItemEventByHandler($itemElement, action)
                }
            });
        var SWITCHABLE_DELETE_READY_CLASS = "dx-list-switchable-delete-ready",
            SWITCHABLE_DELETE_TOP_SHIELD_CLASS = "dx-list-switchable-delete-top-shield",
            SWITCHABLE_DELETE_BOTTOM_SHIELD_CLASS = "dx-list-switchable-delete-bottom-shield",
            SWITCHABLE_DELETE_ITEM_CONTENT_SHIELD_CLASS = "dx-list-switchable-delete-item-content-shield";
        var SwitchableMenuDecorator = MenuDecorator.inherit({
                _init: function() {
                    this._$topShield = $("<div />").addClass(SWITCHABLE_DELETE_TOP_SHIELD_CLASS);
                    this._$bottomShield = $("<div />").addClass(SWITCHABLE_DELETE_BOTTOM_SHIELD_CLASS);
                    this._$itemContentShield = $("<div />").addClass(SWITCHABLE_DELETE_ITEM_CONTENT_SHIELD_CLASS);
                    this._$topShield.on(POINTER_DOWN_EVENT_NAME, $.proxy(this._cancelDeleteReadyItem, this));
                    this._$bottomShield.on(POINTER_DOWN_EVENT_NAME, $.proxy(this._cancelDeleteReadyItem, this));
                    this._list._element().append(this._$topShield.toggle(false)).append(this._$bottomShield.toggle(false));
                    if (this._animatePrepareDeleteReady === DX.abstract)
                        this._animatePrepareDeleteReady = function() {
                            return $.when().promise()
                        };
                    if (this._animateForgetDeleteReady === DX.abstract)
                        this._animateForgetDeleteReady = function() {
                            return $.when().promise()
                        };
                    this._list._element().on("dxpreparetodelete", ".dx-list-item", $.proxy(function(e) {
                        this._toggleDeleteReady($(e.currentTarget))
                    }, this))
                },
                handleClick: function($itemElement) {
                    return this._cancelDeleteReadyItem()
                },
                _cancelDeleteReadyItem: function() {
                    if (!this._$readyToDeleteItem)
                        return false;
                    this._cancelDelete(this._$readyToDeleteItem);
                    return true
                },
                _cancelDelete: function($itemElement) {
                    this._toggleDeleteReady($itemElement, false)
                },
                _toggleDeleteReady: function($itemElement, readyToDelete) {
                    if (readyToDelete === undefined)
                        readyToDelete = !this._isReadyToDelete($itemElement);
                    this._toggleShields($itemElement, readyToDelete);
                    this._toggleScrolling(readyToDelete);
                    this._cacheReadyToDeleteItem($itemElement, readyToDelete);
                    this._animateToggleDelete($itemElement, readyToDelete)
                },
                _isReadyToDelete: function($itemElement) {
                    return $itemElement.hasClass(SWITCHABLE_DELETE_READY_CLASS)
                },
                _toggleShields: function($itemElement, enabled) {
                    this._$topShield.toggle(enabled);
                    this._$bottomShield.toggle(enabled);
                    if (enabled)
                        this._updateShieldsHeight($itemElement);
                    this._toggleContentShield($itemElement, enabled)
                },
                _updateShieldsHeight: function($itemElement) {
                    var $list = this._list._element(),
                        listTopOffset = $list.offset().top,
                        listHeight = $list.outerHeight(),
                        itemTopOffset = $itemElement.offset().top,
                        itemHeight = $itemElement.outerHeight(),
                        dirtyTopShieldHeight = itemTopOffset - listTopOffset,
                        dirtyBottomShieldHeight = listHeight - itemHeight - dirtyTopShieldHeight;
                    this._$topShield.height(Math.max(dirtyTopShieldHeight, 0));
                    this._$bottomShield.height(Math.max(dirtyBottomShieldHeight, 0))
                },
                _toggleContentShield: function($itemElement, enabled) {
                    if (enabled)
                        $itemElement.find("." + LIST_ITEM_CONTENT_CLASS).append(this._$itemContentShield);
                    else
                        this._$itemContentShield.detach()
                },
                _toggleScrolling: function(readyToDelete) {
                    var scrollView = this._list._element().dxScrollView("instance");
                    if (readyToDelete) {
                        this._scrollViewDisabled = scrollView.option("disabled");
                        scrollView.option("disabled", true)
                    }
                    else
                        scrollView.option("disabled", this._scrollViewDisabled)
                },
                _cacheReadyToDeleteItem: function($itemElement, cache) {
                    if (cache)
                        this._$readyToDeleteItem = $itemElement;
                    else
                        delete this._$readyToDeleteItem
                },
                _animateToggleDelete: function($itemElement, readyToDelete) {
                    if (readyToDelete) {
                        this._enablePositioning($itemElement);
                        this._prepareDeleteReady($itemElement);
                        this._animatePrepareDeleteReady($itemElement)
                    }
                    else {
                        this._forgetDeleteReady($itemElement);
                        this._animateForgetDeleteReady($itemElement).done($.proxy(this._disablePositioning, this, $itemElement))
                    }
                },
                _enablePositioning: function($itemElement) {
                    $itemElement.addClass(MENU_POSITIONING_CLASS)
                },
                _disablePositioning: function($itemElement) {
                    $itemElement.removeClass(MENU_POSITIONING_CLASS)
                },
                _prepareDeleteReady: function($itemElement) {
                    $itemElement.addClass(SWITCHABLE_DELETE_READY_CLASS)
                },
                _forgetDeleteReady: function($itemElement) {
                    $itemElement.removeClass(SWITCHABLE_DELETE_READY_CLASS)
                },
                _animatePrepareDeleteReady: DX.abstract,
                _animateForgetDeleteReady: DX.abstract,
                _deleteItem: function($itemElement) {
                    $itemElement = $itemElement || this._$readyToDeleteItem;
                    if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                        return;
                    this._cancelDelete($itemElement);
                    this._list.deleteItem($itemElement)
                },
                _isRtlEnabled: function() {
                    return this._list.option("rtlEnabled")
                },
                dispose: function() {
                    if (this._$topShield)
                        this._$topShield.remove();
                    if (this._$bottomShield)
                        this._$bottomShield.remove();
                    this.callBase.apply(this, arguments)
                }
            });
        registerDecorator("menu", "_switchable", SwitchableMenuDecorator);
        var SWITCHABLE_DELETE_BUTTON_CONTAINER_CLASS = "dx-list-switchable-delete-button-container",
            SWITCHABLE_DELETE_BUTTON_WRAPPER_CLASS = "dx-list-switchable-delete-button-wrapper",
            SWITCHABLE_DELETE_BUTTON_INNER_WRAPPER_CLASS = "dx-list-switchable-delete-button-inner-wrapper",
            SWITCHABLE_DELETE_BUTTON_CLASS = "dx-list-switchable-delete-button",
            SWITCHABLE_DELETE_MENU_CLASS = "dx-list-switchable-delete-menu",
            SWITCHABLE_DELETE_BUTTON_ANIMATION_DURATION = 200;
        var SwitchableButtonDeleteDecorator = SwitchableMenuDecorator.inherit({
                _init: function() {
                    this.callBase.apply(this, arguments);
                    var $buttonContainer = $("<div >").addClass(SWITCHABLE_DELETE_BUTTON_CONTAINER_CLASS),
                        $buttonWrapper = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_WRAPPER_CLASS),
                        $buttonInnerWrapper = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_INNER_WRAPPER_CLASS),
                        $button = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_CLASS);
                    $button.dxButton({
                        text: Globalize.localize("dxListEditDecorator-delete"),
                        type: "danger",
                        clickAction: $.proxy(function(e) {
                            this._deleteItem();
                            e.jQueryEvent.stopPropagation()
                        }, this)
                    });
                    $buttonContainer.append($buttonWrapper);
                    $buttonWrapper.append($buttonInnerWrapper);
                    $buttonInnerWrapper.append($button);
                    this._$buttonContainer = $buttonContainer
                },
                _enablePositioning: function($itemElement) {
                    this.callBase.apply(this, arguments);
                    fx.stop(this._$buttonContainer, true);
                    this._$buttonContainer.appendTo($itemElement)
                },
                _disablePositioning: function() {
                    this.callBase.apply(this, arguments);
                    this._$buttonContainer.detach()
                },
                _animatePrepareDeleteReady: function() {
                    var rtl = this._isRtlEnabled(),
                        listWidth = this._list._element().width(),
                        buttonWidth = this._buttonWidth(),
                        fromValue = rtl ? listWidth : -buttonWidth,
                        toValue = rtl ? listWidth - buttonWidth : 0;
                    return fx.animate(this._$buttonContainer, {
                            type: "custom",
                            duration: SWITCHABLE_DELETE_BUTTON_ANIMATION_DURATION,
                            from: {right: fromValue},
                            to: {right: toValue}
                        })
                },
                _animateForgetDeleteReady: function() {
                    var rtl = this._isRtlEnabled(),
                        listWidth = this._list._element().width(),
                        buttonWidth = this._buttonWidth(),
                        fromValue = rtl ? listWidth - buttonWidth : 0,
                        toValue = rtl ? listWidth : -buttonWidth;
                    return fx.animate(this._$buttonContainer, {
                            type: "custom",
                            duration: SWITCHABLE_DELETE_BUTTON_ANIMATION_DURATION,
                            from: {right: fromValue},
                            to: {right: toValue}
                        })
                },
                _buttonWidth: function() {
                    if (!this._buttonContainerWidth)
                        this._buttonContainerWidth = this._$buttonContainer.outerWidth();
                    return this._buttonContainerWidth
                },
                dispose: function() {
                    if (this._$buttonContainer)
                        this._$buttonContainer.remove();
                    this.callBase.apply(this, arguments)
                }
            });
        registerDecorator("menu", "_switchableButton", SwitchableButtonDeleteDecorator);
        var TOGGLE_DELETE_SWITCH_CONTAINER_CLASS = "dx-list-toggle-delete-switch-container",
            TOGGLE_DELETE_SWITCH_CLASS = "dx-list-toggle-delete-switch";
        registerDecorator("delete", "toggle", SwitchableButtonDeleteDecorator.inherit({beforeBag: function(config) {
                var $itemElement = config.$itemElement,
                    $container = config.$container;
                var $toggle = $("<div />").dxButton({
                        icon: "toggle-delete",
                        clickAction: $.proxy(function(e) {
                            this._toggleDeleteReady($itemElement);
                            e.jQueryEvent.stopPropagation()
                        }, this)
                    }).addClass(TOGGLE_DELETE_SWITCH_CLASS);
                $container.addClass(TOGGLE_DELETE_SWITCH_CONTAINER_CLASS);
                $container.append($toggle)
            }}));
        registerDecorator("delete", "slideButton", SwitchableButtonDeleteDecorator.inherit({
            _shouldHandleSwipe: true,
            _handleSwipeEnd: function($itemElement, args) {
                if (args.targetOffset !== 0)
                    this._toggleDeleteReady($itemElement);
                return true
            }
        }));
        var SLIDE_MENU_WRAPPER_CLASS = "dx-list-slide-menu-wrapper",
            SLIDE_MENU_CONTENT_CLASS = "dx-list-slide-menu-content",
            SLIDE_MENU_BUTTONS_CONTAINER_CLASS = "dx-list-slide-menu-buttons-container",
            SLIDE_MENU_BUTTONS_CLASS = "dx-list-slide-menu-buttons",
            SLIDE_MENU_BUTTON_CLASS = "dx-list-slide-menu-button",
            SLIDE_MENU_BUTTON_MENU_CLASS = "dx-list-slide-menu-button-menu",
            SLIDE_MENU_BUTTON_DELETE_CLASS = "dx-list-slide-menu-button-delete",
            SLIDE_MENU_CLASS = "dx-list-slide-menu";
        registerDecorator("menu", "slide", SwitchableMenuDecorator.inherit({
            _shouldHandleSwipe: true,
            _init: function() {
                this.callBase.apply(this, arguments);
                this._$buttonsContainer = $("<div/>").addClass(SLIDE_MENU_BUTTONS_CONTAINER_CLASS);
                this._$buttons = $("<div/>").addClass(SLIDE_MENU_BUTTONS_CLASS).appendTo(this._$buttonsContainer);
                this._renderMenu();
                this._renderDeleteButton()
            },
            _renderMenu: function() {
                if (!this._menuEnabled())
                    return;
                var menuItems = this._menuItems();
                if (menuItems.length === 1) {
                    var menuItem = menuItems[0];
                    this._renderMenuButton(menuItem.text, $.proxy(function() {
                        this._fireAction(menuItem)
                    }, this))
                }
                else {
                    var $menu = $("<div />").addClass(SLIDE_MENU_CLASS);
                    $menu.dxActionSheet({
                        showTitle: false,
                        items: menuItems,
                        itemClickAction: $.proxy(function(args) {
                            this._fireAction(args.itemData)
                        }, this)
                    });
                    $menu.appendTo(this._list._element());
                    this._menu = $menu.dxActionSheet("instance");
                    var $menuButton = this._renderMenuButton(Globalize.localize("dxListEditDecorator-more"), $.proxy(this._menu.show, this._menu));
                    this._menu.option("target", $menuButton)
                }
            },
            _renderMenuButton: function(text, action) {
                var $menuButton = $("<div/>").addClass(SLIDE_MENU_BUTTON_CLASS).addClass(SLIDE_MENU_BUTTON_MENU_CLASS).text(text);
                this._$buttons.append($menuButton);
                $menuButton.on(CLICK_EVENT_NAME, action);
                return $menuButton
            },
            _renderDeleteButton: function() {
                if (!this._deleteEnabled())
                    return;
                var $deleteButton = $("<div/>").addClass(SLIDE_MENU_BUTTON_CLASS).addClass(SLIDE_MENU_BUTTON_DELETE_CLASS).text(Globalize.localize("dxListEditDecorator-delete"));
                $deleteButton.on(CLICK_EVENT_NAME, $.proxy(function() {
                    this._deleteItem()
                }, this));
                this._$buttons.append($deleteButton)
            },
            _fireAction: function(menuItem) {
                this._fireMenuAction($(this._cachedNode), menuItem.action);
                this._cancelDeleteReadyItem()
            },
            modifyElement: function(config) {
                this.callBase.apply(this, arguments);
                var $itemElement = config.$itemElement;
                $itemElement.addClass(SLIDE_MENU_WRAPPER_CLASS).removeClass(LIST_ITEM_BAG_CONTAINER_CLASS);
                var $slideMenuContent = $("<div/>").addClass(SLIDE_MENU_CONTENT_CLASS).addClass(LIST_ITEM_BAG_CONTAINER_CLASS);
                $itemElement.wrapInner($slideMenuContent)
            },
            handleClick: function(_, e) {
                if ($(e.target).closest("." + SLIDE_MENU_CONTENT_CLASS).length)
                    return this.callBase.apply(this, arguments);
                return true
            },
            _handleSwipeStart: function($itemElement) {
                this._enablePositioning($itemElement);
                this._cacheItemData($itemElement)
            },
            _handleSwipeUpdate: function($itemElement, args) {
                var rtl = this._isRtlEnabled(),
                    signCorrection = rtl ? -1 : 1,
                    offset = this._cachedItemWidth * args.offset,
                    startOffset = this._isReadyToDelete($itemElement) ? -this._cachedButtonWidth * signCorrection : 0,
                    correctedOffset = (offset + startOffset) * signCorrection,
                    contentPosition = correctedOffset < 0 ? offset + startOffset : 0,
                    buttonPosition = correctedOffset < 0 ? correctedOffset : 0;
                translator.move(this._$cachedContent, {left: contentPosition});
                this._$buttonsContainer.css(rtl ? "right" : "left", Math.max(this._cachedItemWidth + buttonPosition, this._minButtonContainerLeftOffset()));
                return true
            },
            _cacheItemData: function($itemElement) {
                if ($itemElement[0] === this._cachedNode)
                    return;
                this._$cachedContent = $itemElement.find("." + SLIDE_MENU_CONTENT_CLASS);
                this._cachedItemWidth = $itemElement.outerWidth();
                this._cachedButtonWidth = this._cachedButtonWidth || $itemElement.find("." + SLIDE_MENU_BUTTONS_CLASS).outerWidth();
                if (this._$cachedContent.length)
                    this._cachedNode = $itemElement[0]
            },
            _minButtonContainerLeftOffset: function() {
                return this._cachedItemWidth - this._cachedButtonWidth
            },
            _handleSwipeEnd: function($itemElement, args) {
                this._cacheItemData($itemElement);
                var signCorrection = this._isRtlEnabled() ? 1 : -1,
                    offset = this._cachedItemWidth * args.offset,
                    endedAtReadyToDelete = !this._isReadyToDelete($itemElement) && offset * signCorrection > this._cachedButtonWidth * .2,
                    readyToDelete = args.targetOffset === signCorrection || endedAtReadyToDelete;
                this._toggleDeleteReady($itemElement, readyToDelete);
                return true
            },
            _enablePositioning: function($itemElement) {
                this.callBase.apply(this, arguments);
                this._$buttonsContainer.appendTo($itemElement)
            },
            _disablePositioning: function($itemElement) {
                this.callBase.apply(this, arguments);
                this._$buttonsContainer.detach()
            },
            _animatePrepareDeleteReady: function() {
                var rtl = this._isRtlEnabled(),
                    directionCorrection = rtl ? 1 : -1;
                this._$buttonsContainer.css(rtl ? "left" : "right", "0");
                var contentAnimation = fx.animate(this._$cachedContent, {
                        to: {left: this._cachedButtonWidth * directionCorrection},
                        type: "slide",
                        duration: 200
                    });
                var direction = rtl ? "right" : "left",
                    buttonToAnimation = {};
                buttonToAnimation[direction] = this._minButtonContainerLeftOffset();
                var buttonAnimation = fx.animate(this._$buttonsContainer, {
                        to: buttonToAnimation,
                        duration: 200
                    });
                return $.when(contentAnimation, buttonAnimation).promise()
            },
            _animateForgetDeleteReady: function($itemElement) {
                this._cacheItemData($itemElement);
                var rtl = this._isRtlEnabled();
                this._$buttonsContainer.css(rtl ? "left" : "right", "0");
                var contentAnimation = fx.animate(this._$cachedContent, {
                        to: {left: 0},
                        type: "slide",
                        duration: 200
                    });
                var direction = rtl ? "right" : "left",
                    buttonToAnimation = {};
                buttonToAnimation[direction] = this._cachedItemWidth;
                var buttonAnimation = fx.animate(this._$buttonsContainer, {
                        to: buttonToAnimation,
                        duration: 200,
                        complete: $.proxy(function() {
                            this._$buttonsContainer.css(direction, "100%")
                        }, this)
                    });
                return $.when(contentAnimation, buttonAnimation).promise()
            },
            dispose: function() {
                if (this._menu)
                    this._menu._element().remove();
                if (this._$buttonsContainer)
                    this._$buttonsContainer.remove();
                this.callBase.apply(this, arguments)
            }
        }));
        registerDecorator("delete", "swipe", ListEditDecorator.inherit({
            _shouldHandleSwipe: true,
            _renderItemPosition: function($itemElement, offset, animate) {
                var deferred = $.Deferred(),
                    itemOffset = offset * this._itemElementWidth;
                if (animate)
                    fx.animate($itemElement, {
                        to: {left: itemOffset},
                        type: "slide",
                        complete: function() {
                            deferred.resolve($itemElement, offset)
                        }
                    });
                else {
                    translator.move($itemElement, {left: itemOffset});
                    deferred.resolve()
                }
                return deferred.promise()
            },
            _handleSwipeStart: function($itemElement) {
                this._itemElementWidth = $itemElement.width();
                return true
            },
            _handleSwipeUpdate: function($itemElement, args) {
                this._renderItemPosition($itemElement, args.offset);
                return true
            },
            _handleSwipeEnd: function($itemElement, args) {
                var offset = args.targetOffset;
                this._renderItemPosition($itemElement, offset, true).done($.proxy(function($itemElement, offset) {
                    if (Math.abs(offset))
                        this._list.deleteItem($itemElement)
                }, this));
                return true
            }
        }));
        var HOLDDELETE_MENU = "dx-list-holddelete-menu",
            HOLDDELETE_MENUCONTENT = "dx-list-holddelete-menucontent";
        registerDecorator("menu", "hold", MenuDecorator.inherit({
            _init: function() {
                var $menu = $("<div/>").addClass(HOLDDELETE_MENU);
                this._list._element().append($menu);
                this._menu = this._renderOverlay($menu)
            },
            _renderOverlay: function($element) {
                return $element.dxOverlay({
                        shading: false,
                        deferRendering: true,
                        closeOnTargetScroll: true,
                        closeOnOutsideClick: function(e) {
                            return !$(e.target).closest("." + HOLDDELETE_MENU).length
                        },
                        animation: {
                            show: {
                                type: "slide",
                                duration: 300,
                                from: {
                                    height: 0,
                                    opacity: 1
                                },
                                to: {
                                    height: $.proxy(function() {
                                        return this._$menuList.outerHeight()
                                    }, this),
                                    opacity: 1
                                }
                            },
                            hide: {
                                type: "slide",
                                duration: 0,
                                from: {opacity: 1},
                                to: {opacity: 0}
                            }
                        },
                        height: $.proxy(function() {
                            return this._$menuList ? this._$menuList.outerHeight() : 0
                        }, this),
                        width: $.proxy(function() {
                            return this._list._element().outerWidth()
                        }, this),
                        contentReadyAction: $.proxy(this._renderMenuContent, this)
                    }).dxOverlay("instance")
            },
            _renderMenuContent: function(e) {
                var $overlayContent = e.component.content();
                var items = this._menuItems().slice();
                if (this._deleteEnabled())
                    items.push({
                        text: Globalize.localize("dxListEditDecorator-delete"),
                        action: $.proxy(this._deleteItem, this)
                    });
                this._$menuList = $("<div>").dxList({
                    items: items,
                    itemClickAction: $.proxy(this._handleMenuItemClick, this),
                    height: "auto"
                });
                $overlayContent.addClass(HOLDDELETE_MENUCONTENT);
                $overlayContent.append(this._$menuList)
            },
            _handleMenuItemClick: function(args) {
                this._menu.hide();
                this._fireMenuAction(this._$itemWithMenu, args.itemData.action)
            },
            _deleteItem: function() {
                this._list.deleteItem(this._$itemWithMenu)
            },
            handleHold: function($itemElement) {
                this._$itemWithMenu = $itemElement;
                this._menu.option({position: {
                        my: "top",
                        at: "bottom",
                        of: $itemElement,
                        collision: "flip"
                    }});
                this._menu.show();
                return true
            },
            dispose: function() {
                if (this._menu)
                    this._menu._element().remove();
                this.callBase.apply(this, arguments)
            }
        }));
        var LIST_ITEM_SELECTED_CLASS = "dx-list-item-selected",
            SELECT_DECORATOR_ENABLED_CLASS = "dx-list-select-decorator-enabled",
            SELECT_CHECKBOX_CONTAINER_CLASS = "dx-list-select-checkbox-container",
            SELECT_CHECKBOX_CLASS = "dx-list-select-checkbox",
            SELECT_RADIO_BUTTON_CONTAINER_CLASS = "dx-list-select-radio-button-container",
            SELECT_RADIO_BUTTON_CLASS = "dx-list-select-radio-button";
        registerDecorator("selection", "control", ListEditDecorator.inherit({
            _init: function() {
                this.callBase.apply(this, arguments);
                var selectionMode = this._list.option("selectionMode");
                this._singleStrategy = selectionMode === "single";
                this._containerClass = this._singleStrategy ? SELECT_RADIO_BUTTON_CONTAINER_CLASS : SELECT_CHECKBOX_CONTAINER_CLASS;
                this._controlClass = this._singleStrategy ? SELECT_RADIO_BUTTON_CLASS : SELECT_CHECKBOX_CLASS;
                this._controlWidget = this._singleStrategy ? "dxRadioButton" : "dxCheckBox";
                this._list._element().addClass(SELECT_DECORATOR_ENABLED_CLASS)
            },
            beforeBag: function(config) {
                var $itemElement = config.$itemElement,
                    $container = config.$container;
                var $control = $("<div />").addClass(this._controlClass);
                $control[this._controlWidget]({
                    value: this._isSelected($itemElement),
                    valueChangeAction: $.proxy(function(e) {
                        this._processCheckedState($itemElement, e.value);
                        if (e.jQueryEvent)
                            e.jQueryEvent.stopPropagation()
                    }, this)
                });
                $container.addClass(this._containerClass);
                $container.append($control)
            },
            modifyElement: function(config) {
                this.callBase.apply(this, arguments);
                var $itemElement = config.$itemElement,
                    control = $itemElement.find("." + this._controlClass)[this._controlWidget]("instance");
                $itemElement.on("stateChanged", $.proxy(function() {
                    control.option("value", this._isSelected($itemElement))
                }, this))
            },
            _isSelected: function($itemElement) {
                return $itemElement.hasClass(LIST_ITEM_SELECTED_CLASS)
            },
            _processCheckedState: function($itemElement, checked) {
                if (checked)
                    this._list.selectItem($itemElement);
                else
                    this._list.unselectItem($itemElement)
            },
            dispose: function() {
                this._list._element().removeClass(SELECT_DECORATOR_ENABLED_CLASS);
                this.callBase.apply(this, arguments)
            }
        }));
        registerDecorator("selection", "item", ui.ListEditDecoratorsRegistry.selection.control.inherit({handleClick: function($itemElement) {
                var newState = !this._isSelected($itemElement) || this._singleStrategy;
                this._processCheckedState($itemElement, newState);
                return true
            }}));
        var REORDER_HANDLE_CONTAINER_CLASS = "dx-list-reorder-handle-container",
            REORDER_HANDLE_CLASS = "dx-list-reorder-handle",
            REOREDERING_ITEM_CLASS = "dx-list-item-reordering",
            REOREDERING_ITEM_GHOST_CLASS = "dx-list-item-ghost-reordering",
            LIST_REORDER_COMPATIBILITY_MODE_CLASS = "dx-list-reorder-compatibility-mode";
        var fromRange = function(value, minValue, maxValue) {
                return Math.min(Math.max(value, minValue), maxValue)
            };
        var ReorderScrollAnimator = DX.Animator.inherit({
                ctor: function(strategy) {
                    this.callBase();
                    this._strategy = strategy
                },
                _isFinished: function() {
                    return this._strategy.scrollFinished()
                },
                _step: function() {
                    this._strategy.scrollByStep()
                }
            });
        registerDecorator("reorder", "default", ListEditDecorator.inherit({
            _init: function() {
                this._groupedEnabled = this._list.option("grouped");
                this._initAnimator()
            },
            _initAnimator: function() {
                this._scrollAnimator = new ReorderScrollAnimator(this)
            },
            _startAnimator: function() {
                if (!this._scrollAnimator.inProgress())
                    this._scrollAnimator.start()
            },
            _stopAnimator: function() {
                this._scrollAnimator.stop()
            },
            afterBag: function(config) {
                var $itemElement = config.$itemElement,
                    $container = config.$container;
                var $handle = $("<div>").addClass(REORDER_HANDLE_CLASS);
                $handle.on(DRAG_START_EVENT_NAME, {direction: "vertical"}, $.proxy(this._handleDragStart, this, $itemElement));
                $handle.on(DRAG_UPDATE_EVENT_NAME, $.proxy(this._handleDrag, this, $itemElement));
                $handle.on(DRAG_END_EVENT_NAME, $.proxy(this._handleDragEnd, this, $itemElement));
                $container.addClass(REORDER_HANDLE_CONTAINER_CLASS);
                $container.append($handle)
            },
            _handleDragStart: function($itemElement, e) {
                this._stopPreviousAnimation();
                e.targetElements = [];
                this._cacheItemsPositions();
                this._startPointerOffset = e.pageY - $itemElement.offset().top;
                this._elementHeight = $itemElement.outerHeight();
                var itemIndex = this._list.getFlatIndexByItemElement($itemElement);
                this._startIndex = itemIndex;
                this._lastIndex = itemIndex;
                this._cacheScrollData();
                this._createGhost($itemElement);
                $itemElement.addClass(REOREDERING_ITEM_CLASS);
                this._toggleCompatibilityMode(true)
            },
            _stopPreviousAnimation: function() {
                fx.stop(this._$ghostItem, true)
            },
            _toggleCompatibilityMode: function(enabled) {
                this._list._element().toggleClass(LIST_REORDER_COMPATIBILITY_MODE_CLASS, !support.transform3d && enabled)
            },
            _cacheItemsPositions: function() {
                this._itemPositions = [];
                $.each(this._list.itemElements(), $.proxy(function(index, item) {
                    this._itemPositions.push($(item).position().top)
                }, this))
            },
            _getDraggingElementPosition: function() {
                return this._itemPositions[this._startIndex]
            },
            _getLastElementPosition: function() {
                return this._itemPositions[this._lastIndex]
            },
            _cacheScrollData: function() {
                this._list.updateDimensions();
                this._startScrollTop = this._list.scrollTop();
                this._scrollOffset = 0;
                this._scrollHeight = this._list.scrollHeight();
                this._clientHeight = this._list.clientHeight()
            },
            _scrollTop: function() {
                return this._startScrollTop + this._scrollOffset
            },
            _createGhost: function($itemElement) {
                this._$ghostItem = $itemElement.clone();
                this._$ghostItem.addClass(REOREDERING_ITEM_GHOST_CLASS).appendTo(this._list.itemsContainer());
                this._startGhostPosition = this._getDraggingElementPosition() - this._$ghostItem.position().top;
                translator.move(this._$ghostItem, {top: this._startGhostPosition})
            },
            _handleDrag: function($itemElement, e) {
                this._topOffset = e.offset.y;
                this._updateItemPositions();
                var pointerPosition = this._getPonterPosition();
                this._toggleScroll(pointerPosition)
            },
            _getPonterPosition: function() {
                return this._getDraggingElementPosition() + this._startPointerOffset + this._scrollOffset + this._topOffset
            },
            _toggleScroll: function(pointerPosition) {
                if (this._scrollHeight <= this._clientHeight)
                    return;
                var minOffset = this._elementHeight * .7,
                    topOffset = this._clientHeight - (pointerPosition - this._scrollTop()),
                    topOffsetRatio = topOffset / minOffset,
                    bottomOffset = pointerPosition - this._scrollTop(),
                    bottomOffsetRatio = bottomOffset / minOffset;
                if (topOffsetRatio < 1) {
                    this._stepSize = this._adjustRationIntoRange(topOffsetRatio);
                    this._startAnimator()
                }
                else if (bottomOffsetRatio < 1) {
                    this._stepSize = -this._adjustRationIntoRange(bottomOffsetRatio);
                    this._startAnimator()
                }
                else
                    this._stopAnimator()
            },
            _adjustRationIntoRange: function(ratio) {
                return fromRange(Math.round(Math.abs(ratio - 1) * 7), 1, 7)
            },
            _updateItemPositions: function() {
                this._updateGhostPosition();
                this._updateOthersPositions()
            },
            _updateGhostPosition: function() {
                translator.move(this._$ghostItem, {top: this._startGhostPosition + this._scrollOffset + this._topOffset})
            },
            _updateOthersPositions: function() {
                var currentIndex = this._findItemIndexByPosition(this._getPonterPosition());
                if (this._lastIndex === currentIndex || this._groupedEnabled && !this._sameParent(currentIndex))
                    return;
                var currentIndexOffset = currentIndex - this._startIndex,
                    currentDirection = utils.sign(currentIndexOffset),
                    minIndex = Math.min(currentIndex, this._lastIndex),
                    maxIndex = Math.max(currentIndex, this._lastIndex);
                for (var itemIndex = minIndex; itemIndex <= maxIndex; itemIndex++) {
                    if (itemIndex === this._startIndex)
                        continue;
                    var $item = this._list.getItemElementByFlatIndex(itemIndex),
                        itemIndexOffset = itemIndex - this._startIndex,
                        itemDirection = utils.sign(itemIndexOffset),
                        offsetsDifference = Math.abs(itemIndexOffset) <= Math.abs(currentIndexOffset),
                        sameDirections = currentDirection === itemDirection,
                        setupPosition = offsetsDifference && sameDirections,
                        resetPosition = !offsetsDifference || !sameDirections;
                    fx.stop($item);
                    if (setupPosition)
                        fx.animate($item, {
                            type: "slide",
                            to: {top: this._elementHeight * -currentDirection},
                            duration: 300
                        });
                    if (resetPosition)
                        fx.animate($item, {
                            type: "slide",
                            to: {top: 0},
                            duration: 300
                        })
                }
                this._lastIndex = currentIndex
            },
            _sameParent: function(index) {
                var $dragging = this._list.getItemElementByFlatIndex(this._startIndex),
                    $over = this._list.getItemElementByFlatIndex(index);
                return $over.parent().get(0) === $dragging.parent().get(0)
            },
            scrollByStep: function() {
                this._scrollOffset += this._stepSize;
                this._list.scrollBy(this._stepSize);
                this._updateItemPositions()
            },
            scrollFinished: function() {
                var scrollTop = this._scrollTop(),
                    rejectScrollTop = scrollTop <= 0 && this._stepSize < 0,
                    rejectScrollBottom = scrollTop >= this._scrollHeight - this._clientHeight && this._stepSize > 0;
                return rejectScrollTop || rejectScrollBottom
            },
            _handleDragEnd: function($itemElement) {
                this._scrollAnimator.stop();
                fx.animate(this._$ghostItem, {
                    type: "slide",
                    to: {top: this._startGhostPosition + this._getLastElementPosition() - this._getDraggingElementPosition()},
                    duration: 300
                }).done($.proxy(function() {
                    $itemElement.removeClass(REOREDERING_ITEM_CLASS);
                    this._resetPositions();
                    this._list.reorderItem($itemElement, this._list.getItemElementByFlatIndex(this._lastIndex));
                    this._deleteGhost();
                    this._toggleCompatibilityMode(false)
                }, this))
            },
            _deleteGhost: function() {
                this._$ghostItem.remove()
            },
            _resetPositions: function() {
                var minIndex = Math.min(this._startIndex, this._lastIndex),
                    maxIndex = Math.max(this._startIndex, this._lastIndex);
                for (var itemIndex = minIndex; itemIndex <= maxIndex; itemIndex++) {
                    var $item = this._list.getItemElementByFlatIndex(itemIndex);
                    translator.resetPosition($item)
                }
            },
            _findItemIndexByPosition: function(position) {
                var minIndex = 0;
                var maxIndex = this._itemPositions.length - 1;
                var currentIndex;
                var currentPosition;
                while (minIndex <= maxIndex) {
                    currentIndex = (minIndex + maxIndex) / 2 | 0;
                    currentPosition = this._itemPositions[currentIndex];
                    if (currentPosition < position)
                        minIndex = currentIndex + 1;
                    else if (currentPosition > position)
                        maxIndex = currentIndex - 1;
                    else
                        return currentIndex
                }
                return fromRange(minIndex, 0, Math.max(maxIndex, 0))
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.provider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var editOptionsRegistry = [];
        var registerOption = function(enabledFunc, decoratorTypeFunc, decoratorSubTypeFunc) {
                editOptionsRegistry.push({
                    enabled: enabledFunc,
                    decoratorType: decoratorTypeFunc,
                    decoratorSubType: decoratorSubTypeFunc
                })
            };
        registerOption(function(config) {
            return config.menuItems.length
        }, function() {
            return "menu"
        }, function(config) {
            return config.menuType
        });
        registerOption(function(config) {
            return !config.menuItems.length && config.deleteEnabled
        }, function(config, defaultConfig) {
            var deleteType = config.deleteMode !== defaultConfig.deleteMode ? config.deleteMode : config.deleteType;
            return deleteType === "toggle" || deleteType === "slideButton" || deleteType === "swipe" ? "delete" : "menu"
        }, function(config, defaultConfig) {
            var deleteType;
            if (config.deleteMode !== defaultConfig.deleteMode) {
                utils.logger.warn("'deleteMode' option is deprecated since 14.1. Use the 'deleteType' option instead.");
                deleteType = config.deleteMode
            }
            else
                deleteType = config.deleteType;
            if (deleteType === "slideItem")
                deleteType = "slide";
            return deleteType
        });
        registerOption(function(config) {
            return config.selectionEnabled
        }, function() {
            return "selection"
        }, function(config, defaultConfig) {
            var selectionType;
            if (config.selectionMode !== defaultConfig.selectionMode) {
                utils.logger.warn("'selectionMode' option is deprecated since 14.1. Use the 'selectionType' option instead.");
                selectionType = config.selectionMode
            }
            else
                selectionType = config.selectionType;
            return selectionType
        });
        registerOption(function(config) {
            return config.reorderEnabled
        }, function() {
            return "reorder"
        }, function() {
            return "default"
        });
        var LIST_ITEM_BAG_CONTAINER_CLASS = "dx-list-item-bag-container",
            LIST_ITEM_CONTENT_CLASS = "dx-list-item-content",
            LIST_ITEM_BEFORE_BAG_CLASS = "dx-list-item-before-bag",
            LIST_ITEM_AFTER_BAG_CLASS = "dx-list-item-after-bag",
            DECORATOR_BEFORE_BAG_CREATE_METHOD = "beforeBag",
            DECORATOR_AFTER_BAG_CREATE_METHOD = "afterBag",
            DECORATOR_MODIFY_ELEMENT_METHOD = "modifyElement";
        ui.ListEditProvider = DX.Class.inherit({
            ctor: function(list, config, defaultConfig) {
                this._list = list;
                this._config = config;
                this._defaultConfig = defaultConfig;
                if (this.isModifyingByDecorators())
                    this._fetchRequiredDecorators()
            },
            dispose: function() {
                if (this._decorators && this._decorators.length)
                    $.each(this._decorators, function(_, decorator) {
                        decorator.dispose()
                    })
            },
            isModifyingByDecorators: function(itemData) {
                return !(this.isRenderingByRenderer() || this.isRenderingByTemplate(itemData))
            },
            isRenderingByRenderer: function() {
                return !!this.getItemRenderer()
            },
            getItemRenderer: function() {
                return this._config.itemRender
            },
            isRenderingByTemplate: function(itemData) {
                return !!this.getItemTemplateName(itemData)
            },
            getItemTemplateName: function(itemData) {
                return itemData && itemData.editTemplate || this._config.itemTemplate
            },
            _fetchRequiredDecorators: function() {
                this._decorators = [];
                var config = this._config,
                    defaultConfig = this._defaultConfig;
                $.each(editOptionsRegistry, $.proxy(function(_, option) {
                    var optionEnabled = option.enabled(config, defaultConfig);
                    if (optionEnabled) {
                        var decoratorType = option.decoratorType(config, defaultConfig),
                            decoratorSubType = option.decoratorSubType(config, defaultConfig),
                            decorator = this._createDecorator(decoratorType, decoratorSubType);
                        this._decorators.push(decorator)
                    }
                }, this))
            },
            _createDecorator: function(type, subType) {
                var decoratorClass = this._findDecorator(type, subType);
                return new decoratorClass(this._list)
            },
            _findDecorator: function(type, subType) {
                var foundDecorator = ui.ListEditDecoratorsRegistry[type][subType];
                if (!foundDecorator)
                    throw new Error("Decorator with editing type: \"" + type + "\" and sub type: \"" + subType + "\" not found");
                return foundDecorator
            },
            modifyItemElement: function(args) {
                var $itemElement = $(args.itemElement);
                $itemElement.addClass(LIST_ITEM_BAG_CONTAINER_CLASS);
                this._wrapContent($itemElement);
                var config = {$itemElement: $itemElement};
                this._prependBeforeBags($itemElement, config);
                this._appendAfterBags($itemElement, config);
                this._applyDecorators(DECORATOR_MODIFY_ELEMENT_METHOD, config)
            },
            _wrapContent: function($itemElement) {
                var $contentContainer = $("<div />").addClass(LIST_ITEM_CONTENT_CLASS);
                $itemElement.wrapInner($contentContainer)
            },
            _prependBeforeBags: function($itemElement, config) {
                var $beforeBags = this._collectDecoratorsMarkup(DECORATOR_BEFORE_BAG_CREATE_METHOD, config, LIST_ITEM_BEFORE_BAG_CLASS);
                $itemElement.prepend($beforeBags)
            },
            _appendAfterBags: function($itemElement, config) {
                var $afterBags = this._collectDecoratorsMarkup(DECORATOR_AFTER_BAG_CREATE_METHOD, config, LIST_ITEM_AFTER_BAG_CLASS);
                $itemElement.append($afterBags)
            },
            _collectDecoratorsMarkup: function(method, config, containerClass) {
                var $collector = $("<div />");
                $.each(this._decorators, function() {
                    var $container = $("<div />").addClass(containerClass);
                    this[method]($.extend({$container: $container}, config));
                    if ($container.children().length)
                        $collector.append($container)
                });
                return $collector.children()
            },
            _applyDecorators: function(method, config) {
                $.each(this._decorators, function() {
                    this[method](config)
                })
            },
            _handlerExists: function(name) {
                if (!this._decorators)
                    return false;
                var decorators = this._decorators,
                    length = decorators.length;
                for (var i = 0; i < length; i++)
                    if (decorators[i][name] !== $.noop)
                        return true;
                return false
            },
            _handleEvent: function(name, $itemElement, e) {
                if (!this._decorators)
                    return false;
                var response = false,
                    decorators = this._decorators,
                    length = decorators.length;
                for (var i = 0; i < length; i++) {
                    response = decorators[i][name]($itemElement, e);
                    if (response)
                        break
                }
                return response
            },
            handleClick: function($itemElement, e) {
                return this._handleEvent("handleClick", $itemElement, e)
            },
            holdHandlerExists: function() {
                return this._handlerExists("handleHold")
            },
            handleHold: function($itemElement, e) {
                return this._handleEvent("handleHold", $itemElement, e)
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            removeDublicates = utils.removeDublicates;
        var LIST_EDITING_CLASS = "dx-list-editing",
            LIST_ITEM_SELECTED_CLASS = "dx-list-item-selected",
            LIST_ITEM_RESPONSE_WAIT_CLASS = "dx-list-item-response-wait";
        DX.registerComponent("dxList", ui.dxList.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    editEnabled: false,
                    editConfig: {
                        itemTemplate: null,
                        itemRender: null,
                        menuType: "hold",
                        menuItems: [],
                        deleteEnabled: false,
                        deleteMode: "toggle",
                        deleteType: "toggle",
                        selectionEnabled: false,
                        selectionMode: "item",
                        selectionType: "item",
                        reorderEnabled: false
                    },
                    itemDeleteAction: null,
                    selectionMode: 'multi',
                    selectedItems: [],
                    itemSelectAction: null,
                    itemUnselectAction: null,
                    itemReorderAction: null
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: {platform: "ios"},
                            options: {editConfig: {
                                    deleteType: "slideButton",
                                    deleteMode: "slideButton"
                                }}
                        }, {
                            device: {platform: "ios7"},
                            options: {editConfig: {
                                    menuType: "slide",
                                    deleteType: "slideItem",
                                    deleteMode: "slideItem"
                                }}
                        }, {
                            device: {platform: "android"},
                            options: {editConfig: {
                                    deleteType: "swipe",
                                    deleteMode: "swipe"
                                }}
                        }, {
                            device: {platform: "win8"},
                            options: {editConfig: {
                                    deleteType: "hold",
                                    deleteMode: "hold"
                                }}
                        }, {
                            device: {platform: "generic"},
                            options: {editConfig: {
                                    deleteType: "slideItem",
                                    deleteMode: "slideItem"
                                }}
                        }])
            },
            _init: function() {
                this.callBase();
                this._initEditProvider();
                this._initEditStrategy(this.option("grouped"));
                this._initSelectedItems()
            },
            _initEditProvider: function() {
                var defaultConfig = this.initialOption("editConfig");
                this._editProvider = new ui.ListEditProvider(this, this.option("editConfig"), defaultConfig)
            },
            _disposeEditProvider: function() {
                if (this._editProvider)
                    this._editProvider.dispose()
            },
            _refreshEditProvider: function() {
                this._disposeEditProvider();
                this._initEditProvider()
            },
            _initEditStrategy: function(grouped) {
                var strategy = grouped ? ui.GroupedListEditStrategy : ui.PlainListEditStrategy;
                this._editStrategy = new strategy(this)
            },
            _initSelectedItems: function() {
                this._selectedItemIndices = this._editStrategy.selectedItemIndecies(this.option("selectedItems"))
            },
            _clearSelectedItems: function() {
                this._selectedItemIndices = [];
                this.option("selectedItems", [])
            },
            _render: function() {
                this._renderEditing();
                this.callBase();
                this._normalizeSelectedItems()
            },
            _renderEditing: function() {
                this._element().toggleClass(LIST_EDITING_CLASS, this.option("editEnabled"))
            },
            _handleItemClick: function(e) {
                var $itemElement = $(e.currentTarget);
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                    return;
                var handledByEditProvider = this.option("editEnabled") && this._editProvider.handleClick($itemElement, e);
                if (handledByEditProvider)
                    return;
                this.callBase.apply(this, arguments)
            },
            _shouldAttachHoldEvent: function() {
                return this.callBase.apply(this, arguments) || this._editProvider.holdHandlerExists()
            },
            _handleItemHold: function(e) {
                var $itemElement = $(e.currentTarget);
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                    return;
                var handledByEditProvider = this.option("editEnabled") && this._editProvider.handleHold($itemElement, e);
                if (handledByEditProvider)
                    return;
                this.callBase.apply(this, arguments)
            },
            _getItemRenderer: function() {
                if (this.option("editEnabled") && this._editProvider.isRenderingByRenderer())
                    return this._editProvider.getItemRenderer();
                return this.callBase.apply(this, arguments)
            },
            _getItemTemplateName: function(itemData) {
                if (this.option("editEnabled") && this._editProvider.isRenderingByTemplate(itemData))
                    return this._editProvider.getItemTemplateName(itemData);
                return this.callBase.apply(this, arguments)
            },
            _postprocessRenderItem: function(args) {
                this.callBase.apply(this, arguments);
                var $itemElement = $(args.itemElement);
                if (this._isItemSelected(this._editStrategy.getNormalizedIndex($itemElement)))
                    $itemElement.addClass(LIST_ITEM_SELECTED_CLASS);
                if (this.option("editEnabled") && this._editProvider.isModifyingByDecorators(args.itemData))
                    this._editProvider.modifyItemElement(args)
            },
            _dispose: function() {
                this._disposeEditProvider();
                this.callBase.apply(this, arguments)
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"rtlEnabled":
                        this._refreshEditProvider();
                        this.callBase.apply(this, arguments);
                        break;
                    case"items":
                        this._clearSelectedItems();
                        this.callBase.apply(this, arguments);
                        break;
                    case"grouped":
                        this._clearSelectedItems();
                        delete this._renderingGroupIndex;
                        this._initEditStrategy(value);
                        this.callBase.apply(this, arguments);
                        break;
                    case"editEnabled":
                        this._clearSelectedItems();
                        this._refreshEditProvider();
                        this._invalidate();
                        break;
                    case"editConfig":
                        this._refreshEditProvider();
                        this._invalidate();
                        break;
                    case"selectionMode":
                        this._refreshEditProvider();
                        this._invalidate();
                        break;
                    case"selectedItems":
                        this._normalizeSelectedItems();
                        break;
                    case"itemDeleteAction":
                    case"itemSelectAction":
                    case"itemUnselectAction":
                    case"itemReorderAction":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _isItemSelected: function(index) {
                return $.inArray(index, this._selectedItemIndices) > -1
            },
            _normalizeSelectedItems: function() {
                if (this.option("selectionMode") === "single") {
                    var newSelection = this._editStrategy.selectedItemIndecies(this.option("selectedItems"));
                    if (newSelection.length > 1) {
                        var normalizedSelection = [newSelection[0]];
                        this.option("selectedItems", this._editStrategy.fetchSelectedItems(normalizedSelection))
                    }
                    else
                        this._updateSelectedItems()
                }
                else
                    this._updateSelectedItems()
            },
            _updateSelectedItems: function() {
                var that = this,
                    newSelection = this._editStrategy.selectedItemIndecies();
                var unselected = removeDublicates(this._selectedItemIndices, newSelection);
                $.each(unselected, function(_, normalizedIndex) {
                    that._unselectItem(normalizedIndex)
                });
                var selected = removeDublicates(newSelection, this._selectedItemIndices);
                $.each(selected, function(_, normalizedIndex) {
                    that._selectItem(normalizedIndex)
                })
            },
            _updateSelectionAfterDelete: function(fromIndex) {
                var that = this,
                    itemIndex = $.inArray(fromIndex, this._selectedItemIndices);
                if (itemIndex > -1)
                    this._selectedItemIndices.splice(itemIndex, 1);
                this._editStrategy.updateSelectionAfterDelete(fromIndex);
                this.option("selectedItems", this._editStrategy.fetchSelectedItems())
            },
            _selectItem: function(normalizedIndex) {
                var $itemElement = this._editStrategy.getItemElement(normalizedIndex);
                if (this.option("editEnabled") && normalizedIndex > -1 && !this._isItemSelected(normalizedIndex)) {
                    $itemElement.addClass(LIST_ITEM_SELECTED_CLASS);
                    this._selectedItemIndices.push(normalizedIndex);
                    $itemElement.trigger("stateChanged");
                    this._handleItemEvent($itemElement, "itemSelectAction", {}, {excludeValidators: ["gesture", "disabled"]})
                }
            },
            _unselectItem: function(normalizedIndex) {
                var $itemElement = this._editStrategy.getItemElement(normalizedIndex),
                    itemSelectionIndex = $.inArray(normalizedIndex, this._selectedItemIndices);
                if (this.option("editEnabled") && itemSelectionIndex > -1) {
                    $itemElement.removeClass(LIST_ITEM_SELECTED_CLASS);
                    this._selectedItemIndices.splice(itemSelectionIndex, 1);
                    $itemElement.trigger("stateChanged");
                    this._handleItemEvent($itemElement, "itemUnselectAction", {}, {excludeValidators: ["gesture", "disabled"]})
                }
            },
            _deleteItemFromDS: function($item) {
                var that = this,
                    deferred = $.Deferred(),
                    disabledState = this.option("disabled"),
                    dataStore = this._dataSource.store();
                this.option("disabled", true);
                if (!dataStore.remove)
                    throw new Error("You have to implement 'remove' method in dataStore used by dxList to be able to delete items");
                dataStore.remove(dataStore.keyOf(this._getItemData($item))).done(function(key) {
                    if (key !== undefined)
                        deferred.resolveWith(that);
                    else
                        deferred.rejectWith(that)
                }).fail(function() {
                    deferred.rejectWith(that)
                });
                deferred.always(function() {
                    that.option("disabled", disabledState)
                });
                return deferred
            },
            _refreshLastPage: function() {
                this._expectLastItemLoading();
                return this._dataSource.load()
            },
            getFlatIndexByItemElement: function(itemElement) {
                return this._itemElements().index(itemElement)
            },
            getItemElementByFlatIndex: function(flatIndex) {
                var $itemElements = this._itemElements();
                if (flatIndex < 0 || flatIndex >= $itemElements.length)
                    return $();
                return $itemElements.eq(flatIndex)
            },
            getItemByIndex: function(index) {
                return this._getItemData(this._itemElements().eq(index))
            },
            deleteItem: function(itemElement) {
                var that = this,
                    deferred = $.Deferred(),
                    $item = this._editStrategy.getItemElement(itemElement),
                    index = this._editStrategy.getNormalizedIndex(itemElement),
                    changingOption;
                if (this.option("editEnabled") && index > -1) {
                    $item.addClass(LIST_ITEM_RESPONSE_WAIT_CLASS);
                    if (this._dataSource) {
                        changingOption = "dataSource";
                        deferred = this._deleteItemFromDS($item)
                    }
                    else {
                        changingOption = "items";
                        deferred.resolveWith(this)
                    }
                }
                else
                    deferred.rejectWith(this);
                deferred.done(function() {
                    $item.detach();
                    that._editStrategy.deleteItemAtIndex(index);
                    that.optionChanged.fireWith(that, [changingOption, that.option(changingOption)]);
                    that._updateSelectionAfterDelete(index);
                    that._handleItemEvent($item, "itemDeleteAction", {}, {excludeValidators: ["gesture", "disabled"]});
                    that._renderEmptyMessage()
                }).fail(function() {
                    $item.removeClass(LIST_ITEM_RESPONSE_WAIT_CLASS)
                });
                if (this._isLastPage() || this.option("grouped"))
                    return deferred.promise();
                var pageRefreshDeffered = $.Deferred();
                deferred.done(function() {
                    that._refreshLastPage().done(function() {
                        pageRefreshDeffered.resolveWith(that)
                    })
                }).fail(function() {
                    pageRefreshDeffered.rejectWith(that)
                });
                return pageRefreshDeffered.promise()
            },
            isItemSelected: function(itemElement) {
                return this._isItemSelected(this._editStrategy.getNormalizedIndex(itemElement))
            },
            selectItem: function(itemElement) {
                if (!this.option("editEnabled"))
                    return;
                var itemIndex = this._editStrategy.getNormalizedIndex(itemElement);
                if (itemIndex === -1)
                    return;
                var itemSelectionIndex = $.inArray(itemIndex, this._selectedItemIndices);
                if (itemSelectionIndex !== -1)
                    return;
                if (this.option("selectionMode") === "single")
                    this.option("selectedItems", this._editStrategy.fetchSelectedItems([itemIndex]));
                else {
                    var newSelectedIndices = this._selectedItemIndices.slice();
                    newSelectedIndices.push(itemIndex);
                    this.option("selectedItems", this._editStrategy.fetchSelectedItems(newSelectedIndices))
                }
            },
            unselectItem: function(itemElement) {
                if (!this.option("editEnabled"))
                    return;
                var itemIndex = this._editStrategy.getNormalizedIndex(itemElement);
                if (itemIndex === -1)
                    return;
                var itemSelectionIndex = $.inArray(itemIndex, this._selectedItemIndices);
                if (itemSelectionIndex === -1)
                    return;
                var newSelectedIndices = this._selectedItemIndices.slice();
                newSelectedIndices.splice(itemSelectionIndex, 1);
                this.option("selectedItems", this._editStrategy.fetchSelectedItems(newSelectedIndices))
            },
            reorderItem: function(itemElement, toItemElement) {
                var deferred = $.Deferred(),
                    that = this,
                    strategy = this._editStrategy,
                    $movingItem = strategy.getItemElement(itemElement),
                    $destinationItem = strategy.getItemElement(toItemElement),
                    movingIndex = strategy.getNormalizedIndex(itemElement),
                    destinationIndex = strategy.getNormalizedIndex(toItemElement),
                    changingOption;
                var canMoveItems = movingIndex > -1 && destinationIndex > -1 && movingIndex !== destinationIndex;
                if (this.option("editEnabled") && canMoveItems)
                    if (this._dataSource) {
                        changingOption = "dataSource";
                        deferred.resolveWith(this)
                    }
                    else {
                        changingOption = "items";
                        deferred.resolveWith(this)
                    }
                else
                    deferred.rejectWith(this);
                return deferred.promise().done(function() {
                        $destinationItem[strategy.itemPlacementFunc(movingIndex, destinationIndex)]($movingItem);
                        var newSelectedItems = strategy.getSelectedItemsAfterReorderItem(movingIndex, destinationIndex);
                        strategy.moveItemAtIndexToIndex(movingIndex, destinationIndex);
                        that._selectedItemIndices = strategy.selectedItemIndecies(newSelectedItems);
                        that.option("selectedItems", strategy.fetchSelectedItems());
                        that.optionChanged.fireWith(that, [changingOption, that.option(changingOption)]);
                        that._handleItemEvent($movingItem, "itemReorderAction", {
                            fromIndex: strategy.getIndex(movingIndex),
                            toIndex: strategy.getIndex(destinationIndex)
                        }, {excludeValidators: ["gesture", "disabled"]})
                    })
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.gallery.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator,
            GALLERY_CLASS = "dx-gallery",
            GALLERY_WRAPPER_CLASS = GALLERY_CLASS + "-wrapper",
            GALLERY_LOOP_CLASS = "dx-gallery-loop",
            GALLERY_ITEM_CONTAINER_CLASS = GALLERY_CLASS + "-container",
            GALLERY_ACTIVE_CLASS = GALLERY_CLASS + "-active",
            GALLERY_ITEM_CLASS = GALLERY_CLASS + "-item",
            GALLERY_LOOP_ITEM_CLASS = GALLERY_ITEM_CLASS + "-loop",
            GALLERY_ITEM_SELECTOR = "." + GALLERY_ITEM_CLASS,
            GALLERY_ITEM_SELECTED_CLASS = GALLERY_ITEM_CLASS + "-selected",
            GALLERY_INDICATOR_CLASS = GALLERY_CLASS + "-indicator",
            GALLERY_INDICATOR_ITEM_CLASS = GALLERY_INDICATOR_CLASS + "-item",
            GALLERY_INDICATOR_ITEM_SELECTOR = "." + GALLERY_INDICATOR_ITEM_CLASS,
            GALLERY_INDICATOR_ITEM_SELECTED_CLASS = GALLERY_INDICATOR_ITEM_CLASS + "-selected",
            GALLERY_ITEM_DATA_KEY = "dxGalleryItemData";
        DX.registerComponent("dxGalleryNavButton", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    direction: "next",
                    clickAction: null,
                    hoverStateEnabled: true
                })
            },
            _render: function() {
                this.callBase();
                var that = this,
                    $element = this._element(),
                    eventName = events.addNamespace("dxclick", this.NAME);
                $element.addClass(GALLERY_CLASS + "-nav-button-" + this.option("direction")).off(eventName).on(eventName, function(e) {
                    that._createActionByOption("clickAction")({jQueryEvent: e})
                })
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"clickAction":
                    case"direction":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            }
        }));
        DX.registerComponent("dxGallery", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: GALLERY_ITEM_SELECTOR,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    activeStateEnabled: false,
                    animationDuration: 400,
                    loop: false,
                    swipeEnabled: true,
                    indicatorEnabled: true,
                    showIndicator: true,
                    selectedIndex: 0,
                    slideshowDelay: 0,
                    showNavButtons: false
                })
            },
            _dataSourceOptions: function() {
                return {paginate: false}
            },
            _itemContainer: function() {
                return this._$container
            },
            _itemClass: function() {
                return GALLERY_ITEM_CLASS
            },
            _itemDataKey: function() {
                return GALLERY_ITEM_DATA_KEY
            },
            _itemWidth: function() {
                if (!this._itemWidthCache)
                    this._itemWidthCache = this._itemElements().first().outerWidth();
                return this._itemWidthCache
            },
            _clearItemWidthCache: function() {
                delete this._itemWidthCache
            },
            _itemsCount: function() {
                return (this.option("items") || []).length
            },
            _offsetDirection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _itemRenderDefault: function(item, index, itemElement) {
                itemElement.append($("<img />").attr("src", String(item)))
            },
            _renderSelectedIndex: $.noop,
            _render: function() {
                this._element().addClass(GALLERY_CLASS);
                this._element().toggleClass(GALLERY_LOOP_CLASS, this.option("loop"));
                this._renderDragHandler();
                this._renderWrapper();
                this._renderItemContainer();
                this.callBase();
                this._renderContainerPosition();
                this._renderItemPositions();
                this._renderIndicator();
                this._renderSelectedIndicatorItem();
                this._renderUserInteraction();
                this._renderNavButtons();
                this._setupSlideShow();
                this._reviseDimensions()
            },
            _dimensionChanged: function() {
                this._clearItemWidthCache();
                this._renderDuplicateItems();
                this._renderItemPositions();
                this._renderContainerPosition()
            },
            _renderDragHandler: function() {
                var eventName = events.addNamespace("dragstart", this.NAME);
                this._element().off(eventName).on(eventName, "img", function() {
                    return false
                })
            },
            _renderWrapper: function() {
                if (this._$wrapper)
                    return;
                this._$wrapper = $("<div />").addClass(GALLERY_WRAPPER_CLASS).appendTo(this._element())
            },
            _renderItems: function(items) {
                this.callBase(items);
                this._renderDuplicateItems()
            },
            _renderItemContainer: function() {
                if (this._$container)
                    return;
                this._$container = $("<div>").addClass(GALLERY_ITEM_CONTAINER_CLASS).appendTo(this._$wrapper)
            },
            _renderDuplicateItems: function() {
                var items = this.option("items") || [],
                    itemsCount = items.length;
                if (!itemsCount)
                    return;
                this._element().find("." + GALLERY_LOOP_ITEM_CLASS).remove();
                var itemsPerPage = this._element().width() / this._itemWidth(),
                    duplicateCount = Math.min(itemsPerPage, itemsCount);
                for (var i = 0; i < duplicateCount; i++)
                    this._renderItem(0, items[i]).addClass(GALLERY_LOOP_ITEM_CLASS);
                this._renderItem(0, items[this._itemsCount() - 1]).addClass(GALLERY_LOOP_ITEM_CLASS)
            },
            _renderItemPositions: function() {
                var itemWidth = this._itemWidth(),
                    loopItemsCount = this._element().find("." + GALLERY_LOOP_ITEM_CLASS).length,
                    lastItemDuplicateIndex = this._itemsCount() + loopItemsCount - 1,
                    offsetDirection = this._offsetDirection();
                this._itemElements().each(function(index) {
                    var realIndex = index;
                    if (index === lastItemDuplicateIndex)
                        realIndex = -1;
                    translator.move($(this), {left: offsetDirection * realIndex * itemWidth})
                })
            },
            _renderContainerPosition: function(offset, animate) {
                offset = offset || 0;
                var that = this,
                    itemWidth = this._itemWidth(),
                    selectedIndex = this.option("selectedIndex"),
                    targetIndex = offset - selectedIndex,
                    targetPosition = this._offsetDirection() * targetIndex * itemWidth,
                    positionReady;
                if (animate) {
                    that._startSwipe();
                    positionReady = that._animate(targetPosition).done($.proxy(that._endSwipe, that))
                }
                else {
                    translator.move(this._$container, {left: targetPosition});
                    positionReady = $.Deferred().resolveWith(that)
                }
                return positionReady.promise()
            },
            _startSwipe: function() {
                this._element().addClass(GALLERY_ACTIVE_CLASS)
            },
            _endSwipe: function() {
                this._element().removeClass(GALLERY_ACTIVE_CLASS)
            },
            _animate: function(targetPosition, extraConfig) {
                var that = this,
                    animationComplete = $.Deferred();
                fx.animate(this._$container, $.extend({
                    type: "slide",
                    to: {left: targetPosition},
                    duration: that.option("animationDuration"),
                    complete: function() {
                        animationComplete.resolveWith(that)
                    }
                }, extraConfig || {}));
                return animationComplete
            },
            _reviseDimensions: function() {
                var that = this,
                    $firstItem = that._itemElements().first();
                if (!$firstItem)
                    return;
                if (!that.option("height"))
                    that.option("height", $firstItem.outerHeight());
                if (!that.option("width"))
                    that.option("width", $firstItem.outerWidth());
                this._dimensionChanged()
            },
            _renderIndicator: function() {
                if (!this.option("showIndicator")) {
                    this._cleanIndicators();
                    return
                }
                var indicator = this._$indicator = $("<div>").addClass(GALLERY_INDICATOR_CLASS).appendTo(this._$wrapper);
                $.each(this.option("items") || [], function() {
                    $("<div>").addClass(GALLERY_INDICATOR_ITEM_CLASS).appendTo(indicator)
                })
            },
            _cleanIndicators: function() {
                if (this._$indicator)
                    this._$indicator.remove()
            },
            _renderSelectedIndicatorItem: function() {
                var selectedIndex = this.option("selectedIndex");
                this._itemElements().removeClass(GALLERY_ITEM_SELECTED_CLASS).eq(selectedIndex).addClass(GALLERY_ITEM_SELECTED_CLASS);
                this._element().find(GALLERY_INDICATOR_ITEM_SELECTOR).removeClass(GALLERY_INDICATOR_ITEM_SELECTED_CLASS).eq(selectedIndex).addClass(GALLERY_INDICATOR_ITEM_SELECTED_CLASS)
            },
            _renderUserInteraction: function() {
                var that = this,
                    rootElement = that._element(),
                    swipeEnabled = that.option("swipeEnabled") && this._itemsCount() > 1,
                    cursor = swipeEnabled ? "pointer" : "default";
                rootElement.dxSwipeable({
                    disabled: this.option("disabled") || !swipeEnabled,
                    startAction: $.proxy(that._handleSwipeStart, that),
                    updateAction: $.proxy(that._handleSwipeUpdate, that),
                    endAction: $.proxy(that._handleSwipeEnd, that),
                    itemSizeFunc: $.proxy(that._itemWidth, that)
                });
                var indicatorSelectAction = this._createAction(this._handleIndicatorSelect);
                rootElement.find(GALLERY_INDICATOR_ITEM_SELECTOR).off(events.addNamespace("dxclick", this.NAME)).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    indicatorSelectAction({jQueryEvent: e})
                })
            },
            _handleIndicatorSelect: function(args) {
                var e = args.jQueryEvent,
                    instance = args.component;
                if (events.needSkipEvent(e))
                    return;
                if (!instance.option("indicatorEnabled"))
                    return;
                var index = $(e.target).index();
                instance._renderContainerPosition(instance.option("selectedIndex") - index, true).done(function() {
                    this._suppressRenderItemPositions = true;
                    instance.option("selectedIndex", index)
                })
            },
            _renderNavButtons: function() {
                var that = this;
                if (!that.option("showNavButtons")) {
                    that._cleanNavButtons();
                    return
                }
                that._prevNavButton = $("<div />").dxGalleryNavButton({
                    direction: "prev",
                    clickAction: function() {
                        that.prevItem(true)
                    }
                }).appendTo(this._$wrapper);
                that._nextNavButton = $("<div />").dxGalleryNavButton({
                    direction: "next",
                    clickAction: function() {
                        that.nextItem(true)
                    }
                }).appendTo(this._$wrapper);
                this._renderNavButtonsVisibility()
            },
            _cleanNavButtons: function() {
                if (this._prevNavButton)
                    this._prevNavButton.remove();
                if (this._prevNavButton)
                    this._nextNavButton.remove()
            },
            _renderNavButtonsVisibility: function() {
                if (!this.option("showNavButtons"))
                    return;
                var selectedIndex = this.option("selectedIndex"),
                    loop = this.option("loop"),
                    itemsCount = this._itemsCount();
                this._prevNavButton.show();
                this._nextNavButton.show();
                if (loop)
                    return;
                var nextHidden = itemsCount < 2 || selectedIndex === itemsCount - 1,
                    prevHidden = itemsCount < 2 || selectedIndex === 0;
                if (prevHidden)
                    this._prevNavButton.hide();
                if (nextHidden)
                    this._nextNavButton.hide()
            },
            _setupSlideShow: function() {
                var that = this,
                    slideshowDelay = that.option("slideshowDelay");
                if (!slideshowDelay)
                    return;
                clearTimeout(that._slideshowTimer);
                that._slideshowTimer = setTimeout(function() {
                    if (that._userInteraction) {
                        that._setupSlideShow();
                        return
                    }
                    that.nextItem(true).done(that._setupSlideShow)
                }, slideshowDelay)
            },
            _handleSwipeStart: function(e) {
                var itemsCount = this._itemsCount();
                if (!itemsCount) {
                    e.jQueryEvent.cancel = true;
                    return
                }
                this._stopItemAnimations();
                this._startSwipe();
                this._userInteraction = true;
                if (!this.option("loop")) {
                    var selectedIndex = this.option("selectedIndex"),
                        startOffset = itemsCount - selectedIndex - 1,
                        endOffset = selectedIndex,
                        rtlEnabled = this.option("rtlEnabled");
                    e.jQueryEvent.maxLeftOffset = rtlEnabled ? endOffset : startOffset;
                    e.jQueryEvent.maxRightOffset = rtlEnabled ? startOffset : endOffset
                }
            },
            _stopItemAnimations: function() {
                if (fx.isAnimating(this._$container))
                    fx.stop(this._$container, true)
            },
            _handleSwipeUpdate: function(e) {
                this._renderContainerPosition(this._offsetDirection() * e.jQueryEvent.offset)
            },
            _handleSwipeEnd: function(e) {
                var targetOffset = e.jQueryEvent.targetOffset * this._offsetDirection();
                this._renderContainerPosition(targetOffset, true).done(function() {
                    var selectedIndex = this.option("selectedIndex"),
                        newIndex = this._fitIndex(selectedIndex - targetOffset);
                    this._suppressRenderItemPositions = true;
                    this.option("selectedIndex", newIndex);
                    this._renderContainerPosition();
                    this._userInteraction = false;
                    this._setupSlideShow()
                })
            },
            _flipIndex: function(index) {
                if (!this.option("loop"))
                    return index;
                var itemsCount = this._itemsCount();
                index = index % itemsCount;
                if (index > (itemsCount + 1) / 2)
                    index -= itemsCount;
                if (index < -(itemsCount - 1) / 2)
                    index += itemsCount;
                return index
            },
            _fitIndex: function(index) {
                if (!this.option("loop"))
                    return index;
                var itemsCount = this._itemsCount();
                index = index % itemsCount;
                if (index < 0)
                    index += itemsCount;
                return index
            },
            _clean: function() {
                this.callBase();
                this._cleanIndicators();
                this._cleanNavButtons()
            },
            _dispose: function() {
                clearTimeout(this._slideshowTimer);
                this.callBase()
            },
            _handleSelectedIndexChanged: function() {
                if (!this._suppressRenderItemPositions)
                    this._renderContainerPosition();
                this._suppressRenderItemPositions = false;
                this._renderSelectedIndicatorItem();
                this._renderNavButtonsVisibility()
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"width":
                        this.callBase.apply(this, arguments);
                        this._dimensionChanged();
                        break;
                    case"animationDuration":
                        this._renderNavButtonsVisibility();
                        break;
                    case"loop":
                        this._element().toggleClass(GALLERY_LOOP_CLASS, value);
                        this._renderNavButtonsVisibility();
                        return;
                    case"selectedIndex":
                        this._handleSelectedIndexChanged();
                        this.callBase.apply(this, arguments);
                        return;
                    case"showIndicator":
                        this._renderIndicator();
                        return;
                    case"showNavButtons":
                        this._renderNavButtons();
                        return;
                    case"slideshowDelay":
                        this._setupSlideShow();
                        return;
                    case"swipeEnabled":
                    case"indicatorEnabled":
                        this._renderUserInteraction();
                        return;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            goToItem: function(itemIndex, animation) {
                var d = new $.Deferred,
                    selectedIndex = this.option("selectedIndex"),
                    itemsCount = this._itemsCount();
                itemIndex = this._fitIndex(itemIndex);
                if (itemIndex > itemsCount - 1 || itemIndex < 0)
                    return d.resolveWith(this).promise();
                this._renderContainerPosition(selectedIndex - itemIndex, animation).done(function() {
                    this._suppressRenderItemPositions = true;
                    this.option("selectedIndex", itemIndex);
                    d.resolveWith(this)
                });
                return d.promise()
            },
            prevItem: function(animation) {
                return this.goToItem(this.option("selectedIndex") - 1, animation)
            },
            nextItem: function(animation) {
                return this.goToItem(this.option("selectedIndex") + 1, animation)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.overlay.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator;
        var OVERLAY_CLASS = "dx-overlay",
            OVERLAY_WRAPPER_CLASS = "dx-overlay-wrapper",
            OVERLAY_CONTENT_CLASS = "dx-overlay-content",
            OVERLAY_SHADER_CLASS = "dx-overlay-shader",
            OVERLAY_MODAL_CLASS = "dx-overlay-modal",
            RTL_DIRECTION_CLASS = "dx-rtl",
            ACTIONS = ["showingAction", "shownAction", "hidingAction", "hiddenAction", "positioningAction", "positionedAction"],
            FIRST_Z_INDEX = 1000,
            Z_INDEX_STACK = [],
            DISABLED_STATE_CLASS = "dx-state-disabled";
        var realDevice = DX.devices.real(),
            android4_0nativeBrowser = realDevice.platform === "android" && /^4\.0(\.\d)?/.test(realDevice.version.join(".")) && navigator.userAgent.indexOf("Chrome") === -1;
        var forceRepaint = function($element) {
                $element.width();
                if (android4_0nativeBrowser) {
                    var $parents = $element.parents(),
                        inScrollView = $parents.is(".dx-scrollable-native");
                    if (!inScrollView) {
                        $parents.css("backface-visibility", "hidden");
                        $parents.css("backface-visibility");
                        $parents.css("backface-visibility", "visible")
                    }
                }
            };
        var getElement = function(value) {
                return $(value instanceof $.Event ? value.target : value)
            };
        DX.registerComponent("dxOverlay", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    activeStateEnabled: false,
                    visible: false,
                    deferRendering: true,
                    shading: true,
                    shadingColor: "",
                    position: {
                        my: "center",
                        at: "center",
                        of: window
                    },
                    width: function() {
                        return $(window).width() * 0.8
                    },
                    height: function() {
                        return $(window).height() * 0.8
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
                    closeOnOutsideClick: false,
                    showingAction: null,
                    shownAction: null,
                    hidingAction: null,
                    hiddenAction: null,
                    contentTemplate: "template",
                    targetContainer: undefined,
                    hideTopOverlayHandler: undefined,
                    closeOnTargetScroll: false,
                    positioningAction: null,
                    positionedAction: null
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function(device) {
                                var realDevice = DX.devices.real(),
                                    realPlatform = realDevice.platform,
                                    realVersion = realDevice.version;
                                return realPlatform === "android" && (realVersion[0] < 4 || realVersion[0] == 4 && realVersion[1] <= 1)
                            },
                            options: {animation: {
                                    show: {
                                        type: "fade",
                                        duration: 400
                                    },
                                    hide: {
                                        type: "fade",
                                        duration: 400,
                                        to: {opacity: 0},
                                        from: {opacity: 1}
                                    }
                                }}
                        }])
            },
            _optionsByReference: function() {
                return $.extend(this.callBase(), {animation: true})
            },
            _wrapper: function() {
                return this._$wrapper
            },
            _container: function() {
                return this._$container
            },
            _init: function() {
                this.callBase();
                this._initActions();
                this._initCloseOnOutsideClickHandler();
                this._$wrapper = $("<div>").addClass(OVERLAY_WRAPPER_CLASS);
                this._$container = $("<div>").addClass(OVERLAY_CONTENT_CLASS);
                var $element = this._element();
                this._$wrapper.addClass($element.attr("class"));
                $element.addClass(OVERLAY_CLASS);
                this._$wrapper.on("MSPointerDown", $.noop)
            },
            _clean: $.noop,
            _initOptions: function(options) {
                this._initTargetContainer(options.targetContainer);
                this._initHideTopOverlayHandler(options.hideTopOverlayHandler);
                this.callBase(options)
            },
            _initTargetContainer: function(targetContainer) {
                targetContainer = targetContainer === undefined ? DX.overlayTargetContainer() : targetContainer;
                var $element = this._element(),
                    $targetContainer = $element.closest(targetContainer);
                if (!$targetContainer.length)
                    $targetContainer = $(targetContainer).first();
                this._$targetContainer = $targetContainer.length ? $targetContainer : $element.parent()
            },
            _targetContainer: function() {
                return this._$targetContainer
            },
            _initHideTopOverlayHandler: function(handler) {
                this._hideTopOverlayHandler = handler !== undefined ? handler : $.proxy(this._defaultHideTopOverlayHandler, this)
            },
            _defaultHideTopOverlayHandler: function() {
                this.hide()
            },
            _initActions: function() {
                this._actions = {};
                $.each(ACTIONS, $.proxy(function(_, action) {
                    this._actions[action] = this._createActionByOption(action) || $.noop
                }, this))
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _dimensionChanged: function() {
                this._renderGeometry()
            },
            _initCloseOnOutsideClickHandler: function() {
                this._documentDownHandler = $.proxy(function() {
                    this._handleDocumentDown.apply(this, arguments)
                }, this)
            },
            _handleDocumentDown: function(e) {
                if (Z_INDEX_STACK[Z_INDEX_STACK.length - 1] !== this._zIndex)
                    return;
                var closeOnOutsideClick = this.option("closeOnOutsideClick");
                if ($.isFunction(closeOnOutsideClick))
                    closeOnOutsideClick = closeOnOutsideClick(e);
                if (closeOnOutsideClick) {
                    var $container = this._$container,
                        outsideClick = !$container.is(e.target) && !$.contains($container.get(0), e.target);
                    if (outsideClick) {
                        e.preventDefault();
                        this.hide()
                    }
                }
            },
            _renderVisibilityAnimate: function(visible) {
                if (visible)
                    this._showTimestamp = $.now();
                this._stopAnimation();
                if (visible)
                    return this._makeVisible();
                else
                    return this._makeHidden()
            },
            _updateRegistration: function(enabled) {
                if (enabled) {
                    if (!this._zIndex) {
                        var length = Z_INDEX_STACK.length;
                        this._zIndex = (length ? Z_INDEX_STACK[length - 1] : FIRST_Z_INDEX) + 1;
                        Z_INDEX_STACK.push(this._zIndex)
                    }
                }
                else if (this._zIndex) {
                    var index = $.inArray(this._zIndex, Z_INDEX_STACK);
                    Z_INDEX_STACK.splice(index, 1);
                    delete this._zIndex
                }
            },
            _normalizePosition: function() {
                this._position = this.option("position")
            },
            _makeVisible: function() {
                this._normalizePosition();
                var that = this,
                    deferred = $.Deferred(),
                    animation = that.option("animation") || {},
                    showAnimation = animation.show,
                    completeShowAnimation = showAnimation && showAnimation.complete || $.noop;
                this._updateRegistration(true);
                if (showAnimation && showAnimation.to) {
                    showAnimation = $.extend({type: "slide"}, showAnimation);
                    $.extend(showAnimation.to, {position: this._position})
                }
                if (this._isHidingActionCancelled) {
                    delete this._isHidingActionCancelled;
                    deferred.resolve()
                }
                else {
                    this._actions.showingAction();
                    this._$wrapper.css("z-index", this._zIndex);
                    this._$container.css("z-index", this._zIndex);
                    this._toggleVisibility(true);
                    this._animate(showAnimation, function() {
                        completeShowAnimation.apply(this, arguments);
                        that._actions.shownAction();
                        deferred.resolve()
                    })
                }
                return deferred.promise()
            },
            _makeHidden: function() {
                var that = this,
                    deferred = $.Deferred(),
                    animation = this.option("animation") || {},
                    hideAnimation = animation.hide,
                    completeHideAnimation = hideAnimation && hideAnimation.complete || $.noop;
                var hidingArgs = {cancel: false};
                this._actions.hidingAction(hidingArgs);
                if (hidingArgs.cancel) {
                    this._isHidingActionCancelled = true;
                    this.option("visible", true);
                    deferred.resolve()
                }
                else {
                    this._toggleShading(false);
                    this._animate(hideAnimation, function() {
                        that._toggleVisibility(false);
                        completeHideAnimation.apply(this, arguments);
                        that._updateRegistration(false);
                        that._actions.hiddenAction();
                        deferred.resolve()
                    })
                }
                return deferred.promise()
            },
            _animate: function(animation, completeCallback) {
                if (animation)
                    fx.animate(this._$container, $.extend({}, animation, {complete: completeCallback}));
                else
                    completeCallback()
            },
            _stopAnimation: function() {
                fx.stop(this._$container, true)
            },
            _toggleVisibility: function(visible) {
                this._stopAnimation();
                if (!visible)
                    utils.triggerHidingEvent(this.content());
                this.callBase.apply(this, arguments);
                this._$container.toggle(visible);
                this._toggleShading(visible);
                if (visible) {
                    this._renderContent();
                    this._moveToTargetContainer();
                    this._renderGeometry();
                    utils.triggerShownEvent(this.content())
                }
                else
                    this._moveFromTargetContainer();
                this._toggleSubscriptions(visible);
                this._updateRegistration(visible)
            },
            _toggleShading: function(visible) {
                this._$wrapper.toggleClass(OVERLAY_MODAL_CLASS, this.option("shading") && !this.option("targetContainer"));
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, visible && this.option("shading"));
                this._$wrapper.css("background-color", this.option("shading") ? this.option("shadingColor") : "")
            },
            _toggleSubscriptions: function(enabled) {
                this._toggleHideTopOverlayCallback(enabled);
                this._toggleDocumentDownHandler(enabled);
                this._toggleParentsScrollSubscription(enabled)
            },
            _toggleHideTopOverlayCallback: function(subscribe) {
                if (!this._hideTopOverlayHandler)
                    return;
                if (subscribe)
                    DX.hideTopOverlayCallback.add(this._hideTopOverlayHandler);
                else
                    DX.hideTopOverlayCallback.remove(this._hideTopOverlayHandler)
            },
            _toggleDocumentDownHandler: function(enabled) {
                var that = this,
                    eventName = events.addNamespace("dxpointerdown", that.NAME);
                if (enabled)
                    $(document).on(eventName, this._documentDownHandler);
                else
                    $(document).off(eventName, this._documentDownHandler)
            },
            _toggleParentsScrollSubscription: function(subscribe) {
                var position = this._position;
                if (!position || !position.of)
                    return;
                var that = this,
                    closeOnScroll = that.option("closeOnTargetScroll"),
                    scrollEventName = events.addNamespace("scroll", that.NAME),
                    $parents = getElement(position.of).parents().add(window);
                that._proxiedTargetScrollHandler = that._proxiedTargetScrollHandler || function() {
                    return that._targetScrollHandler.apply(that, arguments)
                };
                $parents[subscribe && closeOnScroll ? "on" : "off"](scrollEventName, that._proxiedTargetScrollHandler)
            },
            _targetScrollHandler: function(e) {
                var closeOnScroll = this.option("closeOnTargetScroll"),
                    closeHandled = false;
                if ($.isFunction(closeOnScroll))
                    closeHandled = closeOnScroll(e);
                if (!closeHandled)
                    this.hide()
            },
            _renderContent: function() {
                if (this._contentAlreadyRendered || !this.option("visible") && this.option("deferRendering"))
                    return;
                this._contentAlreadyRendered = true;
                this.callBase()
            },
            _renderContentImpl: function(template) {
                var $element = this._element(),
                    contentTemplate = template || this._getTemplate(this.option("contentTemplate"));
                this._$container.append($element.contents()).appendTo($element);
                if (contentTemplate)
                    contentTemplate.render(this.content())
            },
            _fireContentReadyAction: function() {
                if (this.option("visible"))
                    this._moveToTargetContainer();
                this.callBase.apply(this, arguments)
            },
            _moveFromTargetContainer: function() {
                this._$container.appendTo(this._element());
                this._detachWrapperToTargetContainer()
            },
            _detachWrapperToTargetContainer: function() {
                this._$wrapper.detach()
            },
            _moveToTargetContainer: function() {
                this._attachWrapperToTargetContainer();
                this._$container.appendTo(this._$wrapper)
            },
            _attachWrapperToTargetContainer: function() {
                var $element = this._element();
                if (this._$targetContainer && !(this._$targetContainer[0] === $element.parent()[0]))
                    this._$wrapper.appendTo(this._$targetContainer);
                else
                    this._$wrapper.appendTo($element)
            },
            _renderGeometry: function() {
                if (this.option("visible"))
                    this._renderGeometryImpl()
            },
            _renderGeometryImpl: function() {
                this._stopAnimation();
                this._normalizePosition();
                this._renderShading();
                this._renderDimensions();
                this._renderPosition()
            },
            _renderShading: function() {
                var $wrapper = this._$wrapper,
                    $targetContainer = this._getTargetContainer();
                $wrapper.css("position", $targetContainer.get(0) === window ? "fixed" : "absolute");
                if (this.option("shading"))
                    $wrapper.show();
                this._renderShadingDimensions();
                this._renderShadingPosition()
            },
            _renderShadingPosition: function() {
                if (this.option("shading")) {
                    var $targetContainer = this._getTargetContainer();
                    DX.position(this._$wrapper, {
                        my: "top left",
                        at: "top left",
                        of: $targetContainer
                    })
                }
            },
            _renderShadingDimensions: function() {
                if (this.option("shading")) {
                    var $targetContainer = this._getTargetContainer();
                    this._$wrapper.css({
                        width: $targetContainer.outerWidth(),
                        height: $targetContainer.outerHeight()
                    })
                }
            },
            _getTargetContainer: function() {
                var position = this._position,
                    targetContainer = this.option("targetContainer"),
                    positionOf = position ? position.of : null;
                return getElement(targetContainer || positionOf)
            },
            _renderDimensions: function() {
                this._$container.outerWidth(this.option("width")).outerHeight(this.option("height"))
            },
            _renderPosition: function() {
                translator.resetPosition(this._$container);
                var position = this._position,
                    containerPosition = DX.calculatePosition(this._$container, position);
                this._actions.positioningAction({position: containerPosition});
                var resultPosition = DX.position(this._$container, containerPosition);
                this._actions.positionedAction({position: resultPosition});
                forceRepaint(this._$container)
            },
            _dispose: function() {
                this._stopAnimation();
                this._toggleSubscriptions(false);
                this._updateRegistration(false);
                this._actions = null;
                this.callBase();
                this._$wrapper.remove();
                this._$container.remove()
            },
            _toggleDisabledState: function(value) {
                this.callBase.apply(this, arguments);
                this._$container.toggleClass(DISABLED_STATE_CLASS, value)
            },
            _toggleRTLDirection: function(rtl) {
                this._$container.toggleClass(RTL_DIRECTION_CLASS, rtl)
            },
            _optionChanged: function(name, value) {
                if ($.inArray(name, ACTIONS) > -1) {
                    this._initActions();
                    return
                }
                switch (name) {
                    case"shading":
                    case"shadingColor":
                        this._toggleShading(this.option("visible"));
                        break;
                    case"width":
                    case"height":
                    case"position":
                        this._renderGeometry();
                        break;
                    case"visible":
                        this._renderVisibilityAnimate(value).done($.proxy(function() {
                            if (!this._animateDeferred)
                                return;
                            this._animateDeferred.resolveWith(this);
                            delete this._animateDeferred
                        }, this));
                        break;
                    case"targetContainer":
                        this._initTargetContainer(value);
                        this._invalidate();
                        break;
                    case"deferRendering":
                    case"contentTemplate":
                        this._invalidate();
                        break;
                    case"closeOnOutsideClick":
                        this._toggleDocumentDownHandler(this.option("visible"));
                        break;
                    case"closeOnTargetScroll":
                        this._toggleParentsScrollSubscription(this.option("visible"));
                        break;
                    case"animation":
                        break;
                    case"rtlEnabled":
                        this._toggleRTLDirection(value);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            toggle: function(showing) {
                showing = showing === undefined ? !this.option("visible") : showing;
                if (showing === this.option("visible"))
                    return $.Deferred().resolve().promise();
                var animateDeferred = $.Deferred();
                this._animateDeferred = animateDeferred;
                this.option("visible", showing);
                return animateDeferred.promise()
            },
            show: function() {
                return this.toggle(true)
            },
            hide: function() {
                return this.toggle(false)
            },
            content: function() {
                return this._$container
            },
            repaint: function() {
                this._renderGeometry()
            }
        }));
        ui.dxOverlay.__internals = {
            OVERLAY_CLASS: OVERLAY_CLASS,
            OVERLAY_WRAPPER_CLASS: OVERLAY_WRAPPER_CLASS,
            OVERLAY_CONTENT_CLASS: OVERLAY_CONTENT_CLASS,
            OVERLAY_SHADER_CLASS: OVERLAY_SHADER_CLASS,
            OVERLAY_MODAL_CLASS: OVERLAY_MODAL_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.toast.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var TOAST_CLASS = "dx-toast",
            TOAST_CLASS_PREFIX = TOAST_CLASS + "-",
            TOAST_WRAPPER_CLASS = TOAST_CLASS_PREFIX + "wrapper",
            TOAST_CONTENT_CLASS = TOAST_CLASS_PREFIX + "content",
            TOAST_MESSAGE_CLASS = TOAST_CLASS_PREFIX + "message",
            TOAST_ICON_CLASS = TOAST_CLASS_PREFIX + "icon",
            WIDGET_NAME = "dxToast",
            toastTypes = ["info", "warning", "error", "success"];
        DX.registerComponent(WIDGET_NAME, ui.dxOverlay.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    message: "",
                    type: "info",
                    displayTime: 2000,
                    position: {
                        my: "bottom center",
                        at: "bottom center",
                        of: window,
                        offset: "0 -20"
                    },
                    animation: {
                        show: {
                            type: "fade",
                            duration: 400,
                            from: 0,
                            to: 1
                        },
                        hide: {
                            type: "fade",
                            duration: 400,
                            to: 0
                        }
                    },
                    shading: false,
                    height: "auto"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: {platform: "win8"},
                            options: {
                                position: {
                                    my: "top center",
                                    at: "top center",
                                    of: window,
                                    offset: "0 0"
                                },
                                width: function() {
                                    return $(window).width()
                                }
                            }
                        }])
            },
            _renderContentImpl: function() {
                if (this.option("message"))
                    this._message = $("<div>").addClass(TOAST_MESSAGE_CLASS).text(this.option("message")).appendTo(this.content());
                if ($.inArray(this.option("type").toLowerCase(), toastTypes) > -1)
                    this.content().prepend($("<div>").addClass(TOAST_ICON_CLASS));
                this.callBase()
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TOAST_CLASS);
                this._wrapper().addClass(TOAST_WRAPPER_CLASS);
                this._$container.addClass(TOAST_CLASS_PREFIX + String(this.option("type")).toLowerCase());
                this.content().addClass(TOAST_CONTENT_CLASS)
            },
            _makeVisible: function() {
                return this.callBase.apply(this, arguments).done($.proxy(function() {
                        clearTimeout(this._hideTimeout);
                        this._hideTimeout = setTimeout($.proxy(function() {
                            this.hide()
                        }, this), this.option("displayTime"))
                    }, this))
            },
            _dispose: function() {
                clearTimeout(this._hideTimeout);
                this.callBase()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"type":
                        this._$container.removeClass(TOAST_CLASS_PREFIX + prevValue);
                        this._$container.addClass(TOAST_CLASS_PREFIX + String(value).toLowerCase());
                        break;
                    case"message":
                        if (this._message)
                            this._message.text(value);
                        break;
                    case"displayTime":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxToast.__internals = {
            TOAST_CLASS: TOAST_CLASS,
            TOAST_WRAPPER_CLASS: TOAST_WRAPPER_CLASS,
            TOAST_CONTENT_CLASS: TOAST_CONTENT_CLASS,
            TOAST_MESSAGE_CLASS: TOAST_MESSAGE_CLASS,
            TOAST_ICON_CLASS: TOAST_ICON_CLASS,
            TOAST_CLASS_PREFIX: TOAST_CLASS_PREFIX,
            WIDGET_NAME: WIDGET_NAME
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.popup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            translator = DX.translator;
        var POPUP_CLASS = "dx-popup",
            POPUP_WRAPPER_CLASS = "dx-popup-wrapper",
            POPUP_FULL_SCREEN_CLASS = "dx-popup-fullscreen",
            POPUP_CONTENT_CLASS = "dx-popup-content",
            POPUP_DRAGGABLE_CLASS = "dx-popup-draggable",
            POPUP_TITLE_CLASS = "dx-popup-title",
            POPUP_TITLE_SELECTOR = "." + POPUP_TITLE_CLASS,
            POPUP_TITLE_CLOSEBUTTON_CLASS = "dx-closebutton",
            POPUP_TITLE_HAS_BUTTON_CLASS = "dx-popup-title-has-button",
            POPUP_BOTTOM_CLASS = "dx-popup-bottom",
            TOOLBAR_LEFT_CLASS = "dx-toolbar-before",
            TOOLBAR_RIGHT_CLASS = "dx-toolbar-after",
            OVERLAY_CONTENT_SELECTOR = ".dx-overlay-content",
            MIN_POPUP_STICK_SIZE = 40;
        var getButtonContainer = function(force) {
                var device = DX.devices.current(force),
                    container = {
                        cancel: {subclass: "dx-popup-cancel"},
                        clear: {subclass: "dx-popup-clear"},
                        done: {subclass: "dx-popup-done"}
                    };
                if (device.ios) {
                    $.extend(container.cancel, {
                        parent: POPUP_TITLE_SELECTOR,
                        wraperClass: TOOLBAR_LEFT_CLASS
                    });
                    $.extend(container.clear, {
                        parent: POPUP_TITLE_SELECTOR,
                        wraperClass: TOOLBAR_RIGHT_CLASS
                    });
                    $.extend(container.done, {wraperClass: POPUP_BOTTOM_CLASS})
                }
                if (device.android || device.platform === "desktop" || device.win8 || device.tizen || device.generic) {
                    $.extend(container.cancel, {wraperClass: POPUP_BOTTOM_CLASS});
                    $.extend(container.clear, {wraperClass: POPUP_BOTTOM_CLASS});
                    $.extend(container.done, {wraperClass: POPUP_BOTTOM_CLASS})
                }
                return container
            };
        DX.registerComponent("dxPopup", ui.dxOverlay.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    title: "",
                    showTitle: true,
                    fullScreen: false,
                    titleTemplate: "title",
                    dragEnabled: false,
                    cancelButton: null,
                    doneButton: null,
                    clearButton: null,
                    closeButton: null
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: {platform: "win8"},
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
                        }, {
                            device: [{platform: "ios"}, {platform: "ios7"}],
                            options: {animation: this._iosAnimation}
                        }, {
                            device: function(device) {
                                return DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {dragEnabled: true}
                        }])
            },
            _iosAnimation: {
                show: {
                    type: "slide",
                    duration: 400,
                    from: {position: {
                            my: "top",
                            at: "bottom",
                            of: window
                        }},
                    to: {position: {
                            my: "center",
                            at: "center",
                            of: window
                        }}
                },
                hide: {
                    type: "slide",
                    duration: 400,
                    from: {
                        opacity: 1,
                        position: {
                            my: "center",
                            at: "center",
                            of: window
                        }
                    },
                    to: {
                        opacity: 1,
                        position: {
                            my: "top",
                            at: "bottom",
                            of: window
                        }
                    }
                }
            },
            _init: function() {
                this.callBase();
                this._$content = this._container().wrapInner($("<div />").addClass(POPUP_CONTENT_CLASS)).children().eq(0)
            },
            _render: function() {
                this._element().addClass(POPUP_CLASS);
                this._wrapper().addClass(POPUP_WRAPPER_CLASS);
                this._container().toggleClass(POPUP_DRAGGABLE_CLASS, this.option("dragEnabled")).toggleClass(POPUP_FULL_SCREEN_CLASS, this.option("fullScreen"));
                this.callBase()
            },
            _renderContentImpl: function() {
                this.callBase(this.option("_templates").content);
                this._renderTitle();
                this._renderDrag();
                this._renderButtons()
            },
            _renderTitle: function() {
                if (this.option("showTitle")) {
                    this._$title = this._$title || $("<div />").addClass(POPUP_TITLE_CLASS);
                    this._$title.empty();
                    this._element().append(this._$title);
                    if (this.option("title"))
                        this._defaultTitleRender();
                    else {
                        var titleTemplate = this._getTemplateByOption("titleTemplate");
                        if (titleTemplate)
                            titleTemplate.render(this._$title)
                    }
                    this._$title.prependTo(this._container())
                }
                else if (this._$title)
                    this._$title.detach()
            },
            _renderDrag: function() {
                if (!this._$title)
                    return;
                var startEventName = events.addNamespace("dxdragstart", this.NAME),
                    updateEventName = events.addNamespace("dxdrag", this.NAME);
                this._$title.off(startEventName).off(updateEventName);
                if (!this.option("dragEnabled"))
                    return;
                this._$title.on(startEventName, $.proxy(this._handleTitleDragStart, this)).on(updateEventName, $.proxy(this._handleTitleDragUpdate, this))
            },
            _handleTitleDragStart: function(e) {
                e.targetElements = [];
                this._prevOffset = {
                    x: 0,
                    y: 0
                };
                this._dragHandled = true;
                var position = translator.locate(this._container()),
                    allowedOffsets = this._allowedOffsets();
                e.maxLeftOffset = position.left + allowedOffsets.left;
                e.maxRightOffset = -position.left + allowedOffsets.right;
                e.maxTopOffset = position.top + allowedOffsets.top;
                e.maxBottomOffset = -position.top + allowedOffsets.bottom
            },
            _handleTitleDragUpdate: function(e) {
                var position = translator.locate(this._container()),
                    offset = e.offset,
                    prevOffset = this._prevOffset;
                translator.move(this._container(), {
                    left: position.left + (offset.x - prevOffset.x),
                    top: position.top + (offset.y - prevOffset.y)
                });
                this._prevOffset = offset
            },
            _allowedOffsets: function() {
                var $container = this._container(),
                    $targetContainer = this._targetContainer(),
                    containerWidth = $container.outerWidth(),
                    targetContainerWidth = $targetContainer.width(),
                    targetContainerHeight = $targetContainer.height();
                return {
                        top: 0,
                        bottom: targetContainerHeight - MIN_POPUP_STICK_SIZE,
                        left: containerWidth - MIN_POPUP_STICK_SIZE,
                        right: targetContainerWidth - MIN_POPUP_STICK_SIZE
                    }
            },
            _renderButtons: function() {
                var buttonsName = DX.devices.current().win8 ? ["Close", "Done", "Clear", "Cancel"] : ["Close", "Cancel", "Clear", "Done"];
                buttonsName.extractButtonName = this.option("rtlEnabled") ? buttonsName.pop : buttonsName.shift;
                while (!!buttonsName.length) {
                    var buttonName = buttonsName.extractButtonName();
                    this["_render" + buttonName + "Button"]()
                }
            },
            _defaultTitleRender: function() {
                this._$title.text(this.option("title"))
            },
            _renderCloseButton: function() {
                var renderButtonRequired = !this.option("_templates").title && !!this.option("closeButton") && this.option("showTitle");
                this._$title && this._$title.toggleClass(POPUP_TITLE_HAS_BUTTON_CLASS, renderButtonRequired);
                if (renderButtonRequired) {
                    var clickAction = this._createButtonAction();
                    $("<div/>").addClass(POPUP_TITLE_CLOSEBUTTON_CLASS).on(ui.events.addNamespace("dxclick", this.NAME + "TitleCloseButton"), function(e) {
                        clickAction({jQueryEvent: e})
                    }).appendTo(this._$title)
                }
            },
            _renderCancelButton: function() {
                this._renderSpecificButton(this.option("cancelButton"), {
                    type: "cancel",
                    text: Globalize.localize("Cancel")
                })
            },
            _renderClearButton: function() {
                this._renderSpecificButton(this.option("clearButton"), {
                    type: "clear",
                    text: Globalize.localize("Clear")
                })
            },
            _renderDoneButton: function() {
                this._renderSpecificButton(this.option("doneButton"), {
                    type: "done",
                    text: Globalize.localize("Done")
                })
            },
            _renderSpecificButton: function(show, buttonConfig) {
                var renderParams = this._getRenderButtonParams(buttonConfig.type);
                this._removeButton(renderParams);
                this._wrapper().toggleClass(POPUP_CLASS + "-" + buttonConfig.type + "-visible", !!show);
                if (!show)
                    return;
                var userButtonOptions = this.option(buttonConfig.type + "Button");
                this._renderButton({
                    text: userButtonOptions.text || buttonConfig.text,
                    clickAction: this._createButtonAction(userButtonOptions.clickAction)
                }, renderParams)
            },
            _createButtonAction: function(clickAction) {
                return this._createAction(clickAction, {afterExecute: function(e) {
                            e.component.hide()
                        }})
            },
            _getRenderButtonParams: function(type) {
                return $.extend({}, getButtonContainer()[type])
            },
            _renderButton: function(buttonParams, renderParams) {
                var $button = $("<div/>").addClass(renderParams.subclass).dxButton(buttonParams),
                    $parentContainer = renderParams.parent ? this._container().find(renderParams.parent) : this._container(),
                    $buttonContainer = this._container().find("." + renderParams.wraperClass);
                if (!$buttonContainer.length)
                    $buttonContainer = $("<div/>").addClass(renderParams.wraperClass).appendTo($parentContainer);
                $button.appendTo($buttonContainer);
                this._container().find("." + POPUP_BOTTOM_CLASS).addClass(renderParams.subclass)
            },
            _removeButton: function(params) {
                var removeSelector = "." + (params.subclass || params.wraperClass);
                if (this.content())
                    this.content().removeClass(params.subclass);
                this._container().find(removeSelector).remove()
            },
            _renderGeometryImpl: function() {
                this.callBase.apply(this, arguments);
                this._setContentHeight()
            },
            _renderDimensions: function() {
                if (this.option("fullScreen"))
                    this._container().css({
                        width: "100%",
                        height: "100%"
                    });
                else
                    this.callBase.apply(this, arguments)
            },
            _renderShadingDimensions: function() {
                if (this.option("fullScreen"))
                    this._wrapper().css({
                        width: "100%",
                        height: "100%"
                    });
                else
                    this.callBase.apply(this, arguments)
            },
            _renderPosition: function() {
                if (this.option("fullScreen"))
                    translator.move(this._container(), {
                        top: 0,
                        left: 0
                    });
                else if (this._dragHandled) {
                    var $container = this._container(),
                        position = translator.locate($container),
                        allowedOffsets = this._allowedOffsets();
                    translator.move($container, {
                        top: Math.min(Math.max(-allowedOffsets.top, position.top), allowedOffsets.bottom),
                        left: Math.min(Math.max(-allowedOffsets.left, position.left), allowedOffsets.right)
                    })
                }
                else
                    this.callBase.apply(this, arguments)
            },
            _setContentHeight: function() {
                if (!this._$content)
                    return;
                var contentHeight = this._$container.height(),
                    hasBottomButtons = this.option("cancelButton") || this.option("doneButton") || this.option("clearButton"),
                    $bottomButtons = this._$wrapper.find(".dx-popup-bottom");
                if (this._$title)
                    contentHeight -= this._$title.outerHeight(true) || 0;
                if (hasBottomButtons) {
                    var bottomButtonsMargin = $bottomButtons.outerHeight(true) || 0;
                    contentHeight -= bottomButtonsMargin;
                    this._$content.css("margin-bottom", bottomButtonsMargin)
                }
                if (this.option("height") === "auto")
                    this._$content.css("height", "auto");
                else if (contentHeight > 0)
                    this._$content.css("height", contentHeight)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"visible":
                        delete this._dragHandled;
                        this.callBase.apply(this, arguments);
                        break;
                    case"showTitle":
                    case"title":
                    case"titleTemplate":
                        this._renderTitle();
                        this._renderCloseButton();
                        this._setContentHeight();
                        break;
                    case"dragEnabled":
                        this._renderDrag();
                        break;
                    case"cancelButton":
                        this._renderCancelButton();
                        break;
                    case"clearButton":
                        this._renderClearButton();
                        break;
                    case"doneButton":
                        this._renderDoneButton();
                        break;
                    case"closeButton":
                        this._renderCloseButton();
                        break;
                    case"height":
                        this.callBase.apply(this, arguments);
                        this._setContentHeight();
                        break;
                    case"fullScreen":
                        this._container().toggleClass(POPUP_FULL_SCREEN_CLASS, value);
                        this._refresh();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            content: function() {
                return this._$content
            },
            container: function() {
                return this._$container
            }
        }));
        ui.dxPopup.__internals = {
            POPUP_CLASS: POPUP_CLASS,
            POPUP_WRAPPER_CLASS: POPUP_WRAPPER_CLASS,
            POPUP_CONTENT_CLASS: POPUP_CONTENT_CLASS,
            POPUP_FULL_SCREEN_CLASS: POPUP_FULL_SCREEN_CLASS,
            POPUP_TITLE_CLASS: POPUP_TITLE_CLASS,
            POPUP_TITLE_CLOSEBUTTON_CLASS: POPUP_TITLE_CLOSEBUTTON_CLASS,
            POPUP_TITLE_HAS_BUTTON_CLASS: POPUP_TITLE_HAS_BUTTON_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.popover.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx;
        var POPOVER_CLASS = "dx-popover",
            POPOVER_WRAPPER_CLASS = "dx-popover-wrapper",
            POPOVER_ARROW_CLASS = "dx-popover-arrow",
            POPOVER_WITHOUT_TITLE_CLASS = "dx-popover-without-title",
            POSITION_FLIP_MAP = {
                left: "right",
                top: "bottom",
                right: "left",
                bottom: "top"
            },
            POSITION_ALIASES = {
                top: {
                    my: "bottom center",
                    at: "top center"
                },
                bottom: {
                    my: "top center",
                    at: "bottom center"
                },
                right: {
                    my: "left center",
                    at: "right center"
                },
                left: {
                    my: "right center",
                    at: "left center"
                },
                topNone: {
                    my: "bottom center",
                    at: "top center",
                    collision: "none"
                },
                bottomNone: {
                    my: "top center",
                    at: "bottom center",
                    collision: "none"
                },
                rightNone: {
                    my: "left center",
                    at: "right center",
                    collision: "none"
                },
                leftNone: {
                    my: "right center",
                    at: "left center",
                    collision: "none"
                }
            },
            DEFAULT_VIEWPORT_OFFSET = "10 10";
        DX.registerComponent("dxPopover", ui.dxPopup.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    target: window,
                    shading: false,
                    position: 'bottom',
                    closeOnOutsideClick: $.proxy(this._isOutsideClick, this),
                    animation: {
                        show: {
                            type: "fade",
                            from: 0,
                            to: 1
                        },
                        hide: {
                            type: "fade",
                            to: 0
                        }
                    },
                    showTitle: false,
                    width: "auto",
                    height: "auto",
                    dragEnabled: false,
                    fullScreen: false,
                    closeOnTargetScroll: true
                })
            },
            _defaultOptionsRules: function() {
                return []
            },
            _render: function() {
                this._element().addClass(POPOVER_CLASS);
                this._wrapper().addClass(POPOVER_WRAPPER_CLASS);
                this._renderArrow();
                this.callBase()
            },
            _renderArrow: function() {
                this._$arrow = $("<div>").addClass(POPOVER_ARROW_CLASS).appendTo(this._wrapper())
            },
            _setContentHeight: function(fullUpdate) {
                if (fullUpdate)
                    this.callBase()
            },
            _updateContentSize: function(containerLocation) {
                if (!this._$content)
                    return;
                var positionAt = this._position.at.split(" ")[0];
                if (containerLocation.h.oversize > 0 && (positionAt === "left" || positionAt === "right")) {
                    var newContainerWidth = this._$container.width() - containerLocation.h.oversize;
                    this._$container.width(newContainerWidth)
                }
                if (containerLocation.v.oversize > 0 && (positionAt === "top" || positionAt === "bottom")) {
                    var titleSize = this._$title ? this._$title.outerHeight() : 0,
                        newContainerHeight = this._$container.height() - containerLocation.v.oversize;
                    this._$container.height(newContainerHeight);
                    this._$content.outerHeight(newContainerHeight - titleSize)
                }
            },
            _isOutsideClick: function(e) {
                return !$(e.target).closest(this.option("target")).length
            },
            _animate: function(animation) {
                if (animation)
                    DX.fx.animate(this._$arrow, $.extend({}, animation, {complete: $.noop}));
                if (animation && animation.to)
                    $.extend(animation.to, {position: this._contentPosition});
                this.callBase.apply(this, arguments)
            },
            _stopAnimation: function() {
                this.callBase.apply(this, arguments);
                fx.stop(this._$arrow)
            },
            _renderTitle: function() {
                this._wrapper().toggleClass(POPOVER_WITHOUT_TITLE_CLASS, !this.option("showTitle"));
                this.callBase()
            },
            _isPopoverLargerThanTarget: function() {
                var position = this._position.at.split(" ")[0],
                    $target = $(this._position.of),
                    popoverSize,
                    targetSize;
                switch (position) {
                    case"top":
                    case"bottom":
                        popoverSize = this._$container.width();
                        targetSize = $target.outerWidth() + this._$arrow.width();
                        break;
                    case"left":
                    case"right":
                        popoverSize = this._$container.height();
                        targetSize = $target.outerHeight() + this._$arrow.height();
                        break
                }
                return popoverSize > targetSize / 2
            },
            _renderPosition: function() {
                this.callBase();
                this._renderOverlayPosition();
                this._renderArrowPosition()
            },
            _renderOverlayPosition: function() {
                this._setContentHeight(true);
                this._togglePositionClass("dx-position-" + this._positionAlias);
                DX.translator.move(this._$arrow, {
                    left: 0,
                    top: 0
                });
                DX.translator.move(this._$container, {
                    left: 0,
                    top: 0
                });
                var contentPosition = $.extend({}, this._position);
                var containerPosition = $.extend({}, contentPosition, {offset: this._$arrow.width() + " " + this._$arrow.height()}),
                    containerLocation = DX.calculatePosition(this._$container, containerPosition),
                    isFlippedByVertical = containerLocation.v.flip,
                    isFlippedByHorizontal = containerLocation.h.flip;
                this._updateContentSize(containerLocation);
                if (this._position.collision === "flip")
                    contentPosition.collision = "fit";
                var positionClass = "dx-position-" + (isFlippedByVertical || isFlippedByHorizontal ? POSITION_FLIP_MAP[this._positionAlias] : this._positionAlias);
                this._togglePositionClass(positionClass);
                if (isFlippedByVertical || isFlippedByHorizontal)
                    $.extend(contentPosition, {
                        my: contentPosition.at,
                        at: contentPosition.my
                    });
                contentPosition.offset = this._updateContentOffset(isFlippedByVertical, isFlippedByHorizontal, contentPosition.offset);
                DX.position(this._$container, contentPosition);
                this._contentPosition = contentPosition
            },
            _renderArrowPosition: function() {
                var isPopoverLarger = this._isPopoverLargerThanTarget(),
                    contentPositionMy = this._contentPosition.my.split(" ")[0],
                    contentPositionAt = this._contentPosition.at.split(" ")[0];
                var arrowPosition;
                if (isPopoverLarger)
                    arrowPosition = {
                        my: contentPositionMy,
                        at: contentPositionAt,
                        of: $(this.option("target"))
                    };
                else {
                    var arrowPosition = contentPositionAt;
                    arrowPosition = {
                        my: contentPositionAt,
                        at: contentPositionMy,
                        of: this._$container,
                        offset: this._updateArrowOffset(arrowPosition)
                    }
                }
                arrowPosition.my += " center";
                arrowPosition.at += " center";
                DX.position(this._$arrow, arrowPosition)
            },
            _renderShadingPosition: function() {
                if (this.option("shading"))
                    this._$wrapper.css({
                        top: 0,
                        left: 0
                    })
            },
            _renderShadingDimensions: function() {
                if (this.option("shading"))
                    this._$wrapper.css({
                        width: "100%",
                        height: "100%"
                    })
            },
            _togglePositionClass: function(positionClass) {
                this._$wrapper.removeClass("dx-position-left dx-position-right dx-position-top dx-position-bottom");
                this._$wrapper.addClass(positionClass)
            },
            _normalizePosition: function() {
                var position = this.option("position");
                if (DX.utils.isString(position))
                    position = $.extend({}, POSITION_ALIASES[position]);
                if (!position.of)
                    position.of = this.option("target");
                if (!position.collision)
                    position.collision = "flip";
                if (!position.boundaryOffset)
                    position.boundaryOffset = DEFAULT_VIEWPORT_OFFSET;
                this._positionAlias = position.at.split(" ")[0];
                this._position = position
            },
            _getOffsetObject: function(offset) {
                var result = DX.utils.stringPairToObject(offset);
                return {
                        h: result.x,
                        v: result.y
                    }
            },
            _updateContentOffset: function(isFlippedByVertical, isFlippedByHorizontal, offsetString) {
                var position = this._positionAlias,
                    offset = this._getOffsetObject(offsetString);
                var isTopPosition = position === "top" && !isFlippedByVertical || position === "bottom" && isFlippedByVertical,
                    isBottomPosition = position === "bottom" && !isFlippedByVertical || position === "top" && isFlippedByVertical,
                    isLeftPosition = position === "left" && !isFlippedByHorizontal || position === "right" && isFlippedByHorizontal,
                    isRightPosition = position === "right" && !isFlippedByHorizontal || position === "left" && isFlippedByHorizontal;
                if (isTopPosition)
                    return offset.h + " " + (offset.v - (this._$arrow.height() - 1));
                if (isBottomPosition)
                    return offset.h + " " + (offset.v + (this._$arrow.height() - 1));
                if (isLeftPosition)
                    return offset.h - (this._$arrow.width() - 1) + " " + offset.v;
                if (isRightPosition)
                    return offset.h + (this._$arrow.width() - 1) + " " + offset.v
            },
            _updateArrowOffset: function(position) {
                switch (position) {
                    case"top":
                        return "0 -1";
                    case"bottom":
                        return "0 1";
                    case"left":
                        return "-1 0";
                    case"right":
                        return "1 0"
                }
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"showTitle":
                    case"title":
                    case"titleTemplate":
                        this.callBase.apply(this, arguments);
                        this._normalizePosition();
                        this._renderPosition();
                        break;
                    case"target":
                        this._normalizePosition();
                        this._renderPosition();
                        break;
                    case"fullScreen":
                        if (value)
                            this.option("fullScreen", false);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxPopover.__internals = {
            POPOVER_CLASS: POPOVER_CLASS,
            POPOVER_WRAPPER_CLASS: POPOVER_WRAPPER_CLASS,
            POPOVER_ARROW_CLASS: POPOVER_ARROW_CLASS,
            POPOVER_WITHOUT_TITLE_CLASS: POPOVER_WITHOUT_TITLE_CLASS,
            DEFAULT_VIEWPORT_OFFSET: DEFAULT_VIEWPORT_OFFSET
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.tooltip.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            TOOLTIP_CLASS = "dx-tooltip",
            TOOLTIP_WRAPPER_CLASS = TOOLTIP_CLASS + "-wrapper";
        DX.registerComponent("dxTooltip", ui.dxPopover.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    showTitle: false,
                    title: undefined,
                    titleTemplate: undefined
                })
            },
            _render: function() {
                this._element().addClass(TOOLTIP_CLASS);
                this._wrapper().addClass(TOOLTIP_WRAPPER_CLASS);
                this.callBase()
            }
        }));
        ui.dxTooltip.__internals = {
            TOOLTIP_CLASS: TOOLTIP_CLASS,
            TOOLTIP_WRAPPER_CLASS: TOOLTIP_WRAPPER_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.slider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator,
            transionEndEventName = DX.support.transitionEndEventName;
        var SLIDER_CLASS = "dx-slider",
            SLIDER_WRAPPER_CLASS = SLIDER_CLASS + "-wrapper",
            SLIDER_HANDLE_CLASS = SLIDER_CLASS + "-handle",
            SLIDER_HANDLE_SELECTOR = "." + SLIDER_HANDLE_CLASS,
            SLIDER_BAR_CLASS = SLIDER_CLASS + "-bar",
            SLIDER_RANGE_CLASS = SLIDER_CLASS + "-range",
            SLIDER_RANGE_VISIBLE_CLASS = SLIDER_RANGE_CLASS + "-visible",
            SLIDER_LABEL_CLASS = SLIDER_CLASS + "-label",
            SLIDER_LABEL_POSITION_CLASS_PREFIX = SLIDER_LABEL_CLASS + "-position-",
            SLIDER_TOOLTIP_CLASS = SLIDER_CLASS + "-tooltip",
            SLIDER_TOOLTIP_POSITION_CLASS_PREFIX = SLIDER_TOOLTIP_CLASS + "-position-",
            SLIDER_TOOLTIP_ON_HOVER_ENABLED = SLIDER_TOOLTIP_CLASS + "-on-hover-enabled";
        DX.registerComponent("dxSliderHandle", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    activeStateEnabled: false,
                    hoverStateEnabled: false,
                    value: 50,
                    tooltipEnabled: false,
                    tooltipFormat: function(v) {
                        return v
                    },
                    tooltipPosition: "top",
                    tooltipShowMode: "onHover",
                    tooltipFitIn: null
                })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(SLIDER_HANDLE_CLASS);
                this._renderTooltip()
            },
            _renderTooltip: function() {
                if (this.option("tooltipEnabled")) {
                    if (!this._$tooltip) {
                        this._$tooltip = $("<div>").appendTo(this._element()).dxTooltip({
                            visible: true,
                            height: undefined,
                            target: this._element(),
                            closeOnOutsideClick: false,
                            closeOnTargetScroll: false,
                            targetContainer: this._element(),
                            hideTopOverlayHandler: null
                        });
                        this._tooltip = this._$tooltip.dxTooltip("instance")
                    }
                    this._renderTooltipPosition();
                    this._renderTooltipShowMode();
                    this._renderValue()
                }
                else
                    this._removeTooltip()
            },
            _visibilityChanged: function() {
                this._dimensionChanged()
            },
            _dimensionChanged: function() {
                this._repaintTooltip()
            },
            _removeTooltip: function() {
                if (!this._$tooltip)
                    return;
                this._$tooltip.remove();
                delete this._$tooltip;
                delete this._tooltip
            },
            _renderTooltipPosition: function() {
                if (!this._tooltip)
                    return;
                var position = this.option("tooltipPosition");
                if ($.type(position) === "string")
                    position = position + "None";
                this._tooltip.option("position", position)
            },
            _repaintTooltip: function() {
                if (this._tooltip)
                    this._tooltip.repaint()
            },
            _renderValue: function() {
                if (!this._tooltip)
                    return;
                var format = this.option("tooltipFormat"),
                    value = format(this.option("value"));
                this._tooltip.content().html(value);
                this._fitTooltipPosition()
            },
            _renderTooltipShowMode: function() {
                this._element().toggleClass("dx-slider-tooltip-on-hover", /^onhover$/i.test(this.option("tooltipShowMode")))
            },
            _fitTooltipPosition: function() {
                if (!this._$tooltip)
                    return;
                var $tooltipContent = this._tooltip.content().parent(),
                    tooltipWidth = $tooltipContent.outerWidth(),
                    $boundElement = this.option("tooltipFitIn"),
                    boundElementWidth = $boundElement.outerWidth(),
                    boundElementLeft = $boundElement.offset().left,
                    boundElementRight = boundElementLeft + boundElementWidth,
                    $element = this._element(),
                    elementWidth = $element.outerWidth(),
                    elementLeft = $element.offset().left,
                    elementRight = elementLeft + elementWidth,
                    idealOffset = Math.round(elementWidth / 2 - tooltipWidth / 2),
                    minOffset = Math.ceil(boundElementLeft - elementLeft),
                    maxOffset = Math.floor(boundElementRight - elementRight) + idealOffset * 2,
                    newOffset = Math.min(Math.max(minOffset, idealOffset), maxOffset);
                translator.move($tooltipContent, {left: newOffset})
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"tooltipFormat":
                        this._renderValue();
                        break;
                    case"value":
                        this._renderValue();
                        break;
                    case"tooltipEnabled":
                        this._renderTooltip();
                        break;
                    case"tooltipPosition":
                        this._renderTooltipPosition();
                        break;
                    case"tooltipShowMode":
                        this._renderTooltipShowMode();
                        break;
                    case"tooltipFitIn":
                        this._fitTooltipPosition();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            fitTooltipPosition: function() {
                this._fitTooltipPosition()
            },
            repaint: function() {
                this._repaintTooltip();
                this._renderTooltipPosition();
                this._fitTooltipPosition()
            }
        }));
        DX.registerComponent("dxSlider", ui.dxEditor.inherit({
            _activeStateUnit: SLIDER_HANDLE_SELECTOR,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    min: 0,
                    max: 100,
                    step: 1,
                    value: 50,
                    showRange: true,
                    tooltip: {
                        enabled: false,
                        format: function(value) {
                            return value
                        },
                        position: "top",
                        showMode: "onHover"
                    },
                    label: {
                        visible: false,
                        position: "bottom",
                        format: function(value) {
                            return value
                        }
                    }
                })
            },
            _render: function() {
                this._element().addClass(SLIDER_CLASS);
                this._renderBar();
                this._renderRange();
                this._renderWrapper();
                this._$wrapper.dxSwipeable({
                    elastic: false,
                    startAction: $.proxy(this._handleSwipeStart, this),
                    updateAction: $.proxy(this._handleSwipeUpdate, this),
                    endAction: $.proxy(this._handleSwipeEnd, this),
                    itemSizeFunc: $.proxy(this._itemWidthFunc, this)
                });
                this._renderHandle();
                this.callBase();
                this._renderValue();
                this._renderLabels();
                this._renderStartHandler()
            },
            _visibilityChanged: function() {
                this.repaint()
            },
            _renderWrapper: function() {
                this._$wrapper = $("<div>").addClass(SLIDER_WRAPPER_CLASS).append(this._$bar).appendTo(this._element())
            },
            _renderBar: function() {
                this._$bar = $("<div>").addClass(SLIDER_BAR_CLASS);
                this._$bar.off(transionEndEventName + "." + this.NAME).on(transionEndEventName, $.proxy(this._fitHandleTooltipPosition, this))
            },
            _renderRange: function() {
                this._$selectedRange = $("<div>").addClass(SLIDER_RANGE_CLASS).appendTo(this._$bar);
                this._renderRangeVisibility()
            },
            _renderRangeVisibility: function() {
                this._$selectedRange.toggleClass(SLIDER_RANGE_VISIBLE_CLASS, Boolean(this.option("showRange")))
            },
            _renderHandle: function() {
                this._$handle = this._renderHandleImpl(this.option("value"), this._$handle)
            },
            _renderHandleImpl: function(value, $element) {
                var $handle = $element || $("<div>").appendTo(this._$selectedRange),
                    format = this._normalizeFormat(this.option("tooltip.format")),
                    tooltipEnabled = this.option("tooltip.enabled"),
                    tooltipPosition = this.option("tooltip.position");
                this._element().toggleClass(SLIDER_TOOLTIP_ON_HOVER_ENABLED, tooltipEnabled && DX.devices.real().platform !== "ios").toggleClass(SLIDER_TOOLTIP_POSITION_CLASS_PREFIX + "bottom", tooltipEnabled && tooltipPosition === "bottom").toggleClass(SLIDER_TOOLTIP_POSITION_CLASS_PREFIX + "top", tooltipEnabled && tooltipPosition === "top");
                return $handle.dxSliderHandle({
                        value: value,
                        tooltipEnabled: tooltipEnabled,
                        tooltipPosition: tooltipPosition,
                        tooltipFormat: format,
                        tooltipShowMode: this.option("tooltip.showMode"),
                        tooltipFitIn: this._element()
                    })
            },
            _renderLabels: function() {
                this._element().removeClass(SLIDER_LABEL_POSITION_CLASS_PREFIX + "bottom").removeClass(SLIDER_LABEL_POSITION_CLASS_PREFIX + "top");
                if (this.option("label.visible")) {
                    var min = this.option("min"),
                        max = this.option("max"),
                        position = this.option("label.position"),
                        format = this._normalizeFormat(this.option("label.format"));
                    if (!this._$minLabel)
                        this._$minLabel = $("<div>").addClass(SLIDER_LABEL_CLASS).appendTo(this._$wrapper);
                    this._$minLabel.html(format(min));
                    if (!this._$maxLabel)
                        this._$maxLabel = $("<div>").addClass(SLIDER_LABEL_CLASS).appendTo(this._$wrapper);
                    this._$maxLabel.html(format(max));
                    this._element().addClass(SLIDER_LABEL_POSITION_CLASS_PREFIX + position)
                }
                else {
                    if (this._$minLabel) {
                        this._$minLabel.remove();
                        delete this._$minLabel
                    }
                    if (this._$maxLabel) {
                        this._$maxLabel.remove();
                        delete this._$maxLabel
                    }
                }
            },
            _normalizeFormat: function(formatSource) {
                var format = formatSource;
                if (typeof formatSource === "string")
                    format = function(value) {
                        return Globalize.format(value, formatSource)
                    };
                else if ($.isFunction(formatSource))
                    format = $.proxy(format, this);
                else
                    format = function(value) {
                        return value
                    };
                return format
            },
            _renderDimensions: function() {
                this.callBase();
                if (this._$bar) {
                    var barMarginWidth = this._$bar.outerWidth(true) - this._$bar.outerWidth();
                    this._$bar.width(this.option("width") - barMarginWidth)
                }
            },
            _renderStartHandler: function() {
                var eventName = events.addNamespace("dxpointerdown", this.NAME),
                    startAction = this._createAction($.proxy(this._handleStart, this), {excludeValidators: ["gesture"]});
                this._element().off(eventName).on(eventName, function(e) {
                    e.preventDefault();
                    startAction({jQueryEvent: e})
                })
            },
            _itemWidthFunc: function() {
                return this._element().width() / this._swipePixelRatio()
            },
            _handleSwipeStart: function(e) {
                var rtlEnabled = this.option("rtlEnabled"),
                    startOffset,
                    endOffset;
                this._startOffset = this._currentRatio;
                startOffset = this._startOffset * this._swipePixelRatio();
                endOffset = (1 - this._startOffset) * this._swipePixelRatio();
                e.jQueryEvent.maxLeftOffset = rtlEnabled ? endOffset : startOffset;
                e.jQueryEvent.maxRightOffset = rtlEnabled ? startOffset : endOffset;
                this._swipeHandled = true
            },
            _handleSwipeEnd: function(e) {
                var offsetDirection = this.option("rtlEnabled") ? -1 : 1;
                delete this._swipeHandled;
                this._changeValueOnSwipe(this._startOffset + offsetDirection * e.jQueryEvent.targetOffset / this._swipePixelRatio());
                delete this._startOffset;
                this._renderValue()
            },
            _activeHandle: function() {
                return this._$handle
            },
            _handleSwipeUpdate: function(e) {
                this._valueChangeEventInstance = e;
                this._updateHandlePosition(e)
            },
            _updateHandlePosition: function(e) {
                var offsetDirection = this.option("rtlEnabled") ? -1 : 1;
                var newRatio = this._startOffset + offsetDirection * e.jQueryEvent.offset / this._swipePixelRatio();
                this._$selectedRange.width(newRatio * 100 + "%");
                this._changeValueOnSwipe(newRatio)
            },
            _swipePixelRatio: function() {
                var min = this.option("min"),
                    max = this.option("max"),
                    step = this._valueStep();
                return (max - min) / step
            },
            _valueStep: function() {
                var step = this.option("step");
                if (!step || isNaN(step))
                    step = 1;
                step = parseFloat(step.toFixed(5));
                if (step === 0)
                    step = 0.00001;
                return step
            },
            _changeValueOnSwipe: function(ratio) {
                var min = this.option("min"),
                    max = this.option("max"),
                    step = this._valueStep(),
                    newChange = ratio * (max - min),
                    newValue = min + newChange;
                if (step < 0)
                    return;
                if (newValue === max || newValue === min)
                    this.option("value", newValue);
                else {
                    var stepChunks = (step + "").split('.'),
                        exponent = stepChunks.length > 1 ? stepChunks[1].length : exponent;
                    newValue = Number((Math.round(newChange / step) * step + min).toFixed(exponent));
                    this.option("value", Math.max(Math.min(newValue, max), min))
                }
            },
            _handleStart: function(args) {
                var e = args.jQueryEvent;
                if (events.needSkipEvent(e))
                    return;
                this._feedbackOn(this._activeHandle(), true);
                this._currentRatio = (ui.events.eventData(e).x - this._$bar.offset().left) / this._$bar.width();
                if (this.option("rtlEnabled"))
                    this._currentRatio = 1 - this._currentRatio;
                this._valueChangeEventInstance = e;
                this._changeValueOnSwipe(this._currentRatio)
            },
            _renderValue: function() {
                var val = this.option("value"),
                    min = this.option("min"),
                    max = this.option("max");
                if (min > max)
                    return;
                if (val < min) {
                    this.option("value", min);
                    this._currentRatio = 0;
                    return
                }
                if (val > max) {
                    this.option("value", max);
                    this._currentRatio = 1;
                    return
                }
                var ratio = min === max ? 0 : (val - min) / (max - min);
                this._animateRange({width: ratio * 100 + "%"});
                this._currentRatio = ratio;
                this._activeHandle().dxSliderHandle("option", "value", this.option("value"))
            },
            _animateRange: function(configTo) {
                fx.stop(this._$selectedRange);
                if (!this._swipeHandled)
                    fx.animate(this._$selectedRange, {
                        type: "custom",
                        duration: 100,
                        to: configTo,
                        complete: $.proxy(this._fitHandleTooltipPosition, this)
                    })
            },
            _fitHandleTooltipPosition: function() {
                if (this._activeHandle())
                    this._activeHandle().dxSliderHandle("fitTooltipPosition")
            },
            _repaintHandle: function() {
                this._$handle.dxSliderHandle("repaint")
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"visible":
                        this.callBase.apply(this, arguments);
                        this._renderHandle();
                        this._repaintHandle();
                        break;
                    case"min":
                    case"max":
                        this._renderValue();
                        this._renderLabels();
                        break;
                    case"step":
                        this._renderValue();
                        break;
                    case"value":
                        this._renderValue();
                        this.callBase.apply(this, arguments);
                        break;
                    case"showRange":
                        this._renderRangeVisibility();
                        break;
                    case"tooltip":
                        this._renderHandle();
                        break;
                    case"label":
                        this._renderLabels();
                        break;
                    case"rtlEnabled":
                        this._toggleRTLDirection();
                        this._renderValue();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _dispose: function() {
                fx.stop(this._$selectedRange);
                this.callBase.apply(this, arguments)
            },
            _refresh: function() {
                this._renderDimensions();
                this._renderValue();
                this._renderHandle()
            },
            _feedbackOff: function(immediate, isGestureStart) {
                if (immediate && !isGestureStart)
                    return;
                this.callBase.apply(this, arguments)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.rangeSlider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SLIDER_HANDLE_CLASS = "dx-slider-handle",
            RANGE_SLIDER_CLASS = "dx-range-slider",
            RANGE_SLIDER_START_HANDLE_CLASS = RANGE_SLIDER_CLASS + "-start-handle";
        DX.registerComponent("dxRangeSlider", ui.dxSlider.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    start: 40,
                    end: 60,
                    value: 50
                })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(RANGE_SLIDER_CLASS)
            },
            _renderHandle: function() {
                this._$handleStart = this._renderHandleImpl(this.option("start"), this._$handleStart).addClass(RANGE_SLIDER_START_HANDLE_CLASS);
                this._$handleEnd = this._renderHandleImpl(this.option("end"), this._$handleEnd)
            },
            _handleStart: function(args) {
                var e = args.jQueryEvent,
                    $range = this._$selectedRange,
                    rangeWidth = $range.width(),
                    eventOffsetX = events.eventData(e).x - this._$bar.offset().left,
                    startHandleX = $range.position().left,
                    endHandleX = $range.position().left + rangeWidth,
                    rtlEnabled = this.option("rtlEnabled"),
                    startHandleIsClosest = (rtlEnabled ? -1 : 1) * ((startHandleX + endHandleX) / 2 - eventOffsetX) > 0;
                this._feedbackOff(true, true);
                this._capturedHandle = startHandleIsClosest ? this._$handleStart : this._$handleEnd;
                this.callBase(args)
            },
            _activeHandle: function() {
                return this._capturedHandle
            },
            _updateHandlePosition: function(e) {
                var rtlEnabled = this.option("rtlEnabled"),
                    offsetDirection = rtlEnabled ? -1 : 1,
                    max = this.option("max"),
                    min = this.option("min");
                var newRatio = this._startOffset + offsetDirection * e.jQueryEvent.offset / this._swipePixelRatio(),
                    newRatio = newRatio.toPrecision(12),
                    newValue = newRatio * (max - min) + min;
                this._updateSelectedRangePosition(newRatio, newRatio);
                this._changeValueOnSwipe(newRatio);
                var startValue = this.option("start"),
                    endValue = this.option("end"),
                    $nextHandle;
                if (startValue === endValue) {
                    if (newValue < startValue)
                        $nextHandle = this._$handleStart;
                    else
                        $nextHandle = this._$handleEnd;
                    if ($nextHandle && $nextHandle !== this._capturedHandle) {
                        this._updateSelectedRangePosition((startValue - min) / (max - min), (endValue - min) / (max - min));
                        this._feedbackOff(true, true);
                        this._feedbackOn($nextHandle, true);
                        this._capturedHandle = $nextHandle
                    }
                    this._updateSelectedRangePosition(newRatio, newRatio);
                    this._changeValueOnSwipe(newRatio)
                }
            },
            _updateSelectedRangePosition: function(leftRatio, rightRatio) {
                var rtlEnabled = this.option("rtlEnabled"),
                    moveRight = this._capturedHandle === this._$handleStart && rtlEnabled || this._capturedHandle === this._$handleEnd && !rtlEnabled;
                var prop = moveRight ? "right" : "left";
                if (rtlEnabled ^ moveRight)
                    this._$selectedRange.css(prop, 100 - rightRatio * 100 + "%");
                else
                    this._$selectedRange.css(prop, leftRatio * 100 + "%")
            },
            _changeValueOnSwipe: function(ratio) {
                this._suppressValueChangeAction();
                this.callBase(ratio);
                this._resumeValueChangeAction();
                var option = this._capturedHandle === this._$handleStart ? "start" : "end",
                    start = this.option("start"),
                    end = this.option("end"),
                    newValue = this.option("value"),
                    max = this.option("max"),
                    min = this.option("min");
                if (start > max) {
                    start = max;
                    this.option("start", max)
                }
                if (start < min) {
                    start = min;
                    this.option("start", min)
                }
                if (end > max) {
                    end = max;
                    this.option("end", max)
                }
                if (newValue > end && option === "start")
                    newValue = end;
                if (newValue < start && option === "end")
                    newValue = start;
                this.option(option, newValue)
            },
            _renderValue: function() {
                var valStart = this.option("start"),
                    valEnd = this.option("end"),
                    min = this.option("min"),
                    max = this.option("max"),
                    rtlEnabled = this.option("rtlEnabled");
                valStart = Math.max(min, Math.min(valStart, max));
                valEnd = Math.max(valStart, Math.min(valEnd, max));
                this.option("start", valStart);
                this.option("end", valEnd);
                var ratio1 = max === min ? 0 : (valStart - min) / (max - min),
                    ratio2 = max === min ? 0 : (valEnd - min) / (max - min);
                var startOffset = parseFloat((ratio1 * 100).toPrecision(12)) + "%",
                    endOffset = parseFloat(((1 - ratio2) * 100).toPrecision(12)) + "%";
                this._animateRange({
                    right: rtlEnabled ? startOffset : endOffset,
                    left: rtlEnabled ? endOffset : startOffset
                });
                this._renderHandle()
            },
            _repaintHandle: function() {
                this._$handleStart.dxSliderHandle("repaint");
                this._$handleEnd.dxSliderHandle("repaint")
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"start":
                    case"end":
                        this._renderValue();
                        this._createActionByOption("valueChangeAction")({
                            start: this.option("start"),
                            end: this.option("end")
                        });
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.calendar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            support = DX.support,
            events = ui.events,
            utils = DX.utils,
            CALENDAR_CLASS = "dx-calendar",
            CALENDAR_BODY_CLASS = "dx-calendar-body",
            CALENDAR_NAVIGATOR_CLASS = "dx-calendar-navigator",
            CALENDAR_OTHER_MONTH_CLASS = "dx-calendar-other-month",
            CALENDAR_EMPTY_CELL_CLASS = "dx-calendar-empty-cell",
            CALENDAR_DISABLED_NAVIGATOR_LINK_CLASS = "dx-calendar-disabled-navigator-link",
            CALENDAR_TODAY_CLASS = "dx-calendar-today",
            CALENDAR_SELECTED_DATE_CLASS = "dx-calendar-selected-date",
            CALENDAR_CONTOURED_DATE_CLASS = "dx-calendar-contoured-date",
            CALENDAR_NAVIGATOR_PREVIOUS_YEAR_CLASS = "dx-calendar-navigator-previous-year",
            CALENDAR_NAVIGATOR_PREVIOUS_MONTH_CLASS = "dx-calendar-navigator-previous-month",
            CALENDAR_NAVIGATOR_NEXT_MONTH_CLASS = "dx-calendar-navigator-next-month",
            CALENDAR_NAVIGATOR_NEXT_YEAR_CLASS = "dx-calendar-navigator-next-year",
            CALENDAR_MONTHVIEW_VALUECHANGED_EVENT_NAME = "dxCalendar.MonthView.ValueChanged",
            CALENDAR_MONTHVIEW_CONTOUREDDATECHANGED_EVENT_NAME = "dxCalendar.MonthView.ContouredDateChanged",
            CALENDAR_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", "dxCalendar"),
            CALENDAR_BLUR_EVENT_NAME = events.addNamespace("blur", "dxCalendar");
        var BaseView = DX.Class.inherit({
                ctor: function(options) {
                    this.date = options.date || new Date;
                    this.rtl = options.rtl
                },
                render: function(rootElement) {
                    this.rootElement = rootElement;
                    this.renderCore()
                },
                renderCore: $.noop
            }),
            views = {MonthView: BaseView.inherit({
                    ctor: function(options) {
                        options = options || {};
                        this.callBase(options);
                        this.firstDayOfWeek = options.firstDayOfWeek || 0;
                        if (options.keyDownProcessor && !options.disabled)
                            this.keyDownProcessor = options.keyDownProcessor.reinitialize(this.keyDownHandler, this);
                        if (options.contouredDate)
                            this.contouredDate = this.calculateContouredDate(options.contouredDate, options.value);
                        this.weeks = 6;
                        this.days = 7;
                        this.initialValue = options.value;
                        this.keyboardNavigationUsed = options.keyboardNavigationUsed;
                        this.min = options.min;
                        this.max = options.max;
                        this.disabled = options.disabled
                    },
                    dispose: function() {
                        if (this.keyDownProcessor)
                            this.keyDownProcessor.dispose();
                        $(this.table).remove()
                    },
                    detachKeyDownProcessor: function() {
                        var processor = this.keyDownProcessor;
                        this.keyDownProcessor = undefined;
                        return processor
                    },
                    renderCore: function() {
                        var that = this;
                        this.table = document.createElement("table");
                        this.renderHeader();
                        this.renderBody();
                        this.setValue(this.initialValue);
                        if (!this.disabled)
                            $(this.table).off(CALENDAR_DXCLICK_EVENT_NAME).on(CALENDAR_DXCLICK_EVENT_NAME, "td", function(e) {
                                that.cellClickHandler(e)
                            });
                        if (!this.keyDownProcessor && !this.disabled) {
                            this.table.setAttribute("tabindex", -1);
                            this.keyDownProcessor = new ui.HierarchicalKeyDownProcessor({
                                element: this.table,
                                handler: this.keyDownHandler,
                                context: this
                            })
                        }
                        this.setContouredDate(this.contouredDate, true);
                        this.rootElement.appendChild(this.table)
                    },
                    renderHeader: function() {
                        var that = this,
                            header = this.table.createTHead(),
                            headerRow = header.insertRow(-1),
                            th,
                            caption;
                        this.iterateDays(function(i) {
                            th = document.createElement("th");
                            caption = document.createTextNode(that.getDayCaption(that.firstDayOfWeek + i));
                            th.appendChild(caption);
                            headerRow.appendChild(th)
                        })
                    },
                    renderBody: function() {
                        var that = this,
                            tbody = document.createElement("tbody"),
                            i,
                            row,
                            cell,
                            cellDate,
                            caption,
                            today = new Date;
                        this.table.appendChild(tbody);
                        for (i = 0; i < this.weeks; ++i) {
                            row = tbody.insertRow(-1);
                            this.iterateDays(function(j) {
                                cell = row.insertCell(-1);
                                cellDate = that.getDate(i, j);
                                if (utils.sameMonthAndYear(cellDate, today) && cellDate.getDate() === today.getDate())
                                    cell.setAttribute("class", CALENDAR_TODAY_CLASS);
                                if (!utils.dateInRange(cellDate, that.min, that.max))
                                    cell.setAttribute("class", CALENDAR_EMPTY_CELL_CLASS);
                                else if (cellDate.getMonth() !== that.date.getMonth())
                                    cell.setAttribute("class", CALENDAR_OTHER_MONTH_CLASS);
                                cell.setAttribute("data-value", that.getShortDate(cellDate));
                                caption = document.createTextNode(cellDate.getDate());
                                cell.appendChild(caption)
                            })
                        }
                    },
                    getDayCaption: function(day) {
                        day = day < 7 ? day : Math.abs(day % 7);
                        return Globalize.culture().calendar.days.namesShort[day]
                    },
                    getNavigatorCaption: function() {
                        var navigatorMonth = Globalize.culture().calendar.months.names[this.date.getMonth()],
                            navigatorYear = this.date.getFullYear();
                        return this.rtl ? navigatorYear + " " + navigatorMonth : navigatorMonth + " " + navigatorYear
                    },
                    getDate: function(week, day) {
                        var firstDay = utils.getFirstMonthDate(this.date),
                            firstMonthDayPosition = firstDay.getDay() - this.firstDayOfWeek,
                            firstWeekDay = 7 * week - firstMonthDayPosition;
                        firstWeekDay = firstMonthDayPosition < 0 ? firstWeekDay - 7 : firstWeekDay;
                        firstDay.setDate(firstDay.getDate() + firstWeekDay + day);
                        return firstDay
                    },
                    getShortDate: function(date) {
                        return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate()
                    },
                    getDateFromShortDate: function(shortDate) {
                        var dateParts = shortDate.split("/");
                        return new Date(dateParts[0], dateParts[1], dateParts[2])
                    },
                    iterateDays: function(delegate) {
                        var i = this.rtl ? this.days - 1 : 0;
                        while (this.rtl ? i >= 0 : i < this.days) {
                            delegate(i);
                            this.rtl ? --i : ++i
                        }
                    },
                    cellClickHandler: function(e) {
                        var cellDate = this.getDateFromShortDate(e.target.getAttribute("data-value"));
                        if (utils.dateInRange(cellDate, this.min, this.max)) {
                            if (this.table.getAttribute("tabindex") && this.table !== document.activeElement)
                                $(this.table).focus();
                            this.setValue(cellDate, e.target)
                        }
                    },
                    keyDownHandler: function(options) {
                        var dayDifference,
                            contouredDate;
                        switch (options.key) {
                            case"leftArrow":
                                this.keyboardNavigationUsed = true;
                                dayDifference = this.rtl ? 1 : -1;
                                break;
                            case"rightArrow":
                                this.keyboardNavigationUsed = true;
                                dayDifference = this.rtl ? -1 : 1;
                                break;
                            case"upArrow":
                                this.keyboardNavigationUsed = true;
                                dayDifference = -7;
                                break;
                            case"downArrow":
                                this.keyboardNavigationUsed = true;
                                dayDifference = 7;
                                break;
                            case"enter":
                                this.keyboardNavigationUsed = true;
                                if (this.contouredDate)
                                    this.setValue(this.contouredDate, this.tryGetCell(this.contouredDate));
                                return;
                            default:
                                return
                        }
                        options.originalEvent.stopPropagation();
                        options.originalEvent.preventDefault();
                        contouredDate = this.calculateContouredDate(this.contouredDate, this.value);
                        this.setContouredDate(new Date(contouredDate.getFullYear(), contouredDate.getMonth(), contouredDate.getDate() + dayDifference))
                    },
                    calculateContouredDate: function(contouredDate, value) {
                        var calculatedContouredDate;
                        if (utils.sameMonthAndYear(contouredDate, this.date))
                            calculatedContouredDate = contouredDate;
                        if (!calculatedContouredDate && utils.sameMonthAndYear(value, this.date))
                            calculatedContouredDate = value;
                        return calculatedContouredDate || utils.getFirstMonthDate(this.date)
                    },
                    setContouredDate: function(date, suppressChangedEvent) {
                        if (this.keyboardNavigationUsed) {
                            date = utils.normalizeDate(date, this.min, this.max);
                            var dateCell;
                            if (this.contouredDate) {
                                dateCell = this.tryGetCell(this.contouredDate);
                                if (dateCell)
                                    dateCell.removeClass(CALENDAR_CONTOURED_DATE_CLASS)
                            }
                            this.contouredDate = date;
                            dateCell = this.tryGetCell(this.contouredDate);
                            if (dateCell)
                                dateCell.addClass(CALENDAR_CONTOURED_DATE_CLASS);
                            if (!suppressChangedEvent)
                                $(this.table).trigger(CALENDAR_MONTHVIEW_CONTOUREDDATECHANGED_EVENT_NAME, date)
                        }
                    },
                    setValue: function(value, cell) {
                        if (this.value !== value) {
                            this.value = value;
                            this.onValueChanged(value, cell)
                        }
                    },
                    tryGetCell: function(date) {
                        var foundCell = date ? $(this.table).find("td[data-value='" + this.getShortDate(date) + "']") : [];
                        return foundCell.length > 0 ? foundCell : undefined
                    },
                    onValueChanged: function(newValue, selectedCell) {
                        $(this.selectedCell).removeClass(CALENDAR_SELECTED_DATE_CLASS);
                        this.selectedCell = selectedCell || this.tryGetCell(newValue);
                        $(this.selectedCell).addClass(CALENDAR_SELECTED_DATE_CLASS);
                        if (selectedCell) {
                            this.setContouredDate(newValue);
                            $(this.rootElement).trigger(CALENDAR_MONTHVIEW_VALUECHANGED_EVENT_NAME, newValue)
                        }
                    }
                })};
        DX.registerComponent("dxCalendar", ui.dxEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    monthViewType: views.MonthView,
                    firstDayOfWeek: 1,
                    min: undefined,
                    max: undefined
                })
            },
            _initOptions: function(options) {
                options.currentDate = utils.normalizeDate(options.currentDate || options.value || new Date, options.min, options.max);
                this.callBase(options)
            },
            _clean: function() {
                if (!this.option("keyDownProcessor") && this._keyDownProcessor)
                    this._keyDownProcessor.dispose();
                if (this._view)
                    this._view.dispose();
                this.callBase()
            },
            _refresh: function() {
                this._render()
            },
            _render: function() {
                var that = this,
                    viewKeyDownProcessor;
                this.callBase();
                this._element().addClass(CALENDAR_CLASS);
                this._initializeKeyDownProcessor();
                this._oldView = this._view;
                viewKeyDownProcessor = this._oldView ? this._oldView.detachKeyDownProcessor() : this._keyDownProcessor.attachChildProcessor();
                this._view = this._initializeMonthView(viewKeyDownProcessor);
                this._renderNavigator();
                if (!this._body) {
                    this._body = $("<div />").addClass(CALENDAR_BODY_CLASS);
                    this._element().append(this._body)
                }
                this._renderMonthView();
                if (!this._swipeable)
                    this._swipeable = this._element().dxSwipeable({
                        elastic: false,
                        startAction: function(e) {
                            that._handleSwipeStart(e)
                        },
                        updateAction: $.noop,
                        endAction: function(e) {
                            that._handleSwipeEnd(e)
                        },
                        itemWidthFunc: function() {
                            return this._element().width()
                        }
                    }).dxSwipeable("instance")
            },
            _initializeKeyDownProcessor: function() {
                var that = this;
                this._keyDownProcessor = this._keyDownProcessor || this.option("keyDownProcessor");
                if (!this._keyDownProcessor) {
                    this._element().attr("tabindex", -1).on(CALENDAR_DXCLICK_EVENT_NAME, function() {
                        that._element().focus()
                    }).on(CALENDAR_BLUR_EVENT_NAME, function() {
                        that._view.setContouredDate(undefined)
                    });
                    this._keyDownProcessor = new ui.HierarchicalKeyDownProcessor({element: this._element()})
                }
                this._keyDownProcessor.reinitialize(this._keyDownHandler, this)
            },
            _keyDownHandler: function(options) {
                var monthDifference;
                switch (options.key) {
                    case"leftArrow":
                        if (options.ctrl)
                            monthDifference = this.option("rtlEnabled") ? 1 : -1;
                        break;
                    case"rightArrow":
                        if (options.ctrl)
                            monthDifference = this.option("rtlEnabled") ? -1 : 1;
                        break;
                    case"pageUp":
                        monthDifference = -1;
                        break;
                    case"pageDown":
                        monthDifference = 1;
                        break;
                    default:
                        break
                }
                if (monthDifference) {
                    options.originalEvent.stopPropagation();
                    options.originalEvent.preventDefault();
                    this._navigate(monthDifference)
                }
                else
                    return true
            },
            _handleSwipeStart: function(e) {
                this._swipeInProgress = true
            },
            _handleSwipeEnd: function(e) {
                if (this._swipeInProgress) {
                    this._swipeInProgress = false;
                    if (e.jQueryEvent.targetOffset !== 0)
                        this._navigate(this.option("rtlEnabled") ? e.jQueryEvent.targetOffset : -e.jQueryEvent.targetOffset)
                }
            },
            _initializeMonthView: function(keyDownProcessor) {
                var monthViewType = this.option("monthViewType");
                return new monthViewType({
                        date: this.option("currentDate"),
                        min: this.option("min"),
                        max: this.option("max"),
                        firstDayOfWeek: this.option("firstDayOfWeek"),
                        value: this.option("value"),
                        rtl: this.option("rtlEnabled"),
                        disabled: this.option("disabled") || DevExpress.designMode,
                        keyDownProcessor: keyDownProcessor,
                        contouredDate: this._oldView ? this._oldView.contouredDate : undefined,
                        keyboardNavigationUsed: this._oldView ? this._oldView.keyboardNavigationUsed : undefined
                    })
            },
            _renderNavigator: function() {
                var that = this,
                    previousYearLinkDelta = this.option("rtlEnabled") ? 12 : -12,
                    previousMonthLinkDelta = this.option("rtlEnabled") ? 1 : -1,
                    nextMonthLinkDelta = this.option("rtlEnabled") ? -1 : 1,
                    nextYearLinkDelta = this.option("rtlEnabled") ? -12 : 12;
                if (this._navigator)
                    this._navigatorCaption.html(this._view.getNavigatorCaption());
                else {
                    this._previousYearLink = $("<a href='javascript:void(0)'></a>").addClass(CALENDAR_NAVIGATOR_PREVIOUS_YEAR_CLASS);
                    this._previousMonthLink = $("<a href='javascript:void(0)'></a>").addClass(CALENDAR_NAVIGATOR_PREVIOUS_MONTH_CLASS);
                    this._navigatorCaption = $("<span />").html(this._view.getNavigatorCaption()),
                    this._nextMonthLink = $("<a href='javascript:void(0)'></a>").addClass(CALENDAR_NAVIGATOR_NEXT_MONTH_CLASS);
                    this._nextYearLink = $("<a href='javascript:void(0)'></a>").addClass(CALENDAR_NAVIGATOR_NEXT_YEAR_CLASS);
                    if (!(this.option("disabled") || DevExpress.designMode)) {
                        this._previousYearLink.off(CALENDAR_DXCLICK_EVENT_NAME).on(CALENDAR_DXCLICK_EVENT_NAME, function() {
                            that._navigate(previousYearLinkDelta)
                        });
                        this._previousMonthLink.off(CALENDAR_DXCLICK_EVENT_NAME).on(CALENDAR_DXCLICK_EVENT_NAME, function() {
                            that._navigate(previousMonthLinkDelta)
                        });
                        this._nextMonthLink.off(CALENDAR_DXCLICK_EVENT_NAME).on(CALENDAR_DXCLICK_EVENT_NAME, function() {
                            that._navigate(nextMonthLinkDelta)
                        });
                        this._nextYearLink.off(CALENDAR_DXCLICK_EVENT_NAME).on(CALENDAR_DXCLICK_EVENT_NAME, function() {
                            that._navigate(nextYearLinkDelta)
                        })
                    }
                    this._navigator = $("<div />").addClass(CALENDAR_NAVIGATOR_CLASS).append(this._previousYearLink).append(this._previousMonthLink).append(this._navigatorCaption).append(this._nextMonthLink).append(this._nextYearLink);
                    this._element().append(this._navigator)
                }
                this._applyNavigatorLinkVisibility(this._previousYearLink, previousYearLinkDelta);
                this._applyNavigatorLinkVisibility(this._previousMonthLink, previousMonthLinkDelta);
                this._applyNavigatorLinkVisibility(this._nextMonthLink, nextMonthLinkDelta);
                this._applyNavigatorLinkVisibility(this._nextYearLink, nextYearLinkDelta)
            },
            _applyNavigatorLinkVisibility: function(link, monthDifference) {
                if (this._canNavigate(monthDifference))
                    link.removeClass(CALENDAR_DISABLED_NAVIGATOR_LINK_CLASS);
                else
                    link.addClass(CALENDAR_DISABLED_NAVIGATOR_LINK_CLASS)
            },
            _renderMonthView: function() {
                var that = this,
                    transitions;
                this._view.render(this._body[0]);
                this._element().off(CALENDAR_MONTHVIEW_VALUECHANGED_EVENT_NAME).on(CALENDAR_MONTHVIEW_VALUECHANGED_EVENT_NAME, function(event, newValue) {
                    that.option("value", newValue)
                });
                this._element().off(CALENDAR_MONTHVIEW_CONTOUREDDATECHANGED_EVENT_NAME).on(CALENDAR_MONTHVIEW_CONTOUREDDATECHANGED_EVENT_NAME, function(event, date) {
                    if (date)
                        if (!utils.sameMonthAndYear(that.option("currentDate"), date))
                            that.option("currentDate", utils.getFirstMonthDate(date))
                });
                if (this._oldView) {
                    this._initalizeViewDimensions();
                    this.animating = true;
                    transitions = this._getViewChangeAnimation(this._oldView, this._view, this._viewWidth, this.option("rtlEnabled"));
                    transitions.oldView.then(transitions.newView).then($.proxy(this._stopAnimationCallback, this))
                }
            },
            _initalizeViewDimensions: function() {
                this._viewWidth = this._viewWidth || this._body.width();
                this._viewHeight = this._viewHeight || this._body.height()
            },
            _canNavigate: function(monthDifference) {
                var date = this.option("currentDate"),
                    testCurrentDate = monthDifference < 0 ? new Date(date.getFullYear(), date.getMonth() + monthDifference + 1, 0) : new Date(date.getFullYear(), date.getMonth() + monthDifference, 1);
                return utils.dateInRange(testCurrentDate, this.option("min"), this.option("max"))
            },
            _navigate: function(monthDifference) {
                if (this._canNavigate(monthDifference))
                    this.option("currentDate", new Date(this.option("currentDate").getFullYear(), this.option("currentDate").getMonth() + monthDifference, 1))
            },
            _stopAnimationCallback: function() {
                this._forceStopAnimation();
                this._oldView.dispose();
                this._oldView = undefined
            },
            _forceStopAnimation: function() {
                if (this.animating) {
                    fx.stop($(this._oldView.table), true);
                    fx.stop($(this._view.table), true);
                    this.animating = false
                }
            },
            _getViewChangeAnimation: function(oldView, newView, width, rtl) {
                var transitionProperties = this._getViewChangeAnimationProperties(oldView, newView, width, rtl);
                return {
                        oldView: fx.animate($(oldView.table), transitionProperties.oldViewAnimation),
                        newView: fx.animate($(newView.table), transitionProperties.newViewAnimation)
                    }
            },
            _getViewChangeAnimationProperties: function(oldView, newView, width, rtl) {
                var type = "slide",
                    duration = oldView.date === newView.date ? 0 : 300,
                    easing = "cubic-bezier(.40, .80, .60, 1)",
                    oldViewAnimation = {
                        type: type,
                        duration: duration,
                        easing: support.transition ? easing : undefined
                    },
                    newViewAnimation = {
                        type: type,
                        duration: duration,
                        easing: support.transition ? easing : undefined
                    };
                if (newView.date > oldView.date && !rtl || newView.date < oldView.date && rtl) {
                    oldViewAnimation.from = {left: 0};
                    oldViewAnimation.to = {left: -width};
                    newViewAnimation.from = {left: width};
                    newViewAnimation.to = {left: 0}
                }
                else {
                    oldViewAnimation.from = {left: 0};
                    oldViewAnimation.to = {left: width};
                    newViewAnimation.from = {left: -width};
                    newViewAnimation.to = {left: 0}
                }
                return {
                        oldViewAnimation: oldViewAnimation,
                        newViewAnimation: newViewAnimation
                    }
            },
            _invalidate: function() {
                this._forceStopAnimation();
                this.callBase()
            },
            _optionChanged: function(name, value, previousValue) {
                var normalizedDate;
                switch (name) {
                    case"monthViewType":
                    case"keyDownProcessor":
                        break;
                    case"currentDate":
                        this._forceStopAnimation();
                        normalizedDate = utils.normalizeDate(value, this.option("min"), this.option("max"));
                        this.option("currentDate", new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1));
                    case"min":
                    case"max":
                    case"firstDayOfWeek":
                    case"rtlEnabled":
                        this._invalidate();
                        break;
                    case"value":
                        if (!value || utils.sameMonthAndYear(this._view.date, value)) {
                            normalizedDate = utils.normalizeDate(value, this.option("min"), this.option("max"));
                            this._view.setValue(normalizedDate);
                            this.option("value", normalizedDate)
                        }
                        else
                            this.option("currentDate", utils.getFirstMonthDate(value));
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxCalendar.__internals = {
            BaseView: BaseView,
            views: views,
            CALENDAR_CLASS: CALENDAR_CLASS,
            CALENDAR_BODY_CLASS: CALENDAR_BODY_CLASS,
            CALENDAR_NAVIGATOR_CLASS: CALENDAR_NAVIGATOR_CLASS,
            CALENDAR_OTHER_MONTH_CLASS: CALENDAR_OTHER_MONTH_CLASS,
            CALENDAR_DISABLED_NAVIGATOR_LINK_CLASS: CALENDAR_DISABLED_NAVIGATOR_LINK_CLASS,
            CALENDAR_EMPTY_CELL_CLASS: CALENDAR_EMPTY_CELL_CLASS,
            CALENDAR_TODAY_CLASS: CALENDAR_TODAY_CLASS,
            CALENDAR_SELECTED_DATE_CLASS: CALENDAR_SELECTED_DATE_CLASS,
            CALENDAR_CONTOURED_DATE_CLASS: CALENDAR_CONTOURED_DATE_CLASS,
            CALENDAR_NAVIGATOR_PREVIOUS_YEAR_CLASS: CALENDAR_NAVIGATOR_PREVIOUS_YEAR_CLASS,
            CALENDAR_NAVIGATOR_PREVIOUS_MONTH_CLASS: CALENDAR_NAVIGATOR_PREVIOUS_MONTH_CLASS,
            CALENDAR_NAVIGATOR_NEXT_MONTH_CLASS: CALENDAR_NAVIGATOR_NEXT_MONTH_CLASS,
            CALENDAR_NAVIGATOR_NEXT_YEAR_CLASS: CALENDAR_NAVIGATOR_NEXT_YEAR_CLASS,
            CALENDAR_MONTHVIEW_VALUECHANGED_EVENT_NAME: CALENDAR_MONTHVIEW_VALUECHANGED_EVENT_NAME,
            CALENDAR_MONTHVIEW_CONTOUREDDATECHANGED_EVENT_NAME: CALENDAR_MONTHVIEW_CONTOUREDDATECHANGED_EVENT_NAME
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.calendarPicker.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            CALENDAR_PICKER_CLASS = "dx-calendar-picker",
            CALENDAR_PICKER_CALENDAR_CONTAINER_CLASS = CALENDAR_PICKER_CLASS + "-calendar-container",
            CALENDAR_PICKER_OVERLAY = CALENDAR_PICKER_CLASS + "-overlay",
            CALENDAR_PICKER_INPUT_WRAPPER_CLASS = CALENDAR_PICKER_CLASS + "-input-wrapper",
            CALENDAR_PICKER_INPUT_WIDER_THAN_CALENDAR_CONTAINER_CLASS = CALENDAR_PICKER_CLASS + "-input-wider-than-calendar-container",
            CALENDAR_PICKER_POSITION_CLASS_PREFIX = CALENDAR_PICKER_CLASS + "-",
            CALENDAR_PICKER_DXPOINTERUP_EVENT_NAME = events.addNamespace("dxpointerup", "dxCalendarPicker"),
            getLongestCaptionIndex = function(captionArray) {
                var longestIndex = 0,
                    longestCaptionLength = 0,
                    i;
                for (i = 0; i < captionArray.length; ++i)
                    if (captionArray[i].length > longestCaptionLength) {
                        longestIndex = i;
                        longestCaptionLength = captionArray[i].length
                    }
                return longestIndex
            },
            expandPattern = function(pattern) {
                return pattern.length === 1 ? Globalize.culture().calendar.patterns[pattern] : pattern
            },
            formatUsesMonthName = function(format) {
                return expandPattern(format).indexOf("MMMM") !== -1
            },
            formatUsesDayName = function(format) {
                return expandPattern(format).indexOf("dddd") !== -1
            },
            getLongestDate = function(format, monthNames, dayNames) {
                var longestDate = new Date(1888, formatUsesMonthName(format) ? getLongestCaptionIndex(monthNames) : 9, 28 - 7, 23, 59, 59, 999);
                if (formatUsesDayName(format))
                    longestDate.setDate(longestDate.getDate() - longestDate.getDay() + getLongestCaptionIndex(dayNames));
                return longestDate
            };
        ui.calculateMaximumDateFormatWidth = function(format, customFontStyles, rootElement) {
            if (!rootElement || $(rootElement).is(":visible")) {
                var width,
                    ieRoundingError = 2,
                    longestTextDiv = $("<div>" + Globalize.format(getLongestDate(format, Globalize.culture().calendar.months.names, Globalize.culture().calendar.days.names), format) + "</div>").css({
                        visibility: "hidden",
                        "white-space": "nowrap",
                        position: "absolute",
                        float: "left"
                    });
                if (customFontStyles)
                    longestTextDiv.css(customFontStyles);
                longestTextDiv.appendTo(rootElement ? $(rootElement) : $("body"));
                width = longestTextDiv.width() + ieRoundingError;
                longestTextDiv.remove();
                return width
            }
        };
        ui.dxCalendarPicker = ui.dxDropDownEditor.inherit({
            NAME: "dxDateBox",
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    valueChangeEvent: "keyup keydown keypress",
                    formatString: Globalize.culture().calendar.patterns["d"],
                    formatWidthCalculator: ui.calculateMaximumDateFormatWidth,
                    closeOnValueChange: true
                })
            },
            _formatWidthCalculator: function() {
                var $bearingElement = this._element().find(".dx-texteditor-input"),
                    buttonWidth = this._button.outerWidth(),
                    bearingElementPaddings = $bearingElement.innerWidth() - $bearingElement.width(),
                    formatCalculator = this.option("formatWidthCalculator"),
                    width;
                if (formatCalculator)
                    width = bearingElementPaddings + buttonWidth + formatCalculator(this.option("formatString"), {
                        "font-style": $bearingElement.css("font-style"),
                        "font-variant": $bearingElement.css("font-variant"),
                        "font-weight": $bearingElement.css("font-weight"),
                        "font-size": $bearingElement.css("font-size"),
                        "font-family": $bearingElement.css("font-family"),
                        "letter-spacing": $bearingElement.css("letter-spacing")
                    }, this._element());
                return width
            },
            _clean: function() {
                if (this._keyDownProcessor)
                    this._keyDownProcessor.dispose();
                if (this._calendarKeyDownProcessor)
                    this._calendarKeyDownProcessor.dispose();
                if (this._calendarContainer)
                    this._calendarContainer.remove();
                this.callBase()
            },
            _render: function() {
                this.callBase();
                this._element().addClass(CALENDAR_PICKER_CLASS);
                this._keyDownProcessor = new ui.HierarchicalKeyDownProcessor({
                    element: this._input(),
                    handler: this._keyDownHandler,
                    context: this
                });
                this._calendarKeyDownProcessor = this._keyDownProcessor.attachChildProcessor()
            },
            _calculateWidth: function(rawValue) {
                return this.callBase() || this._formatWidthCalculator()
            },
            _keyDownHandler: function(options) {
                switch (options.key) {
                    case"escape":
                        options.originalEvent.preventDefault();
                        this._blur();
                        return;
                    default:
                        if (this._calendarContainer && $(this._calendarContainer).is(":visible"))
                            return true;
                        return
                }
            },
            _applyDropDownDirectionClasses: function(directions, calendarInnerWidth) {
                if (this._element().width() > calendarInnerWidth)
                    this._dropDown._wrapper().addClass(CALENDAR_PICKER_INPUT_WIDER_THAN_CALENDAR_CONTAINER_CLASS);
                else
                    this._dropDown._wrapper().removeClass(CALENDAR_PICKER_INPUT_WIDER_THAN_CALENDAR_CONTAINER_CLASS);
                this._cleanDirections(this._dropDown._wrapper()).addClass(directions.horizontalClass + " " + directions.verticalClass)
            },
            _cleanDirections: function(element) {
                return element.removeClass(CALENDAR_PICKER_POSITION_CLASS_PREFIX + "left " + CALENDAR_PICKER_POSITION_CLASS_PREFIX + "right " + CALENDAR_PICKER_POSITION_CLASS_PREFIX + "top " + CALENDAR_PICKER_POSITION_CLASS_PREFIX + "bottom")
            },
            _createDropDown: function() {
                var that = this,
                    horizontalAlign = this.option("rtlEnabled") ? "right" : "left",
                    verticalAlign = "bottom";
                this.callBase({
                    position: {
                        my: horizontalAlign + " " + DX.inverseAlign(verticalAlign),
                        at: horizontalAlign + " " + verticalAlign
                    },
                    positioningAction: function(options) {
                        if (that._calendarContainer)
                            that._applyDropDownDirectionClasses({
                                horizontalClass: CALENDAR_PICKER_POSITION_CLASS_PREFIX + (options.position.h.flip ? horizontalAlign : DX.inverseAlign(horizontalAlign)),
                                verticalClass: CALENDAR_PICKER_POSITION_CLASS_PREFIX + (options.position.v.flip ? DX.inverseAlign(verticalAlign) : verticalAlign)
                            }, that._calendarContainer.innerWidth())
                    }
                })
            },
            _closeOutsideDropDownHandler: function(e, ignoreContainerClicks) {
                this.callBase(e, true)
            },
            _renderDropDownContent: function() {
                var that = this;
                this._calendarContainer = $("<div />").addClass(CALENDAR_PICKER_CALENDAR_CONTAINER_CLASS);
                this._calendar = this._calendarContainer.dxCalendar($.extend(this.option("calendarOptions"), {
                    value: this.option("value"),
                    rtlEnabled: this.option("rtlEnabled"),
                    keyDownProcessor: this._calendarKeyDownProcessor,
                    min: this.option("min"),
                    max: this.option("max")
                })).dxCalendar("instance");
                this._calendarContainer.on(CALENDAR_PICKER_DXPOINTERUP_EVENT_NAME, function(e) {
                    that._calendarContainerPointerUpHandler(e)
                });
                return [this._calendarContainer]
            },
            _showDropDown: function() {
                if (!this._dropDownVisible()) {
                    var containerRendered = this._dropDownContainerRendered;
                    this.callBase();
                    if (!containerRendered) {
                        this._calendar.optionChanged.add($.proxy(this._calendarOptionChangedCallback, this));
                        this._dropDown._wrapper().addClass(CALENDAR_PICKER_OVERLAY)
                    }
                }
            },
            _calendarContainerPointerUpHandler: function(e) {
                e.dxPreventBlur = true
            },
            _calendarOptionChangedCallback: function(name, value, previousValue) {
                switch (name) {
                    case"value":
                        this.option("value", value);
                    default:
                        break
                }
            },
            _optionValuesEqual: function(name, oldValue, newValue) {
                if (name === "value" && newValue === null)
                    return false;
                return this.callBase.apply(this, arguments)
            },
            _renderValue: function(formattedValue) {
                this.callBase(Globalize.format(this.option("value"), this.option("formatString")))
            },
            _handleValueChangeEvent: function(e, formattedValue) {
                this._suppressUpdateValue();
                var date = Globalize.parseDate(this._input().val(), this.option("formatString"));
                this.callBase(e, date);
                this._resumeUpdateValue()
            },
            _blur: function() {
                this._input().blur()
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._renderDimensions()
            },
            _optionChanged: function(name, value, previousValue) {
                var that = this,
                    normalizedDate;
                switch (name) {
                    case"min":
                    case"max":
                    case"formatString":
                    case"calendarOptions":
                        this._invalidate();
                        break;
                    case"type":
                    case"formatWidthCalculator":
                    case"closeOnValueChange":
                        break;
                    case"value":
                        if (value) {
                            normalizedDate = utils.normalizeDate(value, this.option("min"), this.option("max"));
                            this.option("value", normalizedDate);
                            if (this._calendar)
                                this._calendar.option("value", value);
                            if (this._dropDownVisible() && this.option("closeOnValueChange"))
                                setTimeout($.proxy(that._hideDropDown, that), 50)
                        }
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        });
        DX.registerComponent("dxDateBoxTypeCalendarForDebugTests", ui.dxCalendarPicker.inherit({NAME: "dxDateBoxTypeCalendarForDebugTests"}));
        ui.dxCalendarPicker.__internals = {
            getLongestCaptionIndex: getLongestCaptionIndex,
            getLongestDate: getLongestDate,
            calculateMaximumDateFormatWidth: ui.calculateMaximumDateFormatWidth,
            CALENDAR_PICKER_OVERLAY: CALENDAR_PICKER_OVERLAY,
            CALENDAR_PICKER_INPUT_WIDER_THAN_CALENDAR_CONTAINER_CLASS: CALENDAR_PICKER_INPUT_WIDER_THAN_CALENDAR_CONTAINER_CLASS,
            CALENDAR_PICKER_INPUT_WRAPPER_CLASS: CALENDAR_PICKER_INPUT_WRAPPER_CLASS,
            CALENDAR_PICKER_POSITION_CLASS_PREFIX: CALENDAR_PICKER_POSITION_CLASS_PREFIX
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.calendarPickerTimeBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            CALENDAR_PICKER_TIME_BOX_CLASS = "dx-calendar-picker-time-box",
            TEXTEDITOR_INPUT_WRAPPER_CLASS = "dx-texteditor-input-wrapper",
            CALENDAR_PICKER_TIME_BOX_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", "dxCalendarPickerTimeBox");
        DX.registerComponent("dxCalendarPickerTimeBox", ui.dxTextEditor.inherit({
            _processingKeyPress: undefined,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    valueChangeEvent: "keyup keydown keypress",
                    formatString: Globalize.culture().calendar.patterns["t"],
                    formatWidthCalculator: ui.calculateMaximumDateFormatWidth
                })
            },
            _formatWidthCalculator: function() {
                var $element = this._element(),
                    $bearingElement = $element.find(".dx-texteditor-input"),
                    paddingWidth = $element.innerWidth() - $element.width(),
                    formatWidthCalculator = this.option("formatWidthCalculator"),
                    width;
                if (formatWidthCalculator)
                    width = paddingWidth + formatWidthCalculator(this.option("formatString"), {
                        "font-style": $bearingElement.css("font-style"),
                        "font-variant": $bearingElement.css("font-variant"),
                        "font-weight": $bearingElement.css("font-weight"),
                        "font-size": $bearingElement.css("font-size"),
                        "font-family": $bearingElement.css("font-family"),
                        "letter-spacing": $bearingElement.css("letter-spacing")
                    });
                return width
            },
            _render: function() {
                var that = this,
                    $element = this._element();
                $element.addClass(CALENDAR_PICKER_TIME_BOX_CLASS);
                this.callBase();
                $element.off(CALENDAR_PICKER_TIME_BOX_DXCLICK_EVENT_NAME).on(CALENDAR_PICKER_TIME_BOX_DXCLICK_EVENT_NAME, function() {
                    that.focus()
                });
                this._repositionIcon($element.width())
            },
            _calculateWidth: function(rawValue) {
                var width = this.callBase();
                if (!width)
                    width = this._formatWidthCalculator();
                return width
            },
            _renderValue: function(formattedValue) {
                this.callBase(Globalize.format(this.option("value"), this.option("formatString")))
            },
            _renderInput: function() {
                this.callBase();
                this._element().addClass(TEXTEDITOR_INPUT_WRAPPER_CLASS)
            },
            _repositionIcon: function(inputWidth) {
                if (this.option("rtlEnabled"))
                    return;
                var ie8 = DX.browser.msie && DX.browser.version < 9,
                    backgroundPosition = ie8 ? [this._element().css("backgroundPositionX"), this._element().css("backgroundPositionY")] : this._element().css("background-position").split(" ");
                this._iconWidth = this._iconWidth || parseInt(backgroundPosition[0], 10);
                if (ie8) {
                    this._element().css("backgroundPositionX", inputWidth + this._iconWidth + "px");
                    this._element().css("backgroundPositionY", backgroundPosition[1])
                }
                else
                    this._element().css("background-position", inputWidth + this._iconWidth + "px " + backgroundPosition[1])
            },
            _handleValueChangeEvent: function(e, formattedValue) {
                this._suppressUpdateValue();
                var time = Globalize.parseDate(this._input().val(), this.option("formatString"));
                this.callBase(e, time);
                this._resumeUpdateValue()
            },
            _optionChanged: function(name, value, previousValue) {
                switch (name) {
                    case"formatWidthCalculator":
                        break;
                    case"formatString":
                        this._invalidate();
                        break;
                    case"width":
                        this.callBase.apply(this, arguments);
                        this._repositionIcon(this._element().width());
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxCalendarPickerTimeBox.__internals = {TEXTEDITOR_INPUT_WRAPPER_CLASS: TEXTEDITOR_INPUT_WRAPPER_CLASS}
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            support = DX.support,
            devices = DX.devices,
            globalize = Globalize;
        var DATEBOX_CLASS = "dx-datebox",
            DATEPICKER_CLASS = "dx-datepicker",
            DATEPICKER_WRAPPER_CLASS = "dx-datepicker-wrapper",
            DATEPICKER_ROLLER_CONTAINER_CLASS = "dx-datepicker-rollers",
            DATEPICKER_ROLLER_CLASS = "dx-datepicker-roller",
            DATEPICKER_ROLLER_ACTIVE_CLASS = "dx-state-active",
            DATEPICKER_ROLLER_CURRENT_CLASS = "dx-datepicker-roller-current",
            DATEPICKER_ROLLER_ITEM_CLASS = "dx-datepicker-item",
            DATEPICKER_ROLLER_ITEM_SELECTED_CLASS = "dx-datepicker-item-selected",
            DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS = "dx-datepicker-item-selected-frame",
            DATEPICKER_ROLLER_ITEM_SELECTED_BORDER_CLASS = "dx-datepicker-item-selected-border",
            DATEPICKER_ROLLER_BUTTON_UP_CLASS = "dx-datepicker-button-up",
            DATEPICKER_ROLLER_BUTTON_DOWN_CLASS = "dx-datepicker-button-down",
            DATEPICKER_FORMATTER_CONTAINER = "dx-datepicker-formatter-container",
            DATEPICKER_VALUE_FORMATTER = "dx-datepicker-value-formatter",
            DATEPICKER_NAME_FORMATTER = "dx-datepicker-name-formatter",
            SUPPORTED_FORMATS = ["date", "time", "datetime"],
            DEFAULT_FORMATTER = function(value) {
                return value
            },
            DATE_COMPONENT_TEXT_FORMATTER = function(value, name) {
                var $container = $("<div>").addClass(DATEPICKER_FORMATTER_CONTAINER);
                $("<span>").text(value).addClass(DATEPICKER_VALUE_FORMATTER).appendTo($container);
                $("<span>").text(name).addClass(DATEPICKER_NAME_FORMATTER).appendTo($container);
                return $container
            },
            YEAR = "year",
            MONTH = "month",
            DAY = "day",
            HOURS = "hours",
            MINUTES = "minutes",
            SECONDS = "seconds",
            MILLISECONDS = "milliseconds",
            TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10;
        var DATE_COMPONENTS_INFO = {};
        DATE_COMPONENTS_INFO[YEAR] = {
            getter: "getFullYear",
            setter: "setFullYear",
            possibleFormats: ["yy", "yyyy"],
            formatter: DEFAULT_FORMATTER,
            startValue: undefined,
            endValue: undefined
        };
        DATE_COMPONENTS_INFO[DAY] = {
            getter: "getDate",
            setter: "setDate",
            possibleFormats: ["d", "dd"],
            formatter: function(value, showNames, date) {
                if (!showNames)
                    return value;
                var formatDate = new Date(date.getTime());
                formatDate.setDate(value);
                return DATE_COMPONENT_TEXT_FORMATTER(value, globalize.culture().calendar.days.names[formatDate.getDay()])
            },
            startValue: 1,
            endValue: undefined
        };
        DATE_COMPONENTS_INFO[MONTH] = {
            getter: "getMonth",
            setter: "setMonth",
            possibleFormats: ["M", "MM", "MMM", "MMMM"],
            formatter: function(value, showNames) {
                var monthName = globalize.culture().calendar.months.names[value];
                return showNames ? DATE_COMPONENT_TEXT_FORMATTER(value + 1, monthName) : monthName
            },
            startValue: 0,
            endValue: 11
        };
        DATE_COMPONENTS_INFO[HOURS] = {
            getter: "getHours",
            setter: "setHours",
            possibleFormats: ["H", "HH", "h", "hh"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, value), "HH")
            },
            startValue: 0,
            endValue: 23
        };
        DATE_COMPONENTS_INFO[MINUTES] = {
            getter: "getMinutes",
            setter: "setMinutes",
            possibleFormats: ["m", "mm"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, 0, value), "mm")
            },
            startValue: 0,
            endValue: 59
        };
        DATE_COMPONENTS_INFO[SECONDS] = {
            getter: "getSeconds",
            setter: "setSeconds",
            possibleFormats: ["s", "ss"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, 0, 0, value), "ss")
            },
            startValue: 0,
            endValue: 59
        };
        DATE_COMPONENTS_INFO[MILLISECONDS] = {
            getter: "getMilliseconds",
            setter: "setMilliseconds",
            possibleFormats: ["f", "ff", "fff"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, 0, 0, 0, value), "fff")
            },
            startValue: 0,
            endValue: 999
        };
        var FORMATS_INFO = {
                date: {
                    standardPattern: "yyyy-MM-dd",
                    components: [YEAR, DAY, MONTH]
                },
                time: {
                    standardPattern: "HH:mm",
                    components: [HOURS, MINUTES]
                },
                datetime: {
                    standardPattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss'Z'",
                    components: [YEAR, DAY, MONTH, HOURS, MINUTES, SECONDS, MILLISECONDS]
                },
                "datetime-local": {
                    standardPattern: "yyyy'-'MM'-'dd'T'HH':'mm",
                    components: [YEAR, MONTH, DAY, HOURS, MINUTES, SECONDS]
                }
            },
            FORMATS_MAP = {
                date: "d",
                time: "t",
                datetime: "S",
                "datetime-local": "f"
            };
        var toStandardDateFormat = function(date, mode, pattern) {
                pattern = pattern || FORMATS_INFO[mode].standardPattern;
                var datePattern = FORMATS_INFO[mode].standardPattern;
                return Globalize.format(date, pattern)
            };
        (function androidFormatDetection() {
            var androidFormatPattern = "yyyy'-'MM'-'dd'T'HH':'mm'Z'";
            var $input = $("<input>").attr("type", "datetime");
            $input.val(toStandardDateFormat(new Date, "datetime", androidFormatPattern));
            if (!$input.val())
                FORMATS_INFO.datetime.standardPattern = androidFormatPattern
        })();
        var fromStandardDateFormat = function(date) {
                return Globalize.parseDate(date, FORMATS_INFO["datetime"].standardPattern) || Globalize.parseDate(date, FORMATS_INFO["datetime-local"].standardPattern) || Globalize.parseDate(date, FORMATS_INFO["time"].standardPattern) || Globalize.parseDate(date, FORMATS_INFO["date"].standardPattern) || Date.parse && Date.parse(date) && new Date(Date.parse(date))
            };
        var getMaxMonthDay = function(year, month) {
                return new Date(year, month + 1, 0).getDate()
            };
        var mergeDates = function(target, source, format) {
                if (!source)
                    return undefined;
                if (isNaN(target.getTime()))
                    target = new Date(0, 0, 0, 0, 0, 0);
                var formatInfo = FORMATS_INFO[format];
                $.each(formatInfo.components, function() {
                    var componentInfo = DATE_COMPONENTS_INFO[this];
                    target[componentInfo.setter](source[componentInfo.getter]())
                });
                return target
            };
        DX.registerComponent("dxDatePickerRoller", ui.dxScrollable.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    clickableItems: false,
                    showScrollbar: false,
                    useNative: false,
                    selectedIndex: 0,
                    items: []
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: {platform: "win8"},
                            options: {clickableItems: true}
                        }, {
                            device: {platform: "generic"},
                            options: {scrollByContent: true}
                        }])
            },
            _init: function() {
                this.callBase();
                this._renderSelectedItemFrame();
                this._renderControlButtons()
            },
            _render: function() {
                this.callBase();
                $.each(this._strategy._scrollers, function(index, scroller) {
                    scroller._correctLocation = $.noop
                });
                this._element().addClass(DATEPICKER_ROLLER_CLASS);
                this._renderItems();
                this._renderSelectedValue();
                this._renderItemsClick();
                this._wrapAction("_endAction", $.proxy(this._handleEndAction, this))
            },
            _wrapAction: function(actionName, callback) {
                var strategy = this._strategy,
                    originalAction = strategy[actionName];
                strategy[actionName] = function() {
                    callback.apply(this, arguments);
                    return originalAction.apply(this, arguments)
                }
            },
            _renderItems: function() {
                var items = this.option("items") || [],
                    $items = $();
                this._$content.empty();
                $.each(items, function() {
                    $items = $items.add($("<div>").addClass(DATEPICKER_ROLLER_ITEM_CLASS).append(this))
                });
                this._$content.append($items);
                this._$items = $items;
                this.update()
            },
            _renderSelectedItemFrame: function() {
                $("<div>").addClass(DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS).append($("<div>").addClass(DATEPICKER_ROLLER_ITEM_SELECTED_BORDER_CLASS)).appendTo(this._$container)
            },
            _renderControlButtons: function() {
                $("<div>").addClass(DATEPICKER_ROLLER_BUTTON_UP_CLASS).insertAfter(this._$container).dxButton({clickAction: $.proxy(this._handleUpButtonClick, this)});
                $("<div>").addClass(DATEPICKER_ROLLER_BUTTON_DOWN_CLASS).insertAfter(this._$container).dxButton({clickAction: $.proxy(this._handleDownButtonClick, this)})
            },
            _renderSelectedValue: function(selectedIndex) {
                if (selectedIndex === undefined)
                    selectedIndex = this.option("selectedIndex");
                selectedIndex = this._fitIndex(selectedIndex);
                var correctedPosition = this._getItemPosition(selectedIndex);
                this.option().selectedIndex = selectedIndex;
                this._moveTo({top: correctedPosition});
                this._renderActiveStateItem()
            },
            _fitIndex: function(index) {
                var items = this.option("items") || [],
                    itemCount = items.length;
                if (index >= itemCount)
                    return itemCount - 1;
                if (index < 0)
                    return 0;
                return index
            },
            _renderItemsClick: function() {
                var itemSelector = "." + DATEPICKER_ROLLER_ITEM_CLASS,
                    eventName = events.addNamespace("dxclick", this.NAME);
                this._element().off(eventName, itemSelector);
                if (this.option("clickableItems"))
                    this._element().on(eventName, itemSelector, $.proxy(this._handleItemClick, this))
            },
            _handleItemClick: function(e) {
                this._renderSelectedValue(this._itemElementIndex(this._closestItemElement(e)))
            },
            _itemElementIndex: function(itemElement) {
                return this._itemElements().index(itemElement)
            },
            _closestItemElement: function(e) {
                return e.currentTarget
            },
            _itemElements: function() {
                return this._element().find("." + DATEPICKER_ROLLER_ITEM_CLASS)
            },
            _renderActiveStateItem: function() {
                var selectedIndex = this.option("selectedIndex");
                $.each(this._$items, function(index) {
                    $(this).toggleClass(DATEPICKER_ROLLER_ITEM_SELECTED_CLASS, selectedIndex === index)
                })
            },
            _handleUpButtonClick: function() {
                this._animation = true;
                this.option("selectedIndex", this.option("selectedIndex") - 1)
            },
            _handleDownButtonClick: function() {
                this._animation = true;
                this.option("selectedIndex", this.option("selectedIndex") + 1)
            },
            _getItemPosition: function(index) {
                return Math.round(this._itemHeight() * index)
            },
            _moveTo: function(targetLocation) {
                targetLocation = this._normalizeLocation(targetLocation);
                var location = this._location(),
                    delta = {
                        x: -(location.left - targetLocation.left),
                        y: -(location.top - targetLocation.top)
                    };
                if (this._isVisible() && (delta.x || delta.y)) {
                    this._strategy._prepareDirections(true);
                    if (this._animation) {
                        DX.fx.animate(this._$content, {
                            duration: 200,
                            type: "slide",
                            to: {top: targetLocation.top}
                        });
                        delete this._animation
                    }
                    else
                        this._strategy.handleMove({delta: delta})
                }
            },
            _handleEndAction: function() {
                if (this._changedByIndex) {
                    this._changedByIndex = false;
                    this._renderSelectedValue();
                    return
                }
                var ratio = -this._location().top / this._itemHeight(),
                    selectedIndex = Math.round(ratio);
                this._animation = true;
                this._renderSelectedValue(selectedIndex)
            },
            _itemHeight: function() {
                var $item = this._$items.first(),
                    height = $item.outerHeight() + parseFloat($item.css("margin-top") || 0);
                return height
            },
            _toggleActive: function(state) {
                this._element().toggleClass(DATEPICKER_ROLLER_ACTIVE_CLASS, state)
            },
            _isVisible: function() {
                return this._$container.is(":visible")
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"selectedIndex":
                        this._renderSelectedValue();
                        this._changedByIndex = true;
                        this._strategy.update();
                        this._strategy.handleEnd({velocity: {
                                x: 0,
                                y: 0
                            }});
                        break;
                    case"items":
                        this._renderItems();
                        this._renderSelectedValue();
                        break;
                    case"clickableItems":
                        this._renderItemsClick();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        DX.registerComponent("dxDatePicker", ui.dxPopup.inherit({
            _valueOption: function() {
                return new Date(this.option("value")) == "Invalid Date" ? new Date : new Date(this.option("value"))
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    minDate: new Date(1),
                    maxDate: new Date($.now() + TEN_YEARS),
                    format: "date",
                    value: new Date,
                    culture: Globalize.culture().name,
                    showNames: false,
                    cancelButton: {
                        icon: "close",
                        clickAction: $.proxy(function() {
                            this._value = this._valueOption()
                        }, this)
                    },
                    doneButton: {
                        icon: "save",
                        clickAction: $.proxy(function() {
                            this.option("value", new Date(this._value));
                            this.hide()
                        }, this)
                    }
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: {platform: "win8"},
                            options: {showNames: true}
                        }, {
                            device: {
                                platform: "win8",
                                phone: true
                            },
                            options: {fullScreen: true}
                        }, {
                            device: function(device) {
                                return device.platform !== "win8"
                            },
                            options: {
                                width: 333,
                                height: 331
                            }
                        }, {
                            device: function(device) {
                                return device.platform === "generic"
                            },
                            options: {
                                width: "auto",
                                height: "auto"
                            }
                        }])
            },
            _render: function() {
                this._value = this._valueOption();
                this.callBase();
                this._element().addClass(DATEPICKER_CLASS);
                this._wrapper().addClass(DATEPICKER_WRAPPER_CLASS)
            },
            _renderContentImpl: function() {
                this.callBase();
                this._renderRollers()
            },
            _renderRollers: function() {
                var that = this;
                if (!that._$rollersContainer)
                    that._$rollersContainer = $("<div>").appendTo(that.content()).addClass(DATEPICKER_ROLLER_CONTAINER_CLASS);
                that._$rollersContainer.empty();
                that._createRollerConfigs();
                that._rollers = {};
                $.each(that._rollerConfigs, function(name) {
                    var $roller = $("<div>").appendTo(that._$rollersContainer).addClass(DATEPICKER_ROLLER_CLASS + "-" + that._rollerConfigs[name].type).dxDatePickerRoller({
                            items: that._rollerConfigs[name].displayItems,
                            selectedIndex: that._rollerConfigs[name].selectedIndex,
                            showScrollbar: false,
                            startAction: function(e) {
                                var roller = e.component;
                                roller._toggleActive(true);
                                that._setActiveRoller(that._rollerConfigs[name], roller.option("selectedIndex"))
                            },
                            endAction: function(e) {
                                var roller = e.component;
                                that._setRollerState(that._rollerConfigs[name], roller.option("selectedIndex"));
                                roller._toggleActive(false)
                            }
                        });
                    that._rollers[that._rollerConfigs[name].type] = $roller.dxDatePickerRoller("instance")
                })
            },
            _setActiveRoller: function(currentRoller) {
                var activeRoller = this._rollers[currentRoller.type];
                $.each(this._rollers, function() {
                    this._$element.toggleClass(DATEPICKER_ROLLER_CURRENT_CLASS, this === activeRoller)
                })
            },
            _refreshRollers: function() {
                var that = this;
                $.each(this._rollers, function(type) {
                    var correctIndex = that._rollerConfigs[type].getIndex(that._value);
                    this.update();
                    this._renderSelectedValue(correctIndex)
                })
            },
            _setRollerState: function(roller, selectedIndex) {
                if (selectedIndex !== roller.selectedIndex) {
                    var value = roller.valueItems[selectedIndex],
                        setValue = roller.setValue,
                        currentDate = this._value.getDate();
                    if (roller.type === MONTH) {
                        currentDate = Math.min(currentDate, getMaxMonthDay(this._value.getFullYear(), value));
                        this._value.setDate(currentDate)
                    }
                    else if (roller.type === YEAR) {
                        currentDate = Math.min(currentDate, getMaxMonthDay(value, this._value.getMonth()));
                        this._value.setDate(currentDate)
                    }
                    this._value[setValue](value);
                    roller.selectedIndex = selectedIndex
                }
                if (roller.type === YEAR) {
                    this._refreshMonthRoller();
                    this._refreshDayRoller()
                }
                if (roller.type === MONTH)
                    this._refreshDayRoller()
            },
            _refreshMonthRoller: function() {
                var monthRoller = this._rollers[MONTH];
                if (monthRoller) {
                    this._createRollerConfig(MONTH);
                    var monthRollerConfig = this._rollerConfigs[MONTH];
                    this._deferredRenderMonthTimeout = window.setTimeout(function() {
                        if (monthRollerConfig.displayItems.length === monthRoller.option("items").length)
                            return;
                        monthRoller.option({
                            items: monthRollerConfig.displayItems,
                            selectedIndex: monthRollerConfig.selectedIndex
                        })
                    }, 100)
                }
            },
            _refreshDayRoller: function() {
                var dayRoller = this._rollers[DAY];
                if (dayRoller) {
                    this._createRollerConfig(DAY);
                    var dayRollerConfig = this._rollerConfigs[DAY];
                    this._deferredRenderDayTimeout = window.setTimeout(function() {
                        if (dayRollerConfig.displayItems.length === dayRoller.option("items").length)
                            return;
                        dayRoller.option({
                            items: dayRollerConfig.displayItems,
                            selectedIndex: dayRollerConfig.selectedIndex
                        })
                    }, 100)
                }
            },
            _createRollerConfigs: function(format) {
                var that = this;
                format = format || that.option("format");
                that._rollerConfigs = {};
                $.each(that._getFormatPattern(format).split(/\W+/), function(_, formatPart) {
                    $.each(DATE_COMPONENTS_INFO, function(componentName, componentInfo) {
                        if ($.inArray(formatPart, componentInfo.possibleFormats) > -1)
                            that._createRollerConfig(componentName)
                    })
                })
            },
            _getFormatPattern: function(format) {
                var culture = Globalize.culture(this.option("culture")),
                    result = "";
                if (format === "date")
                    result = culture.calendar.patterns.d;
                else if (format === "time")
                    result = culture.calendar.patterns.t;
                else if (format === "datetime")
                    result = [culture.calendar.patterns.d, culture.calendar.patterns.t].join(" ");
                return result
            },
            _createRollerConfig: function(componentName) {
                var componentInfo = DATE_COMPONENTS_INFO[componentName],
                    valueRange = this._calculateRollerConfigValueRange(componentName),
                    startValue = valueRange.startValue,
                    endValue = valueRange.endValue,
                    formatter = componentInfo.formatter,
                    showNames = this.option("showNames"),
                    curDate = this._value;
                var config = {
                        type: componentName,
                        setValue: componentInfo.setter,
                        valueItems: [],
                        displayItems: [],
                        getIndex: function(value) {
                            return value[componentInfo.getter]() - startValue
                        }
                    };
                for (var i = startValue; i <= endValue; i++) {
                    config.valueItems.push(i);
                    config.displayItems.push(formatter(i, showNames, curDate))
                }
                config.selectedIndex = config.getIndex(this._value);
                this._rollerConfigs[componentName] = config
            },
            _calculateRollerConfigValueRange: function(componentName) {
                var curDate = this._value,
                    minDate = this.option("minDate"),
                    maxDate = this.option("maxDate"),
                    minYear = curDate.getFullYear() === minDate.getFullYear(),
                    minMonth = minYear && curDate.getMonth() === minDate.getMonth(),
                    maxYear = curDate.getFullYear() === maxDate.getFullYear(),
                    maxMonth = maxYear && curDate.getMonth() === maxDate.getMonth(),
                    componentInfo = DATE_COMPONENTS_INFO[componentName],
                    startValue = componentInfo.startValue,
                    endValue = componentInfo.endValue;
                if (componentName === YEAR) {
                    startValue = minDate.getFullYear();
                    endValue = maxDate.getFullYear()
                }
                if (componentName === MONTH) {
                    if (minYear)
                        startValue = minDate.getMonth();
                    if (maxYear)
                        endValue = maxDate.getMonth()
                }
                if (componentName === DAY) {
                    endValue = getMaxMonthDay(curDate.getFullYear(), curDate.getMonth());
                    if (minMonth)
                        startValue = minDate.getDate();
                    if (maxYear)
                        endValue = maxDate.getDate()
                }
                return {
                        startValue: startValue,
                        endValue: endValue
                    }
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"showNames":
                    case"minDate":
                    case"maxDate":
                    case"culture":
                    case"format":
                        this._renderRollers();
                        break;
                    case"visible":
                        this.callBase(name, value, prevValue);
                        if (value)
                            this._refreshRollers();
                        break;
                    case"value":
                        this._value = this._valueOption();
                        this._renderRollers();
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            },
            _dispose: function() {
                clearTimeout(this._deferredRenderDayTimeout);
                clearTimeout(this._deferredRenderMonthTimeout);
                this.callBase()
            }
        }));
        DX.registerComponent("dxDateBox", ui.dxTextEditor.inherit({
            ctor: function(element, options) {
                options = options || {};
                var preferCalendar = devices.current().platform === "generic" && (options.format === "date" || !options.format),
                    useCalendar = options && options.useCalendar;
                if (useCalendar === undefined)
                    useCalendar = preferCalendar;
                if (useCalendar)
                    new ui.dxCalendarPicker(element, options);
                else
                    this.callBase(element, options)
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    format: "date",
                    value: new Date,
                    min: new Date(1),
                    max: new Date($.now() + TEN_YEARS),
                    useCalendar: false,
                    useNativePicker: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function(device) {
                                return device.win8 || device.android && (device.version[0] < 4 || device.version[0] == 4 && device.version[1] < 4)
                            },
                            options: {useNativePicker: false}
                        }])
            },
            _init: function() {
                this.callBase();
                this._initFormat()
            },
            _render: function() {
                this.callBase();
                this._element().addClass(DATEBOX_CLASS);
                this._renderDatePicker()
            },
            _renderDatePicker: function() {
                if (this._usingNativeDatePicker() || this.option("readOnly")) {
                    if (this._datePicker) {
                        this._datePicker._element().remove();
                        this._datePicker = null
                    }
                    return
                }
                var datePickerOptions = {
                        value: this.option("value"),
                        format: this.option("format"),
                        title: this._getDataPickerTitle(),
                        minDate: this.option("min"),
                        maxDate: this.option("max")
                    };
                if (this._datePicker)
                    this._datePicker.option(datePickerOptions);
                else {
                    this._datePicker = $("<div>").appendTo(this._element()).dxDatePicker($.extend(datePickerOptions, {hidingAction: $.proxy(function(e) {
                            this.option("value", e.component.option("value"))
                        }, this)})).dxDatePicker("instance");
                    var inputClickAction = this._createAction(function(e) {
                            e.component._datePicker.show()
                        });
                    this._input().on(events.addNamespace("dxclick", this.NAME), function(e) {
                        return inputClickAction({jQuery: e})
                    })
                }
            },
            _renderFocusEvent: function() {
                this.callBase();
                this._input().on('focus', $.proxy(function() {
                    this._togglePlaceholderVisibility(false)
                }, this))
            },
            _initFormat: function() {
                var format = this.option("format");
                if ($.inArray(format, SUPPORTED_FORMATS) === -1) {
                    format = "date";
                    this.option("format", format)
                }
                else if (format === "datetime" && !support.inputType(format))
                    format = "datetime-local";
                this.option("mode", format)
            },
            _usingNativeDatePicker: function() {
                return this.option("useNativePicker")
            },
            _readOnlyPropValue: function() {
                if (this._usingNativeDatePicker())
                    return this.callBase();
                return true
            },
            _handleValueChangeEvent: function() {
                var value = fromStandardDateFormat(this._input().val()),
                    modelValue = new Date(this.option("value") && this.option("value").valueOf()),
                    newValue = mergeDates(modelValue, value, this.option("mode"));
                this.option({value: newValue});
                if (newValue !== modelValue)
                    this._renderValue()
            },
            _renderValue: function() {
                var mode = this.option("mode"),
                    patternKey = FORMATS_MAP[mode],
                    pattern = support.inputType(mode) ? false : globalize.culture().calendar.patterns[patternKey],
                    value = toStandardDateFormat(this.option("value"), mode, pattern);
                this._input().val(value);
                this._togglePlaceholderVisibility(value === "" || value === null)
            },
            _renderProps: function() {
                this.callBase();
                this._input().attr("autocomplete", "off")
            },
            _getDataPickerTitle: function() {
                var result = this.option("placeholder");
                if (!result) {
                    var format = this.option("format");
                    if (format === "time")
                        result = Globalize.localize("dxDateBox-simulatedDataPickerTitleTime");
                    else if (format === "date")
                        result = Globalize.localize("dxDateBox-simulatedDataPickerTitleDate");
                    else if (format === "datetime")
                        result = Globalize.localize("dxDateBox-simulatedDataPickerTitleDateTime")
                }
                return result
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"useCalendar":
                        break;
                    case"format":
                        this._initFormat();
                        this._renderValue();
                        this._renderDatePicker();
                        break;
                    case"readOnly":
                        this._invalidate();
                        break;
                    case"useNativePicker":
                        this._renderDatePicker();
                        this._renderProps();
                        break;
                    case"placeholder":
                        if (this._datePicker)
                            this._datePicker.option("title", this._getDataPickerTitle());
                        break;
                    case"type":
                        throw new Error("type cannot be changed after instantiation");
                        break;
                    case"min":
                    case"max":
                        if (this._datePicker)
                            this._datePicker.option(name + "Date", value);
                        break;
                    case"value":
                        this._renderValue();
                        this._renderDatePicker();
                    default:
                        this.callBase(name, value, prevValue)
                }
            }
        }));
        ui.dxDatePicker.__internals = {
            DATEPICKER_CLASS: DATEPICKER_CLASS,
            DATEPICKER_WRAPPER_CLASS: DATEPICKER_WRAPPER_CLASS,
            DATEPICKER_ROLLER_CONTAINER_CLASS: DATEPICKER_ROLLER_CONTAINER_CLASS,
            DATEPICKER_ROLLER_CLASS: DATEPICKER_ROLLER_CLASS,
            DATEPICKER_ROLLER_ACTIVE_CLASS: DATEPICKER_ROLLER_ACTIVE_CLASS,
            DATEPICKER_ROLLER_ITEM_CLASS: DATEPICKER_ROLLER_ITEM_CLASS,
            DATEPICKER_ROLLER_ITEM_SELECTED_CLASS: DATEPICKER_ROLLER_ITEM_SELECTED_CLASS,
            DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS: DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS,
            DATEPICKER_ROLLER_ITEM_SELECTED_BORDER_CLASS: DATEPICKER_ROLLER_ITEM_SELECTED_BORDER_CLASS,
            DATEPICKER_ROLLER_BUTTON_UP_CLASS: DATEPICKER_ROLLER_BUTTON_UP_CLASS,
            DATEPICKER_ROLLER_BUTTON_DOWN_CLASS: DATEPICKER_ROLLER_BUTTON_DOWN_CLASS,
            DATEPICKER_ROLLER_CURRENT_CLASS: DATEPICKER_ROLLER_CURRENT_CLASS
        };
        ui.dxDateBox.__internals = {
            toStandardDateFormat: toStandardDateFormat,
            fromStandardDateFormat: fromStandardDateFormat,
            FORMATS_MAP: FORMATS_MAP
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.loadIndicator.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var LOADINDICATOR_CLASS = "dx-loadindicator",
            LOADINDICATOR_WRAPPER = "dx-loadindicator-wrapper",
            LOADINDICATOR_ICON = "dx-loadindicator-icon",
            LOADINDICATOR_SEGMENT = "dx-loadindicator-segment",
            LOADINDICATOR_SEGMENT_N = "dx-loadindicator-segment",
            LOADINDICATOR_SEGMENT_WIN8 = "dx-loadindicator-win8-segment",
            LOADINDICATOR_SEGMENT_N_WIN8 = "dx-loadindicator-win8-segment",
            LOADINDICATOR_INNER_SEGMENT_WIN8 = "dx-loadindicator-win8-inner-segment",
            LOADINDICATOR_IMAGE = "dx-loadindicator-image";
        DX.registerComponent("dxLoadIndicator", ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    indicatorSrc: "",
                    hoverStateEnabled: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function() {
                                var realDevice = DevExpress.devices.real(),
                                    obsoleteAndroid = realDevice.platform === "android" && !/chrome/i.test(navigator.userAgent);
                                return DevExpress.browser.msie && DevExpress.browser.version < 10 || obsoleteAndroid
                            },
                            options: {viaImage: true}
                        }])
            },
            _init: function() {
                this.callBase();
                this._element().addClass(LOADINDICATOR_CLASS)
            },
            _render: function() {
                this._renderWrapper();
                this._renderMarkup();
                this.callBase()
            },
            _renderWrapper: function() {
                this._$wrapper = $("<div>").addClass(LOADINDICATOR_WRAPPER);
                this._element().append(this._$wrapper)
            },
            _renderMarkup: function() {
                if (DX.support.animation && !this.option("viaImage") && !this.option("indicatorSrc"))
                    this._renderMarkupForAnimation();
                else
                    this._renderMarkupForImage()
            },
            _renderMarkupForAnimation: function() {
                this._$indicator = $("<div>").addClass(LOADINDICATOR_ICON);
                for (var i = 15; i >= 0; --i) {
                    var $segment = $("<div>").addClass(LOADINDICATOR_SEGMENT).addClass(LOADINDICATOR_SEGMENT_N + i);
                    this._$indicator.append($segment)
                }
                for (var i = 1; i <= 5; ++i) {
                    var $innerSegment = $("<div>").addClass(LOADINDICATOR_INNER_SEGMENT_WIN8),
                        $segment = $("<div>").addClass(LOADINDICATOR_SEGMENT_WIN8).addClass(LOADINDICATOR_SEGMENT_N_WIN8 + i);
                    $segment.append($innerSegment);
                    this._$indicator.append($segment)
                }
                this._$wrapper.append(this._$indicator)
            },
            _renderMarkupForImage: function() {
                var indicatorSrc = this.option("indicatorSrc");
                this._$wrapper.addClass(LOADINDICATOR_IMAGE);
                if (indicatorSrc)
                    this._$wrapper.css("background-image", "url(" + indicatorSrc + ")")
            },
            _renderDimensions: function() {
                this.callBase();
                this._updateContentSize()
            },
            _updateContentSize: function() {
                var $element = this._element(),
                    width = this.option("width"),
                    height = this.option("height");
                if (width || height) {
                    width = this._element().width();
                    height = this._element().height();
                    var minDimention = Math.min(height, width);
                    this._$wrapper.css({
                        height: minDimention,
                        width: minDimention,
                        "margin-top": (height - minDimention) / 2,
                        "margin-left": (width - minDimention) / 2
                    });
                    if (this._$indicator)
                        this._$indicator.find("." + LOADINDICATOR_SEGMENT).css("border-width", 0.125 * minDimention)
                }
            },
            _clean: function() {
                this.callBase();
                this._removeMarkupForAnimation();
                this._removeMarkupForImage()
            },
            _removeMarkupForAnimation: function() {
                if (this._$indicator)
                    this._$indicator.remove()
            },
            _removeMarkupForImage: function() {
                this._$wrapper.css("background-image", "none")
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"indicatorSrc":
                        this._invalidate();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.loadPanel.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var LOADPANEL_CLASS = "dx-loadpanel",
            LOADPANEL_WRAPPER_CLASS = "dx-loadpanel-wrapper",
            LOADPANEL_INDICATOR_CLASS = "dx-loadpanel-indicator",
            LOADPANEL_MESSAGE_CLASS = "dx-loadpanel-message",
            LOADPANEL_CONTENT_CLASS = "dx-loadpanel-content",
            LOADPANEL_CONTENT_WRAPPER_CLASS = "dx-loadpanel-content-wrapper",
            LOADPANEL_PANE_HIDDEN_CLASS = "dx-loadpanel-pane-hidden";
        DX.registerComponent("dxLoadPanel", ui.dxOverlay.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    message: Globalize.localize("Loading"),
                    width: 222,
                    height: 90,
                    animation: null,
                    showIndicator: true,
                    indicatorSrc: "",
                    showPane: true,
                    delay: 0
                })
            },
            _init: function() {
                this.callBase.apply(this, arguments);
                this._$contentWrapper = $("<div>").addClass(LOADPANEL_CONTENT_WRAPPER_CLASS);
                this._$contentWrapper.appendTo(this._container())
            },
            _render: function() {
                this.callBase();
                this._element().addClass(LOADPANEL_CLASS);
                this._wrapper().addClass(LOADPANEL_WRAPPER_CLASS)
            },
            _renderContentImpl: function() {
                this.callBase();
                this.content().addClass(LOADPANEL_CONTENT_CLASS);
                this._togglePaneVisible();
                this._cleanPreviousContent();
                this._renderLoadIndicator();
                this._renderMessage()
            },
            _makeVisible: function() {
                var delay = this.option("delay");
                if (!delay)
                    return this.callBase();
                var deferred = $.Deferred();
                var callBase = $.proxy(this.callBase, this);
                this._clearShowTimeout();
                this._showTimeout = setTimeout(function() {
                    callBase().done(function() {
                        deferred.resolve()
                    })
                }, delay);
                return deferred.promise()
            },
            _makeHidden: function() {
                this._clearShowTimeout();
                return this.callBase()
            },
            _clearShowTimeout: function() {
                clearTimeout(this._showTimeout)
            },
            _renderMessage: function() {
                var message = this.option("message");
                if (!message)
                    return;
                var $message = $("<div>").addClass(LOADPANEL_MESSAGE_CLASS).text(message);
                this._$contentWrapper.append($message)
            },
            _renderLoadIndicator: function() {
                if (!this.option("showIndicator"))
                    return;
                this._$indicator = $("<div>").addClass(LOADPANEL_INDICATOR_CLASS).dxLoadIndicator({indicatorSrc: this.option("indicatorSrc")}).appendTo(this._$contentWrapper)
            },
            _cleanPreviousContent: function() {
                this.content().find("." + LOADPANEL_MESSAGE_CLASS).remove();
                this.content().find("." + LOADPANEL_INDICATOR_CLASS).remove()
            },
            _togglePaneVisible: function() {
                this.content().toggleClass(LOADPANEL_PANE_HIDDEN_CLASS, !this.option("showPane"))
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"delay":
                        break;
                    case"message":
                    case"showIndicator":
                        this._cleanPreviousContent();
                        this._renderLoadIndicator();
                        this._renderMessage();
                        break;
                    case"showPane":
                        this._togglePaneVisible();
                        break;
                    case"indicatorSrc":
                        if (this._$indicator)
                            this._$indicator.dxLoadIndicator({indicatorSrc: this.option("indicatorSrc")});
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _dispose: function() {
                this._clearShowTimeout();
                this.callBase()
            },
            _defaultHideTopOverlayHandler: $.noop
        }));
        ui.dxLoadPanel.__internals = {
            LOADPANEL_CLASS: LOADPANEL_CLASS,
            LOADPANEL_WRAPPER_CLASS: LOADPANEL_WRAPPER_CLASS,
            LOADPANEL_MESSAGE_CLASS: LOADPANEL_MESSAGE_CLASS,
            LOADPANEL_CONTENT_CLASS: LOADPANEL_CONTENT_CLASS,
            LOADPANEL_PANE_HIDDEN_CLASS: LOADPANEL_PANE_HIDDEN_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.lookup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            dataUtils = DX.data.utils,
            events = ui.events;
        var LOOKUP_CLASS = "dx-lookup",
            LOOKUP_SELECTED_CLASS = LOOKUP_CLASS + "-selected",
            LOOKUP_SEARCH_CLASS = LOOKUP_CLASS + "-search",
            LOOKUP_SEARCH_WRAPPER_CLASS = LOOKUP_CLASS + "-search-wrapper",
            LOOKUP_FIELD_CLASS = LOOKUP_CLASS + "-field",
            LOOKUP_FIELD_WRAPPER_CLASS = LOOKUP_FIELD_CLASS + "-wrapper",
            LOOKUP_POPUP_CLASS = LOOKUP_CLASS + "-popup",
            LOOKUP_POPUP_WRAPPER_CLASS = LOOKUP_POPUP_CLASS + "-wrapper",
            LOOKUP_POPUP_SEARCH_CLASS = LOOKUP_POPUP_CLASS + "-search",
            LOOKUP_POPOVER_MODE = LOOKUP_CLASS + "-popover-mode",
            LOOKUP_EMPTY_CLASS = LOOKUP_CLASS + "-empty",
            LIST_ITEM_SELECTOR = ".dx-list-item",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            POPUP_HIDE_TIMEOUT = 200;
        DX.registerComponent("dxLookup", ui.dxEditor.inherit({
            _deprecatedOptions: {
                shownAction: {
                    since: "14.1",
                    message: "Use the 'openAction' option instead."
                },
                hiddenAction: {
                    since: "14.1",
                    message: "Use the 'closeAction' option instead."
                }
            },
            _optionAliases: {
                openAction: "shownAction",
                closeAction: "hiddenAction"
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    items: [],
                    dataSource: null,
                    value: undefined,
                    displayValue: undefined,
                    title: "",
                    titleTemplate: "title",
                    valueExpr: null,
                    displayExpr: "this",
                    placeholder: Globalize.localize("Select"),
                    searchPlaceholder: Globalize.localize("Search"),
                    searchEnabled: true,
                    noDataText: Globalize.localize("dxCollectionContainerWidget-noDataText"),
                    searchTimeout: 1000,
                    minFilterLength: 0,
                    fullScreen: false,
                    valueChangeAction: null,
                    itemTemplate: "item",
                    itemRender: null,
                    showCancelButton: true,
                    cancelButtonText: Globalize.localize("Cancel"),
                    showClearButton: false,
                    clearButtonText: Globalize.localize("Clear"),
                    showDoneButton: false,
                    doneButtonText: Globalize.localize("Done"),
                    contentReadyAction: null,
                    shownAction: null,
                    openAction: null,
                    hiddenAction: null,
                    closeAction: null,
                    popupWidth: function() {
                        return $(window).width() * 0.8
                    },
                    popupHeight: function() {
                        return $(window).height() * 0.8
                    },
                    shading: true,
                    closeOnOutsideClick: false,
                    position: undefined,
                    animation: undefined,
                    pullRefreshEnabled: false,
                    autoPagingEnabled: true,
                    useNativeScrolling: true,
                    pullingDownText: Globalize.localize("dxList-pullingDownText"),
                    pulledDownText: Globalize.localize("dxList-pulledDownText"),
                    refreshingText: Globalize.localize("dxList-refreshingText"),
                    pageLoadingText: Globalize.localize("dxList-pageLoadingText"),
                    scrollAction: null,
                    pullRefreshAction: null,
                    pageLoadingAction: null,
                    showNextButton: false,
                    nextButtonText: Globalize.localize("dxList-nextButtonText"),
                    grouped: false,
                    groupTemplate: "group",
                    groupRender: null,
                    usePopover: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().slice(0).concat([{
                            device: function(device) {
                                return !DX.support.nativeScrolling
                            },
                            options: {useNativeScrolling: false}
                        }, {
                            device: function(device) {
                                return !DX.support.nativeScrolling && !DX.devices.isSimulator() && DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {
                                showNextButton: true,
                                autoPagingEnabled: false
                            }
                        }, {
                            device: {
                                platform: "win8",
                                phone: true
                            },
                            options: {
                                showCancelButton: false,
                                fullScreen: true
                            }
                        }, {
                            device: {
                                platform: "win8",
                                phone: false
                            },
                            options: {popupWidth: function() {
                                    return $(window).width()
                                }}
                        }, {
                            device: [{
                                    platform: "ios",
                                    phone: true
                                }, {
                                    platform: "ios7",
                                    phone: true
                                }],
                            options: {fullScreen: true}
                        }, {
                            device: [{
                                    platform: "ios",
                                    tablet: true
                                }, {
                                    platform: "ios7",
                                    tablet: true
                                }],
                            options: {
                                popupWidth: function() {
                                    return Math.min($(window).width(), $(window).height()) * 0.4
                                },
                                popupHeight: function() {
                                    return Math.min($(window).width(), $(window).height()) * 0.4
                                },
                                usePopover: true
                            }
                        }])
            },
            _optionsByReference: function() {
                return $.extend(this.callBase(), {value: true})
            },
            _init: function() {
                this.callBase();
                this._initDataSource();
                this._searchTimer = null;
                this._compileValueGetter();
                this._compileDisplayGetter();
                this._suppressValueChangeAction();
                if (!this._dataSource)
                    this._itemsToDataSource()
            },
            _compileValueGetter: function() {
                this._valueGetter = dataUtils.compileGetter(this._valueGetterExpr())
            },
            _valueGetterExpr: function() {
                return this.option("valueExpr") || "this"
            },
            _compileDisplayGetter: function() {
                this._displayGetter = dataUtils.compileGetter(this.option("displayExpr"))
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"))
            },
            _render: function() {
                this.callBase();
                this._element().addClass(LOOKUP_CLASS).toggleClass(LOOKUP_POPOVER_MODE, this.option("usePopover"));
                this._renderField();
                this._needRenderContent = true;
                this._calcSelectedItem($.proxy(this._setFieldText, this))
            },
            _renderContent: $.noop,
            _renderContentImpl: $.noop,
            _renderField: function() {
                var fieldClickAction = this._createAction(this._handleFieldClick);
                this._$fieldWrapper = $("<div>").addClass(LOOKUP_FIELD_WRAPPER_CLASS);
                this._$field = $("<div>").addClass(LOOKUP_FIELD_CLASS).appendTo(this._$fieldWrapper).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    fieldClickAction({jQueryEvent: e})
                });
                this._$fieldWrapper.appendTo(this._element())
            },
            _handleFieldClick: function(args) {
                var that = args.component;
                that._renderContentIfNeed();
                that._setListDataSource();
                that._refreshSelected();
                that._popup.show();
                that._lastSelectedItem = that._selectedItem
            },
            _renderContentIfNeed: function() {
                if (this._needRenderContent) {
                    this._renderPopup();
                    this._needRenderContent = false
                }
            },
            _renderPopup: function() {
                var $popup = $("<div>").addClass(LOOKUP_POPUP_CLASS).appendTo(this._element());
                var popupOptions = {
                        rtlEnabled: this.option("rtlEnabled"),
                        showTitle: true,
                        title: this.option("title"),
                        titleTemplate: this._getTemplateByOption("titleTemplate"),
                        contentReadyAction: $.proxy(this._popupContentReadyAction, this),
                        cancelButton: this._getCancelButtonConfig(),
                        doneButton: this._getDoneButtonConfig(),
                        clearButton: this._getClearButtonConfig(),
                        shownAction: this._createActionByOption("shownAction"),
                        hiddenAction: this._createActionByOption("hiddenAction")
                    };
                this._popup = this.option("usePopover") && !this.option("fullScreen") ? this._createPopover($popup, popupOptions) : this._createPopup($popup, popupOptions);
                this._setPopupOption("position", "position");
                this._setPopupOption("animation", "animation");
                this._setPopupOption("popupWidth", "width");
                this._setPopupOption("popupHeight", "height");
                this._popup._wrapper().addClass(LOOKUP_POPUP_WRAPPER_CLASS).toggleClass(LOOKUP_POPUP_SEARCH_CLASS, this.option("searchEnabled"))
            },
            _setPopupOption: function(option, popupOption) {
                var option = this.option(option);
                option = option === undefined ? this._popup.initialOption(popupOption) : option;
                this._popup.option(popupOption, option)
            },
            _createPopover: function($element, options) {
                return $element.dxPopover($.extend(options, {target: this._element()})).dxPopover("instance")
            },
            _createPopup: function($element, options) {
                return $element.dxPopup($.extend(options, {
                        fullScreen: this.option("fullScreen"),
                        shading: this.option("shading"),
                        closeOnOutsideClick: this.option("closeOnOutsideClick")
                    })).dxPopup("instance")
            },
            _getCancelButtonConfig: function() {
                return this.option("showCancelButton") ? {text: this.option("cancelButtonText")} : null
            },
            _getDoneButtonConfig: function() {
                return this.option("showDoneButton") ? {
                        text: this.option("doneButtonText"),
                        clickAction: $.proxy(function() {
                            this.option("value", this._valueGetter(this._lastSelectedItem))
                        }, this)
                    } : null
            },
            _getClearButtonConfig: function() {
                return this.option("showClearButton") ? {
                        text: this.option("clearButtonText"),
                        clickAction: $.proxy(function() {
                            this.option("value", "")
                        }, this)
                    } : null
            },
            _renderCancelButton: function() {
                this._popup && this._popup.option("cancelButton", this._getCancelButtonConfig())
            },
            _renderDoneButton: function() {
                this._popup && this._popup.option("doneButton", this._getDoneButtonConfig())
            },
            _renderClearButton: function() {
                this._popup && this._popup.option("clearButton", this._getClearButtonConfig())
            },
            _popupContentReadyAction: function() {
                this._renderSearch();
                this._renderList()
            },
            _renderSearch: function() {
                this._$search = $("<div>").addClass(LOOKUP_SEARCH_CLASS).dxTextBox({
                    mode: "search",
                    placeholder: this._getSearchPlaceholder(),
                    valueChangeEvent: "change input",
                    valueChangeAction: $.proxy(this._searchChangedHandler, this),
                    rtlEnabled: this.option("rtlEnabled")
                }).appendTo(this._popup.content()).wrap($("<div>").addClass(LOOKUP_SEARCH_WRAPPER_CLASS).toggle(this.option("searchEnabled")));
                this._search = this._$search.dxTextBox("instance")
            },
            _getSearchPlaceholder: function() {
                var minFilterLength = this.option("minFilterLength"),
                    placeholder = this.option("searchPlaceholder");
                if (minFilterLength && placeholder === Globalize.localize("Search"))
                    return utils.stringFormat(Globalize.localize("dxLookup-searchPlaceholder"), minFilterLength);
                return placeholder
            },
            _renderList: function() {
                this._list = $("<div>").appendTo(this._popup.content()).dxList({
                    _templates: this.option("_templates"),
                    dataSource: null,
                    itemClickAction: $.proxy(function(e) {
                        this._toggleSelectedClass(e.jQueryEvent);
                        this._updateOptions(e)
                    }, this),
                    itemRenderedAction: $.proxy(function(e) {
                        this._setSelectedClass(e.itemElement, e.itemData)
                    }, this),
                    itemRender: this._getItemRender(),
                    itemTemplate: this._getTemplateByOption("itemTemplate"),
                    noDataText: this.option("noDataText"),
                    pullRefreshEnabled: this.option("pullRefreshEnabled"),
                    autoPagingEnabled: this.option("autoPagingEnabled"),
                    useNativeScrolling: this.option("useNativeScrolling"),
                    pullingDownText: this.option("pullingDownText"),
                    pulledDownText: this.option("pulledDownText"),
                    refreshingText: this.option("refreshingText"),
                    pageLoadingText: this.option("pageLoadingText"),
                    scrollAction: this.option("scrollAction"),
                    pullRefreshAction: this.option("pullRefreshAction"),
                    pageLoadingAction: this.option("pageLoadingAction"),
                    showNextButton: this.option("showNextButton"),
                    nextButtonText: this.option("nextButtonText"),
                    grouped: this.option("grouped"),
                    groupTemplate: this._getTemplateByOption("groupTemplate"),
                    groupRender: this.option("groupRender"),
                    rtlEnabled: this.option("rtlEnabled")
                }).data("dxList");
                if (this._needSetItemRenderToList) {
                    this._updateListItemRender();
                    this._needSetItemRenderToList = false
                }
                this._setListDataSource();
                this._list.option("contentReadyAction", this.option("contentReadyAction"));
                this._list._fireContentReadyAction()
            },
            _setListDataSource: function(force) {
                if (!this._list)
                    return;
                var needsToLoad = this._search.option("value").length >= this.option("minFilterLength"),
                    dataSourceLoaded = !!this._list.option("dataSource"),
                    skip = needsToLoad === dataSourceLoaded;
                if (!force && skip)
                    return;
                this._list.option("dataSource", needsToLoad ? this._dataSource : null);
                if (!needsToLoad)
                    this._list.option("items", undefined)
            },
            _refreshSelected: function() {
                var that = this;
                if (!that._list)
                    return;
                $.each(this._list._element().find(LIST_ITEM_SELECTOR), function() {
                    var item = $(this);
                    that._setSelectedClass(item, item.data(LIST_ITEM_DATA_KEY))
                })
            },
            _calcSelectedItem: function(callback) {
                var ds = this._dataSource,
                    store,
                    valueExpr,
                    thisWidget = this,
                    value = this._unwrapedValue();
                function handleLoadSuccess(result) {
                    thisWidget._selectedItem = result;
                    callback()
                }
                if (!ds || value === undefined) {
                    this._selectedItem = undefined;
                    callback();
                    return
                }
                store = ds.store();
                valueExpr = this._valueGetterExpr();
                this._loadSingle(valueExpr, value).done(function(result) {
                    handleLoadSuccess(result)
                })
            },
            _unwrapedValue: function() {
                var value = this.option("value");
                var valueExpr = this._valueGetterExpr();
                if (!this._dataSource && valueExpr !== "this")
                    return value;
                var key = this._dataSource.store().key();
                if (key && typeof value === "object")
                    value = value[key];
                return $.isFunction(value) ? value() : value
            },
            _setFieldText: function(text) {
                if (!arguments.length)
                    text = this._getDisplayText();
                this._$field.text(text);
                this.option("displayValue", text);
                this._toggleEmptyClass()
            },
            _getDisplayText: function() {
                if (this.option("value") === undefined || !this._dataSource)
                    return this.option("placeholder");
                return this._displayGetter(this._selectedItem) || this.option("placeholder")
            },
            _searchChangedHandler: function() {
                if (!this._search)
                    return;
                var searchValue = this._search.option("value"),
                    needsToLoad = searchValue.length >= this.option("minFilterLength");
                clearTimeout(this._searchTimer);
                this._search.option("placeholder", this._getSearchPlaceholder());
                if (!needsToLoad) {
                    this._setListDataSource();
                    return
                }
                if (this.option("searchTimeout"))
                    this._searchTimer = setTimeout($.proxy(this._doSearch, this, searchValue), this.option("searchTimeout"));
                else
                    this._doSearch(searchValue)
            },
            _doSearch: function(searchValue) {
                if (!this._dataSource)
                    return;
                if (!arguments.length)
                    searchValue = this.option("searchEnabled") ? this._search.option("value") : "";
                this._filterStore(searchValue).done($.proxy(function() {
                    if (this._dataSource.items().length)
                        this._setListDataSource()
                }, this))
            },
            _filterStore: function(searchValue) {
                if (!this._dataSource.searchExpr())
                    this._dataSource.searchExpr(this.option("displayExpr"));
                this._dataSource.searchValue(searchValue);
                this._dataSource.pageIndex(0);
                return this._dataSource.load()
            },
            _updateOptions: function(e) {
                if (this._lastSelectedItem === e.itemData)
                    this._updateAndHidePopup();
                this._lastSelectedItem = e.itemData;
                if (!this.option("showDoneButton"))
                    this._updateAndHidePopup()
            },
            _setSelectedClass: function(item, itemData) {
                itemData = this._valueGetter(itemData);
                var value = this.option("value");
                var dataSourceKey = this._dataSource && this._dataSource.key();
                var selected = this._optionValuesEqual("value", itemData, value);
                if (dataSourceKey && !selected && value) {
                    var valueKey = utils.unwrapObservable(value[dataSourceKey]);
                    var itemDataKey = utils.unwrapObservable(itemData[dataSourceKey]) || itemData;
                    selected = valueKey === itemDataKey
                }
                item.toggleClass(LOOKUP_SELECTED_CLASS, selected)
            },
            _getItemRender: function() {
                var templateName = this.option("itemTemplate");
                if (!templateName || !(templateName in this.option("_templates")))
                    return this.option("itemRender") || $.proxy(this._displayGetter, this)
            },
            _toggleSelectedClass: function(e) {
                var $selectedItem = this._list._element().find("." + LOOKUP_SELECTED_CLASS);
                if ($selectedItem.length)
                    $selectedItem.removeClass(LOOKUP_SELECTED_CLASS);
                $(e.target).closest(LIST_ITEM_SELECTOR).addClass(LOOKUP_SELECTED_CLASS)
            },
            _toggleEmptyClass: function() {
                var empty = !this._selectedItem;
                this._element().toggleClass(LOOKUP_EMPTY_CLASS, empty)
            },
            _hidePopup: function() {
                this._popup.hide()
            },
            _updateAndHidePopup: function() {
                this.option("value", this._valueGetter(this._lastSelectedItem));
                clearTimeout(this._hidePopupTimer);
                this._hidePopupTimer = setTimeout($.proxy(this._hidePopup, this), POPUP_HIDE_TIMEOUT);
                this._setFieldText(this._displayGetter(this._lastSelectedItem))
            },
            _updateListItemRender: function() {
                if (this._list)
                    this._list.option("itemRender", this._getItemRender());
                else
                    this._needSetItemRenderToList = true
            },
            _updateListItemTemplate: function() {
                if (this._list)
                    this._list.option("itemTemplate", this.option("itemTemplate"))
            },
            _clean: function() {
                if (this._popup)
                    this._popup._element().remove();
                if (this._$field)
                    this._$field.remove();
                if (this._$fieldWrapper)
                    this._$fieldWrapper.remove()
            },
            _dispose: function() {
                clearTimeout(this._searchTimer);
                clearTimeout(this._hidePopupTimer);
                $(window).off(events.addNamespace("popstate", this.NAME));
                this.callBase()
            },
            _changeListOption: function(name, value) {
                if (this._list)
                    this._list.option(name, value)
            },
            _changePopupOption: function(name, value) {
                if (this._popup)
                    this._popup.option(name, value)
            },
            _optionChanged: function(name, value, previousValue) {
                switch (name) {
                    case"valueExpr":
                    case"value":
                        this._calcSelectedItem($.proxy(function() {
                            if (name === "value")
                                this._raiseValueChangeAction(value, previousValue, {selectedItem: this._selectedItem});
                            this._compileValueGetter();
                            this._compileDisplayGetter();
                            this._refreshSelected();
                            this._setFieldText()
                        }, this));
                        break;
                    case"displayExpr":
                        this._compileDisplayGetter();
                        this._updateListItemRender();
                        this._refreshSelected();
                        this._setFieldText();
                        break;
                    case"displayValue":
                        break;
                    case"itemRender":
                        this._updateListItemRender();
                    case"itemTemplate":
                        this._updateListItemTemplate();
                        break;
                    case"items":
                    case"dataSource":
                        if (name === "items")
                            this._itemsToDataSource();
                        else
                            this._initDataSource();
                        this._setListDataSource(true);
                        this._compileValueGetter();
                        this._calcSelectedItem($.proxy(this._setFieldText, this));
                        break;
                    case"searchEnabled":
                        if (this._$search)
                            this._$search.toggle(value);
                        if (this._popup)
                            this._popup._wrapper().toggleClass(LOOKUP_POPUP_SEARCH_CLASS, value);
                        break;
                    case"minFilterLength":
                        this._setListDataSource();
                        this._setFieldText();
                        this._searchChangedHandler();
                        break;
                    case"placeholder":
                        this._setFieldText();
                        break;
                    case"searchPlaceholder":
                        if (this._$search)
                            this._$search.dxTextBox("instance").option("placeholder", value);
                        break;
                    case"shownAction":
                    case"hiddenAction":
                    case"openAction":
                    case"closeAction":
                    case"animation":
                        this._renderPopup();
                        break;
                    case"title":
                    case"titleTemplate":
                        this._changePopupOption(name, value);
                        break;
                    case"position":
                    case"shading":
                    case"closeOnOutsideClick":
                        if (!this.option("usePopover"))
                            this._changePopupOption(name, value);
                        break;
                    case"fullScreen":
                        if (this._popup)
                            if (!this.option("usePopover"))
                                this._popup.option(name, value);
                            else
                                this._renderPopup();
                        break;
                    case"clearButtonText":
                    case"showClearButton":
                        this._renderClearButton();
                        break;
                    case"cancelButtonText":
                    case"showCancelButton":
                        this._renderCancelButton();
                        break;
                    case"doneButtonText":
                    case"showDoneButton":
                        this._renderDoneButton();
                        break;
                    case"popupWidth":
                        this._changePopupOption("width", value === "auto" ? this.initialOption("popupWidth") : value);
                        break;
                    case"popupHeight":
                        this._changePopupOption("height", value === "auto" ? this.initialOption("popupHeight") : value);
                        break;
                    case"usePopover":
                        this._invalidate();
                        break;
                    case"pullRefreshEnabled":
                    case"autoPagingEnabled":
                    case"useNativeScrolling":
                    case"pullingDownText":
                    case"pulledDownText":
                    case"refreshingText":
                    case"pageLoadingText":
                    case"scrollAction":
                    case"pullRefreshAction":
                    case"pageLoadingAction":
                    case"showNextButton":
                    case"nextButtonText":
                    case"grouped":
                    case"groupRender":
                    case"noDataText":
                    case"contentReadyAction":
                        this._changeListOption(name, value);
                        break;
                    case"groupTemplate":
                        this._changeListOption(name, this._getTemplateByOption(name));
                    case"searchTimeout":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            open: function() {
                this._renderContentIfNeed();
                this._popup.show()
            },
            close: function() {
                this._renderContentIfNeed();
                this._popup.hide()
            }
        }).include(ui.DataHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.autocomplete.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var KEY_DOWN = 40,
            KEY_UP = 38,
            KEY_ENTER = 13,
            KEY_ESC = 27,
            KEY_RIGHT = 39,
            KEY_TAB = 9,
            AUTOCOMPLETE_CLASS = "dx-autocomplete",
            AUTOCOMPLETE_POPUP_WRAPPER_CLASS = "dx-autocomplete-popup-wrapper",
            SELECTED_ITEM_CLASS = "dx-autocomplete-selected",
            SELECTED_ITEM_SELECTOR = "." + SELECTED_ITEM_CLASS,
            LIST_SELECTOR = ".dx-list",
            LIST_ITEM_SELECTOR = ".dx-list-item",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            SEARCH_MODES = ["startswith", "contains", "endwith", "notcontains"],
            AUTOCOMPLETE_KEYDOWN_EVENT_NAME = events.addNamespace("keydown", "dxAutocomplete"),
            AUTOCOMPLETE_KEYUP_EVENT_NAME = events.addNamespace("keyup", "dxAutocomplete"),
            AUTOCOMPLETE_FOCUSIN_EVENT_NAME = events.addNamespace("focusin", "dxAutocomplete"),
            AUTOCOMPLETE_FOCUSOUT_EVENT_NAME = events.addNamespace("focusout", "dxAutocomplete");
        DX.registerComponent("dxAutocomplete", ui.dxDropDownEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: "",
                    items: [],
                    dataSource: null,
                    itemTemplate: "item",
                    itemRender: null,
                    minSearchLength: 1,
                    searchTimeout: 0,
                    searchMode: "contains",
                    displayExpr: "this",
                    valueChangeEvent: "change keyup",
                    shouldActivateFocusOut: true,
                    maxLength: null
                })
            },
            _listElement: function() {
                return this._dropDown.content().find(LIST_SELECTOR)
            },
            _listItemElement: function() {
                return this._dropDown.content().find(LIST_ITEM_SELECTOR)
            },
            _listSelectedItemElement: function() {
                return this._dropDown.content().find(this._getSelectedItemSelector())
            },
            _init: function() {
                this.callBase();
                this._validateSearchMode();
                this._compileDisplayGetter();
                this._initDataSource();
                this._fillDataSourceFromItemsIfNeeded()
            },
            _fillDataSourceFromItemsIfNeeded: function() {
                if (!this.option("dataSource") && this.option("items"))
                    this._itemsToDataSource()
            },
            _validateSearchMode: function() {
                var searchMode = this.option("searchMode"),
                    normalizedSearchMode = searchMode.toLowerCase();
                if ($.inArray(normalizedSearchMode, SEARCH_MODES) > -1)
                    return;
                throw Error(DX.utils.stringFormat("Search mode \"{0}\" is unavailable", searchMode));
            },
            _compileDisplayGetter: function() {
                this._displayGetter = DX.data.utils.compileGetter(this.option("displayExpr"))
            },
            _render: function() {
                this.callBase();
                this._element().addClass(AUTOCOMPLETE_CLASS);
                this._renderInputEvents()
            },
            _renderDimensions: function() {
                this.callBase();
                if (this._dropDown)
                    this._dropDown.option("width", this.option("width"))
            },
            _renderContentImpl: function() {
                this._caretPosition = {
                    start: 0,
                    end: 0
                };
                this._renderDropDownContainer()
            },
            _renderButton: function(hideButton) {
                this.callBase(hideButton === false ? false : true)
            },
            _renderInputEvents: function() {
                this._input().on(AUTOCOMPLETE_KEYDOWN_EVENT_NAME, $.proxy(this._handleInputKeyDown, this)).on(AUTOCOMPLETE_KEYUP_EVENT_NAME, $.proxy(this._handleInputKeyUp, this)).on(AUTOCOMPLETE_FOCUSIN_EVENT_NAME, $.proxy(function() {
                    this._setFocusSelection()
                }, this)).on(AUTOCOMPLETE_FOCUSOUT_EVENT_NAME, $.proxy(function() {
                    if (this.option("shouldActivateFocusOut"))
                        this._hideDropDown();
                    this._toggleElementSelectedClass(false)
                }, this))
            },
            _setFocusSelection: function() {
                this._toggleElementSelectedClass(true)
            },
            _hasUpdateEvent: function(eventName) {
                return eventName && this.option("valueUpdateEvent").indexOf(eventName) !== -1
            },
            _handleInputKeyDown: function(e) {
                var $list = this._listElement(),
                    preventedKeys = [KEY_TAB, KEY_UP, KEY_DOWN],
                    key = e.which;
                if ($list.is(":hidden"))
                    return;
                if ($.inArray(key, preventedKeys) > -1)
                    e.preventDefault();
                else if (key !== KEY_ENTER)
                    this._toggleElementSelectedClass(true)
            },
            _handleInputKeyUp: function(e) {
                var key = e.which;
                this._caretPosition = {
                    start: this._input().prop("selectionStart"),
                    end: this._input().prop("selectionEnd")
                };
                switch (key) {
                    case KEY_DOWN:
                        this._handleInputDownKey();
                        break;
                    case KEY_UP:
                        this._handleInputUpKey();
                        break;
                    case KEY_ENTER:
                        this._handleInputEnterKey();
                        break;
                    case KEY_RIGHT:
                    case KEY_TAB:
                        this._handleInputCompleteKeys();
                        break;
                    case KEY_ESC:
                        this._hideDropDown();
                        break;
                    default:
                        return
                }
            },
            _handleInputDownKey: function() {
                var $selectedItem = this._listSelectedItemElement(),
                    $nextItem;
                if ($selectedItem.length) {
                    $nextItem = $selectedItem.next();
                    if ($nextItem.length)
                        $nextItem.addClass(this._getSelectedItemClass());
                    else
                        this._toggleElementSelectedClass(true);
                    $selectedItem.removeClass(this._getSelectedItemClass());
                    this._list.scrollToItem($nextItem)
                }
                else {
                    this._listItemElement().first().addClass(this._getSelectedItemClass());
                    this._list.scrollToItem(this._listItemElement().first());
                    this._toggleElementSelectedClass(false)
                }
            },
            _handleInputUpKey: function() {
                var $selectedItem = this._listSelectedItemElement(),
                    $prevItem,
                    $list = this._listElement();
                if ($list.is(":hidden"))
                    return;
                if (!$selectedItem.length) {
                    this._listItemElement().last().addClass(this._getSelectedItemClass());
                    this._list.scrollToItem(this._listItemElement().last());
                    this._toggleElementSelectedClass(false);
                    return
                }
                $selectedItem.removeClass(this._getSelectedItemClass());
                $prevItem = $selectedItem.prev();
                if ($prevItem.length) {
                    $prevItem.addClass(this._getSelectedItemClass());
                    this._list.scrollToItem($prevItem)
                }
                else
                    this._toggleElementSelectedClass(true)
            },
            _handleInputEnterKey: function() {
                var $selectedItem = this._listSelectedItemElement(),
                    receivedValue;
                if (!$selectedItem.length) {
                    this._hideDropDown();
                    return
                }
                receivedValue = this._selectedItemDataGetter();
                this._caretPosition = {
                    start: receivedValue.length,
                    end: receivedValue.length
                };
                this.option("value", receivedValue);
                this._hideDropDown();
                this._input().blur()
            },
            _handleInputCompleteKeys: function() {
                var $list = this._listElement(),
                    newValue,
                    receivedValue;
                if ($list.is(":hidden"))
                    return;
                receivedValue = this._selectedItemDataGetter();
                newValue = receivedValue.length ? receivedValue : this._dataSource.items()[0];
                this._caretPosition = {
                    start: newValue.length,
                    end: newValue.length
                };
                newValue = this._displayGetter(newValue);
                this.option("value", newValue);
                this._hideDropDown()
            },
            _toggleElementSelectedClass: function(isToggle) {
                this._element().toggleClass(this._getSelectedItemClass(), isToggle)
            },
            _selectedItemDataGetter: function() {
                var $selectedItem = this._listSelectedItemElement();
                return $selectedItem.length ? this._displayGetter($selectedItem.data(LIST_ITEM_DATA_KEY)) : []
            },
            _createDropDown: function() {
                var popupWidth = this.option("width"),
                    vOffset = 0,
                    hOffset = 0;
                if (DX.devices.current().win8)
                    vOffset = -6;
                else if (DX.devices.current().platform === "generic" || DX.devices.current().tizen)
                    vOffset = -1;
                this._dropDown = $("<div>").appendTo(this._element()).dxPopup({
                    rtlEnabled: this.option("rtlEnabled"),
                    shading: false,
                    closeOnOutsideClick: false,
                    closeOnTargetScroll: true,
                    showTitle: false,
                    width: popupWidth,
                    showingAction: $.proxy(this._dimensionChanged, this),
                    deferRendering: false,
                    shownAction: this.option("openAction"),
                    hiddenAction: this.option("closeAction"),
                    position: {
                        my: "left top",
                        at: "left bottom",
                        of: this._$element,
                        offset: {
                            h: hOffset,
                            v: vOffset
                        },
                        collision: "flip"
                    },
                    animation: {
                        show: {
                            type: "pop",
                            duration: 400,
                            from: {
                                opacity: 0,
                                scale: 1
                            },
                            to: {
                                opacity: 1,
                                scale: 1
                            }
                        },
                        hide: {
                            type: "fade",
                            duration: 400,
                            from: 1,
                            to: 0
                        }
                    }
                }).dxPopup("instance");
                this._dropDown._wrapper().addClass(AUTOCOMPLETE_POPUP_WRAPPER_CLASS);
                this._renderList()
            },
            _dimensionChanged: function() {
                this._calculatePopupDimensions()
            },
            _calculatePopupDimensions: function() {
                this._calculatePopupHeight();
                this._calculatePopupWidth()
            },
            _calculatePopupHeight: function() {
                var popup = this._dropDown;
                popup.option("height", "auto");
                var list = this._list;
                this._heightApplyingTimer = setTimeout(function() {
                    var popupHeight = popup.container().outerHeight();
                    var maxHeight = $(window).height() * 0.5;
                    popup.option("height", Math.min(popupHeight, maxHeight));
                    list.updateDimensions()
                })
            },
            _calculatePopupWidth: function() {
                var textWidth = this._element().outerWidth();
                this._dropDown.option("width", textWidth)
            },
            _getSelectedItemClass: function() {
                return SELECTED_ITEM_CLASS
            },
            _getSelectedItemSelector: function() {
                return SELECTED_ITEM_SELECTOR
            },
            _renderList: function() {
                this._list = $("<div>").appendTo(this._dropDown.content()).dxList({
                    _templates: this.option("_templates"),
                    itemClickAction: $.proxy(this._handleListItemClick, this),
                    itemTemplate: this._getTemplateByOption("itemTemplate"),
                    itemRender: this._getItemRender(),
                    noDataText: "",
                    showNextButton: false,
                    autoPagingEnabled: false,
                    dataSource: this._dataSource,
                    indicateLoading: false
                }).dxList("instance")
            },
            _getItemRender: function() {
                var templateName = this.option("itemTemplate");
                if (!templateName || !(templateName in this.option("_templates")))
                    return this.option("itemRender") || $.proxy(this._displayGetter, this)
            },
            _handleListItemClick: function(e) {
                var value = this._displayGetter(e.itemData);
                this._caretPosition = {
                    start: value.length,
                    end: value.length
                };
                this.option("value", value);
                this._hideDropDown();
                this._input().blur()
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"));
                return this._dataSource
            },
            _filterDataSource: function() {
                this._reloadDataSource(this.option("value"));
                this._clearSearchTimer()
            },
            _reloadDataSource: function(searchValue, searchMethod) {
                var that = this,
                    ds = that._dataSource;
                ds.searchExpr(that.option("displayExpr"));
                ds.searchOperation(searchMethod || that.option("searchMode"));
                ds.searchValue(searchValue);
                that._dataSource.pageIndex(0);
                that._dataSource.load().done(function() {
                    that._refreshVisibility()
                })
            },
            _refreshVisibility: function() {
                var canFilter = this.option("value").length >= this.option("minSearchLength"),
                    dataSource = this._dataSource,
                    items = dataSource && dataSource.items(),
                    hasResults = items.length;
                if (canFilter && hasResults)
                    if (items.length === 1 && this._displayGetter(items[0]) === this.option("value"))
                        this._hideDropDown();
                    else if (this._displayGetter(items[0]).length < this.option("value").length)
                        this._hideDropDown();
                    else {
                        this._dropDown._refresh();
                        this._dropDown.show();
                        this._calculatePopupHeight()
                    }
                else
                    this._hideDropDown()
            },
            _closeOutsideDropDownHandler: function(e, ignoreContainerClicks) {
                this.callBase(e, true)
            },
            _clean: function() {
                this.callBase();
                delete this._dropDown
            },
            _dispose: function() {
                clearTimeout(this._heightApplyingTimer);
                this._clearSearchTimer();
                this.callBase()
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"items":
                    case"dataSource":
                        if (name === "items")
                            this._itemsToDataSource();
                        else
                            this._initDataSource();
                    case"itemTemplate":
                    case"itemRender":
                        this._list.option(name, value);
                        break;
                    case"searchMode":
                        this._validateSearchMode();
                        break;
                    case"displayExpr":
                        this._compileDisplayGetter();
                        this._list.option("itemRender", this._getItemRender());
                        break;
                    case"minSearchLength":
                    case"searchTimeout":
                        break;
                    case"shouldActivateFocusOut":
                        this._invalidate();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _handleValueChangeEvent: function() {
                var prevValue = this.option("value");
                this.callBase.apply(this, arguments);
                if (prevValue !== this.option("value"))
                    this._applyFilter()
            },
            _applyFilter: function() {
                var canFilter = this.option("value").length >= this.option("minSearchLength");
                if (!canFilter) {
                    this._clearSearchTimer();
                    this._hideDropDown();
                    return
                }
                if (this.option("searchTimeout") > 0) {
                    if (!this._searchTimer)
                        this._searchTimer = setTimeout($.proxy(this._filterDataSource, this), this.option("searchTimeout"))
                }
                else
                    this._filterDataSource()
            },
            _clearSearchTimer: function() {
                clearTimeout(this._searchTimer);
                delete this._searchTimer
            }
        }).include(ui.DataHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.selectBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            WIDGET_CLASS = "dx-selectbox",
            POPUP_CLASS = "dx-selectbox-popup",
            SELECTBOX_SELECTED_CLASS = "dx-selectbox-selected",
            SELECTBOX_MULTISELECT_CLASS = "dx-selectbox-multiselect",
            SELECTBOX_CONTAINER_CLASS = "dx-selectbox-container",
            SELECTBOX_ARROW_CLASS = "dx-selectbox-arrow",
            SELECTBOX_ARROW_CONTAINER_CLASS = "dx-selectbox-arrow-container",
            SELECTBOX_TAG_CONTAINER_CLASS = "dx-selectbox-tag-container",
            SELECTBOX_TAG_ITEM_CLASS = "dx-selectbox-tag-item",
            SELECTBOX_TAG_ITEM_CONTAINER_CLASS = "dx-selectbox-tag-item-container",
            SELECTBOX_TAG_ITEM_CLOSE_BUTTON_CLASS = "dx-selectbox-tag-item-close-button",
            EMPTY_INPUT_CLASS = "dx-texteditor-empty",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            LIST_ITEM_SELECTOR = ".dx-list-item",
            TEXTEDITOR_BORDER_SELECTOR = ".dx-texteditor-border";
        DX.registerComponent("dxSelectBox", ui.dxAutocomplete.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    items: [],
                    value: undefined,
                    valueChangeAction: null,
                    placeholder: Globalize.localize("Select"),
                    valueExpr: null,
                    multiSelectEnabled: false,
                    values: [],
                    valueChangeEvent: "",
                    fieldTemplate: null,
                    displayValue: undefined,
                    tooltipEnabled: false,
                    shouldActivateFocusOut: false
                })
            },
            _optionsByReference: function() {
                return $.extend(this.callBase(), {value: true})
            },
            _init: function() {
                this.callBase();
                if (!this._dataSource)
                    this._itemsToDataSource();
                this._selectedItems = []
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"))
            },
            _getValueWidth: function(value) {
                var $div = $("<div>").html(value).css({
                        width: "auto",
                        position: "fixed",
                        top: "-3000px",
                        left: "-3000px"
                    }).appendTo("body");
                return $div.width()
            },
            _setTooltip: function(value) {
                if (!this.option("tooltipEnabled"))
                    return;
                if (this._$element.context.scrollWidth <= this._getValueWidth(value))
                    this._$element.context.title = value;
                else
                    this._$element.context.title = ""
            },
            _render: function() {
                this._compileValueGetter();
                this.callBase();
                var value = this.option("value");
                if (value)
                    this._searchValue(value).done($.proxy(this._updateTextBox, this));
                else
                    this._updateTextBox();
                var multiSelectEnabled = this.option("multiSelectEnabled");
                this._element().toggleClass(SELECTBOX_MULTISELECT_CLASS, multiSelectEnabled);
                this._$placeholder = this._$container.find(".dx-placeholder").eq(0);
                if (multiSelectEnabled)
                    this._renderTags();
                this._setWidgetClasses();
                this._setTooltip(this.option("value"));
                this._shouldHide = false
            },
            _renderTags: function() {
                var that = this;
                if (that._$tagContainer)
                    that._$tagContainer.remove();
                that._$tagContainer = $("<div>").addClass(SELECTBOX_TAG_CONTAINER_CLASS);
                var values = that.option("values") || [];
                var clickEventName = events.addNamespace("dxclick", that.NAME);
                var itemLoadDeferreds = [];
                that._selectedItems = [];
                $.each(values, function(index, value) {
                    var displayValue;
                    var $container = $("<div>").addClass(SELECTBOX_TAG_ITEM_CONTAINER_CLASS),
                        $tag = $("<div>").addClass(SELECTBOX_TAG_ITEM_CLASS).appendTo($container),
                        $close = $("<div>").addClass(SELECTBOX_TAG_ITEM_CLOSE_BUTTON_CLASS).appendTo($container);
                    itemLoadDeferreds.push(that._searchValue(value).done(function(result) {
                        displayValue = that._displayGetter(result);
                        $tag.append(displayValue);
                        that._selectedItems.push(result)
                    }));
                    $close.off(clickEventName).on(clickEventName, $.proxy(that._deleteTag, that));
                    $container.appendTo(that._$tagContainer)
                });
                that._$tagContainer.appendTo(that._$container);
                that._element().toggleClass(EMPTY_INPUT_CLASS, !values.length);
                that._input().val(values.length ? " " : null);
                $.when.apply($, itemLoadDeferreds).done(function() {
                    that._renderInputTemplate()
                });
                values.length > 0 ? that._$placeholder.hide() : that._$placeholder.show()
            },
            _deleteTag: function(event) {
                event.stopPropagation();
                var $item = $(event.currentTarget.parentElement),
                    index = $item.index(),
                    values = this.option("values");
                this.option().value = this.option("values")[index];
                values.splice(index, 1);
                this.option("values", values)
            },
            _renderInput: function(inputContainer) {
                this._$container = inputContainer || $("<div>");
                this._$container.addClass(SELECTBOX_CONTAINER_CLASS);
                this._element().append(this._$container);
                this.callBase(this._$container)
            },
            _renderInputTemplate: function() {
                var fieldTemplate = this._getTemplateByOption("fieldTemplate");
                if (this.option("fieldTemplate") && fieldTemplate) {
                    this._$container.empty();
                    var templateData = this.option("multiSelectEnabled") ? this._selectedItems : this._selectedItem;
                    fieldTemplate.render(this._$container, templateData);
                    if (!this._input().length)
                        DX.utils.logger.warn("A template should contain dxTextBox widget")
                }
            },
            _handleValueChangeEvent: function(e) {
                var args = [e];
                if (!this._input().val())
                    args.push(undefined);
                this.callBase.apply(this, args)
            },
            _renderButton: function(hideButton) {
                this.callBase(false)
            },
            _renderValue: function(formattedValue) {
                if (this.option("value") !== undefined) {
                    var callBase = $.proxy(this.callBase, this);
                    this._searchValue(this.option("value")).done($.proxy(function(result) {
                        if (result === undefined)
                            result = this.option("value");
                        this._selectedItem = result;
                        this.option("displayValue", this._displayGetter(result));
                        this._setTooltip(result);
                        callBase(this._displayGetter(result))
                    }, this))
                }
                else {
                    this._selectedItem = null;
                    this.option("displayValue", null);
                    this._setTooltip(null);
                    this.callBase(null)
                }
            },
            _readOnlyPropValue: function() {
                return true
            },
            _createDropDown: function() {
                var that = this;
                this.callBase();
                this._dropDown.beginUpdate();
                if (DX.devices.current().win8) {
                    var popupPosition = this._dropDown.option("position");
                    $.extend(popupPosition, {
                        at: "left top",
                        offset: {
                            h: 0,
                            v: 0
                        }
                    });
                    this._dropDown.option("position", popupPosition)
                }
                this._dropDown.option("closeOnOutsideClick", $.proxy(this._closeOutsideDropDownHandler, this));
                this._dropDown.endUpdate()
            },
            _setWidgetClasses: function() {
                var $selectbox = this._element(),
                    $popup = this._dropDown._element();
                $selectbox.addClass(WIDGET_CLASS);
                $popup.addClass(POPUP_CLASS)
            },
            _pointerDownHandler: function() {
                if (this._dropDown.option("visible"))
                    this._shouldHide = true
            },
            _clickHandler: function() {
                if (!this._dropDown.option("visible") && !this._shouldHide)
                    this._showDropDown();
                else
                    this._shouldHide = false
            },
            _applyFilter: $.noop,
            _updateTextBox: function(result) {
                var that = this,
                    clickEventName = events.addNamespace("dxclick", this.NAME),
                    pointerDownEventName = events.addNamespace("dxpointerdown", this.NAME);
                this._clickAction = this._createAction(function() {
                    that._clickHandler()
                });
                this._selectedItem = result;
                this._renderInputTemplate();
                this._$container.off(clickEventName).off(pointerDownEventName).on(clickEventName, function() {
                    that._clickAction()
                }).on(pointerDownEventName, $.proxy(this._pointerDownHandler, this))
            },
            _compileValueGetter: function() {
                this._valueGetter = DX.data.utils.compileGetter(this._valueGetterExpr())
            },
            _valueGetterExpr: function() {
                return this.option("valueExpr") || this._dataSource && this._dataSource._store._key || "this"
            },
            _setSelectedClass: function(item, itemData) {
                itemData = itemData;
                if (this.option("multiSelectEnabled"))
                    $.each(this._getSelected(), function() {
                        $(this).addClass(SELECTBOX_SELECTED_CLASS)
                    });
                else {
                    item = item || this._getSelected();
                    if (item === null)
                        return;
                    var selected = itemData !== undefined ? this._optionValuesEqual("value", this._valueGetter(itemData), this.option("value")) : true;
                    item.toggleClass(SELECTBOX_SELECTED_CLASS, selected)
                }
            },
            _getSelected: function() {
                var items = [],
                    listElement = this._list._element(),
                    values = this.option("multiSelectEnabled") ? this.option("values") : [this.option("value")],
                    valueGetter = this._valueGetter;
                $.each(this._list.option("items"), function(index, val) {
                    if ($.inArray(valueGetter(val), values) !== -1)
                        items.push(listElement.find(LIST_ITEM_SELECTOR).eq(index))
                });
                if (!this.option("multiSelectEnabled"))
                    return items[0] || null;
                return items
            },
            _removeSelectedClass: function() {
                this._list._element().find("." + SELECTBOX_SELECTED_CLASS).removeClass(SELECTBOX_SELECTED_CLASS)
            },
            _updateSelectedItems: function(item, itemData) {
                this._removeSelectedClass();
                this._setSelectedClass(item, itemData)
            },
            _handleListItemClick: function(e) {
                this._hideDropDown();
                this._shouldHide = false;
                if (this.option("multiSelectEnabled")) {
                    this.option().value = this._valueGetter(e.itemData);
                    this._addTagValue(this.option("value"))
                }
                else
                    this.option("value", this._valueGetter(e.itemData))
            },
            _handleInputEnterKey: function() {
                this.callBase();
                if (this.option("multiSelectEnabled") && this.option("value"))
                    this._addTagValue(this.option("value"))
            },
            _selectedItemDataGetter: function() {
                var $selectedItem = this._listSelectedItemElement();
                return $selectedItem.length ? this._valueGetter($selectedItem.data(LIST_ITEM_DATA_KEY)) : []
            },
            _addTagValue: function(value) {
                var values = this.option("values") || [],
                    newValues = [];
                if ($.inArray(value, values) === -1) {
                    newValues.push.apply(newValues, values);
                    newValues.push(value);
                    this.option("values", newValues)
                }
            },
            _searchValue: function(value) {
                var valueExpr = this._valueGetterExpr();
                return this._loadSingle(valueExpr, value)
            },
            _changeValueExpr: function() {
                this._compileValueGetter();
                this.option("value", this._valueGetter(this._selectedItem))
            },
            _getSelectedItemClass: function() {
                return SELECTBOX_SELECTED_CLASS
            },
            _getSelectedItemSelector: function() {
                return "." + SELECTBOX_SELECTED_CLASS
            },
            _renderList: function() {
                this.callBase();
                this._list.option({
                    autoPagingEnabled: true,
                    itemRenderedAction: $.proxy(function(e) {
                        this._setSelectedClass(e.itemElement, e.itemData)
                    }, this)
                })
            },
            _hideOnBlur: function() {
                return false
            },
            _handleClearValue: function() {
                if (this.option("multiSelectEnabled"))
                    this.option("values", []);
                this.option("value", null)
            },
            _optionChanged: function(name, value, previousValue) {
                switch (name) {
                    case"value":
                        this.callBase.apply(this, arguments);
                        this._updateSelectedItems();
                        this._renderInputTemplate();
                        break;
                    case"displayValue":
                        break;
                    case"tooltipEnabled":
                        this._setTooltip(this.option("value"));
                        break;
                    case"valueExpr":
                        this._changeValueExpr();
                        break;
                    case"displayExpr":
                        this._compileDisplayGetter();
                        this._refresh();
                        break;
                    case"fieldTemplate":
                        this._renderInputTemplate();
                        break;
                    case"values":
                        if (this.option("multiSelectEnabled")) {
                            this._renderTags();
                            this._updateSelectedItems();
                            this._raiseValueChangeAction(this.option("value"), previousValue, {values: value})
                        }
                        break;
                    case"multiSelectEnabled":
                        this._refresh();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.multiView.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            fx = DX.fx,
            translator = DX.translator;
        var MULTIVIEW_CLASS = "dx-multiview",
            MULTIVIEW_WRAPPER_CLASS = "dx-multiview-wrapper",
            MULTIVIEW_ITEM_CONTAINER_CLASS = "dx-multiview-item-container",
            MULTIVIEW_ITEM_CLASS = "dx-multiview-item",
            MULTIVIEW_ITEM_HIDDEN_CLASS = "dx-multiview-item-hidden",
            MULTIVIEW_ITEM_DATA_KEY = "dxMultiViewItemData";
        var position = function($element) {
                return translator.locate($element).left
            };
        var move = function($element, position) {
                translator.move($element, {left: position})
            };
        var animation = {
                moveTo: function($element, position, completeAction) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: position},
                        duration: 200,
                        complete: completeAction
                    })
                },
                complete: function($element) {
                    fx.stop($element, true)
                }
            };
        DX.registerComponent("dxMultiView", ui.CollectionContainerWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    selectedIndex: 0,
                    swipeEnabled: true,
                    animationEnabled: true,
                    loop: false
                })
            },
            _itemClass: function() {
                return MULTIVIEW_ITEM_CLASS
            },
            _itemDataKey: function() {
                return MULTIVIEW_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$itemContainer
            },
            _selectionByClickEnabled: function() {
                return false
            },
            _itemWidth: function() {
                if (!this._itemWidthValue)
                    this._itemWidthValue = this._$wrapper.width();
                return this._itemWidthValue
            },
            _clearItemWidthCache: function() {
                delete this._itemWidthValue
            },
            _itemsCount: function() {
                return this.option("items").length
            },
            _normalizeIndex: function(index) {
                var count = this._itemsCount();
                if (index < 0)
                    index = index + count;
                if (index >= count)
                    index = index - count;
                return index
            },
            _init: function() {
                this.callBase.apply(this, arguments);
                var $element = this._element();
                $element.addClass(MULTIVIEW_CLASS);
                this._$wrapper = $("<div>").addClass(MULTIVIEW_WRAPPER_CLASS);
                this._$wrapper.appendTo($element);
                this._$itemContainer = $("<div>").addClass(MULTIVIEW_ITEM_CONTAINER_CLASS);
                this._$itemContainer.appendTo(this._$wrapper);
                this._initSwipeable()
            },
            _dimensionChanged: function() {
                this._clearItemWidthCache()
            },
            _renderSelectedIndex: function(selectedIndex) {
                this._updateItems(selectedIndex)
            },
            _updateItems: function(selectedIndex, newIndex) {
                this._updateItemsPosition(selectedIndex, newIndex);
                this._updateItemsVisibility(selectedIndex, newIndex)
            },
            _updateItemsVisibility: function(selectedIndex, newIndex) {
                var $itemElements = this._itemElements();
                $itemElements.each(function(itemIndex, item) {
                    var $item = $(item),
                        isHidden = itemIndex !== selectedIndex && itemIndex !== newIndex;
                    $item.toggleClass(MULTIVIEW_ITEM_HIDDEN_CLASS, isHidden)
                })
            },
            _updateItemsPosition: function(selectedIndex, newIndex) {
                var $itemElements = this._itemElements(),
                    positionSign = -this._animationDirection(newIndex, selectedIndex);
                move($itemElements.eq(selectedIndex), 0);
                move($itemElements.eq(newIndex), positionSign * 100 + "%")
            },
            _updateSelectedIndex: function(newIndex, prevIndex) {
                animation.complete(this._$itemContainter);
                this._updateItems(prevIndex, newIndex);
                var animationDirection = this._animationDirection(newIndex, prevIndex);
                this._animateItemContainer(animationDirection * this._itemWidth(), $.proxy(function() {
                    move(this._$itemContainer, 0);
                    this._updateItems(newIndex);
                    this._$itemContainer.width()
                }, this))
            },
            _animateItemContainer: function(position, completeCallback) {
                if (this.option("animationEnabled"))
                    animation.moveTo(this._$itemContainer, position, completeCallback);
                else
                    completeCallback()
            },
            _animationDirection: function(newIndex, prevIndex) {
                var containerPosition = position(this._$itemContainer),
                    indexDifference = (prevIndex - newIndex) * this._getRTLSignCorrection(),
                    isSwipePresent = containerPosition !== 0,
                    directionSignVariable = isSwipePresent ? containerPosition : indexDifference;
                return utils.sign(directionSignVariable)
            },
            _initSwipeable: function() {
                this._element().dxSwipeable({
                    disabled: !this.option("swipeEnabled"),
                    elastic: false,
                    itemSizeFunc: $.proxy(this._itemWidth, this),
                    startAction: $.proxy(function(args) {
                        this._handleSwipeStart(args.jQueryEvent)
                    }, this),
                    updateAction: $.proxy(function(args) {
                        this._handleSwipeUpdate(args.jQueryEvent)
                    }, this),
                    endAction: $.proxy(function(args) {
                        this._handleSwipeEnd(args.jQueryEvent)
                    }, this)
                })
            },
            _handleSwipeStart: function(e) {
                animation.complete(this._$itemContainer);
                var selectedIndex = this.option("selectedIndex"),
                    loop = this.option("loop"),
                    lastIndex = this._itemsCount() - 1,
                    rtl = this.option("rtlEnabled");
                e.maxLeftOffset = loop || (rtl ? selectedIndex > 0 : selectedIndex < lastIndex);
                e.maxRightOffset = loop || (rtl ? selectedIndex < lastIndex : selectedIndex > 0)
            },
            _handleSwipeUpdate: function(e) {
                var offset = e.offset,
                    swipeDirection = utils.sign(offset) * this._getRTLSignCorrection();
                move(this._$itemContainer, offset * 100 + "%");
                if (swipeDirection !== this._swipeDirection) {
                    this._swipeDirection = swipeDirection;
                    var selectedIndex = this.option("selectedIndex"),
                        newIndex = this._normalizeIndex(selectedIndex - swipeDirection);
                    this._updateItems(selectedIndex, newIndex)
                }
            },
            _handleSwipeEnd: function(e) {
                var targetOffset = e.targetOffset * this._getRTLSignCorrection();
                if (targetOffset)
                    this.option("selectedIndex", this._normalizeIndex(this.option("selectedIndex") - targetOffset));
                else
                    this._animateItemContainer(0, $.noop);
                delete this._swipeDirection
            },
            _getRTLSignCorrection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._clearItemWidthCache()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"loop":
                    case"animationEnabled":
                        break;
                    case"swipeEnabled":
                        this._element().dxSwipeable("option", "disabled", !value);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxMultiView.__internals = {animation: animation}
    })(jQuery, DevExpress);
    DevExpress.MOD_WIDGETS_BASE = true
}