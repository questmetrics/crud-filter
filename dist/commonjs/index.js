'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var aureliaFramework = require('aurelia-framework');
var aureliaTypedObservablePlugin = require('aurelia-typed-observable-plugin');
var dragula = _interopDefault(require('dragula'));
var aureliaBlurAttribute = require('aurelia-blur-attribute');
var aureliaPortalAttribute = require('aurelia-portal-attribute');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

/**
 * Internal resources of <crud-filter/>
 * Filter the items given to the element view model
 */
class Filter {
    toView(array, properties, query) {
        if (query === undefined || query === null || query === '' || !Array.isArray(array)) {
            return array;
        }
        properties = Array.isArray(properties) ? properties : [properties];
        const term = String(query).toLowerCase();
        return array.filter((entry) => {
            for (const prop of properties) {
                if (String(entry[prop]).toLowerCase().indexOf(term) > -1) {
                    return true;
                }
            }
            return false;
        });
    }
}
Filter.$resource = {
    type: 'valueConverter',
    name: 'cfFilter'
};
/**
 * Internal resources of <crud-filter/>
 * Sort the items given to the element view model
 */
class Sort {
    toView(array, params) {
        if (!array || !array.length || !params || params.sort === false) {
            return array;
        }
        const pname = params.field;
        const factor = (params.direction && params.direction.match(/^desc*/i)) ? 1 : -1;
        // tslint:disable-next-line:no-unnecessary-local-variable
        const retvalue = array.slice(0).sort((a, b) => {
            let textA = a[pname];
            let textB = b[pname];
            textA = textA && textA.toUpperCase ? textA.toUpperCase() : textA;
            textB = textB && textB.toUpperCase ? textB.toUpperCase() : textB;
            return (textA < textB) ? factor : (textA > textB) ? -factor : 0;
        });
        return retvalue;
    }
}
Sort.$resource = {
    type: 'valueConverter',
    name: 'cfrSort'
};
/**
 * Internal resources for <crud-filter/>
 * Ensure an element stays within current visible viewport
 */
class CfEnsureVisible {
    constructor(element, taskQueue) {
        this.element = element;
        this.taskQueue = taskQueue;
    }
    static inject() {
        return [aureliaFramework.DOM.Element, aureliaFramework.TaskQueue];
    }
    attached() {
        this.makeVisible();
    }
    makeVisible() {
        this.taskQueue.queueTask(() => {
            const element = this.element;
            const rect = element.getBoundingClientRect();
            const docRect = document.documentElement.getBoundingClientRect();
            if (rect.top + rect.height > docRect.height) {
                element.style.top = `${Math.max(0, docRect.height - rect.height)}px`;
            }
            if (rect.left + rect.width > docRect.width) {
                element.style.left = `${Math.max(0, docRect.width - rect.width)}px`;
            }
        });
    }
}
CfEnsureVisible.$resource = {
    type: 'attribute',
    name: 'cfEnsureVisible',
};
/**
 * Internal resources for <crud-filter/>
 * Invoke a callback when an element is attached
 */
class CfAttached {
    bind(bindingContext) {
        this.bindingContext = bindingContext;
    }
    attached() {
        if (typeof this.value === 'function') {
            this.value.call(this.bindingContext);
        }
    }
    unbind() {
        delete this.bindingContext;
    }
}
CfAttached.$resource = {
    type: 'attribute',
    name: 'cfAttached'
};
/**
 * Internal resources for <crud-filter/>
 * Invoke a callback when an element is detached
 */
class CfDetached {
    bind(bindingContext) {
        this.bindingContext = bindingContext;
    }
    detached() {
        if (typeof this.value === 'function') {
            this.value.call(this.bindingContext);
        }
    }
    unbind() {
        delete this.bindingContext;
    }
}
CfDetached.$resource = {
    type: 'attribute',
    name: 'cfDetached'
};

function arrRemove(arr, item) {
    const idx = arr.indexOf(item);
    if (idx > -1) {
        arr.splice(idx, 1);
        return true;
    }
    return false;
}
function last(arr) {
    return arr[arr.length];
}

