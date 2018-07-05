import { CrudFilter } from '../../src';

export interface AppItem {
  name: string;
}

export class AppViewModel {
  public items: AppItem[];

  public crudFilter: CrudFilter<AppItem>;

  constructor() {
    // tslint:disable-next-line:insecure-random
    this.items = Array.from({ length: Math.floor(Math.random() * 10) }, (_v, i) => {
      return { name: `item no.${i}` };
    });
  }
}
