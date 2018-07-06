import { AppViewModel, AppItem, wait } from './utilities';
import { configure, CrudFilter } from '../../src/index';
// import { bootstrap } from 'aurelia-bootstrapper';
import { configure as configureTemplatingBinding } from 'aurelia-templating-binding';
import { configure as configureTemplatingResources } from 'aurelia-templating-resources';
import { StageComponent, ComponentTester } from 'aurelia-testing';
import { Aurelia, TaskQueue } from 'aurelia-framework';
import { WebpackLoader } from 'aurelia-loader-webpack';

describe('crud-filter', () => {
  let aurelia: Aurelia;
  let component: ComponentTester<CrudFilter>;
  let view: string;
  const originalConfigure = ComponentTester.prototype.configure;
  // const flushTaskQueue = () => (aurelia.container.get(TaskQueue) as TaskQueue).flushTaskQueue();
  const flushMicroTaskQueue = () => (aurelia.container.get(TaskQueue) as TaskQueue).flushMicroTaskQueue();

  beforeAll(() => {
    ComponentTester.prototype.configure = au =>
      au
        .use
        .plugin(configureTemplatingBinding)
        .plugin(configureTemplatingResources)
        .plugin(configure);
  });

  afterAll(() => {
    ComponentTester.prototype.configure = originalConfigure;
  });

  beforeEach(() => {
    aurelia = new Aurelia(new WebpackLoader());

    component = StageComponent.withResources();
  });

  afterEach(() => {
    component.dispose();
  });

  it('should leave original items alone', done => {
    const app: AppViewModel = new AppViewModel();
    view = '<crud-filter view-model.ref="crudFilter" item-key="name" items.bind="items"></crud-filter>';
    component
      .inView(view)
      .boundTo(app)
      .create(cfg => cfg(aurelia))
      .then(() => {
        expect(app.items).toBe(app.crudFilter.items, 'CF `items` collection should be the same with original');
        expect(app.items).not.toBe(app.crudFilter.filteredItems as AppItem[]);
      })
      .catch(e => {
        expect(e).toBeFalsy('It should have created the view');
      })
      .then(done);
  });

  describe('bind()', () => {
    it('configs buttons correctly', done => {
      const app: AppViewModel = new AppViewModel();
      view = `<crud-filter
        view-model.ref="crudFilter"
        ref="crudFilterEl"
        draggable
        create-item.call="addItem"
        item-key="name"
        items.bind="items"></crud-filter>`;

      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => {
          expect(app.crudFilter.withButtons).toBe(true, 'It should have "withButtons" set to true');
          expect(app.crudFilter.createItem).toBeTruthy('"createItem" should be defined');
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });

    it('uses "itemKey" as "itemDisplay" if not specified', done => {
      const app: AppViewModel = new AppViewModel();
      view = `<crud-filter view-model.ref="crudFilter" ref="crudFilterEl" draggable item-key="name" items.bind="items"></crud-filter>`;
      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => {
          expect(app.crudFilter.itemDisplay).toBe(app.crudFilter.itemKey, 'It should have same value');
          expect(app.crudFilter.itemKey).toBe('name', '"itemKey" should have value "name"');
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });

    it('removes "draggable" attribute', done => {
      const app: AppViewModel = new AppViewModel();
      view = '<crud-filter view-model.ref="crudFilter" ref="crudFilterEl" draggable item-key="name" items.bind="items"></crud-filter>';
      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => {
          expect(app.crudFilterEl.hasAttribute('draggable')).toBe(false, 'It should not have "draggable" attribute');
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });

    it('autoselects', done => {
      const app: AppViewModel = new AppViewModel();
      view = `<crud-filter
        view-model.ref="crudFilter"
        ref="crudFilterEl"
        auto-select
        item-key="name"
        items.bind="items"></crud-filter>`;

      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => wait(100))
        .then(() => {
          // By this time task queue is flushing changes from `filteredItems`, and also another task to determine selected item
          // flushing the micro queue will execute both of them synchronously immediately
          flushMicroTaskQueue();
          const items = app.crudFilter.filteredItems as AppItem[];
          expect(app.crudFilter.selectedItem).toBe(items[0], 'It should have selected first item');
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });
  });

  describe('attached()', () => {
    it('does not automatically select when not specified', done => {
      const app: AppViewModel = new AppViewModel();
      view = `<crud-filter
        view-model.ref="crudFilter"
        ref="crudFilterEl"
        item-key="name"
        items.bind="items"></crud-filter>`;

      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => {
          expect(app.crudFilter.selectedItem).toBeFalsy('It should have "withButtons" set to true');
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });
  });

  describe('focus', () => {
    it('does not automatically select when not specified', done => {
      const app: AppViewModel = new AppViewModel(2);
      view = `<crud-filter
        view-model.ref="crudFilter"
        ref="crudFilterEl"
        auto-select
        item-key="name"
        items.bind="items"></crud-filter>`;

      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => {
          flushMicroTaskQueue();
          // new AppViewModel(1) ensures there is at least 1 item in the list to select
          const firstItemEl = app.crudFilterEl.querySelector('.relative.list-group-item') as Element;
          expect(document.activeElement).toBe(firstItemEl);
          const items = app.crudFilter.filteredItems!;
          const spy = spyOn(app.crudFilter, 'onClickItem').and.callThrough();
          const nextItemEl = firstItemEl.nextElementSibling as HTMLElement;
          nextItemEl.click();
          expect(spy).toHaveBeenCalledWith(items[1]);
          expect(app.crudFilter.selectedItem).toBe(items[1]);
          return wait(100);
        })
        .then(() => {
          const firstItemEl = app.crudFilterEl.querySelector('.relative.list-group-item') as Element;
          const nextItemEl = firstItemEl.nextElementSibling as HTMLElement;
          expect(document.activeElement).toBe(nextItemEl);
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });
  });

  describe('add/ remove', () => {
    it('only updates the cloned array when adding', done => {
      const app: AppViewModel = new AppViewModel(2);
      view = `<crud-filter
        view-model.ref="crudFilter"
        ref="crudFilterEl"
        auto-select
        item-key="name"
        items.bind="items"></crud-filter>`;

      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => {
          app.crudFilter.addItem({ name: 'test' });
          flushMicroTaskQueue();
          expect(app.crudFilterEl.querySelectorAll('.relative.list-group-item').length)
            .toBe(
              app.crudFilter.filteredItems!.length,
              'Working array should be updated'
            );
          expect(app.items.length).toBeLessThan(app.crudFilter.filteredItems!.length, 'Original array should not update');
          app.crudFilter.addItem({ name: 'test start index' }, 0);
          flushMicroTaskQueue();
          expect(app.crudFilterEl.querySelectorAll('.relative.list-group-item').length)
            .toBe(
              app.crudFilter.filteredItems!.length,
              'Working array should be updated'
            );
          expect(app.crudFilterEl.querySelector('.relative.list-group-item span')!.textContent).toBe('test start index');
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });

    it('only update the cloned array when removing', done => {
      const app: AppViewModel = new AppViewModel(2);
      view = `<crud-filter
        view-model.ref="crudFilter"
        ref="crudFilterEl"
        item-key="name"
        items.bind="items"></crud-filter>`;

      component
        .inView(view)
        .boundTo(app)
        .create(cfg => cfg(aurelia))
        .then(() => {
          let removeResult = app.crudFilter.removeItem(null as any);
          expect(removeResult).toBe(false, 'It should have return false when removing items not in collection');
          const firstItem = app.crudFilter.filteredItems![0];
          removeResult = app.crudFilter.removeItem(firstItem);
          expect(removeResult).toBe(true, 'It should haved removed the first item');
          flushMicroTaskQueue();
          expect(app.crudFilterEl.querySelector('.relative.list-group-item span')!.textContent).toBe(app.crudFilter.filteredItems![0].name);
        })
        .catch(e => {
          expect(e).toBeFalsy('It should have passed');
        })
        .then(done);
    });
  });
});
