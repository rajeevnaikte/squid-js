import { Compiler } from '../Compiler';
import { MultipleStyles, MultipleTemplate, NamespaceMissing } from '../errors';
import { loadConfigs } from '../../configurations/configuration';
import { pathExists, readFile } from 'squid-utils';

describe('Compiler', () => {
  describe('parse', () => {
    test('invalid code', () => {
      const compiler = new Compiler();
      const uxFile = `${__dirname}/data/invalid.ux`;

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        compiler.parse(uxFile, uxFile);
      }).toThrow([
        new NamespaceMissing(uxFile),
        new MultipleStyles(uxFile),
        new MultipleTemplate(uxFile)
      ].join());
    });

    test('valid code', () => {
      const compiler = new Compiler();
      const uxFile = `${__dirname}/data/valid.ux`;

      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        compiler.parse(uxFile, uxFile)
      ).toEqual({
        namespace: 'form.field',
        name: 'valid',
        style: `.form-group {
    margin: 10px;
  }`,
        html: `<div class="form-group">
    <label for="[exampleInputEmail1]">[i18n:Email address]</label>
    test
    <input type="email" class="form-control" id="[exampleInputEmail1]" aria-describedby="emailHelp" placeholder="[i18n:Enter email]">
    test2<br>
    <small id="emailHelp" class="form-text text-muted">[i18n:We'll never share your email with anyone else.]</small>
  </div>`,
        script: `this.onresize = () => {
    console.log('hello');
  };`,
        variables: [
          'exampleInputEmail1'
        ],
        i18ns: [
          'i18n:Email address',
          'i18n:Enter email',
          'i18n:We\'ll never share your email with anyone else.'
        ]
      });
    });

    test('no style', () => {
      const compiler = new Compiler();
      const uxFile = `${__dirname}/data/no-style.ux`;

      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        compiler.parse(uxFile, uxFile)
      ).toEqual({
        namespace: 'form.field',
        name: 'no-style',
        html: '<div class="form-group">\n' +
          '    <label for="[exampleInputEmail1]">[i18n:Email address]</label>\n' +
          '    <input type="email" class="form-control" id="[exampleInputEmail1]" aria-describedby="emailHelp" placeholder="[i18n:Enter email]">\n' +
          '    <small id="emailHelp" class="form-text text-muted">[i18n:We\'ll never share your email with anyone else.]</small>\n' +
          '  </div>',
        script: undefined,
        style: undefined,
        variables: [
          'exampleInputEmail1'
        ],
        i18ns: [
          'i18n:Email address',
          'i18n:Enter email',
          'i18n:We\'ll never share your email with anyone else.'
        ]
      });
    });
  });

  describe('compile', () => {
    loadConfigs({
      ROOT_DIR: __dirname
    });

    test('valid code', () => {
      const compiler = new Compiler();
      const uxFile = `${__dirname}/data/valid.ux`;

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      compiler.compile(uxFile);

      const outPath = `${__dirname}/.build/ux/form-field-valid.uxjs`;
      expect(pathExists(outPath)).toEqual(true);

      const actual = readFile(outPath);
      expect(actual).toEqual(readFile(`${__dirname}/expected/form-field-valid.js`));
    });
  });
});