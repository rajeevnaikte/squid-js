import { ViewState } from './ViewState';
import { ViewModel } from './ViewModel';

/**
 * UI component is a view built from multiple UX components.
 * E.g. grid view is build with multiple UX components, such as, table cell, row header, etc.
 * Abstraction of UI component code.
 */
export abstract class Component {
  /**
   * ViewModel object of this component instance.
   */
  readonly vm: ViewModel;

  public constructor (vm: ViewModel) {
    this.vm = vm;
  }

  /**
   * Build view-config object from UX components, which will be used to render the full view.
   * @param viewState
   */
  abstract buildViewState (viewState: ViewState): ViewState[];

  /**
   * When a state of the view is updated through view-model, then this method is called.
   * Write logic here to update the view-model of inner components.
   * @param viewModel
   * @param stateKey
   * @param prevValue
   * @param newValue
   */
  onStateUpdate? (key: string, prevValue: any, newValue: any): void;

  [key: string]: any;
}

export type ComponentImplType = {
  new (vm: ViewModel): Component;
}
