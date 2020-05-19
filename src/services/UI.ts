import { ViewState } from '../model/ViewState';
import { ElementMissing } from '../exceptions/errors';
import { kebabCase } from 'lodash';
import { UXComponent } from '../model/UXComponent';
import { addDefinedComponent, verifyCanDefine } from '../data/storage';
import { GenesisViewModel } from '../model/ViewModel';
import { ComponentType } from '../model/ComponentType';

/**
 * Class with static methods to process the JSON style UI code and generate html and render.
 */
export class UI {
  private static readonly componentsToRender: {
    component: ViewState;
    parentEl: Element;
  }[] = [];

  /**
   * Call this function with root view JSON of your app.
   * @param app - JSON style object which defines the UI. It will be added inside html body tag.
   * @param elementId - Optionally provide a root element id to load the app into.
   */
  static render (app: ViewState, elementId?: string): void {
    const root = elementId ? document.getElementById(elementId) : document.body;
    if (!root) {
      throw new ElementMissing(elementId ?? '');
    }

    // @ts-ignore
    window.GenesisViewModel = GenesisViewModel.getInstance(root);
    GenesisViewModel.getInstance(root).addItem(app);
  }

  /**
   * Render single component with options in JSON form.
   * @param comp
   * @param parentEl
   */
  private static renderView (comp: ViewState, parentEl: Element) {

  }

  private static buildView () {

  }

  static define (compName: string, compDef: UXComponent): void {
    compName = kebabCase(compName);
    verifyCanDefine(compName);
    addDefinedComponent(compName, ComponentType.COMPOSITE, compDef);
  }
}
