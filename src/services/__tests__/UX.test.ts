import { html as prettyHtml } from 'js-beautify';
import { readFile } from 'ts-loader/dist/utils';
import { getComponentDef } from '../../data/storage';
import { CustomElement, UXJSCode } from '../../model/types';
import { Config } from '../../configurations/configuration';

describe('UX', () => {
  test('add uxjs', async () => {
    const uxjsCode = getComponentDef('form-field-valid') as UXJSCode;
    const elBindings = {
      onDataUpdate: {},
      getData: (stateKey: string) => {
        if (stateKey === 'id') return 'ux-0';
        return '';
      }
    };
    const el = uxjsCode.html.bind(elBindings)()[0] as CustomElement;
    el.setAttribute(Config.UX_NAME_ATTRIB, 'form-field-valid');
    Object.assign(el, elBindings);

    const styles = uxjsCode.style.bind(el)();
    if (styles) styles.forEach(style => {
      style.textContent = style.textContent?.replace(/(?=^|\s)items(?=\s|\.)/g, 'div') ?? null;
      el.insertBefore(style, el.childNodes[0]);
    });

    uxjsCode.script.bind(el)();

    document.body.appendChild(el);

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
  });
});