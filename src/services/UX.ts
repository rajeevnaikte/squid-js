import { UXJSCode } from './types';
import { UXExists, UXNameNotValid } from './errors';

/**
 * Class with static method to load/pre-process uxjs code.
 * Internally used by uxui cli tool.
 */
export class UX {
  /**
   * Add uxjs code object.
   * @param uxjsList
   */
  static add (...uxjsList: UXJSCode[]): void {
    uxjsList.forEach(UX.load);
  }

  /**
   * Load the customElement.
   * @param uxjs
   */
  private static load (uxjs: UXJSCode) {
    try {
      customElements.define(uxjs.name, class extends HTMLElement {
        onDataUpdate: { [key: string]: () => void } = {};

        getData (name: string): string {
          return super.getAttribute(name) ?? '';
        }

        connectedCallback () {
          const styleEls = uxjs.style.bind(this)() ?? [];
          const htmlEls = uxjs.html.bind(this)();
          this.append(...styleEls, ...htmlEls);
          uxjs.script.bind(this)();
        }
      });
    } catch (e) {
      if (e.message?.includes('not a valid custom element name')) {
        throw new UXNameNotValid(uxjs.name);
      }
      else if (e.message?.includes('has already been used')) {
        throw new UXExists(uxjs.name);
      }
      throw e;
    }
  }
}