var CRUD_FILTER_VIEW = "<template class=\"crud-filter d-flex flex-column\" class.bind=\"disabled ? 'disabled' : ''\" disabled.bind=\"disabled & booleanAttr\"><require from=\"./refresh-filter\"></require><div style=\"display: none;\" filtered-items.from-view=\"filteredItems\" filtered-items.to-view=\"items | cfFilter :[itemDisplay] :filtertext | cfSort :{ field: itemDisplay, direction: 'ascending', sort: sortable } :items.length | refreshCrudFilteredItems\"></div><div class=\"flex-shrink-0 py-2\" show.bind=\"withButtons\"><button show.bind=\"createItem\" type=\"button\" class=\"btn btn-success btn-xs px-5\" click.trigger=\"createItem()\" disabled.bind=\"disabled\"><i class=\"fa fa-plus-circle\"></i>${buttons.add ? '&nbsp;' + buttons.add : ''}</button></div><div show.bind=\"itemKey && filterable\" class=\"relative flex-shrink-0\" style=\"margin-bottom: 4px;\"><div if.bind=\"!useCustomFilter\" class=\"input-group input-group-sm\"><span class=\"input-group-prepend\"><i class=\"input-group-text fa fa-filter\"></i></span> <input type=\"text\" class=\"form-control\" placeholder=\"Filter\" value.bind=\"filtertext & debounce: 500\" readonly.bind=\"disabled\" autocomplete=\"off\"></div><slot name=\"customFilter\"></slot></div><div class=\"d-flex flex-column\" style=\"box-shadow: 0 1px 2px rgba(0,0,0,.2);\"><div ref=\"itemsCt\" class=\"h-100 d-block list-group\" tabindex=\"-1\" style=\"box-shadow: none; outline: 0; overflow-x: hidden; overflow-y: auto;\"><div repeat.for=\"item of filteredItems\" class=\"relative list-group-item d-flex ${selectionVersion && isItemSelected(item) ? 'active' : ''} cursor-pointer border-left-0 border-right-0\" tabindex=\"-1\" item.bind=\"item\" disabled.bind=\"disabled\" keydown.delegate=\"onKeyDown($event, $index)\" click.delegate=\"onClickItem(item)\" dblclick.delegate=\"onDblClickItem(item)\" contextmenu.delegate=\"contextMenuConfig = { item, event: $event }\" focus.to-view=\"refreshFocusTrigger && focusOnSelect && selectedItem === item && hasFocus(selectedItem)\"><div class=\"flex-fill trim-table text-nowrap\"><span replaceable part=\"item-display\">${resolve(item, itemDisplay)}</span></div><button class=\"btn btn-xs btn-default\" disabled.bind=\"disabled\" click.delegate=\"$event.stopPropagation() || (contextMenuConfig = { item, event: $event })\"><i class=\"fa fa-ellipsis-v fa-fw\"></i></button></div></div></div><div if.bind=\"contextMenuConfig\" ref=\"contextmenuEl\" portal blur.bind=\"contextMenuConfig\" cf-attached.bind=\"checkScrollingOutside\" cf-detached.bind=\"disposeScrollingCheck\" cf-ensure-visible style=\"position: absolute;\" css=\"top: ${contextMenuConfig.event.clientY & oneTime}px; left: ${contextMenuConfig.event.clientX & oneTime}px; z-index: ${contextMenuZIndex};\"><div role=\"menu\" class=\"relative dropdown-menu show no-float floating-shadow m-0\"><template replaceable part=\"menu-before\"></template><div class=\"dropdown-header\" role=\"presentation\">Actions:</div><button show.bind=\"updateItem\" click.delegate=\"updateItem(contextMenuConfig.item)\" class=\"dropdown-item mr-1\"><i class=\"fa fa-edit mr-1\"></i> Edit</button> <button show.bind=\"deleteItem\" click.delegate=\"deleteItem(contextMenuConfig.item)\" class=\"dropdown-item\"><i class=\"fa fa-times mr-1\"></i> Delete</button><template with.bind=\"{ item: contextMenuConfig.item }\"><template replaceable part=\"menu-after\"></template></template></div></div></template>";

