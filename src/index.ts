import { FrameworkConfiguration, DOM } from 'aurelia-framework';
import { configure as configureBlur } from 'aurelia-blur-attribute';
import { configure as configurePortal } from 'aurelia-portal-attribute';
import { CrudFilter } from './crud-filter';
import css from './crud-filter.css';

export { CrudFilter };

export function configure(fxconfig: FrameworkConfiguration): void {
  fxconfig.plugin(configurePortal);
  fxconfig.plugin(configureBlur as any);
  DOM.injectStyles(css, undefined, undefined, 'crud-filter-css');
  fxconfig.globalResources(CrudFilter);
}
