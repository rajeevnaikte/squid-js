/**
 * Sections in .ux file.
 */
export type UXCode = {
  [key: string]: string | string[] | undefined;
  /**
   * Namespace to uniquely identify the ux component.
   * namespace + component name (file name) is used as the unique identifier.
   */
  namespace: string;
  /**
   * UX component name.
   */
  name: string;
  /**
   * CSS for the component (it will be scoped with shadow dom).
   */
  style?: string;
  /**
   * Layout of the component.
   */
  html: string;
  /**
   * Variables in the html code.
   */
  variables: string[];
  /**
   * Translations requirements.
   */
  i18ns: string[];
  /**
   * JavaScript code to perform UX related changes, such as, resize etc.
   */
  script?: string;
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