/**
 * <crud-filter/> element view model class
 */
class CrudFilter {
    constructor($el) {
        this.buttons = { add: 'Add', edit: 'Edit', delete: 'Delete' };
        /**
         * Currently selected item
         */
        this.selectedItem = null;
        /**
         * Automatically focus on selected item
         */
        this.focusOnSelect = true;
        /**
         * allow user to input filter
         */
        this.filterable = true;
        /**
         * Flag to indicate visibility of built in filter
         */
        this.useCustomFilter = false;
        /**
         * Whether button bar should be displayed
         */
        this.withButtons = false;
        /**
         * @internal
         * Used for refreshing selected item binding
         */
        this.selectionVersion = 1;
        /**
         * @internal Used by Aurelia binding
         * Used to manually signal a refresh for focusing element
         */
        this.refreshFocusTrigger = 1;
        /**
         * multiple select will have this populated
         */
        this.selectedItems = [];
        /**
         * @internal Used by Aurelia binding
         * Indicates whether the element is in app document
         */
        this.$isAttached = false;
        this._selectedItems = [];
        this.filteredItems = [];
        this.$el = $el;
    }
    static inject() {
        return [aureliaFramework.DOM.Element];
    }
    /**
     * @internal Aurelia lifecycle method
     */
    bind() {
        const hasButtons = !!(this.createItem || this.updateItem || this.deleteItem);
        this.withButtons = hasButtons;
        if (!this.itemDisplay) {
            this.itemDisplay = this.itemKey;
        }
        this.useCustomFilter = this.$el.hasAttribute('custom-filter');
        if (this.draggable) {
            this.$el.removeAttribute('draggable');
        }
    }
    /**
     * @internal Aurelia lifecycle method
     */
    attached() {
        this.$isAttached = true;
        this.autoSelectChanged(this.autoSelect);
        this.setupDnD();
    }
    /**
     * @internal Aurelia lifecycle method
     */
    detached() {
        this.$isAttached = false;
        this.destroyDnD();
    }
    /**
     * Get the real item list being display
     * after piped through `filter` & `sort`
     */
    getItems() {
        return this.filteredItems || [];
    }
    /**
     * @internal Aurelia change handler for property `autoSelect`
     */
    autoSelectChanged(_autoSelect) {
        const items = this.getItems();
        if (this.autoSelect && items.length && !this.selectedItem) {
            this.selectedItem = items[0];
        }
    }
    /**
     * @internal Aurelia change handler for property `selectedItem`
     */
    selectedItemChanged(item, oldItem) {
        const isMultiSelect = this.multiSelect;
        // Only retain old selected items when it's multi select
        const _selectedItems = this._selectedItems = isMultiSelect ? (this._selectedItems || []) : [];
        if (isMultiSelect) {
            const _idx = oldItem ? _selectedItems.indexOf(item === undefined || item === null ? oldItem : item) : -1;
            const _wasSelected = _idx !== -1;
            if (_wasSelected) {
                arrRemove(_selectedItems, item);
            }
            else {
                _selectedItems.push(item);
            }
            this.selectedItems = _selectedItems.slice(0);
            this.$el.dispatchEvent(aureliaFramework.DOM.createCustomEvent('selected', {
                bubbles: false,
                detail: {
                    type: _wasSelected ? 'remove' : 'add',
                    item,
                    index: _idx
                }
            }));
        }
        else {
            this.selectedItems = item === undefined || item === null ? [] : [item];
            this.$el.dispatchEvent(aureliaFramework.DOM.createCustomEvent('selected', {
                bubbles: false,
                detail: item
            }));
        }
        this.selectionVersion++;
    }
    /**
     * Can be used to update visual list, though the real source may not be updated
     */
    addItem(item, index) {
        const { filteredItems } = this;
        if (Array.isArray(filteredItems) && !filteredItems.includes(item)) {
            if (typeof index === 'number') {
                filteredItems.splice(index, 0, item);
            }
            else {
                filteredItems.push(item);
            }
        }
    }
    /**
     * Can be used to update visual list, though the real source may not be updated
     */
    removeItem(item) {
        if (Array.isArray(this.filteredItems)) {
            return arrRemove(this.filteredItems, item);
        }
        return false;
    }
    focus() {
        const { $isAttached, filteredItems, selectedItem } = this;
        if ($isAttached && Array.isArray(filteredItems)) {
            const idx = selectedItem ? filteredItems.indexOf(selectedItem) : -1;
            if (idx > -1) {
                this.itemsCt.children[idx].focus();
            }
        }
        // if (this.$isAttached) {
        //   this.refreshFocusVersion++;
        // } else {
        //   this.$attachFocus = true;
        // }
    }
    /**
     * @internal Used by Aurelia binding
     */
    hasFocus(_selectedItem) {
        return document.activeElement === document.body || this.itemsCt.contains(document.activeElement);
    }
    /**
     * @internal Used by Aurelia binding
     */
    onClickItem(item) {
        if (this.disabled) {
            return;
        }
        if (this.multiSelect) {
            this.selectedItemChanged(item, null);
        }
        else {
            this.selectedItem = item;
        }
    }
    /**
     * @internal Used by Aurelia binding
     */
    onDblClickItem(item) {
        if (this.editOnDblclick && (typeof this.updateItem === 'function') && !this.disabled) {
            this.updateItem(item);
        }
    }
    // public isPromise<TValue = any>(obj: any): obj is PromiseLike<TValue> {
    //   return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
    // }
    /**
     * @internal Used by Aurelia binding
     */
    resolve(obj, prop) {
        if (typeof prop === 'function') {
            return prop(obj);
        }
        return obj[prop];
    }
    /**
     * @internal Used by Aurelia binding
     */
    onKeyDown(e, index) {
        const filteredItems = this.getItems();
        if (this.disabled || filteredItems.length < 1) {
            return true;
        }
        const keyCode = e.keyCode;
        const UP_ARROW = 38;
        const DOWN_ARROW = 40;
        const LEFT_ARROW = 37;
        const RIGHT_ARROW = 39;
        const HOME = 36;
        const END = 35;
        // const ESCAPE = 27;
        const DELETE = 46;
        if (keyCode === DELETE) {
            this.handleDeleteKey();
            return false;
        }
        if (keyCode === UP_ARROW
            || keyCode === DOWN_ARROW
            || keyCode === LEFT_ARROW
            || keyCode === RIGHT_ARROW
            || keyCode === HOME
            || keyCode === END) {
            let nextIndex;
            if (keyCode === HOME || keyCode === END) {
                nextIndex = keyCode === HOME ? 0 : filteredItems.length - 1;
            }
            else {
                const isUp = keyCode === UP_ARROW || keyCode === LEFT_ARROW;
                // const selectedIndex = finalItems.indexOf(this.isMultiSelect() ? this._selectedItems.last() : this.selectedItem);
                const selectedIndex = this.multiSelect && this._selectedItems ? filteredItems.indexOf(last(this._selectedItems)) : index;
                nextIndex = selectedIndex + (isUp ? -1 : 1);
                if (isUp && nextIndex < 0) {
                    return false;
                }
                if (!isUp && nextIndex >= filteredItems.length) {
                    return false;
                }
            }
            if (nextIndex < 0) {
                nextIndex = 0;
            }
            else if (nextIndex > filteredItems.length - 1) {
                nextIndex = filteredItems.length - 1;
            }
            const selectedItem = filteredItems[nextIndex];
            this._selectedItems = [];
            this.selectedItem = selectedItem;
            // this.getItemUi(selectedItem).focus();
            return false;
        }
        else {
            return true;
        }
    }
    handleDeleteKey() {
        if (this.deleteItem && this.selectedItem) {
            this.deleteItem(this.selectedItem);
        }
    }
    /**
     * @internal Used by Aurelia binding
     */
    isItemSelected(item) {
        return this.multiSelect && this.selectedItems.length
            ? this.selectedItems.indexOf(item) !== -1
            : this.selectedItem === item;
    }
    /**
     * @internal Aurelia change handler for property `filteredItems`
     */
    filteredItemsChanged(items) {
        if (this._calcSelectedItemTO) {
            clearTimeout(this._calcSelectedItemTO);
        }
        if (!Array.isArray(items) || !items.length) {
            this.selectedItem = null;
            return;
        }
        const calcDelay = 50;
        this._calcSelectedItemTO = setTimeout(() => {
            const { selectedItem } = this;
            if (selectedItem) {
                const posibleItem = items.find(i => i[this.itemKey] === selectedItem[this.itemKey]);
                if (posibleItem) {
                    this.selectedItem = posibleItem;
                }
                else {
                    this.selectedItem = items[0];
                }
            }
            else {
                if (this.autoSelect) {
                    this.selectedItem = items[0];
                    // this.selectedItems = [items];
                }
            }
            this.selectionVersion++;
        }, calcDelay);
    }
    /**
     * @internal Aurelia change handler for property `disabled`
     */
    disabledChanged(disabled) {
        if (disabled) {
            this.$el.setAttribute('disabled', '');
        }
        else {
            this.$el.removeAttribute('disabled');
        }
    }
    /**
     * @internal Aurelia change handler for property `contextMenuConfig`
     * `contextMenuConfig` will be only populated from view
     */
    contextMenuConfigChanged(config) {
        if (!config) {
            return;
        }
        // if (!this.updateItem && !this.deleteItem) {
        //   return;
        // }
        if (this.disabled) {
            return;
        }
        // Item === undefined when right click on the list container
        if (config.item) {
            this.selectedItem = config.item;
        }
        config.event.stopPropagation();
        return;
    }
    setupDnD() {
        if (this.draggable) {
            const { itemsCt } = this;
            const itemsRepeatAnchor = itemsCt.lastChild;
            const crudFilterDragApi = this.dragApi = dragula({
                containers: [itemsCt],
                revertOnSpill: true,
                moves: (el) => el.parentNode === itemsCt,
                accepts: (el, _target, source, _sibling) => {
                    // Allow drop if drag started within this crud filter
                    // or comming from snippet list
                    return source === itemsCt || Boolean(el.item);
                }
            });
            let winEvents;
            crudFilterDragApi.on('drag', () => {
                winEvents = new aureliaFramework.ElementEvents(window);
                winEvents.subscribe('keydown', (e) => {
                    const esc = 27;
                    if (e.which === esc) {
                        crudFilterDragApi.cancel();
                    }
                });
            });
            crudFilterDragApi.on('cloned', (clone, original, _type) => {
                // tslint:disable-next-line:no-inner-html
                clone.innerHTML = '';
                const item = clone.appendChild(aureliaFramework.DOM.createElement('div'));
                item.className = 'text-bold';
                // TODO: abstract this
                item.textContent = original.item.Name;
            });
            crudFilterDragApi.on('drop', (_el, _target, _source, _sibling) => {
                const items = Array.from(itemsCt.children, c => c.item);
                crudFilterDragApi.cancel();
                itemsCt.appendChild(itemsRepeatAnchor);
                this.$el.dispatchEvent(aureliaFramework.DOM.createCustomEvent('sort', {
                    bubbles: false,
                    detail: items,
                    cancelable: true
                }));
            });
            crudFilterDragApi.on('cancel', () => {
                if (winEvents) {
                    winEvents.disposeAll();
                    winEvents = null;
                }
            });
        }
    }
    destroyDnD() {
        if (this.dragApi) {
            this.dragApi.destroy();
            this.dragApi = null;
        }
    }
    /**
     * @internal Used by Aurelia binding
     * Ensure context menu will close whenever a scroll event happens outside of this element / context menu
     */
    checkScrollingOutside() {
        this.srCheckEvents = new aureliaFramework.ElementEvents(aureliaFramework.PLATFORM.global);
        this.srCheckEvents.subscribe('scroll', ({ target }) => {
            if (target === aureliaFramework.PLATFORM.global) {
                this.contextMenuConfig = null;
            }
            else if (!this.$el.contains(target) && !this.contextmenuEl.contains(target)) {
                this.contextMenuConfig = null;
            }
            // tslint:disable-next-line:align
        }, true);
    }
    /**
     * @internal Used by Aurelia binding
     * Called after context menu config is set to null
     */
    disposeScrollingCheck() {
        const sre = this.srCheckEvents;
        if (sre) {
            sre.disposeAll();
            this.srCheckEvents = null;
        }
    }
}
/**
 * @internal Used by Aurelia view engine
 */
