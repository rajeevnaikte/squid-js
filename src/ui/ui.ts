import { ComponentDef, UXJSCode } from './types';
import { ElementMissing } from './errors';
import { kebabCase } from 'lodash';

export class UX {
  static uxjs: Map<string, UXJSCode> = new Map();

  static add (uxjsCode: UXJSCode): void {
    this.uxjs.set(uxjsCode.name, uxjsCode);
  }

  static get (uxName: string): UXJSCode | undefined {
    return this.uxjs.get(uxName);
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

  static loadUX (ux: string) {
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
}
