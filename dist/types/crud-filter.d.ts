import { DOM } from 'aurelia-framework';
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
export declare class CrudFilter<T extends Record<string, any> = object> {
    static inject(): any[];
    items: T[];
    itemKey: string;
    /**
     * Indicates which property to look for on each items of the array
     * to display
     */
    itemDisplay: string;
    itemTooltip: string;
    /**
     * Call back when clicking on [add] button
     */
    createItem?: () => void;
    readItem?: (item: T) => any;
    updateItem?: (item: T) => void;
    deleteItem?: (item: T) => void;
    buttons: {
        add: 'Add';
        edit: 'Edit';
        delete: 'Delete';
    };
    /**
     * Disabled state of this crud-filter
     */
    disabled: boolean;
    draggable: boolean;
    sortable: boolean;
    editOnDblclick: boolean;
    /**
     * Auto select first item on items loaded
     */
    autoSelect: boolean;
    /**
     * Currently selected item
     */
    selectedItem: T | null;
    /**
     * Ability to select multiple items
     * Not working nicely with auto focus
     */
    multiSelect: boolean;
    /**
     * Automatically focus on selected item
     */
    focusOnSelect: boolean;
    /**
     * allow user to input filter
     */
    filterable: boolean;
    /**
     * Flag to indicate visibility of built in filter
     */
    useCustomFilter: boolean;
    /**
     * Whether button bar should be displayed
     */
    withButtons: boolean;
    /**
     * Whether should mask the entire component when disabled
     */
    disabledMask: boolean;
    /**
     * Z index of context menu, used when context menu requires dynamic z index
     */
    contextMenuZIndex: number | string;
    /**
     * multiple select will have this populated
     */
    selectedItems: T[];
    private _selectedItems?;
    private filteredItems?;
    /**
     * Use this as a value holder, temporarily wait for `<let/>` element feature
     */
    private itemsCt;
    private $el;
    constructor($el: typeof DOM.Element);
    /**
     * Get the real item list being display
     * after piped through `filter` & `sort`
     */
    private getItems;
    /**
     * Can be used to update visual list, though the real source may not be updated
     */
    addItem(item: T, index?: number): void;
    /**
     * Can be used to update visual list, though the real source may not be updated
     */
    removeItem(item: T): boolean;
    focus(): void;
    private handleDeleteKey;
    private _calcSelectedItemTO;
    private dragApi;
    private setupDnD;
    private destroyDnD;
    private srCheckEvents;
}
