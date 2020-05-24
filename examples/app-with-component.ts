import { UI, UX } from '../src';
import { Component } from '../src/model/Component';
import { ViewState } from '../src/model/ViewState';

UX.define('panel.grid', class extends Component {
  buildViewState (viewState: ViewState): ViewState[] {
    return [{
      ux: 'panel.grid.header-row',
      items: viewState.headers.map((header: any) => {
        return {
          ux: 'panel.grid.header',
          label: header.label
        };
      })
    }];
  }

  addHeader (id: string, label: string) {
    this.vm.items[0].addItem({
      ux: 'panel.grid.header',
      label: label
    })
  }
});

const app: ViewState = {
  ux: 'panel.grid',
  headers: [{
    id: 'name',
    label: 'Name'
  }, {
    id: 'profession',
    label: 'Profession'
  }],
  data: [{
    name: 'Chaglar',
    profession: 'Cafe owner'
  }, {
    name: 'Jessie',
    profession: 'Cook'
  }]
};

const appView = UI.render(app);
appView.items[0].comp.addHeader('education', 'Education');
