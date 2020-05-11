import { ComponentDef, UXJSCode } from './types';
import { ElementMissing, UXExists, UXNameNotValid } from './errors';
import { kebabCase } from 'lodash';

export class UX {
  static add (uxjsCode: UXJSCode): void {
    UX.load(uxjsCode);
  }

  private static load (uxjs: UXJSCode) {
    try {
      customElements.define(uxjs.name, class extends HTMLElement {
        getAttribute (name: string): string {
          return super.getAttribute(name) ?? '';
        }

        connectedCallback () {
          console.log('custom element connectedCallback');
          const styleEls = uxjs.style.bind(this)();
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

export class UI {
  static render (app: ComponentDef, elementId?: string): void {
    const root = elementId ? document.getElementById(elementId) : document.body;
    if (!root) {
      throw new ElementMissing(elementId ?? '');
    }

    root.hidden = true;

    const appRoot = kebabCase(app.ux);
    root.append(`<${appRoot}></${appRoot}>`);

    root.hidden = false;
  }
}
