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
  private readonly id: string;
  readonly state: JsonObjectType;
  private readonly items: ViewModel[] = [];
  private attachedTo?: ViewModel;
  readonly domEl: CustomElement;
  private itemsEl?: Element | null;

  constructor (viewState: ViewState) {
    viewState.ux = kebabCase(viewState.ux);
    verifyDefined(viewState.ux);

    this.id = getUniqueElId();
    this.state = this.buildState(viewState);
    this.domEl = this.buildDomEl(viewState);
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
      if (stateKey === 'id') return this.id;
      return queryJsonPath(this.state, stateKey)?.toString() ?? '';
    };
    el.postRender = () => {
      this.itemsEl = this.domEl.getElementsByTagName('items')[0];
      viewState.items?.forEach(this.addItem.bind(this));
      this.domEl.postRender = noOpNoReturn;
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
    Object.keys(this.domEl.onDataUpdate)
      .filter(dataJsonPath => dataJsonPath === key || dataJsonPath.startsWith(`${key}.`))
      .flatMap(dataJsonPath => this.domEl.onDataUpdate[dataJsonPath])
      .forEach(updateFn => updateFn());
  }

  /**
   * Attach this ViewModel to another. A ViewModel can be attached to only one.
   * So it will remove previous ViewModel and attach to new ViewModel.
   * @param attachTo
   * @param position - Optionally provide item location in the items list/array of attaching to ViewModel.
   */
  attachTo (attachTo: ViewModel, position?: number): void {
    if (this.attachedTo) {
      this.detach();
    }
    position = (position === undefined || position === null) ? attachTo.items.length : position;
    this.attachEl(attachTo, position);
    this.attachedTo = attachTo;
    attachTo.items.splice(position, 0, this);
  }

  /**
   * Get the ViewModel under whom this is attached.
   */
  getAttachedTo (): ViewModel | undefined {
    return this.attachedTo;
  }

  /**
   * Attach dom element.
   */
  private attachEl (attachToEl: ViewModel, position: number) {
    if (attachToEl.itemsEl) {
      attachToEl.itemsEl.insertBefore(this.domEl, attachToEl.itemsEl.childNodes.item(position));
    }
    else {
      throw new ItemsNotAllowed(attachToEl.domEl.tagName);
    }
  }

  /**
   * Detach the ViewModel from the app.
   */
  detach (): ViewModel {
    this.domEl.remove();
    if (this.attachedTo) {
      const itemIdx = this.attachedTo.items.indexOf(this);
      if (itemIdx > -1) {
        this.attachedTo.items.splice(itemIdx, 1);
      }
      this.attachedTo = undefined;
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
      item = this.items[item];
    }

    item?.detach();
    return item;
  }

  /**
   * Get items attached to this ViewModel.
   */
  getItems (): ViewModel[] {
    return [...this.items];
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
