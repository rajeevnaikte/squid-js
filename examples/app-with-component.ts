import { UI, UX } from '../src';
import { Component } from '../src/model/Component';
import { ViewState } from '../src/model/ViewState';

UX.define('panel.grid', class implements Component {
  buildViewState (viewState: ViewState): ViewState {
    return {
      ux: 'panel.grid.header-row',
      items: viewState.headers.map((header: any) => {
        return {
          ux: 'panel.grid.header',
          label: header.label
        };
      })
    };
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

UI.render(app);
