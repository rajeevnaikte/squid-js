import { Component, UI, UX, ViewState } from '../src';

UX.define('panel.grid', class extends Component
{
	buildViewState (viewState: ViewState)
	{
		return [{
			ux:    'panel.grid.container',
			items: [{
				ux:    'panel.grid.header-row',
				items: viewState.state?.headers?.map((header: any) =>
				{
					return {
						ux:    'panel.grid.header',
						state: {
							label: header.label
						}
					};
				})
			}, ...viewState.state?.data?.map((row: any) =>
			{
				return {
					ux:    'panel.grid.row',
					items: [{
						ux:    'panel.grid.cell',
						state: {
							value: row.name
						}
					}, {
						ux:    'panel.grid.cell',
						state: {
							value: row.profession
						}
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
				state: {
					value: name
				}
			}, {
				ux:    'panel.grid.cell',
				state: {
					value: profession
				}
			}]
		});
	}
});

const app: ViewState = {
	ux:    'panel.grid',
	state: {
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
	}
};

const appView = UI.render(app);
const grid = appView;
grid.addHeader('education', 'Education');
grid.addRow('Rajeev', 'SW');
