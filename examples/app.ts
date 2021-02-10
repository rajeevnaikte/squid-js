import { UI } from '../src';
import { ViewState } from '../src/model/ViewState';

const app: ViewState = {
	ux:    'form.form',
	state: {
		name: ''
	},
	items: [
		{
			ux:    'form.text-input',
			state: {
			  label: 'Input 1',
				name:  'input-1',
				value: 1
			},
		},
		{
			ux:    'form.text-input',
			state: {
			  label: 'Input 2',
				name:  'input-2',
				value: 2,
			},
			listeners: {
				keydown: (vm, event) =>
				{
					console.log(vm);
					console.log(event);
				}
			}
		},
		{
			ux:        'form.submit-button',
			listeners: {
				click: (vm, event) =>
				{
					console.log(vm);
					console.log(event);
				}
			}
		}
	]
}

// @ts-ignore
window.genesisViewModel = UI.render(app);
