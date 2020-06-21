import { UI } from '../UI';
import { html as prettyHtml } from 'js-beautify';
import { readFile } from 'ts-loader/dist/utils';

describe('UX', () => {
  test('add uxjs', async () => {
    UI.render({ ux: 'form-field-valid' });
    expect(prettyHtml(document.documentElement.outerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
  });
});