/**
 * JS code to build the ux.
 * Lines of JS code.
 */

export type UXJSCode = {
  [key: string]: string | (() => HTMLElement[]) | (() => void);
  name: string;
  style: () => HTMLElement[];
  html: () => HTMLElement[];
  script: () => void;
};

export interface CustomElement extends HTMLElement {
  onDataUpdate: { [dataJsonPath: string]: (() => void)[] };
  getData: (name: string) => string;
  connectedCallback: () => void;
  postRender: () => void;
  styles: HTMLElement[];
}

export type VoidFunction = (...params: any) => void;
export type VoidFunctionsMap = { [event: string]: VoidFunction };
