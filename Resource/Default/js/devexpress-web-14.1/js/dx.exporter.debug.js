/*! 
* DevExtreme Exporter
* Version: 14.1.7
* Build date: Sep 22, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";

if (!DevExpress.MOD_TMP_WIDGETS_FOR_EXPORTER) {
    /*! Module tmp-widgets-for-exporter, file ui.menuBase.js */
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
    /*! Module tmp-widgets-for-exporter, file ui.contextMenu.js */
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
    /*! Module tmp-widgets-for-exporter, file ui.menu.js */
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
    /*! Module tmp-widgets-for-exporter, file ui.overlay.js */
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
    DevExpress.MOD_TMP_WIDGETS_FOR_EXPORTER = true
}
if (!DevExpress.MOD_TMP_EXPORTER) {
    /*! Module tmp-exporter, file exporter.js */
    (function(DX, $) {
        var ui = DX.ui,
            utils = DX.utils,
            FILE = "file",
            BODY = "body",
            ICON_TO = 'exportTo',
            ICON_PRINT = 'print',
            NO_PRINTABLE = 'dx-non-printable',
            PRINTABLE = 'dx-printable',
            FORMATS_EXPORT = ['PDF', 'PNG', 'SVG'],
            FORMATS_SUPPORTS = ['JPEG', 'GIF'].concat(FORMATS_EXPORT),
            core = DX.viz.core;
        var Exporter = DX.DOMComponent.inherit({
                _normalizeHtml: core.BaseWidget.prototype._normalizeHtml,
                _killTracker: core.BaseWidget.prototype._killTracker,
                _getSvgElements: function() {
                    var that = this,
                        svgArray = [];
                    $(that.getsourceContainer()).find("svg").each(function(i) {
                        svgArray[i] = that._normalizeHtml($(this).clone().wrap("<div></div>").parent().html())
                    });
                    return JSON.stringify(svgArray)
                },
                _appendTextArea: function(name, value, rootElement) {
                    $("<textarea/>", {
                        id: name,
                        name: name,
                        val: value
                    }).appendTo(rootElement)
                },
                _formSubmit: function(form) {
                    form.submit();
                    form.remove();
                    return form.submit()
                },
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        redrawOnResize: false,
                        menuAlign: 'right',
                        exportFormat: FORMATS_EXPORT,
                        printingEnabled: true,
                        fileName: FILE,
                        showMenu: true
                    })
                },
                _createWindow: function() {
                    return window.open('', 'printDiv', '')
                },
                _createExportItems: function(exportFormat) {
                    var that = this;
                    return $.map(exportFormat, function(value) {
                            value = value.toUpperCase();
                            if ($(that.getsourceContainer()).find("svg").length > 1 && value === "SVG")
                                return null;
                            if ($.inArray(value.toUpperCase(), FORMATS_SUPPORTS) === -1)
                                return null;
                            return {
                                    name: value,
                                    text: value + ' ' + FILE
                                }
                        })
                },
                getsourceContainer: function() {
                    var container = this.option('sourceContainer') || this.option('sourceContainerId');
                    return $(container)
                },
                _render: function() {
                    var that = this,
                        fileName = that.option('fileName'),
                        exportItems = that._createExportItems(that.option('exportFormat')),
                        container = $('<div />'),
                        rootItems = [{
                                name: 'export',
                                icon: ICON_TO,
                                items: exportItems
                            }],
                        options = {
                            align: that.option('menuAlign'),
                            items: rootItems,
                            itemClickAction: function(properties) {
                                switch (properties.itemData.name) {
                                    case'print':
                                        that.print();
                                        break;
                                    case'export':
                                        break;
                                    default:
                                        that.exportTo(fileName, properties.itemData.name)
                                }
                            }
                        };
                    if (that.option('showMenu')) {
                        that.option('printingEnabled') && rootItems.push({
                            icon: ICON_PRINT,
                            name: 'print',
                            click: function() {
                                that.print()
                            }
                        });
                        container.dxMenu(options);
                        that._$element.empty();
                        that._$element.append(container);
                        return options
                    }
                },
                print: function() {
                    var $sourceContainer = this.getsourceContainer().html(),
                        printWindow = this._createWindow();
                    $(printWindow.document.body).html($sourceContainer);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close()
                },
                exportTo: function(fileName, format) {
                    var that = this,
                        $sourceContainer = that.getsourceContainer(),
                        form = $("<form/>", {
                            method: "POST",
                            action: that.option('serverUrl'),
                            enctype: "application/x-www-form-urlencoded",
                            target: "_self",
                            css: {
                                display: "none",
                                visibility: "hidden"
                            }
                        });
                    that._appendTextArea("exportContent", $sourceContainer.clone().wrap("<div></div>").parent().html(), form);
                    that._appendTextArea("svgElements", that._getSvgElements(), form);
                    that._appendTextArea("fileName", fileName, form);
                    that._appendTextArea("format", format.toLowerCase(), form);
                    that._appendTextArea("width", $sourceContainer.width(), form);
                    that._appendTextArea("height", $sourceContainer.height(), form);
                    that._appendTextArea("url", window.location.host, form);
                    $(document.body).append(form);
                    that._testForm = form;
                    that._formSubmit(form)
                }
            });
        $.extend(true, DX, {exporter: {Exporter: Exporter}});
        DX.registerComponent("dxExporter", Exporter)
    })(DevExpress, jQuery);
    DevExpress.MOD_TMP_EXPORTER = true
}
