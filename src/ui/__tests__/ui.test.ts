import { UX } from '../ui';
import { readFile } from 'ts-loader/dist/utils';
import { html as prettyHtml } from 'js-beautify';

describe('UX UI', () => {
  describe('UX', () => {
    test('add uxjs', async () => {
      // @ts-ignore
      const html = await global.webDriver
        .executeScript(`
        const i18n = { translate: () => '' };
        ${readFile('./dist/uxui.js')}
        var module = {};
        ${readFile(`${__dirname}/data/valid.uxjs`)}
        UX.add(module.exports);
        var el = document.createElement('form-field-valid');
        el.setAttribute('id', 'ux-1');
        document.body.append(el);
        return document.body.innerHTML;
      `);

      expect(prettyHtml(html as string))
        .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
    });
  });
});
