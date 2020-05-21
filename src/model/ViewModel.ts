import { JsonObjectType, noOpNoReturn } from 'squid-utils';
import { baseViewConfigKeys, ViewState } from './ViewState';
import { CustomElement } from './types';
import { getUniqueElId } from '../common/utils';
import { get as queryJsonPath, kebabCase } from 'lodash';
import { ItemsNotAllowed } from '../exceptions/errors';
import { verifyDefined } from '../data/storage';

/**
 * Communication interface between view and app model.
 */
export class ViewModel {
  private readonly _id: string;
  private readonly _state: JsonObjectType;
  private readonly _items: ViewModel[] = [];
  private readonly _domEl: CustomElement;
  private _itemsEl?: Element | null;
  private _attachedTo?: ViewModel;

  constructor (viewState: ViewState) {
    viewState.ux = kebabCase(viewState.ux);
    verifyDefined(viewState.ux);

    this._id = getUniqueElId();
    this._state = this.buildState(viewState);
    this._domEl = this.buildDomEl(viewState);
  }

  /**
   * Build state object with setter to fire onStateUpdate event.
   * @param viewState
   */
  private buildState (viewState: ViewState): JsonObjectType {
    return new Proxy(this.extractState(viewState), {
      get: (target, key, receiver) => Reflect.get(target, key, receiver),
      set: (target, key, value, receiver): boolean => {
        const currValue = target[key as string];
        Reflect.set(target, key, value, receiver);
        this.onStateUpdate(key as string, currValue, value);
        return true;
      }
    });
  }

  /**
   * Extract view state data from given object.
   * @param viewState
   */
  private extractState (viewState: ViewState): JsonObjectType {
    return Object.keys(viewState)
      .filter(key => !baseViewConfigKeys.includes(key))
      .reduce((dataObj: JsonObjectType, key: string) => {
        dataObj[key] = viewState[key];
        return dataObj;
      }, {});
  }

  /**
   * Build the custom element of the ux.
   * @param viewState
   */
  private buildDomEl (viewState: ViewState): CustomElement {
    const el = document.createElement(viewState.ux) as CustomElement;
    el.getData = (stateKey: string) => {
      if (stateKey === 'id') return this._id;
      return queryJsonPath(this._state, stateKey)?.toString() ?? '';
    };
    el.postRender = () => {
      this._itemsEl = this._domEl.getElementsByTagName('items')[0];
      viewState.items?.forEach(this.addItem.bind(this));
      this._domEl.postRender = noOpNoReturn;
    };
    return el;
  }

  /**
   * When a state is updated, then view's onDataUpdate functions will be called.
   * @param key
   * @param prevValue
   * @param newValue
   */
  private onStateUpdate (key: string, prevValue: any, newValue: any): void {
    Object.keys(this._domEl.onDataUpdate)
      .filter(dataJsonPath => dataJsonPath === key || dataJsonPath.startsWith(`${key}.`))
      .flatMap(dataJsonPath => this._domEl.onDataUpdate[dataJsonPath])
      .forEach(updateFn => updateFn());
  }

  /**
   * Attach this ViewModel to another. A ViewModel can be attached to only one.
   * So it will remove previous ViewModel and attach to new ViewModel.
   * @param attachTo
   * @param position - Optionally provide item location in the items list/array of attaching to ViewModel.
   */
  attachTo (attachTo: ViewModel, position?: number): void {
    if (this._attachedTo) {
      this.detach();
    }
    position = (position === undefined || position === null) ? attachTo._items.length : position;
    this.attachEl(attachTo, position);
    this._attachedTo = attachTo;
    attachTo._items.splice(position, 0, this);
  }

  /**
   * Attach dom element.
   */
  private attachEl (attachToEl: ViewModel, position: number) {
    if (attachToEl._itemsEl) {
      attachToEl._itemsEl.insertBefore(this._domEl, attachToEl._itemsEl.childNodes.item(position));
    }
    else {
      throw new ItemsNotAllowed(attachToEl._domEl.tagName);
    }
  }

  /**
   * Detach the ViewModel from the app.
   */
  detach (): ViewModel {
    this._domEl.remove();
    if (this._attachedTo) {
      const itemIdx = this._attachedTo._items.indexOf(this);
      if (itemIdx > -1) {
        this._attachedTo._items.splice(itemIdx, 1);
      }
      this._attachedTo = undefined;
    }
    return this;
  }

  /**
   * Add item into the view-model which will render into view.
   * @param view
   * @param position - Optionally provide item location in the items list/array.
   */
  addItem (view: ViewState | ViewModel, position?: number): void {
    if (!(view instanceof ViewModel)) {
      view = new ViewModel(view);
    }

    view.attachTo(this, position);
  }

  /**
   * Remove item at given index or the matching instance of given ViewModel.
   * @return Removed item or undefined if nothing removed.
   */
  removeItem (item: number | ViewModel): ViewModel | undefined {
    if (!(item instanceof ViewModel)) {
      item = this._items[item];
    }

    item?.detach();
    return item;
  }

  /**
   * Get the state object.
   */
  get state (): JsonObjectType {
    return this._state;
  }

  /**
   * Get items attached to this ViewModel.
   */
  get items (): ViewModel[] {
    return [...this._items];
  }

  /**
   * Get the ViewModel under whom this is attached.
   */
  get attachedTo (): ViewModel | undefined {
    return this._attachedTo;
  }

  /**
   * Get the dom element.
   */
  get domEl (): HTMLElement {
    return this._domEl;
  }
}

/**
 * Get Genesis ViewModel.
 */
export class GenesisViewModel {
  private readonly domEl: HTMLElement;
  private readonly items: ViewModel[] = [];

  constructor (rootEl: HTMLElement) {
    this.domEl = rootEl;
  }

  /**
   * Add view tree layout from GenesisViewModel.
   * @param view
   */
  add (view: ViewState | ViewModel): void {
    if (!(view instanceof ViewModel)) {
      view = new ViewModel(view);
    }

    view.detach();
    this.domEl.appendChild(view.domEl);
    this.items.push(view);
  }
}
