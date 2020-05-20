import { emptyVoidFn, JsonObjectType } from 'squid-utils';
import { baseViewConfigKeys, ViewState } from './ViewState';
import { CustomElement } from './types';
import { getUniqueElId } from '../common/utils';
import { get as queryJsonPath, kebabCase } from 'lodash';
import { ItemsNotAllowed } from '../exceptions/errors';

/**
 * Communication interface between view and app model.
 */
export class ViewModel {
  private readonly id: string;
  private readonly state: JsonObjectType;
  private readonly items: ViewModel[] = [];
  private attachedTo?: ViewModel;
  readonly domEl: CustomElement;
  private itemsEl?: Element | null;

  constructor (viewState: ViewState) {
    this.id = getUniqueElId();

    this.state = new Proxy(this.extractState(viewState), {
      get: (target, key, receiver) => Reflect.get(target, key, receiver),
      set: (target, key, value, receiver): boolean => {
        const currValue = target[key as string];
        Reflect.set(target, key, value, receiver);
        this.onStateUpdate(key as string, currValue, value);
        return true;
      }
    });

    const compName = kebabCase(viewState.ux);
    this.domEl = document.createElement(compName) as CustomElement;
    this.domEl.getData = (stateKey: string) => {
      if (stateKey === 'id') return this.id;
      return queryJsonPath(this.state, stateKey)?.toString() ?? '';
    }
    this.domEl.postRender = () => {
      this.itemsEl = this.domEl.getElementsByTagName('items')[0];
      this.items.forEach(item => item.attachTo(this));
      this.domEl.postRender = emptyVoidFn;
    }

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
   */
  attachTo (attachTo: ViewModel): void {
    if (this.attachedTo) {
      this.detach();
    }
    this.attachEl(attachTo);
    this.attachedTo = attachTo;
  }

  /**
   * Attach dom element.
   */
  private attachEl (attachToEl: ViewModel) {
    if (attachToEl.itemsEl) {
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
      viewState = new ViewModel(viewState);
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
   * @param viewState
   */
  add (viewState: ViewState): void {
    const viewModel = new ViewModel(viewState);
    this.domEl.appendChild(viewModel.domEl);
    this.items.push(viewModel);
  }
}
