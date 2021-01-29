import { Component, UI, UX, ViewState } from '../src';

UX.define('panel.grid', class extends Component 
{
	buildViewState (viewState: ViewState): ViewState[] 
	{
		return [{
			ux:    'panel.grid.container',
			items: [{
				ux:    'panel.grid.header-row',
				items: viewState.headers.map((header: any) => 
				{
					return {
						ux:    'panel.grid.header',
						label: header.label
					};
				})
			}, ...viewState.data.map((row: any) => 
			{
				return {
					ux:    'panel.grid.row',
					items: [{
						ux:    'panel.grid.cell',
						value: row.name
					}, {
						ux:    'panel.grid.cell',
						value: row.profession
					}]
				};
			})]
		}];
	}

	addHeader (id: string, label: string) 
	{
		this.vm.items[0].items[0].addItem({
			ux:    'panel.grid.header',
			label: label
		});
	}

	addRow (name: string, profession: string) 
	{
		this.vm.items[0].addItem({
			ux:    'panel.grid.row',
			items: [{
				ux:    'panel.grid.cell',
				value: name
			}, {
				ux:    'panel.grid.cell',
				value: profession
			}]
		});
	}
});

const app: ViewState = {
	ux:      'panel.grid',
	headers: [{
		id:    'name',
		label: 'Name'
	}, {
		id:    'profession',
		label: 'Profession'
	}],
	data: [{
		name:       'Chaglar',
		profession: 'Cafe owner'
	}, {
		name:       'Jessie',
		profession: 'Cook'
	}]
};

const appView = UI.render(app);
const grid = appView.items[0].comp;
grid.addHeader('education', 'Education');
grid.addRow('Rajeev', 'SW');
