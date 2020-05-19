/**
 * Configuration of the view to be rendered.
 */
export type ViewStateBase = {
  ux: string;
  items?: ViewState[];
  listeners?: { [key: string]: (...params: any) => any };
}

export type ViewState = ViewStateBase & {
  [key: string]: any;
}

export const baseViewConfigKeys = ['ux', 'items', 'listeners'];
