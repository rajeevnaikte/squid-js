import { ViewModel } from './ViewModel';

/**
 * Configuration of the view to be rendered.
 */
export type ViewStateBase = {
  /**
   * The full UX name. E.g. form.text-input or form-text-input
   * The name can be in any format. It will be kebabCased in the framework.
   */
  ux: string;
  /**
   * Items to be displayed under this UX. E.g. multiple form-text-input under form.
   */
  items?: ViewState[];
  /**
   * HTML DOM listeners can be added here.
   */
  listeners?: { [key: string]: (viewModel: ViewModel, event: Event) => void };
  /**
   * By default events will not be bubbled up.
   */
  bubbleEvents?: boolean;
}

export type ViewState = ViewStateBase & {
  /**
   * Key value pairs of any type. The keys used in the UX code.
   */
  [key: string]: any;
}

export const baseViewConfigKeys = ['ux', 'items', 'listeners'];
