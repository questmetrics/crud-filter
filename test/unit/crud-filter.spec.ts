import { AppViewModel, AppItem } from './utilities';
import { configure } from '../../src/index';
// import { bootstrap } from 'aurelia-bootstrapper';
import { configure as configureTemplatingBinding } from 'aurelia-templating-binding';
import { configure as configureTemplatingResources } from 'aurelia-templating-resources';
import { StageComponent, ComponentTester } from 'aurelia-testing';
import { Aurelia } from 'aurelia-framework';
import { WebpackLoader } from 'aurelia-loader-webpack';

describe('router-view', () => {
  let aurelia: Aurelia;
  let component: ComponentTester<AppViewModel>;
  let view: string;
  const originalConfigure = ComponentTester.prototype.configure;

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
});
