import { CustomElement } from '../../model/types';
import { html as prettyHtml } from 'js-beautify';
import { readFile } from 'ts-loader/dist/utils';

describe('UX', () => {
  test('add uxjs', async () => {
    const el = document.createElement('form-field-valid') as CustomElement;
    el.setAttribute('class', 'ux-0');
    el.getData = (att) => (att === 'id') ? 'ux-0' : '';
    document.body.append(el);

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
  });
});