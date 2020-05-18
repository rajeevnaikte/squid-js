export type ComponentDef = {
  [key: string]: string | ComponentDef[] | undefined;
  ux: string;
  items?: ComponentDef[];
}

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
