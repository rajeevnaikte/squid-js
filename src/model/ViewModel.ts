import { JsonObjectType, noOpNoReturn, proxyObject } from 'squid-utils';
import { baseViewConfigKeys, ViewState } from './ViewState';
import { CustomElement, UXJSCode, VoidFunction, VoidFunctionsMap } from './types';
import { getUniqueElId } from '../common/utils';
import { get as queryJsonPath, kebabCase } from 'lodash';
import { ComponentUndefined, ItemsNotAllowed, MultipleItemsRefs } from '../exceptions/errors';
import { getComponentDef, getComponentType, verifyDefined } from '../data/storage';
import { ComponentType } from './ComponentType';
import { Component, ComponentImplType } from './Component';
import { Config } from '../configurations/configuration';

/**
 * Communication interface between view and app model.
 */
export class ViewModel
{
  [key: string]: any;

  private readonly _id: string;
  private readonly _ux: string;
  private _state?: JsonObjectType;
  private readonly _bubbleEvents: boolean;
  private readonly _listeners: VoidFunctionsMap;
  private readonly _items: {
    [itemsRef: string]: {
      items: ViewModel[];
      itemsStartEl: Comment;
      itemsTemplateEl?: HTMLElement;
    };
  } = {};
  private readonly _domEl: HTMLElement;
  private _style?: HTMLElement;
  private _attachedTo?: {
    vm: ViewModel;
    itemFor: string;
    itemEl: HTMLElement;
  };
  private _comp?: Component;

  constructor (viewState: ViewState)
  {
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
		return Object.values(this._items).flatMap(entry => entry.items);
	}

	/**
	 * Get the ViewModel under whom this is attached.
	 */
	get attachedTo (): ViewModel | undefined {
		return this._attachedTo?.vm;
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
	 * Attach this ViewModel to another. A ViewModel can be attached to only one.
	 * So it will remove previous ViewModel and attach to new ViewModel.
	 * @param attachTo
	 * @param opts itemsFor - Optionally provide items key in the items object of attaching to ViewModel.
	 * @param opts position - Optionally provide item location in the items list/array of attaching to ViewModel.
	 */
	attachTo (attachTo: ViewModel, opts?: { itemFor?: string; position?: number }): void {
		const itemsFor = opts?.itemFor ?? Config.MAIN_ITEMS_REF;

		if (!attachTo._items[itemsFor]) {
			throw new ItemsNotAllowed(attachTo._domEl.getAttribute(Config.UX_NAME_ATTRIB) ?? '', itemsFor);
		}

		if (this._attachedTo) {
			this.detach();
		}

		if (this._style) {
			document.head.append(this._style);
		}

		const itemsForData = attachTo._items[itemsFor];
		const itemsLength = itemsForData.items.length;
		const position = (opts?.position !== undefined && opts.position < itemsLength) ? opts.position : itemsLength;

		const itemsStartOffset = Array.from(itemsForData.itemsStartEl.parentElement?.childNodes ?? [])
			.indexOf(itemsForData.itemsStartEl) + 1;

		let elementToInsert = this._domEl;
		if (itemsForData.itemsTemplateEl) {
			elementToInsert = itemsForData.itemsTemplateEl.cloneNode(true) as HTMLElement;
			const itemEl = elementToInsert.getElementsByTagName(Config.ITEM_TAG)[0];
			if (itemEl) {
				itemEl.replaceWith(this._domEl);
			}
			else {
				elementToInsert.append(this._domEl);
			}
		}

		itemsForData.itemsStartEl.parentElement?.insertBefore(elementToInsert,
			itemsForData.itemsStartEl.parentElement.childNodes.item(position + itemsStartOffset));
		(this._domEl as CustomElement).postRender?.();

		this._attachedTo = {
			vm: attachTo,
			itemFor: itemsFor,
			itemEl: elementToInsert
		};
    itemsForData.items.splice(position, 0, this);
  }

	/**
	 * Detach the ViewModel from the app.
	 */
	detach (): ViewModel {
		if (this._attachedTo) {
			this._attachedTo.itemEl.remove();
			if (this._style) {
				this._style.remove();
			}

			const itemsForData = this._attachedTo.vm._items[this._attachedTo.itemFor];
			const itemIdx = itemsForData.items.indexOf(this);
			if (itemIdx > -1) {
				itemsForData.items.splice(itemIdx, 1);
			}
			this._attachedTo = undefined;
		}
		return this;
	}

	/**
	 * Add item into the view-model which will render into view.
	 * @param view
	 * @param opts .itemFor
	 * @param opts .position - Optionally provide item location in the items list/array.
	 * @return added ViewModel
	 */
	addItem (view: ViewState | ViewModel, opts?: { itemFor?: string; position?: number }): ViewModel {
		if (!(view instanceof ViewModel)) {
			view = new ViewModel(view);
		}

		view.attachTo(this, opts);
		return view as ViewModel;
	}

	/**
	 * Remove item at given index or the matching instance of given ViewModel.
	 * @return Removed ViewModel or undefined if nothing removed.
	 */
	removeItem (item: number | ViewModel, opts?: { itemFor?: string }): ViewModel | undefined {
		const itemFor = opts?.itemFor ?? Config.MAIN_ITEMS_REF;

		if (!(item instanceof ViewModel)) {
			item = this._items[itemFor].items[item];
		}

		item?.detach();
		return item;
	}

	/**
	 * Get items for specific items key.
	 * @param itemsFor - If empty will return the 'main' items.
	 */
	getItems (itemsFor?: string) {
		return this._items[itemsFor ?? Config.MAIN_ITEMS_REF].items;
	}

	/**
	 * Find closes ancestor of given ux type
	 * @param uxType
	 */
	up (uxType: string): ViewModel | undefined {
		uxType = kebabCase(uxType);

		let upViewModel = this._attachedTo?.vm;
		while (upViewModel && kebabCase(upViewModel._ux) !== uxType) {
			upViewModel = upViewModel._attachedTo?.vm;
		}

		return upViewModel;
	}

	/**
	 * Find closes ancestor of given ux type
	 * @param uxType
	 */
	down (uxType: string): ViewModel[] | undefined {
		uxType = kebabCase(uxType);

		let downViewModels = Object.values(this._items).flatMap(entry => entry.items);
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
				downDownViewModels.push(...Object.values(downViewModel._items).flatMap(entry => entry.items));
			}
			downViewModels = downDownViewModels;
		}

