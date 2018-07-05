import { AppViewModel } from './utilities';
import { configure, CrudFilter } from '../../src/index';
// import { bootstrap } from 'aurelia-bootstrapper';
import { configure as configureTemplatingBinding } from 'aurelia-templating-binding';
import { configure as configureTemplatingResources } from 'aurelia-templating-resources';
import { StageComponent, ComponentTester } from 'aurelia-testing';
import { Aurelia } from 'aurelia-framework';
import { WebpackLoader } from 'aurelia-loader-webpack';

describe('router-view', () => {
  let aurelia: Aurelia;
  let component: ComponentTester;
  let app: AppViewModel;
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

    component = StageComponent
      .withResources()
      .inView('<crud-filter view-model.ref="crudFilter" item-key="name" items.bind="items"></crud-filter>')
      .boundTo(app = new AppViewModel());
  });

  afterEach(() => {
    component.dispose();
  });

  it('should leave original items intact', done => {
    component
      .create(cfg => cfg(aurelia))
      .then(() => {
        expect(app.items).toBe(app.crudFilter.items, 'CF `items` collection should be the same with original');
        expect(app.items).not.toBe(app.crudFilter.filteredItems);
      })
      .catch(e => {
        expect(e).toBeFalsy('It should have created the view');
      })
      .then(done);
  });
});
