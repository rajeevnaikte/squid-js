import { CustomElement, UXJSCode } from '../model/types';
import { UXExists, UXNameNotValid } from '../exceptions/errors';
import { addDefinedComponent, verifyCanDefine } from '../data/storage';
import { kebabCase } from 'lodash';
import { ComponentType } from '../model/ComponentType';
import { noOpNoReturn, noOpReturnString } from 'squid-utils';

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
        rendered = false;
        onDataUpdate = {};
        getData = noOpReturnString;
        postRender = noOpNoReturn;

        connectedCallback () {
          if (!this.rendered) {
            const styleEls = uxjs.style.bind(this)() ?? [];
            const htmlEls = uxjs.html.bind(this)();
            this.append(...styleEls, ...htmlEls);
            uxjs.script.bind(this)();

            this.rendered = true;
            if (this.postRender) this.postRender();
          }
        }
      });

      addDefinedComponent(uxjs.name, ComponentType.HTML);
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
