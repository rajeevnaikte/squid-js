import { UX } from '../ui';
import { readFile } from 'ts-loader/dist/utils';
import { webDriver } from './BrowserFacade';
import { html as prettyHtml } from 'js-beautify';

describe('UX UI', () => {
  describe('UX', () => {
    test('add and get', async () => {
      const html = await webDriver.executeScript(`
        const i18n = { translate: () => '' };
        window.onerror = (message, file, line, column, errorObj) => {
          document.body.setAttribute('js-error', errorObj ? errorObj.stack : 'Error');
        }
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

      const errors = await webDriver.manage().logs().get('browser');
      expect(errors).toEqual([]);
    });
  });
});
