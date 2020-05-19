import { ViewState } from './ViewState';
import { ViewModel } from './ViewModel';

/**
 * UI component is a view built from multiple UX components.
 * E.g. grid view is build with multiple UX components, such as, table cell, row header, etc.
 * Abstraction of UI component code.
 */
export type UXComponent = {
  /**
   * Build view-config object from UX components, which will be used to render the full view.
   * @param viewConfig
   */
  buildViewState: (viewConfig: ViewState) => ViewState;

  /**
   * When a state of the view is updated through view-model, then this method is called.
   * Write logic here to update the view-model of inner components.
   * @param viewModel
   * @param stateKey
   * @param prevValue
   * @param newValue
   */
  onStateUpdate: (viewModel: ViewModel, key: string, prevValue: any, newValue: any) => void;

  onItemAdd?: (viewModel: ViewModel, newItem: ViewState) => void;
  onItemRemove?: (viewModel: ViewModel, removedItem: ViewModel) => void;
}
