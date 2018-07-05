import { DOM, TaskQueue } from 'aurelia-framework';

/**
 * Internal resources of <crud-filter/>
 * Filter the items given to the element view model
 */
export class Filter {
  public static $resource: any = {
    type: 'valueConverter',
    name: 'cfFilter'
  };

  public toView(array: any[], properties: string[], query: string): any[] {
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
interface ISortValueConverterParams {
  // A flag to enable sort or not binding
  sort?: boolean;
  field: string;
  direction?: 'ascending' | 'descending';
}

/**
 * Internal resources of <crud-filter/>
 * Sort the items given to the element view model
 */
export class Sort {

  public static $resource: any = {
    type: 'valueConverter',
    name: 'cfSort'
  };

  public toView(array: any[] | undefined, params?: ISortValueConverterParams): any[] | undefined {
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

/**
 * Internal resources for <crud-filter/>
 * Ensure an element stays within current visible viewport
 */
export class CfEnsureVisible {

  public static $resource: any = {
    type: 'attribute',
    name: 'cfEnsureVisible',
  };

  public static inject(): any[] {
    return [DOM.Element, TaskQueue];
  }

  private taskQueue: TaskQueue;
  private element: HTMLElement;

  constructor(
    element: Element,
    taskQueue: TaskQueue,
  ) {
    this.element = element as HTMLElement;
    this.taskQueue = taskQueue;
  }

  public attached(): void {
    this.makeVisible();
  }

  private makeVisible(): void {
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

/**
 * Internal resources for <crud-filter/>
 * Invoke a callback when an element is attached
 */
export class CfAttached<T = any> {
  public static $resource: any = {
    type: 'attribute',
    name: 'cfAttached'
  };

  /**
   * @internal Used by Aurelia binding
   * Default bindable property for custom attribute
   */
  public value: (this: T) => any;
  public bindingContext: T;

  public bind(bindingContext: T): void {
    this.bindingContext = bindingContext;
  }

  public attached(): void {
    if (typeof this.value === 'function') {
      this.value.call(this.bindingContext);
    }
  }

  public unbind(): void {
    delete this.bindingContext;
  }
}

/**
 * Internal resources for <crud-filter/>
 * Invoke a callback when an element is detached
 */
export class CfDetached<T = any> {
  public static $resource: any = {
    type: 'attribute',
    name: 'cfDetached'
  };

  /**
   * @internal Used by Aurelia binding
   * Default bindable property for custom attribute
   */
  public value: (this: T) => any;
  public bindingContext: T;

  public bind(bindingContext: T): void {
    this.bindingContext = bindingContext;
  }

  public detached(): void {
    if (typeof this.value === 'function') {
      this.value.call(this.bindingContext);
    }
  }

  public unbind(): void {
    delete this.bindingContext;
  }
}

/**
 * @internal Resource for <crud-filter/>
 * Use to ensure items used for display in <crud-filter/> is always different to original
 */
export class CfClone {

  public static readonly $resource: any = {
    type: 'valueConverter',
    name: 'cfClone'
  };

  public toView(value: any[]): any[] {
    return !Array.isArray(value) || !value.length ? [] : value.slice(0);
  }
}
