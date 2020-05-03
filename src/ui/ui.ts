import { ComponentDef } from './types';
import { ElementMissing } from './errors';
import { getCustomElementName } from '../common/utils';

// @ts-ignore
window.ux = {};
// @ts-ignore
window.ui = {
  render (app: ComponentDef, elementId?: string): void {
    const root = elementId ? document.getElementById(elementId) : document.body;
    if (!root) {
      throw new ElementMissing(elementId ?? '');
    }

    root.hidden = true;

    const appRoot = getCustomElementName(app.ux);
    root.append(`<${appRoot}></${appRoot}>`);

    root.hidden = false;
  },

  loadUX (ux: string) {
    try {

    } catch (e) {
      if (e.message.includes('not a valid custom element name')) {
        throw `UX ${ux} doesn't exists.`;
      }
      else if (e.message.includes('has already been used')) {
        throw 'UX component [namespace]-[name] already exists.';
      }
      throw e;
    }
  }
};
