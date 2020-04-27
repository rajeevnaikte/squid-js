import { UXCompiler } from '../UXCompiler';
import { MultipleHtmlBody, MultipleStyles, NamespaceMissing } from '../errors';
import { loadConfigurations } from '../../configurations/configuration';
import { pathExists, readFile } from 'squid-utils';

describe('Compiler', () => {
  describe('parse', () => {
    test('invalid code', () => {
      const compiler = new UXCompiler();
      const uxFile = `${__dirname}/data/invalid.ux`;

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        compiler.parse(uxFile, uxFile);
      }).toThrow([
        new NamespaceMissing(uxFile),
        new MultipleStyles(uxFile),
        new MultipleHtmlBody(uxFile)
      ].join());
    });

    test('valid code', () => {
      const compiler = new UXCompiler();
      const uxFile = `${__dirname}/data/valid.ux`;

      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        compiler.parse(uxFile, uxFile)
      ).toEqual({
        namespace: 'form.field',
        name: 'valid',
        style: '.form-group {\n' +
          '    margin: 10px;\n' +
          '  }',
        html: '<div class="form-group">\n' +
          '  <label for="[exampleInputEmail1]">[i18n:Email address]</label>\n' +
          '  <input type="email" class="form-control" id="[exampleInputEmail1]" aria-describedby="emailHelp" placeholder="[i18n:Enter email]">\n' +
          '  <small id="emailHelp" class="form-text text-muted">[i18n:We&apos;ll never share your email with anyone else.]</small>\n' +
          '</div>'
      });
    });

    test('no style', () => {
      const compiler = new UXCompiler();
      const uxFile = `${__dirname}/data/no-style.ux`;

      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        compiler.parse(uxFile, uxFile)
      ).toEqual({
        namespace: 'form.field',
        name: 'no-style',
        html: '<div class="form-group">\n' +
          '  <label for="[exampleInputEmail1]">[i18n:Email address]</label>\n' +
          '  <input type="email" class="form-control" id="[exampleInputEmail1]" aria-describedby="emailHelp" placeholder="[i18n:Enter email]">\n' +
          '  <small id="emailHelp" class="form-text text-muted">[i18n:We&apos;ll never share your email with anyone else.]</small>\n' +
          '</div>'
      });
    });
  });

  describe('compile', () => {
    process.env.ROOT_DIR = __dirname;
    loadConfigurations();

    test('valid code', () => {
      const compiler = new UXCompiler();
      const uxFile = `${__dirname}/data/valid.ux`;

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      compiler.compile(uxFile);

      const outPath = `${__dirname}/.build/ux/form-field-valid.js`;
      expect(pathExists(outPath)).toEqual(true);

      const actual = readFile(outPath);
      expect(actual).toEqual(readFile(`${__dirname}/expected/form-field-valid.js`));
    });
  });
});