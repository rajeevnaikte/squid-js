import { ViewState } from '../model/ViewState';
import { getUniqueElId } from '../common/utils';
import { kebabCase } from 'lodash';

export class ViewModelBuilder {
  private readonly viewConfig: ViewState;

  constructor (viewConfig: ViewState) {
    this.viewConfig = viewConfig;
  }



  private buildDomEl (): Element {
    const id = getUniqueElId();
    const compName = kebabCase(this.viewConfig.ux);
    const compEl = document.createElement(compName);

    return compEl;
  }

  build () {
  }
}