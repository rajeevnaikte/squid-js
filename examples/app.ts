import { UI } from '../src';
import { ViewState } from '../src/model/ViewState';

const app: ViewState = {
  ux: 'form.form',
  name: '',
  items: [
    {
      ux: 'form.text-input',
      label: 'Input 1',
      name: 'input-1',
      value: 1
    },
    {
      ux: 'form.text-input',
      label: 'Input 2',
      name: 'input-2',
      value: 2
    },
    {
      ux: 'form.submit-button',
      listeners: {
        click: (vm, event) => {
          console.log(vm);
          console.log(event);
        }
      }
    }
  ]
}

// @ts-ignore
window.genesisViewModel = UI.render(app);
