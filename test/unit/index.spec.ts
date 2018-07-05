import { configure } from '../../src/index';
import { Aurelia } from 'aurelia-framework';
import { configure as configureTemplatingBinding } from 'aurelia-templating-binding';
import { configure as configureTemplatingResources } from 'aurelia-templating-resources';
import { WebpackLoader } from 'aurelia-loader-webpack';

describe('configure()', () => {
  it('should configure', done => {
    const aurelia = new Aurelia(new WebpackLoader());

    aurelia.use
      .plugin(configureTemplatingBinding)
      .plugin(configureTemplatingResources)
      .plugin(configure);

    aurelia
      .start()
      .then(() => {
        expect(aurelia.resources.getElement('crud-filter')).toBeDefined();
      })
      .catch(ex => {
        expect(ex).toBeUndefined('It should have register the element');
      })
      .then(done);
  });
});
