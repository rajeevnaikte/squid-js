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
   * @param app - JSON style view layout which defines the UI. It will be added inside html body tag.
   * @param elementId - Optionally provide a root element id to load the app into (instead of body tag).
   */
  static render (app: ViewState, elementId?: string): GenesisViewModel {
    const root = elementId ? document.getElementById(elementId) : document.body;
    if (!root) {
      throw new ElementMissing(elementId ?? '');
    }
    // Clear element before loading app.
    root.innerHTML = '';

    const genesisViewModel = new GenesisViewModel(root);
    genesisViewModel.add(app);
    return genesisViewModel;
  }

  static define (compName: string, compDef: UXComponent): void {
    compName = kebabCase(compName);
    verifyCanDefine(compName);
    addDefinedComponent(compName, ComponentType.COMPOSITE, compDef);
  }
}
