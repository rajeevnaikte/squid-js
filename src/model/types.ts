/**
 * JS code to build the ux.
 * Lines of JS code.
 */
import { JsonObjectType } from 'squid-utils';

export type UXJSCode = {
  [key: string]: string | (() => HTMLElement[]) | (() => void);
  name: string;
  style: () => HTMLElement[];
  html: () => HTMLElement[];
  script: () => void;
};

export interface CustomElement extends HTMLElement {
  data: JsonObjectType;
  onDataUpdate: { [dataJsonPath: string]: (() => void)[] };
  getData: (name: string) => string;
  connectedCallback: () => void;
}
