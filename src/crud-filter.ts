import { bindingMode, DOM, ElementEvents, IStaticViewConfig, PLATFORM } from 'aurelia-framework';
import { bindable, observable } from 'aurelia-typed-observable-plugin';
import dragula from 'dragula';
import { Filter, Sort, CfEnsureVisible, CfDetached, CfAttached } from './resources';
import { arrRemove, last } from './utilities';
import CRUD_FILTER_VIEW from './crud-filter.html';

// Example:
//  <crud-filter
//   create-item.call="addVariable()"
//   delete-item.call="deleteVariable(selectedVariable)"
//   update-item.call="editVariable(selectedVariable)"
//   selected-item.bind="selectedVariable"
//   items.bind="userDataDefinitions"
//   item-key="key"
//   item-display="key"
//  ></crud-filter>

interface ContextMenuConfig {
  item: any;
  event: MouseEvent;
}

export interface CrudFilterItemElement<T> extends HTMLElement {
  item: T;
}

export interface CrudFilterItemsCtElement<T = any> extends HTMLElement {
  items: T[];
  children: HTMLCollectionOf<CrudFilterItemElement<T>>;
}

/**
 * <crud-filter/> element view model class
 */
export class CrudFilter<T extends Record<string, any> = object> {

  /**
   * @internal Used by Aurelia view engine
   */
  public static readonly $resource: any = {
    type: 'element',
    name: 'crud-filter',
    // Stick a [custom-filter] attribute on element to notify view model
    // for some styling / logic purposes
    // if consumer of this <crud-filter/> use custom filter slot
    processContent: (_: any, __: any, node: Element) => {
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
  public static readonly $view: IStaticViewConfig = {
    template: CRUD_FILTER_VIEW,
    dependencies: [Filter, Sort, CfEnsureVisible, CfAttached, CfDetached]
  };

  public static inject(): any[] {
    return [DOM.Element];
  }

  @bindable()
  public items: T[];

  @bindable()
  public itemKey: string;

  /**
   * Indicates which property to look for on each items of the array
   * to display
   */
  @bindable()
  public itemDisplay: string;

  @bindable()
  public itemTooltip: string;

  /**
   * Call back when clicking on [add] button
   */
  @bindable()
  public createItem?: () => void;

  @bindable()
  public readItem?: (item: T) => any;

  @bindable()
  public updateItem?: (item: T) => void;

  @bindable()
  public deleteItem?: (item: T) => void;

  @bindable()
  public buttons: { add: 'Add'; edit: 'Edit'; delete: 'Delete' } = { add: 'Add', edit: 'Edit', delete: 'Delete' };
  /**
   * Disabled state of this crud-filter
   */
  @bindable.booleanAttr()
  public disabled: boolean;

  @bindable.booleanAttr()
  public draggable: boolean;

  @bindable.booleanAttr()
  public sortable: boolean;

  @bindable.booleanAttr()
  public editOnDblclick: boolean;
  /**
   * Auto select first item on items loaded
   */
  @bindable.booleanAttr()
  public autoSelect: boolean;
  /**
   * Currently selected item
   */
  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public selectedItem: T | null = null;
  /**
   * Ability to select multiple items
   * Not working nicely with auto focus
   */
  @bindable.booleanAttr()
  public multiSelect: boolean;
  /**
   * Automatically focus on selected item
   */
  @bindable.booleanAttr()
  public focusOnSelect: boolean = true;

  /**
   * allow user to input filter
   */
  @bindable.booleanAttr()
  public filterable: boolean = true;
  /**
   * Flag to indicate visibility of built in filter
   */
  public useCustomFilter: boolean = false;
  /**
   * Whether button bar should be displayed
   */
  public withButtons: boolean = false;
  /**
   * Whether should mask the entire component when disabled
   */
  @bindable()
  public disabledMask: boolean;
  /**
   * @internal Used by Aurelia binding
   * Populated when user interact via right click
   */
  @observable()
  public contextMenuConfig: ContextMenuConfig | null;
  /**
   * Z index of context menu, used when context menu requires dynamic z index
   */
  @bindable()
  public contextMenuZIndex: number | string;
  /**
   * @internal
   * Used for refreshing selected item binding
   */
  public selectionVersion: number = 1;
  /**
   * @internal Used by Aurelia binding
   * Used to manually signal a refresh for focusing element
   */
  public refreshFocusTrigger: number = 1;
  /**
   * multiple select will have this populated
   */
  @bindable()
  public selectedItems: T[] = [];
  // /**
  //  * @internal Used by Aurelia binding
  //  */
  // public readonly focusedElement: HTMLElement;
  /**
   * @internal Used by Aurelia binding
   * Only populated whenever context menu is shown
   */
  public readonly contextmenuEl: Element;
  /**
   * @internal Used by Aurelia binding
   * Indicates whether the element is in app document
   */
  private $isAttached: boolean = false;

  private _selectedItems?: T[] = [];

  @observable()
  private filteredItems?: T[] = [];

  /**
   * Use this as a value holder, temporarily wait for `<let/>` element feature
   */
  private itemsCt: CrudFilterItemsCtElement<T>;

  private $el: Element;

  constructor(
    $el: typeof DOM.Element
  ) {
    this.$el = $el as any;
  }

  /**
   * @internal Aurelia lifecycle method
   */
  public bind(): void {
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
  public attached(): void {
    this.$isAttached = true;
    this.autoSelectChanged(this.autoSelect);
    this.setupDnD();
  }

  /**
   * @internal Aurelia lifecycle method
   */
  public detached(): void {
    this.$isAttached = false;
    this.destroyDnD();
  }

  /**
   * Get the real item list being display
   * after piped through `filter` & `sort`
   */
  private getItems(): T[] {
    return this.filteredItems || [];
  }

  /**
   * @internal Aurelia change handler for property `autoSelect`
   */
  public autoSelectChanged(_autoSelect: string | boolean): void {
    const items = this.getItems();
    if (this.autoSelect && items.length && !this.selectedItem) {
      this.selectedItem = items[0];
    }
  }

  /**
   * @internal Aurelia change handler for property `selectedItem`
   */
  public selectedItemChanged(item: T, oldItem: T | null): void {
    const isMultiSelect = this.multiSelect;
    // Only retain old selected items when it's multi select
    const _selectedItems = this._selectedItems = isMultiSelect ? (this._selectedItems || []) : [];
    if (isMultiSelect) {
      const _idx = oldItem ? _selectedItems.indexOf(item === undefined || item === null ? oldItem : item) : -1;
      const _wasSelected = _idx !== -1;
      if (_wasSelected) {
        arrRemove(_selectedItems, item);
      } else {
        _selectedItems.push(item);
      }
      this.selectedItems = _selectedItems.slice(0);
      this.$el.dispatchEvent(DOM.createCustomEvent('selected', {
        bubbles: false,
        detail: {
          type: _wasSelected ? 'remove' : 'add',
          item,
          index: _idx
        }
      }));
    } else {
      this.selectedItems = item === undefined || item === null ? [] : [item];
      this.$el.dispatchEvent(DOM.createCustomEvent('selected', {
        bubbles: false,
        detail: item
      }));
    }
    this.selectionVersion++;
  }

  /**
   * Can be used to update visual list, though the real source may not be updated
   */
  public addItem(item: T, index?: number): void {
    const { filteredItems } = this;
    if (Array.isArray(filteredItems) && !filteredItems.includes(item)) {
      if (typeof index === 'number') {
        filteredItems.splice(index, 0, item);
      } else {
        filteredItems.push(item);
      }
    }
  }

  /**
   * Can be used to update visual list, though the real source may not be updated
   */
  public removeItem(item: T): boolean {
    if (Array.isArray(this.filteredItems)) {

      return arrRemove(this.filteredItems, item);
    }
    return false;
  }

  public focus(): void {
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
  public hasFocus(_selectedItem: T): boolean {
    return document.activeElement === document.body || this.itemsCt.contains(document.activeElement);
  }

  /**
   * @internal Used by Aurelia binding
   */
  public onClickItem(item: T): void {
    if (this.disabled) {
      return;
    }
    if (this.multiSelect) {
      this.selectedItemChanged(item, null);
    } else {
      this.selectedItem = item;
    }
  }
  /**
   * @internal Used by Aurelia binding
   */
  public onDblClickItem(item: T): void {
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
  public resolve(obj: any, prop: string | ((obj: any) => string)): any {
    if (typeof prop === 'function') {
      return prop(obj);
    }
    return obj[prop];
  }

  /**
   * @internal Used by Aurelia binding
   */
  public onKeyDown(e: KeyboardEvent, index: number): boolean {
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
      || keyCode === END
    ) {
      let nextIndex: number;
      if (keyCode === HOME || keyCode === END) {
        nextIndex = keyCode === HOME ? 0 : filteredItems.length - 1;
      } else {
        const isUp = keyCode === UP_ARROW || keyCode === LEFT_ARROW;
        // const selectedIndex = finalItems.indexOf(this.isMultiSelect() ? this._selectedItems.last() : this.selectedItem);
        const selectedIndex = this.multiSelect && this._selectedItems ? filteredItems.indexOf(last(this._selectedItems) as T) : index;
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
      } else if (nextIndex > filteredItems.length - 1) {
        nextIndex = filteredItems.length - 1;
      }
      const selectedItem = filteredItems[nextIndex];
      this._selectedItems = [];
      this.selectedItem = selectedItem;
      // this.getItemUi(selectedItem).focus();
      return false;
    } else {
      return true;
    }
  }

  private handleDeleteKey(): void {
    if (this.deleteItem && this.selectedItem) {
      this.deleteItem(this.selectedItem);
    }
  }

  /**
   * @internal Used by Aurelia binding
   */
  public isItemSelected(item: T): boolean {
    return this.multiSelect && this.selectedItems.length
      ? this.selectedItems.indexOf(item) !== -1
      : this.selectedItem === item;
  }

  private _calcSelectedItemTO: any;
  /**
   * @internal Aurelia change handler for property `filteredItems`
   */
  public filteredItemsChanged(items: T[]): void {
    if (this._calcSelectedItemTO) {
      clearTimeout(this._calcSelectedItemTO);
    }
    if (!Array.isArray(items) || !items.length) {
      this.selectedItem = null;
      return;
    }
    const calcDelay = 50;
    this._calcSelectedItemTO = setTimeout(
      () => {
        const { selectedItem } = this;
        if (selectedItem) {
          const posibleItem = items.find(i => i[this.itemKey] === selectedItem[this.itemKey]);
          if (posibleItem) {
            this.selectedItem = posibleItem;
          } else {
            this.selectedItem = items[0];
          }
        } else {
          if (this.autoSelect) {
            this.selectedItem = items[0];
            // this.selectedItems = [items];
          }
        }
        this.selectionVersion++;
      },
      calcDelay
    );
  }

  /**
   * @internal Aurelia change handler for property `disabled`
   */
  public disabledChanged(disabled: boolean): void {
    if (disabled) {
      this.$el.setAttribute('disabled', '');
    } else {
      this.$el.removeAttribute('disabled');
    }
  }

  /**
   * @internal Aurelia change handler for property `contextMenuConfig`
   * `contextMenuConfig` will be only populated from view
   */
  public contextMenuConfigChanged(config?: ContextMenuConfig): void {
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

  private dragApi: dragula.Drake | null;
  private setupDnD(): void {
    if (this.draggable) {
      const { itemsCt } = this;
      const itemsRepeatAnchor: Comment = <Comment>itemsCt.lastChild;
      const crudFilterDragApi = this.dragApi = dragula({
        containers: [itemsCt],
        revertOnSpill: true,
        moves: (el) => (el as Element).parentNode === itemsCt,
        accepts: (el: Element | undefined, _target, source, _sibling) => {
          // Allow drop if drag started within this crud filter
          // or comming from snippet list
          return source === itemsCt || Boolean((el as CrudFilterItemElement<T>).item);
        }
      });
      let winEvents: ElementEvents | null;
      crudFilterDragApi.on('drag', () => {
        winEvents = new ElementEvents(window);
        winEvents.subscribe('keydown', (e: KeyboardEvent) => {
          const esc = 27;
          if (e.which === esc) {
            crudFilterDragApi.cancel();
          }
        });
      });
      crudFilterDragApi.on('cloned', (clone: any, original: CrudFilterItemElement<T>, _type: any) => {
        // tslint:disable-next-line:no-inner-html
        clone.innerHTML = '';
        const item = clone.appendChild(DOM.createElement('div'));
        item.className = 'text-bold';
        // TODO: abstract this
        item.textContent = (original.item as any).Name;
      });
      crudFilterDragApi.on('drop', (_el: Element, _target: any, _source: any, _sibling: any) => {
        const items = Array.from(itemsCt.children, c => c.item);
        crudFilterDragApi.cancel();
        itemsCt.appendChild(itemsRepeatAnchor);
        this.$el.dispatchEvent(DOM.createCustomEvent('sort', {
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

  private destroyDnD(): void {
    if (this.dragApi) {
      this.dragApi.destroy();
      this.dragApi = null;
    }
  }

  private srCheckEvents: ElementEvents | null;
  /**
   * @internal Used by Aurelia binding
   * Ensure context menu will close whenever a scroll event happens outside of this element / context menu
   */
  public checkScrollingOutside(): void {
    this.srCheckEvents = new ElementEvents(PLATFORM.global);
    this.srCheckEvents.subscribe('scroll', ({ target }: Event) => {
      if (target === PLATFORM.global) {
        this.contextMenuConfig = null;
      } else if (!this.$el.contains(target as Element) && !this.contextmenuEl.contains(target as Element)) {
        this.contextMenuConfig = null;
      }
      // tslint:disable-next-line:align
    }, true);
  }

  /**
   * @internal Used by Aurelia binding
   * Called after context menu config is set to null
   */
  public disposeScrollingCheck(): void {
    const sre = this.srCheckEvents;
    if (sre) {
      sre.disposeAll();
      this.srCheckEvents = null;
    }
  }

  // @computedFrom('sortable')
  // get isSortable() {
  //   let sortable = this.sortable;
  //   return sortable;
  // }

  // get isAutoSelect() {
  //   let autoSelect = this.autoSelect;
  //   return autoSelect;
  // }
}
