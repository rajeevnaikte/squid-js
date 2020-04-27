import { ComponentDef } from './types';
import { kebabCase } from 'lodash';
import * as $ from 'jquery';

export class UI {
  static render (app: ComponentDef, elementId?: string): void {
    const root = elementId ? $(`#${elementId}`) ?? $('body') : $('body');

    root.hide();

    const appRoot = kebabCase(app.ux);
    root.append(`<${appRoot}></${appRoot}>`);

    root.show();
  }
}
