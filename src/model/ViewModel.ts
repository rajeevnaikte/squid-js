import { JsonObjectType } from 'squid-utils';
import { baseViewConfigKeys, ViewState } from './ViewState';
import { CustomElement } from './types';
import { getUniqueElId } from '../common/utils';
import { kebabCase } from 'lodash';
import { ItemsNotAllowed } from '../exceptions/errors';

/**
 * Communication interface between view and app model.
 */
export class ViewModel {
  private readonly state: JsonObjectType;
  private readonly items: ViewModel[] = [];
  private attachedTo?: ViewModel | HTMLElement;
  readonly domEl: CustomElement;
  readonly itemsEl: Element | null;

  constructor (viewState: ViewState, attachTo?: ViewModel | HTMLElement) {
    this.state = new Proxy(this.extractState(viewState), {
      get: (target, key, receiver) => Reflect.get(target, key, receiver),
      set: (target, key, value, receiver): boolean => {
        const currValue = target[key as string];
        Reflect.set(target, key, value, receiver);
        this.onStateUpdate(key as string, currValue, value);
        return true;
      }
    });

    this.domEl = this.buildDomEl(viewState);
    this.domEl.data = this.state;
    if (attachTo) this.attachTo(attachTo);
    this.itemsEl = this.domEl.getElementsByTagName('items')[0];
    viewState.items?.forEach(this.addItem.bind(this));
  }

  private extractState (viewState: ViewState): JsonObjectType {
    return Object.keys(viewState)
      .filter(key => !baseViewConfigKeys.includes(key))
      .reduce((dataObj: JsonObjectType, key: string) => {
        dataObj[key] = viewState[key];
        return dataObj;
      }, {});
  }

  private buildDomEl (viewState: ViewState): CustomElement {
    const id = getUniqueElId();
    const compName = kebabCase(viewState.ux);
    const compEl = document.createElement(compName);
    compEl.setAttribute('id', id);


    return compEl as CustomElement;
  }

  /**
   * When a state is updated, then view onDataUpdate functions will be called.
   * @param key
   * @param prevValue
   * @param newValue
   */
  private onStateUpdate (key: string, prevValue: any, newValue: any): void {
    // Update view in the custom element object.
    this.domEl.data = this.state;
    Object.keys(this.domEl.onDataUpdate)
      .filter(dataJsonPath => dataJsonPath === key || dataJsonPath.startsWith(`${key}.`))
      .flatMap(dataJsonPath => this.domEl.onDataUpdate[dataJsonPath])
      .forEach(updateFn => updateFn());
  }

  /**
   * Attach this ViewModel to another. A ViewModel can be attached to only one.
   * So it will remove previous ViewModel and attach to new ViewModel.
   * @param attachToEl
   */
  attachTo (attachToEl: ViewModel | HTMLElement): void {
    if (this.attachedTo) {
      this.detach();
    }
    this.attachEl(attachToEl);
    this.attachedTo = attachToEl;
  }

  /**
   * Attach dom element.
   */
  private attachEl (attachToEl: ViewModel | HTMLElement) {
    if (attachToEl instanceof HTMLElement) {
      attachToEl.append(this.domEl);
    }
    else if (attachToEl.itemsEl) {
      attachToEl.itemsEl.append(this.domEl);
    }
    else {
      throw new ItemsNotAllowed(attachToEl.domEl.tagName);
    }
  }

  /**
   * Detach the ViewModel from the app.
   */
  detach () {
    this.attachedTo = undefined;
    this.domEl.remove();
    return this.domEl;
  }

  /**
   * Add item into the view-model which will render into view.
   * @param viewState
   */
  addItem (viewState: ViewState | ViewModel): void {
    if (!(viewState instanceof ViewModel)) {
      viewState = new ViewModel(viewState, this);
    }

    this.items.push(viewState);
  }

  /**
   * Remove item at given index or the matching instance of given ViewModel.
   * @return Removed item or undefined if nothing removed.
   */
  removeItem (item: number | ViewModel): ViewModel | undefined {
    if (item instanceof ViewModel) {
      item = this.items.indexOf(item);
    }

    if (item >= this.items.length) return undefined;
    item = this.items.splice(item, 1)[0];
    item?.detach();
    return item;
  }
}

/**
 * Get Genesis ViewModel. There will be only one genesis ViewModel in the window.
 */
export class GenesisViewModel {
  private readonly rootEl: HTMLElement;
  private items: ViewModel[] = [];

  private constructor (rootEl: HTMLElement) {
    this.rootEl = rootEl;
  }

  private static instance: GenesisViewModel;
  static getInstance (rootEl: HTMLElement | null | undefined): GenesisViewModel {
    if (this.instance) return this.instance;
    this.instance = new GenesisViewModel(rootEl ?? document.body);
    return this.instance;
  }

  addItem (viewState: ViewState): void {
    this.items.push(new ViewModel(viewState, this.rootEl));
  }
}
