import { CrudFilter } from '../../src';

export interface AppItem {
  name: string;
}

export class AppViewModel {
  public items: AppItem[];

  public readonly crudFilter: CrudFilter<AppItem>;
  public readonly crudFilterEl: HTMLElement;

  constructor(minItem: number = 0) {
    // tslint:disable-next-line:insecure-random
    this.items = Array.from({ length: Math.floor(Math.random() * 10) + minItem }, (_v, i) => {
      return { name: `item no.${i}` };
    });
  }

  public addItem(item: AppItem): void {
    this.items.push(item);
  }
}

export function wait(time: number = 100): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
