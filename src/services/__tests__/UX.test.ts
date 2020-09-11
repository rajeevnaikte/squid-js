import { UI } from '../UI';
import { html as prettyHtml } from 'js-beautify';
import { readFile } from 'ts-loader/dist/utils';
import { UX } from '../UX';
import { Component, ViewState } from '../..';
import { ReservedComponentKey } from '../../exceptions/errors';

describe('UX', () => {
  test('add uxjs', async () => {
    UI.render({ ux: 'form-field-valid' });
    expect(prettyHtml(document.documentElement.outerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));
  });

  test('define', () => {
    expect(() =>
      UX.define('TestComponent', class extends Component {
        buildViewState (viewState: ViewState): ViewState[] {
          return [];
        }
        addItem () {}
      })
    ).toThrow(new ReservedComponentKey('TestComponent', ['addItem']))
  });
});