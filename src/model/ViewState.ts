import { ViewModel } from './ViewModel';

/**
 * Configuration of the view to be rendered.
 */
export type ViewState = {
  /**
   * The full UX name. E.g. form.text-input or form-text-input
   * The name can be in any format. It will be kebabCased in the framework.
   */
  ux: string;
  /**
   * CSS class to be applied to this view root element.
   */
  cssClass?: string;
  /**
   * Data used in the display of the view.
   */
  state?: Record<string, any>;
  /**
   * Items to be displayed under this UX. E.g. multiple form-text-input under form.
   *
   * e.g. items: [{
   *   ux: 'form-text-input'
   * }, {
   *   ux: 'form-text-input'
   * }]
   *
   * e.g. items: {
   *   headers: [{
   *     ux: 'table-header'
   *   }, {
   *     ux: 'table-header'
   *   }],
   *   rows: [{
   *     ux: 'table-row',
   *     items: [{
   *       ux: 'table-cell'
   *     }]
   *   }]
   * }
   */
  items?: ViewState[] | { [itemsFor: string]: ViewState[] };
  /**
   * HTML DOM listeners can be added here.
   */
  listeners?: { [key: string]: (viewModel: ViewModel, event: Event) => void };
  /**
   * By default events will not be bubbled up.
   */
  bubbleEvents?: boolean;
}

export const baseViewConfigKeys = ['ux', 'items', 'listeners'];
