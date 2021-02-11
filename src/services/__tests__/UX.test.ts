import { UI } from '../UI';
import { html as prettyHtml } from 'js-beautify';
import { UX } from '../UX';
import { Component, ViewState } from '../..';
import { ReservedComponentKey } from '../../exceptions/errors';
import { readFileSync } from 'fs';

describe('UX', () =>
{
	test('add uxjs', async () =>
	{
		UI.render({ ux: 'form-field-valid' });
		expect(prettyHtml(document.documentElement.outerHTML))
			.toEqual(prettyHtml(readFileSync(`${__dirname}/expected/valid.ux`, 'utf-8') ?? ''));
	});

	test('define', () =>
	{
		expect(() =>
			UX.define('TestComponent', class extends Component
			{
				buildViewState (viewState: ViewState): ViewState[]
				{
					return [];
				}

				addItem ()
				{
				}
			})
		).toThrow(new ReservedComponentKey('TestComponent', ['addItem']));
	});
});
