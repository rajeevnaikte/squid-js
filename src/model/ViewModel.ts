import { JsonObjectType, noOpNoReturn, proxyObject } from 'squid-utils';
import { baseViewConfigKeys, ViewState } from './ViewState';
import { CustomElement, UXJSCode, VoidFunction, VoidFunctionsMap } from './types';
import { getUniqueElId } from '../common/utils';
import { get as queryJsonPath, kebabCase } from 'lodash';
import { ComponentUndefined, ItemsNotAllowed } from '../exceptions/errors';
import { getComponentDef, getComponentType, verifyDefined } from '../data/storage';
import { ComponentType } from './ComponentType';
import { Component, ComponentImplType } from './Component';
import { Config } from '../configurations/configuration';

/**
 * Communication interface between view and app model.
 */
export class ViewModel {
  private readonly _id: string;
  private readonly _ux: string;
  private _state?: JsonObjectType;
  private readonly _bubbleEvents: boolean;
  private readonly _listeners: VoidFunctionsMap;
  private readonly _items: ViewModel[] = [];
  private readonly _domEl: HTMLElement;
  private _itemsEl?: Element | null;
  private _attachedTo?: ViewModel;
  private _comp?: Component;

  constructor (viewState: ViewState) {
    this._ux = viewState.ux;
    viewState.ux = kebabCase(viewState.ux);
    verifyDefined(viewState.ux);
    const compType = getComponentType(viewState.ux) as ComponentType;

    this._id = getUniqueElId();
    this._domEl = this.buildDomEl(viewState, compType);

    this._bubbleEvents = viewState.bubbleEvents ?? false;
    this._listeners = this.buildListeners(viewState);
  }

  /**
   * Build state object with setter to fire onStateUpdate event.
   * @param viewState
   */
  private buildState (viewState: ViewState, compType: ComponentType): JsonObjectType {
    const state = this.extractState(viewState);
    if (compType === ComponentType.COMPOSITE) {
      return proxyObject(state, this._comp?.onStateUpdate?.bind(this));
    }
    else {
      return proxyObject(state, this.onStateUpdate.bind(this));
    }
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
   * Build listeners object and attach to dom events.
   */
  buildListeners (viewState: ViewState): VoidFunctionsMap {
    const listenerObject = proxyObject({}, this.onListenersUpdate.bind(this));
    for (const event in viewState.listeners ?? {}) {
      listenerObject[event] = viewState.listeners?.[event];
    }
    return listenerObject;
  }

  /**
   * Build the custom element of the ux.
   * @param viewState
   */
  private buildDomEl (viewState: ViewState, compType: ComponentType): HTMLElement {
    if (compType === ComponentType.COMPOSITE) {
      const el = document.createElement('div');
      el.setAttribute('class', this._id);
      el.setAttribute(Config.UX_NAME_ATTRIB, viewState.ux);
      const compDef = getComponentDef(viewState.ux) as ComponentImplType;
      if (!compDef) throw new ComponentUndefined(viewState.ux);
      this._comp = new compDef(this);
      this._itemsEl = document.createElement('div');
      this._itemsEl.setAttribute('class', 'items');
      el.appendChild(this._itemsEl);
      this._comp?.buildViewState(viewState)?.forEach(this.addItem.bind(this));
      this._state = this.buildState(viewState, compType);
      return el;
    }
    else {
      this._state = this.buildState(viewState, compType);
      const uxjsCode = getComponentDef(viewState.ux) as UXJSCode;
      const elBindings = {
        onDataUpdate: {},
        getData: (stateKey: string) => {
          if (stateKey === 'id') return this._id;
          return queryJsonPath(this._state, stateKey)?.toString() ?? '';
        },
        postRender: () => {
          const itemsEl = this._domEl.getElementsByTagName('items')[0];
          if (itemsEl) {
            this._itemsEl = document.createElement('div');
            this._itemsEl.setAttribute('class', 'items');
            itemsEl?.parentElement?.replaceChild(this._itemsEl, itemsEl);
          }
          viewState.items?.forEach(this.addItem.bind(this));
          (this._domEl as CustomElement).postRender = noOpNoReturn;
        }
      };

      const el = uxjsCode.html.bind(elBindings)()[0] as CustomElement;
      el.setAttribute(Config.UX_NAME_ATTRIB, viewState.ux);
      Object.assign(el, elBindings);

      const styles = uxjsCode.style.bind(el)();
      if (styles) styles.forEach(style => {
        style.textContent = style.textContent?.replace(/(?:^|\s)items(?=\s|\.)/g, ' div.items') ?? null;
        el.insertBefore(style, el.childNodes[0]);
      });

      uxjsCode.script.bind(el)();

      return el;
    }
  }

  /**
   * When a state is updated, then view's onDataUpdate functions will be called.
   * @param key
   * @param prevValue
   * @param newValue
   */
  private onStateUpdate (key: string, prevValue: any, newValue: any): void {
    Object.keys((this._domEl as CustomElement).onDataUpdate)
      .filter(dataJsonPath => dataJsonPath === key || dataJsonPath.startsWith(`${key}.`))
      .flatMap(dataJsonPath => (this._domEl as CustomElement).onDataUpdate[dataJsonPath])
      .forEach(updateFn => updateFn());
  }

  /**
   * When a listener is added attach it to dom.
   */
  private onListenersUpdate (eventName: PropertyKey, prevListener: VoidFunction, newListener: VoidFunction): VoidFunction {
    eventName = eventName as string;
    this._domEl.removeEventListener(eventName, prevListener);
    const listener = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
      newListener(this, event);

      if (this._bubbleEvents) {
        this.attachedTo?.listeners?.[eventName as string]?.(this, event);
      }
    };
    this._domEl.addEventListener(eventName, listener);
    return listener;
  }

