export type ComponentDef = {
  [key: string]: string | ComponentDef[] | undefined;
  ux: string;
  items?: ComponentDef[];
}

/**
 * JS code to build the ux.
 * List of lines of JS code.
 */
export type UXJSCode = {
  [key: string]: string | string[];
  name: string;
  style: string[];
  html: string[];
  script: string[];
};
