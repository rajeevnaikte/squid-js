import { ComponentDef } from './types';
import { ElementMissing } from './errors';
import { kebabCase } from 'lodash';
import { JsonObjectType } from 'squid-utils';

let elCount = 0;
/**
 * Component data with the unique id as key.
 */
const compData: { [key: string]: JsonObjectType } = {};

/**
 * Class with static methods to process the JSON style UI code and generate html and render.
 */
export class UI {
  private static readonly componentsToRender: {
    component: ComponentDef;
    parentEl: Element;
  }[] = [];

  /**
   * Call this function with root view JSON of your app.
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

    // to avoid recursion (which can cause stack overflow)
    while (UI.componentsToRender.length > 0) {
      const componentToRender = UI.componentsToRender.shift();
      if (componentToRender) {
        UI.renderView(componentToRender.component, componentToRender.parentEl);
      }
    }
  }

  /**
   * Render single component with options in JSON form.
   * @param comp
   * @param parentEl
   */
  private static renderView (comp: ComponentDef, parentEl: Element) {
    const id = `ux-${elCount++}`;
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
      UI.componentsToRender
        .push(...comp.items
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
