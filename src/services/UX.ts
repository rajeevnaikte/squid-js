import { CustomElement, UXJSCode } from '../model/types';
import { UXExists, UXNameNotValid } from '../exceptions/errors';
import { JsonObjectType } from 'squid-utils';
import { verifyCanDefine } from '../data/storage';
import { get as getValueAtJsonPath, kebabCase } from 'lodash';

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
      uxjs.name = kebabCase(uxjs.name);
      verifyCanDefine(uxjs.name);

      customElements.define(uxjs.name, class extends HTMLElement implements CustomElement {
        data: JsonObjectType = {};
        onDataUpdate: { [dataJsonPath: string]: (() => void)[] } = {};

        getData (name: string): string {
          return getValueAtJsonPath(this.data, name)?.toString() ?? '';
        }

        rendered = false;
        connectedCallback () {
          if (!this.rendered) {
            const styleEls = uxjs.style.bind(this)() ?? [];
            const htmlEls = uxjs.html.bind(this)();
            this.append(...styleEls, ...htmlEls);
            uxjs.script.bind(this)();
            this.rendered = true;
          }
        }
      });

      // addDefinedComponent(uxjs.name);
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
