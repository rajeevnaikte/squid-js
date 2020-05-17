import { ComponentDef, UI } from '../src';

const app: ComponentDef = {
  ux: 'panel.my-panel',
  name: '',
  items: [
    {
      ux: 'form.field.textinput'
    }
  ]
}

UI.render(app);
