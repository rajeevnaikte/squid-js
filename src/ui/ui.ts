import { ComponentDef, UXJSCode } from './types';
import { ElementMissing, UXExists, UXNameNotValid } from './errors';
import { kebabCase } from 'lodash';

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
        getAttribute (name: string): string {
          return super.getAttribute(name) ?? '';
        }

        connectedCallback () {
          console.log('custom element connectedCallback');
          const styleEls = uxjs.style.bind(this)() ?? [];
          const htmlEls = uxjs.html.bind(this)();
          this.append(...styleEls, ...htmlEls);
          uxjs.script.bind(this)();
        }

        attributeChangedCallback () {

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

/**
 * Class with static methods to process the JSON style UI code and generate html and render.
 */
export class UI {
  private static elCount = 0;
  private static componentsToRender: {
    component: ComponentDef;
    parentEl: Element;
  }[] = [];

  /**
   * Call this function with root of your app.
   * @param app - JSON style object which defines the UI. It will be added inside html body tag.
   * @param elementId - Optionally provide a root element id to load the app into.
   */
  static render (app: ComponentDef, elementId?: string): void {
    const root = elementId ? document.getElementById(elementId) : document.body;
    if (!root) {
      throw new ElementMissing(elementId ?? '');
    }

    UI.componentsToRender.push({
      component: app,
      parentEl: root
    });

    // to avoid recursion (which can cause stackoverflow)
    while (UI.componentsToRender.length > 0) {
      const componentToRender = UI.componentsToRender.shift();
      if (componentToRender) {
        UI.renderComponent(componentToRender.component, componentToRender.parentEl);
      }
    }
  }

  /**
   * Render single component with options in JSON form.
   * @param comp
   * @param parentEl
   */
  private static renderComponent (comp: ComponentDef, parentEl: Element) {
    const id = `ux-${UI.elCount++}`;
    const compName = kebabCase(comp.ux);
    const compEl = document.createElement(compName);

    Object.keys(comp)
      .filter(key => !['ux', 'items'].includes(key))
      .filter(key => comp[key] !== undefined)
      .forEach(key => {
        compEl.setAttribute(key, comp[key] as string);
      });
    compEl.setAttribute('id', id);

    parentEl.append(compEl);

    const itemsEl = compEl.getElementsByTagName('items')[0];

    if (comp.items && comp.items.length > 0 && itemsEl) {
      UI.componentsToRender.push(...comp.items
        .map(item => {
          return {
            component: item,
            parentEl: itemsEl
          };
        }));
    }
    else if (!itemsEl) {
      console.error(`Adding items not allowed for the component ${compName}.`);
    }
  }
}