		return undefined;
	}

	/**
	 * Build state object with setter to fire onStateUpdate event.
	 * @param viewState
	 * @param compType
	 */
	private buildState (viewState: ViewState, compType: ComponentType): JsonObjectType {
		const state = this.extractState(viewState);
		if (compType === ComponentType.COMPOSITE) {
			return proxyObject(state, this._comp?.onStateUpdate.bind(this));
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
	 * Build the custom element of the ux.
	 * @param viewState
	 * @param compType
	 */
	private buildDomEl (viewState: ViewState, compType: ComponentType): HTMLElement {
		let el: HTMLElement;

		if (compType === ComponentType.COMPOSITE) {
			el = document.createElement('div');
			el.setAttribute('class', this._id);
			el.setAttribute(Config.UX_NAME_ATTRIB, viewState.ux);
			const itemsEl = document.createElement('items');
			el.append(itemsEl);

			const compDef = getComponentDef(viewState.ux) as ComponentImplType;
			if (!compDef) throw new ComponentUndefined(viewState.ux);
			this._comp = new compDef(this);

			const reservedFunctionsUsage = Object.getOwnPropertyNames(this._comp.constructor.prototype)
				.filter(value => value !== 'constructor')
				.filter(compMethod => !reservedProperties.includes(compMethod));
			if (reservedFunctionsUsage.length > 0) {
				throw new Error(`${viewState.ux} has reserved function names.`
					+ `Please rename function(s) - ${reservedFunctionsUsage}`);
			}

			// Copy component method to the ViewModel.
			Object.getOwnPropertyNames(this._comp.constructor.prototype)
				.filter(value => value !== 'constructor')
				.filter(compMethod => !reservedProperties.includes(compMethod))
				.forEach(compMethod => this[compMethod] = this._comp?.[compMethod].bind(this._comp));

			this._state = this.buildState(viewState, compType);
			Object.assign(el, {
				postRender: () => {
					this.addItemsOf(this._comp?.buildViewState(viewState));
					this._comp?.onComponentReady?.();
				}
			});

			this.addItemsComment(itemsEl, Config.MAIN_ITEMS_REF);
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
					this.addItemsOf(viewState.items);
					(this._domEl as CustomElement).postRender = noOpNoReturn;

					uxjsCode.script.bind(el)();
				}
			};

			const styles = uxjsCode.style.bind(elBindings)();
			if (styles) {
				styles.slice(1).forEach(style => {
					// style.textContent = style.textContent?.replace(/(?:^|\s)items(?=\s|\.)/g, ' div.items') ?? null;
					// el.insertBefore(style, el.childNodes[0]);
					styles[0].textContent += style.textContent ?? '';
				});

				this._style = styles[0];
				document.head.prepend(this._style);
			}

			el = uxjsCode.html.bind(elBindings)()[0] as CustomElement;
			el.setAttribute(Config.UX_NAME_ATTRIB, viewState.ux);
			Object.assign(el, elBindings);

			this.setUpItemsRefs(el, viewState);
		}

		if (viewState.cssClass) {
			el.setAttribute('class', `${el.getAttribute('class') ?? ''} ${viewState.cssClass}`);
		}
		return el;
	}

	private addItemsComment (itemsEl: Element, itemsFor: string): void {
		const itemsStartEl = document.createComment('items');
		itemsEl.replaceWith(itemsStartEl);
		this._items[itemsFor] = {
			items: [],
			itemsStartEl
		};
	}

	/**
	 * Setup comment tags for items refs.
	 * @param el
	 * @param viewState
	 */
	private setUpItemsRefs (el: HTMLElement, viewState: ViewState) {
		const mainItemsTags = el.querySelectorAll(`${Config.ITEMS_TAG}:not([${Config.ITEMS_FOR_ATTRIB}])`);
		if (mainItemsTags.length > 1) {
			throw new MultipleItemsRefs(viewState.ux, Config.MAIN_ITEMS_REF);
		}
		if (mainItemsTags.length > 0) {
			this.addItemsComment(mainItemsTags[0], Config.MAIN_ITEMS_REF);
		}

		el.querySelectorAll(`${Config.ITEMS_TAG}[${Config.ITEMS_FOR_ATTRIB}]`)
			.forEach(itemsEl => {
				const itemsFor = itemsEl.getAttribute(Config.ITEMS_FOR_ATTRIB) as string;
				if (this._items[itemsFor]) {
					throw new MultipleItemsRefs(viewState.ux, itemsFor);
				}
				this.addItemsComment(itemsEl, itemsFor);
			});

		el.querySelectorAll(`[${Config.ITEMS_FOR_ATTRIB}]`)
			.forEach(templateEl => {
				const itemsFor = templateEl.getAttribute(Config.ITEMS_FOR_ATTRIB) as string;
				if (this._items[itemsFor]) {
					throw new MultipleItemsRefs(viewState.ux, itemsFor);
				}
				this.addItemsComment(templateEl, itemsFor);
				this._items[itemsFor].itemsTemplateEl = templateEl as HTMLElement;
			});
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

	private addItemsOf (items?: ViewState[] | { [itemsFor: string]: ViewState[] }) {
		if (items) {
			if (Array.isArray(items)) {
				items.forEach(item => this.addItem(item));
			}
			else {
				for (const itemsFor in items) {
					items[itemsFor].forEach(item => this.addItem(item, { itemFor: itemsFor }));
				}
			}
		}
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
	 * Get ViewModels added into this GenesisViewModel.
	 */
	get items (): ViewModel[] {
		return this._items;
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
		// @ts-ignore
		if (view._style) {
			// @ts-ignore
			document.head.append(view._style);
		}
		(view.domEl as CustomElement).postRender?.();
		this._items.push(view as ViewModel);
		return view as ViewModel;
	}
}

export const reservedProperties = Object.getOwnPropertyNames(ViewModel.prototype)
	.filter(value => !['constructor', 'onStateUpdate', 'onListenersUpdate'].includes(value));
