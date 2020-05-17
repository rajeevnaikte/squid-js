import { UX } from '../ui';
import { readFile } from 'ts-loader/dist/utils';
import { html as prettyHtml } from 'js-beautify';
import { getWebDriver } from '../../__tests__/setup-tests/setup';
import { By } from 'selenium-webdriver';

describe('UX UI', () => {
  describe('UX', () => {
    test('add uxjs', async () => {
      const html = await (await getWebDriver())
        .executeScript(`
          const i18n = { translate: () => '' };
          ${readFile('./dist/ui.bundle.js')}
          var module = {};
          ${readFile(`${__dirname}/data/valid.uxjs`)}
          UX.add(module.exports);
          var el = document.createElement('form-field-valid');
          el.setAttribute('id', 'ux-0');
          document.body.append(el);
          return document.body.innerHTML;
        `);

      expect(prettyHtml(html as string))
        .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
    });
  });

  describe('UI', () => {
    test('add app component', async () => {
      const html = await (await getWebDriver())
        .executeScript(`
        const i18n = { translate: () => '' };
        ${readFile('./dist/ui.bundle.js')}
        var module = {};
        ${readFile(`${__dirname}/data/valid.uxjs`)}
        UX.add(module.exports);
        UI.render({
          ux: 'form-field-valid'
        });
        return document.body.innerHTML;
      `);

      expect(prettyHtml(html as string))
        .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
    });

    test('component items not allowed', async () => {
      const html = await (await getWebDriver())
        .executeScript(`
        const i18n = { translate: () => '' };
        ${readFile('./dist/ui.bundle.js')}
        var module = {};
        ${readFile(`${__dirname}/data/valid.uxjs`)}
        UX.add(module.exports);
        UI.render({
          ux: 'form-field-valid',
          items: [{
            ux: 'form-field-valid'
          }]
        });
        return document.body.innerHTML;
      `);

      expect(prettyHtml(html as string))
        .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
    });

    test('add component items', async () => {
      const webDriver = await getWebDriver();
      const html = await webDriver
        .executeScript(`
        const i18n = { translate: () => '' };
        ${readFile('./dist/ui.bundle.js')}
        var module = {};
        ${readFile(`${__dirname}/data/valid.uxjs`)}
        UX.add(module.exports);
        ${readFile(`${__dirname}/data/panel-my-panel.uxjs`)}
        UX.add(module.exports);
        UI.render({
          ux: 'panel-my-panel',
          items: [{
            ux: 'form-field-valid'
          }]
        });
        return document.body.innerHTML;
      `);

      expect(prettyHtml(html as string))
        .toEqual(prettyHtml(readFile(`${__dirname}/expected/with-items.ux`) ?? ''));

      expect(await webDriver.findElement(By.css('form-field-valid')).getAttribute('id'))
        .toEqual('ux-1');
    });
  });
});