CrudFilter.$resource = {
    type: 'element',
    name: 'crud-filter',
    // Stick a [custom-filter] attribute on element to notify view model
    // for some styling / logic purposes
    // if consumer of this <crud-filter/> use custom filter slot
    processContent: (_, __, node) => {
        let child = node.firstElementChild;
        while (child) {
            if (child.getAttribute('slot') === 'customFilter') {
                node.setAttribute('custom-filter', '');
                break;
            }
            child = child.nextElementSibling;
        }
        return true;
    }
};
/**
 * @internal Used by Aurelia view engine
 */
CrudFilter.$view = {
    template: CRUD_FILTER_VIEW,
    dependencies: [Filter, Sort, CfEnsureVisible, CfAttached, CfDetached]
};
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Array)
], CrudFilter.prototype, "items", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", String)
], CrudFilter.prototype, "itemKey", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", String)
], CrudFilter.prototype, "itemDisplay", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", String)
], CrudFilter.prototype, "itemTooltip", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Function)
], CrudFilter.prototype, "createItem", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Function)
], CrudFilter.prototype, "readItem", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Function)
], CrudFilter.prototype, "updateItem", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Function)
], CrudFilter.prototype, "deleteItem", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Object)
], CrudFilter.prototype, "buttons", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "disabled", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "draggable", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "sortable", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "editOnDblclick", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "autoSelect", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable({ defaultBindingMode: aureliaFramework.bindingMode.twoWay }),
    __metadata("design:type", Object)
], CrudFilter.prototype, "selectedItem", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "multiSelect", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "focusOnSelect", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable.booleanAttr(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "filterable", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Boolean)
], CrudFilter.prototype, "disabledMask", void 0);
__decorate([
    aureliaTypedObservablePlugin.observable(),
    __metadata("design:type", Object)
], CrudFilter.prototype, "contextMenuConfig", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Object)
], CrudFilter.prototype, "contextMenuZIndex", void 0);
__decorate([
    aureliaTypedObservablePlugin.bindable(),
    __metadata("design:type", Array)
], CrudFilter.prototype, "selectedItems", void 0);
__decorate([
    aureliaTypedObservablePlugin.observable(),
    __metadata("design:type", Array)
], CrudFilter.prototype, "filteredItems", void 0);

var css = ".crud-filter .list-group-item:focus{outline:1px dashed #333}.crud-filter .list-group-item:not(.active):hover{background-color:#e2e2e2}.crud-filter.disabled .list-group-item:not(.active){background-color:#f2f2f2}.crud-filter .list-group-item-hover{display:none}.crud-filter .list-group-item:hover .list-group-item-hover{display:block}.crud-filter .list-group-item.active:hover .list-group-item-hover{color:#fff!important}"

function configure(fxconfig) {
    fxconfig.plugin(aureliaPortalAttribute.configure);
    fxconfig.plugin(aureliaBlurAttribute.configure);
    aureliaFramework.DOM.injectStyles(css, undefined, undefined, 'crud-filter-css');
    fxconfig.globalResources(CrudFilter);
}

exports.CrudFilter = CrudFilter;
exports.configure = configure;