  /**
   * Attach this ViewModel to another. A ViewModel can be attached to only one.
   * So it will remove previous ViewModel and attach to new ViewModel.
   * @param attachTo
   * @param position - Optionally provide item location in the items list/array of attaching to ViewModel.
   */
  attachTo (attachTo: ViewModel, position?: number): void {
    if (!attachTo._itemsEl) {
      throw new ItemsNotAllowed(attachTo._domEl.getAttribute(Config.UX_NAME_ATTRIB) ?? '');
    }

    if (this._attachedTo) {
      this.detach();
    }
    position = (position === undefined || position === null) ? attachTo._items.length : position;
    attachTo._itemsEl.insertBefore(this._domEl, attachTo._itemsEl.childNodes.item(position));
    (this._domEl as CustomElement).postRender?.();
    this._attachedTo = attachTo;
    attachTo._items.splice(position, 0, this);
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
   * @return added ViewModel
   */
  addItem (view: ViewState | ViewModel, position?: number): ViewModel {
    if (!(view instanceof ViewModel)) {
      view = new ViewModel(view);
    }

    view.attachTo(this, position);
    return view as ViewModel;
  }

  /**
   * Remove item at given index or the matching instance of given ViewModel.
   * @return Removed ViewModel or undefined if nothing removed.
   */
  removeItem (item: number | ViewModel): ViewModel | undefined {
    if (!(item instanceof ViewModel)) {
      item = this._items[item];
    }

    item?.detach();
    return item;
  }

  /**
   * Get the unique id of the ViewModel.
   */
  get id (): string {
    return this._id;
  }

  /**
   * Get the ux name this ViewModel is associated with.
   */
  get ux (): string {
    return this._ux;
  }

  /**
   * Get the state object.
   */
  get state (): { [key: string]: any } {
    return this._state as NonNullable<{ [key: string]: any }>;
  }

  /**
   * Get listeners list.
   */
  get listeners (): VoidFunctionsMap {
    return this._listeners;
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

  /**
   * Get component if the ViewModel type is composite component.
   */
  get comp (): Component {
    return this._comp as Component;
  }

  /**
   * Find closes ancestor of given ux type
   * @param uxType
   */
  up (uxType: string): ViewModel | undefined {
    uxType = kebabCase(uxType);

    let upViewModel = this._attachedTo;
    while (upViewModel && kebabCase(upViewModel._ux) !== uxType) {
      upViewModel = upViewModel._attachedTo;
    }

    return upViewModel;
  }

  /**
   * Find closes ancestor of given ux type
   * @param uxType
   */
  down (uxType: string): ViewModel[] | undefined {
    uxType = kebabCase(uxType);

    let downViewModels = this._items;
    while (downViewModels.length > 0) {
      const requiredViewModels: ViewModel[] = [];
      for (const downViewModel of downViewModels) {
        if (kebabCase(downViewModel._ux) === uxType) {
          requiredViewModels.push(downViewModel);
        }
      }

      if (requiredViewModels.length > 0) {
        return requiredViewModels;
      }

      const downDownViewModels: ViewModel[] = [];
      for (const downViewModel of downViewModels) {
        downDownViewModels.push(...downViewModel._items);
      }
      downViewModels = downDownViewModels;
    }

    return undefined;
  }
}

/**
 * Get Genesis ViewModel.
 */
export class GenesisViewModel {
  private readonly _domEl: HTMLElement;
  private readonly _items: ViewModel[] = [];

  constructor (rootEl: HTMLElement) {
    this._domEl = rootEl;
  }

  /**
   * Add view tree layout from GenesisViewModel.
   * @param view
   */
  add (view: ViewState | ViewModel): ViewModel {
    if (!(view instanceof ViewModel)) {
      view = new ViewModel(view);
    }

    view.detach();
    this._domEl.appendChild(view.domEl);
    (view.domEl as CustomElement).postRender?.();
    this._items.push(view as ViewModel);
    return view as ViewModel;
  }

  /**
   * Get ViewModels added into this GenesisViewModel.
   */
  get items (): ViewModel[] {
    return this._items;
  }
}
