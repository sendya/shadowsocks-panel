/*! 
* DevExtreme (Web Widgets)
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_WIDGETS_WEB) {
    if (!DevExpress.MOD_WIDGETS_BASE)
        throw Error('Required module is not referenced: widgets-base');
    /*! Module widgets-web, file ui.pager.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            Class = DX.Class;
        var PAGES_LIMITER = 4,
            PAGER_CLASS = 'dx-pager',
            PAGER_PAGE_CLASS = 'dx-page',
            PAGER_PAGES_CLASS = 'dx-pages',
            PAGER_SELECTION_CLASS = 'dx-selection',
            PAGER_PAGE_SEPARATOR_CLASS = 'dx-separator',
            PAGER_PAGE_SIZES_CLASS = 'dx-page-sizes',
            PAGER_PAGE_SIZE_CLASS = 'dx-page-size';
        var Page = Class.inherit({
                ctor: function(value, index) {
                    var that = this;
                    that.index = index;
                    that.element = $('<div />').text(value).addClass(PAGER_PAGE_CLASS)
                },
                value: function(value) {
                    var that = this;
                    if (utils.isDefined(value))
                        that.element.text(value);
                    else {
                        var text = that.element.text();
                        if (utils.isNumber(text))
                            return parseInt(text);
                        else
                            return text
                    }
                },
                select: function(value) {
                    this.element.toggleClass(PAGER_SELECTION_CLASS, value)
                },
                render: function(rootElement, rtlEnabled) {
                    rtlEnabled ? this.element.prependTo(rootElement) : this.element.appendTo(rootElement)
                }
            });
        DX.registerComponent("dxPager", DX.DOMComponent.inherit({
            NAMESPACE: ui,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    visible: true,
                    pageIndex: 1,
                    maxPagesCount: 10,
                    pagesCount: 10,
                    pageSize: 5,
                    showPageSizes: true,
                    pageSizes: [5, 10],
                    hasKnownLastPage: true,
                    pageIndexChanged: $.noop,
                    pageSizeChanged: $.noop
                })
            },
            _toggleVisibility: function(value) {
                var $element = this._element();
                if ($element)
                    $element.css("display", value ? "" : "none")
            },
            _getPages: function(currentPage, count) {
                var pages = [],
                    showMoreButton = !this.option("hasKnownLastPage"),
                    firstValue,
                    i;
                this._testPagesCount = count;
                this._testShowMoreButton = showMoreButton;
                if (count > 1 || showMoreButton)
                    if (count <= this.option("maxPagesCount")) {
                        for (i = 1; i <= count; i++)
                            pages.push(new Page(i, i - 1));
                        if (showMoreButton)
                            pages.push(new Page('>', i - 1))
                    }
                    else {
                        pages.push(new Page(1, 0));
                        firstValue = currentPage ? currentPage.value() - currentPage.index : 1;
                        for (i = 1; i <= PAGES_LIMITER; i++)
                            pages.push(new Page(firstValue + i, i));
                        pages.push(new Page(count, PAGES_LIMITER + 1));
                        if (showMoreButton)
                            pages.push(new Page('>', PAGES_LIMITER + 1))
                    }
                return pages
            },
            _getPageByValue: function(value) {
                var that = this,
                    page,
                    i;
                for (i = 0; i < that._pages.length; i++) {
                    page = that._pages[i];
                    if (page.value() === value)
                        return page
                }
            },
            _processSelectedPage: function(maxPagesCount, pageIndex, pagesCount) {
                var that = this,
                    isPageIndexValid = false,
                    selectedPageIndex;
                if (that._pages) {
                    $.each(that._pages, function(key, page) {
                        if (pageIndex === page.value())
                            isPageIndexValid = true
                    });
                    if (!isPageIndexValid)
                        that.selectedPage = null
                }
                if (utils.isDefined(that.selectedPage)) {
                    if (pageIndex === pagesCount && pagesCount > maxPagesCount && that.selectedPage.index !== PAGES_LIMITER + 1)
                        that.selectedPage.index = PAGES_LIMITER + 1
                }
                else if (pageIndex > PAGES_LIMITER && pageIndex < pagesCount) {
                    selectedPageIndex = pagesCount - PAGES_LIMITER < pageIndex ? PAGES_LIMITER - (pagesCount - pageIndex) + 1 : 2;
                    that.selectedPage = new Page(pageIndex, selectedPageIndex)
                }
            },
            _selectPageByValue: function(value) {
                var that = this,
                    i,
                    page = that._getPageByValue(value),
                    pages = that._pages,
                    pagesLength = pages.length,
                    prevPage,
                    nextPage,
                    morePage;
                if (!utils.isDefined(page))
                    return;
                prevPage = that._pages[page.index - 1];
                nextPage = that._pages[page.index + 1];
                if (nextPage && nextPage.value() === '>') {
                    morePage = nextPage;
                    nextPage = undefined;
                    pagesLength--;
                    pages.pop()
                }
                if (that.selectedPage)
                    that.selectedPage.select(false);
                page.select(true);
                that.selectedPage = page;
                if (nextPage && nextPage.value() - value > 1)
                    if (page.index !== 0) {
                        prevPage.value(value + 1);
                        that._pages.splice(page.index, 1);
                        that._pages.splice(page.index - 1, 0, page);
                        that._pages[page.index].index = page.index;
                        page.index = page.index - 1;
                        for (i = page.index - 1; i > 0; i--)
                            that._pages[i].value(that._pages[i + 1].value() - 1)
                    }
                    else
                        for (i = 0; i < pagesLength - 1; i++)
                            that._pages[i].value(i + 1);
                if (prevPage && value - prevPage.value() > 1)
                    if (page.index !== pagesLength - 1) {
                        nextPage.value(value - 1);
                        that._pages.splice(page.index, 1);
                        that._pages.splice(page.index + 1, 0, page);
                        that._pages[page.index].index = page.index;
                        page.index = page.index + 1;
                        for (i = page.index + 1; i < pagesLength - 1; i++)
                            that._pages[i].value(that._pages[i - 1].value() + 1)
                    }
                    else
                        for (i = 1; i <= pagesLength - 2; i++)
                            that._pages[pagesLength - 1 - i].value(that._pages[pagesLength - 1].value() - i);
                if (morePage)
                    pages.push(morePage)
            },
            _renderPagesChooser: function() {
                var that = this,
                    page,
                    pageIndexChanged = that.option("pageIndexChanged"),
                    i,
                    $element = that._element();
                if (!$element)
                    return;
                that._clickPagesIndexAction = that._createAction(function(args) {
                    var e = args.jQueryEvent,
                        pageNumber = $(e.target).text(),
                        pageIndex = pageNumber === '>' ? that.option("pagesCount") + 1 : Number(pageNumber);
                    that._testPageIndex = pageIndex;
                    that.option("pageIndex", pageIndex);
                    pageIndexChanged(pageIndex)
                });
                if (utils.isDefined(that.pagesChooserElement))
                    that.pagesChooserElement.empty();
                else
                    that.pagesChooserElement = $('<div />').addClass(PAGER_PAGES_CLASS).on(events.addNamespace("dxclick", that.Name + "Pages"), '.' + PAGER_PAGE_CLASS, function(e) {
                        that._clickPagesIndexAction({jQueryEvent: e})
                    });
                if (that._pages.length === 0) {
                    that.selectedPage = null;
                    return
                }
                for (i = 0; i < that._pages.length; i++) {
                    page = that._pages[i];
                    page.render(that.pagesChooserElement, that.option('rtlEnabled'));
                    if (that._pages[i + 1] && that._pages[i + 1].value() - page.value() > 1) {
                        var $separator = $('<div>. . .</div>').addClass(PAGER_PAGE_SEPARATOR_CLASS).attr('style', '-webkit-user-select: none');
                        that.option('rtlEnabled') ? $separator.prependTo(that.pagesChooserElement) : $separator.appendTo(that.pagesChooserElement)
                    }
                }
                if (!utils.isDefined(that.pagesChooserElement[0].parentElement))
                    that.pagesChooserElement.appendTo($element)
            },
            _renderPagesSizeChooser: function() {
                var that = this,
                    i,
                    pageSizeElement,
                    currentPageSize = that.option("pageSize"),
                    pageSizes = that.option("pageSizes"),
                    showPageSizes = that.option("showPageSizes"),
                    pageSizeChanged = that.option("pageSizeChanged"),
                    pageSizeValue,
                    pagesSizesLength = pageSizes && pageSizes.length,
                    $element = that._element();
                if (!$element)
                    return;
                that._clickPagesSizeAction = that._createAction(function(args) {
                    var e = args.jQueryEvent;
                    pageSizeValue = parseInt($(e.target).text());
                    that._testPageSizeIndex = pageSizeValue;
                    that.option("pageSize", pageSizeValue);
                    pageSizeChanged(pageSizeValue)
                });
                if (utils.isDefined(that.pagesSizeChooserElement))
                    that.pagesSizeChooserElement.empty();
                else
                    that.pagesSizeChooserElement = $('<div />').addClass(PAGER_PAGE_SIZES_CLASS).on(events.addNamespace("dxclick", that.Name + "PageSize"), '.' + PAGER_PAGE_SIZE_CLASS, function(e) {
                        that._clickPagesSizeAction({jQueryEvent: e})
                    });
                if (!showPageSizes || !pagesSizesLength)
                    return;
                that._testCurrentPageSize = currentPageSize;
                for (i = 0; i < pagesSizesLength; i++) {
                    pageSizeElement = $('<div />').text(pageSizes[i]).addClass(PAGER_PAGE_SIZE_CLASS);
                    if (currentPageSize === pageSizes[i])
                        pageSizeElement.addClass(PAGER_SELECTION_CLASS);
                    that.option('rtlEnabled') ? that.pagesSizeChooserElement.prepend(pageSizeElement) : that.pagesSizeChooserElement.append(pageSizeElement)
                }
                if (!utils.isDefined(that.pagesSizeChooserElement[0].parentElement))
                    that.pagesSizeChooserElement.appendTo($element)
            },
            _render: function() {
                this._update();
                this._element().addClass(PAGER_CLASS);
                this._toggleVisibility(this.option("visible"));
                this._renderPagesSizeChooser();
                this._renderPagesChooser()
            },
            _update: function() {
                var pagesCount = this.option("pagesCount"),
                    pageIndex = this.option("pageIndex");
                this._processSelectedPage(this.option("maxPagesCount"), pageIndex, pagesCount);
                this._pages = this._getPages(this.selectedPage, pagesCount);
                this._selectPageByValue(pageIndex)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"visible":
                        this._toggleVisibility(value);
                        break;
                    case"pageIndex":
                    case"maxPagesCount":
                    case"pagesCount":
                    case"hasKnownLastPage":
                        this._update();
                        this._renderPagesChooser();
                        break;
                    case"pageSize":
                    case"pageSizes":
                        this._renderPagesSizeChooser();
                        break;
                    default:
                        this._invalidate()
                }
            },
            getHeight: function() {
                return this.option("visible") ? this._element().outerHeight() : 0
            }
        }));
        ui.dxPager.__internals = {
            PAGER_CLASS: PAGER_CLASS,
            PAGER_PAGE_CLASS: PAGER_PAGE_CLASS,
            PAGER_PAGES_CLASS: PAGER_PAGES_CLASS,
            PAGER_SELECTION_CLASS: PAGER_SELECTION_CLASS,
            PAGER_PAGE_SEPARATOR_CLASS: PAGER_PAGE_SEPARATOR_CLASS,
            PAGER_PAGE_SIZES_CLASS: PAGER_PAGE_SIZES_CLASS,
            PAGER_PAGE_SIZE_CLASS: PAGER_PAGE_SIZE_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.colorPicker.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var COLOR_PICKER_CLASS = "dx-color-picker",
            COLOR_PICKER_INPUT_CONTAINER_CLASS = "dx-color-picker-input-container",
            COLOR_PICKER_INPUT_CLASS = "dx-color-picker-input",
            COLOR_PICKER_COLOR_RESULT_PREVIEW = "dx-color-picker-color-result-preview",
            COLOR_PICKER_OVERLAY_CLASS = "dx-color-picker-overlay",
            COLOR_PICKER_OVERLAY_WITHOUT_ALPHA_CHANNEL_CLASS = "dx-color-picker-without-alpha-channel",
            COLOR_PICKER_CONTAINER_CLASS = "dx-color-picker-container",
            COLOR_PICKER_ROW_CLASS = "dx-color-picker-container-row",
            COLOR_PICKER_CELL_CLASS = "dx-color-picker-container-cell",
            COLOR_PICKER_PALETTE_CLASS = "dx-color-picker-palette",
            COLOR_PICKER_PALETTE_GRADIENT_CLASS = "dx-color-picker-palette-gradient",
            COLOR_PICKER_PALETTE_GRADIENT_WHITE_CLASS = "dx-white",
            COLOR_PICKER_PALETTE_GRADIENT_BLACK_CLASS = "dx-black",
            COLOR_PICKER_HUE_SCALE_CLASS = "dx-color-picker-hue-scale",
            COLOR_PICKER_HUE_SCALE_HANDLE_CLASS = "dx-color-picker-hue-scale-handle",
            COLOR_PICKER_HUE_SCALE_WRAPPER_CLASS = "dx-hue-scale-wrapper",
            COLOR_PICKER_CONTROLS_CONTAINER_CLASS = "dx-color-picker-controls-container",
            COLOR_PICKER_BUTTONS_CONTAINER_CLASS = "dx-color-picker-buttons-container",
            COLOR_PICKER_APPLY_BUTTON_CLASS = "dx-color-picker-apply-button",
            COLOR_PICKER_CANCEL_BUTTON_CLASS = "dx-color-picker-cancel-button",
            COLOR_PICKER_COLOR_CHOOSER_CLASS = "dx-color-picker-color-chooser",
            COLOR_PICKER_RED_LABEL_CLASS = "dx-color-picker-red-label",
            COLOR_PICKER_GREEN_LABEL_CLASS = "dx-color-picker-green-label",
            COLOR_PICKER_BLUE_LABEL_CLASS = "dx-color-picker-blue-label",
            COLOR_PICKER_HEX_LABEL_CLASS = "dx-color-picker-hex-label",
            COLOR_PICKER_RED_INPUT_CLASS = "dx-color-picker-red-input",
            COLOR_PICKER_GREEN_INPUT_CLASS = "dx-color-picker-green-input",
            COLOR_PICKER_BLUE_INPUT_CLASS = "dx-color-picker-blue-input",
            COLOR_PICKER_HEX_INPUT_CLASS = "dx-color-picker-hex-input",
            COLOR_PICKER_ALPHA_CHANNEL_SCALE_WRAPPER_CLASS = "dx-color-picker-alpha-scale-wrapper",
            COLOR_PICKER_ALPHA_CHANNEL_SCALE_CLASS = "dx-color-picker-alpha-scale",
            COLOR_PICKER_ALPHA_CHANNEL_INPUT_CLASS = "dx-color-picker-alpha-input",
            COLOR_PICKER_ALPHA_CHANNEL_LABEL_CLASS = "dx-color-picker-alpha-label",
            COLOR_PICKER_ALPHA_CHANNEL_HANDLE_CLASS = "dx-color-picker-alpha-handle",
            COLOR_PICKER_ALPHA_CHANNEL_CELL_CLASS = "dx-alpha-channel-cell",
            COLOR_PICKER_ALPHA_CHANNEL_BORDER_CLASS = "dx-alpha-channel-border",
            COLOR_PICKER_COLOR_PREVIEW_CONTAINER_CLASS = "dx-color-picker-color-preview-container",
            COLOR_PICKER_COLOR_PREVIEW_CONTAINER_INNER_CLASS = "dx-color-picker-color-preview-container-inner",
            COLOR_PICKER_COLOR_PREVIEW = "dx-color-preview",
            COLOR_PICKER_CURRENT_COLOR_PREVIEW = "dx-current-color",
            COLOR_PICKER_NEW_COLOR_PREVIEW = "dx-new-color";
        $.fn.colorPickerDrag = function(options) {
            return this.each(function(i, el) {
                    var getCoordinatesFork = function() {
                            var Xmax,
                                Xmin,
                                Ymax,
                                Ymin;
                            var deltaX = parentWidth - halfOfElWidth,
                                deltaY = parentHeight - halfOfElHeight;
                            if (options.enableStripHalfOfWidth) {
                                Xmin = 0;
                                Xmax = parentWidth
                            }
                            else {
                                Xmin = halfOfElWidth;
                                Xmax = deltaX
                            }
                            if (options.enableStripHalfOfHeight) {
                                Ymin = 0;
                                Ymax = parentHeight
                            }
                            else {
                                Ymin = halfOfElHeight;
                                Ymax = deltaY
                            }
                            return {
                                    x: {
                                        min: Xmin,
                                        max: Xmax
                                    },
                                    y: {
                                        min: Ymin,
                                        max: Ymax
                                    }
                                }
                        };
                    var $base = $(el),
                        $parent = $base.parent(),
                        parentWidth = $parent.outerWidth(),
                        parentHeight = $parent.outerHeight(),
                        elHeight = $base.height(),
                        elWidth = $base.width(),
                        motionEnabled = false,
                        halfOfElHeight = elHeight / 2,
                        halfOfElWidth = elWidth / 2,
                        coordinates = getCoordinatesFork();
                    var defaultOptions = {
                            enableVerticalMotion: true,
                            enableHorizontalMotion: true,
                            moveByClick: true,
                            enableStripHalfOfWidth: false,
                            enableStripHalfOfHeight: false,
                            verticalMotionCallback: $.noop,
                            horizontalMotionCallback: $.noop,
                            _coordinatesUpdater: $.noop
                        };
                    options = $.extend(true, defaultOptions, options);
                    var moveElement = function(event) {
                            var x = options._coordinatesUpdater(event).x,
                                y = options._coordinatesUpdater(event).y;
                            changeElementPosition(x, y)
                        };
                    var changeElementPosition = function(x, y) {
                            if (options.enableVerticalMotion) {
                                if (y < coordinates.y.min)
                                    y = coordinates.y.min;
                                if (y > coordinates.y.max)
                                    y = coordinates.y.max;
                                $base.css("top", y - halfOfElHeight);
                                options.verticalMotionCallback(y)
                            }
                            if (options.enableHorizontalMotion) {
                                if (x < coordinates.x.min)
                                    x = coordinates.x.min;
                                if (x > coordinates.x.max)
                                    x = coordinates.x.max;
                                $base.css("right", "auto");
                                $base.css("left", x - halfOfElWidth);
                                options.horizontalMotionCallback(x)
                            }
                        };
                    if (!options._coordinatesUpdater)
                        options._coordinatesUpdater = function(event) {
                            return {
                                    x: event.pageX - $parent.offset().left,
                                    y: event.pageY - $parent.offset().top
                                }
                        };
                    $base.on(events.addNamespace("dxpointerdown", "dxColorPicker"), function() {
                        motionEnabled = true
                    });
                    $("*").on(events.addNamespace("dxpointerup", "dxColorPicker"), function() {
                        motionEnabled = false
                    });
                    $("body").on(events.addNamespace("dxpointermove", "dxColorPicker"), function(event) {
                        if (motionEnabled) {
                            event.preventDefault();
                            event.stopPropagation();
                            moveElement(event)
                        }
                    });
                    if (options.moveByClick)
                        $parent.on(events.addNamespace("dxpointerdown", "dxColorPicker"), function(event) {
                            motionEnabled = true;
                            moveElement(event)
                        })
                })
        };
        var htmlCreator = {
                createElement: function(tagName, cssClass, $parent) {
                    var el = document.createElement(tagName),
                        $el = $(el);
                    if (DX.utils.isArray(cssClass))
                        cssClass = cssClass.join(" ");
                    if (cssClass)
                        $el.addClass(cssClass);
                    if ($parent)
                        return $el.appendTo($parent);
                    else
                        return $el
                },
                createHtmlRows: function(count) {
                    var $rows = [];
                    for (var i = 0; i < count; i++)
                        $rows.push(this.createElement("div", COLOR_PICKER_ROW_CLASS));
                    return $rows
                },
                createHtmlCellInsideRow: function(rowIndex, $rowParent, additionalClass) {
                    var $row,
                        $rows = $rowParent.find("." + COLOR_PICKER_ROW_CLASS);
                    if (DX.utils.isNumber(rowIndex))
                        $row = $rows.eq(rowIndex);
                    else if (DX.utils.isString(rowIndex))
                        $row = $rows[rowIndex]();
                    var $cell = this.createElement("div", COLOR_PICKER_CELL_CLASS, $row);
                    if (additionalClass)
                        $cell.addClass(additionalClass);
                    return $cell
                },
                createInputWithLabel: function(labelText, labelClass, inputClass) {
                    return this.createElement("label", labelClass).text(labelText + ":").append(this.createElement("input", inputClass))
                }
            };
        var colorHelper = {makeCSSLinearGradient: function($el) {
                    var color = this._currentColor,
                        colorAsRgb = [color.r, color.g, color.b].join(","),
                        colorAsHex = color.toHex().replace("#", "");
                    var combineGradientString = function(colorAsRgb, colorAsHex) {
                            var rtlEnabled = this.option("rtlEnabled"),
                                startColor = "rgba(" + colorAsRgb + ", " + (rtlEnabled ? "1" : "0") + ")",
                                finishColor = "rgba(" + colorAsRgb + ", " + (rtlEnabled ? "0" : "1") + ")",
                                startColorIE = "'#" + (rtlEnabled ? "00" : "") + colorAsHex + "'",
                                finishColorIE = "'#" + (rtlEnabled ? "" : "00") + colorAsHex + "'";
                            return ["background-image: -webkit-linear-gradient(180deg, " + startColor + ", " + finishColor + ")", "background-image: -moz-linear-gradient(-90deg, " + startColor + ", " + finishColor + ")", "background-image: -ms-linear-gradient(-90deg, " + startColor + ", " + finishColor + ")", "background-image: -o-linear-gradient(-90deg, " + startColor + ", " + finishColor + ")", "background-image: linear-gradient(-90deg, " + startColor + ", " + finishColor + ")", "filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=" + startColorIE + ", endColorstr=" + finishColorIE + ")", "-ms-filter: progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=" + startColorIE + ", endColorstr=" + finishColorIE + ")"].join(";")
                        };
                    $el.attr("style", combineGradientString.call(this, colorAsRgb, colorAsHex))
                }};
        DX.registerComponent("dxColorPicker", ui.dxDropDownEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    _dragCoordinatesUpdater: null,
                    _standAlone: false,
                    value: "#000000",
                    editAlphaChannel: false,
                    applyButtonText: Globalize.localize("OK"),
                    cancelButtonText: Globalize.localize("Cancel")
                })
            },
            _setCurrentColor: function(value) {
                var newColor = new DX.Color(value);
                if (!newColor.colorIsInvalid) {
                    this._currentColor = new DX.Color(value);
                    this._alpha = this._currentColor.a
                }
                else
                    this.option("value", this._currentColor.baseColor)
            },
            _initColorAndOpacity: function() {
                this._setCurrentColor(this.option("value"))
            },
            _init: function() {
                this.callBase();
                this._initColorAndOpacity()
            },
            _render: function() {
                this.callBase();
                this._element().addClass(COLOR_PICKER_CLASS);
                if (this.option("_standAlone")) {
                    this._element().addClass("dx-standalone-colorpicker");
                    this._element().find(".dx-dropdowneditor-button").trigger("dxclick")
                }
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"value":
                        this._input().val(value);
                        this._setCurrentColor(value);
                        this._makeTransparentBackground(this._$colorResultPreview);
                        this.callBase.apply(this, arguments);
                        break;
                    case"applyButtonText":
                        this._$applyButton.dxButton("instance").option("text", value);
                        break;
                    case"cancelButtonText":
                        this._$cancelButton.dxButton("instance").option("text", value);
                        break;
                    case"editAlphaChannel":
                        if (this._$colorPickerContainer) {
                            this._renderHtmlRows();
                            this._toggleContainerClass();
                            this._renderAlphaChannelElements()
                        }
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _handleValueChangeEvent: function(e) {
                if (this._dropDownVisible()) {
                    this._setCurrentColor(this._input().val());
                    this._refreshDropDown()
                }
                this.callBase(e)
            },
            _makeRgba: function() {
                return "rgba(" + [this._currentColor.r, this._currentColor.g, this._currentColor.b, this._alpha].join(", ") + ")"
            },
            _makeTransparentBackground: function($el) {
                if (DX.browser.msie && DX.browser.version === "8.0")
                    $el.css({
                        background: this._currentColor.toHex(),
                        filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + this._alpha * 100 + ")"
                    });
                else
                    $el.css("backgroundColor", this._makeRgba())
            },
            _renderInput: function() {
                this._$colorPickerInputContainer = $("<div/>").addClass(COLOR_PICKER_INPUT_CONTAINER_CLASS);
                this._$colorResultPreview = htmlCreator.createElement("div", COLOR_PICKER_COLOR_RESULT_PREVIEW, this._$colorPickerInputContainer);
                this._makeTransparentBackground(this._$colorResultPreview);
                this.callBase(this._$colorPickerInputContainer);
                this._input().addClass(COLOR_PICKER_INPUT_CLASS)
            },
            _renderValue: function(formattedValue) {
                this.callBase(this.option("editAlphaChannel") ? this._makeRgba() : this.option("value"))
            },
            _closeOutsideDropDownHandler: function(e, ignoreContainerClicks) {
                this.callBase(e, true)
            },
            _hideOnBlur: function() {
                return false
            },
            _createDropDown: function() {
                var that = this;
                this.callBase({
                    height: "",
                    width: "",
                    contentReadyAction: function() {
                        that._createColorPickerContainer()
                    }
                })
            },
            _showDropDown: function() {
                if (!this._dropDownVisible()) {
                    this.callBase();
                    this._refreshDropDown()
                }
            },
            _hideDropDown: function() {
                if (this._dropDownVisible()) {
                    this._initColorAndOpacity();
                    this.callBase()
                }
            },
            _calculateRowsCount: function() {
                var rowCount = this.option("editAlphaChannel") ? 3 : 2,
                    $renderedRows = this._$colorPickerContainer.find("." + COLOR_PICKER_ROW_CLASS);
                if (this.option("editAlphaChannel") && $renderedRows.length === 2)
                    rowCount = 1;
                if (!this.option("editAlphaChannel") && $renderedRows.length === 3)
                    rowCount = 0;
                return rowCount
            },
            _renderHtmlRows: function() {
                var $renderedRows = this._$colorPickerContainer.find("." + COLOR_PICKER_ROW_CLASS),
                    rowCount = this._calculateRowsCount($renderedRows);
                if (rowCount) {
                    var $rows = htmlCreator.createHtmlRows(rowCount);
                    if (rowCount === 1)
                        this._$colorPickerContainer.find("." + COLOR_PICKER_ROW_CLASS).eq(0).after($rows);
                    else
                        this._$colorPickerContainer.append($rows)
                }
                else
                    $renderedRows.eq(1).remove()
            },
            _toggleContainerClass: function() {
                this._$colorPickerContainer.toggleClass(COLOR_PICKER_OVERLAY_WITHOUT_ALPHA_CHANNEL_CLASS, !this.option("editAlphaChannel"))
            },
            _renderAlphaChannelElements: function() {
                if (this.option("editAlphaChannel")) {
                    this._renderAlphaChannelScale();
                    this._renderAlphaChannelInput()
                }
            },
            _createColorPickerContainer: function() {
                var $parent = this._dropDown.content();
                if (this.option("_standAlone")) {
                    this._dropDown.hide();
                    $parent = this._element()
                }
                else
                    this._dropDown.content().addClass(COLOR_PICKER_OVERLAY_CLASS);
                this._$colorPickerContainer = htmlCreator.createElement("div", COLOR_PICKER_CONTAINER_CLASS, $parent);
                this._renderHtmlRows();
                this._toggleContainerClass();
                this._createPalette();
                this._renderHueScale();
                this._renderControlsContainer();
                this._renderControls();
                this._renderAlphaChannelElements();
                this._renderButtons()
            },
            _createPalette: function() {
                var $paletteCell = htmlCreator.createHtmlCellInsideRow("first", this._$colorPickerContainer, "dx-palette-cell"),
                    $paletteGradientWhite = htmlCreator.createElement("div", [COLOR_PICKER_PALETTE_GRADIENT_CLASS, COLOR_PICKER_PALETTE_GRADIENT_WHITE_CLASS]),
                    $paletteGradientBlack = htmlCreator.createElement("div", [COLOR_PICKER_PALETTE_GRADIENT_CLASS, COLOR_PICKER_PALETTE_GRADIENT_BLACK_CLASS]);
                this._$palette = htmlCreator.createElement("div", COLOR_PICKER_PALETTE_CLASS, $paletteCell).css("backgroundColor", this._currentColor.getPureColor().toHex());
                this._createColorChooser();
                this._$palette.append([$paletteGradientWhite, $paletteGradientBlack])
            },
            _updateColor: function(isHex) {
                var rgba,
                    newColor;
                if (isHex)
                    newColor = this._validateHex("#" + this._$hexInput.val());
                else {
                    rgba = this._validateRgb();
                    if (this._$alphaChannelInput) {
                        rgba.push(this._$alphaChannelInput.val());
                        newColor = "rgba(" + rgba.join(", ") + ")"
                    }
                    else
                        newColor = "rgb(" + rgba.join(", ") + ")"
                }
                this._currentColor = new DX.Color(newColor);
                this._refreshDropDown()
            },
            _refreshDropDown: function() {
                this._placeHueMarker();
                this._placeColorChooser();
                this._updateColorParamsAndColorPreview();
                this._$palette.css("backgroundColor", this._currentColor.getPureColor().toHex());
                if (this._$alphaChannelHandle) {
                    this._updateColorTransparence(this._currentColor.a);
                    this._placeAlphaChannelHandle()
                }
            },
            _validateHex: function(hex) {
                return this._currentColor.isValidHex(hex) ? hex : this._currentColor.toHex()
            },
            _validateRgb: function() {
                var r = Number(this._$rgbInputs[0].val()),
                    g = Number(this._$rgbInputs[1].val()),
                    b = Number(this._$rgbInputs[2].val());
                if (!this._currentColor.isValidRGB(r, g, b)) {
                    r = this._currentColor.r;
                    g = this._currentColor.g;
                    b = this._currentColor.b
                }
                return [r, g, b]
            },
            _placeHueMarker: function() {
                var hueScaleHeight = this._$hueScale.parent().outerHeight(),
                    handleHeight = this._$hueScaleHandle.height();
                var top = hueScaleHeight - hueScaleHeight * this._currentColor.hsv.h / 360 - handleHeight / 2;
                if (hueScaleHeight < top + handleHeight)
                    top = hueScaleHeight - handleHeight;
                if (top < 0)
                    top = 0;
                this._$hueScaleHandle.css("top", Math.round(top))
            },
            _updateColorSaturation: function(value) {
                var hue = this._currentColor.hsv.h,
                    saturation = Math.round(value * 100 / this._$palette.width()),
                    value = this._currentColor.hsv.v;
                this._updateColorFromHsv(hue, saturation, value)
            },
            _updateColorValue: function(value) {
                var hue = this._currentColor.hsv.h,
                    saturation = this._currentColor.hsv.s,
                    value = 100 - Math.round(value * 100 / this._$palette.height());
                this._updateColorFromHsv(hue, saturation, value)
            },
            _updateColorHue: function(value) {
                var hue = 360 - Math.round((value + this._$hueScaleHandle.outerHeight() / 2) * 360 / this._$hueScale.height()),
                    saturation = this._currentColor.hsv.s,
                    value = this._currentColor.hsv.v;
                hue = hue < 0 ? 0 : hue;
                this._updateColorFromHsv(hue, saturation, value);
                this._$palette.css("backgroundColor", this._currentColor.getPureColor().toHex())
            },
            _updateColorTransparence: function(transparence) {
                this._$alphaChannelInput.val(transparence);
                this._alpha = transparence;
                this._makeTransparentBackground(this._$newColor)
            },
            _calculateColorTransparenceByScaleWidth: function(value) {
                var handleHalfWidth = this._$alphaChannelHandle.width() / 2,
                    alphaScaleWidth = this._$alphaChannelScale.width(),
                    rtlEnabled = this.option("rtlEnabled"),
                    transparence = value / this._$alphaChannelScale.width();
                transparence = rtlEnabled ? transparence : 1 - transparence;
                if (handleHalfWidth === value)
                    transparence = rtlEnabled ? 0 : 1;
                else if (value >= alphaScaleWidth - handleHalfWidth)
                    transparence = rtlEnabled ? 1 : 0;
                else if (transparence < 1)
                    transparence = transparence.toFixed(2);
                this._updateColorTransparence(transparence)
            },
            _updateColorFromHsv: function(hue, saturation, value) {
                this._currentColor = new DX.Color("hsv(" + [hue, saturation, value].join(",") + ")");
                this._updateColorParamsAndColorPreview()
            },
            _updateColorParamsAndColorPreview: function() {
                this._$hexInput.val(this._currentColor.toHex().replace("#", ""));
                this._$rgbInputs[0].val(this._currentColor.r);
                this._$rgbInputs[1].val(this._currentColor.g);
                this._$rgbInputs[2].val(this._currentColor.b);
                this._makeTransparentBackground(this._$newColor);
                if (this.option("editAlphaChannel"))
                    colorHelper.makeCSSLinearGradient.call(this, this._$alphaChannelScale)
            },
            _createColorChooser: function() {
                this._$colorChooser = htmlCreator.createElement("div", COLOR_PICKER_COLOR_CHOOSER_CLASS, this._$palette).colorPickerDrag({
                    verticalMotionCallback: $.proxy(this._updateColorValue, this),
                    horizontalMotionCallback: $.proxy(this._updateColorSaturation, this),
                    enableStripHalfOfWidth: true,
                    enableStripHalfOfHeight: true,
                    _coordinatesUpdater: this.option("_dragCoordinatesUpdater")
                });
                this._placeColorChooser()
            },
            _placeColorChooser: function() {
                var paletteHeight = this._$palette.height(),
                    colorChooserPosition = {
                        x: Math.round(this._$palette.width() * this._currentColor.hsv.s / 100 - this._$colorChooser.width() / 2),
                        y: Math.round(paletteHeight - paletteHeight * this._currentColor.hsv.v / 100 - this._$colorChooser.height() / 2)
                    };
                this._$colorChooser.css({
                    left: colorChooserPosition.x,
                    top: colorChooserPosition.y
                })
            },
            _renderHueScale: function() {
                var $hueScaleCell = htmlCreator.createHtmlCellInsideRow("first", this._$colorPickerContainer, "dx-hue-scale-cell");
                this._$hueScale = htmlCreator.createElement("div", COLOR_PICKER_HUE_SCALE_CLASS, $hueScaleCell);
                this._$hueScale.wrap("<div class=\"" + COLOR_PICKER_HUE_SCALE_WRAPPER_CLASS + "\"/>");
                this._renderHueScaleHandle()
            },
            _renderHueScaleHandle: function() {
                this._$hueScaleHandle = htmlCreator.createElement("div", COLOR_PICKER_HUE_SCALE_HANDLE_CLASS, this._$hueScale.closest("." + COLOR_PICKER_HUE_SCALE_WRAPPER_CLASS)).colorPickerDrag({
                    enableHorizontalMotion: false,
                    verticalMotionCallback: $.proxy(this._updateColorHue, this),
                    _coordinatesUpdater: this.option("_dragCoordinatesUpdater")
                });
                this._placeHueMarker()
            },
            _renderControlsContainer: function() {
                var $controlsContainerCell = htmlCreator.createHtmlCellInsideRow("first", this._$colorPickerContainer);
                this._$controlsContainer = htmlCreator.createElement("div", COLOR_PICKER_CONTROLS_CONTAINER_CLASS, $controlsContainerCell)
            },
            _renderControls: function() {
                this._renderColorsPreview();
                this._renderRgbInputs();
                this._renderHexInput()
            },
            _renderButtons: function() {
                var $buttonContainerCell = htmlCreator.createHtmlCellInsideRow("last", this._$colorPickerContainer, "dx-buttons-cell");
                this._$buttonContainer = htmlCreator.createElement("div", COLOR_PICKER_BUTTONS_CONTAINER_CLASS, $buttonContainerCell);
                this._renderApplyButton();
                this._renderCancelButton()
            },
            _renderApplyButton: function() {
                this._$applyButton = htmlCreator.createElement("div", COLOR_PICKER_APPLY_BUTTON_CLASS, this._$buttonContainer).dxButton({
                    text: this.option("applyButtonText"),
                    clickAction: $.proxy(this._applyColor, this)
                })
            },
            _applyColor: function() {
                var colorValue = this.option("editAlphaChannel") ? this._makeRgba() : this._currentColor.toHex();
                this._input().val(colorValue);
                this._makeTransparentBackground(this._$colorResultPreview);
                this._makeTransparentBackground(this._$currentColor);
                this.option("value", colorValue);
                this._hideDropDown()
            },
            _cancelChanges: function() {
                if (!this.option("_standAlone"))
                    this._hideDropDown();
                else {
                    this._initColorAndOpacity();
                    this._refreshDropDown()
                }
            },
            _renderCancelButton: function() {
                this._$cancelButton = htmlCreator.createElement("div", COLOR_PICKER_CANCEL_BUTTON_CLASS, this._$buttonContainer).dxButton({
                    text: this.option("cancelButtonText"),
                    clickAction: $.proxy(this._cancelChanges, this)
                })
            },
            _renderRgbInputs: function() {
                this._$rgbInputsWithLabels = [htmlCreator.createInputWithLabel("R", COLOR_PICKER_RED_LABEL_CLASS, COLOR_PICKER_RED_INPUT_CLASS), htmlCreator.createInputWithLabel("G", COLOR_PICKER_GREEN_LABEL_CLASS, COLOR_PICKER_GREEN_INPUT_CLASS), htmlCreator.createInputWithLabel("B", COLOR_PICKER_BLUE_LABEL_CLASS, COLOR_PICKER_BLUE_INPUT_CLASS)];
                this._$rgbInputs = [this._$rgbInputsWithLabels[0].find("input").val(this._currentColor.r).on("change", $.proxy(this._updateColor, this, false)), this._$rgbInputsWithLabels[1].find("input").val(this._currentColor.g).on("change", $.proxy(this._updateColor, this, false)), this._$rgbInputsWithLabels[2].find("input").val(this._currentColor.b).on("change", $.proxy(this._updateColor, this, false))];
                this._$controlsContainer.append(this._$rgbInputsWithLabels)
            },
            _renderHexInput: function() {
                var $hexInputWithLabel = htmlCreator.createInputWithLabel("#", COLOR_PICKER_HEX_LABEL_CLASS, COLOR_PICKER_HEX_INPUT_CLASS).appendTo(this._$controlsContainer);
                this._$hexInput = $hexInputWithLabel.find("input").val(this._currentColor.toHex().replace("#", "")).on("change", $.proxy(this._updateColor, this, true))
            },
            _renderColorsPreview: function() {
                var $colorsPreviewContainer = htmlCreator.createElement("div", COLOR_PICKER_COLOR_PREVIEW_CONTAINER_CLASS, this._$controlsContainer),
                    $colorsPreviewContainerInner = htmlCreator.createElement("div", COLOR_PICKER_COLOR_PREVIEW_CONTAINER_INNER_CLASS, $colorsPreviewContainer);
                this._$currentColor = htmlCreator.createElement("div", [COLOR_PICKER_COLOR_PREVIEW, COLOR_PICKER_CURRENT_COLOR_PREVIEW]);
                this._$newColor = htmlCreator.createElement("div", [COLOR_PICKER_COLOR_PREVIEW, COLOR_PICKER_NEW_COLOR_PREVIEW]);
                this._makeTransparentBackground(this._$currentColor);
                this._makeTransparentBackground(this._$newColor);
                $colorsPreviewContainerInner.append([this._$currentColor, this._$newColor])
            },
            _renderAlphaChannelScale: function() {
                var $alphaChannelScaleCell = htmlCreator.createHtmlCellInsideRow(1, this._$colorPickerContainer, COLOR_PICKER_ALPHA_CHANNEL_CELL_CLASS),
                    $alphaChannelBorder = htmlCreator.createElement("div", COLOR_PICKER_ALPHA_CHANNEL_BORDER_CLASS, $alphaChannelScaleCell),
                    $alphaChannelScaleWrapper = htmlCreator.createElement("div", COLOR_PICKER_ALPHA_CHANNEL_SCALE_WRAPPER_CLASS, $alphaChannelBorder);
                this._$alphaChannelScale = htmlCreator.createElement("div", COLOR_PICKER_ALPHA_CHANNEL_SCALE_CLASS, $alphaChannelScaleWrapper);
                colorHelper.makeCSSLinearGradient.call(this, this._$alphaChannelScale);
                this._renderAlphaChannelHandle($alphaChannelScaleCell)
            },
            _renderAlphaChannelInput: function() {
                var that = this,
                    $alphaChannelInputCell = htmlCreator.createHtmlCellInsideRow(1, this._$colorPickerContainer),
                    $alphaChannelInputWithLabel = htmlCreator.createInputWithLabel("Alpha", COLOR_PICKER_ALPHA_CHANNEL_LABEL_CLASS, COLOR_PICKER_ALPHA_CHANNEL_INPUT_CLASS).appendTo($alphaChannelInputCell);
                this._$alphaChannelInput = $alphaChannelInputWithLabel.find("input").val(this._alpha).on("change", function() {
                    var value = Number($(this).val());
                    value = that._currentColor.isValidAlpha(value) ? value : that._alpha;
                    that._updateColorTransparence(value);
                    that._placeAlphaChannelHandle()
                })
            },
            _renderAlphaChannelHandle: function($parent) {
                this._$alphaChannelHandle = htmlCreator.createElement("div", COLOR_PICKER_ALPHA_CHANNEL_HANDLE_CLASS, $parent).colorPickerDrag({
                    enableVerticalMotion: false,
                    horizontalMotionCallback: $.proxy(this._calculateColorTransparenceByScaleWidth, this),
                    _coordinatesUpdater: this.option("_dragCoordinatesUpdater")
                });
                this._placeAlphaChannelHandle()
            },
            _placeAlphaChannelHandle: function() {
                var alphaChannelScaleWidth = this._$alphaChannelScale.closest("." + COLOR_PICKER_ALPHA_CHANNEL_CELL_CLASS).outerWidth(),
                    handleWidth = this._$alphaChannelHandle.width();
                var left = alphaChannelScaleWidth - alphaChannelScaleWidth * this._alpha - handleWidth / 2;
                if (left < 0)
                    left = 0;
                if (alphaChannelScaleWidth < left + handleWidth)
                    left = alphaChannelScaleWidth - handleWidth;
                this._$alphaChannelHandle.css(this.option("rtlEnabled") ? "right" : "left", left)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.menuBase.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var DX_MENU_CLASS = 'dx-menu',
            DX_MENU_ITEM_CLASS = DX_MENU_CLASS + '-item',
            DX_MENU_ITEM_HOVERED_CLASS = 'dx-state-hover',
            DX_MENU_ITEM_CAPTION_CLASS = DX_MENU_ITEM_CLASS + '-text',
            DX_MENU_ITEM_POPOUT_CLASS = DX_MENU_ITEM_CLASS + '-popout',
            DX_MENU_ITEM_POPOUT_CONTAINER_CLASS = DX_MENU_ITEM_POPOUT_CLASS + '-container',
            DX_MENU_ITEM_DISABLED_CLASS = DX_MENU_ITEM_CLASS + '-disabled',
            DX_MENU_ITEM_SELECTED_CLASS = DX_MENU_ITEM_CLASS + '-selected',
            DX_MENU_ITEM_WRAPPER_CLASS = DX_MENU_ITEM_CLASS + '-wrapper',
            DX_MENU_RTL_CLASS = DX_MENU_CLASS + '-rtl',
            DX_ICON_CLASS = 'dx-icon';
        var dxMenuBase = ui.CollectionContainerWidget.inherit({
                _itemRenderDefault: function(item, index, $itemElement) {
                    var $itemContent,
                        rtlEnabled;
                    if (!utils.isDefined(item))
                        return;
                    if (item.visible !== undefined && !item.visible)
                        $itemElement.hide();
                    if (item.disabled)
                        $itemElement.addClass(DX_MENU_ITEM_DISABLED_CLASS);
                    rtlEnabled = !!this.option('rtlEnabled');
                    if (rtlEnabled)
                        $itemElement.addClass(DX_MENU_RTL_CLASS);
                    $itemContent = $('<div>').addClass('dx-menu-item-content').appendTo($itemElement);
                    this._renderImage(item, $itemContent);
                    this._renderCaption(item, $itemContent);
                    this._renderPopout(item, $itemContent)
                },
                _renderImage: function(item, $itemContent) {
                    var $itemImage,
                        $imageContainer;
                    if (item.icon)
                        $itemImage = $('<span>').addClass(DX_ICON_CLASS + "-" + item.icon).appendTo($itemContent);
                    else if (item.iconSrc)
                        $itemImage = $('<img>').attr('src', item.iconSrc).appendTo($itemContent);
                    if ($itemImage)
                        $itemImage.addClass(DX_ICON_CLASS)
                },
                _renderPopout: function(item, $itemContent) {
                    var $popOutImage,
                        $popOutContainer;
                    if (this._hasChildren(item)) {
                        $popOutContainer = $('<span>').addClass(DX_MENU_ITEM_POPOUT_CONTAINER_CLASS).appendTo($itemContent);
                        $popOutImage = $('<div>').addClass(DX_MENU_ITEM_POPOUT_CLASS).appendTo($popOutContainer)
                    }
                },
                _renderCaption: function(item, $itemContent) {
                    var $itemCaption;
                    $itemCaption = $('<span>').addClass(DX_MENU_ITEM_CAPTION_CLASS);
                    if ($.isPlainObject(item)) {
                        if (item.text)
                            $itemCaption.text(item.text)
                    }
                    else
                        $itemCaption.html(String(item));
                    $itemContent.append($itemCaption)
                },
                _renderItemHotTrack: function($item, showHotTrack) {
                    var $itemWrapper,
                        menuItem;
                    menuItem = $item.data(this._itemDataKey());
                    if (menuItem == this.option('selectedItem') && showHotTrack)
                        return;
                    if (!!this.option('hoverStateEnabled')) {
                        $itemWrapper = $item.parents('.' + DX_MENU_ITEM_WRAPPER_CLASS).eq(0);
                        if ($itemWrapper.length)
                            $itemWrapper.toggleClass(DX_MENU_ITEM_HOVERED_CLASS, showHotTrack)
                    }
                },
                _itemDataKey: function() {
                    return 'dxMenuItemDataKey'
                },
                _itemClass: function() {
                    return DX_MENU_ITEM_CLASS
                },
                _itemWrapperSelector: function() {
                    return '.' + DX_MENU_ITEM_WRAPPER_CLASS
                },
                _attachItemHoverEvents: function() {
                    var itemSelector = this._itemWrapperSelector(),
                        mouseEnterEventName,
                        mouseLeaveEventName,
                        itemMouseEnterAction = this._createAction($.proxy(function(e) {
                            this._handleItemMouseEnter(e.jQueryEvent)
                        }, this)),
                        itemMouseLeaveAction = this._createAction($.proxy(function(e) {
                            this._handleItemMouseLeave(e.jQueryEvent)
                        }, this));
                    mouseEnterEventName = events.addNamespace('mouseenter', this.NAME);
                    mouseLeaveEventName = events.addNamespace('mouseleave', this.NAME);
                    this._itemContainer().off(mouseEnterEventName, itemSelector).on(mouseEnterEventName, itemSelector, $.proxy(function(e) {
                        itemMouseEnterAction({jQueryEvent: e})
                    }, this));
                    this._itemContainer().off(mouseLeaveEventName, itemSelector).on(mouseLeaveEventName, itemSelector, $.proxy(function(e) {
                        itemMouseLeaveAction({jQueryEvent: e})
                    }, this))
                },
                _handleItemMouseMove: function(eventArgs) {
                    var that = this,
                        $item = that._getItemElementByEventArgs(eventArgs);
                    if (!that._itemX)
                        that._itemX = 0;
                    if (!that._itemY)
                        that._itemY = 0;
                    if (Math.abs(event.pageX - that._itemX) > 4 || Math.abs(event.pageY - that._itemY) > 4) {
                        that._itemX = event.pageX;
                        that._itemY = event.pageY;
                        that._handleItemMouseMoveCore($item)
                    }
                },
                _hasChildren: function(item) {
                    return item.items && item.items.length > 0
                },
                _addCustomCssClass: function($element) {
                    var cssClass = $.trim(this.option('cssClass'));
                    if (cssClass)
                        $element.addClass(cssClass)
                },
                _init: function() {
                    var items = this.option('items');
                    this.callBase();
                    this.selectedItem = this.option('selectedItem');
                    this.enableSelection = this.option('allowSelection');
                    if (utils.isDefined(this.selectedItem) && this.selectedItem != null)
                        return;
                    this.selectedItem = this._getLastSelectedItem(items);
                    if (this.selectedItem)
                        this._setOptionInternal('selectedItem', this.selectedItem)
                },
                _setOptionInternal: function(name, value) {
                    this._optionChangedInternalFlag = true;
                    this.option(name, value);
                    this._optionChangedInternalFlag = false
                },
                _getLastSelectedItem: function(items) {
                    var that = this,
                        selectedItem = null,
                        nestedSelectedItem;
                    $.each(items, function(_, item) {
                        if (item) {
                            if (item.selected && item.selectable)
                                selectedItem = item;
                            if (utils.isArray(item.items)) {
                                nestedSelectedItem = that._getLastSelectedItem(item.items);
                                if (nestedSelectedItem)
                                    selectedItem = nestedSelectedItem
                            }
                        }
                    });
                    return selectedItem
                },
                _updateSelectedItemOnClick: function($itemElement, itemData) {
                    var prevSelItem = this.$selectedItemWrapper ? this.$selectedItemWrapper.children('.dx-menu-item').eq(0).data(this._itemDataKey()) : null,
                        actionArgs = {
                            selectedItem: itemData,
                            previousSelectedItem: prevSelItem,
                            itemElement: $itemElement,
                            itemData: itemData
                        },
                        itemSelectAction = this._createActionByOption("itemSelectAction", actionArgs);
                    if (this.option('allowSelectOnClick') && itemData.selectable) {
                        if (this.$selectedItemWrapper) {
                            this.$selectedItemWrapper.removeClass(DX_MENU_ITEM_SELECTED_CLASS);
                            if (this.$selectedItemWrapper.children('.dx-menu-item').eq(0).data(this._itemDataKey()))
                                this.$selectedItemWrapper.children('.dx-menu-item').eq(0).data(this._itemDataKey()).selected = false
                        }
                        this._setOptionInternal('selectedItem', null);
                        this.$selectedItemWrapper = $itemElement.parents('.dx-menu-item-wrapper').eq(0);
                        this.$selectedItemWrapper.addClass(DX_MENU_ITEM_SELECTED_CLASS);
                        this._setOptionInternal('selectedItem', itemData);
                        itemData.selected = true;
                        itemSelectAction(actionArgs)
                    }
                },
                _handleItemClick: function(e) {
                    var itemClickActionHandler = this._createAction($.proxy(this._updateOverlayVisibilityOnClick, this));
                    this._handleItemJQueryEvent(e, "itemClickAction", {}, {afterExecute: $.proxy(itemClickActionHandler, this)})
                },
                _getItemElementByEventArgs: function(eventArgs) {
                    return $(eventArgs.currentTarget).children(this._itemSelector()).first()
                }
            });
        ui.dxMenuBase = dxMenuBase
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.contextMenu.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fx = DX.fx,
            DXMENU = 'dxContextMenu';
        var DX_MENU_CLASS = 'dx-menu',
            DX_MENU_ITEM_CLASS = DX_MENU_CLASS + '-item',
            DX_MENU_ITEM_POPOUT_CLASS = DX_MENU_ITEM_CLASS + '-popout',
            DX_MENU_ITEM_SELECTED_CLASS = DX_MENU_ITEM_CLASS + '-selected',
            DX_MENU_ITEM_HOVERED_CLASS = 'dx-state-hover',
            DX_MENU_PHONE_CLASS = 'dx-menu-phone-overlay',
            DX_MENU_ITEMS_CONTAINER_CLASS = DX_MENU_CLASS + '-items-container',
            DX_MENU_ITEM_WRAPPER_CLASS = DX_MENU_ITEM_CLASS + '-wrapper',
            DX_SUBMENU_CLASS = 'dx-submenu',
            DX_SUBMENU_LEVEL_ID = 'dxSubMenuLevel',
            DX_CONTEXT_MENU_CLASS = 'dx-context-menu',
            DX_WIDGET_CLASS = 'dx-widget',
            DX_MENU_SEPARATOR_CLASS = DX_MENU_CLASS + '-separator',
            DX_CONTEXT_MENU_CONTENT_DELIMITER_CLASS = DX_CONTEXT_MENU_CLASS + '-content-delimiter';
        DX.registerComponent("dxContextMenu", ui.dxMenuBase.inherit({
            _deprecatedOptions: {
                direction: {
                    since: "14.1",
                    message: "Use the 'submenuDirection' option instead."
                },
                allowSelectItem: {
                    since: "14.1",
                    message: "Use the 'allowSelection' option instead."
                }
            },
            _optionAliases: {
                direction: "submenuDirection",
                allowSelectItem: "allowSelection"
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    items: [],
                    showSubmenuMode: 'onHover',
                    cssClass: '',
                    invokeOnlyFromCode: false,
                    position: {
                        at: 'top left',
                        my: 'top left'
                    },
                    hoverStateEnabled: true,
                    allowSelection: true,
                    allowSelectItem: true,
                    allowSelectOnClick: true,
                    selectedItem: null,
                    itemSelectAction: null,
                    animation: {
                        show: {
                            type: "fade",
                            from: 0,
                            to: 1,
                            duration: 100
                        },
                        hide: {
                            type: 'fade',
                            from: 1,
                            to: 0,
                            duration: 100
                        }
                    },
                    showingAction: null,
                    shownAction: null,
                    hidingAction: null,
                    hiddenAction: null,
                    positioningAction: null,
                    submenuDirection: 'auto',
                    direction: 'auto',
                    visible: false,
                    target: window
                })
            },
            _optionsByReference: function() {
                return $.extend(this.callBase(), {
                        animation: true,
                        position: true,
                        selectedItem: true
                    })
            },
            _itemContainer: function() {
                return this._overlay.content()
            },
            _clean: function() {
                if (this._overlay) {
                    this._overlay._element().remove();
                    this._overlay = null
                }
                this._target.off(events.addNamespace('dxhold', this.NAME));
                this._target.off(events.addNamespace('contextmenu', this.NAME))
            },
            _optionChanged: function(name, value) {
                if (this._optionChangedInternalFlag)
                    return;
                switch (name) {
                    case'visible':
                        this._toggleVisibility(value);
                        break;
                    case'disable':
                        break;
                    case'invokeOnlyFromCode':
                        break;
                    case'items':
                        if (this._overlay.option('visible'))
                            this._overlay.toggle(false);
                        this.selectedItem = this._getLastSelectedItem(value);
                        this._setOptionInternal('selectedItem', this.selectedItem);
                        this.callBase.apply(this, arguments);
                        break;
                    case'selectedItem':
                        this.selectedItem = value;
                        break;
                    default:
                        if (this._overlay.option('visible'))
                            this._overlay.toggle(false);
                        this.callBase.apply(this, arguments)
                }
            },
            _toggleVisibility: function(value) {
                value ? this.show() : this.hide()
            },
            _render: function() {
                this._target = $(this.option('target'));
                this.option('position');
                this.callBase()
            },
            _renderContentImpl: function() {
                this._renderContextMenuOverlay();
                this._renderAdditionGraphicsElements();
                this._attachItemHoverEvents();
                this._attachShowContextMenuEvents();
                this._addCustomCssClass(this._element());
                this.callBase()
            },
            _renderDimensions: function(){},
            _renderContextMenuOverlay: function() {
                var $overlayElement,
                    $overlayContent,
                    overlayOptions = this._getOverlayOptions();
                $overlayElement = $('<div>').appendTo(this._$element);
                $overlayElement.dxOverlay(overlayOptions);
                this._overlay = $overlayElement.dxOverlay('instance');
                $overlayContent = this._overlay.content();
                $overlayContent.addClass(DX_CONTEXT_MENU_CLASS).addClass(DX_WIDGET_CLASS);
                this._addCustomCssClass($overlayContent);
                this._addPlatformDependentClass($overlayContent);
                if (this.option('visible'))
                    this.show()
            },
            _addPlatformDependentClass: function($element) {
                if (DX.devices.current().phone)
                    $element.addClass(DX_MENU_PHONE_CLASS)
            },
            _renderAdditionGraphicsElements: function() {
                if (this.option('showAdditionalElements')) {
                    this.$contentDelimiter = $('<div>').appendTo(this._itemContainer());
                    this.$contentDelimiter.addClass(DX_CONTEXT_MENU_CONTENT_DELIMITER_CLASS);
                    this.$contentDelimiter.css('position', 'absolute').css('display', 'none').css('z-index', '2000')
                }
            },
            _attachShowContextMenuEvents: function() {
                var that = this,
                    holdEventName = events.addNamespace('dxhold', this.NAME),
                    rightClickEventName = events.addNamespace('contextmenu', this.NAME),
                    holdAction = this._createAction($.proxy(function(e) {
                        if (!that.option('invokeOnlyFromCode'))
                            if (e.jQueryEvent.originalEvent && e.jQueryEvent.originalEvent.pointerType !== 'mouse')
                                that.show(e.jQueryEvent)
                    }, this)),
                    contextMenuAction = this._createAction($.proxy(function(e) {
                        if (!that.option('invokeOnlyFromCode'))
                            if (that.show(e.jQueryEvent)) {
                                e.jQueryEvent.preventDefault();
                                if (e.jQueryEvent.originalEvent)
                                    e.jQueryEvent.originalEvent.returnValue = false
                            }
                    }, this));
                this._target.off(holdEventName).on(holdEventName, $.proxy(function(e) {
                    holdAction({jQueryEvent: e})
                }, this));
                this._target.off(rightClickEventName).on(rightClickEventName, $.proxy(function(e) {
                    contextMenuAction({jQueryEvent: e})
                }, this))
            },
            _renderItems: function(items) {
                var FIRST_SUBMENU_LEVEL = 1;
                this._renderSubMenu(items, this._itemContainer(), FIRST_SUBMENU_LEVEL)
            },
            _renderSubMenu: function(items, $holder, subMenuLevel) {
                var that = this,
                    $subMenu,
                    $itemsContainer,
                    $itemWrapper,
                    $item;
                $subMenu = $('<div>').appendTo($holder);
                $subMenu.addClass(DX_SUBMENU_CLASS);
                $subMenu.data(DX_SUBMENU_LEVEL_ID, subMenuLevel);
                $subMenu.css('display', subMenuLevel === 1 ? 'block' : 'none');
                $itemsContainer = $('<ul>').appendTo($subMenu);
                $itemsContainer.addClass(DX_MENU_ITEMS_CONTAINER_CLASS);
                if (subMenuLevel === 1) {
                    if (that.option('width'))
                        $itemsContainer.css('min-width', that.option('width'));
                    if (that.option('height'))
                        $itemsContainer.css('min-height', that.option('height'))
                }
                $.each(items, function(index, item) {
                    if (item) {
                        that._renderSeparator(item, index, $itemsContainer);
                        $itemWrapper = $('<li>').appendTo($itemsContainer);
                        $itemWrapper.addClass(DX_MENU_ITEM_WRAPPER_CLASS);
                        $item = that._renderItem(index, item, $itemWrapper);
                        if (that.enableSelection && item === that.selectedItem) {
                            $itemWrapper.addClass(DX_MENU_ITEM_SELECTED_CLASS);
                            that.$selectedItemWrapper = $itemWrapper
                        }
                        if (that._hasChildren(item))
                            that._renderSubMenu(item.items, $item, ++subMenuLevel)
                    }
                })
            },
            _renderSeparator: function(item, index, $itemsContainer) {
                var $separator;
                if (item.beginGroup && index > 0) {
                    $separator = $('<li>').appendTo($itemsContainer);
                    $separator.addClass(DX_MENU_SEPARATOR_CLASS)
                }
            },
            _showAdditionalGraphicsElements: function() {
                var $subMenu = this._itemContainer().children('.dx-submenu').eq(0),
                    $rootItem = this.option('position').of,
                    positionAt = this.option('position').at,
                    positionMy = this.option('position').my,
                    position = {of: $subMenu};
                if (this.$contentDelimiter) {
                    this.$contentDelimiter.css('display', 'block');
                    if (positionAt === 'left bottom' && positionMy === 'left top' || positionAt === 'right bottom' && positionMy === 'right top') {
                        this.$contentDelimiter.width($rootItem.width() < $subMenu.width() ? $rootItem.width() - 2 : $subMenu.width() - 2);
                        if (this._itemContainer().offset().top > $rootItem.offset().top) {
                            this.$contentDelimiter.height(2);
                            if (Math.round(this._itemContainer().offset().left) < Math.round($rootItem.offset().left)) {
                                position.offset = '-1 -1';
                                position.at = 'right top';
                                position.my = 'right top'
                            }
                            else {
                                position.offset = '1 -1';
                                position.at = 'left top';
                                position.my = 'left top'
                            }
                        }
                        else {
                            this.$contentDelimiter.height(3);
                            if (Math.round(this._itemContainer().offset().left) < Math.round($rootItem.offset().left)) {
                                position.offset = '-1 2';
                                position.at = 'right bottom';
                                position.my = 'right bottom'
                            }
                            else {
                                position.offset = '1 2';
                                position.at = 'left bottom';
                                position.my = 'left bottom'
                            }
                        }
                    }
                    else {
                        this.$contentDelimiter.width(2);
                        this.$contentDelimiter.height($rootItem.height() < $subMenu.height() ? $rootItem.height() - 2 : $subMenu.height() - 2);
                        if (this._itemContainer().offset().top < $rootItem.offset().top) {
                            position.offset = positionAt === 'right top' ? '-1 -1' : '1 -1';
                            position.at = positionAt === 'right top' ? 'left bottom' : 'right bottom';
                            position.my = position.at
                        }
                        else {
                            position.offset = positionAt === 'right top' ? '-1 1' : '1 1';
                            position.at = positionMy;
                            position.my = positionMy
                        }
                    }
                    DX.position(this.$contentDelimiter, position)
                }
            },
            _getOverlayOptions: function() {
                var that = this,
                    overlayAnimation = this.option('animation'),
                    overlayOptions = {
                        animation: overlayAnimation,
                        closeOnOutsideClick: $.proxy(that._closeOnOutsideClickHandler, that),
                        closeOnTargetScroll: true,
                        deferRendering: false,
                        disabled: this.option('disabled'),
                        position: {
                            at: this.option('position').at,
                            my: this.option('position').my,
                            of: this._target
                        },
                        shading: false,
                        showTitle: false,
                        height: 'auto',
                        width: 'auto',
                        rtlEnabled: this.option('rtlEnabled'),
                        showingAction: $.proxy(that._overlayShowingActionHandler, that),
                        shownAction: $.proxy(that._overlayShownActionHandler, that),
                        hidingAction: $.proxy(that._overlayHidingActionHandler, that),
                        hiddenAction: $.proxy(that._overlayHiddenActionHandler, that),
                        positionedAction: $.proxy(that._overlayPositionedActionHandler, that)
                    };
                return overlayOptions
            },
            _removeHoverClass: function() {
                var that = this,
                    hovered_items = that._overlay._$container.find('.dx-state-hover');
                $.each(hovered_items, function(_, item) {
                    $(item).removeClass(DX_MENU_ITEM_HOVERED_CLASS)
                })
            },
            _searchActiveItem: function(target) {
                if ($(target.parentElement.parentElement).hasClass('dx-menu-item-content'))
                    return target.parentElement.parentElement.parentElement;
                if ($(target.parentElement).hasClass('dx-menu-item-content'))
                    return target.parentElement.parentElement;
                if ($(target).hasClass('dx-menu-item-content'))
                    return target.parentElement;
                else
                    return undefined
            },
            _closeOnOutsideClickHandler: function(e) {
                var that = this,
                    hovered_items = that._overlay._$container.find('.dx-state-hover'),
                    clickedItem = undefined,
                    sameUL = false,
                    shownSubMenus = $.extend([], that._shownSubMenus),
                    $subMenuElements,
                    context;
                if (e.target === document) {
                    this._removeHoverClass();
                    return true
                }
                clickedItem = this._searchActiveItem(e.target);
                if (clickedItem !== undefined) {
                    $.each(hovered_items, function(_, item) {
                        if (clickedItem.parentElement.parentElement === item.parentElement)
                            sameUL = true;
                        if (sameUL && clickedItem.parentElement !== item)
                            $(item).removeClass(DX_MENU_ITEM_HOVERED_CLASS)
                    });
                    if (this.option('showSubmenuMode') === 'onclick') {
                        $subMenuElements = $(clickedItem).find('.dx-submenu');
                        if ($subMenuElements.length > 0)
                            $.each(shownSubMenus, function(_, $subMenu) {
                                context = that._searchActiveItem($subMenu.context).parentElement;
                                if (context.parentElement === $(clickedItem)[0].parentElement.parentElement && context !== $(clickedItem)[0].parentElement)
                                    that._hideChildrenSubMenus($subMenu)
                            })
                    }
                    return false
                }
                else {
                    this._removeHoverClass();
                    return true
                }
            },
            _overlayShowingActionHandler: function(arg) {
                var action = this._createActionByOption('showingAction', {});
                action(arg)
            },
            _overlayShownActionHandler: function(arg) {
                var action = this._createActionByOption('shownAction', {});
                action(arg)
            },
            _overlayHidingActionHandler: function(arg) {
                var action = this._createActionByOption('hidingAction', {});
                action(arg);
                this._hideAllShownSubMenus()
            },
            _overlayHiddenActionHandler: function(arg) {
                var action = this._createActionByOption('hiddenAction', {});
                action(arg);
                this._setOptionInternal('visible', false)
            },
            _overlayPositionedActionHandler: function() {
                this._showAdditionalGraphicsElements()
            },
            _handleItemMouseEnter: function(eventArgs) {
                var that = this,
                    mouseMoveEventName = events.addNamespace('mousemove', that.NAME),
                    $itemElement = that._getItemElementByEventArgs(eventArgs),
                    $subMenuElement = $itemElement.children('.dx-submenu'),
                    showSubmenuMode = that.option('showSubmenuMode'),
                    shownSubMenus = $.extend([], that._shownSubMenus),
                    itemElement,
                    itemWrapper,
                    $itemWrapper = $itemElement.parents('.' + DX_MENU_ITEM_WRAPPER_CLASS).eq(0),
                    hovered_items,
                    sameOverlay;
                $.each(shownSubMenus, function(_, $subMenu) {
                    itemElement = that._getItemElementByEventArgs(eventArgs);
                    itemWrapper = $($subMenu.context);
                    sameOverlay = false;
                    if ($subMenu.context.parentElement === itemElement[0].parentElement.parentElement && $subMenu.context !== itemElement[0].parentElement) {
                        hovered_items = that._overlay._$container.find('.dx-state-hover');
                        $.each(hovered_items, function(_, item) {
                            if (item.parentElement === itemWrapper.context.parentElement)
                                sameOverlay = true;
                            if (sameOverlay && item.parentElement !== itemWrapper.context.parentElement)
                                $(item).removeClass(DX_MENU_ITEM_HOVERED_CLASS)
                        });
                        that._hideChildrenSubMenus($subMenu);
                        itemWrapper.removeClass(DX_MENU_ITEM_HOVERED_CLASS)
                    }
                });
                if ($itemElement.data(this._itemDataKey()).disabled)
                    return;
                that._renderItemHotTrack($itemElement, true);
                if (this.option('showSubmenuMode') !== 'onclick')
                    if ($subMenuElement.length > 0) {
                        that._showSubMenuGroup($subMenuElement, $itemElement);
                        $itemWrapper.addClass(DX_MENU_ITEM_HOVERED_CLASS);
                        if (showSubmenuMode && showSubmenuMode.toLowerCase() === 'onhoverstay')
                            $itemElement.off(mouseMoveEventName).on(mouseMoveEventName, function(e) {
                                that._handleItemMouseMove(e)
                            })
                    }
            },
            _handleItemMouseLeave: function(eventArgs) {
                var that = this,
                    $itemElement = that._getItemElementByEventArgs(eventArgs),
                    $subMenuElement = $itemElement.children('.dx-submenu');
                if ($itemElement.data(this._itemDataKey()).disabled)
                    return;
                if (!$subMenuElement.is(':visible'))
                    that._renderItemHotTrack($itemElement, false)
            },
            _handleItemMouseMoveCore: function($item) {
                var $subMenuElement = $item.children('.dx-submenu');
                this._showSubMenuGroup($subMenuElement, $item)
            },
            _hideSubMenuGroup: function($subMenu) {
                var that = this;
                if (this._isSubMenuVisible($subMenu))
                    that._hideSubMenuCore($subMenu)
            },
            _showSubMenuGroup: function($subMenu, $itemElement, forceRestartTimer) {
                var that = this;
                if (forceRestartTimer || !this._isSubMenuVisible($subMenu))
                    that._showSubMenuCore($subMenu, that._getSubMenuPosition($itemElement))
            },
            _getSubMenuPosition: function($rootItem) {
                var isVerticalMenu,
                    submenuDirection,
                    rtlEnabled,
                    position,
                    $rootItemWrapper;
                rtlEnabled = !!this.option('rtlEnabled');
                submenuDirection = this.option('submenuDirection').toLowerCase();
                $rootItemWrapper = $rootItem.parent('.dx-menu-item-wrapper');
                position = {
                    collision: 'flip',
                    of: $rootItemWrapper,
                    offset: {
                        h: 0,
                        v: -1
                    }
                };
                switch (submenuDirection) {
                    case'left':
                        position.at = 'left top';
                        position.my = 'right top';
                        break;
                    case'right':
                        position.at = 'right top';
                        position.my = 'left top';
                        break;
                    default:
                        if (rtlEnabled) {
                            position.at = 'left top';
                            position.my = 'right top'
                        }
                        else {
                            position.at = 'right top';
                            position.my = 'left top'
                        }
                        break
                }
                return position
            },
            _isSubMenuVisible: function($subMenu) {
                return $subMenu.css('display') !== 'none'
            },
            _animate: function($container, options) {
                fx.animate($container, options)
            },
            _stopAnimate: function($container) {
                fx.stop($container, true)
            },
            _showSubMenuCore: function($subMenu, position) {
                var animation = this.option('animation') ? this.option('animation').show : {};
                if (this._overlay && this._overlay.option('visible')) {
                    if (!utils.isDefined(this._shownSubMenus))
                        this._shownSubMenus = [];
                    if ($.inArray($subMenu, this._shownSubMenus))
                        this._shownSubMenus.push($subMenu);
                    $subMenu.css('display', 'block');
                    DevExpress.position($subMenu, position);
                    this._stopAnimate($subMenu);
                    this._animate($subMenu, animation)
                }
            },
            _hideSubMenuCore: function($subMenu) {
                var index = $.inArray($subMenu, this._shownSubMenus),
                    animation = this.option('animation') ? this.option('animation').hide : {};
                if (index >= 0)
                    this._shownSubMenus.splice(index, 1);
                this._stopAnimate($subMenu);
                this._animate($subMenu, animation.hide);
                $subMenu.css('display', 'none')
            },
            _updateOverlayVisibilityOnClick: function(actionArgs) {
                var $itemElement,
                    $subMenuElement;
                if (actionArgs.args.length && actionArgs.args[0]) {
                    actionArgs.args[0].jQueryEvent.stopPropagation();
                    $itemElement = actionArgs.args[0].itemElement;
                    $subMenuElement = $itemElement.children('.dx-submenu');
                    if ($itemElement.context === $subMenuElement.context && $subMenuElement.is(":visible"))
                        return;
                    if (!$itemElement.data(this._itemDataKey()) || $itemElement.data(this._itemDataKey()).disabled)
                        return;
                    this._updateSelectedItemOnClick($itemElement, actionArgs.args[0].itemData);
                    if ($subMenuElement.length === 0) {
                        var $prevSubMenu = $($itemElement.parents('.dx-submenu')[0]);
                        this._hideChildrenSubMenus($prevSubMenu);
                        if (!actionArgs.canceled && this._overlay && this._overlay.option('visible'))
                            this.option('visible', false)
                    }
                    else {
                        if (this._shownSubMenus && this._shownSubMenus.length > 0)
                            if (this._shownSubMenus[0].is($subMenuElement) || this._shownSubMenus[0].has($subMenuElement).length === 1)
                                this._hideChildrenSubMenus($subMenuElement);
                            else
                                this._hideAllShownSubMenus();
                        this._showSubMenuGroup($subMenuElement, $itemElement)
                    }
                }
            },
            _hideChildrenSubMenus: function($curSubMenu) {
                var that = this,
                    shownSubMenus = $.extend([], that._shownSubMenus);
                $.each(shownSubMenus, function(_, $subMenu) {
                    if ($curSubMenu.is($subMenu) || $curSubMenu.has($subMenu).length)
                        that._hideSubMenuCore($subMenu)
                })
            },
            _hideAllShownSubMenus: function() {
                var that = this,
                    shownSubMenus = $.extend([], that._shownSubMenus);
                $.each(shownSubMenus, function(_, $subMenu) {
                    that._hideSubMenuCore($subMenu)
                })
            },
            show: function(jqueryEvent) {
                var position = this.option('position'),
                    actionArgs,
                    positioningAction;
                if (jqueryEvent && jqueryEvent.preventDefault)
                    position = {
                        at: 'top left',
                        my: 'top left',
                        of: jqueryEvent
                    };
                if (!position.of)
                    position.of = this._target;
                actionArgs = {
                    position: position,
                    jQueryEvent: jqueryEvent
                };
                positioningAction = this._createActionByOption('positioningAction', actionArgs);
                positioningAction(actionArgs);
                if (!actionArgs.canceled && this._overlay) {
                    if (position) {
                        this._overlay.option('position', null);
                        this._overlay.option('position', position)
                    }
                    this._overlay.toggle(true);
                    this._setOptionInternal('visible', true)
                }
                return this.option('visible')
            },
            hide: function() {
                if (this._overlay) {
                    this._overlay.toggle(false);
                    this._setOptionInternal('visible', false)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.menu.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fx = DX.fx,
            DIV = '<div />',
            UL = '<ul />',
            DXMENU = 'dxMenu',
            DURATION = 50;
        var DX_MENU_CLASS = 'dx-menu',
            DX_MENU_VERTICAL_CLASS = DX_MENU_CLASS + '-vertical',
            DX_MENU_HORIZONTAL_CLASS = DX_MENU_CLASS + '-horizontal',
            DX_MENU_ITEM_CLASS = DX_MENU_CLASS + '-item',
            DX_MENU_ITEM_SELECTED_CLASS = DX_MENU_ITEM_CLASS + '-selected',
            DX_MENU_ITEMS_CONTAINER_CLASS = DX_MENU_CLASS + '-items-container',
            DX_MENU_ITEM_WITH_SUBMENU_CLASS = DX_MENU_ITEM_CLASS + '-with-submenu',
            DX_MENU_ITEM_WRAPPER_CLASS = DX_MENU_ITEM_CLASS + '-wrapper',
            DX_CONTEXT_MENU_CLASS = 'dx-context-menu',
            DX_MENU_SEPARATOR_CLASS = DX_MENU_CLASS + '-separator',
            DX_CONTEXT_MENU_CONTAINER_BORDER_CLASS = DX_CONTEXT_MENU_CLASS + '-container-border';
        DX.registerComponent("dxMenu", ui.dxMenuBase.inherit({
            _deprecatedOptions: {
                firstSubMenuDirection: {
                    since: "14.1",
                    message: "Use the 'submenuDirection' option instead."
                },
                showPopupMode: {
                    since: "14.1",
                    message: "Use the 'showFirstSubmenuMode' option instead."
                },
                allowSelectItem: {
                    since: "14.1",
                    message: "Use the 'allowSelection' option instead."
                }
            },
            _optionAliases: {
                firstSubMenuDirection: "submenuDirection",
                showPopupMode: "showFirstSubmenuMode",
                allowSelectItem: "allowSelection"
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    orientation: 'horizontal',
                    submenuDirection: 'auto',
                    firstSubMenuDirection: 'auto',
                    showFirstSubmenuMode: 'onclick',
                    showPopupMode: 'onclick',
                    showSubmenuMode: 'auto',
                    items: [],
                    hoverStateEnabled: true,
                    allowSelection: true,
                    allowSelectItem: true,
                    allowSelectOnClick: true,
                    selectedItem: null,
                    cssClass: '',
                    animation: {
                        show: {
                            type: "fade",
                            from: 0,
                            to: 1,
                            duration: 100
                        },
                        hide: {
                            type: 'fade',
                            from: 1,
                            to: 0,
                            duration: 100
                        }
                    },
                    submenuShowingAction: null,
                    submenuShownAction: null,
                    submenuHidingAction: null,
                    submenuHiddenAction: null,
                    itemSelectAction: null
                })
            },
            _optionsByReference: function() {
                return $.extend(this.callBase(), {
                        animation: true,
                        selectedItem: true
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(DX_MENU_CLASS);
                this._addCustomCssClass(this._element());
                this._attachItemHoverEvents()
            },
            _renderItems: function(items) {
                var that = this,
                    isVerticalMenu,
                    $rootGroup,
                    $itemsContainer,
                    $itemWrapper,
                    $item,
                    $popupMenu,
                    $separator;
                isVerticalMenu = that.option('orientation') === 'vertical';
                $rootGroup = $('<div>').appendTo(that._element());
                $rootGroup.addClass(isVerticalMenu ? DX_MENU_VERTICAL_CLASS : DX_MENU_HORIZONTAL_CLASS);
                $itemsContainer = $('<ul>').appendTo($rootGroup);
                $itemsContainer.addClass(DX_MENU_ITEMS_CONTAINER_CLASS);
                $itemsContainer.css('min-height', this._getValueHeight($rootGroup));
                $.each(items, function(index, item) {
                    if (item) {
                        that._renderSeparator(item, index, $itemsContainer);
                        $itemWrapper = $('<li>').appendTo($itemsContainer);
                        $itemWrapper.addClass(DX_MENU_ITEM_WRAPPER_CLASS);
                        $item = that._renderItem(index, item, $itemWrapper);
                        that._renderSelectedItem(item, $itemWrapper);
                        that._renderChildrenItems(item, $item)
                    }
                })
            },
            _renderSeparator: function(item, index, $itemsContainer) {
                var $separator;
                if (item.beginGroup && index > 0) {
                    $separator = $('<li>').appendTo($itemsContainer);
                    $separator.addClass(DX_MENU_SEPARATOR_CLASS)
                }
            },
            _renderSelectedItem: function(item, $itemWrapper) {
                if (this.option('allowSelection'))
                    if (item === this.selectedItem) {
                        $itemWrapper.addClass(DX_MENU_ITEM_SELECTED_CLASS);
                        this.$selectedItemWrapper = $itemWrapper
                    }
            },
            _renderChildrenItems: function(item, $item) {
                if (this._hasChildren(item)) {
                    this._createPopupMenu(item.items, $item, this.selectedItem).appendTo($item);
                    this._renderBorderElement($item)
                }
            },
            _renderBorderElement: function($item) {
                var $border = $('<div>').appendTo($item);
                $border.addClass(DX_CONTEXT_MENU_CONTAINER_BORDER_CLASS);
                $border.css('display', 'none')
            },
            _getValueHeight: function($root) {
                var $div = $("<div>").html("Jj").css({
                        width: "auto",
                        position: "fixed",
                        top: "-3000px",
                        left: "-3000px"
                    }).appendTo($root),
                    height = $div.height();
                $div.remove();
                return height
            },
            _handleItemMouseEnter: function(eventArg) {
                var that = this,
                    DX_MENU_HOVERSTAY_TIMEOUT = 300,
                    mouseMoveEventName,
                    $item,
                    popupMenu,
                    showFirstSubmenuMode,
                    isHoverStayMode;
                $item = that._getItemElementByEventArgs(eventArg);
                if ($item.data(this._itemDataKey()).disabled)
                    return;
                that._renderItemHotTrack($item, true);
                popupMenu = that._getPopupMenuByRootElement($item);
                showFirstSubmenuMode = that.option('showFirstSubmenuMode').toLowerCase();
                if (showFirstSubmenuMode !== 'onclick' && popupMenu) {
                    clearTimeout(that._hidePopupMenuTimer);
                    clearTimeout(that._showPopupMenuTimer);
                    isHoverStayMode = that.option('showFirstSubmenuMode') !== 'onhover';
                    if (isHoverStayMode && that.visiblePopupMenu == popupMenu && !popupMenu._overlay.option('visible')) {
                        mouseMoveEventName = events.addNamespace('mousemove', that.NAME);
                        $item.off(mouseMoveEventName).on(mouseMoveEventName, $.proxy(that._handleItemMouseMove, that));
                        that._showPopupMenuTimer = setTimeout(function() {
                            that._showPopupMenu(popupMenu, $item)
                        }, DX_MENU_HOVERSTAY_TIMEOUT)
                    }
                    else
                        that._showPopupMenu(popupMenu, $item)
                }
            },
            _handleItemMouseLeave: function(eventArg) {
                var that = this,
                    DX_MENU_HOVER_TIMEOUT = 50,
                    DX_MENU_HOVERSTAY_TIMEOUT = 300,
                    $item,
                    popupMenu,
                    showFirstSubmenuMode,
                    timeout;
                showFirstSubmenuMode = that.option('showFirstSubmenuMode').toLowerCase();
                timeout = that.option('showFirstSubmenuMode') !== 'onhover' ? DX_MENU_HOVERSTAY_TIMEOUT : DX_MENU_HOVER_TIMEOUT;
                $item = that._getItemElementByEventArgs(eventArg);
                if ($item.data(this._itemDataKey()).disabled)
                    return;
                that._renderItemHotTrack($item, false);
                if (showFirstSubmenuMode !== 'onclick') {
                    clearTimeout(that._showPopupMenuTimer);
                    clearTimeout(that._hidePopupMenuTimer);
                    that._hidePopupMenuTimer = setTimeout(function() {
                        popupMenu = that._getPopupMenuByRootElement($item);
                        that._hidePopupMenu(popupMenu);
                        if (that.visiblePopupMenu == popupMenu)
                            that.visiblePopupMenu = null
                    }, timeout)
                }
            },
            _handleItemMouseMoveCore: function($item) {
                var that = this,
                    DX_MENU_HOVERSTAY_TIMEOUT = 300,
                    popupMenu;
                if (that._showPopupMenuTimer) {
                    clearTimeout(that._hidePopupMenuTimer);
                    clearTimeout(that._showPopupMenuTimer);
                    popupMenu = that._getPopupMenuByRootElement($item),
                    that._showPopupMenuTimer = setTimeout(function() {
                        that._showPopupMenu(popupMenu, $item)
                    }, DX_MENU_HOVERSTAY_TIMEOUT)
                }
            },
            _updateOverlayVisibilityOnClick: function(actionArgs) {
                var that = this,
                    $item,
                    popupMenu;
                if (actionArgs.args.length && actionArgs.args[0]) {
                    actionArgs.args[0].jQueryEvent.stopPropagation();
                    $item = actionArgs.args[0].itemElement;
                    if ($item.data(this._itemDataKey()).disabled)
                        return;
                    popupMenu = that._getPopupMenuByRootElement($item);
                    this._updateSelectedItemOnClick($item, actionArgs.args[0].itemData);
                    if (popupMenu)
                        if (popupMenu._overlay.option('visible')) {
                            if (that.option('showFirstSubmenuMode') === 'onclick')
                                that._hidePopupMenu(popupMenu)
                        }
                        else
                            that._showPopupMenu(popupMenu, $item)
                }
            },
            _createPopupMenu: function(items, $rootItem, nestedSelectedItem) {
                var that = this,
                    popupMenu,
                    $popupMenuContainer = $('<div>'),
                    $popupMenuTarget = $('<div>'),
                    $popupMenuOverlayContent,
                    popupMenuMouseEnterName,
                    popupMenuMouseLeaveName;
                popupMenuMouseEnterName = events.addNamespace('mouseenter', that.NAME + '_popupMenu');
                popupMenuMouseLeaveName = events.addNamespace('mouseleave', that.NAME + '_popupMenu');
                $popupMenuContainer.dxContextMenu({
                    _templates: this.option("_templates"),
                    target: $popupMenuTarget,
                    items: items,
                    position: that._getPopupMenuPosition($rootItem),
                    showAdditionalElements: true,
                    selectedItem: nestedSelectedItem,
                    cssClass: this.option('cssClass'),
                    animation: this.option('animation'),
                    rtlEnabled: this.option('rtlEnabled'),
                    disabled: this.option('disabled'),
                    showSubmenuMode: this.option('showSubmenuMode') === 'auto' ? this.option('showFirstSubmenuMode') : this.option('showSubmenuMode'),
                    itemSelectAction: $.proxy(this._nestedItemSelectActionHandler, this),
                    itemClickAction: $.proxy(this._nestedItemClickActionHandler, this),
                    showingAction: $.proxy(this._contextMenuShowingActionHandler, this, $rootItem, popupMenu),
                    shownAction: $.proxy(this._contextMenuShownActionHandler, this, $rootItem, popupMenu),
                    hidingAction: $.proxy(this._contextMenuHidingActionHandler, this, $rootItem, popupMenu),
                    hiddenAction: $.proxy(this._contextMenuHiddenActionHandler, this, $rootItem, popupMenu)
                });
                $popupMenuContainer.addClass(DX_CONTEXT_MENU_CLASS);
                popupMenu = $popupMenuContainer.dxContextMenu('instance');
                $popupMenuOverlayContent = popupMenu._overlay.content();
                $popupMenuOverlayContent.off(popupMenuMouseEnterName).on(popupMenuMouseEnterName, null, $.proxy(this._handlePopupMenuMouseEnter, this, $rootItem));
                $popupMenuOverlayContent.off(popupMenuMouseLeaveName).on(popupMenuMouseLeaveName, null, $.proxy(this._handlePopupMenuMouseLeave, this, $rootItem));
                return $popupMenuContainer
            },
            _getPopupMenuPosition: function($rootItem) {
                var isVerticalMenu,
                    submenuDirection,
                    rtlEnabled,
                    popupMenuPosition;
                rtlEnabled = !!this.option('rtlEnabled');
                isVerticalMenu = this.option('orientation').toLowerCase() == 'vertical';
                submenuDirection = this.option('submenuDirection').toLowerCase();
                popupMenuPosition = {
                    collision: 'flip',
                    of: $rootItem
                };
                switch (submenuDirection) {
                    case'leftOrTop':
                        popupMenuPosition.at = isVerticalMenu ? 'left top' : 'left top';
                        popupMenuPosition.my = isVerticalMenu ? 'right top' : 'left bottom';
                        break;
                    case'rightOrBottom':
                        popupMenuPosition.at = isVerticalMenu ? 'right top' : 'left bottom';
                        popupMenuPosition.my = isVerticalMenu ? 'left top' : 'left top';
                        break;
                    case'auto':
                    default:
                        if (isVerticalMenu) {
                            popupMenuPosition.at = rtlEnabled ? 'left top' : 'right top';
                            popupMenuPosition.my = rtlEnabled ? 'right top' : 'left top'
                        }
                        else {
                            popupMenuPosition.at = rtlEnabled ? 'right bottom' : 'left bottom';
                            popupMenuPosition.my = rtlEnabled ? 'right top' : 'left top'
                        }
                        break
                }
                return popupMenuPosition
            },
            _nestedItemSelectActionHandler: function(arg) {
                this._updateSelectedItemOnClick(arg.itemElement, arg.itemData)
            },
            _nestedItemClickActionHandler: function(arg) {
                var action = this._createActionByOption('itemClickAction', {});
                action(arg)
            },
            _contextMenuShowingActionHandler: function($rootItem, popupMenu) {
                var action,
                    $borderElt,
                    animation;
                action = this._createActionByOption('submenuShowingAction', {});
                action({
                    rootItem: $rootItem,
                    popupMenu: popupMenu
                });
                $borderElt = $rootItem.children('.' + DX_CONTEXT_MENU_CONTAINER_BORDER_CLASS);
                if (this._options.width !== undefined)
                    if (this._options.rtlEnabled)
                        $borderElt.width(this._$element.width() - $rootItem.position().right);
                    else
                        $borderElt.width(this._$element.width() - $rootItem.position().left);
                $borderElt.css('display', 'block');
                DX.fx.stop($borderElt, true);
                animation = this.option('animation') ? this.option('animation').show : {};
                DX.fx.animate($borderElt, animation);
                $rootItem.addClass(DX_MENU_ITEM_WITH_SUBMENU_CLASS)
            },
            _contextMenuShownActionHandler: function($rootItem, popupMenu) {
                var action = this._createActionByOption('submenuShownAction', {});
                action({
                    rootItem: $rootItem,
                    popupMenu: popupMenu
                })
            },
            _contextMenuHidingActionHandler: function($rootItem, popupMenu) {
                var action,
                    $borderElt,
                    animation;
                action = this._createActionByOption('submenuHidingAction', {});
                action({
                    rootItem: $rootItem,
                    popupMenu: popupMenu
                });
                $borderElt = $rootItem.children('.' + DX_CONTEXT_MENU_CONTAINER_BORDER_CLASS);
                animation = this.option('animation') ? this.option('animation').hide : {};
                DX.fx.animate($borderElt, animation);
                $borderElt.css('display', 'none');
                $rootItem.removeClass(DX_MENU_ITEM_WITH_SUBMENU_CLASS)
            },
            _contextMenuHiddenActionHandler: function($rootItem, popupMenu) {
                var action = this._createActionByOption('submenuHiddenAction', {});
                action({
                    rootItem: $rootItem,
                    popupMenu: popupMenu
                })
            },
            _handlePopupMenuMouseEnter: function($rootItem) {
                this._hoveredPopupMenuContainer = $rootItem
            },
            _handlePopupMenuMouseLeave: function($rootItem) {
                var that = this,
                    popupMenu,
                    HOVER_TIMEOUT = 50;
                setTimeout(function() {
                    if (!that._hoveredPopupMenuContainer || !that._hoveredPopupMenuContainer.is(that._hoveredRootItem)) {
                        popupMenu = that._getPopupMenuByRootElement($rootItem);
                        if (popupMenu)
                            popupMenu.hide()
                    }
                    that._hoveredPopupMenuContainer = null
                }, HOVER_TIMEOUT)
            },
            _showPopupMenu: function(popupMenu, $popupMenuContainer) {
                if (utils.isDefined(this.visiblePopupMenu) && this.visiblePopupMenu !== popupMenu)
                    this.visiblePopupMenu.hide();
                this._renderItemHotTrack($popupMenuContainer, false);
                popupMenu.show();
                this.visiblePopupMenu = popupMenu;
                this._hoveredRootItem = $popupMenuContainer
            },
            _hidePopupMenu: function(popupMenu) {
                if (!this._hoveredRootItem || !this._hoveredRootItem.is(this._hoveredPopupMenuContainer))
                    if (popupMenu)
                        popupMenu.hide();
                this._hoveredRootItem = null
            },
            _optionChanged: function(name, value) {
                if (this._optionChangedInternalFlag)
                    return;
                if (this.visiblePopupMenu)
                    this.visiblePopupMenu.hide();
                switch (name) {
                    case'items':
                        this.selectedItem = this._getLastSelectedItem(value);
                        this._setOptionInternal('selectedItem', this.selectedItem);
                        this.callBase.apply(this, arguments);
                        break;
                    case'selectedItem':
                        this.selectedItem = value;
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _getPopupMenuByRootElement: function($rootItem) {
                var popupMenu = null,
                    $popupMenu;
                if ($rootItem) {
                    $popupMenu = $rootItem.children('.dx-context-menu');
                    if ($popupMenu.length > 0)
                        popupMenu = $popupMenu.dxContextMenu('instance')
                }
                return popupMenu
            },
            _containNode: function(hierarchy, node) {
                var that = this,
                    nestedResult = false,
                    result = false;
                $.each(hierarchy, function(_, curNode) {
                    if (curNode == node)
                        result = true;
                    if (curNode.items) {
                        nestedResult = that._containNode(curNode.items, node);
                        nestedResult ? result = nestedResult : result
                    }
                });
                return result
            }
        }));
        ui.dxMenu.__internals = {MENU_AMIMATION_DURATION: DURATION}
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.js */
    (function($, DX) {
        var ui = DX.ui,
            utils = DX.utils;
        var DATAGRID_ROW_SELECTOR = ".dx-row";
        var ModuleItem = DX.Class.inherit({
                ctor: function(component) {
                    var that = this;
                    that.component = component;
                    that.disposing = component.disposing;
                    that._actions = {};
                    $.each(this.callbackNames() || [], function(index, name) {
                        var flags = that.callbackFlags(name);
                        that[this] = $.Callbacks(flags)
                    })
                },
                callbackNames: function(){},
                callbackFlags: function(name){},
                publicMethods: function(){},
                init: function(){},
                option: function() {
                    return this.component.option.apply(this.component, arguments)
                },
                optionChanged: function(name, value, prevValue){},
                getController: function(name) {
                    return this.component._controllers[name]
                },
                getView: function(name) {
                    return this.component._views[name]
                },
                createAction: function(actionName, config) {
                    var action;
                    if (utils.isFunction(actionName)) {
                        action = this.component._createAction($.proxy(actionName, this), config);
                        return function(e) {
                                action({jQueryEvent: e})
                            }
                    }
                    else
                        this._actions[actionName] = this.option(actionName) ? this.component._createActionByOption(actionName, config) : null
                },
                executeAction: function(actionName, options) {
                    var action = this._actions[actionName];
                    return action && action(options)
                },
                dispose: function() {
                    var that = this;
                    $.each(that.callbackNames() || [], function() {
                        that[this].empty()
                    })
                }
            });
        var Controller = ModuleItem;
        var ViewController = Controller;
        var View = ViewController.inherit({
                _element: function() {
                    return this._$element
                },
                _renderCore: function(options){},
                _afterRender: function($root){},
                _parentElement: function() {
                    return this._$parent
                },
                ctor: function(component) {
                    this.callBase(component);
                    this.renderCompleted = $.Callbacks();
                    this.resizeCompleted = $.Callbacks()
                },
                isVisible: function() {
                    return true
                },
                getTemplate: function(name) {
                    return this.component._getTemplate(name)
                },
                render: function($parent, options) {
                    var $element = this._$element,
                        isVisible = this.isVisible();
                    this._$parent = $parent;
                    if (!$element)
                        $element = this._$element = $('<div />').appendTo($parent);
                    $element.toggle(isVisible);
                    if (isVisible) {
                        this._renderCore(options);
                        this._afterRender($parent);
                        this.renderCompleted.fire()
                    }
                },
                resize: function() {
                    this.isResizing = true;
                    this.resizeCompleted.fire();
                    this.isResizing = false
                },
                focus: function() {
                    this._element().focus()
                }
            });
        var processModules = function(that, modules) {
                var controllerTypes = {},
                    viewTypes = {};
                that._controllers = {};
                that._views = {};
                $.each(modules, function() {
                    var controllers = this.controllers,
                        moduleName = this.name,
                        views = this.views;
                    controllers && $.each(controllers, function(name, type) {
                        if (controllerTypes[name])
                            throw'Module "' + moduleName + '". Controller "' + name + '" is already registered';
                        else if (!(type && type.subclassOf && type.subclassOf(Controller))) {
                            type.subclassOf(Controller);
                            throw'Module "' + moduleName + '". Controller "' + name + '" must be inheritor of DevExpress.ui.dataGrid.Controller';
                        }
                        controllerTypes[name] = type
                    });
                    views && $.each(views, function(name, type) {
                        if (viewTypes[name])
                            throw'Module "' + moduleName + '". View "' + name + '" is already registered';
                        else if (!(type && type.subclassOf && type.subclassOf(View)))
                            throw'Module "' + moduleName + '". View "' + name + '" must be inheritor of DevExpress.ui.dataGrid.View';
                        viewTypes[name] = type
                    })
                });
                $.each(modules, function() {
                    var extenders = this.extenders;
                    if (extenders) {
                        extenders.controllers && $.each(extenders.controllers, function(name, extender) {
                            if (controllerTypes[name])
                                controllerTypes[name] = controllerTypes[name].inherit(extender)
                        });
                        extenders.views && $.each(extenders.views, function(name, extender) {
                            if (viewTypes[name])
                                viewTypes[name] = viewTypes[name].inherit(extender)
                        })
                    }
                });
                var registerPublicMethods = function(that, name, moduleItem) {
                        var publicMethods = moduleItem.publicMethods();
                        if (publicMethods)
                            $.each(publicMethods, function(index, methodName) {
                                if (moduleItem[methodName])
                                    if (!that[methodName])
                                        that[methodName] = function() {
                                            return moduleItem[methodName].apply(moduleItem, arguments)
                                        };
                                    else
                                        throw'Public method "' + methodName + '" is already registered';
                                else
                                    throw'Public method "' + name + '.' + methodName + '" is not exists';
                            })
                    };
                $.each(controllerTypes, function(name, controllerType) {
                    var controller = new controllerType(that);
                    controller.name = name;
                    registerPublicMethods(that, name, controller);
                    that._controllers[name] = controller
                });
                $.each(viewTypes, function(name, viewType) {
                    var view = new viewType(that);
                    view.name = name;
                    registerPublicMethods(that, name, view);
                    that._views[name] = view
                })
            };
        var dataGrid = ui.dataGrid = {
                __internals: {},
                modules: [],
                View: View,
                ViewController: ViewController,
                Controller: Controller,
                registerModule: function(name, module) {
                    var modules = this.modules,
                        i;
                    for (i = 0; i < modules.length; i++)
                        if (modules[i].name === name)
                            return;
                    module.name = name;
                    modules.push(module)
                },
                unregisterModule: function(name) {
                    this.modules = $.grep(this.modules, function(module) {
                        return module.name !== name
                    })
                },
                processModules: processModules
            };
        DX.registerComponent("dxDataGrid", ui.Widget.inherit(function() {
            return {
                    _activeStateUnit: DATAGRID_ROW_SELECTOR,
                    _deprecatedOptions: {"editing.texts.recoverRow": {
                            since: "14.1",
                            message: "Use the 'undeleteRow' option instead."
                        }},
                    _optionAliases: {"editing.texts.recoverRow": "editing.texts.undeleteRow"},
                    _setDefaultOptions: function() {
                        var that = this;
                        that.callBase();
                        $.each(dataGrid.modules, function() {
                            if ($.isFunction(this.defaultOptions))
                                that.option(this.defaultOptions())
                        })
                    },
                    _defaultOptionsRules: function() {
                        return this.callBase().slice(0).concat([{
                                    device: [{platform: "ios"}, {platform: "ios7"}],
                                    options: {showRowLines: true}
                                }, {
                                    device: function() {
                                        return DevExpress.browser.webkit
                                    },
                                    options: {loadPanel: {animation: {show: {
                                                    easing: 'cubic-bezier(1, 0, 1, 0)',
                                                    duration: 500,
                                                    from: {opacity: 0},
                                                    to: {opacity: 1}
                                                }}}}
                                }, {
                                    device: function() {
                                        return DX.devices.real().ios
                                    },
                                    options: {loadingTimeout: 30}
                                }])
                    },
                    _init: function() {
                        var that = this;
                        that.callBase();
                        processModules(that, dataGrid.modules);
                        $.each(that._controllers, function() {
                            this.init()
                        });
                        $.each(that._views, function() {
                            this.init()
                        });
                        that._gridView = that._views['gridView']
                    },
                    _clean: $.noop,
                    _optionChanged: function(name, value, prevValue) {
                        var that = this;
                        that.callBase(name, value, prevValue);
                        $.each(that._controllers, function() {
                            this.optionChanged(name, value, prevValue)
                        });
                        $.each(that._views, function() {
                            this.optionChanged(name, value, prevValue)
                        })
                    },
                    _dimensionChanged: function() {
                        this.resize()
                    },
                    _visibilityChanged: function() {
                        this.resize()
                    },
                    _renderContentImpl: function() {
                        var that = this;
                        that._gridView.render(that._element())
                    },
                    _renderContent: function() {
                        this._renderContentImpl()
                    },
                    _getTemplate: function(templateName) {
                        var template,
                            templateClass,
                            $template;
                        if (!this.option("_templates")[templateName]) {
                            $template = $(templateName);
                            if ($template.length === 1) {
                                templateClass = this._templateProvider.getTemplateClass();
                                this.option("_templates")[templateName] = new templateClass($template)
                            }
                        }
                        return this.callBase(templateName)
                    },
                    _dispose: function() {
                        var that = this;
                        that.callBase();
                        $.each(that._controllers, function() {
                            this.dispose()
                        });
                        $.each(that._views, function() {
                            this.dispose()
                        })
                    },
                    beginUpdate: function() {
                        var that = this;
                        that.callBase();
                        if (that._controllers)
                            $.each(that._controllers, function() {
                                this.beginUpdate && this.beginUpdate()
                            });
                        if (that._views)
                            $.each(that._views, function() {
                                this.beginUpdate && this.beginUpdate()
                            })
                    },
                    endUpdate: function() {
                        var that = this;
                        if (that._controllers)
                            $.each(that._controllers, function() {
                                this.endUpdate && this.endUpdate()
                            });
                        if (that._views)
                            $.each(that._views, function() {
                                this.endUpdate && this.endUpdate()
                            });
                        that.callBase()
                    },
                    getController: function(name) {
                        return this._controllers[name]
                    },
                    getView: function(name) {
                        return this._views[name]
                    },
                    resize: function() {
                        this._gridView.resize()
                    }
                }
        }()))
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.groupingHelperBase.js */
    (function($, DX) {
        var normalizeSortingInfo = DX.data.utils.normalizeSortingInfo;
        DX.ui.dataGrid.GroupingHelperBase = DX.Class.inherit(function() {
            var findGroupInfoByKey = function(groupsInfo, key) {
                    var i;
                    for (i = 0; i < groupsInfo.length; i++)
                        if (DX.data.utils.keysEqual(null, groupsInfo[i].key, key))
                            return groupsInfo[i]
                };
            var getGroupInfoIndexByOffset = function(groupsInfo, offset) {
                    var index;
                    for (index = 0; index < groupsInfo.length; index++)
                        if (groupsInfo[index].offset > offset)
                            break;
                    return index
                };
            var updateGroupInfoOffsets = function(groupsInfo) {
                    var groupInfo,
                        index,
                        newIndex;
                    for (index = 0; index < groupsInfo.length; index++) {
                        groupInfo = groupsInfo[index];
                        if (groupInfo.data && groupInfo.data.offset !== groupInfo.offset) {
                            groupsInfo.splice(index, 1);
                            groupInfo.offset = groupInfo.data.offset;
                            newIndex = getGroupInfoIndexByOffset(groupsInfo, groupInfo.offset);
                            groupsInfo.splice(newIndex, 0, groupInfo);
                            if (newIndex > index)
                                index--
                        }
                    }
                };
            var cleanGroupsInfo = function(groupsInfo, groupIndex, groupsCount) {
                    var i;
                    for (i = 0; i < groupsInfo.length; i++)
                        if (groupIndex + 1 >= groupsCount)
                            groupsInfo[i].children = [];
                        else
                            cleanGroupsInfo(groupsInfo[i].children, groupIndex + 1, groupsCount)
                };
            return {
                    ctor: function(dataSource) {
                        this._dataSource = dataSource;
                        this.reset()
                    },
                    reset: function() {
                        this._groupsInfo = [];
                        this._totalCountCorrection = 0
                    },
                    totalItemsCount: function() {
                        var that = this,
                            totalCount = that._dataSource.totalCount();
                        return totalCount > 0 ? totalCount + that._totalCountCorrection : 0
                    },
                    itemsCount: function() {
                        return this._itemsCount || 0
                    },
                    mergeLoadedData: function(datas, groupDataOptions) {
                        var data = this.mergeLoadedDataCore(datas, groupDataOptions);
                        this._itemsCount = this.calculateItemsCount(data);
                        return data
                    },
                    updateTotalItemsCount: function(totalCountCorrection) {
                        this._totalCountCorrection = totalCountCorrection || 0
                    },
                    _isGroupItemCountable: function(item) {
                        return !this._isVirtualPaging() || !item.isContinuation
                    },
                    _isVirtualPaging: function() {
                        var dataSource = this._dataSource,
                            dataSourceOptions = dataSource && dataSource._options,
                            scrollingMode = dataSourceOptions && dataSourceOptions.scrolling && dataSourceOptions.scrolling.mode;
                        return scrollingMode === 'virtual' || scrollingMode === 'infinite'
                    },
                    updateItemsCount: function(data, groupsCount) {
                        function calculateItemsCount(that, items, groupsCount) {
                            var i,
                                result = 0;
                            if (items)
                                if (!groupsCount)
                                    result = items.length;
                                else
                                    for (i = 0; i < items.length; i++) {
                                        if (that._isGroupItemCountable(items[i]))
                                            result++;
                                        result += calculateItemsCount(that, items[i].items, groupsCount - 1)
                                    }
                            return result
                        }
                        this._itemsCount = calculateItemsCount(this, data, groupsCount)
                    },
                    foreachGroups: function(callback, childrenAtFirst) {
                        var that = this;
                        function foreachGroupsCore(groupsInfo, callback, childrenAtFirst, parents) {
                            var i,
                                callbackResult,
                                callbackResults = [];
                            function executeCallback(callback, data, parents, callbackResults) {
                                var callbackResult = data && callback(data, parents);
                                callbackResults.push(callbackResult);
                                return callbackResult
                            }
                            for (i = 0; i < groupsInfo.length; i++) {
                                parents.push(groupsInfo[i].data);
                                if (!childrenAtFirst && executeCallback(callback, groupsInfo[i].data, parents, callbackResults) === false)
                                    return false;
                                if (!groupsInfo[i].data || groupsInfo[i].data.isExpanded) {
                                    callbackResult = foreachGroupsCore(groupsInfo[i].children, callback, childrenAtFirst, parents);
                                    callbackResults.push(callbackResult);
                                    if (callbackResult === false)
                                        return false
                                }
                                if (childrenAtFirst && executeCallback(callback, groupsInfo[i].data, parents, callbackResults) === false)
                                    return false;
                                parents.pop()
                            }
                            return $.when.apply($, callbackResults).always(function() {
                                    updateGroupInfoOffsets(groupsInfo)
                                })
                        }
                        return foreachGroupsCore(that._groupsInfo, callback, childrenAtFirst, [])
                    },
                    findGroupInfo: function(path) {
                        var that = this,
                            i,
                            pathIndex,
                            groupInfo,
                            groupsInfo = that._groupsInfo;
                        for (pathIndex = 0; groupsInfo && pathIndex < path.length; pathIndex++) {
                            groupInfo = findGroupInfoByKey(groupsInfo, path[pathIndex]);
                            groupsInfo = groupInfo && groupInfo.children
                        }
                        return groupInfo && groupInfo.data
                    },
                    addGroupInfo: function(groupInfoData) {
                        var that = this,
                            index,
                            groupInfo,
                            path = groupInfoData.path,
                            pathIndex,
                            groupsInfo = that._groupsInfo;
                        for (pathIndex = 0; pathIndex < path.length; pathIndex++) {
                            groupInfo = findGroupInfoByKey(groupsInfo, path[pathIndex]);
                            if (!groupInfo) {
                                groupInfo = {
                                    key: path[pathIndex],
                                    offset: groupInfoData.offset,
                                    children: []
                                };
                                index = getGroupInfoIndexByOffset(groupsInfo, groupInfoData.offset);
                                groupsInfo.splice(index, 0, groupInfo)
                            }
                            if (pathIndex === path.length - 1) {
                                groupInfo.data = groupInfoData;
                                updateGroupInfoOffsets(groupsInfo)
                            }
                            groupsInfo = groupInfo.children
                        }
                    },
                    allowCollapseAll: function() {
                        return true
                    },
                    collapseAll: function(groupIndex) {
                        if (!this.allowCollapseAll()) {
                            DX.utils.logger.error("The collapseAll method cannot be called when using a remote data source");
                            return false
                        }
                        return this._collapseExpandAll(groupIndex, false)
                    },
                    expandAll: function(groupIndex) {
                        return this._collapseExpandAll(groupIndex, true)
                    },
                    _collapseExpandAll: function(groupIndex, isExpand) {
                        var that = this,
                            dataSource = that._dataSource,
                            group = dataSource.group(),
                            groups = normalizeSortingInfo(group || []),
                            i;
                        if (groups.length) {
                            for (i = 0; i < groups.length; i++)
                                if (groupIndex === undefined || groupIndex === i)
                                    groups[i].isExpanded = isExpand;
                                else if (group && group[i])
                                    groups[i].isExpanded = group[i].isExpanded;
                            dataSource.group(groups);
                            that.foreachGroups(function(groupInfo, parents) {
                                if (groupIndex === undefined || groupIndex === parents.length - 1)
                                    groupInfo.isExpanded = isExpand
                            });
                            that.updateItemsCount()
                        }
                        return true
                    },
                    processLoadOptions: function(storeLoadOptions) {
                        this._group = storeLoadOptions.group
                    },
                    refresh: function(storeLoadOptions) {
                        var that = this,
                            groupIndex,
                            oldGroups = normalizeSortingInfo(that._group || []),
                            groups = normalizeSortingInfo(storeLoadOptions.group || []),
                            groupsCount = Math.min(oldGroups.length, groups.length);
                        that._group = storeLoadOptions.group;
                        for (groupIndex = 0; groupIndex < groupsCount; groupIndex++)
                            if (oldGroups[groupIndex].selector !== groups[groupIndex].selector) {
                                groupsCount = groupIndex;
                                break
                            }
                        if (!groupsCount)
                            that.reset();
                        else
                            cleanGroupsInfo(that._groupsInfo, 0, groupsCount)
                    }
                }
        }())
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.groupingHelper.js */
    (function($, DX) {
        var utils = DX.utils,
            normalizeSortingInfo = DX.data.utils.normalizeSortingInfo,
            keysEqual = DX.data.utils.keysEqual;
        var loadTotalCount = function(store, options) {
                var d = $.Deferred(),
                    loadOptions = $.extend({
                        skip: 0,
                        take: 0,
                        requireTotalCount: true
                    }, options);
                store.load(loadOptions).done(function(data, extra) {
                    if (extra && isFinite(extra.totalCount))
                        d.resolve(extra.totalCount);
                    else
                        store.totalCount(options).done($.proxy(d.resolve, d)).fail($.proxy(d.reject, d))
                }).fail($.proxy(d.reject, d));
                return d
            };
        DX.ui.dataGrid.GroupingHelper = DX.ui.dataGrid.GroupingHelperBase.inherit(function() {
            var foreachCollapsedGroups = function(that, callback) {
                    return that.foreachGroups(function(groupInfo) {
                            if (!groupInfo.isExpanded)
                                return callback(groupInfo)
                        })
                };
            var correctSkipLoadOption = function(that, skip) {
                    var skipCorrection = 0,
                        resultSkip = skip || 0;
                    if (skip) {
                        foreachCollapsedGroups(that, function(groupInfo) {
                            if (groupInfo.offset - skipCorrection >= skip)
                                return false;
                            skipCorrection += groupInfo.count - 1
                        });
                        resultSkip += skipCorrection
                    }
                    return resultSkip
                };
            var processGroupItems = function(that, items, path, offset, skipFirstItem, take) {
                    var i,
                        item,
                        offsetInfo,
                        removeLastItemsCount = 0,
                        needRemoveFirstItem = false;
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if ('key' in item && item.items !== undefined) {
                            path.push(item.key);
                            var groupInfo = that.findGroupInfo(path);
                            if (groupInfo && !groupInfo.isExpanded) {
                                item.items = null;
                                offset += groupInfo.count;
                                take--;
                                if (take < 0)
                                    removeLastItemsCount++;
                                if (skipFirstItem)
                                    needRemoveFirstItem = true
                            }
                            else if (item.items) {
                                offsetInfo = processGroupItems(that, item.items, path, offset, skipFirstItem, take);
                                if (skipFirstItem)
                                    if (offsetInfo.offset - offset > 1)
                                        item.isContinuation = true;
                                    else
                                        needRemoveFirstItem = true;
                                offset = offsetInfo.offset;
                                take = offsetInfo.take;
                                if (take < 0)
                                    if (item.items.length)
                                        item.isContinuationOnNextPage = true;
                                    else
                                        removeLastItemsCount++
                            }
                            path.pop()
                        }
                        else {
                            if (skipFirstItem)
                                needRemoveFirstItem = true;
                            offset++;
                            take--;
                            if (take < 0)
                                removeLastItemsCount++
                        }
                        skipFirstItem = false
                    }
                    if (needRemoveFirstItem)
                        items.splice(0, 1);
                    if (removeLastItemsCount)
                        items.splice(-removeLastItemsCount, removeLastItemsCount);
                    return {
                            offset: offset,
                            take: take
                        }
                };
            var pathEquals = function(path1, path2) {
                    var i;
                    if (path1.length !== path2.length)
                        return false;
                    for (i = 0; i < path1.length; i++)
                        if (!keysEqual(null, path1[i], path2[i]))
                            return false;
                    return true
                };
            var updateGroupOffsets = function(that, items, path, offset, additionalGroupInfo) {
                    var i,
                        item,
                        groupsInfo = that._groupsInfo;
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if ('key' in item && item.items !== undefined) {
                            path.push(item.key);
                            if (additionalGroupInfo && pathEquals(additionalGroupInfo.path, path))
                                additionalGroupInfo.offset = offset;
                            var groupInfo = that.findGroupInfo(path);
                            if (groupInfo && !groupInfo.isExpanded) {
                                groupInfo.offset = offset;
                                offset += groupInfo.count
                            }
                            else
                                offset = updateGroupOffsets(that, item.items, path, offset, additionalGroupInfo);
                            path.pop()
                        }
                        else
                            offset++
                    }
                    return offset
                };
            var removeGroupLoadOption = function(storeLoadOptions) {
                    if (storeLoadOptions.group) {
                        storeLoadOptions.sort = normalizeSortingInfo(storeLoadOptions.group || []).concat(normalizeSortingInfo(storeLoadOptions.sort || []));
                        delete storeLoadOptions.group
                    }
                };
            var createGroupFilter = function(path, storeLoadOptions) {
                    var groups = normalizeSortingInfo(storeLoadOptions.group || []),
                        i,
                        filter = [];
                    for (i = 0; i < path.length; i++)
                        filter.push([groups[i].selector, '=', path[i]]);
                    if (storeLoadOptions.filter)
                        filter.push(storeLoadOptions.filter);
                    return filter
                };
            var createOffsetFilter = function(path, storeLoadOptions) {
                    var groups = normalizeSortingInfo(storeLoadOptions.group || []),
                        i,
                        j,
                        filterElement,
                        filter = [];
                    for (i = 0; i < path.length; i++) {
                        filterElement = [];
                        for (j = 0; j <= i; j++)
                            filterElement.push([groups[j].selector, i === j ? groups[j].desc ? '>' : '<' : '=', path[j]]);
                        if (filter.length)
                            filter.push('or');
                        filter.push(filterElement)
                    }
                    if (storeLoadOptions.filter)
                        filter.push(storeLoadOptions.filter);
                    return filter
                };
            return {
                    processLoadOptions: function(storeLoadOptions) {
                        var that = this,
                            currentTake,
                            loadOptions,
                            collapsedPaths = [],
                            collapsedPathsByLoads = [],
                            skipFirstItem = false,
                            take,
                            offset,
                            group = storeLoadOptions.group,
                            groupLoadOptions = [];
                        that.callBase(storeLoadOptions);
                        removeGroupLoadOption(storeLoadOptions);
                        loadOptions = $.extend({}, storeLoadOptions);
                        loadOptions.skip = correctSkipLoadOption(that, storeLoadOptions.skip);
                        if (loadOptions.skip && loadOptions.take && group) {
                            loadOptions.skip--;
                            loadOptions.take++;
                            skipFirstItem = true
                        }
                        if (loadOptions.take && group) {
                            take = loadOptions.take;
                            loadOptions.take++
                        }
                        offset = loadOptions.skip || 0;
                        if (loadOptions.take) {
                            foreachCollapsedGroups(that, function(groupInfo) {
                                if (groupInfo.offset >= loadOptions.skip + loadOptions.take)
                                    return false;
                                else if (groupInfo.offset >= loadOptions.skip && groupInfo.count) {
                                    currentTake = groupInfo.offset - loadOptions.skip;
                                    if (currentTake > 0) {
                                        groupLoadOptions.push($.extend({}, loadOptions, {
                                            skip: loadOptions.skip,
                                            take: currentTake
                                        }));
                                        loadOptions.take -= currentTake;
                                        collapsedPathsByLoads.push(collapsedPaths);
                                        collapsedPaths = []
                                    }
                                    loadOptions.skip = groupInfo.offset + groupInfo.count;
                                    loadOptions.take--;
                                    collapsedPaths.push(groupInfo.path)
                                }
                            });
                            if (!groupLoadOptions.length || loadOptions.take > 0)
                                groupLoadOptions.push(loadOptions);
                            if (collapsedPaths.length)
                                collapsedPathsByLoads.push(collapsedPaths)
                        }
                        else
                            groupLoadOptions.push(loadOptions);
                        return {
                                loads: groupLoadOptions,
                                data: {
                                    collapsedPathsByLoads: collapsedPathsByLoads,
                                    offset: offset,
                                    skipFirstItem: skipFirstItem,
                                    take: take,
                                    group: group
                                }
                            }
                    },
                    updateTotalItemsCount: function() {
                        var itemsCountCorrection = 0;
                        foreachCollapsedGroups(this, function(groupInfo) {
                            if (groupInfo.count)
                                itemsCountCorrection -= groupInfo.count - 1
                        });
                        this.callBase(itemsCountCorrection)
                    },
                    changeGroupExpand: function(path) {
                        var that = this,
                            dataSource = that._dataSource,
                            basePageIndex = dataSource.basePageIndex && dataSource.basePageIndex() || dataSource.pageIndex(),
                            offset = correctSkipLoadOption(that, basePageIndex * dataSource.pageSize()),
                            groupCountQuery;
                        groupCountQuery = loadTotalCount(dataSource.store(), {filter: createGroupFilter(path, {
                                filter: dataSource.filter(),
                                group: dataSource.group()
                            })});
                        return $.when(groupCountQuery).done(function(count) {
                                var groupInfo;
                                count = parseInt(count.length ? count[0] : count);
                                groupInfo = that.findGroupInfo(path);
                                if (groupInfo) {
                                    updateGroupOffsets(that, dataSource.items(), [], offset);
                                    groupInfo.isExpanded = !groupInfo.isExpanded;
                                    groupInfo.count = count
                                }
                                else {
                                    groupInfo = {
                                        offset: -1,
                                        count: count,
                                        path: path,
                                        isExpanded: false
                                    };
                                    updateGroupOffsets(that, dataSource.items(), [], offset, groupInfo);
                                    if (groupInfo.offset >= 0)
                                        that.addGroupInfo(groupInfo)
                                }
                                that.updateTotalItemsCount()
                            }).fail($.proxy(dataSource.loadError.fire, dataSource.loadError))
                    },
                    mergeLoadedData: function(datas, groupDataOptions) {
                        var that = this,
                            data = [],
                            i,
                            pathIndex,
                            query,
                            collapsedPathsByLoads = groupDataOptions.collapsedPathsByLoads,
                            collapsedPaths,
                            groups = normalizeSortingInfo(groupDataOptions.group || []),
                            groupsCount = groups.length,
                            loadsCount = Math.max(datas.length, collapsedPathsByLoads.length);
                        function createCollapsedGroupItem(path) {
                            var result = {},
                                i,
                                item;
                            for (i = 0; i < path.length; i++) {
                                if (!item)
                                    item = result;
                                else {
                                    item.items.push({});
                                    item = item.items[0]
                                }
                                item.key = path[i];
                                item.items = []
                            }
                            return result
                        }
                        function appendData(data, appendingData) {
                            var index = 0;
                            if (appendingData) {
                                if (data.length && appendingData.length && keysEqual(null, data[data.length - 1].key, appendingData[0].key)) {
                                    appendData(data[data.length - 1].items, appendingData[0].items);
                                    index = 1
                                }
                                while (index < appendingData.length) {
                                    data.push(appendingData[index]);
                                    index++
                                }
                            }
                        }
                        for (i = 0; i < loadsCount; i++) {
                            collapsedPaths = collapsedPathsByLoads[i];
                            if (collapsedPaths && collapsedPaths.length)
                                for (pathIndex = 0; pathIndex < collapsedPaths.length; pathIndex++)
                                    appendData(data, [createCollapsedGroupItem(collapsedPaths[pathIndex])]);
                            if (datas[i]) {
                                query = DX.data.query(datas[i]);
                                DX.data.utils.multiLevelGroup(query, groups).enumerate().done(function(groupedData) {
                                    appendData(data, groupedData)
                                })
                            }
                        }
                        processGroupItems(that, data, [], groupDataOptions.offset, groupDataOptions.skipFirstItem, groupDataOptions.take);
                        that.updateItemsCount(data, groupsCount);
                        return data
                    },
                    allowCollapseAll: function() {
                        return false
                    },
                    refresh: function(storeLoadOptions) {
                        var that = this,
                            store = that._dataSource.store();
                        that.callBase(storeLoadOptions);
                        return foreachCollapsedGroups(that, function(groupInfo) {
                                var groupCountQuery = loadTotalCount(store, {filter: createGroupFilter(groupInfo.path, storeLoadOptions)}),
                                    groupOffsetQuery = loadTotalCount(store, {filter: createOffsetFilter(groupInfo.path, storeLoadOptions)});
                                return $.when(groupOffsetQuery, groupCountQuery).done(function(offset, count) {
                                        offset = parseInt(offset.length ? offset[0] : offset);
                                        count = parseInt(count.length ? count[0] : count);
                                        groupInfo.offset = offset;
                                        if (groupInfo.count !== count) {
                                            groupInfo.count = count;
                                            that.updateTotalItemsCount()
                                        }
                                    }).fail($.proxy(that._dataSource.loadError.fire, that._dataSource.loadError))
                            })
                    }
                }
        }());
        $.extend(DX.ui.dataGrid.__internals, {loadTotalCount: loadTotalCount})
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.groupingHelperWithNativeGrouping.js */
    (function($, DX) {
        var utils = DX.utils,
            normalizeSortingInfo = DX.data.utils.normalizeSortingInfo,
            keysEqual = DX.data.utils.keysEqual;
        DX.ui.dataGrid.GroupingHelperWithNativeGrouping = DX.ui.dataGrid.GroupingHelperBase.inherit(function() {
            var foreachExpandedGroups = function(that, callback) {
                    return that.foreachGroups(function(groupInfo, parents) {
                            if (groupInfo.isExpanded)
                                return callback(groupInfo, parents)
                        }, true)
                };
            var processGroupItems = function(that, items, path, groupsCount) {
                    var i,
                        item;
                    if (!groupsCount)
                        return;
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if ('key' in item && item.items !== undefined) {
                            path.push(item.key);
                            var groupInfo = that.findGroupInfo(path);
                            if (!groupInfo || !groupInfo.isExpanded)
                                item.items = null;
                            else
                                processGroupItems(that, item.items, path, groupsCount - 1);
                            path.pop()
                        }
                    }
                };
            var hasExpandedGroup = function(that, group) {
                    var hasExpandedGroup = false,
                        i,
                        groupsCount = normalizeSortingInfo(group || []).length;
                    for (i = 0; i < groupsCount; i++)
                        if (that._isGroupExpanded(i))
                            hasExpandedGroup = true;
                    return hasExpandedGroup
                };
            var updateGroupInfos = function(that, items, groupsCount, offset) {
                    updateGroupInfosCore(that, items, 0, groupsCount, [], offset)
                };
            var updateGroupInfosCore = function(that, items, groupIndex, groupsCount, path, offset) {
                    var item,
                        i,
                        groupInfo;
                    if (groupIndex >= groupsCount)
                        return;
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if (item) {
                            path.push(item.key);
                            groupInfo = that.findGroupInfo(path);
                            if (!groupInfo)
                                that.addGroupInfo({
                                    isExpanded: that._isGroupExpanded(groupIndex),
                                    path: path.slice(0),
                                    offset: offset + i,
                                    count: item.items.length
                                });
                            else {
                                groupInfo.count = item.items.length;
                                groupInfo.offset = offset + i
                            }
                            updateGroupInfosCore(that, item.items, groupIndex + 1, groupsCount, path, 0);
                            path.pop()
                        }
                    }
                };
            var isGroupExpanded = function(groups, groupIndex) {
                    return groups && groups.length && groups[groupIndex] && !!groups[groupIndex].isExpanded
                };
            var getTotalOffset = function(groupInfos, pageSize, offset) {
                    var groupIndex,
                        prevOffset = 0,
                        groupSize,
                        totalOffset = offset;
                    for (groupIndex = 0; groupIndex < groupInfos.length; groupIndex++) {
                        groupSize = groupInfos[groupIndex].offset + 1;
                        if (groupIndex > 0) {
                            groupSize += groupInfos[groupIndex - 1].childrenTotalCount;
                            if (pageSize)
                                groupSize += getContinuationGroupCount(totalOffset, pageSize, groupSize, groupIndex - 1) * groupIndex
                        }
                        totalOffset += groupSize
                    }
                    return totalOffset
                };
            var getContinuationGroupCount = function(groupOffset, pageSize, groupSize, groupIndex) {
                    groupIndex = groupIndex || 0;
                    if (pageSize > 1 && groupSize > 0) {
                        var pageOffset = groupOffset - Math.floor(groupOffset / pageSize) * pageSize || pageSize;
                        pageOffset += groupSize - groupIndex - 2;
                        if (pageOffset < 0)
                            pageOffset += pageSize;
                        return Math.floor(pageOffset / (pageSize - groupIndex - 1))
                    }
                    return 0
                };
            DX.ui.dataGrid.getContinuationGroupCount = getContinuationGroupCount;
            return {
                    updateTotalItemsCount: function() {
                        var totalItemsCount = 0,
                            pageSize = this._dataSource.pageSize(),
                            isVirtualPaging = this._isVirtualPaging();
                        foreachExpandedGroups(this, function(groupInfo, parents) {
                            groupInfo.childrenTotalCount = 0
                        });
                        foreachExpandedGroups(this, function(groupInfo, parents) {
                            var totalOffset = getTotalOffset(parents, isVirtualPaging ? 0 : pageSize, totalItemsCount),
                                count = groupInfo.count + groupInfo.childrenTotalCount,
                                i;
                            if (!isVirtualPaging)
                                count += getContinuationGroupCount(totalOffset, pageSize, count, parents.length - 1);
                            if (parents[parents.length - 2])
                                parents[parents.length - 2].childrenTotalCount += count;
                            else
                                totalItemsCount += count
                        });
                        this.callBase(totalItemsCount)
                    },
                    _isGroupExpanded: function(groupIndex) {
                        var groups = this._dataSource.group();
                        return isGroupExpanded(groups, groupIndex)
                    },
                    processLoadOptions: function(storeLoadOptions, isExpandedGroupsLoaded) {
                        var that = this,
                            dataSource = this._dataSource,
                            isVirtualPaging = that._isVirtualPaging(),
                            pageSize = dataSource.pageSize(),
                            groups = normalizeSortingInfo(storeLoadOptions.group || []),
                            skips = [],
                            takes = [],
                            skipChildrenTotalCount = 0,
                            childrenTotalCount = 0,
                            loadOptions = $.extend({}, storeLoadOptions);
                        that.callBase(storeLoadOptions);
                        if (hasExpandedGroup(that, groups) && !isExpandedGroupsLoaded) {
                            delete loadOptions.skip;
                            delete loadOptions.take
                        }
                        else if (loadOptions.take) {
                            foreachExpandedGroups(this, function(groupInfo) {
                                groupInfo.childrenTotalCount = 0;
                                groupInfo.skipChildrenTotalCount = 0
                            });
                            foreachExpandedGroups(that, function(groupInfo, parents) {
                                var skip,
                                    take,
                                    takeCorrection = 0,
                                    parentTakeCorrection = 0,
                                    totalOffset = getTotalOffset(parents, isVirtualPaging ? 0 : pageSize, childrenTotalCount),
                                    continuationGroupCount = 0,
                                    skipContinuationGroupCount = 0,
                                    groupInfoCount = groupInfo.count + groupInfo.childrenTotalCount,
                                    childrenGroupInfoCount = groupInfoCount;
                                if (totalOffset <= loadOptions.skip + loadOptions.take && groupInfoCount) {
                                    skip = loadOptions.skip - totalOffset;
                                    take = loadOptions.take;
                                    if (!isVirtualPaging) {
                                        continuationGroupCount = getContinuationGroupCount(totalOffset, pageSize, groupInfoCount, parents.length - 1);
                                        groupInfoCount += continuationGroupCount * parents.length;
                                        childrenGroupInfoCount += continuationGroupCount;
                                        if (pageSize && skip >= 0) {
                                            takeCorrection = parents.length;
                                            parentTakeCorrection = parents.length - 1;
                                            skipContinuationGroupCount = Math.floor(skip / pageSize)
                                        }
                                    }
                                    if (skip >= 0) {
                                        if (totalOffset + groupInfoCount > loadOptions.skip)
                                            skips.unshift(skip - skipContinuationGroupCount * takeCorrection - groupInfo.skipChildrenTotalCount);
                                        if (totalOffset + groupInfoCount >= loadOptions.skip + take)
                                            takes.unshift(take - takeCorrection - groupInfo.childrenTotalCount + groupInfo.skipChildrenTotalCount)
                                    }
                                    else if (totalOffset + groupInfoCount >= loadOptions.skip + take)
                                        takes.unshift(take + skip - groupInfo.childrenTotalCount)
                                }
                                if (totalOffset <= loadOptions.skip)
                                    if (parents[parents.length - 2])
                                        parents[parents.length - 2].skipChildrenTotalCount += Math.min(childrenGroupInfoCount, skip + 1 - skipContinuationGroupCount * parentTakeCorrection);
                                    else
                                        skipChildrenTotalCount += Math.min(childrenGroupInfoCount, skip + 1);
                                if (totalOffset <= loadOptions.skip + take) {
                                    groupInfoCount = Math.min(childrenGroupInfoCount, skip + take - (skipContinuationGroupCount + 1) * parentTakeCorrection);
                                    if (parents[parents.length - 2])
                                        parents[parents.length - 2].childrenTotalCount += groupInfoCount;
                                    else
                                        childrenTotalCount += groupInfoCount
                                }
                            });
                            loadOptions.skip -= skipChildrenTotalCount;
                            loadOptions.take -= childrenTotalCount - skipChildrenTotalCount
                        }
                        return {
                                loads: [loadOptions],
                                data: {
                                    skip: loadOptions.skip,
                                    take: loadOptions.take,
                                    skips: skips,
                                    takes: takes,
                                    storeLoadOptions: storeLoadOptions
                                }
                            }
                    },
                    changeGroupExpand: function(path) {
                        var that = this,
                            groupInfo = that.findGroupInfo(path);
                        if (groupInfo) {
                            groupInfo.isExpanded = !groupInfo.isExpanded;
                            that.updateTotalItemsCount();
                            return $.Deferred().resolve()
                        }
                        return $.Deferred().reject()
                    },
                    mergeLoadedData: function(datas, groupDataOptions) {
                        var that = this,
                            data = datas[0],
                            group = normalizeSortingInfo(groupDataOptions.storeLoadOptions.group || []),
                            groupsCount = group.length,
                            skips,
                            takes,
                            i,
                            item,
                            items;
                        updateGroupInfos(that, data, groupsCount, groupDataOptions.skip || 0);
                        that.updateTotalItemsCount();
                        if (hasExpandedGroup(that, group)) {
                            groupDataOptions = that.processLoadOptions(groupDataOptions.storeLoadOptions, true).data;
                            if (groupDataOptions.skip)
                                data = data.slice(groupDataOptions.skip);
                            if (groupDataOptions.take)
                                data = data.slice(0, groupDataOptions.take)
                        }
                        skips = groupDataOptions.skips;
                        takes = groupDataOptions.takes;
                        items = data;
                        for (i = 0; items && i < groupsCount; i++) {
                            item = items[0];
                            items = item && item.items;
                            if (items && skips[i] !== undefined) {
                                item.isContinuation = true;
                                items = items.slice(skips[i]);
                                item.items = items
                            }
                        }
                        items = data;
                        for (i = 0; items && i < groupsCount; i++) {
                            item = items[items.length - 1];
                            items = item && item.items;
                            if (items && takes[i] !== undefined && items.length > takes[i]) {
                                item.isContinuationOnNextPage = true;
                                items = items.slice(0, takes[i]);
                                item.items = items
                            }
                        }
                        processGroupItems(that, data, [], groupsCount);
                        that.updateItemsCount(data, groupsCount);
                        return data
                    },
                    refresh: function(storeLoadOptions) {
                        var that = this,
                            oldGroups = normalizeSortingInfo(that._group || []),
                            groups = normalizeSortingInfo(storeLoadOptions.group || []),
                            groupIndex;
                        for (groupIndex = 0; groupIndex < oldGroups.length; groupIndex++)
                            if (isGroupExpanded(that._group, groupIndex) !== isGroupExpanded(storeLoadOptions.group, groupIndex)) {
                                that.reset();
                                return
                            }
                        that.callBase(storeLoadOptions);
                        that.foreachGroups(function(groupInfo) {
                            groupInfo.count = 0
                        });
                        if (groups.length)
                            return that._dataSource.store().load(storeLoadOptions).done(function(data) {
                                    updateGroupInfos(that, data, groups.length, 0)
                                }).fail($.proxy(that._dataSource.loadError.fire, that._dataSource.loadError))
                    }
                }
        }())
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.scrollingDataSourceWrapper.js */
    (function($, DX) {
        var dataGrid = DX.ui.dataGrid,
            utils = DX.utils;
        dataGrid.ScrollingDataSourceWrapper = DX.Class.inherit(function() {
            var getPreloadPageCount = function(that) {
                    var scrolling = that._options.scrolling;
                    return scrolling && scrolling.preloadEnabled ? 2 : 1
                };
            var isVirtualMode = function(that) {
                    return that._options.scrolling && that._options.scrolling.mode === 'virtual'
                };
            var isAppendMode = function(that) {
                    return that._options.scrolling && that._options.scrolling.mode === 'infinite'
                };
            var getBasePageIndex = function(that) {
                    return that._cache[0] ? that._cache[0].pageIndex : -1
                };
            var updateLoading = function(that) {
                    var basePageIndex = getBasePageIndex(that),
                        pagesCount = that._cache.length;
                    if (isVirtualMode(that))
                        if (basePageIndex < 0 || that._viewportItemIndex >= 0 && (basePageIndex * that.pageSize() > that._viewportItemIndex || basePageIndex * that.pageSize() + that.itemsCount() < that._viewportItemIndex + that._viewportSize) && that._dataSource.isLoading()) {
                            if (!that._isLoading) {
                                that._isLoading = true;
                                that.loadingChanged.fire(true)
                            }
                        }
                        else if (that._isLoading) {
                            that._isLoading = false;
                            that.loadingChanged.fire(false)
                        }
                };
            return {
                    ctor: function(options) {
                        var that = this,
                            dataSource = new dataGrid.DataSource(options, that);
                        that._dataSource = dataSource;
                        that.loadError = dataSource.loadError;
                        that.changed = $.Callbacks();
                        that.loadingChanged = $.Callbacks();
                        that._isLoading = true;
                        that._pageIndex = dataSource.pageIndex();
                        that._lastPageIndex = that._pageIndex;
                        that._viewportSize = 0;
                        that._viewportItemIndex = -1;
                        that._userPageSize = options.pageSize;
                        that._items = [];
                        that._isLoaded = true;
                        dataSource.loadingChanged.add(function(isLoading) {
                            if (!isVirtualMode(that)) {
                                that._isLoading = isLoading;
                                that.loadingChanged.fire(isLoading)
                            }
                        });
                        var processChanged = function(that, changeType, isDelayChanged) {
                                var dataSource = that._dataSource,
                                    items = dataSource.items();
                                if (changeType === 'append')
                                    that._items.push.apply(that._items, items);
                                else if (changeType === 'prepend')
                                    that._items.unshift.apply(that._items, items);
                                else
                                    that._items = items;
                                updateLoading(that);
                                that._lastPageIndex = that.pageIndex();
                                that._isDelayChanged = isDelayChanged;
                                if (!isDelayChanged)
                                    that.changed.fire(changeType && {
                                        changeType: changeType,
                                        items: items
                                    })
                            };
                        var processDelayChanged = function(that) {
                                if (that._isDelayChanged) {
                                    that._isDelayChanged = false;
                                    that.changed.fire()
                                }
                            };
                        dataSource.changed.add(function() {
                            var basePageIndex,
                                lastCacheLength = that._cache.length,
                                changeType,
                                cacheItem;
                            if (isVirtualMode(that)) {
                                basePageIndex = getBasePageIndex(that);
                                if (basePageIndex >= 0)
                                    if (basePageIndex + that._cache.length === dataSource.pageIndex());
                                    else if (basePageIndex - 1 === dataSource.pageIndex());
                                    else
                                        that._cache = [];
                                cacheItem = {
                                    pageIndex: dataSource.pageIndex(),
                                    itemsCount: dataSource.itemsCount()
                                };
                                processDelayChanged(that);
                                if (basePageIndex === dataSource.pageIndex() + 1) {
                                    changeType = 'prepend';
                                    that._cache.unshift(cacheItem)
                                }
                                else {
                                    changeType = 'append';
                                    that._cache.push(cacheItem)
                                }
                                processChanged(that, that._cache.length > 1 ? changeType : undefined, lastCacheLength === 0);
                                that.load().done(function() {
                                    processDelayChanged(that)
                                })
                            }
                            else
                                processChanged(that, isAppendMode(that) && dataSource.pageIndex() !== 0 ? 'append' : undefined)
                        });
                        $.each(dataSource, function(memberName, member) {
                            if (!that[memberName] && $.isFunction(member))
                                that[memberName] = function() {
                                    return this._dataSource[memberName].apply(this._dataSource, arguments)
                                }
                        });
                        that._cache = [];
                        that._options = options
                    },
                    items: function() {
                        return this._items
                    },
                    itemsCount: function() {
                        var itemsCount = 0;
                        if (isVirtualMode(this))
                            $.each(this._cache, function() {
                                itemsCount += this.itemsCount
                            });
                        else
                            itemsCount = this._dataSource.itemsCount();
                        return itemsCount
                    },
                    virtualItemsCount: function() {
                        var that = this,
                            pageIndex,
                            itemsCount = 0,
                            i,
                            beginItemsCount,
                            endItemsCount;
                        if (isVirtualMode(that)) {
                            pageIndex = getBasePageIndex(that);
                            if (pageIndex < 0)
                                pageIndex = 0;
                            beginItemsCount = pageIndex * that.pageSize();
                            itemsCount = that._cache.length * that.pageSize();
                            endItemsCount = Math.max(0, that.totalItemsCount() - itemsCount - beginItemsCount);
                            return {
                                    begin: beginItemsCount,
                                    end: endItemsCount
                                }
                        }
                    },
                    setViewportItemIndex: function(itemIndex) {
                        var that = this,
                            pageSize = that.pageSize(),
                            dataSource = that._dataSource,
                            pagesCount = that.pagesCount(),
                            virtualMode = isVirtualMode(that),
                            appendMode = isAppendMode(that),
                            totalItemsCount = that.totalItemsCount(),
                            lastPageSize,
                            needLoad = that._viewportItemIndex < 0,
                            maxPageIndex,
                            newPageIndex;
                        that._viewportItemIndex = itemIndex;
                        if (pageSize && (virtualMode || appendMode)) {
                            if (that._viewportSize && itemIndex + that._viewportSize >= totalItemsCount) {
                                if (that.hasKnownLastPage()) {
                                    newPageIndex = pagesCount - 1;
                                    lastPageSize = totalItemsCount % pageSize;
                                    if (newPageIndex > 0 && lastPageSize > 0 && lastPageSize < pageSize / 2)
                                        newPageIndex--
                                }
                                else if (that.pageIndex() < pagesCount)
                                    newPageIndex = pagesCount
                            }
                            else {
                                newPageIndex = Math.floor(itemIndex / pageSize);
                                maxPageIndex = pagesCount - 1;
                                newPageIndex = Math.max(newPageIndex, 0);
                                newPageIndex = Math.min(newPageIndex, maxPageIndex)
                            }
                            if (that.pageIndex() !== newPageIndex || needLoad) {
                                that.pageIndex(newPageIndex);
                                that.load()
                            }
                        }
                    },
                    setViewportSize: function(size) {
                        var that = this,
                            pageSize;
                        if (that._viewportSize !== size) {
                            that._viewportSize = size;
                            if ((isVirtualMode(that) || isAppendMode(that)) && !that._userPageSize) {
                                pageSize = Math.ceil(size / 5) * 10;
                                if (pageSize !== that.pageSize()) {
                                    that.pageSize(pageSize);
                                    that.reload()
                                }
                            }
                        }
                    },
                    pageIndex: function(pageIndex) {
                        if (isVirtualMode(this) || isAppendMode(this)) {
                            if (pageIndex !== undefined)
                                this._pageIndex = pageIndex;
                            return this._pageIndex
                        }
                        else
                            return this._dataSource.pageIndex(pageIndex)
                    },
                    basePageIndex: function() {
                        var basePageIndex = getBasePageIndex(this);
                        return basePageIndex > 0 ? basePageIndex : 0
                    },
                    load: function() {
                        var basePageIndex = getBasePageIndex(this),
                            pageIndexForLoad = -1,
                            dataSource = this._dataSource,
                            result;
                        var loadCore = function(that, pageIndex) {
                                var dataSource = that._dataSource;
                                if (pageIndex === that.pageIndex() || !dataSource.isLoading() && pageIndex < dataSource.pagesCount() || !dataSource.hasKnownLastPage() && pageIndex === dataSource.pagesCount()) {
                                    dataSource.pageIndex(pageIndex);
                                    return dataSource.load()
                                }
                            };
                        if (isVirtualMode(this)) {
                            if (basePageIndex < 0 || !this._cache[this._pageIndex - basePageIndex])
                                pageIndexForLoad = this._pageIndex;
                            if (basePageIndex >= 0 && pageIndexForLoad < 0 && this._viewportItemIndex >= 0 && basePageIndex + this._cache.length <= this._pageIndex + getPreloadPageCount(this))
                                pageIndexForLoad = basePageIndex + this._cache.length;
                            if (pageIndexForLoad >= 0)
                                result = loadCore(this, pageIndexForLoad);
                            updateLoading(this)
                        }
                        else if (isAppendMode(this)) {
                            if (!dataSource.isLoaded() || this.pageIndex() === dataSource.pagesCount()) {
                                dataSource.pageIndex(this.pageIndex());
                                result = dataSource.load()
                            }
                        }
                        else
                            result = dataSource.load();
                        if (!result && this._lastPageIndex !== this.pageIndex())
                            this.changed.fire({changeType: 'pageIndex'});
                        return result || $.Deferred().resolve()
                    },
                    isLoading: function() {
                        return this._isLoading
                    },
                    isLoaded: function() {
                        return this._dataSource.isLoaded() && this._isLoaded
                    },
                    changeGroupExpand: function(path) {
                        this._cache = [];
                        updateLoading(this);
                        this._dataSource.changeGroupExpand(path)
                    },
                    reload: function() {
                        var that = this,
                            dataSource = that._dataSource;
                        that._cache = [];
                        that._isLoaded = false;
                        updateLoading(that);
                        that._isLoaded = true;
                        if (isAppendMode(that)) {
                            that.pageIndex(0);
                            dataSource.pageIndex(0)
                        }
                        else
                            dataSource.pageIndex(that.pageIndex());
                        return dataSource.reload()
                    }
                }
        }())
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.dataSource.js */
    (function($, DX) {
        var dataGrid = DX.ui.dataGrid;
        dataGrid.DataSource = DX.data.DataSource.inherit(function() {
            var hasGrouping = function(that) {
                    return !!that._storeLoadOptions.group
                };
            return {
                    ctor: function(options, dataSourceWrapper) {
                        var that = this;
                        that.callBase(options);
                        that._pageIndex = options.pageIndex || 0;
                        that._asyncLoadEnabled = !!options.asyncLoadEnabled;
                        that._loadingTimeout = options.loadingTimeout;
                        if (options.useNativeGrouping === 'auto')
                            options.useNativeGrouping = that.store() instanceof DX.data.ArrayStore;
                        that._groupingHelper = options.useNativeGrouping ? new dataGrid.GroupingHelperWithNativeGrouping(dataSourceWrapper || that) : new dataGrid.GroupingHelper(dataSourceWrapper || that);
                        that._hasLastPage = false;
                        that._currentTotalCount = 0;
                        that._options = options;
                        that.map(that._mapFunc)
                    },
                    map: function(mapFunc) {
                        var that = this,
                            i,
                            store = that.store();
                        if (mapFunc)
                            if (store instanceof DX.data.ArrayStore) {
                                for (i = 0; i < store._array.length; i++)
                                    store._array[i] = mapFunc(store._array[i]);
                                delete that._mapFunc
                            }
                            else
                                that._mapFunc = mapFunc;
                        else
                            return that._mapFunc
                    },
                    pageSize: function(value) {
                        if (value === undefined)
                            return this._paginate ? this._pageSize : 0;
                        this._pageSize = value || 20
                    },
                    totalCount: function() {
                        return parseInt(this._currentTotalCount || this._totalCount)
                    },
                    totalItemsCount: function() {
                        var that = this;
                        return hasGrouping(that) && that._storeLoadOptions.requireTotalCount ? that._groupingHelper.totalItemsCount() : that.totalCount()
                    },
                    itemsCount: function() {
                        var that = this;
                        return hasGrouping(that) ? that._groupingHelper.itemsCount() : that.items().length
                    },
                    collapseAll: function(groupIndex) {
                        return this._groupingHelper.collapseAll(groupIndex)
                    },
                    expandAll: function(groupIndex) {
                        return this._groupingHelper.expandAll(groupIndex)
                    },
                    pagesCount: function() {
                        var that = this,
                            count = that.totalItemsCount(),
                            pageSize = that.pageSize();
                        if (pageSize && count > 0)
                            return Math.max(1, Math.ceil(count / pageSize));
                        return 1
                    },
                    _reloadCore: function() {
                        var that = this,
                            prop,
                            userData = that._userData;
                        for (prop in userData)
                            if (userData.hasOwnProperty(prop))
                                delete userData[prop];
                        that._isLastPage = !that._paginate;
                        that._currentTotalCount = 0;
                        that._totalCount = -1;
                        that._hasLastPage = that._isLastPage;
                        that._isLoaded = false;
                        return that.load()
                    },
                    reload: function() {
                        var that = this,
                            d = $.Deferred();
                        if (that.isLoading()) {
                            var loadingChangedHandler = function() {
                                    that.loadingChanged.remove(loadingChangedHandler);
                                    setTimeout(function() {
                                        that.reload().done(d.resolve).fail(d.reject)
                                    })
                                };
                            that.loadingChanged.add(loadingChangedHandler)
                        }
                        else
                            $.when(that._groupingHelper.refresh(that._createStoreLoadOptions())).always(function() {
                                that._reloadCore().done(d.resolve).fail(d.reject)
                            });
                        return d
                    },
                    hasKnownLastPage: function() {
                        return this._hasLastPage || this._totalCount >= 0
                    },
                    changeGroupExpand: function(path) {
                        var that = this,
                            groupingHelper = that._groupingHelper;
                        if (hasGrouping(that)) {
                            that._changeLoadingCount(1);
                            groupingHelper.changeGroupExpand(path).always(function() {
                                that._changeLoadingCount(-1)
                            }).done(function() {
                                that.load()
                            })
                        }
                        else
                            that.load()
                    },
                    _createLoadQueue: function() {
                        return DX.createQueue(true)
                    },
                    _scheduleChangedCallbacks: function(deferred) {
                        var that = this,
                            pageIndex = that.pageIndex();
                        that._lastLoadDeferred = deferred;
                        deferred.done(function() {
                            var currentTotalCount,
                                itemsCount = that.itemsCount();
                            that._isLastPage = !itemsCount || !that._paginate || that._pageSize && itemsCount < that._pageSize;
                            if (that.isLastPage())
                                that._hasLastPage = true;
                            if (that._totalCount >= 0) {
                                if (that._pageIndex >= that.pagesCount()) {
                                    that.pageIndex(that.pagesCount() - 1);
                                    that.load()
                                }
                            }
                            else {
                                currentTotalCount = that.pageIndex() * that.pageSize() + itemsCount;
                                that._currentTotalCount = Math.max(that._currentTotalCount, currentTotalCount);
                                if (itemsCount === 0 && that.pageIndex() >= that.pagesCount()) {
                                    that.pageIndex(that.pagesCount() - 1);
                                    that.load()
                                }
                            }
                            if (pageIndex === that.pageIndex() && !that.isLoading())
                                that.changed.fire()
                        })
                    },
                    _loadFromStore: function(storeLoadOptions, pendingDeferred) {
                        var that = this;
                        var loadTaskCore = function() {
                                var i,
                                    groupOptions,
                                    groupLoadOptions,
                                    groupingHelper = that._groupingHelper,
                                    loads = [],
                                    datas = [];
                                if (that._disposed)
                                    return;
                                if (hasGrouping(that)) {
                                    groupOptions = groupingHelper.processLoadOptions(storeLoadOptions);
                                    groupLoadOptions = groupOptions.loads;
                                    for (i = 0; i < groupLoadOptions.length; i++) {
                                        loads.push(that.store().load(groupLoadOptions[i]));
                                        (function(index) {
                                            loads[index].done(function(data) {
                                                datas[index] = data
                                            })
                                        })(i)
                                    }
                                }
                                else
                                    loads.push(that.store().load(storeLoadOptions));
                                $.when.apply($, loads).done(function(data, extra) {
                                    if (that._disposed)
                                        return;
                                    if (hasGrouping(that)) {
                                        if (datas.length > 1)
                                            extra = undefined;
                                        data = groupingHelper.mergeLoadedData(datas, groupOptions.data)
                                    }
                                    extra = extra || {totalCount: that._totalCount >= 0 ? that._totalCount : undefined};
                                    that._processStoreLoadResult(data, extra, storeLoadOptions, pendingDeferred)
                                }).fail($.proxy(pendingDeferred.reject, pendingDeferred))
                            };
                        if (that._asyncLoadEnabled)
                            window.setTimeout(loadTaskCore, that._loadingTimeout);
                        else
                            loadTaskCore()
                    }
                }
        }())
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.stateStoring.js */
    (function($, DX) {
        var ui = DX.ui,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        dataGrid.StateStoringController = dataGrid.ViewController.inherit(function() {
            var getStorage = function(options) {
                    var storage = options.type === 'sessionStorage' ? sessionStorage : localStorage;
                    if (!storage)
                        throw new Error("State storing can not be provided due to the restrictions of your browser.");
                    return storage
                };
            var getUniqueStorageKey = function(options) {
                    return 'dx_datagrid_' + (utils.isDefined(options.storageKey) ? options.storageKey : 'storage')
                };
            var dateReviver = function(key, value) {
                    var date;
                    if (typeof value === 'string') {
                        date = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                        if (date)
                            return new Date(Date.UTC(+date[1], +date[2] - 1, +date[3], +date[4], +date[5], +date[6]))
                    }
                    return value
                };
            var processLoadState = function(that, state) {
                    var allowedPageSizes = state.allowedPageSizes,
                        searchText = state.searchText,
                        selectedRowKeys = state.selectedRowKeys,
                        columnsController = that.getController('columns'),
                        selectionController = that.getController('selection'),
                        dataController = that.getController('data'),
                        pagerView = that.getView('pagerView');
                    if (columnsController) {
                        columnsController.setUserState(state.columns);
                        columnsController.columnsChanged.add(function() {
                            that.state({columns: columnsController.getUserState()});
                            that.save()
                        })
                    }
                    if (selectedRowKeys)
                        that.option('selectedRowKeys', selectedRowKeys);
                    if (selectionController)
                        selectionController.selectionChanged.add(function(keys) {
                            that.state({selectedRowKeys: keys});
                            that.save()
                        });
                    if (dataController) {
                        if (allowedPageSizes && that.option('pager.allowedPageSizes') === 'auto' && allowedPageSizes)
                            that.option('pager').allowedPageSizes = allowedPageSizes;
                        if (searchText)
                            dataController.searchByText(searchText);
                        dataController.changed.add(function() {
                            that.state({
                                searchText: dataController.getSearchText(),
                                pageIndex: dataController.pageIndex(),
                                pageSize: dataController.pageSize(),
                                allowedPageSizes: pagerView.getPageSizes()
                            });
                            that.save()
                        })
                    }
                };
            return {
                    _loadState: function() {
                        var options = this.option('stateStoring');
                        if (options.type === 'custom')
                            return options.customLoad && options.customLoad();
                        try {
                            return JSON.parse(getStorage(options).getItem(getUniqueStorageKey(options)), dateReviver)
                        }
                        catch(e) {
                            DX.utils.logger.error(e.message)
                        }
                    },
                    _saveState: function(state) {
                        var options = this.option('stateStoring');
                        if (options.type === 'custom') {
                            options.customSave && options.customSave(state);
                            return
                        }
                        try {
                            getStorage(options).setItem(getUniqueStorageKey(options), JSON.stringify(state))
                        }
                        catch(e) {}
                    },
                    publicMethods: function() {
                        return ['state']
                    },
                    isEnabled: function() {
                        var stateStoringOptions = this.option('stateStoring');
                        return stateStoringOptions && stateStoringOptions.enabled
                    },
                    init: function() {
                        var that = this;
                        that._state = {};
                        that._isLoaded = false;
                        that._isLoading = false
                    },
                    isLoaded: function() {
                        return this._isLoaded
                    },
                    isLoading: function() {
                        return this._isLoading
                    },
                    load: function() {
                        var that = this,
                            loadResult;
                        that._isLoading = true;
                        loadResult = that._loadState();
                        if (!loadResult || !$.isFunction(loadResult.done))
                            loadResult = $.Deferred().resolve(loadResult);
                        loadResult.done(function(state) {
                            that._isLoaded = true;
                            that._isLoading = false;
                            that._state = state || {};
                            processLoadState(that, that._state)
                        });
                        return loadResult
                    },
                    state: function(state) {
                        var that = this;
                        if (state === undefined)
                            return that._state;
                        else
                            $.extend(that._state, state)
                    },
                    save: function() {
                        var that = this;
                        clearTimeout(that._savingTimeoutID);
                        that._savingTimeoutID = setTimeout(function() {
                            that._saveState(that.state())
                        }, that.option('stateStoring.savingTimeout'))
                    },
                    dispose: function() {
                        clearTimeout(this._savingTimeoutID)
                    }
                }
        }());
        dataGrid.registerModule('stateStoring', {
            defaultOptions: function() {
                return {stateStoring: {
                            enabled: false,
                            storageKey: null,
                            type: 'localStorage',
                            customLoad: null,
                            customSave: null,
                            savingTimeout: 2000
                        }}
            },
            controllers: {stateStoring: ui.dataGrid.StateStoringController},
            extenders: {controllers: {
                    columns: {getVisibleColumns: function() {
                            var visibleColumns = this.callBase();
                            return this.getController('stateStoring').isLoading() ? [] : visibleColumns
                        }},
                    data: {
                        _refreshDataSource: function() {
                            var that = this,
                                callBase = that.callBase,
                                stateStoringController = that.getController('stateStoring');
                            if (stateStoringController.isEnabled() && !stateStoringController.isLoaded())
                                stateStoringController.load().done(function() {
                                    callBase.call(that)
                                });
                            else
                                callBase.call(that)
                        },
                        isLoading: function() {
                            var that = this,
                                stateStoringController = that.getController('stateStoring');
                            return this.callBase() || stateStoringController.isLoading()
                        },
                        _dataSourceOptions: function() {
                            var that = this,
                                result = that.callBase(),
                                stateStoringController = that.getController('stateStoring'),
                                userState;
                            if (stateStoringController.isEnabled()) {
                                userState = stateStoringController.state();
                                if (userState.pageIndex !== undefined)
                                    result.pageIndex = userState.pageIndex;
                                if (userState.pageSize !== undefined)
                                    result.pageSize = userState.pageSize
                            }
                            return result
                        }
                    }
                }}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.columnsController.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            dataGrid = ui.dataGrid,
            utils = DX.utils,
            dataUtils = DX.data.utils,
            normalizeSortingInfo = dataUtils.normalizeSortingInfo,
            isDefined = utils.isDefined;
        var USER_STATE_FIELD_NAMES = ['initialIndex', 'dataField', 'width', 'visible', 'sortOrder', 'sortIndex', 'groupIndex', 'filterValue', 'selectedFilterOperation'];
        var GUID_REGEX = /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/;
        dataGrid.checkChanges = function(changes, changeNames) {
            var changesWithChangeNamesCount = 0,
                i;
            for (i = 0; i < changeNames.length; i++)
                if (changes[changeNames[i]])
                    changesWithChangeNamesCount++;
            return changes.length && changes.length === changesWithChangeNamesCount
        };
        var ColumnsController = dataGrid.Controller.inherit(function() {
                var DEFAULT_COLUMN_OPTIONS = {visible: true};
                var DATATYPE_OPERATIONS = {
                        number: ['=', '<>', '<', '>', '<=', '>='],
                        date: ['=', '<>', '<', '>', '<=', '>='],
                        string: ['contains', 'notcontains', 'startswith', 'endswith', '=', '<>']
                    };
                var FIXED_COLUMN_OPTIONS = {
                        allowResizing: false,
                        allowGrouping: false,
                        allowReordering: false,
                        allowSorting: false,
                        allowHiding: false
                    };
                var GROUP_COLUMN_WIDTH = 30;
                var GROUP_LOCATION = 'group',
                    COLUMN_CHOOSER_LOCATION = 'columnChooser';
                var convertNameToCaption = function(name) {
                        var captionList = [],
                            i,
                            char,
                            isPrevCharNewWord = false,
                            isNewWord = false;
                        for (i = 0; i < name.length; i++) {
                            char = name.charAt(i);
                            isNewWord = char === char.toUpperCase() || char in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                            if (char === '_' || char === '.') {
                                char = ' ';
                                isNewWord = true
                            }
                            else if (i === 0) {
                                char = char.toUpperCase();
                                isNewWord = true
                            }
                            else if (!isPrevCharNewWord && isNewWord)
                                if (captionList.length > 0)
                                    captionList.push(' ');
                            captionList.push(char);
                            isPrevCharNewWord = isNewWord
                        }
                        return captionList.join('')
                    };
                var createColumn = function(that, columnOptions) {
                        var result,
                            commonColumnOptions,
                            calculatedColumnOptions;
                        if (columnOptions) {
                            if (utils.isString(columnOptions))
                                columnOptions = {dataField: columnOptions};
                            commonColumnOptions = that.getCommonSettings();
                            calculatedColumnOptions = that._createCalculatedColumnOptions(columnOptions);
                            return $.extend(true, {}, DEFAULT_COLUMN_OPTIONS, commonColumnOptions, calculatedColumnOptions, columnOptions)
                        }
                    };
                var createColumnsFromOptions = function(that, columnsOptions) {
                        var result = [];
                        if (columnsOptions)
                            $.each(columnsOptions, function(index, value) {
                                var column = createColumn(that, value);
                                if (column) {
                                    if (column.initialIndex === undefined)
                                        column.initialIndex = index;
                                    result.push(column)
                                }
                            });
                        return result
                    };
                var getValueDataType = function(value) {
                        var dataType = $.type(value);
                        if (dataType === 'string') {
                            if (utils.isNumber(value))
                                dataType = 'number';
                            else if (GUID_REGEX.test(value))
                                dataType = 'guid'
                        }
                        else if (dataType !== 'boolean' && dataType !== 'number' && dataType !== 'date')
                            dataType = undefined;
                        return dataType
                    };
                var getAlignmentByDataType = function(dataType, isRTL) {
                        switch (dataType) {
                            case'number':
                                return 'right';
                            case'boolean':
                                return 'center';
                            case'date':
                                return 'left';
                            default:
                                return isRTL ? 'right' : 'left'
                        }
                    };
                var getFormatByDataType = function(dataType) {
                        switch (dataType) {
                            case"date":
                                return "shortDate"
                        }
                    };
                var getCustomizeTextByDataType = function(dataType) {
                        if (dataType === 'boolean')
                            return function(e) {
                                    if (e.value === true)
                                        return this.trueText || 'true';
                                    else if (e.value === false)
                                        return this.falseText || 'false';
                                    else
                                        return e.valueText || ''
                                }
                    };
                var createColumnsFromDataSource = function(that, dataSource) {
                        var firstItems = getFirstItems(dataSource),
                            fieldName,
                            processedFields = {},
                            i,
                            initialIndex = 0,
                            result = [];
                        for (i = 0; i < firstItems.length; i++)
                            firstItems[i] && $.each(firstItems[i], function(fieldName) {
                                processedFields[fieldName] = true
                            });
                        $.each(processedFields, function(fieldName) {
                            if (fieldName.indexOf('__') !== 0) {
                                var column = createColumn(that, fieldName);
                                column.initialIndex = initialIndex++;
                                result.push(column)
                            }
                        });
                        return result
                    };
                var equalSortParameters = function(sortParameters1, sortParameters2) {
                        var i;
                        if ($.isArray(sortParameters1) && $.isArray(sortParameters2)) {
                            if (sortParameters1.length !== sortParameters2.length)
                                return false;
                            else
                                for (i = 0; i < sortParameters1.length; i++)
                                    if (sortParameters1[i].selector !== sortParameters2[i].selector || sortParameters1[i].desc !== sortParameters2[i].desc || !sortParameters1[i].isExpanded !== !sortParameters2[i].isExpanded)
                                        return false;
                            return true
                        }
                        else
                            return (!sortParameters1 || !sortParameters1.length) === (!sortParameters2 || !sortParameters2.length)
                    };
                var getFirstItems = function(dataSource) {
                        var groupsCount,
                            item,
                            items = [];
                        var getFirstItemsCore = function(items, groupsCount) {
                                var i,
                                    childItems;
                                if (!items || !groupsCount)
                                    return items;
                                for (i = 0; i < items.length; i++) {
                                    childItems = getFirstItemsCore(items[i].items, groupsCount - 1);
                                    if (childItems && childItems.length)
                                        return childItems
                                }
                            };
                        if (dataSource && dataSource.items().length > 0) {
                            groupsCount = normalizeSortingInfo(dataSource.group() || []).length;
                            items = getFirstItemsCore(dataSource.items(), groupsCount) || []
                        }
                        return items
                    };
                var updateColumnIndexes = function(that) {
                        $.each(that._columns, function(index, column) {
                            column.index = index
                        })
                    };
                var updateColumnParameterIndexes = function(that, indexParameterName, currentColumn) {
                        var indexedSortColumns = [],
                            parameterIndex = 0;
                        $.each(that._columns, function(index, column) {
                            var index = column[indexParameterName];
                            if (isDefined(index)) {
                                if (!indexedSortColumns[index])
                                    indexedSortColumns[index] = [];
                                if (column === currentColumn)
                                    indexedSortColumns[index].unshift(column);
                                else
                                    indexedSortColumns[index].push(column);
                                delete column[indexParameterName]
                            }
                        });
                        $.each(indexedSortColumns, function(index, sortColumns) {
                            if (sortColumns)
                                $.each(sortColumns, function() {
                                    this[indexParameterName] = parameterIndex++
                                })
                        });
                        return parameterIndex
                    };
                var updateColumnGroupIndexes = function(that, currentColumn) {
                        var indexPropertyName = 'groupIndex',
                            groupIndex = updateColumnParameterIndexes(that, indexPropertyName, currentColumn);
                        $.each(that._columns, function(index, column) {
                            if (!isDefined(column[indexPropertyName]) && column.grouped)
                                column[indexPropertyName] = groupIndex++;
                            delete column.grouped
                        })
                    };
                var updateColumnSortIndexes = function(that, currentColumn) {
                        $.each(that._columns, function(index, column) {
                            if (isDefined(column.sortIndex) && !isSortOrderValid(column.sortOrder))
                                delete column.sortIndex
                        });
                        var sortIndex = updateColumnParameterIndexes(that, 'sortIndex', currentColumn);
                        $.each(that._columns, function(index, column) {
                            if (!isDefined(column.sortIndex) && !isDefined(column.groupIndex) && isSortOrderValid(column.sortOrder))
                                column.sortIndex = sortIndex++
                        })
                    };
                var parseDate = function(value) {
                        var parsedDate;
                        if (!utils.isDate(value))
                            if (utils.isNumber(value))
                                value = new Date(value);
                            else {
                                parsedDate = Date.parse(value);
                                if (parsedDate)
                                    value = new Date(parsedDate)
                            }
                        return value
                    };
                var applyColumnTypesToDataSource = function(that, dataSource) {
                        var i,
                            columns = that._columns,
                            firstItem = getFirstItems(dataSource)[0],
                            fieldName,
                            userMapFunc,
                            columnTypesMapFunc,
                            columnTypesWithUserMapFunc,
                            groupsCount,
                            dateFieldNames = [],
                            numberFieldNames = [];
                        if (dataSource && dataSource.map) {
                            for (i = 0; i < columns.length; i++) {
                                fieldName = columns[i].dataField;
                                if (fieldName)
                                    switch (columns[i].dataType) {
                                        case"date":
                                            if (!firstItem || !utils.isDate(firstItem[fieldName]))
                                                dateFieldNames.push(fieldName);
                                            break;
                                        case"number":
                                            if (!firstItem || utils.isString(firstItem[fieldName]))
                                                numberFieldNames.push(fieldName);
                                            break
                                    }
                            }
                            var convertValue = function(item, fieldNames, groupsCount, parseFunc) {
                                    if (!groupsCount || !utils.isDefined(item.items))
                                        for (var i = 0; i < fieldNames.length; i++) {
                                            var fieldValue = item[fieldNames[i]];
                                            if (fieldValue)
                                                item[fieldNames[i]] = parseFunc(fieldValue)
                                        }
                                    else
                                        $.each(item.items, function(index, item) {
                                            convertValue(item, fieldNames, groupsCount - 1, parseFunc)
                                        })
                                };
                            if (dateFieldNames.length > 0 || numberFieldNames.length > 0) {
                                userMapFunc = dataSource.map();
                                columnTypesMapFunc = function(item) {
                                    var groupsCount;
                                    if (item) {
                                        groupsCount = normalizeSortingInfo(dataSource.group() || []).length;
                                        convertValue(item, dateFieldNames, groupsCount, parseDate);
                                        convertValue(item, numberFieldNames, groupsCount, Number)
                                    }
                                    return item
                                };
                                columnTypesWithUserMapFunc = function(item) {
                                    item = userMapFunc ? userMapFunc(item) : item;
                                    return columnTypesMapFunc(item)
                                },
                                dataSource.map(columnTypesWithUserMapFunc);
                                if (!dataSource.map()) {
                                    dataSource.store().inserting.remove(that._insertingHandler);
                                    that._insertingHandler = function(values) {
                                        columnTypesWithUserMapFunc(values)
                                    };
                                    dataSource.store().inserting.add(that._insertingHandler)
                                }
                                else
                                    $.each(dataSource.items(), function() {
                                        columnTypesMapFunc(this)
                                    });
                                return dataSource.load()
                            }
                        }
                    };
                var getColumnIndexByVisibleIndex = function(that, visibleIndex, location) {
                        var columns = location === GROUP_LOCATION ? that.getGroupColumns() : location === COLUMN_CHOOSER_LOCATION ? that.getHiddenColumns() : that.getVisibleColumns(),
                            column = columns[visibleIndex];
                        return column && isDefined(column.index) ? column.index : -1
                    };
                var moveColumnToGroup = function(that, column, groupIndex) {
                        var groupColumns = that.getGroupColumns(),
                            i;
                        if (groupIndex >= 0) {
                            for (i = 0; i < groupColumns.length; i++)
                                if (groupColumns[i].groupIndex >= groupIndex)
                                    groupColumns[i].groupIndex++
                        }
                        else {
                            groupIndex = 0;
                            for (i = 0; i < groupColumns.length; i++)
                                groupIndex = Math.max(groupIndex, groupColumns[i].groupIndex + 1)
                        }
                        column.groupIndex = groupIndex
                    };
                var applyUserState = function(that) {
                        var columnsUserState = that._columnsUserState,
                            columns = that._columns,
                            resultColumns = [],
                            columnsByInitialIndex = [],
                            column,
                            i;
                        if (columnsUserState) {
                            if (columns.length !== columnsUserState.length)
                                return;
                            for (i = 0; i < columns.length; i++)
                                columnsByInitialIndex[columns[i].initialIndex] = columns[i];
                            for (i = 0; i < columnsUserState.length; i++) {
                                column = columnsByInitialIndex[columnsUserState[i].initialIndex];
                                if (column && columnsUserState[i].dataField === column.dataField) {
                                    column = $.extend({}, column);
                                    $.each(USER_STATE_FIELD_NAMES, function(index, value) {
                                        column[value] = columnsUserState[i][value]
                                    });
                                    resultColumns.push(column)
                                }
                                else
                                    return
                            }
                            that._columns = resultColumns
                        }
                    };
                var updateIndexes = function(that, column) {
                        updateColumnIndexes(that);
                        updateColumnGroupIndexes(that, column);
                        updateColumnSortIndexes(that, column)
                    };
                var updateColumnChanges = function(that, changeType, optionName, column) {
                        var columnChanges = that._columnChanges || {
                                optionNames: {length: 0},
                                changeTypes: {length: 0},
                                columnIndex: column && column.initialIndex,
                                column: column
                            };
                        var changeTypes = columnChanges.changeTypes;
                        if (changeType && !changeTypes[changeType]) {
                            changeTypes[changeType] = true;
                            changeTypes.length++
                        }
                        var optionNames = columnChanges.optionNames;
                        if (optionName && !optionNames[optionName]) {
                            optionNames[optionName] = true;
                            optionNames.length++
                        }
                        if (column === undefined || column !== columnChanges.column) {
                            delete columnChanges.column;
                            delete columnChanges.columnIndex
                        }
                        that._columnChanges = columnChanges;
                        that._visibleColumns = undefined
                    };
                var fireColumnsChanged = function(that, changeType) {
                        if (changeType)
                            updateColumnChanges(that, changeType);
                        if (!that._updateLockCount && that._columnChanges) {
                            that.columnsChanged.fire(that._columnChanges);
                            that._columnChanges = undefined
                        }
                    };
                var columnOptionCore = function(that, column, optionName, value) {
                        var optionGetter = dataUtils.compileGetter(optionName),
                            changeType;
                        if (arguments.length === 3)
                            return optionGetter(column, {functionsAsIs: true});
                        if (optionGetter(column, {functionsAsIs: true}) !== value) {
                            if (optionName === 'groupIndex')
                                changeType = 'grouping';
                            else if (optionName === 'sortIndex' || optionName === 'sortOrder')
                                changeType = 'sorting';
                            else
                                changeType = 'columns';
                            dataUtils.compileSetter(optionName)(column, value, {functionsAsIs: true});
                            updateColumnChanges(that, changeType, optionName, column)
                        }
                    };
                var isSortOrderValid = function(sortOrder) {
                        return sortOrder === 'asc' || sortOrder === 'desc'
                    };
                return {
                        init: function() {
                            var that = this,
                                columns = that.option('columns');
                            that._columns = columns ? createColumnsFromOptions(that, columns) : [];
                            that._updateLockCount = that._updateLockCount || 0;
                            that._isColumnsFromOptions = !!columns;
                            if (that._isColumnsFromOptions)
                                applyUserState(that);
                            else
                                that._columns = that._columnsUserState || that._columns;
                            if (that._dataSourceApplied)
                                that.applyDataSource(that._dataSource, true);
                            else
                                updateIndexes(that)
                        },
                        callbackNames: function() {
                            return ['columnsChanged']
                        },
                        optionChanged: function(name, value, prevValue) {
                            switch (name) {
                                case'columns':
                                case'commonColumnSettings':
                                case'columnAutoWidth':
                                case'allowColumnResizing':
                                case'allowColumnReordering':
                                case'grouping':
                                case'groupPanel':
                                case'regenerateColumnsByVisibleItems':
                                case'customizeColumns':
                                case'editing':
                                case'rtlEnabled':
                                    this._columnsUserState = this.getUserState();
                                    this.init();
                                    break
                            }
                        },
                        publicMethods: function() {
                            return ['addColumn', 'columnOption', 'columnCount']
                        },
                        applyDataSource: function(dataSource, forceApplying) {
                            var that = this,
                                isDataSourceLoaded = dataSource && dataSource.isLoaded(),
                                applyingComplete;
                            that._dataSource = dataSource;
                            if (!that._dataSourceApplied || that._dataSourceColumnsCount === 0 || forceApplying || that.option('regenerateColumnsByVisibleItems'))
                                if (isDataSourceLoaded) {
                                    if (!that._isColumnsFromOptions) {
                                        that._columns = createColumnsFromDataSource(that, dataSource);
                                        that._dataSourceColumnsCount = that._columns.length;
                                        applyUserState(that)
                                    }
                                    return that.updateColumns(dataSource)
                                }
                        },
                        reset: function() {
                            this._dataSourceApplied = false;
                            this._dataSourceColumnsCount = undefined
                        },
                        isInitialized: function() {
                            return !!this._columns.length
                        },
                        isDataSourceApplied: function() {
                            return this._dataSourceApplied
                        },
                        beginUpdate: function() {
                            this._updateLockCount++
                        },
                        endUpdate: function() {
                            var that = this,
                                lastChange = {},
                                change;
                            that._updateLockCount--;
                            if (!that._updateLockCount)
                                fireColumnsChanged(that)
                        },
                        getCommonSettings: function() {
                            var commonColumnSettings = this.option('commonColumnSettings') || {},
                                groupingOptions = this.option('grouping') || {},
                                groupPanelOptions = this.option('groupPanel') || {};
                            return $.extend({
                                    allowResizing: this.option('allowColumnResizing'),
                                    allowReordering: this.option('allowColumnReordering'),
                                    autoExpandGroup: groupingOptions.autoExpandAll,
                                    allowCollapsing: groupingOptions.allowCollapsing,
                                    allowGrouping: groupPanelOptions.allowColumnDragging && groupPanelOptions.visible
                                }, commonColumnSettings)
                        },
                        isColumnOptionUsed: function(optionName) {
                            for (var i = 0; i < this._columns.length; i++)
                                if (this._columns[i][optionName])
                                    return true
                        },
                        getColumns: function() {
                            return $.extend(true, [], this._columns)
                        },
                        getGroupColumns: function() {
                            var result = [];
                            $.each(this._columns, function() {
                                var column = this;
                                if (isDefined(column.groupIndex))
                                    result[column.groupIndex] = column
                            });
                            return result
                        },
                        getVisibleColumns: function() {
                            var visibleColumns = $.map(this.getGroupColumns(), function(column) {
                                    return $.extend({}, column, {width: GROUP_COLUMN_WIDTH}, FIXED_COLUMN_OPTIONS)
                                });
                            var notGroupedColumnsCount = 0;
                            $.each(this._columns, function() {
                                var column = this;
                                if (column.visible && !isDefined(column.groupIndex)) {
                                    column = $.extend(true, {}, column);
                                    visibleColumns.push(column);
                                    notGroupedColumnsCount++
                                }
                            });
                            if (!notGroupedColumnsCount && this._columns.length)
                                visibleColumns.push({command: 'empty'});
                            return visibleColumns
                        },
                        getHiddenColumns: function() {
                            var result = [];
                            $.each(this._columns, function(_, column) {
                                if (!column.visible)
                                    result.push(column)
                            });
                            return result
                        },
                        allowMoveColumn: function(fromVisibleIndex, toVisibleIndex, sourceLocation, targetLocation) {
                            var that = this,
                                columnIndex = getColumnIndexByVisibleIndex(that, fromVisibleIndex, sourceLocation),
                                sourceColumn = that._columns[columnIndex];
                            if (sourceColumn && (sourceColumn.allowReordering || sourceColumn.allowGrouping || sourceColumn.allowHiding)) {
                                if (sourceLocation === targetLocation) {
                                    if (sourceLocation === COLUMN_CHOOSER_LOCATION)
                                        return false;
                                    return fromVisibleIndex !== toVisibleIndex && fromVisibleIndex + 1 !== toVisibleIndex
                                }
                                else if (sourceLocation === GROUP_LOCATION && targetLocation !== COLUMN_CHOOSER_LOCATION || targetLocation === GROUP_LOCATION)
                                    return sourceColumn && sourceColumn.allowGrouping;
                                else if (sourceLocation === COLUMN_CHOOSER_LOCATION || targetLocation === COLUMN_CHOOSER_LOCATION)
                                    return sourceColumn && sourceColumn.allowHiding;
                                return true
                            }
                            return false
                        },
                        moveColumn: function(fromVisibleIndex, toVisibleIndex, sourceLocation, targetLocation) {
                            var that = this,
                                fromIndex,
                                toIndex,
                                targetGroupIndex,
                                isGroupMoving = sourceLocation === GROUP_LOCATION || targetLocation === GROUP_LOCATION,
                                column;
                            fromIndex = getColumnIndexByVisibleIndex(that, fromVisibleIndex, sourceLocation);
                            toIndex = getColumnIndexByVisibleIndex(that, toVisibleIndex, targetLocation);
                            if (fromIndex >= 0) {
                                column = that._columns[fromIndex];
                                targetGroupIndex = toIndex >= 0 ? that._columns[toIndex].groupIndex : -1;
                                if (isDefined(column.groupIndex)) {
                                    if (targetGroupIndex > column.groupIndex)
                                        targetGroupIndex--;
                                    delete column.groupIndex;
                                    delete column.sortOrder;
                                    updateColumnGroupIndexes(that)
                                }
                                if (targetLocation === GROUP_LOCATION)
                                    moveColumnToGroup(that, column, targetGroupIndex);
                                else if (toVisibleIndex >= 0) {
                                    that._columns.splice(fromIndex, 1);
                                    if (toIndex < 0)
                                        that._columns.push(column);
                                    else {
                                        var spliceIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
                                        that._columns.splice(spliceIndex, 0, column)
                                    }
                                    updateColumnIndexes(that)
                                }
                                column.visible = targetLocation === COLUMN_CHOOSER_LOCATION ? false : true;
                                fireColumnsChanged(that, isGroupMoving ? 'grouping' : 'columns')
                            }
                        },
                        changeSortOrder: function(columnIndex, sortOrder) {
                            var that = this,
                                commonColumnSettings = that.getCommonSettings(),
                                sortingOptions = that.option('sorting'),
                                sortingMode = sortingOptions && sortingOptions.mode,
                                needResetSorting = sortingMode === 'single' || !sortOrder,
                                allowSorting = sortingMode === 'single' || sortingMode === 'multiple',
                                column = that._columns[columnIndex],
                                nextSortOrder = function(column) {
                                    if (sortOrder === "ctrl") {
                                        delete column.sortOrder;
                                        delete column.sortIndex
                                    }
                                    else if (isDefined(column.groupIndex) || isDefined(column.sortIndex))
                                        column.sortOrder = column.sortOrder === 'desc' ? 'asc' : 'desc';
                                    else
                                        column.sortOrder = 'asc'
                                },
                                isSortingChanged = false;
                            if (allowSorting && column && column.allowSorting) {
                                if (needResetSorting && !isDefined(column.groupIndex))
                                    $.each(that._columns, function(index) {
                                        if (index !== columnIndex && this.sortOrder && !isDefined(this.groupIndex)) {
                                            delete this.sortOrder;
                                            delete this.sortIndex;
                                            isSortingChanged = true
                                        }
                                    });
                                if (isSortOrderValid(sortOrder)) {
                                    if (column.sortOrder !== sortOrder) {
                                        column.sortOrder = sortOrder;
                                        isSortingChanged = true
                                    }
                                }
                                else if (sortOrder === 'none') {
                                    if (column.sortOrder) {
                                        delete column.sortIndex;
                                        delete column.sortOrder;
                                        isSortingChanged = true
                                    }
                                }
                                else {
                                    nextSortOrder(column);
                                    isSortingChanged = true
                                }
                            }
                            if (isSortingChanged) {
                                updateColumnSortIndexes(that);
                                fireColumnsChanged(that, 'sorting')
                            }
                        },
                        getSortDataSourceParameters: function() {
                            var that = this,
                                sortColumns = [],
                                sort = [];
                            $.each(that._columns, function() {
                                if (this.dataField && this.visible && isDefined(this.sortIndex) && !isDefined(this.groupIndex))
                                    sortColumns[this.sortIndex] = this
                            });
                            $.each(sortColumns, function() {
                                var sortOrder = this && this.sortOrder;
                                if (isSortOrderValid(sortOrder))
                                    sort.push({
                                        selector: this.dataField,
                                        desc: this.sortOrder === 'desc'
                                    })
                            });
                            return sort.length > 0 ? sort : null
                        },
                        getGroupDataSourceParameters: function() {
                            var group = [];
                            $.each(this.getGroupColumns(), function() {
                                if (this.dataField)
                                    group.push({
                                        selector: this.dataField,
                                        desc: this.sortOrder === 'desc',
                                        isExpanded: !!this.autoExpandGroup
                                    })
                            });
                            return group.length > 0 ? group : null
                        },
                        refresh: function(updateNewLookupsOnly) {
                            var deferreds = [];
                            $.each(this._columns, function() {
                                var lookup = this.lookup;
                                if (lookup) {
                                    if (updateNewLookupsOnly && lookup.valueMap)
                                        return;
                                    if (lookup.update)
                                        deferreds.push(lookup.update())
                                }
                            });
                            return $.when.apply($, deferreds)
                        },
                        _updateColumnDataTypes: function(dataSource) {
                            var firstItems = getFirstItems(dataSource),
                                rtlEnabled = this.option("rtlEnabled");
                            $.each(this._columns, function(index, column) {
                                var i,
                                    value,
                                    dataType,
                                    lookup = column.lookup;
                                if (column.dataField && firstItems.length)
                                    for (i = 0; (!column.dataType || lookup && !lookup.dataType) && i < firstItems.length; i++) {
                                        value = column.calculateCellValue(firstItems[i]);
                                        column.dataType = getValueDataType(value);
                                        if (lookup)
                                            lookup.dataType = getValueDataType(lookup.calculateCellValue(value))
                                    }
                                dataType = lookup ? lookup.dataType : column.dataType;
                                if (dataType) {
                                    column.alignment = column.alignment || getAlignmentByDataType(dataType, rtlEnabled);
                                    column.format = column.format || getFormatByDataType(dataType);
                                    column.customizeText = column.customizeText || getCustomizeTextByDataType(dataType);
                                    if (!isDefined(column.filterOperations))
                                        column.filterOperations = !lookup && DATATYPE_OPERATIONS[dataType] || [];
                                    column.defaultFilterOperation = column.filterOperations && column.filterOperations[0] || '='
                                }
                            })
                        },
                        updateColumns: function(dataSource) {
                            var that = this,
                                customizeColumns = that.option('customizeColumns'),
                                sortParameters,
                                groupParameters;
                            that.updateSortingGrouping(dataSource);
                            if (!dataSource || dataSource.isLoaded()) {
                                sortParameters = dataSource ? dataSource.sort() || [] : that.getSortDataSourceParameters();
                                groupParameters = dataSource ? dataSource.group() || [] : that.getGroupDataSourceParameters();
                                if (customizeColumns) {
                                    customizeColumns(that._columns);
                                    that._columns = createColumnsFromOptions(that, that._columns)
                                }
                                updateIndexes(that);
                                that._updateColumnDataTypes(dataSource);
                                return $.when(that.refresh(true), applyColumnTypesToDataSource(that, dataSource)).always(function() {
                                        that._updateColumnDataTypes(dataSource);
                                        that._dataSourceApplied = true;
                                        if (!equalSortParameters(sortParameters, that.getSortDataSourceParameters()))
                                            updateColumnChanges(that, 'sorting');
                                        else if (!equalSortParameters(groupParameters, that.getGroupDataSourceParameters()))
                                            updateColumnChanges(that, 'grouping');
                                        else
                                            updateColumnChanges(that, 'columns');
                                        fireColumnsChanged(that)
                                    })
                            }
                        },
                        updateSortingGrouping: function(dataSource) {
                            var that = this,
                                sortParameters,
                                groupParameters,
                                columnsGroupParameters,
                                columnsSortParameters,
                                updateSortGroupParameterIndexes = function(columns, sortParameters, indexParameterName) {
                                    var i;
                                    $.each(columns, function(index, column) {
                                        if (column.dataField) {
                                            delete column[indexParameterName];
                                            if (sortParameters && sortParameters.length)
                                                for (i = 0; i < sortParameters.length; i++)
                                                    if (sortParameters[i].selector === column.dataField) {
                                                        column.sortOrder = column.sortOrder || (sortParameters[i].desc ? 'desc' : 'asc');
                                                        column[indexParameterName] = i;
                                                        break
                                                    }
                                        }
                                    })
                                };
                            if (dataSource) {
                                sortParameters = normalizeSortingInfo(dataSource.sort() || []);
                                groupParameters = normalizeSortingInfo(dataSource.group() || []);
                                columnsGroupParameters = that.getGroupDataSourceParameters();
                                columnsSortParameters = that.getSortDataSourceParameters();
                                if (!that._columns.length) {
                                    $.each(groupParameters, function(index, group) {
                                        that._columns.push(group.selector)
                                    });
                                    $.each(sortParameters, function(index, sort) {
                                        that._columns.push(sort.selector)
                                    });
                                    that._columns = createColumnsFromOptions(that, that._columns)
                                }
                                if (!columnsGroupParameters && !equalSortParameters(groupParameters, columnsGroupParameters)) {
                                    that.__groupingUpdated = true;
                                    updateSortGroupParameterIndexes(that._columns, groupParameters, 'groupIndex')
                                }
                                if (!columnsSortParameters && !equalSortParameters(sortParameters, columnsSortParameters)) {
                                    that.__sortingUpdated = true;
                                    updateSortGroupParameterIndexes(that._columns, sortParameters, 'sortIndex')
                                }
                            }
                        },
                        columnCount: function() {
                            return this._columns.length
                        },
                        columnOption: function(identificator, option, value) {
                            var that = this,
                                i,
                                changeType,
                                columns = that._columns,
                                column;
                            for (i = 0; i < columns.length; i++)
                                if (columns[i].initialIndex === identificator || columns[i].dataField === identificator || columns[i].caption === identificator) {
                                    column = columns[i];
                                    break
                                }
                            if (column) {
                                if (arguments.length === 1)
                                    return $.extend({}, column);
                                if (utils.isString(option))
                                    if (arguments.length === 2)
                                        return columnOptionCore(that, column, option);
                                    else
                                        columnOptionCore(that, column, option, value);
                                else if (utils.isObject(option))
                                    $.each(option, function(optionName, value) {
                                        columnOptionCore(that, column, optionName, value)
                                    });
                                updateIndexes(that, column);
                                fireColumnsChanged(that)
                            }
                        },
                        getVisibleIndex: function(initialIndex) {
                            var i,
                                visibleColumns = this.getVisibleColumns();
                            for (i = 0; i < visibleColumns.length; i++)
                                if (visibleColumns[i].initialIndex === initialIndex)
                                    return i;
                            return -1
                        },
                        addColumn: function(options) {
                            var that = this;
                            that._columns.push(createColumn(that, options));
                            that.updateColumns()
                        },
                        getUserState: function() {
                            var columns = this._columns,
                                result = [],
                                i;
                            for (i = 0; i < columns.length; i++) {
                                result[i] = {};
                                $.each(USER_STATE_FIELD_NAMES, function(index, value) {
                                    if (columns[i][value] !== undefined)
                                        result[i][value] = columns[i][value]
                                })
                            }
                            return result
                        },
                        setUserState: function(state) {
                            this._columnsUserState = state;
                            this.init()
                        },
                        _createCalculatedColumnOptions: function(columnOptions) {
                            var calculatedColumnOptions = {};
                            if (columnOptions.dataField) {
                                calculatedColumnOptions = {
                                    caption: convertNameToCaption(columnOptions.dataField),
                                    calculateCellValue: dataUtils.compileGetter(columnOptions.dataField),
                                    validate: function(value) {
                                        if (typeof value === 'string')
                                            return !value || !this.parseValue || this.parseValue(value) !== undefined;
                                        return true
                                    },
                                    parseValue: function(text) {
                                        var column = this,
                                            result,
                                            parsedValue;
                                        if (column.dataType === 'number') {
                                            if (utils.isString(text)) {
                                                parsedValue = Globalize.parseFloat(text);
                                                if (utils.isNumber(parsedValue))
                                                    result = parsedValue
                                            }
                                            else if (utils.isDefined(text))
                                                result = Number(text)
                                        }
                                        else if (column.dataType === 'boolean') {
                                            if (text === column.trueText)
                                                result = true;
                                            else if (text === column.falseText)
                                                result = false
                                        }
                                        else if (column.dataType === 'date') {
                                            parsedValue = Globalize.parseDate(text);
                                            if (parsedValue)
                                                result = parsedValue
                                        }
                                        else if (column.dataType === 'guid') {
                                            if (GUID_REGEX.test(text))
                                                result = text
                                        }
                                        else
                                            result = text;
                                        return result
                                    }
                                };
                                if (columnOptions.lookup)
                                    calculatedColumnOptions.lookup = {
                                        calculateCellValue: function(value) {
                                            return this.valueMap && this.valueMap[value]
                                        },
                                        updateValueMap: function() {
                                            var calculateValue,
                                                calculateDisplayValue,
                                                item,
                                                i;
                                            this.valueMap = {};
                                            if (this.items) {
                                                calculateValue = dataUtils.compileGetter(this.valueExpr);
                                                calculateDisplayValue = dataUtils.compileGetter(this.displayExpr);
                                                for (i = 0; i < this.items.length; i++) {
                                                    item = this.items[i];
                                                    this.valueMap[calculateValue(item)] = calculateDisplayValue(item)
                                                }
                                            }
                                        },
                                        update: function() {
                                            var that = this,
                                                dataSource = that.dataSource;
                                            if (dataSource)
                                                if (utils.isObject(dataSource) || utils.isArray(dataSource)) {
                                                    dataSource = new DX.data.DataSource($.extend(true, {
                                                        paginate: false,
                                                        _preferSync: true
                                                    }, dataUtils.normalizeDataSourceOptions(dataSource)));
                                                    return dataSource.load().done(function(data) {
                                                            that.items = data;
                                                            that.updateValueMap && that.updateValueMap()
                                                        })
                                                }
                                                else
                                                    DX.utils.logger.error("Unexpected type of data source is provided for a lookup column. For the list of supported types, see http://js.devexpress.com/Documentation/ApiReference/UI_Widgets/dxDataGrid/Configuration/columns/lookup#dataSource");
                                            else
                                                that.updateValueMap && that.updateValueMap()
                                        }
                                    }
                            }
                            else
                                $.extend(true, calculatedColumnOptions, {
                                    allowSorting: false,
                                    calculateCellValue: function() {
                                        return null
                                    }
                                });
                            calculatedColumnOptions.resizedCallbacks = $.Callbacks();
                            if (columnOptions.resized)
                                calculatedColumnOptions.resizedCallbacks.add($.proxy(columnOptions.resized, columnOptions));
                            return calculatedColumnOptions
                        }
                    }
            }());
        ui.dataGrid.ColumnsController = ColumnsController;
        dataGrid.registerModule('columns', {
            defaultOptions: function() {
                return {
                        commonColumnSettings: {
                            allowFiltering: true,
                            allowHiding: true,
                            allowSorting: true,
                            allowEditing: true,
                            encodeHtml: true,
                            trueText: Globalize.localize("dxDataGrid-trueText"),
                            falseText: Globalize.localize("dxDataGrid-falseText")
                        },
                        grouping: {
                            autoExpandAll: true,
                            allowCollapsing: true,
                            groupContinuesMessage: Globalize.localize("dxDataGrid-groupContinuesMessage"),
                            groupContinuedMessage: Globalize.localize("dxDataGrid-groupContinuedMessage")
                        },
                        allowColumnReordering: false,
                        allowColumnResizing: false,
                        columns: undefined,
                        regenerateColumnsByVisibleItems: false,
                        sorting: {
                            mode: 'single',
                            ascendingText: Globalize.localize("dxDataGrid-sortingAscendingText"),
                            descendingText: Globalize.localize("dxDataGrid-sortingDescendingText"),
                            clearText: Globalize.localize("dxDataGrid-sortingClearText")
                        },
                        customizeColumns: null
                    }
            },
            controllers: {columns: ColumnsController}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.selection.js */
    (function($, DX) {
        var dataGrid = DX.ui.dataGrid,
            events = DX.ui.events,
            utils = DX.utils;
        var DATAGRID_EDITOR_CELL_CLASS = "dx-editor-cell",
            DATAGRID_ROW_SELECTION_CLASS = "dx-selection",
            DATAGRID_SELECT_CHECKBOX_CLASS = "dx-select-checkbox",
            LONG_TAP_TIME = 500,
            MAX_EQUAL_KEYS_LEVEL = 3;
        $.extend(dataGrid.__internals, {DATAGRID_ROW_SELECTION_CLASS: DATAGRID_ROW_SELECTION_CLASS});
        var SHOW_CHECKBOXES_MODE = 'selection.showCheckBoxesInMultipleMode';
        dataGrid.equalKeys = function(key1, key2, level) {
            var propertyName,
                i;
            level = level || 0;
            if (level < MAX_EQUAL_KEYS_LEVEL)
                if (utils.isObject(key1) && utils.isObject(key2)) {
                    for (propertyName in key1)
                        if (key1.hasOwnProperty(propertyName) && !dataGrid.equalKeys(key1[propertyName], key2[propertyName], level + 1))
                            return false;
                    for (propertyName in key2)
                        if (!(propertyName in key1))
                            return false;
                    return true
                }
                else if (utils.isArray(key1) && utils.isArray(key2)) {
                    if (key1.length !== key2.length)
                        return false;
                    for (i = 0; i < key1.length; i++)
                        if (!dataGrid.equalKeys(key1[i], key2[i], level + 1))
                            return false;
                    return true
                }
                else if (utils.isDate(key1) && utils.isDate(key2))
                    return key1.getTime() === key2.getTime();
                else
                    return key1 === key2;
            return true
        };
        dataGrid.SelectionController = dataGrid.Controller.inherit(function() {
            var SELECTION_MODE = 'selection.mode';
            var isSelectable = function(selectionMode) {
                    return selectionMode === 'single' || selectionMode === 'multiple'
                };
            var indexOfSelectedItemKey = function(that, key, isSelectAll) {
                    var index,
                        selectedItemKeys = isSelectAll ? that._unselectedItemKeys : that._selectedItemKeys;
                    if (utils.isObject(key)) {
                        for (index = 0; index < selectedItemKeys.length; index++)
                            if (equalKeys(selectedItemKeys[index], key))
                                return index;
                        return -1
                    }
                    else
                        return $.inArray(key, selectedItemKeys)
                };
            var addSelectedItem = function(that, itemData) {
                    var key = that.getController('data').keyOf(itemData),
                        keyIndex;
                    if (indexOfSelectedItemKey(that, key) === -1) {
                        that._selectedItemKeys.push(key);
                        that._addedItemKeys.push(key);
                        that._selectedItems.push(itemData)
                    }
                    if (that._isSelectAll) {
                        keyIndex = indexOfSelectedItemKey(that, key, true);
                        that._unselectedItemKeys.splice(keyIndex, 1)
                    }
                };
            var removeSelectedItem = function(that, key) {
                    var keyIndex = indexOfSelectedItemKey(that, key);
                    if (keyIndex >= 0) {
                        that._selectedItemKeys.splice(keyIndex, 1);
                        that._removedItemKeys.push(key);
                        that._selectedItems.splice(keyIndex, 1);
                        if (that._isSelectAll && indexOfSelectedItemKey(that, key, true) === -1)
                            that._unselectedItemKeys.push(key)
                    }
                };
            var clearSelectedItems = function(that) {
                    setSelectedItems(that, [], [])
                };
            var setSelectedItems = function(that, keys, items, isSelectAll) {
                    var i,
                        oldSelectedItemKeys = that._selectedItemKeys;
                    that._selectedItemKeys = keys;
                    that._selectedItems = items;
                    that._unselectedItemKeys = [];
                    that._isSelectAll = !!isSelectAll;
                    for (i = 0; i < oldSelectedItemKeys.length; i++)
                        if ($.inArray(oldSelectedItemKeys[i], keys) === -1)
                            that._removedItemKeys.push(oldSelectedItemKeys[i]);
                    for (i = 0; i < keys.length; i++)
                        if ($.inArray(keys[i], oldSelectedItemKeys) === -1)
                            that._addedItemKeys.push(keys[i])
                };
            var equalKeys = dataGrid.equalKeys;
            var resetItemSelectionWhenShiftKeyPressed = function(that) {
                    delete that._shiftFocusedItemIndex
                };
            var isDataItem = function(row) {
                    return row && row.rowType === "data"
                };
            var changeItemSelectionWhenShiftKeyPressed = function(that, itemIndex, items) {
                    var isSelectedItemsChanged = false,
                        itemIndexStep,
                        index,
                        dataController = that.getController('data'),
                        isFocusedItemSelected = items[that._focusedItemIndex] && that.isSelectedItem(dataController.keyOf(items[that._focusedItemIndex].data));
                    var addRemoveSelectedItem = function(that, data, isRemove) {
                            if (isRemove)
                                removeSelectedItem(that, dataController.keyOf(data));
                            else
                                addSelectedItem(that, data)
                        };
                    if (!utils.isDefined(that._shiftFocusedItemIndex))
                        that._shiftFocusedItemIndex = that._focusedItemIndex;
                    if (that._shiftFocusedItemIndex !== that._focusedItemIndex) {
                        itemIndexStep = that._focusedItemIndex < that._shiftFocusedItemIndex ? 1 : -1;
                        for (index = that._focusedItemIndex; index !== that._shiftFocusedItemIndex; index += itemIndexStep)
                            if (isDataItem(items[index])) {
                                addRemoveSelectedItem(that, items[index].data, true);
                                isSelectedItemsChanged = true
                            }
                    }
                    if (itemIndex !== that._shiftFocusedItemIndex) {
                        itemIndexStep = itemIndex < that._shiftFocusedItemIndex ? 1 : -1;
                        for (index = itemIndex; index !== that._shiftFocusedItemIndex; index += itemIndexStep)
                            if (isDataItem(items[index])) {
                                addRemoveSelectedItem(that, items[index].data, false);
                                isSelectedItemsChanged = true
                            }
                    }
                    if (isDataItem(items[that._focusedItemIndex]) && !isFocusedItemSelected) {
                        addRemoveSelectedItem(that, items[that._focusedItemIndex].data, false);
                        isSelectedItemsChanged = true
                    }
                    return isSelectedItemsChanged
                };
            var createSelectedItemsFilterCriteria = function(dataSource, selectedItemKeys, isSelectAll) {
                    var keyCriteria,
                        i,
                        key = dataSource && dataSource.key(),
                        criteria = [];
                    if (dataSource)
                        if (key)
                            $.each(selectedItemKeys, function(index, keyValue) {
                                if (criteria.length > 0)
                                    criteria.push(isSelectAll ? 'and' : 'or');
                                if ($.isArray(key)) {
                                    keyCriteria = [];
                                    for (i = 0; i < key.length; i++) {
                                        if (i > 0)
                                            keyCriteria.push(isSelectAll ? 'or' : 'and');
                                        keyCriteria.push([key[i], isSelectAll ? '<>' : '=', keyValue[key[i]]])
                                    }
                                    criteria.push(keyCriteria)
                                }
                                else
                                    criteria.push([key, isSelectAll ? '<>' : '=', keyValue])
                            });
                        else
                            criteria = function(item) {
                                var i;
                                for (i = 0; i < selectedItemKeys.length; i++)
                                    if (equalKeys(selectedItemKeys[i], item))
                                        return !isSelectAll;
                                return isSelectAll
                            };
                    if (criteria.length > 0 || $.isFunction(criteria))
                        return criteria
                };
            var updateSelectedItems = function(that) {
                    var changedItemIndexes = [],
                        dataController = that.getController('data'),
                        addedItemKeys,
                        removedItemKeys;
                    if (dataController) {
                        $.each(dataController.items(), function(index, row) {
                            var key = dataController.keyOf(row.data);
                            if (isDataItem(row) && row.isSelected !== that.isSelectedItem(key))
                                changedItemIndexes.push(index)
                        });
                        if (that.option(SHOW_CHECKBOXES_MODE) === 'onClick')
                            if (that._selectedItemKeys.length > 1)
                                that.startSelectionWithCheckboxes();
                            else if (that._selectedItemKeys.length === 0 && changedItemIndexes.length)
                                that.stopSelectionWithCheckboxes();
                        if (changedItemIndexes.length)
                            dataController.updateItems({
                                changeType: 'updateSelection',
                                itemIndexes: changedItemIndexes
                            });
                        addedItemKeys = that._addedItemKeys;
                        removedItemKeys = that._removedItemKeys;
                        if (addedItemKeys.length || removedItemKeys.length) {
                            that._selectedItemsInternalChange = true;
                            that.option("selectedRowKeys", that._selectedItemKeys.slice(0));
                            that._selectedItemsInternalChange = false;
                            that.selectionChanged.fire(that._selectedItemKeys);
                            that.executeAction("selectionChanged", {
                                selectedRowsData: that._selectedItems,
                                selectedRowKeys: that._selectedItemKeys,
                                currentSelectedRowKeys: addedItemKeys,
                                currentDeselectedRowKeys: removedItemKeys
                            })
                        }
                        that._addedItemKeys = [];
                        that._removedItemKeys = []
                    }
                };
            return {
                    init: function() {
                        var that = this;
                        that._isSelectionWithCheckboxes = false;
                        that._focusedItemIndex = -1;
                        that._selectedItemKeys = [];
                        that._unselectedItemKeys = [];
                        that._selectedItems = [];
                        that._addedItemKeys = [];
                        that._removedItemKeys = [];
                        that._isSelectAll = false;
                        that.createAction("selectionChanged")
                    },
                    callbackNames: function() {
                        return ['selectionChanged']
                    },
                    optionChanged: function(name, value, prevValue) {
                        switch (name) {
                            case"selection":
                                this.init();
                                this.getController('columns').updateColumns();
                                break;
                            case"selectedRowKeys":
                                if (utils.isArray(value) && !this._selectedItemsInternalChange)
                                    this.selectRows(value);
                                break;
                            case"selectionChanged":
                                this.createAction("selectionChanged");
                                break
                        }
                    },
                    publicMethods: function() {
                        return ['selectRows', 'selectRowsByIndexes', 'getSelectedRowKeys', 'getSelectedRowsData', 'clearSelection', 'selectAll', 'startSelectionWithCheckboxes', 'stopSelectionWithCheckboxes']
                    },
                    isSelectedItem: function(key) {
                        var index = indexOfSelectedItemKey(this, key);
                        return index !== -1
                    },
                    isSelectColumnVisible: function() {
                        var showCheckboxesMode = this.option(SHOW_CHECKBOXES_MODE);
                        return this.option(SELECTION_MODE) === 'multiple' && (showCheckboxesMode === 'always' || showCheckboxesMode === 'onClick' || this._isSelectionWithCheckboxes)
                    },
                    isSelectAll: function() {
                        return this._isSelectAll && !this._unselectedItemKeys.length
                    },
                    selectAll: function() {
                        if (this.option(SHOW_CHECKBOXES_MODE) === 'onClick')
                            this.startSelectionWithCheckboxes();
                        return this.selectedItemKeys([], true)
                    },
                    clearSelection: function() {
                        this.selectedItemKeys([])
                    },
                    refresh: function() {
                        var that = this,
                            result;
                        if (that.isSelectAll())
                            result = that.selectAll();
                        else
                            result = that.selectedItemKeys(that.option("selectedRowKeys") || []);
                        return result.done(function(selectedRows) {
                                updateSelectedItems(that)
                            })
                    },
                    selectedItemKeys: function(value, isSelectAll) {
                        var that = this,
                            keys,
                            criteria,
                            isFunctionCriteria,
                            deferred,
                            dataController = that.getController('data'),
                            dataSource = dataController.dataSource(),
                            store = dataSource && dataSource.store(),
                            dataSourceFilter,
                            filter;
                        if (utils.isDefined(value)) {
                            if (store) {
                                keys = $.isArray(value) ? $.extend(true, [], value) : [value];
                                that._isSelectAll = isSelectAll;
                                if (keys.length || isSelectAll) {
                                    criteria = createSelectedItemsFilterCriteria(dataSource, keys, isSelectAll);
                                    isFunctionCriteria = $.isFunction(criteria);
                                    if (criteria || isSelectAll) {
                                        dataSourceFilter = dataSource.filter();
                                        if (criteria && !isFunctionCriteria && dataSourceFilter) {
                                            filter = [];
                                            filter.push(criteria);
                                            filter.push(dataSourceFilter)
                                        }
                                        else if (dataSourceFilter)
                                            filter = dataSourceFilter;
                                        else if (criteria && !isFunctionCriteria)
                                            filter = criteria;
                                        deferred = $.Deferred();
                                        dataController.setSelectionLoading(true);
                                        store.load({filter: filter}).done(function(items) {
                                            new DX.data.ArrayStore(items).load({filter: criteria}).done(function(items) {
                                                deferred.resolve(items)
                                            })
                                        }).fail($.proxy(deferred.reject, deferred)).always(function() {
                                            dataController.setSelectionLoading(false)
                                        })
                                    }
                                }
                            }
                            deferred = deferred || $.Deferred().resolve([]);
                            deferred.done(function(items) {
                                var i,
                                    key,
                                    keys = [];
                                if (store && items.length > 0)
                                    for (i = 0; i < items.length; i++) {
                                        key = store.keyOf(items[i]);
                                        keys.push(key)
                                    }
                                setSelectedItems(that, keys, items, isSelectAll);
                                updateSelectedItems(that)
                            });
                            return deferred
                        }
                        else
                            return that._selectedItemKeys
                    },
                    getSelectedRowKeys: function() {
                        return this.selectedItemKeys()
                    },
                    selectRows: function(keys) {
                        return this.selectedItemKeys(keys)
                    },
                    selectRowsByIndexes: function(indexes) {
                        var items = this.getController('data').items(),
                            i,
                            keys = [];
                        if (!utils.isArray(indexes))
                            indexes = Array.prototype.slice.call(arguments, 0);
                        $.each(indexes, function() {
                            var item = items[this];
                            if (item && item.rowType === 'data')
                                keys.push(item.key)
                        });
                        return this.selectRows(keys)
                    },
                    getSelectedRowsData: function() {
                        return this._selectedItems
                    },
                    changeItemSelection: function(itemIndex, keys) {
                        var that = this,
                            dataController = that.getController('data'),
                            items = dataController.items(),
                            item = items[itemIndex],
                            itemData = item && item.data,
                            selectionMode = that.option(SELECTION_MODE),
                            isSelectedItemsChanged,
                            isSelected,
                            itemKey;
                        if (isSelectable(selectionMode) && isDataItem(item)) {
                            itemKey = dataController.keyOf(itemData);
                            keys = keys || {};
                            if (that.isSelectionWithCheckboxes())
                                keys.control = true;
                            if (keys.shift && selectionMode === 'multiple' && that._focusedItemIndex >= 0)
                                isSelectedItemsChanged = changeItemSelectionWhenShiftKeyPressed(that, itemIndex, items);
                            else if (keys.control) {
                                resetItemSelectionWhenShiftKeyPressed(that);
                                isSelected = that.isSelectedItem(itemKey);
                                if (selectionMode === 'single')
                                    clearSelectedItems(that);
                                if (isSelected)
                                    removeSelectedItem(that, itemKey);
                                else
                                    addSelectedItem(that, itemData);
                                isSelectedItemsChanged = true
                            }
                            else {
                                resetItemSelectionWhenShiftKeyPressed(that);
                                if (that._selectedItemKeys.length !== 1 || !equalKeys(that._selectedItemKeys[0], itemKey)) {
                                    setSelectedItems(that, [itemKey], [itemData]);
                                    isSelectedItemsChanged = true
                                }
                            }
                            if (isSelectedItemsChanged) {
                                that._focusedItemIndex = itemIndex;
                                updateSelectedItems(that);
                                return true
                            }
                        }
                        return false
                    },
                    focusedItemIndex: function(itemIndex) {
                        var that = this;
                        if (utils.isDefined(itemIndex))
                            that._focusedItemIndex = itemIndex;
                        else
                            return that._focusedItemIndex
                    },
                    isSelectionWithCheckboxes: function() {
                        var selectionMode = this.option(SELECTION_MODE),
                            showCheckboxesMode = this.option(SHOW_CHECKBOXES_MODE);
                        return selectionMode === 'multiple' && (showCheckboxesMode === 'always' || this._isSelectionWithCheckboxes)
                    },
                    startSelectionWithCheckboxes: function() {
                        var that = this,
                            isSelectColumnVisible = that.isSelectColumnVisible();
                        if (that.option(SELECTION_MODE) === 'multiple' && !that.isSelectionWithCheckboxes()) {
                            that._isSelectionWithCheckboxes = true;
                            if (isSelectColumnVisible !== that.isSelectColumnVisible())
                                that.getController('columns').updateColumns();
                            else if (that.option(SHOW_CHECKBOXES_MODE) === 'onClick')
                                updateSelectedItems(that);
                            return true
                        }
                        return false
                    },
                    stopSelectionWithCheckboxes: function() {
                        var that = this,
                            isSelectColumnVisible = that.isSelectColumnVisible();
                        if (that._isSelectionWithCheckboxes) {
                            that._isSelectionWithCheckboxes = false;
                            if (isSelectColumnVisible !== that.isSelectColumnVisible())
                                that.getController('columns').updateColumns();
                            return true
                        }
                        return false
                    }
                }
        }());
        dataGrid.registerModule('selection', {
            defaultOptions: function() {
                return {
                        selection: {
                            mode: 'none',
                            showCheckBoxesInMultipleMode: 'onClick',
                            allowSelectAll: true
                        },
                        selectionChanged: null,
                        selectedRowKeys: []
                    }
            },
            controllers: {selection: dataGrid.SelectionController},
            extenders: {
                controllers: {
                    data: {
                        setDataSource: function(dataSource) {
                            this.callBase(dataSource);
                            this.getController('selection').refresh()
                        },
                        setSelectionLoading: function(isLoading) {
                            this._isSelectionLoading = isLoading;
                            this._fireLoadingChanged()
                        },
                        isLoading: function() {
                            var isLoading = this.callBase();
                            return isLoading || !!this._isSelectionLoading
                        },
                        pageIndex: function(value) {
                            var that = this,
                                dataSource = that._dataSource;
                            if (dataSource && value && dataSource.pageIndex() !== value)
                                that.getController('selection').focusedItemIndex(-1);
                            return that.callBase(value)
                        },
                        _processDataItem: function() {
                            var that = this,
                                selectionController = that.getController('selection'),
                                hasSelectColumn = selectionController.isSelectColumnVisible(),
                                dataItem = this.callBase.apply(this, arguments);
                            dataItem.isSelected = selectionController.isSelectedItem(dataItem.key);
                            if (hasSelectColumn && dataItem.values)
                                dataItem.values[0] = dataItem.isSelected;
                            return dataItem
                        }
                    },
                    columns: {getVisibleColumns: function() {
                            var that = this,
                                selectionController = that.getController('selection'),
                                columns = that.callBase();
                            columns = $.grep(columns, function(column) {
                                return column.command !== 'select'
                            });
                            if (selectionController.isSelectColumnVisible() && columns.length)
                                columns.unshift({
                                    visible: true,
                                    command: 'select',
                                    dataType: 'boolean',
                                    alignment: 'center',
                                    width: 70
                                });
                            return columns
                        }}
                },
                views: {
                    columnHeadersView: {
                        _renderCore: function(options) {
                            var that = this;
                            that.getController('selection').selectionChanged.remove(that._selectionChangedHandler);
                            that.callBase(options)
                        },
                        _renderHeaderContent: function(rootElement, column, columnIndex) {
                            var that = this,
                                groupElement,
                                selectionController = that.getController('selection');
                            var getSelectAllValue = function(selectionController) {
                                    if (selectionController.isSelectAll() || selectionController.getSelectedRowKeys().length === 0)
                                        return selectionController.isSelectAll()
                                };
                            if (column.command === 'select') {
                                rootElement.addClass(DATAGRID_EDITOR_CELL_CLASS);
                                groupElement = $('<div />').appendTo(rootElement);
                                that.getController('editorFactory').createEditor(groupElement, $.extend({}, column, {
                                    parentType: "headerRow",
                                    value: getSelectAllValue(selectionController),
                                    setValue: function(value, e) {
                                        if (e.jQueryEvent && getSelectAllValue(selectionController) !== value) {
                                            if (e.previousValue === undefined || e.previousValue) {
                                                selectionController.clearSelection();
                                                e.component.option('value', false)
                                            }
                                            if (e.previousValue === false)
                                                if (that.option("selection.allowSelectAll"))
                                                    selectionController.selectAll();
                                                else
                                                    e.component.option('value', false);
                                            e.jQueryEvent.preventDefault()
                                        }
                                    }
                                }));
                                rootElement.on('dxclick', that.createAction(function(e) {
                                    var event = e.jQueryEvent;
                                    if (!$(event.target).closest('.dx-checkbox').length)
                                        $(event.currentTarget).children().trigger('dxclick');
                                    event.preventDefault()
                                }));
                                that._selectionChangedHandler = function() {
                                    groupElement.dxCheckBox('instance').option('value', getSelectAllValue(selectionController))
                                };
                                selectionController.selectionChanged.add(that._selectionChangedHandler)
                            }
                            else
                                that.callBase(rootElement, column, columnIndex)
                        }
                    },
                    rowsView: {
                        _getDefaultTemplate: function(column) {
                            var that = this,
                                groupElement;
                            if (column.command === 'select')
                                return function(container, options) {
                                        container.addClass(DATAGRID_EDITOR_CELL_CLASS);
                                        container.on('dxclick', that.createAction(function(e) {
                                            var selectionController = that.getController('selection'),
                                                event = e.jQueryEvent,
                                                rowIndex = that.getRowIndex($(event.currentTarget).closest('.dx-row'));
                                            if (rowIndex >= 0) {
                                                selectionController.startSelectionWithCheckboxes();
                                                selectionController.changeItemSelection(rowIndex, {shift: event.shiftKey})
                                            }
                                        }));
                                        groupElement = $('<div />').addClass(DATAGRID_SELECT_CHECKBOX_CLASS).appendTo(container);
                                        that.getController('editorFactory').createEditor(groupElement, $.extend({}, column, {
                                            parentType: "dataRow",
                                            value: options.value
                                        }))
                                    };
                            else
                                return that.callBase(column)
                        },
                        _update: function(change) {
                            var that = this;
                            if (change.changeType === 'updateSelection') {
                                if (that._tableElement.length > 0)
                                    $.each(change.itemIndexes || [], function(_, index) {
                                        var $row,
                                            isSelected;
                                        if (change.items[index]) {
                                            $row = that._getRowElements().eq(index);
                                            isSelected = !!change.items[index].isSelected;
                                            $row.toggleClass(DATAGRID_ROW_SELECTION_CLASS, isSelected);
                                            $row.find('.dx-checkbox').dxCheckBox('option', 'value', isSelected)
                                        }
                                    });
                                that._updateCheckboxesClass()
                            }
                            else
                                that.callBase(change)
                        },
                        _createTable: function() {
                            var that = this,
                                $table = that.callBase();
                            return $table.on(events.addNamespace('dxpointerdown', "dxDataGridRowsView"), that.createAction(function(e) {
                                    that._isTouchEvent = events.isTouchEvent(e.jQueryEvent)
                                })).on(events.addNamespace('dxhold', "dxDataGridRowsView"), {timeout: that.option("selection.longTapTime") || LONG_TAP_TIME}, that.createAction(function(e) {
                                    var selectionController = that.getController('selection'),
                                        event = e.jQueryEvent;
                                    if (that.option(SHOW_CHECKBOXES_MODE) === 'onLongTap')
                                        if (selectionController.isSelectionWithCheckboxes())
                                            selectionController.stopSelectionWithCheckboxes();
                                        else
                                            selectionController.startSelectionWithCheckboxes();
                                    if (that.option(SHOW_CHECKBOXES_MODE) === 'onClick')
                                        $(event.target).closest('.dx-row').find(DATAGRID_SELECT_CHECKBOX_CLASS).parent().trigger('dxclick')
                                })).on('mousedown selectstart', that.createAction(function(e) {
                                    var event = e.jQueryEvent;
                                    if (event.shiftKey)
                                        event.preventDefault()
                                }))
                        },
                        _createRow: function(rowOptions) {
                            var $row = this.callBase(rowOptions);
                            rowOptions && $row.toggleClass(DATAGRID_ROW_SELECTION_CLASS, !!rowOptions.isSelected);
                            return $row
                        },
                        _rowClick: function(rowIndex, event) {
                            var that = this;
                            that.getController('selection').changeItemSelection(rowIndex, {
                                control: event.ctrlKey,
                                shift: event.shiftKey
                            });
                            that.callBase(rowIndex, event)
                        },
                        _renderCore: function(change) {
                            this.callBase(change);
                            this._updateCheckboxesClass()
                        },
                        _updateCheckboxesClass: function() {
                            var selectionController = this.getController('selection');
                            this._element().toggleClass('dx-select-checkboxes-hidden', selectionController.isSelectColumnVisible() && !selectionController.isSelectionWithCheckboxes())
                        }
                    }
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.editorFactory.js */
    (function($, DX) {
        var dataGrid = DX.ui.dataGrid,
            addNamespace = DX.ui.events.addNamespace;
        var FILTERING_TIMEOUT = 700,
            DATAGRID_CHECKBOX_SIZE_CLASS = "dx-datagrid-checkbox-size",
            DATAGRID_MODULE_NAMESPACE = 'dxDataGridEditorFactory',
            DATAGRID_UPDATE_FOCUS_EVENTS = addNamespace('focusin dxpointerdown dxclick', DATAGRID_MODULE_NAMESPACE),
            ENTER_KEY = 13,
            TAB_KEY = 9,
            DATAGRID_FOCUS_OVERLAY_CLASS = 'dx-datagrid-focus-overlay',
            DATAGRID_FOCUSED_ELEMENT_CLASS = 'dx-focused',
            DATAGRID_CONTENT_CLASS = 'dx-datagrid-content';
        dataGrid.EditorFactoryController = dataGrid.Controller.inherit(function() {
            var createCalendarPicker = function($container, options) {
                    $container.dxDateBox({
                        value: options.value,
                        useCalendar: true,
                        customOverlayCssClass: 'dx-datagrid',
                        formatString: DX.utils.isString(options.format) && DX.DateTimeFormat[options.format.toLowerCase()] || options.format,
                        formatWidthCalculator: null,
                        rtlEnabled: options.rtlEnabled,
                        disabled: options.disabled
                    });
                    $container.dxDateBox('instance').optionChanged.add(function(optionName, value) {
                        if (optionName === 'value')
                            options.setValue(value)
                    })
                };
            var createTextBox = function($container, options) {
                    var toString = function(value) {
                            return DX.utils.isDefined(value) ? value.toString() : ''
                        },
                        isFilterRow = options.parentType === 'filterRow',
                        isSearchPanel = options.parentType === 'searchPanel';
                    $container.dxTextBox({
                        placeholder: options.placeholder,
                        width: options.width,
                        value: toString(options.value),
                        valueChangeAction: function(e) {
                            var updateValue = function(e, isTimeout) {
                                    var parsedValue;
                                    if (!options.validate || options.validate(e.value)) {
                                        parsedValue = options.parseValue ? options.parseValue(e.value) : e.value;
                                        options.setValue(parsedValue !== undefined ? parsedValue : null, e)
                                    }
                                    else if (!isTimeout)
                                        e.component.option('value', toString(e.previousValue))
                                };
                            window.clearTimeout($container._valueChangeTimeoutID);
                            if (e.jQueryEvent && e.jQueryEvent.type === "keyup")
                                $container._valueChangeTimeoutID = window.setTimeout(function() {
                                    updateValue(e, true)
                                }, FILTERING_TIMEOUT);
                            else if (e.jQueryEvent && e.jQueryEvent.type === 'keydown') {
                                if (e.jQueryEvent.which === ENTER_KEY || e.jQueryEvent.which === TAB_KEY)
                                    updateValue(e)
                            }
                            else
                                updateValue(e)
                        },
                        mode: isSearchPanel ? 'search' : 'text',
                        valueChangeEvent: 'change keydown' + (isFilterRow ? ' keyup' : '') + (isSearchPanel ? ' keyup search' : ''),
                        rtlEnabled: options.rtlEnabled,
                        disabled: options.disabled
                    })
                };
            var createBooleanEditor = function($container, options) {
                    if (options.parentType === 'filterRow')
                        createSelectBox($container, $.extend({lookup: {
                                displayExpr: function(data) {
                                    if (data === true)
                                        return options.trueText || 'true';
                                    else if (data === false)
                                        return options.falseText || 'false'
                                },
                                items: [true, false],
                                rtlEnabled: options.rtlEnabled,
                                disabled: options.disabled
                            }}, options));
                    else
                        createCheckBox($container, options)
                };
            var createSelectBox = function($container, options) {
                    var lookup = options.lookup,
                        items,
                        displayGetter,
                        isFilterRow = options.parentType === 'filterRow';
                    if (lookup) {
                        items = lookup.items;
                        displayGetter = DX.data.utils.compileGetter(lookup.displayExpr);
                        if (isFilterRow && items) {
                            items = items.slice(0);
                            items.unshift(null)
                        }
                        $container.dxSelectBox({
                            value: options.value || null,
                            valueExpr: options.lookup.valueExpr,
                            showClearButton: lookup.allowClearing && !isFilterRow,
                            displayExpr: function(data) {
                                if (data === null)
                                    return options.showAllText;
                                return displayGetter(data)
                            },
                            items: items,
                            valueChangeAction: function(e) {
                                options.setValue(e.value, e)
                            },
                            rtlEnabled: options.rtlEnabled,
                            disabled: options.disabled
                        })
                    }
                };
            var createCheckBox = function($container, options) {
                    $container.addClass(DATAGRID_CHECKBOX_SIZE_CLASS).dxCheckBox({
                        value: options.value,
                        valueChangeAction: function(e) {
                            options.setValue && options.setValue(e.value, e)
                        },
                        rtlEnabled: options.rtlEnabled
                    })
                };
            return {
                    _updateFocusCore: function() {
                        var $focus = this._$focusedElement,
                            $dataGridElement = this.component && this.component._element();
                        if ($dataGridElement) {
                            $focus = $dataGridElement.find('[tabindex]:focus, input:focus');
                            if ($focus.length) {
                                $focus = $focus.closest('.dx-editor-cell > *, .dx-row > td');
                                if ($focus.length) {
                                    this.focus($focus);
                                    return
                                }
                            }
                        }
                        this.loseFocus()
                    },
                    _updateFocus: function(e) {
                        var that = this,
                            isFocusOverlay = e.jQueryEvent && $(e.jQueryEvent.target).hasClass(DATAGRID_FOCUS_OVERLAY_CLASS);
                        that._isFocusOverlay = that._isFocusOverlay || isFocusOverlay;
                        clearTimeout(that._updateFocusTimeoutID);
                        that._updateFocusTimeoutID = setTimeout(function() {
                            delete that._updateFocusTimeoutID;
                            if (!that._isFocusOverlay)
                                that._updateFocusCore();
                            that._isFocusOverlay = false
                        })
                    },
                    focus: function($element) {
                        var that = this;
                        if ($element === undefined)
                            return that._$focusedElement;
                        else if ($element)
                            setTimeout(function() {
                                var $focusOverlay = that._$focusOverlay = that._$focusOverlay || $('<div>').addClass(DATAGRID_FOCUS_OVERLAY_CLASS);
                                var align = !parseInt($element.css('border-left-width')) && parseInt($element.css('border-right-width')) ? "right bottom" : "left top";
                                $focusOverlay.show();
                                $focusOverlay.css('visibility', 'hidden');
                                $focusOverlay.appendTo($element.closest('.' + DATAGRID_CONTENT_CLASS));
                                $focusOverlay.outerWidth($element.outerWidth() + 1);
                                $focusOverlay.outerHeight($element.outerHeight() + 1);
                                DX.position($focusOverlay, {
                                    my: align,
                                    at: align,
                                    of: $element
                                });
                                $focusOverlay.css('visibility', 'visible');
                                that._$focusedElement && that._$focusedElement.removeClass(DATAGRID_FOCUSED_ELEMENT_CLASS);
                                $element.addClass(DATAGRID_FOCUSED_ELEMENT_CLASS);
                                that._$focusedElement = $element
                            })
                    },
                    loseFocus: function() {
                        this._$focusedElement && this._$focusedElement.removeClass(DATAGRID_FOCUSED_ELEMENT_CLASS);
                        this._$focusedElement = null;
                        this._$focusOverlay && this._$focusOverlay.hide()
                    },
                    init: function() {
                        var that = this,
                            $container = that.component && that.component._element();
                        $(document).on(DATAGRID_UPDATE_FOCUS_EVENTS, this.createAction($.proxy(this._updateFocus, this)));
                        $container && $container.on('dxclick', '.' + DATAGRID_FOCUS_OVERLAY_CLASS, function(e) {
                            var $focusOverlay = $(e.target),
                                element;
                            $focusOverlay.hide();
                            element = document.elementFromPoint(e.pageX, e.pageY);
                            $focusOverlay.show();
                            $(element).trigger('dxclick');
                            that._$focusedElement && that._$focusedElement.find('input').focus()
                        })
                    },
                    dispose: function() {
                        $(document).off(DATAGRID_UPDATE_FOCUS_EVENTS)
                    },
                    createEditor: function($container, options) {
                        var editorPreparing = this.option('editorPreparing'),
                            editorPrepared = this.option('editorPrepared');
                        options.rtlEnabled = this.option('rtlEnabled');
                        options.disabled = this.option("disabled");
                        options.cancel = false;
                        editorPreparing && editorPreparing($container, options);
                        if (options.cancel)
                            return;
                        if (options.lookup)
                            createSelectBox($container, options);
                        else
                            switch (options.dataType) {
                                case'date':
                                    createCalendarPicker($container, options);
                                    break;
                                case'boolean':
                                    createBooleanEditor($container, options);
                                    break;
                                default:
                                    createTextBox($container, options);
                                    break
                            }
                        editorPrepared && editorPrepared($container, options)
                    }
                }
        }());
        $.extend(dataGrid.__internals, {DATAGRID_FOCUSED_ELEMENT_CLASS: DATAGRID_FOCUSED_ELEMENT_CLASS});
        dataGrid.registerModule('editorFactory', {
            defaultOptions: function() {
                return {}
            },
            controllers: {editorFactory: dataGrid.EditorFactoryController}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.columnChooserModule.js */
    (function($, DX) {
        var ui = DX.ui,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var DATAGRID_COLUMN_CHOOSER_CLASS = 'dx-datagrid-column-chooser',
            DATAGRID_COLUMN_CHOOSER_BUTTON_CLASS = 'dx-datagrid-column-chooser-button',
            DATAGRID_COLUMN_CHOOSER_ICON_NAME = 'column-chooser',
            DATAGRID_COLUMN_CHOOSER_ITEM_CLASS = "dx-column-chooser-item",
            DATAGRID_COLUMN_CHOOSER_MESSAGE_CLASS = "dx-column-chooser-message",
            DATAGRID_HEADERS_ACTION_CLASS = "dx-datagrid-action-cursor";
        dataGrid.ColumnChooserView = dataGrid.View.inherit({
            _updateItems: function() {
                var hiddenColumns = this._columnsController.getHiddenColumns(),
                    columnChooserOptions = this.option("columnChooser"),
                    $content = this._popupContainer.content();
                $content.dxScrollable(dataGrid.createScrollableOptions(this));
                this._renderColumnChooserItems($content, hiddenColumns);
                if (!hiddenColumns.length)
                    $('<span />').addClass(DATAGRID_COLUMN_CHOOSER_MESSAGE_CLASS).text(columnChooserOptions ? columnChooserOptions.emptyPanelText : "").appendTo($content.dxScrollable("instance").content())
            },
            _initializePopupContainer: function() {
                var that = this,
                    $element = this._element().addClass(DATAGRID_COLUMN_CHOOSER_CLASS),
                    columnChooserOptions = this.option("columnChooser"),
                    theme = DevExpress.ui.themes.current(),
                    isGenericTheme = theme && theme.indexOf("generic") > -1;
                if (!utils.isDefined(this._popupContainer)) {
                    this._popupContainer = $element.dxPopup({
                        visible: false,
                        shading: false,
                        closeButton: isGenericTheme,
                        cancelButton: !isGenericTheme,
                        width: columnChooserOptions.width,
                        height: columnChooserOptions.height,
                        title: columnChooserOptions.title,
                        targetContainer: this._element().parent(),
                        rtlEnabled: this.option('rtlEnabled')
                    }).data('dxPopup');
                    this._popupContainer.optionChanged.add(function(optionName) {
                        if (optionName === "visible")
                            that.renderCompleted.fire()
                    })
                }
            },
            _renderCore: function() {
                if (this.option("columnChooser.enabled"))
                    this._initializePopupContainer();
                if (this._popupContainer)
                    this._updateItems()
            },
            _renderColumnChooserItems: function($container, hiddenColumns) {
                var dxScrollable = $container.dxScrollable("instance"),
                    $scrollableContainer = dxScrollable.content(),
                    $item;
                $scrollableContainer.empty();
                $.each(hiddenColumns, function(index, hiddenColumn) {
                    $item = $('<div />').addClass(hiddenColumn.cssClass).addClass(DATAGRID_COLUMN_CHOOSER_ITEM_CLASS).toggleClass(DATAGRID_HEADERS_ACTION_CLASS, hiddenColumn.allowHiding).text(hiddenColumn.caption).appendTo($scrollableContainer)
                });
                dxScrollable.update()
            },
            init: function() {
                var that = this;
                that._columnsController = that.getController('columns');
                that._columnsController.columnsChanged.add(function(e) {
                    if (!dataGrid.checkChanges(e.optionNames, ['width']))
                        that.render()
                })
            },
            renderShowColumnChooserButton: function(rootElement) {
                var that = this,
                    columnChooserOptions = that.option("columnChooser") || {},
                    $showColumnChooserButton = rootElement.find("." + DATAGRID_COLUMN_CHOOSER_BUTTON_CLASS);
                if (columnChooserOptions.enabled)
                    if (!$showColumnChooserButton.length)
                        $('<div />').addClass(DATAGRID_COLUMN_CHOOSER_BUTTON_CLASS).appendTo(rootElement).dxButton({
                            icon: DATAGRID_COLUMN_CHOOSER_ICON_NAME,
                            clickAction: function(e) {
                                that._popupContainer.toggle(!that._popupContainer.option('visible'))
                            }
                        });
                    else
                        $showColumnChooserButton.show();
                else
                    $showColumnChooserButton.hide()
            },
            getColumnElements: function() {
                var $content = this._popupContainer && this._popupContainer.content();
                return $content && $content.find('.' + DATAGRID_COLUMN_CHOOSER_ITEM_CLASS)
            },
            getName: function() {
                return 'columnChooser'
            },
            getColumns: function() {
                return this._columnsController.getHiddenColumns()
            },
            allowDragging: function(column) {
                var popupContainer = this._popupContainer;
                return popupContainer && popupContainer.option("visible") && column && column.allowHiding
            },
            getBoundingRect: function() {
                var that = this,
                    container = that._popupContainer && that._popupContainer._container(),
                    offset;
                if (container && container.is(':visible')) {
                    offset = container.offset();
                    return {
                            left: offset.left,
                            top: offset.top,
                            right: offset.left + container.outerWidth(),
                            bottom: offset.top + container.outerHeight()
                        }
                }
                return null
            },
            showColumnChooser: function() {
                this._isPopupContainerShown = true;
                if (!this._popupContainer) {
                    this._initializePopupContainer();
                    this.render()
                }
                this._popupContainer.show()
            },
            hideColumnChooser: function() {
                if (this._popupContainer) {
                    this._popupContainer.hide();
                    this._isPopupContainerShown = false
                }
            },
            publicMethods: function() {
                return ['showColumnChooser', 'hideColumnChooser']
            }
        });
        $.extend(dataGrid.__internals, {
            DATAGRID_COLUMN_CHOOSER_CLASS: DATAGRID_COLUMN_CHOOSER_CLASS,
            DATAGRID_COLUMN_CHOOSER_ITEM_CLASS: DATAGRID_COLUMN_CHOOSER_ITEM_CLASS,
            DATAGRID_COLUMN_CHOOSER_BUTTON_CLASS: DATAGRID_COLUMN_CHOOSER_BUTTON_CLASS,
            DATAGRID_COLUMN_CHOOSER_MESSAGE_CLASS: DATAGRID_COLUMN_CHOOSER_MESSAGE_CLASS
        });
        dataGrid.registerModule('columnChooser', {
            defaultOptions: function() {
                return {columnChooser: {
                            enabled: false,
                            width: 250,
                            height: 260,
                            title: Globalize.localize("dxDataGrid-columnChooserTitle"),
                            emptyPanelText: Globalize.localize("dxDataGrid-columnChooserEmptyText")
                        }}
            },
            views: {columnChooserView: dataGrid.ColumnChooserView},
            extenders: {views: {headerPanel: {
                        _renderShowColumnChooserButton: function() {
                            this.getView('columnChooserView').renderShowColumnChooserButton(this._element())
                        },
                        _renderCore: function() {
                            this.callBase();
                            this._renderShowColumnChooserButton()
                        },
                        optionChanged: function(name, value, prevValue) {
                            this.callBase(name, value, prevValue);
                            switch (name) {
                                case'columnChooser':
                                    this._renderShowColumnChooserButton();
                                    break
                            }
                        },
                        isVisible: function() {
                            var that = this,
                                columnChooserOptions = that.getView('columnChooserView').option('columnChooser');
                            return that.callBase() || columnChooserOptions && columnChooserOptions.enabled
                        }
                    }}}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.editing.js */
    (function($, DX) {
        var dataGrid = DX.ui.dataGrid,
            events = DX.ui.events,
            addNamespace = events.addNamespace,
            utils = DX.utils;
        var DATAGRID_LINK_CLASS = "dx-link",
            DATAGRID_EDITOR_CELL_CLASS = "dx-editor-cell",
            DATAGRID_ROW_SELECTED = "dx-selection",
            DATAGRID_EDIT_ROW = "dx-edit-row",
            DATAGRID_EDIT_BUTTON_CLASS = "dx-edit-button",
            DATAGRID_INSERT_INDEX = "__DX_INSERT_INDEX__",
            DATAGRID_ROW_REMOVED = "dx-row-removed",
            DATAGRID_ROW_INSERTED = "dx-row-inserted",
            DATAGRID_ROW_MODIFIED = "dx-row-modified",
            DATAGRID_CELL_MODIFIED = "dx-cell-modified",
            DATAGRID_CELL_HIGHLIGHT_OUTLINE = "dx-highlight-outline",
            DATAGRID_EDITING_NAMESPACE = "dxDataGridEditing",
            DATAGRID_FOCUS_OVERLAY_CLASS = "dx-datagrid-focus-overlay",
            DATAGRID_EDIT_MODE_BATCH = "batch",
            DATAGRID_EDIT_MODE_ROW = "row";
        $.extend(dataGrid.__internals, {
            DATAGRID_LINK_CLASS: DATAGRID_LINK_CLASS,
            DATAGRID_EDITOR_CELL_CLASS: DATAGRID_EDITOR_CELL_CLASS,
            DATAGRID_EDIT_ROW: DATAGRID_EDIT_ROW,
            DATAGRID_EDIT_BUTTON_CLASS: DATAGRID_EDIT_BUTTON_CLASS
        });
        var getEditMode = function(that) {
                var editing = that.option('editing.editMode');
                if (editing === DATAGRID_EDIT_MODE_BATCH)
                    return editing;
                return DATAGRID_EDIT_MODE_ROW
            };
        var getEditIndex = function(key, editDataArray) {
                var index = -1;
                $.each(editDataArray, function(i, editData) {
                    if (key && key[DATAGRID_INSERT_INDEX] && key === editData.key || dataGrid.equalKeys(key, editData.key)) {
                        index = i;
                        return false
                    }
                });
                return index
            };
        dataGrid.EditingController = dataGrid.ViewController.inherit(function() {
            var getDataController = function(that) {
                    return that.getController('data')
                };
            var getDefaultEditor = function(that) {
                    return function(container, options) {
                            var $editor = $('<div/>').appendTo(container);
                            that.getController('editorFactory').createEditor($editor, $.extend({}, options.column, {
                                value: options.value,
                                setValue: options.setValue,
                                parentType: 'dataRow',
                                width: null
                            }))
                        }
                };
            return {
                    init: function() {
                        var that = this;
                        that._insertIndex = 1;
                        that._editRowIndex = -1;
                        that._editData = [];
                        that._editColumnIndex = -1;
                        that._columnsController = that.getController("columns");
                        if (!that._saveEditorHandler) {
                            that._saveEditorHandler = that.createAction(function(e) {
                                var event = e.jQueryEvent,
                                    visibleColumns,
                                    isEditorPopup,
                                    isFocusOverlay,
                                    $targetCell,
                                    allowEditing,
                                    isDataRow;
                                if (getEditMode(that) === DATAGRID_EDIT_MODE_BATCH && that.isEditing() && !that._editCellInProgress) {
                                    isEditorPopup = $(event.target).closest('.dx-overlay-wrapper').length;
                                    isFocusOverlay = $(event.target).hasClass(DATAGRID_FOCUS_OVERLAY_CLASS);
                                    isDataRow = $(event.target).closest('.dx-data-row').length;
                                    visibleColumns = that._columnsController.getVisibleColumns();
                                    $targetCell = $(event.target).closest('td');
                                    allowEditing = $targetCell.length && visibleColumns[$targetCell[0].cellIndex].allowEditing;
                                    if ((!isDataRow || isDataRow && !allowEditing) && !isEditorPopup && !isFocusOverlay)
                                        that.closeEditCell()
                                }
                            });
                            $(document).on('dxclick', that._saveEditorHandler)
                        }
                        that._updateEditButtons()
                    },
                    getEditMode: function() {
                        return getEditMode(this)
                    },
                    hasChanges: function() {
                        return this._editData.length
                    },
                    dispose: function() {
                        this.callBase();
                        $(document).off('dxclick', this._saveEditorHandler)
                    },
                    optionChanged: function(name, value, prevValue){},
                    publicMethods: function() {
                        return ['insertRow', 'editRow', 'editCell', 'closeEditCell', 'removeRow', 'saveEditData', 'recoverRow', 'undeleteRow', 'cancelEditData']
                    },
                    refresh: function() {
                        if (getEditMode(this) === DATAGRID_EDIT_MODE_BATCH) {
                            this._editRowIndex = -1;
                            this._editColumnIndex = -1
                        }
                        else
                            this.init()
                    },
                    isEditing: function() {
                        return this._editRowIndex > -1
                    },
                    isEditRow: function(rowIndex) {
                        return this._editRowIndex === rowIndex && this._editColumnIndex === -1
                    },
                    isEditCell: function(rowIndex, columnIndex) {
                        return this._editRowIndex === rowIndex && this._editColumnIndex === columnIndex
                    },
                    processItems: function(items) {
                        var that = this,
                            editData = that._editData,
                            i,
                            key;
                        that.update();
                        for (i = 0; i < editData.length; i++) {
                            key = editData[i].key;
                            if (key && key[DATAGRID_INSERT_INDEX] && key.pageIndex === that._pageIndex)
                                items.splice(key.rowIndex, 0, key)
                        }
                        return items
                    },
                    processDataItem: function(item, columns, generateDataValues) {
                        var that = this,
                            editIndex,
                            data,
                            key = item.data[DATAGRID_INSERT_INDEX] ? item.data : item.key;
                        editIndex = getEditIndex(key, that._editData);
                        if (editIndex >= 0) {
                            data = that._editData[editIndex].data;
                            if (key && key[DATAGRID_INSERT_INDEX]) {
                                item.inserted = true;
                                item.key = key;
                                item.data = data
                            }
                            else if (data) {
                                item.modified = true;
                                item.data = $.extend(true, {}, item.data, data);
                                item.modifiedValues = generateDataValues(data, columns)
                            }
                            else
                                item.removed = true
                        }
                    },
                    insertRow: function() {
                        var that = this,
                            dataController = getDataController(that),
                            rowsView = that.getView('rowsView'),
                            initNewRow = that.option("initNewRow"),
                            param = {data: {}},
                            insertKey = {
                                pageIndex: dataController.pageIndex(),
                                rowIndex: rowsView ? rowsView.getTopVisibleItemIndex() : 0
                            };
                        that.refresh();
                        if (getEditMode(that) === DATAGRID_EDIT_MODE_ROW)
                            that._editRowIndex = insertKey.rowIndex;
                        initNewRow && initNewRow(param);
                        insertKey[DATAGRID_INSERT_INDEX] = that._insertIndex++;
                        that._editData.push({
                            key: insertKey,
                            data: param.data
                        });
                        dataController.updateItems()
                    },
                    editRow: function(rowIndex) {
                        var that = this,
                            dataController = getDataController(that),
                            item = dataController.items()[rowIndex],
                            editingStart = that.option("editingStart"),
                            params = {
                                data: item.data,
                                key: item.key,
                                cancel: false
                            };
                        if (!item.inserted)
                            params.key = item.key;
                        editingStart && editingStart(params);
                        if (params.cancel)
                            return;
                        that.init();
                        that._editRowIndex = rowIndex;
                        that._pageIndex = dataController.pageIndex();
                        dataController.updateItems()
                    },
                    editCell: function(rowIndex, columnIndex) {
                        var that = this,
                            rowsView = that.getView("rowsView"),
                            dataController = getDataController(that),
                            item = dataController.items()[rowIndex],
                            editingStart = that.option("editingStart"),
                            params = {
                                data: item.data,
                                cancel: false,
                                column: that._columnsController.getVisibleColumns()[columnIndex]
                            };
                        if (item && item.rowType === 'data' && !item.removed && getEditMode(that) === DATAGRID_EDIT_MODE_BATCH) {
                            if (!item.inserted)
                                params.key = item.key;
                            editingStart && editingStart(params);
                            if (params.cancel)
                                return;
                            that._editRowIndex = rowIndex;
                            that._editColumnIndex = columnIndex;
                            that._pageIndex = dataController.pageIndex();
                            that._editCellInProgress = true;
                            dataController.updateItems();
                            setTimeout(function() {
                                that._editCellInProgress = false;
                                rowsView._focusEditor()
                            });
                            return true
                        }
                        return false
                    },
                    removeRow: function(rowIndex) {
                        var that = this,
                            editingOptions = that.option("editing"),
                            editingTexts = editingOptions && editingOptions.texts,
                            confirmDeleteTitle = editingTexts && editingTexts.confirmDeleteTitle,
                            isBatchMode = editingOptions && editingOptions.editMode === DATAGRID_EDIT_MODE_BATCH,
                            confirmDeleteMessage = editingTexts && editingTexts.confirmDeleteMessage,
                            dataController = getDataController(that),
                            removeByKey,
                            item = dataController.items()[rowIndex],
                            key = item && item.key;
                        if (item) {
                            removeByKey = function(key) {
                                that.refresh();
                                var editIndex = getEditIndex(key, that._editData);
                                if (editIndex >= 0)
                                    if (key && key[DATAGRID_INSERT_INDEX])
                                        that._editData.splice(editIndex, 1);
                                    else
                                        that._editData[editIndex].data = null;
                                else
                                    that._editData.push({
                                        key: key,
                                        oldData: item.data
                                    });
                                if (isBatchMode)
                                    dataController.updateItems();
                                else
                                    that.saveEditData()
                            };
                            if (isBatchMode || !confirmDeleteMessage)
                                removeByKey(key);
                            else
                                DX.ui.dialog.confirm(confirmDeleteMessage, confirmDeleteTitle).done(function(confirmResult) {
                                    if (confirmResult)
                                        removeByKey(key)
                                })
                        }
                    },
                    recoverRow: function(rowIndex) {
                        DX.utils.logger.warn("'recoverRow' method is deprecated since 14.1. Use the 'undeleteRow' method instead.");
                        return this.undeleteRow(rowIndex)
                    },
                    undeleteRow: function(rowIndex) {
                        var that = this,
                            dataController = getDataController(that),
                            item = dataController.items()[rowIndex],
                            key = item && item.key;
                        if (item) {
                            var editIndex = getEditIndex(key, that._editData);
                            if (editIndex >= 0) {
                                that._editData.splice(editIndex, 1);
                                dataController.updateItems()
                            }
                        }
                    },
                    saveEditData: function() {
                        var that = this;
                        that._editRowIndex = -1;
                        that._editColumnIndex = -1;
                        that._saveEditData()
                    },
                    _saveEditData: function() {
                        var that = this,
                            dataController = getDataController(that),
                            store = dataController.store(),
                            item,
                            key,
                            rowInserting = that.option("rowInserting"),
                            rowInserted = that.option("rowInserted"),
                            rowUpdating = that.option("rowUpdating"),
                            rowUpdated = that.option("rowUpdated"),
                            rowRemoving = that.option("rowRemoving"),
                            rowRemoved = that.option("rowRemoved"),
                            processedKeys = [],
                            deferreds = [],
                            editData = $.extend({}, that._editData);
                        var removeEditData = function(that, keys) {
                                $.each(keys, function(index, key) {
                                    var editIndex = getEditIndex(key, that._editData);
                                    if (editIndex >= 0)
                                        that._editData.splice(editIndex, 1)
                                })
                            };
                        if (that._editData.length) {
                            $.each(that._editData, function(_, editData) {
                                var data = editData.data,
                                    oldData = editData.oldData,
                                    key = editData.key,
                                    deferred,
                                    params;
                                if (!data) {
                                    params = {
                                        data: oldData,
                                        key: key,
                                        cancel: false
                                    };
                                    rowRemoving && rowRemoving(params);
                                    if (params.cancel)
                                        return;
                                    deferred = store.remove(key)
                                }
                                else if (key && key[DATAGRID_INSERT_INDEX]) {
                                    params = {
                                        data: data,
                                        cancel: false
                                    };
                                    rowInserting && rowInserting(params);
                                    if (params.cancel)
                                        return;
                                    deferred = store.insert(data)
                                }
                                else {
                                    params = {
                                        newData: $.extend({}, oldData, data),
                                        oldData: oldData,
                                        key: key,
                                        cancel: false
                                    };
                                    rowUpdating && rowUpdating(params);
                                    if (params.cancel)
                                        return;
                                    deferred = store.update(key, data)
                                }
                                deferred.done($.proxy(processedKeys.push, processedKeys, key));
                                deferreds.push(deferred)
                            });
                            if (deferreds.length)
                                $.when.apply($, deferreds).always(function(e) {
                                    var isError = e && e.name === "Error";
                                    if (!isError)
                                        removeEditData(that, processedKeys);
                                    $.when(dataController.refresh()).always(function() {
                                        $.each(editData, function(_, itemData) {
                                            var data = itemData.data,
                                                key = itemData.key,
                                                params = {
                                                    key: key,
                                                    data: data
                                                };
                                            if (isError)
                                                params.error = e;
                                            if (!data)
                                                rowRemoved && rowRemoved($.extend({}, params, {data: itemData.oldData}));
                                            else if (key && key[DATAGRID_INSERT_INDEX])
                                                rowInserted && rowInserted(params);
                                            else
                                                rowUpdated && rowUpdated(params)
                                        })
                                    });
                                    if (isError)
                                        dataController.dataErrorOccurred.fire(e)
                                })
                        }
                        else
                            dataController.updateItems()
                    },
                    _updateEditButtons: function() {
                        var that = this,
                            saveChangesButton = that._saveChangesButton,
                            cancelChangesButton = that._cancelChangesButton,
                            hasChanges = that.hasChanges();
                        if (saveChangesButton)
                            saveChangesButton.option('disabled', !hasChanges);
                        if (cancelChangesButton)
                            cancelChangesButton.option('disabled', !hasChanges)
                    },
                    cancelEditData: function() {
                        var that = this,
                            dataController = getDataController(that);
                        that.init();
                        dataController.updateItems()
                    },
                    closeEditCell: function() {
                        var that = this,
                            dataController = getDataController(that);
                        setTimeout(function() {
                            that._editRowIndex = -1;
                            that._editColumnIndex = -1;
                            dataController.updateItems()
                        })
                    },
                    update: function() {
                        var that = this,
                            dataController = getDataController(that);
                        if (that._pageIndex !== dataController.pageIndex()) {
                            that.refresh();
                            that._pageIndex = dataController.pageIndex()
                        }
                        that._updateEditButtons()
                    },
                    updateFieldValue: function(options) {
                        var that = this,
                            rowKey = options.key,
                            dataField = options.column.dataField,
                            value = options.column.serializeValue ? options.column.serializeValue(options.value) : options.value,
                            editDataIndex;
                        if (rowKey !== undefined) {
                            editDataIndex = getEditIndex(rowKey, that._editData);
                            if (editDataIndex < 0) {
                                editDataIndex = that._editData.length;
                                that._editData.push({
                                    data: {},
                                    key: rowKey,
                                    oldData: options.data
                                })
                            }
                            if (that._editData[editDataIndex])
                                that._editData[editDataIndex].data[dataField] = value;
                            that._updateEditButtons()
                        }
                    },
                    getColumnTemplate: function(options) {
                        var that = this,
                            column = options.column,
                            template,
                            isRowMode,
                            editingOptions,
                            editingTexts;
                        if (column.allowEditing && column.dataField && !column.command && that._editRowIndex === options.rowIndex && (that._editColumnIndex < 0 || that._editColumnIndex === options.columnIndex) && options.rowType === 'data') {
                            options.setValue = function(value) {
                                options.value = value;
                                that.updateFieldValue(options)
                            };
                            template = column.editCellTemplate || getDefaultEditor(that)
                        }
                        else if (column.command === 'edit')
                            template = function(container, options) {
                                var createLink = function(container, text, methodName, options) {
                                        var $link = $('<a />').addClass(DATAGRID_LINK_CLASS).text(text).on(addNamespace('dxclick', DATAGRID_EDITING_NAMESPACE), that.createAction(function() {
                                                setTimeout(function() {
                                                    that[methodName](options.rowIndex)
                                                })
                                            }));
                                        options.rtlEnabled ? container.prepend($link, "&nbsp;") : container.append($link, "&nbsp;")
                                    };
                                isRowMode = getEditMode(that) === DATAGRID_EDIT_MODE_ROW;
                                container.css('text-align', 'center');
                                options.rtlEnabled = that.option('rtlEnabled');
                                editingOptions = that.option("editing") || {};
                                editingTexts = editingOptions.texts || {};
                                if (that._editRowIndex === options.rowIndex && isRowMode) {
                                    createLink(container, editingTexts.saveRowChanges, 'saveEditData', options);
                                    createLink(container, editingTexts.cancelRowChanges, 'cancelEditData', options)
                                }
                                else {
                                    if (editingOptions.editEnabled && isRowMode)
                                        createLink(container, editingTexts.editRow, 'editRow', options);
                                    if (editingOptions.removeEnabled)
                                        if (options.row.removed)
                                            createLink(container, editingTexts.undeleteRow, 'undeleteRow', options);
                                        else
                                            createLink(container, editingTexts.deleteRow, 'removeRow', options)
                                }
                            };
                        return template
                    },
                    renderEditButtons: function(rootElement) {
                        var that = this,
                            insertButton = rootElement.find('.' + DATAGRID_EDIT_BUTTON_CLASS),
                            editingOptions = that.option("editing") || {};
                        var createEditButton = function(rootElement, className, methodName) {
                                return $('<div />').addClass(DATAGRID_EDIT_BUTTON_CLASS).addClass("dx-datagrid-" + className + "-button").appendTo(rootElement).dxButton({
                                        icon: "edit-button-" + className,
                                        clickAction: $.proxy(that, methodName)
                                    }).dxButton('instance')
                            };
                        if (insertButton.length)
                            insertButton.remove();
                        if ((editingOptions.editEnabled || editingOptions.insertEnabled || editingOptions.removeEnabled) && getEditMode(that) === DATAGRID_EDIT_MODE_BATCH) {
                            that._cancelChangesButton = createEditButton(rootElement, "cancel", 'cancelEditData');
                            that._saveChangesButton = createEditButton(rootElement, "save", 'saveEditData');
                            that._updateEditButtons()
                        }
                        if (editingOptions.insertEnabled)
                            createEditButton(rootElement, "addrow", 'insertRow')
                    }
                }
        }());
        dataGrid.registerModule('editing', {
            defaultOptions: function() {
                return {editing: {
                            editMode: 'row',
                            insertEnabled: false,
                            editEnabled: false,
                            removeEnabled: false,
                            texts: {
                                editRow: Globalize.localize("dxDataGrid-editingEditRow"),
                                saveRowChanges: Globalize.localize("dxDataGrid-editingSaveRowChanges"),
                                cancelRowChanges: Globalize.localize("dxDataGrid-editingCancelRowChanges"),
                                deleteRow: Globalize.localize("dxDataGrid-editingDeleteRow"),
                                recoverRow: Globalize.localize("dxDataGrid-editingUndeleteRow"),
                                undeleteRow: Globalize.localize("dxDataGrid-editingUndeleteRow"),
                                confirmDeleteMessage: Globalize.localize("dxDataGrid-editingConfirmDeleteMessage"),
                                confirmDeleteTitle: Globalize.localize("dxDataGrid-editingConfirmDeleteTitle")
                            }
                        }}
            },
            controllers: {editing: dataGrid.EditingController},
            extenders: {
                controllers: {
                    data: {
                        init: function() {
                            this._editingController = this.getController('editing');
                            this.callBase()
                        },
                        reload: function() {
                            this._editingController.refresh();
                            return this.callBase()
                        },
                        _processItems: function(items) {
                            items = this._editingController.processItems(items);
                            return this.callBase(items)
                        },
                        _processDataItem: function(dataItem, columns) {
                            this._editingController.processDataItem(dataItem, columns, this._generateDataValues);
                            return this.callBase(dataItem, columns)
                        }
                    },
                    columns: {getVisibleColumns: function() {
                            var that = this,
                                editing = that.option('editing'),
                                columns = that.callBase();
                            columns = $.grep(columns, function(column) {
                                return column.command !== 'edit'
                            });
                            if (editing && ((editing.editEnabled || editing.insertEnabled) && getEditMode(that) === DATAGRID_EDIT_MODE_ROW || editing.removeEnabled) && columns.length)
                                columns.push({
                                    visible: true,
                                    command: 'edit',
                                    width: 100
                                });
                            return columns
                        }}
                },
                views: {
                    rowsView: {
                        _getColumnTemplate: function(options) {
                            var that = this,
                                template = that.getController('editing').getColumnTemplate(options);
                            return template || that.callBase(options)
                        },
                        _createRow: function(options) {
                            var $row = this.callBase(options),
                                editingController,
                                isEditRow,
                                isRowRemoved,
                                isRowInserted,
                                isRowModified;
                            if (options) {
                                editingController = this.getController('editing');
                                isEditRow = editingController.isEditRow(options.rowIndex);
                                isRowRemoved = !!options.removed;
                                isRowInserted = !!options.inserted;
                                isRowModified = !!options.modified;
                                if (getEditMode(this) === DATAGRID_EDIT_MODE_BATCH)
                                    $row.toggleClass(DATAGRID_ROW_REMOVED, isRowRemoved);
                                else
                                    $row.toggleClass(DATAGRID_EDIT_ROW, isEditRow);
                                $row.toggleClass(DATAGRID_ROW_INSERTED, isRowInserted);
                                $row.toggleClass(DATAGRID_ROW_MODIFIED, isRowModified);
                                if (isEditRow || isRowInserted || isRowRemoved || isRowModified)
                                    $row.removeClass(DATAGRID_ROW_SELECTED)
                            }
                            return $row
                        },
                        _rowClick: function(rowIndex, event) {
                            var that = this,
                                editingController = that.getController('editing'),
                                editing = that.option('editing'),
                                $targetCell = $(event.target).closest('td'),
                                cellIndex = $targetCell.length ? $targetCell[0].cellIndex : -1,
                                column = that._columnsController.getVisibleColumns()[cellIndex],
                                isEditCell = cellIndex >= 0 && editing && editing.editEnabled && column && column.allowEditing && editingController.editCell(rowIndex, cellIndex);
                            if (!isEditCell && !editingController.isEditRow(rowIndex))
                                that.callBase(rowIndex, event)
                        },
                        _cellPrepared: function($cell, parameters) {
                            var modifiedValues = parameters.row && (parameters.row.inserted ? parameters.row.values : parameters.row.modifiedValues),
                                columnIndex = parameters.columnIndex,
                                alignment = parameters.column.alignment,
                                editingController = this.getController('editing'),
                                $contents;
                            parameters.isEditing = editingController.isEditCell(parameters.rowIndex, columnIndex) || editingController.isEditRow(parameters.rowIndex) && parameters.column.allowEditing;
                            if (parameters.isEditing) {
                                $cell.addClass(DATAGRID_EDITOR_CELL_CLASS);
                                if (alignment)
                                    $cell.find('input').first().css('text-align', alignment)
                            }
                            if (modifiedValues && parameters.column && parameters.column.allowEditing && modifiedValues[columnIndex] !== undefined)
                                if (!parameters.isEditing) {
                                    $cell.addClass(DATAGRID_CELL_MODIFIED);
                                    $contents = $cell.contents();
                                    $("<div>").addClass(DATAGRID_CELL_HIGHLIGHT_OUTLINE).append(!$contents.length || $contents.length === 1 && !$contents.eq(0).text().length ? "&nbsp;" : $contents).appendTo($cell)
                                }
                            this.callBase.apply(this, arguments)
                        },
                        _update: function(change) {
                            this.callBase(change);
                            if (change.changeType === 'updateSelection')
                                this._element().find('.' + DATAGRID_EDIT_ROW).removeClass(DATAGRID_ROW_SELECTED)
                        },
                        _focusEditor: function() {
                            this._tableElement.find('input').first().focus()
                        }
                    },
                    headerPanel: {
                        _renderCore: function() {
                            this.callBase();
                            this.getController('editing').renderEditButtons(this._element())
                        },
                        isVisible: function() {
                            var that = this,
                                editingOptions = that.getController('editing').option('editing');
                            return that.callBase() || editingOptions && (editingOptions.insertEnabled || (editingOptions.editEnabled || editingOptions.removeEnabled) && editingOptions.editMode === DATAGRID_EDIT_MODE_BATCH)
                        }
                    }
                }
            }
        });
        $.extend(dataGrid.__internals, {
            DATAGRID_CELL_MODIFIED: DATAGRID_CELL_MODIFIED,
            DATAGRID_ROW_REMOVED: DATAGRID_ROW_REMOVED,
            DATAGRID_ROW_INSERTED: DATAGRID_ROW_INSERTED,
            DATAGRID_ROW_MODIFIED: DATAGRID_ROW_MODIFIED,
            DATAGRID_CELL_HIGHLIGHT_OUTLINE: DATAGRID_CELL_HIGHLIGHT_OUTLINE,
            DATAGRID_FOCUS_OVERLAY_CLASS: DATAGRID_FOCUS_OVERLAY_CLASS
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.dataController.js */
    (function($, DX) {
        var ui = DX.ui,
            dataGrid = ui.dataGrid,
            utils = DX.utils;
        dataGrid.DataController = dataGrid.Controller.inherit({}).include(ui.DataHelperMixin).inherit(function() {
            var processGroupItems = function(that, items, groupsCount) {
                    var scrollingMode = that.option('scrolling.mode'),
                        collectedItems = [],
                        collectItemsCore = function(items, collectedItems, groupIndex, groupsCount, path, collectContinuationItems) {
                            var i,
                                isExpanded,
                                item;
                            if (groupIndex >= groupsCount)
                                collectedItems.push.apply(collectedItems, items);
                            else
                                for (i = 0; i < items.length; i++) {
                                    item = items[i];
                                    if ('key' in item && item.items !== undefined) {
                                        path.push(item.key);
                                        isExpanded = !!item.items;
                                        if (collectContinuationItems || !item.isContinuation)
                                            collectedItems.push({
                                                rowType: 'group',
                                                groupIndex: groupIndex,
                                                data: item,
                                                isExpanded: isExpanded,
                                                values: path.slice(0)
                                            });
                                        if (isExpanded)
                                            collectItemsCore(item.items, collectedItems, groupIndex + 1, groupsCount, path, collectContinuationItems);
                                        path.pop()
                                    }
                                    else
                                        collectedItems.push(item)
                                }
                        };
                    collectItemsCore(items, collectedItems, 0, groupsCount, [], scrollingMode !== 'virtual' && scrollingMode !== 'infinite');
                    return collectedItems
                };
            return {
                    init: function() {
                        var that = this;
                        that._items = [];
                        that._columnsController = that.getController('columns');
                        that._columnsChangedHandler = function(e) {
                            var changeTypes = e.changeTypes,
                                optionNames = e.optionNames;
                            var updateItemsHandler = function() {
                                    that._columnsController.columnsChanged.remove(updateItemsHandler);
                                    that.updateItems()
                                };
                            if (changeTypes.sorting || changeTypes.grouping) {
                                if (that._dataSource) {
                                    that._dataSource.group(that._columnsController.getGroupDataSourceParameters());
                                    that._dataSource.sort(that._columnsController.getSortDataSourceParameters());
                                    that.reload()
                                }
                            }
                            else if (changeTypes.columns) {
                                if (optionNames.filterValue || optionNames.selectedFilterOperation)
                                    if (!e.column || utils.isDefined(e.column.filterValue) || !optionNames.selectedFilterOperation || optionNames.filterValue)
                                        that._applyFilter();
                                if (!that._needApplyFilter && !dataGrid.checkChanges(optionNames, ['width', 'filterValue', 'selectedFilterOperation']))
                                    that._columnsController.columnsChanged.add(updateItemsHandler)
                            }
                        };
                        that._gridDataSourceChangedHandler = function(e) {
                            var dataSource = that._dataSource,
                                isDataSourceApplied;
                            if (dataSource && !that._isDataSourceApplying) {
                                that._isDataSourceApplying = true;
                                $.when(that._columnsController.applyDataSource(dataSource)).done(function() {
                                    that._isDataSourceApplying = false;
                                    var additionalFilter = that._calculateAdditionalFilter(),
                                        needApplyFilter = that._needApplyFilter;
                                    that._needApplyFilter = false;
                                    if (needApplyFilter && additionalFilter && additionalFilter.length)
                                        that._applyFilter();
                                    else
                                        that.updateItems(e)
                                });
                                that._needApplyFilter = !that._columnsController.isDataSourceApplied()
                            }
                        };
                        that._columnsController.columnsChanged.add(that._columnsChangedHandler);
                        that._loadingChangedHandler = function(isLoading) {
                            that._isLoading = isLoading;
                            that._fireLoadingChanged()
                        };
                        that._loadErrorHandler = function(e) {
                            that.dataErrorOccurred.fire(e)
                        };
                        that._viewportSize = 20;
                        that._isLoading = false;
                        that._isCustomLoading = false;
                        that._refreshDataSource();
                        that.createAction('dataErrorOccurred', {excludeValidators: ['gesture']});
                        that.dataErrorOccurred.add(function(e) {
                            return that.executeAction('dataErrorOccurred', e)
                        })
                    },
                    callbackNames: function() {
                        return ['changed', 'loadingChanged', 'dataErrorOccurred']
                    },
                    callbackFlags: function(name) {
                        if (name === 'dataErrorOccurred')
                            return 'stopOnFalse'
                    },
                    publicMethods: function() {
                        return ['beginCustomLoading', 'endCustomLoading', 'refresh', 'filter', 'clearFilter', 'keyOf', 'byKey', 'getDataByKeys', 'collapseAll', 'expandAll', 'pageIndex', 'pageSize', 'pageCount', 'totalCount', '_disposeDataSource']
                    },
                    optionChanged: function(name, value, prevValue) {
                        var that = this;
                        switch (name) {
                            case'dataSource':
                            case'grouping':
                            case'scrolling':
                            case'rtlEnabled':
                            case'paging':
                            case'columns':
                                that._columnsController.reset();
                                that._refreshDataSource();
                                break;
                            case'dataErrorOccurred':
                                that.createAction('dataErrorOccurred');
                                break
                        }
                    },
                    _dataSourceType: function() {
                        var scrolling = this.option('scrolling');
                        if (scrolling && (scrolling.mode === 'virtual' || scrolling.mode === 'infinite'))
                            return dataGrid.ScrollingDataSourceWrapper;
                        else
                            return dataGrid.DataSource
                    },
                    _dataSourceOptions: function() {
                        var that = this,
                            paging = that.option('paging'),
                            scrolling = that.option('scrolling'),
                            virtualMode = !!(scrolling && scrolling.mode === 'virtual'),
                            appendMode = !!(scrolling && scrolling.mode === 'infinite');
                        return {
                                paginate: paging && paging.enabled || virtualMode || appendMode,
                                loadingTimeout: that.option('loadingTimeout'),
                                asyncLoadEnabled: true,
                                pageIndex: paging && paging.pageIndex,
                                pageSize: paging && paging.pageSize,
                                requireTotalCount: !appendMode,
                                useNativeGrouping: 'auto',
                                scrolling: scrolling
                            }
                    },
                    _initDataSource: function() {
                        var columnsController = this._columnsController,
                            sort,
                            group,
                            dataSource;
                        if (this.option("dataSource") instanceof DX.data.DataSource) {
                            DX.utils.logger.error("The dataSource option cannot take the DevExpress.data.DataSource instance directly. Assign a DataSource configuration object (see http://js.devexpress.com/Documentation/ApiReference/Data_Library/DataSource/Configuration) or a simple array instead.");
                            return
                        }
                        this.callBase();
                        dataSource = this._dataSource;
                        if (dataSource) {
                            columnsController.updateSortingGrouping(dataSource);
                            sort = columnsController.getSortDataSourceParameters();
                            if (sort)
                                dataSource.sort(sort);
                            group = columnsController.getGroupDataSourceParameters();
                            if (group)
                                dataSource.group(group);
                            this.setDataSource(dataSource)
                        }
                    },
                    _processItems: function(items) {
                        var that = this,
                            visibleColumns = that._columnsController.getVisibleColumns(),
                            groupColumns = that._columnsController.getGroupColumns(),
                            result = [],
                            dataIndex = 0;
                        if (items.length > 0 && that._columnsController.isInitialized()) {
                            if (groupColumns.length > 0)
                                items = processGroupItems(that, items, groupColumns.length);
                            $.each(items, function(index, item) {
                                if (utils.isDefined(item)) {
                                    if (utils.isDefined(item.groupIndex))
                                        dataIndex = 0;
                                    else {
                                        item = that._generateDataItem(item);
                                        item = that._processDataItem(item, visibleColumns);
                                        item.dataIndex = dataIndex++
                                    }
                                    result.push(item)
                                }
                            })
                        }
                        return result
                    },
                    _generateDataItem: function(data) {
                        return {
                                rowType: 'data',
                                data: data,
                                key: this.keyOf(data)
                            }
                    },
                    _processDataItem: function(dataItem, visibleColumns) {
                        dataItem.values = this._generateDataValues(dataItem.data, visibleColumns);
                        return dataItem
                    },
                    _generateDataValues: function(data, columns) {
                        var values = [];
                        $.each(columns, function() {
                            var value = null;
                            if (utils.isDefined(this.groupIndex))
                                value = null;
                            else if (this.calculateCellValue)
                                value = this.calculateCellValue(data);
                            else if (this.dataField)
                                value = data[this.dataField];
                            values.push(value)
                        });
                        return values
                    },
                    _updateItemsCore: function(change) {
                        var that = this,
                            items,
                            dataSource = that._dataSource,
                            changes = [],
                            changeType = change.changeType;
                        if (dataSource) {
                            items = change.items || dataSource.items();
                            items = that._processItems(items.slice(0));
                            change.items = items;
                            change.changeType = changeType || 'refresh';
                            switch (changeType) {
                                case'prepend':
                                    that._items.unshift.apply(that._items, items);
                                    break;
                                case'append':
                                    that._items.push.apply(that._items, items);
                                    break;
                                default:
                                    that._items = items;
                                    break
                            }
                        }
                    },
                    updateItems: function(change) {
                        var that = this;
                        change = change || {};
                        if (that._dataSource && that._columnsController.isDataSourceApplied()) {
                            that._updateItemsCore(change);
                            that.changed.fire(change)
                        }
                    },
                    changeGroupExpand: function(path) {
                        this._dataSource && this._dataSource.changeGroupExpand(path)
                    },
                    getGroupPathByRowIndex: function(rowIndex) {
                        var item = this.items()[rowIndex];
                        if (item && item.rowType === 'group')
                            return item.values
                    },
                    isLoading: function() {
                        return this._isLoading || this._isCustomLoading
                    },
                    _fireLoadingChanged: function(messageText) {
                        this.loadingChanged.fire(this.isLoading(), messageText)
                    },
                    _calculateAdditionalFilter: function() {
                        return null
                    },
                    _applyFilter: function() {
                        var that = this,
                            dataSource = that._dataSource,
                            additionalFilter,
                            filter = that._filter;
                        if (dataSource) {
                            additionalFilter = that._calculateAdditionalFilter();
                            if (additionalFilter)
                                if (filter)
                                    filter = [filter, 'and', additionalFilter];
                                else
                                    filter = additionalFilter;
                            dataSource.filter(filter && filter.length ? filter : null);
                            dataSource.pageIndex(0);
                            return that.reload()
                        }
                    },
                    filter: function(filterExpr) {
                        this._filter = arguments.length > 1 ? Array.prototype.slice.call(arguments, 0) : filterExpr;
                        this._applyFilter()
                    },
                    clearFilter: function() {
                        this._filter = null;
                        this._applyFilter()
                    },
                    setDataSource: function(dataSource) {
                        var that = this;
                        if (that._dataSource) {
                            that._dataSource.changed.remove(that._gridDataSourceChangedHandler);
                            that._dataSource.loadingChanged.remove(that._loadingChangedHandler);
                            that._dataSource.loadError.remove(that._loadErrorHandler)
                        }
                        that._dataSource = dataSource;
                        if (dataSource) {
                            that._isLoading = !dataSource.isLoaded();
                            that._filter = dataSource.filter();
                            dataSource.changed.add(that._gridDataSourceChangedHandler);
                            dataSource.loadingChanged.add(that._loadingChangedHandler);
                            dataSource.loadError.add(that._loadErrorHandler);
                            that._needApplyFilter = true;
                            if (dataSource.isLoaded())
                                that._gridDataSourceChangedHandler()
                        }
                    },
                    items: function() {
                        return this._items
                    },
                    virtualItemsCount: function() {
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.virtualItemsCount && dataSource.virtualItemsCount()
                    },
                    setViewportSize: function(size) {
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.setViewportSize && dataSource.setViewportSize(size)
                    },
                    setViewportItemIndex: function(itemIndex) {
                        var dataSource = this._dataSource;
                        dataSource && dataSource.setViewportItemIndex && dataSource.setViewportItemIndex(itemIndex)
                    },
                    collapseAll: function(groupIndex) {
                        var dataSource = this._dataSource;
                        if (dataSource && dataSource.collapseAll(groupIndex)) {
                            dataSource.pageIndex(0);
                            dataSource.reload()
                        }
                    },
                    expandAll: function(groupIndex) {
                        var dataSource = this._dataSource;
                        if (dataSource && dataSource.expandAll(groupIndex)) {
                            dataSource.pageIndex(0);
                            dataSource.reload()
                        }
                    },
                    totalItemsCount: function() {
                        return this._dataSource ? this._dataSource.totalItemsCount() : 0
                    },
                    hasKnownLastPage: function() {
                        return this._dataSource ? this._dataSource.hasKnownLastPage() : true
                    },
                    isLoaded: function() {
                        return this._dataSource ? this._dataSource.isLoaded() : false
                    },
                    totalCount: function() {
                        return this._dataSource ? this._dataSource.totalCount() : 0
                    },
                    pageCount: function() {
                        return this._dataSource ? this._dataSource.pagesCount() : 1
                    },
                    dataSource: function() {
                        return this._dataSource
                    },
                    store: function() {
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.store()
                    },
                    keyOf: function(data) {
                        var store = this.store();
                        return store && store.keyOf(data)
                    },
                    byKey: function(key) {
                        var store = this.store(),
                            result;
                        if (!store)
                            return;
                        $.each(this._items, function(_, item) {
                            if (item.key === key) {
                                result = $.Deferred().resolve(item.data);
                                return false
                            }
                        });
                        return result || store.byKey(key)
                    },
                    getDataByKeys: function(rowKeys) {
                        var that = this,
                            result = $.Deferred(),
                            deferreds = [],
                            data = [];
                        $.each(rowKeys, function(index, key) {
                            deferreds.push(that.byKey(key).done(function(keyData) {
                                data[index] = keyData
                            }))
                        });
                        $.when.apply($, deferreds).always(function() {
                            result.resolve(data)
                        });
                        return result
                    },
                    pageIndex: function(value) {
                        var that = this,
                            dataSource = that._dataSource;
                        if (dataSource) {
                            if (value !== undefined)
                                if (dataSource.pageIndex() !== value) {
                                    dataSource.pageIndex(value);
                                    return dataSource.load()
                                }
                            return dataSource.pageIndex()
                        }
                        return 0
                    },
                    pageSize: function(value) {
                        var that = this,
                            dataSource = that._dataSource;
                        if (value === undefined)
                            return dataSource ? dataSource.pageSize() : 0;
                        if (dataSource) {
                            dataSource.pageIndex(0);
                            dataSource.pageSize(value);
                            return dataSource.reload()
                        }
                    },
                    beginCustomLoading: function(messageText) {
                        this._isCustomLoading = true;
                        this._fireLoadingChanged(messageText)
                    },
                    endCustomLoading: function() {
                        this._isCustomLoading = false;
                        this._fireLoadingChanged()
                    },
                    refresh: function() {
                        var that = this,
                            d = $.Deferred();
                        $.when(this._columnsController.refresh()).always(function() {
                            $.when(that.reload()).done(d.resolve).fail(d.reject)
                        });
                        return d
                    },
                    reload: function() {
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.reload()
                    },
                    dispose: function() {
                        var that = this,
                            dataSource = that._dataSource;
                        that.callBase();
                        if (dataSource) {
                            dataSource.changed.remove(that._gridDataSourceChangedHandler);
                            dataSource.loadingChanged.remove(that._loadingChangedHandler)
                        }
                    }
                }
        }());
        dataGrid.registerModule('data', {
            defaultOptions: function() {
                return {
                        dataSource: null,
                        dataErrorOccurred: null
                    }
            },
            controllers: {data: ui.dataGrid.DataController}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.columnsView.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var DATAGRID_SORT_CLASS = "dx-sort",
            DATAGRID_SORTUP_CLASS = "dx-sort-up",
            DATAGRID_SORTDOWN_CLASS = "dx-sort-down",
            DATAGRID_SORT_ALIGNMENT_CLASS = "dx-sort-alignment-",
            DATAGRID_CELL_CONTENT_CLASS = "dx-datagrid-text-content",
            DATAGRID_TABLE_CONTENT_CLASS = "dx-datagrid-table-content",
            DATAGRID_ROW_CLASS = "dx-row",
            DATAGRID_GROUP_ROW_CLASS = "dx-group-row",
            DATAGRID_TABLE_CLASS = "dx-datagrid-table";
        dataGrid.ColumnsView = dataGrid.View.inherit({
            _applySorting: function(rootElement, column, showColumnLines) {
                var $span,
                    columnAlignment;
                function getAlignment(columnAlignment) {
                    return columnAlignment === 'right' ? 'left' : 'right'
                }
                rootElement.find('.' + DATAGRID_SORT_CLASS).remove();
                if (utils.isDefined(column.sortOrder)) {
                    if (column.alignment === 'center') {
                        var align = this.option('rtlEnabled') ? 'right' : 'left';
                        $('<span />').addClass(DATAGRID_SORT_CLASS).css('float', align).prependTo(rootElement)
                    }
                    columnAlignment = column.alignment || 'left';
                    $span = $('<span />').addClass(DATAGRID_SORT_CLASS).css('float', showColumnLines ? getAlignment(column.alignment) : columnAlignment).toggleClass(DATAGRID_SORTUP_CLASS, column.sortOrder === 'asc').toggleClass(DATAGRID_SORTDOWN_CLASS, column.sortOrder === 'desc');
                    if (this.option("showColumnLines"))
                        $span.prependTo(rootElement);
                    else
                        $span.addClass(DATAGRID_SORT_ALIGNMENT_CLASS + columnAlignment).appendTo(rootElement)
                }
            },
            _updateSortIndicatorPositions: function(rootElement) {
                if (!rootElement)
                    return;
                var sortIndicators = rootElement.find('.' + DATAGRID_SORT_CLASS);
                $.each(sortIndicators, function() {
                    var $sortIndicator = $(this),
                        $sortIndicatorContainer = $sortIndicator.parent(),
                        $textContent = $sortIndicatorContainer.find('.' + DATAGRID_CELL_CONTENT_CLASS);
                    $sortIndicator.height($textContent.height() || $sortIndicatorContainer.height())
                })
            },
            _createRow: function() {
                return $("<tr />").addClass(DATAGRID_ROW_CLASS)
            },
            _createTable: function() {
                return $('<table />').toggleClass(DATAGRID_TABLE_CLASS, !this.option('columnAutoWidth'))
            },
            init: function() {
                var that = this;
                that._columnsController = that.getController('columns')
            },
            getColumnWidths: function() {
                var that = this,
                    cells,
                    result = [],
                    width,
                    clientRect;
                if (that._tableElement) {
                    cells = that._tableElement.find('tr').filter(':not(.' + DATAGRID_GROUP_ROW_CLASS + ')').first().find('td');
                    $.each(cells, function(index, item) {
                        if (item.getBoundingClientRect) {
                            clientRect = item.getBoundingClientRect();
                            width = Math.floor(clientRect.right - clientRect.left)
                        }
                        else
                            width = $(item).outerWidth(true);
                        result.push(width)
                    })
                }
                return result
            },
            setColumnWidths: function(widths) {
                this._setColumnWidthsCore(this._tableElement, widths)
            },
            _setColumnWidthsCore: function(tableElements, widths) {
                var colgroupElement,
                    i,
                    columnIndex;
                if (!tableElements)
                    return;
                for (i = 0; i < tableElements.length; i++) {
                    tableElements.eq(i).addClass(DATAGRID_TABLE_CLASS);
                    if (widths) {
                        this._columnWidths = widths;
                        colgroupElement = tableElements.eq(i).find('colgroup').first();
                        colgroupElement.empty();
                        for (columnIndex = 0; columnIndex < widths.length; columnIndex++)
                            $('<col />').width(widths[columnIndex] || 'auto').appendTo(colgroupElement)
                    }
                }
            },
            resetColumnWidths: function() {
                var that = this,
                    tableElement,
                    visibleColumns = that._columnsController.getVisibleColumns(),
                    i,
                    widths = [],
                    $elementWithFocus,
                    elementWithFocus,
                    selectionStart,
                    selectionEnd;
                for (i = 0; i < visibleColumns.length; i++)
                    widths.push(visibleColumns[i].width);
                that.setColumnWidths(widths);
                if (that._tableElement) {
                    $elementWithFocus = that._tableElement.find(':focus');
                    elementWithFocus = $elementWithFocus.get(0);
                    if (elementWithFocus) {
                        selectionStart = elementWithFocus.selectionStart;
                        selectionEnd = elementWithFocus.selectionEnd
                    }
                    tableElement = that._createTable();
                    tableElement.append(that._tableElement.children());
                    tableElement.toggleClass(DATAGRID_TABLE_CONTENT_CLASS, that._tableElement.hasClass(DATAGRID_TABLE_CONTENT_CLASS));
                    tableElement.attr('style', that._tableElement.attr('style'));
                    that._tableElement.replaceWith(tableElement);
                    that._tableElement = tableElement;
                    if (elementWithFocus && elementWithFocus.setSelectionRange)
                        elementWithFocus.setSelectionRange(selectionStart, selectionEnd);
                    $elementWithFocus.focus()
                }
            },
            getColumnElements: function(){},
            getColumns: function(){},
            getCell: function(columnIndex, rowIndex) {
                var row;
                if (this._tableElement && this._tableElement.length === 1) {
                    row = this._tableElement[0].rows[rowIndex];
                    return row ? $(row.cells[columnIndex]) : null
                }
            },
            getRowsCount: function() {
                if (this._tableElement && this._tableElement.length === 1)
                    return this._tableElement[0].rows.length;
                return 0
            },
            getBoundingRect: function(){},
            getName: function(){}
        });
        $.extend(dataGrid.__internals, {
            DATAGRID_SORT_CLASS: DATAGRID_SORT_CLASS,
            DATAGRID_SORTUP_CLASS: DATAGRID_SORTUP_CLASS,
            DATAGRID_SORTDOWN_CLASS: DATAGRID_SORTDOWN_CLASS,
            DATAGRID_SORT_ALIGNMENT_CLASS: DATAGRID_SORT_ALIGNMENT_CLASS,
            DATAGRID_CELL_CONTENT_CLASS: DATAGRID_CELL_CONTENT_CLASS,
            DATAGRID_ROW_CLASS: DATAGRID_ROW_CLASS,
            DATAGRID_GROUP_ROW_CLASS: DATAGRID_GROUP_ROW_CLASS,
            DATAGRID_TABLE_CLASS: DATAGRID_TABLE_CLASS
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.columnHeadersView.js */
    (function($, DX) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var DATAGRID_CELL_CONTENT_CLASS = "dx-datagrid-text-content",
            DATAGRID_HEADERS_ACTION_CLASS = "dx-datagrid-action-cursor",
            DATAGRID_HEADERS_CONTAINER_CLASS = "dx-datagrid-headers-container",
            DATAGRID_HEADERS_CLASS = "dx-datagrid-headers",
            DATAGRID_HEADER_ROW_CLASS = "dx-header-row",
            DATAGRID_NOWRAP_CLASS = "dx-datagrid-nowrap",
            DATAGRID_GROUP_SPACE_CLASS = "dx-datagrid-group-space",
            DATAGRID_CONTENT_CLASS = "dx-datagrid-content",
            DATAGRID_COLUMN_LINES_CLASS = "dx-column-lines",
            DATAGRID_CONTEXT_MENU_SORT_ASC_ICON = "context-menu-sort-asc",
            DATAGRID_CONTEXT_MENU_SORT_DESC_ICON = "context-menu-sort-desc",
            DATAGRID_CONTEXT_MENU_SORT_NONE_ICON = "context-menu-sort-none",
            DATAGRID_SORT_CLASS = "dx-sort",
            COLUMN_HEADERS_VIEW_NAMESPACE = 'dxDataGridColumnHeadersView';
        dataGrid.ColumnHeadersView = dataGrid.ColumnsView.inherit({
            _renderHeaderContent: function($cell, column, columnIndex) {
                var that = this,
                    $group = $('<div />'),
                    headerCellTemplate = column.headerCellTemplate;
                if (column.command === "empty" || column.command === "edit")
                    $cell.html('&nbsp;');
                else if (!utils.isDefined(column.groupIndex)) {
                    that._applySorting($cell, column, that.option('showColumnLines'));
                    var $content = $('<div />').addClass(DATAGRID_CELL_CONTENT_CLASS);
                    if (that.option("showColumnLines"))
                        $content.appendTo($cell);
                    else
                        $content.css("float", column.alignment || 'left').prependTo($cell);
                    var templateOptions = {
                            column: column,
                            columnIndex: columnIndex
                        };
                    if ($.isFunction(headerCellTemplate))
                        headerCellTemplate($content, templateOptions);
                    else if (utils.isString(headerCellTemplate)) {
                        headerCellTemplate = that.getTemplate(headerCellTemplate);
                        if (headerCellTemplate)
                            headerCellTemplate.render($content, templateOptions)
                    }
                    else
                        $content.text(column.caption)
                }
                else
                    $cell.addClass(DATAGRID_GROUP_SPACE_CLASS)
            },
            _renderHeader: function(rootElement, column, columnIndex) {
                var that = this,
                    sorting = that.option('sorting'),
                    sortingMode = sorting && sorting.mode,
                    cellElement;
                cellElement = $('<td />').css('text-align', column.alignment || 'left').toggleClass(column.cssClass, !utils.isDefined(column.groupIndex));
                that._renderHeaderContent(cellElement, column, columnIndex);
                if (((sortingMode === 'single' || sortingMode === 'multiple') && column.allowSorting || column.allowReordering || column.allowHiding) && !utils.isDefined(column.groupIndex))
                    cellElement.addClass(DATAGRID_HEADERS_ACTION_CLASS);
                cellElement.appendTo(rootElement)
            },
            _renderCore: function() {
                var that = this,
                    $container = that._element(),
                    columns = that._columnsController.getVisibleColumns(),
                    scrollLeft = that._scrollLeft,
                    columnsLength = columns.length,
                    i,
                    $row;
                that._tableElement = that._createTable().attr('style', '-webkit-user-select: none').append(dataGrid.createColGroup(columns));
                if (that.option('showColumnHeaders')) {
                    $row = that._createRow().addClass(DATAGRID_HEADER_ROW_CLASS).toggleClass(DATAGRID_COLUMN_LINES_CLASS, that.option('showColumnLines'));
                    $row.on(events.addNamespace("dxclick", COLUMN_HEADERS_VIEW_NAMESPACE), 'td', that.createAction(function(e) {
                        var keyName = null,
                            event = e.jQueryEvent;
                        event.stopPropagation();
                        setTimeout(function() {
                            var column = columns[event.currentTarget.cellIndex];
                            if (event.shiftKey)
                                keyName = "shift";
                            else if (event.ctrlKey)
                                keyName = "ctrl";
                            if (column && !utils.isDefined(column.groupIndex))
                                that._columnsController.changeSortOrder(column.index, keyName)
                        })
                    }));
                    for (i = 0; i < columnsLength; i++)
                        that._renderHeader($row, columns[i], i);
                    that._tableElement.append($row)
                }
                $container.addClass(DATAGRID_HEADERS_CLASS).addClass(DATAGRID_CONTENT_CLASS).toggleClass(DATAGRID_NOWRAP_CLASS, !!that.option("columnAutoWidth") || !that.option("wordWrapEnabled")).empty();
                $('<div/>').addClass(DATAGRID_HEADERS_CONTAINER_CLASS).append(that._tableElement).appendTo($container);
                that._scrollLeft = 0;
                that.scrollOffset(scrollLeft)
            },
            setColumnWidths: function(widths) {
                var that = this,
                    scrollLeft = that._scrollLeft;
                that.callBase(widths);
                that._scrollLeft = 0;
                that.scrollOffset(scrollLeft)
            },
            _afterRender: function($root) {
                var that = this;
                if (!$root)
                    that.setColumnWidths(that._columnWidths && that._columnWidths.length === that._columnsController.getVisibleColumns().length ? that._columnWidths : null);
                that._updateSortIndicatorPositions(that._element());
                that.processSizeChanged()
            },
            _updateSortIndicatorPositions: function(element) {
                var that = this,
                    columns = that.getColumnElements();
                that.callBase(element);
                if (!that.option('showColumnLines') && columns) {
                    var i;
                    for (i = 0; i < columns.length; i++) {
                        var $cell = $(columns[i]);
                        that._setColumnTextWidth($cell, $cell.outerWidth())
                    }
                }
            },
            _updateSortIndicators: function() {
                var that = this,
                    columns = that._columnsController.getVisibleColumns(),
                    $element = that._element(),
                    $cells = $element.find('.' + DATAGRID_HEADER_ROW_CLASS + ' > td'),
                    i;
                for (i = 0; i < columns.length; i++)
                    if (!utils.isDefined(columns[i].groupIndex))
                        that._applySorting($cells.eq(i), columns[i], that.option('showColumnLines'));
                that._updateSortIndicatorPositions($element)
            },
            _processColumnsChanged: function(e) {
                var visibleColumnIndex;
                if (dataGrid.checkChanges(e.changeTypes, ['sorting'])) {
                    this._updateSortIndicators();
                    return
                }
                if (dataGrid.checkChanges(e.optionNames, ['width'])) {
                    visibleColumnIndex = this._columnsController.getVisibleIndex(e.columnIndex);
                    if (visibleColumnIndex !== -1) {
                        this._tableElement.find('col').eq(visibleColumnIndex).css('width', e.column.width);
                        this._updateSortIndicatorPositions(this._element());
                        if (!this.option('showColumnLines'))
                            this._setColumnTextWidth($(this._tableElement.find('.' + DATAGRID_HEADER_ROW_CLASS + ' td')[visibleColumnIndex]), e.column.width)
                    }
                    if (this._columnWidths)
                        this._columnWidths[visibleColumnIndex] = e.column.width;
                    return
                }
                this.render()
            },
            _setColumnTextWidth: function($column, columnWidth) {
                var $sortElement = $column.find("." + DATAGRID_SORT_CLASS),
                    indicatorOuterWidth = $sortElement.outerWidth(),
                    columnPaddings = $column.outerWidth() - $column.width(),
                    columnContentIndent = indicatorOuterWidth + columnPaddings;
                $column.find("." + DATAGRID_CELL_CONTENT_CLASS).css("max-width", columnWidth - columnContentIndent)
            },
            _isElementVisible: function(elementOptions) {
                return elementOptions && elementOptions.visible
            },
            processSizeChanged: function() {
                var that = this,
                    $element = that._element();
                if (!utils.isDefined(that._headersHeight) || that._headersHeight !== $element.height()) {
                    that._headersHeight = $element.height();
                    that.sizeChanged.fire()
                }
            },
            getHeaderElement: function(index) {
                var columnElements = this.getColumnElements();
                return columnElements && columnElements.eq(index)
            },
            getColumnElements: function() {
                var that = this,
                    columnElements;
                if (that._tableElement) {
                    columnElements = that._tableElement.find('.' + DATAGRID_HEADER_ROW_CLASS).find('td');
                    if (columnElements.length)
                        return columnElements
                }
                return null
            },
            allowDragging: function(column, draggingPanels) {
                var i,
                    result = false,
                    columns = this.getColumns(),
                    draggableColumnCount = 0,
                    allowDrag = function(column) {
                        return column.allowReordering || column.allowGrouping || column.allowHiding
                    };
                for (i = 0; i < columns.length; i++)
                    if (allowDrag(columns[i]))
                        draggableColumnCount++;
                if (draggableColumnCount <= 1)
                    return false;
                else if (!draggingPanels)
                    return (this.option("allowColumnReordering") || this._columnsController.isColumnOptionUsed("allowReordering")) && column && column.allowReordering;
                for (i = 0; i < draggingPanels.length; i++)
                    if (draggingPanels[i].allowDragging(column))
                        return true;
                return false
            },
            getColumns: function() {
                return this._columnsController.getVisibleColumns()
            },
            getBoundingRect: function() {
                var that = this,
                    offset;
                if (that._tableElement.length > 0 && that._tableElement[0].rows.length > 0 && that._tableElement[0].rows[0].cells.length > 0) {
                    offset = that._tableElement.offset();
                    return {top: offset.top}
                }
                return null
            },
            getName: function() {
                return 'headers'
            },
            getHeadersLength: function() {
                var that = this;
                if (that._tableElement.length > 0 && that._tableElement[0].rows.length > 0)
                    return that._tableElement[0].rows[0].cells.length;
                return 0
            },
            tableElement: function() {
                return this._tableElement
            },
            init: function() {
                var that = this,
                    dataController = that.getController('data');
                that.callBase();
                that._columnsController.columnsChanged.add(function(e) {
                    var dataControllerChangedHandler = function() {
                            dataController.changed.remove(dataControllerChangedHandler);
                            that._processColumnsChanged(e)
                        };
                    if (e.changeTypes.grouping)
                        dataController.changed.add(dataControllerChangedHandler);
                    else
                        that._processColumnsChanged(e)
                });
                that._scrollerWidth = 0;
                that.sizeChanged = $.Callbacks()
            },
            isVisible: function() {
                return this.option('showColumnHeaders')
            },
            scrollOffset: function(pos) {
                var that = this,
                    $element = that._element(),
                    $scrollContainer = $element && $element.find('.' + DATAGRID_HEADERS_CONTAINER_CLASS);
                if (pos === undefined)
                    return $scrollContainer && $scrollContainer.scrollLeft();
                else if (that._scrollLeft !== pos) {
                    that._scrollLeft = pos;
                    $scrollContainer && $scrollContainer.scrollLeft(pos)
                }
            },
            setScrollerSpacing: function(width) {
                var that = this,
                    $element = that._element(),
                    rtlEnabled = that.option("rtlEnabled");
                that._scrollerWidth = width;
                $element && $element.css(rtlEnabled ? {paddingLeft: width} : {paddingRight: width})
            },
            optionChanged: function(name, value, prevValue) {
                var that = this;
                switch (name) {
                    case'showColumnHeaders':
                    case'wordWrapEnabled':
                    case'showColumnLines':
                        that.render();
                        break
                }
            },
            resize: function() {
                this.callBase();
                this._updateSortIndicatorPositions(this._element())
            },
            getHeight: function() {
                var that = this,
                    $element = that._element();
                return $element ? $element.height() : 0
            },
            getContextMenuItems: function($targetElement) {
                var that = this,
                    $cell,
                    column,
                    itemClickAction,
                    sortingOptions;
                if ($targetElement.closest("." + DATAGRID_HEADER_ROW_CLASS).length) {
                    $cell = $targetElement.closest("td");
                    column = $cell.length && that.getColumns()[$cell[0].cellIndex];
                    sortingOptions = that.option("sorting");
                    if (sortingOptions && sortingOptions.mode !== "none" && column && column.allowSorting) {
                        itemClickAction = function(params) {
                            setTimeout(function() {
                                that._columnsController.changeSortOrder(column.index, params.itemData.value)
                            })
                        };
                        return [{
                                    text: sortingOptions.ascendingText,
                                    value: "asc",
                                    icon: DATAGRID_CONTEXT_MENU_SORT_ASC_ICON,
                                    itemClickAction: itemClickAction
                                }, {
                                    text: sortingOptions.descendingText,
                                    value: "desc",
                                    icon: DATAGRID_CONTEXT_MENU_SORT_DESC_ICON,
                                    itemClickAction: itemClickAction
                                }, {
                                    text: sortingOptions.clearText,
                                    value: "none",
                                    icon: DATAGRID_CONTEXT_MENU_SORT_NONE_ICON,
                                    itemClickAction: itemClickAction
                                }]
                    }
                }
                return []
            }
        });
        $.extend(dataGrid.__internals, {
            DATAGRID_CELL_CONTENT_CLASS: DATAGRID_CELL_CONTENT_CLASS,
            DATAGRID_HEADERS_ACTION_CLASS: DATAGRID_HEADERS_ACTION_CLASS,
            DATAGRID_HEADERS_CONTAINER_CLASS: DATAGRID_HEADERS_CONTAINER_CLASS,
            DATAGRID_HEADERS_CLASS: DATAGRID_HEADERS_CLASS,
            DATAGRID_HEADER_ROW_CLASS: DATAGRID_HEADER_ROW_CLASS,
            DATAGRID_NOWRAP_CLASS: DATAGRID_NOWRAP_CLASS
        });
        dataGrid.registerModule('columnHeaders', {
            defaultOptions: function() {
                return {showColumnHeaders: true}
            },
            views: {columnHeadersView: dataGrid.ColumnHeadersView}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.filterRow.js */
    (function($, DX) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var OPERATION_ICONS = {
                '=': 'filter-operation-equals',
                '<>': 'filter-operation-not-equals',
                '<': 'filter-operation-less',
                '<=': 'filter-operation-less-equal',
                '>': 'filter-operation-greater',
                '>=': 'filter-operation-greater-equal',
                'default': 'filter-operation-default',
                notcontains: 'filter-operation-not-contains',
                contains: 'filter-operation-contains',
                startswith: 'filter-operation-starts-with',
                endswith: 'filter-operation-ends-with'
            };
        var DATAGRID_FILTER_ROW_CLASS = "dx-datagrid-filter-row",
            DATAGRID_MENU_CLASS = "dx-menu",
            DATAGRID_MENU_IMAGE_CLASS = 'dx-menu-image',
            DATAGRID_CELL_CONTENT_CLASS = "dx-datagrid-text-content",
            DATAGRID_GROUP_SPACE_CLASS = "dx-datagrid-group-space",
            DATAGRID_EDITOR_WITH_MENU_CLASS = "dx-editor-with-menu",
            DATAGRID_EDITOR_CONTAINER_CLASS = "dx-editor-container",
            DATAGRID_COLUMN_LINES_CLASS = "dx-column-lines",
            DATAGRID_EDITOR_CELL_CLASS = "dx-editor-cell";
        var ColumnHeadersViewFilterRowExtender = {
                _processColumnsChanged: function(e) {
                    var that = this,
                        visibleIndex,
                        textBox,
                        column,
                        $menu;
                    if (dataGrid.checkChanges(e.optionNames, ['filterValue']))
                        return;
                    if (dataGrid.checkChanges(e.optionNames, ['selectedFilterOperation'])) {
                        visibleIndex = that.getController('columns').getVisibleIndex(e.columnIndex);
                        column = e.column;
                        if (visibleIndex >= 0) {
                            $menu = that._element().find('.' + DATAGRID_FILTER_ROW_CLASS).children().eq(visibleIndex).find('.' + DATAGRID_MENU_CLASS);
                            if ($menu.length) {
                                that._updateFilterOperationChooser($menu, column);
                                textBox = $menu.prev().children().data('dxTextBox');
                                if (textBox)
                                    textBox.option('value', column.filterValue)
                            }
                        }
                    }
                    else
                        that.callBase(e)
                },
                isFilterRowVisible: function() {
                    return this._isElementVisible(this.option('filterRow'))
                },
                isVisible: function() {
                    return this.callBase() || this.isFilterRowVisible()
                },
                _renderCore: function() {
                    this.callBase();
                    var that = this,
                        columns = that._columnsController.getVisibleColumns(),
                        i,
                        rowElement;
                    if (that.isFilterRowVisible()) {
                        rowElement = that._createRow().appendTo(that._tableElement);
                        rowElement.addClass(DATAGRID_FILTER_ROW_CLASS).toggleClass(DATAGRID_COLUMN_LINES_CLASS, that.option('showColumnLines'));
                        for (i = 0; i < columns.length; i++)
                            that._renderFilterRowCell(rowElement, columns[i])
                    }
                },
                _updateFilterOperationChooser: function($menu, column) {
                    var that = this;
                    $menu.dxMenu({
                        highlightActiveItem: true,
                        cssClass: 'dx-datagrid dx-widget',
                        showFirstSubmenuMode: 'onhover',
                        items: [{
                                disabled: column.filterOperations && column.filterOperations.length ? false : true,
                                icon: OPERATION_ICONS[column.selectedFilterOperation || "default"],
                                items: that._getFilterOperationMenuItems(column)
                            }],
                        itemClickAction: function(properties) {
                            var selectedFilterOperation = properties.itemData.name;
                            if (properties.itemData.items)
                                return;
                            if (selectedFilterOperation)
                                that._columnsController.columnOption(column.initialIndex, 'selectedFilterOperation', selectedFilterOperation);
                            else
                                that._columnsController.columnOption(column.initialIndex, {
                                    selectedFilterOperation: null,
                                    filterValue: null
                                })
                        },
                        rtlEnabled: that.option('rtlEnabled')
                    })
                },
                _renderFilterOperationChooser: function($container, column) {
                    var that = this,
                        $menu;
                    if (that.option("filterRow.showOperationChooser")) {
                        $container.addClass(DATAGRID_EDITOR_WITH_MENU_CLASS);
                        $menu = $('<div />').appendTo($container);
                        that._updateFilterOperationChooser($menu, column)
                    }
                },
                _getFilterOperationMenuItems: function(column) {
                    var that = this,
                        result = [{}],
                        filterRowOptions = that.option("filterRow"),
                        operationDescriptions = filterRowOptions && filterRowOptions.operationDescriptions || {};
                    if (column.filterOperations && column.filterOperations.length) {
                        result = $.map(column.filterOperations, function(value) {
                            return {
                                    name: value,
                                    selectable: true,
                                    selected: (column.selectedFilterOperation || column.defaultFilterOperation) === value,
                                    text: operationDescriptions[value],
                                    icon: OPERATION_ICONS[value]
                                }
                        });
                        result.push({
                            name: null,
                            text: filterRowOptions && filterRowOptions.resetOperationText,
                            allowSelectOnclick: false,
                            icon: OPERATION_ICONS['default']
                        })
                    }
                    return result
                },
                _renderFilterRowCell: function(rootElement, column) {
                    var that = this,
                        $cell = $('<td />').toggleClass(column.cssClass, !utils.isDefined(column.groupIndex)).appendTo(rootElement),
                        columnsController = that._columnsController,
                        $container,
                        $editorContainer,
                        $editor;
                    var updateFilterValue = function(that, column, value) {
                            var filterOptions,
                                filterText = value;
                            if (value === '')
                                value = undefined;
                            if (!utils.isDefined(column.filterValue) && !utils.isDefined(value))
                                return;
                            column.filterValue = value;
                            columnsController.columnOption(column.initialIndex, 'filterValue', value)
                        };
                    if (column.command === 'empty')
                        $cell.html('&nbsp;');
                    else if (utils.isDefined(column.groupIndex))
                        $cell.addClass(DATAGRID_GROUP_SPACE_CLASS);
                    else if (column.allowFiltering) {
                        $cell.addClass(DATAGRID_EDITOR_CELL_CLASS);
                        $container = $('<div />').appendTo($cell),
                        $editorContainer = $('<div />').addClass(DATAGRID_EDITOR_CONTAINER_CLASS).appendTo($container),
                        $editor = $('<div />').appendTo($editorContainer);
                        that.getController('editorFactory').createEditor($editor, $.extend({}, column, {
                            value: columnsController.isDataSourceApplied() ? column.filterValue : undefined,
                            setValue: function(value) {
                                updateFilterValue(that, column, value)
                            },
                            parentType: "filterRow",
                            showAllText: that.option('filterRow.showAllText'),
                            width: null
                        }));
                        if (column.alignment)
                            $cell.find('input').first().css('text-align', column.alignment);
                        if (column.filterOperations && column.filterOperations.length)
                            that._renderFilterOperationChooser($container, column)
                    }
                },
                optionChanged: function(name, value, prevValue) {
                    var that = this;
                    switch (name) {
                        case'filterRow':
                        case'showColumnLines':
                        case'disabled':
                            that.render();
                            break;
                        default:
                            that.callBase(name);
                            break
                    }
                }
            };
        var DataControllerFilterRowExtender = {_calculateAdditionalFilter: function() {
                    var that = this,
                        filter = that.callBase(),
                        i,
                        filters = [],
                        resultFilter = [],
                        columns = that._columnsController.getVisibleColumns();
                    $.each(columns, function() {
                        var filterOptions,
                            filter;
                        if (this.allowFiltering && this.calculateFilterExpression && utils.isDefined(this.filterValue)) {
                            filter = this.calculateFilterExpression(this.filterValue, this.selectedFilterOperation || this.defaultFilterOperation);
                            if (filter)
                                filters.push(filter)
                        }
                    });
                    if (filters.length) {
                        if (filter && filter.length)
                            filters.unshift(filter);
                        for (i = 0; i < filters.length; i++) {
                            if (i > 0)
                                resultFilter.push('and');
                            resultFilter.push(filters[i])
                        }
                    }
                    else
                        resultFilter = filter;
                    return resultFilter && resultFilter.length ? resultFilter : null
                }};
        var ColumnsControllerFilterRowExtender = {_createCalculatedColumnOptions: function(columnOptions) {
                    var calculatedColumnOptions = this.callBase(columnOptions);
                    if (columnOptions.dataField)
                        $.extend(calculatedColumnOptions, {
                            calculateFilterExpression: function(value, selectedFilterOperation) {
                                var column = this,
                                    dataField = column.dataField,
                                    filter = null;
                                if (utils.isDefined(value))
                                    if (column.dataType === 'string' && !column.lookup)
                                        filter = [dataField, selectedFilterOperation || 'contains', value];
                                    else if (column.dataType === 'date') {
                                        if (utils.isDate(value)) {
                                            var dateStart = new Date(value.getFullYear(), value.getMonth(), value.getDate()),
                                                dateEnd = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
                                            switch (selectedFilterOperation) {
                                                case'<':
                                                    return [dataField, '<', dateStart];
                                                case'<=':
                                                    return [dataField, '<', dateEnd];
                                                case'>':
                                                    return [dataField, '>=', dateEnd];
                                                case'>=':
                                                    return [dataField, '>=', dateStart];
                                                case'<>':
                                                    return [[dataField, '<', dateStart], 'or', [dataField, '>=', dateEnd]];
                                                default:
                                                    return [[dataField, '>=', dateStart], 'and', [dataField, '<', dateEnd]]
                                            }
                                        }
                                    }
                                    else
                                        filter = [dataField, selectedFilterOperation || '=', value];
                                return filter
                            },
                            allowFiltering: true
                        });
                    else
                        $.extend(calculatedColumnOptions, {allowFiltering: !!columnOptions.calculateFilterExpression});
                    return calculatedColumnOptions
                }};
        dataGrid.registerModule('filterRow', {
            defaultOptions: function() {
                return {filterRow: {
                            visible: false,
                            showOperationChooser: true,
                            showAllText: Globalize.localize("dxDataGrid-filterRowShowAllText"),
                            resetOperationText: Globalize.localize("dxDataGrid-filterRowResetOperationText"),
                            operationDescriptions: {
                                '=': Globalize.localize("dxDataGrid-filterRowOperationEquals"),
                                '<>': Globalize.localize("dxDataGrid-filterRowOperationNotEquals"),
                                '<': Globalize.localize("dxDataGrid-filterRowOperationLess"),
                                '<=': Globalize.localize("dxDataGrid-filterRowOperationLessOrEquals"),
                                '>': Globalize.localize("dxDataGrid-filterRowOperationGreater"),
                                '>=': Globalize.localize("dxDataGrid-filterRowOperationGreaterOrEquals"),
                                startswith: Globalize.localize("dxDataGrid-filterRowOperationStartsWith"),
                                contains: Globalize.localize("dxDataGrid-filterRowOperationContains"),
                                notcontains: Globalize.localize("dxDataGrid-filterRowOperationNotContains"),
                                endswith: Globalize.localize("dxDataGrid-filterRowOperationEndsWith")
                            }
                        }}
            },
            extenders: {
                controllers: {
                    data: DataControllerFilterRowExtender,
                    columns: ColumnsControllerFilterRowExtender
                },
                views: {columnHeadersView: ColumnHeadersViewFilterRowExtender}
            }
        });
        $.extend(dataGrid.__internals, {
            DATAGRID_FILTER_ROW_CLASS: DATAGRID_FILTER_ROW_CLASS,
            DATAGRID_MENU_CLASS: DATAGRID_MENU_CLASS,
            DATAGRID_MENU_IMAGE_CLASS: DATAGRID_MENU_IMAGE_CLASS,
            DATAGRID_CELL_CONTENT_CLASS: DATAGRID_CELL_CONTENT_CLASS,
            DATAGRID_EDITOR_WITH_MENU_CLASS: DATAGRID_EDITOR_WITH_MENU_CLASS,
            DATAGRID_EDITOR_CONTAINER_CLASS: DATAGRID_EDITOR_CONTAINER_CLASS
        });
        dataGrid.ColumnHeadersViewFilterRowExtender = ColumnHeadersViewFilterRowExtender;
        dataGrid.DataControllerFilterRowExtender = DataControllerFilterRowExtender
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.headerPanel.js */
    (function($, DX) {
        var ui = DX.ui,
            events = ui.events,
            dataGrid = ui.dataGrid;
        var DATAGRID_HEADER_PANEL_CLASS = "dx-datagrid-header-panel",
            DATAGRID_GROUP_PANEL_CLASS = "dx-datagrid-group-panel",
            DATAGRID_GROUP_PANEL_MESSAGE_CLASS = "dx-group-panel-message",
            DATAGRID_GROUP_PANEL_ITEM_CLASS = "dx-group-panel-item",
            DATAGRID_HEADERS_ACTION_CLASS = "dx-datagrid-action-cursor";
        dataGrid.HeaderPanel = dataGrid.ColumnsView.inherit({
            _renderGroupPanel: function() {
                var that = this,
                    $element = that._element(),
                    groupPanelOptions = that.option("groupPanel"),
                    $groupPanel,
                    groupColumns = that.getController('columns').getGroupColumns();
                $groupPanel = $element.find('.' + DATAGRID_GROUP_PANEL_CLASS);
                if (groupPanelOptions && groupPanelOptions.visible) {
                    if (!$groupPanel.length)
                        $groupPanel = $('<div />').addClass(DATAGRID_GROUP_PANEL_CLASS).prependTo($element);
                    else
                        $groupPanel.show();
                    that._renderGroupPanelItems($groupPanel, groupColumns);
                    if (groupPanelOptions.allowColumnDragging && !groupColumns.length)
                        $('<div />').addClass(DATAGRID_GROUP_PANEL_MESSAGE_CLASS).text(groupPanelOptions.emptyPanelText).appendTo($groupPanel)
                }
                else
                    $groupPanel.hide()
            },
            _renderGroupPanelItems: function($groupPanel, groupColumns) {
                var that = this,
                    $item;
                $groupPanel.empty();
                $.each(groupColumns, function(index, groupColumn) {
                    $item = $('<div />').addClass(groupColumn.cssClass).addClass(DATAGRID_GROUP_PANEL_ITEM_CLASS).toggleClass(DATAGRID_HEADERS_ACTION_CLASS, groupColumn.allowSorting || groupColumn.allowReordering).appendTo($groupPanel).text(groupColumn.caption).on(events.addNamespace("dxclick", "dxDataGridHeaderPanel"), that.createAction(function(e) {
                        setTimeout(function() {
                            that.getController('columns').changeSortOrder(groupColumn.index)
                        })
                    }));
                    that._applySorting($item, {
                        alignment: 'left',
                        sortOrder: groupColumn.sortOrder === 'desc' ? 'desc' : 'asc'
                    }, true)
                });
                that._updateSortIndicatorPositions($groupPanel)
            },
            _renderCore: function() {
                var that = this;
                that._element().addClass(DATAGRID_HEADER_PANEL_CLASS);
                that._renderGroupPanel()
            },
            getHeaderPanel: function() {
                return this._element()
            },
            allowDragging: function(column) {
                var groupPanelOptions = this.option("groupPanel");
                return groupPanelOptions && groupPanelOptions.visible && groupPanelOptions.allowColumnDragging && column && column.allowGrouping
            },
            getColumnElements: function() {
                var $element = this._element();
                return $element && $element.find('.' + DATAGRID_GROUP_PANEL_ITEM_CLASS)
            },
            getColumns: function() {
                return this.getController('columns').getGroupColumns()
            },
            getBoundingRect: function() {
                var that = this,
                    $element = that._element(),
                    offset;
                if ($element && $element.find('.' + DATAGRID_GROUP_PANEL_CLASS).length) {
                    offset = $element.offset();
                    return {
                            top: offset.top,
                            bottom: offset.top + $element.height()
                        }
                }
                return null
            },
            getName: function() {
                return 'group'
            },
            init: function() {
                var that = this;
                that.callBase();
                that.getController('columns').columnsChanged.add(function(e) {
                    if (!dataGrid.checkChanges(e.optionNames, ['width']))
                        that.render()
                })
            },
            isVisible: function() {
                var groupPanelOptions = this.option('groupPanel');
                return groupPanelOptions && groupPanelOptions.visible
            },
            getHeight: function() {
                var $element = this._element();
                return $element ? $element.outerHeight(true) : 0
            },
            optionChanged: function(name, value, prevValue) {
                var that = this;
                switch (name) {
                    case'searchPanel':
                        that._renderSearchPanel();
                        break;
                    case'groupPanel':
                        that._renderGroupPanel();
                        break;
                    case'disabled':
                        that.render();
                        break
                }
            },
            resize: function() {
                var that = this,
                    $element = that._element(),
                    $groupPanel = $element && $element.find('.' + DATAGRID_GROUP_PANEL_CLASS),
                    groupPanelOptions = that.option('groupPanel');
                that.callBase();
                that._updateSortIndicatorPositions($groupPanel)
            }
        });
        $.extend(dataGrid.__internals, {
            DATAGRID_HEADER_PANEL_CLASS: DATAGRID_HEADER_PANEL_CLASS,
            DATAGRID_GROUP_PANEL_CLASS: DATAGRID_GROUP_PANEL_CLASS,
            DATAGRID_GROUP_PANEL_MESSAGE_CLASS: DATAGRID_GROUP_PANEL_MESSAGE_CLASS,
            DATAGRID_GROUP_PANEL_ITEM_CLASS: DATAGRID_GROUP_PANEL_ITEM_CLASS,
            DATAGRID_HEADERS_ACTION_CLASS: DATAGRID_HEADERS_ACTION_CLASS
        });
        dataGrid.registerModule('headerPanel', {
            defaultOptions: function() {
                return {groupPanel: {
                            visible: false,
                            emptyPanelText: Globalize.localize("dxDataGrid-groupPanelEmptyText"),
                            allowColumnDragging: true
                        }}
            },
            views: {headerPanel: dataGrid.HeaderPanel}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.search.js */
    (function($, DX) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var DATAGRID_SEARCH_PANEL_CLASS = "dx-datagrid-search-panel",
            MARGIN_RIGHT = 10;
        dataGrid.registerModule('search', {
            defaultOptions: function() {
                return {searchPanel: {
                            visible: false,
                            width: 160,
                            placeholder: Globalize.localize("dxDataGrid-searchPanelPlaceholder"),
                            highlightSearchText: true
                        }}
            },
            extenders: {
                controllers: {data: function() {
                        var calculateSearchFilter = function(that, text) {
                                var i,
                                    column,
                                    columns = that._columnsController.getColumns(),
                                    filter,
                                    filterValue,
                                    lookup,
                                    searchFilter = [];
                                if (!text)
                                    return null;
                                for (i = 0; i < columns.length; i++) {
                                    filter = null;
                                    column = columns[i];
                                    if (column.allowFiltering && column.calculateFilterExpression) {
                                        lookup = column.lookup;
                                        if (lookup && lookup.items) {
                                            filterValue = column.parseValue.call(lookup, text);
                                            DX.data.query(lookup.items).filter(column.calculateFilterExpression.call({
                                                dataField: lookup.displayExpr,
                                                dataType: lookup.dataType
                                            }, filterValue)).enumerate().done(function(items) {
                                                var i,
                                                    valueGetter = DX.data.utils.compileGetter(lookup.valueExpr),
                                                    value;
                                                for (i = 0; i < items.length; i++) {
                                                    if (searchFilter.length > 0)
                                                        searchFilter.push('or');
                                                    value = valueGetter(items[i]);
                                                    searchFilter.push(column.calculateFilterExpression(value))
                                                }
                                            })
                                        }
                                        else {
                                            filterValue = column.parseValue ? column.parseValue(text) : text;
                                            if (filterValue !== undefined) {
                                                filter = column.calculateFilterExpression(filterValue);
                                                if (filter) {
                                                    if (searchFilter.length > 0)
                                                        searchFilter.push('or');
                                                    searchFilter.push(filter)
                                                }
                                            }
                                        }
                                    }
                                }
                                return searchFilter
                            };
                        return {
                                publicMethods: function() {
                                    return this.callBase().concat(['searchByText'])
                                },
                                _calculateAdditionalFilter: function() {
                                    var that = this,
                                        filter = that.callBase(),
                                        searchFilter = calculateSearchFilter(that, that._searchText);
                                    if (searchFilter)
                                        if (filter)
                                            filter = [filter, 'and', searchFilter];
                                        else
                                            filter = searchFilter;
                                    return filter
                                },
                                searchByText: function(text) {
                                    var that = this;
                                    if (that._searchText !== text) {
                                        that._searchText = text;
                                        that._applyFilter()
                                    }
                                },
                                getSearchText: function() {
                                    return this._searchText || ''
                                }
                            }
                    }()},
                views: {headerPanel: function() {
                        var getSearchPanelOptions = function(that) {
                                return that.option('searchPanel')
                            };
                        return {
                                _renderSearchPanel: function() {
                                    var that = this,
                                        $element = that._element(),
                                        dataController = that.getController('data'),
                                        searchPanelOptions = getSearchPanelOptions(that);
                                    if (searchPanelOptions && searchPanelOptions.visible) {
                                        if (!that._$searchPanel)
                                            that._$searchPanel = $('<div/>').addClass(DATAGRID_SEARCH_PANEL_CLASS).prependTo($element);
                                        else
                                            that._$searchPanel.show();
                                        that.getController('editorFactory').createEditor(that._$searchPanel, {
                                            width: searchPanelOptions.width,
                                            placeholder: searchPanelOptions.placeholder,
                                            parentType: "searchPanel",
                                            value: dataController.getSearchText(),
                                            setValue: function(value) {
                                                dataController.searchByText(value)
                                            }
                                        });
                                        that.resize()
                                    }
                                    else
                                        that._$searchPanel && that._$searchPanel.hide()
                                },
                                _renderCore: function() {
                                    this.callBase();
                                    this._renderSearchPanel()
                                },
                                focus: function() {
                                    var textBox = this._$searchPanel.dxTextBox("instance");
                                    if (textBox)
                                        textBox.focus()
                                },
                                isVisible: function() {
                                    var searchPanelOptions = getSearchPanelOptions(this);
                                    return this.callBase() || searchPanelOptions && searchPanelOptions.visible
                                }
                            }
                    }()}
            }
        });
        dataGrid.__internals = $.extend({}, dataGrid.__internals, {DATAGRID_SEARCH_PANEL_CLASS: DATAGRID_SEARCH_PANEL_CLASS})
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.rowsView.js */
    (function($, DX) {
        var ui = DX.ui,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var DATAGRID_CELL_CONTENT_CLASS = "dx-datagrid-text-content",
            DATAGRID_GROUP_ROW_CLASS = "dx-group-row",
            DATAGRID_SEARCH_TEXT_CLASS = "dx-datagrid-search-text",
            DATAGRID_ROWS_VIEW_CLASS = "dx-datagrid-rowsview",
            DATAGRID_TABLE_CONTENT_CLASS = "dx-datagrid-table-content",
            DATAGRID_TABLE_CLASS = "dx-datagrid-table",
            DATAGRID_ROW_CLASS = "dx-row",
            DATAGRID_DATA_ROW_CLASS = "dx-data-row",
            DATAGRID_FREESPACE_CLASS = "dx-freespace-row",
            DATAGRID_BOTTOM_LOAD_PANEL_CLASS = "dx-datagrid-bottom-load-panel",
            DATAGRID_NODATA_TEXT_CLASS = "dx-datagrid-nodata",
            DATAGRID_GROUP_SPACE_CLASS = "dx-datagrid-group-space",
            DATAGRID_GROUP_OPENED_CLASS = "dx-datagrid-group-opened",
            DATAGRID_GROUP_CLOSED_CLASS = "dx-datagrid-group-closed",
            DATAGRID_CONTENT_CLASS = "dx-datagrid-content",
            DATAGRID_NOWRAP_CLASS = "dx-datagrid-nowrap",
            DATAGRID_ROW_LINES_CLASS = "dx-row-lines",
            DATAGRID_COLUMN_LINES_CLASS = "dx-column-lines",
            DATAGRID_ROW_ALTERNATION_CLASS = 'dx-row-alt',
            DATAGRID_EDITOR_CELL_CLASS = "dx-editor-cell",
            PIXELS_LIMIT = 250000,
            DATAGRID_LOADPANEL_HIDE_TIMEOUT = 200;
        var formatValue = function(value, options) {
                var formatObject = {
                        value: value,
                        valueText: DX.formatHelper.format(value, options.format, options.precision) || ''
                    };
                return options.customizeText ? options.customizeText.call(options, formatObject) : formatObject.valueText
            };
        var appendElementTemplate = {render: function(container, element) {
                    container.append(element)
                }};
        var createScrollableOptions = function(that) {
                var useNativeScrolling = that.option("scrolling.useNativeScrolling");
                var options = {
                        direction: "both",
                        rtlEnabled: that.option("rtlEnabled") || DX.rtlEnabled,
                        disabled: that.option("disabled"),
                        bounceEnabled: false,
                        useKeyboard: false
                    };
                if (useNativeScrolling === undefined)
                    useNativeScrolling = true;
                if (useNativeScrolling !== 'auto') {
                    options.useNative = !!useNativeScrolling;
                    options.useSimulatedScrollbar = !useNativeScrolling
                }
                return options
            };
        dataGrid.createScrollableOptions = createScrollableOptions;
        dataGrid.RowsView = dataGrid.ColumnsView.inherit({
            _getDefaultTemplate: function(column) {
                var that = this;
                switch (column.command) {
                    case"group":
                        return function(container, options) {
                                if (!utils.isDefined(options.value) || options.data && options.data.isContinuation)
                                    container.addClass(DATAGRID_GROUP_SPACE_CLASS);
                                else
                                    container.addClass(options.value ? DATAGRID_GROUP_OPENED_CLASS : DATAGRID_GROUP_CLOSED_CLASS).on('dxclick', that.createAction(function() {
                                        that._dataController.changeGroupExpand(options.values)
                                    }))
                            };
                    case"empty":
                        return function(container) {
                                container.html('&nbsp;')
                            };
                    default:
                        return function(container, options) {
                                var isDataTextEmpty = !options.text && options.rowType === "data",
                                    text = isDataTextEmpty ? "&nbsp;" : options.text;
                                if (column.encodeHtml && !isDataTextEmpty)
                                    container.text(text);
                                else
                                    container.html(text)
                            }
                }
            },
            _getDefaultGroupTemplate: function() {
                var that = this;
                return function(container, options) {
                        var data = options.data,
                            text = options.column.caption + ": " + options.text;
                        if (data)
                            if (options.groupContinuedMessage && options.groupContinuesMessage)
                                text += ' (' + options.groupContinuedMessage + '. ' + options.groupContinuesMessage + ')';
                            else if (options.groupContinuesMessage)
                                text += ' (' + options.groupContinuesMessage + ')';
                            else if (options.groupContinuedMessage)
                                text += ' (' + options.groupContinuedMessage + ')';
                        container.css('text-align', that.option('rtlEnabled') ? 'right' : 'left').text(text)
                    }
            },
            _update: function(change){},
            _createRow: function(rowOptions) {
                var $row = this.callBase(),
                    isGroup,
                    isDataRow;
                if (rowOptions) {
                    isGroup = rowOptions.rowType === 'group';
                    isDataRow = rowOptions.rowType === 'data';
                    $row.toggleClass(DATAGRID_DATA_ROW_CLASS, isDataRow).toggleClass(DATAGRID_ROW_ALTERNATION_CLASS, isDataRow && rowOptions.dataIndex % 2 === 1 && this.option('rowAlternationEnabled')).toggleClass(DATAGRID_ROW_LINES_CLASS, isDataRow && this.option('showRowLines')).toggleClass(DATAGRID_COLUMN_LINES_CLASS, this.option('showColumnLines')).toggleClass(DATAGRID_GROUP_ROW_CLASS, isGroup)
                }
                return $row
            },
            _highlightSearchText: function(cellElement, isEquals) {
                var that = this,
                    $parent,
                    searchHTML,
                    searchText = that._dataController.getSearchText();
                if (searchText && that.option("searchPanel.highlightSearchText")) {
                    searchHTML = $('<div>').text(searchText).html();
                    $parent = cellElement.parent();
                    if (!$parent.length)
                        $parent = $('<div>').append(cellElement);
                    $.each($parent.find(":dxicontains('" + searchText + "')"), function(index, element) {
                        $.each($(element).contents(), function(index, content) {
                            if (content.nodeType !== 3)
                                return;
                            var highlightSearchTextInTextNode = function($content, searchText) {
                                    var $searchTextSpan = $('<span />').addClass(DATAGRID_SEARCH_TEXT_CLASS),
                                        text = $content.text(),
                                        index = text.toLowerCase().indexOf(searchText.toLowerCase());
                                    if (index >= 0) {
                                        if ($content[0].textContent)
                                            $content[0].textContent = text.substr(0, index);
                                        else
                                            $content[0].nodeValue = text.substr(0, index);
                                        $content.after($searchTextSpan.text(text.substr(index, searchText.length)));
                                        $content = $(document.createTextNode(text.substr(index + searchText.length))).insertAfter($searchTextSpan);
                                        return highlightSearchTextInTextNode($content, searchText)
                                    }
                                };
                            if (isEquals) {
                                if ($(content).text().toLowerCase() === searchText.toLowerCase())
                                    $(this).replaceWith($('<span />').addClass(DATAGRID_SEARCH_TEXT_CLASS).text($(content).text()))
                            }
                            else
                                highlightSearchTextInTextNode($(content), searchText)
                        })
                    })
                }
            },
            _renderTemplate: function(container, template, options) {
                var that = this;
                if ($.isFunction(template)) {
                    template(container, options);
                    return true
                }
                else if (utils.isString(template)) {
                    if (!that._templatesCache[template])
                        that._templatesCache[template] = that.getTemplate(template);
                    template = that._templatesCache[template];
                    if (template)
                        if (template.allowRenderToDetachedContainer) {
                            template.render(container, options);
                            return true
                        }
                        else
                            that._delayedTemplates.push({
                                template: template,
                                container: container,
                                options: options
                            })
                }
                return false
            },
            _getColumnTemplate: function(options) {
                var that = this,
                    column = options.column,
                    template;
                if (column.groupIndex !== undefined)
                    template = column.groupCellTemplate || that._getDefaultGroupTemplate();
                else
                    template = column.cellTemplate || that._getDefaultTemplate(column);
                return template
            },
            _updateCell: function($cell, parameters) {
                var that = this,
                    column = parameters.column,
                    isEquals = column.dataType !== "string";
                if (column.allowFiltering)
                    that._highlightSearchText($cell, isEquals);
                if (parameters.rowType === "data" && column.groupIndex === undefined)
                    that._cellPrepared($cell, parameters)
            },
            _createCell: function(value, item, rowIndex, column, columnIndex) {
                var that = this,
                    template,
                    groupingOptions = that.option('grouping'),
                    scrollingMode = this.option('scrolling.mode'),
                    data = item && item.data,
                    displayValue = column.lookup ? column.lookup.calculateCellValue(value) : value,
                    $cell = $('<td />').addClass(column.cssClass),
                    parameters = {
                        value: value,
                        displayValue: displayValue,
                        row: item,
                        key: item && item.key,
                        data: data,
                        rowType: item && item.rowType,
                        values: item && item.values,
                        text: formatValue(displayValue, column),
                        rowIndex: rowIndex,
                        columnIndex: columnIndex,
                        column: column,
                        resized: column.resizedCallbacks
                    };
                if (utils.isDefined(column.groupIndex) && scrollingMode !== 'virtual' && scrollingMode !== 'infinite') {
                    parameters.groupContinuesMessage = data && data.isContinuationOnNextPage && groupingOptions && groupingOptions.groupContinuesMessage;
                    parameters.groupContinuedMessage = data && data.isContinuation && groupingOptions && groupingOptions.groupContinuedMessage
                }
                template = that._getColumnTemplate(parameters);
                if (that._renderTemplate($cell, template, parameters))
                    that._updateCell($cell, parameters);
                return $cell
            },
            _cellPrepared: function($cell, options) {
                var that = this,
                    cellPrepared = that.option("cellPrepared"),
                    alignment = options.column.alignment,
                    extendOptions = function(event) {
                        return {
                                cellElement: $(event.target).closest('td'),
                                jQueryEvent: event,
                                eventType: event.type
                            }
                    };
                if (alignment)
                    $cell[0].style.textAlign = alignment;
                if (that.option("cellClick"))
                    $cell.on("dxclick", function(e) {
                        that.executeAction("cellClick", $.extend({}, options, extendOptions(e)))
                    });
                if (that.option("cellHoverChanged")) {
                    $cell.on("mouseover", function(e) {
                        that.executeAction("cellHoverChanged", $.extend({}, options, extendOptions(e)))
                    });
                    $cell.on("mouseout", function(e) {
                        that.executeAction("cellHoverChanged", $.extend({}, options, extendOptions(e)))
                    })
                }
                if (utils.isFunction(cellPrepared))
                    cellPrepared($cell, options)
            },
            _rowPrepared: function($row, options) {
                var that = this,
                    rowPrepared = that.option("rowPrepared");
                if (utils.isFunction(rowPrepared))
                    rowPrepared($row, options)
            },
            _renderScrollable: function($table) {
                var that = this,
                    $element = that._element();
                if (!utils.isDefined(that._tableElement)) {
                    that._tableElement = $table;
                    if (!$element.children().length)
                        $element.append('<div />');
                    that._renderLoadPanel($element);
                    that._renderScrollableCore($element);
                    that._subscribeToWindowScrollEvents($element)
                }
            },
            _renderScrollableCore: function($element) {
                var that = this,
                    dxScrollableOptions = createScrollableOptions(that);
                var scrollHandler = function(e) {
                        var $content = that._findContentElement();
                        if (that._hasHeight && that._rowHeight) {
                            that._scrollTop = e.scrollOffset.top;
                            that._dataController.setViewportItemIndex(that._scrollTop / that._rowHeight)
                        }
                        that.scrollOffsetChanged.fire(e.scrollOffset)
                    };
                dxScrollableOptions.scrollAction = scrollHandler;
                dxScrollableOptions.stopAction = scrollHandler;
                $element.dxScrollable(dxScrollableOptions);
                that._scrollable = $element.data('dxScrollable');
                that._scrollableContainer = that._scrollable._$container
            },
            _renderLoadPanel: function($element) {
                var that = this,
                    loadPanelOptions;
                if ($element.dxLoadPanel) {
                    loadPanelOptions = that.option("loadPanel");
                    if (loadPanelOptions && loadPanelOptions.enabled) {
                        loadPanelOptions = $.extend({
                            shading: false,
                            message: loadPanelOptions.text,
                            position: {of: $element},
                            targetContainer: $element
                        }, loadPanelOptions);
                        if (that._loadPanel)
                            that._loadPanel.option(loadPanelOptions);
                        else
                            that._loadPanel = $('<div />').appendTo($element.parent()).dxLoadPanel(loadPanelOptions).dxLoadPanel('instance')
                    }
                    else {
                        that._loadPanel && that._loadPanel._element().remove();
                        that._loadPanel = null
                    }
                }
            },
            _subscribeToWindowScrollEvents: function($element) {
                var that = this,
                    disposing = that.disposing,
                    $componentContainer = that.component._element(),
                    $scrollElement;
                if (!$componentContainer)
                    return;
                if (!that._windowScrollEvents) {
                    that._windowScrollEvents = true;
                    var createWindowScrollHandler = function($scrollElement, oldHandler) {
                            var handler = function(e) {
                                    var contentOffset,
                                        scrollTop = $scrollElement.scrollTop();
                                    if (!that._hasHeight && that._rowHeight) {
                                        scrollTop -= $element.offset().top;
                                        scrollTop = scrollTop > 0 ? scrollTop : 0;
                                        that._scrollTop = scrollTop;
                                        that._dataController.setViewportItemIndex(scrollTop / that._rowHeight)
                                    }
                                };
                            if (oldHandler)
                                return function(e) {
                                        handler(e);
                                        oldHandler(e)
                                    };
                            return handler
                        };
                    var subscribeToScrollEvents = function($scrollElement) {
                            var dxScrollable = $scrollElement.data("dxScrollable"),
                                scrollHandler,
                                oldScrollHandler;
                            if (dxScrollable) {
                                oldScrollHandler = dxScrollable.option('scrollAction');
                                scrollHandler = createWindowScrollHandler($scrollElement, oldScrollHandler);
                                dxScrollable.option('scrollAction', scrollHandler);
                                disposing && disposing.add(function() {
                                    if (dxScrollable.option('scrollAction') === scrollHandler)
                                        dxScrollable.option('scrollAction', oldScrollHandler)
                                })
                            }
                            else if ($scrollElement.is(document) || $scrollElement.css("overflow-y") === "auto") {
                                if ($scrollElement.is(document))
                                    $scrollElement = $(window);
                                scrollHandler = createWindowScrollHandler($scrollElement);
                                $scrollElement.on('scroll', scrollHandler);
                                disposing && disposing.add(function() {
                                    $scrollElement.off('scroll', scrollHandler)
                                })
                            }
                        };
                    for ($scrollElement = that.component._element().parent(); $scrollElement.length; $scrollElement = $scrollElement.parent())
                        subscribeToScrollEvents($scrollElement)
                }
            },
            _renderContent: function(contentElement, tableElement) {
                var that = this,
                    contentElement,
                    contentHeight,
                    virtualItemsCount = that._dataController.virtualItemsCount();
                that._tableElement = tableElement;
                contentElement.addClass(DATAGRID_CONTENT_CLASS);
                if (virtualItemsCount) {
                    tableElement.addClass(DATAGRID_TABLE_CONTENT_CLASS);
                    if (!contentElement.children().length)
                        contentElement.append(tableElement);
                    else
                        contentElement.children().first().replaceWith(tableElement);
                    if (contentElement.children().length === 1) {
                        contentElement.append(that._createTable());
                        that._contentHeight = 0
                    }
                }
                else
                    contentElement.replaceWith($('<div>').addClass(DATAGRID_CONTENT_CLASS).append(tableElement));
                return contentElement
            },
            _updateContentPosition: function() {
                var that = this,
                    contentElement,
                    contentHeight,
                    rowHeight = that._rowHeight || 20,
                    virtualItemsCount = that._dataController.virtualItemsCount();
                if (virtualItemsCount) {
                    contentElement = that._findContentElement();
                    DX.translator.move(contentElement.children().first(), {top: Math.floor(virtualItemsCount.begin * rowHeight)});
                    contentHeight = (virtualItemsCount.begin + virtualItemsCount.end) * rowHeight + contentElement.children().first().outerHeight();
                    if (that._contentHeight !== contentHeight || contentHeight === 0) {
                        that._contentHeight = contentHeight;
                        that._updateContainerHeight(contentElement.children().eq(1), contentHeight)
                    }
                }
            },
            setColumnWidths: function(widths) {
                this._setColumnWidthsCore(this._findContentElement().children(), widths)
            },
            _updateContent: function(tableElement, changeType) {
                var that = this,
                    contentElement = that._findContentElement(),
                    rowHeight = that._rowHeight || 20,
                    contentTable,
                    virtualItemsCount = that._dataController.virtualItemsCount();
                that.setColumnWidths();
                if (changeType === 'append' || changeType === 'prepend') {
                    contentTable = contentElement.children().first();
                    tableElement.find('tr')[changeType === 'append' ? 'appendTo' : 'prependTo'](contentTable)
                }
                else
                    that._renderContent(contentElement, tableElement);
                that._updateBottomLoading()
            },
            _renderFreeSpaceRow: function(tableElement, columns) {
                var that = this,
                    i,
                    freeSpaceRowElement = that._createRow().hide(),
                    column;
                freeSpaceRowElement.addClass(DATAGRID_FREESPACE_CLASS).toggleClass(DATAGRID_COLUMN_LINES_CLASS, that.option('showColumnLines'));
                for (i = 0; i < columns.length; i++) {
                    column = {
                        command: utils.isDefined(columns[i].groupIndex) ? 'group' : '',
                        cssClass: utils.isDefined(columns[i].cssClass) ? columns[i].cssClass : ''
                    };
                    freeSpaceRowElement.append(that._createCell(null, null, null, column))
                }
                that._appendRow(tableElement, freeSpaceRowElement);
                that._freeSpaceRowElement = freeSpaceRowElement
            },
            _updateRowHeight: function() {
                var that = this,
                    tableHeight,
                    $element = that._element(),
                    itemsCount = that._dataController.items().length,
                    lastRowHight = that._rowHeight,
                    viewportHeight;
                if ($element && itemsCount > 0 && (!lastRowHight || that.option('scrolling.mode') === 'infinite')) {
                    tableHeight = that._tableElement.outerHeight();
                    if (that._freeSpaceRowElement && that._freeSpaceRowElement.is(':visible'))
                        tableHeight -= that._freeSpaceRowElement.outerHeight();
                    that._rowHeight = tableHeight / itemsCount;
                    if (!lastRowHight && that._rowHeight) {
                        that._updateContentPosition();
                        viewportHeight = that._hasHeight ? $element.outerHeight() : $(window).outerHeight();
                        that._dataController.setViewportSize(Math.round(viewportHeight / that._rowHeight))
                    }
                }
            },
            _updateContainerHeight: function(container, height) {
                var that = this,
                    columns = that._columnsController.getVisibleColumns(),
                    html = container.find('colgroup').prop('outerHTML') || dataGrid.createColGroup(columns).prop('outerHTML'),
                    freeSpaceCellsHtml = '',
                    i,
                    columnLinesClass = that.option('showColumnLines') ? DATAGRID_COLUMN_LINES_CLASS : '',
                    createFreeSpaceRowHtml = function(height) {
                        return '<tr style="height:' + height + 'px;" class="' + DATAGRID_FREESPACE_CLASS + ' ' + DATAGRID_ROW_CLASS + ' ' + columnLinesClass + '" >' + freeSpaceCellsHtml + '</tr>'
                    };
                for (i = 0; i < columns.length; i++)
                    freeSpaceCellsHtml += utils.isDefined(columns[i].groupIndex) ? '<td class="' + DATAGRID_GROUP_SPACE_CLASS + '"/>' : '<td />';
                while (height > PIXELS_LIMIT) {
                    html += createFreeSpaceRowHtml(PIXELS_LIMIT);
                    height -= PIXELS_LIMIT
                }
                html += createFreeSpaceRowHtml(height);
                container.addClass(DATAGRID_TABLE_CLASS);
                container.html(html)
            },
            _findContentElement: function() {
                var $element = this._element(),
                    $scrollableContent;
                if ($element) {
                    $scrollableContent = $element.find('.dx-scrollable-content');
                    if (!$scrollableContent)
                        $scrollableContent = $element;
                    return $scrollableContent.children().first()
                }
            },
            _findBottomLoadPanel: function() {
                var $bottomLoadPanel = this._element().find('.' + DATAGRID_BOTTOM_LOAD_PANEL_CLASS);
                if ($bottomLoadPanel.length)
                    return $bottomLoadPanel
            },
            _getRowElements: function() {
                return this._element().find('.dx-row:not(.' + DATAGRID_FREESPACE_CLASS + ')')
            },
            _updateBottomLoading: function() {
                var that = this,
                    scrollingOptions = that.option("scrolling"),
                    virtualMode = scrollingOptions && scrollingOptions.mode === 'virtual',
                    appendMode = scrollingOptions && scrollingOptions.mode === 'infinite',
                    showBottomLoading = !that._dataController.hasKnownLastPage() && that._dataController.isLoaded() && (virtualMode || appendMode),
                    bottomLoadPanelElement = that._findBottomLoadPanel();
                if (showBottomLoading) {
                    bottomLoadPanelElement = bottomLoadPanelElement || $('<div />').addClass(DATAGRID_BOTTOM_LOAD_PANEL_CLASS).append($('<div />').dxLoadIndicator());
                    bottomLoadPanelElement.appendTo(that._findContentElement());
                    bottomLoadPanelElement.show()
                }
                else if (bottomLoadPanelElement)
                    bottomLoadPanelElement.hide()
            },
            _appendRow: function(tableElement, rowElement) {
                var that = this;
                if (that.option("rowTemplate") && that._delayedTemplates.length && rowElement)
                    that._delayedTemplates.push({
                        container: tableElement,
                        template: appendElementTemplate,
                        options: rowElement
                    });
                else
                    tableElement.append(rowElement)
            },
            _updateNoDataText: function() {
                var noDataElement = this._element().find('.' + DATAGRID_NODATA_TEXT_CLASS),
                    isVisible = !this._dataController.items().length,
                    isLoading = this._dataController.isLoading(),
                    rtlEnabled = this.option("rtlEnabled"),
                    noDataElementCSSConfig = {};
                if (!noDataElement.length)
                    noDataElement = $('<span>').addClass(DATAGRID_NODATA_TEXT_CLASS).hide().appendTo(this._element());
                noDataElement.text(this.option("noDataText"));
                noDataElementCSSConfig = {
                    marginTop: -Math.floor(noDataElement.height() / 2),
                    marginRight: rtlEnabled ? -Math.floor(noDataElement.width() / 2) : 0,
                    marginLeft: rtlEnabled ? 0 : -Math.floor(noDataElement.width() / 2)
                };
                noDataElement.css(noDataElementCSSConfig);
                if (isVisible && !isLoading)
                    noDataElement.show();
                else
                    noDataElement.hide()
            },
            _createTable: function() {
                var that = this;
                return that.callBase().on("dxclick", '.dx-row', that.createAction(function(args) {
                        var e = args.jQueryEvent;
                        if (!$(e.target).closest('.' + DATAGRID_EDITOR_CELL_CLASS).length && !$(e.target).closest('a').length) {
                            that._rowClick(that.getRowIndex(e.currentTarget), e);
                            e.preventDefault()
                        }
                    }))
            },
            _rowClick: function(rowIndex, event) {
                var item = this._dataController.items()[rowIndex] || {};
                this.executeAction("rowClick", $.extend({
                    rowIndex: rowIndex,
                    columns: this._columnsController.getVisibleColumns(),
                    jQueryEvent: event,
                    rowElement: $(event.target).closest(".dx-row"),
                    evaluate: function(expr) {
                        var getter = DX.data.utils.compileGetter(expr);
                        return getter(item.data)
                    }
                }, item))
            },
            _renderTable: function(items) {
                var that = this,
                    itemsLength = items.length,
                    item,
                    $row,
                    $groupCell,
                    values,
                    columnsLength,
                    i,
                    j,
                    groupEmptyCellsCount,
                    $cells = [],
                    columnsCountBeforeGroups = 0,
                    columns = that._columnsController.getVisibleColumns(),
                    rowTemplate = that.option("rowTemplate"),
                    scrollingMode = that.option("scrolling.mode"),
                    $table = that._createTable();
                $table.append(dataGrid.createColGroup(columns));
                for (i = 0; i < columns.length; i++)
                    if (columns[i].groupIndex !== undefined) {
                        columnsCountBeforeGroups = i;
                        break
                    }
                for (i = 0; i < itemsLength; i++) {
                    item = items[i];
                    item.rowIndex = i;
                    $cells = [];
                    if (item.groupIndex !== undefined) {
                        $row = that._createRow(item);
                        groupEmptyCellsCount = item.groupIndex + columnsCountBeforeGroups;
                        for (j = 0; j < groupEmptyCellsCount; j++)
                            $cells.push(that._createCell(null, item, i, {command: 'group'}));
                        if (columns[groupEmptyCellsCount].allowCollapsing && scrollingMode !== "infinite")
                            $cells.push(that._createCell(!!item.isExpanded, item, i, {command: 'group'}));
                        else
                            $cells.push(that._createCell(null, item, i, {command: 'group'}));
                        $groupCell = that._createCell(item.values[item.groupIndex], item, i, columns[groupEmptyCellsCount]);
                        $groupCell.attr('colspan', columns.length - groupEmptyCellsCount - 1);
                        $cells.push($groupCell)
                    }
                    else if (rowTemplate)
                        that._renderTemplate($table, rowTemplate, $.extend({columns: columns}, item));
                    else {
                        values = item.values;
                        columnsLength = columns.length;
                        $row = that._createRow(item);
                        for (j = 0; j < columnsLength; j++)
                            $cells.push(that._createCell(values[j], item, i, utils.isDefined(columns[j].groupIndex) ? {command: 'group'} : columns[j], j))
                    }
                    if ($cells.length)
                        $row.append($cells);
                    if ($row)
                        that._rowPrepared($row, $.extend({columns: columns}, item));
                    that._appendRow($table, $row)
                }
                if (rowTemplate)
                    that._highlightSearchText($table);
                that._renderFreeSpaceRow($table, columns);
                return $table
            },
            _renderCore: function(change) {
                var that = this,
                    items = change && change.items || that._dataController.items(),
                    changeType = change && change.changeType,
                    $element = that._element(),
                    $root = $element.parent();
                $element.addClass(DATAGRID_ROWS_VIEW_CLASS).toggleClass(DATAGRID_NOWRAP_CLASS, !that.option("wordWrapEnabled"));
                var $table = that._renderTable(items);
                that._renderScrollable($table);
                that._updateContent($table, changeType);
                if (!$root || $root.parent().length)
                    that.renderDelayedTemplates();
                that._updateContentPosition();
                that._lastColumnWidths = null
            },
            getRowIndex: function($row) {
                return this._getRowElements().index($row)
            },
            getRow: function(index) {
                var rows = this._getRowElements();
                if (rows.length > index)
                    return $(rows[index])
            },
            getCell: function(columnIndex, rowIndex) {
                var rows = this._getRowElements(),
                    cells;
                if (rows.length > 0 && rowIndex >= 0) {
                    rowIndex = rowIndex < rows.length ? rowIndex : rows.length - 1;
                    cells = rows[rowIndex].cells;
                    if (cells && cells.length > 0)
                        return $(cells[cells.length > columnIndex ? columnIndex : cells.length - 1])
                }
            },
            getTableFromCell: function($cell) {
                return $cell.closest("." + DATAGRID_ROWS_VIEW_CLASS + " ." + DATAGRID_TABLE_CLASS)
            },
            updateFreeSpaceRowHeight: function() {
                var that = this,
                    elementHeight,
                    contentElement = that._findContentElement(),
                    contentHeight = 0,
                    freespaceRowCount,
                    scrollingMode,
                    resultHeight;
                if (that._freeSpaceRowElement && contentElement) {
                    that._freeSpaceRowElement.hide();
                    elementHeight = that._element().height();
                    contentHeight = contentElement.outerHeight();
                    resultHeight = elementHeight - contentHeight - that.getScrollbarWidth(true);
                    if (that._dataController.items().length > 0)
                        if (resultHeight > 0) {
                            that._freeSpaceRowElement.height(resultHeight);
                            that._freeSpaceRowElement.show()
                        }
                        else if (!that._hasHeight) {
                            freespaceRowCount = that._dataController.pageSize() - that._dataController.items().length;
                            scrollingMode = that.option('scrolling.mode');
                            if (freespaceRowCount > 0 && that._dataController.pageCount() > 1 && scrollingMode !== 'virtual' && scrollingMode !== 'infinite') {
                                that._freeSpaceRowElement.height(freespaceRowCount * that._rowHeight);
                                that._freeSpaceRowElement.show()
                            }
                        }
                }
            },
            ctor: function(component) {
                this.callBase(component);
                this.scrollOffsetChanged = $.Callbacks()
            },
            init: function() {
                var that = this,
                    visibleColumnIndex;
                that.callBase();
                that._dataController = that.getController('data');
                that._columnsController.columnsChanged.add(function(e) {
                    var editorFactory,
                        column,
                        $tables;
                    if (dataGrid.checkChanges(e.optionNames, ['width'])) {
                        column = e.column,
                        visibleColumnIndex = that._columnsController.getVisibleIndex(e.columnIndex);
                        if (visibleColumnIndex !== -1) {
                            $tables = that._findContentElement().children();
                            $.each($tables, function(key, table) {
                                $(table).find('col').eq(visibleColumnIndex).css('width', column.width)
                            });
                            if (e.column.resizedCallbacks)
                                e.column.resizedCallbacks.fire(column.width);
                            editorFactory = that.getController('editorFactory');
                            editorFactory && editorFactory.focus(editorFactory.focus())
                        }
                    }
                });
                that._rowHeight = 0;
                that._scrollTop = 0;
                that._hasHeight = false;
                that._dataController.changed.add(function(change) {
                    switch (change.changeType) {
                        case'refresh':
                        case'prepend':
                        case'append':
                            that.render(null, change);
                            break;
                        default:
                            that._update(change);
                            break
                    }
                });
                that._dataController.loadingChanged.add(function(isLoading, messageText) {
                    that.setLoading(isLoading, messageText)
                });
                that._delayedTemplates = [];
                that._templatesCache = {};
                that.createAction("rowClick");
                that.createAction("cellClick");
                that.createAction("cellHoverChanged", {excludeValidators: ['gesture']})
            },
            publicMethods: function() {
                return ['isScrollbarVisible', 'getTopVisibleRowData']
            },
            renderDelayedTemplates: function() {
                var templateParameters,
                    delayedTemplates = this._delayedTemplates;
                while (delayedTemplates.length) {
                    templateParameters = delayedTemplates.shift();
                    templateParameters.template.render(templateParameters.container, templateParameters.options);
                    if (templateParameters.options.column)
                        this._updateCell(templateParameters.container, templateParameters.options)
                }
            },
            getScrollbarWidth: function(isHorizontal) {
                var scrollableContainer = this._scrollableContainer && this._scrollableContainer.get(0),
                    scrollbarWidth = 0;
                if (scrollableContainer)
                    if (!isHorizontal)
                        scrollbarWidth = scrollableContainer.offsetWidth - scrollableContainer.clientWidth;
                    else
                        scrollbarWidth = scrollableContainer.offsetHeight - scrollableContainer.clientHeight;
                return scrollbarWidth
            },
            resize: function() {
                var that = this,
                    lastColumnWidths = that._lastColumnWidths || [],
                    columnWidths = that.getColumnWidths(),
                    columns = that._columnsController.getVisibleColumns(),
                    dxScrollable,
                    i;
                for (i = 0; i < columns.length; i++)
                    if (columns[i].resizedCallbacks && !utils.isDefined(columns[i].groupIndex) && lastColumnWidths[i] !== columnWidths[i])
                        columns[i].resizedCallbacks.fire(columnWidths[i]);
                that._lastColumnWidths = columnWidths;
                that._updateRowHeight();
                that._updateNoDataText();
                that.updateFreeSpaceRowHeight();
                dxScrollable = that._element().data('dxScrollable');
                if (dxScrollable)
                    dxScrollable.update();
                that.callBase()
            },
            scrollToPage: function(pageIndex) {
                var that = this,
                    scrollingMode = that.option('scrolling.mode'),
                    dataController = that._dataController,
                    pageSize = dataController ? dataController.pageSize() : 0,
                    scrollPosition;
                if (scrollingMode === 'virtual' || scrollingMode === 'infinite')
                    scrollPosition = pageIndex * that._rowHeight * pageSize;
                else
                    scrollPosition = 0;
                that.scrollTo({
                    y: scrollPosition,
                    x: 0
                })
            },
            scrollTo: function(location) {
                var $element = this._element(),
                    dxScrollable = $element && $element.data('dxScrollable');
                if (dxScrollable)
                    dxScrollable.scrollTo(location)
            },
            height: function(height) {
                var that = this,
                    $element = this._element();
                if (utils.isDefined(height)) {
                    that._hasHeight = height !== 'auto';
                    if ($element)
                        $element.height(height);
                    that._freeSpaceRowElement && that._freeSpaceRowElement.hide()
                }
                else
                    return $element ? $element.height() : 0
            },
            setLoading: function(isLoading, messageText) {
                var that = this,
                    loadPanel = that._loadPanel,
                    dataController = that._dataController,
                    hasBottomLoadPanel = !!that._findBottomLoadPanel() && dataController.isLoaded(),
                    loadPanelOptions = that.option("loadPanel") || {},
                    animation = dataController.isLoaded() ? loadPanelOptions.animation : null,
                    visible = hasBottomLoadPanel ? false : isLoading,
                    visibilityOptions;
                if (loadPanel) {
                    visibilityOptions = {
                        message: messageText || loadPanelOptions.text,
                        animation: animation,
                        visible: visible
                    };
                    clearTimeout(that._hideLoadingTimeoutID);
                    if (loadPanel.option('visible') && !visible)
                        that._hideLoadingTimeoutID = setTimeout(function() {
                            loadPanel.option(visibilityOptions)
                        }, DATAGRID_LOADPANEL_HIDE_TIMEOUT);
                    else
                        loadPanel.option(visibilityOptions);
                    that._updateNoDataText()
                }
            },
            isScrollbarVisible: function() {
                var $element = this._element();
                return $element ? this._findContentElement().outerHeight() - $element.height() > 0 : false
            },
            setRowsOpacity: function(columnIndex, value) {
                var that = this,
                    $rows = that._getRowElements().not('.' + DATAGRID_GROUP_ROW_CLASS) || [];
                $.each($rows, function(_, row) {
                    $(row).children().eq(columnIndex).css({opacity: value})
                })
            },
            getTopVisibleItemIndex: function() {
                var that = this,
                    itemIndex,
                    prevOffsetTop = 0,
                    offsetTop = 0,
                    rowElements = that._getRowElements(),
                    scrollPosition = that._scrollTop,
                    contentElementOffsetTop = that._findContentElement().offset().top,
                    items = that._dataController.items();
                for (itemIndex = 0; itemIndex < items.length; itemIndex++) {
                    prevOffsetTop = offsetTop;
                    offsetTop = rowElements.eq(itemIndex).offset().top - contentElementOffsetTop;
                    if (offsetTop > scrollPosition) {
                        if (scrollPosition * 2 < offsetTop + prevOffsetTop && itemIndex)
                            itemIndex--;
                        break
                    }
                }
                if (itemIndex && itemIndex === items.length)
                    itemIndex--;
                return itemIndex
            },
            getTopVisibleRowData: function() {
                var itemIndex = this.getTopVisibleItemIndex(),
                    items = this._dataController.items();
                if (items[itemIndex])
                    return items[itemIndex].data
            },
            optionChanged: function(name, value, prevValue) {
                var that = this;
                switch (name) {
                    case'wordWrapEnabled':
                    case'hoverStateEnabled':
                    case'showColumnLines':
                    case'showRowLines':
                    case'rowAlternationEnabled':
                    case'rowTemplate':
                    case'cellPrepared':
                    case'rowPrepared':
                        that.render();
                        that.component.resize();
                        break;
                    case'scrolling':
                    case'rtlEnabled':
                        that._rowHeight = null;
                        that._tableElement = null;
                        break;
                    case"disabled":
                    case'loadPanel':
                        that._tableElement = null;
                        that.render();
                        that.component.resize();
                        break;
                    case'noDataText':
                        that._updateNoDataText();
                        break;
                    case'cellHoverChanged':
                        that.createAction("cellHoverChanged", {excludeValidators: ['gesture']});
                        that.render();
                        that.component.resize();
                        break;
                    case"rowClick":
                        that.createAction("rowClick");
                        break;
                    case"cellClick":
                        that.createAction("cellClick");
                        break
                }
            },
            dispose: function() {
                clearTimeout(this._hideLoadingTimeoutID)
            }
        });
        dataGrid.formatValue = formatValue;
        $.extend(dataGrid.__internals, {
            DATAGRID_CELL_CONTENT_CLASS: DATAGRID_CELL_CONTENT_CLASS,
            DATAGRID_GROUP_ROW_CLASS: DATAGRID_GROUP_ROW_CLASS,
            DATAGRID_SEARCH_TEXT_CLASS: DATAGRID_SEARCH_TEXT_CLASS,
            DATAGRID_ROWS_VIEW_CLASS: DATAGRID_ROWS_VIEW_CLASS,
            DATAGRID_TABLE_CLASS: DATAGRID_TABLE_CLASS,
            DATAGRID_FREESPACE_CLASS: DATAGRID_FREESPACE_CLASS,
            DATAGRID_BOTTOM_LOAD_PANEL_CLASS: DATAGRID_BOTTOM_LOAD_PANEL_CLASS,
            DATAGRID_NODATA_TEXT_CLASS: DATAGRID_NODATA_TEXT_CLASS,
            DATAGRID_GROUP_SPACE_CLASS: DATAGRID_GROUP_SPACE_CLASS,
            DATAGRID_GROUP_OPENED_CLASS: DATAGRID_GROUP_OPENED_CLASS,
            DATAGRID_GROUP_CLOSED_CLASS: DATAGRID_GROUP_CLOSED_CLASS,
            DATAGRID_NOWRAP_CLASS: DATAGRID_NOWRAP_CLASS,
            DATAGRID_ROW_LINES_CLASS: DATAGRID_ROW_LINES_CLASS,
            DATAGRID_COLUMN_LINES_CLASS: DATAGRID_COLUMN_LINES_CLASS,
            DATAGRID_ROW_ALTERNATION_CLASS: DATAGRID_ROW_ALTERNATION_CLASS
        });
        dataGrid.registerModule('rows', {
            defaultOptions: function() {
                return {
                        hoverStateEnabled: false,
                        cellHoverChanged: null,
                        scrolling: {
                            mode: 'standard',
                            preloadEnabled: false,
                            useNativeScrolling: 'auto'
                        },
                        loadPanel: {
                            enabled: true,
                            text: Globalize.localize("Loading"),
                            width: 200,
                            height: 70,
                            showIndicator: true,
                            indicatorSrc: "",
                            showPane: true
                        },
                        rowClick: null,
                        cellClick: null,
                        rowTemplate: null,
                        columnAutoWidth: false,
                        noDataText: Globalize.localize("dxDataGrid-noDataText"),
                        wordWrapEnabled: false,
                        showColumnLines: true,
                        showRowLines: false,
                        rowAlternationEnabled: false,
                        cellPrepared: null,
                        rowPrepared: null,
                        activeStateEnabled: false
                    }
            },
            views: {rowsView: dataGrid.RowsView},
            extenders: {controllers: {data: {
                        _applyFilter: function() {
                            var that = this,
                                result = that.callBase();
                            if (result && result.done)
                                result.done(function() {
                                    that.getView('rowsView').scrollToPage(0)
                                });
                            return result
                        },
                        pageIndex: function(value) {
                            var that = this,
                                result = that.callBase(value);
                            if (result && result.done)
                                result.done(function() {
                                    that.getView('rowsView').scrollToPage(that.pageIndex())
                                });
                            return result
                        },
                        pageSize: function(value) {
                            var that = this,
                                result = that.callBase(value);
                            if (result && result.done)
                                result.done(function() {
                                    that.getView('rowsView').scrollToPage(that.pageIndex())
                                });
                            return result
                        },
                        _refreshDataSource: function() {
                            var that = this;
                            var changedHandler = function() {
                                    that.changed.remove(changedHandler);
                                    that.getView('rowsView').scrollToPage(0)
                                };
                            that.changed.add(changedHandler);
                            that.callBase()
                        }
                    }}}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.pager.js */
    (function($, DX) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var DATAGRID_PAGER_CLASS = "dx-datagrid-pager";
        var MAX_PAGES_COUNT = 10;
        dataGrid.PagerView = dataGrid.View.inherit({
            init: function() {
                var that = this,
                    dataController = that.getController('data');
                that._isVisible = false;
                dataController.changed.add(function() {
                    that.render()
                })
            },
            _getPager: function() {
                var $element = this._element();
                return $element && $element.data('dxPager')
            },
            _renderCore: function() {
                var that = this,
                    $element = that._element().addClass(DATAGRID_PAGER_CLASS),
                    pagerOptions = that.option('pager'),
                    dataController = that.getController('data'),
                    rtlEnabled = that.option('rtlEnabled');
                $element.dxPager({
                    maxPagesCount: MAX_PAGES_COUNT,
                    pageIndex: dataController.pageIndex() + 1,
                    pagesCount: dataController.pageCount(),
                    pageSize: dataController.pageSize(),
                    showPageSizes: pagerOptions && pagerOptions.showPageSizeSelector,
                    pageSizes: that.getPageSizes(),
                    rtlEnabled: rtlEnabled,
                    hasKnownLastPage: dataController.hasKnownLastPage(),
                    pageIndexChanged: function(pageIndex) {
                        window.setTimeout(function() {
                            dataController.pageIndex(pageIndex - 1)
                        })
                    },
                    pageSizeChanged: function(pageSize) {
                        window.setTimeout(function() {
                            dataController.pageSize(pageSize)
                        })
                    }
                })
            },
            getPageSizes: function() {
                var that = this,
                    dataController = that.getController('data'),
                    pagerOptions = that.option('pager'),
                    allowedPageSizes = pagerOptions && pagerOptions.allowedPageSizes,
                    pageSize = dataController.pageSize();
                if (!utils.isDefined(that._pageSizes) || $.inArray(pageSize, that._pageSizes) === -1) {
                    that._pageSizes = [];
                    if (pagerOptions)
                        if ($.isArray(allowedPageSizes))
                            that._pageSizes = allowedPageSizes;
                        else if (allowedPageSizes && pageSize > 1)
                            that._pageSizes = [Math.floor(pageSize / 2), pageSize, pageSize * 2]
                }
                return that._pageSizes
            },
            isVisible: function() {
                var that = this,
                    dataController = that.getController('data'),
                    pagerOptions = that.option('pager'),
                    pagerVisible = pagerOptions && pagerOptions.visible,
                    scrolling = that.option('scrolling');
                if (that._isVisible)
                    return true;
                if (pagerVisible === 'auto')
                    if (scrolling && (scrolling.mode === 'virtual' || scrolling.mode === 'infinite'))
                        pagerVisible = false;
                    else
                        pagerVisible = dataController.pageCount() > 1 || dataController.isLoaded() && !dataController.hasKnownLastPage();
                that._isVisible = pagerVisible;
                return pagerVisible
            },
            getHeight: function() {
                var pager = this._getPager();
                return pager && this.isVisible() ? pager.getHeight() : 0
            },
            optionChanged: function(name, value, prevValue) {
                var that = this;
                switch (name) {
                    case'paging':
                    case'pager':
                        that._pageSizes = null;
                    case'scrolling':
                        that._isVisible = false;
                        that.render();
                        if (name === 'pager')
                            that.component && that.component.resize();
                        break
                }
            }
        });
        dataGrid.registerModule('pager', {
            defaultOptions: function() {
                return {
                        paging: {
                            enabled: true,
                            pageSize: undefined,
                            pageIndex: undefined
                        },
                        pager: {
                            visible: 'auto',
                            showPageSizeSelector: false,
                            allowedPageSizes: 'auto'
                        }
                    }
            },
            views: {pagerView: dataGrid.PagerView}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.gridView.js */
    (function($, DX) {
        var dataGrid = DX.ui.dataGrid,
            utils = DX.utils;
        var DATAGRID_CLASS = "dx-datagrid",
            EMPTY_GRID_ROWS_HEIGHT = 100,
            LOADPANEL_MARGIN = 50,
            VIEW_NAMES = ['columnsSeparatorView', 'blockSeparatorView', 'trackerView', 'headerPanel', 'columnHeadersView', 'rowsView', 'columnChooserView', 'pagerView', 'draggingHeaderView', 'contextMenuView', 'errorView'];
        var mergeArraysByMaxValue = function(values1, values2) {
                var result = [],
                    i;
                if (values1 && values2 && values1.length && values1.length === values2.length)
                    for (i = 0; i < values1.length; i++)
                        result.push(values1[i] > values2[i] ? values1[i] : values2[i]);
                return result
            };
        var isPercentWidth = function(width) {
                return utils.isString(width) && width.slice(-1) === '%'
            };
        dataGrid.createColGroup = function(columns) {
            var colgroupElement = $('<colgroup />'),
                columnsLength = columns.length,
                i;
            for (i = 0; i < columnsLength; i++)
                $('<col />').width(columns[i].width).appendTo(colgroupElement);
            return colgroupElement
        };
        dataGrid.GridView = dataGrid.View.inherit({
            _initResizeHandlers: function() {
                var that = this;
                if (!that._refreshSizesHandler) {
                    that._refreshSizesHandler = function(e) {
                        if (!e || e.changeType === 'refresh' || e.changeType === 'append')
                            that.resize()
                    };
                    that._dataController.changed.add(that._refreshSizesHandler);
                    that._columnHeadersView.sizeChanged.add(that._refreshSizesHandler)
                }
            },
            _synchronizeColumns: function() {
                var that = this,
                    rowsColumnWidths = that._rowsView.getColumnWidths(),
                    headerColumnWidths = that._columnHeadersView.getColumnWidths(),
                    unusedIndexes = {length: 0},
                    hasAutoWidth = false,
                    hasPercentWidth = false,
                    $element = that.component._element(),
                    width = that.option('width'),
                    resultWidths = headerColumnWidths ? mergeArraysByMaxValue(rowsColumnWidths, headerColumnWidths) : rowsColumnWidths;
                $.each(that._columnsController.getVisibleColumns(), function(index) {
                    if (!this.width || this.width === 'auto')
                        hasAutoWidth = true;
                    if (isPercentWidth(this.width))
                        hasPercentWidth = true;
                    if (this.width && this.width !== 'auto') {
                        resultWidths[index] = this.width;
                        unusedIndexes[index] = true;
                        unusedIndexes.length++
                    }
                });
                if ($element)
                    $element.css('max-width', '');
                if (!hasAutoWidth && resultWidths.length) {
                    var totalWidth = that._getTotalWidth(resultWidths, that._groupElement.width() - that._rowsView.getScrollbarWidth());
                    if (totalWidth < that._groupElement.width() - that._rowsView.getScrollbarWidth()) {
                        resultWidths[resultWidths.length - 1] = 'auto';
                        $element.css('max-width', width && width !== 'auto' || hasPercentWidth ? '' : totalWidth)
                    }
                }
                if (that.option('columnAutoWidth') && resultWidths.length > 0)
                    that._processStretch(resultWidths, that._groupElement.width() - that._rowsView.getScrollbarWidth(), unusedIndexes);
                that._rowsView.setColumnWidths(resultWidths);
                that._columnHeadersView.setColumnWidths(resultWidths)
            },
            _processStretch: function(resultSizes, groupSize, unusedIndexes) {
                var tableSize = this._getTotalWidth(resultSizes, groupSize),
                    diff,
                    diffElement,
                    onePixelElementsCount,
                    i;
                diff = groupSize - tableSize;
                diffElement = Math.floor(diff / (resultSizes.length - unusedIndexes.length));
                onePixelElementsCount = diff - diffElement * (resultSizes.length - unusedIndexes.length);
                if (diff >= 0)
                    for (i = 0; i < resultSizes.length; i++) {
                        if (unusedIndexes[i])
                            continue;
                        resultSizes[i] += diffElement;
                        if (i < onePixelElementsCount)
                            resultSizes[i]++
                    }
            },
            _getTotalWidth: function(widths, groupWidth) {
                var result = 0,
                    width,
                    i;
                for (i = 0; i < widths.length; i++) {
                    width = widths[i];
                    if (width)
                        result += isPercentWidth(width) ? parseInt(width) * groupWidth / 100 : parseInt(width)
                }
                return Math.round(result)
            },
            getView: function(name) {
                return this.component._views[name]
            },
            getViews: function() {
                return this.component._views
            },
            resize: function() {
                var that = this,
                    dataController = that._dataController,
                    rootElementHeight = that._rootElement.height(),
                    loadPanelOptions = that.option('loadPanel'),
                    height = that.option('height'),
                    rowsViewHeight,
                    $testDiv;
                if (height && that._hasHeight ^ height !== 'auto') {
                    $testDiv = $('<div>').height(height).appendTo(that._rootElement);
                    that._hasHeight = !!$testDiv.height();
                    $testDiv.remove()
                }
                if (that._hasHeight && rootElementHeight > 0 && that.option('scrolling'))
                    that._rowsView.height(rootElementHeight - that._headerPanel.getHeight() - that._columnHeadersView.getHeight() - that._pagerView.getHeight());
                else if (!that._hasHeight && dataController.items().length === 0)
                    rowsViewHeight = loadPanelOptions && loadPanelOptions.visible ? loadPanelOptions.height + LOADPANEL_MARGIN : EMPTY_GRID_ROWS_HEIGHT;
                else
                    rowsViewHeight = 'auto';
                that._rowsView.height(rowsViewHeight);
                that._rowsView.resetColumnWidths();
                that._columnHeadersView.resetColumnWidths();
                that._columnHeadersView.setScrollerSpacing(that._rowsView.getScrollbarWidth());
                that._synchronizeColumns();
                $.each(VIEW_NAMES, function(index, viewName) {
                    var view = that.getView(viewName);
                    if (view)
                        view.resize()
                })
            },
            optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"width":
                    case"height":
                        this.resize()
                }
            },
            init: function() {
                var that = this;
                that._dataController = that.getController('data');
                that._columnsController = that.getController('columns');
                that._columnHeadersView = that.getView('columnHeadersView');
                that._headerPanel = that.getView('headerPanel');
                that._rowsView = that.getView('rowsView');
                that._pagerView = that.getView('pagerView');
                that._rowsView.scrollOffsetChanged.add(function(e) {
                    that._columnHeadersView.scrollOffset(e.left)
                });
                that._dataController.changed.add(function() {
                    that.component._fireContentReadyAction()
                });
                that._options = {}
            },
            element: function() {
                return this._groupElement
            },
            render: function(rootElement) {
                var that = this,
                    isFirstRender,
                    isLoading,
                    groupElement = that._groupElement || $('<div />').addClass(DATAGRID_CLASS);
                that._rootElement = rootElement || that._rootElement;
                isFirstRender = !that._groupElement;
                that._groupElement = groupElement;
                $.each(VIEW_NAMES, function(index, viewName) {
                    var view = that.getView(viewName);
                    if (view)
                        view.render(groupElement)
                });
                if (isFirstRender) {
                    that._hasHeight = !!that._rootElement.height();
                    that._groupElement = groupElement;
                    groupElement.appendTo(that._rootElement);
                    that._rowsView.renderDelayedTemplates()
                }
                that._initResizeHandlers();
                that.resize();
                isLoading = that._dataController.isLoading();
                if (!isLoading)
                    that.component._fireContentReadyAction();
                that._rowsView.setLoading(isLoading)
            }
        });
        dataGrid.registerModule("gridView", {views: {gridView: dataGrid.GridView}});
        $.extend(dataGrid.__internals, {
            viewNames: VIEW_NAMES,
            DATAGRID_CLASS: DATAGRID_CLASS
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.columnsResizingReorderingModule.js */
    (function($, DX) {
        var ui = DX.ui,
            events = ui.events,
            addNamespace = events.addNamespace,
            utils = DX.utils,
            dataGrid = ui.dataGrid,
            fx = DX.fx;
        var DATAGRID_COLUMNS_SEPARATOR_CLASS = "dx-datagrid-columns-separator",
            DATAGRID_COLUMNS_SEPARATOR_TRANSPARENT = "dx-datagrid-columns-separator-transparent",
            DATAGRID_DRAGGING_HEADER_CLASS = "dx-datagrid-drag-header",
            DATAGRID_CELL_CONTENT_CLASS = "dx-datagrid-text-content",
            DATAGTID_HEADERS_ACTION_CLASS = "dx-datagrid-action-cursor",
            DATAGRID_TRACKER_CLASS = "dx-datagrid-tracker",
            DATAGRID_BLOCK_SEPARATOR_CLASS = "dx-block-separator",
            DATAGRID_HEADERS_DROP_HIGHLIGHT_CLASS = 'dx-datagrid-drop-highlight',
            DATAGRID_HEADER_ROW_CLASS = "dx-header-row",
            WIDGET_CLASS = "dx-widget",
            DATAGRID_MODULE_NAMESPACE = "dxDataGridResizingReordering",
            COLUMNS_SEPARATOR_TOUCH_TRACKER_WIDTH = 10,
            DRAGGING_DELTA = 5;
        var allowResizing = function(that) {
                return that.option("allowColumnResizing") || that.getController("columns").isColumnOptionUsed("allowResizing")
            };
        var allowReordering = function(that) {
                return that.option("allowColumnReordering") || that.getController("columns").isColumnOptionUsed("allowReordering")
            };
        dataGrid.getPointsByColumns = function(items, pointCreated, isVertical) {
            var cellsLength = items.length,
                cancel = false,
                i,
                point,
                item,
                offset,
                result = [],
                rtlEnabled,
                columnIndex = 0;
            for (i = 0; i <= cellsLength; i++) {
                if (i < cellsLength) {
                    item = items.eq(columnIndex);
                    offset = item.offset();
                    rtlEnabled = item.css('direction') === 'rtl'
                }
                point = {
                    index: i,
                    x: offset ? offset.left + (!isVertical && rtlEnabled ^ i === cellsLength ? item.outerWidth() : 0) : 0,
                    y: offset ? offset.top + (isVertical && i === cellsLength ? item.outerHeight() : 0) : 0,
                    columnIndex: columnIndex
                };
                if (pointCreated)
                    cancel = pointCreated(point);
                if (!cancel)
                    result.push(point);
                columnIndex++
            }
            return result
        };
        dataGrid.TrackerView = dataGrid.View.inherit({
            _renderCore: function(options) {
                this.callBase();
                this._element().addClass(DATAGRID_TRACKER_CLASS);
                this.hide()
            },
            init: function() {
                var that = this,
                    $element;
                that.callBase();
                that.getController("tablePosition").positionChanged.add(function(position) {
                    $element = that._element();
                    if ($element && $element.hasClass(DATAGRID_TRACKER_CLASS)) {
                        $element.css({top: position.top});
                        $element.height(position.height)
                    }
                })
            },
            isVisible: function() {
                return allowResizing(this)
            },
            show: function() {
                this._element().show()
            },
            hide: function() {
                this._element().hide()
            },
            setHeight: function(value) {
                this._element().height(value)
            }
        });
        dataGrid.ColumnsSeparatorView = dataGrid.View.inherit({
            _isShown: true,
            _renderCore: function(options) {
                this.callBase(options);
                this._element().addClass(DATAGRID_COLUMNS_SEPARATOR_CLASS);
                this._isShown = true;
                this.hide()
            },
            _subscribeToEvent: function() {
                var that = this,
                    $element;
                that.getController("tablePosition").positionChanged.add(function(position) {
                    $element = that._element();
                    if ($element) {
                        $element.css({top: position.top});
                        $element.height(position.height)
                    }
                })
            },
            isVisible: function() {
                return this.option('showColumnHeaders') && (allowReordering(this) || allowResizing(this))
            },
            init: function() {
                this.callBase();
                this._isTransparent = allowResizing(this);
                if (this.isVisible())
                    this._subscribeToEvent()
            },
            show: function(targetLocation) {
                var that = this,
                    $element = this._element(),
                    startAnimate = function(toOptions) {
                        fx.stop($element, true);
                        fx.animate($element, {
                            type: "slide",
                            from: {
                                width: 0,
                                display: toOptions.display
                            },
                            to: toOptions,
                            duration: 300,
                            easing: "swing"
                        })
                    };
                if ($element && !that._isShown)
                    if (targetLocation === "group")
                        startAnimate({
                            width: "50px",
                            display: "inline-block"
                        });
                    else if (targetLocation === "columnChooser")
                        startAnimate({
                            width: "100%",
                            display: "block"
                        });
                    else if (that._isTransparent)
                        $element.removeClass(DATAGRID_COLUMNS_SEPARATOR_TRANSPARENT);
                    else
                        $element.show();
                that._isShown = true
            },
            hide: function() {
                var $element = this._element();
                if ($element && this._isShown)
                    if (this._isTransparent)
                        $element.addClass(DATAGRID_COLUMNS_SEPARATOR_TRANSPARENT);
                    else
                        $element.hide();
                this._isShown = false
            },
            height: function(value) {
                var $element = this._element();
                if ($element)
                    if (utils.isDefined(value))
                        $element.height(value);
                    else
                        return $element.height()
            },
            width: function(value) {
                var $element = this._element();
                if ($element)
                    if (utils.isDefined(value))
                        $element.width(value);
                    else
                        return $element.width()
            },
            moveByX: function(outerX) {
                var $element = this._element();
                if ($element) {
                    $element.css("left", outerX - this._parentElement().offset().left);
                    this._testPosx = outerX
                }
            },
            changeCursor: function(cursorName) {
                cursorName = utils.isDefined(cursorName) ? cursorName : "";
                var $element = this._element();
                if ($element) {
                    $element.css('cursor', cursorName);
                    this._testCursorName = cursorName
                }
            }
        });
        dataGrid.BlockSeparatorView = dataGrid.ColumnsSeparatorView.inherit({
            _subscribeToEvent: function(){},
            _renderCore: function(options) {
                this._isTransparent = false;
                this.callBase(options);
                this._element().addClass(DATAGRID_BLOCK_SEPARATOR_CLASS).html('&nbsp;')
            },
            hide: function() {
                var that = this,
                    $parent = this._parentElement();
                that.callBase();
                if ($parent && !$parent.children('.' + DATAGRID_BLOCK_SEPARATOR_CLASS).length)
                    $parent.prepend(that._element())
            },
            isVisible: function() {
                var groupPanelOptions = this.option("groupPanel"),
                    columnChooserOptions = this.option('columnChooser');
                return groupPanelOptions && groupPanelOptions.visible || columnChooserOptions && columnChooserOptions.enabled
            }
        });
        dataGrid.DraggingHeaderView = dataGrid.View.inherit({
            _isDragging: false,
            _getDropOptions: function() {
                var that = this;
                if (that._dragOptions)
                    return {
                            sourceColumnIndex: that._dragOptions.columnIndex,
                            sourceColumnElement: that._dragOptions.columnElement,
                            sourceLocation: that._dragOptions.sourceLocation,
                            targetColumnIndex: that._dropColumnIndex,
                            targetLocation: that._dropLocation
                        }
            },
            _dropHeader: function(args) {
                var e = args.jQueryEvent,
                    that = e.data.that,
                    controller = that._controller;
                that._element().hide();
                if (controller && that._isDragging)
                    controller.drop(that._getDropOptions());
                that._element().appendTo(that._parentElement());
                that._dragOptions = null;
                that._isDragging = false;
                document.onselectstart = that._onSelectStart || null
            },
            _getDraggingPanelByPos: function(pos) {
                var that = this,
                    result;
                $.each(that._dragOptions.draggingPanels, function(index, draggingPanel) {
                    if (draggingPanel) {
                        var boundingRect = draggingPanel.getBoundingRect();
                        if (boundingRect && (boundingRect.bottom === undefined || pos.y < boundingRect.bottom) && (boundingRect.top === undefined || pos.y > boundingRect.top) && (boundingRect.left === undefined || pos.x > boundingRect.left) && (boundingRect.right === undefined || pos.x < boundingRect.right)) {
                            result = draggingPanel;
                            return false
                        }
                    }
                });
                return result
            },
            _pointCreated: function(point, columns, location, sourceColumn) {
                var targetColumn = columns[point.columnIndex],
                    prevColumn = columns[point.columnIndex - 1];
                switch (location) {
                    case"columnChooser":
                        return true;
                    case"headers":
                        return sourceColumn && !sourceColumn.allowReordering || (!targetColumn || !targetColumn.allowReordering) && (!prevColumn || !prevColumn.allowReordering);
                    default:
                        return columns.length === 0
                }
            },
            _moveHeader: function(args) {
                var e = args.jQueryEvent,
                    that = e.data.that,
                    columnElements,
                    pointsByColumns,
                    newLeft,
                    newTop,
                    moveDeltaX,
                    moveDeltaY,
                    eventData = events.eventData(e),
                    targetDraggingPanel,
                    controller = that._controller,
                    i,
                    params,
                    dragOptions = that._dragOptions,
                    isVerticalOrientation,
                    centerPosition,
                    axisName,
                    rtlEnabled;
                if (that._isDragging) {
                    moveDeltaX = Math.abs(eventData.x - dragOptions.columnElement.offset().left - dragOptions.deltaX);
                    moveDeltaY = Math.abs(eventData.y - dragOptions.columnElement.offset().top - dragOptions.deltaY);
                    if (that._element().is(':visible') || moveDeltaX > DRAGGING_DELTA || moveDeltaY > DRAGGING_DELTA) {
                        that._element().show();
                        newLeft = eventData.x - dragOptions.deltaX;
                        newTop = eventData.y - dragOptions.deltaY;
                        that._element().offset({
                            left: newLeft,
                            top: newTop
                        });
                        targetDraggingPanel = that._getDraggingPanelByPos(eventData);
                        if (targetDraggingPanel) {
                            rtlEnabled = that.option('rtlEnabled');
                            isVerticalOrientation = targetDraggingPanel.getName() === 'columnChooser';
                            axisName = isVerticalOrientation ? 'y' : 'x';
                            columnElements = targetDraggingPanel.getColumnElements() || [];
                            pointsByColumns = dataGrid.getPointsByColumns(columnElements, function(point) {
                                return that._pointCreated(point, targetDraggingPanel.getColumns(), targetDraggingPanel.getName(), dragOptions.sourceColumn)
                            }, axisName === 'y');
                            that._dropLocation = targetDraggingPanel.getName();
                            if (pointsByColumns.length > 0)
                                for (i = 0; i < pointsByColumns.length; i++) {
                                    centerPosition = pointsByColumns[i + 1] && (pointsByColumns[i][axisName] + pointsByColumns[i + 1][axisName]) / 2;
                                    if (centerPosition === undefined || (rtlEnabled && axisName === 'x' ? eventData[axisName] > centerPosition : eventData[axisName] < centerPosition)) {
                                        that._dropColumnIndex = pointsByColumns[i].columnIndex;
                                        params = that._getDropOptions();
                                        if (columnElements[i])
                                            params.targetColumnElement = columnElements.eq(i);
                                        else {
                                            params.targetColumnElement = columnElements.last();
                                            params.isLast = true
                                        }
                                        params.posX = pointsByColumns[i].x;
                                        controller.dock(params);
                                        break
                                    }
                                }
                            else {
                                that._dropColumnIndex = -1;
                                params = that._getDropOptions();
                                controller.dock(params)
                            }
                        }
                    }
                    e.preventDefault()
                }
            },
            _subscribeToEvents: function(rootElement) {
                var that = this;
                that._moveHeaderAction = this.createAction(this._moveHeader, {excludeValidators: ['gesture']});
                that._dropHeaderAction = this.createAction(this._dropHeader, {excludeValidators: ['gesture']});
                $(document).on(addNamespace('dxpointermove', DATAGRID_MODULE_NAMESPACE), {
                    that: that,
                    rootElement: rootElement
                }, that._moveHeaderAction);
                that._element().on(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), {that: that}, that._dropHeaderAction);
                $(document).on(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), {that: that}, that._dropHeaderAction)
            },
            _renderCore: function() {
                this._element().addClass(DATAGRID_DRAGGING_HEADER_CLASS + ' ' + DATAGRID_CELL_CONTENT_CLASS + ' ' + WIDGET_CLASS).css('display', 'none')
            },
            _afterRender: function($parent) {
                this._unsubscribeFromEvents();
                this._subscribeToEvents($parent)
            },
            _unsubscribeFromEvents: function() {
                if (this._dropHeaderAction) {
                    this._element().off(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), this._dropHeaderAction);
                    $(document).off(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), this._dropHeaderAction)
                }
                if (this._moveHeaderAction)
                    $(document).off(addNamespace('dxpointermove', DATAGRID_MODULE_NAMESPACE), this._moveHeaderAction)
            },
            dispose: function() {
                this._dragOptions = null;
                this._unsubscribeFromEvents();
                this._element().parent().find('.' + DATAGRID_DRAGGING_HEADER_CLASS).remove()
            },
            isVisible: function() {
                var columnsController = this.getController("columns"),
                    commonColumnSettings = columnsController.getCommonSettings();
                return this.option('showColumnHeaders') && (allowReordering(this) || commonColumnSettings.allowGrouping || commonColumnSettings.allowHiding)
            },
            init: function() {
                this.callBase();
                this._controller = this.getController("draggingHeader")
            },
            drag: function(options) {
                var that = this,
                    columnElement = options.columnElement;
                that._dragOptions = options;
                that._isDragging = true;
                that._dropColumnIndex = options.columnIndex;
                that._dropLocation = options.sourceLocation;
                that._onSelectStart = document.onselectstart;
                document.onselectstart = function() {
                    return false
                };
                that._element().css({
                    textAlign: columnElement && columnElement.css('text-align'),
                    height: columnElement && columnElement.height(),
                    width: columnElement && columnElement.width(),
                    whiteSpace: columnElement && columnElement.css('white-space')
                }).addClass(DATAGTID_HEADERS_ACTION_CLASS).text(options.sourceColumn.caption);
                that._element().appendTo($(document.body))
            }
        });
        dataGrid.ColumnsResizerViewController = dataGrid.ViewController.inherit({
            _pointCreated: function(point, cellsLength, columns) {
                var currentColumn,
                    nextColumn;
                if (point.index > 0 && point.index < cellsLength) {
                    point.columnIndex -= 1;
                    currentColumn = columns[point.columnIndex] || {};
                    nextColumn = columns[point.columnIndex + 1] || {};
                    return !(currentColumn.allowResizing && nextColumn.allowResizing)
                }
                return true
            },
            _getTargetPoint: function(pointsByColumns, currentX, deltaX) {
                if (pointsByColumns)
                    for (var i = 0; i < pointsByColumns.length; i++)
                        if (pointsByColumns[i].x - deltaX <= currentX && currentX <= pointsByColumns[i].x + deltaX)
                            return pointsByColumns[i];
                return null
            },
            _moveSeparator: function(args) {
                var e = args.jQueryEvent,
                    that = e.data,
                    pointsByColumns = that._pointsByColumns,
                    columnsSeparatorWidth = that._columnsSeparatorView.width(),
                    columnsSeparatorOffset = that._columnsSeparatorView._element().offset(),
                    deltaX = columnsSeparatorWidth / 2,
                    parentOffsetLeft = that._$parentContainer.offset().left,
                    eventData = events.eventData(e);
                if (that._isResizing) {
                    if (parentOffsetLeft <= eventData.x && eventData.x <= parentOffsetLeft + that._$parentContainer.width())
                        if (that._updateColumnsWidthIfNeeded(that._targetPoint.columnIndex, eventData.x)) {
                            that._columnsSeparatorView.moveByX(that._targetPoint.x + (eventData.x - that._resizingInfo.startPosX));
                            that._tablePositionController.update();
                            e.preventDefault()
                        }
                }
                else {
                    that._targetPoint = that._getTargetPoint(pointsByColumns, eventData.x, columnsSeparatorWidth);
                    that._isReadyResizing = false;
                    that._columnsSeparatorView.changeCursor();
                    if (that._targetPoint && columnsSeparatorOffset.top <= eventData.y && columnsSeparatorOffset.top + that._columnsSeparatorView.height() >= eventData.y) {
                        that._columnsSeparatorView.changeCursor('col-resize');
                        that._columnsSeparatorView.moveByX(that._targetPoint.x - deltaX);
                        that._isReadyResizing = true;
                        e.preventDefault()
                    }
                }
            },
            _endResizing: function(args) {
                var e = args.jQueryEvent,
                    that = e.data;
                if (that._isResizing) {
                    that._updatePointsByColumns();
                    that._resizingInfo = null;
                    that._columnsSeparatorView.hide();
                    that._columnsSeparatorView.changeCursor();
                    that._trackerView.hide();
                    that._isReadyResizing = false;
                    that._isResizing = false
                }
            },
            _setupResizingInfo: function(posX) {
                var that = this,
                    currentHeader = that._columnHeadersView.getHeaderElement(that._targetPoint.columnIndex),
                    nextHeader = that._columnHeadersView.getHeaderElement(that._targetPoint.columnIndex + 1);
                that._resizingInfo = {
                    startPosX: posX,
                    currentColumnWidth: currentHeader && currentHeader.length > 0 ? currentHeader.outerWidth() : 0,
                    nextColumnWidth: nextHeader && nextHeader.length > 0 ? nextHeader.outerWidth() : 0
                }
            },
            _startResizing: function(args) {
                var e = args.jQueryEvent,
                    that = e.data,
                    eventData = events.eventData(e);
                if (events.isTouchEvent(e)) {
                    that._targetPoint = that._getTargetPoint(that._pointsByColumns, eventData.x, COLUMNS_SEPARATOR_TOUCH_TRACKER_WIDTH);
                    if (that._targetPoint) {
                        that._columnsSeparatorView.moveByX(that._targetPoint.x - that._columnsSeparatorView.width() / 2);
                        that._isReadyResizing = true
                    }
                }
                if (that._isReadyResizing) {
                    if (that._targetPoint)
                        that._testColumnIndex = that._targetPoint.columnIndex;
                    that._setupResizingInfo(eventData.x);
                    that._columnsSeparatorView.show();
                    that._trackerView.show();
                    that._isResizing = true;
                    e.preventDefault()
                }
            },
            _generatePointsByColumns: function() {
                var that = this,
                    columns = that._columnsController ? that._columnsController.getVisibleColumns() : [],
                    cells = that._columnHeadersView.getColumnElements(),
                    pointsByColumns = [];
                if (cells && cells.length > 0)
                    pointsByColumns = dataGrid.getPointsByColumns(cells, function(point) {
                        return that._pointCreated(point, cells.length, columns)
                    });
                that._pointsByColumns = pointsByColumns
            },
            _unsubscribeFromEvents: function() {
                this._moveSeparatorHandler && this._$parentContainer.off(addNamespace('dxpointermove', DATAGRID_MODULE_NAMESPACE), this._moveSeparatorHandler);
                this._startResizingHandler && this._columnsSeparatorView._element().off(addNamespace('dxpointerdown', DATAGRID_MODULE_NAMESPACE), this._startResizingHandler);
                if (this._endResizingHandler) {
                    this._columnsSeparatorView._element().off(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), this._endResizingHandler);
                    $(document).off(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), this._endResizingHandler)
                }
            },
            _subscribeToEvents: function() {
                this._moveSeparatorHandler = this.createAction(this._moveSeparator, {excludeValidators: ['gesture']});
                this._startResizingHandler = this.createAction(this._startResizing);
                this._endResizingHandler = this.createAction(this._endResizing, {excludeValidators: ['gesture']});
                this._$parentContainer.on(addNamespace('dxpointermove', DATAGRID_MODULE_NAMESPACE), this, this._moveSeparatorHandler);
                this._$parentContainer.on(addNamespace('dxpointerdown', DATAGRID_MODULE_NAMESPACE), this, this._startResizingHandler);
                this._columnsSeparatorView._element().on(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), this, this._endResizingHandler);
                $(document).on(addNamespace('dxpointerup', DATAGRID_MODULE_NAMESPACE), this, this._endResizingHandler)
            },
            _updateColumnsWidthIfNeeded: function(columnIndex, posX) {
                var deltaX,
                    isUpdated = false,
                    nextCellWidth,
                    visibleColumns = this._columnsController.getVisibleColumns(),
                    columnsSeparatorWidth = this._columnsSeparatorView.width(),
                    cellWidth;
                deltaX = posX - this._resizingInfo.startPosX;
                if (this.option("rtlEnabled"))
                    deltaX = -deltaX;
                cellWidth = this._resizingInfo.currentColumnWidth + deltaX;
                nextCellWidth = this._resizingInfo.nextColumnWidth - deltaX;
                isUpdated = !(cellWidth <= columnsSeparatorWidth || nextCellWidth <= columnsSeparatorWidth);
                if (isUpdated) {
                    visibleColumns[columnIndex] && this._columnsController.columnOption(visibleColumns[columnIndex].initialIndex, 'width', Math.floor(cellWidth));
                    visibleColumns[columnIndex + 1] && this._columnsController.columnOption(visibleColumns[columnIndex + 1].initialIndex, 'width', Math.floor(nextCellWidth))
                }
                return isUpdated
            },
            _updatePointsByColumns: function() {
                var i,
                    point,
                    rtlEnabled = this.option("rtlEnabled"),
                    headerElement;
                for (i = 0; i < this._pointsByColumns.length; i++) {
                    point = this._pointsByColumns[i];
                    headerElement = this._columnHeadersView.getHeaderElement(point.columnIndex + 1);
                    if (headerElement && headerElement.length > 0)
                        point.x = headerElement.offset().left + (rtlEnabled ? headerElement.outerWidth() : 0)
                }
            },
            init: function() {
                var that = this,
                    gridView,
                    previousScrollbarVisibility,
                    generatePointsByColumnsScrollHandler = function(offset) {
                        if (that._scrollLeft !== offset.left) {
                            that._scrollLeft = offset.left;
                            that._generatePointsByColumns()
                        }
                    },
                    generatePointsByColumnsHandler = function() {
                        that._generatePointsByColumns()
                    };
                that.callBase();
                if (allowResizing(that)) {
                    that._columnsSeparatorView = that.getView("columnsSeparatorView");
                    that._columnHeadersView = that.getView("columnHeadersView");
                    that._trackerView = that.getView("trackerView");
                    that._rowsView = that.getView("rowsView");
                    that._columnsController = that.getController("columns");
                    that._tablePositionController = that.getController("tablePosition");
                    that._$parentContainer = that._columnsSeparatorView.component._element();
                    that._columnHeadersView.renderCompleted.add(generatePointsByColumnsHandler);
                    that._columnHeadersView.resizeCompleted.add(generatePointsByColumnsHandler);
                    that._columnsSeparatorView.renderCompleted.add(function() {
                        that._unsubscribeFromEvents();
                        that._subscribeToEvents()
                    });
                    that._rowsView.renderCompleted.add(function() {
                        that._rowsView.scrollOffsetChanged.remove(generatePointsByColumnsScrollHandler);
                        that._rowsView.scrollOffsetChanged.add(generatePointsByColumnsScrollHandler)
                    });
                    gridView = that.getView("gridView");
                    previousScrollbarVisibility = that._rowsView.getScrollbarWidth() !== 0;
                    that.getController("tablePosition").positionChanged.add(function() {
                        if (that._isResizing && !that._rowsView.isResizing) {
                            var scrollbarVisibility = that._rowsView.getScrollbarWidth() !== 0;
                            if (previousScrollbarVisibility !== scrollbarVisibility) {
                                previousScrollbarVisibility = scrollbarVisibility;
                                gridView.resize()
                            }
                            else {
                                that._rowsView.updateFreeSpaceRowHeight();
                                that._columnHeadersView.processSizeChanged()
                            }
                        }
                    })
                }
            },
            dispose: function() {
                this._unsubscribeFromEvents()
            }
        });
        dataGrid.TablePositionViewController = dataGrid.ViewController.inherit({
            update: function() {
                var $element = this._columnHeadersView._element(),
                    columnsHeadersHeight = this._columnHeadersView ? this._columnHeadersView.getHeight() : 0,
                    rowsHeight = this._rowsView ? this._rowsView.height() - this._rowsView.getScrollbarWidth(true) : 0;
                this.positionChanged.fire({
                    height: columnsHeadersHeight + rowsHeight,
                    top: $element && $element.length > 0 ? Math.floor($element[0].offsetTop) : 0
                })
            },
            init: function() {
                var that = this;
                that.callBase();
                that._columnHeadersView = this.getView("columnHeadersView");
                that._rowsView = this.getView("rowsView");
                that._pagerView = this.getView("pagerView");
                that._rowsView.resizeCompleted.add(function() {
                    that.update()
                })
            },
            ctor: function(component) {
                this.callBase(component);
                this.positionChanged = $.Callbacks()
            }
        });
        dataGrid.DraggingHeaderViewController = dataGrid.ViewController.inherit({
            _subscribeToEvent: function(draggingHeader, draggingPanels) {
                var that = this;
                $.each(draggingPanels, function(_, draggingPanel) {
                    if (draggingPanel) {
                        var columnElements = draggingPanel.getColumnElements() || [],
                            nameDraggingPanel = draggingPanel.getName(),
                            columns = draggingPanel.getColumns() || [];
                        $.each(columnElements, function(index, columnElement) {
                            $(columnElement).off(addNamespace('dxpointerdown', DATAGRID_MODULE_NAMESPACE));
                            if (draggingPanel.allowDragging(columns[index], draggingPanels))
                                $(columnElement).on(addNamespace('dxpointerdown', DATAGRID_MODULE_NAMESPACE), that.createAction(function(args) {
                                    var e = args.jQueryEvent,
                                        eventData = events.eventData(e);
                                    e.preventDefault();
                                    draggingHeader.drag({
                                        deltaX: eventData.x - $(e.currentTarget).offset().left,
                                        deltaY: eventData.y - $(e.currentTarget).offset().top,
                                        sourceColumn: columns[index],
                                        columnIndex: index,
                                        columnElement: $(columnElement),
                                        sourceLocation: draggingPanel.getName(),
                                        draggingPanels: draggingPanels
                                    })
                                }))
                        })
                    }
                })
            },
            _getSeparator: function(targetLocation) {
                return targetLocation === "headers" ? this._columnsSeparatorView : this._blockSeparatorView
            },
            hideSeparators: function() {
                var blockSeparator = this._blockSeparatorView,
                    columnsSeparator = this._columnsSeparatorView;
                this._animationColumnIndex = null;
                blockSeparator && blockSeparator.hide();
                columnsSeparator && columnsSeparator.hide()
            },
            init: function() {
                var that = this,
                    subscribeToEvent;
                that.callBase();
                that._columnsController = that.getController("columns");
                that._columnHeadersView = that.getView("columnHeadersView");
                that._columnsSeparatorView = that.getView("columnsSeparatorView");
                that._draggingHeaderView = that.getView("draggingHeaderView");
                that._rowsView = that.getView('rowsView');
                that._blockSeparatorView = that.getView("blockSeparatorView");
                that._headerPanelView = that.getView("headerPanel");
                that._columnChooserView = that.getView("columnChooserView");
                subscribeToEvent = function() {
                    if (that._draggingHeaderView)
                        that._subscribeToEvent(that._draggingHeaderView, [that._columnChooserView, that._columnHeadersView, that._headerPanelView])
                };
                that._columnHeadersView.renderCompleted.add(subscribeToEvent);
                that._headerPanelView.renderCompleted.add(subscribeToEvent);
                that._columnChooserView.renderCompleted.add(subscribeToEvent)
            },
            allowDrop: function(parameters) {
                return this._columnsController.allowMoveColumn(parameters.sourceColumnIndex, parameters.targetColumnIndex, parameters.sourceLocation, parameters.targetLocation)
            },
            allowDragColumn: function(columns, index, namePanel) {
                var column = columns[index],
                    i,
                    draggableColumnCount = 0;
                var allowDragFromHeaders = function(column) {
                        return column.allowReordering || column.allowGrouping || column.allowHiding
                    };
                if (!column)
                    return false;
                switch (namePanel) {
                    case"headers":
                        for (i = 0; i < columns.length; i++)
                            if (allowDragFromHeaders(columns[i]))
                                draggableColumnCount++;
                        return draggableColumnCount > 1 && allowDragFromHeaders(column);
                    case"group":
                        return column.allowGrouping;
                    case"columnChooser":
                        return column.allowHiding
                }
            },
            dock: function(parameters) {
                var that = this,
                    targetColumnIndex = parameters.targetColumnIndex,
                    sourceLocation = parameters.sourceLocation,
                    sourceColumnIndex = parameters.sourceColumnIndex,
                    sourceColumnElement = parameters.sourceColumnElement,
                    targetLocation = parameters.targetLocation,
                    separator = that._getSeparator(targetLocation),
                    hasTargetColumnIndex = targetColumnIndex >= 0;
                var showSeparator = function() {
                        if (that._animationColumnIndex !== targetColumnIndex) {
                            that.hideSeparators();
                            separator._element()[parameters.isLast ? 'insertAfter' : 'insertBefore'](parameters.targetColumnElement);
                            that._animationColumnIndex = targetColumnIndex;
                            separator.show(targetLocation)
                        }
                    };
                that._columnHeadersView._element().find('.' + DATAGRID_HEADER_ROW_CLASS).first().toggleClass(DATAGRID_HEADERS_DROP_HIGHLIGHT_CLASS, sourceLocation !== 'headers' && targetLocation === 'headers' && !hasTargetColumnIndex);
                if (separator) {
                    if (sourceColumnElement) {
                        sourceColumnElement.css({opacity: 0.5});
                        if (sourceLocation === 'headers')
                            that._rowsView.setRowsOpacity(sourceColumnIndex, 0.5)
                    }
                    if (that.allowDrop(parameters) && hasTargetColumnIndex)
                        if (targetLocation === 'group' || targetLocation === 'columnChooser')
                            showSeparator();
                        else {
                            that.hideSeparators();
                            separator.moveByX(parameters.posX - separator.width());
                            separator.show()
                        }
                    else
                        that.hideSeparators()
                }
            },
            drop: function(parameters) {
                var sourceColumnElement = parameters.sourceColumnElement;
                if (sourceColumnElement) {
                    sourceColumnElement.css({opacity: ''});
                    this._rowsView.setRowsOpacity(parameters.sourceColumnIndex, '');
                    this._columnHeadersView._element().find('.' + DATAGRID_HEADER_ROW_CLASS).first().removeClass(DATAGRID_HEADERS_DROP_HIGHLIGHT_CLASS)
                }
                if (this.allowDrop(parameters)) {
                    var separator = this._getSeparator(parameters.targetLocation);
                    if (separator)
                        separator.hide();
                    this._columnsController.moveColumn(parameters.sourceColumnIndex, parameters.targetColumnIndex, parameters.sourceLocation, parameters.targetLocation)
                }
            }
        });
        dataGrid.__internals = $.extend({}, dataGrid.__internals, {
            DATAGRID_COLUMNS_SEPARATOR_CLASS: DATAGRID_COLUMNS_SEPARATOR_CLASS,
            DATAGRID_COLUMNS_SEPARATOR_TRANSPARENT: DATAGRID_COLUMNS_SEPARATOR_TRANSPARENT,
            DATAGRID_DRAGGING_HEADER_CLASS: DATAGRID_DRAGGING_HEADER_CLASS,
            DATAGRID_CELL_CONTENT_CLASS: DATAGRID_CELL_CONTENT_CLASS,
            DATAGTID_HEADERS_ACTION_CLASS: DATAGTID_HEADERS_ACTION_CLASS,
            DATAGRID_TRACKER_CLASS: DATAGRID_TRACKER_CLASS,
            DATAGRID_MODULE_NAMESPACE: DATAGRID_MODULE_NAMESPACE,
            DATAGRID_HEADERS_DROP_HIGHLIGHT_CLASS: DATAGRID_HEADERS_DROP_HIGHLIGHT_CLASS,
            WIDGET_CLASS: WIDGET_CLASS
        });
        dataGrid.registerModule("columnsResizingReordering", {
            views: {
                columnsSeparatorView: dataGrid.ColumnsSeparatorView,
                blockSeparatorView: dataGrid.BlockSeparatorView,
                draggingHeaderView: dataGrid.DraggingHeaderView,
                trackerView: dataGrid.TrackerView
            },
            controllers: {
                draggingHeader: dataGrid.DraggingHeaderViewController,
                tablePosition: dataGrid.TablePositionViewController,
                columnsResizer: dataGrid.ColumnsResizerViewController
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.contextMenuView.js */
    (function($, DX) {
        var ui = DX.ui,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        var DATAGRID_CLASS = "dx-datagrid",
            DATAGRID_CONTEXT_MENU = "dx-context-menu";
        dataGrid.ContextMenuView = dataGrid.View.inherit({
            viewNames: function() {
                return ["columnHeadersView"]
            },
            _renderCore: function() {
                var that = this;
                that._element().addClass(DATAGRID_CONTEXT_MENU).dxContextMenu({
                    positioningAction: function(actionArgs) {
                        var event = actionArgs.jQueryEvent,
                            $targetElement = $(event.target),
                            contextMenuInstance = actionArgs.component,
                            items = [];
                        $.each(that.viewNames(), function(index, viewName) {
                            var view = that.getView(viewName),
                                menuItems = view.getContextMenuItems($targetElement);
                            if (menuItems.length) {
                                items = menuItems;
                                return false
                            }
                        });
                        if (items.length)
                            contextMenuInstance.option('items', items);
                        else
                            actionArgs.canceled = true
                    },
                    itemClickAction: function(params) {
                        params.itemData.itemClickAction && params.itemData.itemClickAction(params)
                    },
                    rtlEnabled: that.option('rtlEnabled'),
                    cssClass: DATAGRID_CLASS,
                    target: that.component._element()
                })
            }
        });
        dataGrid.registerModule("contextMenu", {views: {contextMenuView: dataGrid.ContextMenuView}})
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.keyboardNavigation.js */
    (function($, DX) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            dataGrid = ui.dataGrid;
        var DATAGRID_ROW_CLASS = "dx-row",
            DATAGRID_GROUP_ROW_CLASS = "dx-group-row",
            DATAGRID_EDITING_MODE_BATCH = "batch",
            DATAGRID_ROWS_VIEW_CLASS = "dx-datagrid-rowsview",
            DATAGRID_VIEWS = ["rowsView"];
        dataGrid.KeyboardNavigationController = dataGrid.ViewController.inherit({
            _focusView: function(view, viewIndex) {
                view.focus();
                this._focusedViews.viewIndex = viewIndex;
                this._focusedView = view
            },
            _initFocusedViews: function() {
                var that = this,
                    $cell,
                    $input,
                    clickHandler = that.createAction(function(e) {
                        var event = e.jQueryEvent,
                            $cell = $(event.currentTarget);
                        if (!that._editingController.isEditing())
                            if (that._isCellValid($cell)) {
                                $cell.focus();
                                that._focusView(event.data.view, event.data.viewIndex);
                                that._updateFocusedCellPosition($cell)
                            }
                            else
                                that._resetFocusedCell(that)
                    });
                that._focusedViews = [];
                $.each(DATAGRID_VIEWS, function(key, viewName) {
                    var view = that.getView(viewName);
                    if (view.isVisible())
                        that._focusedViews.push(view)
                });
                $.each(that._focusedViews, function(index, view) {
                    if (view)
                        view.renderCompleted.add(function() {
                            var $element = view._element();
                            $element.off(events.addNamespace("dxpointerdown", "dxDataGridKeyboardNavigation"), clickHandler);
                            $element.on(events.addNamespace("dxpointerdown", "dxDataGridKeyboardNavigation"), "." + DATAGRID_ROW_CLASS + " td", {
                                viewIndex: index,
                                view: view
                            }, clickHandler);
                            that._initKeyDownProcessor(that, $element, that._keyDownHandler);
                            if (that._focusedView && that._focusedView.name === view.name && that._isKeyDown) {
                                $cell = that._getFocusedCell();
                                if ($cell && $cell.length > 0) {
                                    that._focusView(view, index);
                                    if (that.getController('editorFactory').focus())
                                        that._focus($cell);
                                    setTimeout(function() {
                                        if (that._editingController.isEditing()) {
                                            $input = $cell.find('input').first();
                                            that._testFocusedInput = $input;
                                            $input.focus()
                                        }
                                        else {
                                            $cell.attr("tabindex", 0);
                                            $cell.focus()
                                        }
                                    })
                                }
                            }
                        })
                })
            },
            _initKeyDownProcessor: function(context, element, handler) {
                if (this._keyDownProcessor) {
                    this._keyDownProcessor.dispose();
                    this._keyDownProcessor = null
                }
                this._keyDownProcessor = new ui.HierarchicalKeyDownProcessor({
                    element: element,
                    context: context,
                    handler: handler
                })
            },
            _focusCell: function($cell) {
                var that = this;
                if ($cell) {
                    that.getController('editorFactory').focus($cell);
                    that._updateFocusedCellPosition($cell)
                }
            },
            _focusGroupRow: function($row) {
                if ($row) {
                    this.getController('editorFactory').focus($row);
                    this._focusedCellPosition.rowIndex = this._focusedView.getRowIndex($row)
                }
            },
            _getFocusedCell: function() {
                if (this._focusedView && this._focusedCellPosition)
                    return this._focusedView.getCell(this._focusedCellPosition.columnIndex, this._focusedCellPosition.rowIndex)
            },
            _moveScrollbar: function(keyCode) {
                var scrollable = this._focusedView ? this._focusedView._scrollable : null,
                    scrollOffset,
                    $cell,
                    table,
                    offsetTop,
                    offsetLeft,
                    targetLocationObject;
                if (scrollable) {
                    $cell = this._getFocusedCell();
                    if ($cell) {
                        table = this._focusedView.getTableFromCell($cell)[0];
                        offsetTop = $cell[0].offsetTop + table.offsetTop;
                        offsetLeft = $cell[0].offsetLeft + table.offsetLeft;
                        scrollOffset = scrollable.scrollOffset();
                        targetLocationObject = {
                            x: scrollOffset.left,
                            y: scrollOffset.top
                        };
                        switch (keyCode) {
                            case"downArrow":
                                if (offsetTop + $cell.height() > scrollOffset.top + scrollable.clientHeight())
                                    targetLocationObject.y += scrollable.clientHeight();
                                break;
                            case"upArrow":
                                if (offsetTop < scrollOffset.top)
                                    targetLocationObject.y -= scrollable.clientHeight();
                                break;
                            case"leftArrow":
                                if (offsetLeft < scrollOffset.left)
                                    targetLocationObject.x -= scrollable.clientWidth();
                                break;
                            case"rightArrow":
                                if (offsetLeft + $cell.width() > scrollOffset.left + scrollable.clientWidth())
                                    targetLocationObject.x += scrollable.clientWidth();
                                break
                        }
                        scrollable.scrollTo(targetLocationObject)
                    }
                }
            },
            _updateFocusedCellPosition: function($cell) {
                var that = this;
                if ($cell.length > 0)
                    this._focusedCellPosition = {
                        columnIndex: $cell[0].cellIndex,
                        rowIndex: $cell.parent().length > 0 && that._focusedView ? that._focusedView.getRowIndex($cell.parent()) : null
                    }
            },
            _isCellValid: function($cell) {
                var visibleColumns = this._columnsController.getVisibleColumns(),
                    columnIndex = $cell[0].cellIndex;
                return visibleColumns.length > columnIndex && !(visibleColumns[columnIndex].command || utils.isDefined(visibleColumns[columnIndex].groupIndex))
            },
            _isGroupRow: function($row) {
                return $row && $row.hasClass(DATAGRID_GROUP_ROW_CLASS)
            },
            _focus: function($cell) {
                var $row = $cell && $cell.parent();
                if (this._isGroupRow($row))
                    this._focusGroupRow($row);
                else
                    this._focusCell($cell)
            },
            _keyDownHandler: function(e) {
                var editingOptions = this.option("editing"),
                    isEditing = this._editingController.isEditing(),
                    pageIndex = this._dataController.pageIndex(),
                    pagesCount = this._dataController.pageCount(),
                    rowIndex = this._focusedCellPosition ? this._focusedCellPosition.rowIndex : null,
                    $row = this._focusedView && this._focusedView.getRow(rowIndex),
                    $cell;
                this._isKeyDown = true;
                switch (e.key) {
                    case"leftArrow":
                    case"rightArrow":
                        if (!isEditing && !this._isGroupRow($row)) {
                            $cell = this._getNextCell(e.key);
                            if ($cell && this._isCellValid($cell)) {
                                this._focusCell($cell);
                                this._moveScrollbar(e.key)
                            }
                            e.originalEvent.preventDefault()
                        }
                        break;
                    case"upArrow":
                    case"downArrow":
                        if (!isEditing) {
                            if (rowIndex === 0 || rowIndex === this._focusedView.getRowsCount() - 1);
                            $cell = this._getNextCell(e.key);
                            if ($cell && this._isCellValid($cell)) {
                                this._focus($cell);
                                this._moveScrollbar(e.key)
                            }
                            e.originalEvent.preventDefault()
                        }
                        break;
                    case"pageUp":
                        if (pageIndex > 0) {
                            this._dataController.pageIndex(pageIndex - 1);
                            e.originalEvent.preventDefault()
                        }
                        break;
                    case"pageDown":
                        if (pageIndex < pagesCount - 1) {
                            this._dataController.pageIndex(pageIndex + 1);
                            e.originalEvent.preventDefault()
                        }
                        break;
                    case"space":
                        if (this.option("selection") && this.option("selection").mode !== "none" && !isEditing)
                            this._selectionController.changeItemSelection(rowIndex, {
                                shift: e.shift,
                                control: e.ctrl
                            });
                        break;
                    case"A":
                        if (e.ctrl && this.option("selection.mode") === "multiple" && this.option("selection.allowSelectAll")) {
                            this._selectionController.selectAll();
                            e.originalEvent.preventDefault()
                        }
                        break;
                    case"tab":
                        if (isEditing && this._editingController.getEditMode() === DATAGRID_EDITING_MODE_BATCH && e.originalEvent.target) {
                            this._updateFocusedCellPosition($(e.originalEvent.target).closest('td'));
                            $cell = this._getNextCell("rightArrow");
                            this._focusCell($cell);
                            this._editingController.editCell(this._focusedCellPosition.rowIndex, this._focusedCellPosition.columnIndex);
                            e.originalEvent.preventDefault()
                        }
                        break;
                    case"enter":
                        if (this._isGroupRow($row)) {
                            if (this.option("grouping") && this.option("grouping").allowCollapsing) {
                                var path = this._dataController.getGroupPathByRowIndex(rowIndex);
                                if (path)
                                    this._dataController.changeGroupExpand(path)
                            }
                        }
                        else if (editingOptions.editEnabled)
                            if (isEditing) {
                                this._updateFocusedCellPosition($(e.originalEvent.target).closest('td'));
                                if (this._editingController.getEditMode() === DATAGRID_EDITING_MODE_BATCH)
                                    this._editingController.closeEditCell();
                                else
                                    setTimeout($.proxy(this._editingController.saveEditData, this._editingController))
                            }
                            else if (this._editingController.getEditMode() === DATAGRID_EDITING_MODE_BATCH)
                                this._editingController.editCell(rowIndex, this._focusedCellPosition.columnIndex);
                            else
                                this._editingController.editRow(rowIndex);
                        break;
                    case"escape":
                        if (editingOptions.editEnabled)
                            if (isEditing) {
                                this._updateFocusedCellPosition($(e.originalEvent.target).closest('td'));
                                if (this._editingController.getEditMode() === DATAGRID_EDITING_MODE_BATCH)
                                    this._editingController.closeEditCell();
                                else
                                    this._editingController.cancelEditData();
                                e.originalEvent.preventDefault()
                            }
                        break;
                    case"F":
                        if (e.ctrl && this.option("searchPanel") && this.option("searchPanel").visible) {
                            this._testHeaderPanelFocused = true;
                            this._headerPanel.focus();
                            e.originalEvent.preventDefault()
                        }
                        break
                }
            },
            _getNextCell: function(keyCode) {
                if (this._focusedView && this._focusedCellPosition) {
                    var columnIndex = this._focusedCellPosition.columnIndex,
                        visibleColumnsCount = this.getController("columns").getVisibleColumns().length,
                        rowIndex = this._focusedCellPosition.rowIndex;
                    switch (keyCode) {
                        case"rightArrow":
                            columnIndex = columnIndex < visibleColumnsCount - 1 ? columnIndex + 1 : columnIndex;
                            break;
                        case"leftArrow":
                            columnIndex = columnIndex > 0 ? columnIndex - 1 : columnIndex;
                            break;
                        case"upArrow":
                            rowIndex = rowIndex > 0 ? rowIndex - 1 : rowIndex;
                            break;
                        case"downArrow":
                            rowIndex = rowIndex < this._dataController.items().length - 1 ? rowIndex + 1 : rowIndex;
                            break
                    }
                    return this._focusedView.getCell(columnIndex, rowIndex)
                }
                return null
            },
            _resetFocusedCell: function(that) {
                var $cell = that._getFocusedCell();
                $cell && $cell.attr("tabindex", null);
                that._focusedCellPosition = null;
                that._isKeyDown = false
            },
            init: function() {
                var that = this;
                if (that.option("useKeyboard")) {
                    that._dataController = that.getController("data");
                    that._selectionController = that.getController("selection");
                    that._editingController = that.getController("editing");
                    that._headerPanel = that.getView("headerPanel");
                    that._pagerView = that.getView("pagerView");
                    that._columnsController = that.getController("columns");
                    that._focusedCellPosition = {
                        columnIndex: 0,
                        rowIndex: 0
                    };
                    that._dataController.changed.add(function(change) {
                        if (that._focusedCellPosition && change && change.changeType === 'prepend')
                            that._focusedCellPosition.rowIndex += change.items.length
                    });
                    that._initFocusedViews();
                    that._documentClickHandler = that.createAction(function(e) {
                        if (!$(e.jQueryEvent.target).closest("." + DATAGRID_ROWS_VIEW_CLASS).length)
                            that._resetFocusedCell(that)
                    });
                    $(document).on(events.addNamespace("dxpointerdown", "dxDataGridKeyboardNavigation"), that._documentClickHandler)
                }
            },
            dispose: function() {
                this.callBase();
                this._focusedView = null;
                this._focusedViews = null;
                this._keyDownProcessor && this._keyDownProcessor.dispose();
                $(document).off(events.addNamespace("dxpointerdown", "dxDataGridKeyboardNavigation"), this._documentClickHandler)
            }
        });
        $.extend(dataGrid.__internals, {
            DATAGRID_GROUP_ROW_CLASS: DATAGRID_GROUP_ROW_CLASS,
            DATAGRID_ROW_CLASS: DATAGRID_ROW_CLASS
        });
        dataGrid.registerModule("keyboardNavigation", {
            defaultOptions: function() {
                return {useKeyboard: true}
            },
            controllers: {keyboardNavigation: dataGrid.KeyboardNavigationController}
        })
    })(jQuery, DevExpress);
    /*! Module widgets-web, file ui.dataGrid.errorHandling.js */
    (function($, DX) {
        var ui = DX.ui,
            utils = DX.utils,
            dataGrid = ui.dataGrid;
        dataGrid.ErrorView = dataGrid.View.inherit({
            _renderCore: function() {
                this.toast({
                    type: 'error',
                    displayTime: 1000000,
                    position: {
                        my: 'center',
                        at: 'center'
                    },
                    contentReadyAction: function(e) {
                        this.content().on('dxclick', function() {
                            e.component.hide()
                        })
                    }
                })
            },
            toast: function(options) {
                return this._element().dxToast(options || 'instance')
            },
            isVisible: function() {
                return this.option('dataErrorVisible')
            },
            init: function() {
                var that = this,
                    dataController = that.getController('data');
                dataController.dataErrorOccurred.add(function(error) {
                    var message = error && error.message || error;
                    if (that.isVisible()) {
                        that.toast({message: message});
                        that.toast().show()
                    }
                })
            }
        });
        dataGrid.registerModule('errorHandling', {views: {errorView: dataGrid.ErrorView}})
    })(jQuery, DevExpress);
    DevExpress.MOD_WIDGETS_WEB = true
}