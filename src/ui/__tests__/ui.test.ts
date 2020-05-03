import { Compiler } from '../..';
import { app } from '../../examples/app';
import { UI } from '../ui';

describe('build layout', () => {
  const compiler = new Compiler();
  compiler.compileUX(`${__dirname}/../../examples/ux/`);

  test('layout', () => {
    UI.render(app);
    console.log(document.body.innerHTML);
  });
});