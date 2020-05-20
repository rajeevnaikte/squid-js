import { GenesisViewModel, ViewModel } from '../ViewModel';
import { html as prettyHtml } from 'js-beautify';
import { readFile } from 'ts-loader/dist/utils';

describe('ViewModel', () => {
  test('GenesisViewModel', async () => {
    const viewModel = new GenesisViewModel(document.body);
    viewModel.add({
      ux: 'form-field-valid'
    });

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));

    // @ts-ignore
    const uxViewModel = viewModel.items[0];
    expect(uxViewModel).toBeDefined();
    // @ts-ignore
    expect(uxViewModel.id).toEqual('ux-0');
    // @ts-ignore
    expect(uxViewModel.state).toEqual({});
  });

  test('with state data', () => {
    const viewModel = new GenesisViewModel(document.body);
    viewModel.add({
      ux: 'form-field-valid',
      exampleInputEmail1: 'my-email',
      exampleInputEmail2: 1234
    });

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/with-state.ux`) ?? ''));
  });
});
