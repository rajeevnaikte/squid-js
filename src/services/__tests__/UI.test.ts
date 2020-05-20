import { readFile } from 'ts-loader/dist/utils';
import { html as prettyHtml } from 'js-beautify';
import { UI } from '../../index';
import { ElementMissing, ItemsNotAllowed } from '../../exceptions/errors';

describe('UI', () => {
  test('add app component', async () => {
    UI.render({
      ux: 'form-field-valid'
    });

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
  });

  test('component items not allowed', async () => {
    expect(() => UI.render({
      ux: 'form-field-valid',
      items: [{
        ux: 'form-field-valid'
      }]
    })).toThrow(new ItemsNotAllowed('FORM-FIELD-VALID'));
  });

  test('add component items', async () => {
    UI.render({
      ux: 'panel-my-panel',
      items: [{
        ux: 'form-field-valid'
      }]
    });

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/with-items.ux`) ?? ''));
  });

  test('invalid element id passed', async () => {
    expect(() => UI.render({ ux: '' }, 'root'))
      .toThrow(new ElementMissing('root'));
  });
});
