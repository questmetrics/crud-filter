import { TaskQueue } from 'aurelia-framework';
/**
 * Internal resources of <crud-filter/>
 * Filter the items given to the element view model
 */
export declare class Filter {
    static $resource: any;
    toView(array: any[], properties: string[], query: string): any[];
}
interface ISortValueConverterParams {
    sort?: boolean;
    field: string;
    direction?: 'ascending' | 'descending';
}
/**
 * Internal resources of <crud-filter/>
 * Sort the items given to the element view model
 */
export declare class Sort {
    static $resource: any;
    toView(array: any[] | undefined, params?: ISortValueConverterParams): any[] | undefined;
}
/**
 * Internal resources for <crud-filter/>
 * Ensure an element stays within current visible viewport
 */
export declare class CfEnsureVisible {
    static $resource: any;
    static inject(): any[];
    private taskQueue;
    private element;
    constructor(element: Element, taskQueue: TaskQueue);
    attached(): void;
    private makeVisible;
}
/**
 * Internal resources for <crud-filter/>
 * Invoke a callback when an element is attached
 */
export declare class CfAttached<T = any> {
    static $resource: any;
    bindingContext: T;
    bind(bindingContext: T): void;
    attached(): void;
    unbind(): void;
}
/**
 * Internal resources for <crud-filter/>
 * Invoke a callback when an element is detached
 */
export declare class CfDetached<T = any> {
    static $resource: any;
    bindingContext: T;
    bind(bindingContext: T): void;
    detached(): void;
    unbind(): void;
}
export {};
