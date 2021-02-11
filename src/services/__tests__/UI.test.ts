import { readFileSync } from 'fs';
import { html as prettyHtml } from 'js-beautify';
import { UI } from '../../';
import { ElementMissing, ItemsNotAllowed } from '../../exceptions/errors';
import { Config } from '../../configurations/configuration';

describe('UI', () =>
{
	test('add app component', async () =>
	{
		UI.render({
			ux: 'form-field-valid'
		});

		expect(prettyHtml(document.documentElement.outerHTML))
			.toEqual(prettyHtml(readFileSync(`${__dirname}/expected/valid.ux`, 'utf-8') ?? ''));
	});

	test('component items not allowed', async () =>
	{
		await expect(new Promise((resolve, reject) =>
		{
			window.onerror = ((event, source, lineno, colno, error) =>
			{
				reject(error);
			});

			UI.render({
				ux:    'form-field-valid',
				items: [{
					ux: 'form-field-valid'
				}]
			});
		})).rejects.toThrow(new ItemsNotAllowed('form-field-valid', Config.MAIN_ITEMS_REF));
	});

	test('add component items', async () =>
	{
		UI.render({
			ux:    'panel-my-panel',
			items: [{
				ux: 'form-field-valid'
			}]
		});

		expect(prettyHtml(document.documentElement.outerHTML))
			.toEqual(prettyHtml(readFileSync(`${__dirname}/expected/with-items.ux`, 'utf-8') ?? ''));
	});

	test('invalid element id passed', async () =>
	{
		expect(() => UI.render({ ux: '' }, 'root'))
			.toThrow(new ElementMissing('root'));
	});
});
