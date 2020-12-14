import { ViewState } from './ViewState';
import { reservedProperties, ViewModel } from './ViewModel';
import { BaseError } from 'squid-utils';
import { VoidFunction } from './types';

/**
 * UI component is a view built from multiple UX components.
 * E.g. grid view is build with multiple UX components, such as, table cell, row header, etc.
 * Abstraction of UI component code.
 */
export abstract class Component
{
  [key: string]: any;
  /**
   * ViewModel object of this component instance.
   */
  readonly vm: ViewModel;

  public constructor (vm: ViewModel)
  {
    const overlap = Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(value => value !== 'constructor')
      .find(value => reservedProperties.includes(value));

    if (overlap)
    {
      throw new BaseError(
        'CLASS_PROPERTY_NOT_ALLOWED',
        `${reservedProperties} are not allowed to use in the class def.`
      );
    }

    this.vm = vm;
  }

  /**
   * Build view-config object from UX components, which will be used to render the full view.
   * @param viewState
   */
  abstract buildViewState (viewState: ViewState): ViewState[];

  /**
   * Function called after calling buildViewState and adding it to the containing ViewModel.
   * I.e. after the component is built and ready.
   */
  onComponentReady (): void
  {}

  /**
   * When a state of the view is updated through view-model, then this method is called.
   * Write logic here to update the view-model of inner components.
   * @param viewModel
   * @param stateKey
   * @param prevValue
   * @param newValue
   */
  onStateUpdate (key: string, prevValue: any, newValue: any): void
  {}

  /**
   * When the listener object of the ViewModel (this.vm) is updated,
   * this method will be invoked.
   * @param eventName
   * @param prevListener
   * @param newListener
   */
  onListenersUpdate (eventName: PropertyKey, prevListener: VoidFunction, newListener: VoidFunction): void
  {}
}

export type ComponentImplType = {
  new (vm: ViewModel): Component;
}
